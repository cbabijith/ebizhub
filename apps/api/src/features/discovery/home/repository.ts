import { db } from "../../../config/database.js";
import { businesses, serviceProviders, businessCategories, profiles } from "../../../database/schema.js";
import { eq, and, isNull, desc } from "drizzle-orm";

export class HomeRepository {
  async getFeaturedBusinesses(limitNum = 5) {
    return await db
      .select()
      .from(businesses)
      .where(and(eq(businesses.status, "active"), eq(businesses.isFeatured, true), isNull(businesses.deletedAt)))
      .orderBy(desc(businesses.createdAt))
      .limit(limitNum);
  }

  async getFeaturedProviders(limitNum = 5) {
    return await db
      .select()
      .from(serviceProviders)
      .leftJoin(profiles, eq(serviceProviders.profileId, profiles.id))
      .where(and(eq(serviceProviders.status, "active"), eq(serviceProviders.isFeatured, true), isNull(serviceProviders.deletedAt)))
      .orderBy(desc(serviceProviders.createdAt))
      .limit(limitNum);
  }

  async getPopularCategories(limitNum = 10) {
    return await db
      .select()
      .from(businessCategories)
      .where(isNull(businessCategories.deletedAt))
      .orderBy(desc(businessCategories.sortOrder))
      .limit(limitNum);
  }

  async getRecentlyAddedBusinesses(limitNum = 5) {
    return await db
      .select()
      .from(businesses)
      .where(and(eq(businesses.status, "active"), isNull(businesses.deletedAt)))
      .orderBy(desc(businesses.createdAt))
      .limit(limitNum);
  }

  async getRecentlyAddedProviders(limitNum = 5) {
    return await db
      .select()
      .from(serviceProviders)
      .leftJoin(profiles, eq(serviceProviders.profileId, profiles.id))
      .where(and(eq(serviceProviders.status, "active"), isNull(serviceProviders.deletedAt)))
      .orderBy(desc(serviceProviders.createdAt))
      .limit(limitNum);
  }

  async getRecentlyVerifiedBusinesses(limitNum = 5) {
    return await db
      .select()
      .from(businesses)
      .where(and(eq(businesses.status, "active"), eq(businesses.verificationStatus, "verified"), isNull(businesses.deletedAt)))
      .orderBy(desc(businesses.updatedAt))
      .limit(limitNum);
  }

  async getRecentlyVerifiedProviders(limitNum = 5) {
    return await db
      .select()
      .from(serviceProviders)
      .leftJoin(profiles, eq(serviceProviders.profileId, profiles.id))
      .where(and(eq(serviceProviders.status, "active"), eq(serviceProviders.verificationStatus, "verified"), isNull(serviceProviders.deletedAt)))
      .orderBy(desc(serviceProviders.updatedAt))
      .limit(limitNum);
  }
}
