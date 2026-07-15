import { ServiceCategoryRepository } from "./repository.js";
import { db } from "../../../config/database.js";
import { serviceCategories } from "../../../database/schema.js";
import { eq } from "drizzle-orm";

const categoryRepo = new ServiceCategoryRepository();

export class ServiceCategoryService {
  async getActiveCategories() {
    return await categoryRepo.findActive();
  }

  async getAllCategories() {
    return await categoryRepo.findAll();
  }

  async createCategory(data: any) {
    // Duplicate name check
    const existingName = await categoryRepo.findByName(data.name);
    if (existingName) {
      throw new Error("Category name already exists");
    }

    // Auto-slug generation if not provided
    let slug = data.slug;
    if (!slug) {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    }

    const existingSlug = await categoryRepo.findBySlug(slug);
    if (existingSlug) {
      throw new Error("Category with this slug already exists");
    }

    return await categoryRepo.create({
      ...data,
      slug,
    });
  }

  async updateCategory(id: number, data: any) {
    const existing = await categoryRepo.findById(id);
    if (!existing) {
      throw new Error("Category not found");
    }

    // Duplicate name check
    if (data.name && data.name !== existing.name) {
      const existingName = await categoryRepo.findByName(data.name);
      if (existingName && existingName.id !== id) {
        throw new Error("Category name already exists");
      }
    }

    // Auto-slug generation
    let slug = data.slug;
    if (data.name && !slug) {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    }

    if (slug && slug !== existing.slug) {
      const existingSlug = await categoryRepo.findBySlug(slug);
      if (existingSlug && existingSlug.id !== id) {
        throw new Error("Category with this slug already exists");
      }
    }

    return await categoryRepo.update(id, {
      ...data,
      ...(slug ? { slug } : {}),
    });
  }

  async deleteCategory(id: number) {
    const existing = await categoryRepo.findById(id);
    if (!existing) {
      throw new Error("Category not found");
    }
    return await categoryRepo.softDelete(id);
  }

  async activateCategory(id: number) {
    const existing = await categoryRepo.findById(id);
    if (!existing) {
      throw new Error("Category not found");
    }
    return await categoryRepo.updateStatus(id, "active");
  }

  async deactivateCategory(id: number) {
    const existing = await categoryRepo.findById(id);
    if (!existing) {
      throw new Error("Category not found");
    }
    return await categoryRepo.updateStatus(id, "inactive");
  }

  async reorderCategories(categories: { id: number; sortOrder: number }[]) {
    return await db.transaction(async (tx) => {
      const results = [];
      for (const item of categories) {
        const [updated] = await tx
          .update(serviceCategories)
          .set({ sortOrder: item.sortOrder })
          .where(eq(serviceCategories.id, item.id))
          .returning();
        if (updated) {
          results.push(updated);
        }
      }
      return results;
    });
  }
}
