import { NextResponse } from "next/server";
import { getSupabaseUser, routeError, supabaseNotConfigured } from "@/lib/api/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase) return supabaseNotConfigured();

  const body = await request.json();
  const { data, error } = await supabase.rpc("submit_coach_session_review", {
    p_session_id: id,
    p_coach_rating: body.rating ?? body.coach_rating ?? body.coachRating,
    p_coach_feedback: body.feedback ?? body.coach_feedback ?? null,
    p_status: body.status ?? "complete",
  });

  if (error) return routeError(error);
  return NextResponse.json(data);
}
