import { z } from "zod";

export const bannerSchema = z.object({
  title: z.string().optional().nullable(),
  image: z.string().url("Invalid image URL"),
  redirectType: z.enum(["business", "news", "offer", "event", "external"]),
  redirectId: z.string().optional().nullable(),
  priority: z.number().int().optional().default(0),
  startDate: z.string().datetime("Invalid startDate format").optional().nullable().transform(val => val ? new Date(val) : null),
  endDate: z.string().datetime("Invalid endDate format").optional().nullable().transform(val => val ? new Date(val) : null),
  isActive: z.boolean().optional().default(true),
});
