"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  BookOpen,
  Layers,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  FileCode2,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KbdShortcut } from "@/components/ui/kbd-shortcut";

interface PillarItem {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  iconColor: string;
  accentBg: string;
  borderColor: string;
  hoverBorder: string;
  description: string;
  features: string[];
  primaryLink: { label: string; href: string };
  secondaryLinks: { label: string; href: string }[];
}

const PILLARS: PillarItem[] = [
  {
    id: "concepts",
    title: "1. Concepts & Foundations",
    badge: "660+ Concepts · Mind Map",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: BookOpen,
    iconColor: "text-emerald-400",
    accentBg: "from-emerald-600/10 via-emerald-500/5 to-transparent",
    borderColor: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/50",
    description:
      "Comprehensive architectural glossaries, visual hierarchy taxonomy depth tree, and core lakehouse engine concepts.",
    features: [
      "Concepts Glossary (660+ Terms)",
      "Interactive Mind Map Tree",
      "Delta Lake vs Iceberg Internals",
      "Modern Stack Core Concepts",
    ],
    primaryLink: { label: "Explore Key Concepts", href: "/concepts" },
    secondaryLinks: [
      { label: "Concepts Glossary", href: "/concepts" },
      { label: "Concepts Mind Map", href: "/mindmap" },
    ],
  },
  {
    id: "architecture",
    title: "2. Architecture & Systems",
    badge: "3,206+ Scenarios · Spark Lab",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    icon: Layers,
    iconColor: "text-purple-400",
    accentBg: "from-purple-600/10 via-purple-500/5 to-transparent",
    borderColor: "border-purple-500/20",
    hoverBorder: "hover:border-purple-500/50",
    description:
      "Real-world enterprise system design problems, Spark physical execution & Tungsten lab, DataOps lifecycle, and Cloud × Table Matrix.",
    features: [
      "System Design Scenarios",
      "Spark Engine & Tungsten Lab",
      "DataOps Lifecycle Playbook",
      "Cloud × Table Matrix",
    ],
    primaryLink: { label: "View Architecture & Systems", href: "/architecture" },
    secondaryLinks: [
      { label: "System Scenarios", href: "/architecture?tab=scenarios" },
      { label: "Spark Engine Lab", href: "/spark-engine" },
      { label: "Cloud × Table Matrix", href: "/modern-stack?tab=compatibility" },
    ],
  },
  {
    id: "code",
    title: "3. Coding & Runbooks",
    badge: "69 Runbooks · 164 Drills",
    badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    icon: FileCode2,
    iconColor: "text-cyan-400",
    accentBg: "from-cyan-600/10 via-cyan-500/5 to-transparent",
    borderColor: "border-cyan-500/20",
    hoverBorder: "hover:border-cyan-500/50",
    description:
      "Production incident playbooks, Databricks cheat sheets, P0 outage cheat codes, and runnable PySpark, SQL, and Polars drills.",
    features: [
      "Sev-1 Incident Runbooks",
      "Databricks Cheat Sheets & PDFs",
      "PySpark & Spark SQL Drills",
      "Polars Rust Vectorized Code",
    ],
    primaryLink: { label: "Open Code & Runbooks", href: "/code-practice" },
    secondaryLinks: [
      { label: "Production Cheat Sheet", href: "/cheat-sheet" },
      { label: "Databricks Cheat Sheets", href: "/cheat-sheet?tab=databricks" },
      { label: "A4 PDF Library", href: "/cheat-sheet?tab=pdf_hub" },
      { label: "PySpark Drills", href: "/code-practice?db=pyspark" },
    ],
  },
  {
    id: "visuals",
    title: "4. Visual Blueprints & Diagrams",
    badge: "32 Whiteboards · Interactive Flows",
    badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    icon: Sparkles,
    iconColor: "text-rose-400",
    accentBg: "from-rose-600/10 via-rose-500/5 to-transparent",
    borderColor: "border-rose-500/20",
    hoverBorder: "hover:border-rose-500/50",
    description:
      "Hand-drawn whiteboard architectural diagrams, system design workflows, and interactive end-to-end data pipeline flow SVGs.",
    features: [
      "32 Whiteboard Architecture Blueprints",
      "Interactive DataOps Pipeline SVG",
      "Modern Stack Visual Flow Canvas",
      "Spark Memory & Shuffling Sketches",
    ],
    primaryLink: { label: "Inspect Whiteboard Blueprints", href: "/architecture?tab=diagrams" },
    secondaryLinks: [
      { label: "Whiteboard Blueprints", href: "/architecture?tab=diagrams" },
      { label: "DataOps Architecture Flow", href: "/dataops?tab=diagram" },
    ],
  },
  {
    id: "interview",
    title: "5. Interview Drill Hub",
    badge: "7,080+ Qs · 156 Targets",
    badgeColor: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    icon: MessageSquare,
    iconColor: "text-orange-400",
    accentBg: "from-orange-600/10 via-orange-500/5 to-transparent",
    borderColor: "border-orange-500/20",
    hoverBorder: "hover:border-orange-500/50",
    description:
      "Interactive SM-2 spaced repetition question drill, domain question banks, and verified Tier-1 GCC / BigTech hiring playbooks.",
    features: [
      "7,080+ Vetted Interview Q&As",
      "156+ Target Enterprise Profiles",
      "Interactive SM-2 Flashcards",
      "Architect Scenario Defenses",
    ],
    primaryLink: { label: "Launch Interview Drill", href: "/qa-prep" },
    secondaryLinks: [
      { label: "Question Drill Bank", href: "/qa-prep" },
      { label: "Target Company Intel", href: "/company-research" },
    ],
  },
  {
    id: "journey",
    title: "6. Learning Journey",
    badge: "12 Curricula · 13 Tracks",
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: Compass,
    iconColor: "text-blue-400",
    accentBg: "from-blue-600/10 via-blue-500/5 to-transparent",
    borderColor: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/50",
    description:
      "Structured tech tracks and week-by-week role curricula from Fabric DP-600 to 32-Week Principal Lakehouse Mastery.",
    features: [
      "Guided Tech Topics",
      "12 Career Roadmaps",
      "Milestone Checklists",
      "Multi-Hop Learning Plan",
    ],
    primaryLink: { label: "Launch Learning Journey", href: "/guided-learning" },
    secondaryLinks: [
      { label: "Guided Tracks", href: "/guided-learning" },
      { label: "Career Curricula", href: "/learning-paths" },
    ],
  },
];

