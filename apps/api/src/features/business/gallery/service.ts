import { GalleryRepository } from "./repository.js";
import { BusinessRepository } from "../businesses/repository.js";
import { db } from "../../../config/database.js";
import { businessGallery } from "../../../database/schema.js";
import { eq } from "drizzle-orm";

const galleryRepo = new GalleryRepository();
const businessRepo = new BusinessRepository();

export class GalleryService {
  async addImage(ownerId: string, userRole: string, data: any) {
    const business = await businessRepo.findById(data.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    if (userRole !== "admin" && business.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    const count = await galleryRepo.countImages(data.businessId);
    if (count >= 10) {
      throw new Error("Maximum of 10 gallery images allowed per business");
    }

    return await db.transaction(async (tx) => {
      if (data.isCover) {
        // Reset other covers inside tx
        await tx
          .update(businessGallery)
          .set({ isCover: false })
          .where(eq(businessGallery.businessId, data.businessId));
      }
      // Insert inside tx
      const [inserted] = await tx
        .insert(businessGallery)
        .values(data)
        .returning();
      return inserted;
    });
  }

  async deleteImage(ownerId: string, userRole: string, id: string) {
    const image = await galleryRepo.findById(id);
    if (!image) {
      throw new Error("Gallery image not found");
    }

    const business = await businessRepo.findById(image.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    if (userRole !== "admin" && business.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    return await galleryRepo.delete(id);
  }

  async reorderGallery(ownerId: string, userRole: string, data: any) {
    const business = await businessRepo.findById(data.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    if (userRole !== "admin" && business.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    return await db.transaction(async (tx) => {
      const results = [];
      for (const item of data.images) {
        const [updated] = await tx
          .update(businessGallery)
          .set({ sortOrder: item.sortOrder })
          .where(eq(businessGallery.id, item.id))
          .returning();
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

