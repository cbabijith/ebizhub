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
}
