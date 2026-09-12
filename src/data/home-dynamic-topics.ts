/**
 * Dynamic Home Page Topics Registry
 * Comprehensive coverage across the entire platform dataset:
 * Fabric, Spark 4.0, Iceberg, Streaming/Flink, Python Polars, AI & RAG,
 * Governance, Polyglot Code, Architecture Scenarios, and Simulators.
 */

export interface FeaturedHeroGuide {
  id: string;
  badge: string;
  categoryTag: string;
  title: string;
  description: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  readTime: string;
  studiedCount: string;
  href: string;
  buttonLabel: string;
  themeColor: "purple" | "blue" | "emerald" | "amber" | "rose" | "cyan";
}

export interface SecondaryHeroCard {
  id: string;
  track: "spark" | "ai" | "lakehouse" | "python" | "streaming" | "governance" | "finops" | "sql";
  trackLabel: string;
  readTime: string;
  title: string;
  description: string;
  actionText: string;
  href: string;
  iconName: "Flame" | "Bot" | "Layers" | "Code2" | "Zap" | "ShieldCheck" | "Database" | "Calculator";
  accentColor: string; // e.g. text-red-400, text-pink-400, etc.
}

export interface ScenarioOfTheDay {
  id: string;
  category: string;
  difficulty: "Architect Level" | "Principal Level" | "Advanced";
  question: string;
  teaser: string;
  solution: string;
  relatedHref: string;
}

export interface CodeSnippetOfTheDay {
  id: string;
  title: string;
  code: string;
  language: "pyspark" | "python" | "sql";
  filename: string;
  badge: string;
  level: string;
  href: string;
}

export interface SimulatorOfTheDay {
  id: string;
  title: string;
  description: string;
  metrics: {
    label: string;
    value: string;
    valueColor: string;
  }[];
  href: string;
}

/* ──────────────────────────────────────────────────────────────────────────
   1. Featured Architect Guides (12 Comprehensive Enterprise Deep Dives)
   ────────────────────────────────────────────────────────────────────────── */
