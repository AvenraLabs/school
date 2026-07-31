import Subject from "./subject.model.js";
import ClassSubject from "./class-subject.model.js";
import SectionSubjectOverride from "./section-subject-override.model.js";
import { getSubjectsForSection } from "./subject-resolution.service.js";
import db from "../../config/db.js";

/* =========================
   CREATE SUBJECT
========================= */
export const createSubjectService = async ({
    school_id,
    name,
    code,
    category,
    subject_type,
}) => {
    const normalizedName = name.trim();

    const exists = await Subject.findOne({
        where: { school_id, name: normalizedName },
    });

    if (exists) {
        return { error: "SUBJECT_EXISTS" };
    }

    const subject = await Subject.create({
        school_id,
        name: normalizedName,
        code: code ? code.trim().toUpperCase() : null,
        category,
        subject_type,
    });

    return { subject };
};

/* =========================
   GET ALL SUBJECTS
========================= */
export const getAllSubjectsService = async ({ school_id }) => {
    return Subject.findAndCountAll({
        where: { school_id },
        order: [["name", "ASC"]],
    });
};

/* =========================
   UPDATE SUBJECT
========================= */
export const updateSubjectService = async ({
    school_id,
    subject_id,
    updates,
}) => {
    const subject = await Subject.findOne({
        where: { id: subject_id, school_id },
    });

    if (!subject) {
        return { error: "SUBJECT_NOT_FOUND" };
    }

    if (updates.name && updates.name.trim() !== subject.name) {
        const exists = await Subject.findOne({
            where: { school_id, name: updates.name.trim() },
        });

        if (exists) {
            return { error: "SUBJECT_EXISTS" };
        }
    }

    if (updates.name) subject.name = updates.name.trim();
    if (updates.code) subject.code = updates.code.trim().toUpperCase();
    if (updates.category) subject.category = updates.category;
    if (updates.subject_type) subject.subject_type = updates.subject_type;

    await subject.save();

    return { subject };
};

/* =========================
   DELETE SUBJECT
========================= */
export const deleteSubjectService = async ({ school_id, subject_id }) => {
    const subject = await Subject.findOne({
        where: { id: subject_id, school_id },
    });

    if (!subject) {
        return { error: "SUBJECT_NOT_FOUND" };
    }

    await subject.destroy();
    return { success: true };
};

/* ============================================================
   CLASS SUBJECT MAPPING
   — Get / replace the default subject set for a class
============================================================ */

/**
 * Returns all subjects assigned to a class (the default subject pool).
 */
export const getClassSubjectsService = async (school_id, class_id) => {
    const rows = await ClassSubject.findAll({
        where: { school_id, class_id, is_active: true },
        include: [{ model: Subject, attributes: ["id", "name", "code", "category", "subject_type"] }],
        order: [[Subject, "name", "ASC"]],
    });
    return rows.map((r) => {
        if (!r.subject) return null;
        const plainSub = r.subject.toJSON ? r.subject.toJSON() : { ...r.subject };
        return {
            ...plainSub,
            periods_per_week: r.periods_per_week ?? null,
        };
    }).filter(Boolean);
};

/**
 * Replaces the default subject set for a class.
 * Pass subject_ids = [] to clear all subjects for the class.
 */
export const setClassSubjectsService = async (school_id, class_id, subject_ids) => {
    return db.transaction(async (t) => {
        // Delete existing rows
        await ClassSubject.destroy({
            where: { school_id, class_id },
            transaction: t,
        });

        if (subject_ids.length > 0) {
            const rows = subject_ids.map((subject_id) => ({
                school_id,
                class_id,
                subject_id,
                is_active: true,
            }));
            await ClassSubject.bulkCreate(rows, { transaction: t });
        }

        return { success: true, count: subject_ids.length };
    });
};

/* ============================================================
   SECTION SUBJECT OVERRIDES
   — Get / replace per-section deltas (for streams / different curricula)
============================================================ */

/**
 * Returns the raw override rows for a specific section (not yet resolved against class default).
 */
export const getSectionOverridesService = async (school_id, class_id, section_id) => {
    const rows = await SectionSubjectOverride.findAll({
        where: { school_id, class_id, section_id },
        include: [{ model: Subject, attributes: ["id", "name", "code", "category"] }],
    });
    return rows.map((r) => ({
        subject_id: r.subject_id,
        subject: r.subject,
        is_included: r.is_included,
    }));
};

/**
 * Replaces the override rows for a specific section.
 * Pass overrides = [] to clear all overrides (section reverts to class default).
 * Each override: { subject_id: number, is_included: boolean }
 */
export const setSectionOverridesService = async (school_id, class_id, section_id, overrides) => {
    return db.transaction(async (t) => {
        await SectionSubjectOverride.destroy({
            where: { school_id, class_id, section_id },
            transaction: t,
        });

        if (overrides.length > 0) {
            const rows = overrides.map(({ subject_id, is_included }) => ({
                school_id,
                class_id,
                section_id,
                subject_id,
                is_included,
            }));
            await SectionSubjectOverride.bulkCreate(rows, { transaction: t });
        }

        return { success: true, count: overrides.length };
    });
};

/**
 * Bulk updates periods_per_week for subjects in a class or section.
 */
export const saveSubjectPeriodsService = async ({ school_id, class_id, section_id, periods }) => {
  return db.transaction(async (t) => {
    if (section_id) {
      for (const item of periods) {
        const [override, created] = await SectionSubjectOverride.findOrCreate({
          where: {
            school_id,
            class_id,
            section_id,
            subject_id: item.subject_id,
          },
          defaults: {
            is_included: true,
            periods_per_week: item.periods_per_week,
          },
          transaction: t,
        });

        if (!created) {
          await override.update(
            { periods_per_week: item.periods_per_week },
            { transaction: t }
          );
        }
      }
    } else {
      for (const item of periods) {
        await ClassSubject.update(
          { periods_per_week: item.periods_per_week },
          {
            where: { school_id, class_id, subject_id: item.subject_id },
            transaction: t,
          }
        );
      }
    }
    return { success: true, count: periods.length };
  });
};

/**
 * Returns the fully resolved subject list for a section.
 * Uses the resolution function: class default + section overrides.
 */
export { getSubjectsForSection };

