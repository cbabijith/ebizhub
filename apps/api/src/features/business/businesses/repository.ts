import { db } from "../../../config/database.js";
import { businesses, businessCategories } from "../../../database/schema.js";
import { eq, and, isNull } from "drizzle-orm";

export class BusinessRepository {
  async create(data: any) {
    const [result] = await db.insert(businesses).values(data).returning();
    return result;
  }

  async update(id: string, data: any) {
    const [result] = await db
      .update(businesses)
      .set(data)
      .where(eq(businesses.id, id))
      .returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await db
      .select({
        id: businesses.id,
        ownerId: businesses.ownerId,
        categoryId: businesses.categoryId,
        categoryName: businessCategories.name,
        businessName: businesses.businessName,
        slug: businesses.slug,
        description: businesses.description,
        phone: businesses.phone,
        whatsapp: businesses.whatsapp,
        email: businesses.email,
        website: businesses.website,
        logo: businesses.logo,
        coverImage: businesses.coverImage,
        address: businesses.address,
        districtId: businesses.districtId,
        panchayatId: businesses.panchayatId,
        latitude: businesses.latitude,
        longitude: businesses.longitude,
        googleMapsUrl: businesses.googleMapsUrl,
        workingHours: businesses.workingHours,
        gstNumber: businesses.gstNumber,
        registrationNumber: businesses.registrationNumber,
        establishedYear: businesses.establishedYear,
        verificationStatus: businesses.verificationStatus,
        status: businesses.status,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
      })
      .from(businesses)
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .where(and(eq(businesses.id, id), isNull(businesses.deletedAt)));
    return result;
  }

  async findBySlug(slug: string) {
    const [result] = await db
      .select()
      .from(businesses)
      .where(and(eq(businesses.slug, slug), isNull(businesses.deletedAt)));
    return result;
  }

  async findByOwnerId(ownerId: string) {
    return await db
      .select()
      .from(businesses)
      .where(and(eq(businesses.ownerId, ownerId), isNull(businesses.deletedAt)));
  }

  async softDelete(id: string) {
    const [result] = await db
      .update(businesses)
      .set({ deletedAt: new Date(), status: "inactive" })
      .where(eq(businesses.id, id))
      .returning();
    return result;
  }
}
