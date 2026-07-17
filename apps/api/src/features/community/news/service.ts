import { CommunityNewsRepository } from "./repository.js";

export class CommunityNewsService {
  private repo = new CommunityNewsRepository();

  async getPublishedNews(params: { categoryId?: string; q?: string; limit: number; offset: number }) {
    return this.repo.findPublished(params);
  }

  async getAllNewsAdmin(params: { limit: number; offset: number }) {
    return this.repo.findAllAdmin(params);
  }

  async getNewsById(id: string, incrementView = true) {
    const news = await this.repo.findById(id);
    if (!news) throw new Error("News not found");
    if (incrementView) {
      await this.repo.incrementViews(id);
    }
    return news;
  }

  async getNewsBySlug(slug: string) {
    const news = await this.repo.findBySlug(slug);
    if (!news) throw new Error("News not found");
    await this.repo.incrementViews(news.id);
    return news;
  }

  async getPublicNewsById(id: string) {
    const news = await this.getNewsById(id, false);
    if (news.status !== "published") throw new Error("News not found");
    await this.repo.incrementViews(id);
    return news;
  }

  async getPublicNewsBySlug(slug: string) {
    const news = await this.getNewsBySlug(slug);
    if (news.status !== "published") throw new Error("News not found");
    return news;
  }

  async createNews(data: any, userId: string) {
    const existing = await this.repo.findBySlug(data.slug);
    if (existing) throw new Error("Slug must be unique");

    const status = data.status || "draft";
    const published = status === "published";
    const draft = status === "draft";
    const archived = status === "archived";
    const publishedAt = published ? new Date() : null;

    return this.repo.create({
      ...data,
      status,
      draft,
      published,
      archived,
      publishedAt,
      authorId: userId,
      createdBy: userId,
      updatedBy: userId,
    });
  }

  async updateNews(id: string, data: any, userId: string) {
    const news = await this.getNewsById(id, false);
    if (data.slug && data.slug !== news.slug) {
      const existing = await this.repo.findBySlug(data.slug);
      if (existing) throw new Error("Slug must be unique");
    }

    const updates: any = { ...data, updatedBy: userId };
    if (data.status) {
      updates.draft = data.status === "draft";
      updates.published = data.status === "published";
      updates.archived = data.status === "archived";
      if (updates.published && !news.publishedAt) {
        updates.publishedAt = new Date();
      }
    }

    return this.repo.update(id, updates);
  }

  async deleteNews(id: string, userId: string) {
    await this.getNewsById(id, false);
    return this.repo.delete(id, userId);
  }

  async incrementNewsShares(id: string) {
    await this.getNewsById(id, false);
    return this.repo.incrementShares(id);
  }
}
