import { z } from "zod";

export const serviceCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  slug: z.string().max(100, "Slug must be under 100 characters").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens").optional().nullable(),
  icon: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const serviceCategoryReorderSchema = z.object({
  categories: z.array(z.object({
    id: z.number().int(),
    sortOrder: z.number().int(),
  })),
});
