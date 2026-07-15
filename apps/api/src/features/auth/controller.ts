import { Context } from "hono";
import { AuthService } from "./service.js";
import { successResponse, errorResponse } from "../../shared/responses/response.js";

const authService = new AuthService();

export class AuthController {
  async register(c: Context) {
    try {
      const body = await c.req.json();
      const result = await authService.register(body);
      return successResponse(c, "User account registered successfully", result, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Registration failed", [err.message], 400);
    }
  }

  async login(c: Context) {
    try {
      const body = await c.req.json();
      const result = await authService.login(body);
      return successResponse(c, "Login successful", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Login failed", [err.message], 401);
    }
  }

  async logout(c: Context) {
    try {
      const authHeader = c.req.header("Authorization");
      if (!authHeader) {
        return errorResponse(c, "Authorization header missing", [], 400);
      }
      const token = authHeader.replace("Bearer ", "");
      await authService.logout(token);
      return successResponse(c, "Logged out successfully");
    } catch (err: any) {
      return errorResponse(c, err.message || "Logout failed", [err.message], 400);
    }
  }

  async refresh(c: Context) {
    try {
      const { refreshToken } = await c.req.json();
      if (!refreshToken) {
        return errorResponse(c, "Refresh token is required", [], 400);
      }
      const result = await authService.refreshSession(refreshToken);
      return successResponse(c, "Token refreshed successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Token refresh failed", [err.message], 400);
    }
  }

  async getMe(c: Context) {
    try {
      const profile = c.get("profile");
      const user = c.get("user");
      return successResponse(c, "Current user profile retrieved", { user, profile });
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve profile", [err.message], 400);
    }
  }

  async forgotPassword(c: Context) {
    try {
      const { email } = await c.req.json();
      await authService.forgotPassword(email);
      return successResponse(c, "Password reset email sent successfully");
    } catch (err: any) {
      return errorResponse(c, err.message || "Request failed", [err.message], 400);
    }
  }

  async resetPassword(c: Context) {
    try {
      const { password } = await c.req.json();
      await authService.resetPassword(password);
      return successResponse(c, "Password reset successfully");
    } catch (err: any) {
      return errorResponse(c, err.message || "Reset failed", [err.message], 400);
    }
  }

  async sendOtp(c: Context) {
    try {
      const { phone } = await c.req.json();
      await authService.sendOtp(phone);
      return successResponse(c, "OTP sent successfully to your device");
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to send OTP", [err.message], 400);
    }
  }

  async verifyOtp(c: Context) {
    try {
      const { phone, code } = await c.req.json();
      const result = await authService.verifyOtp(phone, code);
      return successResponse(c, "OTP verification successful", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "OTP verification failed", [err.message], 400);
    }
  }
}
