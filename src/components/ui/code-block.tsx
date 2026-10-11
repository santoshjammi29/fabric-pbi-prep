"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  Copy,
  Check,
  Terminal,
  WrapText,
  AlignLeft,
  Code2,
  Eye,
  RotateCcw,
  Type,
} from "lucide-react";
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
  allowEdit?: boolean;
}

interface LineToken {
  type: string;
  content: string;
}

type FontSize = "compact" | "normal" | "large";

const tokenClasses: Record<string, string> = {
  comment: "text-slate-400/90 italic selection:text-slate-300",
  prolog: "text-slate-400 italic",
  doctype: "text-slate-400 italic",
  cdata: "text-slate-400 italic",
  string: "text-emerald-400 dark:text-emerald-400 font-normal selection:text-emerald-200",
  "triple-quoted-string": "text-emerald-300/95 font-normal selection:text-emerald-100",
  char: "text-emerald-400",
  keyword: "text-purple-400 dark:text-purple-300 font-semibold selection:text-purple-200",
  boolean: "text-amber-300 font-semibold selection:text-amber-100",
  number: "text-amber-300 font-mono selection:text-amber-100",
  builtin: "text-cyan-300 font-medium selection:text-cyan-100",
  "class-name": "text-cyan-300 font-semibold",
  function: "text-sky-300 dark:text-sky-300 font-semibold selection:text-sky-100",
  decorator: "text-amber-400 font-medium selection:text-amber-200",
  operator: "text-pink-400 selection:text-pink-200",
  punctuation: "text-slate-400 selection:text-slate-200",
  variable: "text-slate-100 dark:text-slate-100 selection:text-white",
  property: "text-cyan-200",
  text: "text-slate-200 dark:text-slate-100 selection:text-white",
};

