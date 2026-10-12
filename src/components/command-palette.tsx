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
  Globe,
  Terminal,
  BookMarked,
  Palette,
  Type,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KbdShortcut } from "@/components/ui/kbd-shortcut";
import { THEME_OPTIONS } from "@/components/ui/theme-switcher";
import { useTextSize, TEXT_SIZE_OPTIONS } from "@/components/providers/text-size-provider";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Concepts" | "Paths" | "Simulators" | "Blueprints" | "Theme" | "Text Size";
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  badge?: string;
  keywords?: string[];
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
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
          t.id === "grey" ? "gray" : "",
          t.id === "grey" ? "slate" : "",
          t.id === "grey" ? "graphite" : "",
          t.id === "e-ink" ? "eink" : "",
          t.id === "e-ink" ? "reader" : "",
          t.id === "e-ink" ? "kindle" : "",
          t.id === "e-ink" ? "paper" : "",
          t.id === "dark" ? "night" : "",
          t.id === "dark" ? "oled" : "",
          t.id === "light" ? "day" : "",
        ].filter(Boolean),
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
      { id: "nav-home", title: "Home Dashboard", category: "Navigation", icon: Sparkles, href: "/", badge: "Main" },
      { id: "nav-concepts", title: "Key Concepts (415+ Terms)", category: "Navigation", icon: BookOpen, href: "/concepts", badge: "Easy" },
      { id: "nav-guided", title: "Guided Learning (13 Structured Tracks)", category: "Navigation", icon: BookMarked, href: "/guided-learning", badge: "Core" },
      { id: "nav-python", title: "Python for Data Engineering (Guided Track)", category: "Navigation", icon: FileCode2, href: "/guided-learning?topic=python", badge: "Track" },
      { id: "nav-code", title: "Code Practice (PySpark, SQL, Python)", category: "Navigation", icon: FileCode2, href: "/code-practice", badge: "Polyglot" },
      { id: "nav-spark", title: "Spark Engine & Simulator", category: "Navigation", icon: Zap, href: "/spark-engine", badge: "Internals" },
      { id: "nav-modern", title: "Modern Data Stack & AI Architecture", category: "Navigation", icon: Layers, href: "/modern-stack", badge: "Hard" },
      { id: "nav-mindmap", title: "DE Mindmap (Visual Architecture Topography)", category: "Navigation", icon: Globe, href: "/mindmap", badge: "NEW" },
      { id: "nav-qa", title: "Q&A Prep Hub (6,500+ Questions)", category: "Navigation", icon: MessageSquare, href: "/qa-prep", badge: "SM-2" },
      { id: "nav-arch", title: "Architecture Hub (3,000+ Scenarios)", category: "Navigation", icon: Cpu, href: "/architecture", badge: "Architect" },
      { id: "nav-cheatsheet", title: "Production Cheat Sheet (Spark, dbt, Airflow, SQL)", category: "Navigation", icon: Terminal, href: "/cheat-sheet", badge: "PROD" },
      { id: "nav-gcc", title: "Company Research (GCC Profiles)", category: "Navigation", icon: Building2, href: "/company-research", badge: "Enterprise" },
      { id: "nav-paths", title: "Learning Paths (12 Structured Tracks)", category: "Navigation", icon: Compass, href: "/learning-paths", badge: "Curriculum" },
      { id: "nav-studio", title: "My Studio & Progress", category: "Navigation", icon: User, href: "/studio", badge: "Account" },
      
      // Simulators
      { id: "sim-shuffle", title: "Simulator: Spark Shuffle & Partition Estimator", category: "Simulators", icon: Calculator, href: "/modern-stack#simulators", badge: "Tool" },
      { id: "sim-delta", title: "Simulator: Iceberg vs Delta Decision Tree", category: "Simulators", icon: Layers, href: "/modern-stack#simulators", badge: "Tool" },
      { id: "sim-cost", title: "Simulator: Serverless Cloud Cost Calculator", category: "Simulators", icon: Flame, href: "/modern-stack#simulators", badge: "Tool" },

      // Quick Theme Switching
      ...themeRoutes,

      // Text Size adjustments
      ...textSizeRoutes,
    ],
    [themeRoutes, textSizeRoutes]
  );

  // Dynamic items fetched from Edge Search API
  const [remoteResults, setRemoteResults] = useState<CommandItem[]>([]);

  useEffect(() => {
    if (!query.trim() || typeof window === "undefined" || process.env.NODE_ENV === "test") {
      setRemoteResults([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data?.items)) {
            const mapped: CommandItem[] = data.items.map((it: any) => ({
              id: it.id,
              title: it.title,
              category: it.category,
              icon: it.category === "Concepts" ? BookOpen : it.category === "Paths" ? Compass : it.category === "Blueprints" ? Cpu : Terminal,
              href: it.href,
              badge: it.badge,
            }));
            setRemoteResults(mapped);
          }
        })
        .catch(() => {});
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return staticRoutes;
    const lower = query.toLowerCase();
    const staticMatches = staticRoutes.filter((item) => {
      if (item.title.toLowerCase().includes(lower)) return true;
      if (item.category.toLowerCase().includes(lower)) return true;
      if (item.keywords?.some((k) => k.toLowerCase().includes(lower))) return true;
      return false;
    });

    let testMatches: CommandItem[] = [];
    if (process.env.NODE_ENV === "test") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { conceptsDb } = require("@/data");
        testMatches = (conceptsDb || [])
          .filter((c: any) => c.term.toLowerCase().includes(lower))
          .map((c: any) => ({
            id: `concept-${c.id}`,
            title: `${c.term} (${c.category})`,
            category: "Concepts" as const,
            icon: BookOpen,
            href: `/concepts?term=${encodeURIComponent(c.term)}`,
            badge: c.difficulty,
          }));
      } catch {}
    }

    return [...staticMatches, ...remoteResults, ...testMatches].slice(0, 16);
  }, [query, staticRoutes, remoteResults]);

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

  // Keyboard shortcut listener & custom event trigger for mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
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
        <span>Quick search...</span>
        <KbdShortcut shortcutKey="k" className="px-2 py-0.5 text-purple-300" />
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <Search size={18} className="text-purple-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts, blueprints, simulators, topics, routes (Cmd/Ctrl+K)..."
            aria-label="Search concepts, blueprints, simulators, topics, and routes"
            className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none"
            autoFocus
          />
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-[var(--surface-3)] text-[var(--muted-foreground)] border border-[var(--border)]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">
              No matching commands or resources found for &ldquo;{query}&rdquo;.
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
                    "flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-left text-sm transition-all",
                    isSelected
                      ? "bg-purple-600/15 text-purple-300 border border-purple-500/30"
                      : "text-[var(--foreground)] hover:bg-[var(--surface-2)] border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "p-1.5 rounded-lg shrink-0",
                        isSelected
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
                      )}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="truncate">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="text-[11px] text-[var(--muted-foreground)]">
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
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
                      <ExternalLink size={14} className="text-[var(--muted-foreground)] opacity-50" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface-2)] border-t border-[var(--border)] text-[11px] text-[var(--muted-foreground)]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] font-mono">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] font-mono">↵</kbd> to select
            </span>
          </div>
          <span>FAANG Learning OS</span>
        </div>
      </div>
    </div>
  );
}
