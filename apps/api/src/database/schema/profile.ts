import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { authUsers } from "./auth.js";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().references(() => authUsers.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  email: text("email").unique().notNull(),
  avatar: text("avatar"),
  role: text("role", { enum: ["admin", "vendor", "customer"] }).default("customer").notNull(),
  status: text("status", { enum: ["active", "inactive", "suspended"] }).default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
