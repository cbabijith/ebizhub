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
      return successResponse(c, "Business registered successfully", result, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to register business", [err.message], 400);
    }
  }

  async update(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await businessService.updateBusiness(id, profile.id, profile.role, body);
      return successResponse(c, "Business updated successfully", result);
    } catch (err: any) {
      const status = err.message === "Business not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to update business", [err.message], status);
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
      const result = await businessService.getPublicBusinessById(id);
      return successResponse(c, "Business details retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve business", [err.message], 404);
    }
  }

  async delete(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const result = await businessService.deleteBusiness(id, profile.id, profile.role);
      return successResponse(c, "Business deleted successfully", result);
    } catch (err: any) {
      const status = err.message === "Business not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to delete business", [err.message], status);
    }
  }

  async updateStatus(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const { status } = c.req.valid("json" as never) as any;
      const result = await businessService.updateBusinessStatus(id, status);
      return successResponse(c, "Business status updated successfully", result);
    } catch (err: any) {
      const status = err.message === "Business not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to update business status", [err.message], status);
    }
  }
}
