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
    designation: req.body.designation,
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
    designation,
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

  const currentUser = await User.findByPk(req.user.id);
  if (!currentUser) throw new AppError("User not found", 404);

  // Update User details
  const userUpdates = {};
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
  if (req.user.first_login && name !== undefined) {
    userUpdates.first_login = false;
  }

  if (Object.keys(userUpdates).length > 0) {
    await User.update(userUpdates, { where: { id: req.user.id } });
  }

  const user = await User.findByPk(req.user.id); // Fetch updated user for token

  // Update Teacher details
  const teacherUpdates = {
    gender,
    designation,
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

  /* Create new token */
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      school_id: user.school_id,
      iat: Date.now(),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.json({ message: "Profile completed", token, user });
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

  const data = teacher.get({ plain: true });
  const user = data.user || data.User || {};
  res.json({
    ...data,
    ...user,
    avatar_url: user.avatar_url || "",
  });
});