export const FEATURED_HERO_GUIDES: FeaturedHeroGuide[] = [
  {
    id: "fabric-direct-lake",
    badge: "Featured Architect Guide",
    categoryTag: "DP-600 & DP-203",
    title: "Microsoft Fabric Direct Lake vs Import Mode: The 2026 Production Deep Dive",
    description:
      "Understand VertiPaq memory mapping over OneLake Parquet, dynamic DAX fallback triggers, partition boundaries, and how to architect sub-second enterprise semantic models without data copying.",
    author: {
      name: "Santosh Jammi",
      role: "Principal Data Architect",
      avatar: "SJ",
    },
    readTime: "14 min read",
    studiedCount: "4.2k studied",
    href: "/concepts?term=Direct%20Lake",
    buttonLabel: "Read Guide",
    themeColor: "purple",
  },
  {
    id: "spark-4-aqe-deep-dive",
    badge: "Compute Engine Internals",
    categoryTag: "Databricks & Spark",
    title: "Apache Spark 4.0 AQE & Shuffle Skew: Eliminating Stragglers at Runtime",
    description:
      "Inspect runtime plan changes, dynamically coalesce empty partitions, split skewed partitions at runtime, and optimize multi-way broadcast hash joins in distributed production workloads.",
    author: {
      name: "Santosh Jammi",
      role: "Principal Data Architect",
      avatar: "SJ",
    },
    readTime: "12 min read",
    studiedCount: "5.1k studied",
    href: "/spark-engine",
    buttonLabel: "Explore Engine",
    themeColor: "rose",
  },
  {
    id: "iceberg-delta-uniform",
    badge: "Open Lakehouse Storage",
    categoryTag: "Catalog Federation",
    title: "Apache Iceberg vs Delta Lake UniForm: Multi-Engine Metastore Showdown",
    description:
      "Compare iceberg manifest lists, positional delete files, and UniForm metadata translation layers across Snowflake Polaris, Databricks Unity, and Microsoft Fabric OneLake.",
    author: {
      name: "Santosh Jammi",
      role: "Principal Data Architect",
      avatar: "SJ",
    },
    readTime: "15 min read",
    studiedCount: "6.3k studied",
    href: "/architecture",
    buttonLabel: "Compare Catalogs",
    themeColor: "blue",
  },
  {
    id: "realtime-streaming-flink-kafka",
    badge: "Real-Time Streaming",
    categoryTag: "Sub-Second Ingestion",
    title: "Real-Time CDC Architecture: Apache Flink, Kafka & Exactly-Once Lakehouse Commits",
    description:
      "Design zero-data-loss CDC ingestion from relational DBs via Debezium and Kafka into Apache Iceberg using Flink's two-phase commit checkpointing and compaction daemons.",
    author: {
      name: "Santosh Jammi",
      role: "Principal Data Architect",
      avatar: "SJ",
    },
    readTime: "16 min read",
    studiedCount: "3.8k studied",
    href: "/architecture",
    buttonLabel: "Examine Architecture",
    themeColor: "cyan",
  },
  {
    id: "vector-lakehouse-rag",
    badge: "AI & Vector Lakehouse",
    categoryTag: "Agentic AI Stacks",
    title: "Vector Lakehouse Architecture: Low-Latency RAG with Delta Tables & MCP Servers",
    description:
      "Unify vector embeddings and tabular business dimensions. Connect HNSW indexes with LangChain pipelines, semantic caching, and Model Context Protocol (MCP) tool execution.",
    author: {
      name: "Santosh Jammi",
      role: "Principal Data Architect",
      avatar: "SJ",
    },
    readTime: "11 min read",
    studiedCount: "4.9k studied",
    href: "/modern-stack#ai",
    buttonLabel: "View AI Recipes",
    themeColor: "purple",
  },
  {
    id: "polars-python-de",
    badge: "High-Performance Python",
    categoryTag: "Vectorized SIMD",
    title: "Polars vs PySpark: When to Ditch Spark for Single-Node 100GB Out-Of-Core Pipelines",
    description:
      "Master Polars LazyFrames, query optimizer plan pruning, Apache Arrow memory buffers, and streaming engine execution to run massive ETL pipelines with 10x lower memory overhead.",
    author: {
      name: "Santosh Jammi",
      role: "Principal Data Architect",
      avatar: "SJ",
    },
    readTime: "10 min read",
    studiedCount: "3.5k studied",
    href: "/python",
    buttonLabel: "Explore Python DE",
    themeColor: "emerald",
  },
  {
    id: "lakehouse-finops-serverless",
    badge: "Enterprise FinOps",
    categoryTag: "Cost Optimization",
    title: "Enterprise Lakehouse FinOps: Slashing Snowflake & Databricks Compute Bills by 40%",
    description:
      "Actionable playbooks for auto-termination heuristics, Spot cluster orchestration, serverless SQL warehouse sizing, and parquet small-file write coalescing.",
    author: {
      name: "Santosh Jammi",
      role: "Principal Data Architect",
      avatar: "SJ",
    },
    readTime: "13 min read",
    studiedCount: "4.7k studied",
    href: "/modern-stack#cost",
    buttonLabel: "Inspect Playbooks",
    themeColor: "amber",
  },
  {
    id: "medallion-data-vault",
    badge: "Lakehouse Modeling",
    categoryTag: "Enterprise Design",
    title: "Medallion Architecture at Scale: Bronze, Silver, Gold with Kimball vs Data Vault 2.0",
    description:
      "Architect audit-proof immutable bronze layers, conform business entities in silver with change-data-capture hashing, and deploy dimensional star schemas in gold.",
    author: {
      name: "Santosh Jammi",
      role: "Principal Data Architect",
      avatar: "SJ",
    },
    readTime: "15 min read",
    studiedCount: "5.8k studied",
    href: "/concepts?term=Medallion%20Architecture",
    buttonLabel: "Review Modeling",
    themeColor: "purple",
  },
  {
    id: "unity-catalog-purview-governance",
    badge: "Data Governance & Mesh",
    categoryTag: "Security & Lineage",
    title: "Multi-Cloud Governance: Unity Catalog, Microsoft Purview & Cross-Platform ABAC",
    description:
      "Enforce dynamic row-level security, column masking, attribute-based access control (ABAC), and end-to-end automated lineage tracking from source systems to Power BI.",
    author: {
      name: "Santosh Jammi",
      role: "Principal Data Architect",
      avatar: "SJ",
    },
    readTime: "14 min read",
    studiedCount: "3.2k studied",
    href: "/concepts?term=Unity%20Catalog",
    buttonLabel: "Inspect Governance",
    themeColor: "cyan",
  },
  {
    id: "dbt-cube-semantic-layer",
    badge: "Semantic Serving & BI",
    categoryTag: "Modern BI Stack",
    title: "The Universal Semantic Layer: dbt Core, MetricFlow & Cube.js Over Cloud Warehouses",
    description:
      "Eliminate conflicting business metrics across dashboards. Pre-aggregate SQL queries, enforce caching rules, and serve unified metrics to Power BI, Excel, and LLM query agents.",
    author: {
      name: "Santosh Jammi",
      role: "Principal Data Architect",
      avatar: "SJ",
    },
    readTime: "12 min read",
    studiedCount: "3.9k studied",
    href: "/modern-stack",
    buttonLabel: "Examine Semantic Layer",
    themeColor: "blue",
  },
  {
    id: "clickhouse-olap-serving",
    badge: "Low-Latency OLAP",
    categoryTag: "Sub-Second Queries",
    title: "Real-Time User-Facing Analytics: ClickHouse vs DuckDB vs Trino Distributed Engines",
    description:
      "When Spark and Snowflake are too slow for customer-facing dashboards. Vectorized SIMD execution, sparse indexing, and real-time Kafka materialization.",
    author: {
      name: "Santosh Jammi",
      role: "Principal Data Architect",
      avatar: "SJ",
    },
    readTime: "13 min read",
    studiedCount: "4.1k studied",
    href: "/modern-stack",
    buttonLabel: "Explore OLAP",
    themeColor: "rose",
  },
  {
    id: "adf-databricks-orchestration",
    badge: "DataOps & Pipelines",
    categoryTag: "Enterprise Orchestration",
    title: "Enterprise Pipeline Orchestration: Azure Data Factory vs Databricks Workflows vs Dagster",
    description:
      "Compare DAG dependency graphs, dynamic parallel task loops, automated retries with exponential backoff, and stateful asset management in production lakehouses.",
    author: {
      name: "Santosh Jammi",
      role: "Principal Data Architect",
      avatar: "SJ",
    },
    readTime: "14 min read",
    studiedCount: "4.4k studied",
    href: "/concepts?term=Azure%20Data%20Factory",
    buttonLabel: "Compare Orchestration",
    themeColor: "emerald",
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   2. Secondary Curated Editorial Cards (18 Diverse Technical Topics)
   ────────────────────────────────────────────────────────────────────────── */
export const SECONDARY_HERO_CARDS: SecondaryHeroCard[] = [
  // Spark / Compute Engine
  {
    id: "sec-spark-aqe",
    track: "spark",
    trackLabel: "Spark 4.0 Engine",
    readTime: "10 min read",
    title: "Adaptive Query Execution (AQE) & Dynamic Partition Pruning",
    description: "Eliminate shuffle skew, coalesce empty partitions, and optimize joins at runtime.",
    actionText: "Explore Engine Internals",
    href: "/spark-engine",
    iconName: "Flame",
    accentColor: "text-red-400",
  },
  {
    id: "sec-spark-tungsten",
    track: "spark",
    trackLabel: "Catalyst & Tungsten",
    readTime: "9 min read",
    title: "Project Tungsten: Off-Heap Memory & Whole-Stage Code Generation",
    description: "How Spark bypasses JVM garbage collection with binary row representation and JIT assembly.",
    actionText: "Inspect Memory Model",
    href: "/spark-engine#memory",
    iconName: "Flame",
    accentColor: "text-red-400",
  },

  // AI & RAG
  {
    id: "sec-ai-rag",
    track: "ai",
    trackLabel: "AI & RAG Architecture",
    readTime: "8 min read",
    title: "Low-Latency RAG Pipelines with Delta Vector Search & MCP Servers",
    description: "Synchronize vector embeddings with Lakehouse tables and expose queries to agentic workflows.",
    actionText: "View AI Recipes",
    href: "/modern-stack#ai",
    iconName: "Bot",
    accentColor: "text-pink-400",
  },
  {
    id: "sec-ai-semantic-cache",
    track: "ai",
    trackLabel: "GenAI Data Engineering",
    readTime: "7 min read",
    title: "Semantic Caching & Token Optimization for Enterprise LLM Gateways",
    description: "Use vector distance thresholds to cache LLM responses and cut API operational costs by 70%.",
    actionText: "View Caching Architecture",
    href: "/modern-stack#ai",
    iconName: "Bot",
    accentColor: "text-pink-400",
  },

  // Open Lakehouse & Storage
  {
    id: "sec-lakehouse-iceberg",
    track: "lakehouse",
    trackLabel: "Open Lakehouse",
    readTime: "12 min read",
    title: "Apache Iceberg vs Delta Lake UniForm: 2026 Metastore Showdown",
    description: "Unified multi-engine catalog governance across Snowflake Polaris, Unity, and OneLake.",
    actionText: "Compare Catalogs",
    href: "/architecture",
    iconName: "Layers",
    accentColor: "text-blue-400",
  },
  {
    id: "sec-lakehouse-compaction",
    track: "lakehouse",
    trackLabel: "Lakehouse Storage",
    readTime: "8 min read",
    title: "Small File Problem: Z-Order, Liquid Clustering & Auto-Compaction",
    description: "Prevent S3/ADLS throttling by compacting tiny streaming Parquet files into optimal 512MB slices.",
    actionText: "Review Compaction Rules",
    href: "/concepts?term=Z-Order%20Indexing",
    iconName: "Layers",
    accentColor: "text-blue-400",
  },

  // Python DE
  {
    id: "sec-python-polars",
    track: "python",
    trackLabel: "Python Data Engineering",
    readTime: "8 min read",
    title: "Polars LazyFrame Streaming for Out-of-Core Data Transformations",
    description: "Execute complex joins and aggregations on datasets larger than RAM with zero JVM overhead.",
    actionText: "Practice Python Patterns",
    href: "/python",
    iconName: "Code2",
    accentColor: "text-emerald-400",
  },
  {
    id: "sec-python-pyarrow",
    track: "python",
    trackLabel: "In-Memory Compute",
    readTime: "9 min read",
    title: "Zero-Copy Parquet Serialization with PyArrow and IPC Streams",
    description: "Eliminate deserialization bottlenecks when transmitting data frames across microservices.",
    actionText: "Inspect Arrow IPC",
    href: "/python",
    iconName: "Code2",
    accentColor: "text-emerald-400",
  },

  // Real-Time Streaming
  {
    id: "sec-streaming-kafka",
    track: "streaming",
    trackLabel: "Event-Driven Streaming",
    readTime: "11 min read",
    title: "Kafka Partitioning Heuristics & Consumer Rebalance Mitigation",
    description: "Configure cooperative sticky assignors and consumer lag alerts for 100k msg/sec streams.",
    actionText: "Examine Stream Topologies",
    href: "/architecture",
    iconName: "Zap",
    accentColor: "text-cyan-400",
  },
  {
    id: "sec-streaming-watermarks",
    track: "streaming",
    trackLabel: "Stream Processing",
    readTime: "9 min read",
    title: "Watermarking & Late Data Handling in Spark Structured Streaming",
    description: "Balance state-store RAM usage with allowable data latency in sliding temporal windows.",
    actionText: "Study Watermark Mechanics",
    href: "/concepts?term=Structured%20Streaming",
    iconName: "Zap",
    accentColor: "text-cyan-400",
  },

  // Governance & Security
  {
    id: "sec-gov-lineage",
    track: "governance",
    trackLabel: "Data Governance",
    readTime: "10 min read",
    title: "OpenLineage & Purview: Automated Column-Level Data Lineage",
    description: "Trace pipeline transformations from raw Kafka topics all the way to executive DAX measures.",
    actionText: "Trace Data Lineage",
    href: "/concepts?term=Data%20Lineage",
    iconName: "ShieldCheck",
    accentColor: "text-purple-400",
  },
  {
    id: "sec-gov-contracts",
    track: "governance",
    trackLabel: "Data Mesh",
    readTime: "8 min read",
    title: "Data Contracts & Schema Evolution: Preventing Silent Downstream Breaks",
    description: "Implement CI/CD schema verification gates before deploying transactional DB migrations.",
    actionText: "Review Data Contracts",
    href: "/architecture",
    iconName: "ShieldCheck",
    accentColor: "text-purple-400",
  },

  // FinOps & Performance
  {
    id: "sec-finops-tuning",
    track: "finops",
    trackLabel: "Cloud FinOps",
    readTime: "10 min read",
    title: "Databricks & Fabric Capacity Sizing: Graviton, Spot & Auto-Scale",
    description: "Eliminate idle driver nodes and configure aggressive cooldown timers on interactive clusters.",
    actionText: "Review FinOps Calculators",
    href: "/modern-stack#cost",
    iconName: "Zap",
    accentColor: "text-amber-400",
  },
  {
    id: "sec-finops-snowflake",
    track: "finops",
    trackLabel: "Warehouse FinOps",
    readTime: "7 min read",
    title: "Snowflake Credit Governance: Multi-Cluster Scaling Policies & Query Timeouts",
    description: "Standardize warehouse AUTO_SUSPEND intervals to prevent 24/7 billing leakages.",
    actionText: "Explore Cost Playbooks",
    href: "/modern-stack#cost",
    iconName: "Zap",
    accentColor: "text-amber-400",
  },

  // SQL & Data Warehousing
  {
    id: "sec-sql-internals",
    track: "sql",
    trackLabel: "SQL Engine Internals",
    readTime: "10 min read",
    title: "Columnstore Index Compression & Segment Elimination in Modern SQL",
    description: "How VertiPaq and SQL Server batch mode execute vectorized scans directly on compressed rowgroups.",
    actionText: "Practice SQL Patterns",
    href: "/code-practice?db=mssql",
    iconName: "Database",
    accentColor: "text-blue-400",
  },
  {
    id: "sec-sql-joins",
    track: "sql",
    trackLabel: "Query Optimization",
    readTime: "8 min read",
    title: "Broadcast Hash Join vs Sort-Merge Join vs Shuffle Hash Join",
    description: "Visual decision matrix on which join algorithm distributed query engines select under memory pressure.",
    actionText: "Study Join Algorithms",
    href: "/concepts?term=Broadcast%20Join",
    iconName: "Database",
    accentColor: "text-blue-400",
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   3. Scenarios of the Day (Spotlight Card 1)
   ────────────────────────────────────────────────────────────────────────── */
export const SCENARIOS_OF_THE_DAY: ScenarioOfTheDay[] = [
  {
    id: "scen-zerocopy",
    category: "Zero-Copy Lakehouse Sharing",
    difficulty: "Architect Level",
    question: "How do you architect zero-copy cross-cloud data sharing between Snowflake and Microsoft Fabric?",
    teaser: "Utilize Delta Lake UniForm to generate Apache Iceberg metadata on OneLake ADLS Gen2 storage, allowing Snowflake Polaris / External Tables to query Delta tables without data copying...",
    solution: "Enable UniForm on the Fabric Delta table. Point Snowflake to the Parquet data files using Apache Iceberg format. Reads query the OneLake bucket directly with zero ETL egress delay.",
    relatedHref: "/architecture?id=arch-zerocopy-sharing",
  },
  {
    id: "scen-shuffle-skew",
    category: "Spark Distributed Compute",
    difficulty: "Principal Level",
    question: "How do you resolve extreme shuffle skew when 90% of data belongs to a single customer ID?",
    teaser: "Standard hash partitioning routes skewed keys to a single reducer task, resulting in out-of-memory errors and 4-hour straggler tasks...",
    solution: "Enable Spark AQE with `spark.sql.adaptive.skewJoin.enabled = true`, or apply salt keying by appending `(rand() * 10)` to the join key and exploding the dimension table to balance tasks.",
    relatedHref: "/spark-engine#architecture",
  },
  {
    id: "scen-iceberg-compaction",
    category: "Open Lakehouse Storage",
    difficulty: "Architect Level",
    question: "How do you architect automated concurrent compaction on an active streaming Iceberg table without locking writes?",
    teaser: "Continuous sub-minute micro-batch ingestion generates thousands of 2MB data files and snapshot manifests, degrading read performance...",
    solution: "Execute out-of-band compaction using Iceberg's rewrite_data_files procedure with bin-pack or Z-order strategy. Iceberg's optimistic concurrency control automatically reconciles concurrent appends.",
    relatedHref: "/architecture",
  },
  {
    id: "scen-realtime-rag",
    category: "AI & Vector Architecture",
    difficulty: "Architect Level",
    question: "How do you ensure enterprise RAG pipelines never serve stale vector embeddings when source Lakehouse tables update?",
    teaser: "Batch re-indexing millions of documents overnight causes up to 24 hours of knowledge drift for customer-facing agent workflows...",
    solution: "Deploy a Delta Change Data Feed (CDF) listener that triggers incremental micro-batch embedding generation on updated rows only, updating Milvus/Qdrant collection vectors with upsert keys.",
    relatedHref: "/modern-stack#ai",
  },
  {
    id: "scen-medallion-idempotency",
    category: "Data Pipelines & Ingestion",
    difficulty: "Advanced",
    question: "How do you guarantee strictly idempotent SCD Type 2 dimension updates in a Silver Lakehouse layer?",
    teaser: "Pipeline failures and retry attempts often cause duplicate effective-date records or split valid-to timestamps in downstream tables...",
    solution: "Use deterministic surrogate key hashes (MD5/SHA256 of business key + attributes) and execute a single atomic `MERGE INTO` statement with matched update and not-matched insert clauses.",
    relatedHref: "/concepts?term=Medallion%20Architecture",
  },
  {
    id: "scen-finops-autoscale",
    category: "Enterprise FinOps",
    difficulty: "Architect Level",
    question: "How do you design a cost-efficient Databricks cluster policy for 200+ ad-hoc analysts without throttling queries?",
    teaser: "Analysts leave large multi-node GPU/high-memory clusters running continuously over weekends, inflating cloud spend by 300%...",
    solution: "Enforce Single-User or Shared Serverless SQL Warehouses with 5-minute aggressive auto-suspend, Spot instance node fallback, and cluster policy limits capping worker nodes per user.",
    relatedHref: "/modern-stack#cost",
  },
  {
    id: "scen-directlake-fallback",
    category: "Fabric & Power BI",
    difficulty: "Architect Level",
    question: "What conditions cause Power BI Direct Lake mode to silently fall back to DirectQuery, and how do you prevent it?",
    teaser: "Direct Lake falls back to DirectQuery when queries exceed VertiPaq memory or use unsupported features, causing 30x query latency spikes...",
    solution: "Ensure tables are V-Ordered Parquet, avoid calculated columns in the model, keep column cardinality within capacity memory limits, and monitor Fabric Capacity Metrics app for paging events.",
    relatedHref: "/concepts?term=Direct%20Lake",
  },
  {
    id: "scen-cdc-exactlyonce",
    category: "Streaming & Ingestion",
    difficulty: "Principal Level",
    question: "How do you achieve end-to-end exactly-once semantics from PostgreSQL CDC to Lakehouse Delta tables?",
    teaser: "Network disconnects during pipeline restarts can produce duplicate transaction events if consumers rely solely on at-least-once delivery...",
    solution: "Combine Debezium's LSN-based log offsets with Spark Structured Streaming checkpointing and Delta Lake's native ACID write transactions using the transaction ID as an idempotent merge key.",
    relatedHref: "/architecture",
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   4. Code Snippets of the Day (Spotlight Card 2)
   ────────────────────────────────────────────────────────────────────────── */
export const CODE_SNIPPETS_OF_THE_DAY: CodeSnippetOfTheDay[] = [
  {
    id: "code-cdc-dedup",
    title: "CDC Stream Deduplication with Partition Window",
    code: `from pyspark.sql import Window
from pyspark.sql.functions import row_number, col

# Deduplicate CDC stream with partition window
window_spec = Window.partitionBy("entity_id") \\
                    .orderBy(col("timestamp_utc").desc())

clean_df = cdc_df.withColumn("rn", row_number().over(window_spec)) \\
                 .filter(col("rn") == 1) \\
                 .drop("rn")`,
    language: "pyspark",
    filename: "cdc_dedup.py",
    badge: "PySpark Pattern",
    level: "Advanced",
    href: "/code-practice?db=pyspark",
  },
  {
    id: "code-polars-streaming",
    title: "Polars LazyFrame Streaming Aggregation",
    code: `import polars as pl

# Out-of-core streaming query over 50GB Parquet
q = (
    pl.scan_parquet("s3://lakehouse/events/*.parquet")
    .filter(pl.col("event_type") == "PAYMENT_SUCCESS")
    .group_by(["merchant_id", "currency"])
    .agg([
        pl.len().alias("transaction_count"),
        pl.col("amount").sum().alias("total_volume"),
        pl.col("amount").quantile(0.95).alias("p95_amount")
    ])
    .sort("total_volume", descending=True)
)

result = q.collect(engine="streaming")`,
    language: "python",
    filename: "polars_stream.py",
    badge: "Python Polars",
    level: "Architect",
    href: "/python",
  },
  {
    id: "code-iceberg-maintenance",
    title: "Apache Iceberg Maintenance & Orphan File Purge",
    code: `-- Compact small data files into 512MB Parquet files
CALL prod.system.rewrite_data_files(
  table => 'events.telemetry',
  strategy => 'binpack',
  options => map('target-file-size-bytes', '536870912')
);

-- Expire snapshots older than 7 days
CALL prod.system.expire_snapshots(
  table => 'events.telemetry',
  older_than => TIMESTAMP '2026-03-01 00:00:00'
);`,
    language: "sql",
    filename: "iceberg_maintenance.sql",
    badge: "Apache Iceberg",
    level: "Production DDL",
    href: "/code-practice?db=sparksql",
  },
  {
    id: "code-spark-zorder",
    title: "Delta Lake Liquid Clustering & Z-Order Tuning",
    code: `-- Optimize table layout along high-cardinality filter dimensions
OPTIMIZE events_gold
ZORDER BY (customer_tenant_id, event_date);

-- Check file pruning statistics across partition boundaries
DESCRIBE DETAIL events_gold;`,
    language: "sql",
    filename: "delta_optimize.sql",
    badge: "Delta Lake",
    level: "Advanced",
    href: "/code-practice?db=sparksql",
  },
  {
    id: "code-vector-similarity",
    title: "Vector Lakehouse Cosine Distance Calculation",
    code: `import numpy as np

def cosine_similarity_matrix(query_vec: np.ndarray, doc_matrix: np.ndarray) -> np.ndarray:
    """Vectorized SIMD cosine distance for in-memory RAG ranking"""
    query_norm = query_vec / np.linalg.norm(query_vec)
    doc_norms = doc_matrix / np.linalg.norm(doc_matrix, axis=1, keepdims=True)
    return np.dot(doc_norms, query_norm)`,
    language: "python",
    filename: "vector_similarity.py",
    badge: "AI & Vector Pattern",
    level: "Architect",
    href: "/python",
  },
  {
    id: "code-delta-cdf",
    title: "Delta Lake Change Data Feed (CDF) Reader",
    code: `# Read only row-level changes between table versions
changes_df = (
    spark.read.format("delta")
    .option("readChangeFeed", "true")
    .option("startingVersion", 145)
    .option("endingVersion", 148)
    .load("/lakehouse/silver/customers")
    .filter("_change_type.isin(['update_postimage', 'insert'])")
)`,
    language: "pyspark",
    filename: "read_delta_cdf.py",
    badge: "Lakehouse CDC",
    level: "Advanced",
    href: "/code-practice?db=pyspark",
  },
  {
    id: "code-tsql-window",
    title: "T-SQL Window Frame Running Balances",
    code: `SELECT 
    account_id,
    transaction_date,
    amount,
    SUM(amount) OVER (
        PARTITION BY account_id 
        ORDER BY transaction_date 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_balance,
    AVG(amount) OVER (
        PARTITION BY account_id 
        ORDER BY transaction_date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7d_avg
FROM dbo.ledger_transactions;`,
    language: "sql",
    filename: "running_balance.sql",
    badge: "T-SQL Engine",
    level: "Intermediate",
    href: "/code-practice?db=mssql",
  },
  {
    id: "code-duckdb-parquet",
    title: "DuckDB Instant Parquet Aggregation Over Cloud Storage",
    code: `import duckdb

# Query remote S3 Parquet directly without cluster spin-up
con = duckdb.connect()
con.execute("INSTALL httpfs; LOAD httpfs;")

df = con.sql("""
    SELECT 
        region, 
        approx_count_distinct(user_id) AS unique_visitors,
        avg(response_ms) AS p50_latency
    FROM read_parquet('s3://prod-logs/2026/*/*.parquet')
    GROUP BY region
""").df()`,
    language: "python",
    filename: "duckdb_remote.py",
    badge: "DuckDB Query Engine",
    level: "Production Pattern",
    href: "/python",
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   5. Simulators of the Day (Spotlight Card 3)
   ────────────────────────────────────────────────────────────────────────── */
export const SIMULATORS_OF_THE_DAY: SimulatorOfTheDay[] = [
  {
    id: "sim-spark-shuffle",
    title: "Spark Shuffle & Partition Optimizer Simulator",
    description: "Calculate exact shuffle network exchanges, optimal hash bucket allocations, and memory spill thresholds before deploying jobs.",
    metrics: [
      { label: "Target Partition Slice", value: "128 MB / slice", valueColor: "text-purple-400" },
      { label: "Adaptive Coalesce", value: "AQE Enabled", valueColor: "text-green-400" },
    ],
    href: "/modern-stack#simulators",
  },
  {
    id: "sim-iceberg-compaction",
    title: "Apache Iceberg File Sizing & Compaction Calculator",
    description: "Model metadata manifest tree bloat, bin-pack target file counts, and commit concurrency limits under continuous streaming ingest.",
    metrics: [
      { label: "Target Data File Size", value: "512 MB Parquet", valueColor: "text-blue-400" },
      { label: "Manifest Pruning Gain", value: "85% Scan Reduction", valueColor: "text-green-400" },
    ],
    href: "/modern-stack#simulators",
  },
  {
    id: "sim-directlake-memory",
    title: "Fabric Direct Lake Memory & Fallback Risk Analyzer",
    description: "Estimate VertiPaq column memory consumption and identify columns at risk of triggering silent fallback to DirectQuery mode.",
    metrics: [
      { label: "Memory Threshold", value: "25 GB Max SKU Limit", valueColor: "text-amber-400" },
      { label: "Fallback Risk", value: "LOW (Direct Lake Active)", valueColor: "text-green-400" },
    ],
    href: "/modern-stack#simulators",
  },
  {
    id: "sim-vector-memory",
    title: "Vector Lakehouse RAM & Indexing Estimator",
    description: "Compute RAM requirements for HNSW and IVF-PQ vector indexes at 1M to 100M document scales with various dimension sizes.",
    metrics: [
      { label: "Index Parameters", value: "HNSW M=16, ef=64", valueColor: "text-pink-400" },
      { label: "RAM per 1M (1536d)", value: "6.8 GB RAM", valueColor: "text-purple-400" },
    ],
    href: "/modern-stack#simulators",
  },
  {
    id: "sim-query-router",
    title: "Multi-Engine Lakehouse Query Router & Latency Simulator",
    description: "Simulate query execution latency across DuckDB (<100ms), Trino (<2s), and Spark (>10s) based on scan volume and SLA constraints.",
    metrics: [
      { label: "Sub-Second SLA Engine", value: "DuckDB / ClickHouse", valueColor: "text-cyan-400" },
      { label: "Petabyte Batch Engine", value: "Apache Spark 4.0", valueColor: "text-rose-400" },
    ],
    href: "/modern-stack#simulators",
  },
  {
    id: "sim-databricks-finops",
    title: "Databricks DBU & Serverless Warehouse FinOps Estimator",
    description: "Compare classic provisioned clusters against Serverless SQL Warehouses across varying query concurrency profiles.",
    metrics: [
      { label: "Idle Waste Reduction", value: "Up to 62% DBU Savings", valueColor: "text-green-400" },
      { label: "Auto-Suspend Idle", value: "5 min SLA", valueColor: "text-purple-400" },
    ],
    href: "/modern-stack#simulators",
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   Selection & Rotation Helper Functions
   Guaranteed non-repeating across page refreshes
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Seeded pseudo-random number generator (Lehmer LCG)
 */
function createLCG(seed: number) {
  let s = Math.abs(seed) % 2147483647;
  if (s <= 0) s = 1234567;
  return function next() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Get guaranteed different seed on every browser page refresh
 */
export function getNextRefreshSeed(): number {
  if (typeof window === "undefined") {
    return 42; // Deterministic SSR seed
  }

  try {
    const KEY = "fabric_prep_home_refresh_seed";
    const current = Number(sessionStorage.getItem(KEY) || Date.now());
    const nextSeed = (current * 16807 + 1013904223) % 2147483647;
    sessionStorage.setItem(KEY, String(nextSeed));
    return nextSeed;
  } catch {
    return Date.now();
  }
}

/**
 * Pick Hero selection: 1 featured guide + 3 unique secondary cards from different tracks
 */
export function getRandomHeroSelection(seed?: number): {
  featured: FeaturedHeroGuide;
  secondary: SecondaryHeroCard[];
} {
  const rng = seed !== undefined ? createLCG(seed) : Math.random;

  // 1. Pick featured guide
  const featuredIndex = Math.floor(rng() * FEATURED_HERO_GUIDES.length);
  const featured = FEATURED_HERO_GUIDES[featuredIndex] || FEATURED_HERO_GUIDES[0];

  // 2. Pick 3 secondary cards from distinct tracks
  const remainingCards = [...SECONDARY_HERO_CARDS];
  // Shuffle remaining cards
  for (let i = remainingCards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [remainingCards[i], remainingCards[j]] = [remainingCards[j], remainingCards[i]];
  }

  const pickedSecondary: SecondaryHeroCard[] = [];
  const pickedTracks = new Set<string>();

  for (const card of remainingCards) {
    if (!pickedTracks.has(card.track)) {
      pickedTracks.add(card.track);
      pickedSecondary.push(card);
    }
    if (pickedSecondary.length === 3) break;
  }

  // Fallback if needed
  if (pickedSecondary.length < 3) {
    for (const card of remainingCards) {
      if (!pickedSecondary.some((c) => c.id === card.id)) {
        pickedSecondary.push(card);
      }
      if (pickedSecondary.length === 3) break;
    }
  }

  return {
    featured,
    secondary: pickedSecondary,
  };
}

/**
 * Pick Spotlight selection: 1 scenario + 1 code snippet + 1 simulator
 */
export function getRandomSpotlightSelection(seed?: number): {
  scenario: ScenarioOfTheDay;
  snippet: CodeSnippetOfTheDay;
  simulator: SimulatorOfTheDay;
} {
  const rng = seed !== undefined ? createLCG(seed) : Math.random;

  const scenarioIdx = Math.floor(rng() * SCENARIOS_OF_THE_DAY.length);
  const snippetIdx = Math.floor(rng() * CODE_SNIPPETS_OF_THE_DAY.length);
  const simulatorIdx = Math.floor(rng() * SIMULATORS_OF_THE_DAY.length);

  return {
    scenario: SCENARIOS_OF_THE_DAY[scenarioIdx] || SCENARIOS_OF_THE_DAY[0],
    snippet: CODE_SNIPPETS_OF_THE_DAY[snippetIdx] || CODE_SNIPPETS_OF_THE_DAY[0],
    simulator: SIMULATORS_OF_THE_DAY[simulatorIdx] || SIMULATORS_OF_THE_DAY[0],
  };
}
