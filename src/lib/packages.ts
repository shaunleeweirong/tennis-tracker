import type { CoachingPackage, PackageSummary } from "@/types";

export function remainingSessions(pkg: CoachingPackage | null | undefined): number {
  if (!pkg) {
    return 0;
  }

  return Math.max(0, pkg.total_sessions - pkg.sessions_used);
}

export function isPackageActive(
  pkg: CoachingPackage,
  asOfDate = todayDateString(),
): boolean {
  if (pkg.start_date > asOfDate) {
    return false;
  }

  if (pkg.end_date && pkg.end_date < asOfDate) {
    return false;
  }

  return remainingSessions(pkg) > 0;
}

export function selectActivePackage(
  packages: CoachingPackage[],
  asOfDate = todayDateString(),
): CoachingPackage | null {
  return [...packages]
    .filter((pkg) => isPackageActive(pkg, asOfDate))
    .sort((a, b) => {
      if (a.start_date !== b.start_date) {
        return b.start_date.localeCompare(a.start_date);
      }

      return b.created_at.localeCompare(a.created_at);
    })[0] ?? null;
}

export function packageSummary(
  packages: CoachingPackage[],
  asOfDate = todayDateString(),
): PackageSummary {
  const activePackage = selectActivePackage(packages, asOfDate);
  const remaining = remainingSessions(activePackage);

  return {
    package: activePackage,
    remaining,
    total: activePackage?.total_sessions ?? 0,
    used: activePackage?.sessions_used ?? 0,
    is_low: Boolean(activePackage && remaining <= 2 && remaining > 0),
    is_depleted: Boolean(activePackage && remaining === 0),
  };
}

export function consumePackageSession(pkg: CoachingPackage, at = new Date()): CoachingPackage {
  return {
    ...pkg,
    sessions_used: Math.min(pkg.total_sessions, pkg.sessions_used + 1),
    updated_at: at.toISOString(),
  };
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

