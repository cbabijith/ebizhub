import { db } from "../../../config/database.js";
import { businessGallery } from "../../../database/schema.js";
import { eq, and, count } from "drizzle-orm";

export class GalleryRepository {
  async create(data: any) {
    const [result] = await db.insert(businessGallery).values(data).returning();
    return result;
  }

  async delete(id: string) {
    const [result] = await db.delete(businessGallery).where(eq(businessGallery.id, id)).returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await db.select().from(businessGallery).where(eq(businessGallery.id, id));
    return result;
  }

  async findByBusinessId(businessId: string) {
    return await db
      .select()
      .from(businessGallery)
      .where(eq(businessGallery.businessId, businessId))
      .orderBy(businessGallery.sortOrder);
  }

  async resetCovers(businessId: string) {
    return await db
      .update(businessGallery)
      .set({ isCover: false })
      .where(eq(businessGallery.businessId, businessId));
  }

  async setCover(id: string) {
    const [result] = await db
      .update(businessGallery)
      .set({ isCover: true })
      .where(eq(businessGallery.id, id))
      .returning();
    return result;
  }

  async updateSortOrder(id: string, sortOrder: number) {
    const [result] = await db
      .update(businessGallery)
      .set({ sortOrder })
      .where(eq(businessGallery.id, id))
      .returning();
    return result;
  }

  async countImages(businessId: string): Promise<number> {
    const [result] = await db
      .select({ val: count() })
      .from(businessGallery)
      .where(eq(businessGallery.businessId, businessId));
    return result?.val || 0;
  }
}

