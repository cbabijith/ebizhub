import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";
import { serviceCategories } from "./service-category.js";
import { members } from "./member.js";

export const serviceProviders = pgTable("service_providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "cascade" }).notNull(),
  serviceCategoryId: integer("service_category_id").references(() => serviceCategories.id).notNull(),
  profession: text("profession").notNull(),
  experience: integer("experience").default(0).notNull(),
  bio: text("bio"),
  phone: text("phone").notNull(),
  qualification: text("qualification"),
  languages: text("languages"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  availability: text("availability"),
  serviceRadius: integer("service_radius").default(10).notNull(), // radius in km
  status: text("status", { enum: ["active", "inactive", "suspended"] }).default("active").notNull(),
  verificationStatus: text("verification_status", { enum: ["pending", "verified", "rejected"] }).default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
