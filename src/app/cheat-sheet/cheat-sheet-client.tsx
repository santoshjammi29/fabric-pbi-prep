"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  FileText,
} from "lucide-react";
import type { CheatCode, CheatCodeCategory, DatabricksSuiteData } from "@/types/data";
import { CheatCard } from "@/components/cheatsheet/cheat-card";
import { OptimizationFlow } from "@/components/cheatsheet/optimization-flow";
import { CategoryBar } from "@/components/cheatsheet/category-bar";
import { QuickJumpTOC } from "@/components/cheatsheet/quick-jump-toc";
import { DatabricksCheatsheetView } from "@/components/cheatsheet/databricks-cheatsheet-view";
import { PdfDownloadsHub } from "@/components/cheatsheet/pdf-downloads-hub";
import { cn } from "@/lib/utils";

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
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"databricks" | "runbooks" | "pdf_hub">(() => {
    const tab = searchParams.get("tab");
    if (tab === "pdf_hub" || tab === "pdfs") return "pdf_hub";
    return tab === "databricks" ? "databricks" : "runbooks";
  });

  const handleTabChange = (newTab: "databricks" | "runbooks" | "pdf_hub") => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    if (newTab !== "databricks") {
      params.delete("domain");
      params.delete("card");
    }
    router.replace(`/cheat-sheet?${params.toString()}`, { scroll: false });
  };

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
    } else if (tabParam === "pdf_hub" || tabParam === "pdfs") {
      setActiveTab("pdf_hub");
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
      {/* Primary View Switcher Pills - Styled after media_1792228927376_5ece2e88.png */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] max-w-fit shadow-xs">
        <button
          type="button"
          onClick={() => handleTabChange("runbooks")}
          className={cn(
            "flex items-center gap-1.5 px-4 sm:px-5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap",
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
          onClick={() => handleTabChange("databricks")}
          className={cn(
            "flex items-center gap-1.5 px-4 sm:px-5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap",
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

        <button
          type="button"
          onClick={() => handleTabChange("pdf_hub")}
          className={cn(
            "flex items-center gap-1.5 px-4 sm:px-5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap",
            activeTab === "pdf_hub"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          <FileText size={13} className={activeTab === "pdf_hub" ? "text-white" : "text-purple-400"} />
          <span>A4 PDF Documents Hub</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-purple-500/20 text-purple-200">
            7 A4 Suites
          </span>
        </button>
      </div>

      {/* View Branching */}
      {activeTab === "pdf_hub" ? (
        /* --- ALL A4 CODING BLOCK PDFS UNDER SINGLE ROOF --- */
        <PdfDownloadsHub />
      ) : activeTab === "databricks" ? (
        /* --- DATABRICKS ARCHITECTURE & CODING VIEW --- */
        <div className="space-y-4">
          {/* Consolidated Subpage Banner */}
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0">
                <Flame size={16} />
              </span>
              <div>
                <div className="font-semibold text-red-200">
                  All Databricks Coding Consolidated Under Single Subpage: /code-practice/databricks
                </div>
                <div className="text-[11px] text-red-300/80">
                  All Databricks coding sheets, DBFS operations, transformations, Catalyst optimizations, and memory bottleneck playbooks now live in the dedicated Databricks Coding subpage under Code Practice.
                </div>
              </div>
            </div>
            <Link
              href="/code-practice/databricks"
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
            >
              <span>Go to Databricks Coding Subpage</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <DatabricksCheatsheetView
            data={databricksData}
            initialDomain={searchParams.get("domain") || undefined}
            initialCardId={searchParams.get("card") || undefined}
          />
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-3.5">
          {/* Compact Header Hub Banner */}
          <div className="relative rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3 sm:p-4 shadow-xs isolate">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Terminal size={11} />
                    <span>Architectural Runbooks</span>
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    Production Incident Playbooks
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] break-words">
                  Data Engineering Production Incident Runbooks
                </h1>
                <p className="text-xs text-[var(--muted-foreground)] max-w-3xl leading-relaxed break-words">
                  Battle-tested emergency runbooks, triage procedures, and performance knobs for Apache Spark, dbt, Airflow, and Lakehouse platforms. Structured as Problem Scenario &rarr; Root Cause Triage &rarr; Hardened Solution.
                </p>
              </div>
              <div className="text-xs text-[var(--muted-foreground)] shrink-0 self-start sm:self-auto">
                Showing <strong className="text-[var(--foreground)]">{filteredCodes.length}</strong> of {cheatsheetData.length} runbooks
              </div>
            </div>
          </div>

          {/* Top Double-Line Slicers & Filters Deck */}
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
                  onClick={() => handleTabChange("databricks")}
                  className="px-3.5 py-1.5 rounded-lg bg-[#FF3621] hover:bg-[#e0301d] text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Explore 48 Cards</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("pdf_hub")}
                  className="px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-xs font-semibold text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText size={13} className="text-purple-400" />
                  <span>A4 PDF Hub (All 7 Suites)</span>
                </button>
                <a
                  href="/api/download/pdf/lakehouse_enterprise_master_reference.pdf"
                  download="lakehouse_enterprise_master_reference.pdf"
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download size={13} className="text-white" />
                  <span>Enterprise Master (47p)</span>
                </a>
                <a
                  href="/api/download/pdf/databricks_master_cheatsheet.pdf"
                  download="databricks_master_cheatsheet.pdf"
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-semibold text-[var(--foreground)] transition-colors flex items-center gap-1.5"
                >
                  <Download size={13} className="text-red-400" />
                  <span>Coding PDF (8p)</span>
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
