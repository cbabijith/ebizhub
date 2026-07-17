import { z } from "zod";

const validSorts = ["newest", "oldest", "alphabetical", "experience", "rating", "views"] as const;

export const providerQuerySchema = z.object({
  profession: z.string().optional(),
  category: z.string().optional(),
  experience: z.string().regex(/^\d+$/).transform(Number).optional(),
  languages: z.string().optional(),
  availability: z.string().optional(),
  district: z.string().regex(/^\d+$/).transform(Number).optional(),
  panchayat: z.string().regex(/^\d+$/).transform(Number).optional(),
  verified: z.enum(["true", "false"]).transform(val => val === "true").optional(),
  status: z.string().optional(),
  sort: z.enum(validSorts).optional(),
  sortBy: z.enum(validSorts).optional(),
  branchId: z.string().uuid("Invalid branch ID").optional(),
});
