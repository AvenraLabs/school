import { Op, fn, col, literal } from "sequelize";
import db from "../../config/db.js";
import TimetableSubstitution from "./timetable-substitution.model.js";
import Timetable from "./timetable.model.js";
import TeacherAssignment from "../teacher-assignments/teacher-assignment.model.js";
import Teacher from "../teachers/teacher.model.js";
import User from "../users/user.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import Subject from "../subjects/subject.model.js";
import ExamMark from "../report-cards/exam-mark.model.js";
import Student from "../students/student.model.js";
import AppError from "../../shared/appError.js";
import { getCurrentAcademicYearId } from "../academic-years/academic-year.helper.js";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function getDayOfWeekFromDate(dateStr) {
  const dateObj = new Date(dateStr);
  const dayIdx = dateObj.getDay();
  return DAY_NAMES[dayIdx];
}

/**
 * 1️⃣ Get all timetable periods for a specific teacher on today's weekday
 */
export const getTeacherPeriodsForDateService = async ({ school_id, teacher_id, date }) => {
  const dayOfWeek = getDayOfWeekFromDate(date);
  const academicYearId = await getCurrentAcademicYearId(school_id);

  // Fetch permanent timetable periods for this teacher on this weekday
  const periods = await Timetable.findAll({
    where: {
      school_id,
      day_of_week: dayOfWeek,
      academic_year_id: academicYearId,
      is_break: false,
    },
    include: [
      {
        model: TeacherAssignment,
        where: { teacher_id, is_active: true },
        required: true,
        include: [
          { model: Subject, attributes: ["id", "name"] },
          { model: Teacher, include: [{ model: User, attributes: ["id", "name"] }] },
        ],
      },
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
    ],
    order: [["start_time", "ASC"]],
  });

  // Fetch existing substitutions for this teacher & date
  const existingSubstitutions = await TimetableSubstitution.findAll({
    where: { school_id, date, original_teacher_id: teacher_id },
    include: [
      {
        model: Teacher,
        as: "SubstituteTeacher",
        include: [{ model: User, attributes: ["id", "name"] }],
      },
    ],
  });

  const subMap = {};
  existingSubstitutions.forEach((sub) => {
    subMap[sub.timetable_id] = sub;
  });

  const items = periods.map((p) => {
    const existingSub = subMap[p.id];
    return {
      timetable_id: p.id,
      start_time: p.start_time,
      end_time: p.end_time,
      class_id: p.class_id,
      section_id: p.section_id,
      class_name: p.class?.class_name || "",
      section_name: p.section?.name || "",
      subject_id: p.teacher_assignment?.subject_id || null,
      subject_name: p.teacher_assignment?.subject?.name || "Subject",
      original_teacher_id: teacher_id,
      original_teacher_name: p.teacher_assignment?.teacher?.user?.name || "Teacher",
      current_substitute: existingSub
        ? {
            teacher_id: existingSub.substitute_teacher_id,
            teacher_name: existingSub.SubstituteTeacher?.user?.name || "Substitute",
          }
        : null,
    };
  });

  return {
    date,
    day_of_week: dayOfWeek,
    teacher_id: Number(teacher_id),
    periods: items,
  };
};

/**
 * 2️⃣ Get available substitute teachers for a specific period on a date
 */
