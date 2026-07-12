import asyncHandler from "../../shared/asyncHandler.js";
import jwt from "jsonwebtoken";
import AppError from "../../shared/appError.js";
import { cleanTo10Digits } from "../../shared/utils/phoneUtils.js";
import {
 createStudentService,
  listStudentsService,
  moveStudentService,
  updateStudentStatusService,
  assignStudentsToSectionService,
  listStudentsForTeacherSectionService,
  listStudentOptionsService,
} from "./student.service.js";
import Student from "./student.model.js";
import User from "../users/user.model.js";

/* ADMIN: AUTO CREATE */
export const createStudent = asyncHandler(async (req, res) => {
  const result = await createStudentService({
    school_id: req.user.school_id,
    class_id: req.body.class_id,
    section_id: req.body.section_id,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    dob: req.body.dob,
    gender: req.body.gender,
    blood_group: req.body.blood_group,
    father_name: req.body.father_name,
    mother_name: req.body.mother_name,
    guardian_name: req.body.guardian_name,
    guardian_phone: req.body.guardian_phone,
    address: req.body.address,
    aadhar_no: req.body.aadhar_no,
    father_occupation: req.body.father_occupation,
    mother_occupation: req.body.mother_occupation,
    guardian_occupation: req.body.guardian_occupation,
    emergency_contact: req.body.emergency_contact,
    residential_status: req.body.residential_status,
    family_income: req.body.family_income,
    admission_no: req.body.admission_no,
  });

  res.status(201).json({
    created: 1,
    student: result,
    students: [result],
  });
});

/* ADMIN: LIST */
export const listStudents = asyncHandler(async (req, res) => {
  const result = await listStudentsService({
    school_id: req.user.school_id,
    query: req.query,
  });

  res.json({
    total: result.count,
    items: result.rows,
  });
});

/* ADMIN: MOVE */
export const moveStudent = asyncHandler(async (req, res) => {
  const student = await moveStudentService({
    student_id: req.params.id,
    section_id: req.body.section_id,
    school_id: req.user.school_id,
  });
  res.json({ message: "Student moved", student });
});

/* ADMIN: STATUS */
export const updateStudentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const student = await updateStudentStatusService({
    school_id: req.user.school_id,
    student_id: id,
    status,
    reason,
  });
  res.json({ message: "Status updated", student });
});

