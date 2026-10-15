"use client";

import React, { useState, useMemo, useEffect, useCallback, useDeferredValue, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import {
  Search,
  BookOpen,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  Filter,
  Layers,
  FileCode2,
  MessageSquare,
  Compass,
  Zap,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Concept, Difficulty } from "@/types/data";
import { ArchitectureDiagramItem } from "@/data/diagrams";
import dynamic from "next/dynamic";
import { recordLastTopic } from "@/lib/user-progress";
import { HubSubnav } from "@/components/layout/hub-subnav";
import { TopicIcon } from "@/components/ui/topic-icon";

const SmoothAccordion = dynamic(
  () => import("@/components/ui/smooth-accordion").then((mod) => mod.SmoothAccordion),
  { ssr: false }
);

function getCategoryTopicKey(cat: string): string {
  const c = cat.toLowerCase();
  if (c.includes("spark")) return "spark";
  if (c.includes("databricks")) return "databricks";
  if (c.includes("fabric")) return "fabric";
  if (c.includes("airflow")) return "airflow";
  if (c.includes("dbt")) return "dbt";
  if (c.includes("adf") || c.includes("data factory")) return "adf";
  if (c.includes("lake") || c.includes("delta")) return "datalake";
  if (c.includes("sql")) return "sql";
  if (c.includes("power bi") || c.includes("powerbi")) return "powerbi";
  if (c.includes("python")) return "python";
  return "architecture";
}

function getConceptMatchingDiagram(concept: Concept, diagrams: ArchitectureDiagramItem[]): ArchitectureDiagramItem | undefined {
  if (!diagrams || diagrams.length === 0) return undefined;
  const text = `${concept.term} ${concept.category} ${concept.explanation}`.toLowerCase();
  
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
  if (text.includes("onelake") || text.includes("shortcut") || (concept.category.includes("FABRIC") && text.includes("lakehouse"))) {
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

const difficultyColors: Record<Difficulty, { bg: string; text: string; border: string }> = {
  EASY: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  MEDIUM: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  HARD: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  ARCHITECT: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

interface ConceptsClientProps {
  initialConcepts: Concept[];
  categories: string[];
  diagrams?: ArchitectureDiagramItem[];
}

export function ConceptsClient({ initialConcepts, categories, diagrams = [] }: ConceptsClientProps) {
  const searchParams = useSearchParams();
  const initialTerm = searchParams.get("term") || "";

  const [searchQuery, setSearchQuery] = useState(initialTerm);
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // Study Mode State
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleShuffle = useCallback(() => {
    setIsShuffled(true);
    setShuffleSeed((s) => s + 1);
    toast.success("Shuffled concepts order");
  }, []);

  const handleResetOrder = useCallback(() => {
    setIsShuffled(false);
    toast.info("Reset to default order");
  }, []);

  // Sync bookmarks from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("dataprep_bookmarks");
      if (saved) setBookmarks(JSON.parse(saved));
    } catch {}
  }, []);

  // Reactively synchronize URL search parameters (term, q, search, category, difficulty, card, id)
  useEffect(() => {
    const termParam = searchParams.get("term") || searchParams.get("q") || searchParams.get("search");
    const catParam = searchParams.get("category");
    const diffParam = searchParams.get("difficulty");
    const cardParam = searchParams.get("card") || searchParams.get("id");

    if (termParam !== null) {
      setSearchQuery(termParam);
    }

    if (catParam) {
      const match = categories.find((c) => c.toLowerCase() === catParam.toLowerCase());
      if (match) {
        setSelectedCategory(match);
      } else {
        setSelectedCategory(catParam);
      }
    }

    if (diffParam && ["EASY", "MEDIUM", "HARD", "ARCHITECT", "ALL"].includes(diffParam.toUpperCase())) {
      setSelectedDifficulty(diffParam.toUpperCase());
    }

    if (cardParam) {
      const target = initialConcepts.find(
        (c) => c.id === cardParam || c.term.toLowerCase() === cardParam.toLowerCase()
      );
      if (target) {
        setExpandedIds((prev) => new Set([...prev, target.id]));
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = setTimeout(() => {
          const el = document.getElementById(`concept-${target.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 250);
      }
    }
  }, [searchParams, categories, initialConcepts]);

  // Filter concepts
  const filteredConcepts = useMemo(() => {
    let result = initialConcepts;

    if (selectedCategory !== "ALL") {
      result = result.filter((c) => c.category === selectedCategory);
    }

    if (selectedDifficulty !== "ALL") {
      result = result.filter((c) => c.difficulty === selectedDifficulty);
    }

    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.term.toLowerCase().includes(q) ||
          c.definition.toLowerCase().includes(q) ||
          c.explanation.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.keyPoints.some((p) => p.toLowerCase().includes(q))
      );
    }

    if (isShuffled) {
      result = [...result].sort((a, b) => {
        const hashA = (a.id.length * 31 + shuffleSeed) % 100;
        const hashB = (b.id.length * 31 + shuffleSeed) % 100;
        return hashA - hashB;
      });
    }

    return result;
  }, [initialConcepts, selectedCategory, selectedDifficulty, deferredSearch, isShuffled, shuffleSeed]);

  // Window Virtualization for concepts list
  const virtualizer = useWindowVirtualizer({
    count: filteredConcepts.length,
    estimateSize: () => 120,
    overscan: 4,
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
      toast.success(bookmarks.includes(id) ? "Removed from bookmarks" : "Bookmarked concept");
    } catch {}
  };

  const copyToClipboard = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied definition to clipboard");
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

  const currentStudyCard = filteredConcepts[studyIndex];

  return (
    <div className="space-y-4 pb-16">
      <HubSubnav
        hubTitle="Foundations & Concepts"
        items={[
          { label: "Concepts Library", href: "/concepts", icon: BookOpen },
          { label: "Spark Engine", href: "/spark-engine", icon: Zap },
          { label: "Modern Stack", href: "/modern-stack", icon: Layers },
        ]}
      />

      {/* DOUBLE-LINE TOP SLICERS & FILTERS DECK */}
      <div className="space-y-2 p-2.5 sm:p-3 rounded-2xl bg-[var(--surface-1)] border-2 border-[var(--border)] shadow-xs">
        {/* LINE 1: CATEGORY SLICERS */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] shrink-0 mr-1 flex items-center gap-1">
            <Filter size={11} /> Categories:
          </span>
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer",
              selectedCategory === "ALL"
                ? "bg-blue-600 border-blue-500 text-white shadow-xs"
                : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            All Domains ({initialConcepts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer",
                selectedCategory === cat
                  ? "bg-blue-600 border-blue-500 text-white shadow-xs"
                  : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* LINE 2: SEARCH FILTER + DIFFICULTY SLICERS + FLASHCARDS BUTTON */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-[var(--border)]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts by term, keyword, or mechanism..."
              className="w-full pl-9 pr-12 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs sm:text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
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

          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto scrollbar-none">
            {/* Difficulty Selector */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
              {["ALL", "EASY", "MEDIUM", "HARD", "ARCHITECT"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                    selectedDifficulty === diff
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Study Mode Flashcard Button */}
            <button
              onClick={() => setIsStudyMode(!isStudyMode)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs whitespace-nowrap",
                isStudyMode
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-3)]"
              )}
            >
              <Zap size={13} />
              <span>{isStudyMode ? "Exit Flashcards" : "Flashcards"}</span>
            </button>

            <span className="text-[11px] text-[var(--muted-foreground)] whitespace-nowrap pl-1 hidden lg:inline">
              <strong className="text-[var(--foreground)]">{filteredConcepts.length}</strong> concepts
            </span>
          </div>
        </div>
      </div>

      {/* Hero Header Summary */}
      <div className="relative rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-3 sm:p-4 overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h1 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight">
              Enterprise Data Platform Concepts Library
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] max-w-3xl leading-snug">
              Master the foundational and architectural definitions across Microsoft Fabric, Azure Databricks, Apache Airflow, Delta Lake, and Modern Data Stack.
            </p>
          </div>
          <div className="text-xs text-[var(--muted-foreground)] shrink-0">
            Showing <strong className="text-[var(--foreground)]">{filteredConcepts.length}</strong> of {initialConcepts.length} concepts
          </div>
        </div>
      </div>

      {/* Study Flashcard Mode */}
      {isStudyMode && currentStudyCard && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-blue-500/30 shadow-md space-y-3.5">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px]">
              Flashcard {studyIndex + 1} of {filteredConcepts.length}
            </span>
            <span className="font-mono text-[10px]">{currentStudyCard.category}</span>
          </div>

          <div
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="min-h-[170px] p-4 sm:p-5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col justify-center items-center text-center cursor-pointer select-none space-y-3 hover:border-blue-500/30 transition-all"
          >
            {!isCardFlipped ? (
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Term</span>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
                  {currentStudyCard.term}
                </h3>
                <p className="text-[11px] text-[var(--muted-foreground)] pt-2">Click card or spacebar to reveal definition</p>
              </div>
            ) : (
              <div className="space-y-2 max-w-xl text-left">
                <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} /> Official Definition &amp; Explanation
                </span>
                <p className="text-xs sm:text-sm font-medium text-[var(--foreground)] leading-relaxed">
                  {currentStudyCard.definition}
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                  {currentStudyCard.explanation}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setIsCardFlipped(false);
                setStudyIndex((i) => (i === 0 ? filteredConcepts.length - 1 : i - 1));
              }}
              className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => {
                setIsCardFlipped(false);
                setStudyIndex((i) => (i + 1) % filteredConcepts.length);
              }}
              className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* VIRTUALIZED CONCEPTS LIST */}
      {!isStudyMode && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
            <span>
              Showing <strong className="text-[var(--foreground)]">{filteredConcepts.length}</strong> matching concepts
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

          {filteredConcepts.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-8">
              <Layers size={36} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-40" />
              <h3 className="text-sm font-semibold text-[var(--foreground)]">No matching concepts</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Try another keyword or category filter.</p>
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
                const concept = filteredConcepts[virtualRow.index];
                if (!concept) return null;
                const isExpanded = expandedIds.has(concept.id);
                const isBookmarked = bookmarks.includes(concept.id);
                const diffStyle = difficultyColors[concept.difficulty] || difficultyColors.MEDIUM;

                return (
                  <div
                    key={concept.id}
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
                      id={`concept-${concept.id}`}
                      className={cn(
                        "rounded-xl border transition-all duration-200 overflow-hidden bg-[var(--surface-1)] scroll-mt-20",
                        isExpanded ? "border-blue-500/40 shadow-xs" : "border-[var(--border)] hover:border-[var(--border-hover)]"
                      )}
                    >
                      <div
                        onClick={() => toggleExpand(concept.id)}
                        className="p-3 sm:p-3.5 cursor-pointer select-none space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
                                {concept.category}
                              </span>
                              <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded border", diffStyle.bg, diffStyle.text, diffStyle.border)}>
                                {concept.difficulty}
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight leading-snug">
                              {concept.term}
                            </h3>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => toggleBookmark(concept.id, e)}
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
                              onClick={(e) => copyToClipboard(concept.definition, concept.id, e)}
                              className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                              title="Copy Definition"
                            >
                              {copiedId === concept.id ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                            </button>
                            <span className="p-1 text-[var(--muted-foreground)]">
                              <ChevronDown size={15} className={cn("transition-transform duration-200", isExpanded && "rotate-180")} />
                            </span>
                          </div>
                        </div>

                        {/* Distinguishable Definition Callout Container */}
                        <div className="rounded-lg border-l-2 border-blue-500 bg-[var(--surface-2)]/60 px-3 py-1.5 my-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                            Official Definition
                          </span>
                          <p className="text-xs sm:text-[13px] text-[var(--foreground)] font-medium leading-relaxed">
                            {concept.definition}
                          </p>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-1 border-t border-[var(--border)]/60 bg-[var(--surface-2)]/30 space-y-2">
                          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/50 p-2.5 space-y-1 mt-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                              <Sparkles size={12} /> Detailed Explanation:
                            </span>
                            <p className="text-xs sm:text-[13px] text-[var(--foreground)] leading-relaxed">
                              {concept.explanation}
                            </p>
                          </div>

                          {concept.keyPoints && concept.keyPoints.length > 0 && (
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 p-3.5 space-y-1.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
                                <Zap size={13} /> Architectural Key Points:
                              </span>
                              <ul className="space-y-1 text-xs text-[var(--foreground)] list-disc pl-4">
                                {concept.keyPoints.map((pt, idx) => (
                                  <li key={idx} className="leading-relaxed">
                                    {pt}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                            <Link
                              href={`/qa-prep?q=${encodeURIComponent(concept.term)}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
                            >
                              <MessageSquare size={13} />
                              <span>Practice Q&amp;As on {concept.term}</span>
                            </Link>
                            {(() => {
                              const matchingDiagram = getConceptMatchingDiagram(concept, diagrams);
                              if (!matchingDiagram) return null;
                              return (
                                <Link
                                  href={`/architecture?tab=diagrams&id=${matchingDiagram.id}`}
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors"
                                >
                                  <span>📐 Blueprint: {matchingDiagram.title}</span>
                                  <ArrowRight size={12} />
                                </Link>
                              );
                            })()}
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
