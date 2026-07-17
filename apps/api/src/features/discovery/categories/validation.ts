import { z } from "zod";

export const categorySlugSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[A-Za-z0-9-_]+$/, "Invalid slug format"),
});
