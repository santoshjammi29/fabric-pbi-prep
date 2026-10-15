import { NextRequest, NextResponse } from "next/server";
import { executePortalSearch } from "@/lib/search-engine";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 30, 1), 100) : 35;
  const categoryFilter = searchParams.get("category");

  if (!q.trim()) {
    return NextResponse.json(
      {
        query: "",
        total: 0,
        identifiedTopics: [],
        pageCounts: {},
        items: [],
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

  const response = executePortalSearch(q, limit);

  if (categoryFilter && categoryFilter !== "All") {
    response.items = response.items.filter(
      (item) => item.category.toLowerCase() === categoryFilter.toLowerCase()
    );
  }

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
