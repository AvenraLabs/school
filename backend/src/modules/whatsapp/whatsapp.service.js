import axios from "axios";
import WhatsappLog from "./whatsapp-log.model.js";
import Student from "../students/student.model.js";
import User from "../users/user.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import Teacher from "../teachers/teacher.model.js";
import School from "../schools/school.model.js";
import logger from "../../shared/logger.js";

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
 * Core dynamic Meta WhatsApp Cloud API template sender.
 * Uses type: "template" for business-initiated messages to comply with Meta 24-hr messaging window rules.
 * Captures Meta Message ID (wamid) and handles quota limits.
 */
export const sendTemplateMessage = async ({
  phone,
  templateName,
  components = [],
  languageCode = "en",
  schoolId = null,
  fallbackText = "",
}) => {
  if (!phone || typeof phone !== "string" || phone.trim() === "") {
    await WhatsappLog.create({
      status: "skipped",
      phone: String(phone || ""),
      message: fallbackText || `Template: ${templateName}`,
      error: "Phone number is empty",
      school_id: schoolId,
    });
    return { success: false, status: "skipped", error: "Phone number is empty" };
  }

  if (!isValidPhone(phone)) {
    await WhatsappLog.create({
      status: "skipped",
      phone,
      message: fallbackText || `Template: ${templateName}`,
      error: "Invalid phone number format",
      school_id: schoolId,
    });
    return { success: false, status: "skipped", error: "Invalid phone number format" };
  }

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
          message: fallbackText || `Template: ${templateName}`,
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
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";

  if (!token || !phoneNumberId) {
    const errorMsg = "WhatsApp credentials not configured in environment variables";
    console.error(`[WhatsApp] Error: ${errorMsg}`);
    await WhatsappLog.create({
      status: "failed",
      phone: cleanedPhone,
      message: fallbackText || `Template: ${templateName}`,
      error: errorMsg,
      school_id: schoolId,
    });
    return { success: false, status: "failed", error: errorMsg };
  }

  const startTime = Date.now();
  try {
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanedPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const wamid = response.data?.messages?.[0]?.id || null;
    const duration_ms = Date.now() - startTime;

    logger.integration({
      integration: "whatsapp",
      action: `send_template:${templateName}`,
      status: "success",
      duration_ms,
      meta: { phone: cleanedPhone, schoolId, wamid },
    });

    await WhatsappLog.create({
      wamid,
      status: "sent",
      phone: cleanedPhone,
      message: fallbackText || `Template: ${templateName}`,
      response: JSON.stringify(response.data),
      school_id: schoolId,
    });

    if (schoolId) {
      School.increment("whatsapp_sent_count", { where: { id: schoolId } }).catch((err) =>
        console.error(`[WhatsApp] Failed to increment sent count for school #${schoolId}:`, err.message)
      );
    }

    return { success: true, status: "sent", wamid, data: response.data };
  } catch (error) {
    const errorData = error.response ? error.response.data : error.message;
    const errorString = typeof errorData === "object" ? JSON.stringify(errorData) : String(errorData);
    const duration_ms = Date.now() - startTime;

    logger.integration({
      integration: "whatsapp",
      action: `send_template:${templateName}`,
      status: "failure",
      duration_ms,
      error: errorString,
      meta: { phone: cleanedPhone, schoolId },
    });

    await WhatsappLog.create({
      status: "failed",
      phone: cleanedPhone,
      message: fallbackText || `Template: ${templateName}`,
      error: errorString,
      school_id: schoolId,
    });

    return { success: false, status: "failed", error: errorString };
  }
};

/**
 * Freeform text message sender (for direct 24-hour customer reply window messaging).
 */
export const sendTextMessage = async (phone, message, schoolId = null) => {
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
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";

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
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
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

    const wamid = response.data?.messages?.[0]?.id || null;

    await WhatsappLog.create({
      wamid,
      status: "sent",
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

    return { success: true, status: "sent", wamid, data: response.data };
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
 * Send absent alert using template `absent_alert`.
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

    if (!studentId) return;

    const student = await Student.findOne({
      where: { id: studentId },
      include: [
        { model: User, attributes: ["name", "phone"] },
        { model: Class, attributes: ["class_name"] },
        { model: Section, attributes: ["name"] },
        { model: School, attributes: ["school_name"] },
      ],
    });

    if (!student) return;

    const phone = student.user?.phone || student.emergency_contact;
    if (!phone || !phone.trim()) return;

    const studentName = student.user?.name || "Student";
    const className = student.class?.class_name || "";
    const sectionName = student.section?.name || "";
    const classInfo = sectionName ? `${className} (${sectionName})` : className;
    const schoolName = student.school?.school_name || "School";

    const fallbackText = `Dear Parent, your child ${studentName} (${classInfo}) has been marked ABSENT today (${dateStr}). - ${schoolName}`;

    // Meta template parameters: {{1}}=studentName, {{2}}=classInfo, {{3}}=dateStr, {{4}}=schoolName
    const components = [
      {
        type: "body",
        parameters: [
          { type: "text", text: studentName },
          { type: "text", text: classInfo },
          { type: "text", text: dateStr },
          { type: "text", text: schoolName },
        ],
      },
    ];

    await sendTemplateMessage({
      phone,
      templateName: "absent_alert",
      components,
      schoolId: student.school_id,
      fallbackText,
    });
  } catch (error) {
    console.error("[WhatsApp] sendAbsentAlert Error:", error);
  }
};

/**
 * Send custom announcement using template `general_announcement`.
 */
export const sendAnnouncement = async (recipientList, title, message, schoolId = null) => {
  try {
    if (!Array.isArray(recipientList)) return;

    const phoneNumbers = recipientList.filter((phone) => phone && typeof phone === "string" && phone.trim() !== "");
    const uniquePhones = [...new Set(phoneNumbers)];

    let schoolName = "School Administration";
    if (schoolId) {
      const sch = await School.findByPk(schoolId, { attributes: ["school_name"] });
      if (sch?.school_name) schoolName = sch.school_name;
    }

    const fallbackText = `*${title}*\n\n${message}\n\n- ${schoolName}`;

    const components = [
      {
        type: "body",
        parameters: [
          { type: "text", text: title },
          { type: "text", text: message },
          { type: "text", text: schoolName },
        ],
      },
    ];

    await Promise.all(
      uniquePhones.map(async (phone) => {
        try {
          await sendTemplateMessage({
            phone,
            templateName: "general_announcement",
            components,
            schoolId,
            fallbackText,
          });
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
