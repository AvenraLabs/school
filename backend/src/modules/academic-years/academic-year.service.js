import AcademicYear from "./academic-year.model.js";
import Student from "../students/student.model.js";
import StudentEnrollment from "../students/student-enrollment.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import User from "../users/user.model.js";
import db from "../../config/db.js";
import AppError from "../../shared/appError.js";

const ROMAN_MAP = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10, xi: 11, xii: 12
};
const NUM_TO_ROMAN = {
  1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X", 11: "XI", 12: "XII"
};

/**
 * Auto-resolve the next class name with Roman Numeral & Digits support
 */
export const getNextClassName = (currentName) => {
  if (!currentName) return null;
  const nameTrimmed = currentName.trim();
  const nameLower = nameTrimmed.toLowerCase();

  if (nameLower.includes("nursery")) return nameTrimmed.replace(/nursery/i, "LKG");
  if (nameLower.includes("lkg")) return nameTrimmed.replace(/lkg/i, "UKG");
  if (nameLower.includes("ukg")) return nameTrimmed.replace(/ukg/i, "Class 1");

  // Check digits first (e.g., "Class 10" -> "Class 11", "12" -> "Graduated")
  const digitMatch = nameTrimmed.match(/\d+/);
  if (digitMatch) {
    const num = parseInt(digitMatch[0], 10);
    if (num >= 12) return "Graduated";
    const nextNum = num + 1;
    return nameTrimmed.replace(String(num), String(nextNum));
  }

  // Check Roman numerals (e.g., "Std X" -> "Std XI", "Class XII" -> "Graduated")
  const romanMatch = nameTrimmed.match(/\b(xii|xi|x|ix|viii|vii|vi|v|iv|iii|ii|i)\b/i);
  if (romanMatch) {
    const roman = romanMatch[0].toLowerCase();
    const num = ROMAN_MAP[roman];
    if (num) {
      if (num >= 12) return "Graduated";
      const nextRoman = NUM_TO_ROMAN[num + 1];
      return nameTrimmed.replace(new RegExp(`\\b${romanMatch[0]}\\b`, "i"), nextRoman);
    }
  }

  return null;
};

/**
 * LIST ACADEMIC YEARS
 */
export const listAcademicYearsService = async (school_id) => {
  const School = (await import("../schools/school.model.js")).default;
  const school = await School.findByPk(school_id, {
    attributes: ["promotion_wizard_enabled"]
  });

  const years = await AcademicYear.findAll({
    where: { school_id },
    order: [["start_date", "DESC"]],
  });

  return {
    years: years || [],
    promotion_wizard_enabled: school ? school.promotion_wizard_enabled : true
  };
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

    await AcademicYear.update(
      { is_current: false },
      { where: { school_id }, transaction: t }
    );

    target.is_current = true;
    await target.save({ transaction: t });

    return target;
  });
};

/**
 * GET PROMOTION PREVIEW / REPORT
 */
