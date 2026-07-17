import { SQL, eq, and, isNull, isNotNull, or } from "drizzle-orm";
import { BusinessFilterParams } from "./types.js";
import { businesses, businessCategories, members } from "../../database/schema.js";

export function buildBusinessFilters(params: BusinessFilterParams): SQL[] {
  const conditions: SQL[] = [isNull(businesses.deletedAt)];

  if (params.category !== undefined) {
    if (typeof params.category === "number" || /^\d+$/.test(String(params.category))) {
      conditions.push(eq(businesses.categoryId, Number(params.category)));
    } else {
      conditions.push(eq(businessCategories.slug, String(params.category)));
    }
  }

  if (params.district !== undefined) {
    conditions.push(eq(businesses.districtId, params.district));
  }

  if (params.panchayat !== undefined) {
    conditions.push(eq(businesses.panchayatId, params.panchayat));
  }

  if (params.branch === true) {
    conditions.push(isNotNull(members.branchId));
  }

  if (params.verified === true) {
    conditions.push(eq(businesses.verificationStatus, "verified"));
  }

  if (params.featured === true) {
    conditions.push(eq(businesses.isFeatured, true));
  }

  const activeStatus = params.status || "active";
  conditions.push(eq(businesses.status, activeStatus as any));

  if (params.branchId !== undefined) {
    conditions.push(or(eq(members.branchId, params.branchId), isNull(members.branchId)) as any);
  }

  return conditions;
}
