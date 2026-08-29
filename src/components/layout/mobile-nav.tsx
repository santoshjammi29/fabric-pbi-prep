"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  FileCode2,
  Zap,
  MessageSquare,
  Layers,
  Building2,
} from "lucide-react";

const tabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Concepts", href: "/concepts", icon: BookOpen },
  { label: "Code", href: "/code-practice", icon: FileCode2 },
  { label: "Spark", href: "/spark-engine", icon: Zap },
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

  return (
    <nav
      className={cn(
        "lg:hidden fixed bottom-0 inset-x-0 z-50",
        "bg-[var(--glass-bg)] backdrop-blur-xl border-t border-[var(--glass-border)]",
        "safe-area-pb"
      )}
      aria-label="Main navigation"
    >
      <div className="flex overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] flex-1 py-2 px-1 gap-0.5 transition-colors",
                active
                  ? "text-purple-400"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-none">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
