import { z } from "zod";

export const recommendationParamsSchema = z.object({
  type: z.enum(["business", "provider"]),
  id: z.string().uuid("Invalid UUID"),
});

export const recommendationQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(
    z.number().int().min(1).max(50)
  ).optional().default(10),
  branchId: z.string().uuid("Invalid branch ID").optional(),
});
