import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { BusinessController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { businessSchema, businessStatusSchema } from "./validation.js";
import { z } from "zod";

export const businessesRouter = new Hono();
const controller = new BusinessController();

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

// Public Endpoint
businessesRouter.get("/:id", validateParamId, (c) => controller.getById(c));

// Protected Endpoints
businessesRouter.use(authMiddleware);

businessesRouter.post("/", requireRole(["vendor", "admin"]), validateJson(businessSchema), (c) => controller.register(c));
businessesRouter.get("/me", (c) => controller.getOwn(c));
businessesRouter.put("/:id", validateParamId, validateJson(businessSchema), (c) => controller.update(c));
businessesRouter.delete("/:id", validateParamId, (c) => controller.delete(c));
businessesRouter.patch("/:id/status", requireRole(["admin"]), validateParamId, validateJson(businessStatusSchema), (c) => controller.updateStatus(c));

