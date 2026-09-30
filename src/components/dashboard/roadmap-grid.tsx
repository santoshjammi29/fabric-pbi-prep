"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Zap,
  MessageSquare,
  Layers,
  Star,
  Lock,
  Unlock,
  CheckCircle2,
  GitBranch,
  LayoutGrid,
  Route,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EXPERIENCE_TIERS } from "@/lib/user-progress";
import { useUserStore } from "@/store/useUserStore";

const difficultyColors = {
  Easy: "text-green-300 bg-green-900/40 border-green-800 dark:text-green-300 dark:bg-green-900/40 dark:border-green-800 [.light_&]:text-green-700 [.light_&]:bg-green-100 [.light_&]:border-green-200",
  Medium: "text-blue-300 bg-blue-900/40 border-blue-800 dark:text-blue-300 dark:bg-blue-900/40 dark:border-blue-800 [.light_&]:text-blue-700 [.light_&]:bg-blue-100 [.light_&]:border-blue-200",
  Hard: "text-orange-300 bg-orange-900/40 border-orange-800 dark:text-orange-300 dark:bg-orange-900/40 dark:border-orange-800 [.light_&]:text-orange-700 [.light_&]:bg-orange-100 [.light_&]:border-orange-200",
  Architect: "text-purple-300 bg-purple-900/40 border-purple-800 dark:text-purple-300 dark:bg-purple-900/40 dark:border-purple-800 [.light_&]:text-purple-700 [.light_&]:bg-purple-100 [.light_&]:border-purple-200",
};

export const STEPS_CONFIG = [
  {
    step: 1,
    difficulty: "Easy",
    title: "Key Concepts",
    shortTitle: "Concepts",
    description: "Foundational definitions, lakehouse architectures, and core data engineering principles.",
    meta: "290+ concepts",
    icon: BookOpen,
    href: "/concepts",
    unlockQas: 0,
  },
  {
    step: 2,
    difficulty: "Medium",
    title: "Python Hub",
    shortTitle: "Python",
    description: "Foundational to Principal Architect Python, Pandas, Polars, and optimization patterns.",
    meta: "75+ patterns",
    icon: Code2,
    href: "/python",
    unlockQas: 5,
  },
  {
    step: 3,
    difficulty: "Medium",
    title: "Spark Engine",
    shortTitle: "Spark",
    description: "Deep dive into Catalyst, Tungsten, memory management, and physical execution pipelines.",
    meta: "85+ topics",
    icon: Zap,
    href: "/spark-engine",
    unlockQas: 15,
  },
  {
    step: 4,
    difficulty: "Hard",
    title: "Modern Data Stack",
    shortTitle: "Modern Stack",
    description: "Multi-cloud, AI-native architectural patterns and platforms (Fabric, Databricks).",
    meta: "Fabric, Databricks",
    icon: Layers,
    href: "/modern-stack",
    unlockQas: 30,
  },
  {
    step: 5,
    difficulty: "Hard",
    title: "Q&A Prep Hub",
    shortTitle: "Q&A Hub",
    description: "Spaced repetition (SM-2) flashcards for mastering technical interview questions.",
    meta: "6,100+ Q&As",
    icon: MessageSquare,
    href: "/qa-prep",
    unlockQas: 45,
  },
  {
    step: 6,
    difficulty: "Architect",
    title: "Architecture Hub",
    shortTitle: "Architecture",
    description: "End-to-end multi-cloud system design and FinOps scenarios for data platforms.",
    meta: "2,400+ scenarios",
    icon: Layers,
    href: "/architecture",
    unlockQas: 60,
  },
];

