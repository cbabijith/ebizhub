# User Engagement Features

The platform engagement modules are designed to drive daily active traffic and facilitate seamless business interactions.

---

## 1. Favorites
* **Purpose**: Allows registered customers to create a list of preferred businesses or service providers.
* **Tables**: `favorites`.
* **Rules**: 
  * Only registered users can save favorites.
  * Unique constraint prevents duplicate favorites.

---

## 2. Ratings & Reviews
* **Purpose**: Provides community feedback for businesses and service providers.
* **Tables**: `ratings`, `reviews`.
* **Rules**:
  * Ratings must be integers between 1 and 5.
  * Active unique constraint: limit of 1 active rating per user per resource.
  * Soft-deleted ratings are restored (via the service layer) if a user rates the same resource again.
  * Admin moderation: reviews are visible publically only if they have not been reported or rejected.

---

## 3. Bookmarks
* **Purpose**: Saves news articles, events, job postings, or active offers.
* **Tables**: `bookmarks`.
* **Rules**:
  * Resource types are strictly restricted to: `news`, `event`, `job`, `offer`.
  * Attempts to bookmark businesses or service providers directly are rejected (use Favorites instead).

---

## 4. Share Links
* **Purpose**: Generates short, cryptographically safe, trackable tokens for resources.
* **Tables**: `share_links`.
* **Rules**:
  * Supported resource types: `business`, `service-provider`, `news`, `event`, `job`, `offer`.
  * Tokens are generated using 32 bytes of secure random entropy (`crypto.randomBytes`).
  * Expired (based on `expiresAt`) or deleted links return `410 Gone` / `404 Not Found` upon resolution.
  * Open redirect prevention: the API resolves tokens into resource mapping IDs only. The application layer handles no user-provided redirect URL values.

---

## 5. Email Notifications
* **Purpose**: Manages system communications (welcome mails, status updates, registrations, password resets).
* **Tables**: `email_templates`, `email_logs`.
* **Rules**:
  * All templates must map to strict keys (`welcome`, `business-verification`, `provider-verification`, `password-reset`, `event-registration`, `job-application`, `contact-form`, `account-status-update`).
  * Dev Mode fallback: real emails are sent only when `EMAIL_ENABLED=true` is set. Otherwise, output is written to the developer console log.
  * Security rules: `email_logs` do not store passwords, reset tokens, or auth headers.
