import { Hono } from "hono";
import { HomeController } from "./controller.js";

const router = new Hono();
const controller = new HomeController();

router.get("/home", (c) => controller.getHome(c));

export default router;
