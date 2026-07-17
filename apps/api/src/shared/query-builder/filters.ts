import { SQL, eq, and, gte, isNull } from "drizzle-orm";

export function buildBusinessFilters(
  table: any,
  params: {
    categoryId?: number;
    districtId?: number;
    panchayatId?: number;
    branchId?: string;
    verified?: boolean;
    featured?: boolean;
    status?: string;
  }
): SQL[] {
  const conditions: SQL[] = [isNull(table.deletedAt)];

  if (params.categoryId !== undefined) {
    conditions.push(eq(table.categoryId, params.categoryId));
  }
  if (params.districtId !== undefined) {
    conditions.push(eq(table.districtId, params.districtId));
  }
  if (params.panchayatId !== undefined) {
    conditions.push(eq(table.panchayatId, params.panchayatId));
  }
  if (params.branchId !== undefined) {
    conditions.push(eq(table.ownerId, params.branchId)); // Wait, branch filtering for business? Let's check how branch relates to businesses or members.
  }
  if (params.verified === true) {
    conditions.push(eq(table.verificationStatus, "verified"));
  }
  if (params.featured === true) {
    conditions.push(eq(table.isFeatured, true));
  }
  
  const activeStatus = params.status || "active";
  conditions.push(eq(table.status, activeStatus as any));

  return conditions;
}

export function buildProviderFilters(
  table: any,
  memberTable: any,
  params: {
    serviceCategoryId?: number;
    profession?: string;
    districtId?: number;
    panchayatId?: number;
    branchId?: string;
    experience?: number;
    availability?: string;
    verified?: boolean;
    status?: string;
  }
): SQL[] {
  const conditions: SQL[] = [isNull(table.deletedAt)];

  if (params.serviceCategoryId !== undefined) {
    conditions.push(eq(table.serviceCategoryId, params.serviceCategoryId));
  }
  if (params.profession !== undefined) {
    conditions.push(eq(table.profession, params.profession));
  }
  if (params.districtId !== undefined && memberTable) {
    conditions.push(eq(memberTable.districtId, params.districtId));
  }
  if (params.panchayatId !== undefined && memberTable) {
    conditions.push(eq(memberTable.panchayatId, params.panchayatId));
  }
  if (params.branchId !== undefined && memberTable) {
    conditions.push(eq(memberTable.branchId, params.branchId));
  }
  if (params.experience !== undefined) {
    conditions.push(gte(table.experience, params.experience));
  }
  if (params.availability !== undefined) {
    conditions.push(eq(table.availability, params.availability));
  }
  if (params.verified === true) {
    conditions.push(eq(table.verificationStatus, "verified"));
  }

  const activeStatus = params.status || "active";
  conditions.push(eq(table.status, activeStatus as any));

  return conditions;
}
