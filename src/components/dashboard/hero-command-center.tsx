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
  GraduationCap,
  Search,
  CheckCircle2,
  Terminal,
  Zap,
  Building2,
  Globe,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    id: "curriculum",
    title: "Learning Journeys",
    badge: "12 Curricula · 4 Tiers",
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: Compass,
    iconColor: "text-blue-400",
    accentBg: "from-blue-600/10 via-blue-500/5 to-transparent",
    borderColor: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/50",
    description:
      "Structured week-by-week roadmaps from Microsoft Fabric DP-600 to 32-Week Principal Lakehouse Mastery with capstones.",
    features: [
      "Microsoft Fabric DP-600",
      "Databricks Lakehouse & Unity",
      "Apache Airflow Orchestration",
      "dbt Modern Analytics DAGs",
    ],
    primaryLink: { label: "Explore Curricula Tracks", href: "/learning-paths" },
    secondaryLinks: [
      { label: "Guided Topics", href: "/guided-learning" },
      { label: "10-Q Diagnostic", href: "/diagnostic" },
    ],
  },
  {
    id: "knowledge",
    title: "Knowledge & Engines",
    badge: "290 Concepts · Spark 4.0",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: BookOpen,
    iconColor: "text-emerald-400",
    accentBg: "from-emerald-600/10 via-emerald-500/5 to-transparent",
    borderColor: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/50",
    description:
      "Architectural glossaries, Spark 4.0 physical execution simulator, Tungsten memory calculator, and cross-cloud translation matrices.",
    features: [
      "Spark Catalyst & Photon C++",
      "Tungsten Memory Allocation",
      "Delta Lake vs Iceberg Internals",
      "Multi-Cloud Matrix (AWS/GCP/Azure)",
    ],
    primaryLink: { label: "Open Knowledge Base", href: "/concepts" },
    secondaryLinks: [
      { label: "Spark Engine Hub", href: "/spark-engine" },
      { label: "Modern Data Stack", href: "/modern-stack" },
    ],
  },
  {
    id: "architecture",
    title: "System Architecture",
    badge: "2,520 Scenarios · 21 Blueprints",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    icon: Layers,
    iconColor: "text-purple-400",
    accentBg: "from-purple-600/10 via-purple-500/5 to-transparent",
    borderColor: "border-purple-500/20",
    hoverBorder: "hover:border-purple-500/50",
    description:
      "Real-world enterprise system design problems, failure recovery trade-offs, and hand-drawn whiteboard blueprints.",
    features: [
      "Medallion Lakehouse Topography",
      "Kafka & CDC Streaming Pipelines",
      "Vector RAG Architectures",
      "Interactive Infinite Mindmap",
    ],
    primaryLink: { label: "View Architecture Hub", href: "/architecture" },
    secondaryLinks: [
      { label: "Whiteboard Blueprints", href: "/architecture?tab=diagrams" },
      { label: "DE Mindmap", href: "/mindmap" },
    ],
  },
  {
    id: "practice",
    title: "Interview Drill & Code",
    badge: "6,570+ Qs · Polyglot Code",
    badgeColor: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    icon: MessageSquare,
    iconColor: "text-orange-400",
    accentBg: "from-orange-600/10 via-orange-500/5 to-transparent",
    borderColor: "border-orange-500/20",
    hoverBorder: "hover:border-orange-500/50",
    description:
      "Interactive SM-2 spaced repetition question drill, production-ready code snippets, and verified BigTech/GCC salary benchmarks.",
    features: [
      "PySpark & Spark SQL Drills",
      "Production Incident Runbooks",
      "Tier-1 GCC Salary Benchmarks",
      "Interactive Flashcards Mode",
    ],
    primaryLink: { label: "Launch Interview Drill", href: "/qa-prep" },
    secondaryLinks: [
      { label: "Code Practice", href: "/code-practice" },
      { label: "Production Cheat Sheet", href: "/cheat-sheet" },
    ],
  },
];

