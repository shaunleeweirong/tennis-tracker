import { NextResponse } from "next/server";
import { getSupabaseUser, routeError, supabaseNotConfigured } from "@/lib/api/auth";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "video/mp4", "video/quicktime"]);
const maxUploadBytes = Number(process.env.MEDIA_MAX_UPLOAD_MB ?? 100) * 1024 * 1024;

export async function POST(request: Request) {
  const { supabase, user, response } = await getSupabaseUser();
  if (response) return response;
  if (!supabase || !user) return supabaseNotConfigured();

  const body = await request.json();
  const filename = String(body.filename ?? "upload");
  const mimeType = String(body.mime_type ?? body.mimeType ?? "");
  const sessionId = String(body.session_id ?? body.sessionId ?? "");
  const fileSizeBytes = Number(body.file_size_bytes ?? body.fileSizeBytes ?? 0);

  if (!allowedMimeTypes.has(mimeType)) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 400 });
  }

  if (fileSizeBytes > maxUploadBytes) {
    return NextResponse.json({ error: "File is larger than the 100MB limit" }, { status: 400 });
  }

  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `${user.id}/${sessionId}/${crypto.randomUUID()}-${safeFilename}`;
  const { data: media, error: mediaError } = await supabase
    .from("media")
    .insert({
      session_id: sessionId,
      player_id: user.id,
      storage_path: storagePath,
      mime_type: mimeType,
      file_size_bytes: fileSizeBytes || null,
    })
    .select("*")
    .single();

  if (mediaError) return routeError(mediaError);

  const { data, error } = await supabase.storage
    .from("session-media")
    .createSignedUploadUrl(storagePath);

  if (error) return routeError(error);
  return NextResponse.json({ media_id: media.id, storage_path: storagePath, upload_url: data.signedUrl, token: data.token });
}
