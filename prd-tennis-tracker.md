# PRD: Tennis Analytics Tracker

## 1. Introduction / Overview

A personal web app for a single tennis player and their coach to jointly track the player's progress across coaching sessions. The player and coach each rate the player on a fixed 8-skill rubric after every session, allowing the two perspectives to be compared over time. The app also tracks remaining sessions in the player's coaching package, logs match results separately, supports drill-based session planning, and surfaces trend charts so the player can see whether they are actually improving.

This is a personal tool for one player only (not a multi-tenant SaaS). The coach has read/write access scoped to this one player.

The problem this solves: existing tools either over-index on point-by-point match charting (Top Tennis Tracker, MatchTrack), or are academy-management platforms built for coaching businesses (Tennis Locker, Outcoach, Classcard). Nothing in the consumer market gives an individual player a shared rating space with their coach plus session-credit tracking in one simple tool.

## 2. Goals

- Let the player and coach each rate the player on the same rubric after every session, in under 30 seconds
- Show side-by-side coach vs self ratings over time so blind spots become visible
- Track remaining sessions in a coaching package and warn before it runs out
- Log matches separately from coaching sessions with simple W/L and notes
- Show clear trend charts per skill so progress (or stagnation) is obvious at a glance
- Keep the v1 free of subscriptions, scheduling, payments, and other academy-management overhead

## 3. User Stories

### US-001: Player and coach log in with fixed credentials
**Description:** As the player or coach, I want to log in with a pre-configured email and password so we can start using the app immediately without any signup flow.

**Acceptance Criteria:**
- [ ] Two accounts are seeded into the database at deploy time: one player, one coach
- [ ] Credentials for both accounts are stored as environment variables and seeded into Supabase Auth on first deploy
- [ ] Login page accepts email and password and routes to the correct dashboard based on role
- [ ] Player account lands on the player dashboard; coach account lands on the coach dashboard
- [ ] No signup, no password reset, no email verification in MVP
- [ ] The coach account is automatically linked to the player account at seed time (no invite needed)

### US-002: Player creates a coaching package
**Description:** As a player, I want to record how many sessions I've paid for so the app can count down remaining sessions.

**Acceptance Criteria:**
- [ ] Player can create a package with: total sessions, start date, optional expiry date, optional price
- [ ] Dashboard shows remaining sessions prominently (e.g. "7 of 10 sessions remaining")
- [ ] App shows a warning banner when 2 or fewer sessions remain
- [ ] Player can create a new package when the previous one ends (history of past packages is kept)

### US-003: Player logs a coaching session
**Description:** As a player, I want to log a session after it happens so I can rate myself and burn one session credit.

**Acceptance Criteria:**
- [ ] Player can create a session with date, duration, focus areas (from drill library), and free-text notes
- [ ] Creating a session decrements the active package's remaining count by 1
- [ ] Player rates themselves on the standard rubric (see FR-9) on a 1-10 scale per skill
- [ ] Player can optionally attach photos or video clips
- [ ] Session appears in the session history list

### US-004: Coach rates the player for a session
**Description:** As a coach, I want to rate my player after each session so they get an honest external view of their progress.

**Acceptance Criteria:**
- [ ] Coach sees a list of linked players in their dashboard
- [ ] Coach sees the session the player logged and can open it
- [ ] Coach rates the player on the same rubric (1-10 per skill) plus optional written feedback
- [ ] Coach can flag a session as "no show" or "cancelled" without burning a credit
- [ ] Player cannot see the coach's rating until the coach submits it (no anchoring bias)

### US-005: Player does a pre-session self-rating
**Description:** As a player, I want to predict how I'm playing before a session so I can compare it to how I actually did.

**Acceptance Criteria:**
- [ ] Player can rate themselves on the rubric before the session, on the session record
- [ ] Pre-session rating is locked once the session is marked complete
- [ ] Session detail view shows three columns: pre-session self, post-session self, coach

### US-006: Player sets and tracks goals
**Description:** As a player, I want to set specific goals so I can measure if I'm hitting them.

**Acceptance Criteria:**
- [ ] Player can create a goal with title, target skill (optional link to rubric), target rating, and target date
- [ ] Active goals appear on dashboard
- [ ] When a session is logged that moves the average rating closer to the goal, dashboard shows progress
- [ ] Player can mark a goal complete or abandon it

