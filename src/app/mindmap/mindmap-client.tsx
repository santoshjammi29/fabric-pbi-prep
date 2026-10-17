"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, GitBranch, Zap, Layers, HelpCircle, ArrowRight } from "lucide-react";
import { Concept } from "@/types/data";
import { HubSubnav } from "@/components/layout/hub-subnav";
import { ConceptsMindmapView } from "@/components/concepts/concepts-mindmap-view";

interface MindmapClientProps {
  concepts: Concept[];
}

export function MindmapClient({ concepts }: MindmapClientProps) {
  return (
    <div className="space-y-4 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Academy Pillar Subnav */}
      <HubSubnav
        hubTitle="Concepts & Foundations"
        items={[
          { label: "Concepts Library", href: "/concepts", icon: BookOpen, badge: "660+" },
          { label: "Concepts Mind Map", href: "/mindmap", icon: GitBranch, badge: "Tree" },
          { label: "Core Lakehouse Concepts", href: "/modern-stack?tab=concepts", icon: Zap, badge: "FinOps" },
        ]}
      />

      {/* Hero Header */}
      <div className="relative rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3 sm:p-4 overflow-hidden shadow-xs isolate">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold">
              <GitBranch size={11} />
              <span>Multi-Level Architectural Stretch</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight break-words">
              Enterprise Data Platform Concepts Mind Map
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] max-w-3xl leading-relaxed break-words">
              Explore the entire repository of <strong>{concepts.length} architectural concepts</strong> mapped exclusively to their parent topics and subtopic pillars across 4 stretching depth levels.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Link
              href="/concepts"
              className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors inline-flex items-center gap-1.5"
            >
              <BookOpen size={13} />
              <span>Glossary List View</span>
            </Link>
            <Link
              href="/qa-prep"
              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors inline-flex items-center gap-1.5"
            >
              <HelpCircle size={13} />
              <span>Interview Q&amp;A Bank</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Integrated Multi-Level Stretching Mind Map */}
      <ConceptsMindmapView concepts={concepts} />
    </div>
  );
}
