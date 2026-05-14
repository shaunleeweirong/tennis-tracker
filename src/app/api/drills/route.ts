import { NextResponse } from "next/server";
import { DEMO_DATA } from "@/data/demo";
import { getSupabaseUser, routeError, supabaseNotConfigured } from "@/lib/api/auth";

export async function GET() {
  const { supabase, user } = await getSupabaseUser();

  if (supabase && user) {
    const { data, error } = await supabase
      .from("drills")
      .select("*")
      .order("category")
      .order("name");

    if (error) return routeError(error);
    return NextResponse.json(data);
  }

  return NextResponse.json(DEMO_DATA.drills);
}

export async function POST(request: Request) {
  const { supabase, user, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase || !user) return supabaseNotConfigured();

  const body = await request.json();
  const { data, error } = await supabase
    .from("drills")
    .insert({
      player_id: user.id,
      name: body.name,
      category: body.category,
      description: body.description ?? null,
      is_system: false,
    })
    .select("*")
    .single();

  if (error) return routeError(error);
  return NextResponse.json(data, { status: 201 });
}
