import { pgTable, uuid, text, timestamp, integer, doublePrecision, boolean, index } from "drizzle-orm/pg-core";

import { profiles } from "./profile.js";
import { businessCategories } from "./business-category.js";
import { districts } from "./district.js";
import { panchayats } from "./panchayat.js";

export const businesses = pgTable("businesses", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  categoryId: integer("category_id").references(() => businessCategories.id).notNull(),
  businessName: text("business_name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  email: text("email"),
  website: text("website"),
  logo: text("logo"),
  coverImage: text("cover_image"),
  address: text("address").notNull(),
  districtId: integer("district_id").references(() => districts.id),
  panchayatId: integer("panchayat_id").references(() => panchayats.id),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  googleMapsUrl: text("google_maps_url"),
  workingHours: text("working_hours"),
  gstNumber: text("gst_number"),
  registrationNumber: text("registration_number"),
  establishedYear: integer("established_year"),
  verificationStatus: text("verification_status", { enum: ["pending", "verified", "rejected"] }).default("pending").notNull(),
  status: text("status", { enum: ["active", "inactive", "suspended"] }).default("active").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  businessesCategoryIdx: index("businesses_category_idx").on(table.categoryId),
  businessesStatusVerifiedIdx: index("businesses_status_verified_idx").on(table.status, table.verificationStatus),
  businessesCreatedAtIdx: index("businesses_created_at_idx").on(table.createdAt),
  businessesNameIdx: index("businesses_name_idx").on(table.businessName),
}));
