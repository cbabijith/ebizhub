import { db } from "../../../config/database.js";
import { businessCategories, serviceCategories, businesses, serviceProviders, businessAnalytics, providerAnalytics } from "../../../database/schema.js";
import { eq, and, isNull, sql, desc, or } from "drizzle-orm";

export class CategoryRepository {
  async getBusinessCategoryBySlug(slug: string) {
    const [result] = await db
      .select()
      .from(businessCategories)
      .where(and(eq(businessCategories.slug, slug), isNull(businessCategories.deletedAt)));
    return result;
  }

  async getServiceCategoryBySlug(slug: string) {
    const [result] = await db
      .select()
      .from(serviceCategories)
      .where(and(eq(serviceCategories.slug, slug), isNull(serviceCategories.deletedAt)));
    return result;
  }

  async listBusinessCategories() {
    return db
      .select()
      .from(businessCategories)
      .where(and(eq(businessCategories.status, "active"), isNull(businessCategories.deletedAt)));
  }

  async listServiceCategories() {
    return db
      .select()
      .from(serviceCategories)
      .where(and(eq(serviceCategories.status, "active"), isNull(serviceCategories.deletedAt)));
  }

  async getRelatedBusinessCategories(excludeId: number) {
    return db
      .select()
      .from(businessCategories)
      .where(and(eq(businessCategories.status, "active"), isNull(businessCategories.deletedAt), sql`id != ${excludeId}`))
      .limit(5);
  }

  async getRelatedServiceCategories(excludeId: number) {
    return db
      .select()
      .from(serviceCategories)
      .where(and(eq(serviceCategories.status, "active"), isNull(serviceCategories.deletedAt), sql`id != ${excludeId}`))
      .limit(5);
  }

  async getPopularBusinessCategories() {
    // Ranked by count of active verified businesses and total analytics views
    const results = await db
      .select({
        id: businessCategories.id,
        name: businessCategories.name,
        slug: businessCategories.slug,
        businessCount: sql<number>`count(${businesses.id})`,
        totalViews: sql<number>`coalesce(sum(${businessAnalytics.profileViews}), 0)`,
      })
      .from(businessCategories)
      .leftJoin(
        businesses,
        eq(businessCategories.id, businesses.categoryId)
      )
      .leftJoin(
        businessAnalytics,
        eq(businesses.id, businessAnalytics.businessId)
      )
      .where(
        and(
          eq(businessCategories.status, "active"),
          isNull(businessCategories.deletedAt),
          or(isNull(businesses.deletedAt), eq(businesses.status, "active"))
        )
      )
      .groupBy(businessCategories.id)
      .orderBy(desc(sql`count(${businesses.id})`), desc(sql`coalesce(sum(${businessAnalytics.profileViews}), 0)`))
      .limit(10);

    return results.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      businessCount: Number(r.businessCount),
      totalViews: Number(r.totalViews),
    }));
  }

  async getPopularServiceCategories() {
    // Ranked by count of active service providers and total analytics views
    const results = await db
      .select({
        id: serviceCategories.id,
        name: serviceCategories.name,
        slug: serviceCategories.slug,
        providerCount: sql<number>`count(${serviceProviders.id})`,
        totalViews: sql<number>`coalesce(sum(${providerAnalytics.profileViews}), 0)`,
      })
      .from(serviceCategories)
      .leftJoin(
        serviceProviders,
        eq(serviceCategories.id, serviceProviders.serviceCategoryId)
      )
      .leftJoin(
        providerAnalytics,
        eq(serviceProviders.id, providerAnalytics.providerId)
      )
      .where(
        and(
          eq(serviceCategories.status, "active"),
          isNull(serviceCategories.deletedAt),
          or(isNull(serviceProviders.deletedAt), eq(serviceProviders.status, "active"))
        )
      )
      .groupBy(serviceCategories.id)
      .orderBy(desc(sql`count(${serviceProviders.id})`), desc(sql`coalesce(sum(${providerAnalytics.profileViews}), 0)`))
      .limit(10);

    return results.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      providerCount: Number(r.providerCount),
      totalViews: Number(r.totalViews),
    }));
  }
}
