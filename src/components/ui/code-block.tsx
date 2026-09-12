"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Copy, Check, Terminal, WrapText, AlignLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-typescript";

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
  badge?: string;
}

interface LineToken {
  type: string;
  content: string;
}

const tokenClasses: Record<string, string> = {
  comment: "text-slate-500 italic selection:text-slate-400",
  prolog: "text-slate-500 italic",
  doctype: "text-slate-500 italic",
  cdata: "text-slate-500 italic",
  string: "text-emerald-400 font-normal selection:text-emerald-200",
  "triple-quoted-string": "text-emerald-400 font-normal selection:text-emerald-200",
  char: "text-emerald-400",
  keyword: "text-purple-400 font-semibold selection:text-purple-200",
  boolean: "text-amber-400 font-medium selection:text-amber-200",
  number: "text-orange-300 selection:text-orange-100",
  builtin: "text-cyan-300 font-medium selection:text-cyan-100",
  "class-name": "text-cyan-300 font-medium",
  function: "text-sky-300 font-normal selection:text-sky-100",
  decorator: "text-amber-400 font-medium selection:text-amber-200",
  operator: "text-pink-400 selection:text-pink-200",
  punctuation: "text-slate-400 selection:text-slate-200",
  variable: "text-blue-300 selection:text-blue-100",
  property: "text-cyan-200",
  text: "text-slate-200 selection:text-white",
};

function getLanguageConfig(lang: string): { label: string; ext: string; color: string; bg: string; prismGrammar: Prism.Grammar } {
  const l = (lang || "").toLowerCase();
  if (l.includes("pyspark") || l.includes("polars") || l.includes("python") || l === "py") {
    return {
      label: l.includes("pyspark") ? "PySpark" : l.includes("polars") ? "Polars" : "Python",
      ext: ".py",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      prismGrammar: Prism.languages.python || Prism.languages.javascript,
    };
  }
  if (l.includes("sparksql") || l.includes("duckdb") || l.includes("sql") || l.includes("mssql") || l.includes("t-sql") || l.includes("bigquery") || l.includes("snowflake")) {
    return {
      label: l.includes("sparksql") ? "Spark SQL" : l.includes("duckdb") ? "DuckDB" : l.includes("mssql") || l.includes("t-sql") ? "T-SQL" : "SQL",
      ext: ".sql",
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
      prismGrammar: Prism.languages.sql || Prism.languages.javascript,
    };
  }
  if (l.includes("bash") || l.includes("shell") || l.includes("sh") || l.includes("zsh")) {
    return {
      label: "Bash",
      ext: ".sh",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      prismGrammar: Prism.languages.bash || Prism.languages.javascript,
    };
  }
  if (l.includes("json")) {
    return {
      label: "JSON",
      ext: ".json",
      color: "text-pink-400",
      bg: "bg-pink-500/10 border-pink-500/20",
      prismGrammar: Prism.languages.json || Prism.languages.javascript,
    };
  }
  if (l.includes("typescript") || l.includes("ts") || l.includes("javascript") || l.includes("js")) {
    return {
      label: l.includes("ts") ? "TypeScript" : "JavaScript",
      ext: l.includes("ts") ? ".ts" : ".js",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
      prismGrammar: Prism.languages.typescript || Prism.languages.javascript,
    };
  }

  return {
    label: lang.toUpperCase() || "CODE",
    ext: "",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    prismGrammar: Prism.languages.python || Prism.languages.javascript,
  };
}

// Convert Prism tokens stream into per-line token arrays while preserving newlines & indentation
function tokenizeCodeToLines(code: string, grammar: Prism.Grammar): LineToken[][] {
  const rawTokens = Prism.tokenize(code, grammar);
  const lines: LineToken[][] = [[]];

  function processToken(token: string | Prism.Token, inheritedType?: string) {
    if (typeof token === "string") {
      const parts = token.split("\n");
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) lines.push([]);
        if (parts[i].length > 0) {
          lines[lines.length - 1].push({
            type: inheritedType || "text",
            content: parts[i],
          });
        }
      }
    } else if (Array.isArray(token.content)) {
      token.content.forEach((sub) => processToken(sub, token.type));
    } else if (typeof token.content === "string") {
      const parts = token.content.split("\n");
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) lines.push([]);
        if (parts[i].length > 0) {
          lines[lines.length - 1].push({
            type: token.type,
            content: parts[i],
          });
        }
      }
    } else if (token.content instanceof Prism.Token) {
      processToken(token.content, token.type);
    }
  }

  rawTokens.forEach((t) => processToken(t));

  // Ensure empty lines contain a non-breaking space for height preservation
  return lines.map((l) => (l.length === 0 ? [{ type: "text", content: "\u00A0" }] : l));
}

