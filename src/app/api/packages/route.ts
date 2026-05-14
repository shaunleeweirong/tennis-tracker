import { NextResponse } from "next/server";
import { DEMO_DATA } from "@/data/demo";

export function GET() {
  return NextResponse.json(DEMO_DATA.packages);
}
