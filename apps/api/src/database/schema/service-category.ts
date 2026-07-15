import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  image: text("image"),
  sortOrder: integer("sort_order").default(0).notNull(),
  status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
