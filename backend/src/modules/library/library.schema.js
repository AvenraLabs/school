import { z } from "zod";

export const addBookSchema = z.object({
  book_no: z.string().trim().min(1, "Book number is required").max(50),
  book_name: z.string().trim().min(1, "Book name is required").max(255),
  total_copies: z.coerce.number().int().min(1, "At least 1 copy required"),
  image_url: z.string().trim().max(500).optional().nullable(),
});

export const editBookSchema = z.object({
  book_name: z.string().trim().min(1).max(255).optional(),
  total_copies: z.coerce.number().int().min(1).optional(),
  image_url: z.string().trim().max(500).optional().nullable(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});

export const issueBookSchema = z.object({
  borrower_type: z.enum(["student", "teacher"]).default("student"),
  student_id: z.coerce.number().int().positive().optional().nullable(),
  teacher_id: z.coerce.number().int().positive().optional().nullable(),
  book_id: z.coerce.number().int().positive("Book ID required"),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be YYYY-MM-DD"),
}).refine((data) => {
  if (data.borrower_type === "teacher") return !!data.teacher_id;
  return !!data.student_id;
}, {
  message: "Selected borrower ID is required",
});

export const returnBookSchema = z.object({
  status: z.enum(["returned", "lost", "damaged"], {
    errorMap: () => ({ message: "Status must be 'returned', 'lost', or 'damaged'" }),
  }),
  fine_amount: z.coerce.number().min(0).optional().nullable(),
  remarks: z.string().trim().max(500).optional().nullable(),
});

export const cancelIssueSchema = z.object({
  remarks: z.string().trim().max(500).optional().nullable(),
});

export const undoReturnSchema = z.object({
  remarks: z.string().trim().max(500).optional().nullable(),
});

export const updateLibrarySettingsSchema = z.object({
  library_loan_period_days: z.coerce.number().int().min(1).max(365).optional(),
  library_fine_to_fees: z.boolean().optional(),
  library_overdue_whatsapp_enabled: z.boolean().optional(),
  library_overdue_reminder_days: z.coerce.number().int().min(0).max(30).optional(),
  library_overdue_fine_per_day: z.coerce.number().min(0).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one setting must be provided",
});
