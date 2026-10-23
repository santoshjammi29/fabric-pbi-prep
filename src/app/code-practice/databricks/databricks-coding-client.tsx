"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Terminal,
  Flame,
  FileCode2,
  Cpu,
  Code2,
  Search,
  Copy,
  Check,
  Download,
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles,
  Zap,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Database,
  RotateCcw,
  CheckCircle2,
  FolderTree,
  Sliders,
  Filter,
  Bug,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  DatabricksSuiteData,
  DatabricksCheatCard,
  DatabricksDomainId,
  Databricks100Concept,
} from "@/types/data";
import { DatabricksCard } from "@/components/cheatsheet/databricks-card";
import { PosterLightbox } from "@/components/cheatsheet/poster-lightbox";
import { CodeBlock } from "@/components/ui/code-block";
import { SmoothAccordion } from "@/components/ui/smooth-accordion";

export interface DatabricksCodingClientProps {
  suiteData: DatabricksSuiteData;
  operationsData: Databricks100Concept[];
}

type CodingViewMode = "all" | "cheatsheets" | "d100" | "bottlenecks" | "dbfs";

interface BottleneckPlaybook {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  symptom: string;
  rootCause: string;
  codeSnippet: string;
  language: "python" | "sql";
  keyTakeaways: string[];
}

