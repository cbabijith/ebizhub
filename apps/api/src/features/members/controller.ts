import { Context } from "hono";
import { MemberService } from "./service.js";
import { successResponse, errorResponse } from "../../shared/responses/response.js";

const memberService = new MemberService();

export class MemberController {
  async getMe(c: Context) {
    try {
      const profile = c.get("profile");
      const result = await memberService.getOwnProfile(profile.id);
      return successResponse(c, "Member profile retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve profile", [err.message], 400);
    }
  }

  async updateMe(c: Context) {
    try {
      const profile = c.get("profile");
      const body = await c.req.json();
      const result = await memberService.updateOwnProfile(profile.id, body);
      return successResponse(c, "Profile updated successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update profile", [err.message], 400);
    }
  }

  async getMemberById(c: Context) {
    try {
      const id = c.req.param("id");
      if (!id) {
        return errorResponse(c, "Member ID param is required", [], 400);
      }
      const result = await memberService.getPublicProfile(id);
      return successResponse(c, "Member profile retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve profile", [err.message], 404);
    }
  }
}
