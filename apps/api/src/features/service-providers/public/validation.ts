import { z } from "zod";

export const listProvidersQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(10),
  category: z.string().regex(/^\d+$/).transform(Number).optional(),
  district: z.string().regex(/^\d+$/).transform(Number).optional(),
  panchayat: z.string().regex(/^\d+$/).transform(Number).optional(),
  experience: z.string().regex(/^\d+$/).transform(Number).optional(),
  availability: z.string().optional(),
});