const PRODUCTION_BOTTLENECK_PLAYBOOKS: BottleneckPlaybook[] = [
  {
    id: "driver-oom-collect",
    title: "Driver OOM: Heap Space Exhaustion on collect() / toPandas()",
    severity: "CRITICAL",
    symptom: "java.lang.OutOfMemoryError: Java heap space on Driver, or 'Total size of serialized results of N tasks is bigger than spark.driver.maxResultSize'. Driver crashes and job halts.",
    rootCause: "Calling .collect(), .toPandas(), or excessively large .take(N) pulls gigabytes of distributed worker partitions onto the single Driver JVM.",
    language: "python",
    codeSnippet: `# ❌ ROOT CAUSE: Pulls 50GB into driver heap
# pdf = df.toPandas()
# rows = df.collect()

# ✅ PRODUCTION FIX 1: Write directly to table or object storage
df.write.format("delta").mode("overwrite").saveAsTable("gold.sales_summary")

# ✅ PRODUCTION FIX 2: If sampling is strictly required for evaluation:
sampled_pdf = df.sample(fraction=0.001, seed=42).limit(1000).toPandas()

# ✅ PRODUCTION FIX 3: Raise safety ceiling on Driver (cluster policy):
spark.conf.set("spark.driver.maxResultSize", "4g")
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "10485760") # 10MB limit`,
    keyTakeaways: [
      "Never call .collect() or .toPandas() on production DataFrames without strict aggregation or .limit().",
      "Persist heavy reporting outputs to Delta tables or cloud object storage instead of driver memory.",
      "Cap driver result sizes via spark.driver.maxResultSize to prevent catastrophic JVM crashes.",
    ],
  },
  {
    id: "executor-oom-exit-137",
    title: "Executor OOM & Container Killed (SIGKILL / Exit Code 137)",
    severity: "CRITICAL",
    symptom: "ExecutorLostFailure: Container killed by YARN for exceeding memory limits, or Exit Code 137. Tasks retry 4 times and fail the stage.",
    rootCause: "Large uncompressed partitions, unoptimized standard Python UDFs spawning unbounded Py4J worker subprocesses, or wide group-by transforms without pre-aggregations.",
    language: "python",
    codeSnippet: `# ❌ AVOID: Row-by-row standard Python UDF (spawns heavy Python subprocesses)
# @udf(returnType=StringType())
# def parse_json(raw_str): ...

# ✅ PRODUCTION FIX 1: Vectorized Arrow Pandas UDF (SIMD C++ acceleration)
import pandas as pd
from pyspark.sql.functions import pandas_udf
import pyspark.sql.functions as F

@pandas_udf("string")
def parse_domain_vectorized(email_series: pd.Series) -> pd.Series:
    return email_series.str.split("@").str[1]

df_clean = df.withColumn("domain", parse_domain_vectorized(F.col("email")))

# ✅ PRODUCTION FIX 2: Allocate dedicated off-heap overhead buffer in Spark config
# spark.executor.memoryOverhead = 2048m (or 15-20% of executor memory)
# spark.sql.execution.arrow.pyspark.enabled = true`,
    keyTakeaways: [
      "Standard Python UDFs duplicate memory across JVM and Python workers. Always use native Spark SQL functions or @pandas_udf.",
      "Increase spark.executor.memoryOverhead to at least 15-20% of total executor RAM for heavy Arrow/Python operations.",
      "Enable Apache Arrow acceleration via spark.sql.execution.arrow.pyspark.enabled.",
    ],
  },
  {
    id: "shuffle-spill-memory-disk",
    title: "Shuffle Spill to Disk & Memory (Massive I/O Drag)",
    severity: "HIGH",
    symptom: "Spark UI Stage view reports 'Spill (Memory): 120 GB' and 'Spill (Disk): 45 GB'. Stage execution slows down 5x-10x due to local SSD spill thrashing.",
    rootCause: "Individual partition size during wide transformations (joins, groupBy, windowing) exceeds available executor execution memory (spark.memory.fraction).",
    language: "python",
    codeSnippet: `# ✅ PRODUCTION FIX 1: Enable AQE dynamic partition sizing & coalescing
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.advisoryPartitionSizeInBytes", "134217728") # 128 MB

# ✅ PRODUCTION FIX 2: Manually size shuffle partitions for non-AQE operations
# Rule of Thumb: Total Shuffle Volume / 128MB = target partition count
# Example for 200 GB shuffle data: 200,000 MB / 128 MB ≈ 1,560 partitions
spark.conf.set("spark.sql.shuffle.partitions", "1600")

# ✅ PRODUCTION FIX 3: Rebalance before heavy wide windowing
df_rebalanced = df.repartition(1600, "customer_id")`,
    keyTakeaways: [
      "Spill occurs when in-memory execution hash tables overflow to disk during joins or aggregations.",
      "Ensure AQE is active with advisoryPartitionSizeInBytes tuned to 128MB (or 64MB for memory-constrained nodes).",
      "Scale up shuffle partitions to prevent individual partition chunks from exceeding worker core memory.",
    ],
  },
  {
    id: "data-skew-stragglers",
    title: "Data Skew & Straggler Tasks (1 Task Takes 95% of Stage Time)",
    severity: "HIGH",
    symptom: "Spark UI shows 999 out of 1000 tasks finished in 20 seconds, but 1 task runs for 45 minutes on a single core.",
    rootCause: "High-cardinality skew on join/aggregation keys (e.g. NULL, 'UNKNOWN', default IDs '000000', or high-volume enterprise customer).",
    language: "python",
    codeSnippet: `# ✅ PRODUCTION FIX 1: Native AQE Skew Join Optimization (Automatic)
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor", "5")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "268435456") # 256MB

# ✅ PRODUCTION FIX 2: Salting Key Technique (Manual deterministic split)
import pyspark.sql.functions as F

SALT_FACTOR = 8

# Add salt 0..7 to skewed table
df_skewed_salted = df_large.withColumn(
    "salted_key",
    F.concat(F.col("join_key"), F.lit("_"), F.floor(F.rand() * SALT_FACTOR))
)

# Replicate smaller dimension table across all salt factors
df_dim_replicated = df_small.withColumn(
    "salt_arr",
    F.array([F.lit(i) for i in range(SALT_FACTOR)])
).withColumn("salt_idx", F.explode("salt_arr"))\\
 .withColumn("salted_key", F.concat(F.col("join_key"), F.lit("_"), F.col("salt_idx")))

# Perform join on salted key with uniform distribution
df_joined = df_skewed_salted.join(df_dim_replicated, "salted_key")`,
    keyTakeaways: [
      "Skew causes 1 executor core to process 90% of data while all other workers sit idle.",
      "Enable spark.sql.adaptive.skewJoin.enabled to split skewed partitions dynamically at runtime.",
      "For extreme skew, apply the Salting Key technique to distribute monolithic hot-keys across N virtual buckets.",
    ],
  },
  {
    id: "small-file-metadata-drag",
    title: "Small File Problem & Metadata Overhead in Delta Lake",
    severity: "MEDIUM",
    symptom: "Table reads take minutes just to begin scan phase. Query plan shows scanning 400,000 individual 50KB Parquet files.",
    rootCause: "Continuous streaming ingestion or high-frequency micro-batch MERGE operations creating thousands of tiny files per partition.",
    language: "sql",
    codeSnippet: `-- ✅ PRODUCTION FIX 1: Enable Auto-Compaction & Optimized Writes
ALTER TABLE gold.telemetry_events SET TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true',
  'delta.enableDeletionVectors' = 'true'
);

-- ✅ PRODUCTION FIX 2: Run Bin-Packing Compaction with Liquid Clustering
OPTIMIZE gold.telemetry_events
CLUSTER BY (event_date, device_type);

-- ✅ PRODUCTION FIX 3: Prune unreferenced historical tombstones safely
VACUUM gold.telemetry_events RETAIN 168 HOURS; -- 7 days default safety threshold`,
    keyTakeaways: [
      "Thousands of small files generate massive cloud object storage list API overhead and metadata bloat.",
      "Enable Deletion Vectors to avoid rewriting entire Parquet files on single-row UPDATE/DELETE statements.",
      "Schedule regular OPTIMIZE and VACUUM jobs to maintain optimal 128MB–1GB target Parquet sizes.",
    ],
  },
  {
    id: "jvm-garbage-collection-pauses",
    title: "Long JVM Garbage Collection (GC) Pauses (> 20% Run Time)",
    severity: "MEDIUM",
    symptom: "Spark UI Stage view shows GC Time exceeding 20-30% of total Task Duration. Executor heartbeats time out under heavy memory pressure.",
    rootCause: "Excessive Java heap object allocations caused by string concatenation, complex nested JSON parsing in Scala/Java, or bloated in-memory data structures.",
    language: "python",
    codeSnippet: `# ✅ PRODUCTION FIX 1: Cluster JVM G1GC Flags (Apply in Cluster Spark Config):
# spark.executor.extraJavaOptions -XX:+UseG1GC -XX:InitiatingHeapOccupancyPercent=35 -XX:G1ReservePercent=15 -XX:G1HeapRegionSize=32m

# ✅ PRODUCTION FIX 2: Bypassing JVM GC with Photon Vectorized C++ Engine
# Select a cluster runtime with Photon enabled (DBR 15.4+ LTS Photon).
# Photon operates directly over columnar off-heap memory, eliminating JVM GC entirely!

# ✅ PRODUCTION FIX 3: Use native Catalyst schema parsing instead of dynamic JSON strings
from pyspark.sql.types import StructType, StructField, StringType, DoubleType
import pyspark.sql.functions as F

schema = StructType([
    StructField("id", StringType(), False),
    StructField("amount", DoubleType(), True)
])

# Fast native C++ parser without object churn
df_parsed = df.withColumn("payload", F.from_json(F.col("raw_json"), schema))`,
    keyTakeaways: [
      "High object churn stresses JVM generational memory, leading to stop-the-world GC pauses.",
      "Tune JVM flags to G1GC with InitiatingHeapOccupancyPercent=35 for predictable collection cycles.",
      "Leverage Databricks Photon engine to execute query graphs in native C++ off-heap memory.",
    ],
  },
];

