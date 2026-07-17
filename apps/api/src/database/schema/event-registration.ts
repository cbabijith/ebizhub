import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";
import { events } from "./event.js";
import { members } from "./member.js";

export const eventRegistrations = pgTable("event_registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").references(() => events.id).notNull(),
  memberId: uuid("member_id").references(() => members.id).notNull(),
  status: text("status", { enum: ["registered", "approved", "rejected", "attended", "cancelled"] }).default("registered").notNull(),
  paymentStatus: text("payment_status", { enum: ["pending", "paid", "free"] }).default("free").notNull(),
  remarks: text("remarks"),
  registeredAt: timestamp("registered_at", { withTimezone: true }).defaultNow().notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => profiles.id),
  updatedBy: uuid("updated_by").references(() => profiles.id),
  version: integer("version").default(1).notNull(),
});
