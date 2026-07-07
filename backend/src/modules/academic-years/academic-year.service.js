import AcademicYear from "./academic-year.model.js";
import Student from "../students/student.model.js";
import StudentEnrollment from "../students/student-enrollment.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import User from "../users/user.model.js";
import db from "../../config/db.js";
import AppError from "../../shared/appError.js";

/**
 * Auto-resolve the next class name
 */
const getNextClassName = (currentName) => {
  const nameLower = currentName.toLowerCase().trim();
  if (nameLower.includes("lkg")) return currentName.replace(/lkg/i, "UKG");
  if (nameLower.includes("ukg")) return currentName.replace(/ukg/i, "Class 1");
  if (nameLower.includes("nursery")) return currentName.replace(/nursery/i, "LKG");

  const match = currentName.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (num === 12) return "Graduated";
    const nextNum = num + 1;
    return currentName.replace(String(num), String(nextNum));
  }
  return null;
};

/**
 * LIST ACADEMIC YEARS
 */
export const listAcademicYearsService = async (school_id) => {
  return AcademicYear.findAll({
    where: { school_id },
    order: [["start_date", "DESC"]],
  });
};

/**
 * CREATE ACADEMIC YEAR
 */
export const createAcademicYearService = async (school_id, { name, start_date, end_date }) => {
  const exists = await AcademicYear.findOne({
    where: { school_id, name },
  });
  if (exists) throw new AppError("Academic year name already exists", 400);

  return AcademicYear.create({
    school_id,
    name,
    start_date,
    end_date,
    is_current: false,
  });
};

/**
 * SET CURRENT ACADEMIC YEAR
 */
export const setCurrentAcademicYearService = async (school_id, academic_year_id) => {
  return db.transaction(async (t) => {
    const target = await AcademicYear.findOne({
      where: { id: academic_year_id, school_id },
      transaction: t,
    });
    if (!target) throw new AppError("Academic year not found", 404);

    // Set all others to false
    await AcademicYear.update(
      { is_current: false },
      { where: { school_id }, transaction: t }
    );

    // Set target to true
    target.is_current = true;
    await target.save({ transaction: t });

    return target;
  });
};

/**
 * GET PROMOTION PREVIEW / REPORT
 */
export const getPromotionPreviewService = async (school_id, { repeat_student_ids = [] }) => {
  // 1. Get active academic year
  const currentYear = await AcademicYear.findOne({
    where: { school_id, is_current: true },
  });
  if (!currentYear) throw new AppError("Current academic year is not configured", 400);

  // 2. Fetch all active, approved students
  const students = await Student.findAll({
    where: { school_id, status: "ACTIVE", approval_status: "approved" },
    include: [
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
      { model: User, attributes: ["name"] },
    ],
  });

  // 3. Fetch all classes and sections in school for target matching lookup
  const allClasses = await Class.findAll({
    where: { school_id, is_active: true },
    include: [{ model: Section, where: { is_active: true }, required: false }],
  });

  const repeatSet = new Set(repeat_student_ids.map(String));

  // Totals Counters
  let totalActive = students.length;
  let totalPromoted = 0;
  let totalGraduating = 0;
  let totalRepeating = 0;

  // We also track transferred, dropped count of school
  const [transferredCount, droppedCount] = await Promise.all([
    Student.count({ where: { school_id, status: "TRANSFERRED" } }),
    Student.count({ where: { school_id, status: "DROPPED" } }),
  ]);

  const transitions = {}; // Key: "Class X -> Class Y", Value: { count, hasError, targetClassId, targetSectionId }
  const errors = [];

  for (const student of students) {
    const classId = student.class_id;
    const sectionId = student.section_id;
    const currentClassName = student.class?.class_name || "Unknown";
    const currentSectionName = student.section?.name || "A";

    const isRepeating = repeatSet.has(String(student.id));

    if (isRepeating) {
      totalRepeating++;
      const key = `${currentClassName}-${currentSectionName} (Repeat)`;
      if (!transitions[key]) {
        transitions[key] = {
          fromClass: currentClassName,
          fromSection: currentSectionName,
          toClass: currentClassName,
          toSection: currentSectionName,
          count: 0,
          isRepeat: true,
          hasError: false,
        };
      }
      transitions[key].count++;
      continue;
    }

    const nextClassName = getNextClassName(currentClassName);

    if (nextClassName === "Graduated") {
      totalGraduating++;
      const key = `${currentClassName}-${currentSectionName} → Graduated`;
      if (!transitions[key]) {
        transitions[key] = {
          fromClass: currentClassName,
          fromSection: currentSectionName,
          toClass: "Graduated",
          toSection: "—",
          count: 0,
          isGraduation: true,
          hasError: false,
        };
      }
      transitions[key].count++;
    } else if (nextClassName) {
      // Find matching target class and section
      const targetClass = allClasses.find(
        (c) => c.class_name.toLowerCase().trim() === nextClassName.toLowerCase().trim()
      );
      const targetSection = targetClass?.sections?.find(
        (s) => s.name.toLowerCase().trim() === currentSectionName.toLowerCase().trim()
      );

      const hasError = !targetClass || !targetSection;
      if (hasError) {
        errors.push(`Target section mapping missing for ${currentClassName} ${currentSectionName} &rarr; ${nextClassName} ${currentSectionName}`);
      }

      totalPromoted++;
      const key = `${currentClassName}-${currentSectionName} → ${nextClassName}-${currentSectionName}`;
      if (!transitions[key]) {
        transitions[key] = {
          fromClass: currentClassName,
          fromSection: currentSectionName,
          toClass: nextClassName,
          toSection: currentSectionName,
          count: 0,
          hasError,
          errorMsg: hasError ? "Section mapping missing" : null,
        };
      }
      transitions[key].count++;
    } else {
      errors.push(`Could not determine next class for ${currentClassName}`);
    }
  }

  return {
    current_year: currentYear.name,
    totals: {
      total_active: totalActive,
      promoted: totalPromoted,
      graduating: totalGraduating,
      repeating: totalRepeating,
      transferred: transferredCount,
      dropped: droppedCount,
    },
    transitions: Object.values(transitions),
    errors,
    isValid: errors.length === 0,
  };
};