export function CodeBlock({
  code,
  language = "python",
  filename,
  showLineNumbers = true,
  className,
  badge,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isWrap, setIsWrap] = useState(false);
  const [lineNumbersEnabled, setLineNumbersEnabled] = useState(showLineNumbers);

  const cleanCode = useMemo(() => (code || "").trim(), [code]);
  const langConfig = useMemo(() => getLanguageConfig(language), [language]);
  const displayFilename =
    filename || `${langConfig.label.toLowerCase().replace(/\s+/g, "_")}_snippet${langConfig.ext}`;

  const tokenizedLines = useMemo(() => {
    return tokenizeCodeToLines(cleanCode, langConfig.prismGrammar);
  }, [cleanCode, langConfig.prismGrammar]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      toast.success("Code snippet copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  }, [cleanCode]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-[#0A0A0B] overflow-hidden shadow-md my-4 font-mono transition-all",
        className
      )}
    >
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161618] border-b border-slate-800 text-xs select-none">
        {/* Left: Window Controls + Filename */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block" />
          </div>

          <div className="flex items-center gap-2 truncate">
            <Terminal size={13} className="text-slate-400 shrink-0" />
            <span className="text-slate-300 font-mono text-[11px] truncate">{displayFilename}</span>
            <span
              className={cn(
                "hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0",
                langConfig.bg,
                langConfig.color
              )}
            >
              {badge || langConfig.label}
            </span>
          </div>
        </div>

        {/* Right: Actions with spring physics feedback */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="hidden md:inline text-[10px] text-slate-500 font-mono mr-1">
            {tokenizedLines.length} {tokenizedLines.length === 1 ? "line" : "lines"}
          </span>

          {/* Toggle Line Numbers */}
          <button
            type="button"
            onClick={() => setLineNumbersEnabled((v) => !v)}
            title={lineNumbersEnabled ? "Hide line numbers" : "Show line numbers"}
            aria-label="Toggle line numbers"
            className={cn(
              "min-h-[30px] px-2 py-1 rounded-lg transition-all text-xs font-mono flex items-center gap-1 touch-manipulation cursor-pointer",
              lineNumbersEnabled
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            )}
          >
            <AlignLeft size={13} />
            <span className="hidden sm:inline text-[10px]">#</span>
          </button>

          {/* Toggle Word Wrap */}
          <button
            type="button"
            onClick={() => setIsWrap((v) => !v)}
            title={isWrap ? "Disable wrap (scroll)" : "Enable word wrap"}
            aria-label="Toggle word wrap"
            className={cn(
              "min-h-[30px] px-2.5 py-1 rounded-lg transition-all text-xs flex items-center gap-1.5 touch-manipulation cursor-pointer",
              isWrap
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            )}
          >
            <WrapText size={13} />
            <span className="hidden sm:inline text-[11px]">Wrap</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy code to clipboard"
            className="min-h-[32px] flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 active:scale-95 text-blue-300 text-xs font-semibold border border-blue-500/30 shadow-sm transition-all touch-manipulation cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-blue-300" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="relative">
        <pre
          className={cn(
            "m-0 p-3.5 sm:p-4 text-[12px] sm:text-[13px] leading-[1.7] font-mono tracking-tight text-slate-200 overflow-x-auto bg-[#0A0A0B] selection:bg-blue-500/30 selection:text-blue-100 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent",
            isWrap && "whitespace-pre-wrap break-words"
          )}
        >
          <code>
            {tokenizedLines.map((tokens, idx) => (
              <div
                key={idx}
                className="group/line flex items-baseline hover:bg-white/[0.03] -mx-3.5 sm:-mx-4 px-3.5 sm:px-4 py-0 rounded transition-colors"
              >
                {lineNumbersEnabled && (
                  <span
                    className="select-none shrink-0 w-8 sm:w-9 pr-3 sm:pr-3.5 text-right text-[11px] text-slate-600 group-hover/line:text-slate-400 font-mono tracking-tighter"
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </span>
                )}
                <span className="flex-1">
                  {tokens.map((t, ti) => {
                    const tokenClass = tokenClasses[t.type] || tokenClasses.text;
                    return (
                      <span key={ti} className={tokenClass}>
                        {t.content}
                      </span>
                    );
                  })}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

export default CodeBlock;
