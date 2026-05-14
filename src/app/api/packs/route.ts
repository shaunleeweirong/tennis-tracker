import { NextResponse } from "next/server";
import { DEMO_DATA } from "@/data/demo";
import { getSupabaseUser, routeError } from "@/lib/api/auth";

export async function GET() {
  const { supabase, user } = await getSupabaseUser();

  if (supabase && user) {
    const { data, error } = await supabase
      .from("player_packs")
      .select("*")
      .is("opened_at", null)
      .order("earned_at", { ascending: false });

    if (error) return routeError(error);
    return NextResponse.json(data);
  }

  return NextResponse.json(DEMO_DATA.packs.filter((pack) => !pack.opened_at));
}
