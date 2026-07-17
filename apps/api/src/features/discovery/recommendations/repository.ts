import { db } from "../../../config/database.js";
import {
  businesses,
  serviceProviders,
  businessCategories,
  serviceCategories,
  districts,
  profiles,
  serviceProviderSkills,
} from "../../../database/schema.js";
import { members } from "../../../database/schema/member.js";
import { or } from "drizzle-orm";
import { eq, and, isNull, desc, ne, sql, inArray } from "drizzle-orm";

export class RecommendationsRepository {
  // Fetch business by ID
  async findBusinessById(id: string) {
    const result = await db
      .select()
      .from(businesses)
      .where(
        and(
          eq(businesses.id, id),
          eq(businesses.status, "active"),
          eq(businesses.verificationStatus, "verified"),
          isNull(businesses.deletedAt)
        )
      )
      .limit(1);
    return result[0] || null;
  }

  // Fetch provider by ID
  async findProviderById(id: string) {
    const result = await db
      .select()
      .from(serviceProviders)
      .where(
        and(
          eq(serviceProviders.id, id),
          eq(serviceProviders.status, "active"),
          eq(serviceProviders.verificationStatus, "verified"),
          isNull(serviceProviders.deletedAt)
        )
      )
      .limit(1);
    return result[0] || null;
  }

  // Business: same category
  async findBusinessesByCategory(categoryId: number, excludeId: string, limit: number, branchId?: string) {
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(businesses.createdAt));

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
      .from(businesses)
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .leftJoin(districts, eq(businesses.districtId, districts.id))
      .leftJoin(members, eq(businesses.ownerId, members.profileId))
      .where(
        and(
          eq(businesses.categoryId, categoryId),
          ne(businesses.id, excludeId),
          eq(businesses.status, "active"),
          eq(businesses.verificationStatus, "verified"),
          isNull(businesses.deletedAt)
        )
      )
      .orderBy(...orderSpecs)
      .limit(limit);
  }

  // Business: same district
  async findBusinessesByDistrict(districtId: number, excludeIds: string[], limit: number, branchId?: string) {
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(businesses.createdAt));

    const conditions = [
      eq(businesses.districtId, districtId),
      excludeIds.length > 0
        ? sql`${businesses.id} NOT IN (${sql.join(excludeIds.map(id => sql`${id}::uuid`), sql`, `)})`
        : sql`true`,
      eq(businesses.status, "active"),
      eq(businesses.verificationStatus, "verified"),
      isNull(businesses.deletedAt)
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
      .from(businesses)
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .leftJoin(districts, eq(businesses.districtId, districts.id))
      .leftJoin(members, eq(businesses.ownerId, members.profileId))
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(limit);
  }

  // Business: recently added
  async findRecentBusinesses(excludeIds: string[], limit: number, branchId?: string) {
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(businesses.createdAt));

    const conditions = [
      sql`${businesses.createdAt} >= NOW() - INTERVAL '30 days'`,
      excludeIds.length > 0
        ? sql`${businesses.id} NOT IN (${sql.join(excludeIds.map(id => sql`${id}::uuid`), sql`, `)})`
        : sql`true`,
      eq(businesses.status, "active"),
      eq(businesses.verificationStatus, "verified"),
      isNull(businesses.deletedAt)
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
      .from(businesses)
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .leftJoin(districts, eq(businesses.districtId, districts.id))
      .leftJoin(members, eq(businesses.ownerId, members.profileId))
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(limit);
  }

  // Provider: same service category
  async findProvidersByCategory(categoryId: number, excludeId: string, limit: number, branchId?: string) {
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(serviceProviders.createdAt));

    const conditions = [
      eq(serviceProviders.serviceCategoryId, categoryId),
      ne(serviceProviders.id, excludeId),
      eq(serviceProviders.status, "active"),
      eq(serviceProviders.verificationStatus, "verified"),
      isNull(serviceProviders.deletedAt)
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
      .from(serviceProviders)
      .leftJoin(profiles, eq(serviceProviders.profileId, profiles.id))
      .leftJoin(serviceCategories, eq(serviceProviders.serviceCategoryId, serviceCategories.id))
      .leftJoin(members, eq(serviceProviders.memberId, members.id))
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(limit);
  }

  // Provider: same profession
  async findProvidersByProfession(profession: string, excludeIds: string[], limit: number, branchId?: string) {
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(serviceProviders.createdAt));

    const conditions = [
      eq(serviceProviders.profession, profession),
      excludeIds.length > 0
        ? sql`${serviceProviders.id} NOT IN (${sql.join(excludeIds.map(id => sql`${id}::uuid`), sql`, `)})`
        : sql`true`,
      eq(serviceProviders.status, "active"),
      eq(serviceProviders.verificationStatus, "verified"),
      isNull(serviceProviders.deletedAt)
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
      .from(serviceProviders)
      .leftJoin(profiles, eq(serviceProviders.profileId, profiles.id))
      .leftJoin(serviceCategories, eq(serviceProviders.serviceCategoryId, serviceCategories.id))
      .leftJoin(members, eq(serviceProviders.memberId, members.id))
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(limit);
  }

  // Provider: same skills
  async findProvidersBySkills(providerSkills: string[], excludeIds: string[], limit: number, branchId?: string) {
    if (providerSkills.length === 0) return [];

    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(serviceProviders.createdAt));

    const conditions = [
      inArray(serviceProviderSkills.skillName, providerSkills),
      isNull(serviceProviderSkills.deletedAt),
      excludeIds.length > 0
        ? sql`${serviceProviders.id} NOT IN (${sql.join(excludeIds.map(id => sql`${id}::uuid`), sql`, `)})`
        : sql`true`,
      eq(serviceProviders.status, "active"),
      eq(serviceProviders.verificationStatus, "verified"),
      isNull(serviceProviders.deletedAt)
    ];

    if (branchId) {
      conditions.push(or(eq(members.branchId, branchId), isNull(members.branchId)) as any);
    }

    return await db
      .selectDistinct({
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
      .from(serviceProviders)
      .innerJoin(serviceProviderSkills, eq(serviceProviderSkills.providerId, serviceProviders.id))
      .leftJoin(profiles, eq(serviceProviders.profileId, profiles.id))
      .leftJoin(serviceCategories, eq(serviceProviders.serviceCategoryId, serviceCategories.id))
      .leftJoin(members, eq(serviceProviders.memberId, members.id))
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(limit);
  }

  // Fetch provider skills
  async findProviderSkills(providerId: string) {
    const result = await db
      .select({ skillName: serviceProviderSkills.skillName })
      .from(serviceProviderSkills)
      .where(
        and(
          eq(serviceProviderSkills.providerId, providerId),
          isNull(serviceProviderSkills.deletedAt)
        )
      );
    return result.map(r => r.skillName);
  }
}
