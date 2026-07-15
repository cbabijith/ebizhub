import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { MemberController } from "./controller.js";
import { authMiddleware, requireRole } from "../../shared/middleware/auth.js";
import { errorResponse } from "../../shared/responses/response.js";
import { updateProfileSchema, addSkillSchema } from "./validation.js";

export const memberRouter = new Hono();
export const branchRouter = new Hono();
const controller = new MemberController();

// Reusable validator wrapper
const validateJson = (schema: any) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      const messages = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`);
      return errorResponse(c, "Validation failed", messages, 400);
    }
  });

// ==========================================
// Member Directory Router Endpoints
// ==========================================
memberRouter.use(authMiddleware);

memberRouter.get("/me", (c) => controller.getMe(c));
memberRouter.put("/me", validateJson(updateProfileSchema), (c) => controller.updateMe(c));
memberRouter.post("/skills", validateJson(addSkillSchema), (c) => controller.addSkill(c));
memberRouter.delete("/skills/:id", (c) => controller.removeSkill(c));
memberRouter.post("/avatar", (c) => controller.uploadAvatar(c));

// Admin Verification (Guarded by requireRole)
memberRouter.post("/:id/verify", requireRole(["admin"]), (c) => controller.verifyMember(c));
memberRouter.post("/:id/suspend", requireRole(["admin"]), (c) => controller.suspendMember(c));

// Get Public Profile
memberRouter.get("/:id", (c) => controller.getMemberById(c));

// ==========================================
// Branch Directory Router Endpoints
// ==========================================
branchRouter.use(authMiddleware);

branchRouter.get("/", (c) => controller.getBranches(c));
branchRouter.get("/:id/members", (c) => controller.getBranchMembers(c));
