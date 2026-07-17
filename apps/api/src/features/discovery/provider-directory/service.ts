import { ProviderDirectoryRepository } from "./repository.js";
import { db } from "../../../config/database.js";
import { serviceProviderSkills, serviceProviderPortfolios, serviceProviderAreas, districts } from "../../../database/schema.js";
import { eq, and, isNull } from "drizzle-orm";
import { validateBranch } from "../branch-val.js";
import { mapProviderToDto } from "../dto.js";

const repo = new ProviderDirectoryRepository();

export class ProviderDirectoryService {
  async getProviders(params: any) {
    await validateBranch(params.branchId);

    const { data, total } = await repo.findAndCount({
      profession: params.profession || undefined,
      category: params.category || undefined,
      experience: params.experience ? parseInt(params.experience, 10) : undefined,
      languages: params.languages || undefined,
      availability: params.availability || undefined,
      district: params.district ? parseInt(params.district, 10) : undefined,
      panchayat: params.panchayat ? parseInt(params.panchayat, 10) : undefined,
      verified: params.verified === "true" || params.verified === true,
      status: params.status || "active",
      sortBy: params.sort || params.sortBy || "newest",
      branchId: params.branchId || undefined,
      limit: params.limit,
      offset: params.offset,
    });

    return {
      providers: data.map(mapProviderToDto),
      total,
    };
  }

  async getProviderById(id: string) {
    const item = await repo.findById(id);
    if (!item) {
      throw new Error("Service provider not found");
    }

    const [skills, portfolios, areas] = await Promise.all([
      db
        .select()
        .from(serviceProviderSkills)
        .where(and(eq(serviceProviderSkills.providerId, id), isNull(serviceProviderSkills.deletedAt))),
      db
        .select()
        .from(serviceProviderPortfolios)
        .where(and(eq(serviceProviderPortfolios.providerId, id), isNull(serviceProviderPortfolios.deletedAt))),
      db
        .select({
          id: serviceProviderAreas.id,
          districtId: serviceProviderAreas.districtId,
          districtName: districts.name,
        })
        .from(serviceProviderAreas)
        .leftJoin(districts, eq(serviceProviderAreas.districtId, districts.id))
        .where(and(eq(serviceProviderAreas.providerId, id), isNull(serviceProviderAreas.deletedAt))),
    ]);

    const mapped = mapProviderToDto(item);
    return {
      ...mapped,
      skills: skills.map(s => ({ id: s.id, skillName: s.skillName })),
      portfolios: portfolios.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        fileUrl: p.fileUrl,
        type: p.type,
      })),
      serviceAreas: areas.map(a => ({
        id: a.id,
        districtId: a.districtId,
        districtName: a.districtName,
      })),
    };
  }

  async getProvidersByCategorySlug(slug: string, pagination: any) {
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
      providers: data.map(mapProviderToDto),
      total,
    };
  }
}
