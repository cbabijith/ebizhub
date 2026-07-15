import { Context } from "hono";
import { AnalyticsService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async trackClick(c: Context) {
    try {
      const providerId = c.req.param("id") || "";
      const { action } = c.req.valid("json" as never) as any;
      const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || null;
      await analyticsService.trackClick(providerId, action, ip);
      return successResponse(c, "Click tracked successfully", {});
    } catch (err: any) {
      const status = err.message === "Service provider not found" ? 404 : (err.statusCode || 400);
      return errorResponse(c, err.message || "Failed to track click", [err.message], status);
    }
  }

  async getSummary(c: Context) {
    try {
      const profile = c.get("profile");
      const providerId = c.req.param("id") || "";
      const result = await analyticsService.getSummary(profile.id, profile.role, providerId);
      return successResponse(c, "Analytics summary retrieved successfully", result);
    } catch (err: any) {
      const status = err.message === "Service provider not found" ? 404 : (err.statusCode || 400);
      return errorResponse(c, err.message || "Failed to retrieve analytics summary", [err.message], status);
    }
  }
}
