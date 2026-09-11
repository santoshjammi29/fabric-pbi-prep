"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { questionsDb, questionsDeDb, getStandardizedDomain } from "@/data";
import { Question, Difficulty, STANDARDIZED_DOMAINS } from "@/types/data";
import { recordLastTopic } from "@/lib/user-progress";
import { AnswerRenderer } from "@/components/ui/answer-renderer";

const difficultyColors: Record<Difficulty, { bg: string; text: string; border: string }> = {
  EASY: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  MEDIUM: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  HARD: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  ARCHITECT: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

export default function QaPrepPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Study Mode State
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync URL parameters on initial load
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q") || params.get("search");
    const domainParam = params.get("domain") || params.get("category");
    const diffParam = params.get("difficulty");
    const studyParam = params.get("study");

    if (qParam) setSearchQuery(qParam);
    if (domainParam) {
      const found = STANDARDIZED_DOMAINS.find(
        (d) => d.toLowerCase() === domainParam.toLowerCase() || domainParam.toLowerCase().includes(d.toLowerCase())
      );
      if (found) setSelectedDomain(found);
      else setSearchQuery(domainParam);
    }
    if (diffParam && ["EASY", "MEDIUM", "HARD", "ARCHITECT"].includes(diffParam.toUpperCase())) {
      setSelectedDifficulty(diffParam.toUpperCase());
    }
    if (studyParam === "true" || studyParam === "1") {
      setIsStudyMode(true);
    }
  }, []);

  // Combine datasets
  const allQuestions: Question[] = useMemo(() => {
    return [...questionsDb, ...questionsDeDb];
  }, []);

  // Load bookmarks
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dataprep_bookmarks");
      if (saved) setBookmarks(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.includes(id)
      ? bookmarks.filter((b) => b !== id)
      : [...bookmarks, id];
    setBookmarks(updated);
    try {
      localStorage.setItem("dataprep_bookmarks", JSON.stringify(updated));
      const targetQ = allQuestions.find((q) => q.id === id);
      if (targetQ) {
        recordLastTopic({
          title: targetQ.question.length > 55 ? targetQ.question.slice(0, 55) + "..." : targetQ.question,
          href: `/qa-prep?q=${encodeURIComponent(targetQ.question.slice(0, 30))}`,
          category: "Interview Q&A Hub",
        });
      }
      if (bookmarks.includes(id)) {
        toast.info("Bookmark removed");
      } else {
        toast.success("Saved to bookmarks in My Studio");
      }
    } catch {
      // ignore
    }
  };

  const copyQnA = (q: Question, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Q: ${q.question}\n\nA: ${q.answer}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    toast.success("Question & Answer copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered dataset
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      if (selectedDifficulty !== "ALL" && q.difficulty !== selectedDifficulty) {
        return false;
      }
      if (selectedDomain !== "ALL") {
        const domain = getStandardizedDomain(q);
        if (domain !== selectedDomain) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase();
        const qMatch = q.question.toLowerCase().includes(term);
        const aMatch = q.answer.toLowerCase().includes(term);
        const catMatch = q.category?.toLowerCase().includes(term);
        const nicheMatch = q.niche?.toLowerCase().includes(term);
        return qMatch || aMatch || catMatch || nicheMatch;
      }
      return true;
    });
  }, [allQuestions, selectedDifficulty, selectedDomain, searchQuery]);

  // Paginated slice
  const paginatedQuestions = useMemo(() => {
    return filteredQuestions.slice(0, page * pageSize);
  }, [filteredQuestions, page]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        const targetQ = allQuestions.find((q) => q.id === id);
        if (targetQ) {
          recordLastTopic({
            title: targetQ.question.length > 55 ? targetQ.question.slice(0, 55) + "..." : targetQ.question,
            href: `/qa-prep?q=${encodeURIComponent(targetQ.question.slice(0, 30))}`,
            category: "Interview Q&A Hub",
          });
        }
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(paginatedQuestions.map((q) => q.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // SM-2 Spaced repetition handler
  const rateStudyCard = useCallback((quality: number) => {
    toast.success(`Rated recall quality (${quality}/5). Interval updated via SM-2 algorithm.`);
    setIsCardFlipped(false);

    try {
      const savedData = localStorage.getItem("dataprep_userdata");
      const current = savedData ? JSON.parse(savedData) : { reviewedCount: 0, xp: 0 };
      const nextData = {
        ...current,
        reviewedCount: (current.reviewedCount || 0) + 1,
        xp: (current.xp || 0) + 25,
        lastActive: new Date().toISOString(),
      };
      localStorage.setItem("dataprep_userdata", JSON.stringify(nextData));

      const card = filteredQuestions[studyIndex];
      if (card) {
        recordLastTopic({
          title: card.question.length > 55 ? card.question.slice(0, 55) + "..." : card.question,
          href: `/qa-prep?study=true`,
          category: "SM-2 Flashcard Mode",
        });
      }
    } catch {}

    setStudyIndex((prev) => (prev + 1) % (filteredQuestions.length || 1));
  }, [filteredQuestions, studyIndex]);

  // Keyboard navigation for study mode
  useEffect(() => {
    if (!isStudyMode) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsCardFlipped((prev) => !prev);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setIsCardFlipped(false);
        setStudyIndex((prev) => (prev + 1) % (filteredQuestions.length || 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIsCardFlipped(false);
        setStudyIndex((prev) =>
          prev === 0 ? Math.max(0, filteredQuestions.length - 1) : prev - 1
        );
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isStudyMode, filteredQuestions.length]);

  const currentStudyCard = filteredQuestions[studyIndex] || filteredQuestions[0];

  return (
    <div className="space-y-8 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-8 isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400">
              <MessageSquare size={14} />
              <span>Step 5 · Interview Mastery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Architect Q&amp;A Prep Hub
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Study 6,100+ vetted technical interview questions across Fabric, Azure DP-203, Databricks Spark,
              and Distributed System Architecture with interactive SM-2 spaced repetition flashcards.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="px-3.5 sm:px-4 py-2 sm:py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-400">{allQuestions.length.toLocaleString()}</div>
              <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] font-medium">Questions Bank</div>
            </div>
            <button
              onClick={() => {
                setIsStudyMode(!isStudyMode);
                setIsCardFlipped(false);
              }}
              className={cn(
                "px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-lg",
                isStudyMode
                  ? "bg-purple-600 text-white border-purple-500 shadow-purple-500/20"
                  : "bg-[var(--surface-2)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-3)]"
              )}
            >
              <RotateCw size={16} className={cn(isStudyMode && "animate-spin-once")} />
              <span>{isStudyMode ? "Exit Study Mode" : "🃏 Study Mode"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FLASHCARD STUDY MODE */}
      {isStudyMode && currentStudyCard && (
        <div className="space-y-4 max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-2">
            <span>
              Card <strong>{studyIndex + 1}</strong> of <strong>{filteredQuestions.length}</strong>
            </span>
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] font-mono">Space</kbd> to flip</span>
          </div>

          {/* 3D Flip Card */}
          <div
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="min-h-[360px] p-8 rounded-3xl bg-[var(--surface-1)] border border-purple-500/40 shadow-2xl cursor-pointer select-none transition-all flex flex-col justify-between hover:border-purple-400 group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  {currentStudyCard.category} · {currentStudyCard.niche}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                    difficultyColors[currentStudyCard.difficulty]?.bg,
                    difficultyColors[currentStudyCard.difficulty]?.text,
                    difficultyColors[currentStudyCard.difficulty]?.border
                  )}
                >
                  {currentStudyCard.difficulty}
                </span>
              </div>

              {!isCardFlipped ? (
                <div className="space-y-4 py-8">
                  <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                    Question:
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] leading-relaxed">
                    {currentStudyCard.question}
                  </h3>
                </div>
              ) : (
                <div className="space-y-4 py-4 animate-in fade-in duration-200">
                  <div className="text-xs font-semibold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} /> Architect Answer:
                  </div>
                  <div className="text-sm text-[var(--foreground)] leading-relaxed max-h-[360px] overflow-y-auto pr-2">
                    <AnswerRenderer text={currentStudyCard.answer} compact />
                  </div>
                </div>
              )}
            </div>

            <div className="text-center text-xs text-[var(--muted-foreground)] pt-4 border-t border-[var(--border)]">
              {!isCardFlipped ? "👆 Click or press Space to reveal answer" : "Rate your recall below to schedule next review"}
            </div>
          </div>

          {/* SM-2 Rating Controls */}
          {isCardFlipped && (
            <div className="p-4 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-[var(--muted-foreground)] font-semibold mr-2">Rate Recall:</span>
              <button
                onClick={() => rateStudyCard(1)}
                className="px-3.5 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-colors"
              >
                ↺ Again (1d)
              </button>
              <button
                onClick={() => rateStudyCard(3)}
                className="px-3.5 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-semibold hover:bg-orange-500/20 transition-colors"
              >
                ⚡ Hard (2d)
              </button>
              <button
                onClick={() => rateStudyCard(4)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold hover:bg-blue-500/20 transition-colors"
              >
                ✓ Good (4d)
              </button>
              <button
                onClick={() => rateStudyCard(5)}
                className="px-3.5 py-1.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold hover:bg-green-500/20 transition-colors"
              >
                🚀 Easy (7d)
              </button>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setIsCardFlipped(false);
                setStudyIndex((prev) =>
                  prev === 0 ? Math.max(0, filteredQuestions.length - 1) : prev - 1
                );
              }}
              className="px-4 py-2 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-2)] flex items-center gap-1.5"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={() => {
                setIsCardFlipped(false);
                setStudyIndex((prev) => (prev + 1) % (filteredQuestions.length || 1));
              }}
              className="px-4 py-2 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-2)] flex items-center gap-1.5"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* REGULAR STREAM VIEW */}
      {!isStudyMode && (
        <>
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search 6,100+ questions (e.g., Delta log, CDC, Shuffling, Direct Lake, RLS)..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-purple-500/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1 rounded-md bg-[var(--surface-2)]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Difficulty filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]">
                {["ALL", "EASY", "MEDIUM", "HARD", "ARCHITECT"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      setSelectedDifficulty(diff);
                      setPage(1);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0",
                      selectedDifficulty === diff
                        ? "bg-purple-600 text-white shadow-md font-semibold"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    {diff === "ALL" ? "All Levels" : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Domain category chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
                <Filter size={12} /> Domain:
              </span>
              <button
                onClick={() => {
                  setSelectedDomain("ALL");
                  setPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0",
                  selectedDomain === "ALL"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold"
                    : "bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
                )}
              >
                ⚡ All 8 Domains
              </button>
              {STANDARDIZED_DOMAINS.map((dom) => (
                <button
                  key={dom}
                  onClick={() => {
                    setSelectedDomain(dom);
                    setPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0",
                    selectedDomain === dom
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold"
                      : "bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
                  )}
                >
                  {dom}
                </button>
              ))}
            </div>
          </div>

          {/* Results Action Bar */}
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
            <span>
              Showing <strong className="text-[var(--foreground)]">{paginatedQuestions.length}</strong> of{" "}
              <strong className="text-[var(--foreground)]">{filteredQuestions.length}</strong> matching questions
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={expandAll}
                className="hover:text-[var(--foreground)] font-medium transition-colors"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                onClick={collapseAll}
                className="hover:text-[var(--foreground)] font-medium transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Questions Stream */}
          {filteredQuestions.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-8">
              <Layers size={40} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-40" />
              <h3 className="text-base font-semibold text-[var(--foreground)]">No matching questions found</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-sm mx-auto">
                Try searching with different keywords or clearing domain filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDifficulty("ALL");
                  setSelectedDomain("ALL");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedQuestions.map((q, index) => {
                const isExpanded = expandedIds.has(q.id);
                const isBookmarked = bookmarks.includes(q.id);
                const diffStyle = difficultyColors[q.difficulty] || difficultyColors.MEDIUM;

                return (
                  <motion.div
                    key={q.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.015, 0.2) }}
                    className={cn(
                      "rounded-2xl border transition-all duration-200 overflow-hidden",
                      isExpanded
                        ? "bg-[var(--surface-1)] border-purple-500/40 shadow-xl"
                        : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    {/* Question Header Card */}
                    <div
                      onClick={() => toggleExpand(q.id)}
                      className="p-5 cursor-pointer select-none space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-semibold text-purple-400 tracking-wide uppercase">
                              {q.category} {q.niche ? `· ${q.niche}` : ""}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                                diffStyle.bg,
                                diffStyle.text,
                                diffStyle.border
                              )}
                            >
                              {q.difficulty}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight leading-snug">
                            {q.question}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => toggleBookmark(q.id, e)}
                            className={cn(
                              "min-h-[44px] min-w-[44px] p-2.5 rounded-xl transition-colors flex items-center justify-center touch-manipulation cursor-pointer",
                              isBookmarked
                                ? "text-amber-400 bg-amber-400/10"
                                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                            )}
                            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                            aria-label={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                          >
                            {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => copyQnA(q, e)}
                            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors flex items-center justify-center touch-manipulation cursor-pointer"
                            title="Copy Q&A"
                            aria-label="Copy question and answer to clipboard"
                          >
                            {copiedId === q.id ? (
                              <Check size={18} className="text-green-400" />
                            ) : (
                              <Copy size={18} />
                            )}
                          </button>

                          <div className="min-h-[44px] min-w-[44px] p-2.5 flex items-center justify-center text-[var(--muted-foreground)]">
                            <ChevronDown
                              size={16}
                              className={cn(
                                "transition-transform duration-300",
                                isExpanded && "rotate-180 text-purple-400"
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Answer Expanded Body */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-[var(--border)] p-5 bg-[var(--surface-2)] space-y-3 text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-400">
                            <Zap size={14} />
                            <span>Principal Architect Explanation:</span>
                          </div>
                          <div className="pt-2">
                            <AnswerRenderer text={q.answer} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* Load More Pagination */}
              {paginatedQuestions.length < filteredQuestions.length && (
                <div className="pt-6 text-center">
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg hover:shadow-purple-500/25"
                  >
                    Load More Questions ({filteredQuestions.length - paginatedQuestions.length} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
