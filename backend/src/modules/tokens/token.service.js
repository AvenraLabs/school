import TokenAccount from "./token-account.model.js";
import TokenTransaction from "./token-transaction.model.js";
import TokenPolicy from "./token-policy.model.js";
import AppError from "../../shared/appError.js";
import User from "../users/user.model.js";
import AiChatLog from "../ai-chat-logs/ai-chat-log.model.js";
import VideoGeneration from "../ai-video/video-generation.model.js";
import WhatsappLog from "../whatsapp/whatsapp-log.model.js";
import TripLocation from "../transport/trip-location.model.js";
import Trip from "../transport/trip.model.js";
import TransportRequest from "../transport/transport-request.model.js";
import School from "../schools/school.model.js";
import db from "../../config/db.js";
import { fn, col, literal } from "sequelize";

export async function ensureTokenAccount(userId, transaction = null) {
  const tOpt = transaction ? { transaction } : {};
  const user = await User.findByPk(userId, tOpt);
  if (!user) return null;

  let account = await TokenAccount.findOne({ where: { user_id: userId }, ...tOpt });
  if (account) return account;

  let policy = await TokenPolicy.findOne({ where: { role: user.role }, ...tOpt });
  if (!policy) {
    const defaultTokens = user.role === "student" ? 3000000 : (user.role === "teacher" ? 10000000 : 0);
    const defaultVideoSeconds = 0;
    const defaultImageGenerations = user.role === "teacher" ? 500 : 0;
    policy = await TokenPolicy.create({
      role: user.role,
      annual_tokens: defaultTokens,
      annual_video_seconds: defaultVideoSeconds,
      annual_image_generations: defaultImageGenerations,
    }, tOpt);
  }

  const initialBalance = policy.annual_tokens ?? 0;
  const initialVideoSeconds = policy.annual_video_seconds ?? 0;
  const initialImageGenerations = policy.annual_image_generations ?? 0;

  account = await TokenAccount.create({
    user_id: userId,
    balance: initialBalance,
    video_seconds_balance: initialVideoSeconds,
    image_generation_balance: initialImageGenerations,
    expires_at: null,
  }, tOpt);

  if (initialBalance > 0) {
    await TokenTransaction.create({
      user_id: userId,
      type: "admin_adjustment",
      resource_type: "tokens",
      change: initialBalance,
      balance_before: 0,
      balance_after: initialBalance,
    }, tOpt);
  }

  return account;
}

export async function assertHasTokenBalance(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Admin roles bypass token limits
  if (!["student", "teacher"].includes(user.role)) {
    return;
  }

  const account = await ensureTokenAccount(userId);
  if (!account || account.balance <= 0) {
    throw new AppError(
      "You have used all your AI tokens for this academic year (0 tokens remaining). Please contact your school administrator to add tokens.",
      402
    );
  }
}

export async function assertHasVideoSecondsBalance(userId, durationSec = 5) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === "student") {
    throw new AppError("AI video generation is only available for teachers.", 403);
  }

  if (!["teacher"].includes(user.role)) {
    return;
  }

  const account = await ensureTokenAccount(userId);
  if (!account || (account.video_seconds_balance ?? 0) <= 0) {
    throw new AppError(
      "You have used all your annual AI video creation quota (0 video seconds remaining). Please contact your school administrator to add video seconds.",
      402
    );
  }
}

export async function assertHasImageGenerationBalance(userId, count = 1) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === "student") {
    throw new AppError("AI image generation is only available for teachers.", 403);
  }

  if (!["teacher"].includes(user.role)) {
    return;
  }

  const account = await ensureTokenAccount(userId);
  if (!account || (account.image_generation_balance ?? 0) < count) {
    throw new AppError(
      "You have used all your annual AI diagram creation quota (0 diagrams remaining). Please contact your school administrator to add diagram generations.",
      402
    );
  }
}

/**
 * Atomic Check & Deduct Tokens (Row-level Lock)
 */
