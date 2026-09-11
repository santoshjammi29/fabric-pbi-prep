"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  Code2,
  FileCode2,
  Zap,
  Layers,
  MessageSquare,
  Globe,
  User,
  LayoutGrid,
} from "lucide-react";

// 4 Core tabs on small mobile screens (< 640px)
const mobileCoreTabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Concepts", href: "/concepts", icon: BookOpen },
  { label: "Python", href: "/python", icon: Code2, isNew: true },
  { label: "Q&A", href: "/qa-prep", icon: MessageSquare, badge: "6.1k" },
];

// Extended tabs on tablet screens (640px - 1023px)
const tabletTabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Concepts", href: "/concepts", icon: BookOpen },
  { label: "Python", href: "/python", icon: Code2, isNew: true },
  { label: "Code", href: "/code-practice", icon: FileCode2 },
  { label: "Spark", href: "/spark-engine", icon: Zap },
  { label: "Modern", href: "/modern-stack", icon: Layers },
  { label: "Q&A", href: "/qa-prep", icon: MessageSquare },
  { label: "Arch", href: "/architecture", icon: Layers },
  { label: "Mindmap", href: "/mindmap", icon: Globe, isNew: true },
  { label: "Studio", href: "/studio", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isOtherActive =
    !isActive("/") &&
    !isActive("/concepts") &&
    !isActive("/python") &&
    !isActive("/qa-prep");

  const openDrawer = () => {
    window.dispatchEvent(new CustomEvent("open-mobile-menu"));
  };

  return (
    <nav
      className={cn(
        "lg:hidden fixed bottom-0 inset-x-0 z-50",
        "bg-[var(--glass-bg)] backdrop-blur-2xl border-t border-[var(--glass-border)] shadow-2xl",
        "safe-area-pb"
      )}
      aria-label="Mobile Navigation"
    >
      {/* ── Compact Mobile Layout (< 640px): 5 Perfect Equal Columns, Zero Clipping ── */}
      <div className="flex sm:hidden items-center justify-around px-1 py-1">
        {mobileCoreTabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 min-h-[48px] rounded-xl transition-all relative touch-manipulation",
                active
                  ? "text-purple-400 font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:scale-95"
              )}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {tab.isNew && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-cyan-500 text-[8px] font-extrabold text-white uppercase tracking-tighter leading-none">
                    NEW
                  </span>
                )}
                {tab.badge && (
                  <span className="absolute -top-1 -right-3 px-1 py-0.2 rounded-full bg-orange-500/80 text-[8px] font-extrabold text-white leading-none">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none mt-1 whitespace-nowrap">
                {tab.label}
              </span>
              {active && (
                <span className="absolute bottom-0.5 w-4 h-0.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              )}
            </Link>
          );
        })}

        {/* 5th Tab: Explore All 11+ Modules Button */}
        <button
          type="button"
          onClick={openDrawer}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 min-h-[48px] rounded-xl transition-all relative touch-manipulation",
            isOtherActive
              ? "text-purple-400 font-semibold"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:scale-95"
          )}
          aria-label="Open all modules menu"
        >
          <div className="relative">
            <LayoutGrid size={20} strokeWidth={isOtherActive ? 2.5 : 1.8} />
            <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-purple-500 text-[8px] font-extrabold text-white leading-none">
              11+
            </span>
          </div>
          <span className="text-[10px] font-medium leading-none mt-1 whitespace-nowrap">
            Explore
          </span>
          {isOtherActive && (
            <span className="absolute bottom-0.5 w-4 h-0.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
          )}
        </button>
      </div>

      {/* ── Tablet Layout (640px to 1023px): Extended Module Tabs with Breathing Room ── */}
      <div className="hidden sm:flex items-center justify-between overflow-x-auto scrollbar-none px-2 py-1 max-w-5xl mx-auto">
        {tabletTabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all relative touch-manipulation shrink-0",
                active
                  ? "text-purple-400 font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:scale-95"
              )}
            >
              <div className="relative">
                <Icon size={19} strokeWidth={active ? 2.5 : 1.8} />
                {tab.isNew && (
                  <span className="absolute -top-1 -right-2.5 px-1 py-0.2 rounded-full bg-cyan-500 text-[8px] font-extrabold text-white uppercase leading-none">
                    NEW
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none mt-1 whitespace-nowrap">
                {tab.label}
              </span>
              {active && (
                <span className="absolute bottom-0.5 w-4 h-0.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              )}
            </Link>
          );
        })}

        {/* More Button on Tablet to trigger full drawer */}
        <button
          type="button"
          onClick={openDrawer}
          className="flex flex-col items-center justify-center py-1.5 px-2 min-h-[48px] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:scale-95 transition-all shrink-0"
          aria-label="Open full drawer menu"
        >
          <LayoutGrid size={19} strokeWidth={1.8} />
          <span className="text-[10px] font-medium leading-none mt-1 whitespace-nowrap">
            All (11+)
          </span>
        </button>
      </div>
    </nav>
  );
}
