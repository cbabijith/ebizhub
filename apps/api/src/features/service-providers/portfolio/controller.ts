import { Context } from "hono";
import { PortfolioService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const portfolioService = new PortfolioService();

export class PortfolioController {
  async create(c: Context) {
    try {
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await portfolioService.addPortfolioItem(profile.id, profile.role, body);
      return successResponse(c, "Portfolio item created successfully", result, {}, 201);
    } catch (err: any) {
      const status = err.message === "Service provider not found" ? 404 : (err.statusCode || 400);
      return errorResponse(c, err.message || "Failed to create portfolio item", [err.message], status);
    }
  }

  async update(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await portfolioService.updatePortfolioItem(id, profile.id, profile.role, body);
      return successResponse(c, "Portfolio item updated successfully", result);
    } catch (err: any) {
      const status = (err.message === "Portfolio item not found" || err.message === "Service provider not found") ? 404 : (err.statusCode || 400);
      return errorResponse(c, err.message || "Failed to update portfolio item", [err.message], status);
    }
  }

  async delete(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const result = await portfolioService.deletePortfolioItem(id, profile.id, profile.role);
      return successResponse(c, "Portfolio item deleted successfully", result);
    } catch (err: any) {
      const status = (err.message === "Portfolio item not found" || err.message === "Service provider not found") ? 404 : (err.statusCode || 400);
      return errorResponse(c, err.message || "Failed to delete portfolio item", [err.message], status);
    }
  }

  async reorder(c: Context) {
    try {
      const providerId = c.req.param("providerId") || "";
      const profile = c.get("profile");
      const { items } = c.req.valid("json" as never) as any;
      const result = await portfolioService.reorderPortfolio(providerId, profile.id, profile.role, items);
      return successResponse(c, "Portfolio reordered successfully", result);
    } catch (err: any) {
      const status = err.message === "Service provider not found" ? 404 : (err.statusCode || 400);
      return errorResponse(c, err.message || "Failed to reorder portfolio", [err.message], status);
    }
  }

  async list(c: Context) {
    try {
      const providerId = c.req.param("providerId") || "";
      const result = await portfolioService.getPortfolio(providerId);
      return successResponse(c, "Portfolio items retrieved successfully", result);
    } catch (err: any) {
      const status = err.message === "Service provider not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to retrieve portfolio items", [err.message], status);
    }
  }
}
