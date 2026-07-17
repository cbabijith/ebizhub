import { Context } from "hono";
import { NoticeService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { mapNoticeToPublicDto } from "../dto.js";

const service = new NoticeService();

export class NoticeController {
  async list(c: Context) {
    try {
      const noticeType = c.req.query("noticeType");
      const priority = c.req.query("priority");
      const branchId = c.req.query("branchId");
      const status = c.req.query("status") || "active";
      const limit = parseInt(c.req.query("limit") || "20", 10);
      const page = parseInt(c.req.query("page") || "1", 10);
      const offset = (page - 1) * limit;

      const data = await service.getNotices({ noticeType, priority, branchId, status, limit, offset });
      return successResponse(c, "Notices list retrieved successfully", data.map(mapNoticeToPublicDto), { page, limit });
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve notices", [], 400);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const data = await service.getPublicNoticeById(id);
      return successResponse(c, "Notice detail retrieved successfully", mapNoticeToPublicDto(data));
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve notice", [], 400);
    }
  }

  async create(c: Context) {
    try {
      const user = c.get("user");
      const body = c.req.valid("json" as never) as any;
      const data = await service.createNotice(body, user.id);
      return successResponse(c, "Notice created successfully", data, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to create notice", [], 400);
    }
  }

  async update(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || "";
      const body = c.req.valid("json" as never) as any;
      const data = await service.updateNotice(id, body, user.id);
      return successResponse(c, "Notice updated successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update notice", [], 400);
    }
  }

  async delete(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || "";
      await service.deleteNotice(id, user.id);
      return successResponse(c, "Notice deleted successfully", {});
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete notice", [], 400);
    }
  }
}
