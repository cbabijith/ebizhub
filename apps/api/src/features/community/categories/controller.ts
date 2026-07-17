import { Context } from "hono";
import { NewsCategoryService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { mapCategoryToPublicDto } from "../dto.js";

const service = new NewsCategoryService();

export class NewsCategoryController {
  async getActive(c: Context) {
    try {
      const data = await service.getActiveCategories();
      return successResponse(c, "Active categories retrieved successfully", data.map(mapCategoryToPublicDto));
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve categories", [], 400);
    }
  }

  async getAll(c: Context) {
    try {
      const data = await service.getAllCategories();
      return successResponse(c, "All categories retrieved successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve categories", [], 400);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const data = await service.getPublicCategoryById(id);
      return successResponse(c, "Category retrieved successfully", mapCategoryToPublicDto(data));
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve category", [], 400);
    }
  }

  async create(c: Context) {
    try {
      const user = c.get("user");
      const body = c.req.valid("json" as never) as any;
      const data = await service.createCategory(body, user.id);
      return successResponse(c, "Category created successfully", data, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to create category", [], 400);
    }
  }

  async update(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || "";
      const body = c.req.valid("json" as never) as any;
      const data = await service.updateCategory(id, body, user.id);
      return successResponse(c, "Category updated successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update category", [], 400);
    }
  }

  async delete(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || "";
      await service.deleteCategory(id, user.id);
      return successResponse(c, "Category deleted successfully", {});
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete category", [], 400);
    }
  }
}
