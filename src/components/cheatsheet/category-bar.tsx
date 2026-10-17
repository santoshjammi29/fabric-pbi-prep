"use client";

import React from "react";
import {
  Search,
  Filter,
  ShieldAlert,
  Zap,
  AlertTriangle,
  Flame,
  Activity,
  ArrowLeftRight,
  Database,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheatCodeCategory } from "@/types/data";

export interface EmergencyScenario {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge: string;
}

export const EMERGENCY_SCENARIOS: EmergencyScenario[] = [
  { id: "ALL", label: "All Codes", icon: Zap, badge: "53 Items" },
  { id: "p0_outages", label: "P0 Sev-1 Outages", icon: AlertTriangle, badge: "Incident Triage" },
  { id: "oom_memory", label: "OOM & Memory Crashes", icon: Flame, badge: "Heap & Exit 137" },
  { id: "skew_stragglers", label: "Skew & Stragglers", icon: Activity, badge: "Salting & BNLJ" },
  { id: "shuffle_spill", label: "Shuffles & Disk Spills", icon: ArrowLeftRight, badge: "I/O & Retries" },
  { id: "lakehouse_storage", label: "Lakehouse & Storage", icon: Database, badge: "Delta & Iceberg" },
  { id: "concurrency_locks", label: "Locks & Concurrency", icon: RefreshCw, badge: "Deadlocks & OCC" },
  { id: "finops_scaling", label: "FinOps & Cloud Scaling", icon: DollarSign, badge: "Spot & Policies" },
];

interface CategoryBarProps {
  categories: CheatCodeCategory[];
  categoryCounts: Record<string, number>;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedImpact: string;
  onSelectImpact: (impact: string) => void;
  selectedStretch?: "ALL" | "STANDARD" | "STRETCH";
  onSelectStretch?: (stretch: "ALL" | "STANDARD" | "STRETCH") => void;
  selectedScenario: string;
  onSelectScenario: (scenario: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalFiltered: number;
  totalCount: number;
}

const IMPACT_OPTIONS: { label: string; value: string }[] = [
  { label: "ALL", value: "ALL" },
  { label: "Critical", value: "Critical" },
  { label: "High Impact", value: "High Impact" },
  { label: "Architect", value: "Architect Level" },
  { label: "Quick Win", value: "Quick Win" },
];

const STRETCH_OPTIONS: { label: string; value: "ALL" | "STANDARD" | "STRETCH" }[] = [
  { label: "ALL", value: "ALL" },
  { label: "STANDARD", value: "STANDARD" },
  { label: "STRETCH", value: "STRETCH" },
];

export function CategoryBar({
  categories,
  categoryCounts,
  selectedCategory,
  onSelectCategory,
  selectedImpact,
  onSelectImpact,
  selectedStretch = "ALL",
  onSelectStretch,
  selectedScenario,
  onSelectScenario,
  searchQuery,
  onSearchChange,
  totalFiltered,
  totalCount,
}: CategoryBarProps) {
  return (
    <div className="space-y-2 p-2 sm:p-2.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs">
      {/* LINE 1: DOMAINS (TOPICS) SLICERS - Styled after media_1792228927376_5ece2e88.png */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] max-w-fit shadow-xs">
        <button
          type="button"
          onClick={() => {
            onSelectCategory("ALL");
            onSelectScenario("ALL");
          }}
          className={cn(
            "px-3 sm:px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer",
            selectedCategory === "ALL" && selectedScenario === "ALL"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          All Topics ({totalCount})
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat && selectedScenario === "ALL";
          const count = categoryCounts[cat] || 0;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onSelectCategory(cat);
                onSelectScenario("ALL");
              }}
              className={cn(
                "px-3 sm:px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer",
                isSelected
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <span>{cat}</span>
              <span className="ml-1 opacity-70 text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* LINE 2: SEARCH FILTER + DIFFICULTY / IMPACT + STRETCH SLICERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-[var(--border)]">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search runbooks by problem, exit code, symptom, mechanism (e.g. OOM, Kryo, Salting, Exit 137)..."
            className="w-full pl-9 pr-12 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs sm:text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 overflow-x-auto scrollbar-none">
          {/* Difficulty / Impact Selector Pills */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] shadow-xs">
            {IMPACT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSelectImpact(opt.value)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                  selectedImpact === opt.value
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Stretch Selector Pills */}
          {onSelectStretch && (
            <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] shadow-xs">
              {STRETCH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSelectStretch(opt.value)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                    selectedStretch === opt.value
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <span className="text-[11px] text-[var(--muted-foreground)] whitespace-nowrap pl-1 hidden lg:inline">
            <strong className="text-[var(--foreground)]">{totalFiltered}</strong> / {totalCount} runbooks
          </span>
        </div>
      </div>
    </div>
  );
}
