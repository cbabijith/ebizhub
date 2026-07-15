import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { districts } from "./district.js";

export const branches = pgTable("branches", {
  id: uuid("id").defaultRandom().primaryKey(),
  branchName: text("branch_name").notNull(),
  branchNumber: text("branch_number").unique().notNull(),
  districtId: integer("district_id").references(() => districts.id),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
