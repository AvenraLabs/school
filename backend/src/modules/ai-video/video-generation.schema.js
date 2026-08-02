import { z } from "zod";

export const createVideoGenerationSchema = z
  .object({
    topic:        z.string().min(1, "Topic is required").max(200, "Topic must be under 200 characters"),
    classId:      z.union([z.string(), z.number()]).optional(),
    sectionId:    z.coerce.number().int().positive().optional().nullable(),
    subjectId:    z.coerce.number().int().positive().optional().nullable(),
    subjectName:  z.string().optional().nullable(),
    language:     z.string().optional().default("English"),
    duration:     z.enum(["4", "6", "8"]).optional().default("6"),
    content_type: z.enum(["diagram_only", "diagram_and_video"]).optional().default("diagram_only"),
  })
  .refine((data) => data.subjectId || (data.subjectName && data.subjectName.trim().length > 0), {
    message: "Subject ID or Subject Name is required",
    path: ["subjectName"],
  });
