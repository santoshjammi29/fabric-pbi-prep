"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Bot,
  Flame,
  TrendingUp,
} from "lucide-react";

export function EditorialHero() {
  return (
    <section className="space-y-6">
      {/* Magazine Editorial Split Grid */}
      <div className="editorial-hero-grid">
        {/* Left Primary Featured Hero Card */}
        <div className="magazine-card magazine-card-featured p-6 sm:p-8 flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={13} className="text-purple-400" />
                <span>Featured Architect Guide</span>
              </div>
              <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20">
                DP-600 &amp; DP-203
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--foreground)] leading-tight group-hover:text-purple-300 transition-colors">
              <Link href="/concepts?term=Direct%20Lake">
                Microsoft Fabric Direct Lake vs Import Mode: The 2026 Production Deep Dive
              </Link>
            </h2>

            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
              Understand VertiPaq memory mapping over OneLake Parquet, dynamic DAX fallback triggers,
              partition boundaries, and how to architect sub-second enterprise semantic models without data movement.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
            {/* Author & Reading Time */}
            <div className="flex items-center gap-3">
              <div className="author-avatar shadow-md">SJ</div>
              <div className="text-xs">
                <div className="font-bold text-[var(--foreground)]">Santosh Jammi</div>
                <div className="text-[11px] text-[var(--muted-foreground)]">Principal Data Architect</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-purple-400" /> 14 min read
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <TrendingUp size={13} className="text-green-400" /> 4.2k studied
              </span>
              <Link
                href="/concepts?term=Direct%20Lake"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md group-hover:shadow-purple-500/25 ml-2"
              >
                <span>Read Guide</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Secondary Stack (3 Curated Editorial Cards) */}
        <div className="flex flex-col gap-3.5">
          {/* Card 1: Spark 4.0 AQE */}
          <Link
            href="/spark-engine"
            className="magazine-card p-5 flex flex-col justify-between flex-1 group hover:border-purple-500/40"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                  <Flame size={12} /> Spark 4.0 Engine
                </span>
                <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">
                  10 min read
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] group-hover:text-purple-300 transition-colors leading-snug">
                Adaptive Query Execution (AQE) &amp; Dynamic Partition Pruning Rules
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                Eliminate shuffle skew, coalescing empty partitions, and optimizing joins at runtime.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-semibold text-purple-400 flex items-center gap-1">
              <span>Explore Engine Internals</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: AI & RAG */}
          <Link
            href="/modern-stack"
            className="magazine-card p-5 flex flex-col justify-between flex-1 group hover:border-purple-500/40"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1">
                  <Bot size={12} /> AI &amp; RAG Architecture
                </span>
                <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">
                  8 min read
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] group-hover:text-purple-300 transition-colors leading-snug">
                Building Low-Latency RAG with Delta Vector Search &amp; MCP Servers
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                Synchronize vector embeddings with Lakehouse tables and expose queries to agentic workflows.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-semibold text-pink-400 flex items-center gap-1">
              <span>View AI Recipes</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Modern Table Formats */}
          <Link
            href="/architecture"
            className="magazine-card p-5 flex flex-col justify-between flex-1 group hover:border-purple-500/40"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <Layers size={12} /> Open Lakehouse
                </span>
                <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">
                  12 min read
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] group-hover:text-purple-300 transition-colors leading-snug">
                Apache Iceberg vs Delta Lake UniForm: 2026 Metastore Showdown
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                Unified multi-engine catalog governance across Snowflake Polaris, Unity, and OneLake.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-semibold text-blue-400 flex items-center gap-1">
              <span>Compare Catalogs</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
