"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Compass,
  Workflow,
  Layers,
  Cpu,
  MessageSquare,
  FileCode2,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeploymentHighlight {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  keyUpdates: string[];
  ctaLabel: string;
  ctaHref: string;
  icon: React.ElementType;
  iconBg: string;
}

const DEPLOYMENT_HIGHLIGHTS: DeploymentHighlight[] = [
  {
    id: "always-visible-nav",
    badge: "Navigation Architecture",
    badgeColor: "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/25",
    title: "Always-Visible Universal Navigation",
    subtitle: "Permanent access across all layouts with zero hidden menus",
    description:
      "Engineered a responsive dual-tier top navigation ribbon, an always-expanded desktop sidebar tree with branch guides, and an all-subpages mobile drawer. All 8 hubs and 21 subpages are now permanently visible on mobile, tablet, and desktop.",
    keyUpdates: [
      "Top horizontal subpage ribbon with auto-centering",
      "Always-expanded desktop sidebar with 21 subpages",
      "No hidden menus on mobile or tablet",
      "Full multi-column sitemap footer",
    ],
    ctaLabel: "View Navigation Registry",
    ctaHref: "/concepts",
    icon: Compass,
    iconBg: "bg-blue-600",
  },
  {
    id: "dataops-lifecycle",
    badge: "CI/CD & Governance",
    badgeColor: "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border-cyan-500/25",
    title: "DataOps & CI/CD Lifecycle Hub",
    subtitle: "Tool connectivity, secrets management & 5-stage project playbook",
    description:
      "Launched a complete 4-module DataOps portal covering tool secrets and authentication (ADF, Databricks, Fabric, Key Vault, Managed Identities), CI/CD alternatives (DABs, Git-Sync, Slim CI), an end-to-end 5-stage project lifecycle playbook, and whiteboard flow diagrams.",
    keyUpdates: [
      "8 Tool connectivity & Managed Identity guides",
      "7 CI/CD tool comparisons (DABs vs Terraform)",
      "5-Stage project lifecycle deliverable checklist",
      "Interactive digital whiteboard architecture flow",
    ],
    ctaLabel: "Open DataOps Hub",
    ctaHref: "/dataops",
    icon: Workflow,
    iconBg: "bg-cyan-600",
  },
  {
    id: "whiteboard-blueprints",
    badge: "System Design",
    badgeColor: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/25",
    title: "32 Production Whiteboard Blueprints",
    subtitle: "Hand-drawn digital whiteboard sketch architecture diagrams",
    description:
      "Curated 32 authoritative architectural blueprints following digital whiteboard sketch design standards: Fabric OneLake, Direct Lake VertiPaq, Airflow, Spark AQE, Delta Lake ACID mechanics, Unity Catalog, Purview, Kimball Star Schema, and Enterprise Data Mesh.",
    keyUpdates: [
      "32 High-resolution digital whiteboard visuals",
      "Semantic color coding (Compute, Data, Storage)",
      "Control flow vs data flow arrow differentiation",
      "Deep-dive technical architectural explanations",
    ],
    ctaLabel: "Browse 32 Blueprints",
    ctaHref: "/architecture?tab=diagrams",
    icon: Layers,
    iconBg: "bg-amber-600",
  },
  {
    id: "spark-engine-finops",
    badge: "Core Engines",
    badgeColor: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/25",
    title: "Spark 4.0 Physical Execution & FinOps",
    subtitle: "Catalyst optimization, Tungsten memory & cloud cost governance",
    description:
      "Expanded the core engine simulators with Apache Spark 4.0 physical DAG planning, Tungsten memory allocation models, Photon vectorized C++ execution benchmarks, and cloud FinOps lakehouse cost reduction playbooks.",
    keyUpdates: [
      "Tungsten on-heap/off-heap memory calculator",
      "Adaptive Query Execution (AQE) skew handling",
      "Delta vs Iceberg open table format benchmarks",
      "FinOps SKU sizing & capacity unit formulas",
    ],
    ctaLabel: "Launch Spark Engine Lab",
    ctaHref: "/spark-engine",
    icon: Cpu,
    iconBg: "bg-emerald-600",
  },
  {
    id: "qa-prep-drills",
    badge: "Interview Practice",
    badgeColor: "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/25",
    title: "6,570+ Verified Q&As & Company Intel",
    subtitle: "SM-2 spaced repetition flashcards & BigTech hiring dossiers",
    description:
      "Enhanced the interview drill bank with SM-2 spaced repetition flashcards mode, detailed architectural defense rubrics, and targeted interview intel dossiers for Microsoft, Amazon, Google, Meta, Apple, Uber, Walmart, and Tier-1 GCC enterprises.",
    keyUpdates: [
      "6,570+ Architect-level technical scenarios",
      "Interactive SM-2 spaced repetition flashcards",
      "6 Tier-1 GCC enterprise hiring dossiers",
      "Instant bookmarking and review studio",
    ],
    ctaLabel: "Start Question Drill",
    ctaHref: "/qa-prep",
    icon: MessageSquare,
    iconBg: "bg-rose-600",
  },
];

export function RecentDeploymentsRadar() {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
              <Sparkles size={11} className="text-blue-500 animate-pulse" />
              <span>Platform Release Radar</span>
            </span>
            <span className="text-[11px] font-medium text-[var(--muted-foreground)] hidden sm:inline">
              Recently Deployed Features &amp; Upgrades
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight mt-1">
            What&apos;s New: Recent Platform Enhancements
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--muted-foreground)]">
          <Clock size={13} className="text-blue-500" />
          <span className="font-semibold text-[var(--foreground)]">Oct 2026 Production Build</span>
          <span>•</span>
          <span className="text-emerald-500 dark:text-emerald-400 font-bold">100% Operational</span>
        </div>
      </div>

      {/* Grid of Deployed Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {DEPLOYMENT_HIGHLIGHTS.map((highlight) => {
          const Icon = highlight.icon;
          return (
            <div
              key={highlight.id}
              className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[var(--surface-1)] border-2 border-[var(--border)] hover:border-blue-500/40 hover:shadow-lg transition-all duration-200 group relative overflow-hidden"
            >
              {/* Subtle accent backdrop */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />

              <div className="space-y-3 relative z-10">
                {/* Header Badge & Icon */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <Icon size={18} className="text-[var(--foreground)] group-hover:text-blue-500 transition-colors" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border leading-tight",
                      highlight.badgeColor
                    )}
                  >
                    {highlight.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-blue-500 transition-colors">
                    {highlight.title}
                  </h3>
                  <p className="text-xs font-medium text-[var(--muted-foreground)] mt-0.5">
                    {highlight.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {highlight.description}
                </p>

                {/* Key Checklist Updates */}
                <div className="space-y-1.5 pt-1 border-t border-[var(--border)]">
                  {highlight.keyUpdates.map((update, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-[var(--muted-foreground)]">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{update}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-[var(--border)] relative z-10">
                <Link
                  href={highlight.ctaHref}
                  className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-blue-600 hover:text-white border border-[var(--border)] hover:border-transparent text-xs font-bold text-[var(--foreground)] transition-all cursor-pointer group/btn"
                >
                  <span>{highlight.ctaLabel}</span>
                  <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
