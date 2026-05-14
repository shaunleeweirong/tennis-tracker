import { NextResponse } from "next/server";
import { CHARACTERS } from "@/data/characters";
import { DEMO_DATA } from "@/data/demo";

export function GET() {
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
