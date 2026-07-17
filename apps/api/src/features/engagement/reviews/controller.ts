import { Context } from "hono";
import { ReviewsService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { createReviewSchema, updateReviewSchema, reportReviewSchema, reviewResourceType } from "./validation.js";
import { z } from "zod";

const service = new ReviewsService();

export class ReviewsController {
  async save(c: Context) {
    try {
      const profile = c.get("profile");
      const body = await c.req.json();
      const parsed = createReviewSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const result = await service.addReview(
        profile.id,
        parsed.data.resourceType,
        parsed.data.resourceId,
        parsed.data.content
      );

      return successResponse(c, "Review saved successfully", result, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to save review", [], err.status || 400);
    }
  }

  async update(c: Context) {
    try {
      const profile = c.get("profile");
      const id = c.req.param("id") || "";
      const parsedId = z.string().uuid("Invalid ID format").safeParse(id);
      if (!parsedId.success) {
        return errorResponse(c, "Invalid ID format", parsedId.error.issues, 400);
      }

      const body = await c.req.json();
      const parsed = updateReviewSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const result = await service.updateReview(id, profile.id, parsed.data.content);
      return successResponse(c, "Review updated successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update review", [], err.status || 400);
    }
  }

  async remove(c: Context) {
    try {
      const profile = c.get("profile");
      const id = c.req.param("id") || "";
      const parsedId = z.string().uuid("Invalid ID format").safeParse(id);
      if (!parsedId.success) {
        return errorResponse(c, "Invalid ID format", parsedId.error.issues, 400);
      }

      const result = await service.deleteReview(id, profile.id);
      return successResponse(c, "Review deleted successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete review", [], err.status || 400);
    }
  }

  async list(c: Context) {
    try {
      const resourceType = c.req.param("resourceType") || "";
      const resourceId = c.req.param("resourceId") || "";

      const parsedType = reviewResourceType.safeParse(resourceType);
      const parsedId = z.string().uuid("Invalid ID format").safeParse(resourceId);

      if (!parsedType.success || !parsedId.success) {
        return errorResponse(c, "Invalid type or ID format", [], 400);
      }

      const result = await service.getReviewsForResource(parsedType.data, parsedId.data);
      return successResponse(c, "Reviews retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve reviews", [], err.status || 400);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const parsedId = z.string().uuid("Invalid ID format").safeParse(id);
      if (!parsedId.success) {
        return errorResponse(c, "Invalid ID format", parsedId.error.issues, 400);
      }

      const result = await service.getReviewById(parsedId.data);
      return successResponse(c, "Review retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve review", [], err.status || 400);
    }
  }

  async report(c: Context) {
    try {
      const profile = c.get("profile");
      const id = c.req.param("id") || "";
      const parsedId = z.string().uuid("Invalid ID format").safeParse(id);
      if (!parsedId.success) {
        return errorResponse(c, "Invalid ID format", parsedId.error.issues, 400);
      }

      const body = await c.req.json();
      const parsed = reportReviewSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const result = await service.reportReview(profile.id, parsedId.data, parsed.data.reason);
      return successResponse(c, "Review reported successfully", result, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to report review", [], err.status || 400);
    }
  }

  async listReported(c: Context) {
    try {
      const result = await service.getReportedReviews();
      return successResponse(c, "Reported reviews retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve reported reviews", [], err.status || 400);
    }
  }

  async moderate(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const parsedId = z.string().uuid("Invalid ID format").safeParse(id);
      if (!parsedId.success) {
        return errorResponse(c, "Invalid ID format", parsedId.error.issues, 400);
      }

      const body = await c.req.json();
      const parsedStatus = z.object({
        status: z.enum(["pending", "approved", "rejected"]),
      }).safeParse(body);
      if (!parsedStatus.success) {
        return errorResponse(c, "Validation failed", parsedStatus.error.issues, 400);
      }

      const result = await service.moderateReview(parsedId.data, parsedStatus.data.status);
      return successResponse(c, "Review moderated successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to moderate review", [], err.status || 400);
    }
  }
}
