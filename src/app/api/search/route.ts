import { type NextRequest, NextResponse } from "next/server";
import { searchNaver } from "@/lib/providers/naver";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchNaver(q);
  return NextResponse.json({ results });
}
