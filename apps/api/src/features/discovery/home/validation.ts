import { z } from "zod";

export const homeQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(
    z.number().int().min(1).max(20)
  ).optional().default(5),
  branchId: z.string().uuid("Invalid branch ID").optional(),
});
