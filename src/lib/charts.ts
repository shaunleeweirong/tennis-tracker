import { SKILL_KEYS } from "@/data/rubric";
import { averageRating, ratingDelta, roundToOne } from "@/lib/ratings";
import type { CoachingSession, Match, SkillKey } from "@/types";

export type ChartRange = "30d" | "90d" | "year" | "all";

export interface SkillTrendPoint {
  date: string;
  self: number | null;
  coach: number | null;
  pre_self: number | null;
}

export interface OverallTrendPoint {
  date: string;
  self: number | null;
  coach: number | null;
  pre_self: number | null;
}

export interface DeltaChartPoint {
  skill: SkillKey;
  delta: number;
}

export interface CumulativeWinsPoint {
  date: string;
  wins: number;
  matches: number;
}

export function filterByRange<T extends { date: string }>(
  rows: T[],
  range: ChartRange,
  asOfDate = new Date(),
): T[] {
  if (range === "all") {
    return rows;
  }

  const days = range === "30d" ? 30 : range === "90d" ? 90 : 365;
  const start = new Date(asOfDate);
  start.setDate(start.getDate() - days);
  const startString = start.toISOString().slice(0, 10);

  return rows.filter((row) => row.date >= startString);
}

export function skillTrendData(
  sessions: CoachingSession[],
  skill: SkillKey,
  range: ChartRange = "all",
): SkillTrendPoint[] {
  return filterByRange(
    sessions
      .filter((session) => session.status === "complete")
      .sort((a, b) => a.date.localeCompare(b.date)),
    range,
  ).map((session) => ({
    date: session.date,
    self: session.post_self_rating?.[skill] ?? null,
    coach: session.coach_rating_submitted_at ? session.coach_rating?.[skill] ?? null : null,
    pre_self: session.pre_self_rating?.[skill] ?? null,
  }));
}

export function overallTrendData(
  sessions: CoachingSession[],
  range: ChartRange = "all",
): OverallTrendPoint[] {
  return filterByRange(
    sessions
      .filter((session) => session.status === "complete")
      .sort((a, b) => a.date.localeCompare(b.date)),
    range,
  ).map((session) => ({
    date: session.date,
    self: averageRating(session.post_self_rating),
    coach: session.coach_rating_submitted_at
      ? averageRating(session.coach_rating)
      : null,
    pre_self: averageRating(session.pre_self_rating),
  }));
}

export function selfCoachDeltaData(sessions: CoachingSession[]): DeltaChartPoint[] {
  const deltas = SKILL_KEYS.reduce(
    (accumulator, skill) => {
      accumulator[skill] = [];
      return accumulator;
    },
    {} as Record<SkillKey, number[]>,
  );

  for (const session of sessions) {
    if (!session.coach_rating_submitted_at) {
      continue;
    }

    const delta = ratingDelta(session.post_self_rating, session.coach_rating);
    if (!delta) {
      continue;
    }

    for (const skill of SKILL_KEYS) {
      deltas[skill].push(delta[skill]);
    }
  }

  return SKILL_KEYS.map((skill) => {
    const values = deltas[skill];
    const average =
      values.length === 0
        ? 0
        : roundToOne(values.reduce((sum, value) => sum + value, 0) / values.length);

    return { skill, delta: average };
  });
}

export function cumulativeWinsData(
  matches: Match[],
  range: ChartRange = "all",
): CumulativeWinsPoint[] {
  let wins = 0;
  let count = 0;

  return filterByRange(
    [...matches].sort((a, b) => a.date.localeCompare(b.date)),
    range,
  ).map((match) => {
    count += 1;
    if (match.result === "W") {
      wins += 1;
    }

    return {
      date: match.date,
      wins,
      matches: count,
    };
  });
}
