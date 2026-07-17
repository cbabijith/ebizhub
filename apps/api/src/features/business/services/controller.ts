import { Context } from "hono";
import { ServiceService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const serviceService = new ServiceService();

export class ServiceController {
  async create(c: Context) {
    try {
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await serviceService.addService(profile.id, body);
      return successResponse(c, "Service added successfully", result, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to add service", [err.message], 400);
    }
  }

  async update(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await serviceService.updateService(id, profile.id, body);
      return successResponse(c, "Service updated successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update service", [err.message], 400);
    }
  }

  async delete(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const result = await serviceService.deleteService(id, profile.id);
      return successResponse(c, "Service deleted successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete service", [err.message], 400);
    }
  }
}
