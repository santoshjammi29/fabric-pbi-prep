"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  ArrowRight,
  BookOpen,
  Workflow,
  Sparkles,
  Shuffle,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  GUIDED_TOPICS,
  GUIDED_DOMAINS,
  GuidedTopic,
} from "@/data/guided-learning-topics";
import {
  getTopicCounts,
  getTopicDiagram,
  getPlatformOverviewStats,
} from "@/lib/guided-learning";

export function HomeGuidedLearningHub() {
  const [selectedDomain, setSelectedDomain] = useState<string>("All Tracks");
  const [completedMap, setCompletedMap] = useState<Record<string, number>>({});
  const [isShuffling, setIsShuffling] = useState(false);

  // Load completed counts per track from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const counts: Record<string, number> = {};
      GUIDED_TOPICS.forEach((t) => {
        const raw = localStorage.getItem(`gl-completed-${t.key}`);
        if (raw) {
          try {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) counts[t.key] = arr.length;
          } catch {}
        }
      });
      setCompletedMap(counts);
    } catch {}
  }, []);

  const overviewStats = useMemo(() => getPlatformOverviewStats(), []);

  // Filter topics by domain
  const filteredTopics = useMemo(() => {
    if (selectedDomain === "All Tracks") return GUIDED_TOPICS;
    return GUIDED_TOPICS.filter((t) => t.domain === selectedDomain);
  }, [selectedDomain]);

  // Daily trending track of the day
  const trendingTrack = useMemo(() => {
    // Deterministic daily track
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return GUIDED_TOPICS[dayOfYear % GUIDED_TOPICS.length];
  }, []);

  const handleRandomTrack = useCallback(() => {
    setIsShuffling(true);
    const rand = GUIDED_TOPICS[Math.floor(Math.random() * GUIDED_TOPICS.length)];
    toast.info(`Random Track Pick: ${rand.label}!`);
    setTimeout(() => {
      setIsShuffling(false);
      window.location.href = `/guided-learning?topic=${rand.key}`;
    }, 400);
  }, []);

  return (
    <section className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Compass size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Guided Learning Journeys</span>
            </span>
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 hidden sm:inline">
              13 Senior Tracks · 4-Stage Milestones
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
            Architect Career Pathways &amp; Learning Journeys
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
            Progressive roadmaps structuring Key Concepts, Real-World Q&amp;As, and System Design Scenarios from foundational syntax to principal architect decision-making.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRandomTrack}
            title="Randomize track selection"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] transition-all cursor-pointer active:scale-95"
          >
            <Shuffle size={13} className={cn("text-emerald-500 transition-transform", isShuffling && "rotate-180")} />
            <span className="hidden sm:inline">Surprise Track</span>
          </button>

          <Link
            href="/guided-learning"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <span>Open Studio</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* 4-Stage Milestone Progression Banner */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              4-Stage Mastery Progression Framework
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border)]">
              {overviewStats.totalUniqueItems.toLocaleString()}+ platform scenarios
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
            Structured cross-topic sequencing
          </span>
        </div>

        {/* 4-Stage Visual Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Stage 1 · Foundations
              </span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                EASY
              </span>
            </div>
            <p className="text-[11px] text-[var(--foreground)] font-medium line-clamp-1">
              Prerequisites, APIs &amp; Basic Topologies
            </p>
          </div>

          <div className="p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Stage 2 · Core Skills
              </span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300">
                MEDIUM
              </span>
            </div>
            <p className="text-[11px] text-[var(--foreground)] font-medium line-clamp-1">
              Transformations, Joins &amp; Pipelines
            </p>
          </div>

          <div className="p-2.5 rounded-xl border border-orange-500/20 bg-orange-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Stage 3 · Advanced
              </span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-orange-500/15 text-orange-700 dark:text-orange-300">
                HARD
              </span>
            </div>
            <p className="text-[11px] text-[var(--foreground)] font-medium line-clamp-1">
              Skew, AQE, Compaction &amp; CDF
            </p>
          </div>

          <div className="p-2.5 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Stage 4 · Staff / Architect
              </span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300">
                PRINCIPAL
              </span>
            </div>
            <p className="text-[11px] text-[var(--foreground)] font-medium line-clamp-1">
              Multi-Cloud, FinOps &amp; Disaster Recovery
            </p>
          </div>
        </div>
      </div>

      {/* Domain Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {GUIDED_DOMAINS.map((domain) => (
          <button
            key={domain}
            onClick={() => setSelectedDomain(domain)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer",
              selectedDomain === domain
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] border border-[var(--border)]"
            )}
          >
            {domain}
          </button>
        ))}
      </div>

      {/* Grid of Guided Track Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => {
          const counts = getTopicCounts(topic.key);
          const diagram = getTopicDiagram(topic.key);
          const completedCount = completedMap[topic.key] || 0;
          const pct = counts.total > 0 ? Math.round((completedCount / counts.total) * 100) : 0;
          const isTrending = topic.key === trendingTrack.key;

          return (
            <div
              key={topic.key}
              className={cn(
                "rounded-3xl border bg-[var(--surface-1)] p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all duration-200 hover:shadow-md group",
                isTrending
                  ? "border-emerald-500/50 shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                  : "border-[var(--border)] hover:border-emerald-500/40"
              )}
            >
              {/* Card Header */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl" role="img" aria-label={topic.label}>
                      {topic.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          <Link href={`/guided-learning?topic=${topic.key}`}>{topic.label}</Link>
                        </h3>
                        {isTrending && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Trending
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                        {topic.domain}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border)] shrink-0">
                    {counts.total} Items
                  </span>
                </div>

                <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                  {topic.description}
                </p>

                {/* Paired Whiteboard Blueprint Preview Pill */}
                {diagram && (
                  <div className="p-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white shrink-0">
                      <Image
                        src={diagram.image}
                        alt={diagram.title}
                        fill
                        className="object-contain p-0.5"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-mono uppercase text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                        <Workflow size={10} /> Paired Whiteboard
                      </div>
                      <div className="text-[11px] font-semibold text-[var(--foreground)] truncate">
                        {diagram.title}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer: Progress & Launch Button */}
              <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[var(--muted-foreground)]">
                    <span>
                      {completedCount > 0 ? `${completedCount} of ${counts.total} mastered` : "Curriculum Track"}
                    </span>
                    <span className="font-semibold text-[var(--foreground)]">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--surface-2)] rounded-full overflow-hidden border border-[var(--border)]/50">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>

                {/* Action CTA */}
                <Link
                  href={`/guided-learning?topic=${topic.key}`}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-emerald-500/25 hover:border-emerald-600 shadow-xs"
                >
                  <span>{completedCount > 0 ? "Continue Journey" : "Start Journey"}</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default HomeGuidedLearningHub;
