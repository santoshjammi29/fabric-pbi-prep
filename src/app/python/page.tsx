// src/app/python/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileCode2,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Search,
  Filter,
  Sparkles,
  Layers,
  Terminal,
  ArrowRight,
  X,
  Share2,
  BookOpen,
  CheckCircle2,
  SlidersHorizontal,
  RotateCcw,
  ExternalLink,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { pythonData, modernCodeMatrix, modernStackDb } from "@/data";
import { CodeSheetItem, CodeLevel, ModernCodeMatrix, ModernStackQuestion } from "@/types/data";
import { CodeBlock } from "@/components/ui/code-block";
import { SmoothAccordion } from "@/components/ui/smooth-accordion";

// Difficulty / Level badges configuration
const levelBadges: Record<CodeLevel, { bg: string; text: string; border: string; dot: string }> = {
  beginner: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-400" },
  intermediate: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", dot: "bg-blue-400" },
  advanced: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", dot: "bg-amber-400" },
  architect: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", dot: "bg-purple-400" },
};

// Framework tags detection
type FrameworkKey = "all" | "pandas" | "polars" | "pyspark" | "delta" | "pure_python";

function detectFramework(item: CodeSheetItem): "pandas" | "polars" | "pyspark" | "delta" | "pure_python" {
  const text = `${item.title} ${item.category} ${item.description || ""} ${item.code || ""}`.toLowerCase();
  if (text.includes("polars") || text.includes("pl.")) return "polars";
  if (text.includes("pyspark") || text.includes("spark.") || text.includes("sparkcontext")) return "pyspark";
  if (text.includes("deltalake") || text.includes("deltatable") || text.includes("delta lake")) return "delta";
  if (text.includes("pandas") || text.includes("pd.") || text.includes("dataframe")) return "pandas";
  return "pure_python";
}

