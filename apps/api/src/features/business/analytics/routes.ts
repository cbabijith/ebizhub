import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { AnalyticsController } from "./controller.js";
import { authMiddleware } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { clickEventSchema } from "./validation.js";
import { z } from "zod";

export const analyticsRouter = new Hono();
const controller = new AnalyticsController();

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

// Track click is public (no authentication needed to increment click interactions)
analyticsRouter.post("/:id/click", validateParamId, validateJson(clickEventSchema), (c) => controller.track(c));

// Retrieve aggregates dashboard requires authentication
analyticsRouter.get("/:id/summary", authMiddleware, validateParamId, (c) => controller.getSummary(c));
