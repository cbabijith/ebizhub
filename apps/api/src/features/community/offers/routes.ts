import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { OfferController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { offerSchema, offerBaseSchema } from "./validation.js";

export const offersRouter = new Hono();
const controller = new OfferController();

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

// Public routes
offersRouter.get("/", (c) => controller.list(c));
offersRouter.get("/:id", validateParamId, (c) => controller.getById(c));

// Protected routes (Vendors & Admins)
offersRouter.use(authMiddleware);
offersRouter.post("/", requireRole(["vendor", "admin"]), validateJson(offerSchema), (c) => controller.create(c));
offersRouter.put("/:id", requireRole(["vendor", "admin"]), validateParamId, validateJson(offerBaseSchema.partial()), (c) => controller.update(c));
offersRouter.delete("/:id", requireRole(["vendor", "admin"]), validateParamId, (c) => controller.delete(c));
