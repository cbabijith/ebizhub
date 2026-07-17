import { RecommendationsRepository } from "./repository.js";
import { validateBranch } from "../branch-val.js";
import { CacheService } from "../../../shared/cache/cache.js";
import { mapBusinessToDto, mapProviderToDto } from "../dto.js";

const repo = new RecommendationsRepository();

export class RecommendationsService {
  async getRecommendations(type: "business" | "provider", id: string, limit: number = 10, branchId?: string) {
    await validateBranch(branchId);
    const cacheKey = CacheService.generateKey("recommendations:list", { type, id, limit, branchId });
    const cached = CacheService.get<any>(cacheKey);
    if (cached) return cached;

    let result: any;
    if (type === "business") {
      result = await this.getBusinessRecommendations(id, limit, branchId);
    } else {
      result = await this.getProviderRecommendations(id, limit, branchId);
    }

    CacheService.set(cacheKey, result, 10 * 60); // 10 mins TTL
    return result;
  }

  private async getBusinessRecommendations(id: string, limit: number, branchId?: string) {
    const business = await repo.findBusinessById(id);
    if (!business) {
      throw { status: 404, message: "Business not found" };
    }

    const collected: any[] = [];
    const seenIds = new Set<string>([id]);

    // 1. Same category — top 5
    const sameCategory = await repo.findBusinessesByCategory(business.categoryId, id, 5, branchId);
    for (const item of sameCategory) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        collected.push({ ...item, matchReason: "same_category" });
      }
    }

    // 2. Same district — top 3
    if (business.districtId) {
      const sameDistrict = await repo.findBusinessesByDistrict(
        business.districtId,
        Array.from(seenIds),
        3,
        branchId
      );
      for (const item of sameDistrict) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          collected.push({ ...item, matchReason: "same_district" });
        }
      }
    }

    // 3. Recently added — top 2
    const recent = await repo.findRecentBusinesses(Array.from(seenIds), 2, branchId);
    for (const item of recent) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        collected.push({ ...item, matchReason: "recent" });
      }
    }

    const recommendations = collected.slice(0, limit).map(mapBusinessToDto);

    return {
      recommendations,
      meta: {
        type: "business" as const,
        sourceId: id,
        total: Math.min(collected.length, limit),
        branchId,
      },
    };
  }

  private async getProviderRecommendations(id: string, limit: number, branchId?: string) {
    const provider = await repo.findProviderById(id);
    if (!provider) {
      throw { status: 404, message: "Provider not found" };
    }

    const collected: any[] = [];
    const seenIds = new Set<string>([id]);

    // 1. Same service category — top 5
    const sameCategory = await repo.findProvidersByCategory(provider.serviceCategoryId, id, 5, branchId);
    for (const item of sameCategory) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        collected.push({ ...item, matchReason: "same_category" });
      }
    }

    // 2. Same profession — top 3
    const sameProfession = await repo.findProvidersByProfession(
      provider.profession,
      Array.from(seenIds),
      3,
      branchId
    );
    for (const item of sameProfession) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        collected.push({ ...item, matchReason: "same_profession" });
      }
    }

    // 3. Same skills — top 2
    const skills = await repo.findProviderSkills(id);
    if (skills.length > 0) {
      const sameSkills = await repo.findProvidersBySkills(skills, Array.from(seenIds), 2, branchId);
      for (const item of sameSkills) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          collected.push({ ...item, matchReason: "same_skill" });
        }
      }
    }

    const recommendations = collected.slice(0, limit).map(mapProviderToDto);

    return {
      recommendations,
      meta: {
        type: "provider" as const,
        sourceId: id,
        total: Math.min(collected.length, limit),
        branchId,
      },
    };
  }
}
