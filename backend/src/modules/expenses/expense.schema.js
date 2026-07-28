import { z } from "zod";

export const createExpenseCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  code: z.string().optional(),
  description: z.string().optional(),
});

export const createExpenseSchema = z.object({
  category_id: z.coerce.number({ invalid_type_error: "Category ID is required" }),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  vendor: z.string().optional(),
  payment_mode: z.enum(["cash", "upi", "bank_transfer", "cheque"]).default("cash"),
  reference_no: z.string().optional(),
  expense_date: z.string().min(1, "Expense date is required"),
  description: z.string().optional(),
  attachment_url: z.string().optional(),
});

export const cancelExpenseSchema = z.object({
  cancel_reason: z.string().min(3, "Cancellation reason is required"),
});
