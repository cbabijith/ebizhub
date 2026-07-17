import { Context } from "hono";
import { EmailService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { createTemplateSchema, updateTemplateSchema, sendEmailSchema, logQuerySchema } from "./validation.js";
import { getPaginationParams, formatPaginationMeta } from "../../../shared/pagination/pagination.js";
import { z } from "zod";

const emailService = new EmailService();

export class EmailController {
  // ── Templates ──────────────────────────────────────────────────────────────
  async createTemplate(c: Context) {
    try {
      const body = await c.req.json();
      const parsed = createTemplateSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      }
      const result = await emailService.createTemplate(parsed.data);
      return successResponse(c, "Template created", result, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to create template", [], err.status || 400);
    }
  }

  async listTemplates(c: Context) {
    try {
      const { page, limit, offset } = getPaginationParams(c);
      const { rows, total } = await emailService.listTemplates(limit, offset);
      return successResponse(c, "Templates retrieved", rows, formatPaginationMeta(page, limit, total));
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to list templates", [], err.status || 500);
    }
  }

  async getTemplate(c: Context) {
    try {
      const id = c.req.param("id");
      const parsedId = z.string().uuid().safeParse(id);
      if (!parsedId.success) return errorResponse(c, "Invalid ID", [], 400);
      const result = await emailService.getTemplate(parsedId.data);
      return successResponse(c, "Template retrieved", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Template not found", [], err.status || 404);
    }
  }

  async updateTemplate(c: Context) {
    try {
      const id = c.req.param("id");
      const parsedId = z.string().uuid().safeParse(id);
      if (!parsedId.success) return errorResponse(c, "Invalid ID", [], 400);
      const body = await c.req.json();
      const parsed = updateTemplateSchema.safeParse(body);
      if (!parsed.success) return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      const result = await emailService.updateTemplate(parsedId.data, parsed.data);
      return successResponse(c, "Template updated", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update template", [], err.status || 400);
    }
  }

  async deleteTemplate(c: Context) {
    try {
      const id = c.req.param("id");
      const parsedId = z.string().uuid().safeParse(id);
      if (!parsedId.success) return errorResponse(c, "Invalid ID", [], 400);
      const result = await emailService.softDeleteTemplate(parsedId.data);
      return successResponse(c, "Template deleted", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete template", [], err.status || 400);
    }
  }

  // ── Send (admin only) ──────────────────────────────────────────────────────
  async send(c: Context) {
    try {
      const body = await c.req.json();
      const parsed = sendEmailSchema.safeParse(body);
      if (!parsed.success) return errorResponse(c, "Validation failed", parsed.error.issues, 400);
      // Never trust client-provided sender; always use configured EMAIL_FROM
      const result = await emailService.sendEmail({
        templateKey: parsed.data.templateKey,
        recipientEmail: parsed.data.recipientEmail,
        recipientProfileId: parsed.data.recipientProfileId,
        variables: parsed.data.variables as Record<string, string> | undefined,
        idempotencyKey: parsed.data.idempotencyKey,
      });
      return successResponse(c, "Email queued", result, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to send email", [], err.status || 500);
    }
  }

  // ── Logs ───────────────────────────────────────────────────────────────────
  async listLogs(c: Context) {
    try {
      const { page, limit, offset } = getPaginationParams(c);
      const query = logQuerySchema.safeParse({
        status: c.req.query("status"),
        page,
        limit,
      });
      const status = query.success ? query.data.status : undefined;
      const { rows, total } = await emailService.listLogs(limit, offset, status);
      return successResponse(c, "Logs retrieved", rows, formatPaginationMeta(page, limit, total));
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to list logs", [], err.status || 500);
    }
  }

  async getLog(c: Context) {
    try {
      const id = c.req.param("id");
      const parsedId = z.string().uuid().safeParse(id);
      if (!parsedId.success) return errorResponse(c, "Invalid ID", [], 400);
      const result = await emailService.getLog(parsedId.data);
      return successResponse(c, "Log retrieved", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Log not found", [], err.status || 404);
    }
  }
}
