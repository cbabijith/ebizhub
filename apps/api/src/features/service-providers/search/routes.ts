import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { SearchController } from "./controller.js";
import { errorResponse } from "../../../shared/responses/response.js";
import { searchQuerySchema } from "./validation.js";

export const searchProvidersRouter = new Hono();
const controller = new SearchController();

const validateQuery = (schema: any) =>
  zValidator("query", schema, (result, c) => {
    if (!result.success) {
      const messages = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`);
      return errorResponse(c, "Query validation failed", messages, 400);
    }
  });

searchProvidersRouter.get("/", validateQuery(searchQuerySchema), (c) => controller.search(c));
