/**
 * Comprehensive Modern Data Engineering & Architecture Mindmap Data
 * Maps out 7 core architectural domains, 28 subtopics, protocols, and deep links.
 */

export interface MindmapSubtopic {
  id: string;
  name: string;
  desc: string;
  tradeOffs: string;
  protocols: string[];
  practiceLink: string;
  conceptId?: string;
  codeSnippet?: string;
}

export interface MindmapDomain {
  id: string;
  title: string;
  shortTitle: string;
  side: "left" | "right";
  icon: string;
  color: {
    hex: string;
    border: string;
    bg: string;
    badge: string;
    glow: string;
    text: string;
  };
  summary: string;
  subtopics: MindmapSubtopic[];
}

export const MINDMAP_DOMAINS: MindmapDomain[] = [
  // ── LEFT SIDE DOMAINS (Ingestion, Storage, Compute) ────────────────
  {
    id: "ingestion",
    title: "1. Ingestion & Real-Time Streaming",
    shortTitle: "Ingestion & Streaming",
    side: "left",
    icon: "Radio",
    color: {
      hex: "#06b6d4",
      border: "border-cyan-500/30",
      bg: "bg-cyan-500/10",
      badge: "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30 dark:bg-cyan-500/20 dark:border-cyan-500/40",
      glow: "rgba(6, 182, 212, 0.25)",
      text: "text-cyan-800 dark:text-cyan-400",
    },
    summary: "High-throughput real-time event streaming, transaction log Change Data Capture (CDC), and backpressure-resilient ingestion pipelines.",
    subtopics: [
      {
        id: "ingestion-cdc",
        conceptId: "de-cdc",
        name: "Log-Based CDC & Event Sourcing",
        desc: "Zero-overhead transaction log mining (WAL/Binlog) extracting row-level inserts, updates, and deletes with ACID consistency.",
        tradeOffs: "Near real-time latency (<1s) vs initial snapshot resource spikes and schema drift handling.",
        protocols: ["Debezium", "Kafka Connect", "Azure Data Factory CDC", "AWS DMS", "Qlik Replicate"],
        practiceLink: "/qa-prep?q=CDC",
        codeSnippet: `// Debezium MySQL CDC Connector Config
{
  "connector.class": "io.debezium.connector.mysql.MySqlConnector",
  "database.history.kafka.bootstrap.servers": "kafka:9092",
  "database.server.name": "production_db",
  "table.include.list": "orders.sales_transactions",
  "tombstones.on.delete": "true"
}`,
      },
      {
        id: "ingestion-brokers",
        conceptId: "de-outbox-pattern",
        name: "Distributed Event Brokers",
        desc: "Horizontally partitioned append-only commit logs providing consumer group load-balancing and durable replay.",
        tradeOffs: "Extreme write throughput (GB/s) vs partition rebalancing latency and consumer lag monitoring.",
        protocols: ["Apache Kafka", "KRaft", "Azure Event Hubs", "AWS Kinesis", "Redpanda"],
        practiceLink: "/qa-prep?q=Kafka",
        codeSnippet: `# Kafka consumer group partition assignment
kafka-consumer-groups.sh --bootstrap-server kafka:9092 \\
  --group sales-pipeline-group \\
  --describe`,
      },
      {
        id: "ingestion-processing",
        conceptId: "spark-streaming-checkpointing",
        name: "Stream Processing & Fabric Eventstream",
        desc: "Stateful streaming with event-time watermarks, late arrival tolerance (up to 20 days), out-of-order policies (59s), and Fabric Eventstreams routing IoT GPS telemetry from Event Hubs through in-flight processors into Lakehouse Delta tables.",
        tradeOffs: "Sub-second analytical aggregates and no-code Eventstream routing vs RocksDB state store memory pressure and watermark lag management.",
        protocols: ["Fabric Eventstream", "Azure Event Hubs", "Azure Stream Analytics", "Spark Structured Streaming", "Apache Flink"],
        practiceLink: "/qa-prep?q=Eventstream",
        codeSnippet: `// Fabric Eventstream GPS IoT Ingestion Architecture
// 1. Eventstream Input: Binds to Azure Event Hubs (GPS Telemetry)
// 2. Eventstream Processor: Filters invalid coordinates & normalizes UTC
// 3. Eventstream Output: Persists streaming records to Lakehouse Delta
// Stream Analytics Watermarking Query:
SELECT 
    vehicle_id,
    System.Timestamp() AS window_end,
    AVG(speed_mph) AS avg_speed
FROM [EventHubInput] TIMESTAMP BY event_time
GROUP BY TumblingWindow(minute, 5), vehicle_id`,
      },
      {
        id: "ingestion-batch",
        conceptId: "databricks-auto-loader-file-discovery",
        name: "Metadata-Driven Pipelines & Parallel COPY INTO",
        desc: "Managed event-driven file discovery (cloudFiles), Data Factory metadata-driven Lookup/ForEach orchestration with GetMetadata structural inspection, and high-performance parallel T-SQL COPY INTO loading from external ADLS Gen2 into Fabric Warehouse.",
        tradeOffs: "Distributed parallel bulk ingestion (fastest T-SQL load) and dynamic parameterization vs control repository maintenance.",
        protocols: ["Auto Loader (cloudFiles)", "Fabric Warehouse COPY INTO", "Data Factory GetMetadata", "ForEach Loop", "ADLS Gen2"],
        practiceLink: "/qa-prep?q=COPY%20INTO",
        codeSnippet: `-- Fabric Warehouse High-Performance Parallel Bulk Load
COPY INTO dbo.sales_orders
FROM 'https://datalakeprod.dfs.core.windows.net/raw/sales/*.parquet'
WITH (
    FILE_TYPE = 'PARQUET',
    CREDENTIAL = (IDENTITY = 'Managed Identity')
);`,
      },
    ],
  },
  {
    id: "storage",
    title: "2. Open Lakehouse Storage",
    shortTitle: "Lakehouse Storage",
    side: "left",
    icon: "Database",
    color: {
      hex: "#a855f7",
      border: "border-purple-500/30",
      bg: "bg-purple-500/10",
      badge: "bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30 dark:bg-purple-500/20 dark:border-purple-500/40",
      glow: "rgba(168, 85, 247, 0.25)",
      text: "text-purple-800 dark:text-purple-400",
    },
    summary: "ACID transactional open table formats on cloud object storage, eliminating proprietary data warehouse lock-in and enabling zero-copy sharing.",
    subtopics: [
      {
        id: "storage-formats",
        conceptId: "dl-delta-lake",
        name: "ACID Open Table Formats",
        desc: "Universal lakehouse standard providing ACID transactions, declarative MERGE INTO upserts, autoMerge configuration, and non-blocking read-time schema evolution with automatic NULL population for missing partition columns.",
        tradeOffs: "Cross-engine interoperability (Spark, Synapse DW, KQL, Power BI) without data copying vs transaction log maintenance.",
        protocols: ["Delta Lake 3.x", "Auto Schema Merge", "Apache Iceberg", "Apache Hudi", "V-Order Parquet"],
        practiceLink: "/concepts?term=Delta%20Lake",
        codeSnippet: `-- Delta Lake MERGE INTO with Auto Schema Merge
SET spark.databricks.delta.schema.autoMerge.enabled = true;

MERGE INTO gold_customers AS target
USING staging_customers AS source
ON target.customer_id = source.customer_id
WHEN MATCHED AND target.attr_hash != source.attr_hash THEN
  UPDATE SET *
WHEN NOT MATCHED THEN
  INSERT *;`,
      },
      {
        id: "storage-clustering",
        conceptId: "delta-liquid-clustering",
        name: "Small Files Compaction & Z-Order Skipping",
        desc: "Two-stage process decoupling write ingestion from asynchronous OPTIMIZE compaction (~1GB target files) and VACUUM safety retention. Multi-dimensional Z-Ordering across 2-4 columns enabling 90-95% data skipping via file min/max metadata statistics.",
        tradeOffs: "10x-50x query acceleration and metadata overhead elimination vs periodic compute consumption during OPTIMIZE runs.",
        protocols: ["Two-Stage OPTIMIZE", "ZORDER BY (2-4 cols)", "Liquid Clustering", "VACUUM RETAIN 168 HOURS"],
        practiceLink: "/concepts?term=Z-Ordering",
        codeSnippet: `-- 1. Consolidate small files into ~1GB Parquet blocks with Z-Ordering
OPTIMIZE delta_lakehouse_table
ZORDER BY (customer_id, transaction_date);

-- 2. Clean obsolete commit versions older than 7 days
VACUUM delta_lakehouse_table RETAIN 168 HOURS;`,
      },
      {
        id: "storage-uniform",
        conceptId: "dl-uniform",
        name: "UniForm & Universal Catalogs",
        desc: "Write Delta Parquet files once while automatically generating Apache Iceberg and Hudi metadata for multi-engine access.",
        tradeOffs: "Zero storage duplication across Snowflake, Databricks, and Fabric vs slight catalog sync latency.",
        protocols: ["Delta UniForm", "Apache Polaris", "Project Nessie", "OneLake Shortcuts"],
        practiceLink: "/architecture?q=UniForm",
      },
      {
        id: "storage-substrate",
        conceptId: "fabric-onelake",
        name: "OneLake Tenant Namespace & Shortcuts",
        desc: "One Tenant = One OneLake hierarchical namespace. Workspaces provide logical boundaries without storage accounts. Zero-copy shortcuts virtualize ADLS Gen2, AWS S3, and GCS with 2-level chain limits. Eventhouse synchronization syncs only newly ingested data non-retroactively.",
        tradeOffs: "Zero data replication across business domains vs read-only shortcut constraints and cross-region egress fees.",
        protocols: ["OneLake Unified Namespace", "Internal Shortcuts", "External S3/GCS Shortcuts", "ADLS Gen2 API"],
        practiceLink: "/concepts?term=OneLake",
      },
    ],
  },
  {
    id: "compute",
    title: "3. Vectorized Compute & Transformations",
    shortTitle: "Compute & Transforms",
    side: "left",
    icon: "Zap",
    color: {
      hex: "#f97316",
      border: "border-orange-500/30",
      bg: "bg-orange-500/10",
      badge: "bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30 dark:bg-orange-500/20 dark:border-orange-500/40",
      glow: "rgba(249, 115, 22, 0.25)",
      text: "text-orange-800 dark:text-orange-400",
    },
    summary: "Distributed query optimization, C++ vectorized execution kernels, and declarative software-engineered data transformation DAGs.",
    subtopics: [
      {
        id: "compute-spark",
        conceptId: "spark-memory-management",
        name: "Apache Spark 4.0 Internals",
        desc: "PySpark operational boundary: Transformations (filter, select, cache) build a lazy DAG plan; Actions (collect, count) force computation and trigger cluster jobs. Actions are NOT optimizations—collect() on large tables triggers driver OOM. DataFrames excel via Catalyst plan optimization and Tungsten whole-stage codegen.",
        tradeOffs: "Extreme execution throughput and automatic plan optimization vs Driver JVM memory crashes on misuse of collect().",
        protocols: ["Catalyst Optimizer", "Project Tungsten", "AQE", "PySpark DataFrame API", "DAG Lineage"],
        practiceLink: "/spark-engine",
        codeSnippet: `# Transformations: Lazy DAG building
clean_df = raw_df.filter(col("status") == "ACTIVE").select("user_id", "amount")
# Caching: Transformation marking storage memory
cached_df = clean_df.cache()
# Action: Triggers physical job execution across cluster
record_count = cached_df.count()
# CAUTION: collect() brings all data to Driver JVM - avoid on large data!`,
      },
      {
        id: "compute-vectorized",
        conceptId: "fabric-v-order",
        name: "Native C++ Vectorized Kernels",
        desc: "SIMD instruction-level parallelism, columnar cache-aware processing, and direct CPU memory execution bypassing the JVM.",
        tradeOffs: "3x-5x faster raw compute and lower cloud spend vs proprietary runtime availability.",
        protocols: ["Databricks Photon", "Meta Velox", "Apache Arrow DataFusion", "Polars C/Rust"],
        practiceLink: "/architecture?q=Photon",
      },
      {
        id: "compute-embedded",
        conceptId: "fabric-kql-database",
        name: "Embedded Columnar Engines",
        desc: "In-process analytical SQL engines designed for instant startup, zero network egress, and blazingly fast Parquet operations.",
        tradeOffs: "Microsecond query response and zero infrastructure management vs single-node RAM boundaries.",
        protocols: ["DuckDB", "Polars", "PyArrow", "DuckDB Wasm"],
        practiceLink: "/code-practice?db=python&q=Polars",
        codeSnippet: `import polars as pl

# Zero-copy parallel scan over multi-part Parquet
q = (
    pl.scan_parquet("s3://lakehouse/gold/*.parquet")
    .filter(pl.col("status") == "COMPLETED")
    .group_by("region")
    .agg(pl.col("amount").sum().alias("total_revenue"))
)
df = q.collect()`,
      },
      {
        id: "compute-dbt",
        conceptId: "de-dbt",
        name: "Declarative Transformations (dbt/SQLMesh)",
        desc: "Transformations defined as declarative SQL SELECT models with automated DAG dependency compilation, unit tests, and lineage.",
        tradeOffs: "Version control, dry testing, and self-documenting models vs warehouse compute consumption for materializations.",
        protocols: ["dbt Core", "dbt Cloud", "SQLMesh", "Coalesce", "Dataform"],
        practiceLink: "/concepts?term=dbt",
      },
    ],
  },

  // ── RIGHT SIDE DOMAINS (Serving, Orchestration, Governance, AI) ────
  {
    id: "serving",
    title: "4. Semantic Serving & Low-Latency BI",
    shortTitle: "Serving & BI",
    side: "right",
    icon: "BarChart3",
    color: {
      hex: "#10b981",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      badge: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 dark:bg-emerald-500/20 dark:border-emerald-500/40",
      glow: "rgba(16, 185, 129, 0.25)",
      text: "text-emerald-800 dark:text-emerald-400",
    },
    summary: "Zero-copy semantic model queries, memory-mapped VertiPaq caching, and elastic auto-scaling analytical SQL warehouses.",
    subtopics: [
      {
        id: "serving-directlake",
        conceptId: "fabric-direct-lake",
        name: "Fabric Direct Lake & Memory Caching",
        desc: "VertiPaq directly memory-maps OneLake V-Order Delta Parquet into RAM. Framing operation performs metadata-only refreshes (10-100x faster, 90-95% fewer CUs than Import mode). Automatic fallback to DirectQuery occurs on memory limit breach.",
        tradeOffs: "Sub-second analytical queries with zero data copying and minimal CU refresh cost vs Fallback latency on unsupported features.",
        protocols: ["Direct Lake", "VertiPaq Framing", "V-Order Parquet", "OneLake Delta", "Fallback DirectQuery"],
        practiceLink: "/concepts?term=Direct%20Lake",
        codeSnippet: `// Direct Lake Framing Operation Architecture
// - Reads latest _delta_log snapshot in OneLake
// - Refreshes table schemas and file pointers without loading rows
// - Consumes minimal CUs compared to full data import
DEFINE
  MEASURE 'Revenue'[Total Sales] =
    CALCULATE(SUM('Sales'[Amount]), 'Date'[Year] = 2026)`,
      },
      {
        id: "serving-warehouses",
        conceptId: "fabric-lakehouse",
        name: "Serverless Analytical Warehouses",
        desc: "Separation of compute and storage with auto-suspend, multi-cluster concurrency scaling, and cached result reuse.",
        tradeOffs: "Instant scaling for thousands of analysts vs per-second compute billing if queries are unoptimized.",
        protocols: ["Snowflake", "Databricks SQL Serverless", "Google BigQuery", "Fabric Warehouse"],
        practiceLink: "/architecture?q=Snowflake",
      },
      {
        id: "serving-semantic",
        conceptId: "pbi-star-schema",
        name: "Universal Semantic & Metrics Layer",
        desc: "Centralized metric definitions (e.g. ARR, Churn, Active Users) governed in code and queryable by any BI tool or LLM.",
        tradeOffs: "Single source of truth across Power BI, Tableau, and agents vs upfront semantic modeling governance overhead.",
        protocols: ["Cube.dev", "dbt Semantic Layer", "MetricFlow", "Power BI XMLA / TMSL"],
        practiceLink: "/concepts?term=Semantic%20Model",
      },
      {
        id: "serving-composite",
        conceptId: "pbi-import-mode",
        name: "Schema-on-Write & SCD Type 2 Modeling",
        desc: "Schema-on-write enforces strict structural integrity for curated Gold tables, contrasted with flexible schema-on-read in Bronze. Fabric SCD Type 2 dimensional modeling utilizes Delta MERGE, SHA2 attribute hashing, Effective/Expiration dates, and IsCurrent flags.",
        tradeOffs: "Guaranteed dimensional integrity for BI reports vs pipeline complexity for tracking out-of-order and late-arriving events.",
        protocols: ["SCD Type 2", "Schema-on-Write (Gold)", "Schema-on-Read (Bronze)", "SHA2 Hash Change Detection"],
        practiceLink: "/qa-prep?q=SCD%20Type%202",
      },
    ],
  },
  {
    id: "orchestration",
    title: "5. Orchestration & DataOps Lifecycle",
    shortTitle: "Orchestration & Ops",
    side: "right",
    icon: "Layers",
    color: {
      hex: "#6366f1",
      border: "border-indigo-500/30",
      bg: "bg-indigo-500/10",
      badge: "bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30 dark:bg-indigo-500/20 dark:border-indigo-500/40",
      glow: "rgba(99, 102, 241, 0.25)",
      text: "text-indigo-800 dark:text-indigo-400",
    },
    summary: "Workflow DAG scheduling, self-hosted integration scaling, Infrastructure-as-Code (IaC), and automated blue-green lakehouse releases.",
    subtopics: [
      {
        id: "orchestration-pipelines",
        conceptId: "fabric-shortcuts",
        name: "Metadata-Driven Pipeline Orchestration",
        desc: "Parameterized pipelines executing dynamic parallel loops from database control tables with failure circuit breakers.",
        tradeOffs: "Eliminates hardcoded pipelines across thousands of tables vs initial control framework engineering effort.",
        protocols: ["Azure Data Factory", "Fabric Data Pipelines", "Self-Hosted IR", "Managed VNet"],
        practiceLink: "/qa-prep?q=ADF",
        codeSnippet: `// ADF Metadata-Driven Pipeline Loop Pattern
{
  "name": "ForEach_ActiveTable",
  "type": "ForEach",
  "typeProperties": {
    "items": "@activity('Lookup_ActiveSourceTables').output.value",
    "batchCount": 20,
    "activities": [
      { "name": "Copy_To_Bronze", "type": "Copy" }
    ]
  }
}`,
      },
      {
        id: "orchestration-airflow",
        conceptId: "airflow-airflow---spark-integration",
        name: "Code-First DAG Orchestrators",
        desc: "Pipelines defined strictly as Python code allowing unit testing, dynamic task generation, and SLA alerting.",
        tradeOffs: "Maximum flexibility and rich ecosystem integrations vs infrastructure hosting and Celery/Kubernetes executor tuning.",
        protocols: ["Apache Airflow", "Astronomer", "Dagster", "Prefect"],
        practiceLink: "/qa-prep?q=Airflow",
      },
      {
        id: "orchestration-cicd",
        conceptId: "databricks-databricks-asset-bundles-dabs",
        name: "Data CI/CD & Asset Bundles (DABs)",
        desc: "Declarative Infrastructure as Code (IaC) via databricks.yml, ephemeral integration testing on PR, PBIP git sync, and automated multi-environment promotion.",
        tradeOffs: "Zero production regressions and automated rollbacks vs pipeline build time and dev sandbox costs.",
        protocols: ["Databricks Asset Bundles (DABs)", "GitHub Actions", "Azure DevOps", "Terraform", "Fabric Git"],
        practiceLink: "/architecture?q=DABs",
      },
      {
        id: "orchestration-bluegreen",
        conceptId: "delta-occ-conflicts",
        name: "Zero-Downtime Blue-Green Cutover",
        desc: "Materialize new lakehouse table versions in a shadow schema, run data quality gates, and atomically swap table pointers.",
        tradeOffs: "Zero downstream downtime during breaking schema migrations vs 2x storage consumption during active cutover.",
        protocols: ["Delta Table Replace", "Iceberg Tagging", "View Aliasing", "Saga Pattern"],
        practiceLink: "/architecture?q=Blue-Green",
      },
    ],
  },
  {
    id: "governance",
    title: "6. Governance, Security & FinOps",
    shortTitle: "Governance & FinOps",
    side: "right",
    icon: "ShieldCheck",
    color: {
      hex: "#ef4444",
      border: "border-rose-500/30",
      bg: "bg-rose-500/10",
      badge: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30 dark:bg-rose-500/20 dark:border-rose-500/40",
      glow: "rgba(239, 68, 68, 0.25)",
      text: "text-rose-800 dark:text-rose-400",
    },
    summary: "Federated data mesh domains, OpenLineage auditing, declarative data contracts, and Cloud Capacity Unit (CU) FinOps.",
    subtopics: [
      {
        id: "governance-catalog",
        conceptId: "fabric-purview-gdpr-governance",
        name: "Purview Hub in Fabric & GDPR Compliance",
        desc: "Unified governance via Microsoft Purview Hub in Fabric: automated data discovery, PII classification, sensitivity labeling for GDPR compliance, access policies, and cross-workspace data lineage across OneLake artifacts.",
        tradeOffs: "Automated regulatory auditability and persistent downstream protection vs metadata synchronization overhead.",
        protocols: ["Microsoft Purview Hub", "Fabric Sensitivity Labels", "GDPR PII Discovery", "Unity Catalog", "OpenLineage"],
        practiceLink: "/qa-prep?q=Purview",
        codeSnippet: `-- Purview Sensitivity Labeling in Fabric
-- Sensitivity labels (e.g. 'Highly Confidential - GDPR PII')
-- automatically cascade from OneLake Delta tables to Power BI Direct Lake
-- Enforces encryption, export restrictions, and end-to-end lineage tracking`,
      },
      {
        id: "governance-contracts",
        conceptId: "fabric-workspace-roles-rbac",
        name: "Fabric Workspace Roles & RBAC Governance",
        desc: "Separation of duties: Viewer has read-only access; Capacity Admin manages compute resources and scaling; Member creates/edits lakehouse tables, datasets, and reports without access management rights (ideal for data engineers); Admin retains full control.",
        tradeOffs: "Least privilege security with high developer autonomy vs careful role boundary enforcement.",
        protocols: ["Fabric RBAC (Member / Admin / Viewer)", "Capacity Admin", "Entra ID", "Data Contracts"],
        practiceLink: "/qa-prep?q=Workspace%20Roles",
      },
      {
        id: "governance-finops",
        conceptId: "fabric-capacity-smoothing-bursting",
        name: "Fabric Capacity Smoothing & Bursting FinOps",
        desc: "Moving-average smoothing algorithm over rolling time windows allows workloads to burst past 100% (peaks of 140%-200%+) without throttling. Throttling is determined strictly by smoothed percentage. Fabric F SKUs require manual scaling (no autoscaling). Sizing justifies unified F64 for multi-region peak overlap (38 CU load).",
        tradeOffs: "Smooths erratic ETL spikes without immediate throttling vs proactive manual SKU scaling required to prevent sustained queue delays.",
        protocols: ["Fabric Smoothing Algorithm", "Capacity Metrics App", "F64 Unified Sizing", "Spot Instances"],
        practiceLink: "/qa-prep?q=Capacity%20Metrics",
      },
      {
        id: "governance-mesh",
        conceptId: "fabric-onelake-mesh",
        name: "Data Mesh Federated Ownership",
        desc: "Domain-oriented decentralized data ownership treating data as a product with federated computational governance.",
        tradeOffs: "High developer autonomy and rapid scaling across business units vs central governance alignment overhead.",
        protocols: ["Data as a Product", "Domain Ports", "Self-Serve Infrastructure", "Federated Governance"],
        practiceLink: "/concepts?term=Data%20Mesh",
      },
    ],
  },
  {
    id: "ai",
    title: "7. AI-Native & Agentic Data Stack",
    shortTitle: "AI & Agents",
    side: "right",
    icon: "Bot",
    color: {
      hex: "#ec4899",
      border: "border-pink-500/30",
      bg: "bg-pink-500/10",
      badge: "bg-pink-500/15 text-pink-800 dark:text-pink-300 border-pink-500/30 dark:bg-pink-500/20 dark:border-pink-500/40",
      glow: "rgba(236, 72, 153, 0.25)",
      text: "text-pink-800 dark:text-pink-400",
    },
    summary: "Vector index retrieval, Model Context Protocol (MCP) data endpoints, semantic routing, and enterprise Text-to-SQL agentic architectures.",
    subtopics: [
      {
        id: "ai-vector",
        conceptId: "databricks-vector-search",
        name: "Vector Search & Hybrid Retrieval",
        desc: "High-dimensional vector indexing (HNSW, IVF) integrated directly into the Lakehouse alongside structured metadata filters.",
        tradeOffs: "Enables semantic semantic search and RAG over enterprise data vs vector embedding generation and index refresh cost.",
        protocols: ["Delta Vector Search", "pgvector", "Pinecone", "Milvus", "HNSW Indexing"],
        practiceLink: "/modern-stack#ai",
        codeSnippet: `-- pgvector HNSW Indexing over Lakehouse Embeddings
CREATE INDEX ON document_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);`,
      },
      {
        id: "ai-mcp",
        conceptId: "spark-connect",
        name: "Model Context Protocol (MCP) Endpoints",
        desc: "Exposing governed warehouse schemas, semantic models, and pipeline triggers to AI agents via standardized JSON-RPC protocols.",
        tradeOffs: "Autonomous AI agent tool calls with audited permissions vs strict prompt injection and query cost guardrails.",
        protocols: ["Model Context Protocol (MCP)", "LangChain", "LlamaIndex", "Semantic Kernel"],
        practiceLink: "/modern-stack#ai",
      },
      {
        id: "ai-text2sql",
        conceptId: "databricks-ai-functions-for-data-engineers",
        name: "Databricks Genie & Deterministic Text-to-SQL",
        desc: "Autonomous AI/BI conversational spaces (Databricks Genie) combined with Unity Catalog semantic instructions, star schema PK/FK metadata, and certified benchmark SQL pairs.",
        tradeOffs: "Empowers non-technical executives with instant analytical self-service vs metric ambiguity requiring instructions calibration.",
        protocols: ["Databricks Genie", "AI/BI Spaces", "Semantic Instructions", "Certified Benchmark SQL", "SQLGlot AST"],
        practiceLink: "/qa-prep?q=Genie",
      },
      {
        id: "ai-rag",
        name: "Enterprise RAG Pipeline Architecture",
        desc: "Automated ingestion, OCR, chunking, deduplication, and cross-encoder re-ranking pipelines feeding enterprise knowledge bases.",
        tradeOffs: "Accurate grounded answers with citations vs pipeline latency and embedding model fine-tuning requirements.",
        protocols: ["RAG Pipelines", "Cross-Encoders", "Reciprocal Rank Fusion", "Chunking Strategies"],
        practiceLink: "/architecture?q=RAG",
      },
    ],
  },
];
