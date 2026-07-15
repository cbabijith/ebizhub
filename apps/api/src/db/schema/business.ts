import { pgTable, uuid, text, timestamp, integer, doublePrecision } from "drizzle-orm/pg-core";
import { profiles } from "./profile";
import { businessCategories } from "./business-category";
import { districts } from "./district";
import { panchayats } from "./panchayat";

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
  workingHours: text("working_hours"),
  gstNumber: text("gst_number"),
  establishedYear: integer("established_year"),
  verificationStatus: text("verification_status", { enum: ["pending", "verified", "rejected"] }).default("pending").notNull(),
  status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
