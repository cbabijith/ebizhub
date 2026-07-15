import { db } from "../../../config/database.js";
import { businessProducts } from "../../../database/schema.js";
import { eq, and, isNull, count } from "drizzle-orm";

export class ProductRepository {
  async create(data: any) {
    const [result] = await db.insert(businessProducts).values(data).returning();
    return result;
  }

  async update(id: string, data: any) {
    const [result] = await db
      .update(businessProducts)
      .set(data)
      .where(eq(businessProducts.id, id))
      .returning();
    return result;
  }

  async softDelete(id: string) {
    const [result] = await db
      .update(businessProducts)
      .set({ deletedAt: new Date(), status: "inactive" })
      .where(eq(businessProducts.id, id))
      .returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(businessProducts)
      .where(and(eq(businessProducts.id, id), isNull(businessProducts.deletedAt)));
    return result;
  }

  async findByBusinessId(businessId: string) {
    return await db
      .select()
      .from(businessProducts)
      .where(and(eq(businessProducts.businessId, businessId), isNull(businessProducts.deletedAt)))
      .orderBy(businessProducts.displayOrder);
  }

  async countProducts(businessId: string): Promise<number> {
    const [result] = await db
      .select({ val: count() })
      .from(businessProducts)
      .where(and(eq(businessProducts.businessId, businessId), isNull(businessProducts.deletedAt)));
    return result?.val || 0;
  }
}