const DBFS_OPERATIONS_PLAYBOOK = [
  {
    title: "Directory Listing with Metadata Extraction",
    snippet: `files = dbutils.fs.ls("/Volumes/prod_catalog/gold_data/telemetry/")
for file_info in files:
    print(f"Path: {file_info.path} | Size: {file_info.size / (1024*1024):.2f} MB | Modified: {file_info.modificationTime}")`,
    notes: "Works seamlessly on Unity Catalog Volumes (/Volumes/...) and DBFS root (dbfs:/...).",
  },
  {
    title: "Recursive Directory Copy across Volumes or Object Storage",
    snippet: `dbutils.fs.cp(
    from_path="/Volumes/staging_catalog/landing/raw_events/",
    to_path="/Volumes/prod_catalog/bronze/archived_events/",
    recurse=True
)`,
    notes: "Atomic distributed copy; supports wildcards and recursive tree traversal.",
  },
  {
    title: "Fast Atomic File Move & Rename",
    snippet: `dbutils.fs.mv(
    from_path="/Volumes/bronze/staged/batch_2026_10_22.parquet",
    to_path="/Volumes/bronze/processed/batch_2026_10_22_complete.parquet"
)`,
    notes: "Instant metadata operation within the same cloud storage container/bucket.",
  },
  {
    title: "Safe Recursive Deletion of Ephemeral Scratch Trees",
    snippet: `if dbutils.fs.rm("/Volumes/temp/checkpoint_dir/", recurse=True):
    print("Checkpoint scratch directory pruned successfully.")`,
    notes: "Requires recurse=True for non-empty directories. Highly dangerous: verify paths first!",
  },
  {
    title: "Stream Sample File Header Bytes (Debugging Landing Files)",
    snippet: `header_bytes = dbutils.fs.head("/Volumes/raw/landing/incoming_payload.json", maxBytes=1024)
print(header_bytes)`,
    notes: "Reads up to maxBytes without loading massive multi-gigabyte files into memory.",
  },
  {
    title: "Atomic Configuration / Metadata File Write",
    snippet: `config_json = '{"env": "production", "pipeline_version": "2.4.0", "active": true}'
dbutils.fs.put("/Volumes/config/pipeline_manifest.json", config_json, overwrite=True)`,
    notes: "Writes small control files, watermarks, or JSON schema contracts directly.",
  },
  {
    title: "Secure Secret Vault Retrieval (Never Hardcode Credentials)",
    snippet: `api_key = dbutils.secrets.get(scope="azure-keyvault-scope", key="dw-master-token")
jdbc_pass = dbutils.secrets.get(scope="aws-secretsmanager-scope", key="redshift-user-password")`,
    notes: "Secrets are automatically masked in notebook outputs and driver logs with [REDACTED].",
  },
  {
    title: "Dynamic Parameterized Widgets for Modular Notebooks",
    snippet: `dbutils.widgets.text("execution_date", "2026-10-22", "Batch Date (YYYY-MM-DD)")
dbutils.widgets.dropdown("target_env", "prod", ["dev", "staging", "prod"], "Environment")

batch_date = dbutils.widgets.get("execution_date")
target_env = dbutils.widgets.get("target_env")
print(f"Triggering {target_env} pipeline for {batch_date}")`,
    notes: "Enables workflow orchestration parameter passing via Databricks Jobs & REST API.",
  },
];

