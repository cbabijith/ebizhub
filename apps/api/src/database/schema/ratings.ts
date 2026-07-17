import { pgTable, uuid, text, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";
import { sql } from "drizzle-orm";

export const ratings = pgTable("ratings", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  resourceType: text("resource_type", { enum: ["business", "provider"] }).notNull(),
  resourceId: uuid("resource_id").notNull(),
  rating: integer("rating").notNull(), // 1 to 5
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  ratingsUserResourceIdx: uniqueIndex("ratings_user_resource_idx")
    .on(table.profileId, table.resourceType, table.resourceId)
    .where(sql`deleted_at IS NULL`),
}));
