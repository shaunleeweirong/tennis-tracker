import { NextResponse } from "next/server";
import { CHARACTERS } from "@/data/characters";
import { DEMO_DATA } from "@/data/demo";
import { getSupabaseUser, routeError } from "@/lib/api/auth";

export async function GET() {
  const { supabase, user } = await getSupabaseUser();

  if (supabase && user) {
    const [{ data: characters, error: characterError }, { data: collection, error: collectionError }] =
      await Promise.all([
        supabase.from("characters").select("*").order("display_order"),
        supabase.from("player_collection").select("*"),
      ]);

    if (characterError) return routeError(characterError);
    if (collectionError) return routeError(collectionError);

    const owned = new Map((collection ?? []).map((item) => [item.character_id, item]));
    return NextResponse.json(
      (characters ?? []).map((character) => ({
        ...character,
        owned: owned.has(character.id),
        earned_at: owned.get(character.id)?.earned_at ?? null,
        earned_via: owned.get(character.id)?.earned_via ?? null,
      })),
    );
  }

  const owned = new Map(DEMO_DATA.collection.map((item) => [item.character_id, item]));

  return NextResponse.json(
    CHARACTERS.map((character) => ({
      ...character,
      owned: owned.has(character.id),
      earned_at: owned.get(character.id)?.earned_at ?? null,
      earned_via: owned.get(character.id)?.earned_via ?? null,
    })),
  );
}
