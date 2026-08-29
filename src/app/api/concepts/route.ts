import { NextResponse } from "next/server";
import { conceptsDb } from "@/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() || "";
  const category = searchParams.get("category") || "ALL";

  const filtered = conceptsDb.filter((item) => {
    if (category !== "ALL" && item.category !== category) {
      return false;
    }
    if (q) {
      return (
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return NextResponse.json({
    total: filtered.length,
    data: filtered,
  });
}
