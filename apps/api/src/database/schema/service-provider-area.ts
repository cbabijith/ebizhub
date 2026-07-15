import { pgTable, uuid, integer, serial, timestamp, index } from "drizzle-orm/pg-core";
import { serviceProviders } from "./service-provider.js";
import { districts } from "./district.js";
import { panchayats } from "./panchayat.js";

export const serviceProviderAreas = pgTable("service_provider_areas", {
  id: serial("id").primaryKey(),
  providerId: uuid("provider_id").references(() => serviceProviders.id, { onDelete: "cascade" }).notNull(),
  districtId: integer("district_id").references(() => districts.id).notNull(),
  panchayatId: integer("panchayat_id").references(() => panchayats.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (table) => {
  return {
    districtIdIdx: index("sp_areas_district_idx").on(table.districtId),
  };
});
