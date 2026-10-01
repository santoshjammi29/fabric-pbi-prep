"use client";

import React from "react";
import { ListTree, Zap, Sliders, Clock, Bug, Database, ShieldCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheatCodeCategory } from "@/types/data";

interface QuickJumpTOCProps {
  categories: {
    category: CheatCodeCategory;
    count: number;
  }[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
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
}: QuickJumpTOCProps) {
  return (
    <aside
      className="hidden xl:block w-64 shrink-0 sticky top-24 self-start rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
      aria-label="Table of Contents"
    >
      <div className="flex items-center gap-2 pb-3 mb-2 border-b border-[var(--border)] text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
        <ListTree size={14} className="text-blue-400" />
        <span>Quick Jump Index</span>
      </div>

      <nav className="space-y-1">
        <button
          type="button"
          onClick={() => onSelectCategory("ALL")}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer",
            activeCategory === "ALL"
              ? "bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
          )}
        >
          <span>All Cheat Codes</span>
          <ChevronRight size={13} className="opacity-70" />
        </button>

        {categories.map(({ category, count }) => {
          const Icon = CATEGORY_ICONS[category] || Zap;
          const isActive = activeCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
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

      {/* Production Tip Callout */}
      <div className="mt-4 pt-3 border-t border-[var(--border)]">
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          <strong className="text-[var(--foreground)]">Pro-Tip:</strong> Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[10px] text-blue-400">
            Ctrl+K
          </kbd>{" "}
          to search cheat codes anywhere across the platform.
        </p>
      </div>
    </aside>
  );
}
