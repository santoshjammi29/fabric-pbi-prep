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
import { TopicIcon } from "@/components/ui/topic-icon";

const difficultyColors: Record<Difficulty, { bg: string; text: string; border: string }> = {
  EASY: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  MEDIUM: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  HARD: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  ARCHITECT: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

const FILTER_OPTIONS = [
  { id: "ALL", label: "ALL" },
  { id: "EASY", label: "Beginner" },
  { id: "MEDIUM", label: "Intermediate" },
  { id: "HARD", label: "Advanced" },
  { id: "ARCHITECT", label: "Architect" },
];

export function LearningPathsClient({ initialPaths }: { initialPaths: LearningPath[] }) {
  const learningPathsDb = initialPaths;
  const searchParams = useSearchParams();
  const initialId = searchParams.get("card") || searchParams.get("id") || null;
  const [selectedPathId, setSelectedPathId] = useState<string | null>(initialId || learningPathsDb[0]?.id || null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");

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

  const filteredPaths = useMemo(() => {
    if (difficultyFilter === "ALL") return learningPathsDb;
    return learningPathsDb.filter((p) => p.difficulty === difficultyFilter);
  }, [learningPathsDb, difficultyFilter]);

  const selectedPath: LearningPath | undefined = useMemo(() => {
    return filteredPaths.find((p) => p.id === selectedPathId) || filteredPaths[0] || learningPathsDb[0];
  }, [selectedPathId, filteredPaths, learningPathsDb]);

  return (
    <div className="space-y-3 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header Banner - Compact Reference Style */}
      <div className="relative overflow-hidden rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3 sm:p-4 shadow-xs isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1 max-w-4xl 2xl:max-w-6xl">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-400">
              <Compass size={12} />
              <span>Structured Career Curricula</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] break-words">
              Senior Data Engineering Learning Paths
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
              12 comprehensive, week-by-week architectural roadmaps from Microsoft Fabric DP-600 to
              32-Week Principal Lakehouse Mastery with capstone repositories and mock interview rubrics.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 text-center self-start md:self-auto">
            <div className="px-3 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-sm sm:text-base font-bold text-blue-400">12</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-mono leading-none">Curricula Tracks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Difficulty Filter Pills - Styled after user reference image media_1792228927376_5ece2e88.png */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] overflow-x-auto scrollbar-none max-w-fit shadow-xs">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = difficultyFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => {
                setDifficultyFilter(opt.id);
                const matches = opt.id === "ALL" ? learningPathsDb : learningPathsDb.filter((p) => p.difficulty === opt.id);
                if (matches.length > 0 && !matches.some((p) => p.id === selectedPathId)) {
                  handleSelectPath(matches[0].id);
                }
              }}
              className={cn(
                "px-3 sm:px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Path Selector Cards Grid - Compact 5-column Design matching guided learning snip & Full Text Word Wrap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {filteredPaths.map((path) => {
          const isSelected = selectedPath?.id === path.id;
          const diffStyle = difficultyColors[path.difficulty] || difficultyColors.MEDIUM;
          const cleanKey = path.id.replace("path-", "");

          return (
            <button
              key={path.id}
              onClick={() => handleSelectPath(path.id)}
              className={cn(
                "p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between group cursor-pointer",
                isSelected
                  ? "bg-[var(--surface-2)] border-blue-500 ring-1 ring-blue-500/40 shadow-xs"
                  : "bg-[var(--surface-1)] border-[var(--border)] hover:border-blue-500/30 hover:bg-[var(--surface-2)]/80"
              )}
            >
              <div className="space-y-1.5 w-full">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:border-blue-500/40 transition-colors shadow-xs">
                    <TopicIcon topicKey={cleanKey} size={16} />
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0",
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
                    "text-xs sm:text-[13px] font-bold leading-snug break-words whitespace-normal text-left",
                    isSelected ? "text-blue-400" : "text-[var(--foreground)] group-hover:text-blue-400 transition-colors"
                  )}
                >
                  {path.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] pt-1.5 mt-2 border-t border-[var(--border)] w-full">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar size={11} className="shrink-0 text-[var(--muted-foreground)]" />
                  <span>{path.weeks} Weeks</span>
                </span>
                <span className="font-semibold text-blue-400 font-mono text-[10px]">
                  {path.examQsCount ? `${path.examQsCount} Q&As` : `${path.phases.length} Phases`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Path Deep Dive View */}
      {selectedPath && (
        <div className="p-3 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3.5 animate-in fade-in duration-200 shadow-xs">
          {/* Path Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3.5 border-b border-[var(--border)]">
            <div className="space-y-1.5 max-w-5xl 2xl:max-w-7xl">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0 shadow-xs">
                  <TopicIcon topicKey={selectedPath.id.replace("path-", "")} size={20} />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-[var(--foreground)] tracking-tight break-words">
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
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
                {selectedPath.description}
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-purple-500/30 shrink-0 text-left sm:text-right self-start sm:self-auto">
              <div className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Target Outcome</div>
              <div className="text-xs font-bold text-purple-300 mt-0.5 break-words">{selectedPath.capstone}</div>
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
                  className="px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-300 flex items-center gap-1 break-words"
                >
                  <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                  <span className="break-words">{skill}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Week-by-Week Phases Timeline */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]">
              Phase-by-Phase Roadmap Timeline:
            </h4>

            <div className="space-y-2">
              {selectedPath.phases.map((phase, pi) => (
                <div
                  key={phase.name}
                  className="p-3 sm:p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {pi + 1}
                      </span>
                      <h5 className="text-xs sm:text-sm font-bold text-[var(--foreground)] tracking-tight break-words">
                        {phase.name}
                      </h5>
                    </div>
                    <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 shrink-0 self-start sm:self-auto font-mono">
                      {phase.weeks}
                    </span>
                  </div>

                  <div className="space-y-1 pl-7 sm:pl-7.5">
                    <div className="text-[10px] font-semibold text-[var(--muted-foreground)]">Topics Covered:</div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-[var(--foreground)] opacity-90">
                      {phase.topics.map((t, ti) => (
                        <li key={ti} className="flex items-start gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                          <span className="break-words">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-1.5 border-t border-[var(--border)] pl-7 sm:pl-7.5 text-xs text-purple-300 font-medium flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-purple-400 uppercase font-mono shrink-0">Milestone:</span>
                    <span className="break-words">{phase.milestone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capstone Project Card */}
          {selectedPath.handsOn && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-2)] border border-purple-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                <GitBranch size={13} /> <span>Hands-On Capstone Project</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] break-words">
                {selectedPath.handsOn.title}
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
                {selectedPath.handsOn.description}
              </p>
              <div className="pt-1">
                <span className="text-xs font-mono text-purple-300 bg-[var(--surface-1)] px-2.5 py-1 rounded-lg border border-[var(--border)] inline-block break-all">
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
