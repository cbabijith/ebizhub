import { Context } from "hono";
import { HomeService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { homeQuerySchema } from "./validation.js";

const homeService = new HomeService();

export class HomeController {
  async getHome(c: Context) {
    try {
      const parsed = homeQuerySchema.safeParse({
        limit: c.req.query("limit") || "5",
        branchId: c.req.query("branchId") || undefined,
      });
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const data = await homeService.getHomeDashboard(parsed.data.limit, parsed.data.branchId);
      return successResponse(c, "Home dashboard retrieved successfully", data);
    } catch (err: any) {
      const isNotFound = err.message === "Branch not found";
      const status = isNotFound ? 404 : (err.status || 500);
      return errorResponse(c, err.message || "Failed to load home data", [], status);
    }
  }
}
