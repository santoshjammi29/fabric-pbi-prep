import { NextRequest, NextResponse } from "next/server";
import {
  getConceptsDAL,
  getLearningPathsDAL,
  getModernStackDAL,
  getCheatsheetDataDAL,
} from "@/lib/dal";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  // If no query, return an empty set or top suggested items
  if (!q) {
    return NextResponse.json(
      { items: [] },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

  const [concepts, paths, modern, cheatsheets] = await Promise.all([
    getConceptsDAL(),
    getLearningPathsDAL(),
    getModernStackDAL(),
    getCheatsheetDataDAL(),
  ]);

  const results: any[] = [];

  // Match Concepts (top 8)
  for (const c of concepts) {
    if (
      c.term.toLowerCase().includes(q) ||
      (c.category && c.category.toLowerCase().includes(q)) ||
      (c.definition && c.definition.toLowerCase().includes(q))
    ) {
      results.push({
        id: `concept-${c.id}`,
        title: `${c.term} (${c.category})`,
        category: "Concepts",
        href: `/concepts?term=${encodeURIComponent(c.term)}`,
        badge: c.difficulty,
      });
      if (results.length >= 8) break;
    }
  }

  // Match Paths (top 4)
  for (const p of paths) {
    if (p.title.toLowerCase().includes(q) || (p.skills && p.skills.some((s) => s.toLowerCase().includes(q)))) {
      results.push({
        id: `path-${p.id}`,
        title: `${p.title} (${p.weeks} Weeks)`,
        category: "Paths",
        href: `/learning-paths?id=${p.id}`,
        badge: `${p.weeks}w`,
      });
      if (results.length >= 12) break;
    }
  }

  // Match Blueprints (top 4)
  for (const b of modern.blueprints) {
    if (b.title.toLowerCase().includes(q) || (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)))) {
      results.push({
        id: `bp-${b.id}`,
        title: b.title,
        category: "Blueprints",
        href: `/modern-stack#blueprints`,
        badge: b.category,
      });
      if (results.length >= 16) break;
    }
  }

  // Match Cheatsheets (top 4)
  for (const c of cheatsheets) {
    if (
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
    ) {
      results.push({
        id: `cheat-${c.id}`,
        title: `${c.title} — ${c.category}`,
        category: "Concepts",
        href: `/cheat-sheet?id=${c.id}`,
        badge: c.impact,
      });
      if (results.length >= 20) break;
    }
  }

  return NextResponse.json(
    { items: results },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
