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

/* teacher: bulk save report card marks */
export const bulkSaveReportCardMarksSchema = z.object({
  class_id: z.coerce.number().int().positive(),
  section_id: z.coerce.number().int().positive(),
  exam_id: z.coerce.number().int().positive(),
  report_cards: z.array(
    z.object({
      student_id: z.coerce.number().int().positive(),
      marks: z.array(
        z.object({
          subject_id: z.coerce.number().int().positive(),
          marks_obtained: z.number(),
          max_marks: z.number().positive(),
        })
      ),
      remarks: z.string().optional().nullable(),
    })
  ).min(1),
});

/* teacher: bulk publish report cards */
export const bulkPublishReportCardsSchema = z.object({
  class_id: z.coerce.number().int().positive(),
  section_id: z.coerce.number().int().positive(),
  exam_id: z.coerce.number().int().positive(),
  report_card_ids: z.array(z.coerce.number().int().positive()).min(1),
});
