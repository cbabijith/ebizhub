import { db } from "../../../config/database.js";
import {
  businesses,
  businessCategories,
  districts,
  panchayats,
  businessAnalytics,
  businessServices,
  businessProducts,
  serviceProviders,
  profiles,
  serviceCategories,
  providerAnalytics,
  serviceProviderSkills,
  searchAnalytics,
  serviceProviderAreas,
  communityNews,
  events,
  jobs,
  offers,
  notices,
} from "../../../database/schema.js";
import { members } from "../../../database/schema/member.js";
import { eq, and, isNull, sql, or, ilike, desc, gte, asc, inArray } from "drizzle-orm";
import { buildBusinessFilters } from "../../../shared/filters/business-filters.js";
import { buildProviderFilters } from "../../../shared/filters/provider-filters.js";
import { buildSortOrder } from "../../../shared/sorting/sort-builder.js";

export class SearchRepository {
  async searchBusinesses(q: string, params: any) {
    let baseQuery = db
      .select({
        business: {
          id: businesses.id,
          businessName: businesses.businessName,
          slug: businesses.slug,
          description: businesses.description,
          logo: businesses.logo,
          coverImage: businesses.coverImage,
          address: businesses.address,
          isFeatured: businesses.isFeatured,
          verificationStatus: businesses.verificationStatus,
        },
        category: {
          id: businessCategories.id,
          name: businessCategories.name,
          slug: businessCategories.slug,
        },
        district: {
          id: districts.id,
          name: districts.name,
        },
        panchayat: {
          id: panchayats.id,
          name: panchayats.name,
        },
        analytics: {
          profileViews: businessAnalytics.profileViews,
        },
      })
      .from(businesses)
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .leftJoin(districts, eq(businesses.districtId, districts.id))
      .leftJoin(panchayats, eq(businesses.panchayatId, panchayats.id))
      .leftJoin(businessAnalytics, eq(businesses.id, businessAnalytics.businessId))
      .leftJoin(members, eq(businesses.ownerId, members.profileId));

    if (q) {
      baseQuery = baseQuery
        .leftJoin(businessServices, eq(businesses.id, businessServices.businessId))
        .leftJoin(businessProducts, eq(businesses.id, businessProducts.businessId)) as any;
    }

    const filters = buildBusinessFilters(params);

    if (q) {
      filters.push(
        or(
          ilike(businesses.businessName, `%${q}%`),
          ilike(businesses.description, `%${q}%`),
          ilike(businessCategories.name, `%${q}%`),
          ilike(businessServices.name, `%${q}%`),
          ilike(businessProducts.name, `%${q}%`)
        ) as any
      );
    }

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

    const results = await baseQuery
      .where(whereClause)
      .groupBy(
        businesses.id,
        businessCategories.id,
        districts.id,
        panchayats.id,
        businessAnalytics.id
      )
      .orderBy(...orderSpecs);

    return results;
  }

  async searchProviders(q: string, params: any) {
    const hasAreaFilter = params.district !== undefined || params.panchayat !== undefined;

    let baseQuery = db
      .select({
        provider: {
          id: serviceProviders.id,
          profession: serviceProviders.profession,
          experience: serviceProviders.experience,
          bio: serviceProviders.bio,
          qualification: serviceProviders.qualification,
          languages: serviceProviders.languages,
          availability: serviceProviders.availability,
          serviceRadius: serviceProviders.serviceRadius,
          isFeatured: serviceProviders.isFeatured,
          verificationStatus: serviceProviders.verificationStatus,
        },
        profile: {
          fullName: profiles.fullName,
          avatar: profiles.avatar,
        },
        category: {
          id: serviceCategories.id,
          name: serviceCategories.name,
          slug: serviceCategories.slug,
        },
        district: {
          id: districts.id,
          name: districts.name,
        },
        panchayat: {
          id: panchayats.id,
          name: panchayats.name,
        },
        analytics: {
          profileViews: providerAnalytics.profileViews,
        },
      })
      .from(serviceProviders)
      .leftJoin(profiles, eq(serviceProviders.profileId, profiles.id))
      .leftJoin(members, eq(serviceProviders.memberId, members.id))
      .leftJoin(serviceCategories, eq(serviceProviders.serviceCategoryId, serviceCategories.id))
      .leftJoin(districts, eq(members.districtId, districts.id))
      .leftJoin(panchayats, eq(members.panchayatId, panchayats.id))
      .leftJoin(providerAnalytics, eq(serviceProviders.id, providerAnalytics.providerId));

    if (q) {
      baseQuery = baseQuery.leftJoin(serviceProviderSkills, eq(serviceProviders.id, serviceProviderSkills.providerId)) as any;
    }

    if (hasAreaFilter) {
      baseQuery = baseQuery.leftJoin(serviceProviderAreas, eq(serviceProviders.id, serviceProviderAreas.providerId)) as any;
    }

    const filters = buildProviderFilters(params, hasAreaFilter);

    if (hasAreaFilter) {
      if (params.district !== undefined) {
        filters.push(eq(serviceProviderAreas.districtId, params.district));
      }
      if (params.panchayat !== undefined) {
        filters.push(eq(serviceProviderAreas.panchayatId, params.panchayat));
      }
    }

    if (q) {
      filters.push(
        or(
          ilike(profiles.fullName, `%${q}%`),
          ilike(serviceProviders.profession, `%${q}%`),
          ilike(serviceProviderSkills.skillName, `%${q}%`),
          ilike(serviceProviders.qualification, `%${q}%`),
          ilike(serviceProviders.bio, `%${q}%`)
        ) as any
      );
    }

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

    const results = await baseQuery
      .where(whereClause)
      .groupBy(
        serviceProviders.id,
        profiles.id,
        members.id,
        serviceCategories.id,
        districts.id,
        panchayats.id,
        providerAnalytics.id
      )
      .orderBy(...orderSpecs);

    const providerIds = results.map(r => r.provider.id);
    if (providerIds.length === 0) {
      return [];
    }

    const allSkills = await db
      .select({ providerId: serviceProviderSkills.providerId, skillName: serviceProviderSkills.skillName })
      .from(serviceProviderSkills)
      .where(and(inArray(serviceProviderSkills.providerId, providerIds), isNull(serviceProviderSkills.deletedAt)));

    const skillsMap = new Map<string, Array<{ skillName: string }>>();
    for (const skill of allSkills) {
      if (!skillsMap.has(skill.providerId)) {
        skillsMap.set(skill.providerId, []);
      }
      skillsMap.get(skill.providerId)!.push({ skillName: skill.skillName });
    }

    return results.map(r => ({
      ...r,
      skills: skillsMap.get(r.provider.id) || [],
    }));
  }

