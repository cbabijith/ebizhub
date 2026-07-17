import { Context } from "hono";
import { RecommendationsService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { recommendationParamsSchema, recommendationQuerySchema } from "./validation.js";

const service = new RecommendationsService();

export class RecommendationsController {
  async getRecommendations(c: Context) {
    try {
      const paramParsed = recommendationParamsSchema.safeParse({
        type: c.req.param("type"),
        id: c.req.param("id"),
      });
      if (!paramParsed.success) {
        return errorResponse(c, "Validation failed", paramParsed.error.issues, 400);
      }

      const queryParsed = recommendationQuerySchema.safeParse({
        limit: c.req.query("limit") || "10",
        branchId: c.req.query("branchId") || undefined,
      });
      if (!queryParsed.success) {
        return errorResponse(c, "Validation failed", queryParsed.error.issues, 400);
      }

      const data = await service.getRecommendations(
        paramParsed.data.type,
        paramParsed.data.id,
        queryParsed.data.limit,
        queryParsed.data.branchId
      );
      return successResponse(c, "Recommendations retrieved successfully", data);
    } catch (err: any) {
      const isNotFound = err.message === "Business not found" || err.message === "Provider not found" || err.message === "Branch not found";
      const status = isNotFound ? 404 : (err.status || 500);
      return errorResponse(c, err.message || "Failed to retrieve recommendations", [], status);
    }
  }
}
