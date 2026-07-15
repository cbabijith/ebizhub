import { Context } from "hono";
import { AreaService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const areaService = new AreaService();

export class AreaController {
  async create(c: Context) {
    try {
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await areaService.addServiceArea(profile.id, profile.role, body);
      return successResponse(c, "Service area added successfully", result, 201);
    } catch (err: any) {
      const isNotFound = ["Service provider not found", "District not found", "Panchayat not found"].includes(err.message);
      const status = isNotFound ? 404 : 400;
      return errorResponse(c, err.message || "Failed to add service area", [err.message], status);
    }
  }

  async delete(c: Context) {
    try {
      const id = parseInt(c.req.param("id") || "0", 10);
      if (isNaN(id)) {
        return errorResponse(c, "Invalid service area ID", [], 400);
      }
      const profile = c.get("profile");
      const result = await areaService.removeServiceArea(id, profile.id, profile.role);
      return successResponse(c, "Service area removed successfully", result);
    } catch (err: any) {
      const isNotFound = ["Service area not found", "Service provider not found"].includes(err.message);
      const status = isNotFound ? 404 : 400;
      return errorResponse(c, err.message || "Failed to remove service area", [err.message], status);
    }
  }

  async list(c: Context) {
    try {
      const providerId = c.req.param("providerId") || "";
      const result = await areaService.getServiceAreas(providerId);
      return successResponse(c, "Service areas retrieved successfully", result);
    } catch (err: any) {
      const status = err.message === "Service provider not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to retrieve service areas", [err.message], status);
    }
  }
}
