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
  aadhar_no: z.string().optional(),
  father_occupation: z.string().optional(),
  mother_occupation: z.string().optional(),
  family_income: z.preprocess(emptyToUndefined, z.coerce.number().positive().optional()),
});

/* student: first login */
export const completeStudentProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.preprocess(emptyToUndefined, z.string().optional()),
  email: z.preprocess(emptyToUndefined, z.string().email().optional()),
  dob: z.string().optional(), // or z.coerce.date()
  gender: z.enum(["male", "female", "other"]).optional(),
  blood_group: z.string().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  guardian_name: z.string().optional(),
  father_occupation: z.string().optional(),
  mother_occupation: z.string().optional(),
  address: z.string().optional(),
  family_income: z.preprocess(emptyToUndefined, z.coerce.number().optional()),
  avatar_url: z.string().optional().or(z.literal("")).or(z.null()),
});

/* admin: move */
export const moveStudentSchema = z.object({
  section_id: z.number(),
});

/* admin: status */
export const updateStudentStatusSchema = z.object({
  is_active: z.boolean(),
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
