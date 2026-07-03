import { z } from "zod";

export const createExamSchema = z.object({
  class_id: z.coerce.number().int().positive(),
  name: z.string().min(1),
  subjects: z
    .array(
      z.object({
        subject_id: z.coerce.number().int().positive(),
        exam_date: z.string().min(1),
        syllabus: z.string().optional().nullable(),
      })
    )
    .default([]),
});

export const lockExamSchema = z.object({
  is_locked: z.boolean(),
});

export const upsertExamSubjectSchema = z.object({
  subject_id: z.coerce.number().int().positive(),
  exam_date: z.string().min(1),
  syllabus: z.string().optional().nullable(),
});
