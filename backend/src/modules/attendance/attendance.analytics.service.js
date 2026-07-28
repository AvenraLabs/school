import { Op, fn, col, literal } from "sequelize";
import Attendance from "./attendance.model.js";
import AppError from "../../shared/appError.js";
import TeacherAssignment from "../teacher-assignments/teacher-assignment.model.js";
import Class from "../classes/classes.model.js";
import Timetable from "../timetables/timetable.model.js";
import Subject from "../subjects/subject.model.js";
import { getCurrentAcademicYearId } from "../academic-years/academic-year.helper.js";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/* =========================
   TEACHER: ANALYTICS
========================= */
export const getTeacherAttendanceAnalyticsService = async ({
  school_id,
  query,
  teacher_id,
}) => {
  const { from_date, to_date, class_id, section_id, student_id } = query || {};

  const academicYearId = await getCurrentAcademicYearId(school_id);
  const where = { school_id, academic_year_id: academicYearId };

  if (class_id) where.class_id = Number(class_id);
  if (section_id) where.section_id = Number(section_id);
  if (student_id) where.student_id = Number(student_id);

  if (from_date || to_date) {
    where.date = {};
    if (from_date) where.date[Op.gte] = from_date;
    if (to_date) where.date[Op.lte] = to_date;
  }

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
      return [];
    }

    where.class_id = { [Op.in]: classIds };
  }

  const stats = await Attendance.findAll({
    where,
    attributes: [
      "student_id",
      [fn("COUNT", col("id")), "total_days"],
      [fn("SUM", literal(`CASE WHEN status = 'present' THEN 1 ELSE 0 END`)), "present_days"],
      [fn("SUM", literal(`CASE WHEN status = 'absent' THEN 1 ELSE 0 END`)), "absent_days"],
      [fn("SUM", literal(`CASE WHEN status = 'leave' THEN 1 ELSE 0 END`)), "leave_days"],
    ],
    group: ["student_id"],
  });

  return stats.map((row) => {
    const total = Number(row.get("total_days"));
    const present = Number(row.get("present_days"));

    return {
      student_id: row.student_id,
      total_days: total,
      present_days: present,
      absent_days: Number(row.get("absent_days")),
      leave_days: Number(row.get("leave_days")),
      attendance_percentage: total
        ? Number(((present / total) * 100).toFixed(2))
        : 0,
    };
  });
};

/* =========================
   SUBJECT-WISE ATTENDANCE CALCULATOR
========================= */
export const calculateSubjectAttendanceService = async ({
  school_id,
  class_id,
  section_id,
  student_id = null,
  academic_year_id = null,
}) => {
  if (!class_id || !section_id) return [];

  const academicYearId = academic_year_id || (await getCurrentAcademicYearId(school_id));

  // 1. Fetch section timetable (non-break entries)
  const timetableEntries = await Timetable.findAll({
    where: { school_id, class_id, section_id, academic_year_id: academicYearId, is_break: false },
    include: [
      {
        model: TeacherAssignment,
        required: true,
        include: [{ model: Subject, attributes: ["id", "name"] }],
      },
    ],
  });

  if (!timetableEntries || timetableEntries.length === 0) {
    return [];
  }

  // 2. Map day_of_week -> { subject_id: { count, subject_name } }
  const dayScheduleMap = {};
  const subjectsMap = {};

  timetableEntries.forEach((entry) => {
    const day = (entry.day_of_week || "").toLowerCase();
    const subjectId = entry.teacher_assignment?.subject_id;
    const subjectName = entry.teacher_assignment?.subject?.name || `Subject #${subjectId}`;

    if (!subjectId) return;

    subjectsMap[subjectId] = subjectName;

    if (!dayScheduleMap[day]) dayScheduleMap[day] = {};
    if (!dayScheduleMap[day][subjectId]) {
      dayScheduleMap[day][subjectId] = { count: 0, name: subjectName };
    }
    dayScheduleMap[day][subjectId].count += 1;
  });

  const subjectIds = Object.keys(subjectsMap).map(Number);
  if (subjectIds.length === 0) return [];

  const subjectStatsMap = {};
  subjectIds.forEach((subId) => {
    subjectStatsMap[subId] = {
      subject_id: subId,
      subject_name: subjectsMap[subId],
      conducted: 0,
      attended: 0,
    };
  });

  if (student_id) {
    // Single student query
    const studentRecords = await Attendance.findAll({
      where: { school_id, class_id, section_id, student_id, academic_year_id: academicYearId },
      attributes: ["date", "status"],
    });

    studentRecords.forEach((rec) => {
      const dayName = DAY_NAMES[new Date(rec.date).getDay()];
      const daySubjects = dayScheduleMap[dayName];
      if (!daySubjects) return;

      const isAttended = rec.status === "present" || rec.status === "on_duty";

      Object.keys(daySubjects).forEach((subIdStr) => {
        const subId = Number(subIdStr);
        const periodCount = daySubjects[subIdStr].count;

        if (subjectStatsMap[subId]) {
          subjectStatsMap[subId].conducted += periodCount;
          if (isAttended) {
            subjectStatsMap[subId].attended += periodCount;
          }
        }
      });
    });
  } else {
    // Section-wide query: get all conducted dates for this class/section
    const conductedDates = await Attendance.findAll({
      where: { school_id, class_id, section_id, academic_year_id: academicYearId },
      attributes: [[fn("DISTINCT", col("date")), "date"]],
      raw: true,
    });

    conductedDates.forEach((rec) => {
      const dayName = DAY_NAMES[new Date(rec.date).getDay()];
      const daySubjects = dayScheduleMap[dayName];
      if (!daySubjects) return;

      Object.keys(daySubjects).forEach((subIdStr) => {
        const subId = Number(subIdStr);
        const periodCount = daySubjects[subIdStr].count;
        if (subjectStatsMap[subId]) {
          subjectStatsMap[subId].conducted += periodCount;
        }
      });
    });

    // Section-wide attendance records
    const allAttendanceRecords = await Attendance.findAll({
      where: { school_id, class_id, section_id, academic_year_id: academicYearId },
      attributes: ["student_id", "date", "status"],
      raw: true,
    });

    const studentCountInAttendance = new Set(allAttendanceRecords.map((r) => r.student_id)).size || 1;

    allAttendanceRecords.forEach((rec) => {
      if (rec.status === "present" || rec.status === "on_duty") {
        const dayName = DAY_NAMES[new Date(rec.date).getDay()];
        const daySubjects = dayScheduleMap[dayName];
        if (!daySubjects) return;

        Object.keys(daySubjects).forEach((subIdStr) => {
          const subId = Number(subIdStr);
          const periodCount = daySubjects[subIdStr].count;
          if (subjectStatsMap[subId]) {
            subjectStatsMap[subId].attended += periodCount;
          }
        });
      }
    });

    Object.values(subjectStatsMap).forEach((st) => {
      st.attended = Math.round(st.attended / studentCountInAttendance);
    });
  }

  return Object.values(subjectStatsMap).map((st) => ({
    ...st,
    percentage: st.conducted > 0 ? Math.round((st.attended / st.conducted) * 100) : 0,
  }));
};

