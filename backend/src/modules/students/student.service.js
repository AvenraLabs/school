import { Op } from "sequelize";
import User from "../users/user.model.js";
import Student from "./student.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import TeacherAssignment from "../teacher-assignments/teacher-assignment.model.js";
import AppError from "../../shared/appError.js";
import { getPagination } from "../../shared/utils/pagination.js";
import db from "../../config/db.js";
import { cleanTo10Digits } from "../../shared/utils/phoneUtils.js";
import { buildStudentSearchWhere } from "../../shared/utils/searchHelpers.js";

/* =========================
   ADMIN:  CREATE STDUENT
========================= */
export const createStudentService = async ({
  school_id,
  class_id,
  section_id,
  name,
  email,
  phone,
  dob,
  gender,
  blood_group,
  father_name,
  mother_name,
  guardian_name,
  guardian_phone,
  address,
  aadhar_no,
  admission_no,
}) => {
  if (!section_id || !class_id) {
    throw new AppError("class_id and section_id are required", 400);
  }

  return db.transaction(async (t) => {
    /**
     * 1️⃣ Validate section
     */
    const section = await Section.findOne({
      where: {
        id: section_id,
        class_id,
        school_id,
        is_active: true,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!section) {
      throw new AppError("Section not found or inactive", 404);
    }

    /**
     * 2️⃣ Generate serial (school-level, consistent with bulk)
     */
    const baseSerial = await Student.count({
      where: { school_id },
      transaction: t,
    });

    let serial = baseSerial + 1;
    let username = "";
    let isUnique = false;

    while (!isUnique) {
      username = `S${String(serial).padStart(5, "0")}`;
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
     * 4️⃣ Create user
     */
    const user = await User.create(
      {
        role: "student",
        school_id,
        username,
        password,
        first_login: true,
        is_active: true,
        name: name || "Student",
        email: email || null,
        phone: phone ? cleanTo10Digits(phone) : null,
      },
      { transaction: t }
    );

    /**
     * 5️⃣ Create student profile
     */
    const student = await Student.create(
      {
        user_id: user.id,
        school_id,
        class_id,
        section_id,
        admission_no: admission_no || `ADM-${username}`,
        dob: dob || null,
        gender: gender || null,
        father_name: father_name || null,
        mother_name: mother_name || null,
        guardian_name: guardian_name || null,
        guardian_phone: guardian_phone ? cleanTo10Digits(guardian_phone) : null,
        address: address || null,
        blood_group: blood_group || null,
        aadhar_no: aadhar_no || null,
        approval_status: "pending",
        is_active: true,
      },
      { transaction: t }
    );

    // Auto-assign active class fees for mid-year admissions
    try {
      const { autoAssignStudentFeesService } = await import("../fees/fee.service.js");
      await autoAssignStudentFeesService(school_id, student.id, class_id, t);
    } catch {
      // quiet if academic year not yet configured
    }



    /**
     * 6️⃣ Return credential response for UI display
     */
    return {
      student_id: student.id,
      username,
      password: password,
      class_id,
      section_id,
      admission_no: student.admission_no,
      password_hint: "username@123",
    };
  });
};
/* =========================
   ADMIN: LIST
========================= */


export const listStudentsService = async ({ school_id, query }) => {
  const { limit, offset } = getPagination(query);
  const where = { school_id };

  if (query?.class_id) where.class_id = Number(query.class_id);
  if (query?.section_id) where.section_id = Number(query.section_id);

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

  const searchCond = buildStudentSearchWhere(query?.search);
  if (searchCond) {
    where[Op.or] = searchCond;
  }

  return Student.findAndCountAll({
    where,
    limit,
    offset,
    distinct: true,
    subQuery: false,
    include: [
      { model: User, attributes: ["id", "username", "name", "phone", "avatar_url", "is_active"] },
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
    ],
    order: [["created_at", "DESC"]],
  });
};

/* =========================
   ADMIN: OPTIONS (DROPDOWN)
========================= */
export const listStudentOptionsService = async ({ school_id, query }) => {
  const where = { school_id };

  if (query?.class_id) where.class_id = Number(query.class_id);
  if (query?.section_id) where.section_id = Number(query.section_id);

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

  return Student.findAll({
    where,
    include: [
      { model: User, attributes: ["id", "username", "name", "avatar_url", "is_active"] },
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
    ],
    attributes: ["id", "class_id", "section_id", "roll_no", "admission_no"],
    order: [[User, "username", "ASC"]],
  });
};

// Teacher scoped students (by their assignments)
export const listStudentsForTeacherSectionService = async ({ user, query }) => {
  const assignments = await TeacherAssignment.findAll({
    where: { teacher_id: user.teacher_id, school_id: user.school_id, is_active: true },
    attributes: ["class_id", "section_id"],
  });

  const allowedSectionIds = [...new Set(assignments.map((a) => a.section_id))];
  const allowedClassIds = [...new Set(assignments.map((a) => a.class_id))];

  if (!allowedSectionIds.length) return [];

  const where = {
    school_id: user.school_id,
    section_id: allowedSectionIds,
    class_id: allowedClassIds,
  };

  if (query?.class_id) where.class_id = Number(query.class_id);
  if (query?.section_id) where.section_id = Number(query.section_id);

  const students = await Student.findAll({
    where,
    include: [
      { model: User, attributes: ["id", "username", "name", "avatar_url"] },
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
    ],
    attributes: ["id", "class_id", "section_id", "roll_no", "admission_no"],
    order: [[User, "username", "ASC"]],
  });

  return students;
};

/* =========================
   ADMIN: MOVE
========================= */
export const moveStudentService = async ({
  student_id,
  section_id,
  school_id,
}) => {
  const student = await Student.findOne({
    where: { id: student_id, school_id },
  });
  if (!student) throw new AppError("Student not found", 404);

  student.section_id = section_id;
  await student.save();
  return student;
};

/* =========================
   ADMIN: STATUS
========================= */
export const updateStudentStatusService = async ({
  school_id,
  student_id,
  status,
  reason = null,
}) => {
  const student = await Student.findOne({
    where: { id: student_id, school_id },
  });
  if (!student) throw new AppError("Student not found", 404);

  const isActive = status === "ACTIVE";

  return db.transaction(async (t) => {
    student.status = status;
    student.is_active = isActive;
    await student.save({ transaction: t });

    await User.update(
      { is_active: isActive },
      { where: { id: student.user_id }, transaction: t }
    );

    if (!isActive) {
      if (db.models.student_transport) {
        await db.models.student_transport.update(
          { is_active: false },
          { where: { student_id, school_id }, transaction: t }
        );
      }
      if (db.models.student_fee_ledger) {
        await db.models.student_fee_ledger.update(
          { status: "frozen" },
          { where: { student_id, school_id }, transaction: t }
        );
      }
    }

    return student;
  });
};


//Bulk student update to sections

export const assignStudentsToSectionService = async ({
  school_id,
  target_class_id,
  target_section_id,
  students,
}) => {
  return db.transaction(async (t) => {
    // 1. Validate class
    const cls = await Class.findOne({
      where: { id: target_class_id, school_id },
      transaction: t,
    });

    if (!cls) {
      return { error: "CLASS_NOT_FOUND" };
    }

    // 2. Validate section
    const section = await Section.findOne({
      where: {
        id: target_section_id,
        class_id: target_class_id,
        school_id,
        is_active: true,
      },
      transaction: t,
    });

    if (!section) {
      return { error: "SECTION_NOT_FOUND" };
    }

    // Update students
    for (const s of students) {
      await Student.update(
        {
          class_id: target_class_id,
          section_id: target_section_id,
          roll_no: s.roll_no,
        },
        {
          where: {
            id: s.student_id,
            school_id,
          },
          transaction: t,
        }
      );
    }

    return { success: true };
  });
};


