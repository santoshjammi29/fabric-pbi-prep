"use client";

import React, { useState, useMemo, useEffect, useDeferredValue, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  BookOpen,
  FileCode2,
  MessageSquare,
  Code2,
  Terminal,
  Share2,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Shuffle,
  Target,
  Database,
  Cpu,
  Workflow,
  Zap,
  Network,
  GitBranch,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TopicIcon } from "@/components/ui/topic-icon";
import { UnifiedSearchFilterBox } from "@/components/ui/unified-search-filter-box";
import { architectureDiagrams } from "@/data/diagrams";
import { ArchitectureDiagramsGallery } from "@/components/architecture/diagrams-gallery";
import {
  ArchitectureQuestion,
  Difficulty,
  CodeSheetItem,
  CodeLevel,
  ModernCodeMatrix,
  ModernStackQuestion,
} from "@/types/data";
import { recordLastTopic } from "@/lib/user-progress";
import dynamic from "next/dynamic";
import { CodeBlock } from "@/components/ui/code-block";

const AnswerRenderer = dynamic(
  () => import("@/components/ui/answer-renderer").then((mod) => mod.AnswerRenderer),
  { ssr: false }
);
const SmoothAccordion = dynamic(
  () => import("@/components/ui/smooth-accordion").then((mod) => mod.SmoothAccordion),
  { ssr: false }
);

