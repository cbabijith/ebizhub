import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  phone: z.string().optional(),
  role: z.enum(["admin", "vendor", "customer"]).default("customer"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password is too short"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
  token: z.string().min(1, "Reset token is required"),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters long"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const sendOtpSchema = z.object({
  phone: z.string().min(10, "Invalid phone number"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10, "Invalid phone number"),
  code: z.string().min(6, "Invalid OTP code length"),
});