export const getPromotionPreviewService = async (school_id, { repeat_student_ids = [], custom_overrides = {} } = {}) => {
  const currentYear = await AcademicYear.findOne({
    where: { school_id, is_current: true },
  });
  if (!currentYear) throw new AppError("Current academic year is not configured", 400);

  const students = await Student.findAll({
    where: { school_id, status: "ACTIVE", approval_status: "approved" },
    include: [
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
      { model: User, attributes: ["name"] },
    ],
  });

  const allClasses = await Class.findAll({
    where: { school_id, is_active: true },
    include: [{ model: Section, where: { is_active: true }, required: false }],
  });

  const repeatSet = new Set(repeat_student_ids.map(String));

  let totalActive = students.length;
  let totalPromoted = 0;
  let totalGraduating = 0;
  let totalRepeating = 0;

  const [transferredCount, droppedCount] = await Promise.all([
    Student.count({ where: { school_id, status: "TRANSFERRED" } }),
    Student.count({ where: { school_id, status: "DROPPED" } }),
  ]);

  const transitions = {};
  const errors = [];

  for (const student of students) {
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

    // Check if admin passed a manual class/section override for this student
    const override = custom_overrides[student.id] || custom_overrides[String(student.id)];
    let nextClassName = override?.toClass || getNextClassName(currentClassName);

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
      const targetClass = allClasses.find(
        (c) => c.class_name.toLowerCase().trim() === nextClassName.toLowerCase().trim()
      );
      const classSections = targetClass?.sections || targetClass?.Sections || [];

      const targetSection = override?.toSection
        ? classSections.find((s) => s.name?.toLowerCase().trim() === override.toSection.toLowerCase().trim())
        : (classSections.find((s) => s.name?.toLowerCase().trim() === currentSectionName.toLowerCase().trim()) || classSections[0]);

      const hasError = !targetClass || !targetSection;
      if (hasError) {
        if (!targetClass) {
          errors.push(`Target class '${nextClassName}' does not exist. Please create Class '${nextClassName}' in Classes & Sections manager.`);
        } else if (!targetSection) {
          errors.push(`Target section '${currentSectionName}' missing in Class '${nextClassName}'. Please add a section to Class '${nextClassName}'.`);
        }
      }

      totalPromoted++;
      const key = `${currentClassName}-${currentSectionName} → ${nextClassName}-${targetSection?.name || currentSectionName}`;
      if (!transitions[key]) {
        transitions[key] = {
          fromClass: currentClassName,
          fromSection: currentSectionName,
          toClass: nextClassName,
          toSection: targetSection?.name || currentSectionName,
          count: 0,
          hasError,
          errorMsg: hasError ? (!targetClass ? "Target class missing" : "Section mapping missing") : null,
        };
      }
      transitions[key].count++;
    } else {
      errors.push(`Could not determine next class for student ${student.user?.name || student.id} in class '${currentClassName}'. Please set manual target class.`);
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
  { next_year_name, start_date, end_date, repeat_student_ids = [], custom_overrides = {} }
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
        { model: User, attributes: ["name"] },
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

    // Validate all student promotions before executing writes
    for (const student of students) {
      const isRepeating = repeatSet.has(String(student.id));
      if (isRepeating) continue;

      const currentClassName = student.class?.class_name;
      const currentSectionName = student.section?.name || "A";

      const override = custom_overrides[student.id] || custom_overrides[String(student.id)];
      const nextClassName = override?.toClass || getNextClassName(currentClassName);

      if (!nextClassName) {
        throw new AppError(
          `Could not determine next class for student ${student.user?.name || student.id} (Class: '${currentClassName}'). Please assign a manual target class before promoting.`,
          400
        );
      }

      if (nextClassName !== "Graduated") {
        let targetClass = null;
        let targetSection = null;

        if (override?.target_class_id && override?.target_section_id) {
          targetClass = allClasses.find((c) => String(c.id) === String(override.target_class_id));
          targetSection = targetClass?.sections?.find((s) => String(s.id) === String(override.target_section_id));
        } else {
          targetClass = allClasses.find(
            (c) => c.class_name.toLowerCase().trim() === nextClassName.toLowerCase().trim()
          );
          targetSection = targetClass?.sections?.find(
            (s) => s.name.toLowerCase().trim() === (override?.toSection || currentSectionName).toLowerCase().trim()
          );
        }

        if (!targetClass || !targetSection) {
          throw new AppError(
            `Target section mapping missing for student ${student.user?.name || student.id} (${currentClassName} ${currentSectionName} → ${nextClassName} ${override?.toSection || currentSectionName}). Please configure class/section before continuing.`,
            400
          );
        }

        // Cache target IDs on student object for execution step
        student._resolvedTargetClassId = targetClass.id;
        student._resolvedTargetSectionId = targetSection.id;
      }
    }

    // 5. Create new academic year
    const nextYear = await AcademicYear.create(
      {
        school_id,
        name: next_year_name,
        start_date,
        end_date,
        is_current: false,
      },
      { transaction: t }
    );

    // 6. Process each student
    for (const student of students) {
      const isRepeating = repeatSet.has(String(student.id));

      if (isRepeating) {
        await StudentEnrollment.create(
          {
            student_id: student.id,
            academic_year_id: nextYear.id,
            class_id: student.class_id,
            section_id: student.section_id,
            roll_no: student.roll_no,
          },
          { transaction: t }
        );
      } else {
        const currentClassName = student.class?.class_name;
        const override = custom_overrides[student.id] || custom_overrides[String(student.id)];
        const nextClassName = override?.toClass || getNextClassName(currentClassName);

        if (nextClassName === "Graduated") {
          await student.update(
            {
              status: "GRADUATED",
              is_active: false,
            },
            { transaction: t }
          );

          await User.update(
            { is_active: false },
            { where: { id: student.user_id }, transaction: t }
          );

          if (db.models.student_transport) {
            await db.models.student_transport.update(
              { is_active: false },
              { where: { student_id: student.id, school_id }, transaction: t }
            );
          }
        } else {
          const targetClassId = student._resolvedTargetClassId;
          const targetSectionId = student._resolvedTargetSectionId;

          // Create placement record in the next academic year
          await StudentEnrollment.create(
            {
              student_id: student.id,
              academic_year_id: nextYear.id,
              class_id: targetClassId,
              section_id: targetSectionId,
              roll_no: student.roll_no,
            },
            { transaction: t }
          );

          // Update Student model pointer to new class & section
          await student.update(
            {
              class_id: targetClassId,
              section_id: targetSectionId,
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

    // 8. Replenish yearly tokens for all students and teachers in the school
    const { replenishSchoolYearlyTokens } = await import("../tokens/token.service.js");
    await replenishSchoolYearlyTokens(school_id, t);

    return {
      success: true,
      promoted_to_year: nextYear.name,
    };
  });
};
