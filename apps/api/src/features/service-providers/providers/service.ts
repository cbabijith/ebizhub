import { ProviderRepository } from "./repository.js";
import { ServiceCategoryRepository } from "../service-categories/repository.js";
import { db } from "../../../config/database.js";
import { members } from "../../../database/schema.js";
import { eq } from "drizzle-orm";

const providerRepo = new ProviderRepository();
const categoryRepo = new ServiceCategoryRepository();

export class ProviderService {
  async registerProvider(profileId: string, data: any) {
    // 1. Verify caller has a completed member profile
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.profileId, profileId));
    if (!member) {
      throw new Error("Owner must have a completed member profile to register as a service provider");
    }

    // 2. Prevent duplicate provider profile
    const existingProvider = await providerRepo.findByMemberId(member.id);
    if (existingProvider) {
      throw new Error("Member already has a service provider profile");
    }

    // 3. Verify category exists and is active
    const category = await categoryRepo.findById(data.serviceCategoryId);
    if (!category || category.status !== "active") {
      throw new Error("Invalid service category ID");
    }

    return await providerRepo.create({
      ...data,
      profileId,
      memberId: member.id,
    });
  }

  async updateProvider(id: string, profileId: string, userRole: string, data: any) {
    const existing = await providerRepo.findById(id);
    if (!existing) {
      throw new Error("Service provider not found");
    }

    // Ownership check (unless admin)
    if (userRole !== "admin" && existing.profileId !== profileId) {
      const err = new Error("Forbidden: You do not own this service provider profile");
      (err as any).statusCode = 403;
      throw err;
    }

    // Category existence check if updated
    if (data.serviceCategoryId) {
      const category = await categoryRepo.findById(data.serviceCategoryId);
      if (!category || category.status !== "active") {
        throw new Error("Invalid service category ID");
      }
    }

    return await providerRepo.update(id, data);
  }

  async getProviderById(id: string) {
    const provider = await providerRepo.findById(id);
    if (!provider) {
      throw new Error("Service provider not found");
    }
    return provider;
  }

  async getOwnProvider(profileId: string) {
    // Find member first
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.profileId, profileId));
    if (!member) {
      throw new Error("Member profile not found");
    }

    const provider = await providerRepo.findByMemberId(member.id);
    if (!provider) {
      throw new Error("Service provider profile not found");
    }
    return await providerRepo.findById(provider.id);
  }

  async deleteProvider(id: string, profileId: string, userRole: string) {
    const existing = await providerRepo.findById(id);
    if (!existing) {
      throw new Error("Service provider not found");
    }

    // Ownership check (unless admin)
    if (userRole !== "admin" && existing.profileId !== profileId) {
      const err = new Error("Forbidden: You do not own this service provider profile");
      (err as any).statusCode = 403;
      throw err;
    }

    return await providerRepo.softDelete(id);
  }

  async updateProviderStatus(id: string, status: "active" | "inactive" | "suspended") {
    const existing = await providerRepo.findById(id);
    if (!existing) {
      throw new Error("Service provider not found");
    }
    return await providerRepo.updateStatus(id, status);
  }

  async listProviders() {
    return await providerRepo.findAll();
  }
}
