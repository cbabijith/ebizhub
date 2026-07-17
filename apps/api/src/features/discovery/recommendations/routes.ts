import { Hono } from "hono";
import { RecommendationsController } from "./controller.js";

const router = new Hono();
const controller = new RecommendationsController();

router.get("/recommendations/:type/:id", (c) => controller.getRecommendations(c));

export default router;
