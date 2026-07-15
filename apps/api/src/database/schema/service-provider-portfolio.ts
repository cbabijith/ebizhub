import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { serviceProviders } from "./service-provider.js";

export const serviceProviderPortfolios = pgTable("service_provider_portfolio", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerId: uuid("provider_id").references(() => serviceProviders.id, { onDelete: "cascade" }).notNull(),
  type: text("type", { enum: ["image", "certificate", "project", "award"] }).default("image").notNull(),
  title: text("title"),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
