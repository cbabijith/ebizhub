import { describe, test, expect, beforeAll } from "bun:test";

const BASE_URL = "http://localhost:3001/api";
const ADMIN_EMAIL = "admin@test.com";
const ADMIN_PASSWORD = "Test@1234";
const VENDOR_EMAIL = "vendor@test.com";
const VENDOR_PASSWORD = "Vendor@1234";
const MEMBER_EMAIL = "member@test.com";
const MEMBER_PASSWORD = "Member@1234";

let adminToken = "";
let vendorToken = "";
let memberToken = "";

let businessId = "";
let newsCategoryId = "";
let newsArticleId = "";
let newsArticleSlug = "test-slug-" + Date.now();
let eventId = "";
let registrationId = "";
let jobId = "";
let applicationId = "";
let offerId = "";
let noticeId = "";
let bannerId = "";

async function req(method: string, path: string, body?: any, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json: any = {};
  try { json = await res.json(); } catch { /* empty */ }
  return { status: res.status, body: json };
}

beforeAll(async () => {
  // Login all roles
  const adminLogin = await req("POST", "/v1/auth/login", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  adminToken = adminLogin.body?.data?.session?.access_token || "";

  const vendorLogin = await req("POST", "/v1/auth/login", { email: VENDOR_EMAIL, password: VENDOR_PASSWORD });
  vendorToken = vendorLogin.body?.data?.session?.access_token || "";

  const memberLogin = await req("POST", "/v1/auth/login", { email: MEMBER_EMAIL, password: MEMBER_PASSWORD });
  memberToken = memberLogin.body?.data?.session?.access_token || "";

  // Get first business category
  const catsRes = await req("GET", "/v1/business-categories");
  const bizCatId = catsRes.body?.data?.[0]?.id || 1;

  // Create a business for the vendor to ensure ownership check passes
  const createBizRes = await req("POST", "/v1/businesses", {
    categoryId: bizCatId,
    businessName: "Vendor E2E Business",
    slug: "vendor-e2e-business-" + Date.now(),
    phone: "+919876543210",
    address: "123 Vendor Lane",
    districtId: 1,
  }, vendorToken);

  if (createBizRes.status === 201) {
    businessId = createBizRes.body?.data?.id || "";
  } else {
    // Fallback: look up any business from listings
    const businessesRes = await req("GET", "/v1/discovery/businesses?limit=1");
    if (businessesRes.body?.data?.length > 0) {
      businessId = businessesRes.body.data[0].id;
    }
  }
});

describe("Community — Module 2: News Categories", () => {
  test("Admin: POST /v1/community/categories → 201 created", async () => {
    const slug = "test-cat-" + Date.now();
    const res = await req("POST", "/v1/community/categories", {
      name: "Community Events",
      slug,
      description: "Events happening in the local community",
      sortOrder: 1,
    }, adminToken);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    newsCategoryId = res.body.data.id;
  });

  test("Guest: POST /v1/community/categories → 401 unauthorized", async () => {
    const res = await req("POST", "/v1/community/categories", {
      name: "Guest Cat",
      slug: "guest-cat",
    });
    expect(res.status).toBe(401);
  });

  test("Vendor: POST /v1/community/categories → 403 forbidden", async () => {
    const res = await req("POST", "/v1/community/categories", {
      name: "Vendor Cat",
      slug: "vendor-cat",
    }, vendorToken);
    expect(res.status).toBe(403);
  });

  test("Public: GET /v1/community/categories → 200 list", async () => {
    const res = await req("GET", "/v1/community/categories");
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });
});

describe("Community — Module 1: News CRUD & Publishing", () => {
  test("Admin: POST /v1/community/news → 201 draft created", async () => {
    const res = await req("POST", "/v1/community/news", {
      title: "Local Community Updates Sprint 4",
      slug: newsArticleSlug,
      summary: "This is a summary of local activities.",
      content: "This is the main body content of the news article.",
      categoryId: newsCategoryId,
      status: "draft",
      tags: ["news", "sprint4"],
    }, adminToken);
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    newsArticleId = res.body.data.id;
  });

  test("Admin: PUT /v1/community/news/:id → 200 status flow to published", async () => {
    const res = await req("PUT", `/v1/community/news/${newsArticleId}`, {
      status: "published",
      featured: true,
      isPinned: true,
    }, adminToken);
    expect(res.status).toBe(200);
    expect(res.body.data.published).toBe(true);
    expect(res.body.data.status).toBe("published");
  });

  test("Public: GET /v1/community/news → 200 list published news", async () => {
    const res = await req("GET", "/v1/community/news");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("Public: GET /v1/community/news/slug/:slug → 200 detail and viewCount incremented", async () => {
    // First load to trigger increment
    await req("GET", `/v1/community/news/slug/${newsArticleSlug}`);
    
    // Small delay to ensure DB write
    await new Promise(resolve => setTimeout(resolve, 100));

    // Second load to check incremented value
    const res = await req("GET", `/v1/community/news/slug/${newsArticleSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Local Community Updates Sprint 4");
    expect(res.body.data.viewCount).toBe(1);
  });

  test("Public: POST /v1/community/news/:id/share → 200 shareCount incremented", async () => {
    const res = await req("POST", `/v1/community/news/${newsArticleId}/share`);
    expect(res.status).toBe(200);
    
    // Fetch again to verify share count
    const detail = await req("GET", `/v1/community/news/${newsArticleId}`);
    expect(detail.body.data.shareCount).toBe(1);
  });
});

describe("Community — Module 3 & 4: Events & Event Registration", () => {
  test("Admin: POST /v1/community/events → 201 created", async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 5);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 6);

    const res = await req("POST", "/v1/community/events", {
      title: "Business Expo 2026",
      description: "EzhavaClub Annual Business Seminar and Expo",
      venue: "Community Auditorium",
      categoryId: newsCategoryId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      registrationStart: new Date().toISOString(),
      registrationEnd: startDate.toISOString(),
      maxParticipants: 100,
      entryFee: "0",
      status: "upcoming",
    }, adminToken);
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    eventId = res.body.data.id;
  });

  test("Member: POST /v1/community/events/:id/register → 201 registered successfully", async () => {
    const res = await req("POST", `/v1/community/events/${eventId}/register`, {}, memberToken);
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    registrationId = res.body.data.id;
  });

  test("Member: POST /v1/community/events/:id/register duplicate → 400 rejected", async () => {
    const res = await req("POST", `/v1/community/events/${eventId}/register`, {}, memberToken);
    expect(res.status).toBe(400);
  });

  test("Admin: GET /v1/community/events/:id/registrations → 200 list", async () => {
    const res = await req("GET", `/v1/community/events/${eventId}/registrations`, null, adminToken);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("Admin: PUT /v1/community/events/registrations/:registrationId → 200 approved", async () => {
    const res = await req("PUT", `/v1/community/events/registrations/${registrationId}`, {
      status: "approved",
    }, adminToken);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("approved");
  });
});

describe("Community — Module 5 & 6: Jobs & Job Applications", () => {
  test("Vendor: POST /v1/community/jobs → 201 posted", async () => {
    if (!businessId) return;
    const res = await req("POST", "/v1/community/jobs", {
      businessId,
      title: "Senior Node.js Developer",
      description: "Join EzhavaClub tech team.",
      employmentType: "full_time",
      salaryFrom: 50000,
      salaryTo: 80000,
      experience: 3,
      vacancies: 2,
      closingDate: new Date(Date.now() + 10 * 86400000).toISOString(), // 10 days out
      status: "active",
    }, vendorToken);
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    jobId = res.body.data.id;
  });

  test("Member: POST /v1/community/jobs/:id/apply → 201 applied successfully", async () => {
    if (!jobId) return;
    const res = await req("POST", `/v1/community/jobs/${jobId}/apply`, {
      resume: "https://example.com/resume.pdf",
      coverLetter: "Interested in the Node role",
    }, memberToken);
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    applicationId = res.body.data.id;
  });

  test("Vendor: GET /v1/community/jobs/:id/applications → 200 list", async () => {
    if (!jobId) return;
    const res = await req("GET", `/v1/community/jobs/${jobId}/applications`, null, vendorToken);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("Vendor: PUT /v1/community/jobs/applications/:id → 200 shortlisted", async () => {
    if (!applicationId) return;
    const res = await req("PUT", `/v1/community/jobs/applications/${applicationId}`, {
      status: "shortlisted",
    }, vendorToken);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("shortlisted");
  });
});

describe("Community — Module 7 & 8: Offers & Notices", () => {
  test("Vendor: POST /v1/community/offers → 201 created", async () => {
    if (!businessId) return;
    const res = await req("POST", "/v1/community/offers", {
      businessId,
      title: "15% Special Discount",
      description: "Discount on all IT services.",
      discountType: "percentage",
      discountValue: "15",
      couponCode: "IT15",
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 10 * 86400000).toISOString(),
      status: "active",
      featured: true,
    }, vendorToken);
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    offerId = res.body.data.id;
  });

  test("Admin: POST /v1/community/notices → 201 created", async () => {
    const res = await req("POST", "/v1/community/notices", {
      title: "Emergency Volunteer Request",
      description: "Volunteers needed for blood donation drive tomorrow.",
      noticeType: "volunteer_request",
      priority: "critical",
      status: "active",
    }, adminToken);
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    noticeId = res.body.data.id;
  });
});

describe("Community — Module 9: Banner Management", () => {
  test("Admin: POST /v1/community/banners → 201 banner created", async () => {
    const res = await req("POST", "/v1/community/banners", {
      title: "Featured Expo Banner",
      image: "https://example.com/banner.png",
      redirectType: "event",
      redirectId: eventId || "5d7a8b41-e94f-4d9f-a63e-b81636c7a0df", // Fallback UUID if eventId is empty
      priority: 1,
      isActive: true,
    }, adminToken);
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    bannerId = res.body.data.id;
  });
});

describe("Community — Home & Search & Analytics Integration", () => {
  test("Public: GET /v1/discovery/home → 200 extended sections included", async () => {
    const res = await req("GET", "/v1/discovery/home?limit=5");
    expect(res.status).toBe(200);
    expect(res.body.data.topBanners).toBeDefined();
    expect(res.body.data.featuredNews).toBeDefined();
    expect(res.body.data.upcomingEvents).toBeDefined();
    expect(res.body.data.latestOffers).toBeDefined();
    expect(res.body.data.latestJobs).toBeDefined();
    expect(res.body.data.communityNotices).toBeDefined();
  });

  test("Public: GET /v1/discovery/search → 200 community results returned", async () => {
    const res = await req("GET", "/v1/discovery/search?q=Node");
    expect(res.status).toBe(200);
    expect(res.body.data.news).toBeDefined();
    expect(res.body.data.events).toBeDefined();
    expect(res.body.data.jobs).toBeDefined();
    expect(res.body.data.offers).toBeDefined();
    expect(res.body.data.notices).toBeDefined();
  });

  test("Public: POST /v1/community/analytics → 201 tracked", async () => {
    const res = await req("POST", "/v1/community/analytics", {
      entityType: "news_view",
      entityId: newsArticleId || "5a9790db-1fde-433e-8a75-a70efb76a3a7",
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
