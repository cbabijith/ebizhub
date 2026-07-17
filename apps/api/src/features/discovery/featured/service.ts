import { FeaturedRepository } from "./repository.js";
import { validateBranch } from "../branch-val.js";
import { CacheService } from "../../../shared/cache/cache.js";
import { mapBusinessToDto, mapProviderToDto } from "../dto.js";

const repo = new FeaturedRepository();

export class FeaturedService {
  async getFeaturedCombined(branchId?: string) {
    await validateBranch(branchId);
    const cacheKey = CacheService.generateKey("featured:combined", { branchId });
    const cached = CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const [businesses, providers] = await Promise.all([
      repo.findFeaturedBusinesses(10, branchId),
      repo.findFeaturedProviders(10, branchId),
    ]);

    const result = {
      businesses: businesses.map(mapBusinessToDto),
      providers: providers.map(mapProviderToDto),
      meta: {
        totalBusinesses: businesses.length,
        totalProviders: providers.length,
        branchId,
      },
    };

    CacheService.set(cacheKey, result, 10 * 60); // 10 mins TTL
    return result;
  }

  async getFeaturedBusinesses(branchId?: string) {
    await validateBranch(branchId);
    const cacheKey = CacheService.generateKey("featured:businesses", { branchId });
    const cached = CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const raw = await repo.findFeaturedBusinesses(10, branchId);
    const result = raw.map(mapBusinessToDto);

    CacheService.set(cacheKey, result, 10 * 60);
    return result;
  }

  async getFeaturedProviders(branchId?: string) {
    await validateBranch(branchId);
    const cacheKey = CacheService.generateKey("featured:providers", { branchId });
    const cached = CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const raw = await repo.findFeaturedProviders(10, branchId);
    const result = raw.map(mapProviderToDto);

    CacheService.set(cacheKey, result, 10 * 60);
    return result;
  }

  // Admin operations
  async createFeatured(data: {
    entityType: "business" | "provider";
    entityId: string;
    priority: number;
    startDate?: string;
    endDate?: string;
    createdBy: string;
  }) {
    const exists = data.entityType === "business"
      ? await repo.businessExists(data.entityId)
      : await repo.providerExists(data.entityId);

    if (!exists) {
      throw { status: 404, message: `${data.entityType} not found or not active` };
    }

    const duplicate = await repo.findActiveDuplicate(data.entityType, data.entityId);
    if (duplicate) {
      throw { status: 409, message: `This ${data.entityType} is already featured` };
    }

    // Invalidate featured cache
    CacheService.deletePattern("featured:");

    return await repo.create({
      entityType: data.entityType,
      entityId: data.entityId,
      priority: data.priority,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      createdBy: data.createdBy,
    });
  }

  async updateFeatured(id: string, data: {
    priority?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }) {
    const existing = await repo.findById(id);
    if (!existing) {
      throw { status: 404, message: "Featured listing not found" };
    }

    const updateData: any = {};
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Invalidate featured cache
    CacheService.deletePattern("featured:");

    return await repo.update(id, updateData);
  }

  async deleteFeatured(id: string) {
    const existing = await repo.findById(id);
    if (!existing) {
      throw { status: 404, message: "Featured listing not found" };
    }

    // Invalidate featured cache
    CacheService.deletePattern("featured:");

    return await repo.softDelete(id);
  }
}
