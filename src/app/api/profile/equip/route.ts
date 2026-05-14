import { NextResponse } from "next/server";
import { getSupabaseUser, routeError, supabaseNotConfigured } from "@/lib/api/auth";

export async function PATCH(request: Request) {
  const { supabase, user, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase || !user) return supabaseNotConfigured();

  const body = await request.json();
  const characterId = body.character_id ?? body.characterId;
  const { data: owned, error: ownedError } = await supabase
    .from("player_collection")
    .select("character_id")
    .eq("player_id", user.id)
    .eq("character_id", characterId)
    .single();

  if (ownedError || !owned) {
    return NextResponse.json({ error: "Character is not owned" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ equipped_character_id: characterId })
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) return routeError(error);
  return NextResponse.json(data);
}
