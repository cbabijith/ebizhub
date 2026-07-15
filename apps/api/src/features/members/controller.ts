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

      const mockAvatarUrl = `https://supabase.co/storage/v1/object/public/avatars/${profile.id}_${Date.now()}_${file.name}`;
      const result = await memberService.updateOwnProfile(profile.id, { avatar: mockAvatarUrl });
      return successResponse(c, "Avatar uploaded successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to upload avatar", [err.message], 400);
    }
  }

  // Admin Actions
  async verifyMember(c: Context) {
    try {
      const id = c.req.param("id");
      const { status } = await c.req.json();
      if (!id || !status || !["verified", "rejected"].includes(status)) {
        return errorResponse(c, "Valid ID and status (verified/rejected) are required", [], 400);
      }

      const result = await memberService.verifyMember(id, status);
      return successResponse(c, `Member verification status updated to ${status}`, result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to verify member", [err.message], 400);
    }
  }

  async suspendMember(c: Context) {
    try {
      const id = c.req.param("id");
      if (!id) {
        return errorResponse(c, "Member ID is required", [], 400);
      }

      const result = await memberService.suspendMember(id);
      return successResponse(c, "Member status suspended successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to suspend member", [err.message], 400);
    }
  }

  // Branch Directory Actions
  async getBranches(c: Context) {
    try {
      const result = await memberService.getBranches();
      return successResponse(c, "Branches retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve branches", [err.message], 400);
    }
  }

  async getBranchMembers(c: Context) {
    try {
      const branchId = c.req.param("id");
      if (!branchId) {
        return errorResponse(c, "Branch ID is required", [], 400);
      }
      const result = await memberService.getBranchMembers(branchId);
      return successResponse(c, "Branch members retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve branch members", [err.message], 400);
    }
  }
}
