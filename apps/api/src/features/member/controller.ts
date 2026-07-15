import { Context } from "hono";
import { MemberService } from "./service.js";
import { successResponse, errorResponse } from "../../shared/responses/response.js";

const memberService = new MemberService();

export class MemberController {
  async getMe(c: Context) {
    try {
      const profile = c.get("profile");
      const result = await memberService.getOwnProfile(profile.id);
      return successResponse(c, "Profile retrieved successfully", result);
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
        return errorResponse(c, "Member ID is required", [], 400);
      }
      const result = await memberService.getPublicProfile(id);
      return successResponse(c, "Member profile retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve public profile", [err.message], 404);
    }
  }

  async addSkill(c: Context) {
    try {
      const profile = c.get("profile");
      const { skill } = await c.req.json();
      const result = await memberService.addSkill(profile.id, skill);
      return successResponse(c, "Skill added successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to add skill", [err.message], 400);
    }
  }

  async removeSkill(c: Context) {
    try {
      const profile = c.get("profile");
      const skillId = c.req.param("id");
      if (!skillId) {
        return errorResponse(c, "Skill ID is required", [], 400);
      }
      const result = await memberService.removeSkill(profile.id, skillId);
      return successResponse(c, "Skill removed successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to remove skill", [err.message], 400);
    }
  }

  async uploadAvatar(c: Context) {
    try {
      const profile = c.get("profile");
      const body = await c.req.parseBody();
      const file = body["file"];

      if (!file || !(file instanceof File)) {
        return errorResponse(c, "Image file is required", [], 400);
      }

      // In a real S3 integration, this would upload to S3.
      // For MVP, we mock the uploaded URL.
      const mockAvatarUrl = `https://supabase.co/storage/v1/object/public/avatars/${profile.id}_${Date.now()}_${file.name}`;
      
      const result = await memberService.updateOwnProfile(profile.id, {
        avatar: mockAvatarUrl,
      });

      return successResponse(c, "Avatar uploaded successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to upload avatar", [err.message], 400);
    }
  }
}
