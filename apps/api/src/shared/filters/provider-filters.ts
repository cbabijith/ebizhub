import { SQL, eq, and, isNull, gte, ilike, or } from "drizzle-orm";
import { ProviderFilterParams } from "./types.js";
import { serviceProviders, serviceCategories, members } from "../../database/schema.js";

export function buildProviderFilters(params: ProviderFilterParams, useAreas = false): SQL[] {
  const conditions: SQL[] = [isNull(serviceProviders.deletedAt)];

  if (params.profession !== undefined) {
    conditions.push(ilike(serviceProviders.profession, `%${params.profession}%`));
  }

  if (params.category !== undefined) {
    if (typeof params.category === "number" || /^\d+$/.test(String(params.category))) {
      conditions.push(eq(serviceProviders.serviceCategoryId, Number(params.category)));
    } else {
      conditions.push(eq(serviceCategories.slug, String(params.category)));
    }
  }

  if (params.experience !== undefined) {
    conditions.push(gte(serviceProviders.experience, params.experience));
  }

  if (params.languages !== undefined) {
    conditions.push(ilike(serviceProviders.languages, `%${params.languages}%`));
  }

  if (params.availability !== undefined) {
    conditions.push(eq(serviceProviders.availability, params.availability));
  }

  if (!useAreas) {
    if (params.district !== undefined) {
      conditions.push(eq(members.districtId, params.district));
    }

    if (params.panchayat !== undefined) {
      conditions.push(eq(members.panchayatId, params.panchayat));
    }
  }

  if (params.verified === true) {
    conditions.push(eq(serviceProviders.verificationStatus, "verified"));
  }

  const activeStatus = params.status || "active";
  conditions.push(eq(serviceProviders.status, activeStatus as any));

  if (params.branchId !== undefined) {
    conditions.push(or(eq(members.branchId, params.branchId), isNull(members.branchId)) as any);
  }

  return conditions;
}
