# Supabase Setup Guide

This guide will help you set up Supabase for the EzhavaClub applications.

## Prerequisites

- A Supabase account (free at https://supabase.com)

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in the project details:
   - Name: `ezhavaclub`
   - Database Password: (choose a strong password)
   - Region: Choose the closest region to your users
4. Wait for the project to be created (2-3 minutes)

## Step 2: Get Your Credentials

1. Go to your project dashboard
2. Navigate to Settings → API
3. Copy the following values:
   - Project URL
   - anon public key

## Step 3: Configure Environment Variables

### Admin Web (apps/admin-web)

Create `.env.local` in `apps/admin-web/`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### User Web (apps/user-web)

Create `.env.local` in `apps/user-web/`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Admin App (apps/admin-app)

Update `lib/main.dart`:

```dart
await Supabase.initialize(
  url: 'your_supabase_project_url',
  anonKey: 'your_supabase_anon_key',
);
```

### User App (apps/user-app)

Update `lib/main.dart`:

```dart
await Supabase.initialize(
  url: 'your_supabase_project_url',
  anonKey: 'your_supabase_anon_key',
);
```

## Step 4: Create Database Tables

Go to your Supabase project dashboard → SQL Editor and run the following SQL:

```sql
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clubs table
CREATE TABLE clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your security requirements)
CREATE POLICY "Public read access for users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Public read access for clubs" ON clubs
  FOR SELECT USING (true);

CREATE POLICY "Public read access for events" ON events
  FOR SELECT USING (true);
```

## Step 5: Generate TypeScript Types (Optional)

For better type safety in your Next.js apps, you can generate TypeScript types from your Supabase schema:

1. Install the Supabase CLI:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase link --project-ref your-project-ref
```

3. Generate types:
```bash
supabase gen types typescript --project-id your-project-id > apps/admin-web/lib/supabase/types.ts
supabase gen types typescript --project-id your-project-id > apps/user-web/lib/supabase/types.ts
```

## Step 6: Test Your Connection

Run your development servers to verify the connection:

```bash
# Admin web
pnpm --filter admin-web dev

# User web
pnpm --filter user-web dev
```

## Security Notes

- Never commit `.env.local` files to version control
- Use Row Level Security (RLS) policies to protect your data
- Consider using service role keys only on the server side
- Regularly rotate your API keys

## Next Steps

- Set up authentication with Supabase Auth
- Configure storage for file uploads
- Set up real-time subscriptions for live updates
- Add database triggers for automated actions
