import { Hono } from "hono";
import { PopularCategoriesController } from "./controller.js";

const router = new Hono();
const controller = new PopularCategoriesController();

router.get("/popular-categories", (c) => controller.getPopularCategories(c));

export default router;
