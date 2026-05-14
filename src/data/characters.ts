import type { AchievementId, CharacterRarity, TennisCharacter } from "@/types";

const art = (id: string) => `/characters/${id}.png`;

export const MILESTONE_UNLOCKS: Record<number, string> = {
  25: "spin-savant",
  50: "net-commander",
  100: "grand-slam-guardian",
  250: "court-legend",
};

export const ACHIEVEMENT_UNLOCKS: Record<AchievementId, string> = {
  first_match_win: "clutch-finisher",
  seven_day_session_streak: "streak-sprinter",
  skill_rating_8: "eight-point-ace",
  beat_coach_by_1: "self-believer",
  twenty_match_wins: "match-winner",
  five_matches_in_month: "calendar-crusher",
};

export const CHARACTERS: TennisCharacter[] = [
  {
    id: "rookie",
    name: "Rookie",
    rarity: "default",
    archetype: "Starter",
    signature_line: "Fresh strings, clear eyes.",
    unlock_condition_text: "Owned from the start",
    unlock_condition_type: "default",
    pixel_art_path: art("rookie"),
    display_order: 1,
  },
  ...[
    ["baseline-buddy", "Baseline Buddy", "Baseliner"],
    ["topspin-tinkerer", "Topspin Tinkerer", "Heavy Spinner"],
    ["slice-scout", "Slice Scout", "Defender"],
    ["serve-apprentice", "Serve Apprentice", "Server"],
    ["return-ranger", "Return Ranger", "Counterpuncher"],
    ["volley-spark", "Volley Spark", "Net Player"],
    ["footwork-flash", "Footwork Flash", "Mover"],
    ["focus-friend", "Focus Friend", "Composed Competitor"],
    ["pattern-planner", "Pattern Planner", "Strategist"],
    ["drop-shot-dreamer", "Drop Shot Dreamer", "Touch Player"],
    ["lob-lifter", "Lob Lifter", "Retriever"],
  ].map(
    ([id, name, archetype], index): TennisCharacter => ({
      id,
      name,
      rarity: "common",
      archetype,
      signature_line: "Small gains stack up.",
      unlock_condition_text: "Open Standard or Better packs",
      unlock_condition_type: "pack_drop",
      pixel_art_path: art(id),
      display_order: index + 2,
    }),
  ),
  ...(
    [
      ["clutch-finisher", "Clutch Finisher", "Closer", "first_match_win"],
      ["streak-sprinter", "Streak Sprinter", "Training Engine", "seven_day_session_streak"],
      ["eight-point-ace", "Eight Point Ace", "Breakthrough Player", "skill_rating_8"],
      ["self-believer", "Self Believer", "Confident Striker", "beat_coach_by_1"],
      ["match-winner", "Match Winner", "Competitor", "twenty_match_wins"],
      ["calendar-crusher", "Calendar Crusher", "Frequent Competitor", "five_matches_in_month"],
    ] as const
  ).map(
    ([id, name, archetype, achievement_id], index): TennisCharacter => ({
      id,
      name,
      rarity: "rare",
      archetype,
      signature_line: "Earned under pressure.",
      unlock_condition_text: achievementText(achievement_id),
      unlock_condition_type: "achievement",
      pixel_art_path: art(id),
      display_order: index + 13,
      achievement_id,
    }),
  ),
  {
    id: "spin-savant",
    name: "Spin Savant",
    rarity: "epic",
    archetype: "Topspin Architect",
    signature_line: "Shape the point before it shapes you.",
    unlock_condition_text: "Complete 25 coaching sessions",
    unlock_condition_type: "session_milestone",
    pixel_art_path: art("spin-savant"),
    display_order: 19,
    milestone_sessions: 25,
  },
  {
    id: "net-commander",
    name: "Net Commander",
    rarity: "epic",
    archetype: "All-Court Attacker",
    signature_line: "Own the short ball.",
    unlock_condition_text: "Complete 50 coaching sessions",
    unlock_condition_type: "session_milestone",
    pixel_art_path: art("net-commander"),
    display_order: 20,
    milestone_sessions: 50,
  },
  {
    id: "tiebreak-tactician",
    name: "Tiebreak Tactician",
    rarity: "epic",
    archetype: "Pattern Master",
    signature_line: "The right ball at the right time.",
    unlock_condition_text: "Open Better packs",
    unlock_condition_type: "pack_drop",
    pixel_art_path: art("tiebreak-tactician"),
    display_order: 21,
  },
  {
    id: "tempo-captain",
    name: "Tempo Captain",
    rarity: "epic",
    archetype: "Rhythm Controller",
    signature_line: "Change pace, change the match.",
    unlock_condition_text: "Open Better packs",
    unlock_condition_type: "pack_drop",
    pixel_art_path: art("tempo-captain"),
    display_order: 22,
  },
  {
    id: "grand-slam-guardian",
    name: "Grand Slam Guardian",
    rarity: "legendary",
    archetype: "Champion",
    signature_line: "Big stages reward steady habits.",
    unlock_condition_text: "Complete 100 coaching sessions",
    unlock_condition_type: "session_milestone",
    pixel_art_path: art("grand-slam-guardian"),
    display_order: 23,
    milestone_sessions: 100,
  },
  {
    id: "court-legend",
    name: "Court Legend",
    rarity: "legendary",
    archetype: "Icon",
    signature_line: "Leave the court better than you found it.",
    unlock_condition_text: "Complete 250 coaching sessions",
    unlock_condition_type: "session_milestone",
    pixel_art_path: art("court-legend"),
    display_order: 24,
    milestone_sessions: 250,
  },
];

export const RARITY_ORDER: CharacterRarity[] = [
  "default",
  "common",
  "rare",
  "epic",
  "legendary",
];

function achievementText(achievementId: AchievementId): string {
  const text: Record<AchievementId, string> = {
    first_match_win: "Win your first match",
    seven_day_session_streak: "Log sessions on a 7-day streak",
    skill_rating_8: "Hit 8.0 on any skill",
    beat_coach_by_1: "Rate yourself 1+ point above coach on any skill",
    twenty_match_wins: "Log 20 match wins",
    five_matches_in_month: "Log 5 matches in a single month",
  };

  return text[achievementId];
}

