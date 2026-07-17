import { z } from "zod";

export const jobSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional().nullable(),
  employmentType: z.enum(["full_time", "part_time", "internship", "contract", "freelance"]),
  salaryFrom: z.number().int().nonnegative().optional().nullable(),
  salaryTo: z.number().int().nonnegative().optional().nullable(),
  experience: z.number().int().nonnegative().optional().nullable(),
  qualification: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  skills: z.array(z.string()).optional().default([]),
  vacancies: z.number().int().positive().optional().default(1),
  closingDate: z.string().datetime("Invalid closing date format").optional().nullable().transform(val => val ? new Date(val) : null),
  status: z.enum(["active", "inactive", "closed"]).optional().default("active"),
});

export const jobApplicationSchema = z.object({
  jobId: z.string().uuid("Invalid job ID"),
  resume: z.string().url("Invalid resume URL").optional().nullable(),
  coverLetter: z.string().optional().nullable(),
});
