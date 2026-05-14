import { NextResponse } from "next/server";
import { DEMO_DATA } from "@/data/demo";
import { getSupabaseUser, routeError, supabaseNotConfigured } from "@/lib/api/auth";

export async function GET() {
  const { supabase, user } = await getSupabaseUser();

  if (supabase && user) {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("date", { ascending: false });

    if (error) return routeError(error);
    return NextResponse.json(data);
  }

  return NextResponse.json(DEMO_DATA.matches);
}

export async function POST(request: Request) {
  const { supabase, user, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase || !user) return supabaseNotConfigured();

  const body = await request.json();
  const { data, error } = await supabase
    .from("matches")
    .insert({
      player_id: user.id,
      date: body.date,
      opponent_name: body.opponent_name ?? body.opponentName,
      score: body.score,
      surface: body.surface ?? null,
      format: body.format ?? "singles",
      result: body.result,
      notes: body.notes ?? null,
    })
    .select("*")
    .single();

  if (error) return routeError(error);
  return NextResponse.json(data, { status: 201 });
}
