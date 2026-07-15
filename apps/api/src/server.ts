import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { env } from "./config/env.js";

console.log(`Server is booting in ${env.NODE_ENV} mode...`);
console.log(`Server listening on port ${env.PORT}`);

serve({
  fetch: app.fetch,
  port: env.PORT,
});
