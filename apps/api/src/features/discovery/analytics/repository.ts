import { db } from "../../../config/database.js";
import {
  interactionLogs,
  providerInteractionLogs,
  businessAnalytics,
  providerAnalytics,
} from "../../../database/schema.js";
import { eq, sql } from "drizzle-orm";

export class DiscoveryAnalyticsRepository {
  async trackBusinessClick(businessId: string, action: string, ip?: string, device?: string) {
    return await db.transaction(async (tx) => {
      // 1. Insert interaction log
      await tx.insert(interactionLogs).values({
        businessId,
        action: action as any,
        ip,
        device,
      });

      // 2. Increment aggregate counters if applicable
      const field = 
        action === "profile_view" ? "profileViews" :
        action === "phone_click" ? "phoneClicks" :
        action === "whatsapp_click" ? "whatsappClicks" :
        action === "map_click" ? "mapClicks" :
        null;

      if (field) {
        const [existing] = await tx
          .select()
          .from(businessAnalytics)
          .where(eq(businessAnalytics.businessId, businessId));

        if (!existing) {
          const values: any = { businessId };
          values[field] = 1;
          await tx.insert(businessAnalytics).values(values);
        } else {
          const updateObj: any = { updatedAt: new Date() };
          const columnRef =
            action === "profile_view" ? businessAnalytics.profileViews :
            action === "phone_click" ? businessAnalytics.phoneClicks :
            action === "whatsapp_click" ? businessAnalytics.whatsappClicks :
            businessAnalytics.mapClicks;

          updateObj[field] = sql`${columnRef} + 1`;
          await tx
            .update(businessAnalytics)
            .set(updateObj)
            .where(eq(businessAnalytics.businessId, businessId));
        }
      }
    });
  }

  async trackProviderClick(providerId: string, action: string, ip?: string) {
    return await db.transaction(async (tx) => {
      // 1. Insert interaction log
      await tx.insert(providerInteractionLogs).values({
        providerId,
        action: action as any,
        ip,
      });

      // 2. Increment aggregate counters if applicable
      const field = 
        action === "profile_view" ? "profileViews" :
        action === "phone_click" ? "phoneClicks" :
        action === "whatsapp_click" ? "whatsappClicks" :
        action === "map_click" ? "mapClicks" :
        null;

      if (field) {
        const clickColumn =
          action === "profile_view" ? providerAnalytics.profileViews :
          action === "phone_click" ? providerAnalytics.phoneClicks :
          action === "whatsapp_click" ? providerAnalytics.whatsappClicks :
          providerAnalytics.mapClicks;

        await tx
          .insert(providerAnalytics)
          .values({
            providerId,
            profileViews: action === "profile_view" ? 1 : 0,
            phoneClicks: action === "phone_click" ? 1 : 0,
            whatsappClicks: action === "whatsapp_click" ? 1 : 0,
            mapClicks: action === "map_click" ? 1 : 0,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: providerAnalytics.providerId,
            set: {
              [field]: sql`${clickColumn} + 1`,
              updatedAt: new Date(),
            },
          });
      }
    });
  }
}
