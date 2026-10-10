"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  FileCode2,
  Layers,
  MessageSquare,
  Compass,
  User,
  Sun,
  Moon,
  ChevronLeft,
} from "lucide-react";

interface SubNavItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  pill?: { text: string; variant: "easy" | "medium" | "hard" | "architect" | "new" | "info" };
  matches?: string[];
  subItems?: SubNavItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Portal",
    items: [
      { label: "Home", href: "/", icon: Home },
      {
        label: "Learning Journey",
        href: "/learning-paths",
        icon: Compass,
        pill: { text: "The Map", variant: "info" },
        matches: ["/learning-paths", "/guided-learning", "/diagnostic"],
        subItems: [
          { label: "Career Curricula", href: "/learning-paths" },
          { label: "Guided Topics", href: "/guided-learning" },
          { label: "Diagnostic Exam", href: "/diagnostic" },
        ],
      },
    ],
  },
  {
    title: "Knowledge Base",
    items: [
      {
        label: "Key Concepts & Engines",
        href: "/concepts",
        icon: BookOpen,
        pill: { text: "Foundations", variant: "easy" },
        matches: ["/concepts", "/spark-engine", "/modern-stack"],
        subItems: [
          { label: "Glossary Concepts", href: "/concepts" },
          { label: "Spark Engine", href: "/spark-engine" },
          { label: "Modern Data Stack", href: "/modern-stack" },
        ],
      },
    ],
  },
  {
    title: "Architectural Mastery",
    items: [
      {
        label: "Architecture Hub",
        href: "/architecture",
        icon: Layers,
        pill: { text: "Principal", variant: "architect" },
        matches: ["/architecture", "/mindmap"],
        subItems: [
          { label: "System Scenarios", href: "/architecture" },
          { label: "Blueprints Gallery", href: "/architecture?tab=diagrams" },
          { label: "DE Mindmap", href: "/mindmap" },
        ],
      },
      {
        label: "Code & Cheat Sheet",
        href: "/code-practice",
        icon: FileCode2,
        pill: { text: "Prod Ready", variant: "medium" },
        matches: ["/code-practice", "/cheat-sheet"],
        subItems: [
          { label: "Practice Snippets", href: "/code-practice" },
          { label: "Cheat Sheet", href: "/cheat-sheet" },
        ],
      },
    ],
  },
  {
    title: "Interview & Prep",
    items: [
      {
        label: "Q&A Prep Hub",
        href: "/qa-prep",
        icon: MessageSquare,
        pill: { text: "6.4k+ Qs", variant: "hard" },
        matches: ["/qa-prep", "/company-research"],
        subItems: [
          { label: "Question Drill", href: "/qa-prep" },
          { label: "Company Intel", href: "/company-research" },
        ],
      },
    ],
  },
  {
    title: "Studio",
    items: [
      { label: "My Studio", href: "/studio", icon: User },
    ],
  },
];

const pillVariants: Record<string, string> = {
  easy: "bg-green-500/10 text-green-400 border-green-500/20",
  medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  hard: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  architect: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  new: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const isItemActive = (item: NavItem) => {
    if (!pathname) return false;
    if (item.href === "/") return pathname === "/";
    if (pathname.startsWith(item.href)) return true;
    if (item.matches && item.matches.some((m) => pathname.startsWith(m))) return true;
    return false;
  };

  const isSubActive = (subHref: string) => {
    if (!pathname) return false;
    const [subPath] = subHref.split("?");
    return pathname === subPath;
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-dvh sticky top-0 border-r transition-all duration-300 ease-in-out",
        "bg-[var(--surface-1)] border-[var(--border)]",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-[var(--border)] shrink-0",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              DP
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-[var(--foreground)] truncate">
                MS Data Platform
              </h1>
              <span className="text-[10px] font-medium text-[var(--muted-foreground)]">
                Architect Prep
              </span>
            </div>
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          className={cn(
            "p-1.5 rounded-lg hover:bg-[var(--surface-3)] transition-colors",
            "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            size={16}
            className={cn(
              "transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-none">
        {navGroups.map((group, gi) => (
          <div key={gi} className={cn(gi > 0 && "mt-3.5")}>
            {group.title && !collapsed && (
              <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                {group.title}
              </div>
            )}
            {group.title && collapsed && gi > 0 && (
              <div className="mx-3 mb-2 border-t border-[var(--border)]" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isItemActive(item);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                        "hover:bg-[var(--surface-3)]",
                        active
                          ? "bg-purple-500/10 text-purple-400 font-semibold shadow-[inset_2px_0_0_rgb(139,92,246)]"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                        collapsed && "justify-center px-0"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="truncate flex-1">{item.label}</span>
                          {item.pill && (
                            <span
                              className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 leading-tight",
                                pillVariants[item.pill.variant]
                              )}
                            >
                              {item.pill.text}
                            </span>
                          )}
                        </>
                      )}
                    </Link>

                    {/* Clean sub-navigation reveals when item is active in expanded mode */}
                    {active && !collapsed && item.subItems && (
                      <ul className="ml-7 my-1 space-y-0.5 border-l border-[var(--border)] pl-2.5 animate-in fade-in duration-150">
                        {item.subItems.map((sub) => {
                          const subActive = isSubActive(sub.href);
                          return (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className={cn(
                                  "block px-2 py-1 text-xs rounded-lg transition-colors truncate",
                                  subActive
                                    ? "text-purple-400 bg-purple-500/10 font-semibold"
                                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                                )}
                              >
                                {sub.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — Theme toggle */}
      <div className="p-3 border-t border-[var(--border)] shrink-0">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors",
            "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]",
            collapsed && "justify-center px-0"
          )}
          aria-label="Toggle theme"
        >
          {mounted && (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />)}
          {!collapsed && <span>{mounted ? (theme === "dark" ? "Light Theme" : "Dark Theme") : "Theme"}</span>}
        </button>
      </div>
    </aside>
  );
}
