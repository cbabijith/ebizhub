import { z } from "zod";

export const shareResourceType = z.enum([
  "business",
  "service-provider",
  "news",
  "event",
  "job",
  "offer",
]);

export const createShareLinkSchema = z.object({
  resourceType: shareResourceType,
  resourceId: z.string().uuid("Invalid resource ID format"),
  expiresAt: z
    .string()
    .datetime("Invalid ISO datetime format")
    .refine((val) => new Date(val) > new Date(), {
      message: "expiresAt must be a future timestamp",
    })
    .optional(),
});

// Token is a random hex string (64 chars = 32 bytes of crypto-random data)
export const tokenParamSchema = z.string().min(32).max(128).regex(/^[a-f0-9]+$/, "Invalid token format");
