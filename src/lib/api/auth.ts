import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function getSupabaseUser() {
  const supabase = await createClient();

  if (!supabase) {
    return { supabase: null, user: null, response: null };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      user: null,
      response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    };
  }

  return { supabase, user, response: null };
}

export function supabaseNotConfigured() {
  return NextResponse.json(
    {
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for persistent API mutations.",
    },
    { status: 501 },
  );
}

export function routeError(error: unknown, fallback = "Request failed") {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : fallback;

  return NextResponse.json({ error: message }, { status: 400 });
}
