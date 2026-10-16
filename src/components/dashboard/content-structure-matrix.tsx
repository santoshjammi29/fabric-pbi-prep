"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  BookOpen,
  Layers,
  FileCode2,
  Workflow,
  MessageSquare,
  Globe,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/data/navigation-data";

interface HubMetadata {
  id: string;
  pillar: string;
  badge: string;
  badgeColor: string;
  count: string;
  summary: string;
  icon: React.ElementType;
}

const HUB_METADATA: Record<string, HubMetadata> = {
  "/guided-learning": {
    id: "journey",
    pillar: "Learning Journey",
    badge: "Roadmap",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    count: "12 Curricula · 9 Tracks",
    summary: "Guided tech tracks and week-by-week role roadmaps from DP-600 to Principal Lakehouse Architect.",
    icon: Compass,
  },
  "/concepts": {
    id: "concepts",
    pillar: "Concepts & Engines",
    badge: "Foundations",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    count: "436+ Concepts",
    summary: "Architectural glossaries, Spark 4.0 execution simulator, Tungsten memory calculator, and FinOps playbooks.",
    icon: BookOpen,
  },
  "/architecture": {
    id: "architecture",
    pillar: "Architecture Hub",
    badge: "Principal",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    count: "3,124+ Scenarios · 32 Visuals",
    summary: "Real-world system design scenarios, failure recovery trade-offs, and whiteboard blueprints.",
    icon: Layers,
  },
  "/code-practice": {
    id: "code",
    pillar: "Code & Runbooks",
    badge: "Prod Ready",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    count: "67 Runbooks · 128+ Drills",
    summary: "Severity-1 incident playbooks, outage cheat codes, and runnable PySpark, SQL, and Polars drills.",
    icon: FileCode2,
  },
  "/dataops": {
    id: "dataops",
    pillar: "DataOps & Lifecycle",
    badge: "CI/CD & E2E",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    count: "4 Modules · 5 Stages",
    summary: "Tool connectivity & secrets, CI/CD pipelines, end-to-end lifecycle playbook, and architecture flow.",
    icon: Workflow,
  },
  "/qa-prep": {
    id: "interview",
    pillar: "Interview Drill Hub",
    badge: "6.5k+ Qs",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    count: "6,570+ Q&As · 6 GCC Dossiers",
    summary: "Vetted question banks with SM-2 spaced repetition flashcards and Tier-1 GCC company intel dossiers.",
    icon: MessageSquare,
  },
};

export function ContentStructureMatrix() {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/20">
              <Sparkles size={11} className="text-purple-500" />
              <span>Full Content Architecture</span>
            </span>
            <span className="text-[11px] font-medium text-[var(--muted-foreground)] hidden sm:inline">
              8 Hubs · 21 Subpages · 6,570+ Scenarios
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight mt-1">
            Complete Curriculum &amp; Platform Sitemap Matrix
          </h2>
        </div>
        <p className="text-xs text-[var(--muted-foreground)] max-w-sm">
          Every subpage is continuously accessible, verified against Microsoft Fabric and modern lakehouse standards.
        </p>
      </div>

      {/* Grid of the 6 Main Study Pillars with their Subpages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {NAV_GROUPS.flatMap((g) => g.items).filter((item) => item.href !== "/" && item.href !== "/studio").map((pillar) => {
          const meta = HUB_METADATA[pillar.href] || {
            id: pillar.href,
            pillar: pillar.label,
            badge: "Hub",
            badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            count: "Multiple Tracks",
            summary: "Core architectural curriculum and exercises.",
            icon: pillar.icon,
          };
          const Icon = meta.icon;

          return (
            <div
              key={pillar.href}
              className="flex flex-col justify-between p-4 rounded-2xl bg-[var(--surface-1)] border-2 border-[var(--border)] hover:border-blue-500/40 transition-all duration-200 group"
            >
              <div className="space-y-3">
                {/* Pillar Header */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon size={18} className="text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <Link
                        href={pillar.href}
                        className="text-sm sm:text-base font-bold text-[var(--foreground)] hover:text-blue-500 transition-colors"
                      >
                        {pillar.label}
                      </Link>
                      <div className="text-[10px] font-semibold text-[var(--muted-foreground)]">
                        {meta.count}
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0",
                      meta.badgeColor
                    )}
                  >
                    {meta.badge}
                  </span>
                </div>

                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {meta.summary}
                </p>

                {/* Subpages List */}
                {pillar.subItems && (
                  <div className="space-y-1 pt-2 border-t border-[var(--border)]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                      Direct Subpages &amp; Labs:
                    </div>
                    {pillar.subItems.map((sub) => {
                      const SubIcon = sub.icon || Icon;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)]/60 hover:bg-blue-600 hover:text-white border border-[var(--border)] hover:border-transparent text-xs text-[var(--foreground)] transition-all group/sub"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <SubIcon size={13} className="shrink-0 text-blue-500 group-hover/sub:text-white" />
                            <span className="font-medium truncate">{sub.label}</span>
                          </div>
                          {sub.badge && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-[var(--surface-3)] group-hover/sub:bg-white/20 text-[var(--muted-foreground)] group-hover/sub:text-white shrink-0">
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Hub Primary Link */}
              <div className="pt-3 mt-3 border-t border-[var(--border)]">
                <Link
                  href={pillar.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
                >
                  <span>Explore All {pillar.label} Content</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
