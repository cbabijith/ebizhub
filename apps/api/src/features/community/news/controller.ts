import { Context } from "hono";
import { CommunityNewsService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { mapNewsToPublicDto } from "../dto.js";

const service = new CommunityNewsService();

export class CommunityNewsController {
  async getPublished(c: Context) {
    try {
      const categoryId = c.req.query("categoryId");
      const q = c.req.query("q");
      const limit = parseInt(c.req.query("limit") || "20", 10);
      const page = parseInt(c.req.query("page") || "1", 10);
      const offset = (page - 1) * limit;

      const data = await service.getPublishedNews({ categoryId, q, limit, offset });
      return successResponse(c, "News list retrieved successfully", data.map(mapNewsToPublicDto), { page, limit });
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve news", [], 400);
    }
  }

  async getAllAdmin(c: Context) {
    try {
      const limit = parseInt(c.req.query("limit") || "20", 10);
      const page = parseInt(c.req.query("page") || "1", 10);
      const offset = (page - 1) * limit;

      const data = await service.getAllNewsAdmin({ limit, offset });
      return successResponse(c, "All news retrieved successfully", data, { page, limit });
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve news", [], 400);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const data = await service.getPublicNewsById(id);
      return successResponse(c, "News detail retrieved successfully", mapNewsToPublicDto(data));
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve news", [], 400);
    }
  }

  async getBySlug(c: Context) {
    try {
      const slug = c.req.param("slug") || "";
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return errorResponse(c, "Invalid slug format", ["slug: Invalid slug format"], 400);
      }
      const data = await service.getPublicNewsBySlug(slug);
      return successResponse(c, "News detail retrieved successfully", mapNewsToPublicDto(data));
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve news", [], 400);
    }
  }

  async create(c: Context) {
    try {
      const user = c.get("user");
      const body = c.req.valid("json" as never) as any;
      const data = await service.createNews(body, user.id);
      return successResponse(c, "News article created successfully", data, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to create news article", [], 400);
    }
  }

  async update(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || "";
      const body = c.req.valid("json" as never) as any;
      const data = await service.updateNews(id, body, user.id);
      return successResponse(c, "News article updated successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update news article", [], 400);
    }
  }

  async delete(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || "";
      await service.deleteNews(id, user.id);
      return successResponse(c, "News article deleted successfully", {});
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete news article", [], 400);
    }
  }

  async share(c: Context) {
    try {
      const id = c.req.param("id") || "";
      await service.incrementNewsShares(id);
      return successResponse(c, "News shared successfully", {});
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to share news article", [], 400);
    }
  }
}
