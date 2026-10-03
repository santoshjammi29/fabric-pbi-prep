"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Compass, Sparkles, MessageSquare, Cpu, Code2, X } from "lucide-react";

export function HeroQuickStart() {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("dataprep_dismiss_quickstart") === "true") {
        setIsDismissed(true);
      }
    } catch {}
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem("dataprep_dismiss_quickstart", "true");
    } catch {}
  };

  if (isDismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/40 via-[var(--surface-1)] to-blue-950/30 border border-purple-500/30 p-5 sm:p-7 shadow-lg transition-all animate-in fade-in duration-300">
      {/* Decorative ambient glow */}
      <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative space-y-5">
        {/* Header with clear focus */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-bold text-purple-300">
                <Compass size={13} className="text-purple-400" />
                <span>Recommended Starting Path</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
              New to the Platform? Start Here
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-xl leading-relaxed">
              Follow our 6-step architect curriculum designed to take you from core data engineering definitions to multi-cloud enterprise system design.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/concepts"
              className="min-h-[40px] px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/25 inline-flex items-center gap-2 transition-all touch-manipulation cursor-pointer"
            >
              <span>Begin Step 1: Key Concepts</span>
              <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
              title="Dismiss quick-start guide"
              aria-label="Dismiss quick-start banner"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 4 Quick-Choice Cards Across All Core Tracks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* Card 1: Concepts */}
          <Link
            href="/concepts"
            className="group p-4 rounded-2xl bg-[var(--surface-2)]/80 hover:bg-[var(--surface-2)] border border-[var(--border)] hover:border-green-500/40 transition-all flex items-start gap-3.5 touch-manipulation"
          >
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center shrink-0 font-bold">
              <Sparkles size={18} />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Step 1 · 290 Topics</span>
                <span className="text-xs text-[var(--muted-foreground)] group-hover:text-green-400 transition-colors">→</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">Core Concepts Hub</h3>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                Foundational architectures, Fabric Direct Lake, and Delta protocols.
              </p>
            </div>
          </Link>

          {/* Card 2: Python DE Hub (NEW) */}
          <Link
            href="/python"
            className="group p-4 rounded-2xl bg-[var(--surface-2)]/80 hover:bg-[var(--surface-2)] border border-[var(--border)] hover:border-cyan-500/40 transition-all flex items-start gap-3.5 touch-manipulation"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 font-bold">
              <Code2 size={18} />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Code-First · NEW</span>
                <span className="text-xs text-[var(--muted-foreground)] group-hover:text-cyan-400 transition-colors">→</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">Python DE Hub</h3>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                Foundations to Principal Architect patterns with copyable code snippets.
              </p>
            </div>
          </Link>

          {/* Card 3: Live Simulators */}
          <Link
            href="/modern-stack#simulators"
            className="group p-4 rounded-2xl bg-[var(--surface-2)]/80 hover:bg-[var(--surface-2)] border border-[var(--border)] hover:border-purple-500/40 transition-all flex items-start gap-3.5 touch-manipulation"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 font-bold">
              <Cpu size={18} />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Interactive</span>
                <span className="text-xs text-[var(--muted-foreground)] group-hover:text-purple-400 transition-colors">→</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">6 Live Simulators</h3>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                Model Spark shuffles, query costs, cluster resources, and RAG chunks.
              </p>
            </div>
          </Link>

          {/* Card 4: Q&A Prep Hub */}
          <Link
            href="/qa-prep"
            className="group p-4 rounded-2xl bg-[var(--surface-2)]/80 hover:bg-[var(--surface-2)] border border-[var(--border)] hover:border-orange-500/40 transition-all flex items-start gap-3.5 touch-manipulation"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 font-bold">
              <MessageSquare size={18} />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Step 5 · 6,500+ Q&amp;As</span>
                <span className="text-xs text-[var(--muted-foreground)] group-hover:text-orange-400 transition-colors">→</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">Interview Prep Hub</h3>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                Practice interview questions with SM-2 spaced repetition flashcards.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
