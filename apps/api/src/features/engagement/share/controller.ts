import { Context } from "hono";
import { ShareLinksService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { createShareLinkSchema, tokenParamSchema } from "./validation.js";
import { z } from "zod";

const service = new ShareLinksService();

export class ShareLinksController {
  async create(c: Context) {
    try {
      const profile = c.get("profile");
      const body = await c.req.json();
      const parsed = createShareLinkSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }

      const expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined;
      const result = await service.createShareLink(
        profile.id,
        parsed.data.resourceType,
        parsed.data.resourceId,
        expiresAt
      );

      return successResponse(
        c,
        "Share link created successfully",
        {
          id: result.id,
          token: result.token,
          resourceType: result.resourceType,
          resourceId: result.resourceId,
          clickCount: result.clickCount,
          expiresAt: result.expiresAt,
          createdAt: result.createdAt,
        },
        {},
        201
      );
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to create share link", [], err.status || 400);
    }
  }

  async resolve(c: Context) {
    try {
      const token = c.req.param("token") || "";
      const parsedToken = tokenParamSchema.safeParse(token);
      if (!parsedToken.success) {
        return errorResponse(c, "Invalid token format", parsedToken.error.issues, 400);
      }

      const result = await service.resolveToken(parsedToken.data);
      return successResponse(c, "Share link resolved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to resolve share link", [], err.status || 400);
    }
  }

  async click(c: Context) {
    try {
      const token = c.req.param("token") || "";
      const parsedToken = tokenParamSchema.safeParse(token);
      if (!parsedToken.success) {
        return errorResponse(c, "Invalid token format", parsedToken.error.issues, 400);
      }

      const result = await service.recordClick(parsedToken.data);
      return successResponse(c, "Click recorded successfully", {
        id: result.id,
        clickCount: result.clickCount,
      });
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to record click", [], err.status || 400);
    }
  }

  async softDelete(c: Context) {
    try {
      const profile = c.get("profile");
      const role = c.get("role");
      const id = c.req.param("id") || "";
      const parsedId = z.string().uuid("Invalid ID format").safeParse(id);
      if (!parsedId.success) {
        return errorResponse(c, "Invalid ID format", parsedId.error.issues, 400);
      }

      const result = await service.softDeleteLink(parsedId.data, profile.id, role);
      return successResponse(c, "Share link deleted successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete share link", [], err.status || 400);
    }
  }
}
