import db from "../../config/db.js";
import { Op } from "sequelize";

import Timetable from "./timetable.model.js";
import TimetableSubstitution from "./timetable-substitution.model.js";
import Section from "../sections/section.model.js";
import Class from "../classes/classes.model.js";
import TeacherAssignment from "../teacher-assignments/teacher-assignment.model.js";
import Subject from "../subjects/subject.model.js";
import User from "../users/user.model.js";
import Teacher from "../teachers/teacher.model.js";
import AppError from "../../shared/appError.js";
import { getCurrentAcademicYearId } from "../academic-years/academic-year.helper.js";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/* =====================================================
   CREATE / UPDATE SECTION TIMETABLE
   (School Admin or Class Teacher)
===================================================== */
export const saveTimetableService = async ({
  user,
  school_id,
  class_id,
  section_id,
  day_of_week,
  entries,
}) => {
  const academicYearId = await getCurrentAcademicYearId(school_id);

  return db.transaction(async (t) => {
    /**
     * 1️⃣ Validate section
     */
    const section = await Section.findOne({
      where: { id: section_id, class_id, school_id, is_active: true },
      transaction: t,
    });

    if (!section) {
      throw new AppError("SECTION_NOT_FOUND", 404);
    }

    /**
     * 2️⃣ Permission check
     * - School admin: always allowed
     * - Teacher: must be class teacher of this section
     */
    if (user.role === "teacher") {
      const isClassTeacher = await TeacherAssignment.findOne({
        where: {
          section_id,
          school_id,
          teacher_id: user.teacher_id,
          is_class_teacher: true,
          is_active: true,
        },
        transaction: t,
      });

      if (!isClassTeacher) {
        throw new AppError("FORBIDDEN", 403);
      }
    }

    /**
     * 3️⃣ Remove existing timetable for that day
     */
    await Timetable.destroy({
      where: { school_id, class_id, section_id, day_of_week, academic_year_id: academicYearId },
      transaction: t,
    });

    /**
     * 4️⃣ Insert new timetable entries
     */
    for (const e of entries) {
      if (!e.is_break && !e.teacher_assignment_id && (!e.teacher_id || !e.subject_id)) {
        throw new AppError("ASSIGNMENT_REQUIRED", 400);
      }

      let assignment = null;

      if (!e.is_break) {
        if (e.teacher_assignment_id) {
          assignment = await TeacherAssignment.findOne({
            where: {
              id: e.teacher_assignment_id,
              school_id,
              class_id,
              section_id,
              is_active: true,
            },
            transaction: t,
          });
        } else if (e.teacher_id && e.subject_id) {
          const [assoc, created] = await TeacherAssignment.findOrCreate({
            where: {
              school_id,
              class_id,
              section_id,
              teacher_id: e.teacher_id,
              subject_id: e.subject_id,
            },
            defaults: {
              is_active: true,
              is_class_teacher: false,
            },
            transaction: t,
          });

          if (!assoc.is_active) {
            await assoc.update({ is_active: true }, { transaction: t });
          }

          assignment = assoc;
        }

        if (!assignment) {
          throw new AppError("INVALID_TEACHER_ASSIGNMENT", 400);
        }
      }

      await Timetable.create(
        {
          school_id,
          academic_year_id: academicYearId,
          class_id,
          section_id,
          day_of_week,
          start_time: e.start_time,
          end_time: e.end_time,
          teacher_assignment_id: e.is_break ? null : assignment.id,
          is_break: e.is_break,
          title: e.is_break ? e.title : null,
        },
        { transaction: t }
      );
    }

    return { success: true };
  });
};

/* =====================================================
   STUDENT VIEW: SECTION TIMETABLE
   (Mon–Sat, periods with subject & time + today's substitutions)
===================================================== */
export const getSectionTimetableService = async ({
  school_id,
  class_id,
  section_id,
}) => {
  const academicYearId = await getCurrentAcademicYearId(school_id);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayWeekday = DAY_NAMES[new Date().getDay()];

  const rows = await Timetable.findAll({
    where: { school_id, class_id, section_id, academic_year_id: academicYearId },
    include: [
      {
        model: TeacherAssignment,
        required: false,
        include: [
          {
            model: Subject,
            attributes: ["id", "name"],
          },
          {
            model: Teacher,
            attributes: ["id"],
            include: [{ model: User, attributes: ["name"] }],
          },
        ],
        attributes: ["id", "teacher_id", "subject_id"],
      },
    ],
    order: [
      ["day_of_week", "ASC"],
      ["start_time", "ASC"],
    ],
  });

  // Fetch today's substitutions for this class & section
  const todaySubstitutions = await TimetableSubstitution.findAll({
    where: { school_id, class_id, section_id, date: todayStr },
    include: [
      {
        model: Teacher,
        as: "SubstituteTeacher",
        include: [{ model: User, attributes: ["name"] }],
      },
    ],
  });

  const subMap = {};
  todaySubstitutions.forEach((sub) => {
    subMap[sub.timetable_id] = sub;
  });

  /**
   * Group by day_of_week (Monday → Saturday)
   */
  const grouped = {};

  for (const row of rows) {
    const day = row.day_of_week;
    if (!grouped[day]) grouped[day] = [];

    const isToday = day === todayWeekday;
    const subRecord = isToday ? subMap[row.id] : null;

    let teacherObj = row.teacher_assignment?.teacher?.user
      ? { id: row.teacher_assignment.teacher.id, name: row.teacher_assignment.teacher.user.name }
      : null;

    let isSubstituted = false;

    if (subRecord && subRecord.SubstituteTeacher?.user?.name) {
      teacherObj = {
        id: subRecord.substitute_teacher_id,
        name: subRecord.SubstituteTeacher.user.name,
      };
      isSubstituted = true;
    }

    grouped[day].push({
      id: row.id,
      start_time: row.start_time,
      end_time: row.end_time,
      is_break: row.is_break,
      title: row.is_break ? row.title : null,
      teacher_assignment_id: row.teacher_assignment?.id ?? null,
      teacher_id: teacherObj?.id ?? null,
      subject_id: row.teacher_assignment?.subject_id ?? null,
      subject: row.is_break ? null : row.teacher_assignment?.subject,
      teacher: teacherObj,
      is_substituted: isSubstituted,
    });
  }

  return grouped;
};