### US-007: Player picks drills / focus areas
**Description:** As a player, I want to pick from a curated drill library so I don't have to type "forehand crosscourt" every session.

**Acceptance Criteria:**
- [ ] App ships with a default drill library covering common areas (groundstrokes, serve, volley, return, footwork, conditioning, match play)
- [ ] Player can add custom drills
- [ ] Each session can be tagged with one or more drills
- [ ] Drill history shows how often each drill has been worked on

### US-008: Player logs a match result
**Description:** As a player, I want to log matches separately from lessons so my competitive record is tracked.

**Acceptance Criteria:**
- [ ] Player can log a match with date, opponent name, score (free-text e.g. "6-4 6-3"), surface, format (singles/doubles)
- [ ] Logging a match does NOT decrement the coaching package
- [ ] Match list shows W/L, win %, current streak, and head-to-head per opponent
- [ ] Optional notes field per match

### US-009: Player sees progress charts
**Description:** As a player, I want to see trend charts so I can tell if I'm actually getting better.

**Acceptance Criteria:**
- [ ] Per-skill line chart over time showing coach rating and self rating on the same axes
- [ ] Aggregate "overall rating" trend (average of all skills)
- [ ] Match record chart (cumulative wins over time)
- [ ] Time range filter: last 30 days / 90 days / year / all time
- [ ] Self vs coach delta chart (where are the biggest gaps in self-perception?)

### US-010: Player starts with a default character and builds a collection
**Description:** As a player, I want to earn characters as rewards rather than pick one, so the app feels like a game where progress is visible and motivating.

**Acceptance Criteria:**
- [ ] New players start with one default character ("Rookie") automatically equipped
- [ ] All other characters (23) start locked and must be earned
- [ ] A Collection screen shows the full roster organized by rarity tier (Common, Rare, Epic, Legendary)
- [ ] Locked characters appear as silhouettes with unlock conditions visible
- [ ] Collection screen displays "Owned: 7 / 24" progress at the top

### US-011: Player earns characters through card pack drops
**Description:** As a player, I want to occasionally earn card packs from logging sessions so there's a recurring surprise reward.

**Acceptance Criteria:**
- [ ] Logging every 3rd completed session earns a Standard pack
- [ ] Logging every 10th completed session earns a Better pack (higher rare drop rate)
- [ ] After a session that triggers a pack, the save confirmation includes a "You earned a card pack!" CTA
- [ ] Packs can be opened immediately or saved for later
- [ ] Unopened packs are stored on the player's account until opened
- [ ] Pack opening drops one random character the player does not yet own from the appropriate rarity pool
- [ ] If all characters in the eligible pool are owned, the pack converts to a generic "no duplicates" thank-you message
- [ ] Pack opening triggers a celebration screen with the character art, name, archetype, rarity badge, and signature line

### US-012: Player earns specific characters through milestone unlocks
**Description:** As a player, I want guaranteed character rewards at major milestones so my long-term effort is recognized.

**Acceptance Criteria:**
- [ ] Specific characters unlock deterministically at 25, 50, 100, and 250 completed sessions
- [ ] Milestone characters are tier Epic (25, 50) and Legendary (100, 250)
- [ ] On unlock, the celebration screen makes it clear this is a milestone reward, not a random drop
- [ ] Milestone progress is visible on the Collection screen ("18 / 25 sessions to unlock ???")

### US-013: Player earns characters through achievement events
**Description:** As a player, I want certain characters tied to specific tennis accomplishments so my collection reflects what I've actually done, not just how often I show up.

**Acceptance Criteria:**
- [ ] Achievement-linked characters unlock on specific events (e.g. first match win, 7-day session streak, hit 8.0 on any skill, beat coach rating by 1+ point, log 20 match wins)
- [ ] Each achievement character is rarity Rare
- [ ] Achievements fire once per player and cannot be repeated
- [ ] The Collection screen shows the achievement hint as the unlock condition (e.g. "Win your first match")

### US-014: Player equips a character from their collection
**Description:** As a player, I want to choose which earned character represents me in the app right now.

**Acceptance Criteria:**
- [ ] Any owned character can be equipped from the Collection screen
- [ ] Equipped character appears in top nav, dashboard greeting, and session log header
- [ ] Each character has a signature greeting line that rotates on the dashboard
- [ ] Equipping a new character shows a brief swap animation

