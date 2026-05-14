import { NextResponse } from "next/server";
import { getSupabaseUser, routeError, supabaseNotConfigured } from "@/lib/api/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase) return supabaseNotConfigured();

  const body = await request.json();
  const { data, error } = await supabase
    .from("packages")
    .update({
      total_sessions: body.total_sessions ?? body.totalSessions,
      start_date: body.start_date ?? body.startDate,
      end_date: body.end_date ?? body.endDate,
      price: body.price,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return routeError(error);
  return NextResponse.json(data);
}
