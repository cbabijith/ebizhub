import { db } from "../../../config/database.js";
import { providerAnalytics, providerInteractionLogs } from "../../../database/schema.js";
import { eq, sql } from "drizzle-orm";

export class AnalyticsRepository {
  async recordClickTransaction(providerId: string, action: "phone_click" | "whatsapp_click" | "map_click", ip: string | null) {
    return await db.transaction(async (tx) => {
      // 1. Insert into interaction logs
      await tx.insert(providerInteractionLogs).values({
        providerId,
        action,
        ip,
      });

      // 2. Increment counters in provider analytics
      const clickColumn =
        action === "phone_click"
          ? providerAnalytics.phoneClicks
          : action === "whatsapp_click"
          ? providerAnalytics.whatsappClicks
          : providerAnalytics.mapClicks;

      await tx
        .insert(providerAnalytics)
        .values({
          providerId,
          profileViews: 0,
          phoneClicks: action === "phone_click" ? 1 : 0,
          whatsappClicks: action === "whatsapp_click" ? 1 : 0,
          mapClicks: action === "map_click" ? 1 : 0,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: providerAnalytics.providerId,
          set: {
            [action === "phone_click" ? "phoneClicks" : action === "whatsapp_click" ? "whatsappClicks" : "mapClicks"]: sql`${clickColumn} + 1`,
            updatedAt: new Date(),
          },
        });
    });
  }

  async getSummary(providerId: string) {
    const [result] = await db
      .select()
      .from(providerAnalytics)
      .where(eq(providerAnalytics.providerId, providerId));
    return result || {
      providerId,
      profileViews: 0,
      phoneClicks: 0,
      whatsappClicks: 0,
      mapClicks: 0,
    };
  }
}
