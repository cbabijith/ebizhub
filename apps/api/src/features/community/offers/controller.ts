import { Context } from "hono";
import { OfferService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { mapOfferToPublicDto } from "../dto.js";

const service = new OfferService();

export class OfferController {
  async list(c: Context) {
    try {
      const businessId = c.req.query("businessId");
      const status = c.req.query("status") || "active";
      const featuredStr = c.req.query("featured");
      const featured = featuredStr !== undefined ? featuredStr === "true" : undefined;
      const limit = parseInt(c.req.query("limit") || "20", 10);
      const page = parseInt(c.req.query("page") || "1", 10);
      const offset = (page - 1) * limit;

      const data = await service.getOffers({ businessId, status, featured, limit, offset });
      return successResponse(c, "Offers list retrieved successfully", data.map(mapOfferToPublicDto), { page, limit });
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve offers", [], 400);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const data = await service.getPublicOfferById(id);
      return successResponse(c, "Offer detail retrieved successfully", mapOfferToPublicDto(data));
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve offer", [], 400);
    }
  }

  async create(c: Context) {
    try {
      const user = c.get("user");
      const body = c.req.valid("json" as never) as any;
      const data = await service.createOffer(body, user.id, user.role);
      return successResponse(c, "Offer created successfully", data, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to create offer", [], 400);
    }
  }

  async update(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || "";
      const body = c.req.valid("json" as never) as any;
      const data = await service.updateOffer(id, body, user.id, user.role);
      return successResponse(c, "Offer updated successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update offer", [], 400);
    }
  }

  async delete(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || "";
      await service.deleteOffer(id, user.id, user.role);
      return successResponse(c, "Offer deleted successfully", {});
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete offer", [], 400);
    }
  }
}
