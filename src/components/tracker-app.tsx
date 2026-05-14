"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Check,
  CircleAlert,
  Dumbbell,
  Film,
  Gift,
  Medal,
  Package,
  Plus,
  Save,
  Sparkles,
  Trophy,
  UserRoundCheck,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { AppShell } from "@/components/app-shell";
import { PixelAvatar } from "@/components/pixel-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form-controls";

type SkillKey =
  | "forehand"
  | "backhand"
  | "serve"
  | "return"
  | "volley"
  | "footwork"
  | "mental_game"
  | "match_iq";

type Rating = Record<SkillKey, number>;
type SessionStatus = "complete" | "pending" | "cancelled" | "no_show";
type Rarity = "default" | "common" | "rare" | "epic" | "legendary";

type TennisPackage = {
  id: string;
  totalSessions: number;
  sessionsUsed: number;
  startDate: string;
  endDate?: string;
  price?: number;
};

type Session = {
  id: string;
  date: string;
  durationMinutes: number;
  drills: string[];
  notes: string;
  status: SessionStatus;
  packageId?: string;
  preSelfRating?: Rating;
  postSelfRating: Rating;
  coachRating?: Rating;
  coachFeedback?: string;
  media: MediaAttachment[];
};

type MediaAttachment = {
  id: string;
  name: string;
  mimeType: string;
  url: string;
};

type Match = {
  id: string;
  date: string;
  opponentName: string;
  score: string;
  surface: string;
  format: "singles" | "doubles";
  result: "W" | "L";
  notes?: string;
};

type GoalItem = {
  id: string;
  title: string;
  skill?: SkillKey;
  targetRating?: number;
  targetDate?: string;
  status: "active" | "complete" | "abandoned";
};

type Drill = {
  id: string;
  name: string;
  category: string;
  description: string;
  isSystem: boolean;
};

type Character = {
  id: string;
  name: string;
  rarity: Rarity;
  archetype: string;
  signatureLine: string;
  unlockConditionText: string;
  unlockConditionType: "default" | "pack_drop" | "session_milestone" | "achievement";
  owned: boolean;
  earnedVia?: "default" | "pack" | "milestone" | "achievement";
};

type Pack = {
  id: string;
  type: "standard" | "better";
  earnedAt: string;
};

type TrackerState = {
  mode: "player" | "coach";
  packages: TennisPackage[];
  sessions: Session[];
  matches: Match[];
  goals: GoalItem[];
  drills: Drill[];
  characters: Character[];
  packs: Pack[];
  equippedCharacterId: string;
  achievements: string[];
  lastReward?: string;
};

const skillLabels: Record<SkillKey, string> = {
  forehand: "Forehand",
  backhand: "Backhand",
  serve: "Serve",
  return: "Return",
  volley: "Volley",
  footwork: "Footwork",
  mental_game: "Mental Game",
  match_iq: "Match IQ",
};

const skillKeys = Object.keys(skillLabels) as SkillKey[];

const baseRating: Rating = {
  forehand: 7,
  backhand: 6,
  serve: 7,
  return: 6,
  volley: 5,
  footwork: 7,
  mental_game: 6,
  match_iq: 7,
};

const defaultDrills: Drill[] = [
  { id: "crosscourt-forehand", name: "Forehand Crosscourt", category: "Groundstrokes", description: "Heavy crosscourt rally pattern with recovery target.", isSystem: true },
  { id: "backhand-depth", name: "Backhand Depth Ladder", category: "Groundstrokes", description: "Progressive targets to build depth and height.", isSystem: true },
  { id: "serve-plus-one", name: "Serve + One", category: "Serve", description: "Serve pattern into first attacking ball.", isSystem: true },
  { id: "return-middle", name: "Return Through Middle", category: "Return", description: "Compact returns aimed deep through the center.", isSystem: true },
  { id: "volley-close", name: "Close And Volley", category: "Volley", description: "Approach, split, close, and finish volleys.", isSystem: true },
  { id: "split-step", name: "Split-Step Timing", category: "Footwork", description: "Movement rhythm and recovery timing.", isSystem: true },
  { id: "pressure-tiebreak", name: "Pressure Tiebreaks", category: "Match Play", description: "Short scoring games under pressure.", isSystem: true },
  { id: "repeat-sprints", name: "Repeat Court Sprints", category: "Conditioning", description: "Short recovery sprint intervals.", isSystem: true },
];

