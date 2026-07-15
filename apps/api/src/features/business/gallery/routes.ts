import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { GalleryController } from "./controller.js";
import { authMiddleware } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { galleryUploadSchema, reorderSchema } from "./validation.js";
import { z } from "zod";

export const galleryRouter = new Hono();
const controller = new GalleryController();

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

galleryRouter.use(authMiddleware);

galleryRouter.post("/", validateJson(galleryUploadSchema), (c) => controller.upload(c));
galleryRouter.put("/reorder", validateJson(reorderSchema), (c) => controller.reorder(c));
galleryRouter.delete("/:id", validateParamId, (c) => controller.delete(c));
