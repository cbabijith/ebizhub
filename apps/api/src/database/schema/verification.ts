import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { businesses } from "./business";
import { profiles } from "./profile";

export const verificationRequests = pgTable("verification_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  submittedBy: uuid("submitted_by").references(() => profiles.id).notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  reviewedBy: uuid("reviewed_by").references(() => profiles.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
