import { TrendingRepository } from "./repository.js";
import { validateBranch } from "../branch-val.js";
import { CacheService } from "../../../shared/cache/cache.js";
import { mapBusinessToDto, mapProviderToDto } from "../dto.js";

const repo = new TrendingRepository();

function periodToDays(period: string): number {
  switch (period) {
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
    default: return 30;
  }
}

export class TrendingService {
  async getTrendingCombined(period: string = "30d", limit: number = 10, branchId?: string) {
    await validateBranch(branchId);
    const cacheKey = CacheService.generateKey("trending:combined", { period, limit, branchId });
    const cached = CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const days = periodToDays(period);
    const [biz, prov] = await Promise.all([
      repo.findTrendingBusinesses(days, limit, branchId),
      repo.findTrendingProviders(days, limit, branchId),
    ]);

    const result = {
      businesses: biz.map(mapBusinessToDto),
      providers: prov.map(mapProviderToDto),
      meta: { period, limit, branchId },
    };

    CacheService.set(cacheKey, result, 15 * 60); // 15 mins TTL
    return result;
  }

  async getTrendingBusinesses(period: string = "30d", limit: number = 10, branchId?: string) {
    await validateBranch(branchId);
    const cacheKey = CacheService.generateKey("trending:businesses", { period, limit, branchId });
    const cached = CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const days = periodToDays(period);
    const raw = await repo.findTrendingBusinesses(days, limit, branchId);
    const result = raw.map(mapBusinessToDto);

    CacheService.set(cacheKey, result, 15 * 60);
    return result;
  }

  async getTrendingProviders(period: string = "30d", limit: number = 10, branchId?: string) {
    await validateBranch(branchId);
    const cacheKey = CacheService.generateKey("trending:providers", { period, limit, branchId });
    const cached = CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const days = periodToDays(period);
    const raw = await repo.findTrendingProviders(days, limit, branchId);
    const result = raw.map(mapProviderToDto);

    CacheService.set(cacheKey, result, 15 * 60);
    return result;
  }
}
