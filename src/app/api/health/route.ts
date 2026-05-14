import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/demo-store";

export function GET() {
  return NextResponse.json({
    ok: true,
    supabaseConfigured: isSupabaseConfigured(),
  });
}
