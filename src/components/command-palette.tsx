"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import {
  Search,
  BookOpen,
  FileCode2,
  Zap,
  Layers,
  MessageSquare,
  Building2,
  Compass,
  User,
  ExternalLink,
  Sparkles,
  Cpu,
  Calculator,
  Flame,
  Terminal,
  BookMarked,
  Palette,
  Type,
  Plus,
  Minus,
  RotateCcw,
  X,
  ChevronRight,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KbdShortcut } from "@/components/ui/kbd-shortcut";
import { THEME_OPTIONS } from "@/components/ui/theme-switcher";
import { useTextSize, TEXT_SIZE_OPTIONS } from "@/components/providers/text-size-provider";
import type { TopicIdentification, SearchResultItem, NavigationalJump } from "@/lib/search-types";
import { SUGGESTED_SEARCH_KEYWORDS } from "@/lib/search-types";

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text}</>;
  const tokens = query
    .toLowerCase()
    .split(/[\s,+/_\-:]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  if (tokens.length === 0) return <>{text}</>;

  let parts: string[] = [text];
  let regex: RegExp | null = null;
  try {
    const escaped = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    regex = new RegExp(`(${escaped})`, "gi");
    parts = text.split(regex);
  } catch {
    return <>{text}</>;
  }

  if (!regex) return <>{text}</>;

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-purple-500/25 text-purple-200 font-semibold px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

const QUICK_NAV_HUBS = [
  { label: "Guided Tracks", href: "/guided-learning", icon: Sparkles, badge: "13 Tracks" },
  { label: "Key Concepts", href: "/concepts", icon: BookOpen, badge: "670+ Terms" },
  { label: "Q&A Prep Hub", href: "/qa-prep", icon: MessageSquare, badge: "7.1k+ Drills" },
  { label: "Architecture Hub", href: "/architecture", icon: Cpu, badge: "3.2k+ Scenarios" },
  { label: "Databricks Hub", href: "/code-practice/databricks", icon: Flame, badge: "148+ Ops" },
  { label: "Spark Simulator", href: "/spark-engine", icon: Zap, badge: "Engine" },
  { label: "Modern Stack", href: "/modern-stack", icon: Layers, badge: "Blueprints" },
  { label: "Cheat Sheets", href: "/cheat-sheet", icon: Terminal, badge: "PROD" },
  { label: "Mind Map", href: "/mindmap", icon: Compass, badge: "Tree" },
];

export type CommandCategory =
  | "Navigation"
  | "Guided Track"
  | "Concepts"
  | "Q&A Prep"
  | "Architecture"
  | "Code Practice"
  | "Cheat Sheets"
  | "Blueprints"
  | "Companies"
  | "Learning Paths"
  | "Simulators"
  | "Theme"
  | "Text Size";

interface CommandItem {
  id: string;
  title: string;
  category: CommandCategory;
  page?: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  badge?: string;
  snippet?: string;
  keywords?: string[];
  score?: number;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Guided Track": Sparkles,
  Concepts: BookOpen,
  "Q&A Prep": MessageSquare,
  Architecture: Cpu,
  "Code Practice": Terminal,
  "Cheat Sheets": FileCode2,
  Blueprints: Layers,
  Companies: Building2,
  "Learning Paths": Compass,
  Simulators: Calculator,
  Navigation: Zap,
  Theme: Palette,
  "Text Size": Type,
};

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "Guided Track", label: "Tracks" },
  { id: "Concepts", label: "Concepts" },
  { id: "Q&A Prep", label: "Q&A Prep" },
  { id: "Architecture", label: "Architecture" },
  { id: "Code Practice", label: "Code & Cheats" },
  { id: "Navigation", label: "Tools & Nav" },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [identifiedTopics, setIdentifiedTopics] = useState<TopicIdentification[]>([]);
  const [remoteResults, setRemoteResults] = useState<CommandItem[]>([]);
  const [pageCounts, setPageCounts] = useState<Record<string, number>>({});
  const [navigationalJump, setNavigationalJump] = useState<NavigationalJump | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { setTheme } = useTheme();
  const { setTextSize, increaseTextSize, decreaseTextSize, resetTextSize } = useTextSize();

  // Text size quick commands
  const textSizeRoutes: CommandItem[] = useMemo(
    () => [
      {
        id: "text-size-increase",
        title: "Increase Text Size (A+)",
        category: "Text Size" as const,
        icon: Plus,
        badge: "Alt +",
        keywords: ["text", "font", "size", "bigger", "increase", "larger", "zoom in", "scale", "accessibility"],
        action: () => {
          increaseTextSize(true);
        },
      },
      {
        id: "text-size-decrease",
        title: "Decrease Text Size (A-)",
        category: "Text Size" as const,
        icon: Minus,
        badge: "Alt -",
        keywords: ["text", "font", "size", "smaller", "decrease", "compact", "zoom out", "scale", "accessibility"],
        action: () => {
          decreaseTextSize(true);
        },
      },
      {
        id: "text-size-reset",
        title: "Reset Text Size to Default (100%)",
        category: "Text Size" as const,
        icon: RotateCcw,
        badge: "Alt 0",
        keywords: ["text", "font", "size", "reset", "default", "normal", "100%", "scale"],
        action: () => {
          resetTextSize(true);
        },
      },
      ...TEXT_SIZE_OPTIONS.map((opt) => ({
        id: `text-size-${opt.id}`,
        title: `Text Size: ${opt.label} (${opt.scaleLabel}) - ${opt.tagline}`,
        category: "Text Size" as const,
        icon: Type,
        badge: opt.scaleLabel,
        keywords: ["text", "font", "size", "scale", opt.label.toLowerCase(), opt.scaleLabel, "readability"],
        action: () => {
          setTextSize(opt.id, true);
        },
      })),
    ],
    [increaseTextSize, decreaseTextSize, resetTextSize, setTextSize]
  );

  // Theme quick-switch options
  const themeRoutes: CommandItem[] = useMemo(
    () =>
      THEME_OPTIONS.map((t) => ({
        id: `theme-${t.id}`,
        title: `Switch Theme: ${t.label} (${t.tagline})`,
        category: "Theme" as const,
        icon: t.icon,
        badge: t.badge,
        keywords: [
          "theme",
          "themes",
          "mode",
          "appearance",
          "color",
          "switch",
          t.id,
          t.label.toLowerCase(),
          t.tagline.toLowerCase(),
        ],
        action: () => {
          setTheme(t.id);
          toast.success(`Theme switched to ${t.label} mode`);
        },
      })),
    [setTheme]
  );

  // Static navigation routes
  const staticRoutes: CommandItem[] = useMemo(
    () => [
      { id: "nav-home", title: "Home Dashboard", category: "Navigation", page: "Home", icon: Sparkles, href: "/", badge: "Main" },
      { id: "nav-guided", title: "Guided Learning (13 Structured Tracks)", category: "Navigation", page: "Guided Learning", icon: BookMarked, href: "/guided-learning", badge: "Core" },
      { id: "nav-concepts", title: "Key Concepts (660+ Terms)", category: "Navigation", page: "Key Concepts", icon: BookOpen, href: "/concepts", badge: "Easy" },
      { id: "nav-qa", title: "Q&A Prep Hub (7,080+ Questions)", category: "Navigation", page: "Q&A Prep", icon: MessageSquare, href: "/qa-prep", badge: "SM-2" },
      { id: "nav-arch", title: "Architecture Hub (3,206+ Scenarios)", category: "Navigation", page: "Architecture Hub", icon: Cpu, href: "/architecture", badge: "Architect" },
      { id: "nav-code", title: "Code Practice (PySpark, SQL, Python)", category: "Navigation", page: "Code Practice", icon: FileCode2, href: "/code-practice", badge: "Polyglot" },
      { id: "nav-code-dbx", title: "Databricks Coding Hub (148+ Ops, DBFS & Memory Triage)", category: "Code Practice", page: "Code Practice", icon: Flame, href: "/code-practice/databricks", badge: "DBX", keywords: ["databricks", "dbfs", "spark", "sql", "pyspark", "oom", "bottleneck", "d100", "spill", "skew", "volumes"] },
      { id: "nav-spark", title: "Spark Engine & Simulator", category: "Navigation", page: "Spark Engine", icon: Zap, href: "/spark-engine", badge: "Internals" },
      { id: "nav-cheatsheet", title: "Production Cheat Sheet (Spark, dbt, Airflow, SQL)", category: "Navigation", page: "Cheat Sheets", icon: Terminal, href: "/cheat-sheet", badge: "PROD" },
      { id: "nav-modern", title: "Modern Data Stack & AI Architecture", category: "Navigation", page: "Modern Stack", icon: Layers, href: "/modern-stack", badge: "Hard" },
      { id: "nav-gcc", title: "Company Research (156 Profiles)", category: "Navigation", page: "Company Research", icon: Building2, href: "/company-research", badge: "Enterprise" },
      { id: "nav-paths", title: "Learning Paths (12 Structured Tracks)", category: "Learning Paths", page: "Learning Paths", icon: Compass, href: "/learning-paths", badge: "Curriculum" },
      { id: "nav-studio", title: "My Studio & Progress", category: "Navigation", page: "Studio", icon: User, href: "/studio", badge: "Account" },

      // Simulators
      { id: "sim-shuffle", title: "Simulator: Spark Shuffle & Partition Estimator", category: "Simulators", page: "Modern Stack", icon: Calculator, href: "/modern-stack#simulators", badge: "Tool" },
      { id: "sim-delta", title: "Simulator: Iceberg vs Delta Decision Tree", category: "Simulators", page: "Modern Stack", icon: Layers, href: "/modern-stack#simulators", badge: "Tool" },
      { id: "sim-cost", title: "Simulator: Serverless Cloud Cost Calculator", category: "Simulators", page: "Modern Stack", icon: Flame, href: "/modern-stack#simulators", badge: "Tool" },

      // Quick Theme Switching
      ...themeRoutes,

      // Text Size adjustments
      ...textSizeRoutes,
    ],
    [themeRoutes, textSizeRoutes]
  );

  const mapSearchResultToCommandItem = useCallback((it: SearchResultItem): CommandItem => ({
    id: it.id,
    title: it.title,
    category: it.category as CommandCategory,
    page: it.page,
    icon: CATEGORY_ICONS[it.category] || BookOpen,
    href: it.href,
    badge: it.badge,
    snippet: it.snippet,
    score: it.score,
  }), []);

  // Unified Search Handler (Supports Local In-Memory & Server API)
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setRemoteResults([]);
      setIdentifiedTopics([]);
      setPageCounts({});
      setNavigationalJump(null);
      setIsLoading(false);
      return;
    }

    // In testing environments, execute portal search directly
    if (process.env.NODE_ENV === "test") {
      import("@/lib/search-engine").then(({ executePortalSearch }) => {
        const searchRes = executePortalSearch(q, 40);
        setIdentifiedTopics(searchRes.identifiedTopics);
        setPageCounts(searchRes.pageCounts);
        setNavigationalJump(searchRes.navigationalJump || null);
        setRemoteResults(searchRes.items.map(mapSearchResultToCommandItem));
      }).catch(() => {});
      return;
    }

    // Client Debounced Fetch
    setIsLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}&limit=40`)
        .then((res) => {
          if (!res.ok) throw new Error("Search API error");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data?.items)) {
            setIdentifiedTopics(data.identifiedTopics || []);
            setPageCounts(data.pageCounts || {});
            setNavigationalJump(data.navigationalJump || null);
            setRemoteResults(data.items.map(mapSearchResultToCommandItem));
          }
        })
        .catch(() => {
          setRemoteResults([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 120);

    return () => clearTimeout(timer);
  }, [query, mapSearchResultToCommandItem]);

  // Filter items based on active category filter tab & query
  const filteredItems = useMemo(() => {
    const qLower = query.toLowerCase().trim();

    if (!qLower) {
      if (selectedFilter === "all") return staticRoutes;
      return staticRoutes.filter((item) => {
        if (selectedFilter === "Navigation") {
          return item.category === "Navigation" || item.category === "Theme" || item.category === "Text Size";
        }
        return item.category === selectedFilter;
      });
    }

    // Static matches for commands / routes
    const staticMatches = staticRoutes.filter((item) => {
      if (item.title.toLowerCase().includes(qLower)) return true;
      if (item.keywords?.some((k) => k.toLowerCase().includes(qLower))) return true;
      return false;
    });

    // Combine static matches with dynamic portal search results
    const combined = [...remoteResults, ...staticMatches];

    // Filter by tab if selected
    const tabFiltered = combined.filter((item) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "Guided Track") return item.category === "Guided Track";
      if (selectedFilter === "Concepts") return item.category === "Concepts";
      if (selectedFilter === "Q&A Prep") return item.category === "Q&A Prep";
      if (selectedFilter === "Architecture") return item.category === "Architecture";
      if (selectedFilter === "Code Practice") {
        return item.category === "Code Practice" || item.category === "Cheat Sheets";
      }
      if (selectedFilter === "Navigation") {
        return (
          item.category === "Navigation" ||
          item.category === "Theme" ||
          item.category === "Text Size" ||
          item.category === "Simulators"
        );
      }
      return item.category === selectedFilter;
    });

    // Deduplicate by id
    const seen = new Set<string>();
    const deduplicated: CommandItem[] = [];
    for (const item of tabFiltered) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        deduplicated.push(item);
      }
    }

    return deduplicated.slice(0, 30);
  }, [query, selectedFilter, staticRoutes, remoteResults]);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      setIsOpen(false);
      setQuery("");
      if (item.action) {
        item.action();
      } else if (item.href) {
        router.push(item.href);
      }
    },
    [router]
  );

  // Keyboard shortcut listener & custom event trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (
        e.key === "/" &&
        !isOpen &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement)?.isContentEditable
        )
      ) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [isOpen]);

  // Arrow key navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleNav = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, filteredItems.length - 1) : prev - 1
        );
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredItems[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleNav);
    return () => window.removeEventListener("keydown", handleNav);
  }, [isOpen, selectedIndex, filteredItems, handleSelect]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen, () => setIsOpen(false));

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-40 hidden md:flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-purple-500/40 shadow-xl transition-all hover:scale-105 group"
        aria-label="Open Command Palette (Cmd/Ctrl+K)"
      >
        <Search size={14} className="text-purple-400 group-hover:rotate-12 transition-transform" />
        <span>Universal Search...</span>
        <KbdShortcut shortcutKey="k" className="px-2 py-0.5 text-purple-300" />
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[10vh] px-3 sm:px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Universal Search Command Palette"
    >
      <div
        ref={modalRef}
        className="w-full max-w-3xl bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[84vh]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <Search size={18} className={cn("text-purple-400 shrink-0", isLoading && "animate-pulse")} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts, questions, architecture, topics (Cmd/Ctrl+K)..."
            aria-label="Search concepts, questions, architecture, topics, and routes"
            className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-[var(--surface-3)] text-[var(--muted-foreground)] border border-[var(--border)]">
            ESC
          </span>
        </div>

        {/* Suggested Quick Keywords & Nav Hubs when Query is Empty */}
        {!query && (
          <div className="px-4 py-2.5 bg-[var(--surface-2)]/60 border-b border-[var(--border)] space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              <Sparkles size={11} className="text-blue-400" />
              <span>Popular Architecture &amp; Concept Keywords:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {SUGGESTED_SEARCH_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setQuery(kw)}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--surface-1)] hover:bg-blue-600/15 hover:text-blue-400 text-[var(--foreground)] border border-[var(--border)] hover:border-blue-500/30 transition-colors cursor-pointer"
                >
                  {kw}
                </button>
              ))}
            </div>

            <div className="pt-1 flex items-center gap-1.5 flex-wrap border-t border-[var(--border)]/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mr-1">
                Quick Jump:
              </span>
              {QUICK_NAV_HUBS.map((hub) => {
                const Icon = hub.icon;
                return (
                  <button
                    key={hub.href}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.push(hub.href);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--surface-1)] hover:bg-purple-600/15 hover:text-purple-300 text-[var(--muted-foreground)] border border-[var(--border)] transition-colors cursor-pointer"
                  >
                    <Icon size={10} className="text-purple-400" />
                    <span>{hub.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Instant Navigational Jump Card (Google-style Top Knowledge Card) */}
        {navigationalJump && query && (
          <div className="mx-3 my-2 p-2.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-blue-950/40 border border-blue-500/30 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 shrink-0">
                <Zap size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-200">
                    {navigationalJump.title}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 border border-blue-500/30">
                    {navigationalJump.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
                  {navigationalJump.description}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push(navigationalJump.href);
              }}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
            >
              <span>Jump</span>
              <ChevronRight size={13} />
            </button>
          </div>
        )}

        {/* Topic Identification Spotlight Card */}
        {identifiedTopics.length > 0 && (
          <div className="p-3 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/40 border-b border-purple-500/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-purple-400 flex items-center gap-1.5">
                <Sparkles size={12} className="text-purple-400 animate-spin" />
                Topic Identified
              </span>
              <span className="text-[10px] text-purple-300/70 font-mono">Cross-Page Discovery</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {identifiedTopics.map((topic) => (
                <button
                  key={topic.key}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(topic.href);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-xs text-purple-200 transition-all group"
                >
                  <span className="text-sm">{topic.icon}</span>
                  <span className="font-semibold">{topic.label}</span>
                  <span className="text-[10px] text-purple-300/80 px-1.5 py-0.5 rounded bg-purple-900/60">
                    {topic.domain}
                  </span>
                  <ChevronRight size={13} className="text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[var(--border)] bg-[var(--surface-1)] overflow-x-auto no-scrollbar text-xs">
          <Filter size={12} className="text-[var(--muted-foreground)] shrink-0 mr-1" />
          {FILTER_TABS.map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Cross-Page Result Stats Indicator */}
        {query && Object.keys(pageCounts).length > 0 && (
          <div className="px-4 py-1.5 bg-[var(--surface-2)]/50 border-b border-[var(--border)] text-[11px] text-[var(--muted-foreground)] flex items-center justify-between">
            <span>
              Found across <strong className="text-[var(--foreground)]">{Object.keys(pageCounts).length}</strong> pages:{" "}
              {Object.entries(pageCounts)
                .slice(0, 4)
                .map(([pg, count]) => `${pg} (${count})`)
                .join(" · ")}
            </span>
            <span className="font-mono">{filteredItems.length} results</span>
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-14 text-center text-sm text-[var(--muted-foreground)] space-y-2">
              <div>No matching topics, questions, or resources found for &ldquo;{query}&rdquo;.</div>
              <div className="text-xs text-[var(--muted-foreground)]/70">
                Try searching for topic keywords like &ldquo;Spark&rdquo;, &ldquo;Airflow&rdquo;, &ldquo;Delta Lake&rdquo;, &ldquo;dbt&rdquo;, or &ldquo;Fabric&rdquo;.
              </div>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "flex items-start justify-between w-full px-3.5 py-2.5 rounded-xl text-left text-sm transition-all group",
                    isSelected
                      ? "bg-purple-600/15 text-purple-300 border border-purple-500/30 shadow-sm"
                      : "text-[var(--foreground)] hover:bg-[var(--surface-2)] border border-transparent"
                  )}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        "p-2 rounded-lg shrink-0 mt-0.5",
                        isSelected
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
                      )}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate text-[var(--foreground)] group-hover:text-purple-300 transition-colors">
                          <HighlightMatch text={item.title} query={query} />
                        </span>
                        {item.page && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--surface-3)] text-[var(--muted-foreground)] border border-[var(--border)] shrink-0">
                            {item.page}
                          </span>
                        )}
                      </div>

                      {item.snippet && (
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-0.5">
                          <HighlightMatch text={item.snippet} query={query} />
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2 mt-1">
                    {item.badge && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--surface-3)] text-[var(--muted-foreground)] border border-[var(--border)]">
                        {item.badge}
                      </span>
                    )}
                    {item.action ? (
                      item.category === "Text Size" ? (
                        <Type size={14} className="text-purple-400 opacity-80" />
                      ) : (
                        <Palette size={14} className="text-purple-400 opacity-80" />
                      )
                    ) : (
                      <ExternalLink size={14} className="text-[var(--muted-foreground)] opacity-50 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--surface-2)] border-t border-[var(--border)] text-[11px] text-[var(--muted-foreground)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] font-mono">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] font-mono">↵</kbd> open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] font-mono">ESC</kbd> close
            </span>
          </div>
          <span className="font-semibold text-purple-400/80">Universal Lakehouse Search Engine</span>
        </div>
      </div>
    </div>
  );
}
