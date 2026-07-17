import { z } from "zod";

export const popularCategoriesQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(
    z.number().int().min(1).max(50)
  ).optional().default(10),
  branchId: z.string().uuid("Invalid branch ID").optional(),
});
