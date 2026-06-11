import { z } from "zod";

export const bulkApproveTeachersSchema = z.object({
  body: z.object({
    teacher_ids: z.array(z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)])).min(1),
    action: z.enum(["approve", "reject"]),
  }),
});
