import { db } from "../../../config/database.js";
import { favorites, businesses, serviceProviders, profiles } from "../../../database/schema.js";
import { eq, and, sql } from "drizzle-orm";

export class FavoritesRepository {
  async create(profileId: string, resourceType: "business" | "provider", resourceId: string) {
    const [result] = await db
      .insert(favorites)
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
      .from(favorites)
      .where(eq(favorites.id, id))
      .limit(1);
    return result;
  }

  async findUnique(profileId: string, resourceType: "business" | "provider", resourceId: string) {
    const [result] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.profileId, profileId),
          eq(favorites.resourceType, resourceType),
          eq(favorites.resourceId, resourceId)
        )
      )
      .limit(1);
    return result;
  }

  async delete(id: string) {
    const [result] = await db
      .delete(favorites)
      .where(eq(favorites.id, id))
      .returning();
    return result;
  }

  async findByProfileId(profileId: string) {
    return await db
      .select({
        id: favorites.id,
        resourceType: favorites.resourceType,
        resourceId: favorites.resourceId,
        createdAt: favorites.createdAt,
        business: {
          id: businesses.id,
          businessName: businesses.businessName,
          slug: businesses.slug,
          logo: businesses.logo,
        },
        provider: {
          id: serviceProviders.id,
          fullName: profiles.fullName,
          profession: serviceProviders.profession,
        },
      })
      .from(favorites)
      .leftJoin(businesses, eq(favorites.resourceId, businesses.id))
      .leftJoin(serviceProviders, eq(favorites.resourceId, serviceProviders.id))
      .leftJoin(profiles, eq(serviceProviders.profileId, profiles.id))
      .where(eq(favorites.profileId, profileId));
  }

  async getCount(resourceType: "business" | "provider", resourceId: string) {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(favorites)
      .where(
        and(
          eq(favorites.resourceType, resourceType),
          eq(favorites.resourceId, resourceId)
        )
      );
    return result?.count || 0;
  }
}
