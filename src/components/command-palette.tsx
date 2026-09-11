"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { conceptsDb, learningPathsDb, modernBlueprintsDb } from "@/data";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Concepts" | "Paths" | "Simulators" | "Blueprints";
  icon: React.ElementType;
  href: string;
  badge?: string;
  keywords?: string[];
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Static navigation routes
  const staticRoutes: CommandItem[] = useMemo(
    () => [
      { id: "nav-home", title: "Home Dashboard", category: "Navigation", icon: Sparkles, href: "/", badge: "Main" },
      { id: "nav-concepts", title: "Key Concepts (112+ Terms)", category: "Navigation", icon: BookOpen, href: "/concepts", badge: "Easy" },
      { id: "nav-python", title: "Python Hub (Data Engineering & Architect)", category: "Navigation", icon: FileCode2, href: "/python", badge: "NEW" },
      { id: "nav-code", title: "Code Practice (PySpark, SQL, Python)", category: "Navigation", icon: FileCode2, href: "/code-practice", badge: "Polyglot" },
      { id: "nav-spark", title: "Spark Engine & Simulator", category: "Navigation", icon: Zap, href: "/spark-engine", badge: "Internals" },
      { id: "nav-modern", title: "Modern Data Stack & AI Architecture", category: "Navigation", icon: Layers, href: "/modern-stack", badge: "Hard" },
      { id: "nav-mindmap", title: "DE Mindmap (Visual Architecture Topography)", category: "Navigation", icon: Globe, href: "/mindmap", badge: "NEW" },
      { id: "nav-qa", title: "Q&A Prep Hub (6,100+ Questions)", category: "Navigation", icon: MessageSquare, href: "/qa-prep", badge: "SM-2" },
      { id: "nav-arch", title: "Architecture Hub (2,400+ Scenarios)", category: "Navigation", icon: Cpu, href: "/architecture", badge: "Architect" },
      { id: "nav-gcc", title: "Company Research (GCC Profiles)", category: "Navigation", icon: Building2, href: "/company-research", badge: "Enterprise" },
      { id: "nav-paths", title: "Learning Paths (12 Structured Tracks)", category: "Navigation", icon: Compass, href: "/learning-paths", badge: "Curriculum" },
      { id: "nav-studio", title: "My Studio & Progress", category: "Navigation", icon: User, href: "/studio", badge: "Account" },
      
      // Simulators
      { id: "sim-shuffle", title: "Simulator: Spark Shuffle & Partition Estimator", category: "Simulators", icon: Calculator, href: "/modern-stack#simulators", badge: "Tool" },
      { id: "sim-delta", title: "Simulator: Iceberg vs Delta Decision Tree", category: "Simulators", icon: Layers, href: "/modern-stack#simulators", badge: "Tool" },
      { id: "sim-cost", title: "Simulator: Serverless Cloud Cost Calculator", category: "Simulators", icon: Flame, href: "/modern-stack#simulators", badge: "Tool" },
    ],
    []
  );

  // Dynamic items from datasets
  const dynamicItems: CommandItem[] = useMemo(() => {
    const conceptItems: CommandItem[] = conceptsDb.slice(0, 50).map((c) => ({
      id: `concept-${c.id}`,
      title: `${c.term} (${c.category})`,
      category: "Concepts",
      icon: BookOpen,
      href: `/concepts?term=${encodeURIComponent(c.term)}`,
      badge: c.difficulty,
      keywords: [c.definition, c.explanation],
    }));

    const pathItems: CommandItem[] = learningPathsDb.map((p) => ({
      id: `path-${p.id}`,
      title: `${p.title} (${p.weeks} Weeks)`,
      category: "Paths",
      icon: Compass,
      href: `/learning-paths?id=${p.id}`,
      badge: `${p.weeks}w`,
      keywords: p.skills,
    }));

    const blueprintItems: CommandItem[] = modernBlueprintsDb.map((b) => ({
      id: `bp-${b.id}`,
      title: b.title,
      category: "Blueprints",
      icon: Cpu,
      href: `/modern-stack#blueprints`,
      badge: b.category,
      keywords: b.tags,
    }));

    return [...staticRoutes, ...conceptItems, ...pathItems, ...blueprintItems];
  }, [staticRoutes]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return staticRoutes;
    const lower = query.toLowerCase();
    return dynamicItems
      .filter((item) => {
        if (item.title.toLowerCase().includes(lower)) return true;
        if (item.category.toLowerCase().includes(lower)) return true;
        if (item.keywords?.some((k) => k.toLowerCase().includes(lower))) return true;
        return false;
      })
      .slice(0, 15);
  }, [query, staticRoutes, dynamicItems]);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      setIsOpen(false);
      setQuery("");
      router.push(item.href);
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-40 hidden md:flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-purple-500/40 shadow-xl transition-all hover:scale-105 group"
        aria-label="Open Command Palette (Cmd+K)"
      >
        <Search size={14} className="text-purple-400 group-hover:rotate-12 transition-transform" />
        <span>Quick search...</span>
        <kbd className="px-2 py-0.5 rounded bg-[var(--surface-3)] text-[10px] font-mono font-semibold text-purple-300 border border-[var(--border)]">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div className="w-full max-w-2xl bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <Search size={18} className="text-purple-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts, blueprints, simulators, topics, routes (⌘K)..."
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
                    <ExternalLink size={14} className="text-[var(--muted-foreground)] opacity-50" />
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
