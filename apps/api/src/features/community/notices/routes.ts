import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { NoticeController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { noticeSchema } from "./validation.js";

export const noticesRouter = new Hono();
const controller = new NoticeController();

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
noticesRouter.get("/", (c) => controller.list(c));
noticesRouter.get("/:id", validateParamId, (c) => controller.getById(c));

// Protected admin routes
noticesRouter.use(authMiddleware);
noticesRouter.use(requireRole(["admin"]));

noticesRouter.post("/", validateJson(noticeSchema), (c) => controller.create(c));
noticesRouter.put("/:id", validateParamId, validateJson(noticeSchema.partial()), (c) => controller.update(c));
noticesRouter.delete("/:id", validateParamId, (c) => controller.delete(c));
