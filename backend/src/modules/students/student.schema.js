import { z } from "zod";

const emptyToUndefined = (val) => (val === "" ? undefined : val);

/* admin: create student */
export const createStudentSchema = z.object({
  name: z.string().min(1),
  class_id: z.number().int().positive(),
  section_id: z.number().int().positive(),
  admission_no: z.string().optional(),
  email: z.preprocess(emptyToUndefined, z.string().email().optional()),
  phone: z.preprocess(emptyToUndefined, z.string().optional()),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  blood_group: z.string().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  guardian_name: z.string().optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  residential_status: z.enum(["dayscholar", "hosteler"]).optional(),
});

/* student: first login */
export const completeStudentProfileSchema = z.object({
  new_password: z.preprocess(emptyToUndefined, z.string().optional()),
  name: z.string().min(1).optional(),
  phone: z.preprocess(emptyToUndefined, z.string().optional()),
  email: z.preprocess(emptyToUndefined, z.string().email().optional()),
  dob: z.string().optional(), // or z.coerce.date()
  gender: z.preprocess(emptyToUndefined, z.enum(["male", "female", "other"]).optional()),
  blood_group: z.string().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  guardian_name: z.string().optional(),
  emergency_contact: z.string().optional(),
  residential_status: z.preprocess(emptyToUndefined, z.enum(["dayscholar", "hosteler"]).optional()),
  address: z.string().optional(),
  avatar_url: z.string().optional().or(z.literal("")).or(z.null()),
  roll_no: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
});

/* admin: move */
export const moveStudentSchema = z.object({
  section_id: z.number(),
});

/* admin: status */
export const updateStudentStatusSchema = z.object({
  status: z.enum(["ACTIVE", "TRANSFERRED", "DROPPED", "GRADUATED"]),
  reason: z.string().optional(),
});


/* admin: bulk assign students to section */
export const assignStudentsToSectionSchema = z.object({
  target_class_id: z.number().int().positive(),
  target_section_id: z.number().int().positive(),
  students: z
    .array(
      z.object({
        student_id: z.number().int().positive(),
        roll_no: z.number().int().positive(),
      })
    )
    .min(1),
});
