import { BookmarksRepository } from "./repository.js";
import { db } from "../../../config/database.js";
import { communityNews, events, jobs, offers } from "../../../database/schema.js";
import { eq, and, isNull, gte, or } from "drizzle-orm";

const repo = new BookmarksRepository();

export class BookmarksService {
  async addBookmark(profileId: string, resourceType: "news" | "event" | "job" | "offer", resourceId: string) {
    // 1. Verify target exists and is active/available
    if (resourceType === "news") {
      const [item] = await db
        .select()
        .from(communityNews)
        .where(
          and(
            eq(communityNews.id, resourceId),
            eq(communityNews.status, "published"),
            isNull(communityNews.deletedAt)
          )
        )
        .limit(1);
      if (!item) {
        const err = new Error("News article not found or unavailable");
        (err as any).status = 404;
        throw err;
      }
    } else if (resourceType === "event") {
      const [item] = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.id, resourceId),
            or(eq(events.status, "upcoming"), eq(events.status, "ongoing")),
            isNull(events.deletedAt)
          )
        )
        .limit(1);
      if (!item) {
        const err = new Error("Event not found or unavailable");
        (err as any).status = 404;
        throw err;
      }
    } else if (resourceType === "job") {
      const [item] = await db
        .select()
        .from(jobs)
        .where(
          and(
            eq(jobs.id, resourceId),
            eq(jobs.status, "active"),
            isNull(jobs.deletedAt)
          )
        )
        .limit(1);
      if (!item) {
        const err = new Error("Job listing not found or unavailable");
        (err as any).status = 404;
        throw err;
      }
    } else if (resourceType === "offer") {
      const [item] = await db
        .select()
        .from(offers)
        .where(
          and(
            eq(offers.id, resourceId),
            eq(offers.status, "active"),
            gte(offers.validTo, new Date()),
            isNull(offers.deletedAt)
          )
        )
        .limit(1);
      if (!item) {
        const err = new Error("Offer not found or expired");
        (err as any).status = 404;
        throw err;
      }
    }

    // 2. Check duplicate/existing bookmark
    const existing = await repo.findAny(profileId, resourceType, resourceId);
    if (existing) {
      if (!existing.deletedAt) {
        const err = new Error("You have already bookmarked this resource");
        (err as any).status = 409;
        throw err;
      }
      // If soft-deleted, restore/reactivate it
      return await repo.restore(existing.id);
    }

    return await repo.create(profileId, resourceType, resourceId);
  }

  async removeBookmark(id: string, profileId: string) {
    const existing = await repo.findById(id);
    if (!existing || existing.deletedAt) {
      const err = new Error("Bookmark not found");
      (err as any).status = 404;
      throw err;
    }

    if (existing.profileId !== profileId) {
      const err = new Error("Forbidden: You do not own this bookmark");
      (err as any).status = 403;
      throw err;
    }

    return await repo.delete(id);
  }

  async getBookmarks(profileId: string, resourceType?: "news" | "event" | "job" | "offer", limit: number = 20, offset: number = 0) {
    const data = await repo.findActiveByProfileId(profileId, resourceType, limit, offset);
    const total = await repo.countActive(profileId, resourceType);

    // Format output
    const formatted = data.map(item => {
      let details: any = null;
      if (item.resourceType === "news") details = item.news;
      else if (item.resourceType === "event") details = item.event;
      else if (item.resourceType === "job") details = item.job;
      else if (item.resourceType === "offer") details = item.offer;

      return {
        id: item.id,
        resourceType: item.resourceType,
        resourceId: item.resourceId,
        createdAt: item.createdAt,
        details,
      };
    });

    return {
      bookmarks: formatted,
      total,
    };
  }
}
