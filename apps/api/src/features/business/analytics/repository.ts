import { db } from "../../../config/database.js";
import { businessAnalytics, interactionLogs } from "../../../database/schema.js";
import { eq, sql } from "drizzle-orm";

export class AnalyticsRepository {
  async trackInteraction(businessId: string, action: "profile_view" | "phone_click" | "whatsapp_click" | "map_click", ip?: string, device?: string) {
    return await db.transaction(async (tx) => {
      // 1. Insert detailed log
      await tx.insert(interactionLogs).values({
        businessId,
        action,
        ip,
        device,
      });

      // 2. Increment aggregates (upsert)
      const field = 
        action === "profile_view" ? businessAnalytics.profileViews :
        action === "phone_click" ? businessAnalytics.phoneClicks :
        action === "whatsapp_click" ? businessAnalytics.whatsappClicks :
        businessAnalytics.mapClicks;

      const [existing] = await tx.select().from(businessAnalytics).where(eq(businessAnalytics.businessId, businessId));
      if (!existing) {
        const initialObj: any = { businessId };
        initialObj[action === "profile_view" ? "profileViews" : action === "phone_click" ? "phoneClicks" : action === "whatsapp_click" ? "whatsappClicks" : "mapClicks"] = 1;
        await tx.insert(businessAnalytics).values(initialObj);
      } else {
        const updateObj: any = { updatedAt: new Date() };
        if (action === "profile_view") {
          updateObj.profileViews = sql`${businessAnalytics.profileViews} + 1`;
        } else if (action === "phone_click") {
          updateObj.phoneClicks = sql`${businessAnalytics.phoneClicks} + 1`;
        } else if (action === "whatsapp_click") {
          updateObj.whatsappClicks = sql`${businessAnalytics.whatsappClicks} + 1`;
        } else if (action === "map_click") {
          updateObj.mapClicks = sql`${businessAnalytics.mapClicks} + 1`;
        }

        await tx
          .update(businessAnalytics)
          .set(updateObj)
          .where(eq(businessAnalytics.businessId, businessId));
      }
    });
  }

  async getSummary(businessId: string) {
    const [result] = await db
      .select()
      .from(businessAnalytics)
      .where(eq(businessAnalytics.businessId, businessId));
    return result || {
      businessId,
      profileViews: 0,
      phoneClicks: 0,
      whatsappClicks: 0,
      mapClicks: 0,
    };
  }
}
