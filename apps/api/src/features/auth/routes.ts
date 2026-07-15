import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { AuthController } from "./controller.js";
import { authMiddleware } from "../../shared/middleware/auth.js";
import { errorResponse } from "../../shared/responses/response.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from "./validation.js";

export const authRouter = new Hono();
const controller = new AuthController();

// Reusable validator wrapper to enforce standardized API response formats
const validateJson = (schema: any) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      const messages = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`);
      return errorResponse(c, "Validation failed", messages, 400);
    }
  });

// Public Routes
authRouter.post("/register", validateJson(registerSchema), (c) => controller.register(c));
authRouter.post("/login", validateJson(loginSchema), (c) => controller.login(c));
authRouter.post("/refresh", (c) => controller.refresh(c));
authRouter.post("/forgot-password", validateJson(forgotPasswordSchema), (c) => controller.forgotPassword(c));
authRouter.post("/reset-password", validateJson(resetPasswordSchema), (c) => controller.resetPassword(c));

// OTP (Authentication / Verification)
authRouter.post("/send-otp", validateJson(sendOtpSchema), (c) => controller.sendOtp(c));
authRouter.post("/verify-otp", validateJson(verifyOtpSchema), (c) => controller.verifyOtp(c));

// Protected Routes (Required Auth JWT)
authRouter.post("/logout", authMiddleware, (c) => controller.logout(c));
authRouter.get("/me", authMiddleware, (c) => controller.getMe(c));


