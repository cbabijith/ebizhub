import { db } from "../../../config/database.js";
import { serviceProviders, serviceCategories } from "../../../database/schema.js";
import { eq, and, isNull } from "drizzle-orm";

export class ProviderRepository {
  async create(data: any) {
    const [result] = await db.insert(serviceProviders).values(data).returning();
    return result;
  }

  async update(id: string, data: any) {
    const [result] = await db
      .update(serviceProviders)
      .set(data)
      .where(eq(serviceProviders.id, id))
      .returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await db
      .select({
        id: serviceProviders.id,
        profileId: serviceProviders.profileId,
        memberId: serviceProviders.memberId,
        serviceCategoryId: serviceProviders.serviceCategoryId,
        categoryName: serviceCategories.name,
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
        createdAt: serviceProviders.createdAt,
        updatedAt: serviceProviders.updatedAt,
      })
      .from(serviceProviders)
      .leftJoin(serviceCategories, eq(serviceProviders.serviceCategoryId, serviceCategories.id))
      .where(and(eq(serviceProviders.id, id), isNull(serviceProviders.deletedAt)));
    return result;
  }

  async findByMemberId(memberId: string) {
    const [result] = await db
      .select()
      .from(serviceProviders)
      .where(and(eq(serviceProviders.memberId, memberId), isNull(serviceProviders.deletedAt)));
    return result;
  }

  async findAll() {
    return await db
      .select()
      .from(serviceProviders)
      .where(isNull(serviceProviders.deletedAt))
      .orderBy(serviceProviders.createdAt);
  }

  async softDelete(id: string) {
    const [result] = await db
      .update(serviceProviders)
      .set({ deletedAt: new Date(), status: "inactive" })
      .where(eq(serviceProviders.id, id))
      .returning();
    return result;
  }

  async updateStatus(id: string, status: "active" | "inactive" | "suspended") {
    const [result] = await db
      .update(serviceProviders)
      .set({ status, updatedAt: new Date() })
      .where(eq(serviceProviders.id, id))
      .returning();
    return result;
  }
}
