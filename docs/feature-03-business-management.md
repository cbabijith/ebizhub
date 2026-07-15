# Feature 03 — Business Management

**Version:** v2.0  
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

| Method | Path               | Auth       | Description                   |
|--------|--------------------|------------|-------------------------------|
| GET    | `/`                | Public     | List active categories        |
| GET    | `/all`             | Admin      | List all categories           |
| POST   | `/`                | Admin      | Create category (auto-slug)   |
| PUT    | `/reorder`         | Admin      | Reorder categories            |
| PUT    | `/:id`             | Admin      | Update category               |
| DELETE | `/:id`             | Admin      | Soft-delete category          |
| PATCH  | `/:id/activate`    | Admin      | Activate category             |
| PATCH  | `/:id/deactivate`  | Admin      | Deactivate category           |

### Businesses — `/api/v1/businesses`

| Method | Path          | Auth     | Description                            |
|--------|---------------|----------|----------------------------------------|
| POST   | `/`           | Vendor/Admin | Register a new business (role-enforced) |
| GET    | `/me`         | Member   | List own businesses                    |
| GET    | `/:id`        | Public   | Get business public profile (hidden details) |
| PUT    | `/:id`        | Member   | Update own business (ownership/admin override) |
| DELETE | `/:id`        | Member   | Soft-delete own business (admin override) |
| PATCH  | `/:id/status` | Admin    | Admin sets business status             |

### Business Gallery — `/api/v1/business-gallery`

| Method | Path         | Auth   | Description                  |
|--------|--------------|--------|------------------------------|
| POST   | `/`          | Member | Add image (max 10 limit)     |
| PUT    | `/reorder`   | Member | Reorder gallery images       |
| DELETE | `/:id`       | Member | Delete gallery image         |

### Business Products — `/api/v1/business-products`

| Method | Path    | Auth   | Description                  |
|--------|---------|--------|------------------------------|
| POST   | `/`     | Member | Add product (max 5 limit)    |
| PUT    | `/:id`  | Member | Update product               |
| DELETE | `/:id`  | Member | Soft-delete product          |

### Business Services — `/api/v1/business-services`

| Method | Path    | Auth   | Description                  |
|--------|---------|--------|------------------------------|
| POST   | `/`     | Member | Add service (max 5 limit)    |
| PUT    | `/:id`  | Member | Update service               |
| DELETE | `/:id`  | Member | Soft-delete service          |

### Business Verification — `/api/v1/business-verification`

| Method | Path             | Auth  | Description                  |
|--------|------------------|-------|------------------------------|
| POST   | `/:id/verify`    | Admin | Approve business             |
| POST   | `/:id/reject`    | Admin | Reject with remarks          |

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
The `ProductService` and `ServiceService` methods query active count before inserting. If the count is already ≥ 5, they reject with a validation error.

### Max 10 Gallery Images
`GalleryService` checks `countImages` before inserting. If the count is already ≥ 10, it throws a validation error.

### Ownership Constraint & Admin Bypasses
All write operations on businesses, gallery, products, and services verify that the `ownerId === profile.id`. However, if the active user role is `admin`, the ownership check is bypassed to allow administrative moderation.

### Verification Status & Status Management
- Default: `pending`
- Admin can verify or reject a business listing.
- Admin can set a business status to `active`, `inactive`, or `suspended` via `PATCH /v1/businesses/:id/status`.

### Category Validation
Registering a business checks that the `categoryId` references a valid active business category.

### Slug Auto-Generation
If no category slug is provided on creation/update, it is automatically generated from the category name.

### Field Masking (Public Details)
Public business details fetched via `GET /v1/businesses/:id` use `findPublicById`, which excludes:
- `ownerId`
- `gstNumber`
- `registrationNumber`
- Internal verification metadata

---

## QA Test File

E2E integration tests: [`apps/api/tests/business-e2e.test.ts`](../apps/api/tests/business-e2e.test.ts)
Run with:
```bash
~/.bun/bin/bun test tests/business-e2e.test.ts
```
