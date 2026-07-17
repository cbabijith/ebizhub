import { pgTable, uuid, text, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";
import { businesses } from "./business.js";

export const offers = pgTable("offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id").references(() => businesses.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  banner: text("banner"),
  discountType: text("discount_type", { enum: ["percentage", "flat", "buy1get1", "coupon"] }).notNull(),
  discountValue: numeric("discount_value"),
  couponCode: text("coupon_code"),
  validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
  validTo: timestamp("valid_to", { withTimezone: true }).notNull(),
  terms: text("terms"),
  status: text("status", { enum: ["active", "inactive", "expired"] }).default("active").notNull(),
  featured: boolean("featured").default(false).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => profiles.id),
  updatedBy: uuid("updated_by").references(() => profiles.id),
  version: integer("version").default(1).notNull(),
});
