import { z } from "zod";

export const createFeeCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});

export const updateFeeCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
});

export const upsertClassFeePlanSchema = z.object({
  categories: z.array(
    z.object({
      fee_category_id: z.number().or(z.string().transform(v => Number(v))),
      amount: z.number().min(0, "Amount must be >= 0"),
    })
  ).optional().default([]),
  schedules: z.array(
    z.object({
      term_name: z.string().trim().min(1, "Term name required"),
      due_date: z.string().optional().nullable(),
      amount: z.number().min(0, "Amount must be >= 0"),
    })
  ).optional().default([]),
});

export const generateLedgerSchema = z.object({
  student_id: z.number().or(z.string().transform(v => Number(v))),
  fee_mode: z.enum(["full", "custom"]).optional().default("full"),
  custom_total: z.number().min(0).optional(),
  scholarship_percent: z.number().min(0).max(100).optional().default(0),
  discount_amount: z.number().min(0).optional().default(0),
});

export const updateLedgerAdjustmentsSchema = z.object({
  scholarship_percent: z.number().min(0).max(100).optional(),
  discount_amount: z.number().min(0).optional(),
  custom_total: z.number().min(0).optional(),
});

export const recordPaymentSchema = z.object({
  student_id: z.number().or(z.string().transform(v => Number(v))),
  amount: z.number().gt(0, "Amount must be greater than 0"),
  term_ledger_id: z.number().or(z.string().transform(v => Number(v))).optional().nullable(),
  late_fee_amount: z.number().min(0).optional().default(0),
  mode: z.enum(["cash", "upi", "bank_transfer", "cheque", "dd", "online"]).default("cash"),
  reference: z.string().trim().optional().nullable(),
  paid_by: z.string().trim().optional().nullable(),
  remarks: z.string().trim().optional().nullable(),
});

export const voidPaymentSchema = z.object({
  void_reason: z.string().trim().min(1, "Void reason is required"),
});
