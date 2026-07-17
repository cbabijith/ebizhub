import { Context } from "hono";
import { RecentService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { recentQuerySchema } from "./validation.js";

const service = new RecentService();

export class RecentController {
  async getRecent(c: Context) {
    try {
      const parsed = recentQuerySchema.safeParse({
        limit: c.req.query("limit") || "10",
        type: c.req.query("type") || undefined,
        branchId: c.req.query("branchId") || undefined,
      });
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const data = await service.getRecent(parsed.data.limit, parsed.data.type, parsed.data.branchId);
      return successResponse(c, "Recently added listings retrieved successfully", data);
    } catch (err: any) {
      const isNotFound = err.message === "Branch not found";
      const status = isNotFound ? 404 : (err.status || 500);
      return errorResponse(c, err.message || "Failed to retrieve recent listings", [], status);
    }
  }

  async getRecentlyVerified(c: Context) {
    try {
      const parsed = recentQuerySchema.safeParse({
        limit: c.req.query("limit") || "10",
        type: c.req.query("type") || undefined,
        branchId: c.req.query("branchId") || undefined,
      });
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const data = await service.getRecentlyVerified(parsed.data.limit, parsed.data.type, parsed.data.branchId);
      return successResponse(c, "Recently verified listings retrieved successfully", data);
    } catch (err: any) {
      const isNotFound = err.message === "Branch not found";
      const status = isNotFound ? 404 : (err.status || 500);
      return errorResponse(c, err.message || "Failed to retrieve recently verified listings", [], status);
    }
  }
}
