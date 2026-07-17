import { pgTable, uuid, text, integer, timestamp, boolean, index } from "drizzle-orm/pg-core";
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
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (table) => ({
  serviceProvidersCategoryIdx: index("service_providers_category_idx").on(table.serviceCategoryId),
  serviceProvidersStatusVerifiedIdx: index("service_providers_status_verified_idx").on(table.status, table.verificationStatus),
  serviceProvidersCreatedAtIdx: index("service_providers_created_at_idx").on(table.createdAt),
  serviceProvidersProfessionIdx: index("service_providers_profession_idx").on(table.profession),
}));
