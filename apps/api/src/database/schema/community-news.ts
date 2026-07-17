import { pgTable, uuid, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";
import { newsCategories } from "./news-category.js";

export const communityNews = pgTable("community_news", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  summary: text("summary"),
  content: text("content"),
  featuredImage: text("featured_image"),
  gallery: jsonb("gallery").$type<string[]>(),
  categoryId: uuid("category_id").references(() => newsCategories.id),
  tags: jsonb("tags").$type<string[]>(),
  authorId: uuid("author_id").references(() => profiles.id),
  status: text("status", { enum: ["draft", "review", "published", "archived"] }).default("draft").notNull(),
  draft: boolean("draft").default(true).notNull(),
  published: boolean("published").default(false).notNull(),
  archived: boolean("archived").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  viewCount: integer("view_count").default(0).notNull(),
  shareCount: integer("share_count").default(0).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => profiles.id),
  updatedBy: uuid("updated_by").references(() => profiles.id),
  version: integer("version").default(1).notNull(),
});
