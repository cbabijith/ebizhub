import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";

export const shareLinks = pgTable("share_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").unique().notNull(),
  resourceType: text("resource_type", {
    enum: ["business", "service-provider", "news", "event", "job", "offer"],
  }).notNull(),
  resourceId: uuid("resource_id").notNull(),
  createdBy: uuid("created_by").references(() => profiles.id, { onDelete: "set null" }),
  clickCount: integer("click_count").default(0).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  shareLinksTokenIdx: index("share_links_token_idx").on(table.token),
  shareLinksResourceIdx: index("share_links_resource_idx").on(table.resourceType, table.resourceId),
  shareLinksCreatedByIdx: index("share_links_created_by_idx").on(table.createdBy),
  shareLinksDeletedAtIdx: index("share_links_deleted_at_idx").on(table.deletedAt),
}));
