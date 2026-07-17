import { Hono } from "hono";
import { TrendingController } from "./controller.js";

const router = new Hono();
const controller = new TrendingController();

router.get("/trending", (c) => controller.getCombined(c));
router.get("/trending/businesses", (c) => controller.getBusinesses(c));
router.get("/trending/providers", (c) => controller.getProviders(c));

export default router;
