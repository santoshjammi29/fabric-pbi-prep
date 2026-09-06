"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCode2,
  Search,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Terminal,
  Lightbulb,
  Briefcase,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { pysparkData, sparksqlData, mssqlData, pythonData } from "@/data";
import { CodeSheetItem, CodeLevel } from "@/types/data";
import { CodeBlock } from "@/components/ui/code-block";

type LanguageKey = "pyspark" | "sparksql" | "mssql" | "python";

const languageConfigs: Record<
  LanguageKey,
  { name: string; icon: string; data: CodeSheetItem[]; badgeColor: string }
> = {
  pyspark: {
    name: "PySpark 3.4+ / 4.0",
    icon: "🐍",
    data: pysparkData,
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  sparksql: {
    name: "Spark SQL & Unity",
    icon: "⚡",
    data: sparksqlData,
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  mssql: {
    name: "MS SQL / T-SQL",
    icon: "🗄️",
    data: mssqlData,
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  python: {
    name: "Python (Pandas & Polars)",
    icon: "🐼",
    data: pythonData,
    badgeColor: "bg-green-500/10 text-green-400 border-green-500/20",
  },
};

const levelBadges: Record<CodeLevel, { bg: string; text: string; border: string }> = {
  beginner: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  intermediate: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  advanced: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  architect: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

export default function CodePracticePage() {
  const [activeLang, setActiveLang] = useState<LanguageKey>("pyspark");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Load bookmarks
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dataprep_bookmarks");
      if (saved) setBookmarks(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.includes(id)
      ? bookmarks.filter((b) => b !== id)
      : [...bookmarks, id];
    setBookmarks(updated);
    try {
      localStorage.setItem("dataprep_bookmarks", JSON.stringify(updated));
      if (bookmarks.includes(id)) {
        toast.info("Bookmark removed");
      } else {
        toast.success("Saved code sheet to bookmarks");
      }
    } catch {
      // ignore
    }
  };

  const copyCode = (code: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentDataset = useMemo(() => {
    return languageConfigs[activeLang].data;
  }, [activeLang]);

  const filteredItems = useMemo(() => {
    return currentDataset.filter((item) => {
      if (selectedLevel !== "ALL" && item.level !== selectedLevel) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const descMatch = item.description?.toLowerCase().includes(q);
        const codeMatch = item.code?.toLowerCase().includes(q);
        const useCaseMatch = item.use_case?.toLowerCase().includes(q);
        const catMatch = item.category?.toLowerCase().includes(q);
        return titleMatch || descMatch || codeMatch || useCaseMatch || catMatch;
      }
      return true;
    });
  }, [currentDataset, selectedLevel, searchQuery]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-8 isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
              <FileCode2 size={14} />
              <span>Step 2 · Polyglot Engineering</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Hands-On Code Practice &amp; Syntaxes
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Production-grade code patterns across 4 core languages. Optimized for window functions,
              incremental merges, vector operations, and low-latency analytics.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0 text-center">
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-2xl font-bold text-blue-400">128+</div>
              <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Templates</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-2xl font-bold text-purple-400">4</div>
              <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Languages</div>
            </div>
          </div>
        </div>
      </div>

      {/* Language Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(languageConfigs) as LanguageKey[]).map((key) => {
          const cfg = languageConfigs[key];
          const isSelected = activeLang === key;
          return (
            <button
              key={key}
              onClick={() => {
                setActiveLang(key);
                setExpandedId(null);
              }}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left group",
                isSelected
                  ? "bg-purple-600/15 border-purple-500/50 shadow-lg"
                  : "bg-[var(--surface-1)] border-[var(--border)] hover:bg-[var(--surface-2)] hover:border-[var(--border-hover)]"
              )}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{cfg.icon}</span>
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "text-xs sm:text-sm font-bold truncate",
                    isSelected ? "text-purple-300" : "text-[var(--foreground)]"
                  )}
                >
                  {cfg.name}
                </div>
                <div className="text-[11px] text-[var(--muted-foreground)]">
                  {cfg.data.length} Templates
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search & Level Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${languageConfigs[activeLang].name} syntax, functions, or use cases...`}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-purple-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1 rounded-md bg-[var(--surface-2)]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]">
          {["ALL", "beginner", "intermediate", "advanced", "architect"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 capitalize",
                selectedLevel === lvl
                  ? "bg-purple-600 text-white shadow-md font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              )}
            >
              {lvl === "ALL" ? "All Levels" : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Count summary */}
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
        <span>
          Showing <strong className="text-[var(--foreground)]">{filteredItems.length}</strong> coding templates
        </span>
        <button
          onClick={() => setExpandedId(expandedId ? null : filteredItems[0]?.id || null)}
          className="hover:text-[var(--foreground)] font-medium transition-colors"
        >
          {expandedId ? "Collapse All" : "Quick Preview"}
        </button>
      </div>

      {/* Code Templates Stream */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-8">
          <Layers size={40} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-[var(--foreground)]">No matching templates found</h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different level.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedLevel("ALL");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, index) => {
            const isExpanded = expandedId === item.id;
            const isBookmarked = bookmarks.includes(item.id);
            const levelStyle = levelBadges[item.level] || levelBadges.intermediate;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
                className={cn(
                  "rounded-2xl border transition-all duration-200 overflow-hidden",
                  isExpanded
                    ? "bg-[var(--surface-1)] border-purple-500/40 shadow-xl"
                    : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]"
                )}
              >
                {/* Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 cursor-pointer select-none space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-purple-400 tracking-wide uppercase">
                          {item.category || languageConfigs[activeLang].name}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize",
                            levelStyle.bg,
                            levelStyle.text,
                            levelStyle.border
                          )}
                        >
                          {item.level}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => toggleBookmark(item.id, e)}
                        className={cn(
                          "p-2 rounded-xl transition-colors",
                          isBookmarked
                            ? "text-amber-400 bg-amber-400/10"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                        )}
                        title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                      >
                        {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>

                      <button
                        onClick={(e) => copyCode(item.code, item.id, e)}
                        className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors"
                        title="Copy Code"
                      >
                        {copiedId === item.id ? (
                          <Check size={16} className="text-green-400" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>

                      <div className="p-2 text-[var(--muted-foreground)]">
                        <ChevronDown
                          size={16}
                          className={cn(
                            "transition-transform duration-300",
                            isExpanded && "rotate-180 text-purple-400"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] line-clamp-1">
                    {item.description}
                  </p>
                </div>

                {/* Expanded Code & Notes Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-[var(--border)] p-5 bg-[var(--surface-2)] space-y-4 text-xs sm:text-sm"
                    >
                      {/* Use Case Scenario */}
                      {item.use_case && (
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 flex items-start gap-2.5">
                          <Briefcase size={16} className="text-purple-400 mt-0.5 shrink-0" />
                          <div className="space-y-0.5">
                            <span className="font-bold text-[11px] uppercase tracking-wider text-purple-300">
                              Enterprise Scenario:
                            </span>
                            <p className="text-xs text-purple-200/90 leading-relaxed">{item.use_case}</p>
                          </div>
                        </div>
                      )}

                      {/* Modern Code Block */}
                      <CodeBlock
                        code={item.code}
                        language={activeLang}
                        filename={`${item.id}.${activeLang === "sparksql" || activeLang === "mssql" ? "sql" : "py"}`}
                        badge={languageConfigs[activeLang].name}
                      />

                      {/* Performance / Best Practice Notes */}
                      {item.notes && item.notes.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                            <Lightbulb size={14} className="text-amber-400" />
                            Architectural Tuning Notes:
                          </h4>
                          <ul className="space-y-1.5">
                            {item.notes.map((note, ni) => (
                              <li key={ni} className="flex items-start gap-2 text-[var(--muted-foreground)]">
                                <span className="text-amber-400 font-bold">•</span>
                                <span className="leading-snug">{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
