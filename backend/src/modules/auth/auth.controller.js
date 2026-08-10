import jwt from "jsonwebtoken";
import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";
import User from "../users/user.model.js";
import School from "../schools/school.model.js";
import { deleteCache } from "../../config/redis.js";
import RefreshToken from "./refresh-token.model.js";

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body; 

  // ── 1. Find user ────────────────────────────────────────────────
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new AppError("Username or Mobile Number not found", 401);
  }

  if (!user.is_active) {
    throw new AppError("Your account has been disabled. Please contact your school admin.", 403);
  }

  if (password !== user.password) {
    throw new AppError("Password is wrong", 401);
  }

  // ── 2. School check (except super_admin) ─────────────────────────
  let schoolBoard = null;
  if (user.role !== "super_admin") {
    const school = await School.findByPk(user.school_id);
    if (!school || school.status !== "active") {
      throw new AppError("School is inactive", 403);
    }
    schoolBoard = school.board || null;
  }

  // ── 3. Role-specific profile status checks ────────────────────────
  let additionalClaims = {};

  if (user.role === "teacher") {
    const Teacher = (await import("../teachers/teacher.model.js")).default;
    const teacher = await Teacher.findOne({ where: { user_id: user.id } });

    if (!teacher) {
      throw new AppError("Teacher profile not found. Contact your school admin.", 403);
    }
    if (!teacher.is_active || teacher.status !== "ACTIVE") {
      const statusMsg = {
        RESIGNED:   "Your account has been marked as resigned.",
        RETIRED:    "Your account has been marked as retired.",
        TERMINATED: "Your account has been terminated.",
      };
      throw new AppError(
        statusMsg[teacher.status] || "Your teacher profile is no longer active.",
        403
      );
    }

    additionalClaims.teacher_id = teacher.id;

  } else if (user.role === "student") {
    const Student = (await import("../students/student.model.js")).default;
    const student = await Student.findOne({ where: { user_id: user.id } });

    if (!student) {
      throw new AppError("Student profile not found. Contact your school admin.", 403);
    }
    if (!student.is_active || student.status !== "ACTIVE") {
      const statusMsg = {
        TRANSFERRED: "Your account has been marked as transferred.",
        DROPPED:     "Your account has been marked as dropped.",
        GRADUATED:   "Your account has been graduated out of the system.",
      };
      throw new AppError(
        statusMsg[student.status] || "Your student profile is no longer active.",
        403
      );
    }

    additionalClaims = {
      class_id:   student.class_id,
      section_id: student.section_id,
      student_id: student.id,
    };

  } else if (user.role === "driver") {
    const Driver = (await import("../transport/driver.model.js")).default;
    const driver = await Driver.findOne({ where: { user_id: user.id } });

    if (!driver) {
      throw new AppError("Driver profile not found. Contact your school admin.", 403);
    }

    additionalClaims.driver_id = driver.id;
  }

  // ── 4. Issue tokens (Access + Refresh) ─────────────────────────────
  const tokenPayload = {
    id:                   user.id,
    role:                 user.role,
    school_id:            user.school_id,
    school_board:         schoolBoard,
    name:                 user.name,
    username:             user.username,
    phone:                user.phone,
    first_login:          user.first_login,
    must_change_password: user.must_change_password,
    ...additionalClaims,
  };

  const accessToken = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, token_type: "refresh" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "365d" }
  );

  // ── 5. Save refresh token & update last_login ─────────────────────
  user.last_login = new Date();
  await user.save();

  await RefreshToken.create({
    user_id: user.id,
    token: refreshToken,
    device_info: req.headers["user-agent"] || null,
  });

  res.json({
    token: accessToken,
    accessToken,
    refreshToken,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Refresh Token Endpoint — issues new Access Token & rotates Refresh Token
// ─────────────────────────────────────────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.body?.refreshToken || req.body?.refresh_token;

  if (!incomingRefreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  if (decoded.token_type !== "refresh") {
    throw new AppError("Invalid token type", 401);
  }

  const user = await User.findByPk(decoded.id);
  if (!user || !user.is_active) {
    throw new AppError("User account disabled or not found", 401);
  }

  // Verify incoming refresh token matches stored token (revocation check)
  const tokenRecord = await RefreshToken.findOne({
    where: { user_id: user.id, token: incomingRefreshToken },
  });
  if (!tokenRecord) {
    throw new AppError("Refresh token revoked or invalid", 401);
  }

  // Check school status if applicable
  let schoolBoard = null;
  if (user.role !== "super_admin") {
    const school = await School.findByPk(user.school_id);
    if (!school || school.status !== "active") {
      throw new AppError("School is inactive", 403);
    }
    schoolBoard = school.board || null;
  }

  // Re-build role-specific additional claims
  let additionalClaims = {};
  if (user.role === "teacher") {
    const Teacher = (await import("../teachers/teacher.model.js")).default;
    const teacher = await Teacher.findOne({ where: { user_id: user.id } });
    if (!teacher || !teacher.is_active || teacher.status !== "ACTIVE") {
      throw new AppError("Teacher profile is inactive", 403);
    }
    additionalClaims.teacher_id = teacher.id;

  } else if (user.role === "student") {
    const Student = (await import("../students/student.model.js")).default;
    const student = await Student.findOne({ where: { user_id: user.id } });
    if (!student || !student.is_active || student.status !== "ACTIVE") {
      throw new AppError("Student profile is inactive", 403);
    }
    additionalClaims = {
      class_id:   student.class_id,
      section_id: student.section_id,
      student_id: student.id,
    };

  } else if (user.role === "driver") {
    const Driver = (await import("../transport/driver.model.js")).default;
    const driver = await Driver.findOne({ where: { user_id: user.id } });
    if (driver) {
      additionalClaims.driver_id = driver.id;
    }
  }

  // Generate new Access Token
  const newAccessToken = jwt.sign(
    {
      id:           user.id,
      role:         user.role,
      school_id:    user.school_id,
      school_board: schoolBoard,
      name:         user.name,
      username:     user.username,
      phone:        user.phone,
      ...additionalClaims,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );

  // Rotate Refresh Token
  const newRefreshToken = jwt.sign(
    { id: user.id, token_type: "refresh" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "365d" }
  );

  await tokenRecord.destroy();
  await RefreshToken.create({
    user_id: user.id,
    token: newRefreshToken,
    device_info: req.headers["user-agent"] || null,
  });

  res.json({
    token: newAccessToken,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Logout — records the event; client must clear its own storage
// ─────────────────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  // req.user is populated by the protect middleware
  if (req.user?.id) {
    const incomingRefreshToken = req.body?.refreshToken || req.body?.refresh_token;
    if (incomingRefreshToken) {
      await RefreshToken.destroy({ where: { user_id: req.user.id, token: incomingRefreshToken } });
    } else {
      await RefreshToken.destroy({ where: { user_id: req.user.id } });
    }
    // Invalidate Redis identity cache immediately
    await deleteCache(`auth:identity:${req.user.id}`);
  }
  res.json({ message: "Logged out successfully" });
});

// ─────────────────────────────────────────────────────────────────────────────
// Change password
// ─────────────────────────────────────────────────────────────────────────────
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
  user.must_change_password = false;
  // Invalidate any stored refresh_tokens on password change for security
  await RefreshToken.destroy({ where: { user_id: user.id } });
  await user.save();
  // Invalidate Redis identity cache immediately
  await deleteCache(`auth:identity:${req.user.id}`);

  res.json({ message: "Password updated successfully" });
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin: reset another user's password
// ─────────────────────────────────────────────────────────────────────────────
export const adminResetUserPassword = asyncHandler(async (req, res) => {
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

  if (req.user.role === "school_admin" && targetUser.school_id !== req.user.school_id) {
    throw new AppError("Forbidden: Cannot reset password for a user from another school", 403);
  }

  if (targetUser.role === "school_admin" || targetUser.role === "super_admin") {
    throw new AppError("Forbidden: Cannot reset admin password using this endpoint", 403);
  }

  targetUser.password = new_password;
  targetUser.must_change_password = true;
  // Invalidate any active sessions for the target user
  await RefreshToken.destroy({ where: { user_id: targetUser.id } });
  await targetUser.save();
  // Invalidate Redis identity cache immediately
  await deleteCache(`auth:identity:${targetUser.id}`);

  res.json({ message: "Password reset successfully" });
});

// ─────────────────────────────────────────────────────────────────────────────
// Update own profile
// ─────────────────────────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar_url } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

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
