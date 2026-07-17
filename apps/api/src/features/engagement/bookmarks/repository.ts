import { db } from "../../../config/database.js";
import { bookmarks, communityNews, events, jobs, offers, businesses } from "../../../database/schema.js";
import { eq, and, isNull, sql, desc } from "drizzle-orm";

export class BookmarksRepository {
  async create(profileId: string, resourceType: "news" | "event" | "job" | "offer", resourceId: string) {
    const [result] = await db
      .insert(bookmarks)
      .values({
        profileId,
        resourceType,
        resourceId,
      })
      .returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.id, id))
      .limit(1);
    return result;
  }

  async findUniqueActive(profileId: string, resourceType: "news" | "event" | "job" | "offer", resourceId: string) {
    const [result] = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.profileId, profileId),
          eq(bookmarks.resourceType, resourceType),
          eq(bookmarks.resourceId, resourceId),
          isNull(bookmarks.deletedAt)
        )
      )
      .limit(1);
    return result;
  }

  async findAny(profileId: string, resourceType: "news" | "event" | "job" | "offer", resourceId: string) {
    const [result] = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.profileId, profileId),
          eq(bookmarks.resourceType, resourceType),
          eq(bookmarks.resourceId, resourceId)
        )
      )
      .limit(1);
    return result;
  }

  async restore(id: string) {
    const [result] = await db
      .update(bookmarks)
      .set({
        deletedAt: null,
      })
      .where(eq(bookmarks.id, id))
      .returning();
    return result;
  }

  async delete(id: string) {
    const [result] = await db
      .update(bookmarks)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(bookmarks.id, id))
      .returning();
    return result;
  }

  async findActiveByProfileId(profileId: string, resourceType?: "news" | "event" | "job" | "offer", limit: number = 20, offset: number = 0) {
    const conditions = [
      eq(bookmarks.profileId, profileId),
      isNull(bookmarks.deletedAt),
    ];

    if (resourceType) {
      conditions.push(eq(bookmarks.resourceType, resourceType));
    }

    return await db
      .select({
        id: bookmarks.id,
        resourceType: bookmarks.resourceType,
        resourceId: bookmarks.resourceId,
        createdAt: bookmarks.createdAt,
        news: {
          id: communityNews.id,
          title: communityNews.title,
          slug: communityNews.slug,
          summary: communityNews.summary,
        },
        event: {
          id: events.id,
          title: events.title,
          venue: events.venue,
          startDate: events.startDate,
          status: events.status,
        },
        job: {
          id: jobs.id,
          title: jobs.title,
          businessName: businesses.businessName,
        },
        offer: {
          id: offers.id,
          title: offers.title,
          couponCode: offers.couponCode,
          validTo: offers.validTo,
        },
      })
      .from(bookmarks)
      .leftJoin(communityNews, eq(bookmarks.resourceId, communityNews.id))
      .leftJoin(events, eq(bookmarks.resourceId, events.id))
      .leftJoin(jobs, eq(bookmarks.resourceId, jobs.id))
      .leftJoin(businesses, eq(jobs.businessId, businesses.id))
      .leftJoin(offers, eq(bookmarks.resourceId, offers.id))
      .where(and(...conditions))
      .orderBy(desc(bookmarks.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async countActive(profileId: string, resourceType?: "news" | "event" | "job" | "offer") {
    const conditions = [
      eq(bookmarks.profileId, profileId),
      isNull(bookmarks.deletedAt),
    ];

    if (resourceType) {
      conditions.push(eq(bookmarks.resourceType, resourceType));
    }

    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bookmarks)
      .where(and(...conditions));
    
    return result?.count || 0;
  }
}
