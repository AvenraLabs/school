import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { validate } from "../../shared/middlewares/validate.js";
import {
  createExpenseCategorySchema,
  createExpenseSchema,
  cancelExpenseSchema,
} from "./expense.schema.js";
import {
  listExpenseCategories,
  createExpenseCategory,
  createExpense,
  listExpenses,
  cancelExpense,
  getExpenseSummary,
} from "./expense.controller.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("school_admin", "super_admin"));

/* Categories */
router.get("/categories", listExpenseCategories);
router.post("/categories", validate(createExpenseCategorySchema), createExpenseCategory);

/* Expenses */
router.get("/", listExpenses);
router.post("/", validate(createExpenseSchema), createExpense);
router.patch("/:id/cancel", validate(cancelExpenseSchema), cancelExpense);
router.get("/summary", getExpenseSummary);

export default router;
