import { z } from "zod";

export const ratingResourceType = z.enum(["business", "provider"]);

export const createRatingSchema = z.object({
  resourceType: ratingResourceType,
  resourceId: z.string().uuid("Invalid resource ID format"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
});

export const updateRatingSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
});
