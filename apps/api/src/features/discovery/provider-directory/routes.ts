import { Hono } from "hono";
import { ProviderDirectoryController } from "./controller.js";

const router = new Hono();
const controller = new ProviderDirectoryController();

router.get("/providers", (c) => controller.list(c));
router.get("/providers/:id", (c) => controller.getById(c));
router.get("/providers/category/:slug", (c) => controller.getByCategorySlug(c));

export default router;
