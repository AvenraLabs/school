import { getPagination } from "../../shared/utils/pagination.js";
import { Op } from "sequelize";
import AppError from "../../shared/appError.js";

import Student from "../students/student.model.js";
import Teacher from "../teachers/teacher.model.js";
import User from "../users/user.model.js";
import TeacherAssignment from "../teacher-assignments/teacher-assignment.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";

const resolveSchoolId = (school_id, user) => {
  const resolved = school_id ?? user?.school_id;
  if (!resolved) {
    throw new AppError("school_id is required", 400);
  }
  return resolved;
};

/* =========================
   TEACHER: STUDENT PENDING
========================= */
export const getPendingStudentApprovalsService = async ({
  school_id,
  user,
  class_id,
  query,
}) => {
  const scopedSchoolId = resolveSchoolId(school_id, user);
  const { limit, offset } = getPagination(query);
  const safeQuery = query || {};
  const { from_date, to_date } = safeQuery;

  const where = {
    school_id: scopedSchoolId,
    approval_status: "pending",
  };

  if (user?.role === "teacher") {
    const assignments = await TeacherAssignment.findAll({
      where: {
        school_id: scopedSchoolId,
        teacher_id: user.teacher_id,
        is_active: true,
      },
      attributes: ["class_id", "section_id"],
    });

    if (!assignments.length) {
      return { count: 0, rows: [] };
    }

    const allowedClassIds = [
      ...new Set(assignments.map((a) => a.class_id)),
    ];
    const allowedSectionIds = [
      ...new Set(assignments.map((a) => a.section_id)),
    ];

    if (class_id && !allowedClassIds.includes(Number(class_id))) {
      return { count: 0, rows: [] };
    }

    where.section_id = { [Op.in]: allowedSectionIds };
  }

  if (class_id) {
    where.class_id = Number(class_id);
  }

  if (from_date || to_date) {
    where.updated_at = {};
    if (from_date) where.updated_at[Op.gte] = new Date(from_date);
    if (to_date) where.updated_at[Op.lte] = new Date(to_date);
  }

  return Student.findAndCountAll({
    where,
    limit,
    offset,
    order: [["updated_at", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "email", "phone", "avatar_url"],
      },
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
    ],
  });
};

/* =========================
   ADMIN: TEACHER PENDING
 ========================= */
export const getPendingTeacherApprovalsService = async ({
  school_id,
  user,
  query,
}) => {
  const scopedSchoolId = resolveSchoolId(school_id, user);
  const { limit, offset } = getPagination(query);
  const safeQuery = query || {};
  const { from_date, to_date } = safeQuery;

  const where = {
    school_id: scopedSchoolId,
    approval_status: "pending",
  };

  if (from_date || to_date) {
    where.updated_at = {};
    if (from_date) where.updated_at[Op.gte] = new Date(from_date);
    if (to_date) where.updated_at[Op.lte] = new Date(to_date);
  }

  return Teacher.findAndCountAll({
    where,
    limit,
    offset,
    order: [["updated_at", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "email", "phone", "avatar_url"],
      },
    ],
  });
};

/* =========================================
   NOTHING - parent approvals removed
========================================= */

/* =========================
   ACTION: APPROVE / REJECT
========================= */
export const processApprovalAction = async ({
  user,
  type,
  id,
  action,
  rejection_reason,
}) => {
  const normalizedType = (() => {
    if (!type) return "";
    if (type === "student_profile") return "student";
    if (type === "parent_profile") return "parent";
    if (type === "teacher_profile") return "teacher";
    return type;
  })();

  // 1. Validate Action
  const status = action === "approve" ? "approved" : "rejected";

  // 2. Determine Target Model
  let Model;
  if (normalizedType === "student") Model = Student;
  else if (normalizedType === "teacher") Model = Teacher;
  else throw new AppError("Invalid approval type", 400);

  // 3. Find Entity
  const entity = await Model.findByPk(id);
  if (!entity) throw new AppError("Entity not found", 404);

  const entitySchoolId = entity.school_id;

  // 4. Permission Check (CRITICAL)
  if (user.role === "teacher") {
    if (entitySchoolId !== user.school_id) {
      throw new AppError("Unauthorized", 403);
    }

    if (type === "student") {
      const hasAssignment = await TeacherAssignment.findOne({
        where: {
          school_id: user.school_id,
          teacher_id: user.teacher_id,
          section_id: entity.section_id,
          is_active: true,
        },
      });

      if (!hasAssignment) {
        throw new AppError("Forbidden role", 403);
      }
    }
  }


  if (user.role === "school_admin") {
    if (entitySchoolId !== user.school_id) {
      throw new AppError("Unauthorized", 403);
    }
  }

  // 5. Update Status
  await entity.update({
    approval_status: status,
    approved_by: user.id,
    approved_at: new Date(),
    rejection_reason: action === "reject" ? (rejection_reason || null) : null
  });

  return entity;
};

