import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { businesses } from "./business.js";

export const businessGallery = pgTable("business_gallery", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  imageUrl: text("image_url").notNull(),
  isCover: boolean("is_cover").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
