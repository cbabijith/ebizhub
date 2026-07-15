import { db } from "../../../config/database.js";
import { businessServices } from "../../../database/schema.js";
import { eq, and, isNull, count } from "drizzle-orm";

export class ServiceRepository {
  async create(data: any) {
    const [result] = await db.insert(businessServices).values(data).returning();
    return result;
  }

  async update(id: string, data: any) {
    const [result] = await db
      .update(businessServices)
      .set(data)
      .where(eq(businessServices.id, id))
      .returning();
    return result;
  }

  async softDelete(id: string) {
    const [result] = await db
      .update(businessServices)
      .set({ deletedAt: new Date(), status: "inactive" })
      .where(eq(businessServices.id, id))
      .returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(businessServices)
      .where(and(eq(businessServices.id, id), isNull(businessServices.deletedAt)));
    return result;
  }

  async findByBusinessId(businessId: string) {
    return await db
      .select()
      .from(businessServices)
      .where(and(eq(businessServices.businessId, businessId), isNull(businessServices.deletedAt)))
      .orderBy(businessServices.displayOrder);
  }

  async countServices(businessId: string): Promise<number> {
    const [result] = await db
      .select({ val: count() })
      .from(businessServices)
      .where(and(eq(businessServices.businessId, businessId), isNull(businessServices.deletedAt)));
    return result?.val || 0;
  }
}
