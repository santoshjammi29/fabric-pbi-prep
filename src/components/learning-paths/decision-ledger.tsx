"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCommit,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
  Server,
  Database,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";

interface DecisionOption {
  id: string;
  name: string;
  tagline: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  adrSummary: string;
}

interface DecisionPoint {
  id: string;
  title: string;
  context: string;
  options: DecisionOption[];
}

const DECISION_POINTS: DecisionPoint[] = [
  {
    id: "table-format-2026",
    title: "Primary Lakehouse Storage & Table Format",
    context:
      "Your enterprise platform ingests 4 TB/day of semi-structured events with high-concurrency BI dashboards querying a 50-billion-row gold layer.",
    options: [
      {
        id: "delta-liquid",
        name: "Delta Lake 3.x + Liquid Clustering",
        tagline: "Native OneLake & Databricks unification with automatic Z-Order evolution",
        bestFor: "Workloads with unpredictable multi-dimensional filter patterns and high CDC concurrency",
        pros: [
          "Eliminates partition skew and manual OPTIMIZE Z-ORDER maintenance",
          "Seamless Direct Lake mode with V-Order sub-second query performance",
          "Universal Format (UniForm) allows Iceberg clients to read Delta metadata",
        ],
        cons: [
          "Liquid Clustering writes have slight overhead during concurrent micro-batch ingestion",
          "Requires modern Spark 3.5+ or Fabric Runtime 1.2+ for native support",
        ],
        adrSummary:
          "We selected **Delta Lake with Liquid Clustering**. Liquid Clustering replaces rigid hierarchical partitioning with flexible clustering keys, preventing small-file proliferation and partition skew. Direct Lake integration ensures billion-row dashboards render without data duplication or import latency.",
      },
      {
        id: "apache-iceberg",
        name: "Apache Iceberg + Snowflake/Trino Engine",
        tagline: "Vendor-agnostic open table standard with hidden partitioning and snapshot isolation",
        bestFor: "Multi-cloud polyglot platforms where AWS Athena, Snowflake, and Spark query the same files",
        pros: [
          "Full engine neutrality across Trino, Snowflake, Spark, and DuckDB",
          "Partition evolution without rewriting historical dataset files",
          "Strict metadata tracking preventing corrupt concurrent writes",
        ],
        cons: [
          "Direct Lake in Microsoft Fabric requires UniForm translation layer",
          "Compaction requires external maintenance services (e.g. Tabular or AWS Glue)",
        ],
        adrSummary:
          "We selected **Apache Iceberg**. Iceberg's vendor-neutral specification provides cross-cloud portability between AWS, Azure, and Snowflake. Hidden partitioning isolates analytics teams from physical directory structures.",
      },
      {
        id: "fabric-warehouse",
        name: "Microsoft Fabric Synapse Data Warehouse",
        tagline: "Managed T-SQL autonomous relational engine over OneLake Delta storage",
        bestFor: "Enterprises migrating legacy SQL Server / Teradata with extensive T-SQL stored procedures",
        pros: [
          "Native cross-database queries across Lakehouse and Warehouse items",
          "Full ACID transactions, primary/foreign key metadata enforcement, and T-SQL DDL/DML",
          "Zero infrastructure management with autonomous capacity auto-pause",
        ],
        cons: [
          "Direct PySpark writing to Warehouse tables is governed via read-only SQL endpoints",
          "CU consumption must be managed via Fabric capacity smoothing policies",
        ],
        adrSummary:
          "We selected **Microsoft Fabric Data Warehouse**. Provides familiar full ACID T-SQL capabilities for BI developers while transparently storing data as Delta Parquet in OneLake.",
      },
    ],
  },
  {
    id: "ingestion-architecture",
    title: "High-Throughput Streaming & Ingestion Architecture",
    context:
      "Financial transactions arrive at 150,000 events/sec. Need sub-10s end-to-end data freshness with exactly-once idempotency for audit compliance.",
    options: [
      {
        id: "structured-streaming",
        name: "PySpark Structured Streaming + Delta CDF",
        tagline: "Micro-batch stream-static joins with Change Data Feed (CDF) for Silver propagation",
        bestFor: "Complex stateful business transformations, watermarking, and deduplication",
        pros: [
          "Native exactly-once semantics backed by write-ahead logs and Delta ACID commits",
          "Change Data Feed simplifies incremental downstream Gold table aggregation",
          "Built-in RocksDB state store handles tens of millions of state keys without JVM GC pauses",
        ],
        cons: [
          "Typical end-to-end latency is 3–8 seconds (micro-batch vs true sub-second event-by-event)",
          "Requires executor tuning for driver memory and shuffle partition bounds",
        ],
        adrSummary:
          "We selected **PySpark Structured Streaming with Delta Change Data Feed**. Provides deterministic exactly-once guarantees, stateful watermarked deduplication, and automated lineage propagation into Silver and Gold layers.",
      },
      {
        id: "eventstream-kql",
        name: "Fabric Real-Time Intelligence + KQL Database",
        tagline: "Sub-second append-only indexing with direct streaming ingestion from Kafka/Event Hubs",
        bestFor: "Real-time anomaly detection, telemetry logs, and sub-second live alerting dashboards",
        pros: [
          "Near-zero ingestion latency (sub-second queryable)",
          "Kusto Query Language (KQL) excels at time-series and pattern matching",
          "Automatic 1-click shortcut into OneLake Delta without manual ETL",
        ],
        cons: [
          "Not designed for multi-table updates or complex Kimball dimension joins",
          "Append-only; deletes and updates require Purge operations",
        ],
        adrSummary:
          "We selected **Fabric Real-Time Intelligence with KQL**. Minimizes end-to-end ingestion latency to under 1 second for live anomaly tracking while automatically mirroring into OneLake Delta storage.",
      },
    ],
  },
];