### US-015: Player attaches media to a session
**Description:** As a player, I want to attach a video clip from a session so I can review my form later.

**Acceptance Criteria:**
- [ ] Player can upload images (jpg, png) and short videos (mp4, mov, up to 100MB) to a session
- [ ] Media is stored securely and is private to the player and their linked coach
- [ ] Session detail view plays video inline
- [ ] Player can delete attachments

## 4. Functional Requirements

- FR-1: The system supports exactly two user accounts in MVP: one with role `player`, one with role `coach`. Both accounts are seeded at deploy time.
- FR-2: The coach account is permanently linked to the player account at seed time. No invite, accept, or revoke flow exists in MVP.
- FR-3: Authentication uses email + password via Supabase Auth. Credentials are stored as environment variables (`PLAYER_EMAIL`, `PLAYER_PASSWORD`, `COACH_EMAIL`, `COACH_PASSWORD`) and seeded once. No public signup endpoint is exposed, and magic links are out of scope for v1.
- FR-4: On login, the app reads the role from the user's profile and routes to the matching dashboard (player or coach).
- FR-5: A coaching `package` belongs to one player and has: total_sessions, sessions_used, start_date, optional end_date, optional price.
- FR-6: Logging a session must atomically increment `package.sessions_used` and create the session record. If no active package exists, the session is logged but flagged "no package".
- FR-7: Sessions cancelled or marked no-show do not consume a credit.
- FR-8: The coach's rating must not be visible to the player until the coach submits it.
- FR-9: The standard skill rubric for v1 contains 8 fixed skills, each rated 1 to 10:
  1. **Forehand** - groundstroke from the dominant side
  2. **Backhand** - groundstroke from the non-dominant side
  3. **Serve** - first and second serve combined
  4. **Return** - return of serve
  5. **Volley** - net play including swing volleys
  6. **Footwork** - court movement, split step, recovery, balance
  7. **Mental Game** - composure, focus, handling pressure
  8. **Match IQ** - shot selection, pattern recognition, court positioning
- FR-10: All ratings are stored with a timestamp and the rater's user_id, so historical context is preserved.
- FR-11: The drill library has system-default drills plus per-player custom drills.
- FR-12: Matches are stored separately from sessions and never affect package counts.
- FR-13: Charts use Recharts and render on the client.
- FR-14: Media uploads go to Supabase Storage with row-level security restricting access to the player and their linked coach.
- FR-15: The app must work on desktop and mobile browser (responsive, mobile-first).
- FR-16: All currency-related fields (package price) are optional and only display when the user provides them.
- FR-17: The app ships with a fixed roster of 24 pixel-art tennis characters organized into rarity tiers. Target roster size for v1:
  - **Default** (1 character, auto-equipped at seed time): Rookie
  - **Common** (11 characters): earned via Standard card packs and the first session-count drop
  - **Rare** (6 characters): earned via Better card packs and achievement events
  - **Epic** (4 characters): earned via session-count milestones (25, 50) and rare card pack drops
  - **Legendary** (2 characters): earned only at session milestones 100 and 250
- FR-17a: All character art uses a consistent 16-bit pixel-art style: same resolution (recommend 128x128 source PNG with transparent background), same lighting direction, same proportional scale. Rendered with `image-rendering: pixelated` in CSS. Each rarity tier is signaled by a colored border, badge icon, and unlock celebration intensity (Common = subtle, Legendary = full-screen with effects).
- FR-18: Each character has: id, name, rarity, archetype label (e.g. "Baseliner"), signature greeting line, unlock_condition_text, unlock_condition_type (`pack_drop` / `session_milestone` / `achievement`), and pixel_art_path.
- FR-19: A player's owned characters are tracked in a `player_collection` table with character_id, player_id, earned_at, earned_via (pack / milestone / achievement).
- FR-20: Card pack drops trigger from completed sessions (cancelled and no-show sessions excluded). Trigger rules:
  - Standard pack: every 3rd completed session
  - Better pack: every 10th completed session (replaces Standard for that session)
- FR-21: Pack opening logic:
  - Standard pack: drops a random unowned Common character
  - Better pack: 80% chance Common, 20% chance Rare, drawn from unowned pool
  - If no unowned characters remain in the rolled tier, the system attempts to roll the next tier up; if all tiers are exhausted, the pack converts to a "no duplicates" thank-you message
