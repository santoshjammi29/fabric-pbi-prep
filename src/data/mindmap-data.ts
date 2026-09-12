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
      badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      glow: "rgba(6, 182, 212, 0.25)",
      text: "text-cyan-400",
    },
    summary: "High-throughput real-time event streaming, transaction log Change Data Capture (CDC), and backpressure-resilient ingestion pipelines.",
    subtopics: [
      {
        id: "ingestion-cdc",
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
        name: "Stream Processing Engines",
        desc: "Stateful streaming transformations with event-time watermarking, sessionization, and exactly-once checkpointing.",
        tradeOffs: "Sub-second analytical aggregates vs RocksDB state store memory pressure and checkpoint storage I/O.",
        protocols: ["Apache Flink", "Spark Structured Streaming", "Azure Stream Analytics", "Faust"],
        practiceLink: "/qa-prep?q=Structured%20Streaming",
        codeSnippet: `// Spark Structured Streaming with Watermark
val streamDf = spark.readStream
  .format("kafka")
  .load()
  .withWatermark("eventTime", "10 minutes")
  .groupBy(window($"eventTime", "5 minutes"), $"customerId")
  .count()`,
      },
      {
        id: "ingestion-batch",
        name: "Edge & Polyglot Batch Connectors",
        desc: "Managed orchestrator endpoints, REST API webhooks, SFTP file listeners, and high-concurrency staging pools.",
        tradeOffs: "Simple implementation and schema validation vs poll latency and duplicate record deduplication overhead.",
        protocols: ["ADF Copy Activity", "Airbyte", "Fivetran", "Webhooks", "SFTP"],
        practiceLink: "/qa-prep?q=Copy%20Activity",
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
      badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      glow: "rgba(168, 85, 247, 0.25)",
      text: "text-purple-400",
    },
    summary: "ACID transactional open table formats on cloud object storage, eliminating proprietary data warehouse lock-in and enabling zero-copy sharing.",
    subtopics: [
      {
        id: "storage-formats",
        name: "ACID Open Table Formats",
        desc: "Atomic commit logs, snapshot isolation, time travel, and unified streaming + batch writes directly on object storage.",
        tradeOffs: "Eliminates warehouse vendor lock-in vs metadata management and periodic commit log compaction.",
        protocols: ["Delta Lake 3.x", "Apache Iceberg", "Apache Hudi", "Parquet Snappy", "Zstandard"],
        practiceLink: "/concepts?term=Delta%20Lake",
        codeSnippet: `-- Delta Lake Time Travel & Schema Evolution
SELECT * FROM gold_sales VERSION AS OF 14;

ALTER TABLE gold_sales SET TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.enableChangeDataFeed' = 'true'
);`,
      },
      {
        id: "storage-clustering",
        name: "Liquid Clustering & Z-Ordering",
        desc: "Multi-dimensional file indexing grouping co-queried data into identical Parquet files to eliminate file scan I/O.",
        tradeOffs: "Dramatic query speedups (10x-50x) vs write-time shuffle overhead and periodic OPTIMIZE execution.",
        protocols: ["Liquid Clustering", "Z-Order", "Bin-packing Compaction", "Partition Pruning"],
        practiceLink: "/concepts?term=Liquid%20Clustering",
        codeSnippet: `-- Databricks / Fabric Liquid Clustering
ALTER TABLE silver_telemetry
CLUSTER BY (device_id, event_date);

OPTIMIZE silver_telemetry;`,
      },
      {
        id: "storage-uniform",
        name: "UniForm & Universal Catalogs",
        desc: "Write Delta Parquet files once while automatically generating Apache Iceberg and Hudi metadata for multi-engine access.",
        tradeOffs: "Zero storage duplication across Snowflake, Databricks, and Fabric vs slight catalog sync latency.",
        protocols: ["Delta UniForm", "Apache Polaris", "Project Nessie", "OneLake Shortcuts"],
        practiceLink: "/architecture?q=UniForm",
      },
      {
        id: "storage-substrate",
        name: "Cloud Object Storage Substrate",
        desc: "Hyperscale distributed blob storage providing 99.999999999% durability, hierarchical namespaces, and private endpoint isolation.",
        tradeOffs: "Low cost ($0.02/GB) vs eventual metadata listing bottlenecks on flat namespaces.",
        protocols: ["ADLS Gen2", "AWS S3", "Google Cloud Storage", "OneLake ADLS Gen2 API"],
        practiceLink: "/concepts?term=ADLS",
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
      badge: "bg-orange-500/20 text-orange-300 border-orange-500/40",
      glow: "rgba(249, 115, 22, 0.25)",
      text: "text-orange-400",
    },
    summary: "Distributed query optimization, C++ vectorized execution kernels, and declarative software-engineered data transformation DAGs.",
    subtopics: [
      {
        id: "compute-spark",
        name: "Apache Spark 4.0 Internals",
        desc: "Catalyst rule-based query planner, Project Tungsten off-heap memory, Adaptive Query Execution (AQE), and Dynamic Partition Pruning.",
        tradeOffs: "Handles petabyte scale with fault tolerance vs JVM GC pauses, executor OOM risks, and cluster startup delay.",
        protocols: ["Spark 4.0", "Catalyst", "Tungsten", "AQE", "PySpark", "Dynamic Allocation"],
        practiceLink: "/spark-engine",
        codeSnippet: `# Spark AQE Join Optimization & Skew Mitigation
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")`,
      },
      {
        id: "compute-vectorized",
        name: "Native C++ Vectorized Kernels",
        desc: "SIMD instruction-level parallelism, columnar cache-aware processing, and direct CPU memory execution bypassing the JVM.",
        tradeOffs: "3x-5x faster raw compute and lower cloud spend vs proprietary runtime availability.",
        protocols: ["Databricks Photon", "Meta Velox", "Apache Arrow DataFusion", "Polars C/Rust"],
        practiceLink: "/architecture?q=Photon",
      },
      {
        id: "compute-embedded",
        name: "Embedded Columnar Engines",
        desc: "In-process analytical SQL engines designed for instant startup, zero network egress, and blazingly fast Parquet operations.",
        tradeOffs: "Microsecond query response and zero infrastructure management vs single-node RAM boundaries.",
        protocols: ["DuckDB", "Polars", "PyArrow", "DuckDB Wasm"],
        practiceLink: "/python?q=Polars",
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
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      glow: "rgba(168, 85, 247, 0.25)",
      text: "text-emerald-400",
    },
    summary: "Zero-copy semantic model queries, memory-mapped VertiPaq caching, and elastic auto-scaling analytical SQL warehouses.",
    subtopics: [
      {
        id: "serving-directlake",
        name: "Fabric Direct Lake & Memory Caching",
        desc: "Power BI VertiPaq engine directly loads OneLake Delta Parquet columns into RAM on-demand, eliminating scheduled import refreshes.",
        tradeOffs: "Sub-second dashboards on billions of rows without data copying vs DirectQuery fallback if memory limits are exceeded.",
        protocols: ["Microsoft Fabric", "Power BI Direct Lake", "VertiPaq", "DAX Query Fusion"],
        practiceLink: "/concepts?term=Direct%20Lake",
        codeSnippet: `// Direct Lake DAX Memory Footprint Best Practice
// Ensure high-cardinality columns are not materialized in reports
DEFINE
  MEASURE 'Sales'[YTD Revenue] =
    CALCULATE(
      SUM('Sales'[Amount]),
      DATESYTD('Date'[Date])
    )`,
      },
      {
        id: "serving-warehouses",
        name: "Serverless Analytical Warehouses",
        desc: "Separation of compute and storage with auto-suspend, multi-cluster concurrency scaling, and cached result reuse.",
        tradeOffs: "Instant scaling for thousands of analysts vs per-second compute billing if queries are unoptimized.",
        protocols: ["Snowflake", "Databricks SQL Serverless", "Google BigQuery", "Fabric Warehouse"],
        practiceLink: "/architecture?q=Snowflake",
      },
      {
        id: "serving-semantic",
        name: "Universal Semantic & Metrics Layer",
        desc: "Centralized metric definitions (e.g. ARR, Churn, Active Users) governed in code and queryable by any BI tool or LLM.",
        tradeOffs: "Single source of truth across Power BI, Tableau, and agents vs upfront semantic modeling governance overhead.",
        protocols: ["Cube.dev", "dbt Semantic Layer", "MetricFlow", "Power BI XMLA / TMSL"],
        practiceLink: "/concepts?term=Semantic%20Model",
      },
      {
        id: "serving-composite",
        name: "Composite Models & Hybrid Partitions",
        desc: "Combine blazing-fast in-memory cached historical data with real-time DirectQuery partitions for current-day telemetry.",
        tradeOffs: "Combines petabyte scale with real-time freshness vs complex relationship modeling and query plan debugging.",
        protocols: ["Power BI Composite Models", "Dual Storage Mode", "Incremental Refresh"],
        practiceLink: "/qa-prep?q=Composite%20Models",
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
      badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
      glow: "rgba(99, 102, 241, 0.25)",
      text: "text-indigo-400",
    },
    summary: "Workflow DAG scheduling, self-hosted integration scaling, Infrastructure-as-Code (IaC), and automated blue-green lakehouse releases.",
    subtopics: [
      {
        id: "orchestration-pipelines",
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
        name: "Code-First DAG Orchestrators",
        desc: "Pipelines defined strictly as Python code allowing unit testing, dynamic task generation, and SLA alerting.",
        tradeOffs: "Maximum flexibility and rich ecosystem integrations vs infrastructure hosting and Celery/Kubernetes executor tuning.",
        protocols: ["Apache Airflow", "Astronomer", "Dagster", "Prefect"],
        practiceLink: "/qa-prep?q=Airflow",
      },
      {
        id: "orchestration-cicd",
        name: "Data CI/CD & Deployment Pipelines",
        desc: "Automated PR testing with ephemeral staging schemas, PBIP git synchronization, and Azure DevOps / GitHub Actions.",
        tradeOffs: "Zero production regressions and automated rollbacks vs pipeline build time and dev sandbox costs.",
        protocols: ["Fabric Git Integration", "Azure DevOps", "GitHub Actions", "Terraform", "Bicep"],
        practiceLink: "/architecture?q=CI%2FCD",
      },
      {
        id: "orchestration-bluegreen",
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
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      glow: "rgba(239, 68, 68, 0.25)",
      text: "text-rose-400",
    },
    summary: "Federated data mesh domains, OpenLineage auditing, declarative data contracts, and Cloud Capacity Unit (CU) FinOps.",
    subtopics: [
      {
        id: "governance-catalog",
        name: "Unified Access Control & Catalogs",
        desc: "Centralized 3-level namespace (catalog.schema.table) enforcing row-level security, column masking, and tag-based policies.",
        tradeOffs: "Consistent enterprise security across multiple engines vs cross-account credential federation complexity.",
        protocols: ["Databricks Unity Catalog", "Microsoft Purview", "AWS Lake Formation", "OpenLineage"],
        practiceLink: "/architecture?q=Unity%20Catalog",
        codeSnippet: `-- Unity Catalog Dynamic Column Masking
CREATE MASK pii_mask ON (val STRING)
RETURN CASE WHEN IS_ACCOUNT_GROUP_MEMBER('hr_dept') THEN val
            ELSE '***REDACTED***' END;

ALTER TABLE gold_employees ALTER COLUMN ssn SET MASK pii_mask;`,
      },
      {
        id: "governance-contracts",
        name: "Data Contracts & Quality Assertion",
        desc: "Enforceable schema and SLA contracts published by upstream domain producers with automated circuit-breaking quarantine.",
        tradeOffs: "Stops breaking schema changes before reaching analytical consumers vs friction during rapid source iteration.",
        protocols: ["Open Data Contract Standard (ODCS)", "Great Expectations", "Soda Core", "Monte Carlo"],
        practiceLink: "/concepts?term=Data%20Contracts",
      },
      {
        id: "governance-finops",
        name: "Cloud FinOps & Capacity Optimization",
        desc: "Capacity Unit (CU) smoothing, burst throttling, auto-termination of idle clusters, and automated orphan file VACUUMing.",
        tradeOffs: "Reduces cloud data bills by 30%-60% vs potential queue delays during peak concurrent workloads.",
        protocols: ["Fabric Capacity Metrics", "Spot Fleets", "Snowflake Resource Monitors", "VACUUM"],
        practiceLink: "/modern-stack#cost",
      },
      {
        id: "governance-mesh",
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
      badge: "bg-pink-500/20 text-pink-300 border-pink-500/40",
      glow: "rgba(236, 72, 153, 0.25)",
      text: "text-pink-400",
    },
    summary: "Vector index retrieval, Model Context Protocol (MCP) data endpoints, semantic routing, and enterprise Text-to-SQL agentic architectures.",
    subtopics: [
      {
        id: "ai-vector",
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
        name: "Model Context Protocol (MCP) Endpoints",
        desc: "Exposing governed warehouse schemas, semantic models, and pipeline triggers to AI agents via standardized JSON-RPC protocols.",
        tradeOffs: "Autonomous AI agent tool calls with audited permissions vs strict prompt injection and query cost guardrails.",
        protocols: ["Model Context Protocol (MCP)", "LangChain", "LlamaIndex", "Semantic Kernel"],
        practiceLink: "/modern-stack#ai",
      },
      {
        id: "ai-text2sql",
        name: "Deterministic Text-to-SQL Systems",
        desc: "Combining LLMs with semantic metadata schemas, golden query few-shot examples, and automated SQL AST validation.",
        tradeOffs: "Enables natural language business analytics vs hallucinations on complex joins requiring guardrail verification.",
        protocols: ["Semantic Parsing", "Golden SQL Few-Shot", "SQLGlot AST Validator", "Spider Benchmark"],
        practiceLink: "/qa-prep?q=Text-to-SQL",
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
