import { SKILL_KEYS } from "@/data/rubric";
import type { RatingMap, SkillKey } from "@/types";

export interface RatingValidationResult {
  ok: boolean;
  issues: string[];
}

export function isSkillKey(value: string): value is SkillKey {
  return SKILL_KEYS.includes(value as SkillKey);
}

export function validateRatingMap(value: unknown): RatingValidationResult {
  const issues: string[] = [];

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, issues: ["Rating must be an object."] };
  }

  const rating = value as Record<string, unknown>;
  const keys = Object.keys(rating);

  for (const skill of SKILL_KEYS) {
    if (!(skill in rating)) {
      issues.push(`Missing rating for ${skill}.`);
      continue;
    }

    const score = rating[skill];
    if (typeof score !== "number" || !Number.isInteger(score) || score < 1 || score > 10) {
      issues.push(`${skill} must be an integer from 1 to 10.`);
    }
  }

  for (const key of keys) {
    if (!isSkillKey(key)) {
      issues.push(`Unknown rating key ${key}.`);
    }
  }

  return { ok: issues.length === 0, issues };
}

export function assertRatingMap(value: unknown): RatingMap {
  const result = validateRatingMap(value);

  if (!result.ok) {
    throw new Error(result.issues.join(" "));
  }

  return value as RatingMap;
}

export function averageRating(rating: RatingMap | null | undefined): number | null {
  if (!rating) {
    return null;
  }

  const total = SKILL_KEYS.reduce((sum, skill) => sum + rating[skill], 0);
  return roundToOne(total / SKILL_KEYS.length);
}

export function ratingDelta(
  left: RatingMap | null | undefined,
  right: RatingMap | null | undefined,
): Record<SkillKey, number> | null {
  if (!left || !right) {
    return null;
  }

  return Object.fromEntries(
    SKILL_KEYS.map((skill) => [skill, roundToOne(left[skill] - right[skill])]),
  ) as Record<SkillKey, number>;
}

export function hasAnyRatingAtLeast(
  rating: RatingMap | null | undefined,
  target: number,
): boolean {
  return Boolean(rating && SKILL_KEYS.some((skill) => rating[skill] >= target));
}

export function hasSelfCoachGapAtLeast(
  selfRating: RatingMap | null | undefined,
  coachRating: RatingMap | null | undefined,
  gap: number,
): boolean {
  if (!selfRating || !coachRating) {
    return false;
  }

  return SKILL_KEYS.some((skill) => selfRating[skill] - coachRating[skill] >= gap);
}

export function roundToOne(value: number): number {
  return Math.round(value * 10) / 10;
}
