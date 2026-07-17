import { Context, Next } from "hono";
import { supabase } from "../../config/auth.js";
import { errorResponse } from "../responses/response.js";
import { AuthRepository } from "../../features/auth/repository.js";

const authRepo = new AuthRepository();

export interface AuthenticatedContext {
  user: any;
  profile: any;
  role: "admin" | "vendor" | "customer";
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(c, "Unauthorized: Missing or invalid token format", [], 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    // 1. Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return errorResponse(c, "Unauthorized: Token verification failed", [error?.message || "User not found"], 401);
    }

    // 2. Fetch profile from repository
    const profile = await authRepo.findProfileById(user.id);

    if (!profile) {
      return errorResponse(c, "Unauthorized: Profile record not found", [], 401);
    }

    if (profile.status !== "active") {
      return errorResponse(c, `Unauthorized: Account is ${profile.status}`, [], 403);
    }

    // 3. Set properties in context
    c.set("user", user);
    c.set("profile", profile);
    c.set("role", profile.role);

    await next();
  } catch (err: any) {
    console.error("Auth Middleware Error:", err);
    return errorResponse(c, "Internal Authentication Error", [err.message], 500);
  }
}

// Role-based authorization middleware factory
export function requireRole(allowedRoles: ("admin" | "vendor" | "customer")[]) {
  return async (c: Context, next: Next) => {
    const role = c.get("role") as "admin" | "vendor" | "customer";

    if (!role || !allowedRoles.includes(role)) {
      return errorResponse(c, "Forbidden: Insufficient permissions for this action", [], 403);
    }

    await next();
  };
}

export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    await next();
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) {
      const profile = await authRepo.findProfileById(user.id);
      if (profile && profile.status === "active") {
        c.set("user", user);
        c.set("profile", profile);
        c.set("role", profile.role);
      }
    }
  } catch (err) {
    // Ignore error, treat as guest
  }
  await next();
}

