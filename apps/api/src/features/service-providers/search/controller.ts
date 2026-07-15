import { Context } from "hono";
import { SearchService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const searchService = new SearchService();

export class SearchController {
  async search(c: Context) {
    try {
      const query = c.req.valid("query" as never) as any;
      const result = await searchService.search(query);
      return successResponse(c, "Search results retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to search service providers", [err.message], 400);
    }
  }
}
