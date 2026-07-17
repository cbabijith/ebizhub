import { BusinessDirectoryRepository } from "./repository.js";
import { validateBranch } from "../branch-val.js";
import { mapBusinessToDto } from "../dto.js";

const repo = new BusinessDirectoryRepository();

export class BusinessDirectoryService {
  async getBusinesses(params: any) {
    await validateBranch(params.branchId);

    const { data, total } = await repo.findAndCount({
      category: params.category || undefined,
      district: params.district ? parseInt(params.district, 10) : undefined,
      panchayat: params.panchayat ? parseInt(params.panchayat, 10) : undefined,
      branch: params.branch === "true" || params.branch === true,
      verified: params.verified === "true" || params.verified === true,
      featured: params.featured === "true" || params.featured === true,
      status: params.status || "active",
      sortBy: params.sort || params.sortBy || "newest",
      branchId: params.branchId || undefined,
      limit: params.limit,
      offset: params.offset,
    });

    return {
      businesses: data.map(mapBusinessToDto),
      total,
    };
  }

  async getBusinessById(id: string) {
    const item = await repo.findById(id);
    if (!item) {
      throw new Error("Business not found");
    }
    return mapBusinessToDto(item);
  }

  async getBusinessesByCategorySlug(slug: string, pagination: any) {
    await validateBranch(pagination.branchId);

    const { data, total, category } = await repo.findByCategorySlug(slug, {
      ...pagination,
      branchId: pagination.branchId || undefined,
    });
    if (!category) {
      throw new Error("Category not found");
    }
    return {
      category,
      businesses: data.map(mapBusinessToDto),
      total,
    };
  }
}
