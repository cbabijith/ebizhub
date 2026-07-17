import { z } from "zod";

export const communityAnalyticsSchema = z.object({
  entityType: z.enum([
    "news_view",
    "news_share",
    "event_registration",
    "offer_click",
    "offer_view",
    "job_view",
    "job_application",
    "notice_view",
    "banner_click"
  ]),
  entityId: z.string().uuid("Invalid entity ID, must be a UUID"),
});
