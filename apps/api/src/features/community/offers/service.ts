import { OfferRepository } from "./repository.js";

export class OfferService {
  private repo = new OfferRepository();

  async getOffers(params: {
    businessId?: string;
    status?: string;
    featured?: boolean;
    limit: number;
    offset: number;
  }) {
    return this.repo.findOffers(params);
  }

  async getOfferById(id: string) {
    const offer = await this.repo.findById(id);
    if (!offer) throw new Error("Offer not found");
    return offer;
  }

  async getPublicOfferById(id: string) {
    const offer = await this.getOfferById(id);
    const now = new Date();
    if (offer.status !== "active" || offer.validFrom > now || offer.validTo < now) {
      throw new Error("Offer not found");
    }
    return offer;
  }

  async checkOwnership(businessId: string, profileId: string, role: string) {
    if (role === "admin") return;
    const biz = await this.repo.getBusinessById(businessId);
    if (!biz) throw new Error("Business not found");
    if (biz.ownerId !== profileId) {
      throw new Error("You do not own this business");
    }
  }

  async createOffer(data: any, profileId: string, role: string) {
    await this.checkOwnership(data.businessId, profileId, role);
    return this.repo.create({
      ...data,
      createdBy: profileId,
      updatedBy: profileId,
    });
  }

  async updateOffer(id: string, data: any, profileId: string, role: string) {
    const offer = await this.getOfferById(id);
    await this.checkOwnership(offer.businessId, profileId, role);
    return this.repo.update(id, {
      ...data,
      updatedBy: profileId,
    });
  }

  async deleteOffer(id: string, profileId: string, role: string) {
    const offer = await this.getOfferById(id);
    await this.checkOwnership(offer.businessId, profileId, role);
    return this.repo.delete(id, profileId);
  }
}
