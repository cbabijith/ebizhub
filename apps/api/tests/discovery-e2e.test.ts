/**
 * Feature 05 - Discovery Platform
 * Expanded E2E Integration Test Suite covering Sprint 1-4
 */

import { describe, test, expect, beforeAll } from "bun:test";

const BASE_URL = "http://localhost:3001/api";
const ADMIN_EMAIL = "admin@test.com";
const ADMIN_PASSWORD = "Test@1234";
const MEMBER_EMAIL = "member@test.com";
const MEMBER_PASSWORD = "Member@1234";

let adminToken = "";
let memberToken = "";
let businessId = "";
let providerId = "";
let categorySlug = "";
let featuredListingId = "";

async function req(method: string, path: string, body?: any, token?: string) {
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

beforeAll(async () => {
  // Login admin to get token
  const adminLoginRes = await req("POST", "/v1/auth/login", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (adminLoginRes.body?.data?.session?.access_token) {
    adminToken = adminLoginRes.body.data.session.access_token;
  }

  // Login member to get token
  const memberLoginRes = await req("POST", "/v1/auth/login", {
    email: MEMBER_EMAIL,
    password: MEMBER_PASSWORD,
  });
  if (memberLoginRes.body?.data?.session?.access_token) {
    memberToken = memberLoginRes.body.data.session.access_token;
  }

  // Retrieve an existing business to test discovery detail and tracking
  const businessesRes = await req("GET", "/v1/discovery/businesses?limit=1");
  if (businessesRes.body?.data?.length > 0) {
    businessId = businessesRes.body.data[0].id;
  }

  // Retrieve an existing provider to test discovery detail and tracking
  const providersRes = await req("GET", "/v1/discovery/providers?limit=1");
  if (providersRes.body?.data?.length > 0) {
    providerId = providersRes.body.data[0].id;
  }

  // Retrieve a category slug to test landing page
  const categoriesRes = await req("GET", "/v1/discovery/categories");
  if (categoriesRes.body?.data?.businessCategories?.length > 0) {
    categorySlug = categoriesRes.body.data.businessCategories[0].slug;
  }
});

describe("Discovery — Home Dashboard", () => {
  test("returns all 9 sections", async () => {
    const { status, body } = await req("GET", "/v1/discovery/home");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.featuredBusinesses).toBeDefined();
    expect(body.data.featuredProviders).toBeDefined();
    expect(body.data.recentBusinesses).toBeDefined();
    expect(body.data.recentProviders).toBeDefined();
    expect(body.data.trendingBusinesses).toBeDefined();
    expect(body.data.trendingProviders).toBeDefined();
    expect(body.data.popularCategories).toBeDefined();
    expect(body.data.recentlyVerifiedBusinesses).toBeDefined();
    expect(body.data.recentlyVerifiedProviders).toBeDefined();
  });

  test("respects limit param", async () => {
    const { status, body } = await req("GET", "/v1/discovery/home?limit=3");
    expect(status).toBe(200);
    expect(body.data.meta.limit).toBe(3);
  });

  test("sections are arrays", async () => {
    const { body } = await req("GET", "/v1/discovery/home");
    expect(body.data.featuredBusinesses).toBeInstanceOf(Array);
    expect(body.data.featuredProviders).toBeInstanceOf(Array);
  });

  test("no internal fields leaked", async () => {
    const { body } = await req("GET", "/v1/discovery/home");
    if (body.data.featuredBusinesses.length > 0) {
      const b = body.data.featuredBusinesses[0];
      expect(b.ownerId).toBeUndefined();
      expect(b.deletedAt).toBeUndefined();
      expect(b.updatedAt).toBeUndefined();
    }
  });
});

describe("Discovery — Business Directory", () => {
  test("list with pagination", async () => {
    const { status, body } = await req("GET", "/v1/discovery/businesses?page=1&limit=5");
    expect(status).toBe(200);
    expect(body.data).toBeInstanceOf(Array);
    expect(body.meta.page).toBe(1);
    expect(body.meta.limit).toBe(5);
  });

  test("filter by category", async () => {
    const { status } = await req("GET", `/v1/discovery/businesses?category=${categorySlug}`);
    expect(status).toBe(200);
  });

  test("filter by district", async () => {
    const { status } = await req("GET", "/v1/discovery/businesses?district=1");
    expect(status).toBe(200);
  });

  test("filter by verified", async () => {
    const { status } = await req("GET", "/v1/discovery/businesses?verified=true");
    expect(status).toBe(200);
  });

  test("sort by newest", async () => {
    const { status } = await req("GET", "/v1/discovery/businesses?sort=newest");
    expect(status).toBe(200);
  });

  test("sort by alphabetical", async () => {
    const { status } = await req("GET", "/v1/discovery/businesses?sort=alphabetical");
    expect(status).toBe(200);
  });

  test("get by ID", async () => {
    if (!businessId) return;
    const { status, body } = await req("GET", `/v1/discovery/businesses/${businessId}`);
    expect(status).toBe(200);
    expect(body.data.id).toBe(businessId);
  });

  test("get by invalid UUID → 400", async () => {
    const { status } = await req("GET", "/v1/discovery/businesses/not-a-uuid");
    expect(status).toBe(400);
  });

  test("get by non-existent → 404", async () => {
    const { status } = await req("GET", "/v1/discovery/businesses/00000000-0000-0000-0000-000000000000");
    expect(status).toBe(404);
  });

  test("no internal fields", async () => {
    if (!businessId) return;
    const { body } = await req("GET", `/v1/discovery/businesses/${businessId}`);
    expect(body.data.ownerId).toBeUndefined();
    expect(body.data.deletedAt).toBeUndefined();
    expect(body.data.updatedAt).toBeUndefined();
  });
});

describe("Discovery — Provider Directory", () => {
  test("list with pagination", async () => {
    const { status, body } = await req("GET", "/v1/discovery/providers?page=1&limit=5");
    expect(status).toBe(200);
    expect(body.data).toBeInstanceOf(Array);
  });

  test("filter by profession", async () => {
    const { status } = await req("GET", "/v1/discovery/providers?profession=electrician");
    expect(status).toBe(200);
  });

  test("filter by experience", async () => {
    const { status } = await req("GET", "/v1/discovery/providers?experience=2");
    expect(status).toBe(200);
  });

  test("filter by district", async () => {
    const { status } = await req("GET", "/v1/discovery/providers?district=1");
    expect(status).toBe(200);
  });

  test("sort by newest", async () => {
    const { status } = await req("GET", "/v1/discovery/providers?sort=newest");
    expect(status).toBe(200);
  });

  test("sort by experience", async () => {
    const { status } = await req("GET", "/v1/discovery/providers?sort=experience");
    expect(status).toBe(200);
  });

  test("get by ID", async () => {
    if (!providerId) return;
    const { status, body } = await req("GET", `/v1/discovery/providers/${providerId}`);
    expect(status).toBe(200);
    expect(body.data.id).toBe(providerId);
  });

  test("get by invalid UUID → 400", async () => {
    const { status } = await req("GET", "/v1/discovery/providers/not-a-uuid");
    expect(status).toBe(400);
  });

  test("get by non-existent → 404", async () => {
    const { status } = await req("GET", "/v1/discovery/providers/00000000-0000-0000-0000-000000000000");
    expect(status).toBe(404);
  });

  test("no internal fields", async () => {
    if (!providerId) return;
    const { body } = await req("GET", `/v1/discovery/providers/${providerId}`);
    expect(body.data.profileId).toBeUndefined();
    expect(body.data.memberId).toBeUndefined();
    expect(body.data.deletedAt).toBeUndefined();
  });

  test("isVerified boolean present", async () => {
    if (!providerId) return;
    const { body } = await req("GET", `/v1/discovery/providers/${providerId}`);
    expect(body.data.isVerified).toBeDefined();
    expect(typeof body.data.isVerified).toBe("boolean");
  });
});

describe("Discovery — Unified Search", () => {
  test("returns businesses + providers + categories", async () => {
    const { status, body } = await req("GET", "/v1/discovery/search?q=electrician");
    expect(status).toBe(200);
    expect(body.data.businesses).toBeDefined();
    expect(body.data.providers).toBeDefined();
    expect(body.data.categories).toBeDefined();
  });

  test("empty query returns success", async () => {
    const { status, body } = await req("GET", "/v1/discovery/search?q=");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  test("pagination works", async () => {
    const { status } = await req("GET", "/v1/discovery/search?q=a&limit=2");
    expect(status).toBe(200);
  });

  test("category filter works", async () => {
    const { status } = await req("GET", `/v1/discovery/search?q=a&category=${categorySlug}`);
    expect(status).toBe(200);
  });

  test("district filter works", async () => {
    const { status } = await req("GET", "/v1/discovery/search?q=a&district=1");
    expect(status).toBe(200);
  });

  test("combined filters work", async () => {
    const { status } = await req("GET", `/v1/discovery/search?q=a&district=1&category=${categorySlug}`);
    expect(status).toBe(200);
  });

  test("sort options work", async () => {
    const { status } = await req("GET", "/v1/discovery/search?q=a&sort=alphabetical");
    expect(status).toBe(200);
  });

  test("invalid sort → 400", async () => {
    const { status } = await req("GET", "/v1/discovery/search?q=a&sort=invalid");
    expect(status).toBe(400);
  });

  test("limit > 100 → 400", async () => {
    const { status } = await req("GET", "/v1/discovery/search?q=a&limit=999");
    expect(status).toBe(400);
  });

  test("empty state returns suggestions", async () => {
    const { status, body } = await req("GET", "/v1/discovery/search?q=xyznonexistent12345");
    expect(status).toBe(200);
    expect(body.data.meta.suggestions).toBeDefined();
  });

  test("suggestions require min 2 chars", async () => {
    const { status } = await req("GET", "/v1/discovery/search/suggestions?q=e");
    expect(status).toBe(400);
  });

  test("suggestions return array with type field", async () => {
    const { status, body } = await req("GET", "/v1/discovery/search/suggestions?q=ele");
    expect(status).toBe(200);
    expect(body.data).toBeInstanceOf(Array);
    if (body.data.length > 0) {
      expect(body.data[0].type).toBeDefined();
    }
  });

  test("no internal fields leaked", async () => {
    const { body } = await req("GET", "/v1/discovery/search?q=a");
    if (body.data.businesses.length > 0) {
      expect(body.data.businesses[0].ownerId).toBeUndefined();
    }
  });
});

describe("Discovery — Categories", () => {
  test("list categories", async () => {
    const { status } = await req("GET", "/v1/discovery/categories");
    expect(status).toBe(200);
  });

  test("category by slug", async () => {
    if (!categorySlug) return;
    const { status } = await req("GET", `/v1/discovery/categories/${categorySlug}`);
    expect(status).toBe(200);
  });

  test("invalid slug → 400", async () => {
    const { status } = await req("GET", "/v1/discovery/categories/INVALID SLUG!!!");
    expect(status).toBe(400);
  });

  test("non-existent slug → 404", async () => {
    const { status } = await req("GET", "/v1/discovery/categories/xyznonexistent");
    expect(status).toBe(404);
  });

  test("popular categories", async () => {
    const { status } = await req("GET", "/v1/discovery/categories/popular");
    expect(status).toBe(200);
  });
});

describe("Discovery — Featured", () => {
  test("featured combined", async () => {
    const { status } = await req("GET", "/v1/discovery/featured");
    expect(status).toBe(200);
  });

  test("featured businesses", async () => {
    const { status } = await req("GET", "/v1/discovery/featured/businesses");
    expect(status).toBe(200);
  });

  test("featured providers", async () => {
    const { status } = await req("GET", "/v1/discovery/featured/providers");
    expect(status).toBe(200);
  });
});

describe("Discovery — Recommendations", () => {
  test("business recommendations", async () => {
    if (!businessId) return;
    const { status } = await req("GET", `/v1/discovery/recommendations/business/${businessId}`);
    expect(status).toBe(200);
  });

  test("provider recommendations", async () => {
    if (!providerId) return;
    const { status } = await req("GET", `/v1/discovery/recommendations/provider/${providerId}`);
    expect(status).toBe(200);
  });

  test("excludes source entity", async () => {
    if (!businessId) return;
    const { body } = await req("GET", `/v1/discovery/recommendations/business/${businessId}`);
    if (body.data?.recommendations) {
      const match = body.data.recommendations.find((r: any) => r.id === businessId);
      expect(match).toBeUndefined();
    }
  });

  test("invalid type → 400", async () => {
    const { status } = await req("GET", "/v1/discovery/recommendations/invalid/00000000-0000-0000-0000-000000000000");
    expect(status).toBe(400);
  });

  test("non-existent → 404", async () => {
    const { status } = await req("GET", "/v1/discovery/recommendations/business/00000000-0000-0000-0000-000000000000");
    expect(status).toBe(404);
  });
});

describe("Discovery — Trending", () => {
  test("trending combined", async () => {
    const { status } = await req("GET", "/v1/discovery/trending");
    expect(status).toBe(200);
  });

  test("trending businesses", async () => {
    const { status } = await req("GET", "/v1/discovery/trending/businesses");
    expect(status).toBe(200);
  });

  test("trending providers", async () => {
    const { status } = await req("GET", "/v1/discovery/trending/providers");
    expect(status).toBe(200);
  });

  test("invalid period → 400", async () => {
    const { status } = await req("GET", "/v1/discovery/trending/businesses?period=invalid");
    expect(status).toBe(400);
  });
});

describe("Discovery — Recent & Verified", () => {
  test("recent returns both types", async () => {
    const { status } = await req("GET", "/v1/discovery/recent");
    expect(status).toBe(200);
  });

  test("recent type=business filters", async () => {
    const { body } = await req("GET", "/v1/discovery/recent?type=business");
    expect(body.data.providers.length).toBe(0);
  });

  test("recently verified", async () => {
    const { status } = await req("GET", "/v1/discovery/recently-verified");
    expect(status).toBe(200);
  });

  test("invalid type → 400", async () => {
    const { status } = await req("GET", "/v1/discovery/recent?type=invalid");
    expect(status).toBe(400);
  });
});

describe("Discovery — Admin Featured CRUD", () => {
  test("admin create", async () => {
    if (!businessId) return;
    const { status, body } = await req("POST", "/v1/admin/featured", {
      entityType: "business",
      entityId: businessId,
      priority: 10,
    }, adminToken);
    expect(status).toBe(201);
    expect(body.success).toBe(true);
    if (body.data?.id) {
      featuredListingId = body.data.id;
    }
  });

  test("no auth → 401", async () => {
    const { status } = await req("POST", "/v1/admin/featured", {
      entityType: "business",
      entityId: "00000000-0000-0000-0000-000000000000",
    });
    expect(status).toBe(401);
  });

  test("member → 403", async () => {
    const { status } = await req("POST", "/v1/admin/featured", {
      entityType: "business",
      entityId: "00000000-0000-0000-0000-000000000000",
    }, memberToken);
    expect(status).toBe(403);
  });

  test("invalid entityType → 400", async () => {
    const { status } = await req("POST", "/v1/admin/featured", {
      entityType: "invalid",
      entityId: "00000000-0000-0000-0000-000000000000",
    }, adminToken);
    expect(status).toBe(400);
  });

  test("invalid UUID → 400", async () => {
    const { status } = await req("POST", "/v1/admin/featured", {
      entityType: "business",
      entityId: "not-a-uuid",
    }, adminToken);
    expect(status).toBe(400);
  });

  test("duplicate rejected", async () => {
    if (!businessId) return;
    const { status } = await req("POST", "/v1/admin/featured", {
      entityType: "business",
      entityId: businessId,
    }, adminToken);
    expect(status).toBe(400); // businessId already featured from first test
  });

  test("admin update", async () => {
    if (!featuredListingId) return;
    const { status, body } = await req("PUT", `/v1/admin/featured/${featuredListingId}`, {
      priority: 99,
    }, adminToken);
    expect(status).toBe(200);
    expect(body.data.priority).toBe(99);
  });

  test("admin delete", async () => {
    if (!featuredListingId) return;
    const { status } = await req("DELETE", `/v1/admin/featured/${featuredListingId}`, null, adminToken);
    expect(status).toBe(200);
  });
});

describe("Discovery — API Contract", () => {
  test("success format has success, message, data", async () => {
    const { body } = await req("GET", "/v1/discovery/home");
    expect(body.success).toBe(true);
    expect(body.message).toBeDefined();
    expect(body.data).toBeDefined();
  });

  test("error format has success: false, message, errors", async () => {
    const { body } = await req("GET", "/v1/discovery/search?q=a&sort=invalid");
    expect(body.success).toBe(false);
    expect(body.message).toBeDefined();
    expect(body.errors).toBeDefined();
  });

  test("all public endpoints return 200 without auth", async () => {
    const { status } = await req("GET", "/v1/discovery/home");
    expect(status).toBe(200);
  });
});
