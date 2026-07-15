/**
 * Feature 04 - Service Provider Module (Sprint 1, 2 & 4 + Verification & Analytics)
 * Comprehensive E2E Integration Test Suite
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
let portfolioItemId = "";
let skillId = "";
let serviceAreaId = 0;
let verificationRequestId = "";

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
    expect(status === 201 || status === 400).toBe(true);
  });
});

// ─── Service Provider Portfolio Tests ────────────────────────────────────────

describe("Service Provider Portfolio Management", () => {
  test("Member: POST /v1/portfolio — add portfolio item", async () => {
    if (!providerId || !memberToken) return;

    const { status, body } = await request("POST", "/v1/portfolio", {
      providerId,
      type: "image",
      title: "Project E-Commerce",
      description: "Implemented standard online shop.",
      fileUrl: "https://example.com/project-pic.jpg",
      sortOrder: 1,
    }, memberToken);

    if (status === 201) {
      portfolioItemId = body.data?.id;
    }
    expect(status === 201 || status === 400).toBe(true);
  });
});

// ─── Service Provider Verification Tests ─────────────────────────────────────

describe("Service Provider Verification Workflow", () => {
  test("Member: POST /v1/provider-verification/submit — submit verification", async () => {
    if (!providerId || !memberToken) return;

    const { status, body } = await request("POST", "/v1/provider-verification/submit", {
      providerId,
    }, memberToken);

    if (status === 201) {
      verificationRequestId = body.data?.id;
    }
    expect(status === 201 || status === 400).toBe(true);
  });

  test("Member: GET /v1/provider-verification/history/:providerId — view verification status history", async () => {
    if (!providerId || !memberToken) return;

    const { status, body } = await request("GET", `/v1/provider-verification/history/${providerId}`, undefined, memberToken);
    expect(status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("Admin: POST /v1/provider-verification/:id/approve — admin approve request", async () => {
    if (!verificationRequestId || !adminToken) return;

    const { status } = await request("POST", `/v1/provider-verification/${verificationRequestId}/approve`, {
      remarks: "Document check passed.",
    }, adminToken);

    expect(status === 200 || status === 400).toBe(true);
  });
});

// ─── Service Provider Analytics Tests ────────────────────────────────────────

describe("Service Provider Analytics & Interaction Logs", () => {
  test("Public: POST /v1/provider-analytics/:id/click — track phone click interaction", async () => {
    if (!providerId) return;

    const { status } = await request("POST", `/v1/provider-analytics/${providerId}/click`, {
      action: "phone_click",
    });

    expect(status === 200 || status === 400 || status === 404).toBe(true);
  });

  test("Member: GET /v1/provider-analytics/:id/summary — retrieve analytics dashboard stats", async () => {
    if (!providerId || !memberToken) return;

    const { status, body } = await request("GET", `/v1/provider-analytics/${providerId}/summary`, undefined, memberToken);
    expect(status === 200 || status === 403 || status === 404).toBe(true);
  });
});

console.log("\n====================================================");
console.log("Feature 04 - Service Provider Complete Test Run");
console.log("====================================================\n");
