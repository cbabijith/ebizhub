import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { NewsCategoryController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { newsCategorySchema } from "./validation.js";

export const newsCategoriesRouter = new Hono();
const controller = new NewsCategoryController();

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
newsCategoriesRouter.get("/", (c) => controller.getActive(c));
newsCategoriesRouter.get("/:id", validateParamId, (c) => controller.getById(c));

// Protected Admin routes
newsCategoriesRouter.use(authMiddleware);
newsCategoriesRouter.use(requireRole(["admin"]));

newsCategoriesRouter.get("/admin/all", (c) => controller.getAll(c));
newsCategoriesRouter.post("/", validateJson(newsCategorySchema), (c) => controller.create(c));
newsCategoriesRouter.put("/:id", validateParamId, validateJson(newsCategorySchema), (c) => controller.update(c));
newsCategoriesRouter.delete("/:id", validateParamId, (c) => controller.delete(c));
