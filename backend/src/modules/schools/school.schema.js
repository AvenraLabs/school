import { z } from "zod";

export const updateSchoolStatusSchema = z.object({
  status: z.string().transform((val) => {
    const lower = String(val || "").toLowerCase();
    if (lower === "inactive") return "suspended";
    return lower;
  }).pipe(z.enum(["pending", "active", "suspended", "expired"])),
});

export const updateSchoolAdminStatusSchema = z.object({
  is_active: z.boolean(),
});                                                                                                                                                                                  

export const resetSchoolAdminPasswordSchema = z.object({
  new_password: z.string().min(6),
});

export const updateSchoolSchema = z.object({
  school_name: z.string().min(1).optional(),
  board: z.enum(["CBSE", "STATE"]).or(z.string()).optional(),
  contact_phone: z.string().optional(),
  promotion_wizard_enabled: z.boolean().optional(),
});

export const createSchoolSchema = z.object({
  name: z.string().min(1, "School name is required"),
  code: z.string().optional().nullable(),
  board: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  academic_year_name: z.string().optional().nullable(),
  academic_year_start: z.string().optional().nullable(),
  academic_year_end: z.string().optional().nullable(),
  admin_username: z.string().min(1, "Admin username is required"),
  admin_password: z.string().min(4, "Admin password must be at least 4 characters"),
});


