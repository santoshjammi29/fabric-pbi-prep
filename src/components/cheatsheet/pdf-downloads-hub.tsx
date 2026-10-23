"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  Printer,
  Sparkles,
  Terminal,
  Flame,
  Cpu,
  Code2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PdfDocumentMeta {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  pages: number;
  fileSize: string;
  pdfUrl: string;
  htmlUrl: string;
  thumbnailUrl: string;
  category: "master" | "sparksql" | "pyspark" | "spark_core" | "python" | "runbooks";
  badge: string;
  badgeColor: string;
  highlights: string[];
  cardsCount: number;
}

export const MASTER_PDF_SUITES: PdfDocumentMeta[] = [
  {
    id: "all_in_one_master",
    title: "Complete Lakehouse Architecture & Runbooks Enterprise Reference (All-in-One Master)",
    subtitle: "Definitive 47-Page Master A4 Vector PDF · Complete Enterprise Handbook",
    description:
      "The all-inclusive production reference uniting all 48 Databricks architecture & coding cards across 4 domains AND all 76 enterprise incident triage runbooks into a single printable master document with zero truncation.",
    pages: 47,
    fileSize: "2.6 MB",
    pdfUrl: "/cheatsheets/pdf/lakehouse_enterprise_master_reference.pdf",
    htmlUrl: "/cheatsheets/html/master.html",
    thumbnailUrl: "/cheatsheets/images/databricks_master_page_1.png",
    category: "master",
    badge: "All-in-One Master",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    highlights: [
      "All 48 Databricks Coding & Architecture Cards",
      "All 76 Production Incident Triage Runbooks",
      "Liquid Clustering, Photon Engine & Unity Catalog",
      "Complete Medallion Lakehouse & FinOps Playbooks",
    ],
    cardsCount: 124,
  },
  {
    id: "master",
    title: "Databricks Unified Architecture & Coding Suite (Master Edition)",
    subtitle: "Complete 8-Page Master A4 Vector PDF · 48 Coding Cards",
    description:
      "The definitive production reference guide containing all 48 Databricks coding language cards across Spark SQL, PySpark, Spark Core, and Python SDK. Verified in ISO 216 Standard A4 format with zero truncation.",
    pages: 8,
    fileSize: "2.1 MB",
    pdfUrl: "/cheatsheets/pdf/databricks_master_cheatsheet.pdf",
    htmlUrl: "/cheatsheets/html/master.html",
    thumbnailUrl: "/cheatsheets/images/databricks_master_page_1.png",
    category: "master",
    badge: "Master A4 Suite",
    badgeColor: "bg-red-500/15 text-red-400 border-red-500/30",
    highlights: [
      "48 Coding Language Cards across 4 domains",
      "Liquid Clustering & Photon Vector Engine",
      "AQE Dynamic Partition Coalesce & Skew Joins",
      "Databricks Asset Bundles (DABs) & Unity Catalog",
    ],
    cardsCount: 48,
  },
  {
    id: "sparksql",
    title: "Databricks Spark SQL Architecture & Query Suite",
    subtitle: "2-Page A4 Vector PDF · 12 High-Impact Cards",
    description:
      "Enterprise SQL patterns for Lakehouse platforms: QUALIFY deduplication, window frames, dynamic MERGE INTO with schema evolution, Deletion Vectors, and AQE query hints.",
    pages: 2,
    fileSize: "912 KB",
    pdfUrl: "/cheatsheets/pdf/databricks_sparksql_cheatsheet.pdf",
    htmlUrl: "/cheatsheets/html/sparksql.html",
    thumbnailUrl: "/cheatsheets/images/databricks_sparksql_page_1.png",
    category: "sparksql",
    badge: "Spark SQL",
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    highlights: [
      "Window Functions & QUALIFY Syntax",
      "ACID MERGE INTO & Schema Evolution",
      "Liquid Clustering vs Z-Order Multi-Dimensional",
      "Adaptive Query Execution (AQE) Optimizer Hints",
    ],
    cardsCount: 12,
  },
  {
    id: "pyspark",
    title: "Databricks PySpark Architecture & Engine Suite",
    subtitle: "2-Page A4 Vector PDF · 12 High-Impact Cards",
    description:
      "Production PySpark patterns: Broadcast Hash Join thresholds, salt key generation for skewed stages, Structured Streaming watermarks, Vectorized UDFs (Arrow/Polars), and Delta Lake Time Travel.",
    pages: 2,
    fileSize: "868 KB",
    pdfUrl: "/cheatsheets/pdf/databricks_pyspark_cheatsheet.pdf",
    htmlUrl: "/cheatsheets/html/pyspark.html",
    thumbnailUrl: "/cheatsheets/images/databricks_pyspark_page_1.png",
    category: "pyspark",
    badge: "PySpark",
    badgeColor: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    highlights: [
      "Broadcast Hash Joins & Dynamic Thresholding",
      "Salting Techniques for 10x Skew Elimination",
      "Stateful Structured Streaming Watermarks",
      "Apache Arrow & Vectorized PySpark UDFs",
    ],
    cardsCount: 12,
  },
  {
    id: "spark_core",
    title: "Databricks Spark Core Internals & JVM Tuning Suite",
    subtitle: "2-Page A4 Vector PDF · 12 High-Impact Cards",
    description:
      "Under-the-hood engine mechanics: JVM On-Heap vs Off-Heap memory sizing formulas, G1GC garbage collection flags, shuffle spill triage, stage failure mitigation, and executor allocation.",
    pages: 2,
    fileSize: "878 KB",
    pdfUrl: "/cheatsheets/pdf/databricks_spark_core_cheatsheet.pdf",
    htmlUrl: "/cheatsheets/html/spark_core.html",
    thumbnailUrl: "/cheatsheets/images/databricks_spark_core_page_1.png",
    category: "spark_core",
    badge: "Spark Core",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    highlights: [
      "JVM Memory Breakdown: Storage vs Execution Pools",
      "Production G1GC Flags for Low-Latency Spills",
      "Shuffle Spill Mitigation & Partition Sizing",
      "Task Serialization & Closure Capture Triage",
    ],
    cardsCount: 12,
  },
  {
    id: "python",
    title: "Python in Databricks SDK, CLI & DABs Suite",
    subtitle: "2-Page A4 Vector PDF · 12 High-Impact Cards",
    description:
      "Cloud developer automation: Databricks Asset Bundles (DABs), dbutils secrets and volume operations, Workspace REST API v2.1 clients, and programmatic Unity Catalog permissions.",
    pages: 2,
    fileSize: "878 KB",
    pdfUrl: "/cheatsheets/pdf/databricks_python_cheatsheet.pdf",
    htmlUrl: "/cheatsheets/html/python.html",
    thumbnailUrl: "/cheatsheets/images/databricks_python_page_1.png",
    category: "python",
    badge: "Python SDK",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    highlights: [
      "Databricks Asset Bundles (DABs) Declarative CI/CD",
      "Unity Catalog Volume Management via dbutils",
      "Workspace REST API v2.1 Client Execution",
      "Secure Azure KeyVault & AWS KMS Secrets Retrieval",
    ],
    cardsCount: 12,
  },
  {
    id: "runbooks",
    title: "Data Engineering Production Incident Runbooks (Master Reference)",
    subtitle: "Comprehensive Printable A4 Runbooks · 76 Emergency Playbooks",
    description:
      "Battle-tested emergency triage procedures, root causes, and hardened solutions for Apache Spark, Lakehouse platforms, dbt, and Airflow. Formatted in ISO 216 Standard A4 layout for print and PDF export.",
    pages: 39,
    fileSize: "1.0 MB",
    pdfUrl: "/cheatsheets/pdf/incident_runbooks.pdf",
    htmlUrl: "/cheatsheets/html/incident_runbooks.html",
    thumbnailUrl: "/cheatsheets/images/incident_runbooks_page_1.png",
    category: "runbooks",
    badge: "Incident Runbooks",
    badgeColor: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    highlights: [
      "76 Emergency Production Playbooks",
      "P0 Outage Triage, OOM Exit 137, & Data Skew",
      "Shuffle Spill Elimination & Deadlock Recovery",
      "Complete 39-Page Vector PDF Reference",
    ],
    cardsCount: 76,
  },
];

