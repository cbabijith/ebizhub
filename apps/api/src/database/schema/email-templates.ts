import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";

export const emailTemplates = pgTable("email_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateKey: text("template_key").notNull(),
  subject: text("subject").notNull(),
  htmlBody: text("html_body").notNull(),
  textBody: text("text_body"),
  variables: text("variables").array(), // list of expected variable names e.g. ["name", "email"]
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (table) => ({
  emailTemplatesKeyIdx: index("email_templates_key_idx").on(table.templateKey),
  emailTemplatesDeletedAtIdx: index("email_templates_deleted_at_idx").on(table.deletedAt),
}));
