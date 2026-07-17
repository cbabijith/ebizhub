import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";
import { sql } from "drizzle-orm";

export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  resourceType: text("resource_type", { enum: ["news", "event", "job", "offer"] }).notNull(),
  resourceId: uuid("resource_id").notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  bookmarksUserResourceIdx: uniqueIndex("bookmarks_user_resource_idx")
    .on(table.profileId, table.resourceType, table.resourceId)
    .where(sql`deleted_at IS NULL`),
}));
