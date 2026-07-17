import { db } from "../../../config/database.js";
import { emailTemplates, emailLogs } from "../../../database/schema.js";
import { eq, and, isNull, desc, asc, sql } from "drizzle-orm";
import type { EmailType } from "./templates.js";

// ─── Templates repository ─────────────────────────────────────────────────────
export class EmailTemplatesRepository {
  async create(data: {
    templateKey: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    variables?: string[];
  }) {
    const [result] = await db.insert(emailTemplates).values(data).returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(emailTemplates)
      .where(and(eq(emailTemplates.id, id), isNull(emailTemplates.deletedAt)))
      .limit(1);
    return result;
  }

  async findActiveByKey(templateKey: string) {
    const [result] = await db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.templateKey, templateKey),
          eq(emailTemplates.isActive, true),
          isNull(emailTemplates.deletedAt)
        )
      )
      .limit(1);
    return result;
  }

  async listAll(limit: number, offset: number) {
    const rows = await db
      .select()
      .from(emailTemplates)
      .where(isNull(emailTemplates.deletedAt))
      .orderBy(desc(emailTemplates.createdAt))
      .limit(limit)
      .offset(offset);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(emailTemplates)
      .where(isNull(emailTemplates.deletedAt));
    return { rows, total: count };
  }

  async update(id: string, data: Partial<{
    subject: string;
    htmlBody: string;
    textBody: string;
    variables: string[];
    isActive: boolean;
  }>) {
    const [result] = await db
      .update(emailTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(emailTemplates.id, id), isNull(emailTemplates.deletedAt)))
      .returning();
    return result;
  }

  async softDelete(id: string) {
    const [result] = await db
      .update(emailTemplates)
      .set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() })
      .where(and(eq(emailTemplates.id, id), isNull(emailTemplates.deletedAt)))
      .returning();
    return result;
  }
}

// ─── Logs repository ──────────────────────────────────────────────────────────
export class EmailLogsRepository {
  async create(data: {
    templateKey: string;
    recipientEmail: string;
    recipientProfileId?: string;
    idempotencyKey?: string;
    metadata?: Record<string, string>;
  }) {
    const [result] = await db
      .insert(emailLogs)
      .values({ ...data, status: "pending" })
      .returning();
    return result;
  }

  async findByIdempotencyKey(key: string) {
    const [result] = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.idempotencyKey, key))
      .limit(1);
    return result;
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.id, id))
      .limit(1);
    return result;
  }

  async markSent(id: string, providerMessageId?: string) {
    const [result] = await db
      .update(emailLogs)
      .set({ status: "sent", providerMessageId, sentAt: new Date(), updatedAt: new Date() })
      .where(eq(emailLogs.id, id))
      .returning();
    return result;
  }

  async markFailed(id: string, errorMessage: string) {
    // Strip any token-like or credential-like content from error messages
    const safeMessage = errorMessage.replace(/Bearer\s+\S+/gi, "[redacted]").replace(/key[=:]\s*\S+/gi, "key=[redacted]").slice(0, 500);
    const [result] = await db
      .update(emailLogs)
      .set({ status: "failed", errorMessage: safeMessage, updatedAt: new Date() })
      .where(eq(emailLogs.id, id))
      .returning();
    return result;
  }

  async markSkipped(id: string) {
    const [result] = await db
      .update(emailLogs)
      .set({ status: "skipped", updatedAt: new Date() })
      .where(eq(emailLogs.id, id))
      .returning();
    return result;
  }

  async listAll(limit: number, offset: number, status?: string) {
    const where = status
      ? and(eq(emailLogs.status, status as any))
      : undefined;
    const rows = await db
      .select()
      .from(emailLogs)
      .where(where)
      .orderBy(desc(emailLogs.createdAt))
      .limit(limit)
      .offset(offset);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(emailLogs)
      .where(where);
    return { rows, total: count };
  }
}
