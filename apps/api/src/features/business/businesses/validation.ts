import { z } from "zod";

export const businessSchema = z.object({
  categoryId: z.number().int().positive("Category is required"),
  businessName: z.string().min(2, "Business name must be at least 2 characters long").max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().max(2000).optional().nullable(),
  phone: z.string().min(5, "Contact phone number is required"),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email("Invalid email format").optional().nullable(),
  website: z.string().url("Invalid website URL").optional().nullable(),
  logo: z.string().url("Invalid logo URL").optional().nullable(),
  coverImage: z.string().url("Invalid cover image URL").optional().nullable(),
  address: z.string().min(5, "Full address is required"),
  districtId: z.number().int().positive("District is required"),
  panchayatId: z.number().int().positive().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  googleMapsUrl: z.string().url("Invalid Google Maps URL").optional().nullable(),
  workingHours: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  registrationNumber: z.string().optional().nullable(),
});

export const businessStatusSchema = z.object({
  status: z.enum(["active", "inactive", "suspended"]),
});

