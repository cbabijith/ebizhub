import { RatingsRepository } from "./repository.js";
import { db } from "../../../config/database.js";
import { businesses, serviceProviders } from "../../../database/schema.js";
import { eq, and, isNull } from "drizzle-orm";

const repo = new RatingsRepository();

export class RatingsService {
  async addRating(profileId: string, resourceType: "business" | "provider", resourceId: string, ratingValue: number) {
    // 1. Verify target exists and is not deleted/inactive
    if (resourceType === "business") {
      const [biz] = await db
        .select()
        .from(businesses)
        .where(
          and(
            eq(businesses.id, resourceId),
            eq(businesses.status, "active"),
            isNull(businesses.deletedAt)
          )
        )
        .limit(1);
      if (!biz) {
        const err = new Error("Business not found");
        (err as any).status = 404;
        throw err;
      }
    } else {
      const [provider] = await db
        .select()
        .from(serviceProviders)
        .where(
          and(
            eq(serviceProviders.id, resourceId),
            eq(serviceProviders.status, "active"),
            isNull(serviceProviders.deletedAt)
          )
        )
        .limit(1);
      if (!provider) {
        const err = new Error("Service provider not found");
        (err as any).status = 404;
        throw err;
      }
    }

    // 2. Check duplicate/existing rating
    const existing = await repo.findAny(profileId, resourceType, resourceId);
    if (existing) {
      if (!existing.deletedAt) {
        const err = new Error("You have already rated this resource. Update your existing rating instead.");
        (err as any).status = 409;
        throw err;
      }
      // If soft-deleted, restore/reactivate it
      return await repo.restore(existing.id, ratingValue);
    }

    return await repo.create(profileId, resourceType, resourceId, ratingValue);
  }

  async updateRating(id: string, profileId: string, ratingValue: number) {
    const existing = await repo.findById(id);
    if (!existing || existing.deletedAt) {
      const err = new Error("Rating not found");
      (err as any).status = 404;
      throw err;
    }

    if (existing.profileId !== profileId) {
      const err = new Error("Forbidden: You do not own this rating");
      (err as any).status = 403;
      throw err;
    }

    return await repo.update(id, ratingValue);
  }

  async deleteRating(id: string, profileId: string) {
    const existing = await repo.findById(id);
    if (!existing || existing.deletedAt) {
      const err = new Error("Rating not found");
      (err as any).status = 404;
      throw err;
    }

    if (existing.profileId !== profileId) {
      const err = new Error("Forbidden: You do not own this rating");
      (err as any).status = 403;
      throw err;
    }

    return await repo.delete(id);
  }

  async getRatingsForResource(resourceType: "business" | "provider", resourceId: string) {
    return await repo.findActiveByResource(resourceType, resourceId);
  }

  async getSummary(resourceType: "business" | "provider", resourceId: string) {
    // Check target exists
    if (resourceType === "business") {
      const [biz] = await db
        .select()
        .from(businesses)
        .where(
          and(
            eq(businesses.id, resourceId),
            isNull(businesses.deletedAt)
          )
        )
        .limit(1);
      if (!biz) {
        const err = new Error("Business not found");
        (err as any).status = 404;
        throw err;
      }
    } else {
      const [provider] = await db
        .select()
        .from(serviceProviders)
        .where(
          and(
            eq(serviceProviders.id, resourceId),
            isNull(serviceProviders.deletedAt)
          )
        )
        .limit(1);
      if (!provider) {
        const err = new Error("Service provider not found");
        (err as any).status = 404;
        throw err;
      }
    }

    return await repo.getSummary(resourceType, resourceId);
  }
}
