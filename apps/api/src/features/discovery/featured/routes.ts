import { Hono } from "hono";
import { FeaturedController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";

const router = new Hono();
const controller = new FeaturedController();

// Public discovery endpoints
router.get("/featured", (c) => controller.getCombined(c));
router.get("/featured/businesses", (c) => controller.getBusinesses(c));
router.get("/featured/providers", (c) => controller.getProviders(c));

export default router;

// Admin routes — exported separately to be mounted under /admin
export const adminFeaturedRouter = new Hono();
adminFeaturedRouter.use("/*", authMiddleware);
adminFeaturedRouter.use("/*", requireRole(["admin"]));
adminFeaturedRouter.post("/featured", (c) => controller.create(c));
adminFeaturedRouter.put("/featured/:id", (c) => controller.update(c));
adminFeaturedRouter.delete("/featured/:id", (c) => controller.delete(c));
