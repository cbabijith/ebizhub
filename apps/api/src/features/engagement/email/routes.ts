import { Hono } from "hono";
import { EmailController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";

const controller = new EmailController();

export const emailRouter = new Hono();

// Hono middleware must be chained via .use() then handler or individually per route
// ── Templates (admin only) ────────────────────────────────────────────────────
emailRouter.get("/templates", authMiddleware, requireRole(["admin"]), (c) => controller.listTemplates(c));
emailRouter.post("/templates", authMiddleware, requireRole(["admin"]), (c) => controller.createTemplate(c));
emailRouter.get("/templates/:id", authMiddleware, requireRole(["admin"]), (c) => controller.getTemplate(c));
emailRouter.patch("/templates/:id", authMiddleware, requireRole(["admin"]), (c) => controller.updateTemplate(c));
emailRouter.delete("/templates/:id", authMiddleware, requireRole(["admin"]), (c) => controller.deleteTemplate(c));

// ── Send (admin only) ─────────────────────────────────────────────────────────
emailRouter.post("/send", authMiddleware, requireRole(["admin"]), (c) => controller.send(c));

// ── Logs (admin only) ─────────────────────────────────────────────────────────
emailRouter.get("/logs", authMiddleware, requireRole(["admin"]), (c) => controller.listLogs(c));
emailRouter.get("/logs/:id", authMiddleware, requireRole(["admin"]), (c) => controller.getLog(c));
