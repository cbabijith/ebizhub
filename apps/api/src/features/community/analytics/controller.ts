import { Context } from "hono";
import { CommunityAnalyticsService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const service = new CommunityAnalyticsService();

export class CommunityAnalyticsController {
  async track(c: Context) {
    try {
      const user = c.get("user");
      const profileId = user?.id; // Optional (could be guest)
      const body = c.req.valid("json" as never) as any;
      const ip = c.req.header("x-forwarded-for") || undefined;
      const device = c.req.header("user-agent") || undefined;

      const data = await service.track({
        entityType: body.entityType,
        entityId: body.entityId,
        profileId,
        ip,
        device,
      });

      return successResponse(c, "Analytics interaction tracked successfully", data, {}, 201);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to track interaction", [], 400);
    }
  }
}
