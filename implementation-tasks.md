# Tennis Tracker Implementation Tasks

This file is the working build checklist for the Tennis Analytics Tracker PRD. Use it as the persistent project plan alongside `prd-tennis-tracker.md`.

Status key:
- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked or needs a decision

## Current Implementation Status

Last updated: 2026-05-14

- `[x]` Next.js App Router scaffold, TypeScript, Tailwind, package scripts, responsive app shell.
- `[x]` Shared domain/data layer for ratings, packages, sessions, matches, charts, collection, packs, milestones, achievements, and seeded demo data.
- `[x]` Supabase schema foundation, RLS policies, storage bucket policy setup, catalog seed SQL, and auth/profile seed helper.
- `[x]` Player demo UI for dashboard, packages, sessions, matches, goals, drills, charts, and collection.
- `[x]` Coach demo UI for linked player, pending sessions, coach rating, cancelled/no-show actions.
- `[x]` Verification commands pass: `npm run lint`, `npm run typecheck`, `npm run build`, `node --check scripts/seed-auth-users.mjs`, `node scripts/verify-app.mjs`.
- `[~]` API routes exist for read/demo health surfaces, but production mutations are not fully wired to Supabase route handlers yet.
- `[~]` Media upload requirements are represented in schema, storage policies, and UI placeholders; full signed upload/playback/delete flow still needs Supabase wiring.
- `[~]` Character collection logic and UI exist; final 128x128 PNG character art assets still need to be produced.
- `[!]` Production deployment is blocked until a real Supabase project and Vercel environment variables are provided/configured.

## Phase 0: Project Decisions And Setup

Goal: remove ambiguity before building the app foundation.

### 0.1 Confirm MVP Scope
- [ ] Confirm that the following PRD features stay in v1:
  - Seeded player and coach accounts
  - Email/password login only
  - Player dashboard
  - Coach dashboard
  - Coaching packages
  - Session logging
  - Pre-session self-ratings
  - Post-session self-ratings
  - Coach ratings and written feedback
  - Match logging
  - Goals
  - Drill library
  - Progress charts
  - 24-character collection
  - Card packs
  - Milestone unlocks
  - Achievement unlocks
  - Media uploads
- [ ] Confirm whether v1 should include editing/deleting for every entity, or only where the PRD explicitly requires it.
- [ ] Confirm whether the player and coach names should be environment variables or hardcoded seed values.
- [ ] Confirm preferred deployment target:
  - Vercel for app hosting
  - Supabase hosted project for auth/database/storage
- [ ] Confirm whether the app needs a PWA manifest in v1 or only responsive browser support.

Completion criteria:
- Scope decisions are reflected in the PRD or this task file.
- No unresolved scope decision blocks schema or app scaffolding.

### 0.2 Define Environment Variables
- [ ] Create `.env.example` with all required local variables.
- [ ] Include Supabase app variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_JWT_SECRET` if needed for server-side auth validation
- [ ] Include seeded user variables:
  - `PLAYER_EMAIL`
  - `PLAYER_PASSWORD`
  - `PLAYER_NAME`
  - `COACH_EMAIL`
  - `COACH_PASSWORD`
  - `COACH_NAME`
- [ ] Include app variables:
  - `NEXT_PUBLIC_APP_URL`
  - `MEDIA_MAX_UPLOAD_MB=100`
- [ ] Document which variables are required locally and which are required in Vercel.
- [ ] Ensure `.env.local` is ignored by git.

Completion criteria:
- A new developer can configure the project from `.env.example`.
- No secrets are committed.

## Phase 1: Scaffold The App

Goal: create a working Next.js foundation with the libraries and conventions needed by the PRD.

### 1.1 Create Next.js App
- [ ] Scaffold Next.js using App Router.
- [ ] Use TypeScript.
- [ ] Use ESLint.
- [ ] Use Tailwind CSS.
- [ ] Use the `src/` directory if that is the chosen repo convention.
- [ ] Confirm package manager:
  - npm, pnpm, or yarn
- [ ] Add base scripts:
  - `dev`
  - `build`
  - `start`
  - `lint`
  - `typecheck`
  - `format` if formatter is added

Suggested structure:
```text
src/
  app/
  components/
  features/
  lib/
  types/
  data/
supabase/
  migrations/
  seed/
