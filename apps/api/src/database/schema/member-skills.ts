import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { members } from "./member.js";

export const memberSkills = pgTable("member_skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "cascade" }).notNull(),
  skill: text("skill").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
