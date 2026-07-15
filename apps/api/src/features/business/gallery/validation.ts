import { z } from "zod";

export const galleryUploadSchema = z.object({
  businessId: z.string().uuid("Invalid business ID format"),
  imageUrl: z.string().url("ImageUrl must be a valid URL"),
  isCover: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const reorderSchema = z.object({
  businessId: z.string().uuid("Invalid business ID format"),
  images: z.array(z.object({
    id: z.string().uuid("Invalid image ID format"),
    sortOrder: z.number().int(),
  })),
});
