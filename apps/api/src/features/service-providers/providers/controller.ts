import { Context } from "hono";
import { ProviderService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const providerService = new ProviderService();

export class ProviderController {
  async register(c: Context) {
    try {
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await providerService.registerProvider(profile.id, body);
      return successResponse(c, "Service provider registered successfully", result, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to register provider", [err.message], 400);
    }
  }

  async update(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await providerService.updateProvider(id, profile.id, profile.role, body);
      return successResponse(c, "Service provider updated successfully", result);
    } catch (err: any) {
      const status = err.message === "Service provider not found" ? 404 : (err.statusCode || 400);
      return errorResponse(c, err.message || "Failed to update provider", [err.message], status);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const result = await providerService.getProviderById(id);
      return successResponse(c, "Service provider details retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve provider", [err.message], 404);
    }
  }

  async getOwn(c: Context) {
    try {
      const profile = c.get("profile");
      const result = await providerService.getOwnProvider(profile.id);
      return successResponse(c, "Own service provider profile retrieved successfully", result);
    } catch (err: any) {
      const status = (err.message === "Member profile not found" || err.message === "Service provider profile not found") ? 404 : 400;
      return errorResponse(c, err.message || "Failed to retrieve provider profile", [err.message], status);
    }
  }

  async delete(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const result = await providerService.deleteProvider(id, profile.id, profile.role);
      return successResponse(c, "Service provider profile deleted successfully", result);
    } catch (err: any) {
      const status = err.message === "Service provider not found" ? 404 : (err.statusCode || 400);
      return errorResponse(c, err.message || "Failed to delete provider", [err.message], status);
    }
  }

  async list(c: Context) {
    try {
      const result = await providerService.listProviders();
      return successResponse(c, "Service providers retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve providers", [err.message], 400);
    }
  }

  async updateStatus(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const { status } = c.req.valid("json" as never) as any;
      const result = await providerService.updateProviderStatus(id, status);
      return successResponse(c, "Service provider status updated successfully", result);
    } catch (err: any) {
      const status = err.message === "Service provider not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to update status", [err.message], status);
    }
  }
}
