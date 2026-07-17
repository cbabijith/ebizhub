import { Context } from "hono";
import { SearchService } from "./service.js";
import { getPaginationParams } from "../../../shared/pagination/pagination.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { searchQuerySchema } from "./validation.js";
import { z } from "zod";

const service = new SearchService();

export class SearchController {
  async search(c: Context) {
    try {
      const parsed = searchQuerySchema.safeParse(c.req.query());
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const pagination = getPaginationParams(c);
      const ip = c.req.header("x-forwarded-for") || undefined;

      const result = await service.search(parsed.data.q, parsed.data, pagination, ip);

      return successResponse(c, "Search results retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to search", [], err.status || 400);
    }
  }

  async suggestions(c: Context) {
    try {
      const q = c.req.query("q") || "";
      const limit = parseInt(c.req.query("limit") || "10", 10);

      if (q.length < 2) {
        return errorResponse(c, "Query must be at least 2 characters", ["q: Query too short"], 400);
      }
      if (q.length > 100) {
        return errorResponse(c, "Query must not exceed 100 characters", ["q: Query too long"], 400);
      }

      const result = await service.getSuggestions(q, limit);
      return successResponse(c, "Search suggestions retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to get suggestions", [], 400);
    }
  }
}
