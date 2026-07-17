import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { members } from "./member.js";

export const communityInteractionLogs = pgTable("community_interaction_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  entityType: text("entity_type", {
    enum: [
      "news_view",
      "news_share",
      "event_registration",
      "offer_click",
      "offer_view",
      "job_view",
      "job_application",
      "notice_view",
      "banner_click"
    ]
  }).notNull(),
  entityId: uuid("entity_id").notNull(),
  memberId: uuid("member_id").references(() => members.id),
  ip: text("ip"),
  device: text("device"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
