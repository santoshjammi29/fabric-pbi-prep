"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

// Compact markdown component renderers for seamless, readable answers
const markdownComponents = {
  h3({ children }: { children?: React.ReactNode }) {
    return (
      <h3 className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 mt-2.5 mb-1 flex items-center gap-1.5">
        {children}
      </h3>
    );
  },
  table({ children }: { children?: React.ReactNode }) {
    return (
      <div className="overflow-x-auto my-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)]">
        <table className="w-full text-left border-collapse text-xs">
          {children}
        </table>
      </div>
    );
  },
  thead({ children }: { children?: React.ReactNode }) {
    return (
      <thead className="bg-[var(--surface-2)] text-[var(--foreground)] font-semibold border-b border-[var(--border)]">
        {children}
      </thead>
    );
  },
  tbody({ children }: { children?: React.ReactNode }) {
    return (
      <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
        {children}
      </tbody>
    );
  },
  tr({ children }: { children?: React.ReactNode }) {
    return (
      <tr className="hover:bg-[var(--surface-2)]/60 transition-colors">
        {children}
      </tr>
    );
  },
  th({ children }: { children?: React.ReactNode }) {
    return (
      <th className="px-2.5 py-1.5 font-semibold text-[var(--foreground)] text-[11px] sm:text-xs tracking-wider border-b border-[var(--border)]">
        {children}
      </th>
    );
  },
  td({ children }: { children?: React.ReactNode }) {
    return (
      <td className="px-2.5 py-1.5 text-xs leading-relaxed text-[var(--foreground)]/90 border-t border-[var(--border)]/30">
        {children}
      </td>
    );
  },
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
      const ext =
        lang === "sql"
          ? "sql"
          : lang === "bash" || lang === "shell"
          ? "sh"
          : lang === "json"
          ? "json"
          : "py";
      return (
        <CodeBlock
          code={codeString}
          language={lang}
          filename={`${lang}_solution.${ext}`}
          showLineNumbers={true}
        />
      );
    }
    return (
      <code
        className="px-1.5 py-0.5 mx-0.5 rounded bg-[var(--surface-2)] text-blue-600 dark:text-blue-300 font-mono text-[11px] sm:text-xs border border-[var(--border)] font-medium tracking-tight"
        {...props}
      >
        {children}
      </code>
    );
  },
  strong({ children }: { children?: React.ReactNode }) {
    return <strong className="font-semibold text-[var(--foreground)]">{children}</strong>;
  },
  p({ children }: { children?: React.ReactNode }) {
    return <p className="leading-relaxed my-1 text-[var(--foreground)]/90 text-xs sm:text-sm">{children}</p>;
  },
  ul({ children }: { children?: React.ReactNode }) {
    return (
      <ul className="space-y-1 my-1.5 list-disc list-outside pl-5 marker:text-blue-500 dark:marker:text-blue-400">
        {children}
      </ul>
    );
  },
  ol({ children }: { children?: React.ReactNode }) {
    return (
      <ol className="space-y-1.5 my-1.5 list-decimal list-outside pl-5 marker:text-blue-500 dark:marker:text-blue-400 marker:font-semibold">
        {children}
      </ol>
    );
  },
  li({ children }: { children?: React.ReactNode }) {
    return (
      <li className="text-slate-700 dark:text-slate-200 leading-normal text-xs sm:text-sm [&>p:first-child]:inline [&>p+p]:block [&>p+p]:mt-1 [&>p]:my-0">
        {children}
      </li>
    );
  },
  blockquote({ children }: { children?: React.ReactNode }) {
    return (
      <blockquote className="border-l-2 border-blue-500 pl-3 py-1 my-1.5 bg-blue-500/[0.04] rounded-r-lg text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
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
      <div className={cn("space-y-2 text-xs sm:text-sm leading-relaxed", className)}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{cleanText}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3 text-xs sm:text-sm divide-y divide-[var(--border)]/60", className)}>
      {phases.map((phase) => (
        <PhaseSection key={phase.phaseNum} phase={phase} compact={compact} />
      ))}
    </div>
  );
}

function PhaseSection({
  phase,
  compact,
}: {
  phase: ParsedPhase;
  compact?: boolean;
}) {
  const { phaseNum, title, rawContent } = phase;

  const theme = useMemo(() => {
    switch (phaseNum) {
      case 1:
        return {
          icon: <Layers size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />,
          badge: "PHASE 1 · CORE ARCHITECTURE & DESIGN",
          badgeColor: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/25",
        };
      case 2:
        return {
          icon: <Code2 size={13} className="text-emerald-500 dark:text-emerald-400 shrink-0" />,
          badge: "PHASE 2 · PRODUCTION IMPLEMENTATION & MECHANICS",
          badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
        };
      case 3:
      default:
        return {
          icon: <ShieldAlert size={13} className="text-amber-500 dark:text-amber-400 shrink-0" />,
          badge: "PHASE 3 · HARDENING, EDGE CASES & REMEDIATION",
          badgeColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25",
        };
    }
  }, [phaseNum]);

  return (
    <div className={cn("pt-3 first:pt-0 space-y-1.5", compact && "space-y-1 pt-2")}>
      {/* Sleek inline section header without bulky boxes */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {theme.icon}
          <span className="font-bold text-xs sm:text-[13px] tracking-tight text-[var(--foreground)] truncate">
            {title || `Phase ${phaseNum}`}
          </span>
        </div>
        <span
          className={cn(
            "text-[9px] sm:text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0",
            theme.badgeColor
          )}
        >
          {theme.badge}
        </span>
      </div>

      {/* Content body */}
      <div className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
        {phaseNum === 3 ? (
          <Phase3HardeningBody content={rawContent} />
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{rawContent}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}

function Phase3HardeningBody({ content }: { content: string }) {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const bulletItems = lines.filter((l) => l.startsWith("-") || l.startsWith("*"));

  if (bulletItems.length === 0) {
    return <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{content}</ReactMarkdown>;
  }

  return (
    <div className="space-y-1.5 pt-0.5">
      {lines.map((line, idx) => {
        if (!line.startsWith("-") && !line.startsWith("*")) {
          return (
            <div key={idx} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed my-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{line}</ReactMarkdown>
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
            className="rounded-lg border-l-2 border-amber-500/70 bg-amber-500/[0.03] pl-2.5 pr-2 py-1.5 space-y-1 transition-colors hover:bg-amber-500/[0.06]"
          >
            <div className="flex items-start gap-1.5">
              <AlertTriangle size={13} className="text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-800 dark:text-slate-200 leading-snug flex-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{mainPart.trim()}</ReactMarkdown>
              </div>
            </div>

            {remediationPart && (
              <div className="ml-4 flex items-start gap-1.5 text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div className="flex-1 leading-snug">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px] mr-1">
                    Mitigation:
                  </span>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{remediationPart.trim()}</ReactMarkdown>
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
