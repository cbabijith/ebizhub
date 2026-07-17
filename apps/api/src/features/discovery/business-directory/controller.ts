import { Context } from "hono";
import { BusinessDirectoryService } from "./service.js";
import { getPaginationParams } from "../../../shared/pagination/pagination.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { z } from "zod";
import { businessQuerySchema } from "./validation.js";

const service = new BusinessDirectoryService();

export class BusinessDirectoryController {
  async list(c: Context) {
    try {
      const parsed = businessQuerySchema.safeParse(c.req.query());
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const pagination = getPaginationParams(c);

      const result = await service.getBusinesses({
        ...parsed.data,
        limit: pagination.limit,
        offset: pagination.offset,
      });

      return successResponse(
        c,
        "Businesses retrieved successfully",
        result.businesses,
        {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
        }
      );
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve businesses", [], err.status || 400);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const parsedId = z.string().uuid("Invalid UUID format").safeParse(id);
      if (!parsedId.success) {
        return errorResponse(c, "Invalid UUID format", parsedId.error.issues, 400);
      }

      const business = await service.getBusinessById(id);
      return successResponse(c, "Business details retrieved successfully", business);
    } catch (err: any) {
      const isNotFound = err.message === "Business not found";
      const status = isNotFound ? 404 : 400;
      return errorResponse(c, err.message || "Failed to retrieve business", [], status);
    }
  }

  async getByCategorySlug(c: Context) {
    try {
      const slug = c.req.param("slug") || "";
      const parsedSlug = z.string().regex(/^[a-z0-9-]+$/).safeParse(slug);
      if (!parsedSlug.success) {
        return errorResponse(c, "Invalid slug format", parsedSlug.error.issues, 400);
      }

      const parsedBranch = z.object({
        branchId: z.string().uuid("Invalid branch ID").optional(),
      }).safeParse({
        branchId: c.req.query("branchId") || undefined,
      });
      if (!parsedBranch.success) {
        return errorResponse(c, "Validation failed", parsedBranch.error.issues, 400);
      }

      const pagination = getPaginationParams(c);

      const result = await service.getBusinessesByCategorySlug(slug, {
        limit: pagination.limit,
        offset: pagination.offset,
        branchId: parsedBranch.data.branchId,
      });

      return successResponse(
        c,
        "Category businesses retrieved successfully",
        result.businesses,
        {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
        }
      );
    } catch (err: any) {
      const isNotFound = err.message === "Category not found" || err.message === "Branch not found";
      const status = isNotFound ? 404 : 400;
      return errorResponse(c, err.message || "Failed to retrieve businesses", [], status);
    }
  }
}
