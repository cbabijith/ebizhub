import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { serviceProviders } from "./service-provider.js";

export const providerAnalytics = pgTable("provider_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerId: uuid("provider_id").references(() => serviceProviders.id, { onDelete: "cascade" }).unique().notNull(),
  profileViews: integer("profile_views").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
