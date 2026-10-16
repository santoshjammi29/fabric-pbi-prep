"use client";

import React, { useRef, useEffect, useState, useId } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  BookOpen,
  Zap,
  Shuffle,
  Filter,
  Layers,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  id: string;
  label: string;
  shortLabel?: string;
  emoji?: string;
  icon?: React.ReactNode;
  count?: number;
  badgeColor?: string;
  description?: string;
}

export interface FilterLevel {
  id: string;
  title: string;
  shortTitle?: string;
  icon?: React.ReactNode;
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  /**
   * Layout style for options:
   * - 'chips': wrapping responsive pills with counts (great for tech/categories)
   * - 'grid': multi-column responsive grid (great for archetypes/specs, eliminates single vertical scroll)
   * - 'segmented': tight segmented pill group (great for difficulty: ALL/EASY/MED/HARD/ARCH)
   */
  layout?: "chips" | "grid" | "segmented";
  /** Columns for grid layout: defaults to responsive 2 sm:3 md:4 lg:5 */
  columns?: 2 | 3 | 4 | 5;
  accentColor?: "blue" | "purple" | "emerald" | "amber" | "cyan" | "indigo";
}

export interface ActiveFilterItem {
  id: string;
  label: string;
  onRemove: () => void;
  color?: string;
}

export interface SearchActionButtons {
  readAll?: {
    isActive: boolean;
    onToggle: () => void;
    label?: string;
    shortcut?: string;
    count?: number;
  };
  studyMode?: {
    isActive: boolean;
    onToggle: () => void;
    label?: string;
  };
  expandCollapse?: {
    onExpandAll: () => void;
    onCollapseAll: () => void;
  };
  shuffle?: {
    isShuffled: boolean;
    onShuffle: () => void;
    label?: string;
  };
  customActions?: React.ReactNode;
}

export interface UnifiedSearchFilterBoxProps {
  /** Search query state */
  searchQuery: string;
  /** Callback on search change */
  onSearchChange: (value: string) => void;
  /** Input placeholder */
  searchPlaceholder?: string;
  /** Match count and total count */
  matchCount?: number;
  totalCount?: number;
  countUnit?: string;
  /** Filter levels array */
  levels: FilterLevel[];
  /** Active filter chips for summary */
  activeFilters?: ActiveFilterItem[];
  /** Reset all filters callback */
  onResetAll?: () => void;
  /** Flag if any filter is active */
  hasActiveFilters?: boolean;
  /** Action buttons */
  actions?: SearchActionButtons;
  /** Color theme accent */
  themeAccent?: "blue" | "purple" | "emerald" | "cyan";
  /** Custom extra classes */
  className?: string;
  /** Custom view switcher or sub-header row */
  subHeader?: React.ReactNode;
}

