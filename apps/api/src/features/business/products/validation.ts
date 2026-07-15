import { z } from "zod";

export const productSchema = z.object({
  businessId: z.string().uuid("Invalid business ID format"),
  name: z.string().min(1, "Product name is required").max(100, "Product name must be under 100 characters"),
  description: z.string().max(500, "Description must be under 500 characters").optional().nullable(),
  image: z.string().url("Product image must be a valid URL").optional().nullable(),
  displayOrder: z.number().int().default(0),
  status: z.enum(["active", "inactive"]).default("active"),
});
