import { Context } from "hono";
import { VerificationService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const verificationService = new VerificationService();

export class VerificationController {
  async submit(c: Context) {
    try {
      const profile = c.get("profile");
      const { providerId } = c.req.valid("json" as never) as any;
      const result = await verificationService.submitRequest(profile.id, profile.role, providerId);
      return successResponse(c, "Verification request submitted successfully", result, {}, 201);
    } catch (err: any) {
      const isNotFound = err.message === "Service provider not found";
      const status = isNotFound ? 404 : (err.statusCode || 400);
      return errorResponse(c, err.message || "Failed to submit request", [err.message], status);
    }
  }

  async approve(c: Context) {
    try {
      const profile = c.get("profile");
      const id = c.req.param("id") || "";
      const { remarks } = c.req.valid("json" as never) as any;
      const result = await verificationService.reviewRequest(profile.id, profile.role, id, true, remarks || null);
      return successResponse(c, "Verification request approved successfully", result);
    } catch (err: any) {
      const isNotFound = err.message === "Verification request not found";
      const status = isNotFound ? 404 : (err.statusCode || 400);
      return errorResponse(c, err.message || "Failed to approve request", [err.message], status);
    }
  }

  async reject(c: Context) {
    try {
      const profile = c.get("profile");
      const id = c.req.param("id") || "";
      const { remarks } = c.req.valid("json" as never) as any;
      const result = await verificationService.reviewRequest(profile.id, profile.role, id, false, remarks || null);
      return successResponse(c, "Verification request rejected successfully", result);
    } catch (err: any) {
      const isNotFound = err.message === "Verification request not found";
      const status = isNotFound ? 404 : (err.statusCode || 400);
      return errorResponse(c, err.message || "Failed to reject request", [err.message], status);
    }
  }

  async getHistory(c: Context) {
    try {
      const profile = c.get("profile");
      const providerId = c.req.param("providerId") || "";
      const result = await verificationService.getHistory(profile.id, profile.role, providerId);
      return successResponse(c, "Verification history retrieved successfully", result);
    } catch (err: any) {
      const isNotFound = err.message === "Service provider not found";
      const status = isNotFound ? 404 : (err.statusCode || 400);
      return errorResponse(c, err.message || "Failed to retrieve history", [err.message], status);
    }
  }
}
