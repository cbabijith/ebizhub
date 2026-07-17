import { PopularCategoriesRepository } from "./repository.js";
import { validateBranch } from "../branch-val.js";
import { CacheService } from "../../../shared/cache/cache.js";
import { mapCategoryToDto } from "../dto.js";

const repo = new PopularCategoriesRepository();

export class PopularCategoriesService {
  async getPopularCategories(limit: number = 10, branchId?: string) {
    await validateBranch(branchId);
    const cacheKey = CacheService.generateKey("popular-categories:list", { limit, branchId });
    const cached = CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const [businessCategories, serviceCategories] = await Promise.all([
      repo.findPopularBusinessCategories(limit, branchId),
      repo.findPopularServiceCategories(limit, branchId),
    ]);

    const result = {
      businessCategories: businessCategories.map(mapCategoryToDto),
      serviceCategories: serviceCategories.map(mapCategoryToDto),
      meta: { limit, branchId },
    };

    CacheService.set(cacheKey, result, 30 * 60); // 30 mins TTL
    return result;
  }
}
