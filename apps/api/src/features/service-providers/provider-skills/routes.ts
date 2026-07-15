import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { SkillController } from "./controller.js";
import { authMiddleware } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { addSkillSchema, updateSkillSchema } from "./validation.js";
import { z } from "zod";

export const skillsRouter = new Hono();
const controller = new SkillController();

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

const validateProviderId = zValidator("param", z.object({
  providerId: z.string().uuid("Invalid UUID format"),
}), (result, c) => {
  if (!result.success) {
    return errorResponse(c, "Invalid UUID format", ["providerId: Invalid UUID format"], 400);
  }
});

// Public routes
skillsRouter.get("/provider/:providerId", validateProviderId, (c) => controller.list(c));

// Protected routes
skillsRouter.use(authMiddleware);

skillsRouter.post("/", validateJson(addSkillSchema), (c) => controller.create(c));
skillsRouter.put("/:id", validateParamId, validateJson(updateSkillSchema), (c) => controller.update(c));
skillsRouter.delete("/:id", validateParamId, (c) => controller.delete(c));
