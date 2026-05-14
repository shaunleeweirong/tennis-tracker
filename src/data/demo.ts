import { CHARACTERS } from "@/data/characters";
import { SYSTEM_DRILLS } from "@/data/drills";
import type {
  CoachingPackage,
  CoachingSession,
  Goal,
  Match,
  PlayerAchievement,
  PlayerCollectionItem,
  PlayerPack,
  Profile,
  RatingMap,
} from "@/types";

const player_id = "demo-player";
const coach_id = "demo-coach";
const now = "2026-05-14T00:00:00.000Z";

export const DEMO_PLAYER: Profile = {
  id: player_id,
  name: "Alex Player",
  role: "player",
  equipped_character_id: "rookie",
  created_at: now,
  updated_at: now,
};

export const DEMO_COACH: Profile = {
  id: coach_id,
  name: "Coach Lee",
  role: "coach",
  equipped_character_id: null,
  created_at: now,
  updated_at: now,
};

export const DEMO_PACKAGES: CoachingPackage[] = [
  {
    id: "demo-package-1",
    player_id,
    total_sessions: 10,
    sessions_used: 6,
    start_date: "2026-04-01",
    end_date: null,
    price: 900,
    created_at: "2026-04-01T00:00:00.000Z",
    updated_at: "2026-05-10T00:00:00.000Z",
  },
];

export const DEMO_SESSIONS: CoachingSession[] = [
  session("demo-session-1", "2026-04-18", 60, "Forehand shape and recovery", {
    self: rating(5, 5, 4, 5, 4, 5, 5, 4),
    coach: rating(5, 4, 4, 5, 4, 5, 5, 4),
    drills: ["drill-forehand-crosscourt", "drill-split-step-recovery"],
  }),
  session("demo-session-2", "2026-04-25", 60, "Serve targets and return depth", {
    self: rating(5, 5, 5, 5, 4, 5, 5, 5),
    coach: rating(5, 5, 5, 4, 4, 5, 5, 5),
    drills: ["drill-serve-targets", "drill-return-depth"],
  }),
  session("demo-session-3", "2026-05-02", 90, "Pattern play points", {
    self: rating(6, 5, 5, 5, 5, 6, 6, 5),
    coach: rating(5, 5, 5, 5, 5, 6, 6, 5),
    drills: ["drill-pattern-play"],
  }),
  session("demo-session-4", "2026-05-06", 60, "Volley closing and split step", {
    self: rating(6, 5, 5, 5, 5, 6, 6, 6),
    coach: rating(6, 5, 5, 5, 5, 6, 6, 5),
    drills: ["drill-volley-close", "drill-split-step-recovery"],
  }),
  session("demo-session-5", "2026-05-10", 75, "Backhand direction changes", {
    self: rating(6, 6, 5, 5, 5, 6, 6, 6),
    coach: rating(6, 5, 5, 5, 5, 6, 6, 6),
    drills: ["drill-backhand-line"],
  }),
  session("demo-session-6", "2026-05-13", 60, "Serve plus one patterns", {
    self: rating(6, 6, 6, 5, 5, 6, 7, 6),
    coach: rating(6, 6, 5, 5, 5, 6, 6, 6),
    drills: ["drill-serve-targets", "drill-pattern-play"],
  }),
];

export const DEMO_MATCHES: Match[] = [
  match("demo-match-1", "2026-04-20", "Jamie Tan", "6-4 3-6 10-7", "hard", "W"),
  match("demo-match-2", "2026-04-28", "Morgan Smith", "4-6 4-6", "hard", "L"),
  match("demo-match-3", "2026-05-05", "Jamie Tan", "6-3 6-2", "clay", "W"),
];

export const DEMO_GOALS: Goal[] = [
  {
    id: "demo-goal-1",
    player_id,
    title: "Raise serve rating to 7",
    skill: "serve",
    target_rating: 7,
    target_date: "2026-06-30",
    status: "active",
    created_at: "2026-04-01T00:00:00.000Z",
    updated_at: "2026-04-01T00:00:00.000Z",
  },
];

export const DEMO_COLLECTION: PlayerCollectionItem[] = [
  {
    player_id,
    character_id: "rookie",
    earned_at: now,
    earned_via: "default",
  },
  {
    player_id,
    character_id: "baseline-buddy",
    earned_at: "2026-05-02T00:00:00.000Z",
    earned_via: "pack",
  },
  {
    player_id,
    character_id: "clutch-finisher",
    earned_at: "2026-04-20T00:00:00.000Z",
    earned_via: "achievement",
  },
];

export const DEMO_PACKS: PlayerPack[] = [
  {
    id: "demo-pack-1",
    player_id,
    pack_type: "standard",
    earned_at: "2026-05-13T00:00:00.000Z",
    opened_at: null,
    dropped_character_id: null,
  },
];

export const DEMO_ACHIEVEMENTS: PlayerAchievement[] = [
  {
    player_id,
    achievement_id: "first_match_win",
    unlocked_at: "2026-04-20T00:00:00.000Z",
  },
];

export const DEMO_DATA = {
  profiles: [DEMO_PLAYER, DEMO_COACH],
  player: DEMO_PLAYER,
  coach: DEMO_COACH,
  packages: DEMO_PACKAGES,
  drills: SYSTEM_DRILLS,
  sessions: DEMO_SESSIONS,
  matches: DEMO_MATCHES,
  goals: DEMO_GOALS,
  characters: CHARACTERS,
  collection: DEMO_COLLECTION,
  packs: DEMO_PACKS,
  achievements: DEMO_ACHIEVEMENTS,
};

function rating(
  forehand: number,
  backhand: number,
  serve: number,
  returnRating: number,
  volley: number,
  footwork: number,
  mental_game: number,
  match_iq: number,
): RatingMap {
  return {
    forehand,
    backhand,
    serve,
    return: returnRating,
    volley,
    footwork,
    mental_game,
    match_iq,
  };
}

function session(
  id: string,
  date: string,
  duration_minutes: number,
  notes: string,
  options: { self: RatingMap; coach: RatingMap; drills: string[] },
): CoachingSession {
  const submittedAt = `${date}T12:00:00.000Z`;

  return {
    id,
    player_id,
    package_id: "demo-package-1",
    date,
    duration_minutes,
    notes,
    status: "complete",
    focus_area_ids: options.drills,
    no_package: false,
    pre_self_rating: null,
    pre_self_rating_submitted_at: null,
    post_self_rating: options.self,
    post_self_rating_submitted_at: submittedAt,
    coach_rating: options.coach,
    coach_rating_submitted_at: submittedAt,
    coach_feedback: "Keep the same intent and clean up recovery spacing.",
    created_at: submittedAt,
    updated_at: submittedAt,
  };
}

function match(
  id: string,
  date: string,
  opponent_name: string,
  score: string,
  surface: string,
  result: "W" | "L",
): Match {
  const timestamp = `${date}T12:00:00.000Z`;

  return {
    id,
    player_id,
    date,
    opponent_name,
    score,
    surface,
    format: "singles",
    result,
    notes: null,
    created_at: timestamp,
    updated_at: timestamp,
  };
}