export function HeroCommandCenter() {
  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── 1. FOCUSED, MOTIVATIONAL HERO BANNER ───────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-10 lg:p-12 isolate shadow-xl">
        {/* Ambient atmospheric lighting */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18)_0%,transparent_70%)] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 -ml-16 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.1)_0%,transparent_70%)] blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs font-semibold text-purple-300 backdrop-blur-md">
            <Sparkles size={14} className="text-purple-400 animate-pulse" />
            <span className="tracking-wide">2026 ARCHITECT PREPARATION PLATFORM</span>
            <span className="w-1 h-1 rounded-full bg-purple-400" />
            <span className="text-[11px] text-purple-400/80 font-mono">6,570+ SCENARIOS</span>
          </div>

          {/* Main motivational title */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.12]">
              Master the Modern Data Platform.
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                From Internal Mechanics to Principal Architecture.
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-[var(--muted-foreground)] leading-relaxed max-w-3xl">
              An open, production-grade learning operating system for Data Engineers and Architects.
              Vetted curricula across Microsoft Fabric, Databricks Lakehouse, Apache Spark, and Distributed Systems.
            </p>
          </div>

          {/* High-Intent Motivational Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/diagnostic"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <GraduationCap size={18} />
              <span>Take 10-Q Skill Diagnostic</span>
              <ArrowRight size={15} className="text-purple-200" />
            </Link>

            <Link
              href="/learning-paths"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-purple-500/40 text-[var(--foreground)] text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Compass size={17} className="text-blue-400" />
              <span>Explore 12 Curricula Tracks</span>
            </Link>

            <button
              type="button"
              onClick={openSearch}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[var(--surface-2)]/60 hover:bg-[var(--surface-2)] border border-[var(--border)] text-xs sm:text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Quick search all questions and concepts"
            >
              <Search size={16} />
              <span>Quick Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--surface-3)] text-[var(--muted-foreground)] border border-[var(--border)]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Proof of Value Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-3 border-t border-[var(--border)]/60 text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-green-400" />
              <span><strong className="text-[var(--foreground)]">6,570+</strong> Verified Questions</span>
            </div>
            <span className="hidden sm:inline text-[var(--border)]">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-green-400" />
              <span><strong className="text-[var(--foreground)]">290</strong> Core Concepts</span>
            </div>
            <span className="hidden sm:inline text-[var(--border)]">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-green-400" />
              <span><strong className="text-[var(--foreground)]">21</strong> Architecture Blueprints</span>
            </div>
            <span className="hidden sm:inline text-[var(--border)]">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-green-400" />
              <span><strong className="text-[var(--foreground)]">100%</strong> Free &amp; Open Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. THE 4 PILLARS OF MASTERY (CLEAN GATEWAY CARDS) ──────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
              Core Study Pillars
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
              Choose Your Architectural Focus
            </h2>
          </div>
          <span className="text-xs text-[var(--muted-foreground)] hidden sm:inline">
            4 unified learning gateways
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className={cn(
                  "relative rounded-3xl bg-[var(--surface-1)] border p-6 flex flex-col justify-between transition-all duration-200 group overflow-hidden shadow-sm",
                  pillar.borderColor,
                  pillar.hoverBorder
                )}
              >
                {/* Subtle top gradient accent */}
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 h-28 bg-gradient-to-b opacity-40 pointer-events-none transition-opacity group-hover:opacity-75",
                    pillar.accentBg
                  )}
                />

                <div className="relative space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon size={20} className={pillar.iconColor} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-purple-300 transition-colors">
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
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {pillar.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)] truncate"
                      >
                        <span className="w-1 h-1 rounded-full bg-purple-400 shrink-0" />
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="relative pt-5 mt-5 border-t border-[var(--border)]/60 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={pillar.primaryLink.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{pillar.primaryLink.label}</span>
                    <ArrowRight size={13} />
                  </Link>

                  <div className="flex items-center gap-2">
                    {pillar.secondaryLinks.map((sec) => (
                      <Link
                        key={sec.href}
                        href={sec.href}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors"
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