const characterSeeds: Omit<Character, "owned" | "earnedVia">[] = [
  ["rookie", "Rookie", "default", "New Contender", "Fresh strings. Clear eyes.", "Default character", "default"],
  ["baseline-bolt", "Baseline Bolt", "common", "Baseliner", "Own the rally.", "Drop from Standard packs", "pack_drop"],
  ["topspin-kid", "Topspin Kid", "common", "Heavy Hitter", "Shape buys time.", "Drop from Standard packs", "pack_drop"],
  ["net-scout", "Net Scout", "common", "All-Court", "Take the space.", "Drop from Standard packs", "pack_drop"],
  ["slice-smith", "Slice Smith", "common", "Counterpuncher", "Low and awkward.", "Drop from Standard packs", "pack_drop"],
  ["serve-spark", "Serve Spark", "common", "Server", "Start points with intent.", "Drop from Standard packs", "pack_drop"],
  ["clay-runner", "Clay Runner", "common", "Retriever", "One more ball.", "Drop from Standard packs", "pack_drop"],
  ["return-rider", "Return Rider", "common", "Returner", "Neutralize first.", "Drop from Standard packs", "pack_drop"],
  ["volley-vibe", "Volley Vibe", "common", "Net Player", "Hands out front.", "Drop from Standard packs", "pack_drop"],
  ["footwork-flash", "Footwork Flash", "common", "Mover", "Arrive balanced.", "Drop from Standard packs", "pack_drop"],
  ["moonball-mage", "Moonball Mage", "common", "Disruptor", "Height changes everything.", "Drop from Standard packs", "pack_drop"],
  ["tiebreak-tactician", "Tiebreak Tactician", "common", "Strategist", "Simple targets, brave swings.", "Drop from Standard packs", "pack_drop"],
  ["first-win-finisher", "First-Win Finisher", "rare", "Closer", "Remember the first one.", "Win your first match", "achievement"],
  ["streak-sprinter", "Streak Sprinter", "rare", "Grinder", "Stack the days.", "Log a 7-day session streak", "achievement"],
  ["eight-point-ace", "Eight-Point Ace", "rare", "Breakthrough", "Eight is a platform.", "Hit 8.0 on any skill", "achievement"],
  ["coach-crusher", "Coach Crusher", "rare", "Self Believer", "Back your read.", "Beat coach rating by 1+ point", "achievement"],
  ["twenty-win-pro", "Twenty-Win Pro", "rare", "Competitor", "Winning is a habit.", "Log 20 match wins", "achievement"],
  ["monthly-matchmaker", "Monthly Matchmaker", "rare", "Match Tough", "Compete often.", "Log 5 matches in a month", "achievement"],
  ["quarter-century-captain", "Quarter-Century Captain", "epic", "Leader", "Twenty-five sessions in.", "Reach 25 completed sessions", "session_milestone"],
  ["fifty-session-force", "Fifty-Session Force", "epic", "Veteran", "Fifty reps of commitment.", "Reach 50 completed sessions", "session_milestone"],
  ["spin-savant", "Spin Savant", "epic", "Artist", "Paint the court.", "Rare Better pack drop", "pack_drop"],
  ["court-commander", "Court Commander", "epic", "Tactician", "Patterns win points.", "Rare Better pack drop", "pack_drop"],
  ["century-champion", "Century Champion", "legendary", "Champion", "One hundred sessions strong.", "Reach 100 completed sessions", "session_milestone"],
  ["legacy-legend", "Legacy Legend", "legendary", "Legend", "Built point by point.", "Reach 250 completed sessions", "session_milestone"],
].map(([id, name, rarity, archetype, signatureLine, unlockConditionText, unlockConditionType]) => ({
  id,
  name,
  rarity: rarity as Rarity,
  archetype,
  signatureLine,
  unlockConditionText,
  unlockConditionType: unlockConditionType as Character["unlockConditionType"],
}));

const today = "2026-05-14";

function createInitialState(): TrackerState {
  const characters = characterSeeds.map((character) => ({
    ...character,
    owned: character.id === "rookie",
    earnedVia: character.id === "rookie" ? ("default" as const) : undefined,
  }));

  return {
    mode: "player",
    packages: [
      {
        id: "pkg-1",
        totalSessions: 10,
        sessionsUsed: 3,
        startDate: "2026-04-20",
        endDate: "2026-07-20",
        price: 900,
      },
    ],
    sessions: [
      {
        id: "session-1",
        date: "2026-04-28",
        durationMinutes: 60,
        drills: ["Forehand Crosscourt", "Split-Step Timing"],
        notes: "Good rally tolerance. Need cleaner recovery after wide forehands.",
        status: "complete",
        packageId: "pkg-1",
        preSelfRating: { ...baseRating, forehand: 6, footwork: 6 },
        postSelfRating: { ...baseRating, forehand: 7, backhand: 6 },
        coachRating: { ...baseRating, forehand: 6, serve: 6, footwork: 7 },
        coachFeedback: "Contact point improved. Keep the non-dominant hand active on unit turn.",
        media: [],
      },
      {
        id: "session-2",
        date: "2026-05-05",
        durationMinutes: 75,
        drills: ["Serve + One", "Pressure Tiebreaks"],
        notes: "Serve rhythm was stronger. Double faults late in pressure games.",
        status: "complete",
        packageId: "pkg-1",
        preSelfRating: { ...baseRating, serve: 6, mental_game: 5 },
        postSelfRating: { ...baseRating, serve: 7, mental_game: 6, match_iq: 7 },
        coachRating: { ...baseRating, serve: 7, mental_game: 6, match_iq: 6 },
        coachFeedback: "First serve shape is better. Use a larger second-serve target under pressure.",
        media: [],
      },
      {
        id: "session-3",
        date: "2026-05-12",
        durationMinutes: 60,
        drills: ["Backhand Depth Ladder", "Return Through Middle"],
        notes: "Backhand depth held up well. Returns need earlier preparation.",
        status: "complete",
        packageId: "pkg-1",
        preSelfRating: { ...baseRating, backhand: 6, return: 6 },
        postSelfRating: { ...baseRating, backhand: 7, return: 7, footwork: 8 },
        media: [],
      },
    ],
    matches: [
      { id: "match-1", date: "2026-05-01", opponentName: "Alex", score: "6-4 6-3", surface: "Hard", format: "singles", result: "W", notes: "Served well in deuce games." },
      { id: "match-2", date: "2026-05-09", opponentName: "Ben", score: "4-6 6-3 8-10", surface: "Hard", format: "singles", result: "L", notes: "Lost focus in the super tiebreak." },
    ],
    goals: [
      { id: "goal-1", title: "Reach 8.0 forehand average", skill: "forehand", targetRating: 8, targetDate: "2026-07-01", status: "active" },
      { id: "goal-2", title: "Win three matches this month", targetDate: "2026-05-31", status: "active" },
    ],
    drills: defaultDrills,
    characters,
    packs: [{ id: "pack-1", type: "standard", earnedAt: "2026-05-12" }],
    equippedCharacterId: "rookie",
    achievements: [],
  };
}

