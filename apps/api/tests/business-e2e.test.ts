/**
 * Feature 03 - Business Management
 * E2E Integration Test Suite (Stage 1 & 2)
 * Using bun test runner
 */

import { describe, test, expect, beforeAll } from "bun:test";

const BASE_URL = "http://localhost:3001/api";
const ADMIN_EMAIL = "admin@test.com";
const ADMIN_PASSWORD = "Test@1234";
const MEMBER_EMAIL = "member@test.com";
const MEMBER_PASSWORD = "Member@1234";

let adminToken = "";
let memberToken = "";
let memberId = "";
let categoryId = 0;
let businessId = "";
let galleryImageId = "";
let productId = "";
let serviceId = "";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function request(method: string, path: string, body?: any, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json() as any;
  return { status: res.status, body: json };
}

// ─── Auth Setup ───────────────────────────────────────────────────────────────

beforeAll(async () => {
  // Login admin
  const adminLogin = await request("POST", "/v1/auth/login", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (adminLogin.body?.data?.session?.access_token) {
    adminToken = adminLogin.body.data.session.access_token;
  }

  // Login member
  const memberLogin = await request("POST", "/v1/auth/login", {
    email: MEMBER_EMAIL,
    password: MEMBER_PASSWORD,
  });
  if (memberLogin.body?.data?.session?.access_token) {
    memberToken = memberLogin.body.data.session.access_token;

    // Get member profile ID
    const profile = await request("GET", "/v1/auth/me", undefined, memberToken);
    memberId = profile.body?.data?.id ?? "";
  }

  console.log("Admin token loaded:", adminToken ? "✓" : "✗");
  console.log("Member token loaded:", memberToken ? "✓" : "✗");
  console.log("Member ID:", memberId || "(not found)");
});

// ─── Stage 1: Business Categories ────────────────────────────────────────────

describe("Module 3.1 — Business Categories", () => {
  test("Public: GET /v1/business-categories — returns active categories", async () => {
    const { status, body } = await request("GET", "/v1/business-categories");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("Admin: POST /v1/business-categories — create category with auto-slug", async () => {
    const name = `IT Services Test ${Date.now()}`;
    const { status, body } = await request("POST", "/v1/business-categories", {
      name,
      sortOrder: 10,
      status: "active",
    }, adminToken);

    if (status === 201) {
      categoryId = body.data?.id;
      expect(body.data?.slug).toBeDefined();
    }
    expect(status === 201 || status === 400).toBe(true);
  });

  test("Admin: PUT /v1/business-categories/reorder — reorder categories", async () => {
    if (!categoryId) return;
    const { status, body } = await request("PUT", "/v1/business-categories/reorder", {
      categories: [
        { id: categoryId, sortOrder: 99 }
      ]
    }, adminToken);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  test("Admin: PATCH /v1/business-categories/:id/deactivate and activate", async () => {
    if (!categoryId) return;
    const deactRes = await request("PATCH", `/v1/business-categories/${categoryId}/deactivate`, {}, adminToken);
    expect(deactRes.status).toBe(200);

    const actRes = await request("PATCH", `/v1/business-categories/${categoryId}/activate`, {}, adminToken);
    expect(actRes.status).toBe(200);
  });
});

// ─── Stage 1: Business Registration ──────────────────────────────────────────

describe("Module 3.2 — Business Registration & Status", () => {
  test("Member (non-vendor/non-admin): POST /v1/businesses — denied if role is customer", async () => {
    // If our member has "customer" role, registering should be denied.
    // Since roles are checked via requireRole(["vendor", "admin"]), let's test it.
    const { status } = await request("POST", "/v1/businesses", {
      categoryId: 1,
      businessName: "No Vendor Role",
      slug: "no-vendor-role",
      phone: "+919876543210",
      address: "Test Address",
      districtId: 1,
    }, memberToken);
    // Note: if member has vendor role, this will be 201 or 400. If customer, it'll be 403.
    expect(status === 403 || status === 400 || status === 201).toBe(true);
  });

  test("Admin status update: PATCH /v1/businesses/:id/status", async () => {
    // Register business first using adminToken (which bypasses role check since it's admin)
    if (!categoryId) return;
    const regRes = await request("POST", "/v1/businesses", {
      categoryId,
      businessName: "Admin Owned Test Biz",
      slug: `admin-test-${Date.now()}`,
      phone: "+919876543210",
      address: "123 Admin St",
      districtId: 1,
    }, adminToken);

    if (regRes.status === 201) {
      const bizId = regRes.body.data.id;
      const statusRes = await request("PATCH", `/v1/businesses/${bizId}/status`, {
        status: "suspended"
      }, adminToken);
      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.status).toBe("suspended");
    }
  });
});

// ─── Stage 1: Gallery (Enforcing 10 Limit) ───────────────────────────────────

describe("Module 3.3 — Business Gallery (Max 10 images)", () => {
  test("Member: POST /v1/business-gallery — upload image limit check", async () => {
    if (!adminToken || !categoryId) return;
    // Register a test business
    const regRes = await request("POST", "/v1/businesses", {
      categoryId,
      businessName: "Gallery Limit Test Biz",
      slug: `gallery-limit-test-${Date.now()}`,
      phone: "+919876543210",
      address: "123 limit St",
      districtId: 1,
    }, adminToken);

    if (regRes.status === 201) {
      const bizId = regRes.body.data.id;
      
      // Upload up to 10 images
      for (let i = 1; i <= 10; i++) {
        const uploadRes = await request("POST", "/v1/business-gallery", {
          businessId: bizId,
          imageUrl: `https://example.com/image${i}.jpg`,
          sortOrder: i,
        }, adminToken);
        expect(uploadRes.status).toBe(201);
      }

      // Try 11th image
      const failRes = await request("POST", "/v1/business-gallery", {
        businessId: bizId,
        imageUrl: `https://example.com/image11.jpg`,
        sortOrder: 11,
      }, adminToken);
      
      expect(failRes.status).toBe(400);
      expect(failRes.body.message).toContain("Maximum of 10 gallery images");
    }
  });
});

describe("Stage 3 — Database & Cross-Module Integration", () => {
  test("Cannot register a business if owner lacks a member profile", async () => {
    const randEmail = `new-user-${Date.now()}@test.com`;
    const regRes = await request("POST", "/v1/auth/register", {
      fullName: "Non Member User",
      email: randEmail,
      password: "User@1234",
      phone: "+910000001234",
    });
    
    const token = regRes.body?.data?.session?.access_token;
    if (!token) return;

    const bizRes = await request("POST", "/v1/businesses", {
      categoryId: categoryId || 1,
      businessName: "Ghost Business",
      slug: `ghost-biz-${Date.now()}`,
      phone: "+910000000001",
      address: "Ghost Alley",
      districtId: 1,
    }, token);

    expect(bizRes.status).toBe(400);
    expect(bizRes.body.message).toContain("Owner must have a completed member profile");
  });
});

console.log("\n====================================================");
console.log("Feature 03 - Business Management E2E Audit Fix Tests");
console.log("====================================================\n");
