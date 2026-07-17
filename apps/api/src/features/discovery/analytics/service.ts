import { DiscoveryAnalyticsRepository } from "./repository.js";
import { db } from "../../../config/database.js";
import { businesses, serviceProviders } from "../../../database/schema.js";
import { eq, and, isNull } from "drizzle-orm";

const repo = new DiscoveryAnalyticsRepository();

export class DiscoveryAnalyticsService {
  async trackBusinessClick(businessId: string, action: string, ip?: string, device?: string) {
    const [business] = await db
      .select()
      .from(businesses)
      .where(and(eq(businesses.id, businessId), isNull(businesses.deletedAt)));

    if (!business) {
      throw new Error("Business not found");
    }

    const validActions = ["profile_view", "phone_click", "whatsapp_click", "map_click", "website_click", "share_click"];
    if (!validActions.includes(action)) {
      throw new Error("Invalid action click track");
    }

    await repo.trackBusinessClick(businessId, action, ip, device);
  }

  async trackProviderClick(providerId: string, action: string, ip?: string) {
    const [provider] = await db
      .select()
      .from(serviceProviders)
      .where(and(eq(serviceProviders.id, providerId), isNull(serviceProviders.deletedAt)));

    if (!provider) {
      throw new Error("Service provider not found");
    }

    const validActions = ["profile_view", "phone_click", "whatsapp_click", "map_click", "website_click", "share_click"];
    if (!validActions.includes(action)) {
      throw new Error("Invalid action click track");
    }

    await repo.trackProviderClick(providerId, action, ip);
  }
}
