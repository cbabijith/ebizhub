import { VerificationRepository } from "./repository.js";
import { ProviderRepository } from "../providers/repository.js";

const verificationRepo = new VerificationRepository();
const providerRepo = new ProviderRepository();

export class VerificationService {
  async submitRequest(profileId: string, userRole: string, providerId: string) {
    const provider = await providerRepo.findById(providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }

    // Ownership check (unless admin)
    if (userRole !== "admin" && provider.profileId !== profileId) {
      const err = new Error("Forbidden: You do not own this service provider profile");
      (err as any).statusCode = 403;
      throw err;
    }

    // Prevent duplicate pending requests
    const pending = await verificationRepo.findPendingByProvider(providerId);
    if (pending) {
      throw new Error("There is already a pending verification request for this provider");
    }

    return await verificationRepo.create({
      providerId,
      submittedBy: profileId,
      status: "pending",
    });
  }

  async reviewRequest(reviewerId: string, userRole: string, requestId: string, approve: boolean, remarks: string | null) {
    if (userRole !== "admin") {
      const err = new Error("Forbidden: Only administrators can review verification requests");
      (err as any).statusCode = 403;
      throw err;
    }

    const request = await verificationRepo.findById(requestId);
    if (!request) {
      throw new Error("Verification request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Verification request has already been reviewed");
    }

    const status = approve ? "approved" : "rejected";
    return await verificationRepo.updateStatus(requestId, reviewerId, status, remarks, request.providerId);
  }

  async getHistory(profileId: string, userRole: string, providerId: string) {
    const provider = await providerRepo.findById(providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }

    // Ownership or admin check to view history
    if (userRole !== "admin" && provider.profileId !== profileId) {
      const err = new Error("Forbidden: You do not own this service provider profile");
      (err as any).statusCode = 403;
      throw err;
    }

    return await verificationRepo.findHistoryByProvider(providerId);
  }
}
