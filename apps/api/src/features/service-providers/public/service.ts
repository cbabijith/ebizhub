import { PublicRepository } from "./repository.js";

const publicRepo = new PublicRepository();

export class PublicService {
  async getPublicProfile(id: string, ip: string | null) {
    const provider = await publicRepo.findPublicById(id);
    if (!provider) {
      throw new Error("Service provider not found");
    }

    // Automatically record interaction event
    try {
      await publicRepo.recordProfileViewTransaction(id, ip);
    } catch (err) {
      console.error("Failed to log interaction view:", err);
    }

    return provider;
  }

  async listPublicProviders(filters: {
    page: number;
    limit: number;
    category?: number;
    district?: number;
    panchayat?: number;
    experience?: number;
    availability?: string;
  }) {
    return await publicRepo.findAllPublic(filters);
  }
}
