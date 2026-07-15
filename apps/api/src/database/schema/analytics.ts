import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { businesses } from "./business";

export const businessAnalytics = pgTable("business_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).unique().notNull(),
  profileViews: integer("profile_views").default(0).notNull(),
  phoneClicks: integer("phone_clicks").default(0).notNull(),
  whatsappClicks: integer("whatsapp_clicks").default(0).notNull(),
  mapClicks: integer("map_clicks").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
