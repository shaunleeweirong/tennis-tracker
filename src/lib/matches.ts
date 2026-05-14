import type { Match, MatchStats } from "@/types";

export function matchWinPercentage(matches: Pick<Match, "result">[]): number {
  if (matches.length === 0) {
    return 0;
  }

  const wins = matches.filter((match) => match.result === "W").length;
  return Math.round((wins / matches.length) * 100);
}

export function currentMatchStreak(matches: Pick<Match, "date" | "result">[]): string {
  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    return "0";
  }

  const result = sorted[0].result;
  const count = sorted.findIndex((match) => match.result !== result);
  const streak = count === -1 ? sorted.length : count;

  return `${result}${streak}`;
}

export function headToHead(matches: Match[]): MatchStats["head_to_head"] {
  const rows = new Map<string, { wins: number; losses: number }>();

  for (const match of matches) {
    const key = normalizeOpponentName(match.opponent_name);
    const row = rows.get(key) ?? { wins: 0, losses: 0 };
    if (match.result === "W") {
      row.wins += 1;
    } else {
      row.losses += 1;
    }
    rows.set(key, row);
  }

  return [...rows.entries()]
    .map(([opponent_name, row]) => ({
      opponent_name,
      wins: row.wins,
      losses: row.losses,
      win_percentage:
        row.wins + row.losses === 0
          ? 0
          : Math.round((row.wins / (row.wins + row.losses)) * 100),
    }))
    .sort((a, b) => a.opponent_name.localeCompare(b.opponent_name));
}

export function matchStats(matches: Match[]): MatchStats {
  const wins = matches.filter((match) => match.result === "W").length;
  const losses = matches.length - wins;

  return {
    total: matches.length,
    wins,
    losses,
    win_percentage: matchWinPercentage(matches),
    current_streak: currentMatchStreak(matches),
    head_to_head: headToHead(matches),
  };
}

export function countMatchWins(matches: Pick<Match, "result">[]): number {
  return matches.filter((match) => match.result === "W").length;
}

export function hasFiveMatchesInSingleMonth(matches: Pick<Match, "date">[]): boolean {
  const counts = new Map<string, number>();

  for (const match of matches) {
    const month = match.date.slice(0, 7);
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }

  return [...counts.values()].some((count) => count >= 5);
}

function normalizeOpponentName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

