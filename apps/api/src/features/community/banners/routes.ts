import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { BannerController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { bannerSchema } from "./validation.js";

export const bannersRouter = new Hono();
const controller = new BannerController();

const validateJson = (schema: any) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      const messages = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`);
      return errorResponse(c, "Validation failed", messages, 400);
    }
  });

const validateParamId = zValidator("param", z.object({
  id: z.string().uuid("Invalid ID format, must be a UUID"),
}), (result, c) => {
  if (!result.success) {
    return errorResponse(c, "Invalid ID format", ["id: Invalid ID format, must be a UUID"], 400);
  }
});

// Public route to get banners
bannersRouter.get("/", (c) => controller.list(c));
bannersRouter.get("/:id", validateParamId, (c) => controller.getById(c));

// Protected Admin routes
bannersRouter.use(authMiddleware);
bannersRouter.use(requireRole(["admin"]));

bannersRouter.post("/", validateJson(bannerSchema), (c) => controller.create(c));
bannersRouter.put("/:id", validateParamId, validateJson(bannerSchema.partial()), (c) => controller.update(c));
bannersRouter.delete("/:id", validateParamId, (c) => controller.delete(c));
