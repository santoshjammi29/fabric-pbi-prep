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
} from "lucide-react";
import { cheatsheetData } from "@/data";
import type { CheatCodeCategory } from "@/types/data";
import { CheatCard } from "@/components/cheatsheet/cheat-card";
import { OptimizationFlow } from "@/components/cheatsheet/optimization-flow";
import { CategoryBar } from "@/components/cheatsheet/category-bar";
import { QuickJumpTOC } from "@/components/cheatsheet/quick-jump-toc";
import { cn } from "@/lib/utils";

const ALL_CATEGORIES: CheatCodeCategory[] = [
  "Spark Core",
  "Spark Optimization",
  "Orchestration",
  "Debugging & Observability",
  "SQL & Storage",
  "Production Best Practices",
];

function CheatSheetContent() {
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedImpact, setSelectedImpact] = useState<string>("ALL");
  const [selectedScenario, setSelectedScenario] = useState<string>("ALL");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Synchronize URL parameters if present
  useEffect(() => {
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
          el.scrollIntoView({ behavior: "smooth", block: "center" });
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
  }, []);

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
  }, [searchQuery, selectedCategory, selectedImpact, selectedScenario]);

  // Jump handler for the optimization flow diagram
  const handleJumpToCode = (targetId: string) => {
    setHighlightedId(targetId);
    setSelectedCategory("ALL");
    setSelectedScenario("ALL");
    setSelectedImpact("ALL");
    setSearchQuery("");
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24">
      {/* Hero / Header Section */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface-0)] py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
            <Terminal size={14} />
            <span>Architectural Production Reference &amp; Incident Runbooks</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
            Data Engineering{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Production Cheat Sheet
            </span>
          </h1>

          <p className="mt-3.5 max-w-3xl text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            Essential battle-tested cheat codes, emergency incident runbooks, and performance knobs for Apache Spark, dbt, Airflow, and Lakehouse platforms. Structured as Problem Scenario &rarr; Root Cause Triage &rarr; Hardened Solution with measurable production ROI.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4 shadow-sm">
              <span className="text-xs text-[var(--muted-foreground)] font-medium">Production Codes</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--foreground)]">
                  {cheatsheetData.length}
                </span>
                <span className="text-xs text-blue-400 font-medium">Battle-Tested</span>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4 shadow-sm">
              <span className="text-xs text-[var(--muted-foreground)] font-medium">Emergency Triage</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">10+ Sev-1</span>
                <span className="text-xs text-[var(--muted-foreground)]">Runbooks</span>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4 shadow-sm">
              <span className="text-xs text-[var(--muted-foreground)] font-medium">Shuffle Reduction</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-purple-400">80% - 100%</span>
                <span className="text-xs text-[var(--muted-foreground)]">BHJ / Bucketing</span>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4 shadow-sm">
              <span className="text-xs text-[var(--muted-foreground)] font-medium">Core Domains</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">
                  {ALL_CATEGORIES.length}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">End-to-End</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="main-content">
        {/* Interactive Optimization Flow Diagram */}
        <section aria-labelledby="optimization-flow-heading">
          <OptimizationFlow onSelectCheatCode={handleJumpToCode} />
        </section>

        {/* Whiteboard Blueprints Reference Banner */}
        <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📐</span>
            <div>
              <h4 className="text-sm font-bold text-[var(--foreground)]">Looking for visual system design blueprints?</h4>
              <p className="text-xs text-[var(--muted-foreground)]">Pair your code optimization with 21 high-resolution whiteboard architecture diagrams detailing Spark memory shuffles, Catalyst query plans, Delta Lake ACID commits, and Airflow distributed workers.</p>
            </div>
          </div>
          <Link
            href="/architecture?tab=diagrams"
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm"
          >
            Explore 21 Blueprints &rarr;
          </Link>
        </div>

        {/* Search, Filter Pills & Impact Select */}
        <section aria-labelledby="filters-heading" className="pt-2">
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
        <div className="flex items-start gap-8">
          {/* Main Grid of Cards */}
          <div className="flex-1 min-w-0">
            {filteredCodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
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
      </main>
    </div>
  );
}

export default function CheatSheetPage() {
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
      <CheatSheetContent />
    </Suspense>
  );
}
