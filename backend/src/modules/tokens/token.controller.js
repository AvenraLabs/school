import asyncHandler from "../../shared/asyncHandler.js";
import TokenPolicy from "./token-policy.model.js";
import TokenAccount from "./token-account.model.js";
import TokenTransaction from "./token-transaction.model.js";
import User from "../users/user.model.js";
import {
  setRoleAnnualTokens,
  adjustUserTokens,
  getBillingSummaryService,
  getApiLogsFeedService,
  setSchoolWhatsAppQuota,
} from "./token.service.js";
import { getPagination } from "../../shared/utils/pagination.js";

export const getTokenPolicies = asyncHandler(async (req, res) => {
  const school_id = req.query.school_id ? Number(req.query.school_id) : null;
  let whereClause = {};
  if (school_id !== null) {
    whereClause = { school_id };
  }
  let policies = [];
  try {
    policies = await TokenPolicy.findAll({ where: whereClause, order: [["role", "ASC"]] });
  } catch (err) {
    if (err.message?.includes("annual_video_seconds")) {
      const db = (await import("../../config/db.js")).default;
      await db.query(`ALTER TABLE token_policies ADD COLUMN IF NOT EXISTS annual_video_seconds INTEGER DEFAULT 0;`).catch(() => {});
      policies = await TokenPolicy.findAll({ where: whereClause, order: [["role", "ASC"]] });
    } else {
      throw err;
    }
  }
  res.json({ success: true, items: policies });
});

export const setTokenPolicies = asyncHandler(async (req, res) => {
  const {
    student_annual,
    teacher_annual,
    teacher_video_seconds,
    student_video_seconds,
    teacher_image_generations,
    student_image_generations,
    whatsapp_annual_limit,
    role,
    annual_tokens,
    annual_video_seconds,
    annual_image_generations,
    mode = "replace",
    school_id = null,
  } = req.body;

  if (student_annual !== undefined || student_video_seconds !== undefined || student_image_generations !== undefined) {
    await setRoleAnnualTokens({
      role: "student",
      ...(student_annual !== undefined ? { annual_tokens: Number(student_annual) } : {}),
      ...(student_video_seconds !== undefined ? { annual_video_seconds: Number(student_video_seconds) } : {}),
      ...(student_image_generations !== undefined ? { annual_image_generations: Number(student_image_generations) } : {}),
      mode,
      school_id,
      updated_by: req.user.id,
    });
  } else if (role === "student" && (annual_tokens !== undefined || annual_video_seconds !== undefined || annual_image_generations !== undefined)) {
    await setRoleAnnualTokens({
      role: "student",
      ...(annual_tokens !== undefined ? { annual_tokens: Number(annual_tokens) } : {}),
      ...(annual_video_seconds !== undefined ? { annual_video_seconds: Number(annual_video_seconds) } : {}),
      ...(annual_image_generations !== undefined ? { annual_image_generations: Number(annual_image_generations) } : {}),
      mode,
      school_id,
      updated_by: req.user.id,
    });
  }

  if (teacher_annual !== undefined || teacher_video_seconds !== undefined || teacher_image_generations !== undefined) {
    await setRoleAnnualTokens({
      role: "teacher",
      ...(teacher_annual !== undefined ? { annual_tokens: Number(teacher_annual) } : {}),
      ...(teacher_video_seconds !== undefined ? { annual_video_seconds: Number(teacher_video_seconds) } : {}),
      ...(teacher_image_generations !== undefined ? { annual_image_generations: Number(teacher_image_generations) } : {}),
      mode,
      school_id,
      updated_by: req.user.id,
    });
  } else if (role === "teacher" && (annual_tokens !== undefined || annual_video_seconds !== undefined || annual_image_generations !== undefined)) {
    await setRoleAnnualTokens({
      role: "teacher",
      ...(annual_tokens !== undefined ? { annual_tokens: Number(annual_tokens) } : {}),
      ...(annual_video_seconds !== undefined ? { annual_video_seconds: Number(annual_video_seconds) } : {}),
      ...(annual_image_generations !== undefined ? { annual_image_generations: Number(annual_image_generations) } : {}),
      mode,
      school_id,
      updated_by: req.user.id,
    });
  }

  if (whatsapp_annual_limit !== undefined && school_id) {
    await setSchoolWhatsAppQuota({
      school_id: Number(school_id),
      annual_limit: Number(whatsapp_annual_limit),
      mode,
    });
  }

  res.json({ success: true, message: "Token, Video, Image, and WhatsApp policies updated successfully" });
});

export const listTokenAccounts = asyncHandler(async (req, res) => {
  const { limit, offset } = getPagination(req.query);
  const { school_id, role } = req.query;

  const whereUser = {};
  if (school_id) whereUser.school_id = Number(school_id);
  if (role) whereUser.role = role;

  const result = await TokenAccount.findAndCountAll({
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "role", "school_id"],
        where: whereUser,
      },
    ],
    limit,
    offset,
    order: [["updated_at", "DESC"]],
  });

  res.json({
    success: true,
    total: result.count,
    items: result.rows,
  });
});

export const listTokenTransactions = asyncHandler(async (req, res) => {
  const { limit, offset } = getPagination(req.query);
  const { school_id, user_id } = req.query;

  const whereUser = {};
  if (school_id) whereUser.school_id = Number(school_id);
  if (user_id) whereUser.id = Number(user_id);

  const result = await TokenTransaction.findAndCountAll({
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "role", "school_id"],
        where: whereUser,
      },
    ],
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  res.json({
    success: true,
    total: result.count,
    items: result.rows,
  });
});

export const adjustUserTokenBalance = asyncHandler(async (req, res) => {
  const { amount, mode = "add" } = req.body;
  const user_id = Number(req.params.userId);

  const account = await adjustUserTokens({ user_id, amount, mode });
  res.json({ success: true, data: account });
});

export const getBillingSummary = asyncHandler(async (req, res) => {
  const school_id = req.query.school_id ? Number(req.query.school_id) : null;
  const result = await getBillingSummaryService({ school_id });
  res.json({
    success: true,
    summary: result.summary,
    items: result.items,
  });
});

export const getApiLogsFeed = asyncHandler(async (req, res) => {
  const { school_id, type, limit = 50, offset = 0 } = req.query;
  const logs = await getApiLogsFeedService({
    school_id: school_id ? Number(school_id) : null,
    type: type || "all",
    limit: Number(limit),
    offset: Number(offset),
  });
  res.json({ success: true, items: logs });
});

export const updateSchoolWhatsAppQuota = asyncHandler(async (req, res) => {
  const { annual_limit, mode = "replace" } = req.body;
  const school_id = Number(req.params.schoolId);

  const school = await setSchoolWhatsAppQuota({ school_id, annual_limit, mode });
  res.json({ success: true, data: school });
});
