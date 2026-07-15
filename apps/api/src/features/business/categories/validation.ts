import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  slug: z.string().min(1, "Slug is required").max(100, "Slug must be under 100 characters").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  icon: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  status: z.enum(["active", "inactive"]).default("active"),
});
