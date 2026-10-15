"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Share2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Zap,
  AlertTriangle,
  Shield,
  FileCode2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { DatabricksCheatCard } from "@/types/data";

interface DatabricksCardProps {
  card: DatabricksCheatCard;
  isHighlighted?: boolean;
}

const DOMAIN_STYLES = {
  sparksql: {
    badgeBg: "bg-sky-500/10",
    badgeText: "text-sky-400",
    border: "border-sky-500/30",
    dot: "bg-sky-400",
  },
  pyspark: {
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  spark_core: {
    badgeBg: "bg-purple-500/10",
    badgeText: "text-purple-400",
    border: "border-purple-500/30",
    dot: "bg-purple-400",
  },
  python: {
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
};

const ALERT_STYLES = {
  tip: {
    icon: Lightbulb,
    container: "bg-sky-500/10 border-l-2 border-sky-400 text-sky-200",
    iconColor: "text-sky-400",
  },
  perf: {
    icon: Zap,
    container: "bg-emerald-500/10 border-l-2 border-emerald-400 text-emerald-200",
    iconColor: "text-emerald-400",
  },
  warn: {
    icon: AlertTriangle,
    container: "bg-amber-500/10 border-l-2 border-amber-400 text-amber-200",
    iconColor: "text-amber-400",
  },
  sec: {
    icon: Shield,
    container: "bg-purple-500/10 border-l-2 border-purple-400 text-purple-200",
    iconColor: "text-purple-400",
  },
};

export function DatabricksCard({ card, isHighlighted = false }: DatabricksCardProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(true);

  const style = DOMAIN_STYLES[card.domain] || DOMAIN_STYLES.sparksql;

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(card.code);
      setCopied(true);
      toast.success("Code snippet copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/cheat-sheet?tab=databricks&card=${card.id}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success("Direct link to card copied!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const alertConfig = card.alert ? ALERT_STYLES[card.alert.type] || ALERT_STYLES.tip : null;
  const AlertIcon = alertConfig?.icon || Lightbulb;

  return (
    <article
      id={card.id}
      className={cn(
        "group relative flex flex-col rounded-xl border bg-[#0d1424] text-slate-100 p-3 sm:p-4 transition-all duration-200 shadow-md hover:shadow-xl scroll-mt-24",
        isHighlighted
          ? "border-red-500 ring-2 ring-red-500/40 bg-[#10192e]"
          : "border-slate-800 hover:border-slate-700"
      )}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Domain badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border",
              style.badgeBg,
              style.badgeText,
              style.border
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
            {card.shortTitle}
          </span>

          {/* Tag */}
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
            {card.tag}
          </span>

          {/* Page & Card Number */}
          <span className="text-[10px] font-mono text-slate-500 font-semibold">
            P{card.page} • #{card.cardNumber}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleCopyCode}
            aria-label="Copy code snippet"
            title="Copy code"
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-[10px]">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span className="text-[10px]">Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Copy card link"
            title="Share direct link"
            className="p-1 rounded-md text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} />}
          </button>
        </div>
      </div>

      {/* Card Title */}
      <h3 className="text-sm sm:text-[15px] font-bold text-white tracking-tight mb-2.5 leading-snug">
        {card.title}
      </h3>

      {/* Code Block Container */}
      <div className="relative mb-3 rounded-lg border border-slate-800/90 bg-[#080c15] overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1 bg-slate-900/60 border-b border-slate-800/60 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <FileCode2 size={11} className="text-slate-400" />
            <span>{card.language.toUpperCase()}</span>
          </div>
          <span className="text-[9px] text-slate-500 uppercase">DBR 15.4+</span>
        </div>
        <pre className="p-3 text-[11px] sm:text-[11.5px] font-mono leading-relaxed overflow-x-auto text-slate-200 scrollbar-thin scrollbar-thumb-slate-700">
          <code>{card.code}</code>
        </pre>
      </div>

      {/* Code Breakdown & Mechanics Section */}
      {card.explain && card.explain.length > 0 && (
        <div className="mt-auto mb-2.5 rounded-lg border border-slate-800/70 bg-[#090e1c] p-2.5">
          <button
            type="button"
            onClick={() => setIsExplainOpen(!isExplainOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer group/exp"
          >
            <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5">
              <span>🔍 Code Breakdown &amp; Engine Mechanics</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 font-mono">
                {card.explain.length} Points
              </span>
            </span>
            <span className="text-slate-400 group-hover/exp:text-white transition-colors">
              {isExplainOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </span>
          </button>

          {isExplainOpen && (
            <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-slate-300 border-t border-slate-800/60 pt-2">
              {card.explain.map((exp, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-sky-400 shrink-0 font-bold select-none">•</span>
                  <div
                    className="[&>b]:text-white [&>b]:font-semibold [&>code]:font-mono [&>code]:text-[10px] [&>code]:text-sky-300 [&>code]:bg-slate-800/90 [&>code]:px-1 [&>code]:py-0.2 [&>code]:rounded"
                    dangerouslySetInnerHTML={{ __html: exp.html || exp.text }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Callout Alert Box */}
      {card.alert && alertConfig && (
        <div
          className={cn(
            "p-2.5 rounded-md text-[11px] leading-relaxed flex items-start gap-2",
            alertConfig.container
          )}
        >
          <AlertIcon size={14} className={cn("shrink-0 mt-0.5", alertConfig.iconColor)} />
          <div
            className="[&>b]:font-bold [&>b]:text-white [&>code]:font-mono [&>code]:text-[10px] [&>code]:bg-black/30 [&>code]:px-1 [&>code]:rounded"
            dangerouslySetInnerHTML={{ __html: card.alert.html || card.alert.text }}
          />
        </div>
      )}
    </article>
  );
}
