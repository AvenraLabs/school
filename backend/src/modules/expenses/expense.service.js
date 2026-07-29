import ExpenseCategory from "./expense-category.model.js";
import Expense from "./expense.model.js";
import AcademicYear from "../academic-years/academic-year.model.js";
import User from "../users/user.model.js";
import AppError from "../../shared/appError.js";
import { getPagination } from "../../shared/utils/pagination.js";
import { Op } from "sequelize";
import db from "../../config/db.js";

// Helper: Get Current Academic Year
const getCurrentAcademicYear = async (school_id, transaction = null) => {
  const currentYear = await AcademicYear.findOne({
    where: { school_id, is_current: true },
    transaction,
  });
  return currentYear || null;
};

// Generate Voucher Number
const formatVoucherNo = (num, yearName = "") => {
  const padded = String(num).padStart(5, "0");
  const rawYear = yearName ? yearName.trim() : String(new Date().getFullYear());
  const yr = rawYear.substring(2, 4);
  return `EXP-${yr}-${padded}`;
};

/* Categories */
export const listExpenseCategoriesService = async (school_id) => {
  return await ExpenseCategory.findAll({
    where: { school_id, is_active: true },
    order: [["name", "ASC"]],
  });
};

export const createExpenseCategoryService = async (school_id, data) => {
  const { name, code, description } = data;
  if (!name || !name.trim()) throw new AppError("Category name is required", 400);

  const existing = await ExpenseCategory.findOne({
    where: { school_id, name: name.trim() },
  });
  if (existing) throw new AppError("Expense category with this name already exists", 400);

  return await ExpenseCategory.create({
    school_id,
    name: name.trim(),
    code: code ? code.trim() : name.trim().toUpperCase().replace(/\s+/g, "_"),
    description: description || null,
    is_active: true,
  });
};

/* Expenses CRUD */
export const createExpenseService = async (school_id, user_id, data) => {
  const { category_id, amount, vendor, payment_mode, reference_no, expense_date, description, attachment_url } = data;

  const category = await ExpenseCategory.findOne({ where: { id: category_id, school_id } });
  if (!category) throw new AppError("Expense category not found", 404);

  const currentYear = await getCurrentAcademicYear(school_id);

  const result = await db.transaction(async (t) => {
    // Lock for voucher count
    const totalCount = await Expense.count({ where: { school_id }, transaction: t });
    const voucher_no = formatVoucherNo(totalCount + 1, currentYear?.name);

    const expense = await Expense.create(
      {
        school_id,
        academic_year_id: currentYear?.id || null,
        category_id,
        voucher_no,
        amount: Number(amount),
        vendor: vendor ? vendor.trim() : null,
        payment_mode: payment_mode || "cash",
        reference_no: reference_no ? reference_no.trim() : null,
        expense_date: expense_date || new Date().toISOString().split("T")[0],
        description: description ? description.trim() : null,
        attachment_url: attachment_url || null,
        created_by: user_id,
        updated_by: user_id,
      },
      { transaction: t }
    );

    return expense;
  });

  return await Expense.findByPk(result.id, {
    include: [{ model: ExpenseCategory, as: "category", attributes: ["id", "name"] }],
  });
};

export const listExpensesService = async (school_id, query) => {
  const { page, limit, offset } = getPagination(query);
  const { category_id, payment_mode, startDate, endDate, search, is_cancelled } = query;

  const whereClause = { school_id };

  if (category_id) whereClause.category_id = category_id;
  if (payment_mode) whereClause.payment_mode = payment_mode;
  if (is_cancelled !== undefined) whereClause.is_cancelled = is_cancelled === "true";

  if (startDate && endDate) {
    whereClause.expense_date = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    whereClause.expense_date = { [Op.gte]: startDate };
  } else if (endDate) {
    whereClause.expense_date = { [Op.lte]: endDate };
  }

  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    whereClause[Op.or] = [
      { voucher_no: { [Op.iLike]: s } },
      { vendor: { [Op.iLike]: s } },
      { description: { [Op.iLike]: s } },
      { reference_no: { [Op.iLike]: s } },
    ];
  }

  const { rows: expenses, count: totalItems } = await Expense.findAndCountAll({
    where: whereClause,
    include: [
      { model: ExpenseCategory, as: "category", attributes: ["id", "name"] },
      { model: User, as: "Creator", attributes: ["id", "name"] },
      { model: User, as: "Canceller", attributes: ["id", "name"] },
    ],
    order: [["expense_date", "DESC"], ["id", "DESC"]],
    limit,
    offset,
  });

  return {
    expenses,
    meta: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    },
  };
};

export const cancelExpenseService = async (id, school_id, user_id, cancel_reason) => {
  if (!cancel_reason || !cancel_reason.trim()) {
    throw new AppError("Cancellation reason is mandatory", 400);
  }

  const expense = await Expense.findOne({ where: { id, school_id } });
  if (!expense) throw new AppError("Expense entry not found", 404);
  if (expense.is_cancelled) throw new AppError("Expense entry is already cancelled", 400);

  expense.is_cancelled = true;
  expense.cancelled_by = user_id;
  expense.cancelled_at = new Date();
  expense.cancel_reason = cancel_reason.trim();
  expense.updated_by = user_id;
  await expense.save();

  return expense;
};

export const getExpenseSummaryService = async (school_id, query) => {
  const { startDate, endDate } = query;
  const whereClause = { school_id, is_cancelled: false };

  if (startDate && endDate) {
    whereClause.expense_date = { [Op.between]: [startDate, endDate] };
  }

  const totalExpense = (await Expense.sum("amount", { where: whereClause })) || 0;

  // Category wise totals
  const categoryBreakdown = await Expense.findAll({
    where: whereClause,
    attributes: [
      "category_id",
      [db.fn("SUM", db.col("amount")), "total"],
    ],
    include: [{ model: ExpenseCategory, as: "category", attributes: ["id", "name"] }],
    group: ["expense.category_id", "category.id", "category.name"],
    raw: false,
  });

  // Payment mode totals
  const modeBreakdown = await Expense.findAll({
    where: whereClause,
    attributes: [
      "payment_mode",
      [db.fn("SUM", db.col("amount")), "total"],
    ],
    group: ["payment_mode"],
    raw: true,
  });

  return {
    totalExpense: Number(totalExpense),
    categoryBreakdown: categoryBreakdown.map((item) => ({
      category_id: item.category_id,
      category_name: item.category ? item.category.name : "Unassigned",
      total: Number(item.get("total")),
    })),
    modeBreakdown: modeBreakdown.map((item) => ({
      payment_mode: item.payment_mode,
      total: Number(item.total),
    })),
  };
};
