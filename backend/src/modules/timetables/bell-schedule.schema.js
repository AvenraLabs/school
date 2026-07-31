import { z } from "zod";

const periodSchema = z.object({
  order_index: z.number().int().nonnegative().optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  is_break: z.boolean().default(false),
  title: z.string().nullable().optional(),
});

export const createBellScheduleSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  working_days_per_week: z.number().int().min(1).max(7).default(6),
  periods: z.array(periodSchema).min(1, "At least one period is required"),
  class_ids: z.array(z.number().int()).optional(),
});

export const updateBellScheduleSchema = z.object({
  name: z.string().min(1, "Template name is required").optional(),
  working_days_per_week: z.number().int().min(1).max(7).optional(),
  periods: z.array(periodSchema).min(1, "At least one period is required").optional(),
  class_ids: z.array(z.number().int()).optional(),
});
