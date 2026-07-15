import { Context } from "hono";
import { VerificationService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const verificationService = new VerificationService();

export class VerificationController {
  async verify(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const { remarks } = c.req.valid("json" as never) as any;
      const result = await verificationService.approveBusiness(id, profile.id, remarks);
      return successResponse(c, "Business verification approved successfully", result);
    } catch (err: any) {
      const status = err.message === "Business not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to verify business", [err.message], status);
    }
  }

  async reject(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const { remarks } = c.req.valid("json" as never) as any;
      const result = await verificationService.rejectBusiness(id, profile.id, remarks);
      return successResponse(c, "Business verification rejected successfully", result);
    } catch (err: any) {
      const status = err.message === "Business not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to reject business", [err.message], status);
    }
  }

  async submit(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const result = await verificationService.submitVerification(id, profile.id, profile.role);
      return successResponse(c, "Business verification submitted successfully", result);
    } catch (err: any) {
      const status = err.message === "Business not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to submit verification", [err.message], status);
    }
  }

  async getStatus(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const result = await verificationService.getHistory(id, profile.id, profile.role);
      return successResponse(c, "Verification history retrieved successfully", result);
    } catch (err: any) {
      const status = err.message === "Business not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to retrieve verification history", [err.message], status);
    }
  }
}

