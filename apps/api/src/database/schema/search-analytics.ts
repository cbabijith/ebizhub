import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";

export const searchAnalytics = pgTable("search_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  keyword: text("keyword").notNull(),
  resultCount: integer("result_count").default(0).notNull(),
  businessCount: integer("business_count").default(0).notNull(),
  providerCount: integer("provider_count").default(0).notNull(),
  categoryCount: integer("category_count").default(0).notNull(),
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  searchAnalyticsKeywordIdx: index("search_analytics_keyword_idx").on(table.keyword),
  searchAnalyticsCreatedAtIdx: index("search_analytics_created_at_idx").on(table.createdAt),
}));
