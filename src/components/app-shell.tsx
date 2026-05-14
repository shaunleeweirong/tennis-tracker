import Link from "next/link";
import type { ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  Dumbbell,
  Goal,
  Home,
  Package,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { PixelAvatar } from "@/components/pixel-avatar";

const playerLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/sessions", label: "Sessions", icon: CalendarCheck },
  { href: "/matches", label: "Matches", icon: Trophy },
  { href: "/goals", label: "Goals", icon: Goal },
  { href: "/drills", label: "Drills", icon: Dumbbell },
  { href: "/packages", label: "Packages", icon: Package },
  { href: "/charts", label: "Charts", icon: BarChart3 },
  { href: "/collection", label: "Collection", icon: Sparkles },
];

const coachLinks = [
  { href: "/coach", label: "Coach Home", icon: ShieldCheck },
  { href: "/coach/players", label: "Player", icon: BookOpen },
];

export function AppShell({
  children,
  mode = "player",
}: {
  children: ReactNode;
  mode?: "player" | "coach";
}) {
  const links = mode === "coach" ? coachLinks : playerLinks;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href={mode === "coach" ? "/coach" : "/dashboard"} className="flex items-center gap-3">
            <PixelAvatar size="sm" rarity={mode === "coach" ? "rare" : "default"} />
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Tennis Tracker</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {mode === "coach" ? "Coach view" : "Player view"}
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/login"
            className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)]"
          >
            Switch user
          </Link>
        </div>
        <nav className="scrollbar-hide flex gap-1 overflow-x-auto border-t border-[var(--border)] px-4 py-2 lg:hidden">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
    </div>
  );
}
