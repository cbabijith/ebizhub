import { Context } from "hono";
import { EventService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { mapEventToPublicDto } from "../dto.js";

const service = new EventService();

export class EventController {
  async list(c: Context) {
    try {
      const status = c.req.query("status");
      const categoryId = c.req.query("categoryId");
      const branchId = c.req.query("branchId");
      const limit = parseInt(c.req.query("limit") || "20", 10);
      const page = parseInt(c.req.query("page") || "1", 10);
      const offset = (page - 1) * limit;

      const data = await service.getEvents({ status, categoryId, branchId, limit, offset });
      return successResponse(c, "Events list retrieved successfully", data.map(mapEventToPublicDto), { page, limit });
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve events", [], 400);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const data = await service.getPublicEventById(id);
      return successResponse(c, "Event detail retrieved successfully", mapEventToPublicDto(data));
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve event", [], 400);
    }
  }

  async create(c: Context) {
    try {
      const user = c.get("user");
      const body = c.req.valid("json" as never) as any;
      const data = await service.createEvent(body, user.id);
      return successResponse(c, "Event created successfully", data, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to create event", [], 400);
    }
  }

  async update(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || "";
      const body = c.req.valid("json" as never) as any;
      const data = await service.updateEvent(id, body, user.id);
      return successResponse(c, "Event updated successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update event", [], 400);
    }
  }

  async delete(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || "";
      await service.deleteEvent(id, user.id);
      return successResponse(c, "Event deleted successfully", {});
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete event", [], 400);
    }
  }

  // --- Registration Controllers ---
  async register(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || ""; // eventId
      const data = await service.registerForEvent(id, user.id);
      return successResponse(c, "Registered for event successfully", data, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to register for event", [], 400);
    }
  }

  async getRegistrations(c: Context) {
    try {
      const id = c.req.param("id") || ""; // eventId
      const data = await service.getEventRegistrations(id);
      return successResponse(c, "Event registrations retrieved successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve registrations", [], 400);
    }
  }

  async updateRegistrationStatus(c: Context) {
    try {
      const user = c.get("user");
      const regId = c.req.param("registrationId") || "";
      const body = c.req.valid("json" as never) as any;
      const data = await service.updateRegistration(regId, body.status, user.id);
      return successResponse(c, "Registration status updated successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update registration status", [], 400);
    }
  }
}
