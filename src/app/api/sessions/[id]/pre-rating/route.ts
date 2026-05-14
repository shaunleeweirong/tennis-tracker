import { NextResponse } from "next/server";
import { getSupabaseUser, routeError, supabaseNotConfigured } from "@/lib/api/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase) return supabaseNotConfigured();

  const body = await request.json();
  const { data, error } = await supabase
    .from("sessions")
    .update({
      pre_self_rating: body.rating ?? body.pre_self_rating ?? body.preSelfRating,
      pre_self_rating_submitted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .is("pre_self_rating_submitted_at", null)
    .select("*")
    .single();

  if (error) return routeError(error);
  return NextResponse.json(data);
}
