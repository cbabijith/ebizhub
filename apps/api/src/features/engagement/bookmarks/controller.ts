import { Context } from "hono";
import { BookmarksService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { createBookmarkSchema, bookmarkResourceType } from "./validation.js";
import { getPaginationParams } from "../../../shared/pagination/pagination.js";
import { z } from "zod";

const service = new BookmarksService();

export class BookmarksController {
  async save(c: Context) {
    try {
      const profile = c.get("profile");
      const body = await c.req.json();
      const parsed = createBookmarkSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const result = await service.addBookmark(
        profile.id,
        parsed.data.resourceType,
        parsed.data.resourceId
      );

      return successResponse(c, "Bookmark saved successfully", result, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to save bookmark", [], err.status || 400);
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

      const result = await service.removeBookmark(id, profile.id);
      return successResponse(c, "Bookmark removed successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to remove bookmark", [], err.status || 400);
    }
  }

  async list(c: Context) {
    try {
      const profile = c.get("profile");
      
      // Optional resourceType filter from query or param
      const resourceTypeParam = c.req.param("resourceType") || c.req.query("resourceType") || undefined;
      let resourceType: any = undefined;
      if (resourceTypeParam) {
        const parsedType = bookmarkResourceType.safeParse(resourceTypeParam);
        if (!parsedType.success) {
          return errorResponse(c, "Invalid resource type", parsedType.error.issues, 400);
        }
        resourceType = parsedType.data;
      }

      const pagination = getPaginationParams(c);
      const result = await service.getBookmarks(
        profile.id,
        resourceType,
        pagination.limit,
        pagination.offset
      );

      return successResponse(
        c,
        "Bookmarks retrieved successfully",
        result.bookmarks,
        {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
        }
      );
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve bookmarks", [], err.status || 400);
    }
  }
}
