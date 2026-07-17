import { z } from "zod";

const validSorts = ["newest", "oldest", "alphabetical", "experience", "rating", "views"] as const;

export const searchQuerySchema = z.object({
  q: z.string().max(100, "Query must not exceed 100 characters").optional().default(""),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(
    z.number().int().min(1).max(100)
  ).optional().default(20),
  sort: z.enum(validSorts).optional(),
  sortBy: z.enum(validSorts).optional(),
  branchId: z.string().uuid("Invalid branch ID").optional(),
  category: z.string().optional(),
  district: z.string().regex(/^\d+$/).transform(Number).optional(),
  panchayat: z.string().regex(/^\d+$/).transform(Number).optional(),
});
