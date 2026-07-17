import { BannerRepository } from "./repository.js";

export class BannerService {
  private repo = new BannerRepository();

  async getBanners(params: { isActive?: boolean; limit: number; offset: number }) {
    return this.repo.findBanners(params);
  }

  async getBannerById(id: string) {
    const banner = await this.repo.findById(id);
    if (!banner) throw new Error("Banner not found");
    return banner;
  }

  async getPublicBannerById(id: string) {
    const banner = await this.getBannerById(id);
    const now = new Date();
    if (!banner.isActive || (banner.startDate && banner.startDate > now) || (banner.endDate && banner.endDate < now)) {
      throw new Error("Banner not found");
    }
    return banner;
  }

  async createBanner(data: any, userId: string) {
    return this.repo.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });
  }

  async updateBanner(id: string, data: any, userId: string) {
    await this.getBannerById(id);
    return this.repo.update(id, {
      ...data,
      updatedBy: userId,
    });
  }

  async deleteBanner(id: string, userId: string) {
    await this.getBannerById(id);
    return this.repo.delete(id, userId);
  }
}
