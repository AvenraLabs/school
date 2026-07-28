import {
  listExpenseCategoriesService,
  createExpenseCategoryService,
  createExpenseService,
  listExpensesService,
  cancelExpenseService,
  getExpenseSummaryService,
} from "./expense.service.js";

export const listExpenseCategories = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    const categories = await listExpenseCategoriesService(school_id);
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

export const createExpenseCategory = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    const category = await createExpenseCategoryService(school_id, req.body);
    res.status(201).json({ success: true, data: category, message: "Expense category created" });
  } catch (err) {
    next(err);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    const user_id = req.user.id;
    const expense = await createExpenseService(school_id, user_id, req.body);
    res.status(201).json({ success: true, data: expense, message: "Expense recorded successfully" });
  } catch (err) {
    next(err);
  }
};

export const listExpenses = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    const result = await listExpensesService(school_id, req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const cancelExpense = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    const user_id = req.user.id;
    const { cancel_reason } = req.body;
    const expense = await cancelExpenseService(req.params.id, school_id, user_id, cancel_reason);
    res.json({ success: true, data: expense, message: "Expense voucher cancelled successfully" });
  } catch (err) {
    next(err);
  }
};

export const getExpenseSummary = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    const summary = await getExpenseSummaryService(school_id, req.query);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};
