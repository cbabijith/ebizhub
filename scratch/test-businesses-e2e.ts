/**
 * Feature 03 - Business Management
 * E2E Integration Test Suite (Stage 1: Functional)
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
    console.log("GET /v1/business-categories →", status, JSON.stringify(body).slice(0, 200));
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("Admin: POST /v1/business-categories — create category", async () => {
    const { status, body } = await request("POST", "/v1/business-categories", {
      name: "IT Services Test",
      slug: "it-services-test",
      icon: null,
      image: null,
      sortOrder: 10,
      status: "active",
    }, adminToken);
    console.log("POST /v1/business-categories →", status, JSON.stringify(body).slice(0, 200));

    if (status === 201) {
      categoryId = body.data?.id;
    } else {
      // Fetch existing categories and use one
      const list = await request("GET", "/v1/business-categories/all", undefined, adminToken);
      categoryId = list.body?.data?.[0]?.id ?? 1;
    }

    expect(status === 201 || status === 400).toBe(true); // 400 if slug already exists
    console.log("Category ID:", categoryId);
  });

  test("Admin: PUT /v1/business-categories/:id — update category", async () => {
    if (!categoryId) return;
    const { status, body } = await request("PUT", `/v1/business-categories/${categoryId}`, {
      name: "IT Services Updated",
      slug: "it-services-test",
      sortOrder: 10,
      status: "active",
    }, adminToken);
    console.log("PUT /v1/business-categories/:id →", status, JSON.stringify(body).slice(0, 200));
    expect(status).toBe(200);
  });

  test("Guest: POST /v1/business-categories — denied (401)", async () => {
    const { status } = await request("POST", "/v1/business-categories", {
      name: "Should Fail",
      slug: "should-fail",
    });
    expect(status).toBe(401);
  });

  test("Member: POST /v1/business-categories — denied (403)", async () => {
    if (!memberToken) return;
    const { status } = await request("POST", "/v1/business-categories", {
      name: "Member Fail",
      slug: "member-fail",
    }, memberToken);
    expect(status).toBe(403);
  });
});

// ─── Stage 1: Business Registration ──────────────────────────────────────────

describe("Module 3.2 — Business Registration", () => {
  test("Member: POST /v1/businesses — register business", async () => {
    if (!memberToken || !categoryId) {
      console.log("Skipping: no token or categoryId");
      return;
    }

    const { status, body } = await request("POST", "/v1/businesses", {
      categoryId,
      businessName: "Abi Tech Solutions",
      slug: `abi-tech-${Date.now()}`,
      description: "A test IT business for e2e testing",
      phone: "+919876543210",
      whatsapp: "+919876543210",
      email: "contact@abitech.com",
      website: "https://abitech.com",
      address: "123 Tech Street, Thrissur",
      districtId: 1,
      panchayatId: null,
      workingHours: "9am - 6pm",
    }, memberToken);

    console.log("POST /v1/businesses →", status, JSON.stringify(body).slice(0, 300));
    businessId = body.data?.id ?? "";
    console.log("Business ID:", businessId);

    expect(status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data?.id).toBeDefined();
    expect(body.data?.ownerId).toBeDefined();
  });

  test("Member: GET /v1/businesses/me — list own businesses", async () => {
    if (!memberToken) return;
    const { status, body } = await request("GET", "/v1/businesses/me", undefined, memberToken);
    console.log("GET /v1/businesses/me →", status, JSON.stringify(body).slice(0, 300));
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("Public: GET /v1/businesses/:id — view business details", async () => {
    if (!businessId) { console.log("Skipping: no businessId"); return; }
    const { status, body } = await request("GET", `/v1/businesses/${businessId}`);
    console.log("GET /v1/businesses/:id →", status, JSON.stringify(body).slice(0, 300));
    expect(status).toBe(200);
    expect(body.data?.id).toBe(businessId);
  });

  test("Member: PUT /v1/businesses/:id — update own business", async () => {
    if (!memberToken || !businessId) return;
    const { status, body } = await request("PUT", `/v1/businesses/${businessId}`, {
      categoryId,
      businessName: "Abi Tech Solutions Updated",
      slug: `abi-tech-${Date.now()}`,
      description: "Updated description",
      phone: "+919876543211",
      address: "456 Tech Ave, Thrissur",
      districtId: 1,
    }, memberToken);
    console.log("PUT /v1/businesses/:id →", status, JSON.stringify(body).slice(0, 300));
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  test("Guest: POST /v1/businesses — denied (401)", async () => {
    const { status } = await request("POST", "/v1/businesses", {
      businessName: "No Auth",
      slug: "no-auth",
      categoryId: 1,
      phone: "123",
      address: "Test",
      districtId: 1,
    });
    expect(status).toBe(401);
  });

  test("Duplicate slug: POST /v1/businesses — rejected (400)", async () => {
    if (!memberToken || !categoryId) return;
    const slug = `duplicate-slug-${Date.now()}`;
    await request("POST", "/v1/businesses", {
      categoryId,
      businessName: "First Business",
      slug,
      phone: "+910000000001",
      address: "First Address",
      districtId: 1,
    }, memberToken);

    const { status, body } = await request("POST", "/v1/businesses", {
      categoryId,
      businessName: "Second Business Same Slug",
      slug,
      phone: "+910000000002",
      address: "Second Address",
      districtId: 1,
    }, memberToken);
    console.log("Duplicate slug →", status, body.message);
    expect(status).toBe(400);
  });
});

// ─── Stage 1: Gallery ─────────────────────────────────────────────────────────

describe("Module 3.3 — Business Gallery", () => {
  test("Member: POST /v1/business-gallery — upload image", async () => {
    if (!memberToken || !businessId) { console.log("Skipping gallery: no businessId"); return; }
    const { status, body } = await request("POST", "/v1/business-gallery", {
      businessId,
      imageUrl: "https://via.placeholder.com/800x600.jpg",
      isCover: true,
      sortOrder: 0,
    }, memberToken);
    console.log("POST /v1/business-gallery →", status, JSON.stringify(body).slice(0, 300));
    galleryImageId = body.data?.id ?? "";
    expect(status).toBe(201);
    expect(body.data?.businessId).toBe(businessId);
  });

  test("Member: DELETE /v1/business-gallery/:id — delete image", async () => {
    if (!memberToken || !galleryImageId) { console.log("Skipping delete gallery: no galleryImageId"); return; }
    const { status, body } = await request("DELETE", `/v1/business-gallery/${galleryImageId}`, undefined, memberToken);
    console.log("DELETE /v1/business-gallery/:id →", status, JSON.stringify(body).slice(0, 200));
    expect(status).toBe(200);
  });
});

// ─── Stage 1: Products ────────────────────────────────────────────────────────

describe("Module 3.4 — Business Products (Max 5)", () => {
  test("Member: POST /v1/business-products — add product", async () => {
    if (!memberToken || !businessId) { console.log("Skipping products: no businessId"); return; }
    const { status, body } = await request("POST", "/v1/business-products", {
      businessId,
      name: "Web Development Package",
      description: "Full stack web development services",
      image: "https://via.placeholder.com/400x300.jpg",
      displayOrder: 0,
    }, memberToken);
    console.log("POST /v1/business-products →", status, JSON.stringify(body).slice(0, 300));
    productId = body.data?.id ?? "";
    expect(status).toBe(201);
    expect(body.data?.businessId).toBe(businessId);
  });

  test("Limit enforcement: Cannot add 6th product", async () => {
    if (!memberToken || !businessId) return;
    // Add products 2-5
    for (let i = 2; i <= 5; i++) {
      await request("POST", "/v1/business-products", {
        businessId,
        name: `Product ${i}`,
        description: `Product ${i} description`,
        displayOrder: i,
      }, memberToken);
    }
    // Try to add 6th
    const { status, body } = await request("POST", "/v1/business-products", {
      businessId,
      name: "Product 6 - Should Fail",
      description: "This should be rejected",
      displayOrder: 6,
    }, memberToken);
    console.log("6th product attempt →", status, body.message);
    expect(status).toBe(400);
    expect(body.message).toContain("Maximum");
  });

  test("Member: PUT /v1/business-products/:id — update product", async () => {
    if (!memberToken || !productId) return;
    const { status, body } = await request("PUT", `/v1/business-products/${productId}`, {
      businessId,
      name: "Web Development Package - Updated",
      description: "Updated full stack development",
      displayOrder: 0,
    }, memberToken);
    console.log("PUT /v1/business-products/:id →", status, JSON.stringify(body).slice(0, 200));
    expect(status).toBe(200);
  });
});

// ─── Stage 1: Services ────────────────────────────────────────────────────────

describe("Module 3.5 — Business Services (Max 5)", () => {
  test("Member: POST /v1/business-services — add service", async () => {
    if (!memberToken || !businessId) { console.log("Skipping services: no businessId"); return; }
    const { status, body } = await request("POST", "/v1/business-services", {
      businessId,
      name: "SEO Optimization",
      description: "Search engine optimization services",
      image: "https://via.placeholder.com/400x300.jpg",
      displayOrder: 0,
    }, memberToken);
    console.log("POST /v1/business-services →", status, JSON.stringify(body).slice(0, 300));
    serviceId = body.data?.id ?? "";
    expect(status).toBe(201);
    expect(body.data?.businessId).toBe(businessId);
  });

  test("Limit enforcement: Cannot add 6th service", async () => {
    if (!memberToken || !businessId) return;
    for (let i = 2; i <= 5; i++) {
      await request("POST", "/v1/business-services", {
        businessId,
        name: `Service ${i}`,
        description: `Service ${i} desc`,
        displayOrder: i,
      }, memberToken);
    }
    const { status, body } = await request("POST", "/v1/business-services", {
      businessId,
      name: "Service 6 - Should Fail",
      description: "This should be rejected",
      displayOrder: 6,
    }, memberToken);
    console.log("6th service attempt →", status, body.message);
    expect(status).toBe(400);
    expect(body.message).toContain("Maximum");
  });
});

// ─── Stage 2: Business Verification ──────────────────────────────────────────

describe("Module 3.6 — Business Verification (Admin)", () => {
  test("Admin: POST /v1/business-verification/:id/verify — approve", async () => {
    if (!adminToken || !businessId) { console.log("Skipping verify: no adminToken or businessId"); return; }
    const { status, body } = await request(
      "POST",
      `/v1/business-verification/${businessId}/verify`,
      { remarks: "All checks passed, approved by admin." },
      adminToken
    );
    console.log("POST verify →", status, JSON.stringify(body).slice(0, 300));
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  test("Member: POST /v1/business-verification/:id/verify — denied (403)", async () => {
    if (!memberToken || !businessId) return;
    const { status } = await request(
      "POST",
      `/v1/business-verification/${businessId}/verify`,
      { remarks: "Member trying to verify themselves" },
      memberToken
    );
    console.log("Member self-verify →", status);
    expect(status).toBe(403);
  });

  test("Admin: POST /v1/business-verification/:id/reject — reject", async () => {
    if (!adminToken || !businessId) return;
    const { status, body } = await request(
      "POST",
      `/v1/business-verification/${businessId}/reject`,
      { remarks: "Incomplete documentation provided." },
      adminToken
    );
    console.log("POST reject →", status, JSON.stringify(body).slice(0, 300));
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });
});

// ─── Stage 1: Search ─────────────────────────────────────────────────────────

describe("Module 3.9 — Business Search", () => {
  test("Public: GET /v1/business-search — returns verified businesses", async () => {
    const { status, body } = await request("GET", "/v1/business-search");
    console.log("GET /v1/business-search →", status, JSON.stringify(body).slice(0, 300));
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("Public: GET /v1/business-search?keyword=tech — filter by keyword", async () => {
    const { status, body } = await request("GET", "/v1/business-search?keyword=tech");
    console.log("Search keyword=tech →", status, `${body.data?.length ?? 0} results`);
    expect(status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("Public: GET /v1/business-search?categoryId=1 — filter by category", async () => {
    const { status, body } = await request("GET", `/v1/business-search?categoryId=${categoryId || 1}`);
    console.log("Search categoryId →", status, `${body.data?.length ?? 0} results`);
    expect(status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
  });
});

// ─── Stage 1: Analytics ───────────────────────────────────────────────────────

describe("Module 3.10 — Business Analytics", () => {
  test("Public: POST /v1/business-analytics/:id/click — track profile_view", async () => {
    if (!businessId) { console.log("Skipping analytics: no businessId"); return; }
    const { status, body } = await request("POST", `/v1/business-analytics/${businessId}/click`, {
      action: "profile_view",
    });
    console.log("POST analytics profile_view →", status, JSON.stringify(body).slice(0, 200));
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  test("Public: POST /v1/business-analytics/:id/click — track phone_click", async () => {
    if (!businessId) return;
    const { status } = await request("POST", `/v1/business-analytics/${businessId}/click`, {
      action: "phone_click",
    });
    expect(status).toBe(200);
  });

  test("Public: POST /v1/business-analytics/:id/click — track whatsapp_click", async () => {
    if (!businessId) return;
    const { status } = await request("POST", `/v1/business-analytics/${businessId}/click`, {
      action: "whatsapp_click",
    });
    expect(status).toBe(200);
  });

  test("Public: POST /v1/business-analytics/:id/click — track map_click", async () => {
    if (!businessId) return;
    const { status } = await request("POST", `/v1/business-analytics/${businessId}/click`, {
      action: "map_click",
    });
    expect(status).toBe(200);
  });

  test("Vendor: GET /v1/business-analytics/:id/summary — get analytics dashboard", async () => {
    if (!memberToken || !businessId) return;
    const { status, body } = await request("GET", `/v1/business-analytics/${businessId}/summary`, undefined, memberToken);
    console.log("GET analytics summary →", status, JSON.stringify(body).slice(0, 300));
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data?.businessId).toBe(businessId);
  });

  test("Invalid action: POST /v1/business-analytics/:id/click — rejected (400)", async () => {
    if (!businessId) return;
    const { status, body } = await request("POST", `/v1/business-analytics/${businessId}/click`, {
      action: "invalid_action",
    });
    console.log("Invalid action →", status, body.message);
    expect(status).toBe(400);
  });
});

// ─── Stage 2: Ownership & Authorization ───────────────────────────────────────

describe("Stage 2 — Authorization & Ownership", () => {
  test("Another member cannot update a business they don't own", async () => {
    if (!businessId) return;
    // Register a second member test account
    const other = await request("POST", "/v1/auth/register", {
      fullName: "Other Member",
      email: `other${Date.now()}@test.com`,
      password: "Other@1234",
      phone: "+910000000099",
    });
    const otherToken = other.body?.data?.session?.access_token ?? "";

    if (!otherToken) {
      console.log("Skipping ownership test: could not create second user");
      return;
    }

    const { status, body } = await request("PUT", `/v1/businesses/${businessId}`, {
      categoryId: categoryId || 1,
      businessName: "Hijacked Business Name",
      slug: `hijack-${Date.now()}`,
      phone: "+910000000001",
      address: "Hacker Avenue",
      districtId: 1,
    }, otherToken);
    console.log("Ownership violation →", status, body.message);
    expect(status).toBe(400); // Forbidden wrapped in 400
    expect(body.message).toContain("Forbidden");
  });

  test("Invalid UUID: GET /v1/businesses/not-a-uuid — 400 Bad Request", async () => {
    const { status, body } = await request("GET", "/v1/businesses/not-a-uuid");
    console.log("Invalid UUID →", status, body.message);
    expect(status).toBe(400);
  });

  test("Non-existent business: GET /v1/businesses/:id — 404 Not Found", async () => {
    const { status, body } = await request("GET", "/v1/businesses/00000000-0000-4000-a000-000000000000");
    console.log("Non-existent →", status, body.message);
    expect(status === 404 || status === 400).toBe(true);
  });

  test("Empty business name: POST /v1/businesses — validation error", async () => {
    if (!memberToken) return;
    const { status, body } = await request("POST", "/v1/businesses", {
      categoryId: 1,
      businessName: "",
      slug: "empty-name-test",
      phone: "+910000000001",
      address: "Test Address",
      districtId: 1,
    }, memberToken);
    console.log("Empty name validation →", status, body.message);
    expect(status).toBe(400);
  });
});

console.log("\n====================================================");
console.log("Feature 03 - Business Management E2E Test Suite");
console.log("Stage 1 (Functional) + Stage 2 (Authorization)");
console.log("====================================================\n");
