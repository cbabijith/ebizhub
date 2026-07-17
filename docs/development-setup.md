# Development Setup & Workflow Guide

This guide walks you through setting up a local development environment for the EBizHub workspace.

---

## 🛠️ Step 1: Prerequisites
* **Node.js**: Ensure Node.js v20+ is installed.
* **Bun**: The workspace uses Bun as the primary package runner. Install it globally:
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

---

## ⚙️ Step 2: Workspace Setup

1. **Install Dependencies**:
   ```bash
   bun install
   ```

2. **Configure Environment Variables**:
   Create a local configuration file in `apps/api/.env`:
   ```bash
   # apps/api/.env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ezhavaclub"
   PORT=3001
   SUPABASE_URL="https://iaaoxxoabdwbbcbamcso.supabase.co"
   SUPABASE_ANON_KEY="your-supabase-anon-key"
   
   # SMTP config (optional)
   EMAIL_ENABLED=false
   ```

3. **Synchronize Database Schema**:
   Run Drizzle schema push to sync your changes with the database:
   ```bash
   bun run db:push
   ```

---

## 🚀 Step 3: Running Applications

* **Start Backend API Server**:
  ```bash
  bun run dev
  ```
  The API will start at [http://localhost:3001](http://localhost:3001).

* **Start Admin Web App (Next.js)**:
  ```bash
  cd apps/admin-web
  bun run dev
  ```

* **Start User Web App (Next.js)**:
  ```bash
  cd apps/user-web
  bun run dev
  ```

---

## 🧪 Step 4: Verification & Build

* **Run Integration Tests**:
  Ensure the API server is running on port 3001, then run:
  ```bash
  bun test tests/engagement-e2e.test.ts
  ```

* **Run TypeScript Validation**:
  Verify code compile status before pushing changes:
  ```bash
  bun run tsc --noEmit
  ```
