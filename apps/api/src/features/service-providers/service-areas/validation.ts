import { z } from "zod";

export const addAreaSchema = z.object({
  providerId: z.string().uuid("Invalid provider ID format"),
  districtId: z.number().int().positive("District ID must be positive"),
  panchayatId: z.number().int().positive().optional().nullable(),
});
