"use client";

import React, { useState, useEffect, useMemo, useDeferredValue, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
  Search,
  ExternalLink,
  CheckCircle2,
  Circle,
  GraduationCap,
  ChevronDown,
  Shuffle,
  RotateCcw,
  Sparkles,
  Clock,
  BookOpen,
  HelpCircle,
  Workflow,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  Compass,
  ArrowRight,
  Check,
  Share2,
  CheckCheck,
  BookMarked,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getTopicItems,
  getTopicCounts,
  getTopicDiagram,
  getTopicSummaryStats,
  getPlatformOverviewStats,
  LearningItem,
} from "@/lib/guided-learning";
import { GUIDED_TOPICS, GUIDED_DOMAINS } from "@/data/guided-learning-topics";
import { ArchitectureDiagramItem } from "@/data";
import { TopicIcon } from "@/components/ui/topic-icon";
import dynamic from "next/dynamic";

const AnswerRenderer = dynamic(
  () => import("@/components/ui/answer-renderer").then((mod) => mod.AnswerRenderer),
  { ssr: false }
);
const SmoothAccordion = dynamic(
  () => import("@/components/ui/smooth-accordion").then((mod) => mod.SmoothAccordion),
  { ssr: false }
);

const difficultyColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  EASY: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/10",
  },
  MEDIUM: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/10",
  },
  HARD: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
    glow: "shadow-orange-500/10",
  },
  ARCHITECT: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    glow: "shadow-purple-500/10",
  },
};

const typeColors: Record<string, { bg: string; text: string; border: string; icon: typeof BookOpen }> = {
  concept: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    icon: BookOpen,
  },
  qa: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    icon: HelpCircle,
  },
  architecture: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    icon: Workflow,
  },
};

const stages = [
  {
    id: "EASY",
    stageNum: 1,
    title: "Stage 1: Foundations",
    shortTitle: "Foundations",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    activeBg: "bg-emerald-500/10",
    badgeBg: "bg-emerald-500/15 text-emerald-300",
  },
  {
    id: "MEDIUM",
    stageNum: 2,
    title: "Stage 2: Core Engineering",
    shortTitle: "Core Skills",
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    activeBg: "bg-blue-500/10",
    badgeBg: "bg-blue-500/15 text-blue-300",
  },
  {
    id: "HARD",
    stageNum: 3,
    title: "Stage 3: Advanced Patterns",
    shortTitle: "Advanced",
    color: "text-orange-400",
    borderColor: "border-orange-500/30",
    activeBg: "bg-orange-500/10",
    badgeBg: "bg-orange-500/15 text-orange-300",
  },
  {
    id: "ARCHITECT",
    stageNum: 4,
    title: "Stage 4: Staff & Architect",
    shortTitle: "Architect",
    color: "text-purple-400",
    borderColor: "border-purple-500/30",
    activeBg: "bg-purple-500/10",
    badgeBg: "bg-purple-500/15 text-purple-300",
  },
] as const;

