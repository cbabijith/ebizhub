import { db } from "../../../config/database.js";
import { serviceProviderPortfolios } from "../../../database/schema.js";
import { eq, and, isNull, count } from "drizzle-orm";

export class PortfolioRepository {
  async create(data: any) {
    const [result] = await db.insert(serviceProviderPortfolios).values(data).returning();
    return result;
  }

  async update(id: string, data: any) {
    const [result] = await db
      .update(serviceProviderPortfolios)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(serviceProviderPortfolios.id, id))
      .returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(serviceProviderPortfolios)
      .where(and(eq(serviceProviderPortfolios.id, id), isNull(serviceProviderPortfolios.deletedAt)));
    return result;
  }

  async findByProvider(providerId: string) {
    return await db
      .select()
      .from(serviceProviderPortfolios)
      .where(and(eq(serviceProviderPortfolios.providerId, providerId), isNull(serviceProviderPortfolios.deletedAt)))
      .orderBy(serviceProviderPortfolios.sortOrder);
  }

  async countByProvider(providerId: string): Promise<number> {
    const [result] = await db
      .select({ val: count() })
      .from(serviceProviderPortfolios)
      .where(and(eq(serviceProviderPortfolios.providerId, providerId), isNull(serviceProviderPortfolios.deletedAt)));
    return result?.val || 0;
  }

  async softDelete(id: string) {
    const [result] = await db
      .update(serviceProviderPortfolios)
      .set({ deletedAt: new Date() })
      .where(eq(serviceProviderPortfolios.id, id))
      .returning();
    return result;
  }
}