function getLanguageConfig(lang: string): {
  label: string;
  ext: string;
  color: string;
  bg: string;
  prismGrammar: Prism.Grammar;
} {
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
  if (
    l.includes("sparksql") ||
    l.includes("duckdb") ||
    l.includes("sql") ||
    l.includes("mssql") ||
    l.includes("t-sql") ||
    l.includes("bigquery") ||
    l.includes("snowflake")
  ) {
    return {
      label: l.includes("sparksql")
        ? "Spark SQL"
        : l.includes("duckdb")
        ? "DuckDB"
        : l.includes("mssql") || l.includes("t-sql")
        ? "T-SQL"
        : "SQL",
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
  if (
    l.includes("typescript") ||
    l.includes("ts") ||
    l.includes("javascript") ||
    l.includes("js")
  ) {
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
  allowEdit = true,
}: CodeBlockProps) {
  const initialCode = useMemo(() => (code || "").trim(), [code]);
  const [activeCode, setActiveCode] = useState<string>(initialCode);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [isWrap, setIsWrap] = useState(false);
  const [lineNumbersEnabled, setLineNumbersEnabled] = useState(showLineNumbers);
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync if upstream code prop changes
  React.useEffect(() => {
    setActiveCode((code || "").trim());
  }, [code]);

  const langConfig = useMemo(() => getLanguageConfig(language), [language]);
  const displayFilename =
    filename || `${langConfig.label.toLowerCase().replace(/\s+/g, "_")}_snippet${langConfig.ext}`;

  const tokenizedLines = useMemo(() => {
    return tokenizeCodeToLines(activeCode, langConfig.prismGrammar);
  }, [activeCode, langConfig.prismGrammar]);

  const hasModified = activeCode !== initialCode;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      toast.success("Code snippet copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  }, [activeCode]);

  const handleReset = useCallback(() => {
    setActiveCode(initialCode);
    toast.info("Restored original code template");
  }, [initialCode]);

  // Handle Tab key in editor mode to indent 2 spaces instead of leaving textarea
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;

        // Insert 2 spaces
        const updated = value.substring(0, start) + "  " + value.substring(end);
        setActiveCode(updated);

        // Reposition cursor
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
    },
    []
  );

  const cycleFontSize = useCallback(() => {
    setFontSize((prev) => {
      if (prev === "compact") return "normal";
      if (prev === "normal") return "large";
      return "compact";
    });
  }, []);

  const fontSizeClasses = {
    compact: "text-[12px] leading-[1.65]",
    normal: "text-[13.5px] leading-[1.75]",
    large: "text-[15px] leading-[1.85]",
  }[fontSize];

  return (
    <div
      className={cn(
        "code-block-container rounded-xl border border-slate-200 dark:border-slate-800 bg-[#0A0A0B] overflow-hidden shadow-xs my-2 sm:my-2.5 font-mono transition-all",
        className
      )}
    >
      {/* Code Header Bar */}
      <div className="code-block-header flex items-center justify-between px-3 py-1.5 bg-slate-100 dark:bg-[#161618] border-b border-slate-200 dark:border-slate-800 text-xs select-none">
        {/* Left: Window Controls + Filename + Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1 shrink-0" aria-hidden="true">
            <span className="w-2 h-2 rounded-full bg-red-500/70 inline-block" />
            <span className="w-2 h-2 rounded-full bg-amber-500/70 inline-block" />
            <span className="w-2 h-2 rounded-full bg-emerald-500/70 inline-block" />
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <Terminal size={12} className="text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold truncate">
              {displayFilename}
            </span>
            <span
              className={cn(
                "hidden sm:inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold border shrink-0",
                langConfig.bg,
                langConfig.color
              )}
            >
              {badge || langConfig.label}
            </span>

            {hasModified && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Modified
              </span>
            )}
          </div>
        </div>

        {/* Right: Code Editor Action Bar */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Edit / Scratchpad Mode Toggle */}
          {allowEdit && (
            <button
              type="button"
              onClick={() => setIsEditing((v) => !v)}
              title={isEditing ? "Switch to syntax preview" : "Open scratchpad code editor"}
              aria-label="Toggle scratchpad code editor"
              className={cn(
                "h-6 px-1.5 py-0.5 rounded-md transition-all text-xs font-mono flex items-center gap-1 touch-manipulation cursor-pointer",
                isEditing
                  ? "bg-purple-600 text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
              )}
            >
              {isEditing ? <Eye size={11} /> : <Code2 size={11} />}
              <span className="hidden sm:inline text-[10px]">
                {isEditing ? "Preview" : "Scratchpad"}
              </span>
            </button>
          )}

          {/* Reset button if modified */}
          {hasModified && (
            <button
              type="button"
              onClick={handleReset}
              title="Reset code to original template"
              aria-label="Reset code template"
              className="h-6 px-1.5 py-0.5 rounded-md text-amber-400 hover:bg-amber-500/10 transition-colors text-xs flex items-center gap-1"
            >
              <RotateCcw size={11} />
              <span className="hidden sm:inline text-[9px]">Reset</span>
            </button>
          )}

          {/* Font Size Adjuster Button */}
          <button
            type="button"
            onClick={cycleFontSize}
            title={`Font size: ${fontSize} (click to cycle 12px / 13.5px / 15px)`}
            aria-label="Adjust font size"
            className="h-6 px-1.5 py-0.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-xs font-mono flex items-center gap-1 cursor-pointer"
          >
            <Type size={11} />
            <span className="text-[9px] uppercase font-bold">{fontSize[0]}</span>
          </button>

          {/* Toggle Line Numbers */}
          <button
            type="button"
            onClick={() => setLineNumbersEnabled((v) => !v)}
            title={lineNumbersEnabled ? "Hide line numbers" : "Show line numbers"}
            aria-label="Toggle line numbers"
            className={cn(
              "h-6 px-1.5 py-0.5 rounded-md transition-all text-xs font-mono flex items-center gap-1 touch-manipulation cursor-pointer",
              lineNumbersEnabled
                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
            )}
          >
            <AlignLeft size={11} />
            <span className="hidden sm:inline text-[9px]">#</span>
          </button>

          {/* Toggle Word Wrap */}
          <button
            type="button"
            onClick={() => setIsWrap((v) => !v)}
            title={isWrap ? "Disable wrap (scroll)" : "Enable word wrap"}
            aria-label="Toggle word wrap"
            className={cn(
              "h-6 px-2 py-0.5 rounded-md transition-all text-xs flex items-center gap-1 touch-manipulation cursor-pointer",
              isWrap
                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
            )}
          >
            <WrapText size={11} />
            <span className="hidden sm:inline text-[10px]">Wrap</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy code to clipboard"
            className="h-6 flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-500/30 shadow-xs transition-all touch-manipulation cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={11} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                  Copied
                </span>
              </>
            ) : (
              <>
                <Copy size={11} className="text-blue-700 dark:text-blue-300" />
                <span className="text-[10px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body: Preview Mode vs Interactive Editor Mode */}
      <div className="relative">
        {isEditing ? (
          <div className="code-block-editor relative flex bg-[#0A0A0B]">
            {/* Editor Line Numbers */}
            {lineNumbersEnabled && (
              <div
                className="code-block-linenumbers select-none py-2.5 px-2 text-right text-slate-500 bg-[#07090c] border-r border-slate-800/80 font-mono tracking-normal text-[11px]"
                aria-hidden="true"
              >
                {activeCode.split("\n").map((_, i) => (
                  <div key={i} className="leading-[1.65]">
                    {i + 1}
                  </div>
                ))}
              </div>
            )}

            {/* Editable Textarea */}
            <textarea
              ref={textareaRef}
              value={activeCode}
              onChange={(e) => setActiveCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className={cn(
                "code-block-textarea w-full bg-[#0A0A0B] text-slate-100 font-mono p-2.5 sm:p-3 outline-none resize-y min-h-[120px] tracking-normal border-none focus:ring-0 selection:bg-purple-500/30",
                fontSizeClasses,
                isWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto"
              )}
              style={{
                fontFamily:
                  "var(--font-mono), 'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, Menlo, Consolas, monospace",
                fontFeatureSettings: '"calt" 1, "liga" 1',
              }}
              placeholder="Edit code snippet here or test your modifications..."
            />
          </div>
        ) : (
          <pre
            className={cn(
              "code-block m-0 p-2.5 sm:p-3 font-mono tracking-normal text-slate-200 overflow-x-auto bg-[#0A0A0B] selection:bg-blue-500/30 selection:text-blue-100 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent",
              fontSizeClasses,
              isWrap && "whitespace-pre-wrap break-words"
            )}
            style={{
              fontFamily:
                "var(--font-mono), 'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, Menlo, Consolas, monospace",
              fontFeatureSettings: '"calt" 1, "liga" 1',
            }}
          >
            <code>
              {tokenizedLines.map((tokens, idx) => (
                <div
                  key={idx}
                  className="group/line flex items-baseline hover:bg-white/[0.03] -mx-2.5 sm:-mx-3 px-2.5 sm:px-3 py-0 rounded transition-colors"
                >
                  {lineNumbersEnabled && (
                    <span
                      className="select-none shrink-0 w-7 sm:w-8 pr-2 sm:pr-2.5 text-right text-[11px] text-slate-500 group-hover/line:text-slate-400 font-mono tracking-normal"
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
        )}
      </div>

      {/* Editor Footer Status Bar */}
      {isEditing && (
        <div className="code-block-footer flex items-center justify-between px-3 py-1.5 bg-[#0e1217] border-t border-slate-800 text-[10px] text-slate-400 font-mono">
          <span>Scratchpad mode enabled · Press Tab to indent (2 spaces)</span>
          <span>{activeCode.split("\n").length} lines · {activeCode.length} chars</span>
        </div>
      )}
    </div>
  );
}

export default CodeBlock;
