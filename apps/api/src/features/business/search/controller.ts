import { Context } from "hono";
import { SearchService } from "./service.js";
import { successResponse, errorResponse } from "../../../shared/responses/response.js";

const searchService = new SearchService();

export class SearchController {
  async search(c: Context) {
    try {
      const businessName = c.req.query("businessName");
      const categoryIdStr = c.req.query("categoryId");
      const districtIdStr = c.req.query("districtId");
      const panchayatIdStr = c.req.query("panchayatId");
      const keyword = c.req.query("keyword");

      const categoryId = categoryIdStr ? parseInt(categoryIdStr, 10) : undefined;
      const districtId = districtIdStr ? parseInt(districtIdStr, 10) : undefined;
      const panchayatId = panchayatIdStr ? parseInt(panchayatIdStr, 10) : undefined;

      const result = await searchService.searchBusinesses({
        businessName,
        categoryId,
        districtId,
        panchayatId,
        keyword,
      });

      return successResponse(c, "Search results retrieved successfully", result);
    } catch (err: any) {
      return errorResponse(c, err.message || "Search execution failed", [err.message], 400);
    }
  }
}
