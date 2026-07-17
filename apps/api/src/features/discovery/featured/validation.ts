import { z } from "zod";

export const createFeaturedSchema = z.object({
  entityType: z.enum(["business", "provider"]),
  entityId: z.string().uuid("Invalid entity UUID"),
  priority: z.number().int().min(0).max(100).default(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateFeaturedSchema = z.object({
  priority: z.number().int().min(0).max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const featuredIdParamSchema = z.object({
  id: z.string().uuid("Invalid featured listing UUID"),
});
