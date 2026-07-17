import { SearchRepository } from "./repository.js";
import { computeBusinessScore, computeProviderScore } from "../../../shared/ranking/scorer.js";
import { CategoryService } from "../categories/service.js";
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
} from "../dto.js";

const repo = new SearchRepository();
const catService = new CategoryService();

export class SearchService {
  async search(q: string, params: any, pagination: { page: number; limit: number; offset: number }, ip?: string) {
    await validateBranch(params.branchId);

    if (!q) {
      const popularCats = await catService.getPopularCategories();
      const suggestions = {
        similarCategories: [
          ...popularCats.businessCategories.slice(0, 3).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, type: "business" })),
          ...popularCats.serviceCategories.slice(0, 2).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, type: "provider" })),
        ],
        popularKeywords: ["electrician", "grocery", "photographer"],
      };

      return {
        businesses: [],
        providers: [],
        categories: [],
        news: [],
        events: [],
        jobs: [],
        offers: [],
        notices: [],
        meta: {
          query: "",
          totalBusinesses: 0,
          totalProviders: 0,
          totalCategories: 0,
          totalNews: 0,
          totalEvents: 0,
          totalJobs: 0,
          totalOffers: 0,
          totalNotices: 0,
          page: pagination.page,
          limit: pagination.limit,
          suggestions,
        },
      };
    }

    const [rawBiz, rawProv, rawCats, rawNews, rawEvents, rawJobs, rawOffers, rawNotices] = await Promise.all([
      repo.searchBusinesses(q, params),
      repo.searchProviders(q, params),
      repo.searchCategories(q),
      repo.searchNews(q, params.branchId),
      repo.searchEvents(q, params.branchId),
      repo.searchJobs(q, params.branchId),
      repo.searchOffers(q, params.branchId),
      repo.searchNotices(q, params.branchId),
    ]);

    const scoredBiz = rawBiz
      .map(item => {
        const score = computeBusinessScore(item.business, q);
        return {
          ...item,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);

    const scoredProv = rawProv
      .map(item => {
        const score = computeProviderScore(
          {
            ...item.provider,
            fullName: item.profile?.fullName,
            skills: item.skills,
          },
          q
        );
        return {
          ...item,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);

    const paginatedBiz = scoredBiz.slice(pagination.offset, pagination.offset + pagination.limit);
    const paginatedProv = scoredProv.slice(pagination.offset, pagination.offset + pagination.limit);
    const paginatedCats = rawCats.slice(pagination.offset, pagination.offset + pagination.limit);

    const totalBiz = scoredBiz.length;
    const totalProv = scoredProv.length;
    const totalCats = rawCats.length;

    repo.trackSearch(
      q,
      {
        businessCount: totalBiz,
        providerCount: totalProv,
        categoryCount: totalCats,
      },
      ip
    );

    let suggestions: any = null;
    if (totalBiz === 0 && totalProv === 0 && totalCats === 0) {
      const words = q.split(/\s+/).filter(Boolean);
      let similarCategories: any[] = [];

      if (words.length > 0) {
        const allCats = await catService.listAllCategories();
        similarCategories = allCats.filter((cat: any) =>
          words.some(word => cat.name.toLowerCase().includes(word.toLowerCase()))
        );
      }

      if (similarCategories.length === 0) {
        const popularCats = await catService.getPopularCategories();
        similarCategories = [
          ...popularCats.businessCategories.slice(0, 3).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, type: "business" })),
          ...popularCats.serviceCategories.slice(0, 2).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, type: "provider" })),
        ];
      }

      let popularKeywords = await repo.getPopularKeywords();
      if (popularKeywords.length === 0) {
        popularKeywords = ["electrician", "grocery", "photographer"];
      }

      suggestions = {
        similarCategories: similarCategories.slice(0, 5).map(mapCategoryToDto),
        popularKeywords,
      };
    }

    return {
      businesses: paginatedBiz.map(this.mapBusinessWithRelations).map(mapBusinessToDto),
      providers: paginatedProv.map(this.mapProviderWithRelations).map(mapProviderToDto),
      categories: paginatedCats.map(mapCategoryToDto),
      news: rawNews.slice(pagination.offset, pagination.offset + pagination.limit).map(mapNewsToDto),
      events: rawEvents.slice(pagination.offset, pagination.offset + pagination.limit).map(mapEventToDto),
      jobs: rawJobs.slice(pagination.offset, pagination.offset + pagination.limit).map(mapJobToDto),
      offers: rawOffers.slice(pagination.offset, pagination.offset + pagination.limit).map(mapOfferToDto),
      notices: rawNotices.slice(pagination.offset, pagination.offset + pagination.limit).map(mapNoticeToDto),
      meta: {
        query: q,
        totalBusinesses: totalBiz,
        totalProviders: totalProv,
        totalCategories: totalCats,
        totalNews: rawNews.length,
        totalEvents: rawEvents.length,
        totalJobs: rawJobs.length,
        totalOffers: rawOffers.length,
        totalNotices: rawNotices.length,
        page: pagination.page,
        limit: pagination.limit,
        suggestions,
      },
    };
  }

  async getSuggestions(q: string, limit: number) {
    const cacheKey = CacheService.generateKey("search:suggestions", { q, limit });
    const cached = CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const result = await repo.getSuggestions(q, limit);
    CacheService.set(cacheKey, result, 10 * 60); // 10 mins TTL
    return result;
  }

  private mapBusinessWithRelations(item: any) {
    const b = item.business;
    return {
      id: b.id,
      businessName: b.businessName,
      name: b.businessName,
      slug: b.slug,
      description: b.description,
      logo: b.logo,
      coverImage: b.coverImage,
      address: b.address,
      isFeatured: b.isFeatured,
      isVerified: b.verificationStatus === "verified",
      category: item.category ? {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
      } : null,
      district: item.district ? {
        id: item.district.id,
        name: item.district.name,
      } : null,
      panchayat: item.panchayat ? {
        id: item.panchayat.id,
        name: item.panchayat.name,
      } : null,
      views: item.analytics?.profileViews || 0,
    };
  }

  private mapProviderWithRelations(item: any) {
    const sp = item.provider;
    const prof = item.profile;
    return {
      id: sp.id,
      profession: sp.profession,
      experience: sp.experience,
      bio: sp.bio,
      qualification: sp.qualification,
      languages: sp.languages,
      availability: sp.availability,
      serviceRadius: sp.serviceRadius,
      isFeatured: sp.isFeatured,
      isVerified: sp.verificationStatus === "verified",
      fullName: prof?.fullName || "",
      avatar: prof?.avatar || null,
      category: item.category ? {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
      } : null,
      district: item.district ? {
        id: item.district.id,
        name: item.district.name,
      } : null,
      panchayat: item.panchayat ? {
        id: item.panchayat.id,
        name: item.panchayat.name,
      } : null,
      skills: item.skills || [],
      views: item.analytics?.profileViews || 0,
    };
  }
}
