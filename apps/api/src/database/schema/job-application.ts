import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";
import { jobs } from "./job.js";
import { members } from "./member.js";

export const jobApplications = pgTable("job_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: uuid("job_id").references(() => jobs.id).notNull(),
  memberId: uuid("member_id").references(() => members.id).notNull(),
  resume: text("resume"),
  coverLetter: text("cover_letter"),
  status: text("status", { enum: ["applied", "shortlisted", "rejected", "interview", "selected", "joined"] }).default("applied").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => profiles.id),
  updatedBy: uuid("updated_by").references(() => profiles.id),
  version: integer("version").default(1).notNull(),
});