```

Completion criteria:
- `npm run dev` starts locally.
- `npm run build` succeeds on the starter app.
- `npm run lint` succeeds.

### 1.2 Add UI Foundation
- [ ] Install and configure shadcn/ui.
- [ ] Add core components likely needed early:
  - Button
  - Input
  - Label
  - Card
  - Dialog
  - Sheet
  - Dropdown Menu
  - Tabs
  - Badge
  - Alert
  - Progress
  - Select
  - Textarea
  - Calendar or date input strategy
  - Form helpers if using React Hook Form
- [ ] Install lucide-react for icons.
- [ ] Define app-wide light-mode theme tokens.
- [ ] Set up global layout spacing, typography, and mobile-first behavior.
- [ ] Avoid dark mode unless explicitly added later.

Completion criteria:
- App has a clean light theme.
- UI primitives are available for forms, dashboards, lists, and dialogs.

### 1.3 Add App Libraries
- [ ] Install Supabase packages.
- [ ] Install Recharts.
- [ ] Install validation/form libraries if desired:
  - `zod`
  - `react-hook-form`
  - `@hookform/resolvers`
- [ ] Install date utilities:
  - `date-fns` or equivalent
- [ ] Add a small utility layer for:
  - class name merging
  - date formatting
  - rating calculations
  - role checks

Completion criteria:
- Shared libraries are installed and imported cleanly.
- No feature code is blocked by missing base dependencies.

### 1.4 Define Route Groups
- [ ] Create public auth routes:
  - `/login`
- [ ] Create authenticated player routes:
  - `/dashboard`
  - `/sessions`
  - `/sessions/new`
  - `/sessions/[id]`
  - `/matches`
  - `/matches/new`
  - `/goals`
  - `/drills`
  - `/packages`
  - `/collection`
- [ ] Create authenticated coach routes:
  - `/coach`
  - `/coach/players`
  - `/coach/sessions/[id]`
- [ ] Create shared error/loading/not-found states.
- [ ] Decide whether to use route groups like:
  - `(auth)`
  - `(player)`
  - `(coach)`

Completion criteria:
- Empty pages exist for all major PRD modules.
- Route organization makes role-specific layout straightforward.

## Phase 2: Define Supabase Database And Security

Goal: create the data model, seed data, and RLS rules that everything else depends on.

### 2.1 Set Up Supabase Project Structure
- [ ] Initialize local Supabase project files if using Supabase CLI.
- [ ] Create `supabase/migrations`.
- [ ] Create `supabase/seed`.
- [ ] Document how to apply migrations locally and remotely.
- [ ] Decide whether migrations are raw SQL only or generated through Supabase CLI.

Completion criteria:
- Schema changes can be tracked in git.
- Local and remote setup steps are documented.

### 2.2 Create Core Enum Types
- [ ] Define `user_role`:
  - `player`
  - `coach`
- [ ] Define `session_status`:
  - `pending`
  - `complete`
  - `cancelled`
  - `no_show`
- [ ] Define `match_result`:
  - `W`
  - `L`
- [ ] Define `match_format`:
  - `singles`
  - `doubles`
- [ ] Define `character_rarity`:
  - `default`
  - `common`
  - `rare`
  - `epic`
  - `legendary`
- [ ] Define `unlock_condition_type`:
  - `default`
  - `pack_drop`
  - `session_milestone`
  - `achievement`
- [ ] Define `pack_type`:
  - `standard`
  - `better`
- [ ] Define `earned_via`:
  - `default`
  - `pack`
  - `milestone`
  - `achievement`
- [ ] Define `goal_status`:
  - `active`
  - `complete`
  - `abandoned`

Completion criteria:
- Tables can use strict types instead of free-text status fields.

### 2.3 Create Profiles And Coach Link
- [ ] Create `profiles` table:
  - `id uuid primary key references auth.users(id)`
  - `name text not null`
  - `role user_role not null`
  - `equipped_character_id text null`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
- [ ] Create `coach_player_links` table or equivalent:
  - `coach_id uuid references profiles(id)`
  - `player_id uuid references profiles(id)`
  - `created_at timestamptz not null default now()`
  - unique relationship for the one coach and one player
- [ ] Add constraint that coach links only connect coach-to-player if feasible.
- [ ] Add updated-at trigger helper.

Completion criteria:
- The app can identify the current user's role.
- The coach can be scoped to the single linked player.

### 2.4 Create Packages Table
- [ ] Create `packages` table:
  - `id uuid primary key`
  - `player_id uuid not null references profiles(id)`
  - `total_sessions integer not null`
  - `sessions_used integer not null default 0`
  - `start_date date not null`
  - `end_date date null`
  - `price numeric null`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
- [ ] Add checks:
  - `total_sessions > 0`
  - `sessions_used >= 0`
  - `sessions_used <= total_sessions` unless overuse is intentionally allowed
  - `price is null or price >= 0`
- [ ] Decide active package logic:
  - latest package with remaining sessions and date window
  - or explicit `status`
- [ ] Add index on `player_id`, `start_date`.

Completion criteria:
- Remaining sessions can be calculated as `total_sessions - sessions_used`.
- Historical packages are preserved.

### 2.5 Create Drills Tables
- [ ] Create `drills` table:
  - `id uuid primary key`
  - `player_id uuid null references profiles(id)`
  - `name text not null`
  - `category text not null`
  - `description text null`
  - `is_system boolean not null default false`
  - `created_at timestamptz not null default now()`
- [ ] Add uniqueness rules:
  - system drills unique by name/category
  - player drills unique by player/name/category
- [ ] Seed system drills for:
  - groundstrokes
  - serve
  - volley
  - return
  - footwork
  - conditioning
  - match play
- [ ] Decide if session-drill relation uses join table or array.
- [ ] Prefer join table for queryability:
  - `session_drills(session_id, drill_id)`

Completion criteria:
- The app can list default and custom drills.
- Drill history can be queried reliably.

### 2.6 Create Sessions And Ratings Model
- [ ] Create `sessions` table:
  - `id uuid primary key`
  - `player_id uuid not null references profiles(id)`
  - `package_id uuid null references packages(id)`
  - `date date not null`
  - `duration_minutes integer null`
  - `notes text null`
  - `status session_status not null default 'complete'`
  - `pre_self_rating jsonb null`
  - `pre_self_rating_submitted_at timestamptz null`
  - `post_self_rating jsonb null`
  - `post_self_rating_submitted_at timestamptz null`
  - `coach_rating jsonb null`
  - `coach_rating_submitted_at timestamptz null`
  - `coach_feedback text null`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
- [ ] Add rating validation strategy:
  - database function/check if practical
  - server-side Zod validation always
- [ ] Ensure the 8 fixed keys are validated:
  - `forehand`
  - `backhand`
  - `serve`
  - `return`
  - `volley`
  - `footwork`
  - `mental_game`
  - `match_iq`
- [ ] Ensure every rating value is integer 1-10.
- [ ] Add indexes:
  - `player_id`, `date`
  - `package_id`
  - `status`
- [ ] Create atomic session logging database function or transaction:
  - create session
  - increment active package `sessions_used` when applicable
  - skip package increment for `cancelled` and `no_show`
  - flag no package when none exists
- [ ] Define delete behavior:
  - deleting a credit-consuming session restores credit to original `package_id`

Completion criteria:
- Session creation and package credit updates cannot drift apart.
- Coach rating visibility can be controlled by submitted timestamp.

### 2.7 Create Matches Table
- [ ] Create `matches` table:
  - `id uuid primary key`
  - `player_id uuid not null references profiles(id)`
  - `date date not null`
  - `opponent_name text not null`
  - `score text not null`
  - `surface text null`
  - `format match_format not null`
  - `result match_result not null`
  - `notes text null`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
- [ ] Add indexes:
  - `player_id`, `date`
  - `player_id`, `opponent_name`
  - `player_id`, `result`
- [ ] Ensure match logging never touches packages.

Completion criteria:
- Match list, win percentage, streaks, and opponent head-to-head can be computed.

### 2.8 Create Goals Table
- [ ] Create `goals` table:
  - `id uuid primary key`
  - `player_id uuid not null references profiles(id)`
  - `title text not null`
  - `skill text null`
  - `target_rating numeric null`
  - `target_date date null`
  - `status goal_status not null default 'active'`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
- [ ] Validate `skill` is null or one of the 8 rubric skills.
- [ ] Validate `target_rating` is null or between 1 and 10.
- [ ] Add index on `player_id`, `status`.

Completion criteria:
- Active goals can be shown on the dashboard.
- Goals can be completed or abandoned.

### 2.9 Create Character Collection Tables
- [ ] Create `characters` table:
  - `id text primary key`
  - `name text not null`
  - `rarity character_rarity not null`
  - `archetype text not null`
  - `signature_line text not null`
  - `unlock_condition_text text not null`
  - `unlock_condition_type unlock_condition_type not null`
  - `pixel_art_path text not null`
  - `display_order integer not null`
- [ ] Seed exactly 24 characters:
  - 1 Default
  - 11 Common
  - 6 Rare
  - 4 Epic
  - 2 Legendary
- [ ] Create `player_collection` table:
  - `player_id uuid references profiles(id)`
  - `character_id text references characters(id)`
  - `earned_at timestamptz not null default now()`
  - `earned_via earned_via not null`
  - primary key `(player_id, character_id)`
- [ ] Create `player_packs` table:
  - `id uuid primary key`
  - `player_id uuid not null references profiles(id)`
  - `pack_type pack_type not null`
  - `earned_at timestamptz not null default now()`
  - `opened_at timestamptz null`
  - `dropped_character_id text null references characters(id)`
- [ ] Create `player_achievements` table:
  - `player_id uuid references profiles(id)`
  - `achievement_id text not null`
  - `unlocked_at timestamptz not null default now()`
  - primary key `(player_id, achievement_id)`
- [ ] Seed Rookie ownership for the player.
- [ ] Set player `equipped_character_id` to Rookie.

Completion criteria:
- Collection screen can show owned/locked roster.
- Packs and deterministic unlocks have durable state.

### 2.10 Create Media Table And Storage Policies
- [ ] Create Supabase Storage bucket for session media.
- [ ] Decide bucket privacy:
  - private bucket with signed URLs preferred
- [ ] Create `media` table:
  - `id uuid primary key`
  - `session_id uuid not null references sessions(id)`
  - `player_id uuid not null references profiles(id)`
  - `storage_path text not null`
  - `mime_type text not null`
  - `file_size_bytes bigint null`
  - `uploaded_at timestamptz not null default now()`
- [ ] Validate accepted MIME types:
  - `image/jpeg`
  - `image/png`
  - `video/mp4`
  - `video/quicktime`
- [ ] Enforce 100MB max upload in server logic.
- [ ] Enforce approximate 5 clips per session if v1 needs a hard limit.
- [ ] Add storage RLS so only the player and linked coach can read.
- [ ] Allow only the player to upload/delete.

Completion criteria:
- Session media is private.
- Coach can view media for linked player sessions.
- Player can delete attachments.

### 2.11 Write RLS Policies
- [ ] Enable RLS on all app tables.
- [ ] Profiles:
  - player can read own profile
  - coach can read own profile
  - linked coach can read linked player profile
- [ ] Coach links:
  - player and coach can read their own link
  - service role can seed/manage links
- [ ] Packages:
  - player can CRUD own packages
  - coach can read linked player packages if needed
- [ ] Sessions:
  - player can CRUD own sessions
  - coach can read linked player sessions
  - coach can update coach rating fields/status only through controlled server route or restricted policy
- [ ] Matches:
  - player can CRUD own matches
  - coach access optional; decide and document
- [ ] Goals:
  - player can CRUD own goals
  - coach access optional; decide and document
- [ ] Drills:
  - all authenticated users can read system drills
  - player can CRUD own custom drills
  - coach can read linked player custom drills if needed
- [ ] Characters:
  - authenticated users can read all
  - only service role can write
- [ ] Collection/packs/achievements:
  - player can read own
  - player can open packs only through server route
  - service role/server route handles writes
- [ ] Media:
  - player can CRUD own media rows
  - coach can read linked player media rows

Completion criteria:
- Direct client queries cannot expose unrelated data.
- Coach cannot modify player-owned data outside allowed coach actions.

### 2.12 Seed Data And Auth Users
- [ ] Write seed script for Supabase Auth users using service role:
  - player email/password
  - coach email/password
- [ ] Write seed script for `profiles`.
- [ ] Write seed script for coach-player link.
- [ ] Write seed script for system drills.
- [ ] Write seed script for 24 characters.
- [ ] Write seed script for player Rookie ownership.
- [ ] Make seed idempotent.
- [ ] Ensure no password or service key is committed.

Completion criteria:
- Fresh environment can be seeded once without manual SQL edits.
- Re-running seed does not duplicate users or data.

## Phase 3: Build Auth And Role Routing

Goal: let the player and coach sign in and land in the correct app area.

### 3.1 Supabase Client Setup
- [ ] Create browser Supabase client helper.
- [ ] Create server Supabase client helper for App Router.
- [ ] Create service-role client only for server-only scripts/routes.
- [ ] Ensure service role code cannot be imported into client bundles.
- [ ] Add TypeScript database types strategy:
  - generated Supabase types, or
  - hand-maintained minimal types initially

Completion criteria:
- Server and client components can read auth/session state safely.

### 3.2 Login Page
- [ ] Build `/login` page.
- [ ] Include email field.
- [ ] Include password field.
- [ ] Include submit button.
- [ ] Show invalid credentials error.
- [ ] Show loading state.
- [ ] Avoid signup, password reset, and magic link UI.
- [ ] Redirect authenticated users away from login.
- [ ] Ensure mobile layout is comfortable.

Completion criteria:
- Player and coach can sign in with seeded credentials.
- No out-of-scope auth flows are visible.

### 3.3 Session Handling Middleware
- [ ] Add middleware to protect authenticated routes.
- [ ] Redirect unauthenticated users to `/login`.
- [ ] Read role from `profiles`.
- [ ] Redirect player away from coach routes.
- [ ] Redirect coach away from player routes.
- [ ] Handle missing profile with a clear error page.

Completion criteria:
- Role-based access works before feature pages are implemented.

### 3.4 App Shells
- [ ] Build player layout with:
  - top nav
  - equipped character slot
  - mobile nav
  - logout action
- [ ] Build coach layout with:
  - visually distinct accent
  - coach mode label or equivalent
  - logout action
- [ ] Add shared loading states.
- [ ] Add shared empty states.

Completion criteria:
- Authenticated pages have consistent navigation and role-specific treatment.

## Phase 4: Build Core Player Loop

Goal: the player can create a package, log sessions, self-rate, and see remaining credits.

### 4.1 Player Dashboard
- [ ] Build `/dashboard`.
- [ ] Show remaining package sessions prominently.
- [ ] Show warning banner at 2 or fewer remaining sessions.
- [ ] Show active goals summary placeholder or real data.
- [ ] Show recent sessions list.
- [ ] Show small charts strip placeholder or real charts once available.
- [ ] Show equipped character greeting.
- [ ] Add primary action buttons:
  - Log session
  - Log match
  - Add package
- [ ] Add useful empty state when no package exists.
- [ ] Add useful empty state when no sessions exist.

Completion criteria:
- Player can understand current package status immediately after login.

### 4.2 Package Creation And History
- [ ] Build `/packages`.
- [ ] List active and past packages.
- [ ] Build create package form:
  - total sessions
  - start date
  - optional expiry date
  - optional price
- [ ] Validate total sessions is positive.
- [ ] Validate expiry date is after start date if provided.
- [ ] Display price only when present.
- [ ] Add edit package behavior if included in v1.
- [ ] Keep historical packages visible.

Completion criteria:
- Player can create a package and see remaining sessions on dashboard.

### 4.3 Session Create Form
- [ ] Build `/sessions/new`.
- [ ] Fields:
  - date
  - duration
  - focus areas/drills
  - notes
  - post-session self-rating
  - optional pre-session rating if creating before completion
  - optional media attachments once media phase exists
- [ ] Use 1-10 rating UI for each of 8 skills.
- [ ] Use numbered pills or sliders, not stars.
- [ ] Make the form fast on mobile.
- [ ] Validate every post-session rating value is 1-10.
- [ ] Allow notes to be optional.
- [ ] Submit through server action or API route.
- [ ] On success:
  - create session
  - consume package credit if eligible
  - evaluate pack/milestone rewards later when reward phase exists
  - redirect to session detail or dashboard

Completion criteria:
- Player can complete a basic session log in under 90 seconds on mobile.

### 4.4 Session List
- [ ] Build `/sessions`.
- [ ] Show sessions newest first.
- [ ] Display:
  - date
  - duration
  - status
  - drills/focus areas
  - whether coach rating is pending/submitted
  - package credit status
- [ ] Add date range filtering if needed for v1.
- [ ] Add links to session detail.
- [ ] Add empty state.

Completion criteria:
- Player can find previous sessions quickly.

### 4.5 Session Detail
- [ ] Build `/sessions/[id]`.
- [ ] Show session metadata.
- [ ] Show notes.
- [ ] Show drills.
- [ ] Show rating comparison table:
  - pre-session self
  - post-session self
  - coach rating
- [ ] Hide coach rating until submitted.
- [ ] Show coach feedback after submitted.
- [ ] Show media attachments once media phase exists.
- [ ] Allow editing if included in v1.
- [ ] Allow deleting if included in v1.

Completion criteria:
- Player can compare self and coach perspectives on a single session.

### 4.6 Pre-Session Rating
- [ ] Add pre-rating form on session record.
- [ ] Allow player to submit pre-session self-rating before completion.
- [ ] Lock pre-session rating once session is marked complete.
- [ ] Clearly distinguish pre-session and post-session ratings.
- [ ] Decide whether to support proactive morning prompt later.

Completion criteria:
- Three-column rating comparison is possible for sessions with pre-ratings.

## Phase 5: Build Coach Loop

Goal: the coach can review the linked player’s sessions and submit ratings/feedback.

### 5.1 Coach Dashboard
- [ ] Build `/coach`.
- [ ] Show linked player.
- [ ] Show pending sessions needing coach rating.
- [ ] Show recent rated sessions.
- [ ] Show basic package/session context if helpful.
- [ ] Add empty state when no sessions are pending.

Completion criteria:
- Coach can immediately see what needs attention.

### 5.2 Coach Player List
- [ ] Build `/coach/players`.
- [ ] Show the one linked player.
- [ ] Keep UI compatible with a list even though v1 has one player.
- [ ] Do not add invite or multi-player management.

Completion criteria:
- PRD acceptance criterion for linked players is met without adding SaaS complexity.

### 5.3 Coach Session Detail And Rating
- [ ] Build `/coach/sessions/[id]`.
- [ ] Show player session details.
- [ ] Show player notes and focus drills.
- [ ] Show player self-rating.
- [ ] Show media once media phase exists.
- [ ] Build coach rating form for all 8 skills.
- [ ] Add optional written feedback.
- [ ] Submit rating.
- [ ] Set `coach_rating_submitted_at`.
- [ ] Prevent player from seeing coach rating before submission.

Completion criteria:
- Coach can submit an external rating for each player session.

### 5.4 Cancelled And No-Show Handling
- [ ] Add coach action to mark session `cancelled`.
- [ ] Add coach action to mark session `no_show`.
- [ ] Ensure these statuses do not consume package credit.
- [ ] If status changes after credit was consumed, restore the credit.
- [ ] Show status clearly to player and coach.

Completion criteria:
- Package credits remain correct when coach marks a session cancelled/no-show.

## Phase 6: Build Match Logging

Goal: matches are tracked separately from lessons and never affect package counts.

### 6.1 Match Create Form
- [ ] Build `/matches/new`.
- [ ] Fields:
  - date
  - opponent name
  - score free text
  - surface
  - format singles/doubles
  - result W/L
  - optional notes
- [ ] Validate required fields.
- [ ] Save match without touching packages.

Completion criteria:
- Player can log competitive results separately from sessions.

### 6.2 Match List And Stats
- [ ] Build `/matches`.
- [ ] Show list of matches newest first.
- [ ] Show W/L.
- [ ] Show score.
- [ ] Show opponent.
- [ ] Show format and surface.
- [ ] Calculate:
  - win percentage
  - current streak
  - head-to-head by opponent
- [ ] Add edit/delete if included in v1.

Completion criteria:
- Player can understand match record and opponent history.

## Phase 7: Build Goals

Goal: player can set measurable improvement targets.

### 7.1 Goal List
- [ ] Build `/goals`.
- [ ] Show active goals first.
- [ ] Show completed/abandoned goals separately.
- [ ] Display:
  - title
  - target skill
  - target rating
  - target date
  - status
- [ ] Add empty state.

Completion criteria:
- Player can see what they are working toward.

### 7.2 Goal Create/Edit
- [ ] Build goal form.
- [ ] Fields:
  - title
  - optional skill
  - optional target rating
  - optional target date
- [ ] Validate target rating between 1 and 10.
- [ ] Allow mark complete.
- [ ] Allow abandon.

Completion criteria:
- Player can create, complete, and abandon goals.

### 7.3 Goal Progress Logic
- [ ] Calculate current average rating for goal skill.
- [ ] Compare current rating to target rating.
- [ ] Show progress when a logged session moves average closer to target.
- [ ] Decide whether progress uses:
  - self rating
  - coach rating
  - average of both
- [ ] Document chosen calculation.

Completion criteria:
- Dashboard can show meaningful goal progress.

## Phase 8: Build Drill Library

Goal: player can tag sessions with structured focus areas and review drill history.

### 8.1 Drill Library Page
- [ ] Build `/drills`.
- [ ] List system drills grouped by category.
- [ ] List custom player drills.
- [ ] Show descriptions.
- [ ] Add empty state for custom drills.

Completion criteria:
- Player can browse available focus areas.

### 8.2 Custom Drill Creation
- [ ] Build custom drill form.
- [ ] Fields:
  - name
  - category
  - description
- [ ] Validate name/category.
- [ ] Prevent duplicate custom drills for the same player.

Completion criteria:
- Player can add personalized drills.

### 8.3 Drill History
- [ ] Count sessions per drill.
- [ ] Show last worked date.
- [ ] Show frequency by category.
- [ ] Link from drill to filtered session list if useful.

Completion criteria:
- Player can see how often each drill has been worked on.

## Phase 9: Build Charts And Analytics

Goal: make progress and gaps visible.

### 9.1 Shared Chart Data Layer
- [ ] Create chart data helpers.
- [ ] Normalize ratings by date.
- [ ] Calculate per-skill trends.
- [ ] Calculate overall rating as average of all 8 skills.
- [ ] Calculate self-vs-coach deltas.
- [ ] Add time filters:
  - last 30 days
  - last 90 days
  - year
  - all time

Completion criteria:
- Chart components receive clean, typed data.

### 9.2 Per-Skill Rating Chart
- [ ] Build Recharts line chart.
- [ ] Plot self rating.
- [ ] Plot coach rating.
- [ ] Use same axes.
- [ ] Allow skill selector.
- [ ] Handle missing coach ratings.
- [ ] Handle sparse data.

Completion criteria:
- Player can compare self and coach trends per skill.

### 9.3 Overall Rating Chart
- [ ] Build aggregate rating chart.
- [ ] Average all 8 skills per session.
- [ ] Plot self and coach if useful.
- [ ] Respect time range filter.

Completion criteria:
- Player can see high-level rating trend.

### 9.4 Self vs Coach Delta Chart
- [ ] Calculate latest or average delta by skill.
- [ ] Show where player rates themselves higher/lower than coach.
- [ ] Use clear positive/negative visual treatment.
- [ ] Avoid implying coach rating is objectively correct in copy.

Completion criteria:
- Blind spots are visible at a glance.

### 9.5 Match Record Chart
- [ ] Build cumulative wins chart.
- [ ] Optionally show cumulative losses.
- [ ] Respect time range filter.
- [ ] Handle no matches.

Completion criteria:
- Match progress is visible separately from coaching progress.

## Phase 10: Build Character Collection, Packs, And Unlocks

Goal: add the v1 gamification loop without weakening core tracking.

### 10.1 Character Art Asset Plan
- [ ] Decide how 24 pixel-art PNGs will be produced.
- [ ] Ensure all assets are:
  - 128x128 source PNG
  - transparent background
  - consistent lighting
  - consistent proportions
  - consistent outline style
- [ ] Store assets under a stable path, likely:
  - `public/characters/*.png`
- [ ] Add placeholder assets if implementation starts before final art exists.
- [ ] Use `image-rendering: pixelated`.

Completion criteria:
- Every seeded character has a valid image path.

### 10.2 Collection Screen
- [ ] Build `/collection`.
- [ ] Show `Owned: X / 24`.
- [ ] Group roster by rarity:
  - Default
  - Common
  - Rare
  - Epic
  - Legendary
- [ ] Show owned characters with art, name, rarity, archetype.
- [ ] Show locked characters as silhouettes.
- [ ] Show unlock condition text for locked characters.
- [ ] Show currently equipped character.
- [ ] Add equip action for owned characters.

Completion criteria:
- Player can understand collection progress and choose an owned character.

### 10.3 Equip Character Flow
- [ ] Implement `/api/profile/equip` or server action.
- [ ] Ensure only owned characters can be equipped.
- [ ] Update `profiles.equipped_character_id`.
- [ ] Reflect equipped character in:
  - top nav
  - dashboard greeting
  - session log header
- [ ] Add brief swap animation.

Completion criteria:
- Equipped character updates across the app.

### 10.4 Pack Earning Logic
- [ ] Count completed sessions.
- [ ] Exclude cancelled/no-show sessions.
- [ ] Award Standard pack every 3rd completed session.
- [ ] Award Better pack every 10th completed session.
- [ ] Better pack replaces Standard on the 10th, 20th, 30th, etc.
- [ ] Persist unopened packs in `player_packs`.
- [ ] Show "You earned a card pack!" CTA after triggering session save.
- [ ] Allow opening immediately or later.

Completion criteria:
- Session logging can create pack rewards deterministically.

### 10.5 Pack Opening Logic
- [ ] Implement pack open server action/API.
- [ ] Standard pack:
  - random unowned Common character
- [ ] Better pack:
  - 80% Common
  - 20% Rare
- [ ] If rolled tier has no unowned characters:
  - attempt next tier up
- [ ] If all eligible tiers exhausted:
  - return no-duplicates thank-you message
- [ ] Set `opened_at`.
- [ ] Set `dropped_character_id` when applicable.
- [ ] Insert into `player_collection` when new character drops.
- [ ] Ensure a pack cannot be opened twice.

Completion criteria:
- Pack rewards are durable, non-duplicating, and race-condition resistant.

### 10.6 Milestone Unlock Logic
- [ ] Unlock specific Epic character at 25 completed sessions.
- [ ] Unlock specific Epic character at 50 completed sessions.
- [ ] Unlock specific Legendary character at 100 completed sessions.
- [ ] Unlock specific Legendary character at 250 completed sessions.
- [ ] Check milestones after completed session logging.
- [ ] Avoid duplicate collection inserts.
- [ ] Show milestone-specific celebration.
- [ ] Show milestone progress on Collection screen.

Completion criteria:
- Long-term session milestones grant guaranteed characters.

### 10.7 Achievement Unlock Logic
- [ ] Implement first match win achievement.
- [ ] Implement 7-day session streak achievement.
- [ ] Implement hit 8.0 on any skill achievement.
- [ ] Implement beat coach rating by 1+ point on any skill achievement.
- [ ] Implement log 20 match wins achievement.
- [ ] Implement log 5 matches in a single month achievement.
- [ ] Tie each achievement to a specific Rare character.
- [ ] Record fired achievements in `player_achievements`.
- [ ] Ensure achievements fire once per player.
- [ ] Trigger achievement checks from relevant events:
  - session create/update
  - coach rating submit
  - match create/update
- [ ] Show achievement hint on Collection screen.

Completion criteria:
- Achievement unlocks are included in v1 and visible in collection progress.

### 10.8 Celebration UI
- [ ] Build celebration screen/modal.
- [ ] Show character art.
- [ ] Show character name.
- [ ] Show archetype.
- [ ] Show rarity badge.
- [ ] Show signature line.
- [ ] Vary intensity by rarity:
  - Common subtle
  - Rare more prominent
  - Epic high impact
  - Legendary full-screen with effects
- [ ] Make milestone reward copy distinct from random pack copy.

Completion criteria:
- Unlocks feel rewarding without blocking normal app use.

## Phase 11: Build Media Uploads

Goal: attach private images/videos to session records.

### 11.1 Upload Flow
- [ ] Add media section to session create/detail.
- [ ] Accept:
  - JPG
  - PNG
  - MP4
  - MOV
- [ ] Enforce 100MB max size.
- [ ] Request signed upload URL or upload through Supabase client.
- [ ] Create media row.
- [ ] Store media under path scoped by player/session.
- [ ] Show upload progress.
- [ ] Show upload errors.

Completion criteria:
- Player can attach image/video to a session.

### 11.2 Media Playback And Preview
- [ ] Show image previews.
- [ ] Play videos inline.
- [ ] Use signed URLs for private media.
- [ ] Handle expired signed URLs gracefully.
- [ ] Keep layout responsive on mobile.

Completion criteria:
- Player and linked coach can review uploaded media.

### 11.3 Delete Attachments
- [ ] Add delete action for player.
- [ ] Delete storage object.
- [ ] Delete media row.
- [ ] Confirm destructive action.
- [ ] Ensure coach cannot delete player media.

Completion criteria:
- Player can remove attachments without orphaning storage files.

## Phase 12: API Routes Or Server Actions

Goal: centralize sensitive mutations and validation.

### 12.1 Sessions API
- [ ] `GET /api/sessions`
- [ ] `POST /api/sessions`
- [ ] `GET /api/sessions/{id}`
- [ ] `PATCH /api/sessions/{id}`
- [ ] `DELETE /api/sessions/{id}`
- [ ] `POST /api/sessions/{id}/coach-rating`
- [ ] `POST /api/sessions/{id}/pre-rating`
- [ ] Validate input with shared schemas.
- [ ] Enforce role authorization server-side.
- [ ] Use transaction/RPC for package credit changes.

Completion criteria:
- Session mutations are safe and tested.

### 12.2 Matches API
- [ ] `GET /api/matches`
- [ ] `POST /api/matches`
- [ ] `PATCH /api/matches/{id}`
- [ ] `DELETE /api/matches/{id}`
- [ ] Trigger relevant achievements after writes.

Completion criteria:
- Match CRUD works without package side effects.

### 12.3 Packages API
- [ ] `GET /api/packages`
- [ ] `POST /api/packages`
- [ ] `PATCH /api/packages/{id}`
- [ ] Validate ownership and role.

Completion criteria:
- Package creation/history works securely.

### 12.4 Goals API
- [ ] `GET /api/goals`
- [ ] `POST /api/goals`
- [ ] `PATCH /api/goals/{id}`
- [ ] Validate target skill/rating.

Completion criteria:
- Goal data can be managed from UI.

### 12.5 Drills API
- [ ] `GET /api/drills`
- [ ] `POST /api/drills`
- [ ] Return system plus custom drills.
- [ ] Prevent duplicate custom drills.

Completion criteria:
- Session form can consume drill list.

### 12.6 Collection And Packs API
- [ ] `GET /api/collection`
- [ ] `GET /api/packs`
- [ ] `POST /api/packs/{id}/open`
- [ ] `PATCH /api/profile/equip`
- [ ] `GET /api/collection/progress`
- [ ] Ensure pack opening is atomic.

Completion criteria:
- Collection UI has all required data and mutations.

### 12.7 Media API
- [ ] `POST /api/media/upload`
- [ ] `DELETE /api/media/{id}`
- [ ] Validate MIME type.
- [ ] Validate size.
- [ ] Enforce ownership.

Completion criteria:
- Media upload/delete flow is secure.

## Phase 13: Testing And Quality

Goal: prove the app works across roles, permissions, and mobile flows.

### 13.1 Unit Tests
- [ ] Test rating validation.
- [ ] Test remaining session calculation.
- [ ] Test active package selection.
- [ ] Test match streak calculation.
- [ ] Test win percentage calculation.
- [ ] Test self-vs-coach delta calculation.
- [ ] Test pack drop schedule.
- [ ] Test pack opening tier fallback.
- [ ] Test milestone unlocks.
- [ ] Test achievement unlocks.

Completion criteria:
- Core business logic is covered without relying only on manual QA.

### 13.2 Integration Tests
- [ ] Test session create increments `sessions_used`.
- [ ] Test cancelled/no-show does not consume credit.
- [ ] Test delete restores original package credit.
- [ ] Test coach rating becomes visible after submission.
- [ ] Test player cannot access coach routes.
- [ ] Test coach cannot access unrelated player data.
- [ ] Test pack cannot be opened twice.
- [ ] Test media access is limited to player and linked coach.

Completion criteria:
- High-risk data integrity and permission paths are tested.

### 13.3 E2E Tests
- [ ] Player login.
- [ ] Coach login.
- [ ] Player creates package.
- [ ] Player logs session.
- [ ] Coach rates session.
- [ ] Player views coach rating.
- [ ] Player logs match.
- [ ] Player opens earned pack.
- [ ] Player equips character.
- [ ] Player uploads and deletes media.

Completion criteria:
- Main workflows pass in browser automation.

### 13.4 Responsive QA
- [ ] Test mobile viewport around 390px width.
- [ ] Test tablet viewport.
- [ ] Test desktop viewport.
- [ ] Verify session logging is comfortable on phone.
- [ ] Verify rating controls do not overflow.
- [ ] Verify charts are readable on mobile.
- [ ] Verify character art remains crisp.

Completion criteria:
- The app works well on court-side mobile use.

### 13.5 Accessibility QA
- [ ] Keyboard navigation for forms and dialogs.
- [ ] Visible focus states.
- [ ] Labels for inputs.
- [ ] Alt text for character art where meaningful.
- [ ] Button names for icon buttons.
- [ ] Color contrast in light mode.
- [ ] No information conveyed by color alone.

Completion criteria:
- Core workflows are usable without pointer-only interactions.

## Phase 14: Deployment

Goal: ship a working private app on Vercel with Supabase.

### 14.1 Supabase Remote Setup
- [ ] Create hosted Supabase project.
- [ ] Apply migrations.
- [ ] Configure Auth:
  - email/password enabled
  - public signup disabled
  - magic links disabled/out of scope
- [ ] Create storage bucket.
- [ ] Apply storage policies.
- [ ] Run seed script with production env credentials.

Completion criteria:
- Supabase production environment has schema, policies, bucket, and seeded users.

### 14.2 Vercel Setup
- [ ] Create Vercel project.
- [ ] Connect GitHub repo.
- [ ] Add environment variables.
- [ ] Configure build command.
- [ ] Configure install command.
- [ ] Set production domain if needed.

Completion criteria:
- Production deployment builds successfully.

### 14.3 Smoke Test Production
- [ ] Login as player.
- [ ] Login as coach.
- [ ] Create package.
- [ ] Log session.
- [ ] Submit coach rating.
- [ ] Log match.
- [ ] Check charts render.
- [ ] Check collection renders.
- [ ] Upload/delete test media.
- [ ] Confirm no signup/reset/magic-link paths are exposed.

Completion criteria:
- Production app supports the primary v1 workflows.

## Phase 15: Documentation

Goal: make the project maintainable.

### 15.1 README
- [ ] Add project overview.
- [ ] Link to PRD.
- [ ] Link to this implementation task file.
- [ ] Document stack.
- [ ] Document local setup.
- [ ] Document environment variables.
- [ ] Document migration commands.
- [ ] Document seed commands.
- [ ] Document test commands.
- [ ] Document deployment steps.

Completion criteria:
- A developer can bootstrap the project from README.

### 15.2 Architecture Notes
- [ ] Document route structure.
- [ ] Document data model.
- [ ] Document RLS approach.
- [ ] Document auth/role approach.
- [ ] Document package credit rules.
- [ ] Document reward rules.
- [ ] Document media privacy model.

Completion criteria:
- Future changes can be made without rediscovering core decisions.

## Suggested Build Order

1. Phase 0: project decisions and env variables
2. Phase 1: scaffold app
3. Phase 2: database, RLS, seed data
4. Phase 3: auth and role routing
5. Phase 4: core player loop
6. Phase 5: coach loop
7. Phase 6: matches
8. Phase 7: goals
9. Phase 8: drills
10. Phase 9: charts
11. Phase 10: collection and rewards
12. Phase 11: media uploads
13. Phase 12: API hardening
14. Phase 13: testing and QA
15. Phase 14: deployment
16. Phase 15: documentation

## Current Next Action

Start with Phase 1 and Phase 2 together:
- scaffold the Next.js app,
- add the UI/dependency foundation,
- then define the Supabase schema and seed strategy before building feature screens.

## Goal Command Handoff

Use this section when starting or resuming focused work with `/goal`.

### What `/goal` Should Track

The goal should be a concrete implementation outcome, not the whole product. Good examples:
- "Scaffold the Next.js app with TypeScript, Tailwind, shadcn/ui, Supabase clients, and base routes."
- "Create the initial Supabase schema, RLS policies, and seed scripts for auth profiles, packages, sessions, drills, and characters."
- "Build the player package and session logging loop end to end."
- "Build the coach dashboard and coach rating workflow end to end."

Avoid goals that are too broad:
- "Build the tennis tracker app."
- "Implement the PRD."
- "Finish everything."

### Recommended First Goal

Objective:

```text
Scaffold the Tennis Tracker app foundation: create the Next.js App Router project with TypeScript, Tailwind, shadcn/ui, core dependencies, Supabase client helpers, route groups, `.env.example`, `.gitignore`, and placeholder pages for the player and coach areas.
```

Definition of done:
- Next.js app exists in this repo without deleting the PRD or task plan.
- TypeScript, Tailwind, ESLint, and package scripts are configured.
- shadcn/ui is initialized and basic UI components are available.
- Supabase browser/server client helpers exist.
- `.env.example` documents required variables.
- Placeholder routes exist for login, player dashboard, player feature areas, and coach area.
- `npm run lint`, `npm run typecheck` if available, and `npm run build` pass.
- `implementation-tasks.md` is updated with completed checklist items for the scaffold work.

Suggested task sections covered:
- Phase 0.2
- Phase 1.1
- Phase 1.2
- Phase 1.3
- Phase 1.4
- Phase 3.1, only the client-helper setup portion

Out of scope for this first goal:
- Supabase database migrations
- RLS policies
- Auth login behavior
- Real dashboards
- Session/package CRUD
- Character reward logic
- Media uploads
- Deployment

### Recommended Second Goal

Objective:

```text
Create the Supabase database foundation: migrations, core enum types, profiles, coach-player link, packages, drills, sessions, matches, goals, character collection tables, media table, first-pass RLS policies, and idempotent seed scripts.
```

Definition of done:
- Migration files exist under `supabase/migrations`.
- Schema supports the PRD entities and 24-character roster.
- RLS is enabled on app tables.
- Seed scripts can create the player, coach, link, system drills, 24 characters, Rookie ownership, and equipped Rookie.
- Sensitive values come from environment variables.
- Schema and seed commands are documented in README or task notes.
- `implementation-tasks.md` is updated with completed database checklist items.

Suggested task sections covered:
- Phase 2.1 through Phase 2.12

Out of scope for this second goal:
- Feature UI
- Full API route implementation
- Visual polish
- Deployment

### Goal Operating Rules

- Before starting a goal, restate the objective and confirm which checklist sections it covers.
- Keep edits scoped to the active goal.
- Update checklist statuses as work completes.
- Run the strongest relevant verification before marking the goal complete.
- Do not mark a goal complete if tests/build fail unless the failure is documented and clearly unrelated.
- Commit after each completed goal with a focused message.
