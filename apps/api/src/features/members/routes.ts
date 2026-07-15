import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { MemberController } from "./controller.js";
import { authMiddleware, requireRole } from "../../shared/middleware/auth.js";
import { errorResponse } from "../../shared/responses/response.js";
import { updateProfileSchema, addSkillSchema } from "./validation.js";

import { z } from "zod";

export const memberRouter = new Hono();
export const branchRouter = new Hono();
const controller = new MemberController();

// Reusable validator wrappers
const validateJson = (schema: any) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      const messages = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`);
      return errorResponse(c, "Validation failed", messages, 400);
    }
  });

const validateParamId = zValidator("param", z.object({
  id: z.string().uuid("Invalid UUID format"),
}), (result, c) => {
  if (!result.success) {
    return errorResponse(c, "Invalid UUID format", ["id: Invalid UUID format"], 400);
  }
});

// ==========================================
// Member Directory Router Endpoints
// ==========================================
memberRouter.use(authMiddleware);

memberRouter.get("/me", (c) => controller.getMe(c));
memberRouter.put("/me", validateJson(updateProfileSchema), (c) => controller.updateMe(c));
memberRouter.post("/skills", validateJson(addSkillSchema), (c) => controller.addSkill(c));
memberRouter.delete("/skills/:id", validateParamId, (c) => controller.removeSkill(c));
memberRouter.post("/avatar", (c) => controller.uploadAvatar(c));

// Admin Verification (Guarded by requireRole)
memberRouter.post("/:id/verify", requireRole(["admin"]), validateParamId, (c) => controller.verifyMember(c));
memberRouter.post("/:id/suspend", requireRole(["admin"]), validateParamId, (c) => controller.suspendMember(c));

// Get Public Profile
memberRouter.get("/:id", validateParamId, (c) => controller.getMemberById(c));

// ==========================================
// Branch Directory Router Endpoints
// ==========================================
branchRouter.use(authMiddleware);

branchRouter.get("/", (c) => controller.getBranches(c));
branchRouter.get("/:id/members", validateParamId, (c) => controller.getBranchMembers(c));
