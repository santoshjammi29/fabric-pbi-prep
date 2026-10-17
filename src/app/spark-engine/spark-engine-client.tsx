"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Zap,
  Cpu,
  Calculator,
  BookOpen,
  Activity,
  Layers,
  ChevronDown,
  ShieldCheck,
  Search,
  MessageSquare,
  FileCode2,
  GitMerge,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Flame,
  Workflow,
  Table,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { architectureDiagrams, ArchitectureDiagramItem } from "@/data/diagrams";
import { CodeSheetItem } from "@/types/data";
import { WhiteboardCard } from "@/components/architecture/whiteboard-card";
import { WhiteboardThemeToggle } from "@/components/architecture/whiteboard-theme-toggle";
import { useDiagramTheme } from "@/lib/diagram-theme";
import { CodeBlock } from "@/components/ui/code-block";
import { SmoothAccordion } from "@/components/ui/smooth-accordion";
import { PrerequisiteBanner } from "@/components/ui/prerequisite-banner";
import { recordLastTopic } from "@/lib/user-progress";

type SparkSubtab = "architecture" | "simulator" | "memory" | "curriculum" | "lexicon";

interface LexiconTerm {
  term: string;
  category: "engine" | "optimization" | "memory" | "streaming";
  badge: string;
  def: string;
}

const lexiconTerms: LexiconTerm[] = [
  {
    term: "Shuffle Operations",
    category: "engine",
    badge: "Stage Split",
    def: "The critical physical barrier where partition data is sorted and distributed across executors over the network. Driven by wide dependencies such as groupBy or join. Shuffles split lineage into separate Stages.",
  },
  {
    term: "Adaptive Query Execution (AQE)",
    category: "optimization",
    badge: "Dynamic Runtime",
    def: "Optimizes runtime performance by re-planning execution mid-flight. AQE uses runtime statistics collected from completed shuffle maps to dynamically coalesce small partitions, optimize join strategies, and isolate skew.",
  },
  {
    term: "Tungsten Execution Engine",
    category: "optimization",
    badge: "Bytecode CodeGen",
    def: "Bypasses JVM memory and GC overheads. Tungsten features raw Off-Heap Memory Allocations using binary row format (UnsafeRow) and compiles complex operations down to raw JVM bytecode using Whole-Stage Code Generation.",
  },
  {
    term: "Dynamic Partition Pruning (DPP)",
    category: "optimization",
    badge: "Lakehouse Filter",
    def: "When joining a large fact table with a filtered dimension table, DPP dynamically extracts the filter results from the dimension and injects them into the fact table scan. This entirely bypasses scanning irrelevant partitions in Delta/Iceberg tables.",
  },
  {
    term: "Kryo Serialization",
    category: "memory",
    badge: "SerDe Protocol",
    def: "A highly optimized, compact binary serialization protocol that outperforms default Java serialization. Recommended for shuffle data exchanges and persistent RDD cache levels to reduce raw network payload sizes.",
  },
  {
    term: "RocksDB State Store",
    category: "streaming",
    badge: "Real-Time SSD",
    def: "An out-of-core, high-performance transactional state store used in Structured Streaming. It stores data on local SSDs, preventing Java GC limits from capping state retention during large-scale operations.",
  },
  {
    term: "Directed Acyclic Graph (DAG)",
    category: "engine",
    badge: "Logical Lineage",
    def: "The logical representation of transformations applied to your source dataset. Spark uses the DAG to rebuild lost partitions and compute physical runtime execution branches efficiently.",
  },
  {
    term: "Broadcast Hash Join (BHJ)",
    category: "optimization",
    badge: "Map-Side Join",
    def: "Broadcasts small lookup tables (<10MB by default, configurable via spark.sql.autoBroadcastJoinThreshold) to all worker nodes, eliminating expensive network shuffles.",
  },
];

export interface SparkEngineClientProps {
  initialPyspark: CodeSheetItem[];
}

