import asyncHandler from "../../shared/asyncHandler.js";
import jwt from "jsonwebtoken";
import AppError from "../../shared/appError.js";
import {
  createTeacherService,
  listTeachersService,
  updateTeacherStatusService,
  listTeacherOptionsService,
} from "./teacher.service.js";
import Teacher from "./teacher.model.js";
import User from "../users/user.model.js";
import { cleanTo10Digits } from "../../shared/utils/phoneUtils.js";

/* ADMIN: CREATE */
export const createTeacher = asyncHandler(async (req, res) => {
  const result = await createTeacherService({
    school_id: req.user.school_id,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    gender: req.body.gender,
    qualification: req.body.qualification,
    joining_date: req.body.joining_date,
    experience: req.body.experience,
  });

  res.status(201).json(result);
});

/* ADMIN: LIST */
export const listTeachers = asyncHandler(async (req, res) => {
  const result = await listTeachersService({
    school_id: req.user.school_id,
    query: req.query,
  });

  res.json({
    total: result.count,
    items: result.rows,
  });
});

/* ADMIN: OPTIONS */
export const listTeacherOptions = asyncHandler(async (req, res) => {
  const result = await listTeacherOptionsService({
    school_id: req.user.school_id,
  });

  res.json({
    total: result.length,
    items: result,
  });
});

/* ADMIN: STATUS */
export const updateTeacherStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const teacher = await updateTeacherStatusService({
    school_id: req.user.school_id,
    teacher_id: id,
    status,
    reason,
  });

  res.json({ message: "Status updated", teacher });
});

/* TEACHER: COMPLETE PROFILE */
export const completeTeacherProfile = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    email,
    gender,
    qualification,
    experience,
    avatar_url,
  } = req.body;

  const teacher = await Teacher.findOne({
    where: { user_id: req.user.id },
  });

  if (!teacher) {
    throw new AppError("Teacher profile not found", 404);
  }

  if (email) {
    const existing = await User.findOne({ where: { email } });
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

  if (teacher.approval_status === "approved") {
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
    if (email !== undefined) {
      const nNew = email || null;
      const nCur = currentUser.email || null;
      if (nNew !== nCur) pending_data.email = nNew;
    }
    if (avatar_url !== undefined) {
      const nNew = avatar_url || null;
      const nCur = currentUser.avatar_url || null;
      if (nNew !== nCur) pending_data.avatar_url = nNew;
    }

    const teacherFields = ["gender", "qualification", "experience"];
    teacherFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        const nNew = req.body[field] || null;
        const nCur = teacher[field] || null;
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
        role: "teacher",
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
      teacher_id:           teacher.id,
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
      teacher,
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

  // Update User details
  const userUpdates = {};
  if (new_password && new_password.trim().length >= 6) {
    userUpdates.password = new_password.trim();
    userUpdates.must_change_password = false;
  }
  if (name !== undefined) userUpdates.name = name;
  if (phone !== undefined) userUpdates.phone = cleanedPhone || null;
  if (email !== undefined) userUpdates.email = email;
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

  // Update Teacher details
  const teacherUpdates = {
    gender,
    qualification,
    experience,
    approval_status: "pending",
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
  };

  if (Object.keys(teacherUpdates).length > 0) {
    await teacher.update(teacherUpdates);
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
    teacher_id:           teacher.id,
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

/* TEACHER: MY PROFILE */
export const getMyProfile = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({
    where: { user_id: req.user.id },
    include: ["user"],
  });

  if (!teacher) {
    throw new AppError("Teacher profile not found", 404);
  }

  const ProfileUpdateRequest = (await import("../approvals/profile-update-request.model.js")).default;
  const pendingUpdate = await ProfileUpdateRequest.findOne({
    where: { user_id: req.user.id, status: ["PENDING", "REJECTED"] },
    order: [["id", "DESC"]],
  });

  const data = teacher.get({ plain: true });
  const user = data.user || data.User || {};
  res.json({
    ...data,
    ...user,
    avatar_url: user.avatar_url || "",
    pending_update: pendingUpdate || null,
  });
});


