import { BusinessRepository } from "./repository.js";
import { CategoryRepository } from "../categories/repository.js";
import { db } from "../../../config/database.js";
import { members } from "../../../database/schema.js";
import { eq } from "drizzle-orm";

const businessRepo = new BusinessRepository();
const categoryRepo = new CategoryRepository();

export class BusinessService {
  async registerBusiness(ownerId: string, data: any) {
    // 1. Verify owner has a completed member profile
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.profileId, ownerId));
    if (!member) {
      throw new Error("Owner must have a completed member profile to register a business");
    }

    // 2. Category existence validation
    const category = await categoryRepo.findById(data.categoryId);
    if (!category || category.status !== "active") {
      throw new Error("Invalid category ID");
    }

    const existingSlug = await businessRepo.findBySlug(data.slug);
    if (existingSlug) {
      throw new Error("Business with this slug already exists");
    }

    return await businessRepo.create({
      ...data,
      ownerId,
    });
  }

  async updateBusiness(id: string, ownerId: string, userRole: string, data: any) {
    const existing = await businessRepo.findById(id);
    if (!existing) {
      throw new Error("Business not found");
    }

    // Ownership check (unless Admin)
    if (userRole !== "admin" && existing.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await businessRepo.findBySlug(data.slug);
      if (existingSlug) {
        throw new Error("Business with this slug already exists");
      }
    }

    return await businessRepo.update(id, data);
  }

  async getOwnBusinesses(ownerId: string) {
    return await businessRepo.findByOwnerId(ownerId);
  }

  async getBusinessById(id: string) {
    const business = await businessRepo.findById(id);
    if (!business) {
      throw new Error("Business not found");
    }
    return business;
  }

  async deleteBusiness(id: string, ownerId: string, userRole: string) {
    const existing = await businessRepo.findById(id);
    if (!existing) {
      throw new Error("Business not found");
    }

    if (userRole !== "admin" && existing.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    return await businessRepo.softDelete(id);
  }

  async updateBusinessStatus(id: string, status: "active" | "inactive" | "suspended") {
    const existing = await businessRepo.findById(id);
    if (!existing) {
      throw new Error("Business not found");
    }
    return await businessRepo.updateStatus(id, status);
  }

  async getPublicBusinessById(id: string) {
    const business = await businessRepo.findPublicById(id);
    if (!business) {
      throw new Error("Business not found");
    }
    return business;
  }
}
