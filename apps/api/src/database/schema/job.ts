import { pgTable, uuid, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";
import { businesses } from "./business.js";

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id").references(() => businesses.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  employmentType: text("employment_type", { enum: ["full_time", "part_time", "internship", "contract", "freelance"] }).notNull(),
  salaryFrom: integer("salary_from"),
  salaryTo: integer("salary_to"),
  experience: integer("experience"), // years
  qualification: text("qualification"),
  location: text("location"),
  skills: jsonb("skills").$type<string[]>(),
  vacancies: integer("vacancies").default(1).notNull(),
  closingDate: timestamp("closing_date", { withTimezone: true }),
  status: text("status", { enum: ["active", "inactive", "closed"] }).default("active").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => profiles.id),
  updatedBy: uuid("updated_by").references(() => profiles.id),
  version: integer("version").default(1).notNull(),
});
