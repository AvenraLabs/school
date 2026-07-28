import axios from "axios";
import WhatsappLog from "./whatsapp-log.model.js";
import Student from "../students/student.model.js";
import User from "../users/user.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import Vehicle from "../transport/vehicle.model.js";
import StudentTransport from "../transport/student-transport.model.js";
import Teacher from "../teachers/teacher.model.js";
import School from "../schools/school.model.js";

/**
 * Validates a phone number.
 * Must be a non-empty string that has at least 10 digits.
 */
const isValidPhone = (phone) => {
  if (!phone || typeof phone !== "string") return false;
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10;
};

/**
 * Sanitizes and cleans a phone number to only contain the last 10 digits prepended with 91.
 */
const formatPhoneForWhatsApp = (phone) => {
  const cleaned = phone.replace(/\D/g, "");
  return "91" + cleaned.slice(-10);
};

/**
 * 1. Reusable text message sending method using Meta WhatsApp Cloud API.
 * Never throws an exception; logs errors and saves success/failed/skipped/limit_exceeded states to DB.
 */
export const sendTextMessage = async (phone, message, schoolId = null) => {
  // Check empty/invalid
  if (!phone || typeof phone !== "string" || phone.trim() === "") {
    await WhatsappLog.create({
      status: "skipped",
      phone: String(phone || ""),
      message,
      error: "Phone number is empty",
      school_id: schoolId,
    });
    return { success: false, status: "skipped", error: "Phone number is empty" };
  }

  if (!isValidPhone(phone)) {
    await WhatsappLog.create({
      status: "skipped",
      phone,
      message,
      error: "Invalid phone number format",
      school_id: schoolId,
    });
    return { success: false, status: "skipped", error: "Invalid phone number format" };
  }

  // Quota enforcement per school
  if (schoolId) {
    const school = await School.findByPk(schoolId, {
      attributes: ["id", "whatsapp_annual_limit", "whatsapp_sent_count"],
    });
    if (school) {
      const limit = school.whatsapp_annual_limit ?? 10000;
      const sent = school.whatsapp_sent_count ?? 0;
      if (sent >= limit) {
        const errorMsg = `WhatsApp annual limit exceeded (${sent}/${limit})`;
        console.warn(`[WhatsApp] Quota exceeded for school #${schoolId}: ${errorMsg}`);
        await WhatsappLog.create({
          status: "limit_exceeded",
          phone,
          message,
          error: errorMsg,
          school_id: schoolId,
        });
        return { success: false, status: "limit_exceeded", error: errorMsg };
      }
    }
  }

  const cleanedPhone = formatPhoneForWhatsApp(phone);
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    const errorMsg = "WhatsApp credentials not configured in environment variables";
    console.error(`[WhatsApp] Error: ${errorMsg}`);
    await WhatsappLog.create({
      status: "failed",
      phone: cleanedPhone,
      message,
      error: errorMsg,
      school_id: schoolId,
    });
    return { success: false, status: "failed", error: errorMsg };
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanedPhone,
      type: "text",
      text: {
        preview_url: false,
        body: message,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    await WhatsappLog.create({
      status: "success",
      phone: cleanedPhone,
      message,
      response: JSON.stringify(response.data),
      school_id: schoolId,
    });

    if (schoolId) {
      School.increment("whatsapp_sent_count", { where: { id: schoolId } }).catch((err) =>
        console.error(`[WhatsApp] Failed to increment sent count for school #${schoolId}:`, err.message)
      );
    }

    return { success: true, status: "success", data: response.data };
  } catch (error) {
    const errorData = error.response ? error.response.data : error.message;
    const errorString = typeof errorData === "object" ? JSON.stringify(errorData) : String(errorData);

    console.error(`[WhatsApp] Failed to send message to ${cleanedPhone}:`, errorData);

    await WhatsappLog.create({
      status: "failed",
      phone: cleanedPhone,
      message,
      error: errorString,
      school_id: schoolId,
    });

    return { success: false, status: "failed", error: errorString };
  }
};

/**
 * 2. Send absent alert for a student.
 */
export const sendAbsentAlert = async (studentInput) => {
  try {
    let studentId = null;
    let dateStr = new Date().toLocaleDateString("en-IN");

    if (studentInput && typeof studentInput === "object") {
      studentId = studentInput.id || studentInput.student_id;
      if (studentInput.date) {
        dateStr = studentInput.date;
      }
    } else {
      studentId = studentInput;
    }

    if (!studentId) {
      console.error("[WhatsApp] sendAbsentAlert: Invalid student input", studentInput);
      return;
    }

    const student = await Student.findOne({
      where: { id: studentId },
      include: [
        { model: User, attributes: ["name", "phone"] },
        { model: Class, attributes: ["class_name"] },
        { model: Section, attributes: ["name"] },
      ],
    });

    if (!student) {
      console.error(`[WhatsApp] sendAbsentAlert: Student with ID ${studentId} not found`);
      return;
    }

    const phone = student.user?.phone || student.emergency_contact;
    if (!phone || phone.trim() === "") {
      await WhatsappLog.create({
        status: "skipped",
        phone: "",
        message: `Absent alert for student ${student.user?.name || "Student"}`,
        error: "Parent phone number is empty",
        school_id: student.school_id,
      });
      return;
    }

    const studentName = student.user?.name || "Student";
    const className = student.class?.class_name || "";
    const sectionName = student.section?.name || "";
    const classInfo = sectionName ? `${className} (${sectionName})` : className;

    const message = `Dear Parent,\n\nYour child ${studentName} (${classInfo}) has been marked ABSENT today (${dateStr}).\n\nSchool Administration`;

    await sendTextMessage(phone, message, student.school_id);
  } catch (error) {
    console.error("[WhatsApp] sendAbsentAlert Error:", error);
  }
};