export const getAvailableSubstitutesService = async ({ school_id, timetable_id, date }) => {
  const targetPeriod = await Timetable.findByPk(timetable_id, {
    include: [
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
      {
        model: TeacherAssignment,
        include: [{ model: Subject, attributes: ["id", "name"] }],
      },
    ],
  });

  if (!targetPeriod) {
    throw new AppError("TIMETABLE_PERIOD_NOT_FOUND", 404);
  }

  const dayOfWeek = targetPeriod.day_of_week;
  const startTime = targetPeriod.start_time;
  const endTime = targetPeriod.end_time;
  const targetClassId = targetPeriod.class_id;
  const targetSectionId = targetPeriod.section_id;
  const targetSubjectId = targetPeriod.teacher_assignment?.subject_id;
  const originalTeacherId = targetPeriod.teacher_assignment?.teacher_id;

  // 1. All active teachers in school
  const allTeachers = await Teacher.scope("active").findAll({
    where: { school_id },
    include: [{ model: User, attributes: ["id", "name", "avatar_url"] }],
  });

  // 2. Teachers busy with permanent timetable at this time on this weekday
  const busyPermanentRows = await Timetable.findAll({
    where: {
      school_id,
      day_of_week: dayOfWeek,
      is_break: false,
      start_time: { [Op.lt]: endTime },
      end_time: { [Op.gt]: startTime },
    },
    include: [
      {
        model: TeacherAssignment,
        attributes: ["teacher_id"],
        where: { is_active: true },
        required: true,
      },
    ],
  });

  const busyTeacherIds = new Set();
  busyPermanentRows.forEach((row) => {
    if (row.teacher_assignment?.teacher_id) {
      busyTeacherIds.add(String(row.teacher_assignment.teacher_id));
    }
  });

  // 3. Teachers busy as substitutes at this time on this date
  const busySubstituteRows = await TimetableSubstitution.findAll({
    where: {
      school_id,
      date,
      timetable_id: { [Op.ne]: timetable_id },
    },
    include: [
      {
        model: Timetable,
        where: {
          start_time: { [Op.lt]: endTime },
          end_time: { [Op.gt]: startTime },
        },
        required: true,
      },
    ],
  });

  busySubstituteRows.forEach((sub) => {
    if (sub.substitute_teacher_id) {
      busyTeacherIds.add(String(sub.substitute_teacher_id));
    }
  });

  // 4. Precalculate Periods Today for ALL teachers on this date
  // Permanent periods count today:
  const permCounts = await Timetable.findAll({
    attributes: [
      [col("teacher_assignment.teacher_id"), "teacher_id"],
      [fn("COUNT", col("timetable.id")), "cnt"],
    ],
    where: {
      school_id,
      day_of_week: dayOfWeek,
      is_break: false,
    },
    include: [
      {
        model: TeacherAssignment,
        attributes: [],
        where: { is_active: true },
        required: true,
      },
    ],
    group: ["teacher_assignment.teacher_id"],
    raw: true,
  });

  const periodsTodayMap = {};
  permCounts.forEach((r) => {
    periodsTodayMap[r.teacher_id] = Number(r.cnt || 0);
  });

  // Substitution periods count today:
  const subCounts = await TimetableSubstitution.findAll({
    attributes: [
      "substitute_teacher_id",
      [fn("COUNT", col("id")), "cnt"],
    ],
    where: { school_id, date },
    group: ["substitute_teacher_id"],
    raw: true,
  });

  subCounts.forEach((r) => {
    const tid = r.substitute_teacher_id;
    periodsTodayMap[tid] = (periodsTodayMap[tid] || 0) + Number(r.cnt || 0);
  });

  // Subtract period from original teacher if they are substituted
  // (Not critical, but accurate)

  // 5. Precalculate Class Average for all subjects taught by active teachers in target class & section
  // Query exam_marks for target class_id & section_id
  const examAvgRows = await ExamMark.findAll({
    attributes: [
      "subject_id",
      [fn("SUM", col("marks_obtained")), "total_obtained"],
      [fn("SUM", col("max_marks")), "total_max"],
    ],
    where: { school_id },
    include: [
      {
        model: Student,
        attributes: [],
        where: { class_id: targetClassId, section_id: targetSectionId },
        required: true,
      },
    ],
    group: ["subject_id"],
    raw: true,
  });

  const subjectClassAvgMap = {};
  examAvgRows.forEach((r) => {
    const totalObtained = Number(r.total_obtained || 0);
    const totalMax = Number(r.total_max || 100);
    subjectClassAvgMap[r.subject_id] = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
  });

  // Fetch all teacher assignments to know their primary subjects
  const allAssignments = await TeacherAssignment.findAll({
    where: { school_id, is_active: true },
    include: [{ model: Subject, attributes: ["id", "name"] }],
  });

  const teacherSubjectMap = {};
  allAssignments.forEach((ta) => {
    if (!teacherSubjectMap[ta.teacher_id]) {
      teacherSubjectMap[ta.teacher_id] = ta.subject?.name || null;
    }
    // Store subject_id as well
    if (!teacherSubjectMap[`${ta.teacher_id}_subid`]) {
      teacherSubjectMap[`${ta.teacher_id}_subid`] = ta.subject_id;
    }
  });

  // 6. Filter & build available teacher candidates
  const candidates = [];

  for (const teacher of allTeachers) {
    const tid = String(teacher.id);

    // Skip absent/original teacher and busy teachers
    if (tid === String(originalTeacherId)) continue;
    if (busyTeacherIds.has(tid)) continue;

    const subjectName = teacherSubjectMap[teacher.id] || teacher.designation || "General";
    const subjectId = teacherSubjectMap[`${teacher.id}_subid`] || targetSubjectId;
    const classAvg = subjectClassAvgMap[subjectId] !== undefined ? subjectClassAvgMap[subjectId] : 50; // default 50% if no marks
    const periodsToday = periodsTodayMap[teacher.id] || 0;

    candidates.push({
      teacher_id: teacher.id,
      name: teacher.user?.name || `Teacher #${teacher.id}`,
      employee_id: teacher.employee_id,
      avatar_url: teacher.user?.avatar_url || null,
      subject: subjectName,
      class_average: classAvg,
      periods_today: periodsToday,
    });
  }

  // 7. Sort by:
  // 1. Lowest Class Average
  // 2. Lowest Periods Today
  candidates.sort((a, b) => {
    if (a.class_average !== b.class_average) {
      return a.class_average - b.class_average;
    }
    return a.periods_today - b.periods_today;
  });

  return {
    timetable_id: Number(timetable_id),
    date,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
    class_name: targetPeriod.class?.class_name || "",
    section_name: targetPeriod.section?.name || "",
    subject_name: targetPeriod.teacher_assignment?.subject?.name || "",
    candidates,
  };
};

