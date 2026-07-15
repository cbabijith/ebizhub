import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { serviceProviders } from "./service-provider.js";
import { profiles } from "./profile.js";

export const providerVerificationRequests = pgTable("provider_verification_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerId: uuid("provider_id").references(() => serviceProviders.id, { onDelete: "cascade" }).notNull(),
  submittedBy: uuid("submitted_by").references(() => profiles.id).notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  reviewedBy: uuid("reviewed_by").references(() => profiles.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
