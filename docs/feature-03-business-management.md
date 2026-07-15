# Feature 03 — Business Management

**Version:** v1.0  
**Status:** ✅ COMPLETED  
**Module Path:** `apps/api/src/features/business/`

---

## Overview

Feature 03 delivers the first real end-to-end business workflow on EBizHub. A community member registers their business, the admin verifies it, and it becomes discoverable to the public.

```
Member → Register Business → Admin Verifies → Public Discovery
```

---

## Architecture

All modules follow the established Repository → Service → Controller pattern inside `features/business/`:

```
features/business/
├── categories/      # Module 3.1 — Admin Category Management + Public List
├── businesses/      # Module 3.2 — Business Registration & CRUD
├── gallery/         # Module 3.3 — Multi-image Gallery
├── products/        # Module 3.4 — Products (Max 5 per business)
├── services/        # Module 3.5 — Services (Max 5 per business)
├── verification/    # Module 3.6 — Admin Approval Workflow
├── search/          # Module 3.9 — Public Search & Discovery
├── analytics/       # Module 3.10 — Click Interaction Tracking
└── index.ts         # Central re-exporter
```

Each sub-module contains: `validation.ts`, `repository.ts`, `service.ts`, `controller.ts`, `routes.ts`, `index.ts`

---

## API Endpoints

### Business Categories — `/api/v1/business-categories`

| Method | Path       | Auth       | Description               |
|--------|------------|------------|---------------------------|
| GET    | `/`        | Public     | List active categories    |
| GET    | `/all`     | Admin      | List all categories       |
| POST   | `/`        | Admin      | Create category           |
| PUT    | `/:id`     | Admin      | Update category           |
| DELETE | `/:id`     | Admin      | Soft-delete category      |

### Businesses — `/api/v1/businesses`

| Method | Path    | Auth     | Description                        |
|--------|---------|----------|------------------------------------|
| POST   | `/`     | Member   | Register a new business            |
| GET    | `/me`   | Member   | List own businesses                |
| GET    | `/:id`  | Public   | Get business public profile        |
| PUT    | `/:id`  | Member   | Update own business (ownership check) |
| DELETE | `/:id`  | Member   | Soft-delete own business           |

### Business Gallery — `/api/v1/business-gallery`

| Method | Path         | Auth   | Description              |
|--------|--------------|--------|--------------------------|
| POST   | `/`          | Member | Add image to gallery     |
| PUT    | `/reorder`   | Member | Reorder gallery images   |
| DELETE | `/:id`       | Member | Delete gallery image     |

### Business Products — `/api/v1/business-products`

| Method | Path    | Auth   | Description              |
|--------|---------|--------|--------------------------|
| POST   | `/`     | Member | Add product (max 5)      |
| PUT    | `/:id`  | Member | Update product           |
| DELETE | `/:id`  | Member | Soft-delete product      |

### Business Services — `/api/v1/business-services`

| Method | Path    | Auth   | Description              |
|--------|---------|--------|--------------------------|
| POST   | `/`     | Member | Add service (max 5)      |
| PUT    | `/:id`  | Member | Update service           |
| DELETE | `/:id`  | Member | Soft-delete service      |

### Business Verification — `/api/v1/business-verification`

| Method | Path             | Auth  | Description              |
|--------|------------------|-------|--------------------------|
| POST   | `/:id/verify`    | Admin | Approve business         |
| POST   | `/:id/reject`    | Admin | Reject with remarks      |

### Business Search — `/api/v1/business-search`

| Method | Path | Auth   | Description                                         |
|--------|------|--------|-----------------------------------------------------|
| GET    | `/`  | Public | Search by name, category, district, panchayat, keyword |

### Business Analytics — `/api/v1/business-analytics`

| Method | Path            | Auth   | Description                        |
|--------|-----------------|--------|------------------------------------|
| POST   | `/:id/click`    | Public | Track interaction click            |
| GET    | `/:id/summary`  | Member | Vendor analytics dashboard         |

---

## Business Rules Enforced

### Max 5 Products and Services
The `ProductService.addProduct()` and `ServiceService.addService()` methods query `countProducts(businessId)` / `countServices(businessId)` before inserting. If the count is already ≥ 5, they throw:
```
"Maximum of 5 products allowed per business"
"Maximum of 5 services allowed per business"
```

### Ownership Constraint
All write operations on businesses, gallery, products, and services verify:
```typescript
if (existing.ownerId !== ownerId) {
  throw new Error("Forbidden: You do not own this business");
}
```

### Verification Status
- Default: `pending`
- Admin can set to: `verified` or `rejected`
- Only `verified` businesses appear in public search results

### Slug Uniqueness
Both `business-categories` and `businesses` enforce unique slugs via pre-insert lookup. A `400` is returned if the slug already exists.

### UUID Parameter Validation
All `/:id` routes on businesses, gallery, products, and services use the Zod `validateParamId` middleware:
```typescript
z.object({ id: z.string().uuid("Invalid UUID format") })
```
Non-UUID values return `400 Bad Request` before hitting the database.

---

## Database Tables

| Table                  | Description                          |
|------------------------|--------------------------------------|
| `business_categories`  | Category taxonomy with soft-delete    |
| `businesses`           | Core business profiles                |
| `business_gallery`     | Image gallery per business            |
| `business_products`    | Products listing (max 5)              |
| `business_services`    | Services listing (max 5)              |
| `verification_requests`| Admin verification audit log          |
| `business_analytics`   | Aggregated interaction counters       |
| `interaction_logs`     | Detailed per-click event logs         |

---

## Analytics Click Actions

Tracked via `POST /api/v1/business-analytics/:id/click`:

```typescript
z.enum(["profile_view", "phone_click", "whatsapp_click", "map_click"])
```

Each click:
1. Writes a row to `interaction_logs` with IP + User-Agent
2. Upserts aggregate counters in `business_analytics`

Vendor retrieves totals via `GET /api/v1/business-analytics/:id/summary`

---

## QA Test File

E2E integration tests: [`scratch/test-businesses-e2e.ts`](../scratch/test-businesses-e2e.ts)

Run with:
```bash
~/.bun/bin/bun test ./scratch/test-businesses-e2e.ts
```