/**
 * 3️⃣ Save / Upsert substitutions
 */
export const saveSubstitutionsService = async ({ user, school_id, date, substitutions }) => {
  const academicYearId = await getCurrentAcademicYearId(school_id);
  const dayOfWeek = getDayOfWeekFromDate(date);

  return db.transaction(async (t) => {
    for (const sub of substitutions) {
      const { timetable_id, substitute_teacher_id } = sub;
      if (!timetable_id || !substitute_teacher_id) continue;

      const period = await Timetable.findOne({
        where: { id: timetable_id, school_id },
        include: [{ model: TeacherAssignment }],
        transaction: t,
      });

      if (!period) {
        throw new AppError(`TIMETABLE_PERIOD_NOT_FOUND ${timetable_id}`, 404);
      }

      const originalTeacherId = period.teacher_assignment?.teacher_id;
      if (!originalTeacherId) {
        throw new AppError("NO_ORIGINAL_TEACHER_FOUND", 400);
      }

      // Re-verify candidate teacher availability (Conflict check)
      const busyPerm = await Timetable.findOne({
        where: {
          school_id,
          day_of_week: dayOfWeek,
          is_break: false,
          start_time: { [Op.lt]: period.end_time },
          end_time: { [Op.gt]: period.start_time },
        },
        include: [
          {
            model: TeacherAssignment,
            where: { teacher_id: substitute_teacher_id, is_active: true },
            required: true,
          },
        ],
        transaction: t,
      });

      if (busyPerm) {
        throw new AppError("TEACHER_ALREADY_BUSY_IN_PERMANENT_TIMETABLE", 409);
      }

      const busySub = await TimetableSubstitution.findOne({
        where: {
          school_id,
          date,
          substitute_teacher_id,
          timetable_id: { [Op.ne]: timetable_id },
        },
        include: [
          {
            model: Timetable,
            where: {
              start_time: { [Op.lt]: period.end_time },
              end_time: { [Op.gt]: period.start_time },
            },
            required: true,
          },
        ],
        transaction: t,
      });

      if (busySub) {
        throw new AppError("TEACHER_ALREADY_ASSIGNED_AS_SUBSTITUTE_ELSEWHERE", 409);
      }

      // Upsert
      const existing = await TimetableSubstitution.findOne({
        where: { school_id, date, timetable_id },
        transaction: t,
      });

      if (existing) {
        await existing.update(
          {
            substitute_teacher_id,
            original_teacher_id: originalTeacherId,
            created_by: user.id,
          },
          { transaction: t }
        );
      } else {
        await TimetableSubstitution.create(
          {
            school_id,
            academic_year_id: academicYearId,
            date,
            timetable_id,
            class_id: period.class_id,
            section_id: period.section_id,
            original_teacher_id: originalTeacherId,
            substitute_teacher_id,
            created_by: user.id,
          },
          { transaction: t }
        );
      }
    }

    return { success: true, message: "Substitutions saved successfully" };
  });
};

/**
 * 4️⃣ Get existing substitutions for a specific date
 */
export const getTodaySubstitutionsService = async ({ school_id, date }) => {
  return TimetableSubstitution.findAll({
    where: { school_id, date },
    include: [
      {
        model: Timetable,
        include: [
          { model: Class, attributes: ["id", "class_name"] },
          { model: Section, attributes: ["id", "name"] },
          { model: TeacherAssignment, include: [{ model: Subject, attributes: ["id", "name"] }] },
        ],
      },
      {
        model: Teacher,
        as: "OriginalTeacher",
        include: [{ model: User, attributes: ["id", "name"] }],
      },
      {
        model: Teacher,
        as: "SubstituteTeacher",
        include: [{ model: User, attributes: ["id", "name"] }],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};
