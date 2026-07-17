import { db } from "../../../config/database.js";
import {
  businesses,
  serviceProviders,
  businessCategories,
  serviceCategories,
  districts,
  profiles,
} from "../../../database/schema.js";
import { members } from "../../../database/schema/member.js";
import { eq, and, isNull, desc, sql, or } from "drizzle-orm";

export class RecentRepository {
  async findRecentBusinesses(limit: number, branchId?: string) {
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(businesses.createdAt));

    const conditions = [
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
      .from(businesses)
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .leftJoin(districts, eq(businesses.districtId, districts.id))
      .leftJoin(members, eq(businesses.ownerId, members.profileId))
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(limit);
  }

  async findRecentProviders(limit: number, branchId?: string) {
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(serviceProviders.createdAt));

    const conditions = [
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
      .from(serviceProviders)
      .leftJoin(profiles, eq(serviceProviders.profileId, profiles.id))
      .leftJoin(serviceCategories, eq(serviceProviders.serviceCategoryId, serviceCategories.id))
      .leftJoin(members, eq(serviceProviders.memberId, members.id))
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(limit);
  }

  async findRecentlyVerifiedBusinesses(limit: number, branchId?: string) {
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(businesses.updatedAt));

    const conditions = [
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
        isVerified: sql<boolean>`true`,
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

  async findRecentlyVerifiedProviders(limit: number, branchId?: string) {
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(serviceProviders.updatedAt));

    const conditions = [
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
        isVerified: sql<boolean>`true`,
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
}
