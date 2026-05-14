import type { SkillDefinition, SkillKey } from "@/types";

export const SKILL_RUBRIC = [
  {
    key: "forehand",
    label: "Forehand",
    description: "Groundstroke from the dominant side",
  },
  {
    key: "backhand",
    label: "Backhand",
    description: "Groundstroke from the non-dominant side",
  },
  {
    key: "serve",
    label: "Serve",
    description: "First and second serve combined",
  },
  {
    key: "return",
    label: "Return",
    description: "Return of serve",
  },
  {
    key: "volley",
    label: "Volley",
    description: "Net play including swing volleys",
  },
  {
    key: "footwork",
    label: "Footwork",
    description: "Court movement, split step, recovery, balance",
  },
  {
    key: "mental_game",
    label: "Mental Game",
    description: "Composure, focus, handling pressure",
  },
  {
    key: "match_iq",
    label: "Match IQ",
    description: "Shot selection, pattern recognition, court positioning",
  },
] as const satisfies readonly SkillDefinition[];

export const SKILL_KEYS = SKILL_RUBRIC.map((skill) => skill.key) as SkillKey[];

export const SKILL_LABELS: Record<SkillKey, string> = Object.fromEntries(
  SKILL_RUBRIC.map((skill) => [skill.key, skill.label]),
) as Record<SkillKey, string>;

