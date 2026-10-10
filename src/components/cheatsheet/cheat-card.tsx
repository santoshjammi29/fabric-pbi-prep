"use client";

import React, { useState } from "react";
import {
  Zap,
  Sliders,
  Clock,
  Bug,
  Database,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CheatCode, CheatCodeCategory, CheatCodeImpact } from "@/types/data";
import { CodeBlock } from "@/components/ui/code-block";

interface CheatCardProps {
  cheat: CheatCode;
  isHighlighted?: boolean;
  onSelectTag?: (tag: string) => void;
  onSelectCategory?: (category: CheatCodeCategory) => void;
}

const CATEGORY_ICONS: Record<CheatCodeCategory, React.ElementType> = {
  "Spark Core": Zap,
  "Spark Optimization": Sliders,
  Orchestration: Clock,
  "Debugging & Observability": Bug,
  "SQL & Storage": Database,
  "Production Best Practices": ShieldCheck,
};

const CATEGORY_COLORS: Record<CheatCodeCategory, { text: string; bg: string; border: string }> = {
  "Spark Core": { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  "Spark Optimization": { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  Orchestration: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  "Debugging & Observability": { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  "SQL & Storage": { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  "Production Best Practices": { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

const IMPACT_BADGES: Record<CheatCodeImpact, { text: string; bg: string; border: string }> = {
  Critical: { text: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30" },
  "High Impact": { text: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30" },
  "Architect Level": { text: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/30" },
  "Quick Win": { text: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
};

export function CheatCard({
  cheat,
  isHighlighted = false,
  onSelectTag,
  onSelectCategory,
}: CheatCardProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const Icon = CATEGORY_ICONS[cheat.category] || Zap;
  const categoryStyle = CATEGORY_COLORS[cheat.category] || CATEGORY_COLORS["Spark Core"];
  const impactStyle = IMPACT_BADGES[cheat.impact] || IMPACT_BADGES["High Impact"];

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/cheat-sheet?id=${cheat.id}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success("Direct link to cheat code copied!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <article
      id={cheat.id}
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-[var(--card)] p-5 transition-all duration-200 shadow-md hover:shadow-xl",
        isHighlighted
          ? "border-blue-500 ring-2 ring-blue-500/30 bg-blue-950/10"
          : "border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--card-hover)]"
      )}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Category Pill */}
          <button
            type="button"
            onClick={() => onSelectCategory?.(cheat.category)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
              categoryStyle.bg,
              categoryStyle.text,
              categoryStyle.border,
              "hover:brightness-125"
            )}
            title={`Filter by ${cheat.category}`}
          >
            <Icon size={13} />
            <span>{cheat.category}</span>
          </button>

          {/* Impact Badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
              impactStyle.bg,
              impactStyle.text,
              impactStyle.border
            )}
          >
            <Sparkles size={11} />
            {cheat.impact}
          </span>

          {/* Effort Badge */}
          <span className="text-[11px] text-[var(--muted-foreground)] font-medium">
            • {cheat.effort}
          </span>
        </div>

        {/* Share direct link */}
        <button
          type="button"
          onClick={handleShare}
          aria-label="Copy direct link"
          title="Copy link to this cheat code"
          className="shrink-0 p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
        >
          {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
        </button>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight group-hover:text-blue-400 transition-colors">
        {cheat.title}
      </h3>

      {/* Production Metrics Pill */}
      {cheat.metrics && (
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start">
          <Flame size={13} className="text-emerald-400 animate-pulse" />
          <span>{cheat.metrics}</span>
        </div>
      )}

      {/* Problem Callout */}
      <div className="mt-3.5 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--foreground)] leading-relaxed">
        <span className="font-semibold text-rose-400 block mb-1">Problem / Challenge:</span>
        {cheat.problem}
      </div>

      {/* Solution Description */}
      <div className="mt-2.5 text-xs text-[var(--foreground)] leading-relaxed">
        <span className="font-semibold text-blue-400">Production Solution: </span>
        {cheat.solution}
      </div>

      {/* Syntax-Highlighted Code Block */}
      <div className="mt-3">
        <CodeBlock
          code={cheat.codeSnippet}
          language={cheat.language}
          filename={`${cheat.id}.${cheat.language === "python" ? "py" : cheat.language === "sql" ? "sql" : "sh"}`}
          showLineNumbers={true}
        />
      </div>

      {/* Deep-Dive Expandable Section */}
      <div className="mt-2 pt-2 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="w-full flex items-center justify-between text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] py-1.5 transition-colors cursor-pointer"
        >
          <span>Production Impact & Gotchas</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {isExpanded && (
          <div className="space-y-3 pt-2 text-xs">
            {/* The Why */}
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
              <span className="font-bold text-blue-400 block mb-1">The &quot;Why&quot; (Production ROI):</span>
              <p className="text-[var(--foreground)] leading-relaxed">{cheat.whyItMatters}</p>
            </div>

            {/* Anti-Pattern Gotcha */}
            {cheat.antiPattern && (
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                  <AlertTriangle size={13} />
                  <span>Production Anti-Pattern to Avoid:</span>
                </div>
                <p className="text-[var(--foreground)] leading-relaxed">{cheat.antiPattern}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tags footer */}
      {cheat.tags && cheat.tags.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[var(--border)] flex flex-wrap items-center gap-1.5">
          <Tag size={11} className="text-[var(--muted-foreground)] mr-1" />
          {cheat.tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onSelectTag?.(t)}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono text-[var(--muted-foreground)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] hover:text-[var(--foreground)] border border-[var(--border)] transition-colors cursor-pointer"
            >
              #{t}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
