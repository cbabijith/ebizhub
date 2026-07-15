import { AnalyticsRepository } from "./repository.js";
import { ProviderRepository } from "../providers/repository.js";

const analyticsRepo = new AnalyticsRepository();
const providerRepo = new ProviderRepository();

export class AnalyticsService {
  async trackClick(providerId: string, action: "phone_click" | "whatsapp_click" | "map_click", ip: string | null) {
    const provider = await providerRepo.findById(providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }
    return await analyticsRepo.recordClickTransaction(providerId, action, ip);
  }

  async getSummary(profileId: string, userRole: string, providerId: string) {
    const provider = await providerRepo.findById(providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }

    // Ownership or admin check to view dashboard metrics
    if (userRole !== "admin" && provider.profileId !== profileId) {
      const err = new Error("Forbidden: You do not own this service provider profile");
      (err as any).statusCode = 403;
      throw err;
    }

    return await analyticsRepo.getSummary(providerId);
  }
}
