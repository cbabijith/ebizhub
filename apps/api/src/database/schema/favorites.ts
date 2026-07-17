import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";

export const favorites = pgTable("favorites", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  resourceType: text("resource_type", { enum: ["business", "provider"] }).notNull(),
  resourceId: uuid("resource_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  favoritesUserResourceIdx: uniqueIndex("favorites_user_resource_idx").on(table.profileId, table.resourceType, table.resourceId),
}));
