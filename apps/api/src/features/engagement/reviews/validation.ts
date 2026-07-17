import { z } from "zod";

export const reviewResourceType = z.enum(["business", "provider"]);

export const createReviewSchema = z.object({
  resourceType: reviewResourceType,
  resourceId: z.string().uuid("Invalid resource ID format"),
  content: z.string().min(5, "Review content must be at least 5 characters").max(1000, "Review content cannot exceed 1000 characters"),
});

export const updateReviewSchema = z.object({
  content: z.string().min(5, "Review content must be at least 5 characters").max(1000, "Review content cannot exceed 1000 characters"),
});

export const reportReviewSchema = z.object({
  reason: z.string().min(5, "Report reason must be at least 5 characters").max(500, "Report reason cannot exceed 500 characters"),
});
