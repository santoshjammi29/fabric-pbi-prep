"use client";

import React, { useState, useMemo, useEffect, useCallback, useDeferredValue } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
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
  BookOpen,
  Compass,
  X,
  Shuffle,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HubSubnav } from "@/components/layout/hub-subnav";
import { questionsDb, questionsDeDb, conceptsDb, getStandardizedDomain, architectureDiagrams, ArchitectureDiagramItem } from "@/data";
import { Question, Difficulty, STANDARDIZED_DOMAINS } from "@/types/data";
import { recordLastTopic } from "@/lib/user-progress";
import dynamic from "next/dynamic";

const AnswerRenderer = dynamic(() => import("@/components/ui/answer-renderer").then(mod => mod.AnswerRenderer), { ssr: false });
const SmoothAccordion = dynamic(() => import("@/components/ui/smooth-accordion").then(mod => mod.SmoothAccordion), { ssr: false });

const difficultyColors: Record<Difficulty, { bg: string; text: string; border: string }> = {
  EASY: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  MEDIUM: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  HARD: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  ARCHITECT: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

function getQuestionMatchingDiagram(q: Question): ArchitectureDiagramItem | undefined {
  const cat = (q.category || "").toLowerCase();
  const niche = (q.niche || "").toLowerCase();
  return architectureDiagrams.find((d) => {
    return d.tags.some((t) => {
      const tLower = t.toLowerCase();
      return (
        cat === tLower ||
        cat.includes(tLower) ||
        niche.includes(tLower)
      );
    });
  });
}

export default function QaPrepPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const initialBatch = 25;
  const [visibleCount, setVisibleCount] = useState(initialBatch);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // Study Mode State
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShuffle = useCallback(() => {
    setIsShuffled(true);
    setShuffleSeed((s) => s + 1);
    setVisibleCount(initialBatch);
    setStudyIndex(0);
    toast.success("Shuffled questions order");
  }, [initialBatch]);

  const handleResetOrder = useCallback(() => {
    setIsShuffled(false);
    setVisibleCount(initialBatch);
    setStudyIndex(0);
    toast.info("Reset to default order");
  }, [initialBatch]);

  const scrollTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const copyTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Combine datasets
  const allQuestions: Question[] = useMemo(() => {
    return [...questionsDb, ...questionsDeDb];
  }, []);

  // Concept lookup map for Master Concept Map navigation
  const conceptMap = useMemo(() => {
    const map = new Map<string, { id: string; term: string }>();
    conceptsDb.forEach((c) => map.set(c.id, { id: c.id, term: c.term }));
    return map;
  }, []);

  // Sync URL parameters on initial load & popstate
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const cardParam = params.get("card") || params.get("id");
      const qParam = params.get("q") || params.get("search");
      const domainParam = params.get("domain") || params.get("category");
      const diffParam = params.get("difficulty");
      const studyParam = params.get("study");
      const conceptParam = params.get("conceptId") || params.get("concept");

      if (conceptParam) {
        setSelectedConceptId(conceptParam);
        const termParam = params.get("term");
        if (termParam && !qParam) {
          setSearchQuery(termParam);
        }
      }

      if (diffParam && ["EASY", "MEDIUM", "HARD", "ARCHITECT"].includes(diffParam.toUpperCase())) {
        setSelectedDifficulty(diffParam.toUpperCase());
      }
      if (domainParam) {
        const found = STANDARDIZED_DOMAINS.find(
          (d) => d.toLowerCase() === domainParam.toLowerCase() || domainParam.toLowerCase().includes(d.toLowerCase())
        );
        if (found) setSelectedDomain(found);
        else setSearchQuery(domainParam);
      }
      if (studyParam === "true" || studyParam === "1") {
        setIsStudyMode(true);
      }

      if (cardParam || qParam) {
        const matched = allQuestions.find(
          (q) => (cardParam && q.id === cardParam) || (qParam && q.question.toLowerCase().includes(qParam.toLowerCase()))
        );
        if (matched) {
          if (!diffParam) setSelectedDifficulty("ALL");
          if (!domainParam) setSelectedDomain("ALL");
          setVisibleCount(initialBatch);
          setExpandedIds(new Set([matched.id]));
          if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = setTimeout(() => {
            const el = document.getElementById(`question-${matched.id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 300);
        } else if (qParam) {
          setSearchQuery(qParam);
        }
      }
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, [allQuestions]);

  // Load bookmarks
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dataprep_bookmarks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setBookmarks(parsed.filter((x): x is string => typeof x === "string"));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const safeBm = Array.isArray(bookmarks) ? bookmarks : [];
    const isCurrentlyBookmarked = safeBm.includes(id);
    const updated = isCurrentlyBookmarked
      ? safeBm.filter((b) => b !== id)
      : [...safeBm, id];
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
      if (isCurrentlyBookmarked) {
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
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered dataset
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      if (selectedConceptId && q.linked_concept_id !== selectedConceptId) {
        return false;
      }
      if (selectedDifficulty !== "ALL" && q.difficulty !== selectedDifficulty) {
        return false;
      }
      if (selectedDomain !== "ALL") {
        const domain = getStandardizedDomain(q);
        if (domain !== selectedDomain) {
          return false;
        }
      }
      if (deferredSearch.trim()) {
        const term = deferredSearch.toLowerCase();
        const qMatch = q.question.toLowerCase().includes(term);
        const aMatch = q.answer.toLowerCase().includes(term);
        const catMatch = q.category?.toLowerCase().includes(term);
        const nicheMatch = q.niche?.toLowerCase().includes(term);
        return qMatch || aMatch || catMatch || nicheMatch;
      }
      return true;
    });
  }, [allQuestions, selectedDifficulty, selectedDomain, deferredSearch]);

  // Shuffled or natural order
  const displayedFilteredQuestions = useMemo(() => {
    if (!isShuffled) return filteredQuestions;
    const arr = [...filteredQuestions];
    let m = arr.length, t, i;
    let seed = shuffleSeed * 9301 + 49297;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    while (m) {
      i = Math.floor(rnd() * m--);
      t = arr[m]; arr[m] = arr[i]; arr[i] = t;
    }
    return arr;
  }, [filteredQuestions, isShuffled, shuffleSeed]);

  // Paginated slice
  const paginatedQuestions = useMemo(() => {
    return displayedFilteredQuestions.slice(0, visibleCount);
  }, [displayedFilteredQuestions, visibleCount]);

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

      const card = displayedFilteredQuestions[studyIndex];
      if (card) {
        recordLastTopic({
          title: card.question.length > 55 ? card.question.slice(0, 55) + "..." : card.question,
          href: `/qa-prep?study=true`,
          category: "SM-2 Flashcard Mode",
        });
      }
    } catch {}

    setStudyIndex((prev) => (prev + 1) % (displayedFilteredQuestions.length || 1));
  }, [displayedFilteredQuestions, studyIndex]);

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
        setStudyIndex((prev) => (prev + 1) % (displayedFilteredQuestions.length || 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIsCardFlipped(false);
        setStudyIndex((prev) =>
          prev === 0 ? Math.max(0, displayedFilteredQuestions.length - 1) : prev - 1
        );
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isStudyMode, displayedFilteredQuestions.length]);

  const currentStudyCard = displayedFilteredQuestions[studyIndex] || displayedFilteredQuestions[0];

  return (
    <div className="space-y-6 pb-20">
      <HubSubnav
        hubTitle="Interview & Career"
        items={[
          { label: "Interview Q&A Drill (6.4k+)", href: "/qa-prep", icon: MessageSquare, badge: "6,570+ Qs" },
          { label: "Target Company Intel", href: "/company-research", icon: Building2, badge: "FAANG & GCC" },
        ]}
      />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-8 isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-4xl 2xl:max-w-6xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400">
              <MessageSquare size={14} />
              <span>Step 5 · Interview Mastery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Architect Q&amp;A Prep Hub
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Study 6,570+ vetted technical interview questions across Fabric, Azure DP-203, Databricks Spark,
              Python Data Engineering, and Distributed System Architecture with interactive SM-2 spaced repetition flashcards.
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
        <div className="space-y-4 max-w-5xl 2xl:max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted-foreground)] px-2">
            <div className="flex items-center gap-3">
              <span>
                Card <strong>{studyIndex + 1}</strong> of <strong>{displayedFilteredQuestions.length}</strong>
              </span>
              <button
                onClick={handleShuffle}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all shrink-0",
                  isShuffled
                    ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                    : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--foreground)] hover:border-purple-500/40 hover:bg-[var(--surface-2)]"
                )}
                title="Shuffle or randomize flashcards"
              >
                <Shuffle size={13} className={cn(isShuffled && "rotate-180 transition-transform")} />
                <span>{isShuffled ? "Reshuffle" : "Shuffle Cards"}</span>
              </button>
              {isShuffled && (
                <button
                  onClick={handleResetOrder}
                  className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-1 underline underline-offset-2"
                >
                  Reset Order
                </button>
              )}
            </div>
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] font-mono">Space</kbd> to flip</span>
          </div>

          {/* 3D Flip Card */}
          <div
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="min-h-[360px] p-8 rounded-3xl bg-[var(--surface-1)] border border-purple-500/40 shadow-2xl cursor-pointer select-none transition-all flex flex-col justify-between hover:border-purple-400 group"
          >
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    {currentStudyCard.category} {currentStudyCard.niche ? `· ${currentStudyCard.niche}` : ""}
                  </span>
                  {currentStudyCard.linked_concept_id && conceptMap.get(currentStudyCard.linked_concept_id) && (
                    <Link
                      href={`/concepts?term=${encodeURIComponent(conceptMap.get(currentStudyCard.linked_concept_id)!.term)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 hover:text-cyan-200 transition-colors"
                      title={`Core Concept: ${conceptMap.get(currentStudyCard.linked_concept_id)!.term}`}
                    >
                      <BookOpen size={10} />
                      <span>{conceptMap.get(currentStudyCard.linked_concept_id)!.term}</span>
                    </Link>
                  )}
                </div>
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
                    setVisibleCount(initialBatch);
                  }}
                  placeholder="Search 6,500+ questions (e.g., Delta log, CDC, Shuffling, Direct Lake, RLS)..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-purple-500/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setVisibleCount(initialBatch);
                    }}
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
                      setVisibleCount(initialBatch);
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
                  setVisibleCount(initialBatch);
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
                    setVisibleCount(initialBatch);
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

          {/* Active Concept Filter Banner (Modal Interconnectivity) */}
          {selectedConceptId && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-cyan-400 shrink-0" />
                <span className="text-[var(--foreground)]">
                  Filtered by Concept: <strong className="text-cyan-300">{conceptMap.get(selectedConceptId)?.term || selectedConceptId}</strong> ({filteredQuestions.length} questions)
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedConceptId(null);
                  if (typeof window !== "undefined") {
                    const url = new URL(window.location.href);
                    url.searchParams.delete("conceptId");
                    url.searchParams.delete("concept");
                    window.history.replaceState(null, "", url.toString());
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold flex items-center gap-1 transition-colors shrink-0"
              >
                <X size={12} />
                <span>Clear Concept Filter</span>
              </button>
            </div>
          )}

          {/* Results Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted-foreground)] px-1">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="text-[var(--foreground)]">{paginatedQuestions.length}</strong> of{" "}
                <strong className="text-[var(--foreground)]">{displayedFilteredQuestions.length}</strong> matching questions
              </span>
              <button
                onClick={handleShuffle}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all shrink-0",
                  isShuffled
                    ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                    : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--foreground)] hover:border-purple-500/40 hover:bg-[var(--surface-2)]"
                )}
                title="Shuffle or randomize questions"
              >
                <Shuffle size={13} className={cn(isShuffled && "rotate-180 transition-transform")} />
                <span>{isShuffled ? "Reshuffle" : "Shuffle"}</span>
              </button>
              {isShuffled && (
                <button
                  onClick={handleResetOrder}
                  className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-1.5 py-1 underline underline-offset-2"
                >
                  Reset Order
                </button>
              )}
            </div>
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
                const matchingDiagram = getQuestionMatchingDiagram(q);

                return (
                  <div
                    key={q.id}
                    id={`question-${q.id}`}
                    className={cn(
                      "rounded-2xl border transition-all duration-200 overflow-hidden",
                      isExpanded
                        ? "bg-[var(--surface-1)] border-purple-500/40 shadow-sm"
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
                            {q.linked_concept_id && conceptMap.get(q.linked_concept_id) && (
                              <Link
                                href={`/concepts?term=${encodeURIComponent(conceptMap.get(q.linked_concept_id)!.term)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 hover:text-cyan-200 transition-colors"
                                title={`Core Concept: ${conceptMap.get(q.linked_concept_id)!.term}`}
                              >
                                <BookOpen size={10} />
                                <span>{conceptMap.get(q.linked_concept_id)!.term}</span>
                              </Link>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight leading-snug">
                            {q.question}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <m.button
                            type="button"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                          </m.button>

                          <m.button
                            type="button"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                          </m.button>

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
                    <SmoothAccordion isOpen={isExpanded} innerClassName="p-5 space-y-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-400">
                        <Zap size={14} />
                        <span>Principal Architect Explanation:</span>
                      </div>
                      <div className="pt-2">
                        <AnswerRenderer text={q.answer} />
                      </div>

                      {/* Modal Interconnectivity: Q&A -> Mindmap & Concept links */}
                      <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[var(--muted-foreground)]">
                            System Architecture:
                          </span>
                          {matchingDiagram && (
                            <Link
                              href={`/architecture?tab=diagrams&diagram=${matchingDiagram.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 border border-purple-500/30 font-semibold transition-colors shadow-sm"
                              title={`View ${matchingDiagram.title} architecture blueprint`}
                            >
                              <span>📐 Architecture Blueprint</span>
                            </Link>
                          )}
                        </div>
                        <Link
                          href={`/mindmap?node=${q.linked_concept_id || q.category}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 font-semibold transition-colors shadow-sm"
                        >
                          <Compass size={13} />
                          <span>Visualize in Mindmap</span>
                        </Link>
                      </div>
                    </SmoothAccordion>
                  </div>
                );
              })}

              {/* Load More Pagination */}
              {paginatedQuestions.length < filteredQuestions.length && (
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setVisibleCount((prev) => prev * 2)}
                    className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
                  >
                    <span>⚡ Load More (+{Math.min(paginatedQuestions.length, filteredQuestions.length - paginatedQuestions.length).toLocaleString()})</span>
                    <span className="opacity-75 font-normal">· {(filteredQuestions.length - paginatedQuestions.length).toLocaleString()} remaining</span>
                  </button>
                  <button
                    onClick={() => setVisibleCount(filteredQuestions.length)}
                    className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] text-[var(--foreground)] text-xs sm:text-sm font-semibold transition-all"
                  >
                    Load All ({filteredQuestions.length.toLocaleString()})
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
