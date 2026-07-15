import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { AreaController } from "./controller.js";
import { authMiddleware } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { addAreaSchema } from "./validation.js";
import { z } from "zod";

export const areasRouter = new Hono();
const controller = new AreaController();

const validateJson = (schema: any) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      const messages = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`);
      return errorResponse(c, "Validation failed", messages, 400);
    }
  });

const validateParamId = zValidator("param", z.object({
  id: z.string().regex(/^\d+$/, "Invalid ID format, must be an integer"),
}), (result, c) => {
  if (!result.success) {
    return errorResponse(c, "Invalid ID format", ["id: Invalid ID format, must be an integer"], 400);
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
areasRouter.get("/provider/:providerId", validateProviderId, (c) => controller.list(c));

// Protected routes
areasRouter.use(authMiddleware);

areasRouter.post("/", validateJson(addAreaSchema), (c) => controller.create(c));
areasRouter.delete("/:id", validateParamId, (c) => controller.delete(c));