function averageRating(rating?: Rating) {
  if (!rating) return 0;
  return Math.round((skillKeys.reduce((sum, key) => sum + rating[key], 0) / skillKeys.length) * 10) / 10;
}

function completedSessions(sessions: Session[]) {
  return sessions.filter((session) => session.status === "complete");
}

function activePackage(packages: TennisPackage[]) {
  return packages.find((pkg) => pkg.totalSessions - pkg.sessionsUsed > 0) ?? packages[0];
}

function getWinStats(matches: Match[]) {
  const wins = matches.filter((match) => match.result === "W").length;
  const losses = matches.filter((match) => match.result === "L").length;
  const sorted = [...matches].sort((a, b) => a.date.localeCompare(b.date));
  let streak = 0;
  const last = sorted.at(-1)?.result;
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    if (sorted[index].result === last) streak += 1;
    else break;
  }
  return {
    wins,
    losses,
    winPct: matches.length ? Math.round((wins / matches.length) * 100) : 0,
    streak: matches.length ? `${last}${streak}` : "0",
  };
}

function useTrackerState() {
  return useState<TrackerState>(() => createInitialState());
}

function PageHeading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
      </div>
      {action}
    </div>
  );
}

function BrowserChart({ children }: { children: React.ReactElement }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
      {children}
    </ResponsiveContainer>
  );
}