export function RoadmapGrid() {
  const activeTier = useUserStore((s) => s.experienceTier);
  const reviewedCount = useUserStore((s) => s.userData.reviewedCount);
  const tierConfig = EXPERIENCE_TIERS[activeTier] || EXPERIENCE_TIERS.associate;

  // View state: 'scurve' (visual progression) vs 'grid'
  const [viewMode, setViewMode] = useState<"scurve" | "grid">(
    activeTier === "beginner" ? "scurve" : "scurve"
  );
  const [bypassLock, setBypassLock] = useState<boolean>(false);

  // Helper to check if a step is unlocked
  const isStepUnlocked = (stepNumber: number, unlockQas: number) => {
    if (bypassLock) return true;
    if (activeTier !== "beginner") return true;
    if (stepNumber === 1) return true;
    return reviewedCount >= unlockQas;
  };

  return (
    <div className="space-y-6">
      {/* Controls & Targeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--muted-foreground)] p-3 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold">Curriculum Track:</span>
          <span className="font-bold text-[var(--foreground)] px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-purple-300">
            {tierConfig.label} ({tierConfig.role})
          </span>
          <span className="text-[11px] text-[var(--muted-foreground)]">
            · {reviewedCount} Q&As Completed
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
            <button
              onClick={() => setViewMode("scurve")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                viewMode === "scurve"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
              title="Visual Progression S-Curve"
            >
              <Route size={13} />
              <span className="hidden sm:inline">Progression Rail</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                viewMode === "grid"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
              title="Grid View"
            >
              <LayoutGrid size={13} />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>

          {/* Quick Unlock Toggle */}
          {activeTier === "beginner" && (
            <button
              onClick={() => setBypassLock((prev) => !prev)}
              className={cn(
                "px-2.5 py-1 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1",
                bypassLock
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-[var(--surface-2)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)]"
              )}
              title="Toggle Unlock All for free exploration"
            >
              {bypassLock ? <Unlock size={12} /> : <Lock size={12} />}
              <span>{bypassLock ? "All Unlocked" : "Gated Mode"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── S-CURVE VISUAL PROGRESSION PATH ───────────────────────────── */}
      {viewMode === "scurve" && (
        <div className="relative space-y-4">
          {/* Subtitle description */}
          <div className="text-xs text-[var(--muted-foreground)] flex items-center justify-between">
            <span>
              Follow the guided <strong>Beginner&apos;s Rail</strong> from Left to Right, then snake back to master architecture.
            </span>
            <span className="text-[11px] text-cyan-400 font-medium">
              Steps unlock progressively as you practice Q&As
            </span>
          </div>

          {/* Top Row: Steps 1 -> 2 -> 3 */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {STEPS_CONFIG.slice(0, 3).map((item, idx) => {
              const Icon = item.icon;
              const diffColor = difficultyColors[item.difficulty as keyof typeof difficultyColors];
              const isRecommended = tierConfig.recommendedSteps.includes(item.step);
              const unlocked = isStepUnlocked(item.step, item.unlockQas);
              const isCompleted = reviewedCount >= item.unlockQas + 10;

              return (
                <div key={item.step} className="relative">
                  <Link
                    href={unlocked ? item.href : "#"}
                    onClick={(e) => {
                      if (!unlocked) e.preventDefault();
                    }}
                    className={cn(
                      "block group h-full",
                      !unlocked && "cursor-not-allowed"
                    )}
                  >
                    <div
                      className={cn(
                        "flex flex-col h-full rounded-2xl border p-6 transition-all duration-300 relative overflow-hidden",
                        unlocked
                          ? isRecommended
                            ? "bg-gradient-to-b from-purple-950/20 to-[var(--surface-1)] border-purple-500/50 shadow-sm ring-1 ring-purple-500/20 hover:shadow-xl hover:-translate-y-1"
                            : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)] hover:shadow-xl hover:-translate-y-1"
                          : "bg-[var(--surface-1)]/40 border-neutral-800/80 grayscale opacity-70"
                      )}
                    >
                      {/* Ribbon / Status Badge */}
                      <div className="absolute top-0 right-0">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 rounded-bl-xl bg-green-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                            <CheckCircle2 size={10} /> Completed
                          </span>
                        ) : !unlocked ? (
                          <span className="inline-flex items-center gap-1 rounded-bl-xl bg-neutral-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-l border-b border-neutral-700">
                            <Lock size={10} /> Locked ({reviewedCount}/{item.unlockQas})
                          </span>
                        ) : isRecommended ? (
                          <span className="inline-flex items-center gap-1 rounded-bl-xl bg-purple-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                            <Star size={10} className="fill-white" /> Priority
                          </span>
                        ) : null}
                      </div>

                      <div className="mb-5 flex items-center justify-between">
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border", diffColor)}>
                          Step {item.step} · {item.difficulty}
                        </span>
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center border",
                            unlocked
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-neutral-800 text-neutral-500 border-neutral-700"
                          )}
                        >
                          {unlocked ? <Icon size={18} /> : <Lock size={16} />}
                        </div>
                      </div>

                      <div className="flex-1 space-y-2.5">
                        <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                          <span>{item.title}</span>
                        </h3>
                        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs">
                        <span className="font-medium text-[var(--muted-foreground)]">
                          {item.meta}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center font-semibold transition-colors",
                            unlocked
                              ? "text-cyan-400 group-hover:text-cyan-300"
                              : "text-neutral-500"
                          )}
                        >
                          {unlocked ? (
                            <>
                              Enter Step <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </>
                          ) : (
                            `Needs ${item.unlockQas} Q&As`
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Flow arrow to next card on desktop */}
                  {idx < 2 && (
                    <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-[var(--surface-2)] border border-purple-500/40 items-center justify-center text-purple-400 shadow-sm pointer-events-none">
                      <ArrowRight size={12} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* S-Curve connecting connector on desktop between Step 3 & Step 4 */}
          <div className="hidden md:flex justify-end pr-12 py-1">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400/80 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              <span>S-Curve Snake Turn</span>
              <span className="rotate-90 inline-block font-mono">↓</span>
            </div>
          </div>

          {/* Bottom Row (Reverse Direction): Step 6 <--- Step 5 <--- Step 4 */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {/* Note: we render Step 6, 5, 4 or 4, 5, 6 with directional cues */}
            {[STEPS_CONFIG[3], STEPS_CONFIG[4], STEPS_CONFIG[5]].map((item, idx) => {
              const Icon = item.icon;
              const diffColor = difficultyColors[item.difficulty as keyof typeof difficultyColors];
              const isRecommended = tierConfig.recommendedSteps.includes(item.step);
              const unlocked = isStepUnlocked(item.step, item.unlockQas);
              const isCompleted = reviewedCount >= item.unlockQas + 10;

              return (
                <div key={item.step} className="relative">
                  <Link
                    href={unlocked ? item.href : "#"}
                    onClick={(e) => {
                      if (!unlocked) e.preventDefault();
                    }}
                    className={cn(
                      "block group h-full",
                      !unlocked && "cursor-not-allowed"
                    )}
                  >
                    <div
                      className={cn(
                        "flex flex-col h-full rounded-2xl border p-6 transition-all duration-300 relative overflow-hidden",
                        unlocked
                          ? isRecommended
                            ? "bg-gradient-to-b from-purple-950/20 to-[var(--surface-1)] border-purple-500/50 shadow-sm ring-1 ring-purple-500/20 hover:shadow-xl hover:-translate-y-1"
                            : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)] hover:shadow-xl hover:-translate-y-1"
                          : "bg-[var(--surface-1)]/40 border-neutral-800/80 grayscale opacity-70"
                      )}
                    >
                      {/* Ribbon / Status Badge */}
                      <div className="absolute top-0 right-0">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 rounded-bl-xl bg-green-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                            <CheckCircle2 size={10} /> Completed
                          </span>
                        ) : !unlocked ? (
                          <span className="inline-flex items-center gap-1 rounded-bl-xl bg-neutral-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-l border-b border-neutral-700">
                            <Lock size={10} /> Locked ({reviewedCount}/{item.unlockQas})
                          </span>
                        ) : isRecommended ? (
                          <span className="inline-flex items-center gap-1 rounded-bl-xl bg-purple-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                            <Star size={10} className="fill-white" /> Priority
                          </span>
                        ) : null}
                      </div>

                      <div className="mb-5 flex items-center justify-between">
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border", diffColor)}>
                          Step {item.step} · {item.difficulty}
                        </span>
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center border",
                            unlocked
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-neutral-800 text-neutral-500 border-neutral-700"
                          )}
                        >
                          {unlocked ? <Icon size={18} /> : <Lock size={16} />}
                        </div>
                      </div>

                      <div className="flex-1 space-y-2.5">
                        <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                          <span>{item.title}</span>
                        </h3>
                        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs">
                        <span className="font-medium text-[var(--muted-foreground)]">
                          {item.meta}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center font-semibold transition-colors",
                            unlocked
                              ? "text-cyan-400 group-hover:text-cyan-300"
                              : "text-neutral-500"
                          )}
                        >
                          {unlocked ? (
                            <>
                              Enter Step <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </>
                          ) : (
                            `Needs ${item.unlockQas} Q&As`
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Flow arrow to next card on desktop */}
                  {idx < 2 && (
                    <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-[var(--surface-2)] border border-purple-500/40 items-center justify-center text-purple-400 shadow-sm pointer-events-none">
                      <ArrowRight size={12} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── GRID VIEW (CLASSIC) ───────────────────────────────────────── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
          {STEPS_CONFIG.map((item) => {
            const Icon = item.icon;
            const diffColor = difficultyColors[item.difficulty as keyof typeof difficultyColors];
            const isRecommended = tierConfig.recommendedSteps.includes(item.step);
            const unlocked = isStepUnlocked(item.step, item.unlockQas);

            return (
              <Link
                key={item.step}
                href={unlocked ? item.href : "#"}
                onClick={(e) => {
                  if (!unlocked) e.preventDefault();
                }}
                className={cn("block group", !unlocked && "cursor-not-allowed")}
              >
                <div
                  className={cn(
                    "flex flex-col h-full rounded-2xl border p-6 transition-all duration-300 relative overflow-hidden",
                    unlocked
                      ? isRecommended
                        ? "border-purple-500/50 shadow-sm ring-1 ring-purple-500/20 bg-gradient-to-b from-purple-950/20 to-[var(--surface-1)] hover:shadow-xl hover:-translate-y-1"
                        : "bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border-[var(--border)] hover:border-[var(--border-hover)] hover:shadow-xl hover:-translate-y-1"
                      : "bg-[var(--surface-1)]/40 border-neutral-800/80 grayscale opacity-70"
                  )}
                >
                  <div className="absolute top-0 right-0">
                    {!unlocked ? (
                      <span className="inline-flex items-center gap-1 rounded-bl-xl bg-neutral-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-l border-b border-neutral-700">
                        <Lock size={10} /> Locked ({reviewedCount}/{item.unlockQas})
                      </span>
                    ) : isRecommended ? (
                      <span className="inline-flex items-center gap-1 rounded-bl-xl bg-purple-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                        <Star size={10} className="fill-white" /> Priority Track
                      </span>
                    ) : null}
                  </div>

                  <div className="mb-6 flex items-center justify-between">
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border", diffColor)}>
                      Step {item.step} · {item.difficulty}
                    </span>
                    <Icon className="h-6 w-6 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                      <span>{item.title}</span>
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[var(--border)] flex items-center justify-between text-sm">
                    <span className="font-medium text-[var(--muted-foreground)]">
                      {item.meta}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center font-semibold transition-colors",
                        unlocked
                          ? isRecommended
                            ? "text-purple-400 group-hover:text-purple-300"
                            : "text-blue-400 group-hover:text-blue-300"
                          : "text-neutral-500"
                      )}
                    >
                      {unlocked ? "Open" : `Locked (${item.unlockQas} Q&As)`}
                      {unlocked && <ArrowRight className="ml-1 h-4 w-4" />}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
