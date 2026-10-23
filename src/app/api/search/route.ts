import { NextRequest, NextResponse } from "next/server";
import { executePortalSearch } from "@/lib/search-engine";
import type { TopicIdentification, SearchResultItem } from "@/lib/search-types";

export const runtime = "nodejs";

function emptyResponse() {
  return {
    query: "",
    total: 0,
    identifiedTopics: [] as TopicIdentification[],
    pageCounts: {} as Record<string, number>,
    items: [] as SearchResultItem[],
    navigationalJump: null,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim().slice(0, 160);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 30, 1), 100) : 35;
  const categoryFilter = searchParams.get("category") || undefined;

  if (!query) {
    return NextResponse.json(emptyResponse(), {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  }

  try {
    const response = executePortalSearch(query, limit, categoryFilter);

    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    console.error("[search] Portal search error:", error);
    return NextResponse.json(
      { error: "Search failed. Please refine query." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
