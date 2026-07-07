import TeacherAssignment from "./teacher-assignment.model.js";
import AppError from "../../shared/appError.js";
import { getPagination } from "../../shared/utils/pagination.js";
import { Op } from "sequelize";
import Teacher from "../teachers/teacher.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import Subject from "../subjects/subject.model.js";
import User from "../users/user.model.js";


/* CREATE */
export async function assignTeacher({
  schoolId,
  teacherId,
  classId,
  sectionId,
  subjectId,
  isClassTeacher = false,
}) {
  // subject_id is optional for class-teacher-only assignments
  const lookups = [
    Teacher.findOne({ where: { id: teacherId, school_id: schoolId } }),
    Class.findOne({ where: { id: classId, school_id: schoolId } }),
    Section.findOne({
      where: { id: sectionId, class_id: classId, school_id: schoolId, is_active: true },
    }),
  ];

  if (subjectId) {
    lookups.push(Subject.findOne({ where: { id: subjectId, school_id: schoolId } }));
  }

  const [teacher, cls, section, subject] = await Promise.all(lookups);

  if (!teacher) {
    throw new AppError("TEACHER_NOT_FOUND", 404);
  }
  if (!cls) {
    throw new AppError("CLASS_NOT_FOUND", 404);
  }
  if (!section) {
    throw new AppError("SECTION_NOT_FOUND", 404);
  }
  if (subjectId && !subject) {
    throw new AppError("SUBJECT_NOT_FOUND", 404);
  }

  // Check for existing assignment (including inactive ones)
  const existing = await TeacherAssignment.findOne({
    where: {
      school_id: schoolId,
      teacher_id: teacherId,
      section_id: sectionId,
      subject_id: subjectId || null,
    },
  });

  if (existing && existing.is_active) {
    throw new AppError(
      "Teacher already assigned to this subject in this section",
      409
    );
  }

  // If trying to set as class teacher, check if section already has an active class teacher
  if (isClassTeacher) {
    const existingClassTeacher = await TeacherAssignment.findOne({
      where: {
        school_id: schoolId,
        section_id: sectionId,
        is_class_teacher: true,
        is_active: true,
      },
    });

    if (existingClassTeacher && (!existing || existingClassTeacher.id !== existing.id)) {
      throw new AppError(
        "This section already has a class teacher assigned",
        409
      );
    }
  }

  if (existing) {
    existing.is_active = true;
    existing.is_class_teacher = isClassTeacher;
    existing.class_id = classId; // align in case it changed
    await existing.save();
    return existing;
  }

  const createData = {
    school_id: schoolId,
    teacher_id: teacherId,
    class_id: classId,
    section_id: sectionId,
    is_class_teacher: isClassTeacher,
  };

  if (subjectId) {
    createData.subject_id = subjectId;
  }

  return TeacherAssignment.create(createData);
}


/* LIST ALL (with pagination) */
export async function listAssignments({ schoolId, query }) {
  const { limit, offset } = getPagination(query);

  return TeacherAssignment.findAndCountAll({
    where: {
      school_id: schoolId,
      is_active: true,
    },
    include: [
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
      { model: Subject, attributes: ["id", "name"] },
      {
        model: Teacher,
        attributes: ["id", "user_id", "employee_id"],
        include: [{ model: User, attributes: ["id", "name", "username"] }],
      },
    ],
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });
}

/* LIST BY TEACHER */
export async function getTeacherAssignments({ schoolId, teacherId }) {
  return TeacherAssignment.findAll({
    where: {
      school_id: schoolId,
      teacher_id: teacherId,
      is_active: true,
    },
    include: [
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
      { model: Subject, attributes: ["id", "name"] },
      {
        model: Teacher,
        attributes: ["id", "user_id"],
        include: [{ model: User, attributes: ["id", "name", "username"] }],
      },
    ],
    order: [["created_at", "DESC"]],
  });
}

/* LIST BY SECTION */
export async function getSectionAssignments({ schoolId, sectionId }) {
  return TeacherAssignment.findAll({
    where: {
      school_id: schoolId,
      section_id: sectionId,
      is_active: true,
    },
    include: [
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
      { model: Subject, attributes: ["id", "name"] },
      {
        model: Teacher,
        attributes: ["id", "user_id"],
        include: [{ model: User, attributes: ["id", "name", "username"] }],
      },
    ],
    order: [["created_at", "DESC"]],
  });
}

/* UPDATE */
export async function updateAssignment({ schoolId, assignmentId, updates }) {
  const assignment = await TeacherAssignment.findOne({
    where: {
      id: assignmentId,
      school_id: schoolId,
    },
  });

  if (!assignment) {
    throw new AppError("Assignment not found", 404);
  }

  // If trying to set as class teacher, check if section already has a class teacher
  if (updates.is_class_teacher === true) {
    const existingClassTeacher = await TeacherAssignment.findOne({
      where: {
        school_id: schoolId,
        section_id: assignment.section_id,
        is_class_teacher: true,
        is_active: true,
        id: { [Op.ne]: assignmentId }, // Exclude current assignment
      },
    });

    if (existingClassTeacher) {
      throw new AppError(
        "This section already has a class teacher assigned",
        409
      );
    }
  }

  await assignment.update(updates);
  return assignment;
}

/* DELETE (soft delete by setting is_active to false) */
export async function deleteAssignment({ schoolId, assignmentId }) {
  const assignment = await TeacherAssignment.findOne({
    where: {
      id: assignmentId,
      school_id: schoolId,
    },
  });

  if (!assignment) {
    throw new AppError("Assignment not found", 404);
  }

  await assignment.update({ is_active: false });
  return { message: "Assignment deleted successfully" };
}

