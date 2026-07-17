import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { CommunityNewsController } from "./controller.js";
import { authMiddleware, requireRole } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { communityNewsSchema } from "./validation.js";

export const communityNewsRouter = new Hono();
const controller = new CommunityNewsController();

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

// Public routes
communityNewsRouter.get("/", (c) => controller.getPublished(c));
communityNewsRouter.get("/:id", validateParamId, (c) => controller.getById(c));
communityNewsRouter.get("/slug/:slug", (c) => controller.getBySlug(c));
communityNewsRouter.post("/:id/share", validateParamId, (c) => controller.share(c));

// Protected Admin routes
communityNewsRouter.use(authMiddleware);
communityNewsRouter.use(requireRole(["admin"]));

communityNewsRouter.get("/admin/all", (c) => controller.getAllAdmin(c));
communityNewsRouter.post("/", validateJson(communityNewsSchema), (c) => controller.create(c));
communityNewsRouter.put("/:id", validateParamId, validateJson(communityNewsSchema.partial()), (c) => controller.update(c));
communityNewsRouter.delete("/:id", validateParamId, (c) => controller.delete(c));
