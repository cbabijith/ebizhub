import { Context } from "hono";
import { FavoritesService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { createFavoriteSchema, favoriteResourceType } from "./validation.js";
import { z } from "zod";

const service = new FavoritesService();

export class FavoritesController {
  async save(c: Context) {
    try {
      const profile = c.get("profile");
      const body = await c.req.json();
      const parsed = createFavoriteSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const result = await service.addFavorite(
        profile.id,
        parsed.data.resourceType,
        parsed.data.resourceId
      );

      return successResponse(c, "Favorite saved successfully", result, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to save favorite", [], err.status || 400);
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

      const result = await service.removeFavorite(id, profile.id);
      return successResponse(c, "Favorite removed successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to remove favorite", [], err.status || 400);
    }
  }

  async list(c: Context) {
    try {
      const profile = c.get("profile");
      const result = await service.getFavorites(profile.id);
      return successResponse(c, "Favorites retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve favorites", [], err.status || 400);
    }
  }

  async count(c: Context) {
    try {
      const resourceType = c.req.param("resourceType") || "";
      const resourceId = c.req.param("resourceId") || "";

      const parsedType = favoriteResourceType.safeParse(resourceType);
      const parsedId = z.string().uuid("Invalid ID format").safeParse(resourceId);

      if (!parsedType.success || !parsedId.success) {
        return errorResponse(c, "Invalid type or ID format", [], 400);
      }

      const count = await service.getCount(parsedType.data, parsedId.data);
      return successResponse(c, "Favorite count retrieved successfully", { count });
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve count", [], err.status || 400);
    }
  }
}
