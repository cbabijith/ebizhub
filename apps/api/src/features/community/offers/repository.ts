import { db } from "../../../config/database.js";
import { offers, businesses } from "../../../database/schema.js";
import { eq, and, isNull, gte, lte, desc, sql, SQL } from "drizzle-orm";

export class OfferRepository {
  async findOffers(params: {
    businessId?: string;
    status?: string;
    featured?: boolean;
    limit: number;
    offset: number;
  }) {
    const conditions: SQL[] = [isNull(offers.deletedAt)];

    if (params.businessId) {
      conditions.push(eq(offers.businessId, params.businessId));
    }
    if (params.status) {
      if (params.status === "active") {
        conditions.push(eq(offers.status, "active"));
        conditions.push(gte(offers.validTo, new Date()));
      } else {
        conditions.push(eq(offers.status, params.status as any));
      }
    }
    if (params.featured !== undefined) {
      conditions.push(eq(offers.featured, params.featured));
    }

    return db
      .select({
        id: offers.id,
        businessId: offers.businessId,
        businessName: businesses.businessName,
        title: offers.title,
        description: offers.description,
        banner: offers.banner,
        discountType: offers.discountType,
        discountValue: offers.discountValue,
        couponCode: offers.couponCode,
        validFrom: offers.validFrom,
        validTo: offers.validTo,
        terms: offers.terms,
        status: offers.status,
        featured: offers.featured,
        createdAt: offers.createdAt,
      })
      .from(offers)
      .leftJoin(businesses, eq(offers.businessId, businesses.id))
      .where(and(...conditions))
      .orderBy(desc(offers.createdAt))
      .limit(params.limit)
      .offset(params.offset);
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(offers)
      .where(and(eq(offers.id, id), isNull(offers.deletedAt)));
    return result;
  }

  async create(data: any) {
    const [result] = await db.insert(offers).values(data).returning();
    return result;
  }

  async update(id: string, data: any) {
    const [result] = await db
      .update(offers)
      .set({ ...data, updatedAt: new Date(), version: sql`version + 1` })
      .where(and(eq(offers.id, id), isNull(offers.deletedAt)))
      .returning();
    return result;
  }

  async delete(id: string, userId: string) {
    const [result] = await db
      .update(offers)
      .set({
        deletedAt: new Date(),
        updatedBy: userId,
        status: "inactive",
        updatedAt: new Date(),
        version: sql`version + 1`,
      })
      .where(and(eq(offers.id, id), isNull(offers.deletedAt)))
      .returning();
    return result;
  }

  async getBusinessById(businessId: string) {
    const [result] = await db
      .select()
      .from(businesses)
      .where(and(eq(businesses.id, businessId), isNull(businesses.deletedAt)));
    return result;
  }
}
