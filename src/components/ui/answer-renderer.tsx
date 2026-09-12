"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  Layers,
  Code2,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/ui/code-block";

interface AnswerRendererProps {
  text: string;
  className?: string;
  compact?: boolean;
}

interface ParsedPhase {
  phaseNum: number;
  title: string;
  rawContent: string;
}

// Markdown component renderers for AST-based parsing
const markdownComponents = {
  pre({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
  },
  code({
    className,
    children,
    ...props
  }: {
    className?: string;
    children?: React.ReactNode;
  }) {
    const match = /language-(\w+)/.exec(className || "");
    if (match) {
      const lang = match[1];
      const codeString = String(children || "").replace(/\n$/, "");
      return (
        <CodeBlock
          code={codeString}
          language={lang}
          filename={`${lang}_impl.${lang === "sql" ? "sql" : "py"}`}
        />
      );
    }
    return (
      <code
        className="px-1.5 py-0.5 mx-0.5 rounded bg-[#161618] text-blue-300 font-mono text-[11px] sm:text-[12px] border border-slate-800"
        {...props}
      >
        {children}
      </code>
    );
  },
  strong({ children }: { children?: React.ReactNode }) {
    return <strong className="font-semibold text-white">{children}</strong>;
  },
  p({ children }: { children?: React.ReactNode }) {
    return <p className="leading-relaxed my-1.5 text-slate-200">{children}</p>;
  },
  ul({ children }: { children?: React.ReactNode }) {
    return (
      <ul className="space-y-2 my-2.5 list-disc list-outside pl-5 marker:text-purple-400">
        {children}
      </ul>
    );
  },
  ol({ children }: { children?: React.ReactNode }) {
    return (
      <ol className="space-y-3 my-2.5 list-decimal list-outside pl-5 marker:text-purple-400 marker:font-semibold">
        {children}
      </ol>
    );
  },
  li({ children }: { children?: React.ReactNode }) {
    return (
      <li className="text-slate-200 leading-relaxed text-xs sm:text-sm [&>p:first-child]:inline [&>p+p]:block [&>p+p]:mt-1.5 [&>p]:my-0">
        {children}
      </li>
    );
  },
  blockquote({ children }: { children?: React.ReactNode }) {
    return (
      <blockquote className="border-l-2 border-blue-500 pl-3.5 py-1.5 my-2.5 bg-blue-500/[0.06] rounded-r-xl text-slate-300 text-xs sm:text-sm">
        {children}
      </blockquote>
    );
  },
};

export function AnswerRenderer({ text, className, compact = false }: AnswerRendererProps) {
  const cleanText = useMemo(() => (text || "").trim(), [text]);

  const phases = useMemo<ParsedPhase[]>(() => {
    if (!cleanText.includes("### Phase")) return [];

    const phaseRegex = /###\s*Phase\s*(\d+)[:\s]*([^\n]*)\n([\s\S]*?)(?=(?:###\s*Phase\s*\d+|$))/gi;
    const matches: ParsedPhase[] = [];
    let match: RegExpExecArray | null;

    while ((match = phaseRegex.exec(cleanText)) !== null) {
      matches.push({
        phaseNum: parseInt(match[1], 10),
        title: (match[2] || "").trim(),
        rawContent: (match[3] || "").trim(),
      });
    }

    return matches;
  }, [cleanText]);

  if (phases.length === 0) {
    return (
      <div className={cn("space-y-3 text-xs sm:text-sm leading-relaxed", className)}>
        <ReactMarkdown components={markdownComponents}>{cleanText}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 text-xs sm:text-sm", className)}>
      {phases.map((phase) => (
        <PhaseCard key={phase.phaseNum} phase={phase} compact={compact} />
      ))}
    </div>
  );
}

function PhaseCard({ phase, compact }: { phase: ParsedPhase; compact?: boolean }) {
  const { phaseNum, title, rawContent } = phase;

  const theme = useMemo(() => {
    switch (phaseNum) {
      case 1:
        return {
          icon: <Layers size={15} className="text-blue-400 shrink-0" />,
          badge: "PHASE 1 · CORE ARCHITECTURE & DESIGN",
          badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
          cardBorder: "border-slate-800 bg-[#161618]",
        };
      case 2:
        return {
          icon: <Code2 size={15} className="text-emerald-400 shrink-0" />,
          badge: "PHASE 2 · PRODUCTION IMPLEMENTATION & MECHANICS",
          badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
          cardBorder: "border-slate-800 bg-[#161618]",
        };
      case 3:
      default:
        return {
          icon: <ShieldAlert size={15} className="text-amber-400 shrink-0" />,
          badge: "PHASE 3 · HARDENING, EDGE CASES & REMEDIATION",
          badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
          cardBorder: "border-slate-800 bg-[#161618]",
        };
    }
  }, [phaseNum]);

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5 transition-all shadow-sm backdrop-blur-sm",
        theme.cardBorder,
        compact && "p-3 sm:p-3.5 space-y-2.5"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          {theme.icon}
          <span className="font-bold text-xs sm:text-sm tracking-wide text-white truncate">
            {title || `Phase ${phaseNum}`}
          </span>
        </div>
        <span
          className={cn(
            "text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0",
            theme.badgeColor
          )}
        >
          {theme.badge}
        </span>
      </div>

      <div className="pt-2 space-y-3">
        {phaseNum === 3 ? (
          <Phase3HardeningBody content={rawContent} />
        ) : (
          <ReactMarkdown components={markdownComponents}>{rawContent}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}

function Phase3HardeningBody({ content }: { content: string }) {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const bulletItems = lines.filter((l) => l.startsWith("-") || l.startsWith("*"));

  if (bulletItems.length === 0) {
    return <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>;
  }

  return (
    <div className="space-y-2.5 pt-1">
      {lines.map((line, idx) => {
        if (!line.startsWith("-") && !line.startsWith("*")) {
          return (
            <div key={idx} className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              <ReactMarkdown components={markdownComponents}>{line}</ReactMarkdown>
            </div>
          );
        }

        const rawItem = line.replace(/^[-*]\s*/, "");
        const remediationSplit = rawItem.split(/\*Remediation\*:/i);
        const mainPart = remediationSplit[0] || rawItem;
        const remediationPart = remediationSplit[1] || null;

        return (
          <div
            key={idx}
            className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3 sm:p-3.5 space-y-1.5 transition-colors hover:border-amber-500/40"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed flex-1">
                <ReactMarkdown components={markdownComponents}>{mainPart.trim()}</ReactMarkdown>
              </div>
            </div>

            {remediationPart && (
              <div className="ml-5 mt-1.5 pt-1.5 border-t border-amber-500/15 flex items-start gap-1.5 text-[11px] sm:text-xs text-emerald-300">
                <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px] mr-1">
                    Mitigation:
                  </span>
                  <ReactMarkdown components={markdownComponents}>{remediationPart.trim()}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AnswerRenderer;
