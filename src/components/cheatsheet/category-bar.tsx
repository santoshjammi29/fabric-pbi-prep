"use client";

import React from "react";
import { Search, X, Filter, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheatCodeCategory } from "@/types/data";

export interface EmergencyScenario {
  id: string;
  label: string;
  icon: string;
  badge: string;
}

export const EMERGENCY_SCENARIOS: EmergencyScenario[] = [
  { id: "ALL", label: "All Codes", icon: "⚡", badge: "53 Items" },
  { id: "p0_outages", label: "P0 Sev-1 Outages", icon: "🚨", badge: "Incident Triage" },
  { id: "oom_memory", label: "OOM & Memory Crashes", icon: "💥", badge: "Heap & Exit 137" },
  { id: "skew_stragglers", label: "Skew & Stragglers", icon: "🐢", badge: "Salting & BNLJ" },
  { id: "shuffle_spill", label: "Shuffles & Disk Spills", icon: "🌊", badge: "I/O & Retries" },
  { id: "lakehouse_storage", label: "Lakehouse & Storage", icon: "🗄️", badge: "Delta & Iceberg" },
  { id: "concurrency_locks", label: "Locks & Concurrency", icon: "🔄", badge: "Deadlocks & OCC" },
  { id: "finops_scaling", label: "FinOps & Cloud Scaling", icon: "💰", badge: "Spot & Policies" },
];

interface CategoryBarProps {
  categories: CheatCodeCategory[];
  categoryCounts: Record<string, number>;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedImpact: string;
  onSelectImpact: (impact: string) => void;
  selectedScenario: string;
  onSelectScenario: (scenario: string) => void;
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
  selectedScenario,
  onSelectScenario,
  searchQuery,
  onSearchChange,
  totalFiltered,
  totalCount,
}: CategoryBarProps) {
  return (
    <div className="space-y-4">
      {/* 1. Emergency Prod Triage Scenarios Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[var(--foreground)]">
            <ShieldAlert size={14} className="text-amber-400" />
            <span>Emergency Incident Triage &amp; Performance Runbooks</span>
          </div>
          {selectedScenario !== "ALL" && (
            <button
              type="button"
              onClick={() => onSelectScenario("ALL")}
              className="text-blue-400 hover:underline text-[11px] font-medium"
            >
              Reset Scenarios &times;
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          {EMERGENCY_SCENARIOS.map((scen) => {
            const isActive = selectedScenario === scen.id;
            return (
              <button
                key={scen.id}
                type="button"
                onClick={() => {
                  onSelectScenario(scen.id);
                  if (scen.id !== "ALL") {
                    onSelectCategory("ALL");
                  }
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer shrink-0 touch-manipulation",
                  isActive
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30"
                    : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]"
                )}
              >
                <span>{scen.icon}</span>
                <span>{scen.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-mono",
                    isActive
                      ? "bg-amber-500/30 text-amber-200"
                      : "bg-[var(--surface-2)] text-[var(--muted-foreground)]"
                  )}
                >
                  {scen.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Global Search Input + Impact Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search 53+ cheat codes (e.g. OOM, Kryo, Salting, Exit 137, Vacuum, RocksDB, dbt)..."
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

      {/* 3. Category Pills (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
        <button
          type="button"
          onClick={() => {
            onSelectCategory("ALL");
            onSelectScenario("ALL");
          }}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer shrink-0",
            selectedCategory === "ALL" && selectedScenario === "ALL"
              ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
              : "bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border-hover)]"
          )}
        >
          <span>All Domains</span>
          <span
            className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
              selectedCategory === "ALL" && selectedScenario === "ALL"
                ? "bg-white/20 text-white"
                : "bg-[var(--surface-2)] text-[var(--muted-foreground)]"
            )}
          >
            {totalCount}
          </span>
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
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer shrink-0",
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
