"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, CheckCircle2, Bookmark } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { getLastTopic, getStoredExperienceTier } from "@/lib/user-progress";

export function ContinueLearning() {
  const [isClient, setIsClient] = useState(false);
  const activeTier = getStoredExperienceTier();
  const topic = getLastTopic(activeTier);
  const bookmarks = useUserStore((s) => s.bookmarks);
  const userData = useUserStore((s) => s.userData);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const bookmarksCount = bookmarks.length;
  const reviewedCount = userData.reviewedCount;
  const xp = userData.xp;
  const masteryPercentage = Math.min(100, Math.max(5, Math.round((reviewedCount / 120) * 100)));

  const stats = {
    reviewedCount,
    bookmarksCount,
    masteryPercentage,
    xp,
  };

  const displayProgress = isClient ? Math.max(topic.progress, stats.masteryPercentage) : 15;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <BookOpen className="h-4 w-4" />
            <span>{topic.category}</span>
            {stats.bookmarksCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium ml-2">
                <Bookmark className="h-3 w-3 fill-amber-500/20" />
                {stats.bookmarksCount} saved
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] leading-snug">
            {topic.title}
          </h3>

          <div className="space-y-1.5 w-full max-w-md">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                Milestone Mastery
              </span>
              <span>{displayProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--surface-3)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-700 ease-out"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
            {stats.reviewedCount > 0 && (
              <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>{stats.reviewedCount} questions & scenarios mastered</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
          <Link
            href={topic.href}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 w-full sm:w-auto text-center"
          >
            <span>Resume Learning</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/studio"
            className="inline-flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 [.light_&]:bg-slate-100 [.light_&]:hover:bg-slate-200 [.light_&]:text-slate-700 px-4 py-3 text-xs font-semibold transition-colors text-center"
            title="View personal bookmarks and progress in My Studio"
          >
            Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
