import { NextResponse } from "next/server";
import { DEMO_DATA } from "@/data/demo";
import { getSupabaseUser, routeError, supabaseNotConfigured } from "@/lib/api/auth";

export async function GET() {
  const { supabase, user } = await getSupabaseUser();

  if (supabase && user) {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) return routeError(error);
    return NextResponse.json(data);
  }

  return NextResponse.json(DEMO_DATA.packages);
}

export async function POST(request: Request) {
  const { supabase, user, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase || !user) return supabaseNotConfigured();

  const body = await request.json();
  const { data, error } = await supabase
    .from("packages")
    .insert({
      player_id: user.id,
      total_sessions: body.total_sessions ?? body.totalSessions,
      start_date: body.start_date ?? body.startDate,
      end_date: body.end_date ?? body.endDate ?? null,
      price: body.price ?? null,
    })
    .select("*")
    .single();

  if (error) return routeError(error);
  return NextResponse.json(data, { status: 201 });
}
