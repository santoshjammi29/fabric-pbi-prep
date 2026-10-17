"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowUp, Terminal, Layers, Sparkles, BookOpen, Compass } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { TextSizeController } from "@/components/ui/text-size-controller";

function AllPagesFooterInner() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      className="mt-16 border-t border-[var(--border)] bg-[var(--surface-1)] text-[var(--foreground)]"
      role="contentinfo"
      aria-label="Platform Architecture Notes and Footer"
    >
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Revamped High-Signal Platform Architecture Note */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xs">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <BrandLogo size={28} className="rounded-lg shadow-xs" />
              <h3 className="font-bold text-sm sm:text-base text-[var(--foreground)] tracking-tight">
                DataPlatform Architect Notes
              </h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                2026 Edition
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Curated enterprise reference platform and system design workbench for Principal Architects and Senior Data Engineers. Deep dives across Microsoft Fabric OneLake &amp; Direct Lake, Databricks Unity Catalog &amp; Photon Engine, Open Storage Formats (Delta Lake, Apache Iceberg, Apache Parquet), and high-scale Medallion Lakehouse architectures.
            </p>
          </div>

          {/* Meaningful Platform Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 text-xs font-mono shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex items-center gap-2">
              <BookOpen size={13} className="text-blue-500 shrink-0" />
              <div>
                <span className="block font-bold text-[var(--foreground)]">10,700+</span>
                <span className="text-[10px] text-[var(--muted-foreground)]">Verified Assets</span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex items-center gap-2">
              <Layers size={13} className="text-emerald-500 shrink-0" />
              <div>
                <span className="block font-bold text-[var(--foreground)]">32 Blueprints</span>
                <span className="text-[10px] text-[var(--muted-foreground)]">Whiteboard Hub</span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex items-center gap-2">
              <Compass size={13} className="text-purple-500 shrink-0" />
              <div>
                <span className="block font-bold text-[var(--foreground)]">156 Profiles</span>
                <span className="text-[10px] text-[var(--muted-foreground)]">GCC &amp; BigTech</span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex items-center gap-2">
              <Sparkles size={13} className="text-amber-500 shrink-0" />
              <div>
                <span className="block font-bold text-[var(--foreground)]">660 Concepts</span>
                <span className="text-[10px] text-[var(--muted-foreground)]">Architecture Map</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Utility Bar: Shortcuts, Accessibility, and Back-to-Top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-[var(--muted-foreground)]">
          {/* Keyboard Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-semibold text-[var(--foreground)] text-[11px] uppercase tracking-wider">
              Shortcuts:
            </span>
            <span className="inline-flex items-center gap-1 text-[11px]">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[10px] font-mono">
                /
              </kbd>{" "}
              Search
            </span>
            <span className="inline-flex items-center gap-1 text-[11px]">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[10px] font-mono">
                ⌘K
              </kbd>{" "}
              Palette
            </span>
            <span className="inline-flex items-center gap-1 text-[11px]">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[10px] font-mono">
                Shift+E
              </kbd>{" "}
              Read All
            </span>
            <span className="inline-flex items-center gap-1 text-[11px]">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[10px] font-mono">
                Esc
              </kbd>{" "}
              Reset
            </span>
          </div>

          {/* Quick Controls & Back-to-Top */}
          <div className="flex items-center gap-3 shrink-0">
            <TextSizeController collapsed={false} direction="up" align="end" />
            <ThemeSwitcher collapsed={false} direction="up" align="end" />
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              aria-label="Scroll back to top of page"
            >
              <ArrowUp size={13} />
              <span>Top</span>
            </button>
          </div>
        </div>

        {/* Minimal Copyright */}
        <div className="pt-2 text-center sm:text-left text-[11px] text-[var(--muted-foreground)] border-t border-[var(--border)]">
          <p>© 2026 DataPlatform Architect • All scenario data, diagrams, and curriculum assets engineered for enterprise cloud architecture mastery.</p>
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