- FR-22: Milestone unlocks (deterministic):
  - 25 sessions: specific Epic character
  - 50 sessions: specific Epic character
  - 100 sessions: specific Legendary character
  - 250 sessions: specific Legendary character
- FR-23: Achievement unlocks (deterministic, each fires once per player): first match win, 7-day session streak, hit 8.0 on any skill, beat coach rating by 1+ point on any skill, log 20 match wins, log 5 matches in a single month. Each tied to a specific Rare character.
- FR-24: Unopened packs are stored on the player's account in a `player_packs` table and persist until opened. Players can have multiple unopened packs at once.
- FR-25: A `player_profile.equipped_character_id` field tracks the currently displayed character. Defaults to Rookie.

## 5. Non-Goals (Out of Scope for v1)

- No public signup, no password reset, no email verification (MVP uses pre-seeded credentials only)
- No magic link login (email/password only in v1)
- No multi-tenancy (the entire deploy serves exactly one player and one coach)
- No point-by-point live match charting (Top Tennis Tracker, MatchTrack territory)
- No AI video analysis or shot detection (SwingVision territory)
- No payment processing or invoicing
- No scheduling / booking system (sessions are logged after they happen)
- No multi-player support (this is a personal tool for one player only)
- No multi-coach support (one active coach for the player)
- No customizable rubric (fixed 8-skill rubric in v1)
- No reminder emails to coach
- No social features (no leaderboards, no sharing to other players)
- No native mobile app (web only in v1, PWA-friendly is enough)
- No wearable / Apple Watch integration
- No public profile pages
- No tournament management

## 6. Design Considerations

- **Light mode only** (per user preference)
- **Mobile-first responsive layout**, since session logging will mostly happen on a phone at the court
- **Dashboard hierarchy**: remaining sessions at the top, active goals next, recent sessions, then a small charts strip
- **Rating UI**: tap-to-set 1-10 sliders or a row of 10 numbered pills, not a star rating, since the rubric needs more granularity than 5 stars
- **Coach view** should be visually distinct (different accent color in the top nav) so it's obvious which mode you're in
- **Empty states** must be friendly and explicit about the next step (new players will land on a blank slate)
- **Color palette**: clean and neutral, lean on a single accent color for ratings and call-to-action buttons
- **Avatar visual style**: 16-bit pixel art, in the spirit of classic arcade and SNES-era sports games. Source assets are square (recommend 128x128 PNG with transparent background), rendered at integer multiples to stay crisp (`image-rendering: pixelated` in CSS). Consistent palette and outline treatment across the full roster so all 24 characters feel like one set.
- **Avatar placement**: top nav (small, 48px so pixel art stays legible, not 32px), dashboard greeting (large, 128px), session log header (small, 48px), avatar picker (extra-large, 192px). Pixel art needs more room to read than line art, so all sizes are bumped up from a typical avatar system.
- **Pixel-art accent treatment**: complement the avatars with subtle pixel-art flourishes elsewhere (e.g. a pixel-art tennis ball icon for the empty state, an 8-bit star pop on unlock celebrations). Don't go full retro on the whole UI, just enough to make the avatars feel native rather than imported.

## 7. Tech Architecture (High-Level)

**Stack:**
- Frontend: Next.js 14+ (App Router), React, Tailwind, shadcn/ui components
- Backend: Next.js API routes (or server actions)
- Database: PostgreSQL via Supabase
- Auth: Supabase Auth (email + password only)
- Storage: Supabase Storage for media attachments
- Charts: Recharts
- Hosting: Vercel

