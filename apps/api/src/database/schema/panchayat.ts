import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { districts } from "./district.js";

export const panchayats = pgTable("panchayats", {
  id: serial("id").primaryKey(),
  districtId: integer("district_id").references(() => districts.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
});
