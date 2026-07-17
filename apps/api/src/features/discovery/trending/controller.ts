import { Context } from "hono";
import { TrendingService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { trendingQuerySchema } from "./validation.js";

const service = new TrendingService();

export class TrendingController {
  async getCombined(c: Context) {
    try {
      const parsed = trendingQuerySchema.safeParse({
        period: c.req.query("period") || "30d",
        limit: c.req.query("limit") || "10",
        branchId: c.req.query("branchId") || undefined,
      });
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const data = await service.getTrendingCombined(parsed.data.period, parsed.data.limit, parsed.data.branchId);
      return successResponse(c, "Trending listings retrieved successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve trending listings", [], err.status || 500);
    }
  }

  async getBusinesses(c: Context) {
    try {
      const parsed = trendingQuerySchema.safeParse({
        period: c.req.query("period") || "30d",
        limit: c.req.query("limit") || "10",
        branchId: c.req.query("branchId") || undefined,
      });
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const data = await service.getTrendingBusinesses(parsed.data.period, parsed.data.limit, parsed.data.branchId);
      return successResponse(c, "Trending businesses retrieved successfully", data, { period: parsed.data.period, limit: parsed.data.limit });
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve trending businesses", [], err.status || 500);
    }
  }

  async getProviders(c: Context) {
    try {
      const parsed = trendingQuerySchema.safeParse({
        period: c.req.query("period") || "30d",
        limit: c.req.query("limit") || "10",
        branchId: c.req.query("branchId") || undefined,
      });
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const data = await service.getTrendingProviders(parsed.data.period, parsed.data.limit, parsed.data.branchId);
      return successResponse(c, "Trending providers retrieved successfully", data, { period: parsed.data.period, limit: parsed.data.limit });
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve trending providers", [], err.status || 500);
    }
  }
}
