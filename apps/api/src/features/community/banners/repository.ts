import { db } from "../../../config/database.js";
import { banners } from "../../../database/schema.js";
import { eq, and, isNull, gte, lte, desc, asc, or, sql, SQL } from "drizzle-orm";

export class BannerRepository {
  async findBanners(params: { isActive?: boolean; limit: number; offset: number }) {
    const conditions: SQL[] = [isNull(banners.deletedAt)];

    if (params.isActive !== undefined) {
      if (params.isActive) {
        conditions.push(eq(banners.isActive, true));
        conditions.push(or(isNull(banners.startDate), lte(banners.startDate, new Date())) as any);
        conditions.push(or(isNull(banners.endDate), gte(banners.endDate, new Date())) as any);
      } else {
        conditions.push(eq(banners.isActive, false));
      }
    }

    return db
      .select()
      .from(banners)
      .where(and(...conditions))
      .orderBy(asc(banners.priority), desc(banners.createdAt))
      .limit(params.limit)
      .offset(params.offset);
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(banners)
      .where(and(eq(banners.id, id), isNull(banners.deletedAt)));
    return result;
  }

  async create(data: any) {
    const [result] = await db.insert(banners).values(data).returning();
    return result;
  }

  async update(id: string, data: any) {
    const [result] = await db
      .update(banners)
      .set({ ...data, updatedAt: new Date(), version: sql`version + 1` })
      .where(and(eq(banners.id, id), isNull(banners.deletedAt)))
      .returning();
    return result;
  }

  async delete(id: string, userId: string) {
    const [result] = await db
      .update(banners)
      .set({
        deletedAt: new Date(),
        updatedBy: userId,
        isActive: false,
        updatedAt: new Date(),
        version: sql`version + 1`,
      })
      .where(and(eq(banners.id, id), isNull(banners.deletedAt)))
      .returning();
    return result;
  }
}
