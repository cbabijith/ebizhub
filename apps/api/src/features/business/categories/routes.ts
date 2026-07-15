import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CategoryController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { categorySchema, categoryReorderSchema } from "./validation.js";

export const categoriesRouter = new Hono();
const controller = new CategoryController();

const validateJson = (schema: any) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      const messages = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`);
      return errorResponse(c, "Validation failed", messages, 400);
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
categoriesRouter.put("/:id", validateJson(categorySchema), (c) => controller.update(c));
categoriesRouter.delete("/:id", (c) => controller.delete(c));
categoriesRouter.patch("/:id/activate", (c) => controller.activate(c));
categoriesRouter.patch("/:id/deactivate", (c) => controller.deactivate(c));

