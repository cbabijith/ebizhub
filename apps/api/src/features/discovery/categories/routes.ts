import { Hono } from "hono";
import { CategoryController } from "./controller.js";

export const categoriesRouter = new Hono();
const controller = new CategoryController();

categoriesRouter.get("/categories", (c) => controller.list(c));
categoriesRouter.get("/categories/popular", (c) => controller.getPopular(c));
categoriesRouter.get("/categories/:slug", (c) => controller.getBySlug(c));
