import { PortfolioRepository } from "./repository.js";
import { ProviderRepository } from "../providers/repository.js";
import { db } from "../../../config/database.js";
import { serviceProviderPortfolios } from "../../../database/schema.js";
import { eq } from "drizzle-orm";

const portfolioRepo = new PortfolioRepository();
const providerRepo = new ProviderRepository();

export class PortfolioService {
  async addPortfolioItem(profileId: string, userRole: string, data: any) {
    const provider = await providerRepo.findById(data.providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }

    // Ownership check
    if (userRole !== "admin" && provider.profileId !== profileId) {
      throw new Error("Forbidden: You do not own this service provider profile");
    }

    // Enforce 10 items limit
    const count = await portfolioRepo.countByProvider(data.providerId);
    if (count >= 10) {
      throw new Error("Maximum of 10 portfolio items allowed per provider");
    }

    return await portfolioRepo.create(data);
  }

  async updatePortfolioItem(id: string, profileId: string, userRole: string, data: any) {
    const item = await portfolioRepo.findById(id);
    if (!item) {
      throw new Error("Portfolio item not found");
    }

    const provider = await providerRepo.findById(item.providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }

    if (userRole !== "admin" && provider.profileId !== profileId) {
      throw new Error("Forbidden: You do not own this service provider profile");
    }

    return await portfolioRepo.update(id, data);
  }

  async deletePortfolioItem(id: string, profileId: string, userRole: string) {
    const item = await portfolioRepo.findById(id);
    if (!item) {
      throw new Error("Portfolio item not found");
    }

    const provider = await providerRepo.findById(item.providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }

    if (userRole !== "admin" && provider.profileId !== profileId) {
      throw new Error("Forbidden: You do not own this service provider profile");
    }

    return await portfolioRepo.softDelete(id);
  }

  async reorderPortfolio(providerId: string, profileId: string, userRole: string, items: { id: string; sortOrder: number }[]) {
    const provider = await providerRepo.findById(providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }

    if (userRole !== "admin" && provider.profileId !== profileId) {
      throw new Error("Forbidden: You do not own this service provider profile");
    }

    return await db.transaction(async (tx) => {
      const results = [];
      for (const item of items) {
        const [updated] = await tx
          .update(serviceProviderPortfolios)
          .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
          .where(eq(serviceProviderPortfolios.id, item.id))
          .returning();
        if (updated) {
          results.push(updated);
        }
      }
      return results;
    });
  }

  async getPortfolio(providerId: string) {
    const provider = await providerRepo.findById(providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }
    return await portfolioRepo.findByProvider(providerId);
  }
}