export function DatabricksCodingClient({
  suiteData,
  operationsData,
}: DatabricksCodingClientProps) {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<CodingViewMode>(() => {
    const v = searchParams.get("view")?.toLowerCase();
    if (v === "cheatsheets" || v === "d100" || v === "bottlenecks" || v === "dbfs") {
      return v as CodingViewMode;
    }
    return "all";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  // Lightbox state for high-res cheat posters
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPoster, setLightboxPoster] = useState<{
    url: string;
    title: string;
    subtitle: string;
    pdfUrl: string;
  } | null>(null);

  // Sync viewMode from URL searchParams
  useEffect(() => {
    const v = searchParams.get("view")?.toLowerCase();
    if (v && ["all", "cheatsheets", "d100", "bottlenecks", "dbfs"].includes(v)) {
      setViewMode(v as CodingViewMode);
    }
  }, [searchParams]);

  const handleViewChange = useCallback((mode: CodingViewMode) => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("view", mode);
      url.hash = "";
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  // Filtered Cheatsheet Cards (48 cards)
  const filteredCards = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return suiteData.cards.filter((card) => {
      if (selectedCategory !== "ALL") {
        if (selectedCategory === "sparksql" && card.domain !== "sparksql") return false;
        if (selectedCategory === "pyspark" && card.domain !== "pyspark") return false;
        if (selectedCategory === "spark_core" && card.domain !== "spark_core") return false;
        if (selectedCategory === "python" && card.domain !== "python") return false;
      }
      if (!q) return true;
      return (
        card.title.toLowerCase().includes(q) ||
        card.code.toLowerCase().includes(q) ||
        card.domainTitle.toLowerCase().includes(q) ||
        card.tag.toLowerCase().includes(q) ||
        card.explain.some((e) => e.text.toLowerCase().includes(q))
      );
    });
  }, [suiteData.cards, searchQuery, selectedCategory]);

  // Filtered Databricks 100 Operations (100 items)
  const filteredOperations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return operationsData.filter((item) => {
      if (selectedDifficulty !== "ALL" && item.difficulty !== selectedDifficulty) {
        return false;
      }
      if (selectedCategory !== "ALL") {
        if (selectedCategory === "dbfs" && !item.concept.toLowerCase().includes("volume") && !item.summary.toLowerCase().includes("dbfs") && !item.codeSnippet.toLowerCase().includes("dbutils")) {
          return false;
        }
        if (selectedCategory === "Delta Lake" && item.category !== "Delta Lake") return false;
        if (selectedCategory === "Spark Execution" && item.category !== "Spark Execution") return false;
        if (selectedCategory === "SQL & DataFrames" && item.category !== "SQL & DataFrames") return false;
        if (selectedCategory === "Performance & Cost" && item.category !== "Performance & Cost") return false;
        if (selectedCategory === "Workflows, CI/CD & Operations" && item.category !== "Workflows, CI/CD & Operations") return false;
      }
      if (!q) return true;
      return (
        item.concept.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q) ||
        item.codeSnippet.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keyPoints.some((kp) => kp.toLowerCase().includes(q))
      );
    });
  }, [operationsData, searchQuery, selectedDifficulty, selectedCategory]);

  // Filtered Bottleneck Playbooks
  const filteredBottlenecks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return PRODUCTION_BOTTLENECK_PLAYBOOKS;
    return PRODUCTION_BOTTLENECK_PLAYBOOKS.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.symptom.toLowerCase().includes(q) ||
        b.rootCause.toLowerCase().includes(q) ||
        b.codeSnippet.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const totalFilteredCount = useMemo(() => {
    if (viewMode === "cheatsheets") return filteredCards.length;
    if (viewMode === "d100") return filteredOperations.length;
    if (viewMode === "bottlenecks") return filteredBottlenecks.length;
    if (viewMode === "dbfs") return DBFS_OPERATIONS_PLAYBOOK.length;
    return filteredCards.length + filteredOperations.length;
  }, [viewMode, filteredCards.length, filteredOperations.length, filteredBottlenecks.length]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-2 sm:px-4 py-4 animate-in fade-in duration-200">
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER & HUB BANNER */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl bg-gradient-to-br from-red-950/30 via-[var(--surface-1)] to-[var(--surface-1)] border border-red-500/20 p-4 sm:p-5 shadow-xs overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/code-practice"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] transition-colors"
              >
                <Code2 size={12} />
                <span>Code Practice</span>
              </Link>
              <span className="text-[var(--muted-foreground)]">/</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                <Flame size={12} className="text-red-400" />
                <span>Databricks Coding Hub</span>
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                Unified Single Subpage
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-[var(--foreground)]">
              Databricks Polyglot Coding Hub
            </h1>

            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-3xl leading-relaxed">
              Exhaustive production coding sheets covering <strong>Spark SQL</strong>, <strong>PySpark 3.4/4.0</strong>,{" "}
              <strong>DBFS &amp; Volumes</strong>, <strong>Catalyst internals</strong>, <strong>DLT &amp; DABs</strong>, and{" "}
              <strong>production memory triage (OOM, Spill, Skew &amp; GC)</strong> from Databricks 100 &amp; official language suites.
            </p>

            {/* Quick Stat Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 font-mono font-medium">
                48 Cheatsheet Cards
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono font-medium">
                100 Architecture Ops
              </span>
              <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono font-medium">
                6 Critical Memory Fixes
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono font-medium">
                8 DBFS &amp; Secret Scripts
              </span>
            </div>
          </div>

          {/* Action Downloads & Links */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0">
            <a
              href="/api/download/pdf/databricks_master_cheatsheet.pdf"
              download="databricks_master_cheatsheet.pdf"
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Download size={14} />
              <span>Download Master PDF (8 Pages)</span>
            </a>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setLightboxPoster({
                    url: "/cheatsheets/images/databricks_sparksql_poster.png",
                    title: "Databricks Spark SQL Poster",
                    subtitle: "Full-Resolution 250-DPI Architectural Reference",
                    pdfUrl: "/cheatsheets/pdf/databricks_sparksql_cheatsheet.pdf",
                  });
                  setLightboxOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs text-[var(--foreground)] border border-[var(--border)] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={12} className="text-amber-400" />
                <span>250-DPI Poster</span>
              </button>

              <Link
                href="/code-practice"
                className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] transition-colors flex items-center gap-1"
              >
                <span>Other Languages</span>
                <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. SUBPAGE VIEW MODE SWITCHER */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] overflow-x-auto scrollbar-none shadow-xs">
        {[
          { id: "all", label: `All Databricks Coding (${suiteData.cards.length + operationsData.length})`, icon: Flame },
          { id: "cheatsheets", label: `Production Cheatsheets (${suiteData.cards.length})`, icon: FileCode2 },
          { id: "d100", label: `Databricks 100 Operations (${operationsData.length})`, icon: Cpu },
          { id: "bottlenecks", label: `Memory & Bottleneck Triage (${PRODUCTION_BOTTLENECK_PLAYBOOKS.length})`, icon: Bug },
          { id: "dbfs", label: `DBFS, Volumes & Secrets (${DBFS_OPERATIONS_PLAYBOOK.length})`, icon: FolderTree },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = viewMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleViewChange(tab.id as CodingViewMode)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              )}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. SEARCH & DYNAMIC FILTER BAR */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search Databricks operations, SQL, PySpark, DBFS, OOM, spill, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
          />
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "ALL", label: "All Categories" },
            { id: "sparksql", label: "Spark SQL" },
            { id: "pyspark", label: "PySpark" },
            { id: "spark_core", label: "Spark Core" },
            { id: "python", label: "Python SDK" },
            { id: "dbfs", label: "DBFS & Volumes" },
            { id: "Delta Lake", label: "Delta Lake" },
            { id: "Performance & Cost", label: "Perf & Cost" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer",
                selectedCategory === cat.id
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. CONTENT SECTIONS */}
      {/* ────────────────────────────────────────────────────────── */}

      {/* VIEW: MEMORY & BOTTLENECK TRIAGE */}
      {(viewMode === "all" || viewMode === "bottlenecks") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Bug size={16} className="text-red-400" />
              <span>Production Issues &amp; Memory Bottlenecks Triage ({filteredBottlenecks.length})</span>
            </h2>
            <span className="text-[11px] text-[var(--muted-foreground)]">
              Root causes &amp; production fix scripts
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {filteredBottlenecks.map((playbook) => {
              const sevColor =
                playbook.severity === "CRITICAL"
                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                  : playbook.severity === "HIGH"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/30";

              return (
                <div
                  key={playbook.id}
                  className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3.5 space-y-3 flex flex-col justify-between hover:border-red-500/40 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", sevColor)}>
                        {playbook.severity}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                        Production Triage
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--foreground)]">
                      {playbook.title}
                    </h3>

                    <div className="text-xs space-y-1.5 text-[var(--muted-foreground)]">
                      <div>
                        <strong className="text-red-300">Symptom:</strong> {playbook.symptom}
                      </div>
                      <div>
                        <strong className="text-amber-300">Root Cause:</strong> {playbook.rootCause}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <CodeBlock
                      code={playbook.codeSnippet}
                      language={playbook.language}
                      filename="Production Solution"
                    />

                    <div className="pt-2 border-t border-[var(--border)]/60 space-y-1">
                      {playbook.keyTakeaways.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[var(--muted-foreground)]">
                          <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: DBFS & VOLUMES QUICK GUIDE */}
      {(viewMode === "all" || viewMode === "dbfs") && (
        <div className="space-y-3 pt-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <FolderTree size={16} className="text-emerald-400" />
              <span>DBFS &amp; Unity Catalog Volumes Operations ({DBFS_OPERATIONS_PLAYBOOK.length})</span>
            </h2>
            <span className="text-[11px] text-[var(--muted-foreground)]">
              Native dbutils.fs, Volumes &amp; Secret access
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DBFS_OPERATIONS_PLAYBOOK.map((op, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3 space-y-2 hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <Terminal size={12} className="text-emerald-400" />
                    <span>{op.title}</span>
                  </h4>
                </div>

                <CodeBlock code={op.snippet} language="python" />

                <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed italic">
                  ℹ️ {op.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: CHEATSHEET CARDS (48 DOMAIN CARDS) */}
      {(viewMode === "all" || viewMode === "cheatsheets") && (
        <div className="space-y-3 pt-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <FileCode2 size={16} className="text-sky-400" />
              <span>Databricks Production Cheatsheet Cards ({filteredCards.length})</span>
            </h2>
            <span className="text-[11px] text-[var(--muted-foreground)]">
              Spark SQL, PySpark, Spark Core &amp; Python SDK
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredCards.map((card) => (
              <DatabricksCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}

      {/* VIEW: DATABRICKS 100 OPERATIONS */}
      {(viewMode === "all" || viewMode === "d100") && (
        <div className="space-y-3 pt-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Cpu size={16} className="text-amber-400" />
              <span>Databricks 100 Deep-Dive Architecture Operations ({filteredOperations.length})</span>
            </h2>
            <span className="text-[11px] text-[var(--muted-foreground)]">
              Exhaustive day-by-day operations with code &amp; certifications
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredOperations.map((item) => {
              const isOpen = openCardId === item.id;
              const diffColor =
                item.difficulty === "HARD"
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : item.difficulty === "MEDIUM"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

              return (
                <div
                  key={item.id}
                  className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden transition-all hover:border-amber-500/30"
                >
                  <button
                    type="button"
                    onClick={() => setOpenCardId(isOpen ? null : item.id)}
                    className="w-full p-3.5 text-left flex items-start justify-between gap-3 hover:bg-[var(--surface-2)]/60 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--foreground)] font-bold">
                          Day {item.day}
                        </span>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", diffColor)}>
                          {item.difficulty}
                        </span>
                        <span className="text-[10px] text-[var(--muted-foreground)] font-medium">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">
                        {item.concept}
                      </h4>
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                    <ChevronDown
                      size={15}
                      className={cn(
                        "text-[var(--muted-foreground)] shrink-0 mt-1 transition-transform duration-200",
                        isOpen && "rotate-180 text-amber-400"
                      )}
                    />
                  </button>

                  <SmoothAccordion
                    isOpen={isOpen}
                    innerClassName="p-3.5 pt-1 space-y-3 bg-[var(--surface-2)]/40 border-t border-[var(--border)] text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                        Technical Mechanism
                      </span>
                      <p className="text-[var(--foreground)] opacity-90 leading-relaxed text-xs">
                        {item.explanation}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                        Key Architecture Rules
                      </span>
                      {item.keyPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[var(--muted-foreground)]">
                          <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                        Production Code Template
                      </span>
                      <CodeBlock
                        code={item.codeSnippet}
                        language={item.codeSnippet.trim().startsWith("--") || item.codeSnippet.trim().startsWith("SELECT") || item.codeSnippet.trim().startsWith("CREATE") ? "sql" : "python"}
                      />
                    </div>

                    {item.certificationMapping && (
                      <div className="pt-2 border-t border-[var(--border)]/60 text-[11px] text-[var(--muted-foreground)] flex items-center justify-between">
                        <span>Certification Target:</span>
                        <span className="font-semibold text-[var(--foreground)]">
                          {item.certificationMapping}
                        </span>
                      </div>
                    )}
                  </SmoothAccordion>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox for full-size poster */}
      {lightboxPoster && (
        <PosterLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          posterUrl={lightboxPoster.url}
          title={lightboxPoster.title}
          subtitle={lightboxPoster.subtitle}
          pdfUrl={lightboxPoster.pdfUrl}
        />
      )}
    </div>
  );
}
