import { z } from "zod";

export const createProviderSchema = z.object({
  serviceCategoryId: z.number().int().positive("Service category is required"),
  profession: z.string().min(2, "Profession is required").max(100),
  experience: z.number().int().nonnegative("Experience cannot be negative"),
  bio: z.string().max(2000).optional().nullable(),
  phone: z.string().min(5, "Contact phone number is required"),
  qualification: z.string().max(500).optional().nullable(),
  languages: z.string().max(200).optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email("Invalid email format").optional().nullable(),
  availability: z.string().max(200).optional().nullable(),
  serviceRadius: z.number().int().positive("Service radius must be positive"),
});

export const updateProviderSchema = createProviderSchema.partial();

export const providerStatusSchema = z.object({
  status: z.enum(["active", "inactive", "suspended"]),
});
