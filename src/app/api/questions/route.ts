import { NextResponse } from "next/server";
import { queryQuestionsDAL } from "@/lib/dal";
import { Difficulty } from "@/types/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const difficulty = (searchParams.get("difficulty")?.toUpperCase() || "ALL") as Difficulty | "ALL";
  const domain = searchParams.get("domain") || "ALL";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "25", 10);

  const result = await queryQuestionsDAL({
    query: q,
    difficulty,
    domain,
    page,
    limit,
  });

  return NextResponse.json(
    {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.items,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400, max-age=60",
        "CDN-Cache-Control": "public, s-maxage=86400",
        "Cloudflare-CDN-Cache-Control": "public, s-maxage=86400",
      },
    }
  );
}
