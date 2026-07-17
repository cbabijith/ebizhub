import { describe, test, expect, beforeAll } from "bun:test";
import { db } from "../src/config/database.js";
import { branches } from "../src/database/schema/branch.js";

const BASE_URL = "http://localhost:3001/api";
const ADMIN_EMAIL = "admin@test.com";
const ADMIN_PASSWORD = "Test@1234";
const MEMBER_EMAIL = "member@test.com";
const MEMBER_PASSWORD = "Member@1234";

let adminToken = "";
let memberToken = "";
let businessId = "";
let providerId = "";
let newsId = "";
let eventId = "";
let jobId = "";
let offerId = "";

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

  // Retrieve an existing business to test favorites
  const businessesRes = await req("GET", "/v1/discovery/businesses?limit=1");
  if (businessesRes.body?.data?.length > 0) {
    businessId = businessesRes.body.data[0].id;
  }

  // Retrieve an existing provider to test favorites
  const providersRes = await req("GET", "/v1/discovery/providers?limit=1");
  if (providersRes.body?.data?.length > 0) {
    providerId = providersRes.body.data[0].id;
  }

  // Retrieve home discovery sections to get news, event, job, offer IDs
  const homeRes = await req("GET", "/v1/discovery/home");
  if (homeRes.body?.data) {
    const data = homeRes.body.data;
    if (data.featuredNews?.length > 0) newsId = data.featuredNews[0].id;
    if (data.upcomingEvents?.length > 0) eventId = data.upcomingEvents[0].id;
    if (data.latestJobs?.length > 0) jobId = data.latestJobs[0].id;
    if (data.latestOffers?.length > 0) offerId = data.latestOffers[0].id;
  }
});

