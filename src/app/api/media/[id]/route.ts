import { NextResponse } from "next/server";
import { getSupabaseUser, routeError, supabaseNotConfigured } from "@/lib/api/auth";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase) return supabaseNotConfigured();

  const { data: media, error: findError } = await supabase
    .from("media")
    .select("*")
    .eq("id", id)
    .single();

  if (findError) return routeError(findError);

  const { error: storageError } = await supabase.storage
    .from("session-media")
    .remove([media.storage_path]);

  if (storageError) return routeError(storageError);

  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) return routeError(error);

  return NextResponse.json({ ok: true });
}
