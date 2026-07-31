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
    emergency_contact: req.body.emergency_contact,
    residential_status: req.body.residential_status,
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
    emergency_contact,
    residential_status,
    address,
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

    // ── 1. Handle session-critical fields directly (no approval needed) ──
    const { new_password } = req.body;
    const directUpdates = {};

    if (new_password && new_password.trim().length >= 6) {
      directUpdates.password = new_password.trim();
      directUpdates.must_change_password = false;
    }
    // Always clear first_login on profile completion, regardless of profile data changes
    if (currentUser.first_login) {
      directUpdates.first_login = false;
    }

    if (Object.keys(directUpdates).length > 0) {
      await User.update(directUpdates, { where: { id: req.user.id } });
    }

    // ── 2. Queue profile-field diffs for admin approval ──
    const pending_data = {};

    if (name !== undefined) {
      const nNew = name || null;
      const nCur = currentUser.name || null;
      if (nNew !== nCur) pending_data.name = nNew;
    }
    if (phone !== undefined) {
      const nNew = cleanedPhone || null;
      const nCur = currentUser.phone || null;
      if (nNew !== nCur) pending_data.phone = nNew;
    }
    if (req.body.email !== undefined) {
      const nNew = req.body.email || null;
      const nCur = currentUser.email || null;
      if (nNew !== nCur) pending_data.email = nNew;
    }
    if (avatar_url !== undefined) {
      const nNew = avatar_url || null;
      const nCur = currentUser.avatar_url || null;
      if (nNew !== nCur) pending_data.avatar_url = nNew;
    }

    const studentFields = [
      "dob", "gender", "blood_group", "father_name", "mother_name",
      "guardian_name", "guardian_phone", "emergency_contact", "residential_status",
      "address", "roll_no",
    ];
    studentFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        const nNew = req.body[field] || null;
        const nCur = student[field] || null;
        if (nNew !== nCur) pending_data[field] = nNew;
      }
    });

    if (Object.keys(pending_data).length > 0) {
      const ProfileUpdateRequest = (await import("../approvals/profile-update-request.model.js")).default;
      await ProfileUpdateRequest.destroy({
        where: { user_id: req.user.id, status: ["PENDING", "REJECTED"] },
      });
      await ProfileUpdateRequest.create({
        school_id: req.user.school_id,
        user_id: req.user.id,
        role: "student",
        pending_data,
        status: "PENDING",
      });
    }

    // ── 3. Always return a fresh token so the client session reflects first_login=false ──
    const updatedUser = await User.findByPk(req.user.id);
    const tokenPayload = {
      id:                   updatedUser.id,
      role:                 updatedUser.role,
      school_id:            updatedUser.school_id,
      name:                 updatedUser.name,
      username:             updatedUser.username,
      phone:                updatedUser.phone,
      first_login:          updatedUser.first_login,
      must_change_password: updatedUser.must_change_password,
      student_id:           student.id,
      class_id:             student.class_id,
      section_id:           student.section_id,
    };

    const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
    const refreshToken = jwt.sign(
      { id: updatedUser.id, token_type: "refresh" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d" }
    );

    updatedUser.refresh_token = refreshToken;
    await updatedUser.save();

    return res.json({
      success: true,
      message: Object.keys(pending_data).length > 0
        ? "Profile updates submitted for approval"
        : "Session credentials updated successfully",
      approval_pending: Object.keys(pending_data).length > 0,
      already_approved: true,
      student,
      token: accessToken,
      accessToken,
      refreshToken,
      user: tokenPayload,
    });
  }

  const currentUser = await User.findByPk(req.user.id);
  if (!currentUser) throw new AppError("User not found", 404);

  const { new_password } = req.body;

  if (currentUser.must_change_password) {
    if (!new_password || new_password.trim().length < 6) {
      throw new AppError("New password is required and must be at least 6 characters long", 400);
    }
    const defaultPwd = `${currentUser.username}@123`;
    if (new_password === currentUser.password || new_password === defaultPwd) {
      throw new AppError("New password must be different from your current default password", 400);
    }
  }

  const userUpdates = {};
  if (new_password && new_password.trim().length >= 6) {
    userUpdates.password = new_password.trim();
    userUpdates.must_change_password = false;
  }
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
  if (currentUser.first_login) {
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
    emergency_contact,
    residential_status,
    address,
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

  const updatedUser = await User.findByPk(req.user.id);
  const tokenPayload = {
    id:                   updatedUser.id,
    role:                 updatedUser.role,
    school_id:            updatedUser.school_id,
    name:                 updatedUser.name,
    username:             updatedUser.username,
    phone:                updatedUser.phone,
    first_login:          updatedUser.first_login,
    must_change_password: updatedUser.must_change_password,
    student_id:           student.id,
    class_id:             student.class_id,
    section_id:           student.section_id,
  };

  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "15m" });
  const refreshToken = jwt.sign({ id: updatedUser.id, token_type: "refresh" }, process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d" });

  updatedUser.refresh_token = refreshToken;
  await updatedUser.save();

  res.json({
    message: "Profile and security credentials updated successfully",
    token: accessToken,
    accessToken,
    refreshToken,
    user: tokenPayload,
  });
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


