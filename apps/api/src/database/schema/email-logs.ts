import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";

export const emailLogs = pgTable("email_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateKey: text("template_key").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  recipientProfileId: uuid("recipient_profile_id").references(() => profiles.id, { onDelete: "set null" }),
  status: text("status", { enum: ["pending", "sent", "failed", "skipped"] }).default("pending").notNull(),
  providerMessageId: text("provider_message_id"),
  errorMessage: text("error_message"),
  // Metadata for context — no secrets, no tokens, no passwords
  metadata: jsonb("metadata").$type<Record<string, string>>(),
  // Idempotency key to prevent duplicate sends
  idempotencyKey: text("idempotency_key").unique(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailLogsTemplateKeyIdx: index("email_logs_template_key_idx").on(table.templateKey),
  emailLogsStatusIdx: index("email_logs_status_idx").on(table.status),
  emailLogsProfileIdIdx: index("email_logs_profile_id_idx").on(table.recipientProfileId),
  emailLogsCreatedAtIdx: index("email_logs_created_at_idx").on(table.createdAt),
}));