export function UnifiedSearchFilterBox({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search questions, syntax, mechanisms...",
  matchCount,
  totalCount,
  countUnit = "items",
  levels,
  activeFilters = [],
  onResetAll,
  hasActiveFilters = false,
  actions,
  themeAccent = "blue",
  className,
  subHeader,
}: UnifiedSearchFilterBoxProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // Active level tab selector: 'ALL' shows all levels, or a specific level id to focus
  const [activeLevelTab, setActiveLevelTab] = useState<string>("ALL");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Global Keyboard Shortcut: '/' to focus search, 'Escape' to clear/blur
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Escape" && e.target === searchInputRef.current) {
          if (searchQuery) {
            onSearchChange("");
          } else {
            searchInputRef.current?.blur();
          }
        }
        return;
      }

      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery, onSearchChange]);

  const accentStyles = {
    blue: {
      border: "focus-within:border-blue-500/60 focus-within:ring-blue-500/20",
      activeBg: "bg-blue-600 border-blue-500 text-white shadow-xs",
      badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      indicator: "text-blue-500",
    },
    purple: {
      border: "focus-within:border-purple-500/60 focus-within:ring-purple-500/20",
      activeBg: "bg-purple-600 border-purple-500 text-white shadow-xs",
      badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      indicator: "text-purple-500",
    },
    emerald: {
      border: "focus-within:border-emerald-500/60 focus-within:ring-emerald-500/20",
      activeBg: "bg-emerald-600 border-emerald-500 text-white shadow-xs",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      indicator: "text-emerald-500",
    },
    cyan: {
      border: "focus-within:border-cyan-500/60 focus-within:ring-cyan-500/20",
      activeBg: "bg-cyan-600 border-cyan-500 text-white shadow-xs",
      badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      indicator: "text-cyan-500",
    },
  }[themeAccent];

  // Helper to get active style for an option based on level accent
  const getOptionActiveStyle = (
    levelAccent?: "blue" | "purple" | "emerald" | "amber" | "cyan" | "indigo",
    optBadgeColor?: string
  ) => {
    if (optBadgeColor && optBadgeColor.includes("bg-")) {
      return optBadgeColor;
    }
    const color = levelAccent || themeAccent;
    switch (color) {
      case "purple":
        return "bg-purple-600 border-purple-500 text-white shadow-xs";
      case "emerald":
        return "bg-emerald-600 border-emerald-500 text-white shadow-xs";
      case "amber":
        return "bg-amber-600 border-amber-500 text-white shadow-xs";
      case "cyan":
        return "bg-cyan-600 border-cyan-500 text-white shadow-xs";
      case "indigo":
        return "bg-indigo-600 border-indigo-500 text-white shadow-xs";
      case "blue":
      default:
        return "bg-blue-600 border-blue-500 text-white shadow-xs";
    }
  };

  const getDifficultyColor = (id: string, isSelected: boolean) => {
    if (!isSelected) {
      return "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]";
    }
    switch (id) {
      case "EASY":
        return "bg-emerald-600 text-white border-emerald-500 shadow-xs font-bold";
      case "MEDIUM":
        return "bg-sky-600 text-white border-sky-500 shadow-xs font-bold";
      case "HARD":
        return "bg-amber-600 text-white border-amber-500 shadow-xs font-bold";
      case "ARCHITECT":
        return "bg-purple-600 text-white border-purple-500 shadow-xs font-bold";
      case "ALL":
      default:
        return accentStyles.activeBg;
    }
  };

  const displayedLevels =
    activeLevelTab === "ALL"
      ? levels
      : levels.filter((l) => l.id === activeLevelTab);

  return (
    <section
      role="search"
      aria-label="Unified Search and Multi-Level Filter Hub"
      className={cn(
        "rounded-2xl bg-[var(--surface-1)] border-2 border-[var(--border)] shadow-xs transition-all",
        accentStyles.border,
        className
      )}
    >
      {/* ─── LEVEL 0: UNIFIED COMMAND & SEARCH BAR ─── */}
      <div className="p-2.5 sm:p-3 flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] shrink-0 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            id={inputId}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-20 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs sm:text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            aria-label="Search items"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  onSearchChange("");
                  searchInputRef.current?.focus();
                }}
                className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                aria-label="Clear search query"
                title="Clear search query (Esc)"
              >
                <X size={13} />
              </button>
            ) : (
              <kbd
                className="hidden sm:inline-flex items-center justify-center font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-1)] text-[var(--muted-foreground)] select-none"
                title="Press / to focus search"
              >
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Action Controls & Result Counter */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-between md:justify-end">
          {/* Matched Count Badge */}
          {matchCount !== undefined && (
            <div className="px-2.5 py-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] whitespace-nowrap flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                <strong className="font-mono">{matchCount.toLocaleString()}</strong>
                {totalCount !== undefined && (
                  <span className="text-[var(--muted-foreground)] font-normal text-[11px] ml-1">
                    / {totalCount.toLocaleString()}
                  </span>
                )}{" "}
                <span className="text-[var(--muted-foreground)] text-[11px]">{countUnit}</span>
              </span>
            </div>
          )}

          {/* Action: Read All Toggle */}
          {actions?.readAll && (
            <button
              type="button"
              onClick={actions.readAll.onToggle}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs whitespace-nowrap",
                actions.readAll.isActive
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/20 font-bold"
                  : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-3)]"
              )}
              title="Toggle Read All continuous mode (Shortcut: Shift + E)"
              aria-pressed={actions.readAll.isActive}
            >
              <BookOpen size={13} className={cn(actions.readAll.isActive && "animate-pulse")} />
              <span>{actions.readAll.label || (actions.readAll.isActive ? "Reading All" : "Read All")}</span>
              {actions.readAll.shortcut && (
                <kbd className="hidden lg:inline-block text-[10px] px-1 py-0.5 rounded bg-black/20 text-current border border-white/20 font-mono ml-0.5">
                  {actions.readAll.shortcut}
                </kbd>
              )}
              {actions.readAll.isActive && (
                <span className="px-1 py-0.2 rounded-full bg-emerald-700/90 text-[10px] text-white font-mono">
                  ON
                </span>
              )}
            </button>
          )}

          {/* Action: Study Mode Toggle */}
          {actions?.studyMode && (
            <button
              type="button"
              onClick={actions.studyMode.onToggle}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs whitespace-nowrap",
                actions.studyMode.isActive
                  ? "bg-purple-600 border-purple-500 text-white font-bold"
                  : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-3)]"
              )}
              title="Toggle Flashcard Study Mode"
              aria-pressed={actions.studyMode.isActive}
            >
              <Zap size={13} />
              <span>{actions.studyMode.label || (actions.studyMode.isActive ? "Exit Study" : "Study Mode")}</span>
            </button>
          )}

          {/* Action: Shuffle Button */}
          {actions?.shuffle && (
            <button
              type="button"
              onClick={actions.shuffle.onShuffle}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs whitespace-nowrap",
                actions.shuffle.isShuffled
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-3)]"
              )}
              title="Shuffle or randomize questions order"
            >
              <Shuffle size={12} className={cn(actions.shuffle.isShuffled && "rotate-180 transition-transform")} />
              <span>{actions.shuffle.label || (actions.shuffle.isShuffled ? "Reshuffle" : "Shuffle")}</span>
            </button>
          )}

          {/* Action: Expand / Collapse All */}
          {actions?.expandCollapse && (
            <div className="hidden sm:inline-flex items-center gap-0.5 p-0.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
              <button
                type="button"
                onClick={actions.expandCollapse.onExpandAll}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-all cursor-pointer whitespace-nowrap"
                title="Expand all cards"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={actions.expandCollapse.onCollapseAll}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-all cursor-pointer whitespace-nowrap"
                title="Collapse all cards"
              >
                Collapse All
              </button>
            </div>
          )}

          {/* Custom Action Slots */}
          {actions?.customActions}

          {/* Expand/Collapse Filters Deck Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse filter levels" : "Expand filter levels"}
            title={isExpanded ? "Collapse filter levels" : "Expand filter levels"}
          >
            {isExpanded ? <ChevronUp size={15} /> : <SlidersHorizontal size={15} />}
          </button>
        </div>
      </div>

      {/* Optional Sub-header */}
      {subHeader && <div className="px-3 pb-2 border-b border-[var(--border)]">{subHeader}</div>}

      {/* ─── MULTI-LEVEL FILTER DECK (ACCESSIBLE, NO SINGLE VERTICAL SELECT!) ─── */}
      {isExpanded && levels.length > 0 && (
        <div className="border-t border-[var(--border)] p-2.5 sm:p-3 space-y-3 bg-[var(--surface-1)]">
          {/* Level Switcher Tab Bar (Shown when multiple levels exist) */}
          {levels.length > 1 && (
            <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-1">
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mr-1 flex items-center gap-1">
                  <Filter size={11} className="text-blue-500" /> Levels:
                </span>

                <button
                  type="button"
                  onClick={() => setActiveLevelTab("ALL")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer flex items-center gap-1",
                    activeLevelTab === "ALL"
                      ? "bg-blue-600 border-blue-500 text-white shadow-xs"
                      : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Layers size={11} />
                  <span>All Levels ({levels.length})</span>
                </button>

                {levels.map((lvl, idx) => {
                  const isSelected = activeLevelTab === lvl.id;
                  const isFiltered = lvl.selectedId !== "ALL" && lvl.selectedId !== "";
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setActiveLevelTab(lvl.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer flex items-center gap-1.5",
                        isSelected
                          ? "bg-blue-600 border-blue-500 text-white shadow-xs"
                          : isFiltered
                          ? "bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold"
                          : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      )}
                    >
                      {lvl.icon}
                      <span>
                        L{idx + 1}: {lvl.shortTitle || lvl.title}
                      </span>
                      {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                    </button>
                  );
                })}
              </div>

              {hasActiveFilters && onResetAll && (
                <button
                  type="button"
                  onClick={onResetAll}
                  className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 shrink-0 font-medium cursor-pointer"
                >
                  <RotateCcw size={11} />
                  <span>Reset All</span>
                </button>
              )}
            </div>
          )}

          {/* Render Each Displayed Level */}
          {displayedLevels.map((level, levelIdx) => {
            const isSegmented = level.layout === "segmented";
            const isGrid = level.layout === "grid";

            return (
              <div
                key={level.id}
                className={cn(
                  "space-y-1.5",
                  levelIdx > 0 && "pt-2.5 border-t border-[var(--border)]/70"
                )}
              >
                {/* Level Header Label */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)]">
                    {level.icon}
                    <span className="tracking-wide">{level.title}</span>
                    <span className="text-[10px] font-normal text-[var(--muted-foreground)]">
                      ({level.options.length} options)
                    </span>
                  </div>

                  {level.selectedId !== "ALL" && level.selectedId !== "" && (
                    <button
                      type="button"
                      onClick={() => level.onSelect("ALL")}
                      className="text-[11px] text-[var(--muted-foreground)] hover:text-blue-400 underline cursor-pointer"
                    >
                      Clear level filter
                    </button>
                  )}
                </div>

                {/* Option Container: Grid Layout (Accessible Multi-Column for Archetypes / Facets) */}
                {isGrid && (
                  <div
                    role="radiogroup"
                    aria-label={level.title}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5"
                  >
                    {level.options.map((opt) => {
                      const isSelected = level.selectedId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => level.onSelect(opt.id)}
                          title={opt.description || opt.label}
                          className={cn(
                            "flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer group shadow-2xs",
                            isSelected
                              ? getOptionActiveStyle(level.accentColor, opt.badgeColor)
                              : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                          )}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {opt.emoji && <span className="shrink-0 text-sm">{opt.emoji}</span>}
                            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                            <span className="truncate">{opt.shortLabel || opt.label}</span>
                          </div>
                          {opt.count !== undefined && (
                            <span
                              className={cn(
                                "text-[10px] px-1.5 py-0.2 rounded-full font-mono shrink-0",
                                isSelected
                                  ? "bg-white/20 text-white font-bold"
                                  : "bg-[var(--surface-3)] text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]"
                              )}
                            >
                              {opt.count.toLocaleString()}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Option Container: Segmented Layout (Great for Difficulty: ALL / EASY / MED / HARD / ARCH) */}
                {isSegmented && (
                  <div
                    role="radiogroup"
                    aria-label={level.title}
                    className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] overflow-x-auto scrollbar-none"
                  >
                    {level.options.map((opt) => {
                      const isSelected = level.selectedId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => level.onSelect(opt.id)}
                          title={opt.description || opt.label}
                          className={cn(
                            "flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer text-center flex items-center justify-center gap-1.5",
                            getDifficultyColor(opt.id, isSelected)
                          )}
                        >
                          {opt.emoji && <span>{opt.emoji}</span>}
                          {opt.icon && <span>{opt.icon}</span>}
                          <span>{opt.shortLabel || opt.label}</span>
                          {opt.count !== undefined && (
                            <span
                              className={cn(
                                "text-[10px] px-1 py-0.2 rounded-full font-mono",
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
                              )}
                            >
                              {opt.count.toLocaleString()}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Option Container: Wrapping Chips Layout (Great for Categories / Tech Ecosystems) */}
                {!isGrid && !isSegmented && (
                  <div
                    role="radiogroup"
                    aria-label={level.title}
                    className="flex flex-wrap items-center gap-1.5"
                  >
                    {level.options.map((opt) => {
                      const isSelected = level.selectedId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => level.onSelect(opt.id)}
                          title={opt.description || opt.label}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer flex items-center gap-1.5 group shadow-2xs",
                            isSelected
                              ? getOptionActiveStyle(level.accentColor, opt.badgeColor)
                              : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                          )}
                        >
                          {opt.emoji && <span className="shrink-0">{opt.emoji}</span>}
                          {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                          <span>{opt.shortLabel || opt.label}</span>
                          {opt.count !== undefined && (
                            <span
                              className={cn(
                                "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                                isSelected
                                  ? "bg-white/20 text-white font-bold"
                                  : "bg-[var(--surface-3)] text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]"
                              )}
                            >
                              {opt.count.toLocaleString()}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── LEVEL 4: ACTIVE FILTER CHIPS & RESET ROW ─── */}
      {(hasActiveFilters || activeFilters.length > 0) && (
        <div className="flex items-center gap-1.5 flex-wrap px-3 py-2 border-t border-[var(--border)]/70 bg-[var(--surface-2)]/60 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1 mr-1">
            <SlidersHorizontal size={10} /> Active:
          </span>

          {activeFilters.map((af) => (
            <button
              key={af.id}
              type="button"
              onClick={af.onRemove}
              aria-label={`Remove filter: ${af.label}`}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium transition-all cursor-pointer hover:opacity-80 shadow-2xs",
                af.color || "bg-blue-500/10 border-blue-500/30 text-blue-400"
              )}
              title={`Remove filter: ${af.label}`}
            >
              <span>{af.label}</span>
              <X size={11} aria-hidden="true" />
            </button>
          ))}

          {onResetAll && (
            <button
              type="button"
              onClick={onResetAll}
              className="text-[11px] text-[var(--muted-foreground)] hover:text-red-400 underline cursor-pointer ml-1 font-medium inline-flex items-center gap-1"
            >
              <RotateCcw size={10} />
              <span>Reset all</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
