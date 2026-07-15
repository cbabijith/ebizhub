import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core";
import { businesses } from "./business";

export const businessProducts = pgTable("business_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image"),
  displayOrder: integer("display_order").default(0).notNull(),
  status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
});
