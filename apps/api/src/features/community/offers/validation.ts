import { z } from "zod";

export const offerBaseSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional().nullable(),
  banner: z.string().optional().nullable(),
  discountType: z.enum(["percentage", "flat", "buy1get1", "coupon"]),
  discountValue: z.string().regex(/^\d+(\.\d+)?$/, "Invalid discount value").optional().nullable(),
  couponCode: z.string().optional().nullable(),
  validFrom: z.string().datetime("Invalid validFrom ISO format").transform(val => new Date(val)),
  validTo: z.string().datetime("Invalid validTo ISO format").transform(val => new Date(val)),
  terms: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "expired"]).optional().default("active"),
  featured: z.boolean().optional().default(false),
});

export const offerSchema = offerBaseSchema.refine(data => data.validFrom < data.validTo, {
  message: "validFrom date must be before validTo date",
  path: ["validTo"],
});
