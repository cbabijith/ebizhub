import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { businesses } from "./business";

export const businessGallery = pgTable("business_gallery", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
