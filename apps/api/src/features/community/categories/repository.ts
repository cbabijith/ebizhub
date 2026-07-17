import { db } from "../../../config/database.js";
import { newsCategories } from "../../../database/schema.js";
import { eq, and, isNull, asc, sql } from "drizzle-orm";

export class NewsCategoryRepository {
  async getActive() {
    return db
      .select({
        id: newsCategories.id,
        name: newsCategories.name,
        slug: newsCategories.slug,
        icon: newsCategories.icon,
        image: newsCategories.image,
        description: newsCategories.description,
        sortOrder: newsCategories.sortOrder,
        isActive: newsCategories.isActive,
      })
      .from(newsCategories)
      .where(and(isNull(newsCategories.deletedAt), eq(newsCategories.isActive, true)))
      .orderBy(asc(newsCategories.sortOrder));
  }

  async getAll() {
    return db
      .select()
      .from(newsCategories)
      .where(isNull(newsCategories.deletedAt))
      .orderBy(asc(newsCategories.sortOrder));
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(newsCategories)
      .where(and(eq(newsCategories.id, id), isNull(newsCategories.deletedAt)));
    return result;
  }

  async findBySlug(slug: string) {
    const [result] = await db
      .select()
      .from(newsCategories)
      .where(and(eq(newsCategories.slug, slug), isNull(newsCategories.deletedAt)));
    return result;
  }

  async create(data: any) {
    const [result] = await db.insert(newsCategories).values(data).returning();
    return result;
  }

  async update(id: string, data: any) {
    const [result] = await db
      .update(newsCategories)
      .set({ ...data, updatedAt: new Date(), version: sql`version + 1` })
      .where(and(eq(newsCategories.id, id), isNull(newsCategories.deletedAt)))
      .returning();
    return result;
  }

  async delete(id: string, userId: string) {
    const [result] = await db
      .update(newsCategories)
      .set({
        deletedAt: new Date(),
        updatedBy: userId,
        isActive: false,
        updatedAt: new Date(),
        version: sql`version + 1`,
      })
      .where(and(eq(newsCategories.id, id), isNull(newsCategories.deletedAt)))
      .returning();
    return result;
  }
}