function GuidedLearningContent() {
  const searchParams = useSearchParams();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>("All Tracks");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "TODO" | "MASTERED">("ALL");
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isReadAllMode, setIsReadAllMode] = useState(false);
  const [collapsedInReadMode, setCollapsedInReadMode] = useState<Set<string>>(new Set());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [pages, setPages] = useState<Record<string, number>>({});
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [activeDiagramModal, setActiveDiagramModal] = useState<ArchitectureDiagramItem | null>(null);
  const [diagramZoom, setDiagramZoom] = useState(1);

  const pageSize = 15;

  // Reactively sync from URL search params whenever ?topic= changes
  useEffect(() => {
    const topicParam = searchParams.get("topic");
    if (topicParam && GUIDED_TOPICS.some((t) => t.key === topicParam)) {
      setSelectedTopic((prev) => (prev !== topicParam ? topicParam : prev));
    } else if (!topicParam) {
      setSelectedTopic(null);
    }
  }, [searchParams]);

  // Sync state and push browser history when topic changes
  useEffect(() => {
    if (selectedTopic) {
      const currentUrlTopic = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("topic") : null;
      if (currentUrlTopic !== selectedTopic && typeof window !== "undefined") {
        window.history.pushState(null, "", `?topic=${selectedTopic}`);
      }
      try {
        const saved = localStorage.getItem(`gl-completed-${selectedTopic}`);
        if (saved) {
          setCompletedIds(new Set(JSON.parse(saved)));
        } else {
          setCompletedIds(new Set());
        }
      } catch {
        setCompletedIds(new Set());
      }
      setPages({});
      setSearchQuery("");
      setSelectedType("ALL");
      setSelectedDifficulty("ALL");
      setSelectedStatus("ALL");
      setStageFilter("ALL");
      setExpandedIds(new Set());
      setIsReadAllMode(false);
      setCollapsedInReadMode(new Set());
      setIsShuffled(false);
      setCollapsedStages({});
    } else if (typeof window !== "undefined") {
      const currentUrlTopic = new URLSearchParams(window.location.search).get("topic");
      if (currentUrlTopic) {
        window.history.pushState(null, "", window.location.pathname);
      }
    }
  }, [selectedTopic]);

  // Listen to browser popstate for back/forward navigation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const top = params.get("topic");
      if (top && GUIDED_TOPICS.some((t) => t.key === top)) {
        setSelectedTopic(top);
      } else {
        setSelectedTopic(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const activeTopicObj = useMemo(
    () => GUIDED_TOPICS.find((t) => t.key === selectedTopic),
    [selectedTopic]
  );

  const rawItems = useMemo(
    () => (selectedTopic ? getTopicItems(selectedTopic) : []),
    [selectedTopic]
  );

  const topicSummary = useMemo(
    () => (selectedTopic ? getTopicSummaryStats(selectedTopic) : null),
    [selectedTopic]
  );

  const featuredDiagram = useMemo(
    () => (selectedTopic ? getTopicDiagram(selectedTopic) : undefined),
    [selectedTopic]
  );

  const overviewStats = useMemo(() => getPlatformOverviewStats(), []);

  // Filter items based on user criteria
  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      if (selectedType !== "ALL" && item.type !== selectedType) return false;
      if (selectedDifficulty !== "ALL" && item.difficulty !== selectedDifficulty) return false;
      if (stageFilter !== "ALL" && item.difficulty !== stageFilter) return false;

      const isCompleted = completedIds.has(item.id);
      if (selectedStatus === "TODO" && isCompleted) return false;
      if (selectedStatus === "MASTERED" && !isCompleted) return false;

      if (deferredSearch.trim()) {
        const term = deferredSearch.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(term);
        const matchesBody = item.body.toLowerCase().includes(term);
        const matchesNiche = item.niche ? item.niche.toLowerCase().includes(term) : false;
        return matchesTitle || matchesBody || matchesNiche;
      }
      return true;
    });
  }, [rawItems, selectedType, selectedDifficulty, stageFilter, selectedStatus, deferredSearch, completedIds]);

  // Group items by 4 stages with optional deterministic shuffle
  const itemsByStage = useMemo(() => {
    const grouped: Record<string, LearningItem[]> = {
      EASY: [],
      MEDIUM: [],
      HARD: [],
      ARCHITECT: [],
    };
    filteredItems.forEach((item) => {
      if (grouped[item.difficulty]) {
        grouped[item.difficulty].push(item);
      }
    });

    if (isShuffled) {
      Object.keys(grouped).forEach((stage) => {
        const arr = [...grouped[stage]];
        let mLen = arr.length,
          t,
          i;
        let seed = (shuffleSeed + stage.charCodeAt(0)) * 9301 + 49297;
        const rnd = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };
        while (mLen) {
          i = Math.floor(rnd() * mLen--);
          t = arr[mLen];
          arr[mLen] = arr[i];
          arr[i] = t;
        }
        grouped[stage] = arr;
      });
    }
    return grouped;
  }, [filteredItems, isShuffled, shuffleSeed]);

  // Completion toggle handlers
  const toggleComplete = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!selectedTopic) return;
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          toast.info("Marked as incomplete");
        } else {
          next.add(id);
          toast.success("Mastered!");
        }
        localStorage.setItem(`gl-completed-${selectedTopic}`, JSON.stringify(Array.from(next)));
        return next;
      });
    },
    [selectedTopic]
  );

  const handleExpandAll = useCallback(() => {
    setIsReadAllMode(true);
    setCollapsedInReadMode(new Set());
    setExpandedIds(new Set(filteredItems.map((i) => i.id)));
    toast.success(`Read All Mode: All ${filteredItems.length} milestone cards expanded`);
  }, [filteredItems]);

  const handleCollapseAll = useCallback(() => {
    setIsReadAllMode(false);
    setExpandedIds(new Set());
    setCollapsedInReadMode(new Set());
    toast.info("Collapsed all milestone cards");
  }, []);

  const toggleReadAllMode = useCallback(() => {
    if (!isReadAllMode) {
      handleExpandAll();
    } else {
      handleCollapseAll();
    }
  }, [isReadAllMode, handleExpandAll, handleCollapseAll]);

  // Global keyboard shortcut: Shift + E to toggle Read All mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if (e.shiftKey && (e.key === "E" || e.key === "e")) {
        e.preventDefault();
        toggleReadAllMode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleReadAllMode]);

  const toggleExpand = useCallback((id: string) => {
    if (isReadAllMode) {
      setCollapsedInReadMode((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  }, [isReadAllMode]);

  const markStageAllDone = useCallback(
    (stageKey: string) => {
      if (!selectedTopic) return;
      const stageItems = itemsByStage[stageKey] || [];
      if (stageItems.length === 0) return;

      setCompletedIds((prev) => {
        const next = new Set(prev);
        stageItems.forEach((i) => next.add(i.id));
        localStorage.setItem(`gl-completed-${selectedTopic}`, JSON.stringify(Array.from(next)));
        return next;
      });
      toast.success(`Completed all ${stageItems.length} items in Stage!`);
    },
    [selectedTopic, itemsByStage]
  );

  const resetTrackProgress = useCallback(() => {
    if (!selectedTopic) return;
    setCompletedIds(new Set());
    localStorage.removeItem(`gl-completed-${selectedTopic}`);
    toast.info("Progress reset for this track");
  }, [selectedTopic]);

  const copyShareLink = useCallback(() => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    toast.success("Curriculum link copied to clipboard!");
  }, []);

  const toggleStageCollapse = useCallback((stageId: string) => {
    setCollapsedStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  }, []);

  // Filter topics for the domain selector
  const visibleTopics = useMemo(() => {
    if (selectedDomain === "All Tracks") return GUIDED_TOPICS;
    return GUIDED_TOPICS.filter((t) => t.domain === selectedDomain);
  }, [selectedDomain]);

  // Overall completion metrics for active topic
  const totalItemsCount = rawItems.length;
  const completedCount = completedIds.size;
  const pctComplete = totalItemsCount > 0 ? Math.round((completedCount / totalItemsCount) * 100) : 0;
  const estHours = Math.round((totalItemsCount * 2) / 60);

  return (
    <div className="space-y-4 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      {/* ── TOP BANNER & TRACK MATRIX ─────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3 sm:p-4 shadow-xs isolate">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-400">
              <GraduationCap size={12} className="text-purple-400" />
              <span className="uppercase tracking-wider font-mono">Senior DE Learning Tracks</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2 break-words">
              Guided Learning Journeys
              <span className="text-[10px] font-normal text-[var(--muted-foreground)] px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] hidden sm:inline">
                {overviewStats.totalTopics} Tracks · {overviewStats.totalUniqueItems}+ Problems
              </span>
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] max-w-3xl leading-relaxed break-words">
              End-to-end engineered career tracks across distributed engines, lakehouses, orchestration, and enterprise modeling. Built for senior and staff data platform interviews.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedTopic ? (
              <button
                onClick={() => setSelectedTopic(null)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-semibold text-[var(--foreground)] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Compass size={13} />
                <span>Browse All 13 Tracks</span>
              </button>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-right">
                  <div className="text-xs font-bold text-purple-400">13 Tracks</div>
                  <div className="text-[10px] text-[var(--muted-foreground)] font-mono leading-none">4 Stages Each</div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-right">
                  <div className="text-xs font-bold text-blue-400">25+ Blueprints</div>
                  <div className="text-[10px] text-[var(--muted-foreground)] font-mono leading-none">Whiteboard HD</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Domain Filter Pills - Styled after media_1792228927376_5ece2e88.png */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] overflow-x-auto scrollbar-none max-w-fit shadow-xs mb-2.5">
          {GUIDED_DOMAINS.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={cn(
                "px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 shrink-0 cursor-pointer whitespace-nowrap",
                selectedDomain === dom
                  ? "bg-blue-600 text-white font-semibold shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              {dom}
            </button>
          ))}
        </div>

        {/* Tracks Grid: Clean, compact 5-column grid with authentic tech vector icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {visibleTopics.map((topic) => {
            const isActive = selectedTopic === topic.key;
            const counts = getTopicCounts(topic.key);
            let localDone = 0;
            try {
              if (typeof window !== "undefined") {
                const s = localStorage.getItem(`gl-completed-${topic.key}`);
                if (s) localDone = JSON.parse(s).length;
              }
            } catch {
              localDone = 0;
            }
            const trackPct = counts.total > 0 ? Math.round((localDone / counts.total) * 100) : 0;

            return (
              <button
                key={topic.key}
                onClick={() => setSelectedTopic(topic.key)}
                className={cn(
                  "p-2 rounded-xl border text-left transition-all duration-150 relative group flex items-center gap-2.5 overflow-hidden",
                  isActive
                    ? "bg-[var(--surface-2)] border-purple-500 ring-1 ring-purple-500/40 shadow-xs"
                    : "bg-[var(--surface-1)] border-[var(--border)] hover:border-purple-500/30 hover:bg-[var(--surface-2)]/80"
                )}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[var(--surface-2)] border border-[var(--border)] group-hover:border-purple-500/30 group-hover:bg-purple-500/5 transition-all shadow-xs">
                  <TopicIcon topicKey={topic.key} size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors leading-tight truncate">
                    {topic.label}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)] font-mono leading-none pt-0.5">
                    <span>{counts.total} items</span>
                    <span>•</span>
                    <span className="truncate max-w-[105px]">{topic.domain}</span>
                  </div>
                </div>
                {trackPct > 0 ? (
                  <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-md shrink-0 ml-auto">
                    {trackPct}%
                  </span>
                ) : isActive ? (
                  <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0 ml-auto animate-pulse" />
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!selectedTopic ? (
          /* ── CATALOG / OVERVIEW HUB STATE ────────────────────────── */
          <m.div
            key="catalog-home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-3.5"
          >
            {/* Featured Journey Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-orange-500/40 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wide">
                      Compute & Engine Deep Dive
                    </span>
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{getTopicSummaryStats("spark").total.toLocaleString()} items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0">
                      <TopicIcon topicKey="spark" size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--foreground)]">Apache Spark & Databricks Track</h3>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
                    Master Tungsten off-heap memory, Catalyst physical query plans, Adaptive Query Execution (AQE), Liquid Clustering, and Photon vectorization.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTopic("spark")}
                  className="w-full py-1.5 px-3 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-semibold flex items-center justify-between border border-orange-500/30 transition-colors"
                >
                  <span>Launch Spark Track</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wide">
                      Orchestration & Transformation
                    </span>
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{getTopicSummaryStats("airflow").total.toLocaleString()} items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0">
                      <TopicIcon topicKey="airflow" size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--foreground)]">Airflow & dbt Engineering Track</h3>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
                    Construct production DAGs with TaskFlow, Celery/K8s executors, async Triggerers, incremental merge models, and dbt Mesh governance.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTopic("airflow")}
                  className="w-full py-1.5 px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold flex items-center justify-between border border-sky-500/30 transition-colors"
                >
                  <span>Launch Airflow Track</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wide">
                      Enterprise SaaS Lakehouse
                    </span>
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{getTopicSummaryStats("fabric").total.toLocaleString()} items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0">
                      <TopicIcon topicKey="fabric" size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--foreground)]">Microsoft Fabric & OneLake Track</h3>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
                    Explore OneLake zero-copy shortcuts, universal Delta Parquet storage, Direct Lake VertiPaq memory mapping, and cross-workspace governance.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTopic("fabric")}
                  className="w-full py-1.5 px-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-semibold flex items-center justify-between border border-purple-500/30 transition-colors"
                >
                  <span>Launch Fabric Track</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Platform Whiteboard Showcase Banner */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
                    <Sparkles size={12} />
                    <span>Integrated System Design Blueprints</span>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                    Whiteboard System Architecture Blueprints
                  </h2>
                </div>
                <Link
                  href="/architecture?tab=diagrams"
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors self-start sm:self-auto"
                >
                  <span>Explore all {overviewStats.totalWhiteboards} Blueprints</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: "system-design", title: "Distributed Resilient System", desc: "API Gateway, Token Bucket, Redis cluster, SAGA & Sharding." },
                  { key: "python", title: "Python Arrow & Polars SIMD", desc: "Columnar memory, release GIL, PyArrow Flight zero-copy IPC." },
                  { key: "spark", title: "Catalyst & Photon Execution", desc: "Logical plan optimization, AQE, and C++ vectorization." },
                  { key: "databricks", title: "Databricks Lakehouse & DABs", desc: "Medallion pipeline, Unity Catalog, and CI/CD Asset Bundles." },
                  { key: "fabric", title: "Fabric OneLake Architecture", desc: "Universal Delta Parquet, shortcuts, and multi-engine compute." },
                  { key: "streaming", title: "Kafka & Streaming Engine", desc: "Partition brokers, schema registry, and watermarking." },
                  { key: "dbt", title: "dbt Analytics Engineering", desc: "Incremental models, SCD2 snapshots, and Semantic Layer." },
                  { key: "modeling", title: "Kimball & Data Mesh", desc: "Enterprise star schema, conformed dimensions, and Data Products." },
                ].map((bp) => (
                  <div
                    key={bp.key}
                    onClick={() => setSelectedTopic(bp.key)}
                    className="cursor-pointer p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:border-purple-500/40 hover:bg-[var(--surface-3)] transition-all space-y-1 group"
                  >
                    <div className="flex items-center gap-1.5">
                      <TopicIcon topicKey={bp.key} size={14} />
                      <div className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors truncate">
                        {bp.title}
                      </div>
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2 leading-tight">
                      {bp.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </m.div>
        ) : (
          /* ── ACTIVE TRACK WORKSPACE ───────────────────────────────── */
          <m.div
            key={selectedTopic}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {/* Topic Executive Header Banner */}
            <div className="relative rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3.5 sm:p-4 shadow-xs overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[var(--surface-2)] border border-[var(--border)] shadow-xs">
                      <TopicIcon topicKey={activeTopicObj?.key || ""} size={18} />
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border)]">
                      {activeTopicObj?.domain}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      Curated Interview Track
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
                    {activeTopicObj?.label}
                  </h2>

                  <p className="text-xs text-[var(--foreground)] leading-relaxed italic border-l-2 border-purple-500 pl-2.5 py-0.5 bg-purple-500/5 rounded-r">
                    &ldquo;{activeTopicObj?.executiveSummary}&rdquo;
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-[var(--muted-foreground)] pt-0.5">
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} className="text-emerald-400" />
                      <strong>{topicSummary?.concepts}</strong> Concepts
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HelpCircle size={12} className="text-blue-400" />
                      <strong>{topicSummary?.qa}</strong> Q&As
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Workflow size={12} className="text-purple-400" />
                      <strong>{topicSummary?.arch}</strong> Architecture
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      ~{estHours}h Study Time
                    </span>
                  </div>
                </div>

                {/* Progress & Quick Actions */}
                <div className="flex flex-col items-start lg:items-end justify-between gap-2.5 shrink-0 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] min-w-[210px]">
                  <div className="w-full flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--foreground)]">Mastery Progress</span>
                    <span className="font-mono font-bold text-purple-400">
                      {completedCount} / {totalItemsCount} ({pctComplete}%)
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-[var(--surface-3)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-300"
                      style={{ width: `${pctComplete}%` }}
                    />
                  </div>

                  <div className="w-full flex items-center justify-between gap-2 pt-1 border-t border-[var(--border)] text-[11px]">
                    <button
                      onClick={copyShareLink}
                      className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors"
                      title="Copy Track Link"
                    >
                      <Share2 size={12} />
                      <span>Share</span>
                    </button>
                    {completedCount > 0 && (
                      <button
                        onClick={resetTrackProgress}
                        className="text-[var(--muted-foreground)] hover:text-red-400 flex items-center gap-1 transition-colors"
                        title="Reset Track"
                      >
                        <RotateCcw size={12} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Whiteboard Architecture Blueprint Banner (if available) */}
            {featuredDiagram && (
              <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 flex flex-col md:flex-row items-center gap-3 transition-all">
                <div
                  onClick={() => {
                    setActiveDiagramModal(featuredDiagram);
                    setDiagramZoom(1);
                  }}
                  className="relative group cursor-pointer w-full md:w-44 h-24 rounded-lg overflow-hidden border border-[var(--border)] bg-black shrink-0 shadow-xs"
                >
                  <Image
                    src={featuredDiagram.image}
                    alt={featuredDiagram.title}
                    width={300}
                    height={180}
                    sizes="(max-width: 768px) 100vw, 200px"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="p-1 rounded-full bg-black/60 text-white backdrop-blur-sm group-hover:scale-110 transition-transform">
                      <Maximize2 size={14} />
                    </div>
                  </div>
                  <span className="absolute bottom-1 left-1 text-[8px] font-mono px-1 py-0.2 rounded bg-black/80 text-purple-300 border border-purple-500/30">
                    Whiteboard HD
                  </span>
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-[9px] font-bold text-purple-400 uppercase tracking-wider">
                    <Sparkles size={11} />
                    <span>Featured Whiteboard Architecture Blueprint</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">
                    {featuredDiagram.title}
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-1">
                    {featuredDiagram.subtitle}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <button
                      onClick={() => {
                        setActiveDiagramModal(featuredDiagram);
                        setDiagramZoom(1);
                      }}
                      className="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Maximize2 size={11} />
                      <span>Inspect Blueprint (HD Lightbox)</span>
                    </button>
                    <a
                      href={`/architecture?category=${encodeURIComponent(featuredDiagram.category)}&card=${featuredDiagram.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-md bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--foreground)] text-[10px] font-semibold flex items-center gap-1 border border-[var(--border)] transition-colors"
                    >
                      <span>Open in Architecture Hub</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Related Whiteboard Architecture Blueprints (if track has multiple) */}
            {topicSummary?.relatedDiagrams && topicSummary.relatedDiagrams.length > 0 && (
              <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--foreground)] flex items-center gap-1.5 text-purple-400">
                    <Sparkles size={12} />
                    <span>Related System Architecture Blueprints</span>
                  </span>
                  <a
                    href="/architecture?tab=diagrams"
                    className="text-[10px] text-[var(--muted-foreground)] hover:text-purple-400 transition-colors"
                  >
                    View All {overviewStats.totalWhiteboards} Blueprints &rarr;
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {topicSummary.relatedDiagrams.map((rd) => (
                    <button
                      key={rd.id}
                      onClick={() => {
                        setActiveDiagramModal(rd);
                        setDiagramZoom(1);
                      }}
                      className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:border-purple-500/40 text-left transition-all flex items-center gap-2.5 group"
                    >
                      <div className="w-12 h-8 rounded bg-black shrink-0 overflow-hidden relative border border-[var(--border)] shadow-xs">
                        <Image
                          src={rd.image}
                          alt={rd.title}
                          width={80}
                          height={50}
                          sizes="80px"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors truncate">
                          {rd.title}
                        </h5>
                        <p className="text-[10px] text-[var(--muted-foreground)] truncate">{rd.category}</p>
                      </div>
                      <Maximize2 size={12} className="text-[var(--muted-foreground)] group-hover:text-purple-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── 4-STAGE MILESTONE ROADMAP ────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {stages.map((stg) => {
                const stageItems = rawItems.filter((i) => i.difficulty === stg.id);
                const stageDone = stageItems.filter((i) => completedIds.has(i.id)).length;
                const stagePct = stageItems.length > 0 ? Math.round((stageDone / stageItems.length) * 100) : 0;
                const isSelected = stageFilter === stg.id;
                const stageKey = stg.id === "EASY" ? "foundations" : stg.id === "MEDIUM" ? "core" : stg.id === "HARD" ? "advanced" : "architect";
                const stageDescription = activeTopicObj?.stages ? activeTopicObj.stages[stageKey] : "";

                return (
                  <button
                    key={stg.id}
                    onClick={() => setStageFilter(isSelected ? "ALL" : stg.id)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all duration-150 relative flex flex-col justify-between gap-2",
                      isSelected
                        ? "bg-[var(--surface-2)] border-purple-500 ring-1 ring-purple-500/40 shadow-sm"
                        : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", stg.badgeBg, stg.borderColor)}>
                          Stage {stg.stageNum}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                          {stageDone}/{stageItems.length}
                        </span>
                      </div>
                      <h4 className={cn("text-xs font-bold truncate", stg.color)}>
                        {stg.shortTitle}
                      </h4>
                      {stageDescription && (
                        <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2 leading-tight">
                          {stageDescription}
                        </p>
                      )}
                    </div>

                    <div className="w-full space-y-1 pt-1">
                      <div className="h-1 w-full bg-[var(--surface-3)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 transition-all duration-200"
                          style={{ width: `${stagePct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-[var(--muted-foreground)]">
                        <span>{stagePct === 100 ? "Mastered" : `${stagePct}% Done`}</span>
                        {isSelected && <span className="text-purple-400 font-semibold">Active Filter</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── FILTER & SEARCH TOOLBAR ──────────────────────────────── */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 w-full border-y border-[var(--border)] text-xs">
              {/* Search */}
              <div className="relative shrink-0 w-36 sm:w-56">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter curriculum..."
                  className="w-full pl-8 pr-6 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-purple-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Type / Topics Filter */}
              <div className="flex items-center gap-1 p-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] shrink-0 shadow-xs">
                {[
                  { key: "ALL", label: "All Types" },
                  { key: "concept", label: "Concepts" },
                  { key: "qa", label: "Q&As" },
                  { key: "architecture", label: "Architecture" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSelectedType(item.key)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all shrink-0 cursor-pointer whitespace-nowrap",
                      selectedType === item.key
                        ? "bg-blue-600 text-white font-semibold shadow-xs"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center gap-1 p-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] shrink-0 shadow-xs">
                {[
                  { key: "ALL", label: "ALL" },
                  { key: "EASY", label: "Beginner" },
                  { key: "MEDIUM", label: "Intermediate" },
                  { key: "HARD", label: "Advanced" },
                  { key: "ARCHITECT", label: "Architect" },
                ].map((diff) => (
                  <button
                    key={diff.key}
                    onClick={() => setSelectedDifficulty(diff.key)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all shrink-0 cursor-pointer whitespace-nowrap",
                      selectedDifficulty === diff.key
                        ? "bg-blue-600 text-white font-semibold shadow-xs"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>

              <div className="w-px h-3.5 bg-[var(--border)] mx-1 shrink-0" />

              {/* Read All Mode Toggle */}
              <button
                onClick={toggleReadAllMode}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer shadow-xs whitespace-nowrap",
                  isReadAllMode
                    ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20 shadow-md ring-2 ring-emerald-500/30"
                    : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                )}
                title="Toggle continuous reading mode for all curriculum cards (Shift + E)"
              >
                <BookOpen size={12} className={cn(isReadAllMode && "animate-pulse")} />
                <span>{isReadAllMode ? "Exit Read All" : "Read All"}</span>
                <kbd className="hidden sm:inline-block text-[9px] px-1 py-0.2 rounded bg-black/20 text-current border border-white/20 font-mono">
                  ⇧E
                </kbd>
              </button>

              {/* Expand / Collapse All */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleExpandAll}
                  className="px-2 py-1 rounded text-[11px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
                  title="Expand all cards"
                >
                  Expand All
                </button>
                <span className="text-[var(--muted-foreground)]">•</span>
                <button
                  onClick={handleCollapseAll}
                  className="px-2 py-1 rounded text-[11px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
                  title="Collapse all cards"
                >
                  Collapse All
                </button>
              </div>

              <div className="w-px h-3.5 bg-[var(--border)] mx-1 shrink-0" />

              {/* Drill / Shuffle Mode */}
              <div className="flex items-center gap-1 shrink-0 ml-auto">
                <button
                  onClick={() => {
                    setIsShuffled(true);
                    setShuffleSeed((s) => s + 1);
                    setPages({});
                    toast.success("Shuffled curriculum order for drill practice");
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors shrink-0",
                    isShuffled
                      ? "bg-purple-600 text-white font-semibold shadow-xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] border border-[var(--border)]"
                  )}
                  title="Randomize question sequence for interview drills"
                >
                  <Shuffle size={12} className={cn(isShuffled && "rotate-180 transition-transform")} />
                  <span>{isShuffled ? "Reshuffle" : "Drill Shuffle"}</span>
                </button>
                {isShuffled && (
                  <button
                    onClick={() => {
                      setIsShuffled(false);
                      setPages({});
                      toast.info("Reset to standard sequence");
                    }}
                    className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline px-1"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* ── STAGE SECTIONS & COMPACT ROWS ────────────────────────── */}
            <div className="space-y-5">
              {stages.map((stage) => {
                const items = itemsByStage[stage.id] || [];
                if (items.length === 0) return null;

                const isCollapsed = collapsedStages[stage.id];
                const pageNum = pages[stage.id] || 1;
                const visibleItems = isReadAllMode ? items : items.slice(0, pageNum * pageSize);
                const stageDoneCount = items.filter((i) => completedIds.has(i.id)).length;
                const isStageComplete = stageDoneCount === items.length && items.length > 0;

                return (
                  <div
                    key={stage.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 sm:p-4 space-y-3"
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2.5 select-none">
                      <div
                        onClick={() => toggleStageCollapse(stage.id)}
                        className="flex items-center gap-2.5 cursor-pointer group flex-1"
                      >
                        <ChevronDown
                          size={15}
                          className={cn(
                            "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-transform duration-150",
                            isCollapsed && "-rotate-90"
                          )}
                        />
                        <h3 className={cn("text-xs sm:text-sm font-bold", stage.color)}>
                          {stage.title}
                        </h3>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border)]">
                          {stageDoneCount}/{items.length} items
                        </span>
                        {isStageComplete && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase flex items-center gap-1">
                            <CheckCheck size={11} />
                            Mastered
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => markStageAllDone(stage.id)}
                          className="px-2 py-1 rounded text-[10px] font-semibold text-[var(--muted-foreground)] hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors border border-transparent hover:border-emerald-500/20"
                          title="Mark all items in this stage as complete"
                        >
                          Mark Stage Complete
                        </button>
                      </div>
                    </div>

                    {/* Stage Rows */}
                    {!isCollapsed && (
                      <div className="space-y-1">
                        {visibleItems.map((item) => {
                          const isCompleted = completedIds.has(item.id);
                          const isExpanded = isReadAllMode ? !collapsedInReadMode.has(item.id) : expandedIds.has(item.id);
                          const diffStyle = difficultyColors[item.difficulty] || difficultyColors.MEDIUM;
                          const tStyle = typeColors[item.type] || typeColors.concept;
                          const IconComp = tStyle.icon;

                          return (
                            <div
                              key={item.id}
                              className={cn(
                                "rounded-lg border transition-all duration-150 overflow-hidden",
                                isExpanded
                                  ? "bg-[var(--surface-2)] border-purple-500/40 shadow-xs"
                                  : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]/60",
                                isCompleted && !isExpanded && "opacity-65"
                              )}
                            >
                              {/* Compact Reference Row - Clean Word-Wrapped Text without Tags */}
                              <div
                                onClick={() => toggleExpand(item.id)}
                                className={cn(
                                  "px-3 flex gap-2.5 cursor-pointer select-none group transition-colors items-start",
                                  isExpanded
                                    ? "py-3 bg-[var(--surface-2)]/60"
                                    : "py-2.5 hover:bg-[var(--surface-2)]/40"
                                )}
                              >
                                <button
                                  onClick={(e) => toggleComplete(item.id, e)}
                                  className={cn(
                                    "shrink-0 transition-colors p-0.5 rounded mt-0.5",
                                    isCompleted
                                      ? "text-purple-400 hover:text-purple-300"
                                      : "text-[var(--muted-foreground)] hover:text-purple-400"
                                  )}
                                  title={isCompleted ? "Completed (click to uncheck)" : "Mark as completed"}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 size={16} className="text-purple-400 fill-purple-400/20" />
                                  ) : (
                                    <Circle size={16} />
                                  )}
                                </button>

                                {/* Title Container - word wraps on mobile screens and other screens without tags */}
                                <div className="flex-1 min-w-0">
                                  <h4
                                    title={item.title}
                                    className={cn(
                                      "text-xs sm:text-sm font-medium leading-relaxed whitespace-normal break-words text-[var(--foreground)] transition-colors",
                                      isExpanded && "font-bold text-purple-300",
                                      isCompleted && !isExpanded && "line-through text-[var(--muted-foreground)] opacity-70"
                                    )}
                                  >
                                    {item.title}
                                  </h4>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                                  <a
                                    href={item.sourceHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 rounded text-[var(--muted-foreground)] hover:text-purple-400 hover:bg-[var(--surface-3)] transition-colors opacity-70 group-hover:opacity-100"
                                    title="View full problem in source page"
                                  >
                                    <ExternalLink size={13} />
                                  </a>
                                  <div className="p-1 text-[var(--muted-foreground)]">
                                    <ChevronDown
                                      size={14}
                                      className={cn(
                                        "transition-transform duration-150",
                                        isExpanded && "rotate-180 text-purple-400"
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Content Accordion */}
                              <SmoothAccordion isOpen={isExpanded} innerClassName="px-3.5 sm:px-5 pb-3 pt-1 space-y-2.5 bg-[var(--surface-2)]/30">
                                {/* Metadata Banner inside expanded content */}
                                <div className="flex items-center gap-2 flex-wrap pb-1.5 text-[11px] text-[var(--muted-foreground)] border-b border-[var(--border)]/50">
                                  <span className={cn("font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1", tStyle.text)}>
                                    <IconComp size={11} />
                                    <span>{item.sourceLabel || item.type}</span>
                                  </span>
                                  <span>·</span>
                                  <span className={cn("font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border", diffStyle.bg, diffStyle.text, diffStyle.border)}>
                                    {item.difficulty}
                                  </span>
                                  {item.niche && (
                                    <>
                                      <span>·</span>
                                      <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                                        Focus: {item.niche}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {item.type === "concept" ? (
                                  <div className="space-y-2.5">
                                    <div className="text-xs text-[var(--foreground)] leading-relaxed whitespace-pre-line">
                                      {item.body}
                                    </div>
                                    {item.keyPoints && item.keyPoints.length > 0 && (
                                      <div className="pt-2 border-t border-[var(--border)] space-y-1">
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                                          Key Takeaways
                                        </div>
                                        <ul className="list-disc pl-4 text-xs text-[var(--muted-foreground)] space-y-1">
                                          {item.keyPoints.map((kp, idx) => (
                                            <li key={idx}>{kp}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-xs">
                                    <AnswerRenderer text={item.body} />
                                  </div>
                                )}
                              </SmoothAccordion>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Pagination Controls per stage */}
                    {!isCollapsed && !isReadAllMode && visibleItems.length < items.length && (
                      <div className="flex items-center justify-center gap-2 pt-2 border-t border-[var(--border)]">
                        <button
                          onClick={() => setPages((p) => ({ ...p, [stage.id]: (p[stage.id] || 1) * 2 }))}
                          className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-semibold text-[var(--foreground)] transition-colors flex items-center gap-1.5 border border-[var(--border)]"
                        >
                          <span>⚡ Load More (+{Math.min(visibleItems.length, items.length - visibleItems.length)})</span>
                          <span className="opacity-70 text-[10px]">· {items.length - visibleItems.length} remaining</span>
                        </button>
                        <button
                          onClick={() => setPages((p) => ({ ...p, [stage.id]: Math.ceil(items.length / pageSize) }))}
                          className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors border border-[var(--border)]"
                        >
                          Load All ({items.length})
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* ── WHITEBOARD LIGHTBOX MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {activeDiagramModal && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
            onClick={() => setActiveDiagramModal(null)}
          >
            <m.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-[var(--border)] bg-[#101014] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--border)] bg-[var(--surface-1)]">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate">
                    {activeDiagramModal.title}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">
                    {activeDiagramModal.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setDiagramZoom((z) => Math.min(2.5, z + 0.25))}
                    className="p-1.5 rounded-md hover:bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    title="Zoom in"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    onClick={() => setDiagramZoom((z) => Math.max(0.75, z - 0.25))}
                    className="p-1.5 rounded-md hover:bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    title="Zoom out"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <button
                    onClick={() => setDiagramZoom(1)}
                    className="p-1.5 rounded-md hover:bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    title="Reset zoom"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <div className="w-px h-4 bg-[var(--border)] mx-1" />
                  <button
                    onClick={() => setActiveDiagramModal(null)}
                    className="p-1.5 rounded-md hover:bg-red-500/20 text-[var(--muted-foreground)] hover:text-red-400 transition-colors"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body with Zoomable Image */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60 min-h-[360px]">
                <Image
                  src={activeDiagramModal.image}
                  alt={activeDiagramModal.title}
                  width={1400}
                  height={900}
                  sizes="(max-width: 768px) 100vw, 85vw"
                  priority={true}
                  style={{ transform: `scale(${diagramZoom})`, transformOrigin: "center center" }}
                  className="max-h-[58vh] max-w-full w-auto h-auto object-contain rounded-lg transition-transform duration-150"
                />
              </div>

              {/* Modal Footer Key Points */}
              <div className="px-4 sm:px-6 py-3 border-t border-[var(--border)] bg-[var(--surface-1)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                    Architectural Mechanisms
                  </span>
                  <a
                    href={activeDiagramModal.image}
                    download
                    className="text-xs text-[var(--muted-foreground)] hover:text-purple-400 transition-colors"
                  >
                    Download Full PNG
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--muted-foreground)]">
                  {activeDiagramModal.keyPoints.slice(0, 4).map((pt, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <Check size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GuidedLearningClient() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-[var(--muted-foreground)]">
          Loading Guided Learning Journeys...
        </div>
      }
    >
      <GuidedLearningContent />
    </Suspense>
  );
}

export default GuidedLearningClient;
