import { Context } from "hono";
import { DiscoveryAnalyticsService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const service = new DiscoveryAnalyticsService();

export class DiscoveryAnalyticsController {
  async trackBusiness(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const { action } = await c.req.json() as any;
      const ip = c.req.header("x-forwarded-for") || "";
      const device = c.req.header("user-agent") || "";

      if (!action) {
        return errorResponse(c, "Action is required", ["Action is required"], 400);
      }

      await service.trackBusinessClick(id, action, ip, device);
      return successResponse(c, "Business interaction tracked successfully");
    } catch (err: any) {
      const isNotFound = err.message === "Business not found";
      const status = isNotFound ? 404 : 400;
      return errorResponse(c, err.message || "Failed to track interaction", [err.message], status);
    }
  }

  async trackProvider(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const { action } = await c.req.json() as any;
      const ip = c.req.header("x-forwarded-for") || "";

      if (!action) {
        return errorResponse(c, "Action is required", ["Action is required"], 400);
      }

      await service.trackProviderClick(id, action, ip);
      return successResponse(c, "Provider interaction tracked successfully");
    } catch (err: any) {
      const isNotFound = err.message === "Service provider not found";
      const status = isNotFound ? 404 : 400;
      return errorResponse(c, err.message || "Failed to track interaction", [err.message], status);
    }
  }
}
