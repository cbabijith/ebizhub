import { z } from "zod";

export const bookmarkResourceType = z.enum(["news", "event", "job", "offer"]);

export const createBookmarkSchema = z.object({
  resourceType: bookmarkResourceType,
  resourceId: z.string().uuid("Invalid resource ID format"),
});