(No transactional email service required in MVP since there's no signup, invite, or password reset flow.)

**Components / modules:**
- `auth/` - login page (no signup in MVP)
- `dashboard/` - main player view (package counter, goals, recent sessions, charts strip)
- `sessions/` - session list, session detail, session create/edit
- `matches/` - match list, match create/edit
- `goals/` - goal list, goal create/edit
- `drills/` - drill library management
- `packages/` - package create, history
- `coach/` - separate coach dashboard, player list, coach rating form
- `charts/` - chart components reused across views
- `api/` - REST endpoints (see section 8)

**Data flow (player logs a session, coach later rates it):**
1. Player opens the dashboard on their phone after a lesson
2. Player taps "Log session", picks date, duration, drills, and rates themselves
3. POST `/api/sessions` writes the session row and atomically increments the active package's `sessions_used`, which decreases the displayed remaining-session count
4. Server pushes the session to the coach's dashboard (no real-time required, polling on coach login is fine for v1)
5. Coach opens their dashboard later, sees the pending session, opens it, submits their rating
6. POST `/api/sessions/{id}/coach-rating` writes the coach rating
7. Player's next dashboard load shows the coach rating now visible on that session and updates the trend chart

**Data flow (player logs a match):**
1. Player opens "Log match", enters opponent, score, surface
2. POST `/api/matches` writes the match row (no package logic, no coach involvement)
3. Match appears in the match history and updates the match record charts

## 8. API Endpoints

No external APIs required for MVP. Supabase handles auth, database, and storage.

**Supabase Auth** is wrapped by the Supabase JS SDK, so endpoint URLs are abstracted away. Docs: https://supabase.com/docs/guides/auth (checked on 2026-05-11). For MVP, only the email/password sign-in endpoint is used. Signup and magic links are disabled/out of scope.

### Internal API: Sessions

| Method | Path | Purpose | Auth | Body / params | Response |
|--------|------|---------|------|---------------|----------|
| GET | /api/sessions | List sessions for current user | Session | query: `from`, `to` | `Session[]` |
| POST | /api/sessions | Log a new session (decrements package) | Session (player) | `{date, duration, drill_ids, notes, self_rating, media_ids}` | `Session` |
| GET | /api/sessions/{id} | Get session detail | Session (player or linked coach) | path: `id` | `Session` |
| PATCH | /api/sessions/{id} | Edit session | Session (player) | body: partial Session | `Session` |
| DELETE | /api/sessions/{id} | Delete session (restores package credit) | Session (player) | path: `id` | `{ok}` |
| POST | /api/sessions/{id}/coach-rating | Coach submits their rating | Session (coach) | `{rating, feedback}` | `Session` |
| POST | /api/sessions/{id}/pre-rating | Player submits pre-session rating | Session (player) | `{rating}` | `Session` |

### Internal API: Matches

| Method | Path | Purpose | Auth | Body / params | Response |
|--------|------|---------|------|---------------|----------|
| GET | /api/matches | List matches | Session (player) | query: `from`, `to` | `Match[]` |
| POST | /api/matches | Log a match | Session (player) | `{date, opponent, score, surface, format, notes}` | `Match` |
| PATCH | /api/matches/{id} | Edit match | Session (player) | body: partial Match | `Match` |
| DELETE | /api/matches/{id} | Delete match | Session (player) | path: `id` | `{ok}` |

### Internal API: Packages

| Method | Path | Purpose | Auth | Body / params | Response |
|--------|------|---------|------|---------------|----------|
| GET | /api/packages | List packages (active + history) | Session (player) | none | `Package[]` |
| POST | /api/packages | Create new package | Session (player) | `{total_sessions, start_date, end_date, price}` | `Package` |
| PATCH | /api/packages/{id} | Edit package | Session (player) | body: partial Package | `Package` |

### Internal API: Goals

| Method | Path | Purpose | Auth | Body / params | Response |
|--------|------|---------|------|---------------|----------|
| GET | /api/goals | List goals | Session (player) | query: `status` | `Goal[]` |
| POST | /api/goals | Create goal | Session (player) | `{title, skill, target_rating, target_date}` | `Goal` |
| PATCH | /api/goals/{id} | Update goal status or details | Session (player) | body: partial Goal | `Goal` |

### Internal API: Drills

| Method | Path | Purpose | Auth | Body / params | Response |
|--------|------|---------|------|---------------|----------|
| GET | /api/drills | List drills (system + custom) | Session | none | `Drill[]` |
| POST | /api/drills | Create custom drill | Session (player) | `{name, category, description}` | `Drill` |

### Internal API: Collection & Packs

| Method | Path | Purpose | Auth | Body / params | Response |
|--------|------|---------|------|---------------|----------|
| GET | /api/collection | Full character roster with owned status | Session | none | `Character[]` (each with `owned: bool`, `earned_at`, `earned_via`) |
| GET | /api/packs | List unopened packs | Session | none | `Pack[]` |
| POST | /api/packs/{id}/open | Open a pack, roll a character | Session (player) | path: `id` | `{character, is_new}` |
| PATCH | /api/profile/equip | Equip a character | Session (player) | `{character_id}` | `Profile` |
| GET | /api/collection/progress | Milestone and achievement progress | Session | none | `{milestones: [...], achievements: [...]}` |

### Internal API: Media

| Method | Path | Purpose | Auth | Body / params | Response |
|--------|------|---------|------|---------------|----------|
| POST | /api/media/upload | Get pre-signed Supabase Storage URL | Session (player) | `{filename, mime_type, session_id}` | `{upload_url, media_id}` |
| DELETE | /api/media/{id} | Delete attachment | Session (player) | path: `id` | `{ok}` |

## 9. Data Dependencies

**Reads from:**
- `users` (Supabase Auth) for identity
- All app data lives in our own Postgres (no external data sources in v1)

**Writes to (new tables):**
- `profiles` - extends auth users with name, role (player/coach), **equipped_character_id**
- `characters` - id, name, rarity (common/rare/epic/legendary), archetype, signature_line, unlock_condition_text, unlock_condition_type, pixel_art_path, display_order
- `player_collection` - player_id, character_id, earned_at, earned_via (pack/milestone/achievement). Composite primary key on (player_id, character_id).
- `player_packs` - id, player_id, pack_type (standard/better), earned_at, opened_at (nullable), dropped_character_id (nullable, set when opened)
- `player_achievements` - player_id, achievement_id, unlocked_at. Composite primary key on (player_id, achievement_id). Used to prevent re-firing achievement unlocks.
- `packages` - per player, total_sessions, sessions_used, start_date, end_date, price
- `sessions` - date, duration, player_id, package_id, drill_ids (array), notes, pre_self_rating (jsonb), post_self_rating (jsonb), coach_rating (jsonb), coach_feedback, status (pending, complete, cancelled, no_show)
- `matches` - date, player_id, opponent_name, score, surface, format, notes, result (W/L)
- `goals` - title, skill, target_rating, target_date, status, player_id
- `drills` - name, category, description, player_id (null for system defaults)
- `media` - session_id, storage_path, mime_type, uploaded_at

**Freshness:** Real-time within the app (no caching layer needed in v1). Coach ratings appear on the player's next page load.

**Volume estimate:** A serious recreational player has roughly 2 sessions per week and 1 match per week. That gives roughly 100 sessions and 50 matches per year per player. Storage is the only thing that scales meaningfully (video clips), so cap clip size at 100MB and limit to roughly 5 clips per session.

**Sensitive data:** Email addresses (PII), photos and videos of the player (and possibly the coach if framed in shots). No payment data, no health data. Row-level security in Supabase enforces that media is only visible to the owning player and their linked coach.

**Source of truth:** Our Postgres. No external system owns any entity.

**Skill ratings format (jsonb):**
```json
{
  "forehand": 7,
  "backhand": 6,
  "serve": 8,
  "return": 6,
  "volley": 5,
  "footwork": 7,
  "mental_game": 6,
  "match_iq": 7
}
```

## 10. Success Metrics

- Player logs at least 1 session per week on average over the first month
- Coach rating is submitted within 48 hours of the session being logged at least 80% of the time
- Player can complete a full session log (drills + ratings + notes) in under 90 seconds on mobile
- Dashboard loads in under 1 second on a warm cache
- After 3 months of use, the player can clearly see whether their average rating is trending up

## 11. Open Questions

- For pre-session self-rating: should the app prompt this proactively the morning of a session, or only when the player creates the session record?
- Is there value in a "session feel" emoji rating separate from the skill rubric (e.g. great / good / ok / tough)? Low cost to add, may surface mood vs performance correlations later.
- How should deleted sessions handle the package credit refund if the package has already been replaced by a newer one? (Recommend: refund to whichever package was active at the time of the original log.)
- Should match results feed into the Match IQ or Mental Game rating in any way, or stay completely independent? (Recommend: independent in v1.)
- Should the coach also have an avatar, or stay as a generic icon? (Recommend: generic icon, since the coach UX is intentionally minimal.)
- Should the collection have a "showcase" feature where you can pin 3 favorite characters to a profile card? (Recommend: not in v1, easy to add later.)
- Should achievement unlocks also award a card pack on top of the specific character, double-rewarding the moment? (Recommend: not in v1, keep achievement unlocks clean.)
