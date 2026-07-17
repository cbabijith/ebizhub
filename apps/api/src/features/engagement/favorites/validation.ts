import { z } from "zod";

export const favoriteResourceType = z.enum(["business", "provider"]);

export const createFavoriteSchema = z.object({
  resourceType: favoriteResourceType,
  resourceId: z.string().uuid("Invalid resource ID format"),
});
