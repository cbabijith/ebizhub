import { Context } from "hono";
import { AnalyticsService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async track(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const { action } = c.req.valid("json" as never) as any;
      const ip = c.req.header("x-forwarded-for") || undefined;
      const device = c.req.header("user-agent") || undefined;

      await analyticsService.trackClick(id, action, ip, device);
      return successResponse(c, "Interaction tracked successfully", {});
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to track interaction", [err.message], 400);
    }
  }

  async getSummary(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const result = await analyticsService.getAnalytics(id, profile.id);
      return successResponse(c, "Analytics summary retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve analytics", [err.message], 400);
    }
  }
}
