import { db } from "../../../config/database.js";
import { serviceCategories } from "../../../database/schema.js";
import { eq, and, isNull } from "drizzle-orm";

export class ServiceCategoryRepository {
  async findActive() {
    return await db
      .select()
      .from(serviceCategories)
      .where(and(eq(serviceCategories.status, "active"), isNull(serviceCategories.deletedAt)))
      .orderBy(serviceCategories.sortOrder);
  }

  async findAll() {
    return await db
      .select()
      .from(serviceCategories)
      .where(isNull(serviceCategories.deletedAt))
      .orderBy(serviceCategories.sortOrder);
  }

  async findById(id: number) {
    const [result] = await db
      .select()
      .from(serviceCategories)
      .where(and(eq(serviceCategories.id, id), isNull(serviceCategories.deletedAt)));
    return result;
  }

  async findBySlug(slug: string) {
    const [result] = await db
      .select()
      .from(serviceCategories)
      .where(and(eq(serviceCategories.slug, slug), isNull(serviceCategories.deletedAt)));
    return result;
  }

  async findByName(name: string) {
    const [result] = await db
      .select()
      .from(serviceCategories)
      .where(and(eq(serviceCategories.name, name), isNull(serviceCategories.deletedAt)));
    return result;
  }

  async create(data: any) {
    const [result] = await db.insert(serviceCategories).values(data).returning();
    return result;
  }

  async update(id: number, data: any) {
    const [result] = await db
      .update(serviceCategories)
      .set(data)
      .where(eq(serviceCategories.id, id))
      .returning();
    return result;
  }

  async softDelete(id: number) {
    const [result] = await db
      .update(serviceCategories)
      .set({ deletedAt: new Date(), status: "inactive" })
      .where(eq(serviceCategories.id, id))
      .returning();
    return result;
  }

  async updateStatus(id: number, status: "active" | "inactive") {
    const [result] = await db
      .update(serviceCategories)
      .set({ status })
      .where(eq(serviceCategories.id, id))
      .returning();
    return result;
  }

  async updateSortOrder(id: number, sortOrder: number) {
    const [result] = await db
      .update(serviceCategories)
      .set({ sortOrder })
      .where(eq(serviceCategories.id, id))
      .returning();
    return result;
  }
}
