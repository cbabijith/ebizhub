# Core Feature Modules

This section details the design, constraints, and operational guidelines for each business-functional component of the EBizHub platform.

---

## 🔐 Feature 01: Authentication & Identity
* **Purpose**: Registers profiles, handles logins, updates session tokens, and validates community status via Supabase Auth integration.
* **Database Tables**: `profiles` (generic account table).
* **Workflows**:
  * Member sign up -> profile created with status = `active` and role = `customer`.
  * Email OTP verification -> optional secondary channel.

---

## 👥 Feature 02: Member Profile
* **Purpose**: Coordinates community details, branch designations, and member verification.
* **Database Tables**: `members` (Community details references `profiles`), `branches` (Branches listing).
* **Constraints**: Regular members cannot modify branch assignments, status, joined date, or membership IDs. Updates are parsed and stripped of protected parameters.
* **Life Cycle**: Registered -> Verified (Approved by Admin) -> Suspended (Restricted from write endpoints).

---

## 🏢 Feature 03: Business Management
* **Purpose**: Allows registered members to promote local businesses and list products/services.
* **Database Tables**: `businesses` (Business profiles), `business_products` (Products list), `business_services` (Services list).
* **Business Constraints**:
  * **CAPPED AT 5**: A vendor profile is strictly capped at a maximum of 5 products or services combined. Attempts to exceed this are blocked by the service validation logic.
  * **CONTACT INFO**: Business detail queries always return direct-to-customer communications (Google Maps link, phone number, WhatsApp contact).
  * **VERIFICATION ONLY**: Listings must be verified/approved by an admin to appear in public directory feeds.

---

## 🛠️ Feature 04: Service Providers
* **Purpose**: Facilitates freelancers, technicians, and independent professionals listing their skills.
* **Database Tables**: `service_providers` (Providers profile), `service_provider_skills` (Skills list), `service_provider_portfolio` (Portfolio listing), `service_provider_areas` (Operational service areas).
* **Constraints**: Admin must approve provider status. Inactive/Suspended providers are hidden from discovery directory pages.

---

## 🔍 Feature 05: Discovery Platform
* **Purpose**: Provides public search, category sorting, recommendations, and homepage dashboard feeds.
* **Database Tables**: Reads all community data (`community_news`, `events`, `offers`, `jobs`, `notices`, `businesses`, `service_providers`).
* **Caching Layer**: Includes an in-memory `CacheService` with a 5-minute TTL to reduce database query loads on high-traffic public landing screens.

---

## 🛡️ Feature 06: Verification Queue
* **Purpose**: Coordinates admin workflows for reviewing and approving members, business listings, and service provider profiles.
* **Workflows**: Admin reviews the queue, marks entries as `approved` or `rejected`, and appends moderation notes.

---

## 📊 Feature 07: Analytics & Interaction Tracking
* **Purpose**: Logs profile page views and direct contact actions (clicking on Maps, calling, WhatsApp messages).
* **Database Tables**: `interaction_logs` (Business interaction counts), `provider_interaction_logs` (Provider interaction counts).
* **Workflows**: API records interaction events silently to increment aggregates.
