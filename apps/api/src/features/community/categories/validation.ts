import { z } from "zod";

export const newsCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric and hyphens only").max(100),
  icon: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});
