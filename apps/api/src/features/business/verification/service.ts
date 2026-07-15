import { VerificationRepository } from "./repository.js";
import { BusinessRepository } from "../businesses/repository.js";

const verificationRepo = new VerificationRepository();
const businessRepo = new BusinessRepository();

export class VerificationService {
  async approveBusiness(businessId: string, reviewerId: string, remarks: string | null) {
    const business = await businessRepo.findById(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    return await verificationRepo.reviewBusiness(businessId, reviewerId, "verified", remarks);
  }

  async rejectBusiness(businessId: string, reviewerId: string, remarks: string | null) {
    const business = await businessRepo.findById(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    return await verificationRepo.reviewBusiness(businessId, reviewerId, "rejected", remarks);
  }

  async submitVerification(businessId: string, ownerId: string, userRole: string) {
    const business = await businessRepo.findById(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    if (userRole !== "admin" && business.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    return await verificationRepo.submitRequest(businessId, ownerId);
  }

  async getHistory(businessId: string, ownerId: string, userRole: string) {
    const business = await businessRepo.findById(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    if (userRole !== "admin" && business.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    return await verificationRepo.getVerificationHistory(businessId);
  }
}

