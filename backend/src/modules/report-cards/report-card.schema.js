import { z } from "zod";

/* teacher: create report card */
export const createReportCardSchema = z.object({
  student_id: z.number().int().positive(),
  exam_id: z.number().int().positive(),
});

/* teacher: save marks */
export const saveReportCardMarksSchema = z.object({
  marks: z
    .array(
      z.object({
        subject_id: z.coerce.number().int().positive(),
        marks_obtained: z.number(),
        max_marks: z.number().positive(),
      })
    )
    .min(1),
  remarks: z.string().optional(),
});

/* teacher: publish */
export const publishReportCardSchema = z.object({
  remarks: z.string().optional(),
});

/* teacher/admin: get report cards for class & exam */
export const getAcademicReportCardsSchema = z.object({
  query: z.object({
    class_id: z.string(),
    exam_id: z.string(),
  }),
});
