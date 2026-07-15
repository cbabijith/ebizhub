import { Hono } from "hono";
import { cors } from "hono/cors";
import { apiRouter } from "./routes.js";
import { errorResponse } from "./common/responses/response.js";

export const app = new Hono();

// Global Middlewares
app.use("*", cors());

// Default Route
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "EzhavaClub API service is running",
    timestamp: new Date().toISOString(),
  });
});

// Register API Sub-Routes
app.route("/api", apiRouter);

// Global Error Handler
app.onError((err, c) => {
  console.error("Unhandle Exception:", err);
  return errorResponse(c, "Internal Server Error", [err.message], 500);
});

// Not Found Handler
app.notFound((c) => {
  return errorResponse(c, "Endpoint not found", [], 404);
});
