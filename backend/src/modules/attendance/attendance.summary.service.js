import { Op } from "sequelize";
import db from "../../config/db.js";
import Attendance from "./attendance.model.js";
import Student from "../students/student.model.js";
import User from "../users/user.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import TeacherAssignment from "../teacher-assignments/teacher-assignment.model.js";
import AppError from "../../shared/appError.js";
import { getPagination } from "../../shared/utils/pagination.js";
import { getCurrentAcademicYearId } from "../academic-years/academic-year.helper.js";
import { calculateSubjectAttendanceService } from "./attendance.analytics.service.js";

/* Helper to check if a user is authorized to mark or view attendance */
async function checkAttendancePermission({ user, school_id, class_id, section_id }) {
  if (user.role === "school_admin" || user.role === "super_admin") {
    return true;
  }

  if (user.role === "teacher") {
    const teacherId = user.teacher_id;
    if (!teacherId) return false;

    // Check if class teacher of the class
    const isClassTeacher = await Class.findOne({
      where: { id: class_id, school_id, class_teacher_id: teacherId },
    });
    if (isClassTeacher) return true;

    // Check if assigned teacher for class/section
    const isAssigned = await TeacherAssignment.findOne({
      where: { school_id, teacher_id: teacherId, class_id, section_id, is_active: true },
    });
    if (isAssigned) return true;
  }

  return false;
}

