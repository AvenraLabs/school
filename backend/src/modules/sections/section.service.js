import Section from "./section.model.js";
import Class from "../classes/classes.model.js";
import db from "../../config/db.js";
import User from "../users/user.model.js";
import Student from "../students/student.model.js";

/* =========================
   ADMIN: CREATE SECTION
========================= */
export const createSectionService = async ({
  school_id,
  class_id,
  name,
  student_count = 0,
}) => {
  return db.transaction(async (t) => {
    const cls = await Class.findOne({
      where: { id: class_id, school_id },
      transaction: t,
    });

    if (!cls) {
      return { error: "CLASS_NOT_FOUND" };
    }

    const normalizedName = name.trim().toUpperCase();

    const exists = await Section.findOne({
      where: {
        school_id,
        class_id,
        name: normalizedName,
      },
      transaction: t,
    });

    if (exists) {
      return { error: "SECTION_EXISTS" };
    }

    const section = await Section.create({
      school_id,
      class_id,
      name: normalizedName,
      is_active: true,
    }, { transaction: t });

    if (student_count > 0) {
      const existingUsers = await User.findAll({
        where: { school_id },
        attributes: ["username"],
        transaction: t,
      });
      const usernameSet = new Set(existingUsers.map((u) => u.username));

      let existingStudentCount = await Student.count({
        where: { school_id },
        transaction: t,
      });

      const buildStudentUsername = (serial) => `S${String(serial).padStart(5, "0")}`;
      const defaultPassword = (username) => `${username}@123`;

      for (let i = 1; i <= student_count; i++) {
        let isUnique = false;
        let serial = existingStudentCount + i;
        let stuUsername = "";
        while (!isUnique) {
          stuUsername = buildStudentUsername(serial);
          if (!usernameSet.has(stuUsername)) {
            isUnique = true;
            usernameSet.add(stuUsername);
          } else {
            serial++;
            existingStudentCount++;
          }
        }

        const stuUser = await User.create(
          {
            school_id,
            role: "student",
            username: stuUsername,
            password: defaultPassword(stuUsername),
            is_active: true,
            first_login: true,
            name: `Student ${cls.class_name}${normalizedName}-${i}`,
          },
          { transaction: t }
        );

        await Student.create(
          {
            user_id: stuUser.id,
            school_id,
            class_id: cls.id,
            section_id: section.id,
            admission_no: `ADM-${stuUsername}`,
            approval_status: "pending",
            is_active: true,
          },
          { transaction: t }
        );
      }
    }

    return { section };
  });
};

/* =========================
   ADMIN: LIST SECTIONS BY CLASS
========================= */
export const listSectionsService = async ({ school_id, class_id }) => {
  return Section.findAndCountAll({
    where: { school_id, class_id },
    order: [["name", "ASC"]],
  });
};

/* =========================
   ADMIN: ACTIVATE / DEACTIVATE
========================= */
export const updateSectionStatusService = async ({
  school_id,
  section_id,
  is_active,
}) => {
  const section = await Section.findOne({
    where: { id: section_id, school_id },
  });

  if (!section) {
    return null;
  }

  section.is_active = is_active;
  await section.save();

  return section;
};

/* =========================
   ADMIN: DELETE SECTION
========================= */
export const deleteSectionService = async ({ school_id, section_id }) => {
  const section = await Section.findOne({
    where: { id: section_id, school_id },
  });

  if (!section) {
    return null;
  }

  await db.transaction(async (t) => {
    await Student.update(
      { section_id: null },
      { where: { section_id, school_id }, transaction: t }
    );

    if (db.models.teacher_assignment) {
      await db.models.teacher_assignment.destroy({
        where: { section_id },
        transaction: t,
      });
    }

    if (db.models.timetable) {
      await db.models.timetable.destroy({
        where: { section_id },
        transaction: t,
      });
    }

    if (db.models.student_enrollment) {
      await db.models.student_enrollment.destroy({
        where: { section_id },
        transaction: t,
      });
    }

    await section.destroy({ transaction: t });
  });

  return true;
};
