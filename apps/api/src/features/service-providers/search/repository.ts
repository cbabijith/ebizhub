import { db } from "../../../config/database.js";
import {
  serviceProviders,
  profiles,
  serviceCategories,
  serviceProviderAreas,
  serviceProviderSkills,
} from "../../../database/schema.js";
import { eq, and, isNull, or, ilike, desc } from "drizzle-orm";

export class SearchRepository {
  async searchPublic(filters: {
    q: string;
    page: number;
    limit: number;
    category?: number;
    district?: number;
    panchayat?: number;
    experience?: number;
    availability?: string;
  }) {
    const offset = (filters.page - 1) * filters.limit;

    // Base conditions
    const conditions = [
      eq(serviceProviders.status, "active"),
      eq(serviceProviders.verificationStatus, "verified"),
      isNull(serviceProviders.deletedAt),
    ];

    if (filters.category) {
      conditions.push(eq(serviceProviders.serviceCategoryId, filters.category));
    }
    if (filters.experience) {
      conditions.push(eq(serviceProviders.experience, filters.experience));
    }
    if (filters.availability) {
      conditions.push(eq(serviceProviders.availability, filters.availability));
    }

    // Build the query
    let query = db
      .selectDistinct({
        id: serviceProviders.id,
        name: profiles.fullName,
        avatar: profiles.avatar,
        profession: serviceProviders.profession,
        experience: serviceProviders.experience,
        bio: serviceProviders.bio,
        categoryName: serviceCategories.name,
      })
      .from(serviceProviders)
      .leftJoin(profiles, eq(serviceProviders.profileId, profiles.id))
      .leftJoin(serviceCategories, eq(serviceProviders.serviceCategoryId, serviceCategories.id))
      .leftJoin(serviceProviderSkills, eq(serviceProviders.id, serviceProviderSkills.providerId));

    // Handle service areas search/filter
    if (filters.district || filters.panchayat) {
      query = query.leftJoin(serviceProviderAreas, eq(serviceProviders.id, serviceProviderAreas.providerId)) as any;
      if (filters.district) {
        conditions.push(eq(serviceProviderAreas.districtId, filters.district));
      }
      if (filters.panchayat) {
        conditions.push(eq(serviceProviderAreas.panchayatId, filters.panchayat));
      }
    }

    // Add keyword search
    if (filters.q) {
      const keywordPattern = `%${filters.q}%`;
      conditions.push(
        or(
          ilike(profiles.fullName, keywordPattern),
          ilike(serviceProviders.profession, keywordPattern),
          ilike(serviceProviderSkills.skillName, keywordPattern),
          ilike(serviceCategories.name, keywordPattern)
        ) as any
      );
    }

    return await query
      .where(and(...conditions))
      .limit(filters.limit)
      .offset(offset)
      .orderBy(desc(serviceProviders.createdAt));
  }
}
