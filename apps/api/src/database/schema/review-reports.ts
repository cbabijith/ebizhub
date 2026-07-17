import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";
import { reviews } from "./reviews.js";

export const reviewReports = pgTable("review_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  reviewId: uuid("review_id").references(() => reviews.id, { onDelete: "cascade" }).notNull(),
  reason: text("reason").notNull(),
  status: text("status", { enum: ["pending", "resolved", "dismissed"] }).default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  reportsUserReviewIdx: uniqueIndex("reports_user_review_idx").on(table.profileId, table.reviewId),
}));
