import { FavoritesRepository } from "./repository.js";
import { db } from "../../../config/database.js";
import { businesses, serviceProviders } from "../../../database/schema.js";
import { eq, and, isNull } from "drizzle-orm";

const repo = new FavoritesRepository();

export class FavoritesService {
  async addFavorite(profileId: string, resourceType: "business" | "provider", resourceId: string) {
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

    // 2. Check duplicate
    const existing = await repo.findUnique(profileId, resourceType, resourceId);
    if (existing) {
      const err = new Error("Already favorited");
      (err as any).status = 409;
      throw err;
    }

    return await repo.create(profileId, resourceType, resourceId);
  }

  async removeFavorite(id: string, profileId: string) {
    const existing = await repo.findById(id);
    if (!existing) {
      const err = new Error("Favorite record not found");
      (err as any).status = 404;
      throw err;
    }

    if (existing.profileId !== profileId) {
      const err = new Error("Forbidden: You do not own this favorite");
      (err as any).status = 403;
      throw err;
    }

    return await repo.delete(id);
  }

  async getFavorites(profileId: string) {
    const list = await repo.findByProfileId(profileId);
    // Format response to clean up nulls
    return list.map(item => ({
      id: item.id,
      resourceType: item.resourceType,
      resourceId: item.resourceId,
      createdAt: item.createdAt,
      details: item.resourceType === "business" ? item.business : item.provider,
    }));
  }

  async getCount(resourceType: "business" | "provider", resourceId: string) {
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

    return await repo.getCount(resourceType, resourceId);
  }
}
