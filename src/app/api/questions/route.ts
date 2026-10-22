import { NextResponse } from "next/server";
import { queryQuestionsDAL } from "@/lib/dal";
import { Difficulty } from "@/types/data";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 25;
const MAX_QUERY_LENGTH = 160;

const VALID_DIFFICULTIES = new Set(["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Sanitize and clamp query text
  const rawQ = searchParams.get("q") || "";
  const q = rawQ.trim().slice(0, MAX_QUERY_LENGTH);

  // 2. Validate difficulty
  const rawDiff = (searchParams.get("difficulty") || "ALL").toUpperCase();
  const difficulty = (VALID_DIFFICULTIES.has(rawDiff) ? rawDiff : "ALL") as Difficulty | "ALL";

  // 3. Sanitize domain
  const rawDomain = (searchParams.get("domain") || "ALL").trim().slice(0, 64);
  const domain = rawDomain || "ALL";

  // 4. Strict numerical clamping for pagination to prevent Worker Isolate DoS (NEW-BUG-03)
  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.min(rawPage, 10000) : 1;

  const rawLimit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;

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
