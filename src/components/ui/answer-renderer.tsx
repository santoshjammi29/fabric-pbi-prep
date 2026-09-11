"use client";

import React, { useMemo } from "react";
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

// Helper to format inline bold text and code spans
function renderFormattedText(text: string) {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const codeMatch = remaining.match(/`([^`]+)`/);
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);

    const matches = [
      codeMatch ? { type: "code", index: codeMatch.index!, length: codeMatch[0].length, content: codeMatch[1] } : null,
      boldMatch ? { type: "bold", index: boldMatch.index!, length: boldMatch[0].length, content: boldMatch[1] } : null,
      italicMatch ? { type: "italic", index: italicMatch.index!, length: italicMatch[0].length, content: italicMatch[1] } : null,
    ].filter(Boolean).sort((a, b) => a!.index - b!.index);

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches[0]!;
    if (first.index > 0) {
      parts.push(remaining.substring(0, first.index));
    }

    if (first.type === "code") {
      parts.push(
        <code
          key={`code-${key++}`}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[#1e2638] text-purple-300 font-mono text-[11px] sm:text-[12px] border border-purple-500/20"
        >
          {first.content}
        </code>
      );
    } else if (first.type === "bold") {
      parts.push(
        <strong key={`bold-${key++}`} className="font-semibold text-[var(--foreground)] opacity-100">
          {first.content}
        </strong>
      );
    } else if (first.type === "italic") {
      parts.push(
        <em key={`italic-${key++}`} className="italic text-slate-300">
          {first.content}
        </em>
      );
    }

    remaining = remaining.substring(first.index + first.length);
  }

  return <>{parts}</>;
}

interface ContentSegment {
  type: "text" | "code";
  content: string;
  language?: string;
}

function parseSegments(raw: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = raw.substring(lastIndex, match.index).trim();
      if (textBefore) {
        segments.push({ type: "text", content: textBefore });
      }
    }
    segments.push({
      type: "code",
      language: match[1] || "python",
      content: match[2].trimEnd(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < raw.length) {
    const textAfter = raw.substring(lastIndex).trim();
    if (textAfter) {
      segments.push({ type: "text", content: textAfter });
    }
  }

  return segments;
}

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
    return <GeneralMarkdownRenderer text={cleanText} className={className} compact={compact} />;
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
          icon: <Layers size={15} className="text-purple-400 shrink-0" />,
          badge: "PHASE 1 · CORE ARCHITECTURE & SYSTEM DESIGN",
          badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
          cardBorder: "border-purple-500/20 bg-[#121622]/90",
        };
      case 2:
        return {
          icon: <Code2 size={15} className="text-sky-400 shrink-0" />,
          badge: "PHASE 2 · PRODUCTION IMPLEMENTATION & MECHANICS",
          badgeColor: "text-sky-400 bg-sky-500/10 border-sky-500/30",
          cardBorder: "border-sky-500/20 bg-[#0f172a]/90",
        };
      case 3:
      default:
        return {
          icon: <ShieldAlert size={15} className="text-amber-400 shrink-0" />,
          badge: "PHASE 3 · HARDENING, EDGE CASES & REMEDIATION",
          badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
          cardBorder: "border-amber-500/20 bg-[#17141f]/90",
        };
    }
  }, [phaseNum]);

  const segments = useMemo(() => parseSegments(rawContent), [rawContent]);

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5 transition-all shadow-lg backdrop-blur-sm",
        theme.cardBorder,
        compact && "p-3 sm:p-3.5 space-y-2.5"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
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
          <Phase3HardeningBody content={rawContent} compact={compact} />
        ) : (
          segments.map((seg, idx) => {
            if (seg.type === "code") {
              return (
                <div key={idx} className="my-3">
                  <CodeBlock
                    code={seg.content}
                    language={seg.language || "python"}
                    filename={`${seg.language || "snippet"}_impl.${seg.language === "sql" ? "sql" : "py"}`}
                    className="shadow-xl"
                  />
                </div>
              );
            }

            return (
              <div key={idx} className="space-y-2 text-[var(--foreground)] opacity-90 leading-relaxed">
                <TextContentRenderer text={seg.content} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Phase3HardeningBody({ content, compact }: { content: string; compact?: boolean }) {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const bulletItems = lines.filter((l) => l.startsWith("-") || l.startsWith("*"));

  if (bulletItems.length === 0) {
    return (
      <div className="space-y-2 text-[var(--foreground)] opacity-90 leading-relaxed">
        <TextContentRenderer text={content} />
      </div>
    );
  }

  return (
    <div className="space-y-2.5 pt-1">
      {lines.map((line, idx) => {
        if (!line.startsWith("-") && !line.startsWith("*")) {
          return (
            <p key={idx} className="text-xs sm:text-sm text-[var(--foreground)] opacity-85 leading-relaxed">
              {renderFormattedText(line)}
            </p>
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
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {renderFormattedText(mainPart.trim())}
              </div>
            </div>

            {remediationPart && (
              <div className="ml-5 mt-1.5 pt-1.5 border-t border-amber-500/15 flex items-start gap-1.5 text-[11px] sm:text-xs text-emerald-300">
                <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px] mr-1">
                    Mitigation:
                  </span>
                  {renderFormattedText(remediationPart.trim())}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TextContentRenderer({ text }: { text: string }) {
  const paragraphs = text.split("\n\n").filter(Boolean);

  return (
    <>
      {paragraphs.map((para, pIdx) => {
        const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
        const isOrderedList = lines.length > 1 && lines.every((l) => /^\d+[\.)]\s/.test(l));

        if (isOrderedList) {
          return (
            <div key={pIdx} className="space-y-2 my-2">
              {lines.map((line, lIdx) => {
                const match = line.match(/^(\d+)[\.)]\s*(.*)$/);
                const num = match ? match[1] : `${lIdx + 1}`;
                const rest = match ? match[2] : line;

                return (
                  <div key={lIdx} className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold shrink-0 mt-0.5">
                      {num}
                    </span>
                    <div className="flex-1 text-xs sm:text-sm text-[var(--foreground)] opacity-95 leading-relaxed">
                      {renderFormattedText(rest)}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        return (
          <p key={pIdx} className="text-xs sm:text-sm text-[var(--foreground)] opacity-90 leading-relaxed">
            {lines.map((l, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderFormattedText(l)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

function GeneralMarkdownRenderer({
  text,
  className,
  compact,
}: {
  text: string;
  className?: string;
  compact?: boolean;
}) {
  const segments = useMemo(() => parseSegments(text), [text]);

  return (
    <div className={cn("space-y-3 text-xs sm:text-sm", className)}>
      {segments.map((seg, idx) => {
        if (seg.type === "code") {
          return (
            <div key={idx} className="my-2.5">
              <CodeBlock
                code={seg.content}
                language={seg.language || "python"}
                filename={`${seg.language || "code"}_snippet.${seg.language === "sql" ? "sql" : "py"}`}
              />
            </div>
          );
        }

        return (
          <div key={idx} className="space-y-2 text-[var(--foreground)] leading-relaxed">
            <TextContentRenderer text={seg.content} />
          </div>
        );
      })}
    </div>
  );
}

export default AnswerRenderer;
