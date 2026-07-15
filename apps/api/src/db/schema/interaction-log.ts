import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { businesses } from "./business.js";

export const interactionLogs = pgTable("interaction_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  action: text("action", { enum: ["profile_view", "phone_click", "whatsapp_click", "map_click"] }).notNull(),
  ip: text("ip"),
  device: text("device"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
