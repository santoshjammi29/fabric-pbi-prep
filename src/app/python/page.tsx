// src/app/python/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCode2, Copy, Check, Bookmark, BookmarkCheck, ChevronDown, Search, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { pythonData } from "@/data";
import { CodeSheetItem, CodeLevel } from "@/types/data";
import { CodeBlock } from "@/components/ui/code-block";

const levelBadges: Record<CodeLevel, { bg: string; text: string; border: string }> = {
  beginner: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  intermediate: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  advanced: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  architect: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

// Memoized card for each item – reduces re‑render cost when list changes
const ItemCard = React.memo(function ItemCard({
  item,
  isExpanded,
  onToggle,
  onCopy,
  onBookmark,
  copied,
  bookmarked,
}: {
  item: CodeSheetItem;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onCopy: (code: string, id: string, e: React.MouseEvent) => void;
  onBookmark: (id: string, e: React.MouseEvent) => void;
  copied: boolean;
  bookmarked: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow",
        isExpanded ? "border-purple-500" : "border-[var(--border)]",
      )}
      onClick={() => onToggle(item.id)}
    >
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[var(--foreground)] truncate sm:whitespace-normal">{item.title}</h3>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] truncate">{item.category}</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span
            className={cn(
              "px-2 py-0.5 text-[10px] sm:text-xs rounded font-medium",
              levelBadges[item.level].bg,
              levelBadges[item.level].text,
              levelBadges[item.level].border,
            )}
          >
            {item.level}
          </span>
          <button
            onClick={e => onBookmark(item.id, e)}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors"
            title={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
          >
            {bookmarked ? <BookmarkCheck size={17} className="text-amber-400" /> : <Bookmark size={17} />}
          </button>
          <button
            onClick={e => onCopy(item.code, item.id, e)}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors"
            title="Copy Code"
          >
            {copied ? <Check size={17} className="text-green-400" /> : <Copy size={17} />}
          </button>
          <div className="p-1.5 text-[var(--muted-foreground)]">
            <ChevronDown size={18} className={cn("transform transition-transform", isExpanded ? "rotate-180 text-purple-400" : "rotate-0")} />
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="px-4 pb-4 text-sm text-[var(--muted-foreground)] border-t border-[var(--border)] bg-[var(--surface-2)]"
          >
            <p className="mb-2"><strong>Description:</strong> {item.description}</p>
            <CodeBlock code={item.code} language="python" />
            {item.notes?.length && (
              <ul className="list-disc list-inside mb-2">
                {item.notes.map((n, i) => (<li key={i}>{n}</li>))}
              </ul>
            )}
            {item.use_case && <p><strong>Use‑case:</strong> {item.use_case}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default function PythonHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Load bookmarks once
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dataprep_bookmarks");
      if (saved) setBookmarks(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleBookmark = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks(prev => {
      const updated = prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id];
      try { localStorage.setItem("dataprep_bookmarks", JSON.stringify(updated)); } catch {}
      if (prev.includes(id)) toast.info("Bookmark removed"); else toast.success("Saved code sheet to bookmarks");
      return updated;
    });
  }, []);

  const copyCode = useCallback((code: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const filteredItems = useMemo(() => {
    return pythonData.filter(item => {
      if (selectedLevel !== "ALL" && item.level !== selectedLevel) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          (item.description?.toLowerCase().includes(q) ?? false) ||
          (item.code?.toLowerCase().includes(q) ?? false) ||
          (item.use_case?.toLowerCase().includes(q) ?? false) ||
          (item.category?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [searchQuery, selectedLevel]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const handleLevelClick = useCallback((lvl: string) => {
    setSelectedLevel(lvl);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  const handleExpand = useCallback((id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  }, []);

  return (
    <div className="space-y-8 pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-8 isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-400">
              <FileCode2 size={14} />
              <span>Python Hub · Data Engineering</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Learn Python for Modern Data Platforms
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Curated code‑first tutorials covering Foundations → Advanced → Architect‑level patterns, all focused on real‑world DE and Big Data use‑cases.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0 text-center">
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-2xl font-bold text-green-400">{pythonData.length}+</div>
              <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Topics</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-2xl font-bold text-purple-400">4</div>
              <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Levels</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search topics…"
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-purple-400",
            )}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] max-w-full">
          {(["ALL", "beginner", "intermediate", "advanced", "architect"] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => handleLevelClick(lvl)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 capitalize",
                selectedLevel === lvl
                  ? "bg-purple-600 text-white shadow-md font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]",
              )}
            >
              {lvl === "ALL" ? "All Levels" : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {paginated.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            isExpanded={expandedId === item.id}
            onToggle={handleExpand}
            onCopy={copyCode}
            onBookmark={toggleBookmark}
            copied={copiedId === item.id}
            bookmarked={bookmarks.includes(item.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
          className={cn("px-3 py-1 rounded-lg border", page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--surface-2)]")}
        >
          Previous
        </button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className={cn("px-3 py-1 rounded-lg border", page === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--surface-2)]")}
        >
          Next
        </button>
      </div>
    </div>
  );
}
