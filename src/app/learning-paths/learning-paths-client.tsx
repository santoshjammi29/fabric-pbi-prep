"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  Calendar,
  CheckCircle2,
  GitBranch,
  BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LearningPath, Difficulty } from "@/types/data";
import { DecisionLedger } from "@/components/learning-paths/decision-ledger";
import { HubSubnav } from "@/components/layout/hub-subnav";
import { TopicIcon } from "@/components/ui/topic-icon";

const difficultyColors: Record<Difficulty, { bg: string; text: string; border: string }> = {
  EASY: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  MEDIUM: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  HARD: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  ARCHITECT: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

export function LearningPathsClient({ initialPaths }: { initialPaths: LearningPath[] }) {
  const learningPathsDb = initialPaths;
  const searchParams = useSearchParams();
  const initialId = searchParams.get("card") || searchParams.get("id") || null;
  const [selectedPathId, setSelectedPathId] = useState<string | null>(initialId || learningPathsDb[0]?.id || null);

  React.useEffect(() => {
    const cardOrId = searchParams.get("card") || searchParams.get("id");
    if (cardOrId && learningPathsDb.some((p) => p.id === cardOrId)) {
      setSelectedPathId(cardOrId);
    }
  }, [searchParams, learningPathsDb]);

  const handleSelectPath = React.useCallback((id: string) => {
    setSelectedPathId(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("card", id);
      url.searchParams.set("id", id);
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  const selectedPath: LearningPath | undefined = useMemo(() => {
    return learningPathsDb.find((p) => p.id === selectedPathId) || learningPathsDb[0];
  }, [selectedPathId, learningPathsDb]);

  return (
    <div className="space-y-4 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      <HubSubnav
        hubTitle="Learning Journey"
        items={[
          { label: "Guided Topic Tracks", href: "/guided-learning", icon: BookMarked, badge: "13 Tracks" },
          { label: "Career Curricula", href: "/learning-paths", icon: Compass, badge: "12 Tracks" },
        ]}
      />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-3.5 sm:p-5 shadow-xs isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1 max-w-4xl 2xl:max-w-6xl">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-400">
              <Compass size={12} />
              <span>Structured Career Curricula</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
              Senior Data Engineering Learning Paths
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] leading-snug">
              12 comprehensive, week-by-week architectural roadmaps from Microsoft Fabric DP-600 to
              32-Week Principal Lakehouse Mastery with capstone repositories and mock interview rubrics.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 text-center">
            <div className="px-3.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-base font-bold text-blue-400">12</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium leading-none">Curricula Tracks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Path Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {learningPathsDb.map((path) => {
          const isSelected = selectedPathId === path.id;
          const diffStyle = difficultyColors[path.difficulty] || difficultyColors.MEDIUM;
          const cleanKey = path.id.replace("path-", "");

          return (
            <button
              key={path.id}
              onClick={() => handleSelectPath(path.id)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all space-y-2.5 flex flex-col justify-between group",
                isSelected
                  ? "bg-[var(--surface-2)] border-purple-500 ring-1 ring-purple-500/40 shadow-xs"
                  : "bg-[var(--surface-1)] border-[var(--border)] hover:border-purple-500/30 hover:bg-[var(--surface-2)]/80"
              )}
            >
              <div className="space-y-1.5 w-full">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:border-purple-500/40 transition-colors shadow-xs">
                    <TopicIcon topicKey={cleanKey} size={18} />
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
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
                    "text-xs sm:text-sm font-bold line-clamp-1",
                    isSelected ? "text-purple-400" : "text-[var(--foreground)] group-hover:text-purple-400 transition-colors"
                  )}
                >
                  {path.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] pt-1.5 border-t border-[var(--border)] w-full">
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="shrink-0 text-[var(--muted-foreground)]" />
                  <span>{path.weeks} Weeks</span>
                </span>
                <span className="font-semibold text-purple-400 font-mono">
                  {path.examQsCount ? `${path.examQsCount} Q&As` : `${path.phases.length} Phases`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Path Deep Dive View */}
      {selectedPath && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-5 animate-in fade-in duration-200">
          {/* Path Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[var(--border)]">
            <div className="space-y-2 max-w-5xl 2xl:max-w-7xl">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0 shadow-xs">
                  <TopicIcon topicKey={selectedPath.id.replace("path-", "")} size={22} />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight">
                    {selectedPath.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {selectedPath.badge}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">•</span>
                    <span className="text-xs text-purple-300 font-medium">
                      {selectedPath.weeks} Weeks Curriculum
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {selectedPath.description}
              </p>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-purple-500/30 shrink-0 text-center">
              <div className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Target Outcome</div>
              <div className="text-xs font-bold text-purple-300 mt-0.5">{selectedPath.capstone}</div>
            </div>
          </div>

          {/* Skills Acquired */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]">
              Core Skills &amp; Protocols Mastered:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedPath.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-300 flex items-center gap-1"
                >
                  <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Week-by-Week Phases Timeline */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]">
              Phase-by-Phase Roadmap Timeline:
            </h4>

            <div className="space-y-2.5">
              {selectedPath.phases.map((phase, pi) => (
                <div
                  key={phase.name}
                  className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {pi + 1}
                      </span>
                      <h5 className="text-xs sm:text-sm font-bold text-[var(--foreground)] tracking-tight">{phase.name}</h5>
                    </div>
                    <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 shrink-0 self-start sm:self-auto font-mono">
                      {phase.weeks}
                    </span>
                  </div>

                  <div className="space-y-1 pl-8.5">
                    <div className="text-[10px] font-semibold text-[var(--muted-foreground)]">Topics Covered:</div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-[var(--foreground)] opacity-90">
                      {phase.topics.map((t, ti) => (
                        <li key={ti} className="flex items-start gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-1.5 border-t border-[var(--border)] pl-8.5 text-xs text-purple-300 font-medium flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-purple-400 uppercase font-mono">Milestone:</span>
                    <span>{phase.milestone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capstone Project Card */}
          {selectedPath.handsOn && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                <GitBranch size={14} /> <span>Hands-On Capstone Project</span>
              </div>
              <h4 className="text-sm font-bold text-[var(--foreground)]">{selectedPath.handsOn.title}</h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {selectedPath.handsOn.description}
              </p>
              <div className="pt-1">
                <span className="text-xs font-mono text-purple-300 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 inline-block">
                  Repository: {selectedPath.handsOn.repo}
                </span>
              </div>
            </div>
          )}

          {/* Architecture Decision Record (ADR) Ledger */}
          <DecisionLedger />
        </div>
      )}
    </div>
  );
}