function RatingGrid({
  rating,
  onChange,
}: {
  rating: Rating;
  onChange?: (rating: Rating) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {skillKeys.map((key) => (
        <div key={key} className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label>{skillLabels[key]}</Label>
            <span className="text-sm font-semibold text-[var(--accent)]">{rating[key]}</span>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange?.({ ...rating, [key]: value })}
                className={[
                  "aspect-square rounded border text-xs font-medium transition",
                  rating[key] === value
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] bg-white text-[var(--muted-foreground)] hover:border-[var(--accent)]",
                ].join(" ")}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoginScreen() {
  const [state, setState] = useTrackerState();
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-4 flex items-center gap-3">
            <PixelAvatar rarity={state.mode === "coach" ? "rare" : "default"} />
            <div>
              <CardTitle>Tennis Tracker</CardTitle>
              <CardDescription>Email/password only. Signup and magic links are out of scope.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue={state.mode === "coach" ? "coach@example.com" : "player@example.com"} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" defaultValue="demo-password" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button asChild onClick={() => setState({ ...state, mode: "player" })}>
              <Link href="/dashboard">Player login</Link>
            </Button>
            <Button asChild variant="outline" onClick={() => setState({ ...state, mode: "coach" })}>
              <Link href="/coach">Coach login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export function PlayerDashboard() {
  const [state] = useTrackerState();
  const pkg = activePackage(state.packages);
  const remaining = pkg ? pkg.totalSessions - pkg.sessionsUsed : 0;
  const stats = getWinStats(state.matches);
  const recentSessions = [...state.sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const equipped = state.characters.find((character) => character.id === state.equippedCharacterId);
  const chartData = completedSessions(state.sessions).map((session) => ({
    date: format(parseISO(session.date), "MMM d"),
    self: averageRating(session.postSelfRating),
    coach: session.coachRating ? averageRating(session.coachRating) : null,
  }));

  return (
    <AppShell>
      <PageHeading
        title={`Ready to train, Shaun`}
        description={equipped?.signatureLine ?? "Track the work, compare perspectives, and keep the package count honest."}
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild><Link href="/sessions/new"><Plus className="size-4" />Log session</Link></Button>
            <Button asChild variant="outline"><Link href="/matches/new"><Trophy className="size-4" />Log match</Link></Button>
          </div>
        }
      />
      {remaining <= 2 && (
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <CircleAlert className="size-5" />
          {remaining} coaching sessions remain. Create a new package soon.
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardHeader className="bg-[var(--court)] text-white">
            <CardTitle className="text-white">Coaching package</CardTitle>
            <CardDescription className="text-emerald-50">Current package credit count</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 pt-5 sm:grid-cols-[auto_1fr] sm:items-center">
            <PixelAvatar name={equipped?.name} rarity={equipped?.rarity} size="lg" />
            <div>
              <p className="text-5xl font-semibold tracking-tight">{remaining}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">of {pkg?.totalSessions ?? 0} sessions remaining</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div
                  className="h-full rounded-full bg-[var(--ball)]"
                  style={{ width: `${pkg ? (remaining / pkg.totalSessions) * 100 : 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
          <Metric label="Match record" value={`${stats.wins}-${stats.losses}`} sub={`${stats.winPct}% win rate`} icon={<Trophy />} />
          <Metric label="Coach rating" value={`${state.sessions.filter((s) => s.coachRating).length}/${state.sessions.length}`} sub="sessions reviewed" icon={<UserRoundCheck />} />
          <Metric label="Unopened packs" value={String(state.packs.length)} sub="ready to open" icon={<Gift />} />
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Active goals</CardTitle>
            <CardDescription>Targets tied to the next block of training</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {state.goals.filter((goal) => goal.status === "active").map((goal) => (
              <div key={goal.id} className="rounded-md border border-[var(--border)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{goal.title}</p>
                  <Badge variant="accent">Active</Badge>
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {goal.skill ? skillLabels[goal.skill] : "Match target"} {goal.targetRating ? `to ${goal.targetRating}` : ""} by {goal.targetDate}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overall rating trend</CardTitle>
            <CardDescription>Self and coach averages across the 8-skill rubric</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <BrowserChart>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe5df" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="self" stroke="#15803d" strokeWidth={3} />
                <Line type="monotone" dataKey="coach" stroke="#2563eb" strokeWidth={3} connectNulls />
              </LineChart>
            </BrowserChart>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Recent sessions</CardTitle>
          <CardDescription>Coach ratings stay hidden until submitted</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {recentSessions.map((session) => (
            <Link key={session.id} href={`/sessions/${session.id}`} className="grid gap-2 rounded-md border border-[var(--border)] p-3 hover:bg-[var(--surface-muted)] sm:grid-cols-[1fr_auto]">
              <div>
                <p className="font-medium">{format(parseISO(session.date), "MMM d, yyyy")} - {session.durationMinutes} min</p>
                <p className="text-sm text-[var(--muted-foreground)]">{session.drills.join(", ")}</p>
              </div>
              <Badge variant={session.coachRating ? "success" : "warning"}>{session.coachRating ? "Coach submitted" : "Coach pending"}</Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function Metric({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-5">
        <div className="grid size-11 place-items-center rounded-md bg-[var(--surface-muted)] text-[var(--accent)] [&_svg]:size-5">{icon}</div>
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SessionsPage({ create = false, detailId }: { create?: boolean; detailId?: string }) {
  const [state, setState] = useTrackerState();
  const session = detailId ? state.sessions.find((item) => item.id === detailId) : undefined;
  const [rating, setRating] = useState<Rating>(session?.postSelfRating ?? baseRating);
  const [preRating, setPreRating] = useState<Rating>(session?.preSelfRating ?? baseRating);

  function saveSession(formData: FormData) {
    const pkg = activePackage(state.packages);
    const chosenDrills = state.drills.slice(0, 2).map((drill) => drill.name);
    const newSession: Session = {
      id: `session-${Date.now()}`,
      date: String(formData.get("date") || today),
      durationMinutes: Number(formData.get("duration") || 60),
      drills: chosenDrills,
      notes: String(formData.get("notes") || ""),
      status: "complete",
      packageId: pkg?.id,
      preSelfRating: preRating,
      postSelfRating: rating,
      media: [],
    };
    const completedCount = completedSessions([...state.sessions, newSession]).length;
    const earnedPack = completedCount % 10 === 0 ? "better" : completedCount % 3 === 0 ? "standard" : undefined;
    setState({
      ...state,
      sessions: [newSession, ...state.sessions],
      packages: pkg
        ? state.packages.map((item) => item.id === pkg.id ? { ...item, sessionsUsed: Math.min(item.totalSessions, item.sessionsUsed + 1) } : item)
        : state.packages,
      packs: earnedPack ? [{ id: `pack-${Date.now()}`, type: earnedPack, earnedAt: today }, ...state.packs] : state.packs,
      lastReward: earnedPack ? `You earned a ${earnedPack} pack.` : state.lastReward,
    });
  }

  if (create) {
    return (
      <AppShell>
        <PageHeading title="Log session" description="Rate the session on the fixed 8-skill rubric and burn one package credit." />
        <form action={saveSession} className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle>Session details</CardTitle>
              <CardDescription>Focus areas use the drill library.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2"><Label htmlFor="date">Date</Label><Input id="date" name="date" type="date" defaultValue={today} /></div>
              <div className="flex flex-col gap-2"><Label htmlFor="duration">Duration</Label><Input id="duration" name="duration" type="number" defaultValue={60} /></div>
              <div className="flex flex-col gap-2"><Label>Focus drills</Label><div className="flex flex-wrap gap-2">{state.drills.slice(0, 6).map((drill) => <Badge key={drill.id}>{drill.name}</Badge>)}</div></div>
              <div className="flex flex-col gap-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" placeholder="What changed today?" /></div>
              <div className="rounded-md border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted-foreground)]"><Film className="mb-2 size-5" />Media upload accepts jpg, png, mp4, and mov up to 100MB in the Supabase-backed flow.</div>
              <Button type="submit"><Save className="size-4" />Save session</Button>
              {state.lastReward && <Badge variant="accent">{state.lastReward}</Badge>}
            </CardContent>
          </Card>
          <div className="grid gap-5">
            <Card><CardHeader><CardTitle>Pre-session self-rating</CardTitle><CardDescription>Locked once complete.</CardDescription></CardHeader><CardContent><RatingGrid rating={preRating} onChange={setPreRating} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Post-session self-rating</CardTitle><CardDescription>Coach rating appears after submission.</CardDescription></CardHeader><CardContent><RatingGrid rating={rating} onChange={setRating} /></CardContent></Card>
          </div>
        </form>
      </AppShell>
    );
  }

  if (session) {
    return (
      <AppShell>
        <PageHeading title={`Session on ${format(parseISO(session.date), "MMM d, yyyy")}`} description={session.notes || "Session detail"} />
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader><CardTitle>Session summary</CardTitle><CardDescription>{session.durationMinutes} minutes</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Badge variant={session.status === "complete" ? "success" : "warning"}>{session.status}</Badge>
              <div className="flex flex-wrap gap-2">{session.drills.map((drill) => <Badge key={drill}>{drill}</Badge>)}</div>
              <p className="text-sm text-[var(--muted-foreground)]">{session.notes}</p>
              <div className="rounded-md border border-[var(--border)] p-3 text-sm">{session.media.length ? `${session.media.length} attachments` : "No media attached"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Rating comparison</CardTitle><CardDescription>Pre-session self, post-session self, and coach.</CardDescription></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead><tr className="text-left text-[var(--muted-foreground)]"><th className="py-2">Skill</th><th>Pre self</th><th>Post self</th><th>Coach</th></tr></thead>
                <tbody>
                  {skillKeys.map((key) => (
                    <tr key={key} className="border-t border-[var(--border)]">
                      <td className="py-3 font-medium">{skillLabels[key]}</td>
                      <td>{session.preSelfRating?.[key] ?? "-"}</td>
                      <td>{session.postSelfRating[key]}</td>
                      <td>{session.coachRating?.[key] ?? "Pending"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {session.coachFeedback && <p className="mt-4 rounded-md bg-[var(--surface-muted)] p-3 text-sm">{session.coachFeedback}</p>}
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeading title="Sessions" description="Coaching sessions consume package credits unless cancelled or marked no-show." action={<Button asChild><Link href="/sessions/new"><Plus className="size-4" />Log session</Link></Button>} />
      <Card>
        <CardContent className="grid gap-3 pt-5">
          {[...state.sessions].sort((a, b) => b.date.localeCompare(a.date)).map((item) => (
            <Link key={item.id} href={`/sessions/${item.id}`} className="grid gap-2 rounded-md border border-[var(--border)] p-4 hover:bg-[var(--surface-muted)] sm:grid-cols-[1fr_auto]">
              <div>
                <p className="font-medium">{format(parseISO(item.date), "MMM d, yyyy")} - {item.durationMinutes} min</p>
                <p className="text-sm text-[var(--muted-foreground)]">{item.drills.join(", ")}</p>
              </div>
              <div className="flex flex-wrap gap-2"><Badge>{averageRating(item.postSelfRating)} self avg</Badge><Badge variant={item.coachRating ? "success" : "warning"}>{item.coachRating ? "Coach done" : "Coach pending"}</Badge></div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}

export function CoachPage({ detailId, players = false }: { detailId?: string; players?: boolean }) {
  const [state, setState] = useTrackerState();
  const session = detailId ? state.sessions.find((item) => item.id === detailId) : undefined;
  const [rating, setRating] = useState<Rating>(session?.coachRating ?? baseRating);

  function submitCoachRating(formData: FormData) {
    if (!session) return;
    setState({
      ...state,
      sessions: state.sessions.map((item) =>
        item.id === session.id
          ? { ...item, coachRating: rating, coachFeedback: String(formData.get("feedback") || "") }
          : item,
      ),
    });
  }

  if (players) {
    return (
      <AppShell mode="coach">
        <PageHeading title="Linked player" description="MVP has one permanently linked player and no invite flow." />
        <Card><CardContent className="flex items-center gap-4 pt-5"><PixelAvatar /><div><p className="font-semibold">Shaun</p><p className="text-sm text-[var(--muted-foreground)]">{state.sessions.length} sessions, {state.matches.length} matches</p></div></CardContent></Card>
      </AppShell>
    );
  }

  if (session) {
    return (
      <AppShell mode="coach">
        <PageHeading title="Coach rating" description={`Review Shaun's ${format(parseISO(session.date), "MMM d")} session and submit external feedback.`} />
        <form action={submitCoachRating} className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader><CardTitle>Player session</CardTitle><CardDescription>{session.drills.join(", ")}</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-[var(--muted-foreground)]">{session.notes}</p>
              <Button type="button" variant="outline" onClick={() => setState({ ...state, sessions: state.sessions.map((item) => item.id === session.id ? { ...item, status: "cancelled" } : item) })}>Mark cancelled</Button>
              <Button type="button" variant="outline" onClick={() => setState({ ...state, sessions: state.sessions.map((item) => item.id === session.id ? { ...item, status: "no_show" } : item) })}>Mark no-show</Button>
              <div className="flex flex-col gap-2"><Label htmlFor="feedback">Feedback</Label><Textarea id="feedback" name="feedback" defaultValue={session.coachFeedback} /></div>
              <Button type="submit"><Check className="size-4" />Submit coach rating</Button>
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle>8-skill coach rating</CardTitle><CardDescription>Visible to player only after submit.</CardDescription></CardHeader><CardContent><RatingGrid rating={rating} onChange={setRating} /></CardContent></Card>
        </form>
      </AppShell>
    );
  }

  const pending = state.sessions.filter((item) => !item.coachRating);
  return (
    <AppShell mode="coach">
      <PageHeading title="Coach dashboard" description="Review linked player sessions and submit coach ratings." />
      <Card>
        <CardHeader><CardTitle>Pending sessions</CardTitle><CardDescription>{pending.length} sessions need coach review</CardDescription></CardHeader>
        <CardContent className="grid gap-3">
          {pending.map((item) => (
            <Link key={item.id} href={`/coach/sessions/${item.id}`} className="rounded-md border border-[var(--border)] p-4 hover:bg-[var(--surface-muted)]">
              <p className="font-medium">{format(parseISO(item.date), "MMM d, yyyy")}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{item.drills.join(", ")}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}

export function MatchesPage({ create = false }: { create?: boolean }) {
  const [state, setState] = useTrackerState();
  const stats = getWinStats(state.matches);

  function saveMatch(formData: FormData) {
    const match: Match = {
      id: `match-${Date.now()}`,
      date: String(formData.get("date") || today),
      opponentName: String(formData.get("opponent") || "Opponent"),
      score: String(formData.get("score") || "6-4 6-4"),
      surface: String(formData.get("surface") || "Hard"),
      format: String(formData.get("format") || "singles") as Match["format"],
      result: String(formData.get("result") || "W") as Match["result"],
      notes: String(formData.get("notes") || ""),
    };
    setState({ ...state, matches: [match, ...state.matches] });
  }

  if (create) {
    return (
      <AppShell>
        <PageHeading title="Log match" description="Match results are independent from coaching package credits." />
        <form action={saveMatch}>
          <Card><CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2"><Label>Date</Label><Input name="date" type="date" defaultValue={today} /></div>
            <div className="flex flex-col gap-2"><Label>Opponent</Label><Input name="opponent" placeholder="Opponent name" /></div>
            <div className="flex flex-col gap-2"><Label>Score</Label><Input name="score" placeholder="6-4 6-3" /></div>
            <div className="flex flex-col gap-2"><Label>Surface</Label><Input name="surface" defaultValue="Hard" /></div>
            <div className="flex flex-col gap-2"><Label>Format</Label><Select name="format"><option value="singles">Singles</option><option value="doubles">Doubles</option></Select></div>
            <div className="flex flex-col gap-2"><Label>Result</Label><Select name="result"><option value="W">Win</option><option value="L">Loss</option></Select></div>
            <div className="flex flex-col gap-2 sm:col-span-2"><Label>Notes</Label><Textarea name="notes" /></div>
            <Button type="submit" className="sm:col-span-2"><Save className="size-4" />Save match</Button>
          </CardContent></Card>
        </form>
      </AppShell>
    );
  }

  const h2h = Object.entries(state.matches.reduce<Record<string, { w: number; l: number }>>((acc, match) => {
    acc[match.opponentName] ??= { w: 0, l: 0 };
    if (match.result === "W") acc[match.opponentName].w += 1;
    else acc[match.opponentName].l += 1;
    return acc;
  }, {}));

  return (
    <AppShell>
      <PageHeading title="Matches" description="Competitive record, streak, and head-to-head history." action={<Button asChild><Link href="/matches/new"><Plus className="size-4" />Log match</Link></Button>} />
      <div className="mb-5 grid gap-4 sm:grid-cols-3"><Metric label="Record" value={`${stats.wins}-${stats.losses}`} sub={`${stats.winPct}% win rate`} icon={<Trophy />} /><Metric label="Current streak" value={stats.streak} sub="latest result run" icon={<Medal />} /><Metric label="Opponents" value={String(h2h.length)} sub="head-to-head tracked" icon={<UserRoundCheck />} /></div>
      <Card><CardContent className="grid gap-3 pt-5">{state.matches.map((match) => <div key={match.id} className="grid gap-2 rounded-md border border-[var(--border)] p-4 sm:grid-cols-[1fr_auto]"><div><p className="font-medium">{match.opponentName} - {match.score}</p><p className="text-sm text-[var(--muted-foreground)]">{format(parseISO(match.date), "MMM d, yyyy")} · {match.surface} · {match.format}</p></div><Badge variant={match.result === "W" ? "success" : "warning"}>{match.result}</Badge></div>)}</CardContent></Card>
    </AppShell>
  );
}

export function PackagesPage() {
  const [state, setState] = useTrackerState();
  function savePackage(formData: FormData) {
    const pkg: TennisPackage = {
      id: `pkg-${Date.now()}`,
      totalSessions: Number(formData.get("total") || 10),
      sessionsUsed: 0,
      startDate: String(formData.get("start") || today),
      endDate: String(formData.get("end") || ""),
      price: Number(formData.get("price") || 0) || undefined,
    };
    setState({ ...state, packages: [pkg, ...state.packages] });
  }
  return (
    <AppShell>
      <PageHeading title="Packages" description="Create packages and preserve historical credit counts." />
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <form action={savePackage}><Card><CardHeader><CardTitle>New package</CardTitle></CardHeader><CardContent className="flex flex-col gap-4"><div className="flex flex-col gap-2"><Label>Total sessions</Label><Input name="total" type="number" defaultValue={10} /></div><div className="flex flex-col gap-2"><Label>Start date</Label><Input name="start" type="date" defaultValue={today} /></div><div className="flex flex-col gap-2"><Label>Expiry date</Label><Input name="end" type="date" /></div><div className="flex flex-col gap-2"><Label>Price</Label><Input name="price" type="number" /></div><Button type="submit"><Package className="size-4" />Create package</Button></CardContent></Card></form>
        <Card><CardHeader><CardTitle>Package history</CardTitle></CardHeader><CardContent className="grid gap-3">{state.packages.map((pkg) => <div key={pkg.id} className="rounded-md border border-[var(--border)] p-4"><p className="font-medium">{pkg.totalSessions - pkg.sessionsUsed} of {pkg.totalSessions} remaining</p><p className="text-sm text-[var(--muted-foreground)]">Started {pkg.startDate}{pkg.endDate ? ` · expires ${pkg.endDate}` : ""}{pkg.price ? ` · $${pkg.price}` : ""}</p></div>)}</CardContent></Card>
      </div>
    </AppShell>
  );
}

export function GoalsPage() {
  const [state, setState] = useTrackerState();
  function saveGoal(formData: FormData) {
    const goal: GoalItem = {
      id: `goal-${Date.now()}`,
      title: String(formData.get("title") || "New goal"),
      skill: String(formData.get("skill") || "") as SkillKey || undefined,
      targetRating: Number(formData.get("target") || 0) || undefined,
      targetDate: String(formData.get("date") || ""),
      status: "active",
    };
    setState({ ...state, goals: [goal, ...state.goals] });
  }
  return (
    <AppShell>
      <PageHeading title="Goals" description="Set measurable targets by skill, rating, and target date." />
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <form action={saveGoal}><Card><CardHeader><CardTitle>New goal</CardTitle></CardHeader><CardContent className="flex flex-col gap-4"><div className="flex flex-col gap-2"><Label>Title</Label><Input name="title" /></div><div className="flex flex-col gap-2"><Label>Skill</Label><Select name="skill"><option value="">No skill</option>{skillKeys.map((key) => <option key={key} value={key}>{skillLabels[key]}</option>)}</Select></div><div className="flex flex-col gap-2"><Label>Target rating</Label><Input name="target" type="number" min={1} max={10} step={0.5} /></div><div className="flex flex-col gap-2"><Label>Target date</Label><Input name="date" type="date" /></div><Button type="submit"><Plus className="size-4" />Create goal</Button></CardContent></Card></form>
        <Card><CardHeader><CardTitle>Goal list</CardTitle></CardHeader><CardContent className="grid gap-3">{state.goals.map((goal) => <div key={goal.id} className="rounded-md border border-[var(--border)] p-4"><div className="flex items-center justify-between"><p className="font-medium">{goal.title}</p><Badge>{goal.status}</Badge></div><p className="text-sm text-[var(--muted-foreground)]">{goal.skill ? skillLabels[goal.skill] : "General"} {goal.targetRating ? `target ${goal.targetRating}` : ""}</p><div className="mt-3 flex gap-2"><Button size="sm" variant="outline" onClick={() => setState({ ...state, goals: state.goals.map((item) => item.id === goal.id ? { ...item, status: "complete" } : item) })}>Complete</Button><Button size="sm" variant="ghost" onClick={() => setState({ ...state, goals: state.goals.map((item) => item.id === goal.id ? { ...item, status: "abandoned" } : item) })}>Abandon</Button></div></div>)}</CardContent></Card>
      </div>
    </AppShell>
  );
}

export function DrillsPage() {
  const [state, setState] = useTrackerState();
  function saveDrill(formData: FormData) {
    const drill: Drill = { id: `drill-${Date.now()}`, name: String(formData.get("name") || "Custom Drill"), category: String(formData.get("category") || "Custom"), description: String(formData.get("description") || ""), isSystem: false };
    setState({ ...state, drills: [drill, ...state.drills] });
  }
  const counts = state.drills.map((drill) => ({ ...drill, count: state.sessions.filter((session) => session.drills.includes(drill.name)).length }));
  return (
    <AppShell>
      <PageHeading title="Drills" description="System defaults plus player custom drills, with session history counts." />
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <form action={saveDrill}><Card><CardHeader><CardTitle>Add custom drill</CardTitle></CardHeader><CardContent className="flex flex-col gap-4"><div className="flex flex-col gap-2"><Label>Name</Label><Input name="name" /></div><div className="flex flex-col gap-2"><Label>Category</Label><Input name="category" /></div><div className="flex flex-col gap-2"><Label>Description</Label><Textarea name="description" /></div><Button type="submit"><Dumbbell className="size-4" />Add drill</Button></CardContent></Card></form>
        <Card><CardHeader><CardTitle>Drill library</CardTitle></CardHeader><CardContent className="grid gap-3">{counts.map((drill) => <div key={drill.id} className="rounded-md border border-[var(--border)] p-4"><div className="flex items-center justify-between"><p className="font-medium">{drill.name}</p><Badge>{drill.count} sessions</Badge></div><p className="text-sm text-[var(--muted-foreground)]">{drill.category} · {drill.description}</p></div>)}</CardContent></Card>
      </div>
    </AppShell>
  );
}

export function ChartsPage() {
  const [state] = useTrackerState();
  const sessionData = completedSessions(state.sessions).map((session) => ({ date: format(parseISO(session.date), "MMM d"), self: averageRating(session.postSelfRating), coach: session.coachRating ? averageRating(session.coachRating) : undefined }));
  const deltaData = skillKeys.map((key) => {
    const rated = state.sessions.filter((session) => session.coachRating);
    const delta = rated.length ? rated.reduce((sum, session) => sum + (session.postSelfRating[key] - (session.coachRating?.[key] ?? session.postSelfRating[key])), 0) / rated.length : 0;
    return { skill: skillLabels[key], delta: Math.round(delta * 10) / 10 };
  });
  const wins = [...state.matches].sort((a, b) => a.date.localeCompare(b.date)).reduce<{ date: string; wins: number }[]>((acc, match) => {
    const prev = acc.at(-1)?.wins ?? 0;
    acc.push({ date: format(parseISO(match.date), "MMM d"), wins: prev + (match.result === "W" ? 1 : 0) });
    return acc;
  }, []);
  return (
    <AppShell>
      <PageHeading title="Charts" description="Progress trends, match record, and self-vs-coach gaps." />
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Overall rating trend"><LineChart data={sessionData}><CartesianGrid strokeDasharray="3 3" stroke="#dbe5df" /><XAxis dataKey="date" /><YAxis domain={[1, 10]} /><Tooltip /><Line dataKey="self" stroke="#15803d" strokeWidth={3} /><Line dataKey="coach" stroke="#2563eb" strokeWidth={3} connectNulls /></LineChart></ChartCard>
        <ChartCard title="Self vs coach delta"><BarChart data={deltaData}><CartesianGrid strokeDasharray="3 3" stroke="#dbe5df" /><XAxis dataKey="skill" hide /><YAxis /><Tooltip /><Bar dataKey="delta" fill="#15803d" /></BarChart></ChartCard>
        <ChartCard title="Cumulative wins"><AreaChart data={wins}><CartesianGrid strokeDasharray="3 3" stroke="#dbe5df" /><XAxis dataKey="date" /><YAxis allowDecimals={false} /><Tooltip /><Area dataKey="wins" stroke="#15803d" fill="#bbf7d0" /></AreaChart></ChartCard>
        <Card><CardHeader><CardTitle>Time filters</CardTitle><CardDescription>30 days, 90 days, year, and all time filters are represented in the chart data layer and ready for Supabase-backed queries.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{["30 days", "90 days", "Year", "All time"].map((label) => <Badge key={label}>{label}</Badge>)}</CardContent></Card>
      </div>
    </AppShell>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="h-80">
        <BrowserChart>{children}</BrowserChart>
      </CardContent>
    </Card>
  );
}

export function CollectionPage() {
  const [state, setState] = useTrackerState();
  const owned = state.characters.filter((character) => character.owned);
  function openPack(pack: Pack) {
    const order: Rarity[] =
      pack.type === "standard" ? ["common", "rare", "epic", "legendary"] : ["common", "rare", "epic", "legendary"];
    const drop = order.flatMap((rarity) => state.characters.filter((character) => !character.owned && character.rarity === rarity)).at(0);
    setState({
      ...state,
      packs: state.packs.filter((item) => item.id !== pack.id),
      characters: drop ? state.characters.map((character) => character.id === drop.id ? { ...character, owned: true, earnedVia: "pack" } : character) : state.characters,
      lastReward: drop ? `${drop.name} joined your collection.` : "No duplicates available. Thanks for opening the pack.",
    });
  }
  return (
    <AppShell>
      <PageHeading title="Collection" description="Earn 24 pixel-art tennis characters through packs, milestones, and achievements." />
      <div className="mb-5 grid gap-4 sm:grid-cols-3"><Metric label="Owned" value={`${owned.length}/24`} sub="collection progress" icon={<Sparkles />} /><Metric label="Packs" value={String(state.packs.length)} sub="unopened" icon={<Gift />} /><Metric label="Equipped" value={state.characters.find((c) => c.id === state.equippedCharacterId)?.name ?? "Rookie"} sub="active avatar" icon={<Medal />} /></div>
      {state.lastReward && <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">{state.lastReward}</div>}
      <Card className="mb-5"><CardHeader><CardTitle>Unopened packs</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-3">{state.packs.length ? state.packs.map((pack) => <Button key={pack.id} onClick={() => openPack(pack)}><Gift className="size-4" />Open {pack.type} pack</Button>) : <p className="text-sm text-[var(--muted-foreground)]">No packs waiting.</p>}</CardContent></Card>
      <div className="grid gap-5">
        {(["default", "common", "rare", "epic", "legendary"] as Rarity[]).map((rarity) => (
          <Card key={rarity}>
            <CardHeader><CardTitle className="capitalize">{rarity}</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {state.characters.filter((character) => character.rarity === rarity).map((character) => (
                <div key={character.id} className="rounded-md border border-[var(--border)] p-4">
                  <PixelAvatar name={character.name} rarity={character.rarity} size="md" />
                  <div className={character.owned ? "mt-3" : "mt-3 opacity-45 grayscale"}>
                    <p className="font-medium">{character.owned ? character.name : "???"}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{character.archetype}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">{character.unlockConditionText}</p>
                  </div>
                  {character.owned && <Button className="mt-3 w-full" size="sm" variant={state.equippedCharacterId === character.id ? "secondary" : "outline"} onClick={() => setState({ ...state, equippedCharacterId: character.id })}>{state.equippedCharacterId === character.id ? "Equipped" : "Equip"}</Button>}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
