"use client";

import React, { useState, useMemo, useEffect, useCallback, useDeferredValue, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import {
  Search,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Sparkles,
  Layers,
  RotateCw,
  Zap,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  BookOpen,
  Building2,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HubSubnav } from "@/components/layout/hub-subnav";
import { UnifiedQuestion, Difficulty, STANDARDIZED_DOMAINS } from "@/types/data";
import dynamic from "next/dynamic";
import { recordLastTopic } from "@/lib/user-progress";

const AnswerRenderer = dynamic(
  () => import("@/components/ui/answer-renderer").then((mod) => mod.AnswerRenderer),
  { ssr: false }
);

const difficultyColors: Record<Difficulty, { bg: string; text: string; border: string }> = {
  EASY: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  MEDIUM: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  HARD: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  ARCHITECT: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

interface QaPrepClientProps {
  initialQuestions: UnifiedQuestion[];
}

export function QaPrepClient({ initialQuestions }: QaPrepClientProps) {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || searchParams.get("search") || "";
  const initialDomain = searchParams.get("domain") || searchParams.get("category") || "ALL";

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedDomain, setSelectedDomain] = useState<string>(initialDomain);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // Study Mode State (Flashcards)
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync bookmarks
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("dataprep_bookmarks");
      if (saved) setBookmarks(JSON.parse(saved));
    } catch {}
  }, []);

  const handleShuffle = useCallback(() => {
    setIsShuffled(true);
    setShuffleSeed((s) => s + 1);
    toast.success("Shuffled questions order");
  }, []);

  const handleResetOrder = useCallback(() => {
    setIsShuffled(false);
    toast.info("Reset to default order");
  }, []);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    let result = initialQuestions;

    if (selectedDifficulty !== "ALL") {
      result = result.filter((item) => item.difficulty === selectedDifficulty);
    }

    if (selectedDomain !== "ALL") {
      const target = selectedDomain.toUpperCase();
      result = result.filter((item) => {
        const cat = (item.category || "").toUpperCase();
        const niche = (item.niche || "").toUpperCase();
        const dom = (item.domain || "").toUpperCase();
        return cat.includes(target) || niche.includes(target) || dom.includes(target);
      });
    }

    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          (item.category && item.category.toLowerCase().includes(q)) ||
          (item.niche && item.niche.toLowerCase().includes(q))
      );
    }

    if (isShuffled) {
      result = [...result].sort((a, b) => {
        const hashA = (a.id.length * 37 + shuffleSeed) % 100;
        const hashB = (b.id.length * 37 + shuffleSeed) % 100;
        return hashA - hashB;
      });
    }

    return result;
  }, [initialQuestions, selectedDifficulty, selectedDomain, deferredSearch, isShuffled, shuffleSeed]);

  // Window Virtualization for Questions List
  const virtualizer = useWindowVirtualizer({
    count: filteredQuestions.length,
    estimateSize: () => 110,
    overscan: 5,
  });

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.includes(id)
      ? bookmarks.filter((b) => b !== id)
      : [...bookmarks, id];
    setBookmarks(updated);
    try {
      localStorage.setItem("dataprep_bookmarks", JSON.stringify(updated));
      toast.success(bookmarks.includes(id) ? "Removed from bookmarks" : "Bookmarked question");
    } catch {}
  };

  const copyToClipboard = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const currentStudyCard = filteredQuestions[studyIndex];

  return (
    <div className="space-y-4 pb-16">
      <HubSubnav
        hubTitle="Interview Prep & Architecture"
        items={[
          { label: "Q&A Scenarios", href: "/qa-prep", icon: MessageSquare },
          { label: "System Design", href: "/architecture", icon: Building2 },
          { label: "Mindmap", href: "/mindmap", icon: Compass },
        ]}
      />

      {/* Header Hub Banner */}
      <div className="relative rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-3.5 sm:p-4.5 overflow-hidden shadow-xs">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <MessageSquare size={12} />
            <span>Interview Practice &amp; Architect Q&amp;A Hub</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight">
              6,500+ Production Interview Scenarios
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] max-w-3xl leading-snug">
              Real-world technical questions with deep architectural answers, code implementations, and trade-off rubrics across Microsoft Fabric, Databricks, Spark, and Lakehouse architectures.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => setIsStudyMode(!isStudyMode)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs",
                isStudyMode
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-3)]"
              )}
            >
              <Zap size={13} />
              <span>{isStudyMode ? "Exit Study Mode" : "Interactive Study Mode (Flashcards)"}</span>
            </button>
            <span className="text-[11px] text-[var(--muted-foreground)]">
              Showing {filteredQuestions.length.toLocaleString()} of {initialQuestions.length.toLocaleString()} questions
            </span>
          </div>
        </div>
      </div>

      {/* Standardized Domain Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setSelectedDomain("ALL")}
          className={cn(
            "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer",
            selectedDomain === "ALL"
              ? "bg-blue-600 border-blue-500 text-white shadow-xs"
              : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
          )}
        >
          All Domains
        </button>
        {STANDARDIZED_DOMAINS.map((dom) => (
          <button
            key={dom}
            onClick={() => setSelectedDomain(dom)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer",
              selectedDomain === dom
                ? "bg-blue-600 border-blue-500 text-white shadow-xs"
                : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
            )}
          >
            {dom}
          </button>
        ))}
      </div>

      {/* Search & Difficulty Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by topic, failure modes, code syntax..."
            className="w-full pl-9 pr-12 py-1.5 sm:py-2 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-xs sm:text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shrink-0 overflow-x-auto scrollbar-none">
          {["ALL", "EASY", "MEDIUM", "HARD", "ARCHITECT"].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                selectedDifficulty === diff
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Study Flashcard Mode */}
      {isStudyMode && currentStudyCard && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-blue-500/30 shadow-md space-y-3.5">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px]">
              Question {studyIndex + 1} of {filteredQuestions.length.toLocaleString()}
            </span>
            <span className="font-mono text-[10px]">{currentStudyCard.category}</span>
          </div>

          <div
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="min-h-[200px] p-4 sm:p-5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col justify-center items-center text-center cursor-pointer select-none space-y-3 hover:border-blue-500/30 transition-all"
          >
            {!isCardFlipped ? (
              <div className="space-y-2 max-w-2xl">
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Interview Question</span>
                <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] leading-snug">
                  {currentStudyCard.question}
                </h3>
                <p className="text-[11px] text-[var(--muted-foreground)] pt-2">Click card or spacebar to reveal architect answer</p>
              </div>
            ) : (
              <div className="space-y-2 max-w-3xl text-left w-full max-h-[360px] overflow-y-auto pr-2">
                <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} /> Architect Solution
                </span>
                <AnswerRenderer text={currentStudyCard.answer} compact />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setIsCardFlipped(false);
                setStudyIndex((i) => (i === 0 ? filteredQuestions.length - 1 : i - 1));
              }}
              className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => {
                setIsCardFlipped(false);
                setStudyIndex((i) => (i + 1) % filteredQuestions.length);
              }}
              className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* VIRTUALIZED QUESTIONS STREAM */}
      {!isStudyMode && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
            <span>
              Showing <strong className="text-[var(--foreground)]">{filteredQuestions.length.toLocaleString()}</strong> matching questions
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffle}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                  isShuffled ? "bg-blue-600 text-white border-blue-500" : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--foreground)]"
                )}
              >
                <Shuffle size={12} />
                <span>{isShuffled ? "Reshuffle" : "Shuffle"}</span>
              </button>
              {isShuffled && (
                <button onClick={handleResetOrder} className="text-xs underline text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer">
                  Reset
                </button>
              )}
            </div>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-8">
              <Layers size={36} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-40" />
              <h3 className="text-sm font-semibold text-[var(--foreground)]">No matching questions</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Try another keyword or filter criteria.</p>
            </div>
          ) : (
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const q = filteredQuestions[virtualRow.index];
                if (!q) return null;
                const isExpanded = expandedIds.has(q.id);
                const isBookmarked = bookmarks.includes(q.id);
                const diffStyle = difficultyColors[q.difficulty] || difficultyColors.MEDIUM;

                return (
                  <div
                    key={q.id}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="pb-3"
                  >
                    <div
                      id={`question-${q.id}`}
                      className={cn(
                        "rounded-xl border transition-all duration-200 overflow-hidden bg-[var(--surface-1)]",
                        isExpanded ? "border-blue-500/40 shadow-xs" : "border-[var(--border)] hover:border-[var(--border-hover)]"
                      )}
                    >
                      <div
                        onClick={() => toggleExpand(q.id)}
                        className="p-3 sm:p-3.5 cursor-pointer select-none space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
                                {q.category || "Data Engineering"}
                              </span>
                              {q.niche && (
                                <span className="text-[9px] text-[var(--muted-foreground)] font-mono">
                                  · {q.niche}
                                </span>
                              )}
                              <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded border", diffStyle.bg, diffStyle.text, diffStyle.border)}>
                                {q.difficulty}
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-[15px] font-bold text-[var(--foreground)] leading-snug">
                              {q.question}
                            </h3>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => toggleBookmark(q.id, e)}
                              className={cn(
                                "p-1.5 rounded-lg border transition-colors cursor-pointer",
                                isBookmarked
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                  : "bg-[var(--surface-2)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)]"
                              )}
                              title={isBookmarked ? "Bookmarked" : "Bookmark"}
                            >
                              {isBookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => copyToClipboard(q.question, q.id, e)}
                              className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                              title="Copy Question"
                            >
                              {copiedId === q.id ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                            </button>
                            <span className="p-1 text-[var(--muted-foreground)]">
                              <ChevronDown size={15} className={cn("transition-transform duration-200", isExpanded && "rotate-180")} />
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Answer */}
                      {isExpanded && (
                        <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-1 border-t border-[var(--border)]/60 bg-[var(--surface-2)]/30 space-y-2">
                          <div className="pt-1 text-xs sm:text-[13px] text-[var(--foreground)] leading-relaxed">
                            <AnswerRenderer text={q.answer} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
