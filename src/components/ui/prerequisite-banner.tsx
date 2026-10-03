"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Compass, ChevronDown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PrerequisiteItem {
  term: string;
  conceptId?: string;
  whyNeeded: string;
}

interface PrerequisiteBannerProps {
  moduleTitle: string;
  prerequisites: PrerequisiteItem[];
  className?: string;
}

export function PrerequisiteBanner({
  moduleTitle,
  prerequisites,
  className,
}: PrerequisiteBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (isDismissed || prerequisites.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-[var(--surface-1)] to-[var(--surface-1)] p-4 sm:p-5 transition-all shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
            <Compass size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                Foundational Checklist
              </span>
              <span className="text-xs text-[var(--muted-foreground)] hidden sm:inline">
                Cognitive Scaffolding
              </span>
            </div>
            <h4 className="text-sm font-bold text-[var(--foreground)] mt-0.5">
              Before You Dive Into {moduleTitle}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors text-xs flex items-center gap-1"
            aria-label="Toggle prerequisites checklist"
          >
            <ChevronDown
              size={15}
              className={cn("transition-transform duration-200", isExpanded && "rotate-180")}
            />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1 rounded-md hover:bg-[var(--surface-2)] transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3.5 pt-3 border-t border-cyan-500/20 space-y-2 text-xs">
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            Mastering this module requires familiarity with these core foundations. If you are new to them, review the concepts first:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {prerequisites.map((item, idx) => (
              <Link
                key={idx}
                href={
                  item.conceptId
                    ? `/concepts?card=${item.conceptId}`
                    : `/concepts?term=${encodeURIComponent(item.term)}`
                }
                className="group p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)] group-hover:text-cyan-300">
                    <BookOpen size={13} className="text-cyan-400 shrink-0" />
                    <span>{item.term}</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-1 leading-snug">
                    {item.whyNeeded}
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-cyan-400 group-hover:underline flex items-center gap-1">
                  <span>Review concept</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
