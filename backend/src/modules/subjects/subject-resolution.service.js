import Subject from "./subject.model.js";
import ClassSubject from "./class-subject.model.js";
import SectionSubjectOverride from "./section-subject-override.model.js";

/**
 * Resolves the effective subject list for a specific class section,
 * including periods_per_week (override > class_subject priority).
 *
 * @param {number} school_id
 * @param {number} class_id
 * @param {number} section_id
 * @returns {Promise<Array>} Resolved subject objects with effective periods_per_week and subject_type
 */
export const getSubjectsForSection = async (school_id, class_id, section_id) => {
  // 1. Fetch class-level default subjects
  const classSubjectRows = await ClassSubject.findAll({
    where: { school_id, class_id, is_active: true },
    include: [{ model: Subject, attributes: ["id", "name", "code", "category", "subject_type"] }],
  });

  // 2. Fetch section-level overrides
  const overrideRows = await SectionSubjectOverride.findAll({
    where: { school_id, class_id, section_id },
    include: [{ model: Subject, attributes: ["id", "name", "code", "category", "subject_type"] }],
  });

  // Build override map: subject_id → row
  const overrideMap = {};
  for (const row of overrideRows) {
    overrideMap[String(row.subject_id)] = row;
  }

  const resolvedSubjects = [];
  const resolvedSubjectIds = new Set();

  // 3. Start with class default set, apply section overrides
  for (const cs of classSubjectRows) {
    const subjectId = String(cs.subject_id);
    const override = overrideMap[subjectId];

    if (override && override.is_included === false) {
      // Explicitly excluded by section override
      continue;
    }

    if (cs.subject) {
      const plainSubject = cs.subject.toJSON ? cs.subject.toJSON() : { ...cs.subject };
      // Priority: section_subject_override.periods_per_week > class_subject.periods_per_week
      const effectivePeriods =
        override && override.periods_per_week !== null && override.periods_per_week !== undefined
          ? override.periods_per_week
          : cs.periods_per_week ?? null;

      plainSubject.periods_per_week = effectivePeriods;
      resolvedSubjects.push(plainSubject);
      resolvedSubjectIds.add(subjectId);
    }
  }

  // 4. Add any subjects explicitly included via override that aren't in class default
  for (const row of overrideRows) {
    const subjectId = String(row.subject_id);
    if (row.is_included === true && !resolvedSubjectIds.has(subjectId) && row.subject) {
      const plainSubject = row.subject.toJSON ? row.subject.toJSON() : { ...row.subject };
      plainSubject.periods_per_week = row.periods_per_week ?? null;
      resolvedSubjects.push(plainSubject);
    }
  }

  // 5. Sort alphabetically by name
  resolvedSubjects.sort((a, b) => a.name.localeCompare(b.name));

  return resolvedSubjects;
};
