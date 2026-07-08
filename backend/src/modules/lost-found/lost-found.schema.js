import { z } from "zod";

export const createLostFoundSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["lost", "found"]),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"), // YYYY-MM-DD
  photos: z.array(z.string()).max(2, "Maximum 2 photos allowed").optional().default([]),
});

export const updateLostFoundStatusSchema = z.object({
  status: z.enum(["OPEN", "CLOSED"]),
});
