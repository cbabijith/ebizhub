# API Endpoint Reference

The backend API is served under the `/api` prefix. The base path prefix for versioned routes is `/api/v1`.

---

## 🔑 Authentication & Profiles

| Method | Route | Auth | Required Role | Purpose |
|---|---|---|---|---|
| `POST` | `/v1/auth/register` | Public | - | Register a new member profile |
| `POST` | `/v1/auth/login` | Public | - | Login and get JWT access token |
| `POST` | `/v1/auth/refresh` | Public | - | Refresh access token |
| `POST` | `/v1/auth/logout` | ✅ Auth | - | Expire current token session |
| `GET` | `/v1/auth/me` | ✅ Auth | - | Get current logged in profile |
| `GET` | `/v1/members/me` | ✅ Auth | - | Get current member details |
| `PUT` | `/v1/members/me` | ✅ Auth | - | Update member profile details |
| `POST` | `/v1/members/skills` | ✅ Auth | - | Add a skill to member profile |
| `DELETE` | `/v1/members/skills/:id`| ✅ Auth | - | Remove skill by ID |
| `POST` | `/v1/members/:id/verify`| ✅ Auth | `admin` | Verify member community status |
| `POST` | `/v1/members/:id/suspend`| ✅ Auth | `admin` | Suspend member account |

---

## 🏢 Business Management

| Method | Route | Auth | Required Role | Purpose |
|---|---|---|---|---|
| `GET` | `/v1/businesses/me` | ✅ Auth | - | Get currently owned business |
| `GET` | `/v1/businesses/:id` | Public | - | Get business detail by ID |
| `POST` | `/v1/businesses` | ✅ Auth | `vendor`, `admin`| Register a new business |
| `PUT` | `/v1/businesses/:id` | ✅ Auth | Owner / `admin` | Update business profile details |
| `DELETE`| `/v1/businesses/:id` | ✅ Auth | Owner / `admin` | Soft-delete business |
| `PATCH`| `/v1/businesses/:id/status`| ✅ Auth | `admin` | Verify/Moderate business status |

---

## 🛠️ Service Providers

| Method | Route | Auth | Required Role | Purpose |
|---|---|---|---|---|
| `GET` | `/v1/providers/me` | ✅ Auth | - | Get own provider profile |
| `POST` | `/v1/providers` | ✅ Auth | `vendor`, `admin`| Create provider listing |
| `PUT` | `/v1/providers/:id` | ✅ Auth | Owner / `admin` | Update provider details |
| `DELETE`| `/v1/providers/:id` | ✅ Auth | Owner / `admin` | Soft-delete provider profile |

---

## 🔍 Discovery Platform (Public)

| Method | Route | Auth | Query Parameters | Purpose |
|---|---|---|---|---|
| `GET` | `/v1/discovery/home` | Public | `limit`, `branchId` | Get home page sections |
| `GET` | `/v1/discovery/businesses`| Public | `limit`, `page`, `search` | Paginated business listings |
| `GET` | `/v1/discovery/businesses/:id`| Public | - | Get active business details |
| `GET` | `/v1/discovery/businesses/category/:slug`| Public | - | List businesses by category |
| `GET` | `/v1/discovery/providers` | Public | `limit`, `page`, `search` | Paginated provider listings |
| `GET` | `/v1/discovery/providers/:id`| Public | - | Get active provider details |
| `GET` | `/v1/discovery/providers/category/:slug`| Public| - | List providers by category |
| `GET` | `/v1/discovery/search` | Public | `q`, `type` | Search catalog index |
| `GET` | `/v1/discovery/search/suggestions`| Public| `q` | Search suggestions |
| `GET` | `/v1/discovery/categories` | Public | - | List all categories |
| `GET` | `/v1/discovery/categories/popular`| Public | - | List trending categories |

---

## ❤️ User Engagement

### Favorites
* `POST /v1/favorites` (Auth): Add business/provider to favorites. Body: `{ "resourceType": "business", "resourceId": "uuid" }`.
* `DELETE /v1/favorites/:id` (Auth): Remove favorite.
* `GET /v1/favorites` (Auth): List current user's favorites.
* `GET /v1/favorites/count/:resourceType/:resourceId` (Public): Get like count.

### Ratings & Reviews
* `POST /v1/ratings` (Auth): Rate resource 1-5. Body: `{ "resourceType": "business", "resourceId": "uuid", "value": 5 }`.
* `PATCH /v1/ratings/:id` (Auth): Update rating.
* `DELETE /v1/ratings/:id` (Auth): Soft-delete rating.
* `GET /v1/ratings/:resourceType/:resourceId/summary` (Public): Average rating.
* `POST /v1/reviews` (Auth): Write a review. Body: `{ "resourceType": "business", "resourceId": "uuid", "content": "Great!" }`.
* `POST /v1/reviews/:id/report` (Auth): Report review. Body: `{ "reason": "spam" }`.
* `GET /v1/admin/reviews/reported` (Admin): List reported reviews.
* `POST /v1/admin/reviews/:id/moderate` (Admin): Approve/reject review. Body: `{ "status": "approved" }`.

### Bookmarks
* `POST /v1/bookmarks` (Auth): Bookmark resource. Body: `{ "resourceType": "news", "resourceId": "uuid" }`.
* `GET /v1/bookmarks` (Auth): List bookmarks.
* `GET /v1/bookmarks/:resourceType` (Auth): Filter bookmarks by resource type.
* `DELETE /v1/bookmarks/:id` (Auth): Remove bookmark.

### Share Links
* `POST /v1/share-links` (Auth): Create share token. Body: `{ "resourceType": "business", "resourceId": "uuid", "expiresAt": "iso" }`.
* `GET /v1/share-links/:token` (Public): Resolve token details.
* `POST /v1/share-links/:token/click` (Public): Atomically increment click count.
* `DELETE /v1/share-links/:id` (Auth): Soft-delete share link.

### Email Notifications (Admin Only)
* `GET /v1/email/templates` — List templates.
* `POST /v1/email/templates` — Create template.
* `GET /v1/email/templates/:id` — Get template by ID.
* `PATCH /v1/email/templates/:id` — Update template.
* `DELETE /v1/email/templates/:id` — Soft-delete template.
* `POST /v1/email/send` — Send email manually using template variables.
* `GET /v1/email/logs` — List email logs.
* `GET /v1/email/logs/:id` — Get log by ID.
