import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { JobController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { jobSchema } from "./validation.js";

export const jobsRouter = new Hono();
const controller = new JobController();

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

const validateApplicationId = zValidator("param", z.object({
  applicationId: z.string().uuid("Invalid application ID format, must be a UUID"),
}), (result, c) => {
  if (!result.success) {
    return errorResponse(c, "Invalid application ID format", ["applicationId: Invalid UUID"], 400);
  }
});

const applicationStatusUpdateSchema = z.object({
  status: z.enum(["applied", "shortlisted", "rejected", "interview", "selected", "joined"]),
});

// Public routes
jobsRouter.get("/", (c) => controller.list(c));
jobsRouter.get("/:id", validateParamId, (c) => controller.getById(c));

// Protected routes (Vendors, Members, Admins)
jobsRouter.use(authMiddleware);

// Vendor/Admin create, update, delete jobs
jobsRouter.post("/", requireRole(["vendor", "admin"]), validateJson(jobSchema), (c) => controller.create(c));
jobsRouter.put("/:id", requireRole(["vendor", "admin"]), validateParamId, validateJson(jobSchema.partial()), (c) => controller.update(c));
jobsRouter.delete("/:id", requireRole(["vendor", "admin"]), validateParamId, (c) => controller.delete(c));

// Members apply for a job
jobsRouter.post("/:id/apply", validateParamId, (c) => controller.apply(c));

// Vendors manage applications for their job postings
jobsRouter.get("/:id/applications", requireRole(["vendor", "admin"]), validateParamId, (c) => controller.getApplicationsForJob(c));
jobsRouter.put("/applications/:applicationId", requireRole(["vendor", "admin"]), validateApplicationId, validateJson(applicationStatusUpdateSchema), (c) => controller.updateApplicationStatus(c));
