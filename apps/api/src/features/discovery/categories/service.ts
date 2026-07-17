import { CategoryRepository } from "./repository.js";
import { BusinessDirectoryService } from "../business-directory/service.js";
import { ProviderDirectoryService } from "../provider-directory/service.js";
import { validateBranch } from "../branch-val.js";
import { CacheService } from "../../../shared/cache/cache.js";
import { mapCategoryToDto, mapBusinessToDto, mapProviderToDto } from "../dto.js";

const repo = new CategoryRepository();
const bizService = new BusinessDirectoryService();
const providerService = new ProviderDirectoryService();

export class CategoryService {
  async getPopularCategories(branchId?: string) {
    await validateBranch(branchId);
    const cacheKey = CacheService.generateKey("categories:popular", { branchId });
    const cached = CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const [bizCats, providerCats] = await Promise.all([
      repo.getPopularBusinessCategories(),
      repo.getPopularServiceCategories(),
    ]);

    const result = {
      businessCategories: bizCats.map(mapCategoryToDto),
      serviceCategories: providerCats.map(mapCategoryToDto),
    };

    CacheService.set(cacheKey, result, 30 * 60); // 30 mins TTL
    return result;
  }

  async getCategoryBySlug(slug: string, filters: any, pagination: { limit: number; offset: number; page: number }) {
    await validateBranch(filters.branchId);

    const bizCat = await repo.getBusinessCategoryBySlug(slug);
    if (bizCat) {
      const [businessesData, related] = await Promise.all([
        bizService.getBusinesses({
          ...filters,
          category: slug,
          limit: pagination.limit,
          offset: pagination.offset,
        }),
        repo.getRelatedBusinessCategories(bizCat.id),
      ]);

      return {
        category: {
          id: bizCat.id,
          name: bizCat.name,
          slug: bizCat.slug,
          type: "business",
        },
        businesses: businessesData.businesses,
        providers: [],
        relatedCategories: related.map(c => ({ id: c.id, name: c.name, slug: c.slug, type: "business" })),
        meta: {
          totalBusinesses: businessesData.total,
          totalProviders: 0,
          page: pagination.page,
          limit: pagination.limit,
        },
      };
    }

    const provCat = await repo.getServiceCategoryBySlug(slug);
    if (provCat) {
      const [providersData, related] = await Promise.all([
        providerService.getProviders({
          ...filters,
          category: slug,
          limit: pagination.limit,
          offset: pagination.offset,
        }),
        repo.getRelatedServiceCategories(provCat.id),
      ]);

      return {
        category: {
          id: provCat.id,
          name: provCat.name,
          slug: provCat.slug,
          type: "provider",
        },
        businesses: [],
        providers: providersData.providers,
        relatedCategories: related.map(c => ({ id: c.id, name: c.name, slug: c.slug, type: "provider" })),
        meta: {
          totalBusinesses: 0,
          totalProviders: providersData.total,
          page: pagination.page,
          limit: pagination.limit,
        },
      };
    }

    throw new Error("Category not found");
  }

  async listAllCategories() {
    const cacheKey = "categories:all";
    const cached = CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const [bizCats, provCats] = await Promise.all([
      repo.listBusinessCategories(),
      repo.listServiceCategories(),
    ]);

    const result = [
      ...bizCats.map(c => ({ id: c.id, name: c.name, slug: c.slug, type: "business" })),
      ...provCats.map(c => ({ id: c.id, name: c.name, slug: c.slug, type: "provider" })),
    ].map(mapCategoryToDto);

    CacheService.set(cacheKey, result, 30 * 60); // 30 mins TTL
    return result;
  }
}
