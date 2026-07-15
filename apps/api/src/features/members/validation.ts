import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters long").optional(),
  phone: z.string().optional().nullable(),
  avatar: z.string().url("Avatar must be a valid URL").optional().nullable(),
  occupation: z.string().max(100, "Occupation must be under 100 characters").optional().nullable(),
  company: z.string().max(100, "Company must be under 100 characters").optional().nullable(),
  bio: z.string().max(1000, "Bio must be under 1000 characters").optional().nullable(),
  districtId: z.number().int().positive().optional().nullable(),
  panchayatId: z.number().int().positive().optional().nullable(),
  branchId: z.string().uuid("Invalid branch ID format").optional().nullable(),
  memberType: z.enum(["regular", "life", "associate"]).optional(),
});

export const addSkillSchema = z.object({
  skill: z.string().min(1, "Skill name is required").max(50, "Skill name must be under 50 characters"),
});
