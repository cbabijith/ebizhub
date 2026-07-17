import { Context } from "hono";
import { BannerService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { mapBannerToPublicDto } from "../dto.js";

const service = new BannerService();

export class BannerController {
  async list(c: Context) {
    try {
      const activeStr = c.req.query("isActive");
      const isActive = activeStr !== undefined ? activeStr === "true" : true; // Default to active banners only
      const limit = parseInt(c.req.query("limit") || "20", 10);
      const page = parseInt(c.req.query("page") || "1", 10);
      const offset = (page - 1) * limit;

      const data = await service.getBanners({ isActive, limit, offset });
      return successResponse(c, "Banners list retrieved successfully", data.map(mapBannerToPublicDto), { page, limit });
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve banners", [], 400);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const data = await service.getPublicBannerById(id);
      return successResponse(c, "Banner detail retrieved successfully", mapBannerToPublicDto(data));
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve banner", [], 400);
    }
  }

  async create(c: Context) {
    try {
      const user = c.get("user");
      const body = c.req.valid("json" as never) as any;
      const data = await service.createBanner(body, user.id);
      return successResponse(c, "Banner created successfully", data, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to create banner", [], 400);
    }
  }

  async update(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || "";
      const body = c.req.valid("json" as never) as any;
      const data = await service.updateBanner(id, body, user.id);
      return successResponse(c, "Banner updated successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update banner", [], 400);
    }
  }

  async delete(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || "";
      await service.deleteBanner(id, user.id);
      return successResponse(c, "Banner deleted successfully", {});
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete banner", [], 400);
    }
  }
}
