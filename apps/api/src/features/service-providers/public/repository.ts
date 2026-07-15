import { db } from "../../../config/database.js";
import {
  serviceProviders,
  profiles,
  members,
  serviceCategories,
  serviceProviderPortfolios,
  serviceProviderAreas,
  serviceProviderSkills,
  districts,
  panchayats,
  providerAnalytics,
  providerInteractionLogs,
} from "../../../database/schema.js";
import { eq, and, isNull, sql, desc } from "drizzle-orm";

export class PublicRepository {
  async findPublicById(id: string) {
    // 1. Get main provider info with profile and category join
    const [provider] = await db
      .select({
        id: serviceProviders.id,
        profileId: serviceProviders.profileId,
        memberId: serviceProviders.memberId,
        serviceCategoryId: serviceProviders.serviceCategoryId,
        categoryName: serviceCategories.name,
        name: profiles.fullName,
        avatar: profiles.avatar,
        profession: serviceProviders.profession,
        experience: serviceProviders.experience,
        bio: serviceProviders.bio,
        phone: serviceProviders.phone,
        qualification: serviceProviders.qualification,
        languages: serviceProviders.languages,
        whatsapp: serviceProviders.whatsapp,
        email: serviceProviders.email,
        availability: serviceProviders.availability,
        serviceRadius: serviceProviders.serviceRadius,
        status: serviceProviders.status,
        verificationStatus: serviceProviders.verificationStatus,
      })
      .from(serviceProviders)
      .leftJoin(profiles, eq(serviceProviders.profileId, profiles.id))
      .leftJoin(serviceCategories, eq(serviceProviders.serviceCategoryId, serviceCategories.id))
      .where(
        and(
          eq(serviceProviders.id, id),
          eq(serviceProviders.status, "active"),
          eq(serviceProviders.verificationStatus, "verified"),
          isNull(serviceProviders.deletedAt)
        )
      );

    if (!provider) return null;

    // 2. Fetch Portfolio showcase
    const portfolio = await db
      .select({
        id: serviceProviderPortfolios.id,
        type: serviceProviderPortfolios.type,
        title: serviceProviderPortfolios.title,
        description: serviceProviderPortfolios.description,
        fileUrl: serviceProviderPortfolios.fileUrl,
        thumbnailUrl: serviceProviderPortfolios.thumbnailUrl,
        sortOrder: serviceProviderPortfolios.sortOrder,
      })
      .from(serviceProviderPortfolios)
      .where(and(eq(serviceProviderPortfolios.providerId, id), isNull(serviceProviderPortfolios.deletedAt)))
      .orderBy(serviceProviderPortfolios.sortOrder);

    // 3. Fetch Service Areas
    const areas = await db
      .select({
        id: serviceProviderAreas.id,
        districtId: serviceProviderAreas.districtId,
        districtName: districts.name,
        panchayatId: serviceProviderAreas.panchayatId,
        panchayatName: panchayats.name,
      })
      .from(serviceProviderAreas)
      .leftJoin(districts, eq(serviceProviderAreas.districtId, districts.id))
      .leftJoin(panchayats, eq(serviceProviderAreas.panchayatId, panchayats.id))
      .where(eq(serviceProviderAreas.providerId, id));

    // 4. Fetch Skills
    const skills = await db
      .select({
        id: serviceProviderSkills.id,
        skillName: serviceProviderSkills.skillName,
        experienceYears: serviceProviderSkills.experienceYears,
        proficiencyLevel: serviceProviderSkills.proficiencyLevel,
      })
      .from(serviceProviderSkills)
      .where(eq(serviceProviderSkills.providerId, id));

    const { profileId, memberId, status, verificationStatus, ...publicFields } = provider;

    return {
      ...publicFields,
      isVerified: verificationStatus === "verified",
      portfolio,
      serviceAreas: areas,
      skills,
    };
  }

  async findAllPublic(filters: {
    page: number;
    limit: number;
    category?: number;
    district?: number;
    panchayat?: number;
    experience?: number;
    availability?: string;
  }) {
    const offset = (filters.page - 1) * filters.limit;

    // Construct dynamic where clauses
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

    // District and Panchayat joins need to filter serviceProviderAreas
    let query = db
      .select({
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
      .leftJoin(serviceCategories, eq(serviceProviders.serviceCategoryId, serviceCategories.id));

    if (filters.district || filters.panchayat) {
      query = query.leftJoin(serviceProviderAreas, eq(serviceProviders.id, serviceProviderAreas.providerId)) as any;
      if (filters.district) {
        conditions.push(eq(serviceProviderAreas.districtId, filters.district));
      }
      if (filters.panchayat) {
        conditions.push(eq(serviceProviderAreas.panchayatId, filters.panchayat));
      }
    }

    return await query
      .where(and(...conditions))
      .limit(filters.limit)
      .offset(offset)
      .orderBy(desc(serviceProviders.createdAt));
  }

  async recordProfileViewTransaction(providerId: string, ip: string | null) {
    return await db.transaction(async (tx) => {
      // 1. Insert into interaction logs
      await tx.insert(providerInteractionLogs).values({
        providerId,
        action: "profile_view",
        ip,
      });

      // 2. Increment counters in provider analytics
      await tx
        .insert(providerAnalytics)
        .values({
          providerId,
          profileViews: 1,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: providerAnalytics.providerId,
          set: {
            profileViews: sql`${providerAnalytics.profileViews} + 1`,
            updatedAt: new Date(),
          },
        });
    });
  }
}
