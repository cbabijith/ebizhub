import { RecentRepository } from "./repository.js";
import { validateBranch } from "../branch-val.js";
import { CacheService } from "../../../shared/cache/cache.js";
import { mapBusinessToDto, mapProviderToDto } from "../dto.js";

const repo = new RecentRepository();

export class RecentService {
  async getRecent(limit: number = 10, type?: "business" | "provider", branchId?: string) {
    await validateBranch(branchId);
    const cacheKey = CacheService.generateKey("recent:all", { limit, type, branchId });
    const cached = CacheService.get<any>(cacheKey);
    if (cached) return cached;

    let businesses: any[] = [];
    let providers: any[] = [];

    if (!type || type === "business") {
      const raw = await repo.findRecentBusinesses(limit, branchId);
      businesses = raw.map(mapBusinessToDto);
    }
    if (!type || type === "provider") {
      const raw = await repo.findRecentProviders(limit, branchId);
      providers = raw.map(mapProviderToDto);
    }

    const result = {
      businesses,
      providers,
      meta: {
        totalBusinesses: businesses.length,
        totalProviders: providers.length,
        limit,
        branchId,
      },
    };

    CacheService.set(cacheKey, result, 10 * 60); // 10 mins TTL
    return result;
  }

  async getRecentlyVerified(limit: number = 10, type?: "business" | "provider", branchId?: string) {
    await validateBranch(branchId);
    const cacheKey = CacheService.generateKey("recent:verified", { limit, type, branchId });
    const cached = CacheService.get<any>(cacheKey);
    if (cached) return cached;

    let businesses: any[] = [];
    let providers: any[] = [];

    if (!type || type === "business") {
      const raw = await repo.findRecentlyVerifiedBusinesses(limit, branchId);
      businesses = raw.map(mapBusinessToDto);
    }
    if (!type || type === "provider") {
      const raw = await repo.findRecentlyVerifiedProviders(limit, branchId);
      providers = raw.map(mapProviderToDto);
    }

    const result = {
      businesses,
      providers,
      meta: {
        totalBusinesses: businesses.length,
        totalProviders: providers.length,
        limit,
        branchId,
      },
    };

    CacheService.set(cacheKey, result, 10 * 60);
    return result;
  }
}