describe("Feature 07 — User Engagement (Phase 1: Favorites) E2E", () => {
  let favoriteId = "";

  test("Create favorite for business successfully", async () => {
    if (!businessId) return;

    const res = await req(
      "POST",
      "/v1/favorites",
      {
        resourceType: "business",
        resourceId: businessId,
      },
      memberToken
    );

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    favoriteId = res.body.data.id;
  });

  test("Reject duplicate favorite", async () => {
    if (!businessId) return;

    const res = await req(
      "POST",
      "/v1/favorites",
      {
        resourceType: "business",
        resourceId: businessId,
      },
      memberToken
    );

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test("List favorites for authenticated user", async () => {
    const res = await req("GET", "/v1/favorites", undefined, memberToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    
    if (businessId) {
      const favoritedBiz = res.body.data.find((f: any) => f.resourceId === businessId);
      expect(favoritedBiz).toBeDefined();
      expect(favoritedBiz.details).toBeDefined();
    }
  });

  test("Retrieve favorite count", async () => {
    if (!businessId) return;

    const res = await req("GET", `/v1/favorites/count/business/${businessId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBeGreaterThanOrEqual(1);
  });

  test("Reject removing other user's favorite", async () => {
    if (!favoriteId) return;

    const res = await req("DELETE", `/v1/favorites/${favoriteId}`, undefined, adminToken);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("Remove favorite successfully", async () => {
    if (!favoriteId) return;

    const res = await req("DELETE", `/v1/favorites/${favoriteId}`, undefined, memberToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("Feature 07 — User Engagement (Phase 2: Ratings & Reviews) E2E", () => {
  let ratingId = "";
  let reviewId = "";

  // ================= RATINGS TESTS =================
  test("Valid business rating creation", async () => {
    if (!businessId) return;
    const res = await req("POST", "/v1/ratings", {
      resourceType: "business",
      resourceId: businessId,
      rating: 4,
    }, memberToken);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(4);
    ratingId = res.body.data.id;
  });

  test("Valid service-provider rating creation", async () => {
    if (!providerId) return;
    const res = await req("POST", "/v1/ratings", {
      resourceType: "provider",
      resourceId: providerId,
      rating: 5,
    }, memberToken);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);

    await req("DELETE", `/v1/ratings/${res.body.data.id}`, undefined, memberToken);
  });

  test("Reject rating below 1", async () => {
    if (!businessId) return;
    const res = await req("POST", "/v1/ratings", {
      resourceType: "business",
      resourceId: businessId,
      rating: 0,
    }, memberToken);
    expect(res.status).toBe(400);
  });

  test("Reject rating above 5", async () => {
    if (!businessId) return;
    const res = await req("POST", "/v1/ratings", {
      resourceType: "business",
      resourceId: businessId,
      rating: 6,
    }, memberToken);
    expect(res.status).toBe(400);
  });

  test("Prevent duplicate active rating", async () => {
    if (!businessId) return;
    const res = await req("POST", "/v1/ratings", {
      resourceType: "business",
      resourceId: businessId,
      rating: 3,
    }, memberToken);
    expect(res.status).toBe(409);
  });

  test("Edit own rating successfully", async () => {
    if (!ratingId) return;
    const res = await req("PATCH", `/v1/ratings/${ratingId}`, {
      rating: 5,
    }, memberToken);
    expect(res.status).toBe(200);
    expect(res.body.data.rating).toBe(5);
  });

  test("Reject editing another user's rating", async () => {
    if (!ratingId) return;
    const res = await req("PATCH", `/v1/ratings/${ratingId}`, {
      rating: 2,
    }, adminToken);
    expect(res.status).toBe(403);
  });

  test("Get average rating and distribution summary", async () => {
    if (!businessId) return;
    const res = await req("GET", `/v1/ratings/business/${businessId}/summary`);
    expect(res.status).toBe(200);
    expect(res.body.data.average).toBe(5);
    expect(res.body.data.count).toBe(1);
    expect(res.body.data.distribution["5"]).toBe(1);
  });

  test("Delete own rating successfully", async () => {
    if (!ratingId) return;
    const res = await req("DELETE", `/v1/ratings/${ratingId}`, undefined, memberToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ================= REVIEWS TESTS =================
  test("Create review successfully", async () => {
    if (!businessId) return;
    const res = await req("POST", "/v1/reviews", {
      resourceType: "business",
      resourceId: businessId,
      content: "This is a great business E2E test review content.",
    }, memberToken);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe("This is a great business E2E test review content.");
    reviewId = res.body.data.id;
  });

  test("Edit own review successfully", async () => {
    if (!reviewId) return;
    const res = await req("PATCH", `/v1/reviews/${reviewId}`, {
      content: "This is the updated review content for the E2E test.",
    }, memberToken);

    expect(res.status).toBe(200);
    expect(res.body.data.content).toBe("This is the updated review content for the E2E test.");
  });

  test("Reject editing another user's review", async () => {
    if (!reviewId) return;
    const res = await req("PATCH", `/v1/reviews/${reviewId}`, {
      content: "Malicious edits.",
    }, adminToken);
    expect(res.status).toBe(403);
  });

  test("Report a review successfully", async () => {
    if (!reviewId) return;
    const res = await req("POST", `/v1/reviews/${reviewId}/report`, {
      reason: "Inappropriate review text.",
    }, memberToken);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test("Prevent duplicate report", async () => {
    if (!reviewId) return;
    const res = await req("POST", `/v1/reviews/${reviewId}/report`, {
      reason: "Inappropriate review text second time.",
    }, memberToken);
    expect(res.status).toBe(409);
  });

  test("Admin list of reported reviews", async () => {
    const res = await req("GET", "/v1/admin/reviews/reported", undefined, adminToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test("Admin moderation authorization check - reject non-admin", async () => {
    if (!reviewId) return;
    const res = await req("POST", `/v1/admin/reviews/${reviewId}/moderate`, {
      status: "rejected",
    }, memberToken);
    expect(res.status).toBe(403);
  });

  test("Admin moderate review successfully", async () => {
    if (!reviewId) return;
    const res = await req("POST", `/v1/admin/reviews/${reviewId}/moderate`, {
      status: "rejected",
    }, adminToken);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("rejected");
  });

  test("Soft-delete review successfully", async () => {
    if (!reviewId) return;
    const res = await req("DELETE", `/v1/reviews/${reviewId}`, undefined, memberToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("Feature 07 — User Engagement (Phase 3: Bookmarks) E2E", () => {
  let bookmarkId = "";

  test("Bookmark news successfully", async () => {
    if (!newsId) return;
    const res = await req("POST", "/v1/bookmarks", {
      resourceType: "news",
      resourceId: newsId,
    }, memberToken);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    bookmarkId = res.body.data.id;
  });

  test("Bookmark events successfully", async () => {
    if (!eventId) return;
    const res = await req("POST", "/v1/bookmarks", {
      resourceType: "event",
      resourceId: eventId,
    }, memberToken);
    expect(res.status).toBe(201);
    
    // Cleanup event bookmark
    await req("DELETE", `/v1/bookmarks/${res.body.data.id}`, undefined, memberToken);
  });

  test("Bookmark jobs successfully", async () => {
    if (!jobId) return;
    const res = await req("POST", "/v1/bookmarks", {
      resourceType: "job",
      resourceId: jobId,
    }, memberToken);
    expect(res.status).toBe(201);

    // Cleanup job bookmark
    await req("DELETE", `/v1/bookmarks/${res.body.data.id}`, undefined, memberToken);
  });

  test("Bookmark offers successfully", async () => {
    if (!offerId) return;
    const res = await req("POST", "/v1/bookmarks", {
      resourceType: "offer",
      resourceId: offerId,
    }, memberToken);
    expect(res.status).toBe(201);

    // Cleanup offer bookmark
    await req("DELETE", `/v1/bookmarks/${res.body.data.id}`, undefined, memberToken);
  });

  test("Reject duplicate bookmark", async () => {
    if (!newsId) return;
    const res = await req("POST", "/v1/bookmarks", {
      resourceType: "news",
      resourceId: newsId,
    }, memberToken);
    expect(res.status).toBe(409);
  });

  test("Reject invalid resource type", async () => {
    if (!newsId) return;
    const res = await req("POST", "/v1/bookmarks", {
      resourceType: "invalid_type",
      resourceId: newsId,
    }, memberToken);
    expect(res.status).toBe(400);
  });

  test("Reject nonexistent resource", async () => {
    const res = await req("POST", "/v1/bookmarks", {
      resourceType: "news",
      resourceId: "99999999-9999-4999-a999-999999999999",
    }, memberToken);
    expect(res.status).toBe(404);
  });

  test("List all bookmarks", async () => {
    const res = await req("GET", "/v1/bookmarks", undefined, memberToken);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test("Filter bookmarks by resource type", async () => {
    const res = await req("GET", "/v1/bookmarks/news", undefined, memberToken);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.every((b: any) => b.resourceType === "news")).toBe(true);
  });

  test("Pagination works on bookmarks list", async () => {
    const res = await req("GET", "/v1/bookmarks?limit=1&page=1", undefined, memberToken);
    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBe(1);
  });

  test("Reject deleting another user's bookmark", async () => {
    if (!bookmarkId) return;
    const res = await req("DELETE", `/v1/bookmarks/${bookmarkId}`, undefined, adminToken);
    expect(res.status).toBe(403);
  });

  test("Remove bookmark successfully", async () => {
    if (!bookmarkId) return;
    const res = await req("DELETE", `/v1/bookmarks/${bookmarkId}`, undefined, memberToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("Feature 07 — User Engagement (Phase 4: Share Links) E2E", () => {
  // All share links created in this suite are tracked and soft-deleted via the API at end.
  const createdShareLinkIds: string[] = [];
  let businessToken = "";
  let shareLinkId = "";

  test("Authenticated user creates a business share link", async () => {
    if (!businessId) return;
    const res = await req("POST", "/v1/share-links", {
      resourceType: "business",
      resourceId: businessId,
    }, memberToken);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.resourceType).toBe("business");
    expect(typeof res.body.data.token).toBe("string");
    expect(res.body.data.token.length).toBe(64); // 32 bytes hex
    businessToken = res.body.data.token;
    shareLinkId = res.body.data.id;
    createdShareLinkIds.push(res.body.data.id);
  });

  test("Authenticated user creates a service-provider share link", async () => {
    if (!providerId) return;
    const res = await req("POST", "/v1/share-links", {
      resourceType: "service-provider",
      resourceId: providerId,
    }, memberToken);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    createdShareLinkIds.push(res.body.data.id);
  });

  test("Authenticated user creates a news share link", async () => {
    if (!newsId) return;
    const res = await req("POST", "/v1/share-links", {
      resourceType: "news",
      resourceId: newsId,
    }, memberToken);

    expect(res.status).toBe(201);
    createdShareLinkIds.push(res.body.data.id);
  });

  test("Authenticated user creates an event share link", async () => {
    if (!eventId) return;
    const res = await req("POST", "/v1/share-links", {
      resourceType: "event",
      resourceId: eventId,
    }, memberToken);

    expect(res.status).toBe(201);
    createdShareLinkIds.push(res.body.data.id);
  });

  test("Authenticated user creates a job share link", async () => {
    if (!jobId) return;
    const res = await req("POST", "/v1/share-links", {
      resourceType: "job",
      resourceId: jobId,
    }, memberToken);

    expect(res.status).toBe(201);
    createdShareLinkIds.push(res.body.data.id);
  });

  test("Authenticated user creates an offer share link", async () => {
    if (!offerId) return;
    const res = await req("POST", "/v1/share-links", {
      resourceType: "offer",
      resourceId: offerId,
    }, memberToken);

    expect(res.status).toBe(201);
    createdShareLinkIds.push(res.body.data.id);
  });

  test("Unauthenticated creation is rejected", async () => {
    if (!businessId) return;
    const res = await req("POST", "/v1/share-links", {
      resourceType: "business",
      resourceId: businessId,
    }); // no token
    expect(res.status).toBe(401);
  });

  test("Invalid resource type is rejected", async () => {
    const res = await req("POST", "/v1/share-links", {
      resourceType: "invalid_type",
      resourceId: "99999999-9999-4999-a999-999999999999",
    }, memberToken);
    expect(res.status).toBe(400);
  });

  test("Invalid resource UUID is rejected", async () => {
    const res = await req("POST", "/v1/share-links", {
      resourceType: "business",
      resourceId: "not-a-uuid",
    }, memberToken);
    expect(res.status).toBe(400);
  });

  test("Missing/nonexistent resource is rejected", async () => {
    const res = await req("POST", "/v1/share-links", {
      resourceType: "business",
      resourceId: "99999999-9999-4999-a999-999999999999",
    }, memberToken);
    expect(res.status).toBe(404);
  });

  test("Valid token resolves successfully", async () => {
    if (!businessToken) return;
    const res = await req("GET", `/v1/share-links/${businessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.resourceType).toBe("business");
    expect(res.body.data.resourceId).toBe(businessId);
  });

  test("Unknown token returns 404", async () => {
    const fakeToken = "a".repeat(64); // valid format but unknown
    const res = await req("GET", `/v1/share-links/${fakeToken}`);
    expect(res.status).toBe(404);
  });

  test("Expired token is rejected", async () => {
    if (!businessId) return;
    // Create a link that expires in 1 second from now, then wait for it to expire
    const expiresAt = new Date(Date.now() + 1000).toISOString();
    const createRes = await req("POST", "/v1/share-links", {
      resourceType: "business",
      resourceId: businessId,
      expiresAt,
    }, memberToken);

    expect(createRes.status).toBe(201);
    const expiredToken = createRes.body.data.token;
    createdShareLinkIds.push(createRes.body.data.id);

    // Wait 1.5s for it to expire
    await new Promise(r => setTimeout(r, 1500));

    const resolveRes = await req("GET", `/v1/share-links/${expiredToken}`);
    expect(resolveRes.status).toBe(410);
  });

  test("Click tracking increments safely", async () => {
    if (!businessToken) return;
    const res1 = await req("POST", `/v1/share-links/${businessToken}/click`);
    expect(res1.status).toBe(200);
    expect(res1.body.data.clickCount).toBeGreaterThanOrEqual(1);

    const res2 = await req("POST", `/v1/share-links/${businessToken}/click`);
    expect(res2.status).toBe(200);
    expect(res2.body.data.clickCount).toBe(res1.body.data.clickCount + 1);
  });

  test("Deleted share link is rejected on resolve", async () => {
    if (!shareLinkId || !businessToken) return;

    // Soft-delete it via the API (owner)
    const deleteRes = await req("DELETE", `/v1/share-links/${shareLinkId}`, undefined, memberToken);
    expect(deleteRes.status).toBe(200);

    // Now try to resolve the token — must return 404
    const resolveRes = await req("GET", `/v1/share-links/${businessToken}`);
    expect(resolveRes.status).toBe(404);
  });

  test("Arbitrary redirect URL field is not accepted", async () => {
    // The API should not expose or process a redirectUrl field
    if (!businessId) return;
    const res = await req("POST", "/v1/share-links", {
      resourceType: "business",
      resourceId: businessId,
      redirectUrl: "https://evil.example.com/steal", // should be silently ignored or rejected
    }, memberToken);

    // 201 is fine (field ignored), or 400 (strict schema). The token in response must NOT contain the redirect.
    if (res.status === 201) {
      expect(res.body.data.redirectUrl).toBeUndefined();
      createdShareLinkIds.push(res.body.data.id);
    } else {
      expect(res.status).toBe(400);
    }
  });

  // Cleanup: soft-delete remaining share links via the API in parallel.
  // This only deletes the exact IDs created in this test run.
  test("Cleanup: soft-delete share links created by this test run", async () => {
    await Promise.all(
      createdShareLinkIds.map((id) =>
        req("DELETE", `/v1/share-links/${id}`, undefined, memberToken)
      )
    );
    // This test always passes — it is a safe teardown, not an assertion.
    expect(true).toBe(true);
  });
});

describe("Feature 07 — User Engagement (Phase 5: Email Notifications) E2E", () => {
  // Track IDs created in this test run for cleanup
  const createdTemplateIds: string[] = [];
  let templateId = "";
  const RUN_ID = Date.now().toString(36); // unique per test run

  // ── Template Management (admin) ────────────────────────────────────────────
  test("Admin creates an email template", async () => {
    const res = await req("POST", "/v1/email/templates", {
      templateKey: "welcome",
      subject: `Welcome {{name}} [test-${RUN_ID}]`,
      htmlBody: `<p>Hi {{name}}, welcome to EzhavaClub!</p>`,
      textBody: "Hi {{name}}, welcome!",
      variables: ["name", "email"],
    }, adminToken);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    templateId = res.body.data.id;
    createdTemplateIds.push(templateId);
  });

  test("Admin updates an email template", async () => {
    if (!templateId) return;
    const res = await req("PATCH", `/v1/email/templates/${templateId}`, {
      subject: `Welcome {{name}} [updated-${RUN_ID}]`,
    }, adminToken);

    expect(res.status).toBe(200);
    expect(res.body.data.subject).toContain("updated");
  });

  test("Admin lists templates", async () => {
    const res = await req("GET", "/v1/email/templates", undefined, adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("Non-admin cannot manage templates", async () => {
    const res = await req("POST", "/v1/email/templates", {
      templateKey: "welcome",
      subject: "Should not work",
      htmlBody: "<p>test</p>",
    }, memberToken);
    expect(res.status).toBe(403);
  });

  test("Unauthenticated cannot manage templates", async () => {
    const res = await req("GET", "/v1/email/templates");
    expect(res.status).toBe(401);
  });

  // ── Send email via admin endpoint ──────────────────────────────────────────
  test("Valid email send creates a log entry (development mode skips real delivery)", async () => {
    // In dev mode (EMAIL_ENABLED not set), emails are skipped, not sent
    // This verifies the full pipeline: template load → log create → provider → log update
    const res = await req("POST", "/v1/email/send", {
      templateKey: "welcome",
      recipientEmail: `testuser+${RUN_ID}@example.com`,
      variables: { name: "Test User", email: `testuser+${RUN_ID}@example.com` },
      idempotencyKey: `test-welcome-${RUN_ID}`,
    }, adminToken);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // In dev mode, status is "skipped" (no real send)
    expect(["skipped", "sent", "failed"]).toContain(res.body.data.status);
    expect(res.body.data.logId).toBeDefined();
  });

  test("Development mode does not send real emails (skipped status)", async () => {
    const res = await req("POST", "/v1/email/send", {
      templateKey: "welcome",
      recipientEmail: `devtest+${RUN_ID}@example.com`,
      variables: { name: "Dev User", email: `devtest+${RUN_ID}@example.com` },
      idempotencyKey: `dev-check-${RUN_ID}`,
    }, adminToken);

    expect(res.status).toBe(201);
    // EMAIL_ENABLED is not true in test env, so status must be skipped
    expect(res.body.data.status).toBe("skipped");
  });

  test("Idempotent send: duplicate key returns existing log", async () => {
    const iKey = `idem-test-${RUN_ID}`;
    const first = await req("POST", "/v1/email/send", {
      templateKey: "welcome",
      recipientEmail: `idem+${RUN_ID}@example.com`,
      variables: { name: "Idem User", email: `idem+${RUN_ID}@example.com` },
      idempotencyKey: iKey,
    }, adminToken);
    expect(first.status).toBe(201);

    const second = await req("POST", "/v1/email/send", {
      templateKey: "welcome",
      recipientEmail: `idem+${RUN_ID}@example.com`,
      variables: { name: "Idem User", email: `idem+${RUN_ID}@example.com` },
      idempotencyKey: iKey,
    }, adminToken);
    // Same idempotency key → returns the same logId
    expect(second.status).toBe(201);
    expect(second.body.data.logId).toBe(first.body.data.logId);
  });

  test("Missing template is handled safely (skipped log, no crash)", async () => {
    // Use a valid template key for which no DB template exists (e.g., contact-form)
    // The service should log as skipped without throwing
    const res = await req("POST", "/v1/email/send", {
      templateKey: "contact-form",
      recipientEmail: `notemplate+${RUN_ID}@example.com`,
      variables: { senderName: "A", senderEmail: "a@b.com", message: "hello" },
      idempotencyKey: `missing-tpl-${RUN_ID}`,
    }, adminToken);

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("skipped");
  });

  // ── Log management (admin) ─────────────────────────────────────────────────
  test("Admin lists email logs", async () => {
    const res = await req("GET", "/v1/email/logs", undefined, adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
  });

  test("Non-admin cannot view email logs", async () => {
    const res = await req("GET", "/v1/email/logs", undefined, memberToken);
    expect(res.status).toBe(403);
  });

  // ── Validation edge cases ──────────────────────────────────────────────────
  test("Invalid email address is rejected", async () => {
    const res = await req("POST", "/v1/email/send", {
      templateKey: "welcome",
      recipientEmail: "not-a-valid-email",
      variables: { name: "X" },
    }, adminToken);
    expect(res.status).toBe(400);
  });

  test("Unsupported email type is rejected", async () => {
    const res = await req("POST", "/v1/email/send", {
      templateKey: "arbitrary-hack-type",
      recipientEmail: "user@example.com",
    }, adminToken);
    expect(res.status).toBe(400);
  });

  test("Non-admin cannot send arbitrary emails", async () => {
    const res = await req("POST", "/v1/email/send", {
      templateKey: "welcome",
      recipientEmail: "user@example.com",
    }, memberToken);
    expect(res.status).toBe(403);
  });

  test("Sensitive values are not exposed in email log metadata", async () => {
    // Send an email with metadata; verify that log does NOT contain tokens or passwords
    const res = await req("POST", "/v1/email/send", {
      templateKey: "welcome",
      recipientEmail: `sensitivecheck+${RUN_ID}@example.com`,
      variables: { name: "Safe User", email: `sensitivecheck+${RUN_ID}@example.com` },
      idempotencyKey: `sensitive-${RUN_ID}`,
    }, adminToken);

    expect(res.status).toBe(201);
    const logId = res.body.data.logId;

    // Fetch the log via admin
    const logRes = await req("GET", `/v1/email/logs/${logId}`, undefined, adminToken);
    expect(logRes.status).toBe(200);

    const log = logRes.body.data;
    // The log must NOT contain the admin token (from Authorization header)
    expect(JSON.stringify(log)).not.toContain(adminToken);
    // No password fields — errorMessage may be null on skipped/sent logs, which is correct
    expect(log.errorMessage ?? "").not.toContain("password");
  });

  // ── Cleanup: soft-delete only templates created in this run ───────────────
  test("Cleanup: soft-delete email templates created by this test run", async () => {
    await Promise.all(
      createdTemplateIds.map((id) =>
        req("DELETE", `/v1/email/templates/${id}`, undefined, adminToken)
      )
    );
    expect(true).toBe(true);
  });
});


