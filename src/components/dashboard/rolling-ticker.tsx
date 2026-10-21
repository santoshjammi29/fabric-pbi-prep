"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Shuffle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { STATIC_TICKER_ITEMS, TickerItem } from "@/data/ticker-items";

export { STATIC_TICKER_ITEMS as buildTickerItems };
export type { TickerItem };

/* ─── Apple-inspired restrained colour palette ───────────────────────── */
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

/* ─── Fast shuffle array ─────────────────────────────────────────────── */
function shuffleItems(arr: TickerItem[]): TickerItem[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.map((item, idx) => ({
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
  const [items, setItems] = useState<TickerItem[]>(STATIC_TICKER_ITEMS);
  const [isShuffling, setIsShuffling] = useState(false);
  const shuffleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memory leak cleanup: clear timer on unmount
  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current) {
        clearTimeout(shuffleTimerRef.current);
      }
    };
  }, []);

  const handleShuffle = useCallback(() => {
    setIsShuffling(true);
    setItems(shuffleItems(STATIC_TICKER_ITEMS));
    toast.success("Shuffled live topics from enterprise curriculum", {
      duration: 1800,
    });
    if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
    shuffleTimerRef.current = setTimeout(() => {
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
          title="Shuffle Topics (Draw fresh topics from 7,000+ database)"
          aria-label="Shuffle topics from 7,000+ questions database"
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

        {/* Scrolling track — renders unique items exactly once, sorted by relevance */}
        <div
          className="ticker-track flex items-center py-2"
          style={{ "--ticker-duration": "300s" } as React.CSSProperties}
        >
          {items.map((item, idx) => {
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
