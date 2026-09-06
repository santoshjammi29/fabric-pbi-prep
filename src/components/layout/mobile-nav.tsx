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
  Building2,
  Menu,
} from "lucide-react";

const tabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Concepts", href: "/concepts", icon: BookOpen },
  { label: "Python", href: "/python", icon: Code2 },
  { label: "Code", href: "/code-practice", icon: FileCode2 },
  { label: "Spark", href: "/spark-engine", icon: Zap },
  { label: "Modern", href: "/modern-stack", icon: Layers },
  { label: "Q&A", href: "/qa-prep", icon: MessageSquare },
  { label: "Arch", href: "/architecture", icon: Layers },
  { label: "GCC", href: "/company-research", icon: Building2 },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const openDrawer = () => {
    window.dispatchEvent(new CustomEvent("open-mobile-menu"));
  };

  return (
    <nav
      className={cn(
        "lg:hidden fixed bottom-0 inset-x-0 z-50",
        "bg-[var(--glass-bg)] backdrop-blur-xl border-t border-[var(--glass-border)]",
        "safe-area-pb"
      )}
      aria-label="Main navigation"
    >
      <div className="flex overflow-x-auto scrollbar-none px-1">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[58px] sm:min-w-[64px] flex-1 py-2 px-1 gap-0.5 transition-colors shrink-0",
                active
                  ? "text-purple-400 font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon size={19} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium leading-none whitespace-nowrap">
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* More button to open drawer */}
        <button
          type="button"
          onClick={openDrawer}
          className="flex flex-col items-center justify-center min-w-[58px] sm:min-w-[64px] flex-1 py-2 px-1 gap-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors shrink-0"
          aria-label="Open full menu"
        >
          <Menu size={19} strokeWidth={1.8} />
          <span className="text-[10px] font-medium leading-none whitespace-nowrap">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
