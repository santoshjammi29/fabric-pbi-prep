"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { Terminal, Layers, Sparkles, BookOpen, Compass } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

function AllPagesFooterInner() {
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
                Lakehouse Architect Notes
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



        {/* Minimal Copyright */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--muted-foreground)] border-t border-[var(--border)]">
          <p>© 2026 Lakehouse Architect (<a href="https://lakehousearchitect.vercel.app" className="hover:text-blue-500 underline underline-offset-2">https://lakehousearchitect.vercel.app</a>) • Enterprise Data Platform Architecture &amp; System Design Portal.</p>
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] hidden sm:inline">https://lakehousearchitect.vercel.app</span>
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
