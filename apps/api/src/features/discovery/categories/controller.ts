import { Context } from "hono";
import { CategoryService } from "./service.js";
import { getPaginationParams } from "../../../shared/pagination/pagination.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { z } from "zod";

const service = new CategoryService();

export class CategoryController {
  async getPopular(c: Context) {
    try {
      const branchId = c.req.query("branchId") || undefined;
      const parsedBranch = z.object({
        branchId: z.string().uuid("Invalid branch ID").optional(),
      }).safeParse({ branchId });
      if (!parsedBranch.success) {
        return errorResponse(c, "Validation failed", parsedBranch.error.issues, 400);
      }

      const data = await service.getPopularCategories(parsedBranch.data.branchId);
      return successResponse(c, "Popular categories retrieved successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve popular categories", [], err.status || 400);
    }
  }

  async getBySlug(c: Context) {
    try {
      const slug = c.req.param("slug") || "";
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return errorResponse(c, "Invalid slug format", [], 400);
      }

      const branchId = c.req.query("branchId") || undefined;
      const parsedBranch = z.object({
        branchId: z.string().uuid("Invalid branch ID").optional(),
      }).safeParse({ branchId });
      if (!parsedBranch.success) {
        return errorResponse(c, "Validation failed", parsedBranch.error.issues, 400);
      }

      const pagination = getPaginationParams(c);
      const query = c.req.query();

      const data = await service.getCategoryBySlug(slug, { ...query, branchId: parsedBranch.data.branchId }, pagination);
      return successResponse(c, "Category details retrieved successfully", data);
    } catch (err: any) {
      const isNotFound = err.message === "Category not found" || err.message === "Branch not found";
      const status = isNotFound ? 404 : 400;
      return errorResponse(c, err.message || "Failed to retrieve category details", [], status);
    }
  }

  async list(c: Context) {
    try {
      const data = await service.listAllCategories();
      return successResponse(c, "Categories retrieved successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve categories", [], 400);
    }
  }
}