export function HeroCommandCenter() {
  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* ── 1. FOCUSED, MOTIVATIONAL HERO BANNER ───────────────────────────── */}
      <section className="relative overflow-hidden rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3 sm:p-4 isolate shadow-xs">
        {/* Ambient atmospheric lighting */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,transparent_70%)] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.08)_0%,transparent_70%)] blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-2.5">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/25 text-[10px] font-semibold text-blue-600 dark:text-blue-300 backdrop-blur-md">
            <Sparkles size={11} className="text-blue-500 dark:text-blue-400 animate-pulse" />
            <span className="tracking-wide">2026 ARCHITECT PREPARATION PLATFORM</span>
            <span className="w-1 h-1 rounded-full bg-blue-400" />
            <span className="text-[10px] text-blue-500/80 font-mono">6,570+ SCENARIOS</span>
          </div>

          {/* Main motivational title */}
          <div className="space-y-1">
            <h1 className="text-base sm:text-lg lg:text-2xl font-extrabold tracking-tight text-[var(--foreground)] leading-snug break-words">
              Lakehouse Architecture &amp; Systems Mastery
              <span className="block mt-0.5 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400">
                Enterprise Blueprints, Medallion Patterns &amp; Principal Systems Practice
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed max-w-3xl break-words">
              The premier open-access knowledge base for Lakehouse Architects and Lead Data Engineers.
              Master modern Lakehouse Architecture, Medallion patterns, Microsoft Fabric OneLake, Databricks Delta Lake, Apache Spark 4.0, Iceberg, and distributed systems design.
            </p>
          </div>

          {/* High-Intent Motivational Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <Link
              href="/learning-paths"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Compass size={14} />
              <span>Explore Career Curricula</span>
              <ArrowRight size={12} />
            </Link>

            <Link
              href="/guided-learning"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-blue-500/40 text-[var(--foreground)] text-xs font-semibold transition-all cursor-pointer"
            >
              <Compass size={14} className="text-blue-500 dark:text-blue-400" />
              <span>Guided Tech Tracks</span>
            </Link>

            <button
              type="button"
              onClick={openSearch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)]/80 hover:bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              aria-label="Universal search across all topics, questions, architecture and concepts (Cmd/Ctrl+K)"
            >
              <Search size={13} />
              <span>Universal Search</span>
              <KbdShortcut shortcutKey="k" className="hidden sm:inline-flex bg-[var(--surface-3)]" />
            </button>
          </div>

          {/* Proof of Value Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2 border-t border-[var(--border)]/60 text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400" />
              <span><strong className="text-[var(--foreground)]">7,080+</strong> Questions</span>
            </div>
            <span className="hidden sm:inline text-[var(--border)]">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400" />
              <span><strong className="text-[var(--foreground)]">3,206+</strong> Scenarios</span>
            </div>
            <span className="hidden sm:inline text-[var(--border)]">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400" />
              <span><strong className="text-[var(--foreground)]">32</strong> Blueprints</span>
            </div>
            <span className="hidden sm:inline text-[var(--border)]">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400" />
              <span><strong className="text-[var(--foreground)]">21</strong> Subpages Across 8 Hubs</span>
            </div>
            <span className="hidden sm:inline text-[var(--border)]">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400" />
              <span><strong className="text-[var(--foreground)]">100%</strong> Free &amp; Open Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. THE 6 PILLARS OF MASTERY (CLEAN GATEWAY CARDS) ──────────────── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Core Study Pillars
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight">
              Choose Your Architectural Focus
            </h2>
          </div>
          <span className="text-xs text-[var(--muted-foreground)] hidden sm:inline">
            6 unified learning gateways
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className={cn(
                  "relative rounded-xl bg-[var(--surface-1)] border p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200 group overflow-hidden shadow-xs",
                  pillar.borderColor,
                  pillar.hoverBorder
                )}
              >
                {/* Subtle top gradient accent */}
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 h-20 bg-gradient-to-b opacity-40 pointer-events-none transition-opacity group-hover:opacity-75",
                    pillar.accentBg
                  )}
                />

                <div className="relative space-y-2.5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon size={16} className={pillar.iconColor} />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] group-hover:text-blue-500 transition-colors break-words">
                          {pillar.title}
                        </h3>
                        <span
                          className={cn(
                            "inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 leading-tight",
                            pillar.badgeColor
                          )}
                        >
                          {pillar.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
                    {pillar.description}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    {pillar.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]"
                      >
                        <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                        <span className="break-words leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="relative pt-3 mt-3 border-t border-[var(--border)]/60 flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={pillar.primaryLink.href}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{pillar.primaryLink.label}</span>
                    <ArrowRight size={13} />
                  </Link>

                  <div className="flex items-center gap-1">
                    {pillar.secondaryLinks.map((sec) => (
                      <Link
                        key={sec.href}
                        href={sec.href}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors"
                      >
                        {sec.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
