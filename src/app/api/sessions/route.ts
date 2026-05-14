import { NextResponse } from "next/server";
import { DEMO_DATA } from "@/data/demo";
import { getSupabaseUser, routeError, supabaseNotConfigured } from "@/lib/api/auth";

export async function GET() {
  const { supabase, user } = await getSupabaseUser();

  if (supabase && user) {
    const { data, error } = await supabase
      .from("sessions")
      .select("*, session_drills(drill_id), media(*)")
      .order("date", { ascending: false });

    if (error) return routeError(error);
    return NextResponse.json(data);
  }

  return NextResponse.json(DEMO_DATA.sessions);
}

export async function POST(request: Request) {
  const { supabase, user, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase || !user) return supabaseNotConfigured();

  const body = await request.json();
  const { data, error } = await supabase.rpc("create_session_with_package_credit", {
    p_player_id: user.id,
    p_date: body.date,
    p_duration_minutes: body.duration_minutes ?? body.durationMinutes ?? null,
    p_notes: body.notes ?? null,
    p_status: body.status ?? "complete",
    p_pre_self_rating: body.pre_self_rating ?? body.preSelfRating ?? null,
    p_post_self_rating: body.post_self_rating ?? body.postSelfRating ?? null,
    p_drill_ids: body.drill_ids ?? body.drillIds ?? [],
  });

  if (error) return routeError(error);
  return NextResponse.json(data, { status: 201 });
}
