"use client";

import React, { useState, useMemo } from "react";
import {
  Database,
  Layers,
  Flame,
  FileCode2,
  Sliders,
  Share2,
  Cpu,
  Zap,
  Activity,
  Shuffle,
  Scale,
  AlertTriangle,
  Radio,
  Workflow,
  Waves,
  Clock,
  Gauge,
  ShieldCheck,
  Eye,
  FileCheck,
  GitBranch,
  Lock,
  Key,
  Table,
  Wind,
  Terminal,
  Package,
  Cloud,
  Network,
  Sparkles,
  Bot,
  Binary,
  Coins,
  Server,
  Filter,
  X,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ArchKeywordGroup =
  | "ALL"
  | "Storage"
  | "Compute"
  | "Streaming"
  | "Governance"
  | "Pipelines"
  | "AI & Vector";

export interface ArchitectureKeyword {
  id: string;
  label: string;
  group: ArchKeywordGroup;
  query: string;
  icon: React.ElementType;
}

export const ARCH_KEYWORDS: ArchitectureKeyword[] = [
  // 1. Modern Lakehouse & Storage (6)
  { id: "delta-lake", label: "Delta Lake", group: "Storage", query: "delta", icon: Database },
  { id: "iceberg", label: "Apache Iceberg", group: "Storage", query: "iceberg", icon: Layers },
  { id: "hudi", label: "Apache Hudi", group: "Storage", query: "hudi", icon: Flame },
  { id: "parquet-puffin", label: "Parquet & Puffin", group: "Storage", query: "parquet", icon: FileCode2 },
  { id: "liquid-clustering", label: "Liquid Clustering", group: "Storage", query: "liquid", icon: Sliders },
  { id: "delta-uniform", label: "Delta UniForm", group: "Storage", query: "uniform", icon: Share2 },

  // 2. Distributed Compute & Engines (6)
  { id: "catalyst", label: "Catalyst Optimizer", group: "Compute", query: "catalyst", icon: Cpu },
  { id: "photon", label: "Photon Engine", group: "Compute", query: "photon", icon: Zap },
  { id: "aqe", label: "Adaptive Query (AQE)", group: "Compute", query: "aqe", icon: Activity },
  { id: "shuffle", label: "Shuffle Optimization", group: "Compute", query: "shuffle", icon: Shuffle },
  { id: "data-skew", label: "Data Skew & Salting", group: "Compute", query: "skew", icon: Scale },
  { id: "oom-memory", label: "OOM & Memory Triage", group: "Compute", query: "memory", icon: AlertTriangle },

  // 3. Real-Time Streaming & CDC (6)
  { id: "kafka", label: "Apache Kafka", group: "Streaming", query: "kafka", icon: Radio },
  { id: "cdc-debezium", label: "CDC & Debezium", group: "Streaming", query: "cdc", icon: Workflow },
  { id: "structured-streaming", label: "Structured Streaming", group: "Streaming", query: "streaming", icon: Waves },
  { id: "flink", label: "Apache Flink & RocksDB", group: "Streaming", query: "flink", icon: Zap },
  { id: "watermarking", label: "Watermarks & Lateness", group: "Streaming", query: "watermark", icon: Clock },
  { id: "backpressure", label: "Backpressure & Spill", group: "Streaming", query: "backpressure", icon: Gauge },

  // 4. Governance, Security & Catalogs (6)
  { id: "unity-catalog", label: "Unity Catalog", group: "Governance", query: "unity catalog", icon: ShieldCheck },
  { id: "purview", label: "Microsoft Purview", group: "Governance", query: "purview", icon: Eye },
  { id: "data-contracts", label: "Data Contracts & ODCS", group: "Governance", query: "contract", icon: FileCheck },
  { id: "lineage-audit", label: "Data Lineage & Audit", group: "Governance", query: "lineage", icon: GitBranch },
  { id: "rls-masking", label: "RLS & Dynamic Masking", group: "Governance", query: "masking", icon: Lock },
  { id: "abac-rbac", label: "ABAC / RBAC", group: "Governance", query: "abac", icon: Key },

  // 5. Orchestration, Pipelines & DataOps (6)
  { id: "dlt", label: "Delta Live Tables (DLT)", group: "Pipelines", query: "live tables", icon: Table },
  { id: "airflow", label: "Apache Airflow", group: "Pipelines", query: "airflow", icon: Wind },
  { id: "dbt", label: "dbt Transformations", group: "Pipelines", query: "dbt", icon: Terminal },
  { id: "dabs", label: "Asset Bundles (DABs)", group: "Pipelines", query: "bundle", icon: Package },
  { id: "cicd-iac", label: "CI/CD & Terraform", group: "Pipelines", query: "ci/cd", icon: Cloud },
  { id: "data-mesh", label: "Data Mesh & Products", group: "Pipelines", query: "mesh", icon: Network },

  // 6. AI, Vector & Advanced Topologies (6)
  { id: "rag-vector", label: "RAG & Vector Search", group: "AI & Vector", query: "rag", icon: Sparkles },
  { id: "vector-dbs", label: "Vector DBs (Milvus/Pinecone)", group: "AI & Vector", query: "vector", icon: Database },
  { id: "langgraph", label: "LangGraph & Agents", group: "AI & Vector", query: "langgraph", icon: Bot },
  { id: "embeddings-hnsw", label: "Embeddings & HNSW", group: "AI & Vector", query: "embedding", icon: Binary },
  { id: "finops-cost", label: "FinOps & Cost Optimization", group: "AI & Vector", query: "finops", icon: Coins },
  { id: "mpp-serverless", label: "Serverless & MPP", group: "AI & Vector", query: "serverless", icon: Server },
];

export const STATIC_KEYWORD_COUNTS: Record<string, number> = {
  "delta-lake": 2057,
  "iceberg": 416,
  "hudi": 401,
  "parquet-puffin": 1026,
  "liquid-clustering": 499,
  "delta-uniform": 824,
  "catalyst": 452,
  "photon": 420,
  "aqe": 52,
  "shuffle": 509,
  "data-skew": 466,
  "oom-memory": 1330,
  "kafka": 286,
  "cdc-debezium": 320,
  "structured-streaming": 662,
  "flink": 70,
  "watermarking": 38,
  "backpressure": 199,
  "unity-catalog": 1325,
  "purview": 438,
  "data-contracts": 446,
  "lineage-audit": 843,
  "rls-masking": 474,
  "abac-rbac": 403,
  "dlt": 459,
  "airflow": 464,
  "dbt": 476,
  "dabs": 19,
  "cicd-iac": 88,
  "data-mesh": 453,
  "rag-vector": 2315,
  "vector-dbs": 1382,
  "langgraph": 431,
  "embeddings-hnsw": 451,
  "finops-cost": 417,
  "mpp-serverless": 79,
};

export const KEYWORD_GROUPS: { id: ArchKeywordGroup; label: string; count: number }[] = [
  { id: "ALL", label: "All Keywords", count: 36 },
  { id: "Storage", label: "Storage & Formats", count: 6 },
  { id: "Compute", label: "Compute & Engines", count: 6 },
  { id: "Streaming", label: "Streaming & CDC", count: 6 },
  { id: "Governance", label: "Governance & Catalogs", count: 6 },
  { id: "Pipelines", label: "Pipelines & DataOps", count: 6 },
  { id: "AI & Vector", label: "AI, RAG & Vector", count: 6 },
];

interface KeywordFilterBarProps {
  selectedKeyword: string;
  onSelectKeyword: (id: string) => void;
  selectedGroup: ArchKeywordGroup;
  onSelectGroup: (group: ArchKeywordGroup) => void;
  dynamicCounts?: Record<string, number>;
}

export function KeywordFilterBar({
  selectedKeyword,
  onSelectKeyword,
  selectedGroup,
  onSelectGroup,
  dynamicCounts,
}: KeywordFilterBarProps) {
  const [filterSearch, setFilterSearch] = useState("");

  const filteredKeywords = useMemo(() => {
    return ARCH_KEYWORDS.filter((k) => {
      if (selectedGroup !== "ALL" && k.group !== selectedGroup) {
        return false;
      }
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase().trim();
        return k.label.toLowerCase().includes(q) || k.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedGroup, filterSearch]);

  const activeKeywordObj = useMemo(() => {
    return ARCH_KEYWORDS.find((k) => k.id === selectedKeyword);
  }, [selectedKeyword]);

  return (
    <div className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3 sm:p-3.5 space-y-2.5 shadow-xs">
      {/* 1. Header & Group Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Filter size={13} />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
              <span>Scenario Keywords &amp; Architecture Focus Areas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 font-semibold">
                36 Curated Filters
              </span>
            </div>
            <div className="text-[11px] text-[var(--muted-foreground)]">
              Direct keyword filters extracted from the 3,206+ scenario question base
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick inline search among keywords */}
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Find keyword..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="pl-7 pr-2 py-1 text-[11px] rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] w-28 sm:w-36 focus:outline-none focus:border-purple-500/50"
            />
            {filterSearch && (
              <button
                type="button"
                onClick={() => setFilterSearch("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X size={10} />
              </button>
            )}
          </div>

          {selectedKeyword !== "ALL" && (
            <button
              type="button"
              onClick={() => onSelectKeyword("ALL")}
              className="px-2 py-1 text-[11px] rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Reset</span>
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Group Pills */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
        {KEYWORD_GROUPS.map((grp) => {
          const isActive = selectedGroup === grp.id;
          return (
            <button
              key={grp.id}
              type="button"
              onClick={() => onSelectGroup(grp.id)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                isActive
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
              )}
            >
              <span>{grp.label}</span>
              <span
                className={cn(
                  "text-[9px] px-1 py-0.1 rounded-full font-mono",
                  isActive ? "bg-white/20 text-white" : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
                )}
              >
                {grp.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. 36 Keyword Chips Grid */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {filteredKeywords.map((k) => {
          const Icon = k.icon;
          const isSelected = selectedKeyword === k.id;
          const count = dynamicCounts?.[k.id] ?? STATIC_KEYWORD_COUNTS[k.id] ?? 0;

          return (
            <button
              key={k.id}
              type="button"
              onClick={() => onSelectKeyword(isSelected ? "ALL" : k.id)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border",
                isSelected
                  ? "bg-purple-600 text-white border-purple-500 shadow-xs ring-1 ring-purple-400/40"
                  : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] border-[var(--border)]"
              )}
              title={`Filter by ${k.label} (${count.toLocaleString()} matching scenarios)`}
            >
              <Icon size={12} className={isSelected ? "text-white" : "text-purple-400"} />
              <span>{k.label}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-md font-mono font-semibold",
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-[var(--surface-3)] text-[var(--foreground)]/80"
                )}
              >
                {count.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Keyword Notification Banner */}
      {activeKeywordObj && (
        <div className="pt-1.5 flex items-center justify-between text-xs text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">Filtering by Keyword:</span>
            <strong className="text-white">{activeKeywordObj.label}</strong>
            <span className="text-purple-400">
              ({(STATIC_KEYWORD_COUNTS[activeKeywordObj.id] || 0).toLocaleString()} scenarios)
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectKeyword("ALL")}
            className="text-[11px] underline hover:text-white cursor-pointer"
          >
            Clear keyword filter
          </button>
        </div>
      )}
    </div>
  );
}
