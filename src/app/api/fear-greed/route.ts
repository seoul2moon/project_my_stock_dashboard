import { NextResponse } from "next/server";
import { getFearGreedIndex } from "@/lib/providers/cnn";

export async function GET() {
  const index = await getFearGreedIndex();
  return NextResponse.json({ index });
}
