import { DEMO_DATA } from "@/data/demo";
import {
  achievementCharacters,
  achievementUnlocks,
  milestoneUnlocksForCompletedSessionCount,
  openPack,
  ownedCharacterIds,
  packAwardForCompletedSessionCount,
} from "@/lib/collection";
import { consumePackageSession, selectActivePackage } from "@/lib/packages";
import { countCompletedSessions, isCreditConsumingSession } from "@/lib/sessions";
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

const STORAGE_KEY = "tennis-tracker-demo-store-v1";

export interface DemoStoreState {
  profiles: Profile[];
  packages: CoachingPackage[];
  sessions: CoachingSession[];
  matches: Match[];
  goals: Goal[];
  collection: PlayerCollectionItem[];
  packs: PlayerPack[];
  achievements: PlayerAchievement[];
}

export interface DemoStore {
  getState(): DemoStoreState;
  subscribe(listener: (state: DemoStoreState) => void): () => void;
  reset(): void;
  addPackage(input: Omit<CoachingPackage, "id" | "player_id" | "created_at" | "updated_at">): CoachingPackage;
  logSession(input: DemoSessionInput): DemoSessionResult;
  submitCoachRating(sessionId: string, rating: RatingMap, feedback?: string): CoachingSession;
  logMatch(input: DemoMatchInput): DemoMatchResult;
  openSavedPack(packId: string): ReturnType<typeof openPack>;
  equipCharacter(characterId: string): Profile;
}

export interface DemoSessionInput {
  date: string;
  duration_minutes: number | null;
  notes?: string | null;
  status?: CoachingSession["status"];
  focus_area_ids?: string[];
  pre_self_rating?: RatingMap | null;
  post_self_rating?: RatingMap | null;
}

export interface DemoSessionResult {
  session: CoachingSession;
  earned_pack: PlayerPack | null;
  unlocked_characters: PlayerCollectionItem[];
  unlocked_achievements: PlayerAchievement[];
}

export interface DemoMatchInput {
  date: string;
  opponent_name: string;
  score: string;
  surface?: string | null;
  format: Match["format"];
  result: Match["result"];
  notes?: string | null;
}

export interface DemoMatchResult {
  match: Match;
  unlocked_characters: PlayerCollectionItem[];
  unlocked_achievements: PlayerAchievement[];
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function createDemoStore(initialState = loadInitialState()): DemoStore {
  let state = initialState;
  const listeners = new Set<(state: DemoStoreState) => void>();
  const playerId = DEMO_DATA.player.id;

  function setState(next: DemoStoreState): void {
    state = next;
    persistState(state);
    listeners.forEach((listener) => listener(state));
  }

  function addCollectionItem(characterId: string, earnedVia: PlayerCollectionItem["earned_via"], at: Date): PlayerCollectionItem | null {
    if (state.collection.some((item) => item.character_id === characterId)) {
      return null;
    }

    return {
      player_id: playerId,
      character_id: characterId,
      earned_at: at.toISOString(),
      earned_via: earnedVia,
    };
  }

  function applyAchievements(
    sessions: CoachingSession[],
    matches: Match[],
    at: Date,
  ): { achievements: PlayerAchievement[]; collection: PlayerCollectionItem[] } {
    const achievementIds = achievementUnlocks({
      player_id: playerId,
      sessions,
      matches,
      existing_achievements: state.achievements,
      at,
    });
    const achievements = achievementIds.map((achievement_id) => ({
      player_id: playerId,
      achievement_id,
      unlocked_at: at.toISOString(),
    }));
    const collection = achievementCharacters(achievementIds)
      .map((character) => addCollectionItem(character.id, "achievement", at))
      .filter(Boolean) as PlayerCollectionItem[];

    return { achievements, collection };
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset() {
      setState(cloneDemoState());
    },
    addPackage(input) {
      const at = new Date();
      const pkg: CoachingPackage = {
        ...input,
        id: makeId("package"),
        player_id: playerId,
        created_at: at.toISOString(),
        updated_at: at.toISOString(),
      };
      setState({ ...state, packages: [...state.packages, pkg] });
      return pkg;
    },
    logSession(input) {
      const at = new Date();
      const activePackage = selectActivePackage(state.packages, input.date);
      const status = input.status ?? "complete";
      const consumesCredit = isCreditConsumingSession({ status }) && Boolean(activePackage);
      const session: CoachingSession = {
        id: makeId("session"),
        player_id: playerId,
        package_id: consumesCredit ? activePackage?.id ?? null : null,
        date: input.date,
        duration_minutes: input.duration_minutes,
        notes: input.notes ?? null,
        status,
        focus_area_ids: input.focus_area_ids ?? [],
        no_package: !activePackage,
        pre_self_rating: input.pre_self_rating ?? null,
        pre_self_rating_submitted_at: input.pre_self_rating ? at.toISOString() : null,
        post_self_rating: input.post_self_rating ?? null,
        post_self_rating_submitted_at: input.post_self_rating ? at.toISOString() : null,
        coach_rating: null,
        coach_rating_submitted_at: null,
        coach_feedback: null,
        created_at: at.toISOString(),
        updated_at: at.toISOString(),
      };
      const sessions = [...state.sessions, session];
      const packages =
        consumesCredit && activePackage
          ? state.packages.map((pkg) =>
              pkg.id === activePackage.id ? consumePackageSession(pkg, at) : pkg,
            )
          : state.packages;
      const completedCount = countCompletedSessions(sessions);
      const packAward =
        status === "complete" ? packAwardForCompletedSessionCount(completedCount) : null;
      const earnedPack: PlayerPack | null = packAward
        ? {
            id: makeId("pack"),
            player_id: playerId,
            pack_type: packAward.pack_type,
            earned_at: at.toISOString(),
            opened_at: null,
            dropped_character_id: null,
          }
        : null;
      const milestoneItems = milestoneUnlocksForCompletedSessionCount(
        completedCount,
        ownedCharacterIds(state.collection),
      )
        .map((character) => addCollectionItem(character.id, "milestone", at))
        .filter(Boolean) as PlayerCollectionItem[];
      const achievement = applyAchievements(sessions, state.matches, at);
      const nextState = {
        ...state,
        packages,
        sessions,
        packs: earnedPack ? [...state.packs, earnedPack] : state.packs,
        collection: [...state.collection, ...milestoneItems, ...achievement.collection],
        achievements: [...state.achievements, ...achievement.achievements],
      };
      setState(nextState);

      return {
        session,
        earned_pack: earnedPack,
        unlocked_characters: [...milestoneItems, ...achievement.collection],
        unlocked_achievements: achievement.achievements,
      };
    },
    submitCoachRating(sessionId, rating, feedback) {
      const at = new Date();
      let updated: CoachingSession | null = null;
      const sessions = state.sessions.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }

        updated = {
          ...session,
          coach_rating: rating,
          coach_rating_submitted_at: at.toISOString(),
          coach_feedback: feedback ?? null,
          updated_at: at.toISOString(),
        };
        return updated;
      });

