import { NextResponse } from "next/server";
import { DEMO_DATA } from "@/data/demo";

export function GET() {
  return NextResponse.json(DEMO_DATA.sessions);
}

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Session mutations are implemented in the client demo store until Supabase environment variables and server persistence are configured.",
    },
    { status: 501 },
  );
}
