import { CategoryRepository } from "./repository.js";

const categoryRepo = new CategoryRepository();

export class CategoryService {
  async getActiveCategories() {
    return await categoryRepo.findActive();
  }

  async getAllCategories() {
    return await categoryRepo.findAll();
  }

  async createCategory(data: any) {
    const existingSlug = await categoryRepo.findBySlug(data.slug);
    if (existingSlug) {
      throw new Error("Category with this slug already exists");
    }

    return await categoryRepo.create(data);
  }

  async updateCategory(id: number, data: any) {
    const existing = await categoryRepo.findById(id);
    if (!existing) {
      throw new Error("Category not found");
    }

    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await categoryRepo.findBySlug(data.slug);
      if (existingSlug) {
        throw new Error("Category with this slug already exists");
      }
    }

    return await categoryRepo.update(id, data);
  }

  async deleteCategory(id: number) {
    const existing = await categoryRepo.findById(id);
    if (!existing) {
      throw new Error("Category not found");
    }

    return await categoryRepo.softDelete(id);
  }
}
