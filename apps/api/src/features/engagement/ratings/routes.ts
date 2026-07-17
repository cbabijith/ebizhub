import { Hono } from "hono";
import { RatingsController } from "./controller.js";
import { authMiddleware } from "../../../shared/middleware/auth.js";

const controller = new RatingsController();
export const ratingsRouter = new Hono();

// Auth required
ratingsRouter.post("/", authMiddleware, (c) => controller.save(c));
ratingsRouter.patch("/:id", authMiddleware, (c) => controller.update(c));
ratingsRouter.delete("/:id", authMiddleware, (c) => controller.remove(c));

// Public
ratingsRouter.get("/:resourceType/:resourceId", (c) => controller.list(c));
ratingsRouter.get("/:resourceType/:resourceId/summary", (c) => controller.summary(c));