// Difficulty badges configuration
const difficultyColors: Record<Difficulty, { bg: string; text: string; border: string }> = {
  EASY: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  MEDIUM: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  HARD: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  ARCHITECT: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

// Python Level badges configuration
const levelBadges: Record<CodeLevel, { bg: string; text: string; border: string; dot: string }> = {
  beginner: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-400" },
  intermediate: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", dot: "bg-blue-400" },
  advanced: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", dot: "bg-amber-400" },
  architect: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", dot: "bg-purple-400" },
};

type FrameworkKey = "all" | "pandas" | "polars" | "pyspark" | "delta" | "pure_python";

function detectFramework(item: CodeSheetItem): "pandas" | "polars" | "pyspark" | "delta" | "pure_python" {
  const text = `${item.title} ${item.category} ${item.description || ""} ${item.code || ""}`.toLowerCase();
  if (text.includes("polars") || text.includes("pl.")) return "polars";
  if (text.includes("pyspark") || text.includes("spark.") || text.includes("sparkcontext")) return "pyspark";
  if (text.includes("delta") || text.includes("deltalake")) return "delta";
  if (text.includes("pandas") || text.includes("pd.")) return "pandas";
  return "pure_python";
}

const FRAMEWORKS: { id: FrameworkKey; label: string; topicKey?: string; badgeColor: string }[] = [
  { id: "all", label: "All Stacks", badgeColor: "bg-slate-500/10 text-slate-300 border-slate-500/20" },
  { id: "polars", label: "Polars (Rust Engine)", topicKey: "polars", badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  { id: "pyspark", label: "PySpark & Connect", topicKey: "spark", badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { id: "delta", label: "Delta-RS / Lakehouse", topicKey: "datalake", badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { id: "pandas", label: "Pandas 2.0 / Arrow", topicKey: "pandas", badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { id: "pure_python", label: "Pure Python / AsyncIO", topicKey: "python", badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
];

const PYTHON_LEVELS: { id: CodeLevel | "all"; label: string; desc: string }[] = [
  { id: "all", label: "All Levels", desc: "Foundations to Enterprise Architect" },
  { id: "architect", label: "Architect", desc: "Zero-copy, lock-free, distributed engines" },
  { id: "advanced", label: "Advanced", desc: "Streaming, out-of-core, concurrency" },
  { id: "intermediate", label: "Intermediate", desc: "Vectorized processing & Lakehouse" },
  { id: "beginner", label: "Beginner", desc: "Foundations & essential data structures" },
];

type ArchHubTab = "scenarios" | "diagrams" | "python" | "polyglot" | "distributed";

// Sub-component: Runbook Card for Python Runbooks
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
  const fwMeta = FRAMEWORKS.find((f) => f.id === fw) || FRAMEWORKS[0];
  const lvlMeta = levelBadges[item.level] || levelBadges.intermediate;

  const notesList = useMemo(() => {
    if (Array.isArray(item.notes)) return item.notes;
    if (typeof item.notes === "string") return [item.notes];
    return [];
  }, [item.notes]);

  return (
    <div
      id={`python-${item.id}`}
      className={cn(
        "rounded-xl border transition-all duration-200 overflow-hidden scroll-mt-20",
        isExpanded
          ? "bg-[var(--surface-1)] border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/20"
          : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]"
      )}
    >
      <div
        onClick={() => onToggle(item.id)}
        className="p-3 sm:p-3.5 cursor-pointer select-none space-y-1.5"
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                {item.category}
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1",
                  lvlMeta.bg,
                  lvlMeta.text,
                  lvlMeta.border
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", lvlMeta.dot)} />
                <span className="capitalize">{item.level}</span>
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1",
                  fwMeta.badgeColor
                )}
              >
                {fwMeta.topicKey ? <TopicIcon topic={fwMeta.topicKey} size={11} /> : <Sparkles size={11} />}
                <span>{fwMeta.label}</span>
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight break-words pt-0.5 leading-snug">
              {item.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            <button
              onClick={(e) => onShare(item.id, e)}
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors"
              title="Copy direct link to this runbook"
              aria-label="Copy direct link"
            >
              <Share2 size={14} />
            </button>
            <button
              onClick={(e) => onBookmark(item.id, e)}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                bookmarked
                  ? "text-amber-400 bg-amber-400/10"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
              )}
              title={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
              aria-label={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
            >
              {bookmarked ? <BookmarkCheck size={14} className="text-amber-400" /> : <Bookmark size={14} />}
            </button>
            <button
              onClick={(e) => onCopy(item.code, item.id, e)}
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors"
              title="Copy Code"
              aria-label="Copy Code"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
            <div className="p-2 text-[var(--muted-foreground)]">
              <ChevronDown
                size={18}
                className={cn(
                  "transform transition-transform duration-300",
                  isExpanded ? "rotate-180 text-emerald-400" : "rotate-0"
                )}
              />
            </div>
          </div>
        </div>

        {!isExpanded && (
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      <SmoothAccordion isOpen={isExpanded} innerClassName="px-3.5 py-3 sm:px-4 sm:py-3.5 space-y-3 text-xs sm:text-sm bg-[var(--surface-2)]/30">
        <div className="space-y-1">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)] opacity-90 flex items-center gap-1.5">
            <BookOpen size={13} className="text-emerald-400" /> Architecture Overview
          </h4>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="space-y-1">
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

        {notesList.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles size={13} /> Production Tuning &amp; Gotchas
            </h4>
            <ul className="space-y-1">
              {notesList.map((note, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-xs text-[var(--muted-foreground)]">
                  <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span className="leading-snug text-slate-300">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {item.use_case && (
          <div className="pt-2 border-t border-[var(--border)]">
            <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
              <div className="font-bold text-purple-300 flex items-center gap-1.5 text-[11px]">
                <Target size={13} className="text-purple-400 shrink-0" />
                <span>Enterprise Scenario:</span>
              </div>
              <p className="text-purple-200/90 leading-relaxed text-xs">{item.use_case}</p>
            </div>
          </div>
        )}
      </SmoothAccordion>
    </div>
  );
});

// Sub-component: Polyglot Card
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
    <div className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3.5 sm:p-4 space-y-3.5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400 mb-1">
            <Sparkles size={12} />
            <span>Cross-Engine Translation</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)]">{item.topic}</h3>
        </div>

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
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-1)]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeEngine === "side_by_side" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <TopicIcon topic="python" size={13} />
                <span>Python (Polars/Pandas)</span>
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
              <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                <TopicIcon topic="spark" size={13} />
                <span>PySpark</span>
              </span>
              <button
                onClick={() => onCopySnippet(item.pyspark, `${item.topic}-pyspark`)}
                className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
              >
                {copiedKey === `${item.topic}-pyspark` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>Copy</span>
              </button>
            </div>
            <CodeBlock code={item.pyspark} language="python" filename="pyspark_job.py" showLineNumbers={false} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Database size={13} className="text-amber-400" />
                <span>DuckDB</span>
              </span>
              <button
                onClick={() => onCopySnippet(item.duckdb, `${item.topic}-duckdb`)}
                className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
              >
                {copiedKey === `${item.topic}-duckdb` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>Copy</span>
              </button>
            </div>
            <CodeBlock code={item.duckdb} language="sql" filename="duckdb_query.sql" showLineNumbers={false} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <TopicIcon topic="spark" size={13} />
                <span>Spark SQL</span>
              </span>
              <button
                onClick={() => onCopySnippet(item.sparksql, `${item.topic}-sparksql`)}
                className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
              >
                {copiedKey === `${item.topic}-sparksql` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>Copy</span>
              </button>
            </div>
            <CodeBlock code={item.sparksql} language="sql" filename="spark_query.sql" showLineNumbers={false} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <TopicIcon topic="snowflake" size={13} />
                <span>Snowflake SQL</span>
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
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
              {activeEngine} Implementation
            </span>
            <button
              onClick={() => onCopySnippet((item as any)[activeEngine], `${item.topic}-${activeEngine}`)}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
            >
              {copiedKey === `${item.topic}-${activeEngine}` ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>Copy Snippet</span>
            </button>
          </div>
          <CodeBlock
            code={(item as any)[activeEngine]}
            language={activeEngine === "python" || activeEngine === "pyspark" ? "python" : "sql"}
            filename={`${item.topic.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${activeEngine}`}
            showLineNumbers
          />
        </div>
      )}
    </div>
  );
}

export interface ArchitectureClientProps {
  initialArchitecture: ArchitectureQuestion[];
  initialPython: CodeSheetItem[];
  initialMatrix: ModernCodeMatrix[];
  initialModernStack: ModernStackQuestion[];
}

function ArchitectureHubContent(props: ArchitectureClientProps) {
  const {
    initialArchitecture: architectureData,
    initialPython: pythonData,
    initialMatrix: modernCodeMatrix,
    initialModernStack: modernStackDb,
  } = props;

  const searchParams = useSearchParams();
  const router = useRouter();

  // Active Tab state: 'scenarios' | 'python' | 'polyglot' | 'distributed'
  const [activeTab, setActiveTab] = useState<ArchHubTab>("scenarios");

  // Scenarios filter states
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedStretch, setSelectedStretch] = useState<"ALL" | "STANDARD" | "STRETCH">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isReadAllMode, setIsReadAllMode] = useState(false);
  const [collapsedInReadMode, setCollapsedInReadMode] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const initialBatch = 25;
  const [visibleCount, setVisibleCount] = useState(initialBatch);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // Python Runbook filter states
  const [pySearch, setPySearch] = useState("");
  const deferredPySearch = useDeferredValue(pySearch);
  const [selectedPyLevel, setSelectedPyLevel] = useState<CodeLevel | "all">("all");
  const [selectedPyStretch, setSelectedPyStretch] = useState<"ALL" | "STANDARD" | "STRETCH">("ALL");
  const [selectedPyDomain, setSelectedPyDomain] = useState<string>("all");
  const [selectedPyFramework, setSelectedPyFramework] = useState<FrameworkKey>("all");
  const [showPyBookmarksOnly, setShowPyBookmarksOnly] = useState(false);
  const [pyBookmarks, setPyBookmarks] = useState<string[]>([]);
  const [pyExpandedIds, setPyExpandedIds] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pyPage, setPyPage] = useState(1);
  const pyPageSize = 15;

  const handleShuffle = useCallback(() => {
    setIsShuffled(true);
    setShuffleSeed((s) => s + 1);
    setVisibleCount(initialBatch);
    setPyPage(1);
    toast.success("Shuffled architecture cards");
  }, [initialBatch]);

  const handleResetOrder = useCallback(() => {
    setIsShuffled(false);
    setVisibleCount(initialBatch);
    setPyPage(1);
    toast.info("Reset to default order");
  }, [initialBatch]);

  const scrollTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const copyTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync bookmarks from localStorage
  useEffect(() => {
    try {
      const savedArch = localStorage.getItem("fabric_arch_bookmarks_v1");
      if (savedArch) setBookmarks(JSON.parse(savedArch));
      const savedPy = localStorage.getItem("fabric_python_bookmarks_v1");
      if (savedPy) setPyBookmarks(JSON.parse(savedPy));
    } catch {}
  }, []);

  const tabParam = searchParams.get("tab") as ArchHubTab | null;

  // Reactively sync activeTab whenever URL searchParams tab changes (e.g. via Link or router)
  useEffect(() => {
    const validTabs: ArchHubTab[] = ["scenarios", "diagrams", "python", "polyglot", "distributed"];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab("scenarios");
    }
  }, [tabParam]);

  // Sync URL parameters on initial load & popstate
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const qTab = params.get("tab") as ArchHubTab | null;
      if (qTab && ["scenarios", "diagrams", "python", "polyglot", "distributed"].includes(qTab)) {
        setActiveTab(qTab);
      }

      const cardParam = params.get("card") || params.get("id");
      const qParam = params.get("q") || params.get("search");
      const catParam = params.get("category");
      const diffParam = params.get("difficulty");
      const levelParam = params.get("level");

      if (qParam) {
        setSearchQuery(qParam);
        setPySearch(qParam);
      }
      if (catParam) setSelectedCategory(catParam);
      if (diffParam) setSelectedDifficulty(diffParam);
      if (levelParam && ["all", "beginner", "intermediate", "advanced", "architect"].includes(levelParam)) {
        setSelectedPyLevel(levelParam as CodeLevel);
      }

      if (cardParam) {
        const isDiagram = qTab === "diagrams" || architectureDiagrams.some((d) => d.id === cardParam);
        if (isDiagram) {
          setActiveTab("diagrams");
        } else if (cardParam.startsWith("py-") || cardParam.startsWith("python-")) {
          setActiveTab("python");
          const cleanId = cardParam.replace(/^python-/, "");
          setPyExpandedIds((prev) => new Set([...prev, cleanId]));
          if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = setTimeout(() => {
            const el = document.getElementById(`python-${cleanId}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          }, 350);
        } else {
          if (!qTab || qTab === "scenarios") {
            setActiveTab("scenarios");
          }
          const cleanId = cardParam.replace(/^arch-/, "");
          setExpandedIds((prev) => new Set([...prev, cleanId]));
          if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = setTimeout(() => {
            const el = document.getElementById(`arch-${cleanId}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
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

  // Update URL helper
  const updateUrlParam = useCallback((key: string, value: string | null) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (value && value !== "ALL" && value !== "all") {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  const handleTabChange = useCallback((tab: ArchHubTab) => {
    setActiveTab(tab);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (tab === "scenarios") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", tab);
    }
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  // Distinct categories for System Scenarios
  const categories = useMemo(() => {
    const set = new Set<string>();
    architectureData.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ["ALL", ...Array.from(set).sort()];
  }, []);

  // Distinct domains for Python Runbooks
  const pyDomains = useMemo(() => {
    const set = new Set<string>();
    pythonData.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ["all", ...Array.from(set).sort()];
  }, []);

  // Filtered System Scenarios
  const filteredItems = useMemo(() => {
    return architectureData.filter((item) => {
      if (selectedDifficulty !== "ALL" && item.difficulty !== selectedDifficulty) {
        return false;
      }
      if (selectedStretch === "STANDARD" && !(item.difficulty === "EASY" || item.difficulty === "MEDIUM")) {
        return false;
      }
      if (selectedStretch === "STRETCH" && !(item.difficulty === "HARD" || item.difficulty === "ARCHITECT")) {
        return false;
      }
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }
      if (deferredSearch.trim()) {
        const q = deferredSearch.toLowerCase();
        const inQuestion = item.question.toLowerCase().includes(q);
        const inAnswer = item.answer.toLowerCase().includes(q);
        const inCategory = item.category?.toLowerCase().includes(q) ?? false;
        const inNiche = item.niche?.toLowerCase().includes(q) ?? false;
        return inQuestion || inAnswer || inCategory || inNiche;
      }
      return true;
    });
  }, [deferredSearch, selectedDifficulty, selectedStretch, selectedCategory]);

  const displayedFilteredItems = useMemo(() => {
    if (!isShuffled) return filteredItems;
    const arr = [...filteredItems];
    let m = arr.length, t, i;
    let seed = shuffleSeed * 9301 + 49297;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    while (m) {
      i = Math.floor(rnd() * m--);
      t = arr[m]; arr[m] = arr[i]; arr[i] = t;
    }
    return arr;
  }, [filteredItems, isShuffled, shuffleSeed]);

  const paginatedItems = useMemo(() => {
    if (isReadAllMode) return displayedFilteredItems;
    return displayedFilteredItems.slice(0, visibleCount);
  }, [displayedFilteredItems, visibleCount, isReadAllMode]);

  // Filtered Python Runbooks
  const filteredRunbooks = useMemo(() => {
    return pythonData.filter((item) => {
      if (selectedPyLevel !== "all" && item.level !== selectedPyLevel) return false;
      if (selectedPyStretch === "STANDARD" && !(item.level === "beginner" || item.level === "intermediate")) {
        return false;
      }
      if (selectedPyStretch === "STRETCH" && !(item.level === "advanced" || item.level === "architect")) {
        return false;
      }
      if (selectedPyDomain !== "all" && item.category !== selectedPyDomain) return false;
      if (selectedPyFramework !== "all") {
        const detected = detectFramework(item);
        if (detected !== selectedPyFramework) return false;
      }
      if (showPyBookmarksOnly && !pyBookmarks.includes(item.id)) return false;

      if (deferredPySearch.trim()) {
        const q = deferredPySearch.toLowerCase();
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
  }, [deferredPySearch, selectedPyLevel, selectedPyStretch, selectedPyDomain, selectedPyFramework, showPyBookmarksOnly, pyBookmarks]);

  const displayedFilteredRunbooks = useMemo(() => {
    if (!isShuffled) return filteredRunbooks;
    const arr = [...filteredRunbooks];
    let m = arr.length, t, i;
    let seed = (shuffleSeed + 1337) * 9301 + 49297;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    while (m) {
      i = Math.floor(rnd() * m--);
      t = arr[m]; arr[m] = arr[i]; arr[i] = t;
    }
    return arr;
  }, [filteredRunbooks, isShuffled, shuffleSeed]);

  const totalPyPages = Math.ceil(displayedFilteredRunbooks.length / pyPageSize) || 1;
  const paginatedRunbooks = useMemo(() => {
    const start = (pyPage - 1) * pyPageSize;
    return displayedFilteredRunbooks.slice(start, start + pyPageSize);
  }, [displayedFilteredRunbooks, pyPage]);

  // Distributed Python scenarios from modernStackDb
  const modernStackWithPy = useMemo(() => {
    return modernStackDb.filter((q) => Boolean(q.py_code));
  }, []);

  // Handlers for System Scenarios & Read All Mode
  const handleExpandAllScenarios = useCallback(() => {
    setIsReadAllMode(true);
    setCollapsedInReadMode(new Set());
    setVisibleCount(filteredItems.length);
    setExpandedIds(new Set(filteredItems.map((i) => i.id)));
    toast.success(`Read All Mode: All ${filteredItems.length.toLocaleString()} architecture scenarios expanded`);
  }, [filteredItems]);

  const handleCollapseAllScenarios = useCallback(() => {
    setIsReadAllMode(false);
    setExpandedIds(new Set());
    setCollapsedInReadMode(new Set());
    toast.info("Collapsed all architecture scenarios");
  }, []);

  const toggleReadAllScenarios = useCallback(() => {
    if (!isReadAllMode) {
      handleExpandAllScenarios();
    } else {
      handleCollapseAllScenarios();
    }
  }, [isReadAllMode, handleExpandAllScenarios, handleCollapseAllScenarios]);

  const handleExpandAllRunbooks = useCallback(() => {
    setPyExpandedIds(new Set(filteredRunbooks.map((r) => r.id)));
    toast.success(`Expanded all ${filteredRunbooks.length.toLocaleString()} Python runbooks`);
  }, [filteredRunbooks]);

  const handleCollapseAllRunbooks = useCallback(() => {
    setPyExpandedIds(new Set());
    toast.info("Collapsed all Python runbooks");
  }, []);

  const toggleExpand = (id: string) => {
    if (isReadAllMode) {
      setCollapsedInReadMode((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
          const item = architectureData.find((a) => a.id === id);
          if (item) {
            recordLastTopic({
              title: item.question.slice(0, 60),
              href: `/architecture?card=${id}`,
              category: item.category || "Architecture",
            });
          }
        }
        return next;
      });
    }
  };

  // Global keyboard shortcut: Shift + E to toggle Read All mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if (e.shiftKey && (e.key === "E" || e.key === "e")) {
        e.preventDefault();
        if (activeTab === "scenarios") {
          toggleReadAllScenarios();
        } else if (activeTab === "python") {
          if (pyExpandedIds.size > 0) {
            handleCollapseAllRunbooks();
          } else {
            handleExpandAllRunbooks();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, toggleReadAllScenarios, pyExpandedIds, handleCollapseAllRunbooks, handleExpandAllRunbooks]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
      try {
        localStorage.setItem("fabric_arch_bookmarks_v1", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const copyScenario = (item: ArchitectureQuestion, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${item.question}\n\n${item.answer}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    toast.success("Scenario copied to clipboard");
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
  };

  // Handlers for Python Runbooks
  const togglePyExpand = (id: string) => {
    setPyExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        const item = pythonData.find((p) => p.id === id);
        if (item) {
          recordLastTopic({
            title: item.title.slice(0, 60),
            href: `/architecture?tab=python&card=python-${id}`,
            category: item.category || "Python Architecture",
          });
        }
      }
      return next;
    });
  };

  const togglePyBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPyBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
      try {
        localStorage.setItem("fabric_python_bookmarks_v1", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const copyCode = (code: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedKey(id);
    toast.success("Python code copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyPolyglotSnippet = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    toast.success("Snippet copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const shareCardLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "python");
    url.searchParams.set("card", `python-${id}`);
    navigator.clipboard.writeText(url.toString());
    toast.success("Direct link to runbook copied!");
  };

  const archCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of architectureData) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, []);

  const hasActiveScenarioFilters =
    selectedCategory !== "ALL" ||
    selectedDifficulty !== "ALL" ||
    selectedStretch !== "ALL" ||
    searchQuery.trim().length > 0;

  const handleResetScenarioFilters = useCallback(() => {
    setSelectedCategory("ALL");
    setSelectedDifficulty("ALL");
    setSelectedStretch("ALL");
    setSearchQuery("");
    setIsShuffled(false);
    setVisibleCount(initialBatch);
    updateUrlParam("category", "ALL");
    updateUrlParam("difficulty", "ALL");
    toast.info("Reset all scenario filters");
  }, [initialBatch, updateUrlParam]);

  const hasActivePyFilters =
    selectedPyFramework !== "all" ||
    selectedPyDomain !== "all" ||
    selectedPyLevel !== "all" ||
    selectedPyStretch !== "ALL" ||
    showPyBookmarksOnly ||
    pySearch.trim().length > 0;

  const handleResetPyFilters = useCallback(() => {
    setSelectedPyFramework("all");
    setSelectedPyDomain("all");
    setSelectedPyLevel("all");
    setSelectedPyStretch("ALL");
    setShowPyBookmarksOnly(false);
    setPySearch("");
    setPyPage(1);
    toast.info("Reset all runbook filters");
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 space-y-4 pb-16 animate-in fade-in duration-300">
      {/* 1. TOP MODULE NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1 rounded-xl bg-[var(--surface-1)] border-2 border-[var(--border)] shadow-xs">
        {[
          { id: "scenarios", label: "System Blueprints", count: architectureData.length, iconComponent: Layers, iconColor: "text-purple-400" },
          { id: "diagrams", label: "Whiteboard Diagrams", count: architectureDiagrams.length, iconComponent: Sparkles, iconColor: "text-purple-400" },
          { id: "python", label: "Python Architecture & Runbooks", count: pythonData.length, topicKey: "python" },
          { id: "polyglot", label: "Cross-Engine Polyglot Matrix", count: modernCodeMatrix.length, iconComponent: Code2, iconColor: "text-amber-400" },
          { id: "distributed", label: "Distributed Python Solutions", count: modernStackWithPy.length, iconComponent: Terminal, iconColor: "text-blue-400" },
        ].map((tab) => {
          const TabIcon = tab.iconComponent;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as ArchHubTab)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer",
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              )}
            >
              {tab.topicKey ? (
                <TopicIcon topic={tab.topicKey} size={13} />
              ) : TabIcon ? (
                <TabIcon size={13} className={activeTab === tab.id ? "text-white" : tab.iconColor} />
              ) : null}
              <span>{tab.label}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. COMPACT HEADER HUB BANNER */}
      <div className="relative rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3 sm:p-4 shadow-xs isolate">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Layers size={11} />
                <span>Architecture Hub</span>
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)]">
                Enterprise Systems Engineering
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight break-words">
              Enterprise Architecture &amp; Systems Engineering Hub
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] max-w-3xl leading-relaxed break-words">
              End-to-end distributed system blueprints, Lakehouse medallion topologies, high-performance Python runbooks, and cross-engine polyglot translation matrices engineered for high-concurrency production platforms.
            </p>
          </div>
          <div className="text-xs text-[var(--muted-foreground)] shrink-0 self-start sm:self-auto">
            {activeTab === "scenarios" && (
              <span>Showing <strong className="text-[var(--foreground)]">{paginatedItems.length}</strong> of {filteredItems.length} scenarios</span>
            )}
            {activeTab === "diagrams" && (
              <span>Showing <strong className="text-[var(--foreground)]">{architectureDiagrams.length}</strong> blueprints</span>
            )}
            {activeTab === "python" && (
              <span>Showing <strong className="text-[var(--foreground)]">{filteredRunbooks.length}</strong> of {pythonData.length} runbooks</span>
            )}
            {activeTab === "polyglot" && (
              <span>Showing <strong className="text-[var(--foreground)]">{modernCodeMatrix.length}</strong> matrices</span>
            )}
            {activeTab === "distributed" && (
              <span>Showing <strong className="text-[var(--foreground)]">{modernStackWithPy.length}</strong> architectures</span>
            )}
          </div>
        </div>
      </div>

      {/* ─── UNIFIED SEARCH & MULTI-LEVEL FILTER BOX (ACTIVE PER TAB) ─── */}
      {activeTab === "scenarios" && (
        <UnifiedSearchFilterBox
          searchQuery={searchQuery}
          onSearchChange={(val) => {
            setSearchQuery(val);
            setVisibleCount(initialBatch);
          }}
          searchPlaceholder="Search 3,080+ architecture blueprints (e.g., Vitess, Spanner TrueTime, Little's Law)... (Press / to search)"
          matchCount={filteredItems.length}
          totalCount={architectureData.length}
          countUnit="scenarios"
          themeAccent="purple"
          hasActiveFilters={hasActiveScenarioFilters}
          onResetAll={handleResetScenarioFilters}
          actions={{
            readAll: {
              isActive: isReadAllMode,
              onToggle: toggleReadAllScenarios,
              shortcut: "⇧E",
              count: filteredItems.length,
            },
            shuffle: {
              isShuffled,
              onShuffle: handleShuffle,
            },
            expandCollapse: {
              onExpandAll: handleExpandAllScenarios,
              onCollapseAll: handleCollapseAllScenarios,
            },
          }}
          levels={[]}
          activeFilters={[
            ...(isReadAllMode
              ? [
                  {
                    id: "readall",
                    label: `Read All Mode Active (${filteredItems.length.toLocaleString()} Scenarios)`,
                    color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold",
                    onRemove: handleCollapseAllScenarios,
                  },
                ]
              : []),
            ...(selectedCategory !== "ALL"
              ? [
                  {
                    id: "category",
                    label: `Spec: ${selectedCategory}`,
                    color: "bg-purple-500/10 border-purple-500/30 text-purple-400",
                    onRemove: () => {
                      setSelectedCategory("ALL");
                      setVisibleCount(initialBatch);
                      updateUrlParam("category", "ALL");
                    },
                  },
                ]
              : []),
            ...(selectedDifficulty !== "ALL"
              ? [
                  {
                    id: "difficulty",
                    label: `Difficulty: ${selectedDifficulty}`,
                    color: "bg-amber-500/10 border-amber-500/30 text-amber-400",
                    onRemove: () => {
                      setSelectedDifficulty("ALL");
                      setVisibleCount(initialBatch);
                      updateUrlParam("difficulty", "ALL");
                    },
                  },
                ]
              : []),
            ...(selectedStretch !== "ALL"
              ? [
                  {
                    id: "stretch",
                    label: `Stretch: ${selectedStretch}`,
                    color: "bg-purple-500/10 border-purple-500/30 text-purple-400",
                    onRemove: () => {
                      setSelectedStretch("ALL");
                      setVisibleCount(initialBatch);
                    },
                  },
                ]
              : []),
            ...(searchQuery.trim().length > 0
              ? [
                  {
                    id: "search",
                    label: `Search: "${searchQuery}"`,
                    color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                    onRemove: () => {
                      setSearchQuery("");
                      setVisibleCount(initialBatch);
                    },
                  },
                ]
              : []),
          ]}
        />
      )}

      {activeTab === "python" && (
        <UnifiedSearchFilterBox
          searchQuery={pySearch}
          onSearchChange={(val) => {
            setPySearch(val);
            setPyPage(1);
          }}
          searchPlaceholder="Search Python runbooks (e.g., streaming, deltalake, asyncio, tracemalloc)... (Press / to search)"
          matchCount={filteredRunbooks.length}
          totalCount={pythonData.length}
          countUnit="runbooks"
          themeAccent="cyan"
          hasActiveFilters={hasActivePyFilters}
          onResetAll={handleResetPyFilters}
          actions={{
            customActions: (
              <button
                type="button"
                onClick={() => {
                  setShowPyBookmarksOnly(!showPyBookmarksOnly);
                  setPyPage(1);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs whitespace-nowrap",
                  showPyBookmarksOnly
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                )}
              >
                {showPyBookmarksOnly ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                <span>Saved ({pyBookmarks.length})</span>
              </button>
            ),
          }}
          levels={[]}
          activeFilters={[
            ...(selectedPyFramework !== "all"
              ? [
                  {
                    id: "framework",
                    label: `Engine: ${FRAMEWORKS.find((f) => f.id === selectedPyFramework)?.label || selectedPyFramework}`,
                    color: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
                    onRemove: () => {
                      setSelectedPyFramework("all");
                      setPyPage(1);
                    },
                  },
                ]
              : []),
            ...(selectedPyLevel !== "all"
              ? [
                  {
                    id: "level",
                    label: `Level: ${selectedPyLevel}`,
                    color: "bg-amber-500/10 border-amber-500/30 text-amber-400",
                    onRemove: () => {
                      setSelectedPyLevel("all");
                      setPyPage(1);
                      updateUrlParam("level", "all");
                    },
                  },
                ]
              : []),
            ...(selectedPyStretch !== "ALL"
              ? [
                  {
                    id: "stretch",
                    label: `Stretch: ${selectedPyStretch}`,
                    color: "bg-purple-500/10 border-purple-500/30 text-purple-400",
                    onRemove: () => {
                      setSelectedPyStretch("ALL");
                      setPyPage(1);
                    },
                  },
                ]
              : []),
            ...(showPyBookmarksOnly
              ? [
                  {
                    id: "bookmarks",
                    label: `Bookmarks Only (${pyBookmarks.length})`,
                    color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
                    onRemove: () => {
                      setShowPyBookmarksOnly(false);
                      setPyPage(1);
                    },
                  },
                ]
              : []),
            ...(pySearch.trim().length > 0
              ? [
                  {
                    id: "search",
                    label: `Search: "${pySearch}"`,
                    color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                    onRemove: () => {
                      setPySearch("");
                      setPyPage(1);
                    },
                  },
                ]
              : []),
          ]}
        />
      )}

      {/* 3. SYSTEM SCENARIOS VIEW */}
      {activeTab === "scenarios" && (
        <div className="space-y-6 animate-in fade-in duration-300">

          {/* Results Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted-foreground)] px-1">
            <div className="flex items-center gap-2.5">
              <span>
                Showing <strong className="text-[var(--foreground)]">{paginatedItems.length}</strong> of{" "}
                <strong className="text-[var(--foreground)]">{filteredItems.length}</strong> scenarios
              </span>
              <button
                onClick={handleShuffle}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all shrink-0 cursor-pointer",
                  isShuffled
                    ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                    : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--foreground)] hover:border-blue-500/40 hover:bg-[var(--surface-2)]"
                )}
                title="Shuffle or randomize architecture scenarios"
              >
                <Shuffle size={12} className={cn(isShuffled && "rotate-180 transition-transform")} />
                <span>{isShuffled ? "Reshuffle" : "Shuffle"}</span>
              </button>
              {isShuffled && (
                <button
                  onClick={handleResetOrder}
                  className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-1.5 py-1 underline underline-offset-2"
                >
                  Reset Order
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleReadAllScenarios}
                className={cn(
                  "inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer",
                  isReadAllMode ? "text-emerald-500 dark:text-emerald-400 font-bold" : "hover:text-[var(--foreground)]"
                )}
                title="Toggle continuous read-all mode (Shift + E)"
              >
                <BookOpen size={13} className={cn(isReadAllMode && "text-emerald-500 dark:text-emerald-400")} />
                <span>{isReadAllMode ? "Exit Read All" : "Read All"}</span>
              </button>
              <span>•</span>
              <button
                onClick={handleExpandAllScenarios}
                className="hover:text-[var(--foreground)] font-medium transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                onClick={handleCollapseAllScenarios}
                className="hover:text-[var(--foreground)] font-medium transition-colors cursor-pointer"
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
                Try adjusting your search keywords or switching spec filters.
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
              {paginatedItems.map((item) => {
                const isExpanded = isReadAllMode ? !collapsedInReadMode.has(item.id) : expandedIds.has(item.id);
                const isBookmarked = bookmarks.includes(item.id);
                const diffStyle = difficultyColors[item.difficulty] || difficultyColors.ARCHITECT;

                return (
                  <div
                    key={item.id}
                    id={`arch-${item.id}`}
                    className={cn(
                      "rounded-xl border transition-all duration-200 overflow-hidden scroll-mt-20",
                      isExpanded
                        ? "bg-[var(--surface-1)] border-blue-500/40 shadow-xs"
                        : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    <div
                      onClick={() => toggleExpand(item.id)}
                      className="p-3 sm:p-3.5 cursor-pointer select-none space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
                              {item.category} {item.niche ? `· ${item.niche}` : ""}
                            </span>
                            <span
                              className={cn(
                                "text-[9px] font-semibold px-1.5 py-0.5 rounded border",
                                diffStyle.bg,
                                diffStyle.text,
                                diffStyle.border
                              )}
                            >
                              {item.difficulty}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight leading-snug break-words">
                            {item.question}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => toggleBookmark(item.id, e)}
                            className={cn(
                              "p-1.5 rounded-lg transition-colors cursor-pointer",
                              isBookmarked
                                ? "text-amber-400 bg-amber-400/10"
                                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                            )}
                            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                          >
                            {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                          </button>

                          <button
                            onClick={(e) => copyScenario(item, e)}
                            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                            title="Copy Scenario"
                          >
                            {copiedId === item.id ? (
                              <Check size={14} className="text-green-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>

                          <div className="p-1.5 text-[var(--muted-foreground)]">
                            <ChevronDown
                              size={15}
                              className={cn(
                                "transition-transform duration-200",
                                isExpanded && "rotate-180 text-blue-500 dark:text-blue-400"
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <SmoothAccordion isOpen={isExpanded} innerClassName="px-3.5 py-2.5 sm:px-4 sm:py-3 space-y-1.5 text-xs sm:text-sm bg-[var(--surface-2)]/30">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 pb-0.5">
                        <Sparkles size={12} className="shrink-0" />
                        <span>Principal Architect Blueprint</span>
                      </div>
                      <div className="pt-0.5">
                        <AnswerRenderer text={item.answer} />
                      </div>
                    </SmoothAccordion>
                  </div>
                );
              })}

              {paginatedItems.length < filteredItems.length && (
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setVisibleCount((prev) => prev * 2)}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>⚡ Load More (+{Math.min(paginatedItems.length, filteredItems.length - paginatedItems.length).toLocaleString()})</span>
                    <span className="opacity-75 font-normal">· {(filteredItems.length - paginatedItems.length).toLocaleString()} remaining</span>
                  </button>
                  <button
                    onClick={() => setVisibleCount(filteredItems.length)}
                    className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] text-[var(--foreground)] text-xs sm:text-sm font-semibold transition-all"
                  >
                    Load All ({filteredItems.length.toLocaleString()})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3.5. WHITEBOARD ARCHITECTURE DIAGRAMS VIEW */}
      {activeTab === "diagrams" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <ArchitectureDiagramsGallery />
        </div>
      )}

      {/* 4. PYTHON RUNBOOKS VIEW */}
      {activeTab === "python" && (
        <div className="space-y-6 animate-in fade-in duration-300">


          {/* Results Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted-foreground)] px-1">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="text-[var(--foreground)]">{paginatedRunbooks.length}</strong> of{" "}
                <strong className="text-[var(--foreground)]">{filteredRunbooks.length}</strong> runbooks
              </span>
              <button
                onClick={handleShuffle}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all shrink-0",
                  isShuffled
                    ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                    : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--foreground)] hover:border-purple-500/40 hover:bg-[var(--surface-2)]"
                )}
                title="Shuffle or randomize python runbooks"
              >
                <Shuffle size={13} className={cn(isShuffled && "rotate-180 transition-transform")} />
                <span>{isShuffled ? "Reshuffle" : "Shuffle"}</span>
              </button>
              {isShuffled && (
                <button
                  onClick={handleResetOrder}
                  className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-1.5 py-1 underline underline-offset-2"
                >
                  Reset Order
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExpandAllRunbooks}
                className="hover:text-[var(--foreground)] font-medium transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                onClick={handleCollapseAllRunbooks}
                className="hover:text-[var(--foreground)] font-medium transition-colors cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Runbooks Stream */}
          {filteredRunbooks.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-8">
              <Code2 size={40} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-40" />
              <h3 className="text-base font-semibold text-[var(--foreground)]">No matching runbooks found</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-sm mx-auto">
                No runbooks match your selected Level, Domain, Framework, or Search query.
              </p>
              <button
                onClick={() => {
                  setPySearch("");
                  setSelectedPyLevel("all");
                  setSelectedPyDomain("all");
                  setSelectedPyFramework("all");
                  setShowPyBookmarksOnly(false);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm"
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
                  isExpanded={pyExpandedIds.has(item.id)}
                  onToggle={togglePyExpand}
                  onCopy={copyCode}
                  onBookmark={togglePyBookmark}
                  onShare={shareCardLink}
                  copied={copiedKey === item.id}
                  bookmarked={pyBookmarks.includes(item.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredRunbooks.length > pyPageSize && (
            <div className="flex justify-center items-center gap-3 pt-4">
              <button
                onClick={() => setPyPage((p) => Math.max(p - 1, 1))}
                disabled={pyPage === 1}
                className={cn(
                  "px-4 py-2 rounded-xl border text-xs font-semibold transition-all",
                  pyPage === 1
                    ? "opacity-50 cursor-not-allowed border-[var(--border)] text-[var(--muted-foreground)]"
                    : "hover:bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)]"
                )}
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPyPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPyPage(p)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-semibold transition-all",
                      pyPage === p
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPyPage((p) => Math.min(p + 1, totalPyPages))}
                disabled={pyPage === totalPyPages}
                className={cn(
                  "px-4 py-2 rounded-xl border text-xs font-semibold transition-all",
                  pyPage === totalPyPages
                    ? "opacity-50 cursor-not-allowed border-[var(--border)] text-[var(--muted-foreground)]"
                    : "hover:bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)]"
                )}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. POLYGLOT TRANSLATION MATRIX VIEW */}
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
              Compare how foundational analytical data operations (Parquet readers, partition pruning, window functions, and MERGE INTO upserts) are implemented across Polars, PySpark, DuckDB, Spark SQL, and Snowflake.
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

      {/* 6. MODERN STACK PYTHON SCENARIOS VIEW */}
      {activeTab === "distributed" && (
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
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      )}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[var(--muted-foreground)]">ID: #{q.id}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] leading-snug break-words">
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

export function ArchitectureClient(props: ArchitectureClientProps) {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-[var(--muted-foreground)]">
          Loading Enterprise Architecture &amp; Python Hub...
        </div>
      }
    >
      <ArchitectureHubContent {...props} />
    </Suspense>
  );
}
