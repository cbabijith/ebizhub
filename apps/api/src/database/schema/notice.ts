import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";
import { branches } from "./branch.js";

export const notices = pgTable("notices", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  noticeType: text("notice_type", { enum: ["lost_documents", "blood_needed", "emergency", "meeting_notice", "volunteer_request"] }).notNull(),
  priority: text("priority", { enum: ["normal", "high", "critical"] }).default("normal").notNull(),
  branchId: uuid("branch_id").references(() => branches.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  status: text("status", { enum: ["active", "archived"] }).default("active").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => profiles.id),
  updatedBy: uuid("updated_by").references(() => profiles.id),
  version: integer("version").default(1).notNull(),
});
