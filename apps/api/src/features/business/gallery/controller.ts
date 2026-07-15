import { Context } from "hono";
import { GalleryService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const galleryService = new GalleryService();

export class GalleryController {
  async upload(c: Context) {
    try {
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await galleryService.addImage(profile.id, body);
      return successResponse(c, "Image added to gallery successfully", result, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to add image", [err.message], 400);
    }
  }

  async delete(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const profile = c.get("profile");
      const result = await galleryService.deleteImage(profile.id, id);
      return successResponse(c, "Gallery image deleted successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete image", [err.message], 400);
    }
  }

  async reorder(c: Context) {
    try {
      const profile = c.get("profile");
      const body = c.req.valid("json" as never) as any;
      const result = await galleryService.reorderGallery(profile.id, body);
      return successResponse(c, "Gallery reordered successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to reorder gallery", [err.message], 400);
    }
  }
}
