# Tennis Tracker

Personal tennis coaching analytics app for one player and one coach.

Primary docs:
- [PRD](./prd-tennis-tracker.md)
- [Implementation tasks](./implementation-tasks.md)

## What Is Implemented

- Next.js App Router app with TypeScript and Tailwind.
- Light-mode responsive player and coach surfaces.
- Demo-backed player workflows:
  - dashboard
  - package tracking
  - session list/detail/create
  - pre/post self-ratings
  - coach rating form
  - match list/create
  - goals
  - drills
  - charts with Recharts
  - 24-character collection and pack opening UI
- Shared domain logic under `src/lib`, `src/data`, and `src/types`.
- Supabase database foundation:
  - schema migration
  - RLS policies
  - storage bucket policy setup
  - catalog seed SQL
  - auth/profile seed helper
- Browser verification script using local Chrome.

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and fill values when connecting a real Supabase project.

Required for Supabase-backed operation:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PLAYER_EMAIL=
PLAYER_PASSWORD=
PLAYER_NAME=
COACH_EMAIL=
COACH_PASSWORD=
COACH_NAME=
MEDIA_MAX_UPLOAD_MB=100
```

Without Supabase variables, the app runs as a local demo UI using seeded data.

## Database

Migration:

```bash
supabase/migrations/20260514000000_initial_schema.sql
```

Catalog seed:

```bash
supabase/seed/001_catalog.sql
```

Auth/profile seed helper:

```bash
node scripts/seed-auth-users.mjs
```

The seed helper uses Supabase Admin API credentials from environment variables to create the fixed player and coach users, link them, grant Rookie ownership, and equip Rookie.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
node --check scripts/seed-auth-users.mjs
node scripts/verify-app.mjs
```

`scripts/verify-app.mjs` expects the dev server to be running at `http://localhost:3000` and uses the local Chrome executable. It captures screenshots in `tmp/screenshots/`.

## Current Limitations

- The visible app currently uses a local demo UI layer; server API mutation routes are not fully wired to Supabase yet.
- Real deployment requires a Supabase project and Vercel environment variables.
- Character image paths are represented in data/schema, but the visible UI currently uses a code-native pixel-style avatar placeholder.
