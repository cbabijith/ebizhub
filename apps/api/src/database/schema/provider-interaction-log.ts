import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { serviceProviders } from "./service-provider.js";

export const providerInteractionLogs = pgTable("provider_interaction_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerId: uuid("provider_id").references(() => serviceProviders.id, { onDelete: "cascade" }).notNull(),
  action: text("action", { enum: ["profile_view"] }).notNull(),
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
