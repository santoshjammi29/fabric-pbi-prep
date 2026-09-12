"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Zap, MessageSquare, Layers, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EXPERIENCE_TIERS,
  ExperienceTier,
} from "@/lib/user-progress";
import { useUserStore } from "@/store/useUserStore";

const difficultyColors = {
  Easy: "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40 border-green-200 dark:border-green-800",
  Medium: "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800",
  Hard: "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/40 border-orange-200 dark:border-orange-800",
  Architect: "text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800",
};

export function RoadmapGrid() {
  const activeTier = useUserStore((s) => s.experienceTier);
  const tierConfig = EXPERIENCE_TIERS[activeTier] || EXPERIENCE_TIERS.associate;

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
      title: "Python Hub",
      description: "Foundational to Principal Architect Python, Pandas, Polars, and optimization patterns.",
      meta: "75+ patterns",
      icon: Code2,
      href: "/python",
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
      description: "Multi-cloud, AI-native architectural patterns and platforms.",
      meta: "Fabric, Databricks",
      icon: Layers,
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
                  "flex flex-col h-full rounded-2xl border bg-[var(--surface-1)] hover:bg-[var(--surface-2)] p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden",
                  isRecommended
                    ? "border-purple-500/50 shadow-sm ring-1 ring-purple-500/20 bg-gradient-to-b from-purple-950/20 to-[var(--surface-1)]"
                    : "border-[var(--border)] hover:border-[var(--border-hover)]"
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
                    <Icon className="h-6 w-6 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
                  )}
                  {isRecommended && (
                    <Icon className="h-6 w-6 text-purple-400 transition-colors" />
                  )}
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
                      isRecommended
                        ? "text-purple-400 group-hover:text-purple-300"
                        : "text-blue-400 group-hover:text-blue-300"
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
