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
  ArrowRight,
  Filter,
  Code2,
  X,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UnifiedSearchFilterBox } from "@/components/ui/unified-search-filter-box";
import { UnifiedQuestion, Difficulty, STANDARDIZED_DOMAINS } from "@/types/data";
import { ArchitectureDiagramItem } from "@/data/diagrams";
import dynamic from "next/dynamic";
import {
  TECH_ECOSYSTEMS,
  SCENARIO_ARCHETYPES,
  TechEcosystemId,
  ScenarioArchetypeId,
  matchTechEcosystem,
  matchScenarioArchetype,
  matchDomain,
  questionHasCode,
  computeFilterCounts,
  getQuestionSearchCorpus,
} from "@/lib/qa-filters";

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
  diagrams?: ArchitectureDiagramItem[];
  totalQuestionCount?: number;
}

function getQuestionMatchingDiagram(q: UnifiedQuestion, diagrams: ArchitectureDiagramItem[]): ArchitectureDiagramItem | undefined {
  if (!diagrams || diagrams.length === 0) return undefined;
  const text = `${q.question} ${q.category || ""} ${q.niche || ""}`.toLowerCase();
  
  if (text.includes("polars") || text.includes("arrow") || text.includes("gil") || text.includes("flight ipc")) {
    return diagrams.find((d) => d.id === "python-arrow-polars-architecture");
  }
  if (text.includes("saga") || text.includes("token bucket") || text.includes("sharding") || text.includes("circuit breaker") || text.includes("system design") || text.includes("redis cluster")) {
    return diagrams.find((d) => d.id === "distributed-systems-resilience-architecture");
  }
  if (text.includes("data mesh") || text.includes("data product") || text.includes("data contract")) {
    return diagrams.find((d) => d.id === "data-mesh-enterprise-architecture");
  }
  if (text.includes("skew") || text.includes("salting") || text.includes("skewjoin")) {
    return diagrams.find((d) => d.id === "spark-data-skew-aqe-optimization");
  }
  if (text.includes("finops") || text.includes("cost") || text.includes("spot instance") || text.includes("billing.usage")) {
    return diagrams.find((d) => d.id === "lakehouse-finops-cost-optimization");
  }
  if (text.includes("bundle") || text.includes("dab") || (text.includes("databricks") && text.includes("ci/cd"))) {
    return diagrams.find((d) => d.id === "databricks-dabs-devops-pipeline");
  }
  if (text.includes("onelake") || text.includes("shortcut") || text.includes("fabric")) {
    return diagrams.find((d) => d.id === "fabric-onelake-architecture");
  }
  if (text.includes("direct lake") || text.includes("vertipaq") || text.includes("directquery")) {
    return diagrams.find((d) => d.id === "powerbi-direct-lake-vertipaq");
  }
  if (text.includes("dax") || text.includes("calculate") || text.includes("context transition")) {
    return diagrams.find((d) => d.id === "powerbi-dax-engine-context");
  }
  if (text.includes("airflow") || text.includes("dag") || text.includes("triggerer")) {
    return diagrams.find((d) => d.id === "apache-airflow-distributed-architecture");
  }
  if (text.includes("dbt") || text.includes("snapshot") || text.includes("semantic layer")) {
    return diagrams.find((d) => d.id === "dbt-analytics-engineering-dag");
  }
  if (text.includes("adf") || text.includes("integration runtime") || text.includes("shir")) {
    return diagrams.find((d) => d.id === "adf-hybrid-integration-runtime");
  }
  if (text.includes("kafka") || text.includes("streaming") || text.includes("watermark")) {
    return diagrams.find((d) => d.id === "kafka-event-streaming-pipeline");
  }
  if (text.includes("debezium") || text.includes("cdc") || text.includes("apply changes into")) {
    return diagrams.find((d) => d.id === "cdc-debezium-lakehouse-pipeline");
  }
  if (text.includes("medallion") || text.includes("bronze") || text.includes("silver") || text.includes("gold")) {
    return diagrams.find((d) => d.id === "databricks-medallion-pipeline");
  }
  if (text.includes("delta live tables") || text.includes("dlt")) {
    return diagrams.find((d) => d.id === "delta-live-tables-pipeline");
  }
  if (text.includes("unity catalog") || text.includes("3-level namespace") || text.includes("delta sharing")) {
    return diagrams.find((d) => d.id === "unity-catalog-governance");
  }
  if (text.includes("purview") || text.includes("governance") || text.includes("lineage")) {
    return diagrams.find((d) => d.id === "purview-governance-catalog");
  }
  if (text.includes("delta lake") || text.includes("_delta_log") || text.includes("acid")) {
    return diagrams.find((d) => d.id === "delta-lake-under-the-hood");
  }
  if (text.includes("iceberg") || text.includes("manifest")) {
    return diagrams.find((d) => d.id === "apache-iceberg-open-table-format");
  }
  if (text.includes("catalyst") || text.includes("photon") || text.includes("aqe")) {
    return diagrams.find((d) => d.id === "spark-catalyst-photon-engine");
  }
  if (text.includes("shuffle") || text.includes("spill") || text.includes("off-heap") || text.includes("tungsten")) {
    return diagrams.find((d) => d.id === "spark-shuffle-memory-execution");
  }
  if (text.includes("sql server") || text.includes("query optimizer") || text.includes("columnstore") || text.includes("cardinality")) {
    return diagrams.find((d) => d.id === "sql-server-query-engine-optimization");
  }
  if (text.includes("kimball") || text.includes("star schema") || text.includes("scd") || text.includes("fact")) {
    return diagrams.find((d) => d.id === "kimball-dimensional-star-schema");
  }
  if (text.includes("data vault") || text.includes("hub") || text.includes("satellite")) {
    return diagrams.find((d) => d.id === "data-vault-enterprise-architecture");
  }
  if (text.includes("rag") || text.includes("vector") || text.includes("embedding") || text.includes("hnsw")) {
    return diagrams.find((d) => d.id === "rag-vector-search-data-pipeline");
  }
  if (text.includes("edge") || text.includes("isr") || text.includes("dal")) {
    return diagrams.find((d) => d.id === "enterprise-edge-client-architecture");
  }
  if (text.includes("databricks")) {
    return diagrams.find((d) => d.id === "databricks-platform-master");
  }
  return undefined;
}

