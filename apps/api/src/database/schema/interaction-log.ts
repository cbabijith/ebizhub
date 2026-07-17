import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { businesses } from "./business";

export const interactionLogs = pgTable("interaction_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  action: text("action", { enum: ["profile_view", "phone_click", "whatsapp_click", "map_click", "website_click", "share_click"] }).notNull(),
  ip: text("ip"),
  device: text("device"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  interactionLogsBusinessIdx: index("interaction_logs_business_idx").on(table.businessId),
  interactionLogsCreatedAtIdx: index("interaction_logs_created_at_idx").on(table.createdAt),
}));
