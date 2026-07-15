import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CategoryController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { categorySchema, categoryReorderSchema } from "./validation.js";
import { z } from "zod";

export const categoriesRouter = new Hono();
const controller = new CategoryController();

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

// Public route to view active categories
categoriesRouter.get("/", (c) => controller.getActive(c));

// Protected routes (Admin Only)
categoriesRouter.use(authMiddleware);
categoriesRouter.use(requireRole(["admin"]));

categoriesRouter.get("/all", (c) => controller.getAll(c));
categoriesRouter.post("/", validateJson(categorySchema), (c) => controller.create(c));
categoriesRouter.put("/reorder", validateJson(categoryReorderSchema), (c) => controller.reorder(c));
categoriesRouter.put("/:id", validateParamId, validateJson(categorySchema), (c) => controller.update(c));
categoriesRouter.delete("/:id", validateParamId, (c) => controller.delete(c));
categoriesRouter.patch("/:id/activate", validateParamId, (c) => controller.activate(c));
categoriesRouter.patch("/:id/deactivate", validateParamId, (c) => controller.deactivate(c));

