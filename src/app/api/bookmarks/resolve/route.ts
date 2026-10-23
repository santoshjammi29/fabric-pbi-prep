import { NextResponse } from "next/server";
import { serverlessDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: true, items: [] });
    }

    const MAX_IDS = 50;
    if (ids.length > MAX_IDS) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_IDS} IDs per request` },
        { status: 400 }
      );
    }
    if (ids.some((id) => typeof id !== "string")) {
      return NextResponse.json(
        { success: false, error: "All IDs must be strings" },
        { status: 400 }
      );
    }

    const idSet = new Set(ids.filter((x): x is string => typeof x === "string"));
    const resolved: Array<{ id: string; title: string; type: string; href: string }> = [];

    const [concepts, questions, arch, code] = await Promise.all([
      serverlessDb.getConcepts(),
      serverlessDb.getUnifiedQuestions(),
      serverlessDb.getArchitectureData(),
      serverlessDb.getCodePractice(),
    ]);

    for (const id of idSet) {
      const c = concepts.find((item) => item.id === id);
      if (c) {
        resolved.push({ id: c.id, title: c.term, type: "concept", href: `/concepts?term=${encodeURIComponent(c.term)}` });
        continue;
      }
      const q = questions.find((item) => item.id === id);
      if (q) {
        resolved.push({ id: q.id, title: q.question, type: "q&a", href: "/qa-prep" });
        continue;
      }
      const a = arch.find((item) => item.id === id);
      if (a) {
        resolved.push({ id: a.id, title: a.question, type: "scenario", href: "/architecture" });
        continue;
      }
      if (code) {
        const py = (code.python || []).find((item) => item.id === id);
        if (py) {
          resolved.push({ id: py.id, title: py.title, type: "python", href: "/code-practice?db=python" });
          continue;
        }
        const psp = (code.pyspark || []).find((item) => item.id === id);
        if (psp) {
          resolved.push({ id: psp.id, title: psp.title, type: "pyspark", href: "/code-practice?db=pyspark" });
          continue;
        }
        const ssql = (code.sparksql || []).find((item) => item.id === id);
        if (ssql) {
          resolved.push({ id: ssql.id, title: ssql.title, type: "spark sql", href: "/code-practice?db=sparksql" });
          continue;
        }
        const msql = (code.mssql || []).find((item) => item.id === id);
        if (msql) {
          resolved.push({ id: msql.id, title: msql.title, type: "t-sql", href: "/code-practice?db=mssql" });
          continue;
        }
      }
      resolved.push({ id, title: `Saved Item (${id})`, type: "saved", href: "/studio" });
    }

    return NextResponse.json(
      { success: true, items: resolved },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error: any) {
    console.error("[bookmarks/resolve] Internal error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
