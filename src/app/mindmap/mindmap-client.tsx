"use client";

import React from "react";
import { InteractiveMindmap } from "@/components/mindmap/interactive-mindmap";
import { Globe, Sparkles, Layers } from "lucide-react";
import { HubSubnav } from "@/components/layout/hub-subnav";

export function MindmapClient() {
  return (
    <div className="space-y-4 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      <HubSubnav
        hubTitle="Architecture Hub"
        items={[
          { label: "System Scenarios", href: "/architecture?tab=scenarios", icon: Layers, badge: "2.5k+ Scenarios" },
          { label: "Whiteboard Blueprints", href: "/architecture?tab=diagrams", icon: Sparkles, badge: "32 Visuals" },
          { label: "Interactive Mindmap", href: "/mindmap", icon: Globe, badge: "Topography" },
        ]}
      />

      {/* Mindmap Canvas Container */}
      <InteractiveMindmap />

      {/* Guide Cards & Architecture Walkthrough */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-1">
        <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
            <Globe size={14} />
            <span>Interactive Navigation</span>
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">Hierarchical Tree Navigation</h3>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Expand and collapse architectural branches across the 7 core pillars. Toggle between Tree View and Pillars Matrix with live search filtering.
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
            <Layers size={14} />
            <span>Deep Architectural Drilldown</span>
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">Node Inspection Drawer</h3>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Click any branch or subtopic node to open the architect inspection drawer, revealing trade-offs, protocols, and production code snippets.
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Sparkles size={14} />
            <span>Direct Question Linking</span>
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">Practice Integration</h3>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Every concept node links directly to verified interview question banks and real-world system design simulation scenarios.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MindmapClient;
