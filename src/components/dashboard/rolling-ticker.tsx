"use client";

import { useMemo, useState, useEffect } from "react";
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

/* ─── Types ──────────────────────────────────────────────────────────── */
interface TickerItem {
  label: string;
  href: string;
  color: string; // subtle Apple-style tint
}

/* ─── Apple-inspired restrained colour palette ───────────────────────── */
// Soft, muted pill colours — like iOS tag chips. No garish rainbows.
const APPLE_COLORS: { pill: string; text: string }[] = [
  { pill: "rgba(99,102,241,0.18)",  text: "#a5b4fc" }, // indigo
  { pill: "rgba(59,130,246,0.18)",  text: "#93c5fd" }, // blue
  { pill: "rgba(6,182,212,0.18)",   text: "#67e8f9" }, // cyan
  { pill: "rgba(20,184,166,0.18)",  text: "#5eead4" }, // teal
  { pill: "rgba(16,185,129,0.18)",  text: "#6ee7b7" }, // emerald
  { pill: "rgba(234,179,8,0.18)",   text: "#fde68a" }, // amber
  { pill: "rgba(249,115,22,0.18)",  text: "#fdba74" }, // orange
  { pill: "rgba(239,68,68,0.18)",   text: "#fca5a5" }, // red
  { pill: "rgba(236,72,153,0.18)",  text: "#f9a8d4" }, // pink
  { pill: "rgba(168,85,247,0.18)",  text: "#d8b4fe" }, // purple
  { pill: "rgba(139,92,246,0.18)",  text: "#c4b5fd" }, // violet
  { pill: "rgba(14,165,233,0.18)",  text: "#7dd3fc" }, // sky
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

/* ─── Pick N evenly-spaced items from array ─────────────────────────── */
function pick<T>(arr: T[], n: number): T[] {
  if (!arr.length) return [];
  const step = Math.max(1, Math.floor(arr.length / n));
  return Array.from({ length: n }, (_, i) => arr[(i * step) % arr.length]);
}

/* ─── Build a curated ~55-item pool ─────────────────────────────────── */
function buildTickerItems(seed: number): TickerItem[] {
  const raw: Omit<TickerItem, "color">[] = [];

  // Key concepts — pick 10 spread evenly
  pick(conceptsDb.filter(c => c.term), 10).forEach(c =>
    raw.push({ label: c.term, href: `/concepts?term=${encodeURIComponent(c.term)}` })
  );

  // Q&A questions — pick 6 from general
  pick(questionsDb.filter(q => q.question), 6).forEach(q => {
    const label = q.question.length > 48 ? q.question.slice(0, 48).trim() + "…" : q.question;
    raw.push({ label, href: "/qa-prep" });
  });

  // DE questions — pick 4
  pick(questionsDeDb.filter(q => q.question), 4).forEach(q => {
    const label = q.question.length > 48 ? q.question.slice(0, 48).trim() + "…" : q.question;
    raw.push({ label, href: "/qa-prep" });
  });

  // Architecture — pick 5
  pick(architectureData.filter(a => a.question), 5).forEach(a => {
    const label = a.question.length > 48 ? a.question.slice(0, 48).trim() + "…" : a.question;
    raw.push({ label, href: "/architecture" });
  });

  // Code sheets — pick 3 from each engine
  pick(pysparkData.filter(p => p.title), 3).forEach(p =>
    raw.push({ label: `PySpark · ${p.title}`, href: "/code-practice?db=pyspark" })
  );
  pick(sparksqlData.filter(s => s.title), 3).forEach(s =>
    raw.push({ label: `Spark SQL · ${s.title}`, href: "/code-practice?db=sparksql" })
  );
  pick(mssqlData.filter(m => m.title), 3).forEach(m =>
    raw.push({ label: `T-SQL · ${m.title}`, href: "/code-practice?db=mssql" })
  );
  pick(pythonData.filter(p => p.title), 3).forEach(p =>
    raw.push({ label: `Python · ${p.title}`, href: "/code-practice?db=python" })
  );

  // Learning paths — all (usually 12)
  learningPathsDb.filter(lp => lp.title).forEach(lp =>
    raw.push({ label: lp.title, href: `/learning-paths?id=${lp.id}` })
  );

  // Blueprints — pick 4
  pick(modernBlueprintsDb.filter(b => b.title), 4).forEach(b =>
    raw.push({ label: b.title, href: "/modern-stack" })
  );

  // Modern concepts — pick 3
  pick(modernConceptsDb.filter(m => m.title), 3).forEach(m =>
    raw.push({ label: m.title, href: "/modern-stack" })
  );

  // Curated page spotlights
  const spotlights: Omit<TickerItem, "color">[] = [
    { label: "Spark Engine Simulator",       href: "/spark-engine" },
    { label: "Data Engineering Mindmap",     href: "/mindmap" },
    { label: "Company Research Hub",         href: "/company-research" },
    { label: "Python Data Engineering",      href: "/python" },
    { label: "Medallion Architecture",       href: "/concepts?term=Medallion%20Architecture" },
    { label: "Delta Lake Deep Dive",         href: "/concepts?term=Delta%20Lake" },
    { label: "Microsoft Fabric Lakehouse",   href: "/concepts?term=Microsoft%20Fabric" },
    { label: "Real-Time Streaming Design",   href: "/architecture" },
    { label: "Unity Catalog Setup",          href: "/modern-stack" },
    { label: "GCC Big4 Interview Prep",      href: "/company-research" },
    { label: "My Learning Studio",           href: "/studio" },
  ];
  raw.push(...spotlights);

  // Shuffle, slice to 55 max, then assign colours
  const shuffled = seededShuffle(raw, seed).slice(0, 55);
  return shuffled.map((item, idx) => ({
    ...item,
    color: APPLE_COLORS[idx % APPLE_COLORS.length].pill + "|" + APPLE_COLORS[idx % APPLE_COLORS.length].text,
  }));
}

/* ─── Separator ─────────────────────────────────────────────────────── */
function Sep() {
  return (
    <span
      className="inline-block w-[3px] h-[3px] rounded-full mx-7 shrink-0"
      style={{ background: "rgba(255,255,255,0.15)" }}
      aria-hidden="true"
    />
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export function RollingTicker() {
  const [items, setItems] = useState<TickerItem[]>(() => buildTickerItems(42));

  useEffect(() => {
    const seed = Math.floor(Math.random() * 1_000_000);
    setItems(buildTickerItems(seed));
  }, []);

  // Triple the array so the loop always has plenty of content to fill wide screens
  const tripled = useMemo(() => [...items, ...items, ...items], [items]);

  return (
    <div
      className="relative w-full overflow-hidden border-b border-border/30 bg-background/40 backdrop-blur-sm"
      aria-label="Topics rolling ticker"
    >
      {/* Left fade — subtle on mobile, wider on desktop */}
      <div
        className="absolute inset-y-0 left-0 z-10 w-8 sm:w-16 lg:w-28 pointer-events-none"
        style={{
          background: "linear-gradient(to right, var(--background, #0a0a14) 30%, transparent 100%)",
        }}
      />
      {/* Right fade */}
      <div
        className="absolute inset-y-0 right-0 z-10 w-8 sm:w-16 lg:w-28 pointer-events-none"
        style={{
          background: "linear-gradient(to left, var(--background, #0a0a14) 30%, transparent 100%)",
        }}
      />

      {/* Scrolling track — Apple uses consistent, unhurried speed */}
      <div
        className="ticker-track flex items-center py-3"
        style={{ "--ticker-duration": "320s" } as React.CSSProperties}
      >
        {tripled.map((item, idx) => {
          const [pill, text] = item.color.split("|");
          return (
            <span key={`${item.label}-${idx}`} className="inline-flex items-center shrink-0">
              <Link
                href={item.href}
                tabIndex={-1}
                className="inline-flex items-center shrink-0 transition-all duration-500"
                style={{
                  background: pill,
                  color: text,
                  border: `1px solid ${text}30`,
                  borderRadius: "999px",
                  padding: "5px 14px",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  letterSpacing: "0.012em",
                  lineHeight: "1.4",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  // Apple: no drop-shadow, just a subtle inner glow via border
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.opacity = "1";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.opacity = "";
                  (e.currentTarget as HTMLElement).style.transform = "";
                }}
              >
                {item.label}
              </Link>
              <Sep />
            </span>
          );
        })}
      </div>
    </div>
  );
}
