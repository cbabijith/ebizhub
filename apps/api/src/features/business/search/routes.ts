import { Hono } from "hono";
import { SearchController } from "./controller.js";

export const searchRouter = new Hono();
const controller = new SearchController();

searchRouter.get("/", (c) => controller.search(c));
