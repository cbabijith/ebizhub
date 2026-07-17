import { pgTable, uuid, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  resourceType: text("resource_type", { enum: ["business", "provider"] }).notNull(),
  resourceId: uuid("resource_id").notNull(),
  content: text("content").notNull(),
  isVerifiedMember: boolean("is_verified_member").default(false).notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("approved").notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  reviewsResourceIdx: index("reviews_resource_idx").on(table.resourceType, table.resourceId),
}));
