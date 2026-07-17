import { Context } from "hono";
import { ProductService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const productService = new ProductService();

export class ProductController {
  async create(c: Context) {
    try {
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await productService.addProduct(profile.id, body);
      return successResponse(c, "Product added successfully", result, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to add product", [err.message], 400);
    }
  }

  async update(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await productService.updateProduct(id, profile.id, body);
      return successResponse(c, "Product updated successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update product", [err.message], 400);
    }
  }

  async delete(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const result = await productService.deleteProduct(id, profile.id);
      return successResponse(c, "Product deleted successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete product", [err.message], 400);
    }
  }
}
