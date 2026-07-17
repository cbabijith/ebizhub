import { NewsCategoryRepository } from "./repository.js";

export class NewsCategoryService {
  private repo = new NewsCategoryRepository();

  async getActiveCategories() {
    return this.repo.getActive();
  }

  async getAllCategories() {
    return this.repo.getAll();
  }

  async getCategoryById(id: string) {
    const cat = await this.repo.findById(id);
    if (!cat) throw new Error("News category not found");
    return cat;
  }

  async getPublicCategoryById(id: string) {
    const cat = await this.getCategoryById(id);
    if (!cat.isActive) throw new Error("News category not found");
    return cat;
  }

  async createCategory(data: any, userId: string) {
    const existing = await this.repo.findBySlug(data.slug);
    if (existing) throw new Error("Slug must be unique");

    return this.repo.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });
  }

  async updateCategory(id: string, data: any, userId: string) {
    const cat = await this.getCategoryById(id);
    if (data.slug && data.slug !== cat.slug) {
      const existing = await this.repo.findBySlug(data.slug);
      if (existing) throw new Error("Slug must be unique");
    }

    return this.repo.update(id, {
      ...data,
      updatedBy: userId,
    });
  }

  async deleteCategory(id: string, userId: string) {
    await this.getCategoryById(id);
    return this.repo.delete(id, userId);
  }
}
