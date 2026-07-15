import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "./profile";
import { serviceCategories } from "./service-category";

export const serviceProviders = pgTable("service_providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  serviceCategoryId: integer("service_category_id").references(() => serviceCategories.id).notNull(),
  experience: integer("experience").default(0).notNull(),
  bio: text("bio"),
  phone: text("phone").notNull(),
  serviceRadius: integer("service_radius").default(10).notNull(), // radius in km
  status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
  verificationStatus: text("verification_status", { enum: ["pending", "verified", "rejected"] }).default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
