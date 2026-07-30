import Subject from "./subject.model.js";
import ClassSubject from "./class-subject.model.js";
import SectionSubjectOverride from "./section-subject-override.model.js";

/**
 * Resolves the effective subject list for a specific class section.
 *
 * Resolution rules (in priority order):
 * 1. If a section_subject_override row exists for (school_id, class_id, section_id, subject_id):
 *    - is_included = true  → subject IS in this section's list
 *    - is_included = false → subject is NOT in this section's list
 * 2. Otherwise, fall back to class_subjects default (is_active = true)
 *
 * This means:
 * - A school with no overrides configured gets the class default for every section (no extra work)
 * - A school with streams (e.g. 12-A Science, 12-B Commerce) sets only the delta rows
 *
 * @param {number} school_id
 * @param {number} class_id
 * @param {number} section_id
 * @returns {Promise<Subject[]>} Resolved subjects sorted by name
 */
export const getSubjectsForSection = async (school_id, class_id, section_id) => {
  // 1. Fetch class-level default subjects (with full Subject data)
  const classSubjectRows = await ClassSubject.findAll({
    where: { school_id, class_id, is_active: true },
    include: [{ model: Subject, attributes: ["id", "name", "code", "category"] }],
  });

  // 2. Fetch section-level overrides
  const overrideRows = await SectionSubjectOverride.findAll({
    where: { school_id, class_id, section_id },
    include: [{ model: Subject, attributes: ["id", "name", "code", "category"] }],
  });

  // Build override map: subject_id → is_included
  const overrideMap = {};
  for (const row of overrideRows) {
    overrideMap[String(row.subject_id)] = row.is_included;
  }

  // 3. Start with class default set, apply exclusion overrides
  const resolvedSubjects = [];
  const resolvedSubjectIds = new Set();

  for (const cs of classSubjectRows) {
    const subjectId = String(cs.subject_id);
    if (overrideMap[subjectId] === false) {
      // Explicitly excluded by section override
      continue;
    }
    if (cs.subject) {
      resolvedSubjects.push(cs.subject);
      resolvedSubjectIds.add(subjectId);
    }
  }

  // 4. Add any subjects included via override that aren't already in class default
  for (const row of overrideRows) {
    if (row.is_included === true && !resolvedSubjectIds.has(String(row.subject_id)) && row.subject) {
      resolvedSubjects.push(row.subject);
    }
  }

  // 5. Sort alphabetically by name
  resolvedSubjects.sort((a, b) => a.name.localeCompare(b.name));

  return resolvedSubjects;
};
