"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Copy, Check, Terminal, WrapText, AlignLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
  badge?: string;
}

type TokenType =
  | "comment"
  | "string"
  | "keyword"
  | "builtin"
  | "function"
  | "decorator"
  | "number"
  | "operator"
  | "text";

interface Token {
  type: TokenType;
  content: string;
}

// Tokenize a single line with support for Python, PySpark, Polars, and SQL
function tokenizeLine(line: string, lang: string): Token[] {
  if (line.length === 0) {
    return [{ type: "text", content: "\u00A0" }];
  }

  const isSql = /sql|mssql|sparksql|duckdb|snowflake|bigquery/i.test(lang);
  const trimmed = line.trimStart();

  if (isSql && trimmed.startsWith("--")) {
    return [{ type: "comment", content: line }];
  }
  if (!isSql && trimmed.startsWith("#")) {
    return [{ type: "comment", content: line }];
  }

  const tokens: Token[] = [];
  let remaining = line;

  const patterns: { type: TokenType; regex: RegExp }[] = isSql
    ? [
        { type: "comment", regex: /^(--.*$)/ },
        { type: "string", regex: /^('[^']*'|"[^"]*")/ },
        {
          type: "keyword",
          regex:
            /^(SELECT|FROM|WHERE|JOIN|INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|FULL\s+OUTER\s+JOIN|CROSS\s+JOIN|ON|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|UNION\s+ALL|UNION|INTERSECT|EXCEPT|INSERT\s+INTO|UPDATE|DELETE|CREATE\s+TABLE|CREATE\s+OR\s+REPLACE|DROP\s+TABLE|ALTER\s+TABLE|WITH|AS|CASE|WHEN|THEN|ELSE|END|OVER|PARTITION\s+BY|DESC|ASC|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS\s+NULL|IS\s+NOT\s+NULL|MERGE\s+INTO|MATCHED|USING|QUALIFY|WINDOW)\b/i,
        },
        {
          type: "builtin",
          regex:
            /^(INT|BIGINT|SMALLINT|TINYINT|VARCHAR|NVARCHAR|TEXT|CHAR|DATE|TIMESTAMP|BOOLEAN|FLOAT|DOUBLE|DECIMAL|NUMERIC|STRING|ARRAY|MAP|STRUCT|VARIANT)\b/i,
        },
        {
          type: "function",
          regex:
            /^(COUNT|SUM|AVG|MIN|MAX|ROW_NUMBER|DENSE_RANK|RANK|LAG|LEAD|COALESCE|NULLIF|CAST|CONVERT|ROUND|TRIM|LOWER|UPPER|CONCAT|DATEDIFF|DATEADD|DATE_TRUNC|FIRST_VALUE|LAST_VALUE|NTILE|APPROX_COUNT_DISTINCT)(?=\s*\()/i,
        },
        { type: "number", regex: /^(\b\d+(\.\d+)?\b)/ },
        { type: "operator", regex: /^(<=|>=|!=|<>|=|<|>|\+|\-|\*|\/|%|::)/ },
      ]
    : [
        { type: "comment", regex: /^(#.*$)/ },
        {
          type: "string",
          regex: /^([rfb]?("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\\]*(\\.[^"\\]*)*"|'[^'\\]*(\\.[^'\\]*)*'))/,
        },
        { type: "decorator", regex: /^(@[a-zA-Z_]\w*)/ },
        {
          type: "keyword",
          regex:
            /^(def|class|import|from|as|return|yield|if|elif|else|for|while|try|except|finally|with|async|await|lambda|pass|break|continue|raise|in|is|not|and|or|None|True|False)\b/,
        },
        {
          type: "builtin",
          regex:
            /^(print|len|range|enumerate|zip|map|filter|sum|min|max|isinstance|issubclass|type|list|dict|set|tuple|str|int|float|bool|spark|sc|pd|pl|F|col|lit|when|concat|struct|array|session|df|self)\b/,
        },
        { type: "function", regex: /^([a-zA-Z_]\w*)(?=\s*\()/ },
        { type: "number", regex: /^(\b\d+(\.\d+)?\b)/ },
        { type: "operator", regex: /^(==|!=|<=|>=|->|:=|\+=|-=|\*=|\/=|\+|-|\*|\/|%|\||&|\^|~)/ },
      ];

  while (remaining.length > 0) {
    let matched = false;
    for (const { type, regex } of patterns) {
      const match = remaining.match(regex);
      if (match && match.index === 0) {
        tokens.push({ type, content: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      const match = remaining.match(/^[a-zA-Z0-9_]+|^\s+|^[^a-zA-Z0-9_\s]+/);
      const text = match ? match[0] : remaining[0];
      tokens.push({ type: "text", content: text });
      remaining = remaining.slice(text.length);
    }
  }

  return tokens;
}

const tokenClasses: Record<TokenType, string> = {
  comment: "text-slate-500 italic selection:text-slate-400",
  string: "text-emerald-400 font-normal selection:text-emerald-200",
  keyword: "text-purple-400 font-semibold selection:text-purple-200",
  builtin: "text-cyan-300 font-medium selection:text-cyan-100",
  function: "text-sky-300 font-normal selection:text-sky-100",
  decorator: "text-amber-400 font-medium selection:text-amber-200",
  number: "text-orange-300 selection:text-orange-100",
  operator: "text-pink-400 selection:text-pink-200",
  text: "text-slate-200 selection:text-white",
};

function getLanguageConfig(lang: string): { label: string; ext: string; color: string; bg: string } {
  const l = (lang || "").toLowerCase();
  if (l.includes("pyspark")) return { label: "PySpark", ext: ".py", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" };
  if (l.includes("polars")) return { label: "Polars", ext: ".py", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
  if (l.includes("python")) return { label: "Python", ext: ".py", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
  if (l.includes("sparksql")) return { label: "Spark SQL", ext: ".sql", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
  if (l.includes("duckdb")) return { label: "DuckDB", ext: ".sql", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" };
  if (l.includes("mssql") || l.includes("t-sql")) return { label: "T-SQL", ext: ".sql", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" };
  if (l.includes("sql")) return { label: "SQL", ext: ".sql", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" };
  if (l.includes("bash") || l.includes("shell") || l.includes("sh")) return { label: "Bash", ext: ".sh", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" };
  if (l.includes("json")) return { label: "JSON", ext: ".json", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" };
  return { label: lang.toUpperCase() || "CODE", ext: "", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" };
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
  const lines = useMemo(() => cleanCode.split("\n"), [cleanCode]);
  const langConfig = useMemo(() => getLanguageConfig(language), [language]);
  const displayFilename = filename || `${langConfig.label.toLowerCase().replace(/\s+/g, "_")}_snippet${langConfig.ext}`;

  const tokenizedLines = useMemo(() => {
    return lines.map((line) => tokenizeLine(line, language));
  }, [lines, language]);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      toast.success("Code snippet copied");
      setTimeout(() => setCopied(false), 2000);
    },
    [cleanCode]
  );

  return (
    <div
      className={cn(
        "group/code-block relative rounded-2xl overflow-hidden border border-[#232d40] bg-[#0c1017] text-slate-200 shadow-2xl transition-all duration-200 hover:border-slate-700/80",
        className
      )}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-[#121824] border-b border-[#1e2638] text-xs select-none">
        {/* Left: macOS Dots + File Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover/code-block:opacity-100 transition-opacity">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29] inline-block" />
          </div>

          <div className="h-3.5 w-[1px] bg-slate-700/50 shrink-0 hidden sm:block" />

          <div className="flex items-center gap-2 font-mono text-[11px] truncate min-w-0">
            <Terminal size={12} className={cn("shrink-0", langConfig.color)} />
            <span className="text-slate-200 font-semibold truncate">{displayFilename}</span>
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

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-2">
          <span className="hidden md:inline text-[10px] text-slate-500 font-mono mr-1">
            {lines.length} {lines.length === 1 ? "line" : "lines"}
          </span>

          {/* Toggle Line Numbers */}
          <button
            type="button"
            onClick={() => setLineNumbersEnabled((v) => !v)}
            title={lineNumbersEnabled ? "Hide line numbers" : "Show line numbers"}
            aria-label="Toggle line numbers"
            className={cn(
              "p-1 sm:px-1.5 py-1 rounded-md transition-all text-[11px] font-mono flex items-center gap-1",
              lineNumbersEnabled
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
            )}
          >
            <AlignLeft size={12} />
            <span className="hidden sm:inline text-[10px]">#</span>
          </button>

          {/* Toggle Word Wrap */}
          <button
            type="button"
            onClick={() => setIsWrap((v) => !v)}
            title={isWrap ? "Disable wrap (scroll)" : "Enable word wrap"}
            aria-label="Toggle word wrap"
            className={cn(
              "p-1 sm:px-1.5 py-1 rounded-md transition-all text-[11px] flex items-center gap-1",
              isWrap
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
            )}
          >
            <WrapText size={12} />
            <span className="hidden sm:inline text-[10px]">Wrap</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 active:scale-95 text-slate-100 text-[11px] font-medium border border-white/10 shadow-sm transition-all"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} className="text-slate-300" />
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
            "m-0 p-3.5 sm:p-4 text-[12px] sm:text-[13px] leading-[1.7] font-mono tracking-tight text-slate-200 overflow-x-auto bg-[#0c1017] selection:bg-purple-500/35 selection:text-purple-100 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent",
            isWrap && "whitespace-pre-wrap break-words"
          )}
        >
          <code>
            {tokenizedLines.map((tokens, idx) => (
              <div
                key={idx}
                className="group/line flex items-baseline hover:bg-white/[0.04] -mx-3.5 sm:-mx-4 px-3.5 sm:px-4 py-0 rounded transition-colors"
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
                  {tokens.map((t, ti) => (
                    <span key={ti} className={tokenClasses[t.type]}>
                      {t.content}
                    </span>
                  ))}
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
