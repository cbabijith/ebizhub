import { Context } from "hono";
import { FeaturedService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { createFeaturedSchema, updateFeaturedSchema, featuredIdParamSchema } from "./validation.js";
import { z } from "zod";

const service = new FeaturedService();

export class FeaturedController {
  // Public endpoints
  async getCombined(c: Context) {
    try {
      const branchId = c.req.query("branchId") || undefined;
      const parsedBranch = z.object({
        branchId: z.string().uuid("Invalid branch ID").optional(),
      }).safeParse({ branchId });
      if (!parsedBranch.success) {
        return errorResponse(c, "Validation failed", parsedBranch.error.issues, 400);
      }

      const data = await service.getFeaturedCombined(parsedBranch.data.branchId);
      return successResponse(c, "Featured listings retrieved successfully", data);
    } catch (err: any) {
      const isNotFound = err.message === "Branch not found";
      const status = isNotFound ? 404 : (err.status || 500);
      return errorResponse(c, err.message || "Failed to retrieve featured listings", [], status);
    }
  }

  async getBusinesses(c: Context) {
    try {
      const branchId = c.req.query("branchId") || undefined;
      const parsedBranch = z.object({
        branchId: z.string().uuid("Invalid branch ID").optional(),
      }).safeParse({ branchId });
      if (!parsedBranch.success) {
        return errorResponse(c, "Validation failed", parsedBranch.error.issues, 400);
      }

      const data = await service.getFeaturedBusinesses(parsedBranch.data.branchId);
      return successResponse(c, "Featured businesses retrieved successfully", data);
    } catch (err: any) {
      const isNotFound = err.message === "Branch not found";
      const status = isNotFound ? 404 : (err.status || 500);
      return errorResponse(c, err.message || "Failed to retrieve featured businesses", [], status);
    }
  }

  async getProviders(c: Context) {
    try {
      const branchId = c.req.query("branchId") || undefined;
      const parsedBranch = z.object({
        branchId: z.string().uuid("Invalid branch ID").optional(),
      }).safeParse({ branchId });
      if (!parsedBranch.success) {
        return errorResponse(c, "Validation failed", parsedBranch.error.issues, 400);
      }

      const data = await service.getFeaturedProviders(parsedBranch.data.branchId);
      return successResponse(c, "Featured providers retrieved successfully", data);
    } catch (err: any) {
      const isNotFound = err.message === "Branch not found";
      const status = isNotFound ? 404 : (err.status || 500);
      return errorResponse(c, err.message || "Failed to retrieve featured providers", [], status);
    }
  }

  // Admin endpoints
  async create(c: Context) {
    try {
      const body = await c.req.json();
      const parsed = createFeaturedSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const profile = c.get("profile");
      const data = await service.createFeatured({
        ...parsed.data,
        createdBy: profile.id,
      });
      return successResponse(c, "Featured listing created successfully", data, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to create featured listing", [], err.status || 500);
    }
  }

  async update(c: Context) {
    try {
      const paramParsed = featuredIdParamSchema.safeParse({ id: c.req.param("id") });
      if (!paramParsed.success) {
        return errorResponse(c, "Invalid featured listing ID", paramParsed.error.issues, 400);
      }

      const body = await c.req.json();
      const parsed = updateFeaturedSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const data = await service.updateFeatured(paramParsed.data.id, parsed.data);
      return successResponse(c, "Featured listing updated successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update featured listing", [], err.status || 500);
    }
  }

  async delete(c: Context) {
    try {
      const paramParsed = featuredIdParamSchema.safeParse({ id: c.req.param("id") });
      if (!paramParsed.success) {
        return errorResponse(c, "Invalid featured listing ID", paramParsed.error.issues, 400);
      }

      await service.deleteFeatured(paramParsed.data.id);
      return successResponse(c, "Featured listing deleted successfully");
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete featured listing", [], err.status || 500);
    }
  }
}
