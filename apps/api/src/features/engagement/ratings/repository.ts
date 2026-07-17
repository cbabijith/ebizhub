import { db } from "../../../config/database.js";
import { ratings } from "../../../database/schema.js";
import { eq, and, isNull, sql } from "drizzle-orm";

export class RatingsRepository {
  async create(profileId: string, resourceType: "business" | "provider", resourceId: string, rating: number) {
    const [result] = await db
      .insert(ratings)
      .values({
        profileId,
        resourceType,
        resourceId,
        rating,
      })
      .returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(ratings)
      .where(eq(ratings.id, id))
      .limit(1);
    return result;
  }

  async findUniqueActive(profileId: string, resourceType: "business" | "provider", resourceId: string) {
    const [result] = await db
      .select()
      .from(ratings)
      .where(
        and(
          eq(ratings.profileId, profileId),
          eq(ratings.resourceType, resourceType),
          eq(ratings.resourceId, resourceId),
          isNull(ratings.deletedAt)
        )
      )
      .limit(1);
    return result;
  }

  async findAny(profileId: string, resourceType: "business" | "provider", resourceId: string) {
    const [result] = await db
      .select()
      .from(ratings)
      .where(
        and(
          eq(ratings.profileId, profileId),
          eq(ratings.resourceType, resourceType),
          eq(ratings.resourceId, resourceId)
        )
      )
      .limit(1);
    return result;
  }

  async restore(id: string, rating: number) {
    const [result] = await db
      .update(ratings)
      .set({
        rating,
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(ratings.id, id))
      .returning();
    return result;
  }

  async update(id: string, rating: number) {
    const [result] = await db
      .update(ratings)
      .set({
        rating,
        updatedAt: new Date(),
      })
      .where(eq(ratings.id, id))
      .returning();
    return result;
  }

  async delete(id: string) {
    const [result] = await db
      .update(ratings)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(ratings.id, id))
      .returning();
    return result;
  }

  async findActiveByResource(resourceType: "business" | "provider", resourceId: string) {
    return await db
      .select()
      .from(ratings)
      .where(
        and(
          eq(ratings.resourceType, resourceType),
          eq(ratings.resourceId, resourceId),
          isNull(ratings.deletedAt)
        )
      );
  }

  async getSummary(resourceType: "business" | "provider", resourceId: string) {
    // 1. Fetch ratings counts grouped by score
    const rows = await db
      .select({
        rating: ratings.rating,
        count: sql<number>`count(*)::int`,
      })
      .from(ratings)
      .where(
        and(
          eq(ratings.resourceType, resourceType),
          eq(ratings.resourceId, resourceId),
          isNull(ratings.deletedAt)
        )
      )
      .groupBy(ratings.rating);

    // Initialize distribution mapping
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalCount = 0;
    let totalScoreSum = 0;

    for (const r of rows) {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating] = r.count;
        totalCount += r.count;
        totalScoreSum += r.rating * r.count;
      }
    }

    const average = totalCount > 0 ? Number((totalScoreSum / totalCount).toFixed(2)) : 0;

    return {
      average,
      count: totalCount,
      distribution,
    };
  }
}
