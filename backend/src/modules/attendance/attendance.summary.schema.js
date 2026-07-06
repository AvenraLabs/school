import { z } from "zod";

export const markAttendanceSchema = z.object({
  class_id: z.coerce.number().int().positive(),
  section_id: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  records: z.array(
    z.object({
      student_id: z.coerce.number().int().positive(),
      status: z.enum(["present", "absent", "leave", "on_duty"]),
    })
  ).min(1),
});

export const attendanceSummarySchema = z.object({
  query: z.object({
    class_id: z.string().optional(),
    section_id: z.string().optional(),
    from_date: z.string().optional(),
    to_date: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
  }),
});

export const dailyAttendanceQuerySchema = z.object({
  query: z.object({
    class_id: z.string().regex(/^\d+$/, "class_id must be a number"),
    section_id: z.string().regex(/^\d+$/, "section_id must be a number"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  }),
});
