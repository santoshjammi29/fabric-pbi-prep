"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Search,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { architectureData } from "@/data";
import { ArchitectureQuestion, Difficulty } from "@/types/data";

const difficultyColors: Record<Difficulty, { bg: string; text: string; border: string }> = {
  EASY: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  MEDIUM: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  HARD: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  ARCHITECT: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

export default function ArchitectureHubPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 25;

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
        toast.success("Saved scenario to My Studio");
      }
    } catch {
      // ignore
    }
  };

  const copyScenario = (item: ArchitectureQuestion, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Architecture Scenario: ${item.question}\n\nPrincipal Solution: ${item.answer}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    toast.success("Scenario copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    architectureData.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ["ALL", ...Array.from(set).sort()];
  }, []);

  // Filtered dataset
  const filteredItems = useMemo(() => {
    return architectureData.filter((item) => {
      if (selectedDifficulty !== "ALL" && item.difficulty !== selectedDifficulty) {
        return false;
      }
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const qMatch = item.question.toLowerCase().includes(q);
        const aMatch = item.answer.toLowerCase().includes(q);
        const catMatch = item.category?.toLowerCase().includes(q);
        const nicheMatch = item.niche?.toLowerCase().includes(q);
        return qMatch || aMatch || catMatch || nicheMatch;
      }
      return true;
    });
  }, [selectedDifficulty, selectedCategory, searchQuery]);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice(0, page * pageSize);
  }, [filteredItems, page]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-8 isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
              <Layers size={14} />
              <span>Step 6 · Enterprise Architecture Mastery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Data Platform Architecture Hub
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              2,400+ advanced design scenarios covering Lakehouse, real-time streaming, LLM/RAG,
              IaC, disaster recovery, data mesh, and MPP distributed engine patterns.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-2xl font-bold text-purple-400">{architectureData.length}</div>
              <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Scenarios</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-2xl font-bold text-blue-400">{categories.length - 1}</div>
              <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Spec Domains</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search 2,400+ architecture scenarios (e.g. Disaster recovery, CDC, Direct Lake, Mesh)..."
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

          {/* Difficulty chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]">
            {["ALL", "EASY", "MEDIUM", "HARD", "ARCHITECT"].map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  setSelectedDifficulty(diff);
                  setPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0",
                  selectedDifficulty === diff
                    ? "bg-purple-600 text-white shadow-md font-semibold"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                )}
              >
                {diff === "ALL" ? "All Levels" : diff}
              </button>
            ))}
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Filter size={12} /> Spec:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0",
                selectedCategory === cat
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold"
                  : "bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
              )}
            >
              {cat === "ALL" ? "⚡ All 16 Specs" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Meta */}
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
        <span>
          Showing <strong className="text-[var(--foreground)]">{paginatedItems.length}</strong> of{" "}
          <strong className="text-[var(--foreground)]">{filteredItems.length}</strong> scenarios
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpandedIds(new Set(paginatedItems.map((i) => i.id)))}
            className="hover:text-[var(--foreground)] font-medium transition-colors"
          >
            Expand All
          </button>
          <span>•</span>
          <button
            onClick={() => setExpandedIds(new Set())}
            className="hover:text-[var(--foreground)] font-medium transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Scenarios Stream */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-8">
          <Layers size={40} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-[var(--foreground)]">No matching scenarios found</h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or switching domain filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedDifficulty("ALL");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedItems.map((item, index) => {
            const isExpanded = expandedIds.has(item.id);
            const isBookmarked = bookmarks.includes(item.id);
            const diffStyle = difficultyColors[item.difficulty] || difficultyColors.ARCHITECT;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.015, 0.2) }}
                className={cn(
                  "rounded-2xl border transition-all duration-200 overflow-hidden",
                  isExpanded
                    ? "bg-[var(--surface-1)] border-purple-500/40 shadow-xl"
                    : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]"
                )}
              >
                {/* Header Card */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-5 cursor-pointer select-none space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-purple-400 tracking-wide uppercase">
                          {item.category} {item.niche ? `· ${item.niche}` : ""}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                            diffStyle.bg,
                            diffStyle.text,
                            diffStyle.border
                          )}
                        >
                          {item.difficulty}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight leading-snug">
                        {item.question}
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
                        onClick={(e) => copyScenario(item, e)}
                        className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors"
                        title="Copy Scenario"
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
                </div>

                {/* Expanded Answer */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-[var(--border)] p-5 bg-[var(--surface-2)] space-y-3 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                        <Sparkles size={14} className="text-purple-400" />
                        <span>Principal Architect Blueprint:</span>
                      </div>
                      <div className="text-[var(--foreground)] leading-relaxed whitespace-pre-line opacity-95">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Pagination */}
          {paginatedItems.length < filteredItems.length && (
            <div className="pt-6 text-center">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg hover:shadow-purple-500/25"
              >
                Load More Scenarios ({filteredItems.length - paginatedItems.length} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
