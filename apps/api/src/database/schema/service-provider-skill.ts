import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { serviceProviders } from "./service-provider.js";

export const serviceProviderSkills = pgTable("service_provider_skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerId: uuid("provider_id").references(() => serviceProviders.id, { onDelete: "cascade" }).notNull(),
  skillName: text("skill_name").notNull(),
  experienceYears: integer("experience_years"),
  proficiencyLevel: text("proficiency_level"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
