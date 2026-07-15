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
      return errorResponse(c, err.message || "Failed to verify business", [err.message], 400);
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
      return errorResponse(c, err.message || "Failed to reject business", [err.message], 400);
    }
  }
}
