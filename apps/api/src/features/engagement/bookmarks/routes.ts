import { Hono } from "hono";
import { BookmarksController } from "./controller.js";
import { authMiddleware } from "../../../shared/middleware/auth.js";

const controller = new BookmarksController();
export const bookmarksRouter = new Hono();

// All bookmarks routes require authentication
bookmarksRouter.use("*", authMiddleware);

bookmarksRouter.post("/", (c) => controller.save(c));
bookmarksRouter.get("/", (c) => controller.list(c));
bookmarksRouter.get("/:resourceType", (c) => controller.list(c));
bookmarksRouter.delete("/:id", (c) => controller.remove(c));
