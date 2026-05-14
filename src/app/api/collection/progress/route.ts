import { NextResponse } from "next/server";
import { CHARACTERS } from "@/data/characters";
import { DEMO_DATA } from "@/data/demo";
import { collectionProgress, ownedCharacterIds } from "@/lib/collection";
import { getSupabaseUser, routeError } from "@/lib/api/auth";

export async function GET() {
  const { supabase, user } = await getSupabaseUser();

  if (supabase && user) {
    const [{ data: collection, error: collectionError }, { data: achievements, error: achievementsError }] =
      await Promise.all([
        supabase.from("player_collection").select("*"),
        supabase.from("player_achievements").select("*"),
      ]);

    if (collectionError) return routeError(collectionError);
    if (achievementsError) return routeError(achievementsError);
    return NextResponse.json({
      collection: collectionProgress(CHARACTERS, ownedCharacterIds(collection ?? [])),
      achievements: achievements ?? [],
    });
  }

  return NextResponse.json({
    collection: collectionProgress(CHARACTERS, ownedCharacterIds(DEMO_DATA.collection)),
    achievements: DEMO_DATA.achievements,
    milestones: CHARACTERS.filter((character) => character.milestone_sessions),
  });
}
