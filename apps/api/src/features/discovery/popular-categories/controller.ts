import { Context } from "hono";
import { PopularCategoriesService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { popularCategoriesQuerySchema } from "./validation.js";

const service = new PopularCategoriesService();

export class PopularCategoriesController {
  async getPopularCategories(c: Context) {
    try {
      const parsed = popularCategoriesQuerySchema.safeParse({
        limit: c.req.query("limit") || "10",
        branchId: c.req.query("branchId") || undefined,
      });
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const data = await service.getPopularCategories(parsed.data.limit, parsed.data.branchId);
      return successResponse(c, "Popular categories retrieved successfully", data);
    } catch (err: any) {
      const isNotFound = err.message === "Branch not found";
      const status = isNotFound ? 404 : (err.status || 500);
      return errorResponse(c, err.message || "Failed to retrieve popular categories", [], status);
    }
  }
}
