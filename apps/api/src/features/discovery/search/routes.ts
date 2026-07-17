import { Hono } from "hono";
import { SearchController } from "./controller.js";

export const searchRouter = new Hono();
const controller = new SearchController();

searchRouter.get("/search", (c) => controller.search(c));
searchRouter.get("/search/suggestions", (c) => controller.suggestions(c));
