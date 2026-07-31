import { Op } from "sequelize";
import db from "../../config/db.js";
import User from "../users/user.model.js";
import Teacher from "./teacher.model.js";
import AppError from "../../shared/appError.js";
import { getPagination } from "../../shared/utils/pagination.js";
import { cleanTo10Digits } from "../../shared/utils/phoneUtils.js";
import { buildTeacherSearchWhere } from "../../shared/utils/searchHelpers.js";

/* =========================
   ADMIN: CREATE TEACHER
========================= */
export const createTeacherService = async ({
  school_id,
  name,
  email,
  phone,
  gender,
  designation,
  qualification,
  joining_date,
  experience,
}) => {
  return db.transaction(async (t) => {
    /**
     * 1️⃣ Get next serial (school-level)
     */
    const count = await Teacher.count({
      where: { school_id },
      transaction: t,
    });

    let serial = count + 1;
    let username = "";
    let isUnique = false;

    while (!isUnique) {
      username = `T${String(serial).padStart(5, "0")}`;
      const exists = await User.findOne({
        where: { school_id, username },
        transaction: t,
      });
      if (!exists) {
        isUnique = true;
      } else {
        serial++;
      }
    }

    const password = `${username}@123`;

    /**
     * 3️⃣ Create user
     */
    const user = await User.create(
      {
        role: "teacher",
        school_id,
        username,
        password,
        first_login: true,
        must_change_password: true,
        is_active: true,
        name: name || "Teacher",
        email: email || null,
        phone: phone ? cleanTo10Digits(phone) : null,
      },
      { transaction: t }
    );

    /**
     * 4️⃣ Create teacher profile
     */
    const teacher = await Teacher.create(
      {
        user_id: user.id,
        school_id,
        employee_id: username,
        gender: gender || null,
        designation: designation || null,
        qualification: qualification || null,
        joining_date: joining_date || new Date(),
        experience: experience || null,
        approval_status: "pending",
        is_active: true,
      },
      { transaction: t }
    );

    /**
     * 5️⃣ Return admin-safe response
     */
    return {
      teacher_id: teacher.id,
      username,
      password,
      employee_id: teacher.employee_id,
      password_hint: "username@123",
    };
  });
};
/* =========================
   ADMIN: LIST TEACHERS
========================= */

export const listTeachersService = async ({ school_id, query }) => {
  const { limit, offset } = getPagination(query);
  const where = { school_id };

  if (query?.status) {
    where.status = query.status;
  } else {
    where.status = "ACTIVE";
  }

  if (query?.approval_status) {
    where.approval_status = query.approval_status;
  } else {
    where.approval_status = "approved";
  }

  const searchCond = buildTeacherSearchWhere(query?.search);
  if (searchCond) {
    where[Op.or] = searchCond;
  }

  return Teacher.findAndCountAll({
    where,
    limit,
    offset,
    distinct: true,
    subQuery: false,
    include: [
      {
        model: User,
        attributes: ["id", "username", "name", "avatar_url", "is_active"],
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

/* =========================
   ADMIN: OPTIONS (DROPDOWN)
========================= */
export const listTeacherOptionsService = async ({ school_id }) => {
  return Teacher.findAll({
    where: { school_id, status: "ACTIVE", approval_status: "approved" },
    include: [
      {
        model: User,
        attributes: ["id", "username", "name", "avatar_url", "is_active"],
      },
    ],
    attributes: ["id", "user_id", "employee_id", "approval_status", "is_active"],
    order: [[User, "username", "ASC"]],
  });
};

/* =========================
   ADMIN: STATUS
========================= */
export const updateTeacherStatusService = async ({
  teacher_id,
  status,
  is_active,
  school_id,
}) => {
  const teacher = await Teacher.findOne({
    where: { id: teacher_id, school_id },
  });

  if (!teacher) {
    throw new AppError("Teacher not found", 404);
  }

  return db.transaction(async (t) => {
    if (status !== undefined) {
      teacher.status = status;
      teacher.is_active = status === "ACTIVE";

      if (status !== "ACTIVE") {
        if (db.models.teacher_assignment) {
          await db.models.teacher_assignment.update(
            { is_active: false, is_class_teacher: false },
            { where: { teacher_id, school_id }, transaction: t }
          );
        }
      }
    } else if (is_active !== undefined) {
      teacher.is_active = is_active;
      if (!is_active) {
        if (db.models.teacher_assignment) {
          await db.models.teacher_assignment.update(
            { is_active: false, is_class_teacher: false },
            { where: { teacher_id, school_id }, transaction: t }
          );
        }
      }
    }
    await teacher.save({ transaction: t });

    await User.update(
      { is_active: teacher.is_active },
      { where: { id: teacher.user_id }, transaction: t }
    );

    return teacher;
  });
};
