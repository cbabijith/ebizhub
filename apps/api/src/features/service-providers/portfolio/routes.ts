import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { PortfolioController } from "./controller.js";
import { authMiddleware } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { createPortfolioSchema, updatePortfolioSchema, portfolioReorderSchema } from "./validation.js";
import { z } from "zod";

export const portfolioRouter = new Hono();
const controller = new PortfolioController();

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
portfolioRouter.get("/provider/:providerId", validateProviderId, (c) => controller.list(c));

// Protected routes
portfolioRouter.use(authMiddleware);

portfolioRouter.post("/", validateJson(createPortfolioSchema), (c) => controller.create(c));
portfolioRouter.put("/provider/:providerId/reorder", validateProviderId, validateJson(portfolioReorderSchema), (c) => controller.reorder(c));
portfolioRouter.put("/:id", validateParamId, validateJson(updatePortfolioSchema), (c) => controller.update(c));
portfolioRouter.delete("/:id", validateParamId, (c) => controller.delete(c));
