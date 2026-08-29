import { NextResponse } from "next/server";
import { getUnifiedQuestions } from "@/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() || "";
  const difficulty = searchParams.get("difficulty")?.toUpperCase() || "ALL";
  const domain = searchParams.get("domain") || "ALL";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "25", 10);

  const allQuestions = getUnifiedQuestions();

  const filtered = allQuestions.filter((item) => {
    if (difficulty !== "ALL" && item.difficulty !== difficulty) {
      return false;
    }
    if (domain !== "ALL") {
      const cat = (item.category || "").toUpperCase();
      const niche = (item.niche || "").toUpperCase();
      const dom = (item.domain || "").toUpperCase();
      const target = domain.toUpperCase();
      if (!cat.includes(target) && !niche.includes(target) && !dom.includes(target)) {
        return false;
      }
    }
    if (q) {
      const qMatch = item.question.toLowerCase().includes(q);
      const aMatch = item.answer.toLowerCase().includes(q);
      const catMatch = item.category?.toLowerCase().includes(q);
      return qMatch || aMatch || catMatch;
    }
    return true;
  });

  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit),
    data: paginated,
  });
}
