import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";
import { districts } from "./district.js";
import { panchayats } from "./panchayat.js";
import { branches } from "./branch.js";

export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  membershipNumber: text("membership_number"),
  branchId: uuid("branch_id").references(() => branches.id),
  districtId: integer("district_id").references(() => districts.id),
  panchayatId: integer("panchayat_id").references(() => panchayats.id),
  occupation: text("occupation"),
  company: text("company"),
  bio: text("bio"),
  verificationStatus: text("verification_status", { enum: ["pending", "verified", "rejected"] }).default("pending").notNull(),
  communityStatus: text("community_status", { enum: ["active", "inactive", "suspended", "expired", "transferred"] }).default("active").notNull(),
  memberType: text("member_type", { enum: ["regular", "life", "associate"] }).default("regular").notNull(),
  joinedDate: timestamp("joined_date", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
