"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { ThemeCycleButton, ThemeSegmentedPills } from "@/components/ui/theme-switcher";
import { TextSizeQuickToggle, TextSizeSegmentedPills } from "@/components/ui/text-size-controller";
import { KbdShortcut } from "@/components/ui/kbd-shortcut";
import {
  Search,
  Menu,
  X,
  Home,
  BookOpen,
  FileCode2,
  Layers,
  MessageSquare,
  Compass,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  matches?: string[];
  subItems?: { label: string; href: string }[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Portal",
    items: [
      { label: "Home Dashboard", href: "/", icon: Home },
    ],
  },
  {
    title: "Academy Pillars",
    items: [
      {
        label: "Learning Journey",
        href: "/guided-learning",
        icon: Compass,
        badge: "The Roadmap",
        badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        matches: ["/guided-learning", "/learning-paths"],
        subItems: [
          { label: "Guided Topic Tracks", href: "/guided-learning" },
          { label: "Career Curricula", href: "/learning-paths" },
        ],
      },
      {
        label: "Concepts & Engines",
        href: "/concepts",
        icon: BookOpen,
        badge: "Foundations",
        badgeColor: "bg-green-500/10 text-green-400 border-green-500/20",
        matches: ["/concepts", "/spark-engine", "/modern-stack"],
        subItems: [
          { label: "Concepts Glossary", href: "/concepts" },
          { label: "Spark Engine Lab", href: "/spark-engine" },
          { label: "Modern Stack & FinOps", href: "/modern-stack" },
        ],
      },
      {
        label: "Architecture Hub",
        href: "/architecture",
        icon: Layers,
        badge: "Principal",
        badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        matches: ["/architecture", "/mindmap"],
        subItems: [
          { label: "System Scenarios", href: "/architecture?tab=scenarios" },
          { label: "Whiteboard Blueprints", href: "/architecture?tab=diagrams" },
          { label: "Interactive Mindmap", href: "/mindmap" },
        ],
      },
      {
        label: "Code & Runbooks",
        href: "/code-practice",
        icon: FileCode2,
        badge: "Prod Ready",
        badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        matches: ["/code-practice", "/cheat-sheet"],
        subItems: [
          { label: "Production Cheat Sheet", href: "/cheat-sheet" },
          { label: "PySpark Drills", href: "/code-practice?db=pyspark" },
          { label: "Spark SQL Drills", href: "/code-practice?db=sparksql" },
          { label: "T-SQL Drills", href: "/code-practice?db=mssql" },
          { label: "Python & Polars", href: "/code-practice?db=python" },
        ],
      },
      {
        label: "Interview Drill Hub",
        href: "/qa-prep",
        icon: MessageSquare,
        badge: "6.5k+ Qs",
        badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        matches: ["/qa-prep", "/company-research"],
        subItems: [
          { label: "Question Drill Bank", href: "/qa-prep" },
          { label: "Target Company Intel", href: "/company-research" },
        ],
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "My Studio", href: "/studio", icon: User, badge: "Personal", badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    ],
  },
];

export function MobileHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(drawerRef, drawerOpen, () => setDrawerOpen(false));

  // Close drawer on navigation
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

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
            className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors shrink-0"
            aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              DP
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-semibold text-[var(--foreground)] leading-tight truncate">
                MS Data Platform
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
            className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors"
            aria-label="Search all content and concepts"
            title="Search"
          >
            <Search size={18} />
          </button>

          <TextSizeQuickToggle size={18} />

          <ThemeCycleButton size={18} />
        </div>
      </header>

      {/* Slide-over Mobile Navigation Drawer */}
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
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  DP
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--foreground)]">Navigation Menu</div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">Explore learning hubs</div>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
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
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <span className="flex items-center gap-2">
                  <Search size={14} />
                  <span>Search all topics &amp; code...</span>
                </span>
                <KbdShortcut shortcutKey="k" className="bg-[var(--surface-3)]" />
              </button>
            </div>

            {/* Nav Groups List */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-none">
              {navGroups.map((group) => (
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
                            className={cn(
                              "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all",
                              active
                                ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-500/20"
                                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={16} className={cn(active ? "text-white" : "text-purple-400")} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={cn(
                                  "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                                  active ? "bg-white/20 text-white border-white/30" : item.badgeColor
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>

                          {active && item.subItems && (
                            <div className="ml-6 my-1 space-y-0.5 border-l border-[var(--border)] pl-2.5">
                              {item.subItems.map((sub) => {
                                const isSubActive = pathname === sub.href.split("?")[0];
                                return (
                                  <Link
                                    key={sub.href}
                                    href={sub.href}
                                    className={cn(
                                      "block px-2 py-1 text-xs rounded-lg transition-colors truncate",
                                      isSubActive
                                        ? "text-purple-400 font-semibold bg-purple-500/10"
                                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                                    )}
                                  >
                                    {sub.label}
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
