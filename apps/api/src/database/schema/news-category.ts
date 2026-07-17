import { pgTable, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";

export const newsCategories = pgTable("news_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  icon: text("icon"),
  image: text("image"),
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => profiles.id),
  updatedBy: uuid("updated_by").references(() => profiles.id),
  version: integer("version").default(1).notNull(),
});
