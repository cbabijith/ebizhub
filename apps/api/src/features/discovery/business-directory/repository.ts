import { db } from "../../../config/database.js";
import { businesses, businessCategories, districts, panchayats, businessAnalytics, members } from "../../../database/schema.js";
import { eq, and, isNull, sql } from "drizzle-orm";
import { buildBusinessFilters } from "../../../shared/filters/business-filters.js";
import { buildSortOrder } from "../../../shared/sorting/sort-builder.js";

export class BusinessDirectoryRepository {
  async findAndCount(params: {
    category?: string | number;
    district?: number;
    panchayat?: number;
    branch?: boolean;
    verified?: boolean;
    featured?: boolean;
    status?: string;
    sortBy?: string;
    branchId?: string;
    limit: number;
    offset: number;
  }) {
    let query = db
      .select({
        business: businesses,
        category: businessCategories,
        district: districts,
        panchayat: panchayats,
        analytics: businessAnalytics,
      })
      .from(businesses)
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .leftJoin(districts, eq(businesses.districtId, districts.id))
      .leftJoin(panchayats, eq(businesses.panchayatId, panchayats.id))
      .leftJoin(businessAnalytics, eq(businesses.id, businessAnalytics.businessId))
      .leftJoin(members, eq(businesses.ownerId, members.profileId));

    const filters = buildBusinessFilters(params);
    const whereClause = and(...filters);
    
    const orderSpecs: any[] = [];
    if (params.branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${params.branchId} then 0 else 1 end`);
    }
    const sortOrder = buildSortOrder(params.sortBy || "newest", businesses, { analyticsTable: businessAnalytics });
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
      .select({ count: sql<number>`count(${businesses.id})` })
      .from(businesses)
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .leftJoin(members, eq(businesses.ownerId, members.profileId))
      .where(whereClause);

    const total = Number(countResult?.count || 0);

    return { data, total };
  }

  async findById(id: string) {
    const [result] = await db
      .select({
        business: businesses,
        category: businessCategories,
        district: districts,
        panchayat: panchayats,
        analytics: businessAnalytics,
      })
      .from(businesses)
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .leftJoin(districts, eq(businesses.districtId, districts.id))
      .leftJoin(panchayats, eq(businesses.panchayatId, panchayats.id))
      .leftJoin(businessAnalytics, eq(businesses.id, businessAnalytics.businessId))
      .where(and(eq(businesses.id, id), isNull(businesses.deletedAt)));

    return result;
  }

  async findByCategorySlug(slug: string, params: { limit: number; offset: number; branchId?: string }) {
    const [category] = await db
      .select()
      .from(businessCategories)
      .where(and(eq(businessCategories.slug, slug), isNull(businessCategories.deletedAt)));

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
