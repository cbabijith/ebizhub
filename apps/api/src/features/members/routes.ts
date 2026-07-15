import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { MemberController } from "./controller.js";
import { authMiddleware } from "../../shared/middleware/auth.js";
import { errorResponse } from "../../shared/responses/response.js";
import { updateProfileSchema } from "./validation.js";

export const memberRouter = new Hono();
const controller = new MemberController();

// Reusable validator wrapper
const validateJson = (schema: any) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      const messages = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`);
      return errorResponse(c, "Validation failed", messages, 400);
    }
  });

// All endpoints in this router require standard JWT authentication
memberRouter.use(authMiddleware);

memberRouter.get("/me", (c) => controller.getMe(c));
memberRouter.put("/me", validateJson(updateProfileSchema), (c) => controller.updateMe(c));
memberRouter.get("/:id", (c) => controller.getMemberById(c));
