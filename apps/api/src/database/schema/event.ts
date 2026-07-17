import { pgTable, uuid, text, timestamp, integer, doublePrecision, numeric } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";
import { newsCategories } from "./news-category.js";
import { branches } from "./branch.js";

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  banner: text("banner"),
  categoryId: uuid("category_id").references(() => newsCategories.id),
  organizerId: uuid("organizer_id").references(() => profiles.id),
  branchId: uuid("branch_id").references(() => branches.id),
  venue: text("venue").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  registrationStart: timestamp("registration_start", { withTimezone: true }),
  registrationEnd: timestamp("registration_end", { withTimezone: true }),
  maxParticipants: integer("max_participants"),
  entryFee: numeric("entry_fee").default("0").notNull(),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  status: text("status", { enum: ["upcoming", "ongoing", "completed", "cancelled"] }).default("upcoming").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => profiles.id),
  updatedBy: uuid("updated_by").references(() => profiles.id),
  version: integer("version").default(1).notNull(),
});
