import { describe, test, expect, beforeAll } from "bun:test";
import { CacheService } from "../src/shared/cache/cache.js";
import { db } from "../src/config/database.js";
import { branches } from "../src/database/schema/branch.js";

const BASE_URL = "http://localhost:3001/api";

async function req(method: string, path: string, body?: any, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json() as any;
  return { status: res.status, body: json };
}

describe("Feature 05 Hardening & Production Readiness E2E & Unit Tests", () => {
  let validBranchId = "";

  beforeAll(async () => {
    // Dynamically fetch a valid branch ID from the database
    const list = await db.select().from(branches).limit(1);
    if (list.length > 0) {
      validBranchId = list[0].id;
    }
  });

  // 1. CacheService Direct Unit Tests
  describe("CacheService Unit Tests", () => {
    test("get/set/delete/clear and expiration works", async () => {
      CacheService.clear();
      CacheService.set("test-key", { foo: "bar" }, 1); // 1s TTL
      expect(CacheService.get<any>("test-key")).toEqual({ foo: "bar" });

      CacheService.delete("test-key");
      expect(CacheService.get("test-key")).toBeUndefined();

      CacheService.set("test-key-2", "baz", 1);
      CacheService.clear();
      expect(CacheService.get("test-key-2")).toBeUndefined();

      // Test expiration
      CacheService.set("test-exp", "value", 0.05); // 50ms TTL
      expect(CacheService.get("test-exp")).toBe("value");
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(CacheService.get("test-exp")).toBeUndefined();
    });

    test("key generation is deterministic and includes all params", () => {
      const key1 = CacheService.generateKey("prefix", { b: 2, a: 1 });
      const key2 = CacheService.generateKey("prefix", { a: 1, b: 2 });
      expect(key1).toBe("prefix:a:1|b:2");
      expect(key1).toBe(key2);
    });
  });

  // 2. Branch Validation
  describe("Branch Validation & Filtering", () => {
    test("Invalid branch format returns 400", async () => {
      const res = await req("GET", "/v1/discovery/home?branchId=invalid-uuid");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("Nonexistent branch UUID returns 404", async () => {
      const res = await req("GET", "/v1/discovery/home?branchId=6c1d0bde-7b1f-44eb-88a4-fb22e96025ba");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("Strict branch filtering - other branch listings are excluded", async () => {
      if (!validBranchId) return;
      // Query with a branchId
      const res = await req("GET", `/v1/discovery/businesses?branchId=${validBranchId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      // Ensure all returned items have matching branchId if populated
      const items = res.body.data || [];
      for (const item of items) {
        if (item.branchId) {
          expect(item.branchId).toBe(validBranchId);
        }
      }
    });

    test("Cache key isolation by branchId", async () => {
      if (!validBranchId) return;
      CacheService.clear();
      const res1 = await req("GET", `/v1/discovery/home?branchId=${validBranchId}`);
      expect(res1.status).toBe(200);

      // Verify that cache key generated includes the branchId
      const expectedKey = CacheService.generateKey("home:dashboard", { limit: 5, branchId: validBranchId });
      expect(CacheService.get(expectedKey)).toBeDefined();
    });
  });

  // 3. DTO Field Masking
  describe("DTO Field Masking & Safety", () => {
    test("Raw metadata and private fields must not be exposed", async () => {
      const res = await req("GET", "/v1/discovery/home");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkNoLeak = (item: any) => {
        expect(item.createdBy).toBeUndefined();
        expect(item.updatedBy).toBeUndefined();
        expect(item.deletedAt).toBeUndefined();
        expect(item.ownerId).toBeUndefined();
        expect(item.profileId).toBeUndefined();
        expect(item.memberId).toBeUndefined();
        expect(item.moderationHistory).toBeUndefined();
        expect(item.version).toBeUndefined();
      };

      const data = res.body.data;
      if (data.recentBusinesses && data.recentBusinesses.length > 0) {
        checkNoLeak(data.recentBusinesses[0]);
      }
      if (data.recentProviders && data.recentProviders.length > 0) {
        checkNoLeak(data.recentProviders[0]);
      }
    });
  });

  // 4. Input & Query Validations
  describe("Query Parameter Validations", () => {
    test("Invalid period returns 400", async () => {
      const res = await req("GET", "/v1/discovery/trending?period=180d");
      expect(res.status).toBe(400);
    });

    test("Invalid sort key returns 400", async () => {
      const res = await req("GET", "/v1/discovery/search?sort=invalid_sort");
      expect(res.status).toBe(400);
    });

    test("Invalid pagination limit > 100 returns 400", async () => {
      const res = await req("GET", "/v1/discovery/search?limit=101");
      expect(res.status).toBe(400);
    });

    test("Invalid UUID parameter in business detail returns 400", async () => {
      const res = await req("GET", "/v1/discovery/businesses/not-a-uuid");
      expect(res.status).toBe(400);
    });

    test("Search suggestions require min 2 chars", async () => {
      const res = await req("GET", "/v1/discovery/search/suggestions?q=a");
      expect(res.status).toBe(400);
    });
  });

  // 5. Visibility Rules
  describe("Visibility Rules Verification", () => {
    test("GET business by nonexistent or unverified ID returns 404", async () => {
      const res = await req("GET", "/v1/discovery/businesses/99999999-9999-4999-a999-999999999999");
      expect(res.status).toBe(404);
    });
  });

  // 6. Security Controls
  describe("Security Controls", () => {
    test("Unauthorized admin featured listing create returns 401/403", async () => {
      const res = await req("POST", "/v1/admin/featured", {
        entityId: "de305d54-75b4-431b-adb2-eb6b9e546013",
        entityType: "business",
      });
      expect([401, 403]).toContain(res.status);
    });
  });
});
