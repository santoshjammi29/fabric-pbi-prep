"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Search,
  Menu,
  X,
  Home,
  BookOpen,
  Code2,
  FileCode2,
  Zap,
  Layers,
  Globe,
  MessageSquare,
  Building2,
  Compass,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavGroup {
  title: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Home Dashboard", href: "/", icon: Home }],
  },
  {
    title: "Learn & Code",
    items: [
      { label: "Key Concepts", href: "/concepts", icon: BookOpen, badge: "Easy", badgeColor: "bg-green-500/10 text-green-400 border-green-500/20" },
      { label: "Python Hub", href: "/python", icon: Code2, badge: "NEW", badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
      { label: "Code Practice", href: "/code-practice", icon: FileCode2, badge: "Medium", badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
      { label: "Spark Engine", href: "/spark-engine", icon: Zap, badge: "Medium", badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
      { label: "Modern Data Stack", href: "/modern-stack", icon: Layers, badge: "Hard", badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
      { label: "DE Mindmap", href: "/mindmap", icon: Globe, badge: "NEW", badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
    ],
  },
  {
    title: "Practice & Scenarios",
    items: [
      { label: "Q&A Prep Hub", href: "/qa-prep", icon: MessageSquare, badge: "2.6k Qs", badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
      { label: "Architecture Hub", href: "/architecture", icon: Layers, badge: "Architect", badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
      { label: "Company Research", href: "/company-research", icon: Building2, badge: "GCC", badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    ],
  },
  {
    title: "Account & Paths",
    items: [
      { label: "Learning Paths", href: "/learning-paths", icon: Compass, badge: "12 Paths", badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
      { label: "My Studio", href: "/studio", icon: User },
    ],
  },
];

export function MobileHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
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

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors"
            aria-label="Toggle light and dark theme"
            title="Toggle theme"
          >
            {mounted && (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />)}
          </button>
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
          <div className="relative w-[85%] max-w-sm bg-[var(--surface-1)] border-r border-[var(--border)] h-full flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-250">
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  DP
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--foreground)]">Navigation Menu</div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">Explore all 11+ modules</div>
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
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-3)]">⌘K</kbd>
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
                      const active = isActive(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
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
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between text-xs">
              <span className="text-[var(--muted-foreground)]">Theme:</span>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-[var(--foreground)]"
              >
                {theme === "dark" ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-purple-400" />}
                <span className="capitalize">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
