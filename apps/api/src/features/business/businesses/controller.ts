import { Context } from "hono";
import { BusinessService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const businessService = new BusinessService();

export class BusinessController {
  async register(c: Context) {
    try {
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await businessService.registerBusiness(profile.id, body);
      return successResponse(c, "Business registered successfully", result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to register business", [err.message], 400);
    }
  }

  async update(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await businessService.updateBusiness(id, profile.id, body);
      return successResponse(c, "Business updated successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update business", [err.message], 400);
    }
  }

  async getOwn(c: Context) {
    try {
      const profile = c.get("profile");
      const result = await businessService.getOwnBusinesses(profile.id);
      return successResponse(c, "Own businesses retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve businesses", [err.message], 400);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const result = await businessService.getBusinessById(id);
      return successResponse(c, "Business details retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve business", [err.message], 404);
    }
  }

  async delete(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const result = await businessService.deleteBusiness(id, profile.id);
      return successResponse(c, "Business deleted successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete business", [err.message], 400);
    }
  }
}
