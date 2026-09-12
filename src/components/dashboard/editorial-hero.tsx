"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Bot,
  Flame,
  TrendingUp,
  Shuffle,
  Code2,
  Zap,
  ShieldCheck,
  Database,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getRandomHeroSelection,
  getNextRefreshSeed,
} from "@/data/home-dynamic-topics";

const ICON_MAP = {
  Flame,
  Bot,
  Layers,
  Code2,
  Zap,
  ShieldCheck,
  Database,
  Calculator,
};

const THEME_STYLES = {
  purple: {
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    button: "bg-purple-600 hover:bg-purple-500 shadow-purple-500/25",
    textHover: "group-hover:text-purple-300",
    sparkle: "text-purple-400",
  },
  blue: {
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    button: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/25",
    textHover: "group-hover:text-blue-300",
    sparkle: "text-blue-400",
  },
  emerald: {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    button: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25",
    textHover: "group-hover:text-emerald-300",
    sparkle: "text-emerald-400",
  },
  amber: {
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    button: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/25",
    textHover: "group-hover:text-amber-300",
    sparkle: "text-amber-400",
  },
  rose: {
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    button: "bg-rose-600 hover:bg-rose-500 shadow-rose-500/25",
    textHover: "group-hover:text-rose-300",
    sparkle: "text-rose-400",
  },
  cyan: {
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    button: "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/25",
    textHover: "group-hover:text-cyan-300",
    sparkle: "text-cyan-400",
  },
};

export function EditorialHero() {
  // SSR fallback with initial seed 42 to prevent any hydration mismatch
  const [data, setData] = useState(() => getRandomHeroSelection(42));
  const [isShuffling, setIsShuffling] = useState(false);

  // On client mount (every page refresh), draw guaranteed different topics
  useEffect(() => {
    const seed = getNextRefreshSeed();
    setData(getRandomHeroSelection(seed));
  }, []);

  const handleManualShuffle = useCallback(() => {
    setIsShuffling(true);
    const freshSeed = Math.floor(Math.random() * 2147483647);
    setData(getRandomHeroSelection(freshSeed));
    toast.success("Shuffled featured editorial guides across platform topics", {
      duration: 1800,
    });
    setTimeout(() => setIsShuffling(false), 400);
  }, []);

  const { featured, secondary } = data;
  const theme = THEME_STYLES[featured.themeColor] || THEME_STYLES.purple;

  return (
    <section className="space-y-4">
      {/* Magazine Editorial Split Grid */}
      <div className="editorial-hero-grid">
        {/* Left Primary Featured Hero Card */}
        <div className="magazine-card magazine-card-featured p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider transition-colors",
                    theme.badge
                  )}
                >
                  <Sparkles size={13} className={theme.sparkle} />
                  <span>{featured.badge}</span>
                </div>
                <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20">
                  {featured.categoryTag}
                </span>
              </div>

              {/* Shuffle button to rotate topics on demand */}
              <button
                type="button"
                onClick={handleManualShuffle}
                aria-label="Shuffle editorial topics"
                title="Click to explore other topics across the website"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--surface-2)]/80 hover:bg-[var(--surface-2)] border border-[var(--border)] hover:border-purple-500/40 transition-all cursor-pointer active:scale-95 touch-manipulation"
              >
                <Shuffle
                  size={12}
                  className={cn("text-purple-400 transition-transform", isShuffling && "animate-spin")}
                />
                <span className="hidden sm:inline">Shuffle</span>
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--foreground)] leading-tight group-hover:text-purple-300 transition-colors">
              <Link href={featured.href}>{featured.title}</Link>
            </h2>

            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
              {featured.description}
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
            {/* Author & Reading Time */}
            <div className="flex items-center gap-3">
              <div className="author-avatar shadow-md">{featured.author.avatar}</div>
              <div className="text-xs">
                <div className="font-bold text-[var(--foreground)]">{featured.author.name}</div>
                <div className="text-[11px] text-[var(--muted-foreground)]">
                  {featured.author.role}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-purple-400" /> {featured.readTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <TrendingUp size={13} className="text-green-400" /> {featured.studiedCount}
              </span>
              <Link
                href={featured.href}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-white font-semibold text-xs transition-all shadow-md ml-auto sm:ml-2 touch-manipulation min-h-[36px] active:scale-95",
                  theme.button
                )}
              >
                <span>{featured.buttonLabel}</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Secondary Stack (3 Curated Editorial Cards) */}
        <div className="flex flex-col gap-3.5">
          {secondary.map((card) => {
            const Icon = ICON_MAP[card.iconName] || Flame;
            return (
              <Link
                key={card.id}
                href={card.href}
                className="magazine-card p-5 flex flex-col justify-between flex-1 group hover:border-purple-500/40 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-wider flex items-center gap-1",
                        card.accentColor
                      )}
                    >
                      <Icon size={12} /> {card.trackLabel}
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">
                      {card.readTime}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] group-hover:text-purple-300 transition-colors leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                    {card.description}
                  </p>
                </div>
                <div
                  className={cn(
                    "pt-2 text-[11px] font-semibold flex items-center gap-1",
                    card.accentColor
                  )}
                >
                  <span>{card.actionText}</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
