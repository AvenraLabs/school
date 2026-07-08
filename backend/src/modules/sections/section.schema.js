import { z } from "zod";

export const createSectionSchema = z.object({
  class_id: z.coerce.number().int().positive(),
  name: z.string().min(1).max(10),
  student_count: z.preprocess(
    (val) => (val === "" || val === undefined ? 0 : Number(val)),
    z.number().int().min(0).optional()
  ),
});

export const updateSectionStatusSchema = z.object({
  is_active: z.boolean(),
});
