import { Context } from "hono";
import { JobService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";
import { mapJobToPublicDto } from "../dto.js";

const service = new JobService();

export class JobController {
  async list(c: Context) {
    try {
      const businessId = c.req.query("businessId");
      const employmentType = c.req.query("employmentType");
      const status = c.req.query("status") || "active"; // defaults to active for public list
      const limit = parseInt(c.req.query("limit") || "20", 10);
      const page = parseInt(c.req.query("page") || "1", 10);
      const offset = (page - 1) * limit;

      const data = await service.getJobs({ businessId, employmentType, status, limit, offset });
      return successResponse(c, "Jobs list retrieved successfully", data.map(mapJobToPublicDto), { page, limit });
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve jobs", [], 400);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param("id") || "";
      const data = await service.getPublicJobById(id);
      return successResponse(c, "Job detail retrieved successfully", mapJobToPublicDto(data));
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve job", [], 400);
    }
  }

  async create(c: Context) {
    try {
      const user = c.get("user");
      const body = c.req.valid("json" as never) as any;
      const data = await service.createJob(body, user.id, user.role);
      return successResponse(c, "Job posted successfully", data, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to post job", [], 400);
    }
  }

  async update(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || "";
      const body = c.req.valid("json" as never) as any;
      const data = await service.updateJob(id, body, user.id, user.role);
      return successResponse(c, "Job updated successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update job", [], 400);
    }
  }

  async delete(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || "";
      await service.deleteJob(id, user.id, user.role);
      return successResponse(c, "Job deleted successfully", {});
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to delete job", [], 400);
    }
  }

  // --- Applications Controllers ---
  async apply(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || ""; // jobId
      const data = await service.applyForJob(id, user.id);
      return successResponse(c, "Applied for job successfully", data, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to apply for job", [], 400);
    }
  }

  async getApplicationsForJob(c: Context) {
    try {
      const user = c.get("user");
      const id = c.req.param("id") || ""; // jobId
      const data = await service.getApplications(id, user.id, user.role);
      return successResponse(c, "Job applications retrieved successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve job applications", [], 400);
    }
  }

  async updateApplicationStatus(c: Context) {
    try {
      const user = c.get("user");
      const applicationId = c.req.param("applicationId") || "";
      const body = c.req.valid("json" as never) as any;
      const data = await service.updateApplication(applicationId, body.status, user.id, user.role);
      return successResponse(c, "Application status updated successfully", data);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to update application status", [], 400);
    }
  }
}
