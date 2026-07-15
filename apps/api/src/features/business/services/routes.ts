import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ServiceController } from "./controller.js";
import { authMiddleware } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { serviceSchema } from "./validation.js";
import { z } from "zod";

export const servicesRouter = new Hono();
const controller = new ServiceController();

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

servicesRouter.use(authMiddleware);

servicesRouter.post("/", validateJson(serviceSchema), (c) => controller.create(c));
servicesRouter.put("/:id", validateParamId, validateJson(serviceSchema), (c) => controller.update(c));
servicesRouter.delete("/:id", validateParamId, (c) => controller.delete(c));
