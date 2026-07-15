import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ProviderController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { createProviderSchema, updateProviderSchema, providerStatusSchema } from "./validation.js";
import { z } from "zod";

export const providersRouter = new Hono();
const controller = new ProviderController();

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

// Public routes
providersRouter.get("/", (c) => controller.list(c));
// GET /me (must be defined before /:id to prevent parameter shadowing)
providersRouter.get("/me", authMiddleware, (c) => controller.getOwn(c));
providersRouter.get("/:id", validateParamId, (c) => controller.getById(c));

// Protected routes (Authenticated members)
providersRouter.use(authMiddleware);

providersRouter.post("/", validateJson(createProviderSchema), (c) => controller.register(c));
providersRouter.put("/:id", validateParamId, validateJson(updateProviderSchema), (c) => controller.update(c));
providersRouter.delete("/:id", validateParamId, (c) => controller.delete(c));

// Admin route
providersRouter.patch("/:id/status", requireRole(["admin"]), validateParamId, validateJson(providerStatusSchema), (c) => controller.updateStatus(c));
