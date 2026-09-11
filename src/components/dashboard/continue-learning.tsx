"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, CheckCircle2, Bookmark } from "lucide-react";
import {
  getLastTopic,
  getMasteryStats,
  getStoredExperienceTier,
  LastTopicData,
} from "@/lib/user-progress";

export function ContinueLearning() {
  const [topic, setTopic] = useState<LastTopicData>({
    title: "Key Concepts: Lakehouse vs Data Warehouse",
    href: "/concepts?term=Lakehouse",
    category: "Core Concepts Hub",
    progress: 15,
  });

  const [stats, setStats] = useState({
    reviewedCount: 0,
    bookmarksCount: 0,
    masteryPercentage: 15,
    xp: 0,
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const refresh = () => {
      const activeTier = getStoredExperienceTier();
      const currentTopic = getLastTopic(activeTier);
      const currentStats = getMasteryStats();
      setTopic(currentTopic);
      setStats(currentStats);
    };

    refresh();

    const handleTopicUpdate = () => refresh();
    const handleTierUpdate = () => refresh();
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key?.startsWith("dataprep_") ||
        e.key === "interview_prep_progress" ||
        e.key === "user_bookmarks"
      ) {
        refresh();
      }
    };

    window.addEventListener("dataprep:topic-updated", handleTopicUpdate);
    window.addEventListener("dataprep:tier-updated", handleTierUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("dataprep:topic-updated", handleTopicUpdate);
      window.removeEventListener("dataprep:tier-updated", handleTierUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const displayProgress = isClient ? Math.max(topic.progress, stats.masteryPercentage) : 15;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <BookOpen className="h-4 w-4" />
            <span>{topic.category}</span>
            {stats.bookmarksCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium ml-2">
                <Bookmark className="h-3 w-3 fill-amber-500/20" />
                {stats.bookmarksCount} saved
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
            {topic.title}
          </h3>

          <div className="space-y-1.5 w-full max-w-md">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                Milestone Mastery
              </span>
              <span>{displayProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-700 ease-out"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
            {stats.reviewedCount > 0 && (
              <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
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
            className="inline-flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors text-center"
            title="View personal bookmarks and progress in My Studio"
          >
            Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
