import TokenAccount from "./token-account.model.js";
import TokenTransaction from "./token-transaction.model.js";
import TokenPolicy from "./token-policy.model.js";
import AppError from "../../shared/appError.js";
import User from "../users/user.model.js";

export async function ensureTokenAccount(userId) {
  const user = await User.findByPk(userId);
  if (!user) return null;

  let account = await TokenAccount.findOne({ where: { user_id: userId } });
  if (account) return account;

  let policy = await TokenPolicy.findOne({ where: { role: user.role } });
  if (!policy) {
    const defaultTokens = user.role === "student" ? 3000000 : (user.role === "teacher" ? 10000000 : 0);
    policy = await TokenPolicy.create({
      role: user.role,
      annual_tokens: defaultTokens,
    });
  }
  const initialBalance = policy.annual_tokens ?? 0;

  account = await TokenAccount.create({
    user_id: userId,
    balance: initialBalance,
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

export async function deductTokens({ userId, amount, reason, refId }) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 🔹 Only students & teachers use AI
  if (!["student", "teacher"].includes(user.role)) {
    throw new AppError("AI access not allowed for this role", 403);
  }

  // 🔒 Check school subscription EARLY
  // 🔹 Skip token work if no tokens used
  if (amount <= 0) {
    return;
  }

  const account = await ensureTokenAccount(userId);

  if (!account || account.balance < amount) {
    throw new AppError("Insufficient AI tokens", 402);
  }

  const before = account.balance;
  account.balance -= amount;
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

export async function setRoleAnnualTokens({
  role,
  annual_tokens,
  mode = "replace",
  school_id = null,
  updated_by = null,
}) {
  if (!["student", "teacher"].includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  if (Number.isNaN(Number(annual_tokens)) || annual_tokens < 0) {
    throw new AppError("Invalid annual_tokens", 400);
  }

  await TokenPolicy.upsert({
    role,
    annual_tokens,
    updated_by,
  });

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

    const before = account.balance;
    const after =
      mode === "add" ? before + Number(annual_tokens) : Number(annual_tokens);

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
