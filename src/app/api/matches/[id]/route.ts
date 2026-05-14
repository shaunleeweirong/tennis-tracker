import { NextResponse } from "next/server";
import { getSupabaseUser, routeError, supabaseNotConfigured } from "@/lib/api/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase) return supabaseNotConfigured();

  const body = await request.json();
  const { data, error } = await supabase
    .from("matches")
    .update({
      date: body.date,
      opponent_name: body.opponent_name ?? body.opponentName,
      score: body.score,
      surface: body.surface,
      format: body.format,
      result: body.result,
      notes: body.notes,
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

  const { error } = await supabase.from("matches").delete().eq("id", id);
  if (error) return routeError(error);
  return NextResponse.json({ ok: true });
}
