import { Hono } from "hono";
import { ShareLinksController } from "./controller.js";
import { authMiddleware } from "../../../shared/middleware/auth.js";

const controller = new ShareLinksController();
export const shareLinksRouter = new Hono();

// Create share link — requires auth
shareLinksRouter.post("/", authMiddleware, (c) => controller.create(c));

// Resolve a share link — public
shareLinksRouter.get("/:token", (c) => controller.resolve(c));

// Record a click — public
shareLinksRouter.post("/:token/click", (c) => controller.click(c));

// Soft-delete a share link — requires auth (owner or admin)
shareLinksRouter.delete("/:id", authMiddleware, (c) => controller.softDelete(c));
