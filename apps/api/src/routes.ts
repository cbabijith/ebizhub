import { Hono } from "hono";
import { authRouter } from "./features/auth/index.js";
import { memberRouter } from "./features/members/index.js";

export const apiRouter = new Hono();

// Version 1 Base Endpoint
apiRouter.get("/v1", (c) => {
  return c.json({
    message: "Welcome to EzhavaClub API v1",
    timestamp: new Date().toISOString(),
  });
});

// Register feature routers
apiRouter.route("/v1/auth", authRouter);
apiRouter.route("/v1/members", memberRouter);

// Future features will register here:
// apiRouter.route("/v1/businesses", businessRouter);
