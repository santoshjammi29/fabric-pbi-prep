"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  Filter,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { conceptsDb } from "@/data";
import { Concept, Difficulty } from "@/types/data";

const difficultyColors: Record<Difficulty, { bg: string; text: string; border: string }> = {
  EASY: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  MEDIUM: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  HARD: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  ARCHITECT: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

function ConceptsContent() {
  const searchParams = useSearchParams();
  const initialTerm = searchParams.get("term") || "";

  const [searchQuery, setSearchQuery] = useState(initialTerm);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load bookmarks from localStorage
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
        toast.success("Bookmark saved to My Studio");
      }
    } catch {
      // ignore
    }
  };

  const copyDefinition = (concept: Concept, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${concept.term}\n\nDefinition: ${concept.definition}\n\nExplanation: ${concept.explanation}`;
    navigator.clipboard.writeText(text);
    setCopiedId(concept.id);
    toast.success("Copied concept definition to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Get distinct categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    conceptsDb.forEach((c) => {
      if (c.category) cats.add(c.category);
    });
    return ["ALL", ...Array.from(cats).sort()];
  }, []);

  // Filter concepts
  const filteredConcepts = useMemo(() => {
    return conceptsDb.filter((c) => {
      if (selectedCategory !== "ALL" && c.category !== selectedCategory) {
        return false;
      }
      if (selectedDifficulty !== "ALL" && c.difficulty !== selectedDifficulty) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const termMatch = c.term.toLowerCase().includes(q);
        const defMatch = c.definition.toLowerCase().includes(q);
        const expMatch = c.explanation.toLowerCase().includes(q);
        const catMatch = c.category.toLowerCase().includes(q);
        const keyMatch = c.keyPoints?.some((kp) => kp.toLowerCase().includes(q));
        return termMatch || defMatch || expMatch || catMatch || keyMatch;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-8 isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-400">
              <BookOpen size={14} />
              <span>Step 1 · Core Foundations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Architect&rsquo;s Key Concepts &amp; Glossary
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Master foundational definitions, architectural trade-offs, and critical buzzwords across
              Fabric, Databricks, Delta Lake, Synapse, and Modern Lakehouse architectures.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-2xl font-bold text-green-400">{conceptsDb.length}</div>
              <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Terms Curated</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-2xl font-bold text-purple-400">{categories.length - 1}</div>
              <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        {/* Search row */}
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
              placeholder="Search 110+ concepts (e.g., Lakehouse, ACID, Direct Lake, Tungsten, Lineage)..."
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

          {/* Difficulty filter chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]">
            {["ALL", "EASY", "MEDIUM", "HARD", "ARCHITECT"].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
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

        {/* Category chips scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Filter size={12} /> Domain:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0",
                selectedCategory === cat
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm font-semibold"
                  : "bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
              )}
            >
              {cat === "ALL" ? "⚡ All Domains" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
        <span>
          Showing <strong className="text-[var(--foreground)]">{filteredConcepts.length}</strong> concepts
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpandedId(expandedId ? null : filteredConcepts[0]?.id || null)}
            className="hover:text-[var(--foreground)] font-medium transition-colors"
          >
            {expandedId ? "Collapse All" : "Quick Preview"}
          </button>
        </div>
      </div>

      {/* Concepts Grid / List */}
      {filteredConcepts.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-8">
          <Layers size={40} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-[var(--foreground)]">No matching concepts found</h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or switching category filters.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConcepts.map((concept, index) => {
            const isExpanded = expandedId === concept.id;
            const isBookmarked = bookmarks.includes(concept.id);
            const diffStyle = difficultyColors[concept.difficulty] || difficultyColors.MEDIUM;

            return (
              <motion.div
                key={concept.id}
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
                {/* Concept Header Card */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : concept.id)}
                  className="p-5 cursor-pointer select-none space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-purple-400 tracking-wide uppercase">
                          {concept.category}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                            diffStyle.bg,
                            diffStyle.text,
                            diffStyle.border
                          )}
                        >
                          {concept.difficulty}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
                        {concept.term}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => toggleBookmark(concept.id, e)}
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
                        onClick={(e) => copyDefinition(concept, e)}
                        className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors"
                        title="Copy Definition"
                      >
                        {copiedId === concept.id ? (
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

                  {/* Summary Definition */}
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                    {concept.definition}
                  </p>
                </div>

                {/* Expanded Details Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-[var(--border)] px-5 py-4 bg-[var(--surface-2)] space-y-4 text-xs sm:text-sm"
                    >
                      {/* Deep-dive Explanation */}
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                          <Sparkles size={13} className="text-purple-400" />
                          Architectural Deep Dive
                        </h4>
                        <p className="text-[var(--foreground)] opacity-90 leading-relaxed">
                          {concept.explanation}
                        </p>
                      </div>

                      {/* Key Architectural Takeaways */}
                      {concept.keyPoints && concept.keyPoints.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                            Core Takeaways:
                          </h4>
                          <ul className="space-y-1.5">
                            {concept.keyPoints.map((point, ki) => (
                              <li key={ki} className="flex items-start gap-2 text-[var(--muted-foreground)]">
                                <CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" />
                                <span className="leading-snug">{point}</span>
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

export default function ConceptsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-[var(--muted-foreground)]">Loading Concepts...</div>}>
      <ConceptsContent />
    </React.Suspense>
  );
}

