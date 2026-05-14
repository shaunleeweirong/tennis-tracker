export type UserRole = "player" | "coach";

export type SessionStatus = "pending" | "complete" | "cancelled" | "no_show";

export type MatchResult = "W" | "L";

export type MatchFormat = "singles" | "doubles";

export type CharacterRarity =
  | "default"
  | "common"
  | "rare"
  | "epic"
  | "legendary";

export type UnlockConditionType =
  | "default"
  | "pack_drop"
  | "session_milestone"
  | "achievement";

export type PackType = "standard" | "better";

export type EarnedVia = "default" | "pack" | "milestone" | "achievement";

export type GoalStatus = "active" | "complete" | "abandoned";

export type SkillKey =
  | "forehand"
  | "backhand"
  | "serve"
  | "return"
  | "volley"
  | "footwork"
  | "mental_game"
  | "match_iq";

export type RatingMap = Record<SkillKey, number>;

export interface SkillDefinition {
  key: SkillKey;
  label: string;
  description: string;
}

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  equipped_character_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachingPackage {
  id: string;
  player_id: string;
  total_sessions: number;
  sessions_used: number;
  start_date: string;
  end_date: string | null;
  price: number | null;
  created_at: string;
  updated_at: string;
}

export interface Drill {
  id: string;
  player_id: string | null;
  name: string;
  category: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
}

export interface CoachingSession {
  id: string;
  player_id: string;
  package_id: string | null;
  date: string;
  duration_minutes: number | null;
  notes: string | null;
  status: SessionStatus;
  focus_area_ids: string[];
  no_package: boolean;
  pre_self_rating: RatingMap | null;
  pre_self_rating_submitted_at: string | null;
  post_self_rating: RatingMap | null;
  post_self_rating_submitted_at: string | null;
  coach_rating: RatingMap | null;
  coach_rating_submitted_at: string | null;
  coach_feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  player_id: string;
  date: string;
  opponent_name: string;
  score: string;
  surface: string | null;
  format: MatchFormat;
  result: MatchResult;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  player_id: string;
  title: string;
  skill: SkillKey | null;
  target_rating: number | null;
  target_date: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface TennisCharacter {
  id: string;
  name: string;
  rarity: CharacterRarity;
  archetype: string;
  signature_line: string;
  unlock_condition_text: string;
  unlock_condition_type: UnlockConditionType;
  pixel_art_path: string;
  display_order: number;
  milestone_sessions?: number;
  achievement_id?: AchievementId;
}

export interface PlayerCollectionItem {
  player_id: string;
  character_id: string;
  earned_at: string;
  earned_via: EarnedVia;
}

export interface PlayerPack {
  id: string;
  player_id: string;
  pack_type: PackType;
  earned_at: string;
  opened_at: string | null;
  dropped_character_id: string | null;
}

export type AchievementId =
  | "first_match_win"
  | "seven_day_session_streak"
  | "skill_rating_8"
  | "beat_coach_by_1"
  | "twenty_match_wins"
  | "five_matches_in_month";

export interface PlayerAchievement {
  player_id: string;
  achievement_id: AchievementId;
  unlocked_at: string;
}

export interface CollectionProgress {
  owned: number;
  total: number;
  percent: number;
  by_rarity: Record<CharacterRarity, { owned: number; total: number }>;
}

export interface PackageSummary {
  package: CoachingPackage | null;
  remaining: number;
  total: number;
  used: number;
  is_low: boolean;
  is_depleted: boolean;
}

export interface SessionStats {
  completed_count: number;
  cancelled_count: number;
  no_show_count: number;
  total_duration_minutes: number;
  average_duration_minutes: number;
}

export interface MatchStats {
  total: number;
  wins: number;
  losses: number;
  win_percentage: number;
  current_streak: string;
  head_to_head: Array<{
    opponent_name: string;
    wins: number;
    losses: number;
    win_percentage: number;
  }>;
}