export function DecisionLedger() {
  const decisionLedger = useUserStore((s) => s.decisionLedger);
  const recordDecision = useUserStore((s) => s.recordDecision);

  const [activePointIndex, setActivePointIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentPoint = DECISION_POINTS[activePointIndex];
  const selectedOptionId = decisionLedger[currentPoint.id] || currentPoint.options[0].id;
  const selectedOption =
    currentPoint.options.find((o) => o.id === selectedOptionId) || currentPoint.options[0];

  const handleSelect = (optionId: string) => {
    recordDecision(currentPoint.id, optionId);
    toast.success(`Recorded architecture choice: ${optionId}`);
  };

  const generateAdrMarkdown = () => {
    const dateStr = new Date().toISOString().split("T")[0];
    return `# Architecture Decision Record (ADR): ${currentPoint.title}

## Status: ACCEPTED
**Date:** ${dateStr}  
**Platform:** Enterprise Data & AI Platform  
**Decision Driver:** ${currentPoint.context}

---

## Decision Outcome
**Chosen Architecture:** ${selectedOption.name}  
*${selectedOption.tagline}*

### Technical Justification
${selectedOption.adrSummary}

### Key Architectural Advantages
${selectedOption.pros.map((p) => `- ${p}`).join("\n")}

### Trade-offs & Operational Mitigations
${selectedOption.cons.map((c) => `- [Trade-off] ${c}`).join("\n")}

---
*Generated by Fabric PBI Prep Professional Platform · Architecture Ledger*
`;
  };

  const handleCopyAdr = async () => {
    try {
      await navigator.clipboard.writeText(generateAdrMarkdown());
      setCopied(true);
      toast.success("ADR Markdown copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy ADR");
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#161618] p-6 sm:p-8 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
            <GitCommit size={14} />
            <span>Interactive Architecture Decision Ledger (ADR)</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            System Design Decision Points
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Evaluate real-world trade-offs, record architectural choices, and generate portfolio-ready Technical Justification briefs.
          </p>
        </div>

        {/* Decision Point Tabs */}
        <div className="flex items-center gap-2 bg-[#0A0A0B] p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          {DECISION_POINTS.map((dp, idx) => (
            <button
              key={dp.id}
              onClick={() => setActivePointIndex(idx)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                activePointIndex === idx
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Scenario {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Decision Point Context */}
      <div className="p-4 rounded-2xl bg-[#1C1C20] border border-slate-800 space-y-1.5">
        <div className="text-xs font-mono text-blue-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
          <Layers size={13} /> Engineering Scenario:
        </div>
        <h4 className="text-sm sm:text-base font-bold text-white">{currentPoint.title}</h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{currentPoint.context}</p>
      </div>

      {/* Options Cards */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Select Candidate Architecture:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {currentPoint.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={cn(
                  "p-5 rounded-2xl border text-left transition-all space-y-3 flex flex-col justify-between cursor-pointer",
                  isSelected
                    ? "border-blue-500 bg-blue-500/[0.08] shadow-lg shadow-blue-500/10"
                    : "border-slate-800 bg-[#1C1C20] hover:border-slate-700 hover:bg-[#222228]"
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                      Option
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                        <CheckCircle2 size={11} /> Selected
                      </span>
                    )}
                  </div>
                  <h5 className="text-sm font-bold text-white leading-snug">{opt.name}</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{opt.tagline}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Best Fit:
                  </div>
                  <div className="text-slate-300 text-[11px] leading-relaxed">{opt.bestFor}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generated ADR Brief */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0A0A0B] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <FileText size={15} />
            <span>Generated Architecture Decision Record (ADR)</span>
          </div>

          <button
            type="button"
            onClick={handleCopyAdr}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 active:scale-95 text-blue-300 text-xs font-semibold border border-blue-500/30 transition-all cursor-pointer self-start sm:self-auto"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-300">Copied ADR</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy ADR Markdown</span>
              </>
            )}
          </button>
        </div>

        {/* Content Breakdown */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          <div>
            <span className="font-semibold text-white mr-1.5">Decision:</span>
            <span>Adopt {selectedOption.name} as primary tier standard.</span>
          </div>
          <div>
            <span className="font-semibold text-white mr-1.5">Technical Rationale:</span>
            <span>{selectedOption.adrSummary}</span>
          </div>

          <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 space-y-1.5">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <CheckCircle2 size={13} /> Architectural Benefits
              </div>
              <ul className="space-y-1 text-slate-300">
                {selectedOption.pros.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 space-y-1.5">
              <div className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <ShieldAlert size={13} /> Trade-offs & Mitigations
              </div>
              <ul className="space-y-1 text-slate-300">
                {selectedOption.cons.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
