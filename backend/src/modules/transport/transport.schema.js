import { z } from "zod";

export const createDriverSchema = z.object({
  body: z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    name: z.string().min(1),
    phone: z.string().min(6),
    license_number: z.string().min(1),
  }),
});

export const updateDriverSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().min(6).optional(),
    license_number: z.string().min(1).optional(),
    is_active: z.boolean().optional(),
    password: z.string().min(6).optional(),
  }),
});

export const createVehicleSchema = z.object({
  body: z.object({
    vehicle_number: z.string().min(1),
    vehicle_name: z.string().min(1),
    capacity: z.number().int().positive(),
    driver_id: z.union([z.number(), z.string(), z.null()]).optional(),
  }),
});

export const updateVehicleSchema = z.object({
  body: z.object({
    vehicle_number: z.string().min(1).optional(),
    vehicle_name: z.string().min(1).optional(),
    capacity: z.number().int().positive().optional(),
    driver_id: z.union([z.number(), z.string(), z.null()]).optional(),
    is_active: z.boolean().optional(),
  }),
});

export const assignStudentSchema = z.object({
  body: z.object({
    student_id: z.union([z.number(), z.string()]),
    vehicle_id: z.union([z.number(), z.string()]),
    pickup_point: z.string().optional().nullable(),
  }),
});

export const processRequestSchema = z.object({
  params: z.object({
    id: z.string(),
    action: z.enum(["approve", "reject"]),
  }),
  body: z.object({
    rejection_reason: z.string().optional().nullable(),
  }),
});

export const startTripSchema = z.object({
  body: z.object({
    vehicle_id: z.union([z.number(), z.string()]),
    trip_type: z.enum(["pickup", "drop"]),
  }),
});

export const postLocationSchema = z.object({
  body: z.object({
    latitude: z.number(),
    longitude: z.number(),
    speed: z.number().optional().nullable(),
    heading: z.number().optional().nullable(),
  }),
});

export const createRequestSchema = z.object({
  body: z.object({
    student_id: z.union([z.number(), z.string()]),
    requested_vehicle_id: z.union([z.number(), z.string()]),
    pickup_point: z.string().optional().nullable(),
  }),
});
