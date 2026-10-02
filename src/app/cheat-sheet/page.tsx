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
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Synchronize URL parameters if present
  useEffect(() => {
    const idParam = searchParams.get("id");
    const catParam = searchParams.get("category");

    if (catParam) {
      setSelectedCategory(catParam);
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
      // 1. Category match
      if (selectedCategory !== "ALL" && code.category !== selectedCategory) {
        return false;
      }

      // 2. Impact match
      if (selectedImpact !== "ALL" && code.impact !== selectedImpact) {
        return false;
      }

      // 3. Search query match
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
  }, [searchQuery, selectedCategory, selectedImpact]);

  // Jump handler for the optimization flow diagram
  const handleJumpToCode = (targetId: string) => {
    setHighlightedId(targetId);
    setSelectedCategory("ALL");
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
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface-0)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
            <Terminal size={14} />
            <span>Architectural Production Reference</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
            Data Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Production Cheat Sheet</span>
          </h1>

          <p className="mt-4 max-w-3xl text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            Essential battle-tested cheat codes, performance knobs, and debugging triages for Apache Spark, dbt, Airflow, and Lakehouse platforms. Structured as Problem → Solution with measurable production ROI.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4 shadow-sm">
              <span className="text-xs text-[var(--muted-foreground)] font-medium">Verified Codes</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--foreground)]">
                  {cheatsheetData.length}
                </span>
                <span className="text-xs text-blue-400 font-medium">Production Ready</span>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4 shadow-sm">
              <span className="text-xs text-[var(--muted-foreground)] font-medium">Max SerDe Speedup</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">10x - 100x</span>
                <span className="text-xs text-[var(--muted-foreground)]">Arrow / Kryo</span>
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

        {/* Search, Filter Pills & Impact Select */}
        <section aria-labelledby="filters-heading" className="pt-2">
          <CategoryBar
            categories={ALL_CATEGORIES}
            categoryCounts={categoryCounts}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedImpact={selectedImpact}
            onSelectImpact={setSelectedImpact}
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
                    onSelectTag={(t) => setSearchQuery(t)}
                    onSelectCategory={(c) => setSelectedCategory(c)}
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
                  We couldn&apos;t find any cheat codes matching &quot;{searchQuery}&quot;. Try searching for terms like &quot;Kryo&quot;, &quot;AQE&quot;, &quot;BHJ&quot;, &quot;Spill&quot;, or &quot;dbt&quot;.
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
