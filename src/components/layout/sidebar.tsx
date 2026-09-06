"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  Code2,
  Zap,
  Layers,
  Globe,
  MessageSquare,
  Building2,
  Compass,
  User,
  Sun,
  Moon,
  ChevronLeft,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  pill?: { text: string; variant: "easy" | "medium" | "hard" | "architect" | "new" | "info" };
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "",
    items: [
      { label: "Home", href: "/", icon: Home },
    ],
  },
  {
    title: "Learn",
    items: [
      { label: "Key Concepts", href: "/concepts", icon: BookOpen, pill: { text: "Easy", variant: "easy" } },
      { label: "Code Practice", href: "/code-practice", icon: FileCode2, pill: { text: "Medium", variant: "medium" } },
      { label: "Spark Engine", href: "/spark-engine", icon: Zap, pill: { text: "Medium", variant: "medium" } },
      { label: "Modern Data Stack", href: "/modern-stack", icon: Layers, pill: { text: "Hard", variant: "hard" } },
      { label: "DE Mindmap", href: "/mindmap", icon: Globe, pill: { text: "NEW", variant: "new" } },
      { label: "Python Hub", href: "/python", icon: Code2, pill: { text: "NEW", variant: "new" } },
    ],
  },
  {
    title: "Practice",
    items: [
      { label: "Q&A Prep Hub", href: "/qa-prep", icon: MessageSquare, pill: { text: "Hard", variant: "hard" } },
    ],
  },
  {
    title: "Explore",
    items: [
      { label: "Architecture Hub", href: "/architecture", icon: Layers, pill: { text: "Architect", variant: "architect" } },
      { label: "Company Research", href: "/company-research", icon: Building2, pill: { text: "Research", variant: "easy" } },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Learning Paths", href: "/learning-paths", icon: Compass, pill: { text: "12 Paths", variant: "info" } },
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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
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
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-[var(--border)] shrink-0",
        collapsed ? "justify-center" : "justify-between"
      )}>
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
          <div key={gi} className={cn(gi > 0 && "mt-4")}>
            {group.title && !collapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                {group.title}
              </div>
            )}
            {group.title && collapsed && gi > 0 && (
              <div className="mx-3 mb-2 border-t border-[var(--border)]" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                        "hover:bg-[var(--surface-3)]",
                        active
                          ? "bg-purple-500/10 text-purple-400 shadow-[inset_2px_0_0_rgb(139,92,246)]"
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
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                                pillVariants[item.pill.variant]
                              )}
                            >
                              {item.pill.text}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
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