  async searchCategories(q: string) {
    if (!q) return [];
    
    const [bizCats, provCats] = await Promise.all([
      db
        .select()
        .from(businessCategories)
        .where(
          and(
            eq(businessCategories.status, "active"),
            isNull(businessCategories.deletedAt),
            ilike(businessCategories.name, `%${q}%`)
          )
        ),
      db
        .select()
        .from(serviceCategories)
        .where(
          and(
            eq(serviceCategories.status, "active"),
            isNull(serviceCategories.deletedAt),
            ilike(serviceCategories.name, `%${q}%`)
          )
        ),
    ]);

    return [
      ...bizCats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, type: "business" })),
      ...provCats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, type: "provider" })),
    ];
  }

  async searchNews(q: string, branchId?: string) {
    if (!q) return [];
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(communityNews.publishedAt));

    const conditions = [
      isNull(communityNews.deletedAt),
      eq(communityNews.status, "published"),
      or(
        ilike(communityNews.title, `%${q}%`),
        ilike(communityNews.summary, `%${q}%`)
      )
    ];

    if (branchId) {
      conditions.push(or(eq(members.branchId, branchId), isNull(members.branchId)) as any);
    }

    return db
      .select({
        id: communityNews.id,
        title: communityNews.title,
        slug: communityNews.slug,
        summary: communityNews.summary,
        content: communityNews.content,
        featuredImage: communityNews.featuredImage,
        gallery: communityNews.gallery,
        categoryId: communityNews.categoryId,
        tags: communityNews.tags,
        publishedAt: communityNews.publishedAt,
        viewCount: communityNews.viewCount,
        shareCount: communityNews.shareCount,
      })
      .from(communityNews)
      .leftJoin(members, eq(communityNews.authorId, members.profileId))
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(20);
  }

  async searchEvents(q: string, branchId?: string) {
    if (!q) return [];
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${events.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(asc(events.startDate));

    const conditions = [
      isNull(events.deletedAt),
      or(eq(events.status, "upcoming"), eq(events.status, "ongoing")),
      or(
        ilike(events.title, `%${q}%`),
        ilike(events.description, `%${q}%`)
      )
    ];

    if (branchId) {
      conditions.push(or(eq(events.branchId, branchId), isNull(events.branchId)) as any);
    }

    return db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(20);
  }

  async searchJobs(q: string, branchId?: string) {
    if (!q) return [];
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(jobs.createdAt));

    const conditions = [
      isNull(jobs.deletedAt),
      eq(jobs.status, "active"),
      or(
        ilike(jobs.title, `%${q}%`),
        ilike(jobs.description, `%${q}%`)
      )
    ];

    if (branchId) {
      conditions.push(or(eq(members.branchId, branchId), isNull(members.branchId)) as any);
    }

    return db
      .select({
        id: jobs.id,
        businessId: jobs.businessId,
        businessName: businesses.businessName,
        title: jobs.title,
        description: jobs.description,
        employmentType: jobs.employmentType,
        salaryFrom: jobs.salaryFrom,
        salaryTo: jobs.salaryTo,
        experience: jobs.experience,
        qualification: jobs.qualification,
        location: jobs.location,
        skills: jobs.skills,
        vacancies: jobs.vacancies,
        closingDate: jobs.closingDate,
        status: jobs.status,
      })
      .from(jobs)
      .leftJoin(businesses, eq(jobs.businessId, businesses.id))
      .leftJoin(members, eq(businesses.ownerId, members.profileId))
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(20);
  }

  async searchOffers(q: string, branchId?: string) {
    if (!q) return [];
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(offers.createdAt));

    const conditions = [
      isNull(offers.deletedAt),
      eq(offers.status, "active"),
      gte(offers.validTo, new Date()),
      or(
        ilike(offers.title, `%${q}%`),
        ilike(offers.description, `%${q}%`)
      )
    ];

    if (branchId) {
      conditions.push(or(eq(members.branchId, branchId), isNull(members.branchId)) as any);
    }

    return db
      .select({
        id: offers.id,
        businessId: offers.businessId,
        businessName: businesses.businessName,
        title: offers.title,
        description: offers.description,
        banner: offers.banner,
        discountType: offers.discountType,
        discountValue: offers.discountValue,
        couponCode: offers.couponCode,
        validFrom: offers.validFrom,
        validTo: offers.validTo,
        terms: offers.terms,
        status: offers.status,
        featured: offers.featured,
      })
      .from(offers)
      .leftJoin(businesses, eq(offers.businessId, businesses.id))
      .leftJoin(members, eq(businesses.ownerId, members.profileId))
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(20);
  }

  async searchNotices(q: string, branchId?: string) {
    if (!q) return [];
    const orderSpecs: any[] = [];
    if (branchId) {
      orderSpecs.push(sql`case when ${notices.branchId} = ${branchId} then 0 else 1 end`);
    }
    orderSpecs.push(desc(notices.createdAt));

    const conditions = [
      isNull(notices.deletedAt),
      eq(notices.status, "active"),
      or(
        ilike(notices.title, `%${q}%`),
        ilike(notices.description, `%${q}%`)
      )
    ];

    if (branchId) {
      conditions.push(or(eq(notices.branchId, branchId), isNull(notices.branchId)) as any);
    }

    return db
      .select()
      .from(notices)
      .where(and(...conditions))
      .orderBy(...orderSpecs)
      .limit(20);
  }

  async getSuggestions(q: string, limit: number) {
    const [bizSuggestions, provSuggestions, catSuggestions] = await Promise.all([
      db
        .select({ label: businesses.businessName, category: businessCategories.name })
        .from(businesses)
        .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
        .where(and(eq(businesses.status, "active"), isNull(businesses.deletedAt), ilike(businesses.businessName, `${q}%`)))
        .limit(limit),
      db
        .select({ label: serviceProviders.profession, category: serviceCategories.name })
        .from(serviceProviders)
        .leftJoin(serviceCategories, eq(serviceProviders.serviceCategoryId, serviceCategories.id))
        .where(and(eq(serviceProviders.status, "active"), isNull(serviceProviders.deletedAt), ilike(serviceProviders.profession, `${q}%`)))
        .limit(limit),
      db
        .select({ label: businessCategories.name })
        .from(businessCategories)
        .where(and(eq(businessCategories.status, "active"), isNull(businessCategories.deletedAt), ilike(businessCategories.name, `${q}%`)))
        .limit(limit),
    ]);

    const suggestions: any[] = [];
    bizSuggestions.forEach(b => suggestions.push({ type: "business", label: b.label, category: b.category }));
    provSuggestions.forEach(p => suggestions.push({ type: "provider", label: p.label, category: p.category }));
    catSuggestions.forEach(c => suggestions.push({ type: "category", label: c.label, category: null }));

    const seen = new Set();
    return suggestions
      .filter((s) => {
        if (!s.label) return false;
        const lower = s.label.toLowerCase();
        if (seen.has(lower)) return false;
        seen.add(lower);
        return true;
      })
      .slice(0, limit);
  }

  async trackSearch(keyword: string, counts: { businessCount: number; providerCount: number; categoryCount: number }, ip?: string) {
    try {
      await db.insert(searchAnalytics).values({
        keyword,
        resultCount: counts.businessCount + counts.providerCount + counts.categoryCount,
        businessCount: counts.businessCount,
        providerCount: counts.providerCount,
        categoryCount: counts.categoryCount,
        ip: ip || null,
      });
    } catch (err) {
      // Catch silently as search analytics should never break core search flow
    }
  }

  async getPopularKeywords() {
    const keywords = await db
      .select({ keyword: searchAnalytics.keyword, count: sql<number>`count(*)` })
      .from(searchAnalytics)
      .groupBy(searchAnalytics.keyword)
      .orderBy(desc(sql`count(*)`))
      .limit(5);
    return keywords.map(k => k.keyword);
  }
}