/* =========================
   TEACHER/ADMIN: GET DAILY RECORDS
========================= */
export const getDailyAttendanceService = async ({
  school_id,
  class_id,
  section_id,
  date,
  user,
}) => {
  // 1. Permission check
  const isAuthorized = await checkAttendancePermission({ user, school_id, class_id, section_id });
  if (!isAuthorized) {
    throw new AppError("FORBIDDEN", 403);
  }

  // 2. Fetch active students in class and section
  const students = await Student.scope("active").findAll({
    where: { school_id, class_id, section_id },
    include: [
      { model: User, attributes: ["id", "name", "avatar_url"] },
    ],
    order: [
      ["roll_no", "ASC"],
      [User, "name", "ASC"],
    ],
  });

  const academicYearId = await getCurrentAcademicYearId(school_id);

  // 3. Fetch attendance records for this date
  const records = await Attendance.findAll({
    where: { school_id, class_id, section_id, date, academic_year_id: academicYearId },
  });

  let lastUpdatedBy = null;
  let lastUpdatedAt = null;

  if (records.length > 0) {
    // Sort to find the latest updated record to get updated_by and updatedAt
    const sorted = [...records].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const latestRecord = sorted[0];
    lastUpdatedAt = latestRecord.updatedAt;

    const updaterUserId = latestRecord.updated_by || latestRecord.marked_by;
    if (updaterUserId) {
      const updaterUser = await User.findByPk(updaterUserId, { attributes: ["name"] });
      lastUpdatedBy = updaterUser?.name || null;
    }
  }

  // 4. Check if WhatsApp absent alerts were already sent for any student in this class today
  const WhatsappLog = (await import("../whatsapp/whatsapp-log.model.js")).default;
  const studentPhones = students
    .map((s) => s.user?.phone || s.emergency_contact)
    .filter(Boolean)
    .map((p) => "91" + String(p).replace(/\D/g, "").slice(-10));

  let whatsappSentToday = false;
  if (studentPhones.length > 0) {
    const sentLog = await WhatsappLog.findOne({
      where: {
        school_id,
        status: "success",
        phone: { [Op.in]: studentPhones },
        created_at: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    whatsappSentToday = !!sentLog;
  }

  return {
    students: students.map((s) => {
      const record = records.find((r) => String(r.student_id) === String(s.id));
      return {
        id: s.id,
        roll_no: s.roll_no || "",
        name: s.user?.name || s.name || "Student",
        avatar_url: s.user?.avatar_url || null,
        status: record ? record.status : "present", // default to Present
      };
    }),
    last_updated_by: lastUpdatedBy,
    last_updated_at: lastUpdatedAt,
    exists: records.length > 0,
    whatsapp_sent_today: whatsappSentToday,
  };
};

/* =========================
   TEACHER/ADMIN: MARK ATTENDANCE
========================= */
export const markAttendanceService = async ({
  user,
  school_id,
  class_id,
  section_id,
  date,
  records, // [{ student_id, status }]
}) => {
  // 1️⃣ Permission check
  const isAuthorized = await checkAttendancePermission({ user, school_id, class_id, section_id });
  if (!isAuthorized) {
    throw new AppError("FORBIDDEN", 403);
  }

  const academicYearId = await getCurrentAcademicYearId(school_id);

  // 2️⃣ Perform database writes inside a transaction
  await db.transaction(async (t) => {
    for (const { student_id, status } of records) {
      // Validate student belongs to class/section and school
      const student = await Student.findOne({
        where: {
          id: student_id,
          school_id,
          class_id,
          section_id,
          is_active: true,
          approval_status: "approved",
        },
        transaction: t,
      });

      if (!student) {
        throw new AppError(`INVALID_STUDENT ${student_id}`, 400);
      }

      // Upsert record
      const existing = await Attendance.findOne({
        where: { school_id, student_id, date, academic_year_id: academicYearId },
        transaction: t,
      });

      if (existing) {
        await existing.update(
          {
            status,
            updated_by: user.id,
          },
          { transaction: t }
        );
      } else {
        await Attendance.create(
          {
            school_id,
            academic_year_id: academicYearId,
            class_id,
            section_id,
            student_id,
            date,
            status,
            created_by: user.id,
            updated_by: user.id,
            marked_by: user.id, // backward compatibility
          },
          { transaction: t }
        );
      }
    }
  });

  return { message: "Attendance marked successfully" };
};

/* =========================
   TEACHER/ADMIN: ATTENDANCE SUMMARY
========================= */
export const getTeacherAttendanceSummaryService = async ({
  school_id,
  query,
  teacher_id,
}) => {
  const { limit, offset } = getPagination(query);
  const { from_date, to_date, class_id, section_id } = query || {};

  const academicYearId = await getCurrentAcademicYearId(school_id);
  const where = { school_id, academic_year_id: academicYearId };

  if (class_id) where.class_id = Number(class_id);
  if (section_id) where.section_id = Number(section_id);

  if (from_date || to_date) {
    where.date = {};
    if (from_date) where.date[Op.gte] = from_date;
    if (to_date) where.date[Op.lte] = to_date;
  }

  // If a teacher is requesting, scope by their assigned classes and sections
  if (teacher_id) {
    const assignments = await TeacherAssignment.findAll({
      where: { school_id, teacher_id, is_active: true },
      attributes: ["class_id", "section_id"],
    });

    const classTeacherClasses = await Class.findAll({
      where: { school_id, class_teacher_id: teacher_id, is_active: true },
      attributes: ["id"],
    });

    const classIds = [
      ...new Set([
        ...assignments.map((a) => Number(a.class_id)),
        ...classTeacherClasses.map((c) => Number(c.id)),
      ]),
    ];

    if (classIds.length === 0) {
      return { count: 0, rows: [] };
    }

    where.class_id = { [Op.in]: classIds };
  }

  return Attendance.findAndCountAll({
    where,
    include: [
      {
        model: Student,
        include: [{ model: User, attributes: ["id", "name"] }],
      },
    ],
    limit,
    offset,
    order: [["date", "DESC"]],
  });
};

/* =========================
   STUDENT: ATTENDANCE SUMMARY
========================= */
export const getStudentAttendanceSummaryService = async ({
  student_user_id,
  query,
}) => {
  const { limit, offset } = getPagination(query);
  const { from_date, to_date } = query || {};

  const student = await Student.findOne({ where: { user_id: student_user_id } });
  if (!student) throw new AppError("Student profile not found", 404);

  const academicYearId = await getCurrentAcademicYearId(student.school_id);
  const where = { student_id: student.id, academic_year_id: academicYearId };

  if (from_date || to_date) {
    where.date = {};
    if (from_date) where.date[Op.gte] = from_date;
    if (to_date) where.date[Op.lte] = to_date;
  }

  const result = await Attendance.findAndCountAll({
    where,
    limit,
    offset,
    order: [["date", "DESC"]],
  });

  let subjectStats = [];
  if (student.class_id && student.section_id) {
    subjectStats = await calculateSubjectAttendanceService({
      school_id: student.school_id,
      class_id: student.class_id,
      section_id: student.section_id,
      student_id: student.id,
      academic_year_id: academicYearId,
    });
  }

  return {
    count: result.count,
    rows: result.rows,
    subject_stats: subjectStats,
  };
};

/* =========================
   TEACHER/ADMIN: MANUAL ABSENT WHATSAPP ALERTS
========================= */
export const sendAbsentWhatsAppService = async ({
  school_id,
  class_id,
  section_id,
  date,
  user,
}) => {
  const isAuthorized = await checkAttendancePermission({ user, school_id, class_id, section_id });
  if (!isAuthorized) {
    throw new AppError("FORBIDDEN", 403);
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (date !== todayStr) {
    throw new AppError("WhatsApp absent alerts can only be sent for today's attendance.", 400);
  }

  const { sendAbsentAlert } = await import("../whatsapp/whatsapp.service.js");
  const WhatsappLog = (await import("../whatsapp/whatsapp-log.model.js")).default;

  const absentRecords = await Attendance.findAll({
    where: { school_id, class_id, section_id, date, status: "absent" },
    include: [
      {
        model: Student,
        include: [{ model: User, attributes: ["name", "phone"] }],
      },
    ],
  });

  if (absentRecords.length === 0) {
    return { total_absent: 0, sent_count: 0, message: "No absent students found for today." };
  }

  let sentCount = 0;
  for (const record of absentRecords) {
    const student = record.student;
    if (!student) continue;

    const phone = student.user?.phone || student.emergency_contact;
    if (!phone) continue;

    const alreadySent = await WhatsappLog.findOne({
      where: {
        school_id,
        status: "success",
        message: { [Op.like]: `%${student.user?.name || "Student"}%` },
        created_at: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    if (!alreadySent) {
      await sendAbsentAlert({
        id: student.id,
        date,
      });
      sentCount++;
    }
  }

  return {
    total_absent: absentRecords.length,
    sent_count: sentCount,
    whatsapp_sent_today: true,
    message: `Sent WhatsApp absent alerts to ${sentCount} parent(s).`,
  };
};
