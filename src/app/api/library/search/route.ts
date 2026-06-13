import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { searchPublicBooks } from "@/lib/openlibrary";

export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(24, Math.max(1, Number(new URL(req.url).searchParams.get("limit")) || 24));
  if (!q) return NextResponse.json({ results: [] });

  try {
    const results = await searchPublicBooks(q, limit);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "The public library is napping — try again shortly." }, { status: 502 });
  }
}
