import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { VerificationController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { verificationSchema } from "./validation.js";
import { z } from "zod";

export const verificationRouter = new Hono();
const controller = new VerificationController();

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

verificationRouter.use(authMiddleware);

// Vendor endpoints (require ownership verification inside service)
verificationRouter.post("/:id/submit", validateParamId, (c) => controller.submit(c));
verificationRouter.get("/:id", validateParamId, (c) => controller.getStatus(c));

// Admin endpoints
verificationRouter.use(requireRole(["admin"]));

verificationRouter.post("/:id/verify", validateParamId, validateJson(verificationSchema), (c) => controller.verify(c));
verificationRouter.post("/:id/reject", validateParamId, validateJson(verificationSchema), (c) => controller.reject(c));
