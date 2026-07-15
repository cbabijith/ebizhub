import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";

export const businessCategories = pgTable("business_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0).notNull(),
  status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
});
