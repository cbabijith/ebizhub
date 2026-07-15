import { Context } from "hono";
import { GalleryService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const galleryService = new GalleryService();

export class GalleryController {
  async upload(c: Context) {
    try {
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await galleryService.addImage(profile.id, profile.role, body);
      return successResponse(c, "Image added to gallery successfully", result, 201);
    } catch (err: any) {
      const status = err.message === "Business not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to add image", [err.message], status);
    }
  }

  async delete(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const result = await galleryService.deleteImage(profile.id, profile.role, id);
      return successResponse(c, "Gallery image deleted successfully", result);
    } catch (err: any) {
      const status = (err.message === "Business not found" || err.message === "Gallery image not found") ? 404 : 400;
      return errorResponse(c, err.message || "Failed to delete image", [err.message], status);
    }
  }

  async reorder(c: Context) {
    try {
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await galleryService.reorderGallery(profile.id, profile.role, body);
      return successResponse(c, "Gallery reordered successfully", result);
    } catch (err: any) {
      const status = err.message === "Business not found" ? 404 : 400;
      return errorResponse(c, err.message || "Failed to reorder gallery", [err.message], status);
    }
  }
}
