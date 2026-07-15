import { z } from "zod";

export const submitVerificationSchema = z.object({
  providerId: z.string().uuid("Invalid provider ID format"),
});

export const reviewVerificationSchema = z.object({
  remarks: z.string().max(1000).optional().nullable(),
});
