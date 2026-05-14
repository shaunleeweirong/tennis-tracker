import type { CoachingSession, SessionStats } from "@/types";

export function isCreditConsumingSession(session: Pick<CoachingSession, "status">): boolean {
  return session.status === "complete" || session.status === "pending";
}

export function isCompletedSession(session: Pick<CoachingSession, "status">): boolean {
  return session.status === "complete";
}

export function countCompletedSessions(sessions: Pick<CoachingSession, "status">[]): number {
  return sessions.filter(isCompletedSession).length;
}

export function sessionStats(sessions: CoachingSession[]): SessionStats {
  const completed = sessions.filter((session) => session.status === "complete");
  const totalDuration = completed.reduce(
    (sum, session) => sum + (session.duration_minutes ?? 0),
    0,
  );

  return {
    completed_count: completed.length,
    cancelled_count: sessions.filter((session) => session.status === "cancelled").length,
    no_show_count: sessions.filter((session) => session.status === "no_show").length,
    total_duration_minutes: totalDuration,
    average_duration_minutes:
      completed.length === 0 ? 0 : Math.round(totalDuration / completed.length),
  };
}

export function currentSessionDayStreak(sessions: CoachingSession[]): number {
  const completedDays = [
    ...new Set(
      sessions
        .filter((session) => session.status === "complete")
        .map((session) => session.date)
        .sort((a, b) => b.localeCompare(a)),
    ),
  ];

  if (completedDays.length === 0) {
    return 0;
  }

  let streak = 1;
  let previous = parseDateOnly(completedDays[0]);

  for (const day of completedDays.slice(1)) {
    const current = parseDateOnly(day);
    const diffDays = Math.round(
      (previous.getTime() - current.getTime()) / (24 * 60 * 60 * 1000),
    );

    if (diffDays !== 1) {
      break;
    }

    streak += 1;
    previous = current;
  }

  return streak;
}

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

