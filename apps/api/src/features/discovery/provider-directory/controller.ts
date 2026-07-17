import { Context } from "hono";
import { ProviderDirectoryService } from "./service.js";
import { getPaginationParams } from "../../../shared/pagination/pagination.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { z } from "zod";
import { providerQuerySchema } from "./validation.js";

const service = new ProviderDirectoryService();

export class ProviderDirectoryController {
  async list(c: Context) {
    try {
      const parsed = providerQuerySchema.safeParse(c.req.query());
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const pagination = getPaginationParams(c);

      const result = await service.getProviders({
        ...parsed.data,
        limit: pagination.limit,
        offset: pagination.offset,
      });

      return successResponse(
        c,
        "Service providers retrieved successfully",
        result.providers,
        {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
        }
      );
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve service providers", [], err.status || 400);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const parsedId = z.string().uuid("Invalid UUID format").safeParse(id);
      if (!parsedId.success) {
        return errorResponse(c, "Invalid UUID format", parsedId.error.issues, 400);
      }

      const provider = await service.getProviderById(id);
      return successResponse(c, "Service provider details retrieved successfully", provider);
    } catch (err: any) {
      const isNotFound = err.message === "Service provider not found";
      const status = isNotFound ? 404 : 400;
      return errorResponse(c, err.message || "Failed to retrieve service provider", [], status);
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

      const result = await service.getProvidersByCategorySlug(slug, {
        limit: pagination.limit,
        offset: pagination.offset,
        branchId: parsedBranch.data.branchId,
      });

      return successResponse(
        c,
        "Category service providers retrieved successfully",
        result.providers,
        {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
        }
      );
    } catch (err: any) {
      const isNotFound = err.message === "Category not found" || err.message === "Branch not found";
      const status = isNotFound ? 404 : 400;
      return errorResponse(c, err.message || "Failed to retrieve service providers", [], status);
    }
  }
}