/* STUDENT: COMPLETE PROFILE */
export const completeStudentProfile = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    dob,
    gender,
    blood_group,
    father_name,
    mother_name,
    guardian_name,
    father_occupation,
    mother_occupation,
    guardian_occupation,
    emergency_contact,
    residential_status,
    address,
    family_income,
    avatar_url,
    roll_no,
  } = req.body;

  const student = await Student.findOne({
    where: { user_id: req.user.id },
  });
  if (!student) throw new AppError("Student profile not found", 404);

  if (req.body.email) {
    const existing = await User.findOne({ where: { email: req.body.email } });
    if (existing && existing.id !== req.user.id) {
      throw new AppError("Email already in use", 400);
    }
  }

  let cleanedPhone = phone;
  if (phone) {
    cleanedPhone = cleanTo10Digits(phone);
    const existingPhone = await User.findOne({ where: { phone: cleanedPhone } });
    if (existingPhone && existingPhone.id !== req.user.id) {
      throw new AppError("Phone already in use", 400);
    }
  }

  if (student.approval_status === "approved") {
    const currentUser = await User.findByPk(req.user.id);
    if (!currentUser) throw new AppError("User not found", 404);

    const pending_data = {};

    if (name !== undefined) {
      const normalizedNew = name || null;
      const normalizedCur = currentUser.name || null;
      if (normalizedNew !== normalizedCur) pending_data.name = normalizedNew;
    }
    if (phone !== undefined) {
      const normalizedNew = cleanedPhone || null;
      const normalizedCur = currentUser.phone || null;
      if (normalizedNew !== normalizedCur) pending_data.phone = normalizedNew;
    }
    if (req.body.email !== undefined) {
      const normalizedNew = req.body.email || null;
      const normalizedCur = currentUser.email || null;
      if (normalizedNew !== normalizedCur) pending_data.email = normalizedNew;
    }
    if (avatar_url !== undefined) {
      const normalizedNew = avatar_url || null;
      const normalizedCur = currentUser.avatar_url || null;
      if (normalizedNew !== normalizedCur) pending_data.avatar_url = normalizedNew;
    }

    const studentFields = [
      "dob", "gender", "blood_group", "father_name", "mother_name",
      "guardian_name", "father_occupation", "mother_occupation",
      "guardian_occupation", "emergency_contact", "residential_status",
      "address", "family_income", "roll_no"
    ];
    studentFields.forEach(field => {
      if (req.body[field] !== undefined) {
        const normalizedNew = req.body[field] || null;
        const normalizedCur = student[field] || null;
        if (normalizedNew !== normalizedCur) {
          pending_data[field] = normalizedNew;
        }
      }
    });

    if (Object.keys(pending_data).length === 0) {
      return res.json({
        success: true,
        message: "Profile is already up to date",
        approval_pending: false,
        student,
      });
    }

    const ProfileUpdateRequest = (await import("../approvals/profile-update-request.model.js")).default;
    await ProfileUpdateRequest.destroy({
      where: { user_id: req.user.id, status: ["PENDING", "REJECTED"] }
    });
    await ProfileUpdateRequest.create({
      school_id: req.user.school_id,
      user_id: req.user.id,
      role: "student",
      pending_data,
      status: "PENDING",
    });
    return res.json({
      success: true,
      message: "Profile updates submitted for approval",
      approval_pending: true,
      student,
    });
  }

  const currentUser = await User.findByPk(req.user.id);
  if (!currentUser) throw new AppError("User not found", 404);

  const userUpdates = {};
  if (name !== undefined) userUpdates.name = name;
  if (phone !== undefined) userUpdates.phone = cleanedPhone || null;
  if (req.body.email !== undefined) userUpdates.email = req.body.email;
  if (avatar_url !== undefined) {
    if (avatar_url !== currentUser.avatar_url) {
      const { deleteLocalFile } = await import("../../shared/utils/fileCleanup.js");
      deleteLocalFile(currentUser.avatar_url);
    }
    userUpdates.avatar_url = avatar_url || null;
  }
  if (req.user.first_login && name !== undefined) {
    userUpdates.first_login = false;
  }

  if (Object.keys(userUpdates).length > 0) {
    await User.update(userUpdates, { where: { id: req.user.id } });
  }

  const studentUpdates = {
    dob,
    gender,
    blood_group,
    father_name,
    mother_name,
    guardian_name,
    father_occupation,
    mother_occupation,
    guardian_occupation,
    emergency_contact,
    residential_status,
    address,
    family_income,
    roll_no: roll_no || null,
    approval_status: "pending",
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
  };

  await student.update(studentUpdates);

  if (roll_no !== undefined) {
    const StudentEnrollment = (await import("./student-enrollment.model.js")).default;
    await StudentEnrollment.update(
      { roll_no: roll_no || null },
      { where: { student_id: student.id } }
    );
  }

  /* Create new token */
  const token = jwt.sign(
    {
      id: req.user.id,
      role: req.user.role,
      school_id: req.user.school_id,
      iat: Date.now(),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.json({ message: "Profile completed", token, user: req.user });
});

/* STUDENT: MY PROFILE */
export const getMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    where: { user_id: req.user.id },
    include: [User, "class", "section"],
  });
  if (!student) throw new AppError("Student profile not found", 404);

  const ProfileUpdateRequest = (await import("../approvals/profile-update-request.model.js")).default;
  const pendingUpdate = await ProfileUpdateRequest.findOne({
    where: { user_id: req.user.id, status: ["PENDING", "REJECTED"] },
    order: [["id", "DESC"]],
  });

  const data = student.get({ plain: true });
  const user = data.user || {};
  res.json({
    ...data,
    ...user,
    avatar_url: user.avatar_url || "",
    pending_update: pendingUpdate || null,
  });
});


//assign students to section

export const assignStudentsToSection = asyncHandler(async (req, res) => {
  const result = await assignStudentsToSectionService({
    school_id: req.user.school_id,
    ...req.body,
  });

  if (result?.error === "CLASS_NOT_FOUND") {
    throw new AppError("Target class not found", 404);
  }

  if (result?.error === "SECTION_NOT_FOUND") {
    throw new AppError("Target section not found or inactive", 404);
  }

  res.json({
    success: true,
    message: "Students assigned successfully",
  });
});

/* ADMIN: OPTIONS */
export const listStudentOptions = asyncHandler(async (req, res) => {
  const result = await listStudentOptionsService({
    school_id: req.user.school_id,
    query: req.query,
  });

  res.json({
    total: result.length,
    items: result,
  });
});

/* TEACHER: LIST STUDENTS IN ASSIGNED SECTION */
export const listStudentsForTeacherSection = asyncHandler(async (req, res) => {
  const result = await listStudentsForTeacherSectionService({
    user: req.user,
    query: req.query,
  });

  res.json({
    total: result.length,
    items: result,
  });
});


