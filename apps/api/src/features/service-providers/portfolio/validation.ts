import { z } from "zod";

export const createPortfolioSchema = z.object({
  providerId: z.string().uuid("Invalid provider ID format"),
  type: z.enum(["image", "certificate", "project", "award"]).default("image"),
  title: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  fileUrl: z.string().url("Invalid file URL"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL").optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const updatePortfolioSchema = createPortfolioSchema.partial();

export const portfolioReorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int(),
  })),
});
