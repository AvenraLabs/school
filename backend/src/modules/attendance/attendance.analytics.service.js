import { Op, fn, col, literal } from "sequelize";
import Attendance from "./attendance.model.js";
import AppError from "../../shared/appError.js";
import TeacherAssignment from "../teacher-assignments/teacher-assignment.model.js";
import Class from "../classes/classes.model.js";
import { getCurrentAcademicYearId } from "../academic-years/academic-year.helper.js";

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

