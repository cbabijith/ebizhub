import { AreaRepository } from "./repository.js";
import { ProviderRepository } from "../providers/repository.js";
import { db } from "../../../config/database.js";
import { districts, panchayats } from "../../../database/schema.js";
import { eq } from "drizzle-orm";

const areaRepo = new AreaRepository();
const providerRepo = new ProviderRepository();

export class AreaService {
  async addServiceArea(profileId: string, userRole: string, data: any) {
    const provider = await providerRepo.findById(data.providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }

    if (userRole !== "admin" && provider.profileId !== profileId) {
      throw new Error("Forbidden: You do not own this service provider profile");
    }

    // Verify district exists
    const [district] = await db.select().from(districts).where(eq(districts.id, data.districtId));
    if (!district) {
      throw new Error("District not found");
    }

    // Verify panchayat exists if provided
    if (data.panchayatId) {
      const [panchayat] = await db.select().from(panchayats).where(eq(panchayats.id, data.panchayatId));
      if (!panchayat) {
        throw new Error("Panchayat not found");
      }
    }

    // Prevent duplicates
    const existing = await areaRepo.findByProviderAndLocation(data.providerId, data.districtId, data.panchayatId || null);
    if (existing) {
      throw new Error("Service area already registered for this provider");
    }

    return await areaRepo.create(data);
  }

  async removeServiceArea(id: number, profileId: string, userRole: string) {
    const area = await areaRepo.findById(id);
    if (!area) {
      throw new Error("Service area not found");
    }

    const provider = await providerRepo.findById(area.providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }

    if (userRole !== "admin" && provider.profileId !== profileId) {
      throw new Error("Forbidden: You do not own this service provider profile");
    }

    return await areaRepo.delete(id);
  }

  async getServiceAreas(providerId: string) {
    const provider = await providerRepo.findById(providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }
    return await areaRepo.findByProvider(providerId);
  }
}
