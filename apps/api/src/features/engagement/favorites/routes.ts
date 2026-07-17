import { Hono } from "hono";
import { FavoritesController } from "./controller.js";
import { authMiddleware } from "../../../shared/middleware/auth.js";

const controller = new FavoritesController();
export const favoritesRouter = new Hono();

// Auth required
favoritesRouter.post("/", authMiddleware, (c) => controller.save(c));
favoritesRouter.delete("/:id", authMiddleware, (c) => controller.remove(c));
favoritesRouter.get("/", authMiddleware, (c) => controller.list(c));

// Public
favoritesRouter.get("/count/:resourceType/:resourceId", (c) => controller.count(c));
