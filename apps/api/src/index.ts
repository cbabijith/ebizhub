import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { db } from "./db/index.js";
import { users } from "./db/schema.js";

const app = new Hono();

// Middlewares
app.use("*", cors());

// Routes
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "EzhavaClub API is running",
    timestamp: new Date().toISOString(),
  });
});

// Example route to fetch users from database
app.get("/users", async (c) => {
  try {
    const allUsers = await db.select().from(users);
    return c.json({ success: true, data: allUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ success: false, error: "Database error" }, 500);
  }
});

// Server configuration
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
