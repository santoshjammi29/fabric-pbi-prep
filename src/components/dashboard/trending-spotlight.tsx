"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Calculator,
  ArrowRight,
  Shuffle,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import { CodeBlock } from "@/components/ui/code-block";
import { cn } from "@/lib/utils";
import {
  getRandomSpotlightSelection,
  getNextRefreshSeed,
} from "@/data/home-dynamic-topics";

export function TrendingSpotlight() {
  // SSR fallback with initial seed 42 to prevent any hydration mismatch
  const [data, setData] = useState(() => getRandomSpotlightSelection(42));
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  // On client mount (every page refresh), draw guaranteed different spotlight cards
  useEffect(() => {
    const seed = getNextRefreshSeed();
    setData(getRandomSpotlightSelection(seed));
  }, []);

  const handleManualShuffle = useCallback(() => {
    setIsShuffling(true);
    setIsAnswerRevealed(false);
    const freshSeed = Math.floor(Math.random() * 2147483647);
    setData(getRandomSpotlightSelection(freshSeed));
    toast.success("Shuffled scenario, code snippet, and simulator of the day", {
      duration: 1800,
    });
    setTimeout(() => setIsShuffling(false), 400);
  }, []);

  const { scenario, snippet, simulator } = data;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            Daily Curated Spotlight
          </span>
          <h3 className="text-xl font-bold text-[var(--foreground)] mt-0.5">
            Architecture, Code &amp; Simulator of the Day
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Shuffle button to rotate spotlight on demand */}
          <button
            type="button"
            onClick={handleManualShuffle}
            aria-label="Shuffle spotlight topics"
            title="Click to shuffle daily scenario, code snippet, and simulator"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--surface-2)]/80 hover:bg-[var(--surface-2)] border border-[var(--border)] hover:border-purple-500/40 transition-all cursor-pointer active:scale-95 touch-manipulation"
          >
            <Shuffle
              size={13}
              className={cn("text-purple-400 transition-transform", isShuffling && "animate-spin")}
            />
            <span className="hidden sm:inline">Shuffle Spotlight</span>
          </button>

          <Link
            href="/qa-prep"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 shrink-0 p-1.5 rounded-lg hover:bg-purple-500/10 transition-colors"
          >
            <span className="hidden sm:inline">View All Q&amp;As</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Question / Scenario of the Day */}
        <div className="magazine-card p-6 flex flex-col justify-between space-y-4 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={13} /> {scenario.category}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {scenario.difficulty}
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] leading-snug">
              {scenario.question}
            </h4>

            {!isAnswerRevealed ? (
              <p className="text-xs text-[var(--muted-foreground)] line-clamp-3 leading-relaxed">
                {scenario.teaser}
              </p>
            ) : (
              <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-purple-500/30 text-xs text-[var(--foreground)] opacity-95 leading-relaxed animate-in fade-in duration-200">
                <strong className="text-green-400">Architect Solution:</strong> {scenario.solution}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
              className="min-h-[44px] px-3 py-2 -ml-3 inline-flex items-center text-xs font-semibold text-purple-400 hover:text-purple-300 rounded-lg hover:bg-purple-500/10 active:scale-95 transition-all touch-manipulation cursor-pointer"
            >
              {isAnswerRevealed ? "Hide Solution" : "Reveal Solution →"}
            </button>
            <Link
              href={scenario.relatedHref}
              className="min-h-[44px] px-3 py-2 -mr-3 inline-flex items-center text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-white/5 active:scale-95 transition-all touch-manipulation"
            >
              Practice Q&amp;As
            </Link>
          </div>
        </div>

        {/* Card 2: Code Snippet of the Day */}
        <div className="magazine-card p-6 flex flex-col justify-between space-y-4 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 size={13} /> Code of the Day
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {snippet.level}
              </span>
            </div>

            <h4 className="text-sm font-bold text-[var(--foreground)]">
              {snippet.title}
            </h4>

            <CodeBlock
              code={snippet.code}
              language={snippet.language}
              filename={snippet.filename}
              badge={snippet.badge}
            />
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-[var(--muted-foreground)]">{snippet.badge}</span>
            <Link
              href={snippet.href}
              className="font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Explore Code Practice</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Card 3: Interactive Simulator Launcher */}
        <div className="magazine-card p-6 flex flex-col justify-between space-y-4 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator size={13} /> Live Tool of the Day
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                Interactive
              </span>
            </div>

            <h4 className="text-sm font-bold text-[var(--foreground)]">
              {simulator.title}
            </h4>

            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              {simulator.description}
            </p>

            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1.5">
              {simulator.metrics.map((m, i) => (
                <div key={i} className="flex justify-between text-[11px]">
                  <span className="text-[var(--muted-foreground)]">{m.label}:</span>
                  <span className={cn("font-mono font-bold", m.valueColor)}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <Link
              href={simulator.href}
              className="min-h-[44px] px-3 py-2 -ml-3 inline-flex items-center gap-1.5 text-xs font-semibold text-green-400 hover:text-green-300 rounded-lg hover:bg-green-500/10 active:scale-95 transition-all touch-manipulation"
            >
              <span>Launch Simulator</span>
              <ArrowRight size={13} />
            </Link>
            <span className="text-[11px] text-[var(--muted-foreground)]">Zero install</span>
          </div>
        </div>
      </div>
    </section>
  );
}
