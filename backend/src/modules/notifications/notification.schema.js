import { z } from "zod";

/* admin / teacher: create announcement */
export const createNotificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),

  target_role: z.enum(["teacher", "student", "all"]),

  class_id: z.number().int().positive().optional().nullable(),
  section_id: z.number().int().positive().optional().nullable(),
  send_whatsapp: z.boolean().optional().nullable(),
  image_url: z.string().optional().nullable(),
  is_poster: z.boolean().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  specific_dates: z.array(z.string()).optional().nullable(),
});


/* admin / teacher: update announcement / poster */
export const updateNotificationSchema = createNotificationSchema.partial();

/* teacher: acknowledge */
export const acknowledgeNotificationSchema = z.object({});

