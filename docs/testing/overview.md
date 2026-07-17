# Testing System & Safety Guide

All integration and End-to-End (E2E) tests are executed using Bun's built-in test runner.

---

## 🧪 Test Execution Commands

To execute feature E2E tests, ensure the API backend is running locally on port 3001, then run:

```bash
# Run User Engagement (Favorites, Ratings, Reviews, Bookmarks, Share, Email) tests
bun test tests/engagement-e2e.test.ts

# Run Business listing verification tests
bun test tests/business-e2e.test.ts

# Run Service Provider directory tests
bun test tests/service-provider-e2e.test.ts
```

---

## 🔒 Strict Database safety rules

Because tests execute against the active development database, all test code must follow these safety constraints:

1. **NO Blanket Deletes**: Do not run `db.delete()` or `TRUNCATE` operations without a restrictive `WHERE` clause.
2. **NO Row Clears**: Do not delete pre-existing user records, listings, or templates.
3. **Unique Test Fixtures**: Every test run must generate unique data (e.g. appending a `Date.now().toString(36)` suffix to identifiers, emails, and names).
4. **Targeted Cleanup**: At the end of a test run, clean up only the records created during that run. Use the API's soft-delete endpoints to remove test records:
   * Delete test bookmarks: `DELETE /v1/bookmarks/:id`
   * Delete test ratings: `DELETE /v1/ratings/:id`
   * Delete test templates: `DELETE /v1/email/templates/:id`

---

## 📊 Verified Test Results
The engagement suite contains **69 tests** covering five engagement phases:
* Phase 1 (Favorites): 6 tests.
* Phase 2 (Ratings & Reviews): 18 tests.
* Phase 3 (Bookmarks): 12 tests.
* Phase 4 (Share Links): 17 tests.
* Phase 5 (Email Notifications): 16 tests.

All **69 tests pass** with 136 assertions verified against the local API.
