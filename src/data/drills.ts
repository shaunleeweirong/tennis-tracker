import type { Drill } from "@/types";

const created_at = "2026-01-01T00:00:00.000Z";

export const SYSTEM_DRILLS: Drill[] = [
  {
    id: "drill-forehand-crosscourt",
    player_id: null,
    name: "Forehand Crosscourt",
    category: "groundstrokes",
    description: "Groove rally tolerance and shape from the forehand wing.",
    is_system: true,
    created_at,
  },
  {
    id: "drill-backhand-line",
    player_id: null,
    name: "Backhand Down The Line",
    category: "groundstrokes",
    description: "Practice changing direction with controlled margin.",
    is_system: true,
    created_at,
  },
  {
    id: "drill-serve-targets",
    player_id: null,
    name: "Serve Target Ladders",
    category: "serve",
    description: "Hit wide, body, and T targets on first and second serves.",
    is_system: true,
    created_at,
  },
  {
    id: "drill-return-depth",
    player_id: null,
    name: "Return Depth",
    category: "return",
    description: "Block and drive returns deep through the middle third.",
    is_system: true,
    created_at,
  },
  {
    id: "drill-volley-close",
    player_id: null,
    name: "Close And Volley",
    category: "volley",
    description: "Move through the volley and recover to attacking position.",
    is_system: true,
    created_at,
  },
  {
    id: "drill-split-step-recovery",
    player_id: null,
    name: "Split Step Recovery",
    category: "footwork",
    description: "Repeat split step, first step, strike, and recovery patterns.",
    is_system: true,
    created_at,
  },
  {
    id: "drill-court-sprints",
    player_id: null,
    name: "Court Sprint Intervals",
    category: "conditioning",
    description: "Short interval movement blocks for tennis-specific fitness.",
    is_system: true,
    created_at,
  },
  {
    id: "drill-pattern-play",
    player_id: null,
    name: "Pattern Play Points",
    category: "match play",
    description: "Start points with a planned pattern and review decisions.",
    is_system: true,
    created_at,
  },
];

