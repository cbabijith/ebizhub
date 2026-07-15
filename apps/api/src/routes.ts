import { Hono } from "hono";

export const apiRouter = new Hono();

// Version 1 Base Endpoint
apiRouter.get("/v1", (c) => {
  return c.json({
    message: "Welcome to EzhavaClub API v1",
    timestamp: new Date().toISOString(),
  });
});

// Future modules will register here:
// apiRouter.route("/v1/auth", authRouter);
// apiRouter.route("/v1/businesses", businessRouter);
