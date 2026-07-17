import { z } from "zod";

export const recentQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(
    z.number().int().min(1).max(50)
  ).optional().default(10),
  type: z.enum(["business", "provider"]).optional(),
  branchId: z.string().uuid("Invalid branch ID").optional(),
});
