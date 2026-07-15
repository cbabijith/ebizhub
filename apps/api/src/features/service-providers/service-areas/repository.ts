import { db } from "../../../config/database.js";
import { serviceProviderAreas, districts, panchayats } from "../../../database/schema.js";
import { eq, and, isNull } from "drizzle-orm";

export class AreaRepository {
  async create(data: any) {
    const [result] = await db.insert(serviceProviderAreas).values(data).returning();
    return result;
  }

  async delete(id: number) {
    const [result] = await db
      .update(serviceProviderAreas)
      .set({ deletedAt: new Date() })
      .where(eq(serviceProviderAreas.id, id))
      .returning();
    return result;
  }

  async findById(id: number) {
    const [result] = await db
      .select()
      .from(serviceProviderAreas)
      .where(and(eq(serviceProviderAreas.id, id), isNull(serviceProviderAreas.deletedAt)));
    return result;
  }

  async findByProvider(providerId: string) {
    return await db
      .select({
        id: serviceProviderAreas.id,
        providerId: serviceProviderAreas.providerId,
        districtId: serviceProviderAreas.districtId,
        districtName: districts.name,
        panchayatId: serviceProviderAreas.panchayatId,
        panchayatName: panchayats.name,
        createdAt: serviceProviderAreas.createdAt,
      })
      .from(serviceProviderAreas)
      .leftJoin(districts, eq(serviceProviderAreas.districtId, districts.id))
      .leftJoin(panchayats, eq(serviceProviderAreas.panchayatId, panchayats.id))
      .where(and(eq(serviceProviderAreas.providerId, providerId), isNull(serviceProviderAreas.deletedAt)));
  }

  async findByProviderAndLocation(providerId: string, districtId: number, panchayatId: number | null) {
    const [result] = await db
      .select()
      .from(serviceProviderAreas)
      .where(
        and(
          eq(serviceProviderAreas.providerId, providerId),
          eq(serviceProviderAreas.districtId, districtId),
          panchayatId ? eq(serviceProviderAreas.panchayatId, panchayatId) : isNull(serviceProviderAreas.panchayatId),
          isNull(serviceProviderAreas.deletedAt)
        )
      );
    return result;
  }
}
