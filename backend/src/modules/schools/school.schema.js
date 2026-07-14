import { z } from "zod";

export const createSchoolSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  zip: z.string().optional().default(''),
  email: z.union([z.string().email(), z.literal('')]).optional().default(''),
  admin_username: z.string().min(3),
  admin_password: z.string().min(6),
  google_maps_enabled: z.boolean().optional(),
});

export const updateSchoolStatusSchema = z.object({
  status: z.enum(["pending", "active", "suspended", "expired"]),
});

export const updateSchoolAdminStatusSchema = z.object({
  is_active: z.boolean(),
});                                                                                                                                                                                  

export const resetSchoolAdminPasswordSchema = z.object({
  new_password: z.string().min(6),
});

export const updateSchoolSchema = z.object({
  school_name: z.string().min(1).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  contact_phone: z.string().optional(),
  whatsapp_bus_start_enabled: z.boolean().optional(),
  whatsapp_bus_end_enabled: z.boolean().optional(),
  google_maps_enabled: z.boolean().optional(),
});