export function PdfDownloadsHub() {
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredSuites = MASTER_PDF_SUITES.filter((suite) => {
    if (filterCategory !== "ALL" && suite.category !== filterCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inTitle = suite.title.toLowerCase().includes(q);
      const inDesc = suite.description.toLowerCase().includes(q);
      const inHighlights = suite.highlights.some((h) => h.toLowerCase().includes(q));
      if (!inTitle && !inDesc && !inHighlights) return false;
    }
    return true;
  });

  const totalPages = MASTER_PDF_SUITES.reduce((acc, s) => acc + s.pages, 0);
  const totalCards = MASTER_PDF_SUITES.reduce((acc, s) => acc + s.cardsCount, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Hero Banner: Single Roof PDF Library */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1427] via-[#080c15] to-[#120e24] border border-blue-500/30 p-4 sm:p-5 shadow-lg isolate">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <FileText size={12} />
                <span>Single Roof A4 PDF Library</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck size={11} />
                <span>ISO 216 Standard A4 Format (210 × 297mm)</span>
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold tracking-tight text-white break-words">
              Data Engineering Architecture &amp; Coding Blocks — A4 PDF Reference Center
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Every coding block, architecture pattern, and incident runbook converted and calibrated into
              crystal-clear, print-ready <strong>A4 format vector PDFs</strong>. Download complete master packages or
              individual domain suites with zero truncation and full vector crispness.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0">
            <a
              href="/api/download/pdf/lakehouse_enterprise_master_reference.pdf"
              download="lakehouse_enterprise_master_reference.pdf"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-95 text-white text-xs font-semibold shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Download size={14} />
              <span>Download Enterprise Master (47p)</span>
            </a>
            <div className="flex items-center gap-1.5">
              <a
                href="/api/download/pdf/databricks_master_cheatsheet.pdf"
                download="databricks_master_cheatsheet.pdf"
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
              >
                <Download size={12} className="text-blue-400" />
                <span>Coding Suite (8p)</span>
              </a>
              <a
                href="/api/download/pdf/incident_runbooks.pdf"
                download="incident_runbooks.pdf"
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
              >
                <Download size={12} className="text-sky-400" />
                <span>Runbooks (39p)</span>
              </a>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {totalPages} Total A4 Pages · {totalCards}+ Verified Coding Blocks &amp; Runbooks
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "ALL", label: "All PDF Suites (7)", icon: Layers },
            { id: "master", label: "Master Editions", icon: Sparkles },
            { id: "sparksql", label: "Spark SQL", icon: Terminal },
            { id: "pyspark", label: "PySpark", icon: Flame },
            { id: "spark_core", label: "Spark Core", icon: Cpu },
            { id: "python", label: "Python SDK", icon: Code2 },
            { id: "runbooks", label: "Incident Runbooks", icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = filterCategory === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilterCategory(item.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon size={12} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search PDF topics & code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Grid of A4 PDF Document Suites */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuites.map((doc) => {
          const pdfFilename = doc.pdfUrl.split("/").pop() || "document.pdf";
          const downloadApiUrl = `/api/download/pdf/${pdfFilename}`;
          return (
            <div
              key={doc.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-blue-500/40 transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md group"
            >
              {/* Thumbnail Header Preview */}
              <div className="relative h-44 bg-slate-950 overflow-hidden border-b border-[var(--border)]">
                {/* Thumbnail image */}
                <img
                  src={doc.thumbnailUrl}
                  alt={doc.title}
                  className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-95 group-hover:scale-102 transition-all duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-black/40" />

                {/* Badges on Thumbnail */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border shadow-xs", doc.badgeColor)}>
                    {doc.badge}
                  </span>
                  <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-black/60 text-slate-200 border border-white/10 backdrop-blur-xs">
                    {doc.pages} A4 {doc.pages === 1 ? "Page" : "Pages"}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    A4 · {doc.fileSize}
                  </span>
                </div>

                {/* Title on bottom of thumbnail */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight drop-shadow-sm">
                    {doc.title}
                  </h3>
                </div>
              </div>

              {/* Document Body */}
              <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
                    {doc.description}
                  </p>

                  {/* Highlights List */}
                  <div className="space-y-1 pt-1 border-t border-[var(--border)]/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] block">
                      Core Coding Constructs Covered:
                    </span>
                    <ul className="space-y-1">
                      {doc.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-[var(--foreground)]">
                          <CheckCircle2 size={11} className="text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-[var(--border)] flex items-center gap-1.5">
                  <a
                    href={downloadApiUrl}
                    download={pdfFilename}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download A4 PDF</span>
                  </a>

                  <a
                    href={`${downloadApiUrl}?inline=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--foreground)] text-xs font-semibold border border-[var(--border)] transition-colors cursor-pointer"
                    title="View PDF inline in new tab"
                  >
                    <FileText size={12} className="text-sky-400" />
                    <span className="hidden sm:inline">View</span>
                  </a>

                  <a
                    href={doc.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--foreground)] text-xs font-semibold border border-[var(--border)] transition-colors cursor-pointer"
                    title="Open A4 Print Layout in new tab"
                  >
                    <Printer size={12} className="text-purple-400" />
                    <span className="hidden sm:inline">Print</span>
                    <ExternalLink size={11} className="text-[var(--muted-foreground)]" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CodeBlock In-Place PDF Export Feature Banner */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Printer size={16} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[var(--foreground)]">
              Looking to export a specific coding block as an A4 PDF?
            </div>
            <div className="text-[11px] text-[var(--muted-foreground)]">
              Every code block across Code Practice, Spark Engine, Modern Stack, and Architecture now has a dedicated
              <strong className="text-purple-400 font-semibold"> &quot;A4 PDF&quot; button</strong> in its top toolbar. Click it anytime to export that exact snippet into a readable, line-numbered A4 document!
            </div>
          </div>
        </div>
        <Link
          href="/code-practice"
          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
        >
          <span>Explore Code Practice</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
