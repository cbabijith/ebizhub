import { pgTable, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";

export const banners = pgTable("banners", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title"),
  image: text("image").notNull(),
  redirectType: text("redirect_type", { enum: ["business", "news", "offer", "event", "external"] }).notNull(),
  redirectId: text("redirect_id"),
  priority: integer("priority").default(0).notNull(),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => profiles.id),
  updatedBy: uuid("updated_by").references(() => profiles.id),
  version: integer("version").default(1).notNull(),
});
