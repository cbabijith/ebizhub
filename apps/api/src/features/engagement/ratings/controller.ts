import { Context } from "hono";
import { RatingsService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { createRatingSchema, updateRatingSchema, ratingResourceType } from "./validation.js";
import { z } from "zod";

const service = new RatingsService();

export class RatingsController {
  async save(c: Context) {
    try {
      const profile = c.get("profile");
      const body = await c.req.json();
      const parsed = createRatingSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const result = await service.addRating(
        profile.id,
        parsed.data.resourceType,
        parsed.data.resourceId,
        parsed.data.rating
      );

      return successResponse(c, "Rating saved successfully", result, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to save rating", [], err.status || 400);
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
      const parsed = updateRatingSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const result = await service.updateRating(id, profile.id, parsed.data.rating);
      return successResponse(c, "Rating updated successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update rating", [], err.status || 400);
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

      const result = await service.deleteRating(id, profile.id);
      return successResponse(c, "Rating deleted successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete rating", [], err.status || 400);
    }
  }

  async list(c: Context) {
    try {
      const resourceType = c.req.param("resourceType") || "";
      const resourceId = c.req.param("resourceId") || "";

      const parsedType = ratingResourceType.safeParse(resourceType);
      const parsedId = z.string().uuid("Invalid ID format").safeParse(resourceId);

      if (!parsedType.success || !parsedId.success) {
        return errorResponse(c, "Invalid type or ID format", [], 400);
      }

      const result = await service.getRatingsForResource(parsedType.data, parsedId.data);
      return successResponse(c, "Ratings retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve ratings", [], err.status || 400);
    }
  }

  async summary(c: Context) {
    try {
      const resourceType = c.req.param("resourceType") || "";
      const resourceId = c.req.param("resourceId") || "";

      const parsedType = ratingResourceType.safeParse(resourceType);
      const parsedId = z.string().uuid("Invalid ID format").safeParse(resourceId);

      if (!parsedType.success || !parsedId.success) {
        return errorResponse(c, "Invalid type or ID format", [], 400);
      }

      const result = await service.getSummary(parsedType.data, parsedId.data);
      return successResponse(c, "Ratings summary retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve summary", [], err.status || 400);
    }
  }
}
