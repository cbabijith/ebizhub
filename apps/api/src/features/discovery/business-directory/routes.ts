import { Hono } from "hono";
import { BusinessDirectoryController } from "./controller.js";

const router = new Hono();
const controller = new BusinessDirectoryController();

router.get("/businesses", (c) => controller.list(c));
router.get("/businesses/:id", (c) => controller.getById(c));
router.get("/businesses/category/:slug", (c) => controller.getByCategorySlug(c));

export default router;
