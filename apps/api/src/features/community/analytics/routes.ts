import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CommunityAnalyticsController } from "./controller.js";
import { optionalAuthMiddleware } from "../../../shared/middleware/auth.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { communityAnalyticsSchema } from "./validation.js";

export const communityAnalyticsRouter = new Hono();
const controller = new CommunityAnalyticsController();

const validateJson = (schema: any) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      const messages = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`);
      return errorResponse(c, "Validation failed", messages, 400);
    }
  });

// Support both logged in and guest tracking
communityAnalyticsRouter.post("/", optionalAuthMiddleware, validateJson(communityAnalyticsSchema), (c) => controller.track(c));
