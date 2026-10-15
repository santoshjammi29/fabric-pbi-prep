"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Terminal,
  Zap,
  Flame,
  Search,
  BookOpen,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  FileCode2,
  Download,
} from "lucide-react";
import type { CheatCode, CheatCodeCategory, DatabricksSuiteData } from "@/types/data";
import { CheatCard } from "@/components/cheatsheet/cheat-card";
import { OptimizationFlow } from "@/components/cheatsheet/optimization-flow";
import { CategoryBar } from "@/components/cheatsheet/category-bar";
import { QuickJumpTOC } from "@/components/cheatsheet/quick-jump-toc";
import { DatabricksCheatsheetView } from "@/components/cheatsheet/databricks-cheatsheet-view";
import { cn } from "@/lib/utils";
import { HubSubnav } from "@/components/layout/hub-subnav";

const ALL_CATEGORIES: CheatCodeCategory[] = [
  "Spark Core",
  "Spark Optimization",
  "Orchestration",
  "Debugging & Observability",
  "SQL & Storage",
  "Production Best Practices",
];

interface CheatSheetContentProps {
  initialData: CheatCode[];
  databricksData: DatabricksSuiteData;
}

function CheatSheetContent({ initialData, databricksData }: CheatSheetContentProps) {
  const cheatsheetData = initialData;
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"databricks" | "runbooks">(() => {
    return searchParams.get("tab") === "databricks" ? "databricks" : "runbooks";
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedImpact, setSelectedImpact] = useState<string>("ALL");
  const [selectedScenario, setSelectedScenario] = useState<string>("ALL");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Synchronize URL parameters if present
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "databricks") {
      setActiveTab("databricks");
    } else if (tabParam === "runbooks") {
      setActiveTab("runbooks");
    }

    const idParam = searchParams.get("id");
    const catParam = searchParams.get("category");
    const scenParam = searchParams.get("scenario");

    if (catParam) {
      setSelectedCategory(catParam);
    }
    if (scenParam) {
      setSelectedScenario(scenParam);
    }
    if (idParam) {
      setHighlightedId(idParam);
      // Wait for DOM to render then scroll smoothly into view
      setTimeout(() => {
        const el = document.getElementById(idParam);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 250);
    }
  }, [searchParams]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_CATEGORIES.forEach((cat) => {
      counts[cat] = cheatsheetData.filter((c) => c.category === cat).length;
    });
    return counts;
  }, [cheatsheetData]);

  // Filtered dataset
  const filteredCodes = useMemo(() => {
    return cheatsheetData.filter((code) => {
      // 1. Scenario filter
      if (selectedScenario === "p0_outages") {
        const isP0 =
          code.impact === "Critical" ||
          code.tags.some((t) => ["Sev-1", "Fault Tolerance", "Safety", "StackOverflowError"].includes(t));
        if (!isP0) return false;
      } else if (selectedScenario === "oom_memory") {
        const isOOM =
          code.tags.some((t) =>
            [
              "OOM",
              "Memory",
              "Heap",
              "Exit Code 137",
              "Garbage Collection",
              "G1GC",
              "Off-Heap",
              "StackOverflowError",
              "Memory Management",
            ].includes(t)
          ) ||
          code.problem.toLowerCase().includes("oom") ||
          code.problem.toLowerCase().includes("memory") ||
          code.problem.toLowerCase().includes("heap");
        if (!isOOM) return false;
      } else if (selectedScenario === "skew_stragglers") {
        const isSkew =
          code.tags.some((t) => ["Data Skew", "Stragglers", "Salting", "BNLJ", "AQE", "Skew"].includes(t)) ||
          code.problem.toLowerCase().includes("skew") ||
          code.problem.toLowerCase().includes("straggler");
        if (!isSkew) return false;
      } else if (selectedScenario === "shuffle_spill") {
        const isShuffle =
          code.tags.some((t) =>
            [
              "Shuffle",
              "Shuffle Spill",
              "Spill to Disk",
              "BHJ",
              "Bucketing",
              "Parallelism",
              "Network Timeout",
              "Partitions",
            ].includes(t)
          ) ||
          code.problem.toLowerCase().includes("spill") ||
          code.problem.toLowerCase().includes("shuffle");
        if (!isShuffle) return false;
      } else if (selectedScenario === "lakehouse_storage") {
        const isStorage =
          code.category === "SQL & Storage" ||
          code.tags.some((t) =>
            [
              "Delta Lake",
              "Apache Iceberg",
              "Storage",
              "VACUUM",
              "Deletion Vectors",
              "Compaction",
              "Parquet",
              "OneLake",
              "StorageLevel",
            ].includes(t)
          );
        if (!isStorage) return false;
      } else if (selectedScenario === "concurrency_locks") {
        const isConcurrency =
          code.tags.some((t) =>
            [
              "Concurrency",
              "Deadlock",
              "Wait Stats",
              "Zombie Tasks",
              "ConcurrentAppendException",
              "Locking",
              "Idempotency",
              "Connection Pooling",
            ].includes(t)
          ) ||
          code.problem.toLowerCase().includes("lock") ||
          code.problem.toLowerCase().includes("deadlock") ||
          code.problem.toLowerCase().includes("zombie") ||
          code.problem.toLowerCase().includes("concurrent");
        if (!isConcurrency) return false;
      } else if (selectedScenario === "finops_scaling") {
        const isFinOps =
          code.tags.some((t) =>
            ["FinOps", "Cost Optimization", "Spot Instances", "Scaling", "Cluster Policy", "Throughput"].includes(t)
          ) ||
          code.problem.toLowerCase().includes("cost") ||
          code.problem.toLowerCase().includes("scaling") ||
          code.problem.toLowerCase().includes("spot");
        if (!isFinOps) return false;
      }

      // 2. Category match
      if (selectedCategory !== "ALL" && code.category !== selectedCategory) {
        return false;
      }

      // 3. Impact match
      if (selectedImpact !== "ALL" && code.impact !== selectedImpact) {
        return false;
      }

      // 4. Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = code.title.toLowerCase().includes(q);
        const inProblem = code.problem.toLowerCase().includes(q);
        const inSolution = code.solution.toLowerCase().includes(q);
        const inWhy = code.whyItMatters.toLowerCase().includes(q);
        const inCode = code.codeSnippet.toLowerCase().includes(q);
        const inTags = code.tags.some((t) => t.toLowerCase().includes(q));
        const inMetrics = code.metrics.toLowerCase().includes(q);

        if (!inTitle && !inProblem && !inSolution && !inWhy && !inCode && !inTags && !inMetrics) {
          return false;
        }
      }

      return true;
    });
  }, [cheatsheetData, searchQuery, selectedCategory, selectedImpact, selectedScenario]);

  // Jump handler for the optimization flow diagram
  const handleJumpToCode = (targetId: string) => {
    setActiveTab("runbooks");
    setHighlightedId(targetId);
    setSelectedCategory("ALL");
    setSelectedScenario("ALL");
    setSelectedImpact("ALL");
    setSearchQuery("");
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 100);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedImpact("ALL");
    setSelectedScenario("ALL");
    setHighlightedId(null);
  };

  const categoriesForTOC = useMemo(() => {
    return ALL_CATEGORIES.map((cat) => ({
      category: cat,
      count: categoryCounts[cat] || 0,
    }));
  }, [categoryCounts]);

  return (
    <div className="space-y-4 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Primary Subnav */}
      <HubSubnav
        hubTitle="Code & Runbooks"
        items={[
          { label: "Incident Runbooks", href: "/cheat-sheet", icon: Zap, badge: "67 Runbooks" },
          { label: "Databricks Cheat Sheets", href: "/cheat-sheet?tab=databricks", icon: Flame, badge: "48 Cards & PDFs" },
          { label: "PySpark Drills", href: "/code-practice?db=pyspark", icon: FileCode2, badge: "PySpark" },
          { label: "Spark SQL Drills", href: "/code-practice?db=sparksql", icon: Terminal, badge: "Spark SQL" },
          { label: "T-SQL Drills", href: "/code-practice?db=mssql", icon: Terminal, badge: "T-SQL" },
          { label: "Python & Polars", href: "/code-practice?db=python", icon: FileCode2, badge: "Python" },
        ]}
      />

      {/* Primary View Switcher Pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] max-w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("runbooks")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            activeTab === "runbooks"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          <Zap size={13} className={activeTab === "runbooks" ? "text-white" : "text-blue-400"} />
          <span>Incident Runbooks</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-blue-500/20 text-blue-200">
            {cheatsheetData.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("databricks")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            activeTab === "databricks"
              ? "bg-red-600 text-white shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          <Flame size={13} className={activeTab === "databricks" ? "text-white" : "text-red-400"} />
          <span>Databricks Cheat Sheets</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-red-500/20 text-red-200">
            {databricksData.cards.length} Cards &amp; PDFs
          </span>
        </button>
      </div>

      {/* View Branching */}
      {activeTab === "databricks" ? (
        /* --- DATABRICKS ARCHITECTURE & CODING VIEW --- */
        <DatabricksCheatsheetView
          data={databricksData}
          initialDomain={searchParams.get("domain") || undefined}
          initialCardId={searchParams.get("card") || undefined}
        />
      ) : (
        /* --- PRODUCTION INCIDENT RUNBOOKS VIEW --- */
        <div className="space-y-4">
          {/* Hero / Header Section */}
          <div className="relative overflow-hidden rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-3.5 sm:p-5 isolate">
            <div className="space-y-2">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Terminal size={13} />
                <span>Architectural Production Reference &amp; Incident Runbooks</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                Data Engineering{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                  Production Incident Runbooks
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed max-w-3xl">
                Battle-tested emergency runbooks, triage procedures, and performance knobs for Apache Spark, dbt, Airflow, and Lakehouse platforms. Structured as Problem Scenario &rarr; Root Cause Triage &rarr; Hardened Solution with measurable production ROI.
              </p>

              {/* Quick Metrics Bar */}
              <div className="pt-1 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-3xl">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2 sm:p-2.5 shadow-xs">
                  <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">Incident Runbooks</span>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="text-base sm:text-lg font-bold font-mono text-[var(--foreground)]">
                      {cheatsheetData.length}
                    </span>
                    <span className="text-[10px] text-blue-500 dark:text-blue-400 font-medium">Battle-Tested</span>
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2 sm:p-2.5 shadow-xs">
                  <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">Emergency Triage</span>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">10+ Sev-1</span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">Runbooks</span>
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2 sm:p-2.5 shadow-xs">
                  <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">Shuffle Reduction</span>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="text-base sm:text-lg font-bold font-mono text-blue-400">80%-100%</span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">BHJ</span>
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2 sm:p-2.5 shadow-xs">
                  <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">Core Domains</span>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="text-base sm:text-lg font-bold font-mono text-cyan-400">
                      {ALL_CATEGORIES.length}
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">End-to-End</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-3.5" id="main-content">
            {/* Interactive Optimization Flow Diagram */}
            <section aria-labelledby="optimization-flow-heading">
              <OptimizationFlow onSelectCheatCode={handleJumpToCode} />
            </section>

            {/* Databricks Architecture & Coding Cheat Sheets Promotional Banner */}
            <div className="p-3 sm:p-4 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-500/10 via-orange-500/5 to-blue-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-red-500/15 text-red-500 dark:text-red-400 flex items-center justify-center shrink-0">
                  <Flame size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                      Databricks Architecture &amp; Coding Cheat Sheets
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/30">
                      NEW • DBR 15.4/16.0 LTS
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 md:line-clamp-1 mt-0.5">
                    Explore 48 comprehensive cards and download print-ready vector PDFs and 250 DPI panoramic posters for Spark SQL, PySpark, Spark Core, and Python SDK.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("databricks")}
                  className="px-3.5 py-1.5 rounded-lg bg-[#FF3621] hover:bg-[#e0301d] text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Explore 48 Cards</span>
                  <ArrowRight size={13} />
                </button>
                <a
                  href="/cheatsheets/pdf/databricks_master_cheatsheet.pdf"
                  download
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-semibold text-[var(--foreground)] transition-colors flex items-center gap-1.5"
                >
                  <Download size={13} className="text-red-400" />
                  <span>Master PDF (8 Pages)</span>
                </a>
              </div>
            </div>

            {/* Whiteboard Blueprints Reference Banner */}
            <div className="p-2.5 sm:p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Layers size={15} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">Looking for visual system design blueprints?</h4>
                  <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-1">Pair your code optimization with 28 high-resolution whiteboard architecture diagrams detailing Spark memory shuffles, Catalyst query plans, Delta Lake ACID commits, and Airflow distributed workers.</p>
                </div>
              </div>
              <Link
                href="/architecture?tab=diagrams"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 transition-colors shadow-xs"
              >
                Explore 28 Blueprints &rarr;
              </Link>
            </div>

            {/* Search, Filter Pills & Impact Select */}
            <section aria-labelledby="filters-heading">
              <CategoryBar
                categories={ALL_CATEGORIES}
                categoryCounts={categoryCounts}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                selectedImpact={selectedImpact}
                onSelectImpact={setSelectedImpact}
                selectedScenario={selectedScenario}
                onSelectScenario={setSelectedScenario}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                totalFiltered={filteredCodes.length}
                totalCount={cheatsheetData.length}
              />
            </section>

            {/* Grid Layout + Sticky TOC Sidebar */}
            <div className="flex items-start gap-4 sm:gap-6">
              {/* Main Grid of Cards */}
              <div className="flex-1 min-w-0">
                {filteredCodes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-3.5 sm:gap-4">
                    {filteredCodes.map((cheat) => (
                      <CheatCard
                        key={cheat.id}
                        cheat={cheat}
                        isHighlighted={highlightedId === cheat.id}
                        onSelectTag={(t) => {
                          setSearchQuery(t);
                          setSelectedScenario("ALL");
                          setSelectedCategory("ALL");
                        }}
                        onSelectCategory={(c) => {
                          setSelectedCategory(c);
                          setSelectedScenario("ALL");
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-1)] py-16 px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 mb-4">
                      <Search size={22} />
                    </div>
                    <h3 className="text-base font-bold text-[var(--foreground)]">
                      No Cheat Codes Found
                    </h3>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)] max-w-sm">
                      We couldn&apos;t find any cheat codes matching your active filters. Try searching for &quot;OOM&quot;, &quot;Salting&quot;, &quot;Exit 137&quot;, &quot;Vacuum&quot;, or &quot;Spill&quot;.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Reset All Filters</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Sticky Table of Contents (xl screens) */}
              <QuickJumpTOC
                categories={categoriesForTOC}
                activeCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                activeScenario={selectedScenario}
                onSelectScenario={setSelectedScenario}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CheatSheetClientProps {
  initialData: CheatCode[];
  databricksData: DatabricksSuiteData;
}

export function CheatSheetClient({ initialData, databricksData }: CheatSheetClientProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading Production Cheat Sheet...</span>
          </div>
        </div>
      }
    >
      <CheatSheetContent initialData={initialData} databricksData={databricksData} />
    </Suspense>
  );
}
