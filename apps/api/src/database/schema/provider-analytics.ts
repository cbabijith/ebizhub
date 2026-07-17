import { pgTable, uuid, integer, timestamp, index } from "drizzle-orm/pg-core";
import { serviceProviders } from "./service-provider.js";

export const providerAnalytics = pgTable("provider_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerId: uuid("provider_id").references(() => serviceProviders.id, { onDelete: "cascade" }).unique().notNull(),
  profileViews: integer("profile_views").default(0).notNull(),
  phoneClicks: integer("phone_clicks").default(0).notNull(),
  whatsappClicks: integer("whatsapp_clicks").default(0).notNull(),
  mapClicks: integer("map_clicks").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  providerAnalyticsProviderIdx: index("provider_analytics_provider_idx").on(table.providerId),
}));
