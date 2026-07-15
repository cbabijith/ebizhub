import { db } from "../../../config/database.js";
import { businessCategories } from "../../../database/schema.js";
import { eq, and, isNull } from "drizzle-orm";

export class CategoryRepository {
  async findActive() {
    return await db
      .select()
      .from(businessCategories)
      .where(and(eq(businessCategories.status, "active"), isNull(businessCategories.deletedAt)))
      .orderBy(businessCategories.sortOrder);
  }

  async findAll() {
    return await db
      .select()
      .from(businessCategories)
      .where(isNull(businessCategories.deletedAt))
      .orderBy(businessCategories.sortOrder);
  }

  async findById(id: number) {
    const [result] = await db
      .select()
      .from(businessCategories)
      .where(and(eq(businessCategories.id, id), isNull(businessCategories.deletedAt)));
    return result;
  }

  async findBySlug(slug: string) {
    const [result] = await db
      .select()
      .from(businessCategories)
      .where(and(eq(businessCategories.slug, slug), isNull(businessCategories.deletedAt)));
    return result;
  }

  async create(data: any) {
    const [result] = await db.insert(businessCategories).values(data).returning();
    return result;
  }

  async update(id: number, data: any) {
    const [result] = await db
      .update(businessCategories)
      .set(data)
      .where(eq(businessCategories.id, id))
      .returning();
    return result;
  }

  async softDelete(id: number) {
    const [result] = await db
      .update(businessCategories)
      .set({ deletedAt: new Date(), status: "inactive" })
      .where(eq(businessCategories.id, id))
      .returning();
    return result;
  }

  async findByName(name: string) {
    const [result] = await db
      .select()
      .from(businessCategories)
      .where(and(eq(businessCategories.name, name), isNull(businessCategories.deletedAt)));
    return result;
  }

  async updateStatus(id: number, status: "active" | "inactive") {
    const [result] = await db
      .update(businessCategories)
      .set({ status })
      .where(eq(businessCategories.id, id))
      .returning();
    return result;
  }

  async updateSortOrder(id: number, sortOrder: number) {
    const [result] = await db
      .update(businessCategories)
      .set({ sortOrder })
      .where(eq(businessCategories.id, id))
      .returning();
    return result;
  }
}

