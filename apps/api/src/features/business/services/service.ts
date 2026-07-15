import { ServiceRepository } from "./repository.js";
import { BusinessRepository } from "../businesses/repository.js";

const serviceRepo = new ServiceRepository();
const businessRepo = new BusinessRepository();

export class ServiceService {
  async addService(ownerId: string, data: any) {
    const business = await businessRepo.findById(data.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    if (business.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    const currentCount = await serviceRepo.countServices(data.businessId);
    if (currentCount >= 5) {
      throw new Error("Maximum of 5 services allowed per business");
    }

    return await serviceRepo.create(data);
  }

  async updateService(id: string, ownerId: string, data: any) {
    const existing = await serviceRepo.findById(id);
    if (!existing) {
      throw new Error("Service not found");
    }

    const business = await businessRepo.findById(existing.businessId);
    if (!business || business.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    return await serviceRepo.update(id, data);
  }

  async deleteService(id: string, ownerId: string) {
    const existing = await serviceRepo.findById(id);
    if (!existing) {
      throw new Error("Service not found");
    }

    const business = await businessRepo.findById(existing.businessId);
    if (!business || business.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    return await serviceRepo.softDelete(id);
  }

  async getServices(businessId: string) {
    return await serviceRepo.findByBusinessId(businessId);
  }
}
