import db from "../../config/db.js";
import Family from "./family.model.js";
import Student from "./student.model.js";
import User from "../users/user.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import AppError from "../../shared/appError.js";
import { getPagination } from "../../shared/utils/pagination.js";

/* =========================
   HELPER: student include
========================= */
const studentInclude = [
  { model: User, attributes: ["id", "name", "username", "is_active"] },
  { model: Class, attributes: ["id", "class_name"] },
  { model: Section, attributes: ["id", "name"] },
];

/* =========================
   LIST FAMILIES
========================= */
export const listFamiliesService = async ({ school_id, query }) => {
  const { limit, offset } = getPagination(query);

  return Family.findAndCountAll({
    where: { school_id },
    include: [
      {
        model: Student,
        include: studentInclude,
        attributes: ["id", "admission_no", "roll_no", "class_id", "section_id"],
        required: false,
      },
    ],
    limit,
    offset,
    distinct: true,
    order: [["created_at", "DESC"]],
  });
};

/* =========================
   CREATE FAMILY
========================= */
export const createFamilyService = async ({
  school_id,
  father_name,
  mother_name,
  guardian_phone,
  address,
  student_ids = [],
}) => {
  return db.transaction(async (t) => {
    // Check if a family with same guardian_phone already exists in this school
    if (guardian_phone) {
      const existing = await Family.findOne({
        where: { school_id, guardian_phone },
        transaction: t,
      });
      if (existing) {
        throw new AppError(
          "A family with this guardian phone already exists. Use update to add members.",
          409
        );
      }
    }

    const family = await Family.create(
      { school_id, father_name, mother_name, guardian_phone, address },
      { transaction: t }
    );

    // Link provided students
    if (student_ids.length > 0) {
      await Student.update(
        { family_id: family.id },
        { where: { id: student_ids, school_id }, transaction: t }
      );
    }

    return family;
  });
};

/* =========================
   UPDATE FAMILY
========================= */
export const updateFamilyService = async ({
  family_id,
  school_id,
  father_name,
  mother_name,
  guardian_phone,
  address,
}) => {
  const family = await Family.findOne({ where: { id: family_id, school_id } });
  if (!family) throw new AppError("Family not found", 404);

  // Check duplicate phone if changing
  if (guardian_phone && guardian_phone !== family.guardian_phone) {
    const existing = await Family.findOne({
      where: { school_id, guardian_phone },
    });
    if (existing && existing.id !== family.id) {
      throw new AppError("Another family with this guardian phone exists", 409);
    }
  }

  await family.update({ father_name, mother_name, guardian_phone, address });
  return family;
};

/* =========================
   ADD STUDENT TO FAMILY
========================= */
export const addStudentToFamilyService = async ({
  family_id,
  student_id,
  school_id,
}) => {
  const family = await Family.findOne({ where: { id: family_id, school_id } });
  if (!family) throw new AppError("Family not found", 404);

  const student = await Student.findOne({ where: { id: student_id, school_id } });
  if (!student) throw new AppError("Student not found", 404);

  await student.update({ family_id });
  return { family_id, student_id };
};

/* =========================
   REMOVE STUDENT FROM FAMILY
========================= */
export const removeStudentFromFamilyService = async ({
  family_id,
  student_id,
  school_id,
}) => {
  const student = await Student.findOne({
    where: { id: student_id, school_id, family_id },
  });
  if (!student) throw new AppError("Student not in this family", 404);

  await student.update({ family_id: null });
  return { family_id, student_id };
};

/* =========================
   AUTO-LINK BY GUARDIAN PHONE
   Used internally when creating students
========================= */
export const autoLinkFamilyByPhone = async ({
  school_id,
  guardian_phone,
  student_id,
  father_name,
  mother_name,
  address,
  transaction,
}) => {
  if (!guardian_phone) return null;

  // Find existing family with same phone in this school
  let family = await Family.findOne({
    where: { school_id, guardian_phone },
    transaction,
  });

  if (!family) {
    // Create a new family
    family = await Family.create(
      {
        school_id,
        guardian_phone,
        father_name: father_name || null,
        mother_name: mother_name || null,
        address: address || null,
      },
      { transaction }
    );
  }

  // Link student to this family
  await Student.update(
    { family_id: family.id },
    { where: { id: student_id }, transaction }
  );

  return family;
};

/* =========================
   GET SIBLINGS (by family_id)
========================= */
export const getSiblingsService = async ({ student_id, school_id }) => {
  const student = await Student.findOne({
    where: { id: student_id, school_id },
    attributes: ["id", "family_id"],
  });

  if (!student || !student.family_id) return [];

  const siblings = await Student.findAll({
    where: { family_id: student.family_id, school_id },
    include: [
      { model: User, attributes: ["id", "name", "username", "is_active"] },
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
    ],
    attributes: ["id", "admission_no", "class_id", "section_id"],
  });

  return siblings;
};
