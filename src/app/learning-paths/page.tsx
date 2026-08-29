"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  Calendar,
  CheckCircle2,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { learningPathsDb } from "@/data";
import { LearningPath, Difficulty } from "@/types/data";

const difficultyColors: Record<Difficulty, { bg: string; text: string; border: string }> = {
  EASY: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  MEDIUM: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  HARD: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  ARCHITECT: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

function LearningPathsContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || null;
  const [selectedPathId, setSelectedPathId] = useState<string | null>(initialId || learningPathsDb[0]?.id || null);

  const selectedPath: LearningPath | undefined = useMemo(() => {
    return learningPathsDb.find((p) => p.id === selectedPathId) || learningPathsDb[0];
  }, [selectedPathId]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-8 isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
              <Compass size={14} />
              <span>Structured Career Curricula</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Senior Data Engineering Learning Paths
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              12 comprehensive, week-by-week architectural roadmaps from Microsoft Fabric DP-600 to
              32-Week Principal Lakehouse Mastery with capstone repositories and mock interview rubrics.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-center">
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-2xl font-bold text-blue-400">12</div>
              <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Curricula Tracks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Path Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {learningPathsDb.map((path) => {
          const isSelected = selectedPathId === path.id;
          const diffStyle = difficultyColors[path.difficulty] || difficultyColors.MEDIUM;

          return (
            <button
              key={path.id}
              onClick={() => setSelectedPathId(path.id)}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all space-y-3 flex flex-col justify-between group",
                isSelected
                  ? "bg-purple-600/15 border-purple-500 shadow-lg shadow-purple-500/10"
                  : "bg-[var(--surface-1)] border-[var(--border)] hover:border-purple-500/40 hover:bg-[var(--surface-2)]"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{path.icon}</span>
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                      diffStyle.bg,
                      diffStyle.text,
                      diffStyle.border
                    )}
                  >
                    {path.difficulty}
                  </span>
                </div>
                <h3
                  className={cn(
                    "text-xs sm:text-sm font-bold line-clamp-2",
                    isSelected ? "text-purple-300" : "text-[var(--foreground)]"
                  )}
                >
                  {path.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {path.weeks} Weeks
                </span>
                <span className="font-semibold text-purple-400">{path.examQsCount} Q&As</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Path Deep Dive View */}
      {selectedPath && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-8 animate-in fade-in duration-300">
          {/* Path Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border)]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{selectedPath.icon}</span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                    {selectedPath.title}
                  </h2>
                  <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">
                    {selectedPath.badge} · {selectedPath.weeks} Weeks Total
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-3xl leading-relaxed">
                {selectedPath.description}
              </p>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-[var(--surface-2)] border border-purple-500/30 shrink-0 text-center">
              <div className="text-xs font-semibold text-[var(--muted-foreground)]">Target Outcome</div>
              <div className="text-sm font-bold text-purple-300 mt-0.5">{selectedPath.capstone}</div>
            </div>
          </div>

          {/* Skills Acquired */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              Core Skills &amp; Protocols Mastered:
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedPath.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-300"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Week-by-Week Phases Timeline */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              Phase-by-Phase Roadmap Timeline:
            </h4>

            <div className="space-y-4">
              {selectedPath.phases.map((phase, pi) => (
                <div
                  key={phase.name}
                  className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {pi + 1}
                      </span>
                      <h5 className="text-sm font-bold text-[var(--foreground)]">{phase.name}</h5>
                    </div>
                    <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 self-start sm:self-auto">
                      {phase.weeks}
                    </span>
                  </div>

                  <div className="space-y-1.5 pl-9">
                    <div className="text-xs font-semibold text-[var(--muted-foreground)]">Topics Covered:</div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[var(--foreground)] opacity-90">
                      {phase.topics.map((t, ti) => (
                        <li key={ti} className="flex items-start gap-1.5">
                          <CheckCircle2 size={13} className="text-green-400 mt-0.5 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-[var(--border)] pl-9 text-xs text-purple-300 font-medium">
                    🎯 Milestone: {phase.milestone}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capstone Project Card */}
          {selectedPath.handsOn && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <GitBranch size={16} /> Hands-On Capstone Project
              </div>
              <h4 className="text-base font-bold text-[var(--foreground)]">{selectedPath.handsOn.title}</h4>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                {selectedPath.handsOn.description}
              </p>
              <div className="pt-2">
                <span className="text-xs font-mono text-purple-300 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 inline-block">
                  Repository: {selectedPath.handsOn.repo}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LearningPathsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-[var(--muted-foreground)]">Loading Learning Paths...</div>}>
      <LearningPathsContent />
    </React.Suspense>
  );
}

