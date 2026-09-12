"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Shuffle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

/* ─── Pseudo-random number generator for deterministic SSR ─────────── */
function createLCG(seed: number) {
  let s = Math.abs(seed) % 2147483647;
  if (s <= 0) s = 1234567;
  return function next() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ─── High-performance random sample across arbitrary array sizes ───── */
function sampleItems<T>(arr: T[], count: number, rng?: () => number): T[] {
  if (!arr || arr.length === 0) return [];
  if (arr.length <= count) return [...arr];

  const total = arr.length;
  const pickedIndices = new Set<number>();
  const result: T[] = [];

  const targetCount = Math.min(count, total);
  let attempts = 0;
  const maxAttempts = targetCount * 12;

  while (result.length < targetCount && attempts < maxAttempts) {
    attempts++;
    const r = rng ? rng() : Math.random();
    const idx = Math.floor(r * total);
    if (!pickedIndices.has(idx)) {
      pickedIndices.add(idx);
      result.push(arr[idx]);
    }
  }

  // Fallback if needed
  if (result.length < targetCount) {
    for (let i = 0; i < total && result.length < targetCount; i++) {
      if (!pickedIndices.has(i)) {
        pickedIndices.add(i);
        result.push(arr[i]);
      }
    }
  }

  return result;
}

/* ─── Shuffle array with optional RNG ───────────────────────────────── */
function shuffleArray<T>(arr: T[], rng?: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const r = rng ? rng() : Math.random();
    const j = Math.floor(r * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── Build a diverse ~65-item pool drawn across 6k+ database ───────── */
export function buildTickerItems(seed?: number): TickerItem[] {
  const rng = seed !== undefined ? createLCG(seed) : undefined;
  const raw: Omit<TickerItem, "color">[] = [];

  // 1. Key Concepts (140 concepts in database) — sample 10
  sampleItems(conceptsDb.filter((c) => c.term), 10, rng).forEach((c) =>
    raw.push({ label: c.term, href: `/concepts?term=${encodeURIComponent(c.term)}&id=${c.id}` })
  );

  // 2. Fabric & Power BI Q&A (2,640 questions in database) — sample 16
  sampleItems(questionsDb.filter((q) => q.question), 16, rng).forEach((q) => {
    const label = q.question.length > 48 ? q.question.slice(0, 48).trim() + "…" : q.question;
    raw.push({ label, href: `/qa-prep?id=${q.id}&q=${encodeURIComponent(q.question.slice(0, 45))}` });
  });

  // 3. General Data Engineering Q&A (3,499 questions in database) — sample 14
  sampleItems(questionsDeDb.filter((q) => q.question), 14, rng).forEach((q) => {
    const label = q.question.length > 48 ? q.question.slice(0, 48).trim() + "…" : q.question;
    raw.push({ label, href: `/qa-prep?id=${q.id}&q=${encodeURIComponent(q.question.slice(0, 45))}` });
  });

  // 4. Enterprise Architecture Scenarios (2,400 scenarios in database) — sample 12
  sampleItems(architectureData.filter((a) => a.question), 12, rng).forEach((a) => {
    const label = a.question.length > 48 ? a.question.slice(0, 48).trim() + "…" : a.question;
    raw.push({ label, href: `/architecture?id=${a.id}&q=${encodeURIComponent(a.question.slice(0, 45))}` });
  });

  // 5. Polyglot Code Sheets (PySpark, Spark SQL, T-SQL, Python)
  sampleItems(pysparkData.filter((p) => p.title), 2, rng).forEach((p) =>
    raw.push({ label: `PySpark · ${p.title}`, href: `/code-practice?db=pyspark&id=${p.id}&q=${encodeURIComponent(p.title)}` })
  );
  sampleItems(sparksqlData.filter((s) => s.title), 2, rng).forEach((s) =>
    raw.push({ label: `Spark SQL · ${s.title}`, href: `/code-practice?db=sparksql&id=${s.id}&q=${encodeURIComponent(s.title)}` })
  );
  sampleItems(mssqlData.filter((m) => m.title), 2, rng).forEach((m) =>
    raw.push({ label: `T-SQL · ${m.title}`, href: `/code-practice?db=mssql&id=${m.id}&q=${encodeURIComponent(m.title)}` })
  );
  sampleItems(pythonData.filter((p) => p.title), 2, rng).forEach((p) =>
    raw.push({ label: `Python · ${p.title}`, href: `/python?id=${p.id}&q=${encodeURIComponent(p.title)}` })
  );

  // 6. Learning Paths (12 curricula)
  sampleItems(learningPathsDb.filter((lp) => lp.title), 2, rng).forEach((lp) =>
    raw.push({ label: lp.title, href: `/learning-paths?id=${lp.id}` })
  );

  // 7. Architectural Blueprints & Modern Concepts
  sampleItems(modernBlueprintsDb.filter((b) => b.title), 2, rng).forEach((b) =>
    raw.push({ label: b.title, href: `/modern-stack?tab=blueprints#bp-${b.id}` })
  );
  sampleItems(modernConceptsDb.filter((m) => m.title), 2, rng).forEach((m) =>
    raw.push({ label: m.title, href: `/modern-stack?tab=concepts#${m.id}` })
  );

  // 8. Spotlights
  const spotlights: Omit<TickerItem, "color">[] = [
    { label: "Spark Engine Simulator",       href: "/spark-engine" },
    { label: "Data Engineering Mindmap",     href: "/mindmap" },
    { label: "Company Research Hub",         href: "/company-research" },
    { label: "Architecture Diagnostic",      href: "/diagnostic" },
    { label: "Medallion Architecture",       href: "/concepts?term=Medallion%20Architecture&id=lakehouse-medallion-architecture" },
    { label: "Delta Lake Deep Dive",         href: "/concepts?term=Delta%20Lake&id=spark-delta-lake" },
    { label: "Microsoft Fabric Lakehouse",   href: "/concepts?term=Microsoft%20Fabric&id=fabric-onelake-overview" },
    { label: "Real-Time Streaming Design",   href: "/architecture?id=arch-databricks-lakehouse-easy-3&q=Change%20Data%20Feed" },
    { label: "Unity Catalog Setup",          href: "/concepts?term=Unity%20Catalog&id=spark-unity-catalog" },
    { label: "GCC Big4 Interview Prep",      href: "/company-research" },
    { label: "My Learning Studio",           href: "/studio" },
  ];
  sampleItems(spotlights, 3, rng).forEach((sp) => raw.push(sp));

  // Shuffle, slice to 65 max, then assign colours
  const shuffled = shuffleArray(raw, rng).slice(0, 65);
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
const STATIC_TICKER_ITEMS = buildTickerItems(42);

export function RollingTicker() {
  const [items, setItems] = useState<TickerItem[]>(STATIC_TICKER_ITEMS);
  const [isShuffling, setIsShuffling] = useState(false);

  // Triple the array so the loop always has plenty of content to fill wide screens
  const tripled = useMemo(() => [...items, ...items, ...items], [items]);

  const handleShuffle = useCallback(() => {
    setIsShuffling(true);
    // Draw fresh random sample from 6,000+ database
    const fresh = buildTickerItems();
    setItems(fresh);
    toast.success("Shuffled live topics from 6,000+ question database", {
      duration: 1800,
    });
    setTimeout(() => {
      setIsShuffling(false);
    }, 500);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-purple-500/25 bg-gradient-to-r from-purple-950/20 via-[var(--surface-1)] to-blue-950/20 shadow-sm backdrop-blur-md flex items-center p-1.5"
      aria-label="Topics rolling ticker"
    >
      {/* Live Badge Pill & Shuffle Action on Left */}
      <div className="flex items-center shrink-0 z-20 pl-2 pr-2 py-1 gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/35 text-[11px] font-bold uppercase tracking-wider shrink-0 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="hidden sm:inline">Live Topics</span>
          <span className="sm:hidden">Live</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 font-semibold tracking-normal lowercase">6k+</span>
        </div>

        {/* Shuffle Button */}
        <button
          type="button"
          onClick={handleShuffle}
          disabled={isShuffling}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-purple-300 hover:bg-purple-500/15 border border-[var(--border)] hover:border-purple-500/40 text-[11px] font-medium transition-all duration-200 shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 select-none"
          title="Shuffle Topics (Draw fresh topics from 6,000+ database)"
          aria-label="Shuffle topics from 6,000+ questions database"
        >
          <Shuffle
            size={12}
            className={cn("transition-transform duration-500", isShuffling && "rotate-180 text-purple-400")}
          />
          <span className="hidden sm:inline">Shuffle</span>
        </button>
      </div>

      {/* Ticker Container with edge fades */}
      <div className="relative flex-1 overflow-hidden">
        {/* Left fade */}
        <div
          className="absolute inset-y-0 left-0 z-10 w-8 sm:w-16 pointer-events-none"
          style={{
            background: "linear-gradient(to right, var(--surface-1, #0a0a14) 20%, transparent 100%)",
          }}
        />
        {/* Right fade */}
        <div
          className="absolute inset-y-0 right-0 z-10 w-8 sm:w-16 pointer-events-none"
          style={{
            background: "linear-gradient(to left, var(--surface-1, #0a0a14) 20%, transparent 100%)",
          }}
        />

        {/* Scrolling track — smooth, calm Apple speed (300s) */}
        <div
          className="ticker-track flex items-center py-2"
          style={{ "--ticker-duration": "300s" } as React.CSSProperties}
        >
          {tripled.map((item, idx) => {
            const [pill, text] = item.color.split("|");
            return (
              <span key={`${item.label}-${idx}`} className="inline-flex items-center shrink-0">
                <Link
                  href={item.href}
                  tabIndex={-1}
                  className="inline-flex items-center shrink-0 transition-all duration-300"
                  style={{
                    background: pill,
                    color: text,
                    border: `1px solid ${text}35`,
                    borderRadius: "999px",
                    padding: "4px 13px",
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "0.012em",
                    lineHeight: "1.4",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
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
    </div>
  );
}
