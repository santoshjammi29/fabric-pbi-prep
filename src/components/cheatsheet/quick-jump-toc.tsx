"use client";

import React from "react";
import { ListTree, Zap, Sliders, Clock, Bug, Database, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheatCodeCategory } from "@/types/data";

interface QuickJumpTOCProps {
  categories: {
    category: CheatCodeCategory;
    count: number;
  }[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  activeScenario?: string;
  onSelectScenario?: (scen: string) => void;
}

const CATEGORY_ICONS: Record<CheatCodeCategory, React.ElementType> = {
  "Spark Core": Zap,
  "Spark Optimization": Sliders,
  Orchestration: Clock,
  "Debugging & Observability": Bug,
  "SQL & Storage": Database,
  "Production Best Practices": ShieldCheck,
};

export function QuickJumpTOC({
  categories,
  activeCategory,
  onSelectCategory,
  activeScenario = "ALL",
  onSelectScenario,
}: QuickJumpTOCProps) {
  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <aside
      className="hidden xl:block w-72 shrink-0 sticky top-24 self-start rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm space-y-4"
      aria-label="Table of Contents"
    >
      <div>
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border)] text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <ListTree size={14} className="text-blue-400" />
            <span>Quick Jump Index</span>
          </div>
          <span className="text-[10px] font-mono text-blue-400 font-bold px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
            {totalCount} Codes
          </span>
        </div>

        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => {
              onSelectCategory("ALL");
              onSelectScenario?.("ALL");
            }}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer",
              activeCategory === "ALL" && activeScenario === "ALL"
                ? "bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
            )}
          >
            <span className="font-semibold">All Cheat Codes</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--muted-foreground)]">
              {totalCount}
            </span>
          </button>

          {categories.map(({ category, count }) => {
            const Icon = CATEGORY_ICONS[category] || Zap;
            const isActive = activeCategory === category && activeScenario === "ALL";

            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  onSelectCategory(category);
                  onSelectScenario?.("ALL");
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer",
                  isActive
                    ? "bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon size={13} className="shrink-0 text-blue-400" />
                  <span className="truncate">{category}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Emergency Incident Runbook Shortcuts */}
      <div className="pt-3 border-t border-[var(--border)] space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider px-1">
          <ShieldAlert size={13} />
          <span>Incident Triage</span>
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              onSelectScenario?.("p0_outages");
              onSelectCategory("ALL");
            }}
            className={cn(
              "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer",
              activeScenario === "p0_outages"
                ? "bg-red-500/20 text-red-300 font-semibold border border-red-500/40"
                : "text-[var(--muted-foreground)] hover:text-red-300 hover:bg-red-500/10"
            )}
          >
            <span className="flex items-center gap-1.5 truncate">
              <span>🚨</span>
              <span className="truncate">P0 Sev-1 Outages</span>
            </span>
            <span className="text-[10px] font-mono opacity-70">&rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectScenario?.("oom_memory");
              onSelectCategory("ALL");
            }}
            className={cn(
              "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer",
              activeScenario === "oom_memory"
                ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40"
                : "text-[var(--muted-foreground)] hover:text-amber-300 hover:bg-amber-500/10"
            )}
          >
            <span className="flex items-center gap-1.5 truncate">
              <span>💥</span>
              <span className="truncate">OOM &amp; Exit 137</span>
            </span>
            <span className="text-[10px] font-mono opacity-70">&rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectScenario?.("skew_stragglers");
              onSelectCategory("ALL");
            }}
            className={cn(
              "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer",
              activeScenario === "skew_stragglers"
                ? "bg-orange-500/20 text-orange-300 font-semibold border border-orange-500/40"
                : "text-[var(--muted-foreground)] hover:text-orange-300 hover:bg-orange-500/10"
            )}
          >
            <span className="flex items-center gap-1.5 truncate">
              <span>🐢</span>
              <span className="truncate">Skew &amp; Stragglers</span>
            </span>
            <span className="text-[10px] font-mono opacity-70">&rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectScenario?.("shuffle_spill");
              onSelectCategory("ALL");
            }}
            className={cn(
              "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer",
              activeScenario === "shuffle_spill"
                ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40"
                : "text-[var(--muted-foreground)] hover:text-cyan-300 hover:bg-cyan-500/10"
            )}
          >
            <span className="flex items-center gap-1.5 truncate">
              <span>🌊</span>
              <span className="truncate">Shuffles &amp; Spills</span>
            </span>
            <span className="text-[10px] font-mono opacity-70">&rarr;</span>
          </button>
        </div>
      </div>

      {/* Production Tip Callout */}
      <div className="pt-3 border-t border-[var(--border)]">
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          <strong className="text-[var(--foreground)]">Pro-Tip:</strong> Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[10px] text-blue-400">
            Ctrl+K
          </kbd>{" "}
          to search all 53+ cheat codes globally.
        </p>
      </div>
    </aside>
  );
}
