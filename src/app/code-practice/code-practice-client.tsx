"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
  FileCode2,
  Search,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Lightbulb,
  Briefcase,
  Layers,
  BookOpen,
  MessageSquare,
  Shuffle,
  Terminal,
  Zap,
  Sparkles,
  Flame,
  ArrowRight,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CodeSheetItem, CodeLevel } from "@/types/data";
import { CodeBlock } from "@/components/ui/code-block";
import { SmoothAccordion } from "@/components/ui/smooth-accordion";
import { recordLastTopic } from "@/lib/user-progress";
import { TopicIcon } from "@/components/ui/topic-icon";
import { UnifiedSearchFilterBox } from "@/components/ui/unified-search-filter-box";

type LanguageKey = "pyspark" | "sparksql" | "mssql" | "python";

const levelBadges: Record<CodeLevel, { bg: string; text: string; border: string }> = {
  beginner: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  intermediate: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  advanced: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  architect: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

export interface CodePracticeClientProps {
  initialData: {
    pyspark: CodeSheetItem[];
    sparksql: CodeSheetItem[];
    mssql: CodeSheetItem[];
    python: CodeSheetItem[];
  };
}

export function CodePracticeClient({ initialData }: CodePracticeClientProps) {
  const languageConfigs: Record<
    LanguageKey,
    { name: string; topicKey: string; data: CodeSheetItem[]; badgeColor: string }
  > = useMemo(
    () => ({
      pyspark: {
        name: "PySpark 3.4+ / 4.0",
        topicKey: "spark",
        data: initialData.pyspark,
        badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      },
      sparksql: {
        name: "Spark SQL & Unity",
        topicKey: "sql",
        data: initialData.sparksql,
        badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      },
      mssql: {
        name: "MS SQL / T-SQL",
        topicKey: "mssql",
        data: initialData.mssql,
        badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      },
      python: {
        name: "Python (Pandas & Polars)",
        topicKey: "python",
        data: initialData.python,
        badgeColor: "bg-green-500/10 text-green-400 border-green-500/20",
      },
    }),
    [initialData]
  );
  const [activeLang, setActiveLang] = useState<LanguageKey>("pyspark");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const handleShuffle = () => {
    setIsShuffled(true);
    setShuffleSeed((s) => s + 1);
    toast.success(`Shuffled ${languageConfigs[activeLang].name} templates`);
  };

  const handleResetOrder = () => {
    setIsShuffled(false);
    toast.info("Reset to default order");
  };

  const scrollTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const copyTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const dbParam = searchParams.get("db")?.toLowerCase();

  // Reactively sync activeLang whenever searchParams ?db= changes
  useEffect(() => {
    if (dbParam === "databricks") {
      router.push("/code-practice/databricks");
      return;
    }
    const validLangs: LanguageKey[] = ["pyspark", "sparksql", "mssql", "python"];
    if (dbParam && validLangs.includes(dbParam as LanguageKey)) {
      setActiveLang(dbParam as LanguageKey);
    }
  }, [dbParam, router]);

  // Synchronize language tab and item target from URL search parameter (?db=, ?id=, ?q=) or hash (#...)
  useEffect(() => {
    const syncTab = () => {
      const params = new URLSearchParams(window.location.search);
      const dbParam = params.get("db")?.toLowerCase();
      const hashParam = window.location.hash.replace("#", "").toLowerCase();
      const idParam = params.get("card") || params.get("id");
      const qParam = params.get("q") || params.get("search");

      let targetLang = (dbParam || hashParam) as LanguageKey;
      const validLangs: LanguageKey[] = ["pyspark", "sparksql", "mssql", "python"];

      // If id is provided, discover its language dataset
      if (idParam) {
        for (const l of validLangs) {
          if (languageConfigs[l].data.some((item) => item.id === idParam)) {
            targetLang = l;
            break;
          }
        }
      }

      if (targetLang && validLangs.includes(targetLang)) {
        setActiveLang(targetLang);
      }

      if (idParam || qParam) {
        const targetData = targetLang && validLangs.includes(targetLang)
          ? languageConfigs[targetLang].data
          : initialData.pyspark;
        const matched = targetData.find(
          (item: CodeSheetItem) => (idParam && item.id === idParam) || (qParam && item.title.toLowerCase().includes(qParam.toLowerCase()))
        );
        if (matched) {
          setSelectedLevel("ALL");
          setSearchQuery(matched.title);
          setExpandedIds(new Set([matched.id]));
          if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = setTimeout(() => {
            const el = document.getElementById(`code-${matched.id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 300);
        } else if (qParam) {
          setSearchQuery(qParam);
        }
      }
    };
    syncTab();
    window.addEventListener("hashchange", syncTab);
    window.addEventListener("popstate", syncTab);
    return () => {
      window.removeEventListener("hashchange", syncTab);
      window.removeEventListener("popstate", syncTab);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleLangChange = (lang: LanguageKey) => {
    setActiveLang(lang);
    setExpandedIds(new Set());
    setIsShuffled(false);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `?db=${lang}`);
    }
    recordLastTopic({
      title: `${languageConfigs[lang].name} Syntax & Code Sheets`,
      href: `/code-practice?db=${lang}`,
      category: "Polyglot Code Hub",
      progress: 45,
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Load bookmarks
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

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const safeBm = Array.isArray(bookmarks) ? bookmarks : [];
    const isCurrentlyBookmarked = safeBm.includes(id);
    const updated = isCurrentlyBookmarked
      ? safeBm.filter((b) => b !== id)
      : [...safeBm, id];
    setBookmarks(updated);
    try {
      localStorage.setItem("dataprep_bookmarks", JSON.stringify(updated));
      const targetItem = languageConfigs[activeLang].data.find((item) => item.id === id);
      if (targetItem) {
        recordLastTopic({
          title: targetItem.title,
          href: `/code-practice?db=${activeLang}`,
          category: `${languageConfigs[activeLang].name} Practice`,
          progress: 60,
        });
      }
      if (isCurrentlyBookmarked) {
        toast.info("Bookmark removed");
      } else {
        toast.success("Saved code sheet to bookmarks in My Studio");
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
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
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

  const displayedItems = useMemo(() => {
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

  const hasActiveCodeFilters =
    selectedLevel !== "ALL" ||
    searchQuery.trim().length > 0;

  const handleResetCodeFilters = useCallback(() => {
    setSelectedLevel("ALL");
    setSearchQuery("");
    setIsShuffled(false);
    toast.info("Reset code filters");
  }, []);

  return (
    <div className="space-y-4 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header Hub Banner Summary */}
      <div className="relative rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3 sm:p-4 shadow-xs isolate">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <FileCode2 size={11} />
                <span>Polyglot Code Hub</span>
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)]">
                Production Code Drills &amp; Syntaxes
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight break-words">
              Hands-On Code Practice &amp; Polyglot Syntaxes
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] max-w-3xl leading-relaxed break-words">
              Production-grade code patterns across 4 core languages. Optimized for window functions, incremental merges, vector operations, and low-latency analytics.
            </p>
          </div>
          <div className="text-xs text-[var(--muted-foreground)] shrink-0 self-start sm:self-auto">
            Showing <strong className="text-[var(--foreground)]">{filteredItems.length}</strong> of {currentDataset.length} drills ({languageConfigs[activeLang].name})
          </div>
        </div>
      </div>

      {/* Databricks Dedicated Coding Subpage Banner */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-red-950/30 via-red-900/10 to-[var(--surface-1)] border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0">
            <Flame size={16} />
          </span>
          <div>
            <div className="font-semibold text-red-200 flex items-center gap-1.5">
              <span>Databricks Polyglot Coding Hub Subpage</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-red-500/30 text-red-200">
                148+ Ops &amp; DBFS
              </span>
            </div>
            <div className="text-[11px] text-red-300/80">
              Dedicated subpage for all Databricks coding, Spark SQL, PySpark, DBFS &amp; Volumes, Catalyst optimization, and production memory triage (OOM, Spill, Skew).
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link
            href="/code-practice/databricks"
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
          >
            <span>Databricks Subpage</span>
            <ArrowRight size={13} />
          </Link>
          <Link
            href="/cheat-sheet?tab=pdf_hub"
            className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-medium text-xs transition-colors flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
          >
            <FileText size={13} className="text-purple-400" />
            <span>A4 PDF Hub</span>
          </Link>
        </div>
      </div>

      {/* ─── UNIFIED SEARCH & MULTI-LEVEL FILTER BOX ─── */}
      <UnifiedSearchFilterBox
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={`Search ${languageConfigs[activeLang].name} syntax, functions, or use cases... (Press / to search)`}
        matchCount={filteredItems.length}
        totalCount={currentDataset.length}
        countUnit="drills"
        themeAccent="blue"
        hasActiveFilters={hasActiveCodeFilters}
        onResetAll={handleResetCodeFilters}
        actions={{
          shuffle: {
            isShuffled,
            onShuffle: handleShuffle,
          },
          expandCollapse: {
            onExpandAll: () => setExpandedIds(new Set(displayedItems.map((i) => i.id))),
            onCollapseAll: () => setExpandedIds(new Set()),
          },
        }}
        levels={[
          {
            id: "engines",
            title: "Level 1: Language & Execution Engine",
            shortTitle: "Engines",
            icon: <Terminal size={13} className="text-blue-500" />,
            layout: "chips",
            accentColor: "blue",
            selectedId: activeLang,
            onSelect: (id) => handleLangChange(id as LanguageKey),
            options: (Object.keys(languageConfigs) as LanguageKey[]).map((key) => {
              const cfg = languageConfigs[key];
              return {
                id: key,
                label: cfg.name,
                icon: <TopicIcon topic={cfg.topicKey} size={13} />,
                count: cfg.data.length,
              };
            }),
          },
          {
            id: "level",
            title: "Level 2: Difficulty & Complexity",
            shortTitle: "Level",
            icon: <Sparkles size={13} className="text-amber-400" />,
            layout: "segmented",
            selectedId: selectedLevel,
            onSelect: (lvl) => setSelectedLevel(lvl),
            options: [
              { id: "ALL", label: "ALL" },
              { id: "beginner", label: "Beginner" },
              { id: "intermediate", label: "Intermediate" },
              { id: "advanced", label: "Advanced" },
              { id: "architect", label: "Architect" },
            ],
          },
        ]}
        activeFilters={[
          ...(selectedLevel !== "ALL"
            ? [
                {
                  id: "level",
                  label: `Level: ${selectedLevel}`,
                  color: "bg-amber-500/10 border-amber-500/30 text-amber-400 capitalize",
                  onRemove: () => setSelectedLevel("ALL"),
                },
              ]
            : []),
          ...(searchQuery.trim().length > 0
            ? [
                {
                  id: "search",
                  label: `Search: "${searchQuery}"`,
                  color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                  onRemove: () => setSearchQuery(""),
                },
              ]
            : []),
        ]}
      />

      {/* 4-Layer Integrated Domain Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Link
          href={`/concepts?term=${activeLang === "mssql" ? "SQL" : activeLang === "pyspark" ? "PySpark" : "Spark"}`}
          className="p-2 sm:p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] hover:border-blue-500/40 transition-all flex items-center gap-2 group"
        >
          <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen size={14} />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] uppercase font-bold text-blue-600 dark:text-blue-400 leading-tight">Layer 1 · Concepts</div>
            <div className="text-xs font-bold text-[var(--foreground)] truncate group-hover:text-blue-500 dark:group-hover:text-blue-300">
              {activeLang === "mssql" ? "T-SQL Definitions" : activeLang === "pyspark" ? "PySpark Core" : "Engine Concepts"}
            </div>
          </div>
        </Link>

        <div className="p-2 sm:p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 font-bold">
            <FileCode2 size={14} />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] uppercase font-bold text-blue-400 leading-tight">Layer 2 · Code Active</div>
            <div className="text-xs font-bold text-[var(--foreground)] truncate">
              {languageConfigs[activeLang].data.length} Templates Active
            </div>
          </div>
        </div>

        <Link
          href={`/qa-prep?q=${encodeURIComponent(activeLang === "mssql" ? "SQL" : activeLang === "pyspark" ? "PySpark" : "Spark")}`}
          className="p-2 sm:p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] hover:border-orange-500/40 transition-all flex items-center gap-2 group"
        >
          <div className="w-7 h-7 rounded-md bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
            <MessageSquare size={14} />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] uppercase font-bold text-orange-400 leading-tight">Layer 3 · Q&amp;A Prep</div>
            <div className="text-xs font-bold text-[var(--foreground)] truncate group-hover:text-orange-300">
              Related Interview Q&As
            </div>
          </div>
        </Link>

        <Link
          href={`/architecture?q=${encodeURIComponent(activeLang === "mssql" ? "SQL" : "Spark")}`}
          className="p-2 sm:p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] hover:border-amber-500/40 transition-all flex items-center gap-2 group"
        >
          <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Layers size={14} />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] uppercase font-bold text-amber-400 leading-tight">Layer 4 · Architecture</div>
            <div className="text-xs font-bold text-[var(--foreground)] truncate group-hover:text-amber-300">
              System Scenarios
            </div>
          </div>
        </Link>
      </div>

      {/* Code Templates Stream */}
      {displayedItems.length === 0 ? (
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
              setIsShuffled(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-2.5">
          {displayedItems.map((item, index) => {
            const isExpanded = expandedIds.has(item.id);
            const isBookmarked = bookmarks.includes(item.id);
            const levelStyle = levelBadges[item.level] || levelBadges.intermediate;

            return (
              <div
                key={item.id}
                id={`code-${item.id}`}
                className={cn(
                  "rounded-xl border transition-all duration-200 overflow-hidden scroll-mt-20",
                  isExpanded
                    ? "bg-[var(--surface-1)] border-blue-500/40 shadow-xs"
                    : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]"
                )}
              >
                {/* Header */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-3 sm:p-3.5 cursor-pointer select-none space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
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
                      <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight break-words whitespace-normal leading-snug">
                        {item.title}
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
                        {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                      </button>

                      <button
                        onClick={(e) => copyCode(item.code, item.id, e)}
                        className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                        title="Copy Code"
                      >
                        {copiedId === item.id ? (
                          <Check size={15} className="text-green-400" />
                        ) : (
                          <Copy size={15} />
                        )}
                      </button>

                      <div className="p-1.5 text-[var(--muted-foreground)]">
                        <ChevronDown
                          size={15}
                          className={cn(
                            "transition-transform duration-300",
                            isExpanded && "rotate-180 text-blue-500 dark:text-blue-400"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words whitespace-normal">
                    {item.description}
                  </p>
                </div>

                {/* Expanded Code & Notes Body */}
                <SmoothAccordion isOpen={isExpanded} innerClassName="px-3.5 pb-3.5 pt-2 space-y-2.5 text-xs sm:text-sm bg-[var(--surface-2)]/30">
                  {/* Use Case Scenario */}
                  {item.use_case && (
                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[var(--foreground)] flex items-start gap-2">
                      <Briefcase size={14} className="text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          Enterprise Scenario:
                        </span>
                        <p className="text-xs text-[var(--foreground)]/90 leading-relaxed break-words whitespace-normal">{item.use_case}</p>
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
                            <span className="text-amber-400 font-bold shrink-0">•</span>
                            <span className="leading-snug break-words whitespace-normal">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </SmoothAccordion>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
