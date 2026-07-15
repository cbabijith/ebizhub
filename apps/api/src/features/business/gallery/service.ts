import { GalleryRepository } from "./repository.js";
import { BusinessRepository } from "../businesses/repository.js";
import { db } from "../../../config/database.js";

const galleryRepo = new GalleryRepository();
const businessRepo = new BusinessRepository();

export class GalleryService {
  async addImage(ownerId: string, data: any) {
    const business = await businessRepo.findById(data.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    if (business.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    return await db.transaction(async (tx) => {
      if (data.isCover) {
        // Reset other covers
        await galleryRepo.resetCovers(data.businessId);
      }
      return await galleryRepo.create(data);
    });
  }

  async deleteImage(ownerId: string, id: string) {
    const image = await galleryRepo.findById(id);
    if (!image) {
      throw new Error("Gallery image not found");
    }

    const business = await businessRepo.findById(image.businessId);
    if (!business || business.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    return await galleryRepo.delete(id);
  }

  async reorderGallery(ownerId: string, data: any) {
    const business = await businessRepo.findById(data.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    if (business.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    return await db.transaction(async (tx) => {
      const results = [];
      for (const item of data.images) {
        const updated = await galleryRepo.updateSortOrder(item.id, item.sortOrder);
        if (updated) {
          results.push(updated);
        }
      }
      return results;
    });
  }

  async getImages(businessId: string) {
    return await galleryRepo.findByBusinessId(businessId);
  }
}
