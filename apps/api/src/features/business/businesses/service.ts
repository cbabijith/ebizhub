import { BusinessRepository } from "./repository.js";

const businessRepo = new BusinessRepository();

export class BusinessService {
  async registerBusiness(ownerId: string, data: any) {
    const existingSlug = await businessRepo.findBySlug(data.slug);
    if (existingSlug) {
      throw new Error("Business with this slug already exists");
    }

    return await businessRepo.create({
      ...data,
      ownerId,
    });
  }

  async updateBusiness(id: string, ownerId: string, data: any) {
    const existing = await businessRepo.findById(id);
    if (!existing) {
      throw new Error("Business not found");
    }

    // Ownership check (unless Admin)
    if (existing.ownerId !== ownerId) {
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

  async deleteBusiness(id: string, ownerId: string) {
    const existing = await businessRepo.findById(id);
    if (!existing) {
      throw new Error("Business not found");
    }

    if (existing.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    return await businessRepo.softDelete(id);
  }
}
