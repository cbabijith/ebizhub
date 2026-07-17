import { FeaturedRepository } from "../featured/repository.js";
import { RecentRepository } from "../recent/repository.js";
import { TrendingRepository } from "../trending/repository.js";
import { PopularCategoriesRepository } from "../popular-categories/repository.js";
import { db } from "../../../config/database.js";
import {
  banners,
  communityNews,
  events,
  offers,
  jobs,
  notices,
  businesses,
} from "../../../database/schema.js";
import { members } from "../../../database/schema/member.js";
import { eq, and, isNull, or, lte, gte, asc, desc, sql } from "drizzle-orm";
import { validateBranch } from "../branch-val.js";
import { CacheService } from "../../../shared/cache/cache.js";
import {
  mapBusinessToDto,
  mapProviderToDto,
  mapCategoryToDto,
  mapNewsToDto,
  mapEventToDto,
  mapJobToDto,
  mapOfferToDto,
  mapNoticeToDto,
  mapBannerToDto,
} from "../dto.js";

const featuredRepo = new FeaturedRepository();
const recentRepo = new RecentRepository();
const trendingRepo = new TrendingRepository();
const popularCategoriesRepo = new PopularCategoriesRepository();

export class HomeService {
  async getHomeDashboard(limit: number = 5, branchId?: string) {
    await validateBranch(branchId);
    const cacheKey = CacheService.generateKey("home:dashboard", { limit, branchId });
    const cached = CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const now = new Date();

    const bannerOrder: any[] = [asc(banners.priority)];

    const newsOrder: any[] = [];
    if (branchId) {
      newsOrder.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    newsOrder.push(desc(communityNews.publishedAt));

    const eventOrder: any[] = [];
    if (branchId) {
      eventOrder.push(sql`case when ${events.branchId} = ${branchId} then 0 else 1 end`);
    }
    eventOrder.push(asc(events.startDate));

    const offerOrder: any[] = [];
    if (branchId) {
      offerOrder.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    offerOrder.push(desc(offers.createdAt));

    const jobOrder: any[] = [];
    if (branchId) {
      jobOrder.push(sql`case when ${members.branchId} = ${branchId} then 0 else 1 end`);
    }
    jobOrder.push(desc(jobs.createdAt));

    const noticeOrder: any[] = [];
    if (branchId) {
      noticeOrder.push(sql`case when ${notices.branchId} = ${branchId} then 0 else 1 end`);
    }
    noticeOrder.push(desc(notices.priority), desc(notices.createdAt));

    const [
      featuredBusinesses,
      featuredProviders,
      recentBusinesses,
      recentProviders,
      trendingBusinesses,
      trendingProviders,
      popularBusinessCategories,
      popularServiceCategories,
      recentlyVerifiedBusinesses,
      recentlyVerifiedProviders,
      topBanners,
      featuredNews,
      upcomingEvents,
      latestOffers,
      latestJobs,
      communityNotices,
    ] = await Promise.all([
      featuredRepo.findFeaturedBusinesses(limit, branchId),
      featuredRepo.findFeaturedProviders(limit, branchId),
      recentRepo.findRecentBusinesses(limit, branchId),
      recentRepo.findRecentProviders(limit, branchId),
      trendingRepo.findTrendingBusinesses(30, limit, branchId),
      trendingRepo.findTrendingProviders(30, limit, branchId),
      popularCategoriesRepo.findPopularBusinessCategories(limit),
      popularCategoriesRepo.findPopularServiceCategories(limit),
      recentRepo.findRecentlyVerifiedBusinesses(limit, branchId),
      recentRepo.findRecentlyVerifiedProviders(limit, branchId),
      // Banners
      db
        .select()
        .from(banners)
        .where(
          and(
            eq(banners.isActive, true),
            isNull(banners.deletedAt),
            or(isNull(banners.startDate), lte(banners.startDate, now)),
            or(isNull(banners.endDate), gte(banners.endDate, now))
          )
        )
        .orderBy(...bannerOrder)
        .limit(limit),
      // Featured News
      db
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
        .where(
          and(
            eq(communityNews.status, "published"),
            eq(communityNews.featured, true),
            isNull(communityNews.deletedAt)
          )
        )
        .orderBy(...newsOrder)
        .limit(limit),
      // Upcoming Events
      db
        .select()
        .from(events)
        .where(
          and(
            eq(events.status, "upcoming"),
            isNull(events.deletedAt),
            gte(events.startDate, now)
          )
        )
        .orderBy(...eventOrder)
        .limit(limit),
      // Latest Offers
      db
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
        .where(
          and(
            eq(offers.status, "active"),
            isNull(offers.deletedAt),
            gte(offers.validTo, now)
          )
        )
        .orderBy(...offerOrder)
        .limit(limit),
      // Latest Jobs
      db
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
        .where(and(eq(jobs.status, "active"), isNull(jobs.deletedAt)))
        .orderBy(...jobOrder)
        .limit(limit),
      // Community Notices
      db
        .select()
        .from(notices)
        .where(and(eq(notices.status, "active"), isNull(notices.deletedAt)))
        .orderBy(...noticeOrder)
        .limit(limit),
    ]);

    const result = {
      topBanners: topBanners.map(mapBannerToDto),
      featuredNews: featuredNews.map(mapNewsToDto),
      upcomingEvents: upcomingEvents.map(mapEventToDto),
      featuredBusinesses: featuredBusinesses.map(mapBusinessToDto),
      featuredProviders: featuredProviders.map(mapProviderToDto),
      latestOffers: latestOffers.map(mapOfferToDto),
      latestJobs: latestJobs.map(mapJobToDto),
      communityNotices: communityNotices.map(mapNoticeToDto),
      recentBusinesses: recentBusinesses.map(mapBusinessToDto),
      recentProviders: recentProviders.map(mapProviderToDto),
      trendingBusinesses: trendingBusinesses.map(mapBusinessToDto),
      trendingProviders: trendingProviders.map(mapProviderToDto),
      popularCategories: {
        businessCategories: popularBusinessCategories.map(mapCategoryToDto),
        serviceCategories: popularServiceCategories.map(mapCategoryToDto),
      },
      recentlyVerifiedBusinesses: recentlyVerifiedBusinesses.map(mapBusinessToDto),
      recentlyVerifiedProviders: recentlyVerifiedProviders.map(mapProviderToDto),
      meta: { limit, branchId },
    };

    CacheService.set(cacheKey, result, 5 * 60); // 5 mins TTL
    return result;
  }
}
