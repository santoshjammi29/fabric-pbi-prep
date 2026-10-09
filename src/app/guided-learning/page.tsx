"use client";

import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import Link from "next/link";
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

export default function GuidedLearningPage() {
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
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [pages, setPages] = useState<Record<string, number>>({});
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [activeDiagramModal, setActiveDiagramModal] = useState<ArchitectureDiagramItem | null>(null);
  const [diagramZoom, setDiagramZoom] = useState(1);

  const pageSize = 15;

  // Initialize from URL search params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const topicParam = params.get("topic");
    if (topicParam && GUIDED_TOPICS.some((t) => t.key === topicParam)) {
      setSelectedTopic(topicParam);
    }
  }, []);

  // Sync state when topic changes
  useEffect(() => {
    if (selectedTopic) {
      window.history.replaceState(null, "", `?topic=${selectedTopic}`);
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
      setIsShuffled(false);
      setCollapsedStages({});
    } else {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [selectedTopic]);

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

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

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
    <div className="space-y-6 pb-24 max-w-6xl 2xl:max-w-7xl mx-auto px-2 sm:px-4">
      {/* ── TOP BANNER & TRACK MATRIX ─────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-4 sm:p-6 shadow-sm isolate">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-semibold text-purple-400">
              <GraduationCap size={13} className="text-purple-400" />
              <span className="uppercase tracking-wider font-mono">Senior DE Learning Tracks</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
              Guided Learning Journeys
              <span className="text-xs font-normal text-[var(--muted-foreground)] px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] hidden sm:inline">
                {overviewStats.totalTopics} Tracks · {overviewStats.totalUniqueItems}+ Problems
              </span>
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] max-w-2xl">
              End-to-end engineered career tracks across distributed engines, lakehouses, orchestration, and enterprise modeling. Built for senior and staff data platform interviews.
            </p>
          </div>

          {selectedTopic && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectedTopic(null)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-semibold text-[var(--foreground)] transition-colors flex items-center gap-1.5"
              >
                <Compass size={13} />
                <span>Browse All Tracks</span>
              </button>
            </div>
          )}
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
          {GUIDED_DOMAINS.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 shrink-0",
                selectedDomain === dom
                  ? "bg-purple-600 text-white font-semibold shadow-sm"
                  : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] border border-[var(--border)]"
              )}
            >
              {dom}
            </button>
          ))}
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
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
                  "p-2.5 rounded-xl border text-left transition-all duration-150 relative group flex flex-col justify-between gap-2 overflow-hidden",
                  isActive
                    ? "bg-[var(--surface-2)] border-purple-500 ring-1 ring-purple-500/40 shadow-md shadow-purple-500/5"
                    : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 bg-gradient-to-br shadow-sm",
                      topic.gradient
                    )}
                  >
                    {topic.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors truncate">
                      {topic.label}
                    </h3>
                    <p className="text-[10px] text-[var(--muted-foreground)] truncate">{counts.total} items</p>
                  </div>
                </div>

                {/* Progress bar inside chip */}
                <div className="w-full space-y-1">
                  <div className="flex items-center justify-between text-[9px] text-[var(--muted-foreground)]">
                    <span className="truncate">{topic.domain}</span>
                    {trackPct > 0 && <span className="text-purple-400 font-mono font-semibold">{trackPct}%</span>}
                  </div>
                  <div className="h-1 w-full bg-[var(--surface-3)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-200"
                      style={{ width: `${trackPct}%` }}
                    />
                  </div>
                </div>
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
            className="space-y-6"
          >
            {/* Featured Journey Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wide">
                    Compute & Engine Deep Dive
                  </span>
                  <h3 className="text-base font-bold text-[var(--foreground)]">Apache Spark & Databricks Track</h3>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Master Tungsten off-heap memory, Catalyst physical query plans, Adaptive Query Execution (AQE), Liquid Clustering, and Photon vectorization.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTopic("spark")}
                  className="w-full py-2 px-3 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-semibold flex items-center justify-between border border-orange-500/30 transition-colors"
                >
                  <span>Start Spark Track</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wide">
                    Orchestration & Transformation
                  </span>
                  <h3 className="text-base font-bold text-[var(--foreground)]">Airflow & dbt Engineering Track</h3>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Construct production DAGs with TaskFlow, Celery/K8s executors, async Triggerers, incremental merge models, and dbt Mesh governance.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTopic("airflow")}
                  className="w-full py-2 px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold flex items-center justify-between border border-sky-500/30 transition-colors"
                >
                  <span>Start Airflow Track</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wide">
                    Enterprise SaaS Lakehouse
                  </span>
                  <h3 className="text-base font-bold text-[var(--foreground)]">Microsoft Fabric & OneLake Track</h3>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Explore OneLake zero-copy shortcuts, universal Delta Parquet storage, Direct Lake VertiPaq memory mapping, and cross-workspace governance.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTopic("fabric")}
                  className="w-full py-2 px-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-semibold flex items-center justify-between border border-purple-500/30 transition-colors"
                >
                  <span>Start Fabric Track</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Platform Whiteboard Showcase Banner */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-purple-400">
                    <Sparkles size={13} />
                    <span>INTEGRATED SYSTEM DESIGN BLUEPRINTS</span>
                  </div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    Whiteboard System Architecture Blueprints
                  </h2>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Every Guided Learning track is paired with high-resolution hand-drawn whiteboard architecture diagrams detailing distributed execution mechanisms and storage internals.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTopic("databricks")}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm"
                >
                  Explore Blueprint Track
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div
                  onClick={() => setSelectedTopic("airflow")}
                  className="cursor-pointer p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:border-purple-500/40 transition-all space-y-1.5 group"
                >
                  <div className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors">
                    Airflow Distributed Engine
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2">
                    Multi-threaded scheduler, metadata DB, triggerers, and worker execution pools.
                  </p>
                </div>

                <div
                  onClick={() => setSelectedTopic("fabric")}
                  className="cursor-pointer p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:border-purple-500/40 transition-all space-y-1.5 group"
                >
                  <div className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors">
                    Fabric OneLake Architecture
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2">
                    Universal Delta Parquet storage, cross-cloud shortcuts, and multi-engine compute.
                  </p>
                </div>

                <div
                  onClick={() => setSelectedTopic("adf")}
                  className="cursor-pointer p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:border-purple-500/40 transition-all space-y-1.5 group"
                >
                  <div className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors">
                    ADF Hybrid Ingestion
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2">
                    Self-Hosted IR gateways, private endpoints, tumbling window CDC, and multi-cloud.
                  </p>
                </div>

                <div
                  onClick={() => setSelectedTopic("streaming")}
                  className="cursor-pointer p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:border-purple-500/40 transition-all space-y-1.5 group"
                >
                  <div className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors">
                    Kafka & Streaming Engine
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2">
                    Partition brokers, schema registry, stateful watermarking, and exactly-once sinks.
                  </p>
                </div>

                <div
                  onClick={() => setSelectedTopic("dbt")}
                  className="cursor-pointer p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:border-purple-500/40 transition-all space-y-1.5 group"
                >
                  <div className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors">
                    dbt Analytics Engineering
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2">
                    Incremental models, SCD2 snapshots, automated testing, and Semantic Layer.
                  </p>
                </div>

                <div
                  onClick={() => setSelectedTopic("spark")}
                  className="cursor-pointer p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:border-purple-500/40 transition-all space-y-1.5 group"
                >
                  <div className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors">
                    Catalyst & Photon Execution
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2">
                    Logical plan optimization, AQE runtime re-planning, and vectorized C++ engine.
                  </p>
                </div>

                <div
                  onClick={() => setSelectedTopic("modeling")}
                  className="cursor-pointer p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:border-purple-500/40 transition-all space-y-1.5 group"
                >
                  <div className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors">
                    Kimball Star Schema
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2">
                    Atomic grain facts, conformed dimensions, SCD Type 1 & 2, and Bus Matrix.
                  </p>
                </div>

                <div
                  onClick={() => setSelectedTopic("governance")}
                  className="cursor-pointer p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:border-purple-500/40 transition-all space-y-1.5 group"
                >
                  <div className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors">
                    Purview Enterprise Catalog
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2">
                    Automated data map, PII scanning, end-to-end lineage graph, and ABAC policies.
                  </p>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Link
                  href="/architecture?tab=diagrams"
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
                >
                  <span>Explore all 21 High-Resolution Whiteboard Blueprints &rarr;</span>
                </Link>
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
            className="space-y-4"
          >
            {/* Topic Executive Header Banner */}
            <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-6 shadow-sm overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 bg-gradient-to-br shadow-sm",
                        activeTopicObj?.gradient
                      )}
                    >
                      {activeTopicObj?.icon}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border)]">
                      {activeTopicObj?.domain}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      Curated Interview Track
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                    {activeTopicObj?.label}
                  </h2>

                  <p className="text-xs text-[var(--foreground)] leading-relaxed italic border-l-2 border-purple-500 pl-3 py-0.5 bg-purple-500/5 rounded-r-md">
                    &ldquo;{activeTopicObj?.executiveSummary}&rdquo;
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)] pt-1">
                    <span className="flex items-center gap-1">
                      <BookOpen size={13} className="text-emerald-400" />
                      <strong>{topicSummary?.concepts}</strong> Concepts
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HelpCircle size={13} className="text-blue-400" />
                      <strong>{topicSummary?.qa}</strong> Q&As
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Workflow size={13} className="text-purple-400" />
                      <strong>{topicSummary?.arch}</strong> Architecture
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      ~{estHours}h Study Time
                    </span>
                  </div>
                </div>

                {/* Progress & Quick Actions */}
                <div className="flex flex-col items-start lg:items-end justify-between gap-3 shrink-0 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] min-w-[240px]">
                  <div className="w-full flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--foreground)]">Mastery Progress</span>
                    <span className="font-mono font-bold text-purple-400">
                      {completedCount} / {totalItemsCount} ({pctComplete}%)
                    </span>
                  </div>

                  <div className="h-2 w-full bg-[var(--surface-3)] rounded-full overflow-hidden">
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
              <div className="p-4 sm:p-5 rounded-2xl border border-purple-500/30 bg-purple-500/5 flex flex-col md:flex-row items-center gap-4 transition-all">
                <div
                  onClick={() => {
                    setActiveDiagramModal(featuredDiagram);
                    setDiagramZoom(1);
                  }}
                  className="relative group cursor-pointer w-full md:w-56 h-32 rounded-xl overflow-hidden border border-[var(--border)] bg-black shrink-0 shadow-md"
                >
                  <img
                    src={featuredDiagram.image}
                    alt={featuredDiagram.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="p-1.5 rounded-full bg-black/60 text-white backdrop-blur-sm group-hover:scale-110 transition-transform">
                      <Maximize2 size={16} />
                    </div>
                  </div>
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/75 text-purple-300 border border-purple-500/30">
                    Whiteboard HD
                  </span>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    <Sparkles size={12} />
                    <span>Featured Whiteboard Architecture Blueprint</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate">
                    {featuredDiagram.title}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                    {featuredDiagram.subtitle}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setActiveDiagramModal(featuredDiagram);
                        setDiagramZoom(1);
                      }}
                      className="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Maximize2 size={12} />
                      <span>Inspect Blueprint (HD Lightbox)</span>
                    </button>
                    <a
                      href={`/architecture?category=${encodeURIComponent(featuredDiagram.category)}&card=${featuredDiagram.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-md bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--foreground)] text-[11px] font-semibold flex items-center gap-1 border border-[var(--border)] transition-colors"
                    >
                      <span>Open in Architecture Hub</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Related Whiteboard Architecture Blueprints (if track has multiple) */}
            {topicSummary?.relatedDiagrams && topicSummary.relatedDiagrams.length > 0 && (
              <div className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--foreground)] flex items-center gap-1.5 text-purple-400">
                    <Sparkles size={13} />
                    <span>Related System Architecture Blueprints</span>
                  </span>
                  <a
                    href="/architecture?tab=diagrams"
                    className="text-[11px] text-[var(--muted-foreground)] hover:text-purple-400 transition-colors"
                  >
                    View All {overviewStats.totalWhiteboards} Blueprints &rarr;
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {topicSummary.relatedDiagrams.map((rd) => (
                    <button
                      key={rd.id}
                      onClick={() => {
                        setActiveDiagramModal(rd);
                        setDiagramZoom(1);
                      }}
                      className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:border-purple-500/40 text-left transition-all flex items-center gap-3 group"
                    >
                      <div className="w-14 h-9 rounded-lg bg-black shrink-0 overflow-hidden relative border border-[var(--border)] shadow-xs">
                        <img
                          src={rd.image}
                          alt={rd.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors truncate">
                          {rd.title}
                        </h5>
                        <p className="text-[10px] text-[var(--muted-foreground)] truncate">{rd.category}</p>
                      </div>
                      <Maximize2 size={13} className="text-[var(--muted-foreground)] group-hover:text-purple-400 shrink-0" />
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

              {/* Type Filter */}
              <div className="flex items-center gap-1 shrink-0">
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
                      "px-2 py-1 rounded text-[11px] font-medium transition-colors shrink-0",
                      selectedType === item.key
                        ? "bg-[var(--surface-3)] text-[var(--foreground)] font-semibold border border-[var(--border)] shadow-xs"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="w-px h-3.5 bg-[var(--border)] mx-1 shrink-0" />

              {/* Difficulty Filter */}
              <div className="flex items-center gap-1 shrink-0">
                {["ALL", "EASY", "MEDIUM", "HARD", "ARCHITECT"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={cn(
                      "px-2 py-1 rounded text-[11px] font-medium transition-colors shrink-0 uppercase",
                      selectedDifficulty === diff
                        ? "bg-purple-600 text-white font-semibold shadow-xs"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    {diff === "ALL" ? "All Levels" : diff}
                  </button>
                ))}
              </div>

              <div className="w-px h-3.5 bg-[var(--border)] mx-1 shrink-0" />

              {/* Status Filter */}
              <div className="flex items-center gap-1 shrink-0">
                {[
                  { key: "ALL", label: "All Status" },
                  { key: "TODO", label: "To Master" },
                  { key: "MASTERED", label: "Mastered" },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setSelectedStatus(st.key as "ALL" | "TODO" | "MASTERED")}
                    className={cn(
                      "px-2 py-1 rounded text-[11px] font-medium transition-colors shrink-0",
                      selectedStatus === st.key
                        ? "bg-[var(--surface-3)] text-[var(--foreground)] font-semibold border border-[var(--border)]"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    {st.label}
                  </button>
                ))}
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
                const visibleItems = items.slice(0, pageNum * pageSize);
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
                          const isExpanded = expandedIds.has(item.id);
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
                              {/* Compact Reference Row (nextjs-compact-ui pattern) */}
                              <div
                                onClick={() => toggleExpand(item.id)}
                                className="py-1.5 px-3 flex items-center gap-2.5 cursor-pointer select-none group"
                              >
                                <button
                                  onClick={(e) => toggleComplete(item.id, e)}
                                  className={cn(
                                    "shrink-0 transition-colors p-0.5 rounded",
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

                                {/* Badges */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <span
                                    className={cn(
                                      "text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase flex items-center gap-1",
                                      tStyle.bg,
                                      tStyle.text,
                                      tStyle.border
                                    )}
                                  >
                                    <IconComp size={10} />
                                    <span>{item.sourceLabel || item.type}</span>
                                  </span>
                                  <span
                                    className={cn(
                                      "text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase",
                                      diffStyle.bg,
                                      diffStyle.text,
                                      diffStyle.border
                                    )}
                                  >
                                    {item.difficulty}
                                  </span>
                                </div>

                                {/* Title */}
                                <h4
                                  className={cn(
                                    "text-xs font-semibold text-[var(--foreground)] flex-1 truncate transition-colors",
                                    isCompleted && !isExpanded && "line-through text-[var(--muted-foreground)]"
                                  )}
                                >
                                  {item.title}
                                </h4>

                                {item.niche && (
                                  <span className="text-[10px] text-[var(--muted-foreground)] shrink-0 hidden md:inline max-w-[160px] truncate">
                                    • {item.niche}
                                  </span>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 shrink-0">
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
                              <SmoothAccordion isOpen={isExpanded} innerClassName="px-8 pb-3.5 pt-1 space-y-3">
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
                    {!isCollapsed && visibleItems.length < items.length && (
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
                <img
                  src={activeDiagramModal.image}
                  alt={activeDiagramModal.title}
                  style={{ transform: `scale(${diagramZoom})`, transformOrigin: "center center" }}
                  className="max-h-[58vh] max-w-full object-contain rounded-lg transition-transform duration-150"
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
