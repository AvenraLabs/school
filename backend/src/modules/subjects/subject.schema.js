import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20).optional(),
  category: z.enum(["theory", "practical", "both"]).default("theory"),
  subject_type: z.enum(["academic", "co_curricular"]).default("academic"),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z.string().min(2).max(20).optional(),
  category: z.enum(["theory", "practical", "both"]).optional(),
  subject_type: z.enum(["academic", "co_curricular"]).optional(),
});

export const savePeriodsSchema = z.object({
  class_id: z.coerce.number().int().positive(),
  section_id: z.coerce.number().int().positive().optional(),
  periods: z.array(
    z.object({
      subject_id: z.coerce.number().int().positive(),
      periods_per_week: z.coerce.number().int().min(0).nullable(),
    })
  ).min(1, "At least one period allocation entry is required"),
});
