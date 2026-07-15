import { Context } from "hono";
import { PublicService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const publicService = new PublicService();

export class PublicController {
  async getProfile(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || null;
      const result = await publicService.getPublicProfile(id, ip);
      return successResponse(c, "Service provider profile retrieved successfully", result);
    } catch (err: any) {
      const status = err.message === "Service provider not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to retrieve provider profile", [err.message], status);
    }
  }

  async list(c: Context) {
    try {
      const query = c.req.valid("query" as never) as any;
      const result = await publicService.listPublicProviders(query);
      return successResponse(c, "Service providers retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve providers list", [err.message], 400);
    }
  }
}
