import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { PublicController } from "./controller.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { listProvidersQuerySchema } from "./validation.js";
import { z } from "zod";

export const publicProvidersRouter = new Hono();
const controller = new PublicController();

const validateQuery = (schema: any) =>
  zValidator("query", schema, (result, c) => {
    if (!result.success) {
      const messages = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`);
      return errorResponse(c, "Query validation failed", messages, 400);
    }
  });

const validateParamId = zValidator("param", z.object({
  id: z.string().uuid("Invalid UUID format"),
}), (result, c) => {
  if (!result.success) {
    return errorResponse(c, "Invalid UUID format", ["id: Invalid UUID format"], 400);
  }
});

publicProvidersRouter.get("/", validateQuery(listProvidersQuerySchema), (c) => controller.list(c));
publicProvidersRouter.get("/:id", validateParamId, (c) => controller.getProfile(c));
