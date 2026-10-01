"use client";

import React from "react";
import { Search, X, Sparkles, Filter, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheatCodeCategory, CheatCodeImpact } from "@/types/data";

interface CategoryBarProps {
  categories: CheatCodeCategory[];
  categoryCounts: Record<string, number>;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedImpact: string;
  onSelectImpact: (impact: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalFiltered: number;
  totalCount: number;
}

const IMPACT_OPTIONS: { label: string; value: string }[] = [
  { label: "All Impacts", value: "ALL" },
  { label: "Critical", value: "Critical" },
  { label: "High Impact", value: "High Impact" },
  { label: "Architect Level", value: "Architect Level" },
  { label: "Quick Win", value: "Quick Win" },
];

export function CategoryBar({
  categories,
  categoryCounts,
  selectedCategory,
  onSelectCategory,
  selectedImpact,
  onSelectImpact,
  searchQuery,
  onSearchChange,
  totalFiltered,
  totalCount,
}: CategoryBarProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar + Impact Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Global Search Input */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search cheat codes by problem, API, knob, or tag (e.g. Kryo, AQE, BHJ, dbt)..."
            aria-label="Search cheat codes"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-md cursor-pointer"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Impact Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <select
              value={selectedImpact}
              onChange={(e) => onSelectImpact(e.target.value)}
              aria-label="Filter by impact"
              className="appearance-none pl-8 pr-8 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--foreground)] hover:border-[var(--border-hover)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all cursor-pointer shadow-sm"
            >
              {IMPACT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#161618] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <Filter
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none"
            />
          </div>

          {/* Result Count Badge */}
          <div className="px-3 py-2 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-xs font-mono text-[var(--muted-foreground)] whitespace-nowrap">
            <span className="font-bold text-[var(--foreground)]">{totalFiltered}</span>
            <span className="opacity-70"> / {totalCount} codes</span>
          </div>
        </div>
      </div>

      {/* Category Pills (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
        <button
          type="button"
          onClick={() => onSelectCategory("ALL")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer shrink-0",
            selectedCategory === "ALL"
              ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
              : "bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border-hover)]"
          )}
        >
          <span>All Categories</span>
          <span
            className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
              selectedCategory === "ALL" ? "bg-white/20 text-white" : "bg-[var(--surface-2)] text-[var(--muted-foreground)]"
            )}
          >
            {totalCount}
          </span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat] || 0;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer shrink-0",
                isSelected
                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                  : "bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border-hover)]"
              )}
            >
              <span>{cat}</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                  isSelected ? "bg-white/20 text-white" : "bg-[var(--surface-2)] text-[var(--muted-foreground)]"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
