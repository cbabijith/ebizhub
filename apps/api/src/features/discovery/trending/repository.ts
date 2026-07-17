import { db } from "../../../config/database.js";
import {
  businesses,
  serviceProviders,
  businessCategories,
  serviceCategories,
  profiles,
  interactionLogs,
  providerInteractionLogs,
} from "../../../database/schema.js";
import { members } from "../../../database/schema/member.js";
import { eq, and, isNull, desc, sql, gt, gte, or } from "drizzle-orm";

export class TrendingRepository {
  async findTrendingBusinesses(periodDays: number, limit: number, branchId?: string) {
    const sinceDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const subquery = db
      .select({
        businessId: interactionLogs.businessId,
        trendingScore: sql<number>`sum(
          case
            when ${interactionLogs.action} = 'profile_view' then 1
            when ${interactionLogs.action} = 'phone_click' then 3
            when ${interactionLogs.action} = 'whatsapp_click' then 3
            when ${interactionLogs.action} = 'map_click' then 2
            when ${interactionLogs.action} = 'website_click' then 2
            when ${interactionLogs.action} = 'share_click' then 2
            else 0
          end
        )`.as("trending_score"),
      })
      .from(interactionLogs)
      .where(gte(interactionLogs.createdAt, sinceDate))
      .groupBy(interactionLogs.businessId)
      .as("sub");

    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(sql`trending_score`));

    const conditions = [
      eq(businesses.status, "active"),
      eq(businesses.verificationStatus, "verified"),
      isNull(businesses.deletedAt),
      gt(subquery.trendingScore, 0),
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
        trendingScore: sql<number>`coalesce(${subquery.trendingScore}, 0)`.as("trending_score"),
      })
      .from(businesses)
      .innerJoin(subquery, eq(subquery.businessId, businesses.id))
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .leftJoin(members, eq(businesses.ownerId, members.profileId))
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(limit);
  }

  async findTrendingProviders(periodDays: number, limit: number, branchId?: string) {
    const sinceDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const subquery = db
      .select({
        providerId: providerInteractionLogs.providerId,
        trendingScore: sql<number>`sum(
          case
            when ${providerInteractionLogs.action} = 'profile_view' then 1
            when ${providerInteractionLogs.action} = 'phone_click' then 3
            when ${providerInteractionLogs.action} = 'whatsapp_click' then 3
            when ${providerInteractionLogs.action} = 'map_click' then 2
            when ${providerInteractionLogs.action} = 'website_click' then 2
            when ${providerInteractionLogs.action} = 'share_click' then 2
            else 0
          end
        )`.as("trending_score"),
      })
      .from(providerInteractionLogs)
      .where(gte(providerInteractionLogs.createdAt, sinceDate))
      .groupBy(providerInteractionLogs.providerId)
      .as("sub");

    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(sql`trending_score`));

    const conditions = [
      eq(serviceProviders.status, "active"),
      eq(serviceProviders.verificationStatus, "verified"),
      isNull(serviceProviders.deletedAt),
      gt(subquery.trendingScore, 0),
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
        trendingScore: sql<number>`coalesce(${subquery.trendingScore}, 0)`.as("trending_score"),
      })
      .from(serviceProviders)
      .innerJoin(subquery, eq(subquery.providerId, serviceProviders.id))
      .leftJoin(profiles, eq(serviceProviders.profileId, profiles.id))
      .leftJoin(serviceCategories, eq(serviceProviders.serviceCategoryId, serviceCategories.id))
      .leftJoin(members, eq(serviceProviders.memberId, members.id))
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(limit);
  }
}