export function SparkEngineClient({ initialPyspark }: SparkEngineClientProps) {
  const pysparkData = initialPyspark;
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SparkSubtab>("architecture");
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const simTimersRef = useRef<NodeJS.Timeout[]>([]);

  const clearSimTimers = useCallback(() => {
    simTimersRef.current.forEach((t: NodeJS.Timeout) => clearTimeout(t));
    simTimersRef.current = [];
  }, []);

  // Simulator State
  const [flowType, setFlowType] = useState<"narrow" | "wide" | "broadcast" | "aggregation">("narrow");
  const [simStep, setSimStep] = useState(0);
  const [isSimRunning, setIsSimRunning] = useState(false);

  // Memory Allocator State
  const [heapSize, setHeapSize] = useState(16);
  const [memFraction, setMemFraction] = useState(0.6);
  const [storageFraction, setStorageFraction] = useState(0.5);

  // Whiteboard Blueprint State & Filtering
  const [diagramTheme] = useDiagramTheme();
  const [activeModalDiagram, setActiveModalDiagram] = useState<ArchitectureDiagramItem | null>(null);
  const [modalZoomLevel, setModalZoomLevel] = useState(1);

  const sparkDiagrams = useMemo(() => {
    const ids = [
      "spark-catalyst-photon-engine",
      "spark-shuffle-memory-execution",
      "spark-data-skew-aqe-optimization",
      "delta-lake-under-the-hood",
      "databricks-dabs-devops-pipeline",
      "databricks-platform-master",
    ];
    return ids
      .map((id) => architectureDiagrams.find((d) => d.id === id))
      .filter((d): d is ArchitectureDiagramItem => !!d);
  }, []);

  const handleTabChange = useCallback((tabId: SparkSubtab) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabId);
      url.hash = tabId;
      window.history.replaceState(null, "", url.toString());
    }
    const tabLabels: Record<SparkSubtab, string> = {
      architecture: "Spark 4.0 Engine Architecture",
      simulator: "Spark Physical Execution Simulator",
      memory: "Tungsten Memory Mapper",
      curriculum: "32-Level PySpark Curriculum",
      lexicon: "Spark Architect's Lexicon",
    };
    recordLastTopic({
      title: tabLabels[tabId] || "Spark Engine Hub",
      href: `/spark-engine?tab=${tabId}#${tabId}`,
      category: "Spark Engine Hub",
      progress: 50,
    });
  }, []);

  const handleFlowTypeChange = useCallback((type: "narrow" | "wide" | "broadcast" | "aggregation") => {
    setFlowType(type);
    setSimStep(0);
    clearSimTimers();
    setIsSimRunning(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("flow", type);
      window.history.replaceState(null, "", url.toString());
    }
  }, [clearSimTimers]);

  useEffect(() => {
    const syncTabFromLocation = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const queryTab = params.get("tab")?.toLowerCase();
      const queryFlow = params.get("flow")?.toLowerCase();
      const target = hash || queryTab;

      const validTabs: SparkSubtab[] = [
        "architecture",
        "simulator",
        "memory",
        "curriculum",
        "lexicon",
      ];

      if (target && validTabs.includes(target as SparkSubtab)) {
        setActiveTab(target as SparkSubtab);
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = setTimeout(() => {
          const el = document.getElementById(target);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }

      if (queryFlow && ["narrow", "wide", "broadcast", "aggregation"].includes(queryFlow)) {
        setFlowType(queryFlow as "narrow" | "wide" | "broadcast" | "aggregation");
      }
    };

    syncTabFromLocation();
    window.addEventListener("hashchange", syncTabFromLocation);
    window.addEventListener("popstate", syncTabFromLocation);
    return () => {
      window.removeEventListener("hashchange", syncTabFromLocation);
      window.removeEventListener("popstate", syncTabFromLocation);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      clearSimTimers();
    };
  }, [clearSimTimers]);

  // Reactively synchronize from Next.js router searchParams (?tab=, ?flow=)
  useEffect(() => {
    const queryTab = searchParams.get("tab")?.toLowerCase();
    const queryFlow = searchParams.get("flow")?.toLowerCase();

    const validTabs: SparkSubtab[] = [
      "architecture",
      "simulator",
      "memory",
      "curriculum",
      "lexicon",
    ];

    if (queryTab && validTabs.includes(queryTab as SparkSubtab)) {
      setActiveTab(queryTab as SparkSubtab);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        const el = document.getElementById(queryTab);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }

    if (queryFlow && ["narrow", "wide", "broadcast", "aggregation"].includes(queryFlow)) {
      setFlowType(queryFlow as "narrow" | "wide" | "broadcast" | "aggregation");
    }
  }, [searchParams]);

  // Lexicon Search State
  const [lexiconQuery, setLexiconQuery] = useState("");
  const [selectedLexiconCat, setSelectedLexiconCat] = useState<string>("all");

  // Curriculum State
  const [selectedPhase, setSelectedPhase] = useState<number | "all">("all");
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());

  const toggleLevelExpand = useCallback((id: string) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Simulator Flow Definitions
  const simFlowDetails = {
    narrow: {
      title: "Narrow Dependency (Map / Filter)",
      mechanics: "Tasks run completely in-place within each partition without data exchange over network interfaces. Zero shuffle boundaries.",
      benefit: "Extremely low serialization overhead. No stage boundaries; single Stage execution.",
      shuffled: "0 Bytes",
      tasks: "2 Tasks",
      stages: "0 Stages",
    },
    wide: {
      title: "Wide Dependency (Sort-Merge Shuffle Join)",
      mechanics: "All executor nodes write partition hash buckets to local disk, followed by a cluster-wide network exchange (Shuffle Fetch).",
      benefit: "Handles multi-terabyte unbroadcastable joins, but incurs heavy network serialization and disk I/O.",
      shuffled: "~18.4 GB",
      tasks: "200 Tasks",
      stages: "2 Stages",
    },
    broadcast: {
      title: "Map-Side Join (Broadcast Hash Join)",
      mechanics: "The Driver JVM serializes the dimension table and broadcasts it via BitTorrent protocol to all worker nodes.",
      benefit: "Avoids whole-dataset shuffling. Fact table partitions are filtered and joined locally in memory.",
      shuffled: "~12 MB (Broadcast only)",
      tasks: "8 Tasks",
      stages: "0 Stages",
    },
    aggregation: {
      title: "Two-Phase Aggregation (reduceByKey / HashAggregate)",
      mechanics: "Map-side combiner partially reduces rows inside Tungsten memory before sending compressed hash aggregates across network.",
      benefit: "Reduces raw network shuffle size by up to 90% compared to groupByKey.",
      shuffled: "~2.1 GB",
      tasks: "50 Tasks",
      stages: "1 Stage",
    },
  };

  const runSimulation = () => {
    clearSimTimers();
    setIsSimRunning(true);
    setSimStep(1);
    const t1 = setTimeout(() => setSimStep(2), 700);
    const t2 = setTimeout(() => {
      setSimStep(3);
      setIsSimRunning(false);
    }, 1500);
    simTimersRef.current.push(t1, t2);
  };

  // Memory Calculations
  const reservedMemMB = 300;
  const totalHeapMB = heapSize * 1024;
  const usableHeapMB = Math.max(0, totalHeapMB - reservedMemMB);
  const sparkMemoryMB = usableHeapMB * memFraction;
  const userMemoryMB = usableHeapMB * (1 - memFraction);
  const storagePoolMB = sparkMemoryMB * storageFraction;
  const executionPoolMB = sparkMemoryMB * (1 - storageFraction);

  const filteredLexicon = useMemo(() => {
    return lexiconTerms.filter((item) => {
      if (selectedLexiconCat !== "all" && item.category !== selectedLexiconCat) {
        return false;
      }
      if (lexiconQuery.trim()) {
        const q = lexiconQuery.toLowerCase();
        return item.term.toLowerCase().includes(q) || item.def.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedLexiconCat, lexiconQuery]);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 space-y-3.5 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3 sm:p-4 shadow-xs isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1 max-w-4xl 2xl:max-w-6xl">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[10px] font-semibold text-red-400">
              <Zap size={11} />
              <span>Step 3 · Distributed Engine Internals</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] break-words">
              Apache Spark &amp; Tungsten Engine Hub
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
              Deep-dive into Spark physical execution plans, memory management, Catalyst optimizers,
              live partition flow simulators, and the 32-level PySpark curriculum.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-sm sm:text-base font-bold text-red-400 leading-none">Spark 4.0</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium mt-0.5">Ready Engine</div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-sm sm:text-base font-bold text-amber-400 leading-none">32</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium mt-0.5">Curriculum Levels</div>
            </div>
          </div>
        </div>
      </div>

      {/* Databricks & Spark Core Cheat Sheet Cross-Link */}
      <div className="p-3 sm:p-3.5 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-purple-500/5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-500 dark:text-red-400 flex items-center justify-center shrink-0">
            <Flame size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                Databricks &amp; Spark Core Architecture Cheat Sheets
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                48 Cards &amp; Wall Posters
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)] break-words mt-0.5">
              Vector PDFs and 250-DPI posters covering Spark Core &amp; Architecture Internals, PySpark, Spark SQL, and JVM Memory Formulas.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Link
            href="/cheat-sheet?tab=databricks&domain=spark_core"
            className="flex-1 sm:flex-none text-center px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Spark Core Cheat Sheet &rarr;
          </Link>
          <a
            href="/cheatsheets/pdf/databricks_spark_core_cheatsheet.pdf"
            download
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-semibold text-[var(--foreground)] transition-colors"
          >
            <Download size={13} className="text-red-400" />
            <span>PDF (2p)</span>
          </a>
        </div>
      </div>

      {/* Prerequisite Cognitive Scaffolding Banner */}
      <PrerequisiteBanner
        moduleTitle="Apache Spark 4.0 Engine Internals"
        prerequisites={[
          {
            term: "Lakehouse vs Data Warehouse",
            conceptId: "fabric-lakehouse",
            whyNeeded: "Understand why Spark executes transformations against open object storage formats rather than relational database engines.",
          },
          {
            term: "Medallion Architecture",
            conceptId: "fabric-medallion",
            whyNeeded: "Provides the structured data pipeline boundaries (Bronze raw, Silver validated, Gold business) where Spark tasks execute.",
          },
          {
            term: "Delta Lake & ACID",
            conceptId: "dl-delta-lake",
            whyNeeded: "Learn how Spark safely writes transactional Parquet logs without concurrent write collisions or partial write corruption.",
          },
        ]}
      />

      {/* 4-Layer Integrated Domain Taxonomy */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Link
          href="/concepts?term=Spark"
          className="p-2.5 sm:p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-blue-500/40 transition-all flex items-center gap-2 group"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen size={14} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Layer 1 · Concepts</div>
            <div className="text-xs font-bold text-[var(--foreground)] break-words group-hover:text-blue-500">Spark Definitions</div>
          </div>
        </Link>

        <Link
          href="/code-practice?db=pyspark"
          className="p-2.5 sm:p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-blue-500/40 transition-all flex items-center gap-2 group"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileCode2 size={14} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Layer 2 · Code</div>
            <div className="text-xs font-bold text-[var(--foreground)] break-words group-hover:text-blue-500">PySpark &amp; SQL Sheets</div>
          </div>
        </Link>

        <Link
          href="/qa-prep?q=Spark"
          className="p-2.5 sm:p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-blue-500/40 transition-all flex items-center gap-2 group"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
            <MessageSquare size={14} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Layer 3 · Q&amp;A Prep</div>
            <div className="text-xs font-bold text-[var(--foreground)] break-words group-hover:text-blue-500">Spark Interview Bank</div>
          </div>
        </Link>

        <Link
          href="/architecture?q=Spark"
          className="p-2.5 sm:p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-blue-500/40 transition-all flex items-center gap-2 group"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Layers size={14} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Layer 4 · Architecture</div>
            <div className="text-xs font-bold text-[var(--foreground)] break-words group-hover:text-blue-500">Cluster &amp; FinOps Specs</div>
          </div>
        </Link>
      </div>

      {/* Subtab Navigation Chips - Styled after media_1792228927376_5ece2e88.png */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] max-w-fit shadow-xs scrollbar-none">
        {[
          { id: "architecture", label: "Engine Architecture", icon: Cpu },
          { id: "simulator", label: "Live Physical Simulator", icon: Activity },
          { id: "memory", label: "Tungsten Memory Mapper", icon: Calculator },
          { id: "curriculum", label: "32-Level PySpark Curriculum", icon: BookOpen },
          { id: "lexicon", label: "Architect's Lexicon", icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as SparkSubtab)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer",
                isSelected
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. ENGINE ARCHITECTURE VIEW */}
      {activeTab === "architecture" && (
        <div id="architecture" className="space-y-3.5 animate-in fade-in duration-300">
          {/* 3 Milestones */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                <GitMerge size={15} />
              </div>
              <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                Unification Breakthrough
              </div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Unified Data Plane</h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                By integrating streaming, interactive SQL, graph structures, and iterative machine learning directly into a single engine, Spark eliminates expensive system-to-system serialization.
              </p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center font-bold">
                <Cpu size={15} />
              </div>
              <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Memory Paradigm Shift
              </div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Lineage vs Replication</h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Rather than writing intermediate states to physical disk (like MapReduce), RDDs store deterministic lineage graphs. If a partition fails, it is recomputed on-the-fly.
              </p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Zap size={15} />
              </div>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Optimized Compilation
              </div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Declarative Optimization</h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                High-level DataFrame queries allow the Catalyst Optimizer and Tungsten Engine to dynamically rewrite query DAGs and compile custom JVM bytecode at runtime.
              </p>
            </div>
          </div>

          {/* Whiteboard Architecture Blueprints Showcase (Second Layout Style with Interactive Dark Mode) */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Layers size={13} /> Visual System Blueprints
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] mt-0.5 break-words">
                  Databricks &amp; Spark Engine Architecture Blueprints
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] break-words">
                  High-resolution digital whiteboard sketch diagrams explaining query optimization, medallion pipelines, and vectorized compute.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <WhiteboardThemeToggle size="sm" showLabel={true} />
                <Link
                  href="/architecture?tab=diagrams"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-xs shrink-0"
                >
                  <span>All {architectureDiagrams.length} Blueprints</span>
                  <ChevronDown size={13} className="-rotate-90" />
                </Link>
              </div>
            </div>

            {/* Blueprints Grid (Layout Style matching Image 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {sparkDiagrams.map((d) => (
                <WhiteboardCard
                  key={d.id}
                  diagram={d}
                  onExpand={(diagram) => {
                    setActiveModalDiagram(diagram);
                    setModalZoomLevel(1);
                  }}
                />
              ))}
            </div>
          </div>

          {/* 6 Production Rules */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
                <ShieldCheck size={13} /> Production Engineering Standard
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] mt-0.5">
                6 Rules for High-Throughput Spark Architectures
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { num: "01", iconComponent: Layers, iconColor: "text-blue-400", title: "Eliminate Shuffle Spills", desc: "Spills occur when execution memory cannot fit in-flight shuffle structures. Size partitions properly (100–200 MB) and balance spark.memory.fraction = 0.6." },
                { num: "02", iconComponent: Cpu, iconColor: "text-purple-400", title: "Broadcast Small-File Joins", desc: "Avoid sort-merge joins when joining large datasets with small lookups (<10MB). Explicitly broadcast the smaller table to bypass full stage exchanges." },
                { num: "03", iconComponent: ShieldCheck, iconColor: "text-amber-400", title: "Avoid Row-by-Row UDFs", desc: "Python/Scala UDFs bypass Catalyst optimization and force row-by-row object instantiation. Use native Spark SQL expressions or vectorized Pandas-UDFs." },
                { num: "04", iconComponent: Activity, iconColor: "text-emerald-400", title: "Enforce Dynamic Watermarking", desc: "Stateful Structured Streaming applications must enforce retention limits with watermarks. Uncapped state expansion triggers OutOfMemory errors." },
                { num: "05", iconComponent: GitMerge, iconColor: "text-cyan-400", title: "Truncate Long Lineage DAGs", desc: "Long lineage graphs overwhelm the Driver JVM call stack. Break long DAGs in iterative algorithms by periodically calling .checkpoint() to disk." },
                { num: "06", iconComponent: Zap, iconColor: "text-red-400", title: "Explicit Storage Unpersist", desc: "DataFrames persisted via .cache() or .persist() remain in memory indefinitely. Always call .unpersist() as soon as downstream stages complete." },
              ].map((rule) => {
                const RuleIcon = rule.iconComponent;
                return (
                  <div key={rule.num} className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="w-6 h-6 rounded-md bg-[var(--surface-1)] border border-[var(--border)] flex items-center justify-center">
                        <RuleIcon size={13} className={rule.iconColor} />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[var(--muted-foreground)]">{rule.num}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">{rule.title}</h4>
                    <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">{rule.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. PHYSICAL SIMULATOR VIEW */}
      {activeTab === "simulator" && (
        <div id="simulator" className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Physical Execution Engine
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] mt-0.5">
                Interactive Execution Simulator
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Simulate task scheduling, partition flows, and stage boundaries across executor cores in real time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={flowType}
                onChange={(e) => handleFlowTypeChange(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] outline-none"
              >
                <option value="narrow">Narrow Dependency (Map/Filter)</option>
                <option value="wide">Wide Dependency (Sort-Merge Shuffle)</option>
                <option value="broadcast">Map-Side Join (Broadcast Hash)</option>
                <option value="aggregation">Two-Phase Hash Aggregate</option>
              </select>

              <button
                onClick={runSimulation}
                disabled={isSimRunning}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Activity size={14} className={cn(isSimRunning && "animate-pulse")} />
                <span>{isSimRunning ? "Running..." : "Run Plan"}</span>
              </button>
            </div>
          </div>

          {/* Simulator Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Terminal Visualizer */}
            <div className="lg:col-span-2 rounded-xl bg-[#090d13] border border-white/10 p-4 space-y-3 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <span className="text-[10px] text-slate-400 ml-1.5">spark-physical-plan.scala</span>
                </div>
                <span className="text-[9px] text-purple-400 font-bold px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800">
                  LIVE CLUSTER
                </span>
              </div>

              {/* Node Visualizer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-center">
                {/* Column 1: Input Partitions */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Input Slices (S3/ADLS)</div>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-2 rounded-lg border transition-all text-xs",
                        simStep >= 1
                          ? "bg-blue-950/60 border-blue-500/50 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                          : "bg-slate-900/60 border-white/5 text-slate-400"
                      )}
                    >
                      Partition A{i}
                      <div className="text-[9px] opacity-60">Block 128MB</div>
                    </div>
                  ))}
                </div>

                {/* Column 2: Executor Cores */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Executor Cores</div>
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-3 rounded-lg border transition-all text-xs flex flex-col items-center justify-center",
                        simStep === 2
                          ? "bg-purple-950/80 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse"
                          : "bg-slate-900/60 border-white/5 text-slate-400"
                      )}
                    >
                      <span className="flex items-center gap-1"><Cpu size={12} className="text-purple-400" /> Core #{i}</span>
                      <span className="text-[9px] opacity-70 mt-0.5">
                        {simStep === 2 ? "Compiling Bytecode..." : simStep === 3 ? "Idle" : "Ready"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Column 3: Tungsten Targets */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Tungsten Memory</div>
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-2 rounded-lg border transition-all text-xs",
                        simStep === 3
                          ? "bg-green-950/60 border-green-500/60 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                          : "bg-slate-900/60 border-white/5 text-slate-400"
                      )}
                    >
                      Out Partition #{i}
                      <div className="text-[9px] opacity-60">
                        {simStep === 3 ? "✓ Materialized" : "Pending"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics & Logs Panel */}
            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Physical Execution Breakdown
                </span>
                <h4 className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                  {simFlowDetails[flowType].title}
                </h4>
              </div>

              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {simFlowDetails[flowType].mechanics}
              </p>

              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs">
                <strong>Architect Benefit:</strong> {simFlowDetails[flowType].benefit}
              </div>

              {/* Stats */}
              <div className="pt-2 border-t border-[var(--border)] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Network Shuffled Bytes:</span>
                  <span className="font-mono font-bold text-orange-400">{simFlowDetails[flowType].shuffled}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Target Task Count:</span>
                  <span className="font-mono font-bold text-blue-400">{simFlowDetails[flowType].tasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Stage Boundaries:</span>
                  <span className="font-mono font-bold text-purple-400">{simFlowDetails[flowType].stages}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TUNGSTEN MEMORY MAPPER VIEW */}
      {activeTab === "memory" && (
        <div id="memory" className="p-3 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3 animate-in fade-in duration-300">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Calculator size={13} /> Tungsten &amp; Unified Memory
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] mt-0.5 break-words">
              Live JVM Executor Memory Allocator
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] break-words">
              Spark dynamically shares JVM heap between Execution (shuffles/joins) and Storage (caching). Adjust the parameters below to compute pool splits.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sliders */}
            <div className="space-y-4 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
              {/* Heap Size */}
              <div className="space-y-1.5">
                <label htmlFor="spark-heap-size" className="flex items-center justify-between text-xs font-semibold cursor-pointer">
                  <span className="text-[var(--foreground)]">Executor Heap Memory (--executor-memory)</span>
                  <span className="font-mono text-purple-400 font-bold">{heapSize} GB</span>
                </label>
                <input
                  id="spark-heap-size"
                  name="heapSize"
                  type="range"
                  min={4}
                  max={64}
                  step={2}
                  value={heapSize}
                  onChange={(e) => setHeapSize(Number(e.target.value))}
                  className="w-full accent-purple-500"
                  aria-label="Executor heap memory in gigabytes"
                  aria-valuemin={4}
                  aria-valuemax={64}
                  aria-valuenow={heapSize}
                  aria-valuetext={`${heapSize} gigabytes heap memory`}
                />
                <div className="text-[10px] text-[var(--muted-foreground)]">
                  Total JVM memory allocated per container.
                </div>
              </div>

              {/* Memory Fraction */}
              <div className="space-y-1.5">
                <label htmlFor="spark-mem-fraction" className="flex items-center justify-between text-xs font-semibold cursor-pointer">
                  <span className="text-[var(--foreground)]">spark.memory.fraction</span>
                  <span className="font-mono text-blue-400 font-bold">{memFraction}</span>
                </label>
                <input
                  id="spark-mem-fraction"
                  name="memFraction"
                  type="range"
                  min={0.2}
                  max={0.9}
                  step={0.05}
                  value={memFraction}
                  onChange={(e) => setMemFraction(Number(e.target.value))}
                  className="w-full accent-blue-500"
                  aria-label="Spark memory fraction"
                  aria-valuemin={0.2}
                  aria-valuemax={0.9}
                  aria-valuenow={memFraction}
                  aria-valuetext={`Memory fraction ${memFraction}`}
                />
                <div className="text-[10px] text-[var(--muted-foreground)]">
                  Fraction of usable heap dedicated to Spark internal execution &amp; caching.
                </div>
              </div>

              {/* Storage Fraction */}
              <div className="space-y-1.5">
                <label htmlFor="spark-storage-fraction" className="flex items-center justify-between text-xs font-semibold cursor-pointer">
                  <span className="text-[var(--foreground)]">spark.memory.storageFraction</span>
                  <span className="font-mono text-green-400 font-bold">{storageFraction}</span>
                </label>
                <input
                  id="spark-storage-fraction"
                  name="storageFraction"
                  type="range"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={storageFraction}
                  onChange={(e) => setStorageFraction(Number(e.target.value))}
                  className="w-full accent-green-500"
                  aria-label="Spark storage fraction"
                  aria-valuemin={0.1}
                  aria-valuemax={0.9}
                  aria-valuenow={storageFraction}
                  aria-valuetext={`Storage fraction ${storageFraction}`}
                />
                <div className="text-[10px] text-[var(--muted-foreground)]">
                  Immune storage margin protected from eviction by active execution shuffles.
                </div>
              </div>
            </div>

            {/* Visual Allocation Breakdown */}
            <div className="space-y-3 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]">
                JVM Executor Heap Allocation Breakdown:
              </h4>

              {/* Multi-segment progress bar */}
              <div className="h-7 rounded-lg overflow-hidden flex border border-[var(--border)] shadow-inner">
                <div
                  style={{ width: `${(executionPoolMB / totalHeapMB) * 100}%` }}
                  className="bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white transition-all truncate px-1"
                  title="Execution Pool"
                >
                  Exec
                </div>
                <div
                  style={{ width: `${(storagePoolMB / totalHeapMB) * 100}%` }}
                  className="bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white transition-all truncate px-1"
                  title="Storage Pool"
                >
                  Storage
                </div>
                <div
                  style={{ width: `${(userMemoryMB / totalHeapMB) * 100}%` }}
                  className="bg-amber-600 flex items-center justify-center text-[10px] font-bold text-white transition-all truncate px-1"
                  title="User Memory"
                >
                  User
                </div>
                <div
                  style={{ width: `${(reservedMemMB / totalHeapMB) * 100}%` }}
                  className="bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white transition-all truncate px-1"
                  title="Reserved (300MB)"
                >
                  Res
                </div>
              </div>

              {/* Legend with calculated MBs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="text-purple-400 font-bold flex items-center gap-1.5"><Cpu size={13} /> Execution Pool</div>
                  <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                    {(executionPoolMB / 1024).toFixed(2)} GB
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">Joins, Shuffles, Aggregations</div>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-blue-400 font-bold flex items-center gap-1.5"><Layers size={13} /> Storage Pool</div>
                  <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                    {(storagePoolMB / 1024).toFixed(2)} GB
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">.cache() &amp; .persist() tables</div>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="text-amber-400 font-bold flex items-center gap-1.5"><Zap size={13} /> User Memory</div>
                  <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                    {(userMemoryMB / 1024).toFixed(2)} GB
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">Custom structures &amp; UDFs</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-500/10 border border-slate-500/20">
                  <div className="text-slate-400 font-bold flex items-center gap-1.5"><ShieldCheck size={13} /> Reserved Memory</div>
                  <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">300 MB</div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">Spark hardcoded safety buffer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PYSPARK CURRICULUM VIEW */}
      {activeTab === "curriculum" && (
        <div id="curriculum" className="space-y-3.5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                Senior PySpark Master Curriculum (32 Levels)
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                From Spark Connect architecture to K8s dynamic allocations and PyDeequ testing.
              </p>
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              <span><strong className="text-[var(--foreground)]">{pysparkData.length}</strong> Levels</span>
            </div>
          </div>

          {/* Curriculum Meta Action Bar */}
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-0.5">
            <span>
              Showing <strong className="text-[var(--foreground)]">{pysparkData.length}</strong> curriculum modules
            </span>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setExpandedLevels(new Set(pysparkData.map((i) => i.id)))}
                className="hover:text-[var(--foreground)] font-medium transition-colors"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                onClick={() => setExpandedLevels(new Set())}
                className="hover:text-[var(--foreground)] font-medium transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Curriculum items */}
          <div className="space-y-2">
            {pysparkData.map((item, index) => {
              const isExpanded = expandedLevels.has(item.id);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-xl border transition-all duration-150 overflow-hidden",
                    isExpanded
                      ? "bg-[var(--surface-1)] border-blue-500/40 shadow-xs"
                      : "bg-[var(--surface-1)] border-[var(--border)] hover:bg-[var(--surface-2)]"
                  )}
                >
                  <div
                    onClick={() => toggleLevelExpand(item.id)}
                    className="p-3 sm:p-3.5 cursor-pointer flex items-center justify-between gap-3 select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/20">
                        L{index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">{item.category}</div>
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] break-words">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                    <ChevronDown
                      size={15}
                      className={cn("text-[var(--muted-foreground)] transition-transform duration-150 shrink-0", isExpanded && "rotate-180 text-blue-500 dark:text-blue-400")}
                    />
                  </div>

                  <SmoothAccordion isOpen={isExpanded} innerClassName="px-3.5 py-3 space-y-2.5 text-xs sm:text-sm border-t border-[var(--border)] bg-[var(--surface-2)]/40">
                    {item.use_case && (
                      <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs break-words whitespace-normal leading-relaxed">
                        <strong>Enterprise Scenario:</strong> {item.use_case}
                      </div>
                    )}
                    <CodeBlock
                      code={item.code}
                      language="pyspark"
                      filename={`${item.id}.py`}
                      badge="PySpark Execution"
                    />
                    {item.notes && item.notes.length > 0 && (
                      <div className="space-y-1">
                        <span className="font-bold text-[var(--foreground)] text-xs">Execution Mechanics:</span>
                        <ul className="list-disc pl-5 space-y-0.5 text-xs text-[var(--muted-foreground)]">
                          {item.notes.map((n, i) => (
                            <li key={i} className="break-words whitespace-normal leading-relaxed">{n}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </SmoothAccordion>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. ARCHITECT'S LEXICON VIEW */}
      {activeTab === "lexicon" && (
        <div id="lexicon" className="p-3 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Core Terminology Encyclopedia
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] mt-0.5 break-words">
                The Architect&rsquo;s Spark Lexicon
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  value={lexiconQuery}
                  onChange={(e) => setLexiconQuery(e.target.value)}
                  placeholder="Search terms (e.g. AQE, Tungsten)..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Lexicon Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredLexicon.map((term) => (
              <div key={term.term} className="p-3 sm:p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    {term.category}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
                    {term.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[var(--foreground)] break-words">{term.term}</h4>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words">{term.def}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox / Fullscreen Modal for Spark Blueprints */}
      {activeModalDiagram && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200"
          onClick={() => {
            setActiveModalDiagram(null);
            setModalZoomLevel(1);
          }}
        >
          <div
            className="relative w-full max-w-6xl max-h-[96vh] sm:max-h-[92vh] bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-4 border-b border-[var(--border)] bg-[var(--surface-2)] gap-2">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-purple-400 px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 shrink-0">
                    {activeModalDiagram.category}
                  </span>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--foreground)] truncate">
                    {activeModalDiagram.title}
                  </h3>
                </div>
                <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] truncate hidden xs:block">
                  {activeModalDiagram.subtitle}
                </p>
              </div>

              {/* Modal Toolbar: Theme Switch + Zoom + Download + Close */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="hidden sm:block">
                  <WhiteboardThemeToggle size="xs" showLabel={false} />
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg sm:rounded-xl p-0.5 sm:p-1">
                  <button
                    onClick={() => setModalZoomLevel((z) => Math.max(0.75, z - 0.25))}
                    className="p-1 sm:p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] touch-manipulation cursor-pointer"
                    title="Zoom Out"
                    aria-label="Zoom Out"
                  >
                    <ZoomOut size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <span className="text-[10px] sm:text-xs font-mono px-1 sm:px-2 text-[var(--muted-foreground)] select-none">
                    {Math.round(modalZoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setModalZoomLevel((z) => Math.min(2.5, z + 0.25))}
                    className="p-1 sm:p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] touch-manipulation cursor-pointer"
                    title="Zoom In"
                    aria-label="Zoom In"
                  >
                    <ZoomIn size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => setModalZoomLevel(1)}
                    className="p-1 sm:p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] touch-manipulation hidden sm:inline-flex cursor-pointer"
                    title="Reset Zoom"
                    aria-label="Reset Zoom"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = activeModalDiagram.image;
                    link.download = `${activeModalDiagram.id}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success("Downloading blueprint image");
                  }}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors flex items-center gap-1 text-[11px] sm:text-xs font-medium touch-manipulation cursor-pointer"
                  title="Download blueprint"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Download</span>
                </button>

                <button
                  onClick={() => {
                    setActiveModalDiagram(null);
                    setModalZoomLevel(1);
                  }}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors touch-manipulation cursor-pointer"
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body / Blueprint View with Dark/Light Mode Filter */}
            <div
              className={cn(
                "flex-1 overflow-auto p-3 sm:p-8 flex items-center justify-center min-h-[240px] sm:min-h-[380px] touch-pan-x touch-pan-y transition-colors duration-300",
                diagramTheme === "dark" ? "whiteboard-container-dark" : "whiteboard-container-light"
              )}
            >
              <div
                className="transition-transform duration-200 origin-center max-w-full"
                style={{ transform: `scale(${modalZoomLevel})` }}
              >
                <Image
                  src={activeModalDiagram.image}
                  alt={activeModalDiagram.title}
                  width={1400}
                  height={900}
                  sizes="(max-width: 768px) 100vw, 80vw"
                  priority={true}
                  className={cn(
                    "max-h-[60vh] sm:max-h-[66vh] w-auto h-auto object-contain mx-auto shadow-sm transition-all duration-300",
                    diagramTheme === "dark" ? "whiteboard-dark" : "whiteboard-light"
                  )}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-6 border-t border-[var(--border)] bg-[var(--surface-2)] space-y-2 sm:space-y-3 max-h-[32vh] sm:max-h-none overflow-y-auto">
              <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                {activeModalDiagram.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 pt-1 border-t border-[var(--border)] text-[11px] sm:text-xs text-[var(--muted-foreground)]">
                {activeModalDiagram.keyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-purple-400 font-bold shrink-0">✔</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