/* =====================================================
   TEACHER VIEW: OWN TIMETABLE
   (Which class, section, subject, time + today's coverages)
===================================================== */
export const getTeacherTimetableService = async ({
  school_id,
  teacher_id,
}) => {
  const academicYearId = await getCurrentAcademicYearId(school_id);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayWeekday = DAY_NAMES[new Date().getDay()];

  const rows = await Timetable.findAll({
    where: { academic_year_id: academicYearId },
    include: [
      {
        model: TeacherAssignment,
        where: {
          teacher_id,
          school_id,
          is_active: true,
        },
        include: [
          {
            model: Subject,
            attributes: ["id", "name"],
          },
        ],
        attributes: ["id", "teacher_id", "subject_id"],
      },
      {
        model: Class,
        attributes: ["id", "class_name"],
      },
      {
        model: Section,
        attributes: ["id", "name"],
      },
    ],
    order: [
      ["day_of_week", "ASC"],
      ["start_time", "ASC"],
    ],
  });

  // 1. Fetch today's substitutions where this teacher is absent/substituted out
  const absentSubstitutions = await TimetableSubstitution.findAll({
    where: { school_id, date: todayStr, original_teacher_id: teacher_id },
    include: [
      {
        model: Teacher,
        as: "SubstituteTeacher",
        include: [{ model: User, attributes: ["name"] }],
      },
    ],
  });
  const absentSubMap = {};
  absentSubstitutions.forEach((s) => {
    absentSubMap[s.timetable_id] = s;
  });

  // 2. Fetch today's substitutions where this teacher is assigned as a SUBSTITUTE COVERAGE
  const coveringSubstitutions = await TimetableSubstitution.findAll({
    where: { school_id, date: todayStr, substitute_teacher_id: teacher_id },
    include: [
      {
        model: Timetable,
        include: [
          { model: Class, attributes: ["id", "class_name"] },
          { model: Section, attributes: ["id", "name"] },
          {
            model: TeacherAssignment,
            include: [{ model: Subject, attributes: ["id", "name"] }],
          },
        ],
      },
      {
        model: Teacher,
        as: "OriginalTeacher",
        include: [{ model: User, attributes: ["name"] }],
      },
    ],
  });

  /**
   * Group by day_of_week
   */
  const grouped = {};

  for (const row of rows) {
    const day = row.day_of_week;
    if (!grouped[day]) grouped[day] = [];

    const isToday = day === todayWeekday;
    const absentSub = isToday ? absentSubMap[row.id] : null;

    grouped[day].push({
      id: row.id,
      start_time: row.start_time,
      end_time: row.end_time,
      class: row.class,
      section: row.section,
      class_id: row.class_id,
      section_id: row.section_id,
      teacher_assignment_id: row.teacher_assignment?.id ?? null,
      subject_id: row.teacher_assignment?.subject_id ?? null,
      subject: row.teacher_assignment?.subject,
      is_substituted: !!absentSub,
      substitute_teacher_name: absentSub?.SubstituteTeacher?.user?.name || null,
    });
  }

  // Inject today's substitution coverages into today's schedule
  if (coveringSubstitutions.length > 0) {
    if (!grouped[todayWeekday]) grouped[todayWeekday] = [];

    coveringSubstitutions.forEach((sub) => {
      const t = sub.timetable;
      if (!t) return;

      // Avoid duplicate if already present
      const exists = grouped[todayWeekday].some((p) => p.id === t.id && p.is_covering);
      if (!exists) {
        grouped[todayWeekday].push({
          id: t.id,
          start_time: t.start_time,
          end_time: t.end_time,
          class: t.class,
          section: t.section,
          class_id: t.class_id,
          section_id: t.section_id,
          teacher_assignment_id: t.teacher_assignment_id,
          subject_id: t.teacher_assignment?.subject_id || null,
          subject: t.teacher_assignment?.subject || { name: "Substitution" },
          is_covering: true,
          original_teacher_name: sub.OriginalTeacher?.user?.name || "Teacher",
        });
      }
    });

    // Re-sort today's entries by start_time
    grouped[todayWeekday].sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  return grouped;
};