/**
 * TRANSACTIONAL ACADEMIC YEAR PROMOTION WIZARD
 */
export const promoteAcademicYearService = async (
  school_id,
  { next_year_name, start_date, end_date, repeat_student_ids = [] }
) => {
  return db.transaction(async (t) => {
    // 1. Validate that the new academic year name does not already exist
    const exists = await AcademicYear.findOne({
      where: { school_id, name: next_year_name },
      transaction: t,
    });
    if (exists) throw new AppError(`Academic year '${next_year_name}' already exists`, 400);

    // 2. Fetch current year
    const currentYear = await AcademicYear.findOne({
      where: { school_id, is_current: true },
      transaction: t,
    });
    if (!currentYear) throw new AppError("Current active academic year not found", 400);

    // 3. Fetch active students
    const students = await Student.findAll({
      where: { school_id, status: "ACTIVE", approval_status: "approved" },
      include: [
        { model: Class, attributes: ["id", "class_name"] },
        { model: Section, attributes: ["id", "name"] },
      ],
      transaction: t,
    });

    // 4. Fetch all active classes & sections for mapping verification
    const allClasses = await Class.findAll({
      where: { school_id, is_active: true },
      include: [{ model: Section, where: { is_active: true }, required: false }],
      transaction: t,
    });

    const repeatSet = new Set(repeat_student_ids.map(String));

    // Validate mappings first (No auto-creation allowed)
    for (const student of students) {
      const isRepeating = repeatSet.has(String(student.id));
      if (isRepeating) continue; // repeating stays in same class

      const currentClassName = student.class?.class_name;
      const currentSectionName = student.section?.name || "A";
      const nextClassName = getNextClassName(currentClassName);

      if (nextClassName && nextClassName !== "Graduated") {
        const targetClass = allClasses.find(
          (c) => c.class_name.toLowerCase().trim() === nextClassName.toLowerCase().trim()
        );
        const targetSection = targetClass?.sections?.find(
          (s) => s.name.toLowerCase().trim() === currentSectionName.toLowerCase().trim()
        );

        if (!targetClass || !targetSection) {
          throw new AppError(
            `Section mapping missing for ${currentClassName} ${currentSectionName} &rarr; ${nextClassName} ${currentSectionName}. Please configure before continuing.`,
            400
          );
        }
      }
    }

    // 5. Create new academic year
    const nextYear = await AcademicYear.create(
      {
        school_id,
        name: next_year_name,
        start_date,
        end_date,
        is_current: false, // will toggle at the end
      },
      { transaction: t }
    );

    // 6. Process each student
    for (const student of students) {
      const isRepeating = repeatSet.has(String(student.id));

      if (isRepeating) {
        // Create placement record in new academic year for current class
        await StudentEnrollment.create(
          {
            student_id: student.id,
            academic_year_id: nextYear.id,
            class_id: student.class_id,
            section_id: student.section_id,
            roll_no: student.roll_no, // preserved
          },
          { transaction: t }
        );
        // Student class & section remain unchanged
      } else {
        const currentClassName = student.class?.class_name;
        const currentSectionName = student.section?.name || "A";
        const nextClassName = getNextClassName(currentClassName);

        if (nextClassName === "Graduated") {
          // Graduate the student in Student table (does not get enrollment placement in nextYear)
          await student.update(
            {
              status: "GRADUATED",
              is_active: false,
            },
            { transaction: t }
          );

          // Update user account too so they cannot login
          await User.update(
            { is_active: false },
            { where: { id: student.user_id }, transaction: t }
          );

          // Deactivate student transport
          if (db.models.student_transport) {
            await db.models.student_transport.update(
              { is_active: false },
              { where: { student_id: student.id, school_id }, transaction: t }
            );
          }
        } else if (nextClassName) {
          const targetClass = allClasses.find(
            (c) => c.class_name.toLowerCase().trim() === nextClassName.toLowerCase().trim()
          );
          const targetSection = targetClass?.sections?.find(
            (s) => s.name.toLowerCase().trim() === currentSectionName.toLowerCase().trim()
          );

          // Create placement record in the next academic year
          await StudentEnrollment.create(
            {
              student_id: student.id,
              academic_year_id: nextYear.id,
              class_id: targetClass.id,
              section_id: targetSection.id,
              roll_no: student.roll_no, // preserved
            },
            { transaction: t }
          );

          // Update Student model pointer to new class & section
          await student.update(
            {
              class_id: targetClass.id,
              section_id: targetSection.id,
            },
            { transaction: t }
          );
        }
      }
    }

    // 7. Toggle current academic year flags
    await AcademicYear.update(
      { is_current: false },
      { where: { school_id }, transaction: t }
    );
    await nextYear.update({ is_current: true }, { transaction: t });

    return {
      success: true,
      promoted_to_year: nextYear.name,
    };
  });
};
