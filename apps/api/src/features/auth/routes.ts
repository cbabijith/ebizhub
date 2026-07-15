import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { AuthController } from "./controller.js";
import { authMiddleware } from "../../shared/middleware/auth.js";
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

// Public Routes
authRouter.post("/register", zValidator("json", registerSchema), (c) => controller.register(c));
authRouter.post("/login", zValidator("json", loginSchema), (c) => controller.login(c));
authRouter.post("/refresh", (c) => controller.refresh(c));
authRouter.post("/forgot-password", zValidator("json", forgotPasswordSchema), (c) => controller.forgotPassword(c));
authRouter.post("/reset-password", zValidator("json", resetPasswordSchema), (c) => controller.resetPassword(c));

// OTP (Authentication / Verification)
authRouter.post("/send-otp", zValidator("json", sendOtpSchema), (c) => controller.sendOtp(c));
authRouter.post("/verify-otp", zValidator("json", verifyOtpSchema), (c) => controller.verifyOtp(c));

// Protected Routes (Required Auth JWT)
authRouter.post("/logout", authMiddleware, (c) => controller.logout(c));
authRouter.get("/me", authMiddleware, (c) => controller.getMe(c));
