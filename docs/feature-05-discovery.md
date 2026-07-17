# Feature 05 — Discovery Platform

**Version:** v1.1  
**Status:** ⚠️ Functionally complete — production hardening pending  
**Module Path:** `apps/api/src/features/discovery/`

## Overview
Unified public discovery layer for businesses, service providers, and Community Engagement content.

## Architecture
- Read-only layer on top of Feature 03 (Business), Feature 04 (Service Providers), and the Community Engagement Platform.
- FDD structure: `features/discovery/{home,business-directory,provider-directory,search,categories,featured,recommendations,trending,recent,popular-categories,analytics}`.
- Mounted at `/api/v1/discovery`; featured-listing administration is mounted at `/api/v1/admin/featured`.

## Endpoints

### Public Endpoints
| Method | Path | Description |
|---|---|---|
| GET | /v1/discovery/home | Home dashboard aggregation |
| GET | /v1/discovery/businesses | Business directory listing |
| GET | /v1/discovery/businesses/:id | Business public profile |
| GET | /v1/discovery/businesses/category/:slug | Businesses by category |
| GET | /v1/discovery/providers | Provider directory listing |
| GET | /v1/discovery/providers/:id | Provider public profile |
| GET | /v1/discovery/providers/category/:slug | Providers by category |
| GET | /v1/discovery/search | Unified search |
| GET | /v1/discovery/search/suggestions | Search suggestions |
| GET | /v1/discovery/categories | All categories |
| GET | /v1/discovery/categories/popular | Popular categories |
| GET | /v1/discovery/categories/:slug | Category landing page |
| GET | /v1/discovery/featured | Featured listings |
| GET | /v1/discovery/featured/businesses | Featured businesses |
| GET | /v1/discovery/featured/providers | Featured providers |
| GET | /v1/discovery/recommendations/:type/:id | Recommendations |
| GET | /v1/discovery/trending | Trending listings |
| GET | /v1/discovery/trending/businesses | Trending businesses |
| GET | /v1/discovery/trending/providers | Trending providers |
| GET | /v1/discovery/recent | Recently added |
| GET | /v1/discovery/recently-verified | Recently verified |
| GET | /v1/discovery/popular-categories | Popular categories |
| POST | /v1/discovery/businesses/:id/click | Track business interaction event |
| POST | /v1/discovery/providers/:id/click | Track provider interaction event |

### Admin Endpoints
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | /v1/admin/featured | Create featured | admin |
| PUT | /v1/admin/featured/:id | Update featured | admin |
| DELETE | /v1/admin/featured/:id | Delete featured | admin |

## Community Engagement Integration

### Home Dashboard Sections
`GET /v1/discovery/home` now returns the original directory sections plus the following Community Engagement sections:

| Field | Contents | Current selection rule |
|---|---|---|
| `topBanners` | Active promotional banners | Active, non-deleted, within start/end date range; lowest priority first |
| `featuredNews` | Featured community news | Published, featured, non-deleted; newest published first |
| `upcomingEvents` | Upcoming events | Upcoming, non-deleted, future start date; earliest first |
| `latestOffers` | Current offers | Active, non-deleted, unexpired; newest first |
| `latestJobs` | Current jobs | Active, non-deleted; newest first |
| `communityNotices` | Community notices | Active, non-deleted; priority then newest |

### Unified Search Results
`GET /v1/discovery/search?q=...` also returns `news`, `events`, `jobs`, `offers`, and `notices`, with matching totals in `meta`.

## Filters
### Business Filters
| Param | Type | Example |
|---|---|---|
| category | string/int | ?category=grocery |
| district | int | ?district=1 |
| panchayat | int | ?panchayat=5 |
| verified | boolean | ?verified=true |
| featured | boolean | ?featured=true |

### Provider Filters
| Param | Type | Example |
|---|---|---|
| profession | string | ?profession=electrician |
| category | string/int | ?category=plumbing |
| experience | int | ?experience=5 |
| district | int | ?district=1 |
| panchayat | int | ?panchayat=5 |
| availability | string | ?availability=available |
| verified | boolean | ?verified=true |

## Global Filters
| Param | Type | Default | Validation |
|---|---|---|---|
| q | string | "" | max 100 |
| sort | enum | newest | newest, oldest, alphabetical, popular, experience |
| page | int | 1 | min 1 |
| limit | int | 20 | min 1, max 100 |

## Response Format
### Success
```json
{ "success": true, "message": "...", "data": {}, "meta": {} }
```
### Error
```json
{ "success": false, "message": "...", "errors": [] }
```

## Security
- Public discovery endpoints do not require authentication; featured-listing administration requires JWT and the `admin` role.
- Featured, trending, recent, recently verified, popular-category, and recommendation queries restrict source listings to active, verified, non-deleted records.
- Directory endpoints default to active, non-deleted records and support `verified=true` as an explicit filter.
- Business and provider response mappers expose `isVerified` rather than raw verification status.

## Verified Implementation Status
- **Implemented:** all documented directory, category, search, featured, recommendation, trending, recent, popular-category, and interaction-tracking routes are wired into the API router.
- **Implemented:** the Community Engagement home and search integrations are present and covered by the Community E2E suite.
- **Validated:** `bun run tsc --noEmit` completed successfully after the integration changes.
- **Previously executed:** `apps/api/tests/discovery-e2e.test.ts` was run in the active development session. This document does not treat its historical result as a replacement for production hardening.

## Pending Before Production Release

1. **Apply the trending period filter.** The `period` query parameter is validated and converted to days, but the trending repository currently ranks lifetime aggregate counters without using the supplied period.
2. **Mask Community Engagement response fields.** The home dashboard and unified search currently return raw Community Engagement table rows. Add public DTO mappers so author/editor identifiers, branch metadata, lifecycle fields, and soft-delete fields are not exposed unintentionally.
3. **Add branch-aware discovery behaviour.** Community modules support branch filtering, but the discovery home and search integrations do not accept or apply a branch context. Define whether public discovery is global or branch-scoped, then implement and test that decision.
4. **Expand Feature 05 regression coverage.** `discovery-e2e.test.ts` still validates the pre-Community contract. Add assertions for all six new home sections, five new search arrays/totals, public-field masking, active/date visibility, and branch behaviour.
5. **Remove the provider-search N+1 query.** Provider search reads skills once per result; replace that loop with a grouped query or batched lookup before scaling the endpoint.

## Database
- No duplicate tables — reuses Feature 03/04 schemas
- New table: featured_listings (Sprint 3)
- New table: search_analytics (Sprint 2)
- Indexes on all filter/sort columns
