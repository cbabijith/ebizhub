import { Hono } from "hono";
import { RecentController } from "./controller.js";

const router = new Hono();
const controller = new RecentController();

router.get("/recent", (c) => controller.getRecent(c));
router.get("/recently-verified", (c) => controller.getRecentlyVerified(c));

export default router;
