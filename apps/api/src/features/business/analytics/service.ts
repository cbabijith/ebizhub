import { AnalyticsRepository } from "./repository.js";
import { BusinessRepository } from "../businesses/repository.js";

const analyticsRepo = new AnalyticsRepository();
const businessRepo = new BusinessRepository();

export class AnalyticsService {
  async trackClick(businessId: string, action: "profile_view" | "phone_click" | "whatsapp_click" | "map_click", ip?: string, device?: string) {
    const business = await businessRepo.findById(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    return await analyticsRepo.trackInteraction(businessId, action, ip, device);
  }

  async getAnalytics(businessId: string, ownerId: string) {
    const business = await businessRepo.findById(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    if (business.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    return await analyticsRepo.getSummary(businessId);
  }
}
