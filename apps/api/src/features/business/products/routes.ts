import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ProductController } from "./controller.js";
import { authMiddleware } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { productSchema } from "./validation.js";
import { z } from "zod";

export const productsRouter = new Hono();
const controller = new ProductController();

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

productsRouter.use(authMiddleware);

productsRouter.post("/", validateJson(productSchema), (c) => controller.create(c));
productsRouter.put("/:id", validateParamId, validateJson(productSchema), (c) => controller.update(c));
productsRouter.delete("/:id", validateParamId, (c) => controller.delete(c));
