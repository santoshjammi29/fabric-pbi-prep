"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import {
  conceptsDb,
  questionsDb,
  questionsDeDb,
  architectureData,
  pysparkData,
  sparksqlData,
  mssqlData,
  pythonData,
  learningPathsDb,
  modernBlueprintsDb,
  modernConceptsDb,
} from "@/data";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface TickerItem {
  label: string;
  href: string;
  gradient: string;
}

/* ─── Mosaic gradient palette ────────────────────────────────────────── */
const GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-cyan-400 to-teal-500",
  "from-teal-400 to-emerald-500",
  "from-emerald-400 to-green-500",
  "from-lime-400 to-yellow-400",
  "from-yellow-400 to-amber-500",
  "from-amber-400 to-orange-500",
  "from-orange-500 to-red-500",
  "from-rose-500 to-pink-500",
  "from-pink-500 to-fuchsia-500",
  "from-fuchsia-500 to-violet-500",
  "from-indigo-500 to-blue-500",
  "from-sky-400 to-indigo-500",
  "from-purple-500 to-rose-500",
  "from-teal-400 to-blue-500",
  "from-violet-400 to-cyan-500",
  "from-orange-400 to-rose-500",
  "from-green-400 to-cyan-500",
  "from-yellow-500 to-red-500",
];

/* ─── Seeded Fisher-Yates shuffle ───────────────────────────────────── */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── Build ticker items from all databases ──────────────────────────── */
function buildTickerItems(seed: number): TickerItem[] {
  const raw: Omit<TickerItem, "gradient">[] = [];

  // 1. Key Concepts
  conceptsDb.slice(0, 200).forEach((c, i) => {
    if (i % 3 === 0 && c.term) {
      raw.push({ label: c.term, href: `/concepts?term=${encodeURIComponent(c.term)}` });
    }
  });

  // 2. Interview Q&A
  questionsDb.slice(0, 300).forEach((q, i) => {
    if (i % 8 === 0 && q.question) {
      const label = q.question.length > 55 ? q.question.slice(0, 55).trim() + "…" : q.question;
      raw.push({ label, href: "/qa-prep" });
    }
  });

  // 3. DE Q&A
  questionsDeDb.slice(0, 200).forEach((q, i) => {
    if (i % 8 === 0 && q.question) {
      const label = q.question.length > 55 ? q.question.slice(0, 55).trim() + "…" : q.question;
      raw.push({ label, href: "/qa-prep" });
    }
  });

  // 4. Architecture scenarios
  architectureData.slice(0, 200).forEach((a, i) => {
    if (i % 8 === 0 && a.question) {
      const label = a.question.length > 55 ? a.question.slice(0, 55).trim() + "…" : a.question;
      raw.push({ label, href: "/architecture" });
    }
  });

  // 5. PySpark code sheets
  pysparkData.slice(0, 100).forEach((p, i) => {
    if (i % 4 === 0 && p.title) {
      raw.push({ label: `PySpark: ${p.title}`, href: "/code-practice?db=pyspark" });
    }
  });

  // 6. Spark SQL
  sparksqlData.slice(0, 80).forEach((s, i) => {
    if (i % 4 === 0 && s.title) {
      raw.push({ label: `Spark SQL: ${s.title}`, href: "/code-practice?db=sparksql" });
    }
  });

  // 7. MS SQL
  mssqlData.slice(0, 80).forEach((m, i) => {
    if (i % 4 === 0 && m.title) {
      raw.push({ label: `T-SQL: ${m.title}`, href: "/code-practice?db=mssql" });
    }
  });

  // 8. Python code sheets
  pythonData.slice(0, 100).forEach((py, i) => {
    if (i % 4 === 0 && py.title) {
      raw.push({ label: `Python: ${py.title}`, href: "/code-practice?db=python" });
    }
  });

  // 9. Learning paths
  learningPathsDb.forEach((lp) => {
    if (lp.title) {
      raw.push({ label: `Path: ${lp.title}`, href: `/learning-paths${lp.id ? `?id=${lp.id}` : ""}` });
    }
  });

  // 10. Modern blueprints
  modernBlueprintsDb.slice(0, 60).forEach((bp, i) => {
    if (i % 2 === 0 && bp.title) {
      raw.push({ label: `Blueprint: ${bp.title}`, href: "/modern-stack" });
    }
  });

  // 11. Modern concepts
  modernConceptsDb.slice(0, 100).forEach((mc, i) => {
    if (i % 5 === 0 && mc.title) {
      raw.push({ label: mc.title, href: "/modern-stack" });
    }
  });

  // 12. Page highlights
  const extras: Omit<TickerItem, "gradient">[] = [
    { label: "Spark Engine Simulator", href: "/spark-engine" },
    { label: "DAG Execution Visualizer", href: "/spark-engine" },
    { label: "Data Engineering Mindmap", href: "/mindmap" },
    { label: "Company Research Hub", href: "/company-research" },
    { label: "Python Data Engineering", href: "/python" },
    { label: "Medallion Architecture", href: "/concepts?term=Medallion%20Architecture" },
    { label: "Delta Lake Deep Dive", href: "/concepts?term=Delta%20Lake" },
    { label: "Fabric Lakehouse Guide", href: "/concepts?term=Microsoft%20Fabric" },
    { label: "Kimball Dimensional Model", href: "/architecture" },
    { label: "Azure Data Factory Patterns", href: "/qa-prep" },
    { label: "Real-Time Streaming Design", href: "/architecture" },
    { label: "Data Governance & Purview", href: "/concepts?term=Microsoft%20Purview" },
    { label: "Unity Catalog Setup", href: "/modern-stack" },
    { label: "PySpark Performance Tuning", href: "/spark-engine" },
    { label: "GCC Big4 Interview Prep", href: "/company-research" },
    { label: "SQL Server Indexing Mastery", href: "/code-practice?db=mssql" },
    { label: "Spark SQL Optimisation", href: "/code-practice?db=sparksql" },
    { label: "My Learning Studio", href: "/studio" },
  ];
  raw.push(...extras);

  const shuffled = seededShuffle(raw, seed);
  return shuffled.map((item, idx) => ({
    ...item,
    gradient: GRADIENTS[idx % GRADIENTS.length],
  }));
}

