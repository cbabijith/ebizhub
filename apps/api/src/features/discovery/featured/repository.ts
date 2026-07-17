import { db } from "../../../config/database.js";
import {
  featuredListings,
  businesses,
  serviceProviders,
  businessCategories,
  serviceCategories,
  districts,
  profiles,
} from "../../../database/schema.js";
import { members } from "../../../database/schema/member.js";
import { eq, and, isNull, desc, lte, gte, or, sql } from "drizzle-orm";

const now = () => new Date();

function activeFeaturedCondition() {
  return and(
    eq(featuredListings.isActive, true),
    lte(featuredListings.startDate, sql`NOW()`),
    or(
      isNull(featuredListings.endDate),
      gte(featuredListings.endDate, sql`NOW()`)
    )
  );
}

export class FeaturedRepository {
  async findFeaturedBusinesses(limit: number = 10, branchId?: string) {
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(featuredListings.priority), desc(featuredListings.createdAt));

    const conditions = [
      eq(featuredListings.entityType, "business"),
      activeFeaturedCondition(),
      eq(businesses.status, "active"),
      eq(businesses.verificationStatus, "verified"),
      isNull(businesses.deletedAt),
    ];

    if (branchId) {
      conditions.push(or(eq(members.branchId, branchId), isNull(members.branchId)) as any);
    }

    return await db
      .select({
        id: businesses.id,
        businessName: businesses.businessName,
        name: businesses.businessName,
        slug: businesses.slug,
        description: businesses.description,
        logo: businesses.logo,
        coverImage: businesses.coverImage,
        address: businesses.address,
        isFeatured: businesses.isFeatured,
        isVerified: sql<boolean>`${businesses.verificationStatus} = 'verified'`,
        category: {
          id: businessCategories.id,
          name: businessCategories.name,
          slug: businessCategories.slug,
        },
      })
      .from(featuredListings)
      .innerJoin(businesses, eq(businesses.id, featuredListings.entityId))
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .leftJoin(districts, eq(businesses.districtId, districts.id))
      .leftJoin(members, eq(businesses.ownerId, members.profileId))
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(limit);
  }

  async findFeaturedProviders(limit: number = 10, branchId?: string) {
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(featuredListings.priority), desc(featuredListings.createdAt));

    const conditions = [
      eq(featuredListings.entityType, "provider"),
      activeFeaturedCondition(),
      eq(serviceProviders.status, "active"),
      eq(serviceProviders.verificationStatus, "verified"),
      isNull(serviceProviders.deletedAt),
    ];

    if (branchId) {
      conditions.push(or(eq(members.branchId, branchId), isNull(members.branchId)) as any);
    }

    return await db
      .select({
        id: serviceProviders.id,
        fullName: profiles.fullName,
        profession: serviceProviders.profession,
        experience: serviceProviders.experience,
        bio: serviceProviders.bio,
        availability: serviceProviders.availability,
        isFeatured: serviceProviders.isFeatured,
        isVerified: sql<boolean>`${serviceProviders.verificationStatus} = 'verified'`,
        category: {
          id: serviceCategories.id,
          name: serviceCategories.name,
          slug: serviceCategories.slug,
        },
      })
      .from(featuredListings)
      .innerJoin(serviceProviders, eq(serviceProviders.id, featuredListings.entityId))
      .leftJoin(profiles, eq(serviceProviders.profileId, profiles.id))
      .leftJoin(serviceCategories, eq(serviceProviders.serviceCategoryId, serviceCategories.id))
      .leftJoin(members, eq(serviceProviders.memberId, members.id))
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(limit);
  }

  // Admin operations
  async findById(id: string) {
    const result = await db
      .select()
      .from(featuredListings)
      .where(eq(featuredListings.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findActiveDuplicate(entityType: "business" | "provider", entityId: string) {
    const result = await db
      .select()
      .from(featuredListings)
      .where(
        and(
          eq(featuredListings.entityType, entityType),
          eq(featuredListings.entityId, entityId),
          eq(featuredListings.isActive, true)
        )
      )
      .limit(1);
    return result[0] || null;
  }

  async create(data: {
    entityType: "business" | "provider";
    entityId: string;
    priority: number;
    startDate: Date;
    endDate?: Date;
    createdBy: string;
  }) {
    const result = await db
      .insert(featuredListings)
      .values({
        entityType: data.entityType,
        entityId: data.entityId,
        priority: data.priority,
        startDate: data.startDate,
        endDate: data.endDate || null,
        createdBy: data.createdBy,
      })
      .returning();
    return result[0];
  }

  async update(id: string, data: Partial<{
    priority: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  }>) {
    const result = await db
      .update(featuredListings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(featuredListings.id, id))
      .returning();
    return result[0] || null;
  }

  async softDelete(id: string) {
    const result = await db
      .update(featuredListings)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(featuredListings.id, id))
      .returning();
    return result[0] || null;
  }

  // Entity existence checks
  async businessExists(id: string) {
    const result = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(
        and(
          eq(businesses.id, id),
          eq(businesses.status, "active"),
          isNull(businesses.deletedAt)
        )
      )
      .limit(1);
    return result.length > 0;
  }

  async providerExists(id: string) {
    const result = await db
      .select({ id: serviceProviders.id })
      .from(serviceProviders)
      .where(
        and(
          eq(serviceProviders.id, id),
          eq(serviceProviders.status, "active"),
          isNull(serviceProviders.deletedAt)
        )
      )
      .limit(1);
    return result.length > 0;
  }
}
