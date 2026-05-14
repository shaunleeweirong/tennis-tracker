import { NextResponse } from "next/server";
import { getSupabaseUser, routeError, supabaseNotConfigured } from "@/lib/api/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase) return supabaseNotConfigured();

  const body = await request.json();
  const { data, error } = await supabase
    .from("goals")
    .update({
      title: body.title,
      skill: body.skill,
      target_rating: body.target_rating ?? body.targetRating,
      target_date: body.target_date ?? body.targetDate,
      status: body.status,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return routeError(error);
  return NextResponse.json(data);
}
