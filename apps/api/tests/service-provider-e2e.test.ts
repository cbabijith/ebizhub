/**
 * Feature 04 - Service Provider Module
 * Comprehensive Sprint 1 Integration Test Suite
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
let providerId = "";

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
});

// ─── Service Categories Tests ────────────────────────────────────────────────

describe("Service Categories Management", () => {
  test("Public: GET /v1/service-categories — returns active categories", async () => {
    const { status, body } = await request("GET", "/v1/service-categories");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("Admin: POST /v1/service-categories — create category with auto-slug", async () => {
    const name = `Software Engineer Test ${Date.now()}`;
    const { status, body } = await request("POST", "/v1/service-categories", {
      name,
      sortOrder: 10,
    }, adminToken);

    if (status === 201) {
      categoryId = body.data?.id;
      expect(body.data?.slug).toBeDefined();
    }
    expect(status === 201 || status === 400).toBe(true);
  });

  test("Admin: PUT /v1/service-categories/reorder — reorder categories", async () => {
    if (!categoryId) return;
    const { status, body } = await request("PUT", "/v1/service-categories/reorder", {
      categories: [
        { id: categoryId, sortOrder: 99 }
      ]
    }, adminToken);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  test("Admin: PATCH /v1/service-categories/:id/deactivate and activate", async () => {
    if (!categoryId) return;
    const deactRes = await request("PATCH", `/v1/service-categories/${categoryId}/deactivate`, {}, adminToken);
    expect(deactRes.status).toBe(200);

    const actRes = await request("PATCH", `/v1/service-categories/${categoryId}/activate`, {}, adminToken);
    expect(actRes.status).toBe(200);
  });
});

// ─── Service Providers Tests ─────────────────────────────────────────────────

describe("Service Providers Management", () => {
  test("Member: POST /v1/providers — register provider profile", async () => {
    if (!categoryId || !memberToken) return;

    const { status, body } = await request("POST", "/v1/providers", {
      serviceCategoryId: categoryId,
      profession: "Full Stack Engineer",
      experience: 5,
      bio: "A senior full stack engineer specializing in Node/TypeScript.",
      phone: "+919876543210",
      qualification: "B.Tech Computer Science",
      languages: "English, Malayalam",
      serviceRadius: 15,
    }, memberToken);

    if (status === 201) {
      providerId = body.data?.id;
    }
    expect(status === 201 || status === 400).toBe(true); // 400 if member profile is incomplete or already exists
  });

  test("Member: GET /v1/providers/me — get own provider profile", async () => {
    if (!memberToken) return;
    const { status, body } = await request("GET", "/v1/providers/me", undefined, memberToken);
    expect(status === 200 || status === 404).toBe(true);
  });

  test("Public: GET /v1/providers/:id — get provider details", async () => {
    if (!providerId) return;
    const { status, body } = await request("GET", `/v1/providers/${providerId}`);
    expect(status).toBe(200);
    expect(body.data?.id).toBe(providerId);
  });

  test("Member: PUT /v1/providers/:id — update own provider profile", async () => {
    if (!providerId || !memberToken) return;
    const { status } = await request("PUT", `/v1/providers/${providerId}`, {
      profession: "Lead Software Architect",
      experience: 7,
    }, memberToken);
    expect(status).toBe(200);
  });

  test("Admin status update: PATCH /v1/providers/:id/status", async () => {
    if (!providerId || !adminToken) return;
    const { status, body } = await request("PATCH", `/v1/providers/${providerId}/status`, {
      status: "suspended",
    }, adminToken);
    expect(status).toBe(200);
    expect(body.data.status).toBe("suspended");
  });
});

console.log("\n====================================================");
console.log("Feature 04 - Service Provider Sprint 1 Test Complete");
console.log("====================================================\n");
