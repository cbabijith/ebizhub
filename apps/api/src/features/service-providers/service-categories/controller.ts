import { Context } from "hono";
import { ServiceCategoryService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const categoryService = new ServiceCategoryService();

export class ServiceCategoryController {
  async getActive(c: Context) {
    try {
      const result = await categoryService.getActiveCategories();
      return successResponse(c, "Active categories retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve categories", [err.message], 400);
    }
  }

  async getAll(c: Context) {
    try {
      const result = await categoryService.getAllCategories();
      return successResponse(c, "All categories retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve categories", [err.message], 400);
    }
  }

  async create(c: Context) {
    try {
      const body = c.req.valid("json" as never) as any;
      const result = await categoryService.createCategory(body);
      return successResponse(c, "Category created successfully", result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to create category", [err.message], 400);
    }
  }

  async update(c: Context) {
    try {
      const id = parseInt(c.req.param("id") || "0", 10);
      if (isNaN(id)) {
        return errorResponse(c, "Invalid category ID", [], 400);
      }
      const body = c.req.valid("json" as never) as any;
      const result = await categoryService.updateCategory(id, body);
      return successResponse(c, "Category updated successfully", result);
    } catch (err: any) {
      const status = err.message === "Category not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to update category", [err.message], status);
    }
  }

  async delete(c: Context) {
    try {
      const id = parseInt(c.req.param("id") || "0", 10);
      if (isNaN(id)) {
        return errorResponse(c, "Invalid category ID", [], 400);
      }
      const result = await categoryService.deleteCategory(id);
      return successResponse(c, "Category deleted successfully", result);
    } catch (err: any) {
      const status = err.message === "Category not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to delete category", [err.message], status);
    }
  }

  async activate(c: Context) {
    try {
      const id = parseInt(c.req.param("id") || "0", 10);
      if (isNaN(id)) {
        return errorResponse(c, "Invalid category ID", [], 400);
      }
      const result = await categoryService.activateCategory(id);
      return successResponse(c, "Category activated successfully", result);
    } catch (err: any) {
      const status = err.message === "Category not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to activate category", [err.message], status);
    }
  }

  async deactivate(c: Context) {
    try {
      const id = parseInt(c.req.param("id") || "0", 10);
      if (isNaN(id)) {
        return errorResponse(c, "Invalid category ID", [], 400);
      }
      const result = await categoryService.deactivateCategory(id);
      return successResponse(c, "Category deactivated successfully", result);
    } catch (err: any) {
      const status = err.message === "Category not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to deactivate category", [err.message], status);
    }
  }

  async reorder(c: Context) {
    try {
      const { categories } = c.req.valid("json" as never) as any;
      const result = await categoryService.reorderCategories(categories);
      return successResponse(c, "Categories reordered successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to reorder categories", [err.message], 400);
    }
  }
}
