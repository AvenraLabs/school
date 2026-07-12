import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";
import User from "../users/user.model.js";
import School from "../schools/school.model.js";

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body; // already validated by Zod

  const user = await User.findOne({ 
    where: { username } 
  });
  if (!user) {
    throw new AppError("Username or Mobile Number not found", 401);
  }

  if (!user.is_active) {
    throw new AppError("User account disabled", 403);
  }

  if (password !== user.password) {
    throw new AppError("Password is wrong", 401);
  }

  // school check (except super admin)
  if (user.role !== "super_admin") {
    const school = await School.findByPk(user.school_id);
    if (!school || school.status !== "active") {
      throw new AppError("School is inactive", 403);
    }
  }

  // For students/drivers, fetch additional profile info
  let additionalClaims = {};
  if (user.role === "student") {

    const Student = (await import("../students/student.model.js")).default;
    const student = await Student.findOne({ where: { user_id: user.id } });

    if (student) {
      additionalClaims = {
        class_id: student.class_id,
        section_id: student.section_id,
        student_id: student.id
      };
    }
  } else if (user.role === "driver") {
    const Driver = (await import("../transport/driver.model.js")).default;
    const driver = await Driver.findOne({ where: { user_id: user.id } });

    if (driver) {
      additionalClaims = {
        driver_id: driver.id
      };
    }
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      school_id: user.school_id,
      name: user.name,
      username: user.username,
      phone: user.phone,
      ...additionalClaims
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { old_password, new_password } = req.body;

  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (old_password !== user.password) {
    throw new AppError("Current password is incorrect", 400);
  }

  user.password = new_password;
  await user.save();

  res.json({
    message: "Password updated successfully",
  });
});



export const adminResetUserPassword = asyncHandler(async (req, res) => {
  // Only school admins (and super admins) can reset passwords for their users
  if (req.user.role !== "school_admin" && req.user.role !== "super_admin") {
    throw new AppError("Forbidden", 403);
  }

  const { userId } = req.params;
  const { new_password } = req.body;

  if (!new_password || new_password.length < 4) {
    throw new AppError("Password must be at least 4 characters", 400);
  }

  const targetUser = await User.findByPk(userId);
  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  // Ensure school admin can only reset their own school's users
  if (req.user.role === "school_admin" && targetUser.school_id !== req.user.school_id) {
    throw new AppError("Forbidden: Cannot reset password for a user from another school", 403);
  }

  // Cannot reset another admin's password through this endpoint
  if (targetUser.role === "school_admin" || targetUser.role === "super_admin") {
    throw new AppError("Forbidden: Cannot reset admin password using this endpoint", 403);
  }

  targetUser.password = new_password;
  targetUser.first_login = true; // force them to go through profile completion/password change if needed
  await targetUser.save();

  res.json({ message: "Password reset successfully" });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar_url } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Clean up old avatar if changed
  if (avatar_url !== undefined && avatar_url !== user.avatar_url) {
    if (user.avatar_url) {
      try {
        const { deleteLocalFile } = await import("../../shared/utils/fileCleanup.js");
        deleteLocalFile(user.avatar_url);
      } catch (e) {
        console.error("Cleanup old file error:", e);
      }
    }
    user.avatar_url = avatar_url || null;
  }

  if (name !== undefined) {
    user.name = name;
  }

  await user.save();

  res.json({
    message: "Profile updated successfully",
    user,
  });
});
