import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ServiceCategoryController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { serviceCategorySchema, serviceCategoryReorderSchema } from "./validation.js";
import { z } from "zod";

export const serviceCategoriesRouter = new Hono();
const controller = new ServiceCategoryController();

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

// Public routes
serviceCategoriesRouter.get("/", (c) => controller.getActive(c));
serviceCategoriesRouter.get("/:id", validateParamId, (c) => controller.getById(c));

// Protected routes (Admin only)
serviceCategoriesRouter.use(authMiddleware);
serviceCategoriesRouter.use(requireRole(["admin"]));

serviceCategoriesRouter.get("/all/list", (c) => controller.getAll(c));
serviceCategoriesRouter.post("/", validateJson(serviceCategorySchema), (c) => controller.create(c));
serviceCategoriesRouter.put("/reorder", validateJson(serviceCategoryReorderSchema), (c) => controller.reorder(c));
serviceCategoriesRouter.put("/:id", validateParamId, validateJson(serviceCategorySchema), (c) => controller.update(c));
serviceCategoriesRouter.delete("/:id", validateParamId, (c) => controller.delete(c));
serviceCategoriesRouter.patch("/:id/activate", validateParamId, (c) => controller.activate(c));
serviceCategoriesRouter.patch("/:id/deactivate", validateParamId, (c) => controller.deactivate(c));
