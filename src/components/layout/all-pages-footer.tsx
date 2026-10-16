"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_GROUPS, isSubHrefActive } from "@/data/navigation-data";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { TextSizeController } from "@/components/ui/text-size-controller";
import { Sparkles, Terminal, ArrowUp, Search, Compass, BookOpen, Layers, FileCode2, Workflow, MessageSquare } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

function AllPagesFooterInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <footer
      className="mt-16 border-t-2 border-[var(--border)] bg-[var(--surface-1)] text-[var(--foreground)]"
      role="contentinfo"
      aria-label="Site Navigation Footer"
    >
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
        {/* Top Header / Portal Branding & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-[var(--border)]">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <BrandLogo size={36} className="rounded-xl shadow-md" />
              <div>
                <h3 className="font-extrabold text-base tracking-tight text-[var(--foreground)]">
                  DataPlatform Architect
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Enterprise Fabric, Databricks &amp; Lakehouse Prep · 6,500+ Architecture Drills
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openSearch}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
            >
              <Search size={14} />
              <span>Search Concepts &amp; Drills</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] border border-[var(--border)] text-[10px] font-mono">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
            >
              <ArrowUp size={14} />
              <span>Top</span>
            </button>
          </div>
        </div>

        {/* All Pages & Subpages Grid — Always Visible on All Layouts */}
        <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
          {NAV_GROUPS.flatMap((g) => g.items).filter((item) => item.href !== "/").map((pillar) => {
            const Icon = pillar.icon;
            const isPillarActive =
              (pillar.href === "/" && pathname === "/") ||
              (pillar.href !== "/" && pathname?.startsWith(pillar.href)) ||
              Boolean(pillar.matches?.some((m) => pathname?.startsWith(m)));

            return (
              <div key={pillar.href} className="space-y-3">
                <Link
                  href={pillar.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-bold transition-colors group",
                    isPillarActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-[var(--foreground)] hover:text-blue-500"
                  )}
                >
                  <Icon size={16} className={cn(isPillarActive ? "text-blue-500" : "text-[var(--muted-foreground)] group-hover:text-blue-500")} />
                  <span>{pillar.label}</span>
                </Link>

                {pillar.subItems && (
                  <ul className="space-y-1.5 pl-3 border-l border-[var(--border)]">
                    {pillar.subItems.map((sub) => {
                      const active = isSubHrefActive(pathname, searchParams, sub.href);
                      return (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            className={cn(
                              "flex items-center justify-between text-xs py-1 px-1.5 rounded-md transition-colors",
                              active
                                ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-500/10"
                                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                            )}
                          >
                            <span className="truncate">{sub.label}</span>
                            {sub.badge && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                                {sub.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Accessibility & Theme Controller Strip */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted-foreground)]">
          <div className="flex flex-wrap items-center gap-4">
            <span>© 2026 DataPlatform Architect</span>
            <span>•</span>
            <Link href="/" className="hover:text-[var(--foreground)]">Home</Link>
            <Link href="/concepts" className="hover:text-[var(--foreground)]">Concepts</Link>
            <Link href="/architecture" className="hover:text-[var(--foreground)]">Architecture</Link>
            <Link href="/qa-prep" className="hover:text-[var(--foreground)]">Interview Hub</Link>
            <Link href="/studio" className="hover:text-[var(--foreground)]">Studio</Link>
          </div>

          <div className="flex items-center gap-3">
            <TextSizeController collapsed={false} direction="up" align="end" />
            <ThemeSwitcher collapsed={false} direction="up" align="end" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export function AllPagesFooter() {
  return (
    <Suspense fallback={null}>
      <AllPagesFooterInner />
    </Suspense>
  );
}
