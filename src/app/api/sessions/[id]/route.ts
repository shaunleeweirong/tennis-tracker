import { NextResponse } from "next/server";
import { getSupabaseUser, routeError, supabaseNotConfigured } from "@/lib/api/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase) return supabaseNotConfigured();

  const { data, error } = await supabase
    .from("sessions")
    .select("*, session_drills(drill_id), media(*)")
    .eq("id", id)
    .single();

  if (error) return routeError(error);
  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase) return supabaseNotConfigured();

  const body = await request.json();
  const { data, error } = await supabase
    .from("sessions")
    .update({
      date: body.date,
      duration_minutes: body.duration_minutes ?? body.durationMinutes,
      notes: body.notes,
      status: body.status,
      pre_self_rating: body.pre_self_rating ?? body.preSelfRating,
      pre_self_rating_submitted_at:
        body.pre_self_rating || body.preSelfRating ? new Date().toISOString() : undefined,
      post_self_rating: body.post_self_rating ?? body.postSelfRating,
      post_self_rating_submitted_at:
        body.post_self_rating || body.postSelfRating ? new Date().toISOString() : undefined,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return routeError(error);
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase) return supabaseNotConfigured();

  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) return routeError(error);
  return NextResponse.json({ ok: true });
}
