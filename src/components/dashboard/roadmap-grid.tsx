"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, FileCode2, Zap, Cloud, MessageSquare, Layers, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EXPERIENCE_TIERS,
  ExperienceTier,
  getStoredExperienceTier,
} from "@/lib/user-progress";

const difficultyColors = {
  Easy: "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40 border-green-200 dark:border-green-800",
  Medium: "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800",
  Hard: "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/40 border-orange-200 dark:border-orange-800",
  Architect: "text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800",
};

export function RoadmapGrid() {
  const [activeTier, setActiveTier] = useState<ExperienceTier>("associate");

  useEffect(() => {
    setActiveTier(getStoredExperienceTier());

    const handleTierUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ tier: ExperienceTier }>;
      if (customEvent.detail?.tier) {
        setActiveTier(customEvent.detail.tier);
      }
    };

    window.addEventListener("dataprep:tier-updated", handleTierUpdate);
    return () => window.removeEventListener("dataprep:tier-updated", handleTierUpdate);
  }, []);

  const tierConfig = EXPERIENCE_TIERS[activeTier];

  const steps = [
    {
      step: 1,
      difficulty: "Easy",
      title: "Key Concepts",
      description: "Foundational definitions, lakehouse architectures, and core data engineering principles.",
      meta: "112+ concepts",
      icon: BookOpen,
      href: "/concepts",
    },
    {
      step: 2,
      difficulty: "Medium",
      title: "Code Practice",
      description: "Hands-on polyglot syntax for PySpark, Spark SQL, T-SQL, and Pandas/Polars.",
      meta: "120+ sheets",
      icon: FileCode2,
      href: "/code-practice",
    },
    {
      step: 3,
      difficulty: "Medium",
      title: "Spark Engine",
      description: "Deep dive into Catalyst, Tungsten, memory management, and physical execution pipelines.",
      meta: "85+ topics",
      icon: Zap,
      href: "/spark-engine",
    },
    {
      step: 4,
      difficulty: "Hard",
      title: "Modern Data Stack",
      description: "Serverless-first, AI-native modern architectural patterns with 6 interactive simulators.",
      meta: "Fabric, Databricks",
      icon: Cloud,
      href: "/modern-stack",
    },
    {
      step: 5,
      difficulty: "Hard",
      title: "Q&A Prep Hub",
      description: "Spaced repetition (SM-2) flashcards for mastering technical interview questions.",
      meta: "6,100+ Q&As",
      icon: MessageSquare,
      href: "/qa-prep",
    },
    {
      step: 6,
      difficulty: "Architect",
      title: "Architecture Hub",
      description: "End-to-end multi-cloud system design and FinOps scenarios for data platforms.",
      meta: "2,400+ scenarios",
      icon: Layers,
      href: "/architecture",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--muted-foreground)]">
        <div className="flex items-center gap-2">
          <span>Targeting:</span>
          <span className="font-bold text-[var(--foreground)] px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)]">
            {tierConfig.label} ({tierConfig.role})
          </span>
        </div>
        <span className="text-[11px]">
          Highlighted cards mark primary milestones for your level
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
        {steps.map((item) => {
          const Icon = item.icon;
          const diffColor = difficultyColors[item.difficulty as keyof typeof difficultyColors];
          const isRecommended = tierConfig.recommendedSteps.includes(item.step);

          return (
            <Link key={item.step} href={item.href} className="block group">
              <div
                className={cn(
                  "flex flex-col h-full rounded-2xl border bg-white dark:bg-slate-900 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden",
                  isRecommended
                    ? "border-purple-500/50 shadow-sm ring-1 ring-purple-500/20 dark:bg-gradient-to-b dark:from-purple-950/15 dark:to-slate-900"
                    : "border-slate-200 dark:border-slate-800"
                )}
              >
                {/* Recommended Badge Ribbon */}
                {isRecommended && (
                  <div className="absolute top-0 right-0">
                    <span className="inline-flex items-center gap-1 rounded-bl-xl bg-purple-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      <Star size={10} className="fill-white" /> Priority Track
                    </span>
                  </div>
                )}

                <div className="mb-6 flex items-center justify-between">
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border", diffColor)}>
                    Step {item.step} · {item.difficulty}
                  </span>
                  {!isRecommended && (
                    <Icon className="h-6 w-6 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                  )}
                  {isRecommended && (
                    <Icon className="h-6 w-6 text-purple-400 transition-colors" />
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    {item.meta}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center font-semibold transition-colors",
                      isRecommended
                        ? "text-purple-600 dark:text-purple-400 group-hover:text-purple-700"
                        : "text-blue-600 dark:text-blue-400 group-hover:text-blue-700"
                    )}
                  >
                    Open <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