const frameworkConfig: Record<FrameworkKey, { label: string; icon: string; badgeColor: string }> = {
  all: { label: "All Stacks", icon: "🌐", badgeColor: "bg-slate-500/10 text-slate-300 border-slate-500/20" },
  pandas: { label: "Pandas", icon: "🐼", badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  polars: { label: "Polars", icon: "⚡", badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  pyspark: { label: "PySpark", icon: "💥", badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  delta: { label: "Delta Lake", icon: "🔺", badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  pure_python: { label: "Core Python", icon: "🐍", badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

type HubTab = "runbooks" | "polyglot" | "modern-stack";

// Memoized Card for Individual Runbook Item
const RunbookCard = React.memo(function RunbookCard({
  item,
  isExpanded,
  onToggle,
  onCopy,
  onBookmark,
  onShare,
  copied,
  bookmarked,
}: {
  item: CodeSheetItem;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onCopy: (code: string, id: string, e: React.MouseEvent) => void;
  onBookmark: (id: string, e: React.MouseEvent) => void;
  onShare: (id: string, e: React.MouseEvent) => void;
  copied: boolean;
  bookmarked: boolean;
}) {
  const fw = detectFramework(item);
  const fwMeta = frameworkConfig[fw];
  const lvlMeta = levelBadges[item.level] || levelBadges.intermediate;

  return (
    <div
      id={`python-${item.id}`}
      className={cn(
        "rounded-2xl border transition-all duration-200 overflow-hidden",
        isExpanded
          ? "bg-[var(--surface-1)] border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20"
          : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]",
      )}
    >
      {/* Header bar */}
      <div
        onClick={() => onToggle(item.id)}
        className="p-4 sm:p-5 cursor-pointer select-none space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Meta Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 tracking-wider uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                {item.category}
              </span>
              <span
                className={cn(
                  "text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1.5",
                  lvlMeta.bg,
                  lvlMeta.text,
                  lvlMeta.border,
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", lvlMeta.dot)} />
                <span className="capitalize">{item.level}</span>
              </span>
              <span
                className={cn(
                  "text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1",
                  fwMeta.badgeColor,
                )}
              >
                <span>{fwMeta.icon}</span>
                <span>{fwMeta.label}</span>
              </span>
            </div>

            {/* Title - Full text visible with no truncation */}
            <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight break-words pt-0.5">
              {item.title}
            </h3>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pt-0.5">
            <button
              onClick={(e) => onShare(item.id, e)}
              className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors"
              title="Copy direct link to this runbook"
              aria-label="Copy direct link"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={(e) => onBookmark(item.id, e)}
              className={cn(
                "p-2 rounded-xl transition-colors",
                bookmarked
                  ? "text-amber-400 bg-amber-400/10"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]",
              )}
              title={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
              aria-label={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
            >
              {bookmarked ? <BookmarkCheck size={16} className="text-amber-400" /> : <Bookmark size={16} />}
            </button>
            <button
              onClick={(e) => onCopy(item.code, item.id, e)}
              className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors"
              title="Copy Code"
              aria-label="Copy Code"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
            <div className="p-2 text-[var(--muted-foreground)]">
              <ChevronDown
                size={18}
                className={cn(
                  "transform transition-transform duration-300",
                  isExpanded ? "rotate-180 text-emerald-400" : "rotate-0",
                )}
              />
            </div>
          </div>
        </div>

        {/* Collapsed short description summary */}
        {!isExpanded && (
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Expanded Accordion Body */}
      <SmoothAccordion isOpen={isExpanded} innerClassName="p-4 sm:p-6 space-y-5 text-sm">
        {/* Full description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] opacity-90 flex items-center gap-1.5">
            <BookOpen size={14} className="text-emerald-400" /> Architecture Overview
          </h4>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Code snippet block */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span className="font-mono text-emerald-400 text-[11px]">
              {item.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 42)}.py
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Python 3.11+ / Data Platform</span>
          </div>
          <CodeBlock
            code={item.code}
            language="python"
            filename={`${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 36)}.py`}
            showLineNumbers
          />
        </div>

        {/* Tuning notes / Production gotchas */}
        {item.notes && (Array.isArray(item.notes) ? item.notes.length > 0 : Boolean(item.notes)) && (
          <div className="space-y-2 pt-3 border-t border-[var(--border)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles size={14} /> Production Tuning &amp; Gotchas
            </h4>
            <ul className="space-y-2">
              {(Array.isArray(item.notes) ? item.notes : [item.notes]).map((note, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[var(--muted-foreground)]">
                  <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span className="leading-snug text-slate-300">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Real-world enterprise use case */}
        {item.use_case && (
          <div className="pt-3 border-t border-[var(--border)]">
            <div className="p-3.5 sm:p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs sm:text-sm space-y-1">
              <div className="font-bold text-purple-300 flex items-center gap-1.5">
                <span>🎯</span> Enterprise Scenario:
              </div>
              <p className="text-purple-200/90 leading-relaxed">{item.use_case}</p>
            </div>
          </div>
        )}
      </SmoothAccordion>
    </div>
  );
});

// Polyglot Matrix Topic Card
function PolyglotCard({
  item,
  copiedKey,
  onCopySnippet,
}: {
  item: ModernCodeMatrix;
  copiedKey: string | null;
  onCopySnippet: (code: string, key: string) => void;
}) {
  const [activeEngine, setActiveEngine] = useState<"side_by_side" | "python" | "pyspark" | "duckdb" | "sparksql" | "snowflake">("side_by_side");

  return (
    <div className="rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-5 sm:p-7 space-y-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400 mb-1.5">
            <Sparkles size={12} />
            <span>Cross-Engine Translation</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">{item.topic}</h3>
        </div>

        {/* Engine switcher for mobile/compact views */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] self-start sm:self-auto">
          {[
            { id: "side_by_side", label: "Side-by-Side" },
            { id: "python", label: "Python (Polars)" },
            { id: "pyspark", label: "PySpark" },
            { id: "duckdb", label: "DuckDB" },
            { id: "sparksql", label: "Spark SQL" },
            { id: "snowflake", label: "Snowflake" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveEngine(tab.id as typeof activeEngine)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                activeEngine === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-1)]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeEngine === "side_by_side" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                🐍 Python (Polars/Pandas)
              </span>
              <button
                onClick={() => onCopySnippet(item.python, `${item.topic}-python`)}
                className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
              >
                {copiedKey === `${item.topic}-python` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>Copy</span>
              </button>
            </div>
            <CodeBlock code={item.python} language="python" filename="python_polars.py" showLineNumbers={false} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                💥 PySpark
              </span>
              <button
                onClick={() => onCopySnippet(item.pyspark, `${item.topic}-pyspark`)}
                className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
              >
                {copiedKey === `${item.topic}-pyspark` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>Copy</span>
              </button>
            </div>
            <CodeBlock code={item.pyspark} language="python" filename="pyspark_engine.py" showLineNumbers={false} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                🦆 DuckDB (In-Memory SQL)
              </span>
              <button
                onClick={() => onCopySnippet(item.duckdb, `${item.topic}-duckdb`)}
                className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
              >
                {copiedKey === `${item.topic}-duckdb` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>Copy</span>
              </button>
            </div>
            <CodeBlock code={item.duckdb} language="sql" filename="duckdb.sql" showLineNumbers={false} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                ⚡ Spark SQL
              </span>
              <button
                onClick={() => onCopySnippet(item.sparksql, `${item.topic}-sparksql`)}
                className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
              >
                {copiedKey === `${item.topic}-sparksql` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>Copy</span>
              </button>
            </div>
            <CodeBlock code={item.sparksql} language="sql" filename="spark.sql" showLineNumbers={false} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                ❄️ Snowflake SQL
              </span>
              <button
                onClick={() => onCopySnippet(item.snowflake, `${item.topic}-snowflake`)}
                className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
              >
                {copiedKey === `${item.topic}-snowflake` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>Copy</span>
              </button>
            </div>
            <CodeBlock code={item.snowflake} language="sql" filename="snowflake.sql" showLineNumbers={false} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                ☁️ BigQuery / Trino
              </span>
              <button
                onClick={() => onCopySnippet(item.bigquery, `${item.topic}-bigquery`)}
                className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
              >
                {copiedKey === `${item.topic}-bigquery` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>Copy</span>
              </button>
            </div>
            <CodeBlock code={item.bigquery} language="sql" filename="bigquery.sql" showLineNumbers={false} />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-bold text-[var(--foreground)]">
              {activeEngine === "python" && "🐍 Python (Polars / Arrow)"}
              {activeEngine === "pyspark" && "💥 PySpark (Distributed JVM/Python)"}
              {activeEngine === "duckdb" && "🦆 DuckDB (Vectorized Columnar SQL)"}
              {activeEngine === "sparksql" && "⚡ Spark SQL (Catalyst Optimizer)"}
              {activeEngine === "snowflake" && "❄️ Snowflake Virtual Warehouse SQL"}
            </span>
            <button
              onClick={() => {
                const code =
                  activeEngine === "python"
                    ? item.python
                    : activeEngine === "pyspark"
                    ? item.pyspark
                    : activeEngine === "duckdb"
                    ? item.duckdb
                    : activeEngine === "sparksql"
                    ? item.sparksql
                    : item.snowflake;
                onCopySnippet(code, `${item.topic}-${activeEngine}`);
              }}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)]"
            >
              {copiedKey === `${item.topic}-${activeEngine}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>Copy Code</span>
            </button>
          </div>
          <CodeBlock
            code={
              activeEngine === "python"
                ? item.python
                : activeEngine === "pyspark"
                ? item.pyspark
                : activeEngine === "duckdb"
                ? item.duckdb
                : activeEngine === "sparksql"
                ? item.sparksql
                : item.snowflake
            }
            language={activeEngine === "python" || activeEngine === "pyspark" ? "python" : "sql"}
            showLineNumbers
          />
        </div>
      )}
    </div>
  );
}

// Main Python Hub Content Component
function PythonHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Top-level hub view mode: 'runbooks' | 'polyglot' | 'modern-stack'
  const [activeTab, setActiveTab] = useState<HubTab>("runbooks");

  // Slicer States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>("all");
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Card & List States
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const scrollTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const copyTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Distinct categories dynamically derived from data_python.json
  const availableCategories = useMemo(() => {
    const catsMap = new Map<string, number>();
    pythonData.forEach((item) => {
      const cat = item.category || "General";
      catsMap.set(cat, (catsMap.get(cat) || 0) + 1);
    });
    const sorted = Array.from(catsMap.entries()).sort((a, b) => b[1] - a[1]);
    return [
      { name: "ALL", count: pythonData.length },
      ...sorted.map(([name, count]) => ({ name, count })),
    ];
  }, []);

  // Level counts
  const levelCounts = useMemo(() => {
    const counts = { ALL: pythonData.length, beginner: 0, intermediate: 0, advanced: 0, architect: 0 };
    pythonData.forEach((item) => {
      if (item.level in counts) {
        counts[item.level as CodeLevel]++;
      }
    });
    return counts;
  }, []);

  // Framework counts
  const frameworkCounts = useMemo(() => {
    const counts: Record<FrameworkKey, number> = {
      all: pythonData.length,
      pandas: 0,
      polars: 0,
      pyspark: 0,
      delta: 0,
      pure_python: 0,
    };
    pythonData.forEach((item) => {
      const fw = detectFramework(item);
      counts[fw]++;
    });
    return counts;
  }, []);

  // Modern Stack questions with Python implementations
  const modernStackWithPy = useMemo(() => {
    return modernStackDb.filter((q) => q.py_code && q.py_code.trim().length > 0);
  }, []);

  // Load bookmarks once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dataprep_bookmarks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setBookmarks(parsed.filter((x): x is string => typeof x === "string"));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync URL parameters on initial load & popstate
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab")?.toLowerCase();
      const levelParam = params.get("level")?.toLowerCase();
      const catParam = params.get("category");
      const fwParam = params.get("framework")?.toLowerCase();
      const qParam = params.get("q") || params.get("search");
      const cardParam = params.get("card") || params.get("id");

      if (tabParam && ["runbooks", "polyglot", "modern-stack"].includes(tabParam)) {
        setActiveTab(tabParam as HubTab);
      }

      if (levelParam && ["all", "beginner", "intermediate", "advanced", "architect"].includes(levelParam)) {
        setSelectedLevel(levelParam);
      }

      if (catParam) {
        setSelectedCategory(catParam);
      }

      if (fwParam && ["all", "pandas", "polars", "pyspark", "delta", "pure_python"].includes(fwParam)) {
        setSelectedFramework(fwParam as FrameworkKey);
      }

      if (qParam) {
        setSearchQuery(qParam);
      }

      if (cardParam) {
        const matched = pythonData.find((p) => p.id === cardParam);
        if (matched) {
          setActiveTab("runbooks");
          setExpandedIds(new Set([matched.id]));
          if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = setTimeout(() => {
            const el = document.getElementById(`python-${matched.id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 350);
        }
      }
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // Update URL search parameters when filters change
  const updateUrlParam = useCallback((key: string, value: string | null) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!value || value === "ALL" || value === "all") {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
    window.history.replaceState(null, "", url.toString());
  }, []);

  // Slicer handlers
  const handleTabChange = useCallback((tab: HubTab) => {
    setActiveTab(tab);
    updateUrlParam("tab", tab === "runbooks" ? null : tab);
  }, [updateUrlParam]);

  const handleLevelChange = useCallback((lvl: string) => {
    setSelectedLevel(lvl);
    setPage(1);
    updateUrlParam("level", lvl);
  }, [updateUrlParam]);

  const handleCategoryChange = useCallback((cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
    updateUrlParam("category", cat);
  }, [updateUrlParam]);

  const handleFrameworkChange = useCallback((fw: FrameworkKey) => {
    setSelectedFramework(fw);
    setPage(1);
    updateUrlParam("framework", fw);
  }, [updateUrlParam]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setPage(1);
    updateUrlParam("q", val.trim() || null);
  }, [updateUrlParam]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setPage(1);
    updateUrlParam("q", null);
  }, [updateUrlParam]);

  const handleResetAllFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedLevel("ALL");
    setSelectedCategory("ALL");
    setSelectedFramework("all");
    setShowBookmarksOnly(false);
    setPage(1);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      url.searchParams.delete("level");
      url.searchParams.delete("category");
      url.searchParams.delete("framework");
      url.searchParams.delete("card");
      window.history.replaceState(null, "", url.toString());
    }
    toast.info("All Python slicers reset");
  }, []);

  // Bookmark toggle
  const toggleBookmark = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const isBookmarked = safePrev.includes(id);
      const updated = isBookmarked ? safePrev.filter((b) => b !== id) : [...safePrev, id];
      try {
        localStorage.setItem("dataprep_bookmarks", JSON.stringify(updated));
      } catch {
        // ignore
      }
      if (isBookmarked) {
        toast.info("Bookmark removed");
      } else {
        toast.success("Saved runbook to bookmarks");
      }
      return updated;
    });
  }, []);

  // Copy code handler
  const copyCode = useCallback((code: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied to clipboard!");
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // Copy polyglot snippet
  const copyPolyglotSnippet = useCallback((code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    toast.success("Code copied to clipboard!");
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  // Share direct link to card
  const shareCardLink = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("card", id);
    navigator.clipboard.writeText(url.toString());
    toast.success("Direct link to runbook copied to clipboard!");
  }, []);

  // Toggle single card expansion
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Filtered runbooks computation
  const filteredRunbooks = useMemo(() => {
    return pythonData.filter((item) => {
      // 1. Level filter
      if (selectedLevel !== "ALL" && item.level !== selectedLevel.toLowerCase()) {
        return false;
      }
      // 2. Category / Domain filter
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }
      // 3. Framework filter
      if (selectedFramework !== "all") {
        const itemFw = detectFramework(item);
        if (itemFw !== selectedFramework) return false;
      }
      // 4. Bookmarks filter
      if (showBookmarksOnly && !bookmarks.includes(item.id)) {
        return false;
      }
      // 5. Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description?.toLowerCase().includes(q) ?? false;
        const inCode = item.code?.toLowerCase().includes(q) ?? false;
        const inCat = item.category?.toLowerCase().includes(q) ?? false;
        const inUseCase = item.use_case?.toLowerCase().includes(q) ?? false;
        const notesArr = Array.isArray(item.notes) ? item.notes : typeof item.notes === "string" ? [item.notes] : [];
        const inNotes = notesArr.some((n) => n.toLowerCase().includes(q));
        return inTitle || inDesc || inCode || inCat || inUseCase || inNotes;
      }
      return true;
    });
  }, [selectedLevel, selectedCategory, selectedFramework, showBookmarksOnly, bookmarks, searchQuery]);

  // Paginated runbooks
  const paginatedRunbooks = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRunbooks.slice(start, start + pageSize);
  }, [filteredRunbooks, page]);

  const totalPages = Math.max(1, Math.ceil(filteredRunbooks.length / pageSize));

  // Determine if any filters are active
  const hasActiveFilters =
    selectedLevel !== "ALL" ||
    selectedCategory !== "ALL" ||
    selectedFramework !== "all" ||
    searchQuery.trim().length > 0 ||
    showBookmarksOnly;

  return (
    <div className="space-y-8 pb-24">
      {/* ARCHITECTURE HUB CONSOLIDATION BANNER */}
      <div className="p-4 sm:p-5 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-4 flex-wrap shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl sm:text-3xl">🏛️</span>
          <div>
            <div className="text-sm sm:text-base font-bold text-purple-300">
              Consolidated with Enterprise Architecture Hub
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              Python Platform Engineering and System Blueprints are now unified in one master architecture workspace.
            </div>
          </div>
        </div>
        <Link
          href="/architecture?tab=python"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md hover:shadow-purple-500/25"
        >
          <span>Open Unified Architecture Hub</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-8 isolate shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-4xl 2xl:max-w-6xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <FileCode2 size={14} />
              <span>Python Hub · Modern Data Engineering &amp; Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
              Python for Modern Data Platforms
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              Unified, code-first Python runbooks, cross-engine polyglot translations, and production lakehouse patterns — from fundamentals to staff architect level.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 text-center">
            <div className="px-3.5 py-2.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">{pythonData.length}</div>
              <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] font-medium">Runbooks</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">4</div>
              <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] font-medium">Levels</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-xl sm:text-2xl font-bold text-purple-400">{availableCategories.length - 1}</div>
              <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] font-medium">Domains</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-xl sm:text-2xl font-bold text-amber-400">{modernCodeMatrix.length}</div>
              <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] font-medium">Polyglot</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. UNIFIED HUB TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => handleTabChange("runbooks")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0",
            activeTab === "runbooks"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
              : "bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] border border-[var(--border)]",
          )}
        >
          <Code2 size={16} />
          <span>⚡ Production Runbooks ({pythonData.length})</span>
        </button>

        <button
          onClick={() => handleTabChange("polyglot")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0",
            activeTab === "polyglot"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
              : "bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] border border-[var(--border)]",
          )}
        >
          <Sparkles size={16} />
          <span>🔀 Polyglot Matrix ({modernCodeMatrix.length})</span>
        </button>

        <button
          onClick={() => handleTabChange("modern-stack")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0",
            activeTab === "modern-stack"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] border border-[var(--border)]",
          )}
        >
          <Terminal size={16} />
          <span>💡 Modern Stack Python Scenarios ({modernStackWithPy.length})</span>
        </button>
      </div>

      {/* 3. RUNBOOKS VIEW (WITH UNIFIED SLICER CONTROL DECK) */}
      {activeTab === "runbooks" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Unified Slicer Control Deck */}
          <div className="rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-4 sm:p-6 space-y-4 shadow-sm">
            {/* Top Control Bar: Search + Bookmarks + View Controls */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search Python runbooks (e.g. Polars, Delta Lake, MERGE, decorators, Arrow, partition pruning)..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-md transition-colors"
                    title="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Bookmarks & Quick Actions */}
              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <button
                  onClick={() => {
                    setShowBookmarksOnly((prev) => !prev);
                    setPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all",
                    showBookmarksOnly
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                      : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-[var(--border)]",
                  )}
                  title="Filter to bookmarked runbooks"
                >
                  <Bookmark size={14} className={showBookmarksOnly ? "fill-amber-400 text-amber-400" : ""} />
                  <span>Saved ({bookmarks.length})</span>
                </button>

                <div className="h-4 w-px bg-[var(--border)] mx-1" />

                <button
                  onClick={() => setExpandedIds(new Set(paginatedRunbooks.map((i) => i.id)))}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  Expand All
                </button>
                <button
                  onClick={() => setExpandedIds(new Set())}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Middle Row: Experience Level Slicer */}
            <div className="pt-2 border-t border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-0.5">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-[var(--foreground)] flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-emerald-400" />
                  Experience Level Slicer
                </span>
                <span>{levelCounts[selectedLevel as keyof typeof levelCounts] || pythonData.length} items</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {(["ALL", "beginner", "intermediate", "advanced", "architect"] as const).map((lvl) => {
                  const isSelected = selectedLevel.toLowerCase() === lvl.toLowerCase();
                  const count = levelCounts[lvl as keyof typeof levelCounts];
                  const badge = lvl !== "ALL" ? levelBadges[lvl] : null;

                  return (
                    <button
                      key={lvl}
                      onClick={() => handleLevelChange(lvl)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 capitalize flex items-center gap-1.5 border",
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-500 font-semibold shadow-sm"
                          : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-[var(--border)] hover:border-[var(--border-hover)]",
                      )}
                    >
                      {badge && <span className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-white" : badge.dot)} />}
                      <span>{lvl === "ALL" ? "All Levels" : lvl}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full", isSelected ? "bg-white/20 text-white" : "bg-[var(--surface-3)] text-[var(--muted-foreground)]")}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Domain / Category Slicer (Scrollable Chips) */}
            <div className="pt-2 border-t border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-0.5">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-[var(--foreground)] flex items-center gap-1.5">
                  <Filter size={13} className="text-emerald-400" />
                  Technical Domain Slicer
                </span>
                <span>{availableCategories.length - 1} domains</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {availableCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => handleCategoryChange(cat.name)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 border",
                        isSelected
                          ? "bg-blue-600 text-white border-blue-500 font-semibold shadow-sm"
                          : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-[var(--border)] hover:border-[var(--border-hover)]",
                      )}
                    >
                      <span>{cat.name === "ALL" ? "🌐 All Domains" : cat.name}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full", isSelected ? "bg-white/20 text-white" : "bg-[var(--surface-3)] text-[var(--muted-foreground)]")}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Framework / Stack Slicer */}
            <div className="pt-2 border-t border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-0.5">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-[var(--foreground)] flex items-center gap-1.5">
                  <Layers size={13} className="text-emerald-400" />
                  Framework &amp; Engine Slicer
                </span>
                <span>{frameworkCounts[selectedFramework]} items</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {(Object.keys(frameworkConfig) as FrameworkKey[]).map((fw) => {
                  const cfg = frameworkConfig[fw];
                  const count = frameworkCounts[fw];
                  const isSelected = selectedFramework === fw;

                  return (
                    <button
                      key={fw}
                      onClick={() => handleFrameworkChange(fw)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 border",
                        isSelected
                          ? "bg-purple-600 text-white border-purple-500 font-semibold shadow-sm"
                          : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-[var(--border)] hover:border-[var(--border-hover)]",
                      )}
                    >
                      <span>{cfg.icon}</span>
                      <span>{cfg.label}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full", isSelected ? "bg-white/20 text-white" : "bg-[var(--surface-3)] text-[var(--muted-foreground)]")}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Slicers Pill Strip */}
            {hasActiveFilters && (
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="text-[var(--muted-foreground)] font-medium">Active Slicers:</span>
                  {selectedLevel !== "ALL" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                      Level: {selectedLevel}
                      <button onClick={() => handleLevelChange("ALL")} className="hover:opacity-80">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedCategory !== "ALL" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px]">
                      Domain: {selectedCategory}
                      <button onClick={() => handleCategoryChange("ALL")} className="hover:opacity-80">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedFramework !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px]">
                      Stack: {frameworkConfig[selectedFramework].label}
                      <button onClick={() => handleFrameworkChange("all")} className="hover:opacity-80">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {showBookmarksOnly && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                      Bookmarks Only
                      <button onClick={() => setShowBookmarksOnly(false)} className="hover:opacity-80">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {searchQuery.trim() && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-300 border border-slate-500/20 text-[11px]">
                      Query: &ldquo;{searchQuery}&rdquo;
                      <button onClick={handleClearSearch} className="hover:opacity-80">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>

                <button
                  onClick={handleResetAllFilters}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Reset All</span>
                </button>
              </div>
            )}
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
            <span>
              Showing <strong className="text-[var(--foreground)]">{paginatedRunbooks.length}</strong> of{" "}
              <strong className="text-[var(--foreground)]">{filteredRunbooks.length}</strong> Python tutorials
              {filteredRunbooks.length > pageSize && (
                <span className="ml-1">(Page {page} of {totalPages})</span>
              )}
            </span>
          </div>

          {/* Runbooks Card List */}
          {filteredRunbooks.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-8 space-y-3">
              <Terminal size={40} className="mx-auto text-[var(--muted-foreground)] opacity-40" />
              <h3 className="text-base font-semibold text-[var(--foreground)]">No matching Python runbooks found</h3>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
                No runbooks match your selected Level, Domain, Framework, or Search query.
              </p>
              <button
                onClick={handleResetAllFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm"
              >
                Reset All Slicers
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedRunbooks.map((item) => (
                <RunbookCard
                  key={item.id}
                  item={item}
                  isExpanded={expandedIds.has(item.id)}
                  onToggle={handleToggleExpand}
                  onCopy={copyCode}
                  onBookmark={toggleBookmark}
                  onShare={shareCardLink}
                  copied={copiedId === item.id}
                  bookmarked={bookmarks.includes(item.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredRunbooks.length > pageSize && (
            <div className="flex justify-center items-center gap-3 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className={cn(
                  "px-4 py-2 rounded-xl border text-xs font-semibold transition-all",
                  page === 1
                    ? "opacity-50 cursor-not-allowed border-[var(--border)] text-[var(--muted-foreground)]"
                    : "hover:bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)]",
                )}
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-semibold transition-all",
                      page === p
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className={cn(
                  "px-4 py-2 rounded-xl border text-xs font-semibold transition-all",
                  page === totalPages
                    ? "opacity-50 cursor-not-allowed border-[var(--border)] text-[var(--muted-foreground)]"
                    : "hover:bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)]",
                )}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. POLYGLOT TRANSLATION MATRIX VIEW */}
      {activeTab === "polyglot" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Sparkles size={14} />
              <span>Multi-Engine Code Equivalents</span>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Cross-Engine Polyglot Translation Matrix
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              Compare how common data engineering operations (Parquet readers, partition pruning, window functions, and MERGE INTO upserts) are implemented across Polars, PySpark, DuckDB, Spark SQL, and Cloud Data Warehouses.
            </p>
          </div>

          <div className="space-y-6">
            {modernCodeMatrix.map((item, idx) => (
              <PolyglotCard
                key={idx}
                item={item}
                copiedKey={copiedKey}
                onCopySnippet={copyPolyglotSnippet}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. MODERN STACK PYTHON SCENARIOS VIEW */}
      {activeTab === "modern-stack" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <Terminal size={14} />
              <span>Production Distributed Scenarios</span>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Modern Stack Python Solutions &amp; System Scenarios
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              Real-world distributed systems, Iceberg table formats, and SIMD-vectorized compute engines with complete Python implementations.
            </p>
          </div>

          <div className="space-y-4">
            {modernStackWithPy.map((q) => (
              <div
                key={q.id}
                className="rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                      {q.category}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-md border",
                        q.difficulty === "HARD"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : q.difficulty === "ARCHITECT"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      )}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[var(--muted-foreground)]">ID: #{q.id}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] leading-snug">
                  {q.question}
                </h3>

                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed border-l-2 border-blue-500/40 pl-3">
                  {q.answer}
                </p>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Code2 size={14} /> Production Python Implementation
                    </span>
                  </div>
                  <CodeBlock code={q.py_code} language="python" filename={`${q.id}_solution.py`} showLineNumbers />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PythonHub() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-[var(--muted-foreground)]">
          Loading Python Hub...
        </div>
      }
    >
      <PythonHubContent />
    </Suspense>
  );
}
