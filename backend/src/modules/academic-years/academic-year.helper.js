import AcademicYear from "./academic-year.model.js";

/**
 * Resolves the current active academic year record for a school.
 * Throws an error if no active year is found.
 */
export const getCurrentAcademicYear = async (schoolId) => {
  const currentYear = await AcademicYear.findOne({
    where: { school_id: schoolId, is_current: true },
  });
  if (!currentYear) {
    throw new Error(`Current academic year not configured for school ${schoolId}`);
  }
  return currentYear;
};

/**
 * Resolves the ID of the current active academic year for a school.
 */
export const getCurrentAcademicYearId = async (schoolId) => {
  const currentYear = await getCurrentAcademicYear(schoolId);
  return currentYear.id;
};