/**
 * 3. Send bus trip started alert.
 */
export const sendBusTripStarted = async (busId) => {
  try {
    const vehicle = await Vehicle.findByPk(busId);
    if (!vehicle) {
      console.error(`[WhatsApp] sendBusTripStarted: Vehicle with ID ${busId} not found`);
      return;
    }

    const busNumber = vehicle.vehicle_number;

    const studentTransports = await StudentTransport.findAll({
      where: { vehicle_id: busId, is_active: true },
      include: [
        {
          model: Student,
          include: [
            {
              model: User,
              attributes: ["phone"],
            },
          ],
        },
      ],
    });

    const phoneNumbers = studentTransports
      .map((st) => st.student?.user?.phone || st.student?.emergency_contact)
      .filter((phone) => phone && phone.trim() !== "");

    const uniquePhones = [...new Set(phoneNumbers)];

    const message = `Bus ${busNumber} has started today's trip.\n\nSchool Administration`;

    await Promise.all(
      uniquePhones.map(async (phone) => {
        try {
          await sendTextMessage(phone, message, vehicle.school_id);
        } catch (err) {
          console.error(`[WhatsApp] Failed to send trip started message to ${phone}:`, err);
        }
      })
    );
  } catch (error) {
    console.error("[WhatsApp] sendBusTripStarted Error:", error);
  }
};

/**
 * 4. Send bus trip ended alert.
 */
export const sendBusTripEnded = async (busId) => {
  try {
    const vehicle = await Vehicle.findByPk(busId);
    if (!vehicle) {
      console.error(`[WhatsApp] sendBusTripEnded: Vehicle with ID ${busId} not found`);
      return;
    }

    const busNumber = vehicle.vehicle_number;

    const studentTransports = await StudentTransport.findAll({
      where: { vehicle_id: busId, is_active: true },
      include: [
        {
          model: Student,
          include: [
            {
              model: User,
              attributes: ["phone"],
            },
          ],
        },
      ],
    });

    const phoneNumbers = studentTransports
      .map((st) => st.student?.user?.phone || st.student?.emergency_contact)
      .filter((phone) => phone && phone.trim() !== "");

    const uniquePhones = [...new Set(phoneNumbers)];

    const message = `Bus ${busNumber} has completed today's trip.\n\nSchool Administration`;

    await Promise.all(
      uniquePhones.map(async (phone) => {
        try {
          await sendTextMessage(phone, message, vehicle.school_id);
        } catch (err) {
          console.error(`[WhatsApp] Failed to send trip ended message to ${phone}:`, err);
        }
      })
    );
  } catch (error) {
    console.error("[WhatsApp] sendBusTripEnded Error:", error);
  }
};

/**
 * 5. Send custom announcement.
 */
export const sendAnnouncement = async (recipientList, title, message, schoolId = null) => {
  try {
    if (!Array.isArray(recipientList)) {
      console.error("[WhatsApp] sendAnnouncement: recipientList is not an array");
      return;
    }

    const phoneNumbers = recipientList.filter((phone) => phone && typeof phone === "string" && phone.trim() !== "");
    const uniquePhones = [...new Set(phoneNumbers)];

    const formattedMessage = `*${title}*\n\n${message}`;

    await Promise.all(
      uniquePhones.map(async (phone) => {
        try {
          await sendTextMessage(phone, formattedMessage, schoolId);
        } catch (err) {
          console.error(`[WhatsApp] Failed to send announcement to ${phone}:`, err);
        }
      })
    );
  } catch (error) {
    console.error("[WhatsApp] sendAnnouncement Error:", error);
  }
};

/**
 * Resolves announcement recipient phone numbers based on audience filters.
 */
export const resolveAnnouncementRecipients = async ({ school_id, target_role, class_id, section_id }) => {
  const recipientPhones = [];

  // 1. Teachers
  if (target_role === "teacher" || target_role === "all") {
    const teachers = await Teacher.findAll({
      where: { school_id, is_active: true, approval_status: "approved" },
      include: [
        {
          model: User,
          required: true,
          attributes: ["phone"],
        },
      ],
    });
    for (const t of teachers) {
      if (t.user?.phone) {
        recipientPhones.push(t.user.phone);
      }
    }
  }

  // 2. Parents of students
  if (target_role === "student" || target_role === "all") {
    const studentWhere = {
      school_id,
      is_active: true,
      approval_status: "approved",
    };
    if (class_id) studentWhere.class_id = class_id;
    if (section_id) studentWhere.section_id = section_id;

    const students = await Student.findAll({
      where: studentWhere,
      include: [
        {
          model: User,
          attributes: ["phone"],
        },
      ],
    });
    for (const s of students) {
      const phone = s.user?.phone || s.emergency_contact;
      if (phone) {
        recipientPhones.push(phone);
      }
    }
  }

  return [...new Set(recipientPhones.filter(Boolean))];
};
