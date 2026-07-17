import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { serviceProviders } from "./service-provider.js";

export const providerInteractionLogs = pgTable("provider_interaction_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerId: uuid("provider_id").references(() => serviceProviders.id, { onDelete: "cascade" }).notNull(),
  action: text("action", { enum: ["profile_view", "phone_click", "whatsapp_click", "map_click", "website_click", "share_click"] }).notNull(),
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  providerInteractionLogsProviderIdx: index("provider_interaction_logs_provider_idx").on(table.providerId),
  providerInteractionLogsCreatedAtIdx: index("provider_interaction_logs_created_at_idx").on(table.createdAt),
}));
