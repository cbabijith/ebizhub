import { z } from "zod";

export const communityNewsSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric and hyphens only").max(200),
  summary: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  gallery: z.array(z.string()).optional().default([]),
  categoryId: z.string().uuid("Invalid category ID").optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(["draft", "review", "published", "archived"]).optional().default("draft"),
  featured: z.boolean().optional().default(false),
  isPinned: z.boolean().optional().default(false),
});
