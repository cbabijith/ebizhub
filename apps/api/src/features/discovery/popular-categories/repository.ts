import { db } from "../../../config/database.js";
import {
  businesses,
  serviceProviders,
  businessCategories,
  serviceCategories,
  businessAnalytics,
  providerAnalytics,
} from "../../../database/schema.js";
import { eq, and, isNull, desc, sql, or } from "drizzle-orm";
import { members } from "../../../database/schema/member.js";

export class PopularCategoriesRepository {
  async findPopularBusinessCategories(limit: number, branchId?: string) {
    const bizConditions = [
      eq(businesses.categoryId, businessCategories.id),
      eq(businesses.status, "active"),
      eq(businesses.verificationStatus, "verified"),
      isNull(businesses.deletedAt)
    ];

    if (branchId) {
      bizConditions.push(or(eq(members.branchId, branchId), isNull(members.branchId)) as any);
    }

    let query = db
      .select({
        id: businessCategories.id,
        name: businessCategories.name,
        slug: businessCategories.slug,
        businessCount: sql<number>`COUNT(DISTINCT ${businesses.id})::int`.as("business_count"),
        totalViews: sql<number>`COALESCE(SUM(${businessAnalytics.profileViews}), 0)::int`.as("total_views"),
        popularityScore: sql<number>`(COUNT(DISTINCT ${businesses.id})::int * 10 + COALESCE(SUM(${businessAnalytics.profileViews}), 0)::int)`.as("popularity_score"),
      })
      .from(businessCategories)
      .leftJoin(
        members,
        branchId ? eq(businesses.ownerId, members.profileId) : sql`false`
      )
      .leftJoin(
        businesses,
        and(...bizConditions)
      )
      .leftJoin(businessAnalytics, eq(businessAnalytics.businessId, businesses.id))
      .where(
        and(
          eq(businessCategories.status, "active"),
          isNull(businessCategories.deletedAt)
        )
      )
      .groupBy(businessCategories.id, businessCategories.name, businessCategories.slug)
      .orderBy(desc(sql`popularity_score`))
      .limit(limit);

    return await query;
  }

  async findPopularServiceCategories(limit: number, branchId?: string) {
    const provConditions = [
      eq(serviceProviders.serviceCategoryId, serviceCategories.id),
      eq(serviceProviders.status, "active"),
      eq(serviceProviders.verificationStatus, "verified"),
      isNull(serviceProviders.deletedAt)
    ];

    if (branchId) {
      provConditions.push(or(eq(members.branchId, branchId), isNull(members.branchId)) as any);
    }

    let query = db
      .select({
        id: serviceCategories.id,
        name: serviceCategories.name,
        slug: serviceCategories.slug,
        providerCount: sql<number>`COUNT(DISTINCT ${serviceProviders.id})::int`.as("provider_count"),
        totalViews: sql<number>`COALESCE(SUM(${providerAnalytics.profileViews}), 0)::int`.as("total_views"),
        popularityScore: sql<number>`(COUNT(DISTINCT ${serviceProviders.id})::int * 10 + COALESCE(SUM(${providerAnalytics.profileViews}), 0)::int)`.as("popularity_score"),
      })
      .from(serviceCategories)
      .leftJoin(
        members,
        branchId ? eq(serviceProviders.memberId, members.id) : sql`false`
      )
      .leftJoin(
        serviceProviders,
        and(...provConditions)
      )
      .leftJoin(providerAnalytics, eq(providerAnalytics.providerId, serviceProviders.id))
      .where(
        and(
          eq(serviceCategories.status, "active"),
          isNull(serviceCategories.deletedAt)
        )
      )
      .groupBy(serviceCategories.id, serviceCategories.name, serviceCategories.slug)
      .orderBy(desc(sql`popularity_score`))
      .limit(limit);

    return await query;
  }
}
