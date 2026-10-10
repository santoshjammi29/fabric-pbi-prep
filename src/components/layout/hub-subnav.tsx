"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface HubSubnavItem {
  label: string;
  href: string;
  icon?: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface HubSubnavProps {
  hubTitle?: string;
  items: HubSubnavItem[];
  className?: string;
}

function HubSubnavInner({ hubTitle, items, className }: HubSubnavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isItemActive = (href: string) => {
    const [itemPath, itemQuery] = href.split("?");
    const pathMatches = pathname === itemPath;

    if (!pathMatches) return false;
    if (!itemQuery) {
      const currentTab = searchParams?.get("tab");
      if (!currentTab) return true;
      const otherMatches = items.some((it) => {
        const [, otherQuery] = it.href.split("?");
        if (!otherQuery) return false;
        const otherParams = new URLSearchParams(otherQuery);
        return otherParams.get("tab") === currentTab;
      });
      return !otherMatches;
    }

    const itemSearchParams = new URLSearchParams(itemQuery);
    const expectedTab = itemSearchParams.get("tab");
    if (expectedTab) {
      return searchParams?.get("tab") === expectedTab;
    }

    return true;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--surface-2)]/80 border border-[var(--border)] overflow-x-auto scrollbar-none mb-6",
        className
      )}
      role="navigation"
      aria-label={hubTitle ? `${hubTitle} Navigation` : "Hub Sub-navigation"}
    >
      {hubTitle && (
        <span className="hidden sm:inline-flex items-center px-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] shrink-0">
          {hubTitle}:
        </span>
      )}
      {items.map((item) => {
        const active = isItemActive(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 shrink-0 whitespace-nowrap",
              active
                ? "bg-purple-600 text-white font-semibold shadow-sm shadow-purple-500/25"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
            )}
          >
            {Icon && <Icon size={14} className={cn(active ? "text-white" : "text-[var(--muted-foreground)]")} />}
            <span>{item.label}</span>
            {item.badge && (
              <span
                className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.2 rounded-full border leading-tight",
                  active
                    ? "bg-white/20 text-white border-white/30"
                    : item.badgeColor || "bg-[var(--surface-3)] text-[var(--muted-foreground)] border-[var(--border)]"
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export function HubSubnav(props: HubSubnavProps) {
  return (
    <Suspense fallback={null}>
      <HubSubnavInner {...props} />
    </Suspense>
  );
}
