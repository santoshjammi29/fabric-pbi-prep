"use client";

import React, { useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ALL_FLAT_PAGES_AND_SUBPAGES,
  NAV_GROUPS,
  isSubHrefActive,
  FlatNavPage,
} from "@/data/navigation-data";
import { ChevronRight, Compass, Sparkles, Search } from "lucide-react";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; activeBg: string; activeText: string }> = {
  Portal: {
    bg: "bg-blue-500/10",
    text: "text-blue-500 dark:text-blue-400",
    border: "border-blue-500/20",
    activeBg: "bg-blue-600",
    activeText: "text-white",
  },
  Journey: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-500 dark:text-indigo-400",
    border: "border-indigo-500/20",
    activeBg: "bg-indigo-600",
    activeText: "text-white",
  },
  Concepts: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500 dark:text-emerald-400",
    border: "border-emerald-500/20",
    activeBg: "bg-emerald-600",
    activeText: "text-white",
  },
  Architecture: {
    bg: "bg-purple-500/10",
    text: "text-purple-500 dark:text-purple-400",
    border: "border-purple-500/20",
    activeBg: "bg-purple-600",
    activeText: "text-white",
  },
  Code: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-500 dark:text-cyan-400",
    border: "border-cyan-500/20",
    activeBg: "bg-cyan-600",
    activeText: "text-white",
  },
  DataOps: {
    bg: "bg-blue-500/10",
    text: "text-blue-500 dark:text-blue-400",
    border: "border-blue-500/20",
    activeBg: "bg-blue-600",
    activeText: "text-white",
  },
  Interview: {
    bg: "bg-amber-500/10",
    text: "text-amber-500 dark:text-amber-400",
    border: "border-amber-500/20",
    activeBg: "bg-amber-600",
    activeText: "text-white",
  },
  Workspace: {
    bg: "bg-rose-500/10",
    text: "text-rose-500 dark:text-rose-400",
    border: "border-rose-500/20",
    activeBg: "bg-rose-600",
    activeText: "text-white",
  },
};

function AllPagesNavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeChipRef = useRef<HTMLAnchorElement>(null);

  // Auto-scroll active subpage chip into view when navigating
  useEffect(() => {
    if (activeChipRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const chip = activeChipRef.current;
      const chipLeft = chip.offsetLeft;
      const chipWidth = chip.offsetWidth;
      const containerWidth = container.offsetWidth;
      container.scrollTo({
        left: chipLeft - containerWidth / 2 + chipWidth / 2,
        behavior: "smooth",
      });
    }
  }, [pathname, searchParams]);

  const openSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-command-palette"));
    }
  };

  return (
    <nav
      className="w-full bg-[var(--surface-1)] border-b border-[var(--border)] shadow-xs select-none"
      aria-label="Universal Pages and Subpages Navigation"
    >
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-3 sm:px-6 lg:px-8 py-2 space-y-2">
        {/* Tier 0: Standard Universal Search Bar Across All Pages & Subpages */}
        <div>
          <button
            type="button"
            onClick={openSearch}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-blue-500/40 text-left transition-all duration-150 group shadow-2xs cursor-pointer"
            aria-label="Universal search across all Q&As, concepts, architecture blueprints, and topics"
          >
            <div className="flex items-center gap-2.5 min-w-0 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
              <Search size={15} className="shrink-0 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium truncate">
                Search 6,500+ Q&As, concepts, architecture blueprints, system design...
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-[var(--muted-foreground)]">
                Universal Search
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-[var(--surface-1)] text-[var(--muted-foreground)] border border-[var(--border)] shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Tier 1: All Primary Pillars Header Strip */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-0.5">
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted-foreground)] px-1.5 py-0.5 rounded bg-[var(--surface-2)] shrink-0">
              <Compass size={12} className="text-blue-500" />
              <span>All Hubs</span>
            </span>

            {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
              const Icon = item.icon;
              const isHome = item.href === "/";
              const active = isHome
                ? pathname === "/"
                : (pathname?.startsWith(item.href) ||
                   Boolean(item.matches?.some((m) => pathname?.startsWith(m))));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0",
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                  )}
                >
                  <Icon size={13} className={cn(active ? "text-white" : "opacity-75")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tier 2: All Subpages Always-Visible Horizontal Track */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] shrink-0">
            <span>Subpages:</span>
          </span>

          <div
            ref={scrollContainerRef}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {ALL_FLAT_PAGES_AND_SUBPAGES.filter((p) => p.href !== "/").map((page) => {
              const active = isSubHrefActive(pathname, searchParams, page.href);
              const Icon = page.icon;
              const color = CATEGORY_COLORS[page.category] || CATEGORY_COLORS.Portal;

              return (
                <Link
                  key={page.id}
                  ref={active ? activeChipRef : undefined}
                  href={page.href}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all shrink-0 whitespace-nowrap border",
                    active
                      ? `${color.activeBg} ${color.activeText} font-bold shadow-xs border-transparent`
                      : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] border-[var(--border)]"
                  )}
                  title={`${page.category}: ${page.label}`}
                >
                  <Icon size={12} className={cn(active ? "text-white" : color.text)} />
                  <span>{page.shortLabel}</span>
                  {page.badge && (
                    <span
                      className={cn(
                        "text-[9px] font-semibold px-1 py-0.2 rounded-full leading-none",
                        active ? "bg-white/20 text-white" : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
                      )}
                    >
                      {page.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function AllPagesNav() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-16 bg-[var(--surface-1)] border-b border-[var(--border)] animate-pulse" />
      }
    >
      <AllPagesNavInner />
    </Suspense>
  );
}
