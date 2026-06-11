import { z } from "zod";

export const bulkApproveParentsSchema = z.object({
  body: z.object({
    parent_ids: z.array(z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)])).min(1),
    action: z.enum(["approve", "reject"]),
  }),
});