export const getPendingProfileUpdatesService = async ({ school_id, user }) => {
  const scopedSchoolId = school_id ?? user?.school_id;
  if (!scopedSchoolId) {
    throw new AppError("school_id is required", 400);
  }

  const Student = (await import("../students/student.model.js")).default;
  const Teacher = (await import("../teachers/teacher.model.js")).default;
  const ProfileUpdateRequest = (await import("./profile-update-request.model.js")).default;

  return ProfileUpdateRequest.findAll({
    where: {
      school_id: scopedSchoolId,
      status: "PENDING",
    },
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "email", "phone", "avatar_url"],
        include: [
          { model: Student, required: false },
          { model: Teacher, required: false },
        ]
      },
    ],
    order: [["created_at", "ASC"]],
  });
};

export const processProfileUpdateService = async ({
  id,
  action,
  rejection_reason,
  user,
}) => {
  const ProfileUpdateRequest = (await import("./profile-update-request.model.js")).default;
  const request = await ProfileUpdateRequest.findByPk(id);
  if (!request) {
    throw new AppError("Profile update request not found", 404);
  }

  if (String(request.school_id) !== String(user.school_id)) {
    throw new AppError("Forbidden", 403);
  }

  if (action === "reject") {
    await request.update({
      status: "REJECTED",
      rejection_reason: rejection_reason || null,
    });
    return request;
  }

  if (action === "approve") {
    const data = request.pending_data || {};
    const userId = request.user_id;

    if (request.role === "student") {
      const student = await Student.findOne({ where: { user_id: userId } });
      if (!student) throw new AppError("Student profile not found", 404);

      const targetUser = await User.findByPk(userId);
      if (!targetUser) throw new AppError("User not found", 404);

      // Clean up old avatar if changed
      if (data.avatar_url && data.avatar_url !== targetUser.avatar_url) {
        try {
          const { deleteLocalFile } = await import("../../shared/utils/fileCleanup.js");
          deleteLocalFile(targetUser.avatar_url);
        } catch (e) {
          console.error("Cleanup old file error:", e);
        }
      }

      // Update User table fields
      const userUpdates = {};
      if (data.name !== undefined) userUpdates.name = data.name;
      if (data.phone !== undefined) userUpdates.phone = data.phone;
      if (data.email !== undefined) userUpdates.email = data.email;
      if (data.avatar_url !== undefined) userUpdates.avatar_url = data.avatar_url;

      if (Object.keys(userUpdates).length > 0) {
        await targetUser.update(userUpdates);
      }

      // Update Student table fields
      const studentUpdates = {};
      const fields = [
        "dob", "gender", "blood_group", "father_name", "mother_name",
        "guardian_name", "father_occupation", "mother_occupation",
        "guardian_occupation", "emergency_contact", "residential_status",
        "address", "family_income"
      ];
      fields.forEach(f => {
        if (data[f] !== undefined) studentUpdates[f] = data[f];
      });

      if (Object.keys(studentUpdates).length > 0) {
        await student.update(studentUpdates);
      }
    } else if (request.role === "teacher") {
      const teacher = await Teacher.findOne({ where: { user_id: userId } });
      if (!teacher) throw new AppError("Teacher profile not found", 404);

      const targetUser = await User.findByPk(userId);
      if (!targetUser) throw new AppError("User not found", 404);

      // Clean up old avatar if changed
      if (data.avatar_url && data.avatar_url !== targetUser.avatar_url) {
        try {
          const { deleteLocalFile } = await import("../../shared/utils/fileCleanup.js");
          deleteLocalFile(targetUser.avatar_url);
        } catch (e) {
          console.error("Cleanup old file error:", e);
        }
      }

      // Update User table fields
      const userUpdates = {};
      if (data.name !== undefined) userUpdates.name = data.name;
      if (data.phone !== undefined) userUpdates.phone = data.phone;
      if (data.email !== undefined) userUpdates.email = data.email;
      if (data.avatar_url !== undefined) userUpdates.avatar_url = data.avatar_url;

      if (Object.keys(userUpdates).length > 0) {
        await targetUser.update(userUpdates);
      }

      // Update Teacher table fields
      const teacherUpdates = {};
      const fields = ["gender", "designation", "qualification", "experience"];
      fields.forEach(f => {
        if (data[f] !== undefined) teacherUpdates[f] = data[f];
      });

      if (Object.keys(teacherUpdates).length > 0) {
        await teacher.update(teacherUpdates);
      }
    }

    await request.update({
      status: "APPROVED",
    });

    return request;
  }

  throw new AppError("Invalid action", 400);
};
