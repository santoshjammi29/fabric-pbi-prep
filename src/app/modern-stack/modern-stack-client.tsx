"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Layers,
  Sparkles,
  Flame,
  Calculator,
  Cpu,
  Table,
  Terminal,
  Bot,
  FileCode2,
  ArrowRight,
  BookOpen,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  ChevronDown,
  Database,
  ShieldCheck,
  RotateCcw,
  Sliders,
  ExternalLink,
  Code2,
  Copy,
  Check,
  Compass,
  Building2,
  Share2,
  Workflow,
  Info,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HubSubnav } from "@/components/layout/hub-subnav";
import { TopicIcon } from "@/components/ui/topic-icon";
import { CodeBlock } from "@/components/ui/code-block";
import dynamic from "next/dynamic";

const SmoothAccordion = dynamic(
  () => import("@/components/ui/smooth-accordion").then((mod) => mod.SmoothAccordion),
  { ssr: false }
);

type ModernSubtab =
  | "overview"
  | "concepts"
  | "matrix"
  | "simulators"
  | "blueprints"
  | "ai"
  | "cost"
  | "compatibility"
  | "python";

export interface ModernStackClientProps {
  initialModernStack: {
    stack: any[];
    blueprints: any[];
    matrix: any[];
    costPlaybooks: any[];
    concepts: any[];
    subdomains: any[];
  };
  initialPython: any[];
}

