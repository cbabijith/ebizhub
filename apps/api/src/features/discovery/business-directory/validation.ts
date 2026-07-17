import { z } from "zod";

const validSorts = ["newest", "oldest", "alphabetical", "experience", "rating", "views"] as const;

export const businessQuerySchema = z.object({
  category: z.string().optional(),
  district: z.string().regex(/^\d+$/).transform(Number).optional(),
  panchayat: z.string().regex(/^\d+$/).transform(Number).optional(),
  branch: z.enum(["true", "false"]).transform(val => val === "true").optional(),
  verified: z.enum(["true", "false"]).transform(val => val === "true").optional(),
  featured: z.enum(["true", "false"]).transform(val => val === "true").optional(),
  status: z.string().optional(),
  sort: z.enum(validSorts).optional(),
  sortBy: z.enum(validSorts).optional(),
  branchId: z.string().uuid("Invalid branch ID").optional(),
});
