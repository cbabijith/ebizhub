import { db } from "../../../config/database.js";
import { serviceProviders, profiles, serviceCategories, providerAnalytics, members, districts, panchayats } from "../../../database/schema.js";
import { eq, and, isNull, sql } from "drizzle-orm";
import { buildProviderFilters } from "../../../shared/filters/provider-filters.js";
import { buildSortOrder } from "../../../shared/sorting/sort-builder.js";

export class ProviderDirectoryRepository {
  async findAndCount(params: {
    profession?: string;
    category?: string | number;
    experience?: number;
    languages?: string;
    availability?: string;
    district?: number;
    panchayat?: number;
    verified?: boolean;
    status?: string;
    sortBy?: string;
    branchId?: string;
    limit: number;
    offset: number;
  }) {
    let query = db
      .select({
        provider: serviceProviders,
        profile: profiles,
        member: members,
        category: serviceCategories,
        district: districts,
        panchayat: panchayats,
        analytics: providerAnalytics,
      })
      .from(serviceProviders)
      .leftJoin(profiles, eq(serviceProviders.profileId, profiles.id))
      .leftJoin(members, eq(serviceProviders.memberId, members.id))
      .leftJoin(serviceCategories, eq(serviceProviders.serviceCategoryId, serviceCategories.id))
      .leftJoin(districts, eq(members.districtId, districts.id))
      .leftJoin(panchayats, eq(members.panchayatId, panchayats.id))
      .leftJoin(providerAnalytics, eq(serviceProviders.id, providerAnalytics.providerId));

    const filters = buildProviderFilters(params);
    const whereClause = and(...filters);

    const orderSpecs: any[] = [];
    if (params.branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${params.branchId} then 0 else 1 end`);
    }
    const sortOrder = buildSortOrder(params.sortBy || "newest", serviceProviders, {
      analyticsTable: providerAnalytics,
      nameColumn: profiles.fullName,
    });
    if (Array.isArray(sortOrder)) {
      orderSpecs.push(...sortOrder);
    } else {
      orderSpecs.push(sortOrder);
    }

    const data = await query
      .where(whereClause)
      .orderBy(...orderSpecs)
      .limit(params.limit)
      .offset(params.offset);

    // Count query
    const [countResult] = await db
      .select({ count: sql<number>`count(${serviceProviders.id})` })
      .from(serviceProviders)
      .leftJoin(members, eq(serviceProviders.memberId, members.id))
      .leftJoin(serviceCategories, eq(serviceProviders.serviceCategoryId, serviceCategories.id))
      .where(whereClause);

    const total = Number(countResult?.count || 0);

    return { data, total };
  }

  async findById(id: string) {
    const [result] = await db
      .select({
        provider: serviceProviders,
        profile: profiles,
        member: members,
        category: serviceCategories,
        district: districts,
        panchayat: panchayats,
        analytics: providerAnalytics,
      })
      .from(serviceProviders)
      .leftJoin(profiles, eq(serviceProviders.profileId, profiles.id))
      .leftJoin(members, eq(serviceProviders.memberId, members.id))
      .leftJoin(serviceCategories, eq(serviceProviders.serviceCategoryId, serviceCategories.id))
      .leftJoin(districts, eq(members.districtId, districts.id))
      .leftJoin(panchayats, eq(members.panchayatId, panchayats.id))
      .leftJoin(providerAnalytics, eq(serviceProviders.id, providerAnalytics.providerId))
      .where(and(eq(serviceProviders.id, id), isNull(serviceProviders.deletedAt)));

    return result;
  }

  async findByCategorySlug(slug: string, params: { limit: number; offset: number; branchId?: string }) {
    const [category] = await db
      .select()
      .from(serviceCategories)
      .where(and(eq(serviceCategories.slug, slug), isNull(serviceCategories.deletedAt)));

    if (!category) return { data: [], total: 0, category: null };

    const result = await this.findAndCount({
      category: category.slug,
      limit: params.limit,
      offset: params.offset,
      branchId: params.branchId,
    });

    return { ...result, category };
  }
}
