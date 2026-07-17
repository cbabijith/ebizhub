# Project Roadmap

The implementation checklist and upcoming development roadmap for EBizHub (EzhavaClub).

---

## ✅ Completed Backend Functionality

* **Feature 01**: Supabase authentication and profile registration.
* **Feature 02**: Member directory, profile details, and branch mappings.
* **Feature 03**: Business listing directory, direct-to-customer contact options, and a limit of 5 products/services per vendor.
* **Feature 04**: Service provider profiles, skill catalogs, and service area configurations.
* **Feature 05**: Public discovery feeds, search index queries, caching, and category routing.
* **Feature 06**: Verification queue and moderation workflow.
* **Feature 07**: Favorites, Ratings, Reviews, Bookmarks, Share Links, and Email SMTP notifications.

---

## ⏳ Incomplete Areas & Technical Debt

* **Client Skeletons**: Frontend client web applications (`apps/admin-web`, `apps/user-web`) and mobile applications (`apps/admin-app`, `apps/user-app`) are skeletons containing boilerplate files only. They must be connected to the Backend API.
* **Authentication Integration**: Web and mobile clients need to implement login redirects and set up session-storage/cookies with Supabase JWT tokens.

---

## 🚀 Recommended Next Implementation Steps

1. **Client App Routing**: Configure the API client (`fetch`/`axios` wrapper) in `apps/admin-web` and `apps/user-web`.
2. **Admin Web Dashboard UI**: Build dashboard views for the verification queue, review reports, and email template configurations.
3. **User Web Discovery UI**: Build public search pages, business cards, and rating forms.
4. **Mobile API Integration**: Configure Dart networking packages in Flutter (`http` or `dio`) to integrate mobile screens with `/v1` endpoints.