export function QaPrepClient({
  initialQuestions,
  diagrams = [],
  totalQuestionCount,
}: QaPrepClientProps) {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || searchParams.get("search") || "";
  const initialDomain = searchParams.get("domain") || searchParams.get("category") || "ALL";
  const initialTech = (searchParams.get("tech") || searchParams.get("ecosystem") || "ALL").toUpperCase() as TechEcosystemId;
  const initialArchetype = (searchParams.get("archetype") || searchParams.get("scenario") || "ALL").toUpperCase() as ScenarioArchetypeId;

  const [questions, setQuestions] = useState<UnifiedQuestion[]>(initialQuestions);
  const totalCount = Math.max(totalQuestionCount || 0, questions.length);

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedDomain, setSelectedDomain] = useState<string>(initialDomain);
  const [selectedTech, setSelectedTech] = useState<TechEcosystemId>(
    TECH_ECOSYSTEMS.some((e) => e.id === initialTech) ? initialTech : "ALL"
  );
  const [selectedArchetype, setSelectedArchetype] = useState<ScenarioArchetypeId>(
    SCENARIO_ARCHETYPES.some((a) => a.id === initialArchetype) ? initialArchetype : "ALL"
  );

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isReadAllMode, setIsReadAllMode] = useState(false);
  const [collapsedInReadMode, setCollapsedInReadMode] = useState<Set<string>>(new Set());
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // Study Mode State (Flashcards)
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync bookmarks from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("dataprep_bookmarks");
      if (saved) setBookmarks(JSON.parse(saved));
    } catch {}
  }, []);

  // Progressive background loading of remaining QA questions from R2 shards
  useEffect(() => {
    let isCancelled = false;

    async function loadMoreQuestions() {
      if (questions.length >= (totalQuestionCount || 6000)) return;

      try {
        const { fetchArtifactManifest, jsonFetcher, getArtifactUrl } = await import("@/lib/artifact-client");
        const manifest = await fetchArtifactManifest();
        const shards = manifest?.collections?.qa?.shards || [];
        if (shards.length === 0) return;

        const existingIds = new Set(initialQuestions.map((q) => q.id));
        const accumulated: UnifiedQuestion[] = [...initialQuestions];

        for (let i = 0; i < shards.length; i += 4) {
          if (isCancelled) return;
          const chunk = shards.slice(i, i + 4);
          const results = await Promise.all(
            chunk.map(async (shardMeta) => {
              try {
                const items = await jsonFetcher<any[]>(getArtifactUrl(shardMeta.key));
                return Array.isArray(items) ? items : [];
              } catch {
                return [];
              }
            })
          );

          for (const items of results) {
            for (const item of items) {
              if (item && item.id && !existingIds.has(item.id)) {
                existingIds.add(item.id);
                accumulated.push({
                  ...item,
                  sourceDb: item.sourceDb || "fabric_pbi",
                  sourceLabel: item.sourceLabel || "Fabric & PBI",
                });
              }
            }
          }

          if (!isCancelled) {
            setQuestions([...accumulated]);
          }
        }
      } catch (err) {
        console.warn("Could not background load QA shards:", err);
      }
    }

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(() => loadMoreQuestions(), { timeout: 1500 });
      } else {
        setTimeout(loadMoreQuestions, 300);
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [totalQuestionCount, initialQuestions]);

  // Pre-calculate filter counts for real-time badges
  const { techCounts, archetypeCounts } = useMemo(() => {
    return computeFilterCounts(questions, bookmarks);
  }, [questions, bookmarks]);

  // Synchronize URL search parameters
  useEffect(() => {
    const qParam = searchParams.get("q") || searchParams.get("search");
    const domainParam = searchParams.get("domain") || searchParams.get("category");
    const techParam = (searchParams.get("tech") || searchParams.get("ecosystem") || "").toUpperCase() as TechEcosystemId;
    const archetypeParam = (searchParams.get("archetype") || searchParams.get("scenario") || "").toUpperCase() as ScenarioArchetypeId;
    const diffParam = searchParams.get("difficulty");
    const cardParam = searchParams.get("card") || searchParams.get("id");

    if (qParam !== null) {
      setSearchQuery(qParam);
    }

    if (domainParam) {
      setSelectedDomain(domainParam);
    }

    if (techParam && TECH_ECOSYSTEMS.some((e) => e.id === techParam)) {
      setSelectedTech(techParam);
    }

    if (archetypeParam && SCENARIO_ARCHETYPES.some((a) => a.id === archetypeParam)) {
      setSelectedArchetype(archetypeParam);
    }

    if (diffParam && ["EASY", "MEDIUM", "HARD", "ARCHITECT", "ALL"].includes(diffParam.toUpperCase())) {
      setSelectedDifficulty(diffParam.toUpperCase());
    }

    if (cardParam) {
      const target = questions.find((item) => item.id === cardParam);
      if (target) {
        setExpandedIds((prev) => new Set([...prev, target.id]));
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = setTimeout(() => {
          const el = document.getElementById(`question-${target.id}`) || document.getElementById(target.id);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 250);
      }
    }
  }, [searchParams, questions]);

  const handleShuffle = useCallback(() => {
    setIsShuffled(true);
    setShuffleSeed((s) => s + 1);
    toast.success("Shuffled questions order");
  }, []);

  const handleResetOrder = useCallback(() => {
    setIsShuffled(false);
    toast.info("Reset to default order");
  }, []);

  const handleResetAllFilters = useCallback(() => {
    setSelectedTech("ALL");
    setSelectedArchetype("ALL");
    setSelectedDomain("ALL");
    setSelectedDifficulty("ALL");
    setSearchQuery("");
    toast.info("Cleared all filters");
  }, []);

  // Multi-dimensional filtering logic
  const filteredQuestions = useMemo(() => {
    let result = questions;

    // 1. Tech Ecosystem Filter (Topics)
    if (selectedTech !== "ALL") {
      result = result.filter((item) => matchTechEcosystem(item, selectedTech));
    }

    // 2. Difficulty Filter
    if (selectedDifficulty !== "ALL") {
      result = result.filter((item) => item.difficulty === selectedDifficulty);
    }

    // 3. Scenario Archetype / Hotspot Filter (if passed via URL/bookmark)
    if (selectedArchetype !== "ALL") {
      result = result.filter((item) =>
        matchScenarioArchetype(item, selectedArchetype, undefined, bookmarks)
      );
    }

    // 5. Standardized Domain Filter (if passed via URL)
    if (selectedDomain !== "ALL") {
      result = result.filter((item) => matchDomain(item, selectedDomain));
    }

    // 5. Full-text search
    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase().trim();
      result = result.filter((item) => {
        const text = getQuestionSearchCorpus(item);
        return (
          text.includes(q) ||
          (item.answer && item.answer.toLowerCase().includes(q)) ||
          (item.code && item.code.toLowerCase().includes(q))
        );
      });
    }

    // 6. Shuffled Order
    if (isShuffled) {
      result = [...result].sort((a, b) => {
        const hashA = (a.id.length * 37 + shuffleSeed) % 100;
        const hashB = (b.id.length * 37 + shuffleSeed) % 100;
        return hashA - hashB;
      });
    }

    return result;
  }, [
    questions,
    selectedTech,
    selectedArchetype,
    selectedDomain,
    selectedDifficulty,
    deferredSearch,
    isShuffled,
    shuffleSeed,
    bookmarks,
  ]);

  // Adjust studyIndex if bounds change
  useEffect(() => {
    if (studyIndex >= filteredQuestions.length && filteredQuestions.length > 0) {
      setStudyIndex(0);
    }
  }, [filteredQuestions.length, studyIndex]);

  // Window Virtualization for Questions List
  const virtualizer = useWindowVirtualizer({
    count: filteredQuestions.length,
    estimateSize: () => 110,
    overscan: 5,
    scrollToFn: (offset, options) => {
      if (options.adjustments !== undefined && options.adjustments !== 0) {
        return;
      }
      window.scrollTo({
        top: offset,
        behavior: options.behavior,
      });
    },
  });

  useEffect(() => {
    virtualizer.shouldAdjustScrollPositionOnItemSizeChange = () => false;
  }, [virtualizer]);

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

  const handleExpandAll = useCallback(() => {
    setIsReadAllMode(true);
    setCollapsedInReadMode(new Set());
    toast.success(`Read All Mode: All ${filteredQuestions.length.toLocaleString()} cards expanded`);
  }, [filteredQuestions.length]);

  const handleCollapseAll = useCallback(() => {
    setIsReadAllMode(false);
    setExpandedIds(new Set());
    setCollapsedInReadMode(new Set());
    toast.info("Collapsed all cards");
  }, []);

  const toggleReadAllMode = useCallback(() => {
    if (!isReadAllMode) {
      handleExpandAll();
    } else {
      handleCollapseAll();
    }
  }, [isReadAllMode, handleExpandAll, handleCollapseAll]);

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

  // Global Keyboard Shortcut: Shift + E to toggle Read All Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "E" && e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleReadAllMode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleReadAllMode]);

  const currentStudyCard = filteredQuestions[studyIndex];

  const hasActiveFilters =
    selectedTech !== "ALL" ||
    selectedArchetype !== "ALL" ||
    selectedDomain !== "ALL" ||
    selectedDifficulty !== "ALL" ||
    searchQuery.trim().length > 0;

  const currentTechObj = TECH_ECOSYSTEMS.find((e) => e.id === selectedTech);
  const currentArchetypeObj = SCENARIO_ARCHETYPES.find((a) => a.id === selectedArchetype);

  return (
    <div className="space-y-3.5 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header Banner - Compact Reference Standard */}
      <div className="relative overflow-hidden rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3 sm:p-4 shadow-xs isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1 max-w-4xl 2xl:max-w-6xl">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-400">
              <MessageSquare size={12} />
              <span>Production Interview Scenarios</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] break-words">
              {totalCount.toLocaleString()}+ Senior Data Engineering &amp; Architect Q&amp;A
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
              Real-world technical questions with deep architectural answers, code implementations, and trade-off rubrics across Microsoft Fabric, Databricks, Spark, Delta Lake, Airflow, dbt, and Lakehouse architectures.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <div className="px-3 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-sm sm:text-base font-bold text-blue-400 font-mono">
                {filteredQuestions.length.toLocaleString()}
              </div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-mono leading-none">
                Matching Q&amp;As
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── UNIFIED SEARCH & SIMPLE 3-SLICER FILTER BOX ─── */}
      <UnifiedSearchFilterBox
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={`Search ${totalCount.toLocaleString()}+ questions by keyword, mechanism, syntax... (Press / to search)`}
        matchCount={filteredQuestions.length}
        totalCount={totalCount}
        countUnit="Qs"
        themeAccent="blue"
        hasActiveFilters={hasActiveFilters}
        onResetAll={handleResetAllFilters}
        actions={{
          readAll: {
            isActive: isReadAllMode,
            onToggle: toggleReadAllMode,
            shortcut: "⇧E",
            count: filteredQuestions.length,
          },
          studyMode: {
            isActive: isStudyMode,
            onToggle: () => setIsStudyMode(!isStudyMode),
          },
          expandCollapse: {
            onExpandAll: handleExpandAll,
            onCollapseAll: handleCollapseAll,
          },
        }}
        levels={[
          {
            id: "topics",
            title: "Topics & Technology Ecosystem",
            shortTitle: "Topics",
            icon: <Zap size={13} className="text-amber-500" />,
            layout: "chips",
            accentColor: "blue",
            selectedId: selectedTech,
            onSelect: (id) => setSelectedTech(id as TechEcosystemId),
            options: TECH_ECOSYSTEMS.map((eco) => ({
              id: eco.id,
              label: eco.label,
              shortLabel: eco.shortLabel,
              description: eco.description,
              count: eco.id === "ALL" ? totalCount : techCounts[eco.id] || 0,
            })),
          },
          {
            id: "difficulty",
            title: "Difficulty Calibration",
            shortTitle: "Difficulty",
            icon: <Sparkles size={13} className="text-amber-400" />,
            layout: "segmented",
            selectedId: selectedDifficulty,
            onSelect: (id) => setSelectedDifficulty(id),
            options: [
              { id: "ALL", label: "ALL" },
              { id: "EASY", label: "EASY" },
              { id: "MEDIUM", label: "MEDIUM" },
              { id: "HARD", label: "HARD" },
              { id: "ARCHITECT", label: "ARCH" },
            ],
          },
        ]}
        activeFilters={[
          ...(isReadAllMode
            ? [
                {
                  id: "readall",
                  label: `Read All Mode Active (${filteredQuestions.length.toLocaleString()} Cards)`,
                  color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold",
                  onRemove: handleCollapseAll,
                },
              ]
            : []),
          ...(selectedTech !== "ALL" && currentTechObj
            ? [
                {
                  id: "tech",
                  label: `Topic: ${currentTechObj.label}`,
                  color: "bg-blue-500/10 border-blue-500/30 text-blue-400",
                  onRemove: () => setSelectedTech("ALL"),
                },
              ]
            : []),
          ...(selectedDifficulty !== "ALL"
            ? [
                {
                  id: "difficulty",
                  label: `Difficulty: ${selectedDifficulty}`,
                  color: "bg-amber-500/10 border-amber-500/30 text-amber-400",
                  onRemove: () => setSelectedDifficulty("ALL"),
                },
              ]
            : []),
          ...(searchQuery.trim().length > 0
            ? [
                {
                  id: "search",
                  label: `Search: "${searchQuery}"`,
                  color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                  onRemove: () => setSearchQuery(""),
                },
              ]
            : []),
        ]}
      />

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
            <div className="py-16 text-center rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-8 space-y-3">
              <Layers size={36} className="mx-auto text-[var(--muted-foreground)] opacity-40" />
              <h3 className="text-sm font-semibold text-[var(--foreground)]">No matching questions</h3>
              <p className="text-xs text-[var(--muted-foreground)]">Try adjusting your filters or clearing search criteria.</p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetAllFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-all cursor-pointer shadow-xs"
                >
                  <RotateCw size={12} />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          ) : (
            <div
              data-virtual-container="true"
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
                overflowAnchor: "none",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const q = filteredQuestions[virtualRow.index];
                if (!q) return null;
                const isExpanded = isReadAllMode ? !collapsedInReadMode.has(q.id) : expandedIds.has(q.id);
                const isBookmarked = bookmarks.includes(q.id);
                const diffStyle = difficultyColors[q.difficulty] || difficultyColors.MEDIUM;
                const hasCode = questionHasCode(q);

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
                        "rounded-xl border transition-all duration-200 overflow-hidden bg-[var(--surface-1)] scroll-mt-20",
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
                              {hasCode && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <Code2 size={10} /> Code
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm sm:text-[15px] font-bold text-[var(--foreground)] leading-snug break-words whitespace-normal">
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
                          <div className="pt-1 text-xs sm:text-[13px] text-[var(--foreground)] leading-relaxed break-words whitespace-normal">
                            <AnswerRenderer text={q.answer} />
                          </div>

                          {(() => {
                            const matchingDiagram = getQuestionMatchingDiagram(q, diagrams);
                            if (!matchingDiagram) return null;
                            return (
                              <div className="pt-2 border-t border-[var(--border)]/40 flex items-center justify-between">
                                <Link
                                  href={`/architecture?tab=diagrams&id=${matchingDiagram.id}`}
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors"
                                >
                                  <span>📐 Architecture Blueprint: {matchingDiagram.title}</span>
                                  <ArrowRight size={12} />
                                </Link>
                              </div>
                            );
                          })()}
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