export async function checkAndDeductTokens({ userId, amount, reason, refId }, options = {}) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!["student", "teacher"].includes(user.role)) {
    return;
  }

  const amt = Number(amount);
  if (amt <= 0) return;

  const executeDeduct = async (t) => {
    await ensureTokenAccount(userId, t);
    const account = await TokenAccount.findOne({
      where: { user_id: userId },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!account || account.balance < amt) {
      throw new AppError(
        `Insufficient AI tokens. Balance: ${account?.balance || 0}, required: ${amt}. Please contact your administrator.`,
        402
      );
    }

    const before = account.balance;
    account.balance = before - amt;
    await account.save({ transaction: t });
    const after = account.balance;

    await TokenTransaction.create(
      {
        user_id: userId,
        type: "usage",
        resource_type: "tokens",
        change: -amt,
        balance_before: before,
        balance_after: after,
        ref_id: refId || null,
        reason: reason || null,
      },
      { transaction: t }
    );
  };

  if (options.transaction) {
    await executeDeduct(options.transaction);
  } else {
    await db.transaction(async (t) => {
      await executeDeduct(t);
    });
  }
}

/**
 * Atomic Check & Deduct Video Seconds (Row-level Lock)
 */
export async function checkAndDeductVideoSeconds({ userId, durationSec = 5, reason, refId }, options = {}) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === "student") {
    throw new AppError("AI video generation is only available for teachers.", 403);
  }

  if (!["teacher"].includes(user.role)) {
    return;
  }

  const sec = Number(durationSec) || 5;
  if (sec <= 0) return;

  const executeDeduct = async (t) => {
    await ensureTokenAccount(userId, t);
    const account = await TokenAccount.findOne({
      where: { user_id: userId },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    const currentBal = account?.video_seconds_balance ?? 0;
    if (!account || currentBal < sec) {
      throw new AppError(
        `You have used all your annual AI video creation quota (${currentBal} video seconds remaining). Please contact your administrator.`,
        402
      );
    }

    const before = currentBal;
    account.video_seconds_balance = before - sec;
    await account.save({ transaction: t });
    const after = account.video_seconds_balance;

    await TokenTransaction.create(
      {
        user_id: userId,
        type: "usage",
        resource_type: "video_seconds",
        change: -sec,
        balance_before: before,
        balance_after: after,
        ref_id: refId || null,
        reason: reason || null,
      },
      { transaction: t }
    );
  };

  if (options.transaction) {
    await executeDeduct(options.transaction);
  } else {
    await db.transaction(async (t) => {
      await executeDeduct(t);
    });
  }
}

/**
 * Atomic Check & Deduct Image Generation Quota (Row-level Lock)
 */
export async function checkAndDeductImageGeneration({ userId, count = 1, reason, refId }, options = {}) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === "student") {
    throw new AppError("AI image generation is only available for teachers.", 403);
  }

  if (!["teacher"].includes(user.role)) {
    return;
  }

  const cnt = Number(count) || 1;
  if (cnt <= 0) return;

  const executeDeduct = async (t) => {
    await ensureTokenAccount(userId, t);
    const account = await TokenAccount.findOne({
      where: { user_id: userId },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    const currentBal = account?.image_generation_balance ?? 0;
    if (!account || currentBal < cnt) {
      throw new AppError(
        `You have used all your annual AI diagram creation quota (${currentBal} diagrams remaining). Please contact your administrator.`,
        402
      );
    }

    const before = currentBal;
    account.image_generation_balance = before - cnt;
    await account.save({ transaction: t });
    const after = account.image_generation_balance;

    await TokenTransaction.create(
      {
        user_id: userId,
        type: "usage",
        resource_type: "image_generations",
        change: -cnt,
        balance_before: before,
        balance_after: after,
        ref_id: refId || null,
        reason: reason || null,
      },
      { transaction: t }
    );
  };

  if (options.transaction) {
    await executeDeduct(options.transaction);
  } else {
    await db.transaction(async (t) => {
      await executeDeduct(t);
    });
  }
}

export async function deductTokens({ userId, amount, reason, refId }) {
  await checkAndDeductTokens({ userId, amount, reason, refId });
}

export async function deductVideoSeconds({ userId, durationSec = 5, reason, refId }) {
  await checkAndDeductVideoSeconds({ userId, durationSec, reason, refId });
}

export async function deductImageGeneration({ userId, count = 1, reason, refId }) {
  await checkAndDeductImageGeneration({ userId, count, reason, refId });
}

/**
 * Refunds all quotas (tokens, video_seconds, image_generations) associated with a generation job ID.
 * Looks up original usage transactions where ref_id = generationId and type = "usage".
 */
export async function refundGenerationQuotas({ userId, generationId, resourceTypes = null }) {
  if (!userId || !generationId) return;

  const whereClause = {
    user_id: userId,
    ref_id: generationId,
    type: "usage",
  };

  if (Array.isArray(resourceTypes) && resourceTypes.length > 0) {
    whereClause.resource_type = resourceTypes;
  }

  const usageTxs = await TokenTransaction.findAll({
    where: whereClause,
  });

  if (!usageTxs || usageTxs.length === 0) return;

  await db.transaction(async (t) => {
    const account = await TokenAccount.findOne({
      where: { user_id: userId },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!account) return;

    for (const tx of usageTxs) {
      // Prevent duplicate refunds
      const existingRefund = await TokenTransaction.findOne({
        where: {
          user_id: userId,
          ref_id: generationId,
          resource_type: tx.resource_type,
          type: "refund",
        },
        transaction: t,
      });

      if (existingRefund) continue;

      const refundAmount = Math.abs(tx.change);
      if (refundAmount <= 0) continue;

      let before = 0;
      let after = 0;

      if (tx.resource_type === "video_seconds") {
        before = account.video_seconds_balance ?? 0;
        account.video_seconds_balance = before + refundAmount;
        after = account.video_seconds_balance;
      } else if (tx.resource_type === "image_generations") {
        before = account.image_generation_balance ?? 0;
        account.image_generation_balance = before + refundAmount;
        after = account.image_generation_balance;
      } else {
        // default "tokens"
        before = account.balance ?? 0;
        account.balance = before + refundAmount;
        after = account.balance;
      }

      await account.save({ transaction: t });

      await TokenTransaction.create(
        {
          user_id: userId,
          type: "refund",
          resource_type: tx.resource_type,
          change: refundAmount,
          balance_before: before,
          balance_after: after,
          ref_id: generationId,
          reason: `Refund for failed generation #${generationId}`,
        },
        { transaction: t }
      );
    }
  });
}

export async function setRoleAnnualTokens({
  role,
  annual_tokens,
  annual_video_seconds,
  annual_image_generations,
  mode = "replace",
  school_id = null,
  updated_by = null,
}) {
  if (!["student", "teacher"].includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  const updateData = {};
  if (annual_tokens !== undefined) {
    if (Number.isNaN(Number(annual_tokens)) || annual_tokens < 0) {
      throw new AppError("Invalid annual_tokens", 400);
    }
    updateData.annual_tokens = Number(annual_tokens);
  }
  if (annual_video_seconds !== undefined) {
    if (Number.isNaN(Number(annual_video_seconds)) || annual_video_seconds < 0) {
      throw new AppError("Invalid annual_video_seconds", 400);
    }
    updateData.annual_video_seconds = Number(annual_video_seconds);
  }
  if (annual_image_generations !== undefined) {
    if (Number.isNaN(Number(annual_image_generations)) || annual_image_generations < 0) {
      throw new AppError("Invalid annual_image_generations", 400);
    }
    updateData.annual_image_generations = Number(annual_image_generations);
  }

  let policy = await TokenPolicy.findOne({ where: { role } });
  if (policy) {
    const newTokens =
      updateData.annual_tokens !== undefined
        ? mode === "add"
          ? (policy.annual_tokens ?? 0) + updateData.annual_tokens
          : updateData.annual_tokens
        : policy.annual_tokens;
    const newVideo =
      updateData.annual_video_seconds !== undefined
        ? mode === "add"
          ? (policy.annual_video_seconds ?? 0) + updateData.annual_video_seconds
          : updateData.annual_video_seconds
        : policy.annual_video_seconds;
    const newImage =
      updateData.annual_image_generations !== undefined
        ? mode === "add"
          ? (policy.annual_image_generations ?? 0) + updateData.annual_image_generations
          : updateData.annual_image_generations
        : policy.annual_image_generations;

    await policy.update({
      annual_tokens: newTokens,
      annual_video_seconds: newVideo,
      annual_image_generations: newImage,
      updated_by,
    });
  } else {
    policy = await TokenPolicy.create({
      role,
      annual_tokens: updateData.annual_tokens ?? (role === "student" ? 3000000 : 10000000),
      annual_video_seconds: updateData.annual_video_seconds ?? 0,
      annual_image_generations: updateData.annual_image_generations ?? 0,
      updated_by,
    });
  }

  const users = await User.findAll({
    where: {
      role,
      ...(school_id ? { school_id } : {}),
    },
    attributes: ["id"],
  });

  for (const u of users) {
    const account = await ensureTokenAccount(u.id);
    if (!account) continue;

    if (updateData.annual_tokens !== undefined) {
      const before = account.balance;
      const after = mode === "add" ? before + updateData.annual_tokens : updateData.annual_tokens;

      if (after !== before) {
        account.balance = after;
        await account.save();

        await TokenTransaction.create({
          user_id: u.id,
          type: "admin_adjustment",
          resource_type: "tokens",
          change: after - before,
          balance_before: before,
          balance_after: after,
        });
      }
    }

    if (updateData.annual_video_seconds !== undefined) {
      const beforeVid = account.video_seconds_balance ?? 0;
      const afterVid =
        mode === "add" ? beforeVid + updateData.annual_video_seconds : updateData.annual_video_seconds;

      if (afterVid !== beforeVid) {
        account.video_seconds_balance = afterVid;
        await account.save();

        await TokenTransaction.create({
          user_id: u.id,
          type: "admin_adjustment",
          resource_type: "video_seconds",
          change: afterVid - beforeVid,
          balance_before: beforeVid,
          balance_after: afterVid,
        });
      }
    }

    if (updateData.annual_image_generations !== undefined) {
      const beforeImg = account.image_generation_balance ?? 0;
      const afterImg =
        mode === "add" ? beforeImg + updateData.annual_image_generations : updateData.annual_image_generations;

      if (afterImg !== beforeImg) {
        account.image_generation_balance = afterImg;
        await account.save();

        await TokenTransaction.create({
          user_id: u.id,
          type: "admin_adjustment",
          resource_type: "image_generations",
          change: afterImg - beforeImg,
          balance_before: beforeImg,
          balance_after: afterImg,
        });
      }
    }
  }
}

export async function adjustUserTokens({ user_id, amount, mode = "add" }) {
  const account = await ensureTokenAccount(user_id);
  if (!account) throw new AppError("User not found", 404);

  const before = account.balance;
  const after = mode === "set" ? Number(amount) : before + Number(amount);

  if (Number.isNaN(after) || after < 0) {
    throw new AppError("Invalid amount", 400);
  }

  account.balance = after;
  await account.save();

  await TokenTransaction.create({
    user_id,
    type: "admin_adjustment",
    resource_type: "tokens",
    change: after - before,
    balance_before: before,
    balance_after: after,
  });

  return account;
}

export async function replenishSchoolYearlyTokens(schoolId, transaction = null) {
  const tOpt = transaction ? { transaction } : {};

  let studentPolicy = await TokenPolicy.findOne({ where: { role: "student" }, ...tOpt });
  if (!studentPolicy) {
    studentPolicy = await TokenPolicy.create({ role: "student", annual_tokens: 3000000 }, tOpt);
  }

  let teacherPolicy = await TokenPolicy.findOne({ where: { role: "teacher" }, ...tOpt });
  if (!teacherPolicy) {
    teacherPolicy = await TokenPolicy.create({ role: "teacher", annual_tokens: 10000000 }, tOpt);
  }

  const users = await User.findAll({
    where: { school_id: schoolId, role: ["student", "teacher"] },
    ...tOpt,
  });

  for (const u of users) {
    let account = await TokenAccount.findOne({ where: { user_id: u.id }, ...tOpt });
    const baseline = u.role === "student" ? studentPolicy.annual_tokens : teacherPolicy.annual_tokens;

    if (!account) {
      account = await TokenAccount.create({
        user_id: u.id,
        balance: baseline,
        expires_at: null,
      }, tOpt);

      await TokenTransaction.create({
        user_id: u.id,
        type: "admin_adjustment",
        resource_type: "tokens",
        change: baseline,
        balance_before: 0,
        balance_after: baseline,
      }, tOpt);
    } else {
      const before = account.balance;
      account.balance = baseline;
      await account.save(tOpt);

      if (baseline !== before) {
        await TokenTransaction.create({
          user_id: u.id,
          type: "admin_adjustment",
          resource_type: "tokens",
          change: baseline - before,
          balance_before: before,
          balance_after: baseline,
        }, tOpt);
      }
    }
  }
}

export async function setSchoolWhatsAppQuota({ school_id, annual_limit, mode = "replace" }) {
  const school = await School.findByPk(school_id);
  if (!school) throw new AppError("School not found", 404);

  const limitVal = Number(annual_limit);
  if (Number.isNaN(limitVal) || limitVal < 0) {
    throw new AppError("Invalid annual limit value", 400);
  }

  const currentLimit = school.whatsapp_annual_limit ?? 10000;
  const newLimit = mode === "add" ? currentLimit + limitVal : limitVal;

  await school.update({ whatsapp_annual_limit: newLimit });
  return school;
}

export async function getBillingSummaryService({ school_id = null }) {
  const whereSchool = school_id ? { id: school_id } : {};

  const schools = await School.findAll({
    where: whereSchool,
    attributes: [
      "id",
      "school_name",
      "status",
      "whatsapp_annual_limit",
      "whatsapp_sent_count",
      "google_maps_enabled",
    ],
    order: [["id", "ASC"]],
  });

  const result = [];

  for (const sch of schools) {
    const sid = sch.id;

    // 1. AI Tokens usage
    const aiStats = await AiChatLog.findAll({
      attributes: [
        [fn("COUNT", col("id")), "total_calls"],
        [fn("SUM", literal("COALESCE(prompt_tokens, 0) + COALESCE(candidate_tokens, 0)")), "total_tokens"],
      ],
      include: [
        {
          model: User,
          attributes: [],
          where: { school_id: sid },
          required: true,
        },
      ],
      raw: true,
    });

    const aiCalls = Number(aiStats[0]?.total_calls || 0);
    const aiTokens = Number(aiStats[0]?.total_tokens || 0);
    const estAiCost = Number(((aiTokens / 1000) * 0.05).toFixed(2));

    // 2. AI Video seconds usage
    const videoStats = await VideoGeneration.findAll({
      attributes: [
        [fn("COUNT", col("id")), "total_videos"],
        [fn("SUM", col("duration")), "total_seconds"],
      ],
      where: {
        school_id: sid,
        status: ["completed", "success"],
      },
      raw: true,
    });

    const videoCount = Number(videoStats[0]?.total_videos || 0);
    const videoSecs = Number(videoStats[0]?.total_seconds || 0);
    const estVideoCost = Number(((videoSecs / 60) * 2.0).toFixed(2));

    // 2b. AI Image / Diagram generation usage
    const imageStats = await VideoGeneration.findAll({
      attributes: [[fn("COUNT", col("id")), "total_diagrams"]],
      where: {
        school_id: sid,
        status: ["completed", "success"],
        [Op.or]: [{ content_type: "diagram_only" }, { image_url: { [Op.ne]: null } }],
      },
      raw: true,
    });
    const diagramCount = Number(imageStats[0]?.total_diagrams || 0);
    const estDiagramCost = Number((diagramCount * 1.0).toFixed(2));

    // 3. WhatsApp messages usage
    const whatsappLimit = sch.whatsapp_annual_limit ?? 10000;
    const waCountResult = await WhatsappLog.findAll({
      attributes: [[fn("COUNT", col("id")), "sent_count"]],
      where: {
        school_id: sid,
        status: ["sent", "success", "delivered"],
      },
      raw: true,
    });
    const whatsappSent = Number(waCountResult[0]?.sent_count || 0);
    const estWhatsappCost = Number((whatsappSent * 0.75).toFixed(2));

    // 4. Google Maps API calls
    const locStats = await TripLocation.findAll({
      attributes: [[fn("COUNT", col("trip_location.id")), "location_updates"]],
      include: [
        {
          model: Trip,
          attributes: [],
          where: { school_id: sid },
          required: true,
        },
      ],
      raw: true,
    });

    const reqStats = await TransportRequest.findAll({
      attributes: [[fn("COUNT", col("id")), "requests"]],
      where: { school_id: sid },
      raw: true,
    });

    const mapsCalls = Number(locStats[0]?.location_updates || 0) + Number(reqStats[0]?.requests || 0);
    const estMapsCost = Number(((mapsCalls / 1000) * 400).toFixed(2));

    const totalCost = Number((estAiCost + estVideoCost + estDiagramCost + estWhatsappCost + estMapsCost).toFixed(2));

    result.push({
      school_id: sid,
      school_name: sch.school_name,
      status: sch.status,
      ai: {
        calls_count: aiCalls,
        tokens_used: aiTokens,
        estimated_cost_inr: estAiCost,
      },
      video: {
        count: videoCount,
        seconds_used: videoSecs,
        estimated_cost_inr: estVideoCost,
      },
      diagram: {
        count: diagramCount,
        estimated_cost_inr: estDiagramCost,
      },
      whatsapp: {
        sent_count: whatsappSent,
        annual_limit: whatsappLimit,
        percentage_used: whatsappLimit > 0 ? Math.round((whatsappSent / whatsappLimit) * 100) : 0,
        estimated_cost_inr: estWhatsappCost,
      },
      google_maps: {
        api_calls_count: mapsCalls,
        enabled: sch.google_maps_enabled,
        estimated_cost_inr: estMapsCost,
      },
      total_estimated_cost_inr: totalCost,
    });
  }

  return result;
}

export async function getApiLogsFeedService({ school_id = null, type = "all", limit = 50, offset = 0 }) {
  let logs = [];

  if (type === "all" || type === "whatsapp") {
    const waWhere = school_id ? { school_id } : {};
    const waLogs = await WhatsappLog.findAll({
      where: waWhere,
      limit: Number(limit),
      offset: Number(offset),
      order: [["created_at", "DESC"]],
      include: [{ model: School, attributes: ["school_name"] }],
    });
    waLogs.forEach((l) => {
      logs.push({
        id: `wa_${l.id}`,
        category: "WhatsApp API",
        school_name: l.school?.school_name || `School #${l.school_id || 'System'}`,
        recipient: l.phone,
        status: l.status,
        details: l.message ? l.message.slice(0, 100) : "WhatsApp message",
        error: l.error || null,
        created_at: l.createdAt,
      });
    });
  }

  if (type === "all" || type === "ai") {
    const aiLogs = await AiChatLog.findAll({
      limit: Number(limit),
      offset: Number(offset),
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["name", "school_id"],
          where: school_id ? { school_id } : {},
          include: [{ model: School, attributes: ["school_name"] }],
        },
      ],
    });
    aiLogs.forEach((l) => {
      const tokens = (l.prompt_tokens || 0) + (l.candidate_tokens || 0);
      logs.push({
        id: `ai_${l.id}`,
        category: "AI Chat Tokens",
        school_name: l.user?.school?.school_name || `School #${l.user?.school_id || 'System'}`,
        recipient: l.user?.name || `User #${l.user_id}`,
        status: "success",
        details: `${tokens} tokens (${l.model || 'Gemini'})`,
        error: null,
        created_at: l.createdAt,
      });
    });
  }

  if (type === "all" || type === "video") {
    const vWhere = school_id ? { school_id } : {};
    const vLogs = await VideoGeneration.findAll({
      where: vWhere,
      limit: Number(limit),
      offset: Number(offset),
      order: [["created_at", "DESC"]],
      include: [{ model: School, attributes: ["school_name"] }],
    });
    vLogs.forEach((l) => {
      logs.push({
        id: `vid_${l.id}`,
        category: "AI Video Gen",
        school_name: l.school?.school_name || `School #${l.school_id}`,
        recipient: l.topic ? l.topic.slice(0, 60) : "Video topic",
        status: l.status,
        details: `${l.duration || 5}s video (${l.render_engine || 'default'})`,
        error: l.error_message || null,
        created_at: l.createdAt,
      });
    });
  }

  logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return logs.slice(0, Number(limit));
}
