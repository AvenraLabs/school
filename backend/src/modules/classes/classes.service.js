// src/modules/classes/classes.service.js
import Class from "./classes.model.js";
import Section from "../sections/section.model.js";
import Teacher from "../teachers/teacher.model.js";
import Student from "../students/student.model.js";

import User from "../users/user.model.js";

export const createClassService = async ({
  school_id,
  class_name,
}) => {
  return await Class.create({
    school_id,
    class_name,
  });
};

export const getClassesService = async (school_id) => {
  return await Class.findAndCountAll({
    distinct: true,
    where: { school_id },
    include: [
      {
        model: Section,
        attributes: ["id", "name", "is_active"],
      },
    ],
    order: [["class_name", "ASC"]],
  });
};

export const getClassByIdService = async (id, school_id) => {
  return await Class.findOne({
    where: { id, school_id },
    include: [
      {
        model: Section,
        attributes: ["id", "name", "is_active"],
      },
    ],
  });
};

export const updateClassService = async (id, school_id, payload) => {
  const cls = await Class.findOne({ where: { id, school_id } });

  if (!cls) return null;

  await cls.update(payload);
  return cls;
};

import AppError from "../../shared/appError.js";
import db from "../../config/db.js";

export const deleteClassService = async (id, school_id) => {
  const cls = await Class.findOne({ where: { id, school_id } });

  if (!cls) return null;

  const studentCount = await Student.count({ where: { class_id: id, school_id } });
  if (studentCount > 0) {
    throw new AppError(
      `Cannot delete class "${cls.class_name}" because ${studentCount} student(s) are assigned to it. Please reassign or remove students first.`,
      400
    );
  }

  const sectionCount = await Section.count({ where: { class_id: id, school_id } });
  if (sectionCount > 0) {
    throw new AppError(
      `Cannot delete class "${cls.class_name}" because ${sectionCount} section(s) exist under it. Please delete sections first.`,
      400
    );
  }

  await db.transaction(async (t) => {
    if (db.models.teacher_assignment) {
      await db.models.teacher_assignment.destroy({ where: { class_id: id }, transaction: t });
    }
    if (db.models.timetable) {
      await db.models.timetable.destroy({ where: { class_id: id }, transaction: t });
    }
    if (db.models.class_fee_plan) {
      await db.models.class_fee_plan.destroy({ where: { class_id: id }, transaction: t });
    }
    if (db.models.class_fee_schedule) {
      await db.models.class_fee_schedule.destroy({ where: { class_id: id }, transaction: t });
    }
    if (db.models.student_enrollment) {
      await db.models.student_enrollment.destroy({ where: { class_id: id }, transaction: t });
    }
    await cls.destroy({ transaction: t });
  });

  return true;
};

/* =========================
   ADMIN: LOGIN ROSTER
========================= */
export const getLoginRosterService = async ({ school_id, query }) => {
  const classWhere = { school_id };
  if (query?.class_id) classWhere.id = Number(query.class_id);

  const sectionWhere = {};
  const filterSection = query?.section_id;
  if (filterSection) sectionWhere.id = Number(filterSection);

  const [teachers, classes] = await Promise.all([
    Teacher.findAll({
      where: { school_id },
      include: [
        {
          model: User,
          required: true,
          attributes: ["id", "username", "name", "is_active"],
        },
      ],
      order: [[User, "username", "ASC"]],
    }),
    Class.findAll({
      where: classWhere,
      include: [
        {
          model: Teacher,
          required: false,
          attributes: ["id", "user_id", "approval_status", "is_active"],
          include: [
            {
              model: User,
              required: true,
              attributes: ["id", "username", "name", "is_active"],
            },
          ],
        },
        {
          model: Section,
          required: Boolean(filterSection),
          where: filterSection ? sectionWhere : undefined,
          attributes: ["id", "name", "is_active"],
          include: [
            {
              model: Student,
              required: false,
              where: { school_id },
              attributes: [
                "id",
                "class_id",
                "section_id",
                "roll_no",
                "admission_no",
                "approval_status",
                "is_active",
              ],
              include: [
                {
                  model: User,
                  required: true,
                  attributes: ["id", "username", "name", "is_active"],
                },
              ],
            },
          ],
        },
      ],
      order: [["class_name", "ASC"]],
    }),
  ]);

  return { teachers, classes };
};
