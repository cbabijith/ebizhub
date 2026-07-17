import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { EventController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { eventSchema, eventBaseSchema } from "./validation.js";

export const eventsRouter = new Hono();
const controller = new EventController();

const validateJson = (schema: any) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      const messages = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`);
      return errorResponse(c, "Validation failed", messages, 400);
    }
  });

const validateParamId = zValidator("param", z.object({
  id: z.string().uuid("Invalid ID format, must be a UUID"),
}), (result, c) => {
  if (!result.success) {
    return errorResponse(c, "Invalid ID format", ["id: Invalid ID format, must be a UUID"], 400);
  }
});

const validateRegistrationId = zValidator("param", z.object({
  registrationId: z.string().uuid("Invalid registration ID format, must be a UUID"),
}), (result, c) => {
  if (!result.success) {
    return errorResponse(c, "Invalid registration ID format", ["registrationId: Invalid UUID"], 400);
  }
});

const registrationStatusUpdateSchema = z.object({
  status: z.enum(["approved", "rejected", "attended", "cancelled"]),
});

// Public routes
eventsRouter.get("/", (c) => controller.list(c));
eventsRouter.get("/:id", validateParamId, (c) => controller.getById(c));

// Protected routes (Members & Admins)
eventsRouter.use(authMiddleware);

// Members register for event
eventsRouter.post("/:id/register", validateParamId, (c) => controller.register(c));

// Admin only routes
eventsRouter.post("/", requireRole(["admin"]), validateJson(eventSchema), (c) => controller.create(c));
eventsRouter.put("/:id", requireRole(["admin"]), validateParamId, validateJson(eventBaseSchema.partial()), (c) => controller.update(c));
eventsRouter.delete("/:id", requireRole(["admin"]), validateParamId, (c) => controller.delete(c));

eventsRouter.get("/:id/registrations", requireRole(["admin"]), validateParamId, (c) => controller.getRegistrations(c));
eventsRouter.put("/registrations/:registrationId", requireRole(["admin"]), validateRegistrationId, validateJson(registrationStatusUpdateSchema), (c) => controller.updateRegistrationStatus(c));
