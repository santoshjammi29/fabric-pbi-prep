"use client";

import React from "react";
import { InteractiveMindmap } from "@/components/mindmap/interactive-mindmap";
import { Globe, Sparkles, Layers, Cpu, Database, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MindmapPage() {
  return (
    <div className="space-y-6 pb-20">
      {/* Mindmap Canvas Container */}
      <InteractiveMindmap />

      {/* Guide Cards & Architecture Walkthrough */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
            <Globe size={15} />
            <span>Interactive Navigation</span>
          </div>
          <h3 className="text-sm font-bold text-[var(--foreground)]">Infinite Canvas Navigation</h3>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Click and drag to pan across the topography. Use mouse wheel or the toolbar (+/-) to zoom into specific protocol trees.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
            <Layers size={15} />
            <span>Deep Architectural Drilldown</span>
          </div>
          <h3 className="text-sm font-bold text-[var(--foreground)]">Node Inspection Drawer</h3>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Click any branch or subtopic node to open the architect inspection drawer, revealing trade-offs, protocols, and production code snippets.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Sparkles size={15} />
            <span>Direct Question Linking</span>
          </div>
          <h3 className="text-sm font-bold text-[var(--foreground)]">Practice Integration</h3>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Every concept node links directly to verified interview question banks and real-world system design simulation scenarios.
          </p>
        </div>
      </div>
    </div>
  );
}
