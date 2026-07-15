import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { businesses } from "./business";

export const businessServices = pgTable("business_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  displayOrder: integer("display_order").default(0).notNull(),
  status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
