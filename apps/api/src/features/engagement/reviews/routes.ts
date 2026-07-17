import { Hono } from "hono";
import { ReviewsController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";

const controller = new ReviewsController();
export const reviewsRouter = new Hono();
export const adminReviewsRouter = new Hono();

// Public reviews routes
reviewsRouter.get("/:resourceType/:resourceId", (c) => controller.list(c));
reviewsRouter.get("/:id", (c) => controller.getById(c));

// Authenticated reviews routes
reviewsRouter.post("/", authMiddleware, (c) => controller.save(c));
reviewsRouter.patch("/:id", authMiddleware, (c) => controller.update(c));
reviewsRouter.delete("/:id", authMiddleware, (c) => controller.remove(c));
reviewsRouter.post("/:id/report", authMiddleware, (c) => controller.report(c));

// Admin reviews routes
adminReviewsRouter.get("/reviews/reported", authMiddleware, requireRole(["admin"]), (c) => controller.listReported(c));
adminReviewsRouter.post("/reviews/:id/moderate", authMiddleware, requireRole(["admin"]), (c) => controller.moderate(c));
