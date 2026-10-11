import { NextResponse } from "next/server";
import { getConceptsDAL } from "@/lib/dal";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() || "";
  const category = searchParams.get("category") || "ALL";
  const id = searchParams.get("id");

  const allConcepts = await getConceptsDAL();

  if (id) {
    const single = allConcepts.find((c) => c.id === id);
    return NextResponse.json(
      { success: !!single, data: single ? [single] : [] },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400, max-age=60",
          "CDN-Cache-Control": "public, s-maxage=86400",
        },
      }
    );
  }

  const filtered = allConcepts.filter((item) => {
    if (category !== "ALL" && item.category !== category) {
      return false;
    }
    if (q) {
      return (
        item.id.toLowerCase().includes(q) ||
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return NextResponse.json(
    {
      total: filtered.length,
      data: filtered,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400, max-age=60",
        "CDN-Cache-Control": "public, s-maxage=86400",
        "Vercel-CDN-Cache-Control": "public, s-maxage=86400",
      },
    }
  );
}
