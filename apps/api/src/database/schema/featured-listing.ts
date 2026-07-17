import { pgTable, uuid, integer, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";

export const featuredListings = pgTable("featured_listings", {
  id: uuid("id").defaultRandom().primaryKey(),
  entityType: text("entity_type", { enum: ["business", "provider"] }).notNull(),
  entityId: uuid("entity_id").notNull(),
  priority: integer("priority").default(0).notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).defaultNow().notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: uuid("created_by").references(() => profiles.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  entityTypeIdx: index("featured_entity_type_idx").on(table.entityType),
  featuredListingsEntityIdx: index("featured_listings_entity_idx").on(table.entityType, table.entityId),
  featuredListingsActiveIdx: index("featured_listings_active_idx").on(table.isActive),
}));
