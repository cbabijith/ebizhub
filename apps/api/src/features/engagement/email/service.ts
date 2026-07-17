import { EmailTemplatesRepository, EmailLogsRepository } from "./repository.js";
import { getEmailProvider, type EmailProvider } from "./provider.js";
import { interpolate, EMAIL_TYPES, type EmailType } from "./templates.js";

const templatesRepo = new EmailTemplatesRepository();
const logsRepo = new EmailLogsRepository();

export interface SendEmailOptions {
  templateKey: EmailType;
  recipientEmail: string;
  recipientProfileId?: string;
  variables?: Record<string, string>;
  /** Idempotency key — if provided, duplicate sends with the same key are skipped */
  idempotencyKey?: string;
  metadata?: Record<string, string>;
  /** Override the default provider (used in tests) */
  providerOverride?: EmailProvider;
}

export class EmailService {
  // ── Send an email through template + provider ──────────────────────────────
  async sendEmail(opts: SendEmailOptions): Promise<{ logId: string; status: string }> {
    const {
      templateKey,
      recipientEmail,
      recipientProfileId,
      variables = {},
      idempotencyKey,
      metadata = {},
      providerOverride,
    } = opts;

    // 1. Idempotency check — return early if already processed
    if (idempotencyKey) {
      const existing = await logsRepo.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        return { logId: existing.id, status: existing.status };
      }
    }

    // 2. Load active template from DB (falls back to skipped if not found)
    const template = await templatesRepo.findActiveByKey(templateKey);
    if (!template) {
      // Log as skipped — do not crash the calling operation
      const log = await logsRepo.create({
        templateKey,
        recipientEmail,
        recipientProfileId,
        idempotencyKey,
        metadata,
      });
      await logsRepo.markSkipped(log.id);
      return { logId: log.id, status: "skipped" };
    }

    // 3. Interpolate template variables safely
    const subject = interpolate(template.subject, variables);
    const htmlBody = interpolate(template.htmlBody, variables);
    const textBody = template.textBody ? interpolate(template.textBody, variables) : undefined;

    // 4. Create log entry with status = pending
    const log = await logsRepo.create({
      templateKey,
      recipientEmail,
      recipientProfileId,
      idempotencyKey,
      metadata,
    });

    // 5. Send via provider
    const provider = providerOverride ?? getEmailProvider();
    try {
      const result = await provider.sendEmail({
        to: recipientEmail,
        subject,
        html: htmlBody,
        text: textBody,
      });

      if (result.skipped) {
        await logsRepo.markSkipped(log.id);
        return { logId: log.id, status: "skipped" };
      }

      await logsRepo.markSent(log.id, result.providerMessageId);
      return { logId: log.id, status: "sent" };
    } catch (err: any) {
      // Sanitized error — never expose credentials
      const safeMsg = (err?.message || "Unknown delivery error").slice(0, 300);
      await logsRepo.markFailed(log.id, safeMsg);
      return { logId: log.id, status: "failed" };
    }
  }

  // ── Template management ────────────────────────────────────────────────────
  async createTemplate(data: {
    templateKey: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    variables?: string[];
  }) {
    // Enforce that key is a valid email type
    if (!EMAIL_TYPES.includes(data.templateKey as EmailType)) {
      const err = new Error(`Unsupported template key: ${data.templateKey}`);
      (err as any).status = 400;
      throw err;
    }
    // Prevent duplicate active templates for the same key
    const existing = await templatesRepo.findActiveByKey(data.templateKey);
    if (existing) {
      const err = new Error(`An active template for key "${data.templateKey}" already exists. Update or delete it first.`);
      (err as any).status = 409;
      throw err;
    }
    return await templatesRepo.create(data);
  }

  async getTemplate(id: string) {
    const t = await templatesRepo.findById(id);
    if (!t) {
      const err = new Error("Template not found");
      (err as any).status = 404;
      throw err;
    }
    return t;
  }

  async listTemplates(limit: number, offset: number) {
    return await templatesRepo.listAll(limit, offset);
  }

  async updateTemplate(id: string, data: Partial<{
    subject: string;
    htmlBody: string;
    textBody: string;
    variables: string[];
    isActive: boolean;
  }>) {
    const t = await templatesRepo.findById(id);
    if (!t) {
      const err = new Error("Template not found");
      (err as any).status = 404;
      throw err;
    }
    return await templatesRepo.update(id, data);
  }

  async softDeleteTemplate(id: string) {
    const t = await templatesRepo.findById(id);
    if (!t) {
      const err = new Error("Template not found");
      (err as any).status = 404;
      throw err;
    }
    return await templatesRepo.softDelete(id);
  }

  // ── Log queries ────────────────────────────────────────────────────────────
  async listLogs(limit: number, offset: number, status?: string) {
    return await logsRepo.listAll(limit, offset, status);
  }

  async getLog(id: string) {
    const log = await logsRepo.findById(id);
    if (!log) {
      const err = new Error("Log not found");
      (err as any).status = 404;
      throw err;
    }
    return log;
  }
}
