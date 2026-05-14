import {
  ACHIEVEMENT_UNLOCKS,
  CHARACTERS,
  MILESTONE_UNLOCKS,
  RARITY_ORDER,
} from "@/data/characters";
import { countMatchWins, hasFiveMatchesInSingleMonth } from "@/lib/matches";
import { hasAnyRatingAtLeast, hasSelfCoachGapAtLeast } from "@/lib/ratings";
import { currentSessionDayStreak } from "@/lib/sessions";
import type {
  AchievementId,
  CharacterRarity,
  CoachingSession,
  CollectionProgress,
  Match,
  PackType,
  PlayerAchievement,
  PlayerCollectionItem,
  TennisCharacter,
} from "@/types";

export interface PackAward {
  pack_type: PackType;
  completed_session_count: number;
}

export interface PackOpenResult {
  kind: "character" | "no_duplicates";
  character: TennisCharacter | null;
  rolled_rarity: CharacterRarity | null;
  awarded_rarity: CharacterRarity | null;
  message: string;
}

export interface AchievementCheckContext {
  player_id: string;
  sessions: CoachingSession[];
  matches: Match[];
  existing_achievements: PlayerAchievement[];
  at?: Date;
}

export function packAwardForCompletedSessionCount(
  completedSessionCount: number,
): PackAward | null {
  if (completedSessionCount <= 0) {
    return null;
  }

  if (completedSessionCount % 10 === 0) {
    return { pack_type: "better", completed_session_count: completedSessionCount };
  }

  if (completedSessionCount % 3 === 0) {
    return { pack_type: "standard", completed_session_count: completedSessionCount };
  }

  return null;
}

export function milestoneUnlocksForCompletedSessionCount(
  completedSessionCount: number,
  ownedCharacterIds: Iterable<string>,
): TennisCharacter[] {
  const owned = new Set(ownedCharacterIds);

  return Object.entries(MILESTONE_UNLOCKS)
    .filter(([count, characterId]) => completedSessionCount >= Number(count) && !owned.has(characterId))
    .map(([, characterId]) => getCharacter(characterId))
    .filter(Boolean);
}

export function achievementUnlocks(context: AchievementCheckContext): AchievementId[] {
  const existing = new Set(
    context.existing_achievements.map((achievement) => achievement.achievement_id),
  );
  const next: AchievementId[] = [];
  const latestSession = [...context.sessions]
    .filter((session) => session.status === "complete")
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  addAchievement(
    next,
    existing,
    "first_match_win",
    context.matches.some((match) => match.result === "W"),
  );
  addAchievement(
    next,
    existing,
    "seven_day_session_streak",
    currentSessionDayStreak(context.sessions) >= 7,
  );
  addAchievement(
    next,
    existing,
    "skill_rating_8",
    context.sessions.some(
      (session) =>
        hasAnyRatingAtLeast(session.post_self_rating, 8) ||
        hasAnyRatingAtLeast(session.coach_rating, 8),
    ),
  );
  addAchievement(
    next,
    existing,
    "beat_coach_by_1",
    Boolean(
      latestSession &&
        hasSelfCoachGapAtLeast(latestSession.post_self_rating, latestSession.coach_rating, 1),
    ) ||
      context.sessions.some((session) =>
        hasSelfCoachGapAtLeast(session.post_self_rating, session.coach_rating, 1),
      ),
  );
  addAchievement(next, existing, "twenty_match_wins", countMatchWins(context.matches) >= 20);
  addAchievement(
    next,
    existing,
    "five_matches_in_month",
    hasFiveMatchesInSingleMonth(context.matches),
  );

  return next;
}

export function achievementCharacters(achievementIds: AchievementId[]): TennisCharacter[] {
  return achievementIds
    .map((achievementId) => getCharacter(ACHIEVEMENT_UNLOCKS[achievementId]))
    .filter(Boolean);
}

export function openPack(
  packType: PackType,
  ownedCharacterIds: Iterable<string>,
  random = Math.random,
): PackOpenResult {
  const rolledRarity = rollPackRarity(packType, random);
  const fallbackRarities = fallbackRarityOrder(rolledRarity);
  const owned = new Set(ownedCharacterIds);

  for (const rarity of fallbackRarities) {
    const pool = CHARACTERS.filter(
      (character) =>
        character.rarity === rarity &&
        character.unlock_condition_type === "pack_drop" &&
        !owned.has(character.id),
    );

    if (pool.length > 0) {
      const character = pool[Math.floor(random() * pool.length)];
      return {
        kind: "character",
        character,
        rolled_rarity: rolledRarity,
        awarded_rarity: rarity,
        message: `Unlocked ${character.name}.`,
      };
    }
  }

  return {
    kind: "no_duplicates",
    character: null,
    rolled_rarity: rolledRarity,
    awarded_rarity: null,
    message: "All eligible pack characters are already owned.",
  };
}

export function collectionProgress(
  characters: TennisCharacter[],
  ownedCharacterIds: Iterable<string>,
): CollectionProgress {
  const owned = new Set(ownedCharacterIds);
  const by_rarity = Object.fromEntries(
    RARITY_ORDER.map((rarity) => [
      rarity,
      {
        owned: characters.filter(
          (character) => character.rarity === rarity && owned.has(character.id),
        ).length,
        total: characters.filter((character) => character.rarity === rarity).length,
      },
    ]),
  ) as CollectionProgress["by_rarity"];
  const ownedCount = characters.filter((character) => owned.has(character.id)).length;

  return {
    owned: ownedCount,
    total: characters.length,
    percent: characters.length === 0 ? 0 : Math.round((ownedCount / characters.length) * 100),
    by_rarity,
  };
}

export function getCharacter(characterId: string): TennisCharacter {
  const character = CHARACTERS.find((item) => item.id === characterId);

  if (!character) {
    throw new Error(`Unknown character id: ${characterId}`);
  }

  return character;
}

export function ownedCharacterIds(collection: PlayerCollectionItem[]): Set<string> {
  return new Set(collection.map((item) => item.character_id));
}

function rollPackRarity(packType: PackType, random: () => number): CharacterRarity {
  if (packType === "standard") {
    return "common";
  }

  return random() < 0.8 ? "common" : "rare";
}

function fallbackRarityOrder(rolledRarity: CharacterRarity): CharacterRarity[] {
  if (rolledRarity === "common") {
    return ["common", "rare", "epic"];
  }

  if (rolledRarity === "rare") {
    return ["rare", "epic"];
  }

  return [rolledRarity];
}

function addAchievement(
  next: AchievementId[],
  existing: Set<AchievementId>,
  achievementId: AchievementId,
  condition: boolean,
): void {
  if (condition && !existing.has(achievementId)) {
    next.push(achievementId);
  }
}

