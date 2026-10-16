"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { ThemeCycleButton, ThemeSegmentedPills } from "@/components/ui/theme-switcher";
import { TextSizeQuickToggle, TextSizeSegmentedPills } from "@/components/ui/text-size-controller";
import { KbdShortcut } from "@/components/ui/kbd-shortcut";
import { Search, Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/lib/utils";
import { NAV_GROUPS, isSubHrefActive } from "@/data/navigation-data";

const badgeVariants: Record<string, string> = {
  easy: "bg-green-500/10 text-green-400 border-green-500/20",
  medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  hard: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  architect: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  new: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

function MobileHeaderInner() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const drawerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(drawerRef, drawerOpen, () => setDrawerOpen(false));

  // Close drawer on navigation
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname, searchParams]);

  // Listen for open-mobile-menu event from mobile bottom nav
  useEffect(() => {
    const handleOpenMenu = () => setDrawerOpen(true);
    window.addEventListener("open-mobile-menu", handleOpenMenu);
    return () => window.removeEventListener("open-mobile-menu", handleOpenMenu);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  const isSubActive = (subHref: string) => {
    return isSubHrefActive(pathname, searchParams, subHref);
  };

  return (
    <>
      <header
        className={cn(
          "lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-3 sm:px-4",
          "bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)]"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors shrink-0 cursor-pointer"
            aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 min-w-0" title="DataPlatform Architect">
            <BrandLogo size={28} className="rounded-lg shadow-xs" />
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-[var(--foreground)] leading-tight truncate">
                DataPlatform
              </h2>
              <span className="text-[9px] sm:text-[10px] font-medium text-[var(--muted-foreground)] block -mt-0.5">
                Architect Prep
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={openSearch}
            className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
            aria-label="Search all content and concepts"
            title="Search"
          >
            <Search size={18} />
          </button>

          <TextSizeQuickToggle size={18} />

          <ThemeCycleButton size={18} />
        </div>
      </header>

      {/* Slide-over Mobile Navigation Drawer — All Pages & Subpages Always Visible */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
            className="relative w-[85%] max-w-sm bg-[var(--surface-1)] border-r border-[var(--border)] h-full flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-250"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <BrandLogo size={28} className="rounded-lg shadow-xs" />
                <div>
                  <div className="text-xs font-bold text-[var(--foreground)]">DataPlatform Architect</div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">Enterprise Learning System</div>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] cursor-pointer"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Search Button in Drawer */}
            <div className="p-3 border-b border-[var(--border)]">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  openSearch();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Search size={14} />
                  <span>Search all topics &amp; code...</span>
                </span>
                <KbdShortcut shortcutKey="k" className="bg-[var(--surface-3)]" />
              </button>
            </div>

            {/* Nav Groups List — All Pages and Subpages Permanently Visible */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-none">
              {NAV_GROUPS.map((group) => (
                <div key={group.title} className="space-y-1">
                  <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                    {group.title}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const active =
                        (item.href === "/" && pathname === "/") ||
                        (item.href !== "/" && pathname?.startsWith(item.href)) ||
                        Boolean(item.matches?.some((m) => pathname?.startsWith(m)));
                      const Icon = item.icon;
                      return (
                        <div key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setDrawerOpen(false)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all",
                              active
                                ? "bg-blue-600 text-white font-semibold shadow-xs"
                                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon size={16} className={cn(active ? "text-white" : "text-blue-500 dark:text-blue-400 shrink-0")} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {item.pill && (
                              <span
                                className={cn(
                                  "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                                  active ? "bg-white/20 text-white border-white/30" : badgeVariants[item.pill.variant]
                                )}
                              >
                                {item.pill.text}
                              </span>
                            )}
                          </Link>

                          {/* All sub-navigation items ALWAYS visible in mobile drawer */}
                          {item.subItems && (
                            <div className="ml-5 my-1 space-y-0.5 border-l-2 border-[var(--border)] pl-3">
                              {item.subItems.map((sub) => {
                                const subActive = isSubActive(sub.href);
                                return (
                                  <Link
                                    key={sub.href}
                                    href={sub.href}
                                    onClick={() => setDrawerOpen(false)}
                                    className={cn(
                                      "flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors truncate",
                                      subActive
                                        ? "text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10"
                                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "w-1.5 h-1.5 rounded-full shrink-0",
                                        subActive
                                          ? "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]"
                                          : "bg-[var(--muted-foreground)]/40"
                                      )}
                                    />
                                    <span className="truncate flex-1">{sub.label}</span>
                                    {sub.badge && (
                                      <span
                                        className={cn(
                                          "text-[9px] px-1.5 py-0.2 rounded font-medium",
                                          subActive
                                            ? "bg-blue-600/20 text-blue-600 dark:text-blue-300"
                                            : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
                                        )}
                                      >
                                        {sub.badge}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-2)] space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs px-1 mb-1.5">
                  <span className="font-semibold text-[var(--foreground)]">Text Size</span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">Readability &amp; Scale</span>
                </div>
                <TextSizeSegmentedPills />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs px-1 mb-1.5">
                  <span className="font-semibold text-[var(--foreground)]">Theme</span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">4 appearance modes</span>
                </div>
                <ThemeSegmentedPills />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function MobileHeader() {
  return (
    <Suspense
      fallback={
        <header
          className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-3 sm:px-4 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)]"
          aria-hidden="true"
        />
      }
    >
      <MobileHeaderInner />
    </Suspense>
  );
}
