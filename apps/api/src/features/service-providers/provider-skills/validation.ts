import { z } from "zod";

export const addSkillSchema = z.object({
  providerId: z.string().uuid("Invalid provider ID format"),
  skillName: z.string().min(1, "Skill name is required").max(100),
  experienceYears: z.number().int().nonnegative().optional().nullable(),
  proficiencyLevel: z.string().max(50).optional().nullable(),
});

export const updateSkillSchema = addSkillSchema.partial();
