import db from "../../config/db.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import User from "../users/user.model.js";
import Teacher from "../teachers/teacher.model.js";
import Student from "../students/student.model.js";

import AppError from "../../shared/appError.js";

const buildTeacherUsername = (schoolId, serial) =>
  `T${String(serial).padStart(5, "0")}`;

const buildStudentUsername = (schoolId, sectionId, serial) =>
  `S${String(serial).padStart(5, "0")}`;



const defaultPassword = (username) => `${username}@123`;

/**
 * BULK CREATE SERVICE
 */
export const bulkCreateDataService = async ({
  school_id,
  classes,
  teacher_count = 10,
}) => {
  return db.transaction(async (t) => {
    /* ================================
       RESPONSE STRUCTURE
    ================================= */
    const response = {
      school_id,
      teachers: [],
      students: [],

      summary: {
        classes_created: 0,
        teachers_created: 0,
        students_created: 0,
      },
    };

    /* ================================
       1️⃣ CREATE TEACHERS
    ================================= */
    const existingTeacherCount = await Teacher.count({
      where: { school_id },
      transaction: t,
    });

    for (let i = 1; i <= teacher_count; i++) {
      const serial = existingTeacherCount + i;
      const username = buildTeacherUsername(school_id, serial);

      const user = await User.create(
        {
          school_id,
          role: "teacher",
          username,
          password: defaultPassword(username),
          is_active: true,
          first_login: true,
          name: `Teacher ${serial}`,
        },
        { transaction: t }
      );

      const teacher = await Teacher.create(
        {
          user_id: user.id,
          school_id,
          employee_id: `EMP-${username}`,
          joining_date: new Date(),
          approval_status: "pending",
          is_active: true,
        },
        { transaction: t }
      );

      response.teachers.push({
        teacher_id: teacher.id,
        username,
      });

      response.summary.teachers_created++;
    }

    /* ================================
       2️⃣ VALIDATE CLASS INPUT
    ================================= */
    if (!Array.isArray(classes) || classes.length === 0) {
      throw new AppError("classes must be a non-empty array", 400);
    }

    const classEntries = classes;

    /* ================================
       3️⃣ CREATE CLASSES, SECTIONS,
           STUDENTS
    ================================= */
    for (const classData of classEntries) {
      const [dbClass, classCreated] = await Class.findOrCreate({
        where: {
          school_id,
          class_name: classData.name,
        },
        defaults: {
          school_id,
          class_name: classData.name,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (classCreated) {
        response.summary.classes_created++;
      }

      for (const sectionData of classData.sections) {
        const [dbSection] = await Section.findOrCreate({
          where: {
            school_id,
            class_id: dbClass.id,
            name: sectionData.name,
          },
          defaults: {
            school_id,
            class_id: dbClass.id,
            name: sectionData.name,
            is_active: true,
          },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!dbSection.is_active) {
          await dbSection.update({ is_active: true }, { transaction: t });
        }

        const existingStudentCount = await Student.count({
          where: { school_id },
          transaction: t,
        });

        for (let i = 1; i <= sectionData.students; i++) {
          const serial = existingStudentCount + response.summary.students_created + 1;
          const stuUsername = buildStudentUsername(
            school_id,
            dbSection.id,
            serial
          );

          const stuUser = await User.create(
            {
              school_id,
              role: "student",
              username: stuUsername,
              password: defaultPassword(stuUsername),
              is_active: true,
              first_login: true,
              name: `Student ${classData.name}${sectionData.name}-${i}`,
            },
            { transaction: t }
          );

          const student = await Student.create(
            {
              user_id: stuUser.id,
              school_id,
              class_id: dbClass.id,
              section_id: dbSection.id,
              admission_no: `ADM-${stuUsername}`,
              approval_status: "pending",
              is_active: true,
            },
            { transaction: t }
          );

          response.students.push({
            student_id: student.id,
            username: stuUsername,
            class: classData.name,
            section: sectionData.name,
          });



          response.summary.students_created++;
        }
      }
    }

    return response;
  });
};
