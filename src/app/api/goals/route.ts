import { NextResponse } from "next/server";
import { DEMO_DATA } from "@/data/demo";
import { getSupabaseUser, routeError, supabaseNotConfigured } from "@/lib/api/auth";

export async function GET(request: Request) {
  const { supabase, user } = await getSupabaseUser();

  if (supabase && user) {
    const url = new URL(request.url);
    let query = supabase.from("goals").select("*").order("created_at", { ascending: false });
    const status = url.searchParams.get("status");
    if (status) query = query.eq("status", status);
    const { data, error } = await query;

    if (error) return routeError(error);
    return NextResponse.json(data);
  }

  return NextResponse.json(DEMO_DATA.goals);
}

export async function POST(request: Request) {
  const { supabase, user, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase || !user) return supabaseNotConfigured();

  const body = await request.json();
  const { data, error } = await supabase
    .from("goals")
    .insert({
      player_id: user.id,
      title: body.title,
      skill: body.skill ?? null,
      target_rating: body.target_rating ?? body.targetRating ?? null,
      target_date: body.target_date ?? body.targetDate ?? null,
      status: body.status ?? "active",
    })
    .select("*")
    .single();

  if (error) return routeError(error);
  return NextResponse.json(data, { status: 201 });
}
