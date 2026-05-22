# EzhavaClub Monorepo

A monorepo containing admin and user applications for EzhavaClub.

## Structure

```
ezhavaclub/
├── apps/
│   ├── admin-web/          # Admin Next.js web application
│   ├── user-web/           # User Next.js web application
│   ├── admin-app/          # Admin Flutter mobile application
│   └── user-app/           # User Flutter mobile application
├── packages/
│   ├── shared/             # Shared utilities and types
│   └── ui/                 # Shared UI components
└── turbo.json              # Turborepo configuration
```

## Prerequisites

- Node.js >= 18.0.0
- Flutter >= 3.0.0
- pnpm (recommended) or npm/yarn

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables for each app:
```bash
cp apps/admin-web/.env.example apps/admin-web/.env.local
cp apps/user-web/.env.example apps/user-web/.env.local
```

3. Configure Supabase:
   - Create a Supabase project at https://supabase.com
   - Add your Supabase credentials to the `.env.local` files

## Development

### Web Applications

```bash
# Admin web
pnpm --filter admin-web dev

# User web
pnpm --filter user-web dev
```

### Mobile Applications

```bash
# Admin app
cd apps/admin-app
flutter run

# User app
cd apps/user-app
flutter run
```

### All Applications

```bash
# Run all dev servers
pnpm dev
```

## Build

```bash
# Build all
pnpm build

# Build specific app
pnpm --filter admin-web build
```

## Tech Stack

### Web
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Backend**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

### Mobile
- **Framework**: Flutter
- **Language**: Dart
- **Backend**: Supabase
- **State Management**: Provider/Riverpod
