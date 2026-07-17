import { z } from "zod";

export const trendingQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d"]).optional().default("30d"),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(
    z.number().int().min(1).max(50)
  ).optional().default(10),
  branchId: z.string().uuid("Invalid branch ID").optional(),
});