export function ModernStackClient(props: ModernStackClientProps) {
  const {
    matrix: modernCodeMatrix,
    blueprints: modernBlueprintsDb,
    costPlaybooks: modernCostPlaybooks,
    stack: modernStackDb,
    concepts: modernConceptsDb,
    subdomains: modernSubdomains,
  } = props.initialModernStack;
  const pythonData = props.initialPython;
  const [activeTab, setActiveTab] = useState<ModernSubtab>("overview");
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTabChange = useCallback((tabId: ModernSubtab) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabId);
      url.hash = tabId;
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  useEffect(() => {
    const syncTabFromLocation = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const queryTab = params.get("tab")?.toLowerCase();
      const target = hash || queryTab;

      const validTabs: ModernSubtab[] = [
        "overview",
        "concepts",
        "matrix",
        "simulators",
        "blueprints",
        "ai",
        "cost",
        "compatibility",
        "python",
      ];

      if (queryTab && validTabs.includes(queryTab as ModernSubtab)) {
        setActiveTab(queryTab as ModernSubtab);
      } else if (hash && validTabs.includes(hash as ModernSubtab)) {
        setActiveTab(hash as ModernSubtab);
      }

      if (hash) {
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 200);
      }
    };

    syncTabFromLocation();
    window.addEventListener("hashchange", syncTabFromLocation);
    window.addEventListener("popstate", syncTabFromLocation);
    return () => {
      window.removeEventListener("hashchange", syncTabFromLocation);
      window.removeEventListener("popstate", syncTabFromLocation);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  // ──────────────────────────────────────────────────────────
  // 1. OVERVIEW: 7-STAGE INTERACTIVE CANVAS
  // ──────────────────────────────────────────────────────────
  const [selectedCanvasStage, setSelectedCanvasStage] = useState<number>(0);

  const canvasStages = [
    {
      step: "1. Ingest",
      topicKey: "kafka",
      tech: "Debezium · Kafka · Event Hubs",
      title: "Stage 1: Real-Time & Event-Driven Ingestion",
      summary: "Log-based Change Data Capture (CDC) via Debezium reading database WAL/binlogs directly into Kafka event streams using the Transactional Outbox Pattern.",
      standards: "Apache Kafka 3.8+ (KRaft mode), Debezium 2.7+, Confluent Schema Registry (Avro/Protobuf).",
      sla: "End-to-end ingestion latency < 500ms; exactly-once semantics with idempotent consumers.",
      pitfalls: "Large uncommitted transactions flooding WAL buffers; schema drift breaking downstream consumers without DLQs.",
      code: `# Python / PySpark: Exactly-Once Structured Streaming from Kafka CDC
stream = (
    spark.readStream.format("kafka")
    .option("kafka.bootstrap.servers", "kafka:9092")
    .option("subscribe", "pg.sales.outbox_events")
    .option("startingOffsets", "latest")
    .load()
    .selectExpr("CAST(value AS STRING) as json_str")
    .select(from_json(col("json_str"), schema).alias("payload"))
    .select("payload.*")
    .withWatermark("event_timestamp", "10 minutes")
    .writeStream.format("delta")
    .option("checkpointLocation", "s3://chk/sales_bronze")
    .outputMode("append")
    .table("bronze.raw_sales_events")
)`,
      codeLang: "python",
      codeFilename: "kafka_cdc_ingest.py",
    },
    {
      step: "2. Store",
      topicKey: "datalake",
      tech: "Delta UniForm · Iceberg v3 · ADLS",
      title: "Stage 2: Open Lakehouse Storage & Table Formats",
      summary: "Open table formats on cloud object storage (ADLS Gen2 / AWS S3) with ACID guarantees, deletion vectors, and multi-format metadata synchronization via Delta UniForm.",
      standards: "Delta Lake 3.2+ with UniForm (Iceberg v2/v3 metadata output), Parquet columnar files with Snappy/ZSTD compression.",
      sla: "Zero data duplication; cross-engine reads from Snowflake, Trino, and DuckDB with 0ms translation lag.",
      pitfalls: "Small file accumulation under frequent micro-batch commits; orphan snapshot storage bloat if VACUUM is neglected.",
      code: `-- Databricks SQL: Configure Delta UniForm with Iceberg metadata generation
ALTER TABLE silver.fact_transactions SET TBLPROPERTIES (
  'delta.universalFormat.enabledFormats' = 'iceberg',
  'delta.enableDeletionVectors' = 'true',
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true'
);
-- Trigger incremental clustering
OPTIMIZE silver.fact_transactions;`,
      codeLang: "sql",
      codeFilename: "uniform_table_config.sql",
    },
    {
      step: "3. Catalog",
      topicKey: "unitycatalog",
      tech: "Unity Catalog OSS · Apache Polaris",
      title: "Stage 3: Metadata Control Plane & Governance",
      summary: "The metadata control plane acts as the single source of truth across diverse compute engines, enforcing fine-grained RBAC, column masking, and lineage.",
      standards: "Apache Polaris (Iceberg REST Catalog open standard) and Unity Catalog OSS with OpenLineage telemetry.",
      sla: "Sub-50ms catalog snapshot resolution; centralized access control across Databricks, Snowflake, and Trino.",
      pitfalls: "Catalog split-brain when multiple engines write uncoordinated commits; orphan catalog references after storage cleanup.",
      code: `# Python: Connecting to Apache Polaris REST Catalog via PyIceberg
from pyiceberg.catalog import load_catalog

catalog = load_catalog("polaris", **{
    "uri": "https://polaris.corp.internal/api/catalog",
    "credential": "client_id:client_secret",
    "warehouse": "prod_lakehouse"
})

table = catalog.load_table("silver.fact_transactions")
print(f"Current Iceberg Snapshot: {table.current_snapshot().snapshot_id}")`,
      codeLang: "python",
      codeFilename: "polaris_catalog_connect.py",
    },
    {
      step: "4. Compute",
      topicKey: "spark",
      tech: "Spark 4 · Photon · Polars · dbt",
      title: "Stage 4: Vectorized Compute & Transformation",
      summary: "High-throughput declarative data pipelines combining Apache Spark 3.5/4.0 with Photon C++ native SIMD execution, in-process Polars 1.x, and dbt Mesh.",
      standards: "Apache Spark 3.5+ with Photon, Polars 1.x lazy streaming engine, dbt-core with enforced public model contracts.",
      sla: "Sub-5 minute Bronze-to-Gold batch propagation; 100% contract enforcement on cross-project dbt models.",
      pitfalls: "Data skew causing executor OOM during shuffles; uncontracted schema mutations corrupting downstream marts.",
      code: `# Python: Polars Lazy Streaming Pipeline (Zero JVM Overhead)
import polars as pl

q = (
    pl.scan_parquet("s3://lake/silver/*.parquet")
    .filter(pl.col("status") == "COMPLETED")
    .group_by(["region", pl.col("order_date").dt.truncate("1d")])
    .agg([
        pl.col("amount").sum().alias("daily_revenue"),
        pl.col("customer_id").n_unique().alias("unique_buyers")
    ])
    .sort("daily_revenue", descending=True)
)

df = q.collect(streaming=True)`,
      codeLang: "python",
      codeFilename: "polars_streaming_transform.py",
    },
    {
      step: "5. Serve",
      topicKey: "snowflake",
      tech: "Serverless SQL · Direct Lake · DuckDB",
      title: "Stage 5: Low-Latency Semantic Serving",
      summary: "Serverless analytical warehouses and in-process DuckDB engines delivering sub-second BI query responses and Direct Lake Power BI semantic models.",
      standards: "Databricks Serverless DBSQL, Snowflake Hybrid Tables, Microsoft Fabric Direct Lake mode, DuckDB.",
      sla: "P95 query response < 1.2 seconds for executive dashboards; 0-hour data refresh lag in Direct Lake.",
      pitfalls: "Warehouse auto-suspend set too high causing credit burn; DirectQuery fallback in Fabric due to unsupported DAX measures.",
      code: `-- DuckDB: Instant zero-copy query over remote S3 Parquet without cluster startup
INSTALL httpfs; LOAD httpfs;
SET s3_region = 'us-east-1';

SELECT 
    region,
    DATE_TRUNC('month', order_date) as sales_month,
    SUM(amount) as net_revenue
FROM read_parquet('s3://prod-lake/gold/orders/**/*.parquet')
WHERE year = 2026
GROUP BY 1, 2
ORDER BY net_revenue DESC;`,
      codeLang: "sql",
      codeFilename: "duckdb_remote_serving.sql",
    },
    {
      step: "6. AI & RAG",
      topicKey: "ai",
      tech: "Vector Search · MCP · LLM Tools",
      title: "Stage 6: AI, Vector Search & Agentic Protocol",
      summary: "Enterprise RAG pipelines and Model Context Protocol (MCP) servers exposing curated data warehouse tables and semantic metrics to autonomous AI agents.",
      standards: "Model Context Protocol (FastMCP), Delta Vector Search with HNSW index, Reciprocal Rank Fusion (RRF).",
      sla: "Sub-50ms vector cosine search; zero SQL hallucination via typed MCP tool invocation.",
      pitfalls: "Dense embeddings failing on exact SKU/error code searches (requires hybrid search); unbounded LLM token costs.",
      code: `# Python: Model Context Protocol (MCP) Server for Data Warehouse
from mcp.server.fastmcp import FastMCP
import duckdb

mcp = FastMCP("Data-Warehouse-Gateway")
con = duckdb.connect("warehouse.duckdb", read_only=True)

@mcp.tool()
def get_revenue_metric(region: str, year: int) -> dict:
    """Fetch verified financial metric from Gold lakehouse semantic layer."""
    sql = "SELECT SUM(amount) FROM gold_revenue WHERE region = ? AND year = ?"
    val = con.execute(sql, [region, year]).fetchone()[0]
    return {"region": region, "year": year, "net_revenue": val}`,
      codeLang: "python",
      codeFilename: "mcp_warehouse_server.py",
    },
    {
      step: "7. FinOps",
      topicKey: "finops",
      tech: "Auto-Stop · Storage Tiering · Linage",
      title: "Stage 7: Governance, Lineage & FinOps Engineering",
      summary: "Continuous cost guardrails, 2-minute serverless warehouse auto-suspend, automated storage lifecycle rules, and OpenLineage data tracking.",
      standards: "Azure Storage Lifecycle Management, Snowflake Resource Monitors, Databricks Serverless Auto-Stop, OpenLineage.",
      sla: "Zero idle compute billing beyond 120 seconds; 80%+ storage cost reduction on cold Bronze files.",
      pitfalls: "Forgetting to terminate multi-cluster warehouse scaling; running unbounded scan queries without partition filters.",
      code: `-- Snowflake FinOps: Strict auto-suspend with monthly budget monitor
ALTER WAREHOUSE analytics_wh SET 
  AUTO_SUSPEND = 60 
  AUTO_RESUME = TRUE 
  MIN_CLUSTER_COUNT = 1 
  MAX_CLUSTER_COUNT = 3 
  SCALING_POLICY = 'ECONOMY';

CREATE OR REPLACE RESOURCE MONITOR monthly_cap
  WITH CREDIT_QUOTA = 2000
  FREQUENCY = MONTHLY
  TRIGGERS ON 90% DO NOTIFY
           ON 100% DO SUSPEND;`,
      codeLang: "sql",
      codeFilename: "finops_guardrails.sql",
    },
  ];

  // ──────────────────────────────────────────────────────────
  // 2. CONCEPTS: FILTER & SEARCH
  // ──────────────────────────────────────────────────────────
  const [conceptSearch, setConceptSearch] = useState("");
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>("all");
  const [openConceptId, setOpenConceptId] = useState<string | null>(null);

  const filteredConcepts = useMemo(() => {
    return modernConceptsDb.filter((c) => {
      const matchesSubdomain =
        selectedSubdomain === "all" || c.subdomain === selectedSubdomain;
      const q = conceptSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        (c.details && c.details.toLowerCase().includes(q));
      return matchesSubdomain && matchesSearch;
    });
  }, [conceptSearch, selectedSubdomain]);

  // ──────────────────────────────────────────────────────────
  // 3. SIMULATORS: STATE & LOGIC
  // ──────────────────────────────────────────────────────────
  const [shuffleRows, setShuffleRows] = useState(50);
  const [shuffleSkew, setShuffleSkew] = useState(1.5);
  const [rowSizeBytes, setRowSizeBytes] = useState(250);

  const [targetCatalogEngine, setTargetCatalogEngine] = useState("uc");
  const [tableWriteMode, setTableWriteMode] = useState<"batch" | "stream" | "merge">("stream");

  const [costTb, setCostTb] = useState(15);
  const [queriesPerDay, setQueriesPerDay] = useState(120);

  const [sparkWorkers, setSparkWorkers] = useState(8);
  const [coresPerWorker, setCoresPerWorker] = useState(4);
  const [ramPerWorkerGb, setRamPerWorkerGb] = useState(16);

  const [ragChunk, setRagChunk] = useState(512);
  const [ragOverlapPct, setRagOverlapPct] = useState(15);
  const [docCorpusCount, setDocCorpusCount] = useState(50000);

  const [streamIngestRate, setStreamIngestRate] = useState(10000);
  const [watermarkMins, setWatermarkMins] = useState(10);

  // ──────────────────────────────────────────────────────────
  // 4. BLUEPRINTS: FILTER & STATE
  // ──────────────────────────────────────────────────────────
  const [blueprintCategory, setBlueprintCategory] = useState<string>("all");
  const [blueprintSearch, setBlueprintSearch] = useState<string>("");
  const [inspectBlueprintId, setInspectBlueprintId] = useState<string | null>(null);

  const blueprintCategories = useMemo(() => {
    const cats = Array.from(new Set(modernBlueprintsDb.map((b) => b.category)));
    return ["all", ...cats];
  }, []);

  const filteredBlueprints = useMemo(() => {
    return modernBlueprintsDb.filter((bp) => {
      const matchesCat =
        blueprintCategory === "all" || bp.category === blueprintCategory;
      const q = blueprintSearch.toLowerCase().trim();
      const matchesQuery =
        !q ||
        bp.title.toLowerCase().includes(q) ||
        bp.category.toLowerCase().includes(q) ||
        bp.tags.some((t: string) => t.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [blueprintCategory, blueprintSearch]);

  // ──────────────────────────────────────────────────────────
  // 5. MATRIX: ENGINE SELECTOR
  // ──────────────────────────────────────────────────────────
  const [matrixEngineFilter, setMatrixEngineFilter] = useState<
    "side_by_side" | "python" | "pyspark" | "duckdb" | "sparksql" | "snowflake" | "bigquery"
  >("side_by_side");

  // ──────────────────────────────────────────────────────────
  // 6. PYTHON QUESTIONS: SEARCH & CATEGORY
  // ──────────────────────────────────────────────────────────
  const [pythonQSearch, setPythonQSearch] = useState("");
  const [pythonCategory, setPythonCategory] = useState<string>("all");

  const pythonCategories = useMemo(() => {
    const cats = Array.from(new Set(modernStackDb.map((q) => q.category)));
    return ["all", ...cats];
  }, []);

  const filteredPythonQuestions = useMemo(() => {
    return modernStackDb.filter((q) => {
      const matchesCat =
        pythonCategory === "all" || q.category === pythonCategory;
      const search = pythonQSearch.toLowerCase().trim();
      const matchesSearch =
        !search ||
        q.question.toLowerCase().includes(search) ||
        q.answer.toLowerCase().includes(search);
      return matchesCat && matchesSearch;
    });
  }, [pythonCategory, pythonQSearch]);

  return (
    <div className="space-y-4 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      <HubSubnav
        hubTitle="Concepts & Engines"
        items={[
          { label: "Concepts Glossary", href: "/concepts", icon: BookOpen, badge: "436 Terms" },
          { label: "Spark Engine Lab", href: "/spark-engine", icon: Zap, badge: "Simulator" },
          { label: "Modern Stack & FinOps", href: "/modern-stack", icon: Layers, badge: "Playbooks" },
        ]}
      />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-3.5 sm:p-5 isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-4xl 2xl:max-w-6xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
              <Layers size={13} />
              <span>Modern Data &amp; AI Stack · 2026 Reference Architecture</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Modern Data Engineering &amp; AI Lakehouse Hub
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              Open table formats (Delta UniForm &amp; Iceberg), metadata control planes (Polaris &amp; Unity Catalog),
              vectorized compute (Photon &amp; Polars), 6 live interactive simulators, {modernBlueprintsDb.length} production blueprints,
              and 20+ runnable Python/PySpark/SQL solutions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-base sm:text-lg font-bold text-cyan-400 leading-none">
                {modernBlueprintsDb.length}
              </div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium mt-0.5">Blueprints</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-base sm:text-lg font-bold text-green-400 leading-none">6</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium mt-0.5">Simulators</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-base sm:text-lg font-bold text-purple-400 leading-none">
                {modernStackDb.length}
              </div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium mt-0.5">Q&amp;A Runbooks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtab Navigation Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "overview", label: "Hub Overview", icon: Sparkles },
          { id: "concepts", label: `Core Concepts (${modernConceptsDb.length})`, icon: BookOpen },
          { id: "simulators", label: "6 Live Simulators", icon: Calculator },
          { id: "blueprints", label: `${modernBlueprintsDb.length} Blueprints Gallery`, icon: Cpu },
          { id: "matrix", label: `Polyglot Matrix (${modernCodeMatrix.length})`, icon: FileCode2 },
          { id: "ai", label: "AI & RAG Stack", icon: Bot },
          { id: "cost", label: `FinOps Playbook (${modernCostPlaybooks.length})`, icon: Flame },
          { id: "compatibility", label: "Cloud × Table Matrix", icon: Table },
          { id: "python", label: `Python for Modern Stack (${modernStackDb.length})`, icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as ModernSubtab)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer",
                isSelected
                  ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20 font-semibold"
                  : "bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] border border-[var(--border)]"
              )}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. OVERVIEW & CANVAS */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div id="overview" className="space-y-4 animate-in fade-in duration-200">
          {/* Interactive Stack Flow Canvas */}
          <div className="p-3.5 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Workflow size={16} className="text-purple-400" />
                  Enterprise Modern Data &amp; AI Stack Flow
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Click any stage to inspect the technical architecture, SLAs, production pitfalls, and code implementation.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 self-start sm:self-auto">
                Stage {selectedCanvasStage + 1} of {canvasStages.length} Active
              </span>
            </div>

            {/* Stages Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {canvasStages.map((stage, idx) => {
                const isSelected = selectedCanvasStage === idx;
                return (
                  <button
                    key={stage.step}
                    onClick={() => setSelectedCanvasStage(idx)}
                    className={cn(
                      "p-2.5 rounded-xl border text-left transition-all relative group cursor-pointer",
                      isSelected
                        ? "bg-purple-600/15 border-purple-500 shadow-sm shadow-purple-500/15 ring-1 ring-purple-500/50"
                        : "bg-[var(--surface-2)] border-[var(--border)] hover:border-purple-500/40 hover:bg-[var(--surface-3)]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <TopicIcon topic={stage.topicKey} size={18} />
                      <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                        0{idx + 1}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-[var(--foreground)] mt-2 truncate">
                      {stage.step}
                    </div>
                    <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5 truncate">
                      {stage.tech.split("·")[0]}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stage Detail Card */}
            {(() => {
              const cur = canvasStages[selectedCanvasStage];
              return (
                <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-purple-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[var(--border)]">
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                        Architecture Deep Dive
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                        {cur.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 size={13} />
                      <span>{cur.tech}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                    {cur.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] space-y-1">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                        Tech Standards
                      </span>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        {cur.standards}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Target SLA &amp; Throughput
                      </span>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        {cur.sla}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] space-y-1">
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
                        Production Pitfalls
                      </span>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        {cur.pitfalls}
                      </p>
                    </div>
                  </div>

                  {cur.code && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs px-0.5">
                        <span className="text-[11px] font-mono text-purple-300 font-medium">
                          Production Blueprint Code / DDL
                        </span>
                      </div>
                      <CodeBlock
                        code={cur.code}
                        language={cur.codeLang}
                        filename={cur.codeFilename}
                        showLineNumbers={false}
                      />
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Quick Launch Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div
              onClick={() => handleTabChange("concepts")}
              className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-purple-500/40 cursor-pointer transition-all space-y-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <BookOpen size={16} />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-purple-300 transition-colors">
                {modernConceptsDb.length} Core Concepts
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                CAP theorem, PACELC, Deletion Vectors, Delta UniForm, and Liquid Clustering explained.
              </p>
            </div>

            <div
              onClick={() => handleTabChange("simulators")}
              className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-purple-500/40 cursor-pointer transition-all space-y-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center font-bold">
                <Calculator size={16} />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-purple-300 transition-colors">
                6 Live Simulators
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Calculate shuffles, tune partition skew, size Spark memory, and estimate RAG token costs.
              </p>
            </div>

            <div
              onClick={() => handleTabChange("matrix")}
              className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-purple-500/40 cursor-pointer transition-all space-y-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <FileCode2 size={16} />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-purple-300 transition-colors">
                {modernCodeMatrix.length} Polyglot Matrix
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Side-by-side code across Polars, PySpark, DuckDB, Snowflake, and BigQuery.
              </p>
            </div>

            <div
              onClick={() => handleTabChange("python")}
              className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-purple-500/40 cursor-pointer transition-all space-y-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Code2 size={16} />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-purple-300 transition-colors">
                {modernStackDb.length} Python Q&amp;As
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Production-grade Python and PySpark runbooks with readable syntax typography.
              </p>
            </div>
          </div>

          {/* Architecture Trade-off Comparison Table */}
          <div className="p-3.5 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                Modern Lakehouse Architecture Trade-off Matrix
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Key architectural decisions when evaluating modern storage, catalog, and serving patterns.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                    <th className="py-2.5 px-3 font-semibold">Architectural Vector</th>
                    <th className="py-2.5 px-3 font-semibold">Open Lakehouse (Delta/Iceberg)</th>
                    <th className="py-2.5 px-3 font-semibold">Cloud DW (Snowflake/BigQuery)</th>
                    <th className="py-2.5 px-3 font-semibold">Embedded / Hybrid (DuckDB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-purple-300">Storage &amp; Format</td>
                    <td className="py-2.5 px-3">Open Parquet in customer S3/ADLS with UniForm or Iceberg v2/v3</td>
                    <td className="py-2.5 px-3">Proprietary micro-partition format or managed external Iceberg</td>
                    <td className="py-2.5 px-3">Local single-file database or remote Parquet reading via HTTP range requests</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-purple-300">Catalog Governance</td>
                    <td className="py-2.5 px-3">Unity Catalog OSS / Apache Polaris REST (vendor-neutral)</td>
                    <td className="py-2.5 px-3">Snowflake / BigQuery native catalog with external REST links</td>
                    <td className="py-2.5 px-3">MotherDuck cloud catalog or file-system paths</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-purple-300">Compute Cost Model</td>
                    <td className="py-2.5 px-3">Serverless DBU or VM compute; zero storage markup</td>
                    <td className="py-2.5 px-3">Credit-based warehouse compute + per-TB storage charges</td>
                    <td className="py-2.5 px-3">Free local compute; low-cost serverless MotherDuck</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-purple-300">Best Suited For</td>
                    <td className="py-2.5 px-3">Multi-engine enterprise lakehouses, large-scale Spark/AI ETL</td>
                    <td className="py-2.5 px-3">Interactive BI, financial reporting, highly structured EDWs</td>
                    <td className="py-2.5 px-3">Lightweight pipelines, local analytics, edge processing, serverless apps</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. CONCEPTS TAB */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "concepts" && (
        <div id="concepts" className="space-y-4 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search concepts by name, mechanism, or trade-off..."
                value={conceptSearch}
                onChange={(e) => setConceptSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { id: "all", label: "All Subdomains" },
                { id: "dist-sys", label: "Distributed Systems" },
                { id: "storage-formats", label: "Storage & Formats" },
                { id: "compute-engines", label: "Compute Engines" },
                { id: "streaming-cdc", label: "Streaming & CDC" },
                { id: "ai-llm-native", label: "AI & LLM" },
                { id: "finops", label: "FinOps" },
                { id: "security-gov", label: "Governance" },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubdomain(sub.id)}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer",
                    selectedSubdomain === sub.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {/* Concepts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredConcepts.map((concept) => {
              const isOpen = openConceptId === concept.id;
              const diffColor =
                concept.difficulty === "ARCHITECT"
                  ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                  : concept.difficulty === "HARD"
                  ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/20";

              return (
                <div
                  key={concept.id}
                  className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenConceptId(isOpen ? null : concept.id)}
                    className="w-full p-3.5 text-left flex items-start justify-between gap-3 hover:bg-[var(--surface-2)]/60 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", diffColor)}>
                          {concept.difficulty}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                          {concept.subdomain}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">
                        {concept.title}
                      </h4>
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                        {concept.summary}
                      </p>
                    </div>
                    <ChevronDown
                      size={15}
                      className={cn(
                        "text-[var(--muted-foreground)] shrink-0 mt-1 transition-transform duration-200",
                        isOpen && "rotate-180 text-purple-400"
                      )}
                    />
                  </button>

                  <SmoothAccordion isOpen={isOpen} innerClassName="px-3 pb-3 pt-2 space-y-2 text-xs bg-[var(--surface-2)]/40 border-t border-[var(--border)]">
                    {concept.details && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                          Deep Implementation Mechanics
                        </span>
                        <p className="text-[var(--foreground)] opacity-90 leading-relaxed text-xs">
                          {concept.details}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border)]/60 text-[11px]">
                      <Link
                        href={`/qa-prep?q=${encodeURIComponent(concept.title)}`}
                        className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        <Terminal size={12} />
                        <span>Practice Related Interview Questions &rarr;</span>
                      </Link>
                      <Link
                        href={`/architecture?scenario=${encodeURIComponent(concept.title)}`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        <Layers size={12} />
                        <span>Architectural Scenarios &rarr;</span>
                      </Link>
                    </div>
                  </SmoothAccordion>
                </div>
              );
            })}
          </div>

          {filteredConcepts.length === 0 && (
            <div className="p-8 text-center text-xs text-[var(--muted-foreground)] rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
              No modern stack concepts found matching your search.
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. SIMULATORS TAB */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "simulators" && (
        <div id="simulators" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-200">
          {/* Simulator 1: Shuffle & Skew Sizer */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator size={12} /> 1. Shuffle &amp; Data Skew Sizer
                </span>
                <button
                  onClick={() => {
                    setShuffleRows(50);
                    setShuffleSkew(1.5);
                    setRowSizeBytes(250);
                  }}
                  className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  ↺ Reset
                </button>
              </div>

              <div className="space-y-2">
                <div className="space-y-0.5">
                  <label htmlFor="sim-shuffle-rows" className="flex justify-between text-xs font-medium cursor-pointer">
                    <span>Input Rows:</span>
                    <span className="font-bold text-purple-400">{shuffleRows}M rows</span>
                  </label>
                  <input
                    id="sim-shuffle-rows"
                    type="range"
                    min={1}
                    max={500}
                    value={shuffleRows}
                    onChange={(e) => setShuffleRows(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div className="space-y-0.5">
                  <label htmlFor="sim-shuffle-skew" className="flex justify-between text-xs font-medium cursor-pointer">
                    <span>Data Skew Multiplier:</span>
                    <span className={cn("font-bold", shuffleSkew >= 2.5 ? "text-red-400" : "text-orange-400")}>
                      {shuffleSkew}x
                    </span>
                  </label>
                  <input
                    id="sim-shuffle-skew"
                    type="range"
                    min={1.0}
                    max={5.0}
                    step={0.1}
                    value={shuffleSkew}
                    onChange={(e) => setShuffleSkew(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                <div className="space-y-0.5">
                  <label htmlFor="sim-row-size" className="flex justify-between text-xs font-medium cursor-pointer">
                    <span>Avg Record Size:</span>
                    <span className="font-bold text-[var(--foreground)]">{rowSizeBytes} bytes</span>
                  </label>
                  <input
                    id="sim-row-size"
                    type="range"
                    min={100}
                    max={1000}
                    step={50}
                    value={rowSizeBytes}
                    onChange={(e) => setRowSizeBytes(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>
            </div>

            {(() => {
              const rawSizeGb = (shuffleRows * 1_000_000 * rowSizeBytes) / (1024 * 1024 * 1024);
              const shuffleSizeGb = rawSizeGb * shuffleSkew;
              const recPartitions = Math.max(10, Math.round(shuffleSizeGb / 0.15)); // target ~150MB per partition
              const isHighSkew = shuffleSkew >= 2.5;

              return (
                <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-purple-500/20 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300 font-bold">Predicted Shuffle Spill:</span>
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                      isHighSkew ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"
                    )}>
                      {isHighSkew ? "⚠️ High Disk Spill Risk" : "Normal Spill Risk"}
                    </span>
                  </div>
                  <div className="text-[var(--foreground)] font-mono text-[11px]">
                    Shuffle Volume: ~{shuffleSizeGb.toFixed(1)} GB (Raw: {rawSizeGb.toFixed(1)} GB)
                  </div>
                  <div className="text-[var(--muted-foreground)] text-[11px]">
                    Optimal Partitions: <span className="text-purple-300 font-mono font-bold">{recPartitions}</span> (target ~150MB/partition)
                  </div>
                  {isHighSkew && (
                    <div className="text-[10px] text-red-300/90 pt-1 border-t border-red-500/20 leading-relaxed">
                      💡 Skew &gt; 2.5x detected! Enable AQE skew join: <code className="text-purple-300">spark.sql.adaptive.skewJoin.enabled = true</code> or apply salting keys.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Simulator 2: Open Table Format & Catalog Selector */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Table size={12} /> 2. Table Format &amp; Catalog Selector
                </span>
                <button
                  onClick={() => {
                    setTargetCatalogEngine("uc");
                    setTableWriteMode("stream");
                  }}
                  className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  ↺ Reset
                </button>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <span className="text-xs font-medium block">Target Ecosystem:</span>
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                    {[
                      { id: "uc", label: "Databricks UC" },
                      { id: "polaris", label: "Snowflake/Polaris" },
                      { id: "fabric", label: "MS Fabric" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setTargetCatalogEngine(c.id)}
                        className={cn(
                          "py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer",
                          targetCatalogEngine === c.id
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium block">Ingestion Pattern:</span>
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                    {[
                      { id: "stream", label: "Streaming CDC" },
                      { id: "merge", label: "Upsert/SCD2" },
                      { id: "batch", label: "Bulk Batch" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setTableWriteMode(m.id as typeof tableWriteMode)}
                        className={cn(
                          "py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer",
                          tableWriteMode === m.id
                            ? "bg-cyan-600 text-white shadow-xs"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-cyan-500/20 text-xs space-y-1">
              <div className="text-cyan-300 font-bold">Architect Recommendation:</div>
              <div className="text-[var(--foreground)] text-[11px] leading-relaxed">
                {targetCatalogEngine === "uc" && (
                  <>
                    <strong>Format:</strong> Delta Lake with UniForm enabled (<code className="text-cyan-300">iceberg</code> metadata).
                    {tableWriteMode === "merge" && " Use Deletion Vectors to eliminate 500MB Parquet rewrites on single row updates."}
                    {tableWriteMode === "stream" && " Enable Auto-Compact and write.delete.mode=merge-on-read."}
                  </>
                )}
                {targetCatalogEngine === "polaris" && (
                  <>
                    <strong>Format:</strong> Apache Iceberg v2/v3 managed via Apache Polaris REST catalog.
                    Enables zero-copy external access across Snowflake, Trino, and Databricks.
                  </>
                )}
                {targetCatalogEngine === "fabric" && (
                  <>
                    <strong>Format:</strong> Delta Parquet with V-Order enabled in Microsoft OneLake.
                    Guarantees sub-second in-memory direct access in Power BI Direct Lake mode.
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Simulator 3: Serverless Storage vs Scan Cost */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame size={12} /> 3. Query Scan Cost Estimator
                </span>
                <button
                  onClick={() => {
                    setCostTb(15);
                    setQueriesPerDay(120);
                  }}
                  className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  ↺ Reset
                </button>
              </div>

              <div className="space-y-2">
                <div className="space-y-0.5">
                  <label htmlFor="sim-cost-tb" className="flex justify-between text-xs font-medium cursor-pointer">
                    <span>Monthly TB Scanned:</span>
                    <span className="font-bold text-green-400">{costTb} TB</span>
                  </label>
                  <input
                    id="sim-cost-tb"
                    type="range"
                    min={1}
                    max={100}
                    value={costTb}
                    onChange={(e) => setCostTb(Number(e.target.value))}
                    className="w-full accent-green-500"
                  />
                </div>

                <div className="space-y-0.5">
                  <label htmlFor="sim-queries-day" className="flex justify-between text-xs font-medium cursor-pointer">
                    <span>Daily Concurrency / Runs:</span>
                    <span className="font-bold text-[var(--foreground)]">{queriesPerDay} queries/day</span>
                  </label>
                  <input
                    id="sim-queries-day"
                    type="range"
                    min={10}
                    max={500}
                    step={10}
                    value={queriesPerDay}
                    onChange={(e) => setQueriesPerDay(Number(e.target.value))}
                    className="w-full accent-green-500"
                  />
                </div>
              </div>
            </div>

            {(() => {
              const bqCost = costTb * 6.25; // BigQuery On-demand $6.25/TB
              const dbsqlEst = (costTb * 11.5); // DBSQL Serverless approx
              const duckdbStorage = (costTb * 0.023 * 1024 * 0.1); // S3 storage with 90% partition pushdown

              return (
                <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-green-500/20 text-xs space-y-1">
                  <div className="text-green-300 font-bold">Monthly Cloud Cost Breakdown:</div>
                  <div className="text-[var(--foreground)] font-mono text-[11px] flex justify-between">
                    <span>BigQuery On-Demand ($6.25/TB):</span>
                    <span className="font-bold">${bqCost.toFixed(2)}</span>
                  </div>
                  <div className="text-[var(--foreground)] font-mono text-[11px] flex justify-between">
                    <span>Databricks Serverless SQL:</span>
                    <span className="font-bold">~${dbsqlEst.toFixed(2)}</span>
                  </div>
                  <div className="text-[var(--muted-foreground)] font-mono text-[11px] flex justify-between pt-0.5 border-t border-[var(--border)]">
                    <span>DuckDB direct over S3 (90% pruned):</span>
                    <span className="text-emerald-400 font-bold">~${duckdbStorage.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-green-300/80 pt-0.5">
                    💡 Applying Liquid Clustering or Partition Pruning cuts scan volume by up to 85%.
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Simulator 4: Spark Cluster Sizing */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={12} /> 4. Spark 3.5/4.0 Cluster Sizer
                </span>
                <button
                  onClick={() => {
                    setSparkWorkers(8);
                    setCoresPerWorker(4);
                    setRamPerWorkerGb(16);
                  }}
                  className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  ↺ Reset
                </button>
              </div>

              <div className="space-y-2">
                <div className="space-y-0.5">
                  <label htmlFor="sim-workers" className="flex justify-between text-xs font-medium cursor-pointer">
                    <span>Worker Nodes:</span>
                    <span className="font-bold text-amber-400">{sparkWorkers} Nodes</span>
                  </label>
                  <input
                    id="sim-workers"
                    type="range"
                    min={2}
                    max={64}
                    step={2}
                    value={sparkWorkers}
                    onChange={(e) => setSparkWorkers(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="space-y-0.5">
                  <label htmlFor="sim-cores" className="flex justify-between text-xs font-medium cursor-pointer">
                    <span>Cores per Worker:</span>
                    <span className="font-bold text-[var(--foreground)]">{coresPerWorker} cores</span>
                  </label>
                  <input
                    id="sim-cores"
                    type="range"
                    min={2}
                    max={16}
                    step={2}
                    value={coresPerWorker}
                    onChange={(e) => setCoresPerWorker(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            </div>

            {(() => {
              const totalCores = sparkWorkers * coresPerWorker;
              const totalRam = sparkWorkers * ramPerWorkerGb;
              const offHeapMemGb = Math.round(totalRam * 0.1);

              return (
                <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-amber-500/20 text-xs space-y-1">
                  <div className="text-amber-300 font-bold">Cluster Execution Profile:</div>
                  <div className="text-[var(--foreground)] font-mono text-[11px]">
                    Total Cores: {totalCores} · RAM: {totalRam} GB
                  </div>
                  <div className="text-[var(--muted-foreground)] text-[11px]">
                    Recommended spark.executor.memoryOverhead: ~{Math.max(1, Math.round(ramPerWorkerGb * 0.15))} GB
                  </div>
                  <div className="text-[10px] text-amber-300/80 pt-0.5">
                    Photon vectorized C++ execution provides up to 3x throughput on these cores.
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Simulator 5: RAG Chunk & Token Config */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bot size={12} /> 5. RAG Vector &amp; Token Sizer
                </span>
                <button
                  onClick={() => {
                    setRagChunk(512);
                    setRagOverlapPct(15);
                    setDocCorpusCount(50000);
                  }}
                  className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  ↺ Reset
                </button>
              </div>

              <div className="space-y-2">
                <div className="space-y-0.5">
                  <label htmlFor="sim-rag-chunk" className="flex justify-between text-xs font-medium cursor-pointer">
                    <span>Chunk Size:</span>
                    <span className="font-bold text-pink-400">{ragChunk} tokens</span>
                  </label>
                  <input
                    id="sim-rag-chunk"
                    type="range"
                    min={128}
                    max={2048}
                    step={128}
                    value={ragChunk}
                    onChange={(e) => setRagChunk(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div className="space-y-0.5">
                  <label htmlFor="sim-rag-overlap" className="flex justify-between text-xs font-medium cursor-pointer">
                    <span>Overlap:</span>
                    <span className="font-bold text-[var(--foreground)]">{ragOverlapPct}%</span>
                  </label>
                  <input
                    id="sim-rag-overlap"
                    type="range"
                    min={5}
                    max={30}
                    step={5}
                    value={ragOverlapPct}
                    onChange={(e) => setRagOverlapPct(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>
            </div>

            {(() => {
              const overlapTokens = Math.round(ragChunk * (ragOverlapPct / 100));
              const effectiveChunk = ragChunk - overlapTokens;
              const estChunks = Math.round(docCorpusCount * 3); // approx 3 chunks per doc
              const vectorMemoryMb = Math.round((estChunks * 1536 * 4) / (1024 * 1024));

              return (
                <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-pink-500/20 text-xs space-y-1">
                  <div className="text-pink-300 font-bold">Vector Index Geometry:</div>
                  <div className="text-[var(--foreground)] font-mono text-[11px]">
                    Effective Step: {effectiveChunk} tokens (Overlap: {overlapTokens} tok)
                  </div>
                  <div className="text-[var(--muted-foreground)] text-[11px]">
                    Estimated HNSW Memory Footprint: ~{vectorMemoryMb} MB for {estChunks.toLocaleString()} chunks
                  </div>
                  <div className="text-[10px] text-pink-300/80 pt-0.5">
                    {ragChunk <= 512
                      ? "High precision search, ideal for exact factual Q&A."
                      : "Broad context window, optimal for long executive summaries."}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Simulator 6: Streaming Watermark */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw size={12} /> 6. Streaming Watermark &amp; State Sizer
                </span>
                <button
                  onClick={() => {
                    setWatermarkMins(10);
                    setStreamIngestRate(10000);
                  }}
                  className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  ↺ Reset
                </button>
              </div>

              <div className="space-y-2">
                <div className="space-y-0.5">
                  <label htmlFor="sim-watermark" className="flex justify-between text-xs font-medium cursor-pointer">
                    <span>Allowed Lateness:</span>
                    <span className="font-bold text-red-400">{watermarkMins} Mins</span>
                  </label>
                  <input
                    id="sim-watermark"
                    type="range"
                    min={1}
                    max={60}
                    value={watermarkMins}
                    onChange={(e) => setWatermarkMins(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>

                <div className="space-y-0.5">
                  <label htmlFor="sim-rate" className="flex justify-between text-xs font-medium cursor-pointer">
                    <span>Ingest Throughput:</span>
                    <span className="font-bold text-[var(--foreground)]">
                      {(streamIngestRate / 1000).toFixed(0)}k events/sec
                    </span>
                  </label>
                  <input
                    id="sim-rate"
                    type="range"
                    min={1000}
                    max={50000}
                    step={1000}
                    value={streamIngestRate}
                    onChange={(e) => setStreamIngestRate(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>
              </div>
            </div>

            {(() => {
              const inFlightEvents = streamIngestRate * 60 * watermarkMins;
              const stateMb = Math.round((inFlightEvents * 200) / (1024 * 1024));

              return (
                <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-red-500/20 text-xs space-y-1">
                  <div className="text-red-300 font-bold">State Store Memory Impact:</div>
                  <div className="text-[var(--foreground)] font-mono text-[11px]">
                    In-Flight State Store: ~{(stateMb / 1024).toFixed(2)} GB ({inFlightEvents.toLocaleString()} events)
                  </div>
                  <div className="text-[var(--muted-foreground)] text-[11px]">
                    Events lagging &gt; {watermarkMins}m dropped without updating state.
                  </div>
                  <div className="text-[10px] text-red-300/80 pt-0.5">
                    💡 Requires RocksDB provider to eliminate JVM heap garbage collection pauses.
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. BLUEPRINTS GALLERY TAB */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "blueprints" && (
        <div id="blueprints" className="space-y-4 animate-in fade-in duration-200">
          {/* Top Banner with Whiteboard Link */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles size={13} /> Full Visual System Blueprints &amp; Architecture Hub
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                Looking for High-Resolution Whiteboard Architecture Blueprints?
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                View our hand-drawn whiteboard architecture diagrams covering Apache Iceberg, Vector Search, Kafka CDC, Airflow, and Medallion Lakehouses.
              </p>
            </div>
            <Link
              href="/architecture?tab=diagrams"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 transition-colors shadow-xs whitespace-nowrap inline-flex items-center gap-1.5"
            >
              <span>Open Whiteboard Hub</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search blueprints by name, category, or technology..."
                value={blueprintSearch}
                onChange={(e) => setBlueprintSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {blueprintCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setBlueprintCategory(cat)}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer",
                    blueprintCategory === cat
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Blueprints Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBlueprints.map((bp) => {
              const isInspecting = inspectBlueprintId === bp.id;
              return (
                <div
                  key={bp.id}
                  id={`bp-${bp.id}`}
                  className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                        {bp.category}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        {bp.costEstimate}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">{bp.title}</h3>

                    <div className="flex flex-wrap gap-1">
                      {bp.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[9px] px-1.5 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--muted-foreground)] font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Clean Monospace ASCII Architecture Flow */}
                  <div
                    className="p-3 rounded-lg bg-[#0A0A0B] border border-white/10 text-[11px] font-mono text-purple-200 overflow-x-auto whitespace-pre leading-relaxed scrollbar-thin"
                    style={{
                      fontFamily: "var(--font-mono), 'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, Menlo, Consolas, monospace",
                    }}
                  >
                    {bp.ascii}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[var(--border)] text-xs">
                    <button
                      onClick={() => setInspectBlueprintId(isInspecting ? null : bp.id)}
                      className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 cursor-pointer text-xs"
                    >
                      <Info size={13} />
                      <span>{isInspecting ? "Hide Specifications" : "Inspect Specifications"}</span>
                    </button>
                    <Link
                      href="/architecture?tab=diagrams"
                      className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>Whiteboards</span>
                      <ExternalLink size={11} />
                    </Link>
                  </div>

                  <SmoothAccordion isOpen={isInspecting} innerClassName="p-2.5 space-y-1.5 text-xs text-[var(--muted-foreground)] bg-[var(--surface-2)]/60 border-t border-[var(--border)]">
                    <div className="font-semibold text-[var(--foreground)] text-xs">Architectural Implementation Notes:</div>
                    <p className="leading-relaxed text-[11px]">
                      This pattern uses decoupled storage and independent compute nodes to guarantee high availability and zero vendor lock-in.
                      All components communicate via asynchronous event queues and metadata catalogs without point-to-point hard dependencies.
                    </p>
                    <div className="text-[10px] text-purple-300 pt-1 border-t border-[var(--border)]">
                      Target SLA: 99.95% Availability · Failover Time: &lt; 2 minutes
                    </div>
                  </SmoothAccordion>
                </div>
              );
            })}
          </div>

          {filteredBlueprints.length === 0 && (
            <div className="p-8 text-center text-xs text-[var(--muted-foreground)] rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
              No blueprints found matching your filter criteria.
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. POLYGLOT MATRIX TAB */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "matrix" && (
        <div id="matrix" className="space-y-4 animate-in fade-in duration-200">
          {/* Mode Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                <FileCode2 size={15} className="text-purple-400" />
                Polyglot Engine Translation Matrix ({modernCodeMatrix.length} Core Patterns)
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Compare idiomatic implementations across modern distributed and single-node engines.
              </p>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none self-start sm:self-auto">
              {[
                { id: "side_by_side", label: "Side-by-Side" },
                { id: "python", label: "Polars (Python)" },
                { id: "pyspark", label: "PySpark" },
                { id: "duckdb", label: "DuckDB" },
                { id: "sparksql", label: "Spark SQL" },
                { id: "snowflake", label: "Snowflake" },
                { id: "bigquery", label: "BigQuery" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMatrixEngineFilter(tab.id as typeof matrixEngineFilter)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                    matrixEngineFilter === tab.id
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Matrix Cards */}
          <div className="space-y-3">
            {modernCodeMatrix.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-purple-400" />
                    <span>{idx + 1}. {item.topic}</span>
                  </h4>
                  <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                    Pattern #{idx + 1}
                  </span>
                </div>

                {matrixEngineFilter === "side_by_side" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <CodeBlock
                      code={item.python}
                      language="python"
                      filename="Python (Polars)"
                      badge="Polars"
                      showLineNumbers={false}
                    />
                    <CodeBlock
                      code={item.pyspark}
                      language="python"
                      filename="PySpark DataFrame"
                      badge="PySpark"
                      showLineNumbers={false}
                    />
                    <CodeBlock
                      code={item.duckdb}
                      language="sql"
                      filename="DuckDB SQL"
                      badge="DuckDB"
                      showLineNumbers={false}
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase">
                      {matrixEngineFilter.toUpperCase()} Implementation
                    </div>
                    <CodeBlock
                      code={(item as any)[matrixEngineFilter] || item.python}
                      language={matrixEngineFilter === "python" || matrixEngineFilter === "pyspark" ? "python" : "sql"}
                      filename={`${item.topic.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.${matrixEngineFilter === "python" || matrixEngineFilter === "pyspark" ? "py" : "sql"}`}
                      badge={matrixEngineFilter.toUpperCase()}
                      showLineNumbers
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 6. AI & RAG STACK TAB */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "ai" && (
        <div id="ai" className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                title: "Model Context Protocol (MCP) in Data Warehouses",
                badge: "Agentic Tooling Standard",
                desc: "Replaces brittle Text-to-SQL with typed JSON-RPC tools. AI agents (Gemini, Claude) invoke structured tools (e.g., get_customer_ltv) verified against semantic models with strict RBAC.",
                code: `# Python FastMCP Server exposing Data Warehouse tools
from mcp.server.fastmcp import FastMCP
import duckdb

mcp = FastMCP("Enterprise-DW-Gateway")
con = duckdb.connect("warehouse.duckdb", read_only=True)

@mcp.tool()
def query_semantic_metric(metric: str, grain: str, year: int) -> dict:
    """Fetch verified metrics directly from Gold semantic layer."""
    sql = "SELECT dim_region, SUM(revenue) FROM gold_sales WHERE year = ? GROUP BY dim_region"
    rows = con.execute(sql, [year]).fetchall()
    return {"metric": metric, "results": rows}`,
                codeLang: "python",
                codeFilename: "mcp_warehouse_service.py",
              },
              {
                title: "Delta Vector Search & Streaming Embeddings",
                badge: "Lakehouse Vector DB",
                desc: "Delta Live Tables pipelines consume unstructured documents, calculate embeddings using Foundation Model APIs, and auto-sync to managed HNSW indexes with sub-50ms query latency.",
                code: `-- Databricks SQL: Create Delta Vector Search Index
CREATE VECTOR SEARCH INDEX gold.doc_embeddings_idx
ON gold.knowledge_chunks (embedding)
METRIC COSINE
SYNC_MODE CONTINUOUS
WAREHOUSE serverless_wh;

-- Query vector search index
SELECT chunk_id, text_content, score
FROM VECTOR_SEARCH('gold.doc_embeddings_idx', 'Delta Lake UniForm Iceberg', 5);`,
                codeLang: "sql",
                codeFilename: "delta_vector_index.sql",
              },
              {
                title: "Hybrid Search via Reciprocal Rank Fusion (RRF)",
                badge: "RAG Precision Standard",
                desc: "Combines dense cosine similarity with sparse BM25 lexical keyword ranking using RRF scoring: Score = sum(1 / (k + rank)). Eliminates failures on exact SKUs and error codes.",
                code: `# Python: Reciprocal Rank Fusion combining Dense & Sparse results
def rrf_merge(dense_ids: list[str], sparse_ids: list[str], k: int = 60) -> list[tuple[str, float]]:
    scores = {}
    for rank, doc_id in enumerate(dense_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    for rank, doc_id in enumerate(sparse_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)`,
                codeLang: "python",
                codeFilename: "rrf_hybrid_merge.py",
              },
              {
                title: "Semantic Chunking via AST & Syntax Parsers",
                badge: "Ingestion Pipeline",
                desc: "Chunks technical documentation, SQL files, and Python scripts along syntactic statement boundaries rather than fixed token lengths, preserving logical unit integrity.",
                code: `# Python: Chunking SQL scripts along AST statement boundaries
import sqlparse

def chunk_sql_script(raw_sql: str) -> list[str]:
    statements = sqlparse.parse(raw_sql)
    return [str(stmt).strip() for stmt in statements if str(stmt).strip()]`,
                codeLang: "python",
                codeFilename: "semantic_chunker.py",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                      {item.badge}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)]">AI-0{idx + 1}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">{item.title}</h4>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{item.desc}</p>
                </div>
                <CodeBlock
                  code={item.code}
                  language={item.codeLang}
                  filename={item.codeFilename}
                  showLineNumbers={false}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 7. COST OPTIMIZATION TAB */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "cost" && (
        <div id="cost" className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                <Flame size={15} className="text-orange-400" />
                FinOps &amp; Cloud Cost Engineering Playbooks ({modernCostPlaybooks.length} Strategies)
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Quantifiable cloud compute and storage reduction techniques with production automation code.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modernCostPlaybooks.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">{item.title}</h4>
                    <span className="text-[10px] font-bold text-green-400 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 shrink-0">
                      {item.savings.split("(")[0]}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{item.summary}</p>
                </div>
                <CodeBlock
                  code={item.code}
                  language="sql"
                  filename={`${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30)}.sql`}
                  badge={item.savings.split("(")[0]}
                  showLineNumbers={false}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 8. CLOUD TABLE COMPATIBILITY TAB */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "compatibility" && (
        <div
          id="compatibility"
          className="p-3.5 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3.5 overflow-x-auto animate-in fade-in duration-200"
        >
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
              Cloud Engine × Table Format Compatibility Matrix (2026 Standards)
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Native write, metadata translation (UniForm / Polaris), and zero-copy cross-engine read support.
            </p>
          </div>
          <table className="w-full text-xs text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th className="py-2.5 px-3 font-semibold">Engine / Service</th>
                <th className="py-2.5 px-3 font-semibold">Delta Lake</th>
                <th className="py-2.5 px-3 font-semibold">Apache Iceberg</th>
                <th className="py-2.5 px-3 font-semibold">Apache Hudi</th>
                <th className="py-2.5 px-3 font-semibold">Metadata Catalog</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
              <tr>
                <td className="py-2.5 px-3 font-bold">Databricks</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <CheckCircle2 size={13} /> Native (_delta_log)
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <CheckCircle2 size={13} /> UniForm / Read
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-yellow-400 font-medium">
                    <AlertTriangle size={13} /> Read Support
                  </span>
                </td>
                <td className="py-2.5 px-3 text-[var(--muted-foreground)]">Unity Catalog (OSS)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">Snowflake</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-yellow-400 font-medium">
                    <AlertTriangle size={13} /> External Stage
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <CheckCircle2 size={13} /> Native Iceberg Table
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                    <XCircle size={13} /> None
                  </span>
                </td>
                <td className="py-2.5 px-3 text-[var(--muted-foreground)]">Apache Polaris / S3</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">Microsoft Fabric</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <CheckCircle2 size={13} /> OneLake Native
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <CheckCircle2 size={13} /> Iceberg Shortcut
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-yellow-400 font-medium">
                    <AlertTriangle size={13} /> Parquet Shortcut
                  </span>
                </td>
                <td className="py-2.5 px-3 text-[var(--muted-foreground)]">OneLake Metastore</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">Google BigQuery</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <CheckCircle2 size={13} /> BigLake Delta
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <CheckCircle2 size={13} /> BigLake Iceberg
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-yellow-400 font-medium">
                    <AlertTriangle size={13} /> Manifest
                  </span>
                </td>
                <td className="py-2.5 px-3 text-[var(--muted-foreground)]">BigLake Metastore</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">DuckDB</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <CheckCircle2 size={13} /> delta extension
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <CheckCircle2 size={13} /> iceberg extension
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-yellow-400 font-medium">
                    <AlertTriangle size={13} /> Direct Parquet
                  </span>
                </td>
                <td className="py-2.5 px-3 text-[var(--muted-foreground)]">MotherDuck / In-Memory</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">AWS Athena / EMR</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <CheckCircle2 size={13} /> Athena Delta Connector
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <CheckCircle2 size={13} /> Athena v3 Native
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <CheckCircle2 size={13} /> Native Hudi
                  </span>
                </td>
                <td className="py-2.5 px-3 text-[var(--muted-foreground)]">AWS Glue Data Catalog</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">Trino</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <CheckCircle2 size={13} /> Native Delta Connector
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <CheckCircle2 size={13} /> Native Iceberg Connector
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <CheckCircle2 size={13} /> Native Hudi Connector
                  </span>
                </td>
                <td className="py-2.5 px-3 text-[var(--muted-foreground)]">Hive / Glue / Polaris</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 9. PYTHON FOR MODERN STACK TAB */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "python" && (
        <div id="python" className="space-y-4 animate-in fade-in duration-200">
          {/* Section Intro */}
          <div className="p-3.5 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <TopicIcon topic="python" size={20} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                  Python for Modern Data Stacks &amp; Lakehouses
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {modernStackDb.length} runnable Python, PySpark, and SQL implementations across distributed computing, open table formats, and AI-native pipelines.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-center">
              <div className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="text-base font-bold text-blue-400 leading-none">{modernStackDb.length}</div>
                <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Modern Q&amp;As with Code</div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="text-base font-bold text-green-400 leading-none">{modernCodeMatrix.length}</div>
                <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Polyglot Matrix Entries</div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="text-base font-bold text-purple-400 leading-none">
                  {pythonData.filter((p) =>
                    ["Delta Lake", "Distributed Computing", "Streaming", "Architecture", "Data Patterns", "Performance"].includes(p.category)
                  ).length}
                </div>
                <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">DE Python Runbooks</div>
              </div>
            </div>

            {/* Link to Python Guided Learning */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-2">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={13} /> Python Guided Learning &amp; Practice
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  Explore full-code data engineering runbooks and structured stage-by-stage Python learning.
                </div>
              </div>
              <Link
                href="/guided-learning?topic=python"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs whitespace-nowrap transition-colors shrink-0 shadow-xs"
              >
                <span>Open Python Track</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search Python solutions by topic, library, or keyword..."
                value={pythonQSearch}
                onChange={(e) => setPythonQSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {pythonCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPythonCategory(cat)}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer",
                    pythonCategory === cat
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Modern Stack Q&A with Python Code */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center gap-2 px-0.5">
              <Terminal size={15} className="text-blue-400" />
              Modern Stack Interview Q&amp;A · Complete Implementations ({filteredPythonQuestions.length})
            </h3>
            {filteredPythonQuestions.map((q) => (
              <div key={q.id} className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden">
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold text-purple-400 tracking-wide uppercase">
                      {q.category}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                        q.difficulty === "HARD"
                          ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                          : q.difficulty === "ARCHITECT"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      )}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)] ml-auto">
                      ID: {q.id}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] leading-snug">
                    {q.question}
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    {q.answer}
                  </p>
                </div>

                <div className="border-t border-[var(--border)] p-3 bg-[var(--surface-2)]/60 space-y-2.5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                    {q.py_code?.trim() && (
                      <CodeBlock
                        code={q.py_code}
                        language="python"
                        filename="python_solution.py"
                        badge="Python"
                        showLineNumbers
                      />
                    )}
                    {q.pyspark_code?.trim() && (
                      <CodeBlock
                        code={q.pyspark_code}
                        language="python"
                        filename="pyspark_solution.py"
                        badge="PySpark"
                        showLineNumbers
                      />
                    )}
                  </div>
                  {q.sql_code?.trim() && (
                    <CodeBlock
                      code={q.sql_code}
                      language="sql"
                      filename="lakehouse_query.sql"
                      badge="SQL"
                      showLineNumbers={false}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredPythonQuestions.length === 0 && (
            <div className="p-8 text-center text-xs text-[var(--muted-foreground)] rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
              No Python solutions found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
