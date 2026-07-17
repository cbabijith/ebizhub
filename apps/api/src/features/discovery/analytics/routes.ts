import { Hono } from "hono";
import { DiscoveryAnalyticsController } from "./controller.js";

const router = new Hono();
const controller = new DiscoveryAnalyticsController();

router.post("/businesses/:id/click", (c) => controller.trackBusiness(c));
router.post("/providers/:id/click", (c) => controller.trackProvider(c));

export default router;
