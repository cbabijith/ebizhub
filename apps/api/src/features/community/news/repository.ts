import { db } from "../../../config/database.js";
import { communityNews, newsCategories, profiles } from "../../../database/schema.js";
import { eq, and, isNull, sql, desc, asc, ne, or } from "drizzle-orm";

export class CommunityNewsRepository {
  async findPublished(params: { categoryId?: string; q?: string; limit: number; offset: number }) {
    let whereClause = and(
      isNull(communityNews.deletedAt),
      eq(communityNews.status, "published")
    );

    if (params.categoryId) {
      whereClause = and(whereClause, eq(communityNews.categoryId, params.categoryId));
    }

    if (params.q) {
      whereClause = and(
        whereClause,
        or(
          sql`${communityNews.title} ILIKE ${"%" + params.q + "%"}`,
          sql`${communityNews.summary} ILIKE ${"%" + params.q + "%"}`
        )
      );
    }

    return db
      .select({
        id: communityNews.id,
        title: communityNews.title,
        slug: communityNews.slug,
        summary: communityNews.summary,
        content: communityNews.content,
        featuredImage: communityNews.featuredImage,
        gallery: communityNews.gallery,
        categoryId: communityNews.categoryId,
        categoryName: newsCategories.name,
        tags: communityNews.tags,
        authorId: communityNews.authorId,
        authorName: profiles.fullName,
        featured: communityNews.featured,
        isPinned: communityNews.isPinned,
        publishedAt: communityNews.publishedAt,
        viewCount: communityNews.viewCount,
        shareCount: communityNews.shareCount,
        createdAt: communityNews.createdAt,
      })
      .from(communityNews)
      .leftJoin(newsCategories, eq(communityNews.categoryId, newsCategories.id))
      .leftJoin(profiles, eq(communityNews.authorId, profiles.id))
      .where(whereClause)
      .orderBy(desc(communityNews.isPinned), desc(communityNews.publishedAt), desc(communityNews.createdAt))
      .limit(params.limit)
      .offset(params.offset);
  }

  async findAllAdmin(params: { limit: number; offset: number }) {
    return db
      .select()
      .from(communityNews)
      .where(isNull(communityNews.deletedAt))
      .orderBy(desc(communityNews.createdAt))
      .limit(params.limit)
      .offset(params.offset);
  }

  async findById(id: string) {
    const [result] = await db
      .select({
        id: communityNews.id,
        title: communityNews.title,
        slug: communityNews.slug,
        summary: communityNews.summary,
        content: communityNews.content,
        featuredImage: communityNews.featuredImage,
        gallery: communityNews.gallery,
        categoryId: communityNews.categoryId,
        categoryName: newsCategories.name,
        tags: communityNews.tags,
        authorId: communityNews.authorId,
        authorName: profiles.fullName,
        status: communityNews.status,
        featured: communityNews.featured,
        isPinned: communityNews.isPinned,
        publishedAt: communityNews.publishedAt,
        viewCount: communityNews.viewCount,
        shareCount: communityNews.shareCount,
        createdAt: communityNews.createdAt,
        updatedAt: communityNews.updatedAt,
      })
      .from(communityNews)
      .leftJoin(newsCategories, eq(communityNews.categoryId, newsCategories.id))
      .leftJoin(profiles, eq(communityNews.authorId, profiles.id))
      .where(and(eq(communityNews.id, id), isNull(communityNews.deletedAt)));
    return result;
  }

  async findBySlug(slug: string) {
    const [result] = await db
      .select({
        id: communityNews.id,
        title: communityNews.title,
        slug: communityNews.slug,
        summary: communityNews.summary,
        content: communityNews.content,
        featuredImage: communityNews.featuredImage,
        gallery: communityNews.gallery,
        categoryId: communityNews.categoryId,
        categoryName: newsCategories.name,
        tags: communityNews.tags,
        authorId: communityNews.authorId,
        authorName: profiles.fullName,
        status: communityNews.status,
        featured: communityNews.featured,
        isPinned: communityNews.isPinned,
        publishedAt: communityNews.publishedAt,
        viewCount: communityNews.viewCount,
        shareCount: communityNews.shareCount,
        createdAt: communityNews.createdAt,
      })
      .from(communityNews)
      .leftJoin(newsCategories, eq(communityNews.categoryId, newsCategories.id))
      .leftJoin(profiles, eq(communityNews.authorId, profiles.id))
      .where(and(eq(communityNews.slug, slug), isNull(communityNews.deletedAt)));
    return result;
  }

  async create(data: any) {
    const [result] = await db.insert(communityNews).values(data).returning();
    return result;
  }

  async update(id: string, data: any) {
    const [result] = await db
      .update(communityNews)
      .set({ ...data, updatedAt: new Date(), version: sql`version + 1` })
      .where(and(eq(communityNews.id, id), isNull(communityNews.deletedAt)))
      .returning();
    return result;
  }

  async delete(id: string, userId: string) {
    const [result] = await db
      .update(communityNews)
      .set({
        deletedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
        version: sql`version + 1`,
      })
      .where(and(eq(communityNews.id, id), isNull(communityNews.deletedAt)))
      .returning();
    return result;
  }

  async incrementViews(id: string) {
    return db
      .update(communityNews)
      .set({ viewCount: sql`${communityNews.viewCount} + 1` })
      .where(eq(communityNews.id, id));
  }

  async incrementShares(id: string) {
    return db
      .update(communityNews)
      .set({ shareCount: sql`${communityNews.shareCount} + 1` })
      .where(eq(communityNews.id, id));
  }
}
