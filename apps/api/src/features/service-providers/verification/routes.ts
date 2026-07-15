import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { VerificationController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { submitVerificationSchema, reviewVerificationSchema } from "./validation.js";
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

const validateProviderId = zValidator("param", z.object({
  providerId: z.string().uuid("Invalid UUID format"),
}), (result, c) => {
  if (!result.success) {
    return errorResponse(c, "Invalid UUID format", ["providerId: Invalid UUID format"], 400);
  }
});

// All verification routes require authentication
verificationRouter.use(authMiddleware);

verificationRouter.post("/submit", validateJson(submitVerificationSchema), (c) => controller.submit(c));
verificationRouter.get("/history/:providerId", validateProviderId, (c) => controller.getHistory(c));

// Admin-only verification actions
verificationRouter.post("/:id/approve", requireRole(["admin"]), validateParamId, validateJson(reviewVerificationSchema), (c) => controller.approve(c));
verificationRouter.post("/:id/reject", requireRole(["admin"]), validateParamId, validateJson(reviewVerificationSchema), (c) => controller.reject(c));
