import { Context } from "hono";
import { SkillService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const skillService = new SkillService();

export class SkillController {
  async create(c: Context) {
    try {
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await skillService.addSkill(profile.id, profile.role, body);
      return successResponse(c, "Skill added successfully", result, 201);
    } catch (err: any) {
      const status = err.message === "Service provider not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to add skill", [err.message], status);
    }
  }

  async update(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await skillService.updateSkill(id, profile.id, profile.role, body);
      return successResponse(c, "Skill updated successfully", result);
    } catch (err: any) {
      const status = (err.message === "Skill not found" || err.message === "Service provider not found") ? 404 : 400;
      return errorResponse(c, err.message || "Failed to update skill", [err.message], status);
    }
  }

  async delete(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const result = await skillService.deleteSkill(id, profile.id, profile.role);
      return successResponse(c, "Skill deleted successfully", result);
    } catch (err: any) {
      const status = (err.message === "Skill not found" || err.message === "Service provider not found") ? 404 : 400;
      return errorResponse(c, err.message || "Failed to delete skill", [err.message], status);
    }
  }

  async list(c: Context) {
    try {
      const providerId = c.req.param("providerId") || "";
      const result = await skillService.getSkills(providerId);
      return successResponse(c, "Skills retrieved successfully", result);
    } catch (err: any) {
      const status = err.message === "Service provider not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to retrieve skills", [err.message], status);
    }
  }
}
