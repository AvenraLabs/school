import { z } from "zod";

export const submitFeedbackSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(["bug_report", "feature_request", "suggestion", "complaint", "appreciation"]),
  description: z.string().min(1, "Description is required"),
  screenshot_url: z.string().optional(),
  browser: z.string().optional(),
  app_version: z.string().optional(),
});

export const updateFeedbackStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
});
