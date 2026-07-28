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
import { fn, col, literal } from "sequelize";

export async function ensureTokenAccount(userId) {
  const user = await User.findByPk(userId);
  if (!user) return null;

  let account = await TokenAccount.findOne({ where: { user_id: userId } });
  if (account) return account;

  let policy = await TokenPolicy.findOne({ where: { role: user.role } });
  if (!policy) {
    const defaultTokens = user.role === "student" ? 3000000 : (user.role === "teacher" ? 10000000 : 0);
    const defaultVideoSeconds = 0;
    policy = await TokenPolicy.create({
      role: user.role,
      annual_tokens: defaultTokens,
      annual_video_seconds: defaultVideoSeconds,
    });
  }
  const initialBalance = policy.annual_tokens ?? 0;
  const initialVideoSeconds = policy.annual_video_seconds ?? 0;

  account = await TokenAccount.create({
    user_id: userId,
    balance: initialBalance,
    video_seconds_balance: initialVideoSeconds,
    expires_at: null,
  });

  if (initialBalance > 0) {
    await TokenTransaction.create({
      user_id: userId,
      type: "admin_adjustment",
      change: initialBalance,
      balance_before: 0,
      balance_after: initialBalance,
    });
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

  // Students do not have AI video generation access
  if (user.role === "student") {
    throw new AppError("AI video generation is only available for teachers.", 403);
  }

  // Admin roles bypass video token limits
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

export async function deductTokens({ userId, amount, reason, refId }) {
  const user = await User.findByPk(userId);
  if (!user || !["student", "teacher"].includes(user.role)) {
    return;
  }

  if (amount <= 0) {
    return;
  }

  const account = await ensureTokenAccount(userId);
  if (!account) return;

  const before = account.balance;
  account.balance = Math.max(0, account.balance - amount);
  await account.save();
  const after = account.balance;

  await TokenTransaction.create({
    user_id: userId,
    type: "usage",
    change: -amount,
    balance_before: before,
    balance_after: after,
  });
}

export async function deductVideoSeconds({ userId, durationSec = 5, reason, refId }) {
  const user = await User.findByPk(userId);
  if (!user || !["student", "teacher"].includes(user.role)) {
    return;
  }

  const sec = Number(durationSec) || 5;
  if (sec <= 0) return;

  const account = await ensureTokenAccount(userId);
  if (!account) return;

  const before = account.video_seconds_balance ?? 0;
  account.video_seconds_balance = Math.max(0, before - sec);
  await account.save();
  const after = account.video_seconds_balance;

  await TokenTransaction.create({
    user_id: userId,
    type: "usage",
    change: -sec,
    balance_before: before,
    balance_after: after,
  });
}

export async function setRoleAnnualTokens({
  role,
  annual_tokens,
  annual_video_seconds,
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

    await policy.update({
      annual_tokens: newTokens,
      annual_video_seconds: newVideo,
      updated_by,
    });
  } else {
    policy = await TokenPolicy.create({
      role,
      annual_tokens: updateData.annual_tokens ?? (role === "student" ? 3000000 : 10000000),
      annual_video_seconds: updateData.annual_video_seconds ?? 0,
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
      const after =
        mode === "add" ? before + updateData.annual_tokens : updateData.annual_tokens;

      if (after !== before) {
        account.balance = after;
        await account.save();

        await TokenTransaction.create({
          user_id: u.id,
          type: "admin_adjustment",
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
          change: afterVid - beforeVid,
          balance_before: beforeVid,
          balance_after: afterVid,
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
    change: after - before,
    balance_before: before,
    balance_after: after,
  });

  return account;
}

export async function replenishSchoolYearlyTokens(schoolId, transaction = null) {
  const tOpt = transaction ? { transaction } : {};

  // Fetch policies (or auto-create default policies if they don't exist yet)
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
      "whatsapp_bus_start_enabled",
      "whatsapp_bus_end_enabled",
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
    // Cost: ₹0.05 per 1,000 tokens
    const estAiCost = Number(((aiTokens / 1000) * 0.05).toFixed(2));

    // 2. AI Video seconds usage
    const videoStats = await VideoGeneration.findAll({
      attributes: [
        [fn("COUNT", col("id")), "total_videos"],
        [fn("SUM", col("duration")), "total_seconds"],
      ],
      where: { school_id: sid },
      raw: true,
    });

    const videoCount = Number(videoStats[0]?.total_videos || 0);
    const videoSecs = Number(videoStats[0]?.total_seconds || 0);
    // Cost: ₹2.00 per video minute (60s)
    const estVideoCost = Number(((videoSecs / 60) * 2.0).toFixed(2));

    // 3. WhatsApp messages usage
    const whatsappLimit = sch.whatsapp_annual_limit ?? 10000;
    const whatsappSent = sch.whatsapp_sent_count ?? 0;
    // Cost: ₹0.75 per message
    const estWhatsappCost = Number((whatsappSent * 0.75).toFixed(2));

    // 4. Google Maps API calls (Trip Locations + Transport Requests)
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
    // Cost: ₹400 per 1,000 API requests
    const estMapsCost = Number(((mapsCalls / 1000) * 400).toFixed(2));

    const totalCost = Number((estAiCost + estVideoCost + estWhatsappCost + estMapsCost).toFixed(2));

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

  // Sort logs combined by created_at DESC
  logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return logs.slice(0, Number(limit));
}