      if (!updated) {
        throw new Error(`Unknown session id: ${sessionId}`);
      }

      const achievement = applyAchievements(sessions, state.matches, at);
      setState({
        ...state,
        sessions,
        collection: [...state.collection, ...achievement.collection],
        achievements: [...state.achievements, ...achievement.achievements],
      });
      return updated;
    },
    logMatch(input) {
      const at = new Date();
      const match: Match = {
        id: makeId("match"),
        player_id: playerId,
        date: input.date,
        opponent_name: input.opponent_name,
        score: input.score,
        surface: input.surface ?? null,
        format: input.format,
        result: input.result,
        notes: input.notes ?? null,
        created_at: at.toISOString(),
        updated_at: at.toISOString(),
      };
      const matches = [...state.matches, match];
      const achievement = applyAchievements(state.sessions, matches, at);
      setState({
        ...state,
        matches,
        collection: [...state.collection, ...achievement.collection],
        achievements: [...state.achievements, ...achievement.achievements],
      });

      return {
        match,
        unlocked_characters: achievement.collection,
        unlocked_achievements: achievement.achievements,
      };
    },
    openSavedPack(packId) {
      const at = new Date();
      const pack = state.packs.find((item) => item.id === packId);
      if (!pack) {
        throw new Error(`Unknown pack id: ${packId}`);
      }

      if (pack.opened_at) {
        throw new Error(`Pack already opened: ${packId}`);
      }

      const result = openPack(pack.pack_type, ownedCharacterIds(state.collection));
      const collectionItem =
        result.character && addCollectionItem(result.character.id, "pack", at);
      setState({
        ...state,
        packs: state.packs.map((item) =>
          item.id === packId
            ? {
                ...item,
                opened_at: at.toISOString(),
                dropped_character_id: result.character?.id ?? null,
              }
            : item,
        ),
        collection: collectionItem ? [...state.collection, collectionItem] : state.collection,
      });
      return result;
    },
    equipCharacter(characterId) {
      if (!state.collection.some((item) => item.character_id === characterId)) {
        throw new Error(`Cannot equip locked character: ${characterId}`);
      }

      const profiles = state.profiles.map((profile) =>
        profile.id === playerId
          ? {
              ...profile,
              equipped_character_id: characterId,
              updated_at: new Date().toISOString(),
            }
          : profile,
      );
      const player = profiles.find((profile) => profile.id === playerId);
      if (!player) {
        throw new Error("Demo player profile is missing.");
      }

      setState({ ...state, profiles });
      return player;
    },
  };
}

function loadInitialState(): DemoStoreState {
  if (typeof window === "undefined") {
    return cloneDemoState();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return cloneDemoState();
  }

  try {
    return JSON.parse(stored) as DemoStoreState;
  } catch {
    return cloneDemoState();
  }
}

function persistState(state: DemoStoreState): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function cloneDemoState(): DemoStoreState {
  return {
    profiles: structuredClone(DEMO_DATA.profiles),
    packages: structuredClone(DEMO_DATA.packages),
    sessions: structuredClone(DEMO_DATA.sessions),
    matches: structuredClone(DEMO_DATA.matches),
    goals: structuredClone(DEMO_DATA.goals),
    collection: structuredClone(DEMO_DATA.collection),
    packs: structuredClone(DEMO_DATA.packs),
    achievements: structuredClone(DEMO_DATA.achievements),
  };
}

function makeId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