/* ─── Dot separator ──────────────────────────────────────────────────── */
function Dot() {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full bg-white/20 mx-4 shrink-0"
      aria-hidden="true"
    />
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export function RollingTicker() {
  const seed = useRef(Math.floor(Math.random() * 1_000_000)).current;
  const items = useMemo(() => buildTickerItems(seed), [seed]);
  const doubled = useMemo(() => [...items, ...items], [items]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl py-1"
      style={{
        background:
          "linear-gradient(135deg, rgba(109,40,217,0.08) 0%, rgba(6,182,212,0.06) 50%, rgba(244,63,94,0.06) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      aria-label="Topics rolling ticker"
    >
      {/* Left fade mask */}
      <div
        className="absolute inset-y-0 left-0 z-10 w-20 pointer-events-none"
        style={{ background: "linear-gradient(to right, var(--background, #0a0a14) 0%, transparent 100%)" }}
      />
      {/* Right fade mask */}
      <div
        className="absolute inset-y-0 right-0 z-10 w-20 pointer-events-none"
        style={{ background: "linear-gradient(to left, var(--background, #0a0a14) 0%, transparent 100%)" }}
      />

      {/* Scrolling track */}
      <div className="ticker-track flex items-center py-2.5 whitespace-nowrap" aria-hidden="true">
        {doubled.map((item, idx) => (
          <span key={`${item.href}-${idx}`} className="inline-flex items-center shrink-0">
            <Link
              href={item.href}
              className={`
                inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold
                text-white shrink-0 bg-gradient-to-r ${item.gradient}
                opacity-85 hover:opacity-100 hover:scale-[1.06]
                transition-all duration-200 cursor-pointer
              `}
              style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.3)", letterSpacing: "0.01em" }}
              tabIndex={-1}
            >
              {item.label}
            </Link>
            <Dot />
          </span>
        ))}
      </div>
    </div>
  );
}
