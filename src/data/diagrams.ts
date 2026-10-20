/**
 * Modern Data Platform & Lakehouse Architecture Whiteboard Diagrams
 * High-resolution visual diagrams with technical specifications and key mechanisms.
 */

export interface ArchitectureDiagramItem {
  id: string;
  title: string;
  subtitle: string;
  category:
    | "Platform Landscape"
    | "Fabric & Power BI"
    | "Data Pipelines & Ingestion"
    | "Governance & Security"
    | "Storage Engine"
    | "Compute & Optimization"
    | "Data Modeling & Architecture";
  image: string;
  tags: string[];
  description: string;
  keyPoints: string[];
  docLink?: string;
}

export const architectureDiagrams: ArchitectureDiagramItem[] = [
  {
    id: "fabric-onelake-architecture",
    title: "Microsoft Fabric Unified Architecture & OneLake",
    subtitle: "Single SaaS Lakehouse with Zero Data Duplication, Multi-Engine Compute, and Cross-Cloud Shortcuts",
    category: "Fabric & Power BI",
    image: "/diagrams/fabric_onelake_architecture.webp",
    tags: ["Microsoft Fabric", "OneLake", "Delta Lake", "Direct Lake", "Shortcuts", "Synapse Data Warehouse", "Fabric Spark", "Purview"],
    description: "End-to-end Microsoft Fabric architecture showing the single SaaS data lake (OneLake), universal Delta Parquet storage format with V-Order optimization, zero-copy shortcuts linking AWS S3 and GCP, and multi-engine compute integration (Spark, Synapse DW, Power BI Direct Lake, KQL, and Data Factory).",
    keyPoints: [
      "One Tenant = One OneLake: single unified hierarchical namespace automatically provisioned per tenant. Workspaces serve as logical containers and RBAC boundaries, not physical storage accounts. Capacities provide compute resources, not storage silos.",
      "OneLake Shortcuts virtualize internal workspace folders and external clouds (Amazon S3, Google Cloud Storage, ADLS Gen2) with zero data copying. Best practice limits chaining to 2 levels maximum to avoid latency and metadata degradation.",
      "Eventhouse OneLake Availability: Enabling OneLake availability does NOT retroactively duplicate historical KQL telemetry; only newly ingested data arriving after activation is synchronized to OneLake as Delta Parquet.",
      "Unified Governance via Purview Hub: Automated PII discovery, classification, and sensitivity labeling across Lakehouses and Warehouses for GDPR compliance."
    ],
    docLink: "https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview"
  },
  {
    id: "powerbi-direct-lake-vertipaq",
    title: "Power BI Direct Lake Mode & VertiPaq Semantic Engine",
    subtitle: "Memory-Mapped Delta Parquet vs Legacy Import and DirectQuery Modes",
    category: "Fabric & Power BI",
    image: "/diagrams/powerbi_direct_lake_vertipaq.webp",
    tags: ["Power BI", "Direct Lake", "VertiPaq", "DAX", "Fabric Semantic Model", "Delta Parquet", "Import vs DirectQuery"],
    description: "Architectural comparison of Power BI Direct Lake mode against legacy Import and DirectQuery. Illustrates how the VertiPaq in-memory analytics engine directly memory-maps Delta Parquet column chunks from OneLake storage into RAM on-demand, achieving sub-second DAX query response times with real-time data freshness and zero data duplication.",
    keyPoints: [
      "Framing Operation Efficiency: In Direct Lake mode, data is not imported or copied. Refreshes execute a metadata 'Framing' operation that synchronizes table schemas and file pointers in memory—consuming 90-95% fewer CUs and running 10-100x faster than Import full refreshes.",
      "VertiPaq In-Memory Mapping: Memory-maps OneLake V-Order Delta Parquet columns directly into RAM on-demand, achieving sub-second DAX analytics with zero data duplication.",
      "Decoupled FinOps: OneLake storage costs remain constant (pay-as-you-go per GB), decoupled from query-time compute Capacity Units (CUs).",
      "Automatic Fallback Guardrail: Gracefully switches to DirectQuery mode if model memory limits or complex RLS rules exceed Direct Lake thresholds."
    ],
    docLink: "https://learn.microsoft.com/en-us/power-bi/enterprise/directlake-overview"
  },
  {
    id: "powerbi-dax-engine-context",
    title: "Power BI DAX Engine Mechanics & Context Transition",
    subtitle: "Formula Engine (FE), VertiPaq Storage Engine (SE), Filter Context, Row Context & CALCULATE()",
    category: "Fabric & Power BI",
    image: "/diagrams/powerbi_dax_engine_context.webp",
    tags: ["Power BI", "DAX", "Formula Engine", "VertiPaq", "Storage Engine", "Context Transition", "CALCULATE", "Filter Context"],
    description: "Deep dive into Power BI's dual-engine query execution model. Depicts how the single-threaded Formula Engine parses DAX syntax and coordinates evaluation, while the multi-threaded VertiPaq Storage Engine executes parallel column scans, bit-packing, and dictionary lookups, mediated by Context Transition via CALCULATE().",
    keyPoints: [
      "Formula Engine (FE) coordinates query plans, handles iterative functions (SUMX, AVERAGEX), and evaluates row-by-row expressions in a single thread.",
      "VertiPaq Storage Engine (SE) scans columnar segments in parallel across multiple CPU cores, returning condensed subcubes to the Formula Engine via xmSQL.",
      "Filter Context governs what rows are visible in the data model, driven by active slicers, report filters, and matrix headers.",
      "CALCULATE() triggers Context Transition, converting the current Row Context into an equivalent Filter Context to evaluate measures within row iterators."
    ],
    docLink: "https://learn.microsoft.com/en-us/dax/dax-overview"
  },
  {
    id: "apache-airflow-distributed-architecture",
    title: "Apache Airflow Distributed Production Architecture",
    subtitle: "Multi-Threaded Scheduler, Metadata DB, Kubernetes/Celery Executors, and Triggerer",
    category: "Data Pipelines & Ingestion",
    image: "/diagrams/apache_airflow_architecture.webp",
    tags: ["Apache Airflow", "Orchestration", "DAG", "CeleryExecutor", "KubernetesExecutor", "Triggerer", "PostgreSQL", "Operators"],
    description: "Production distributed architecture of Apache Airflow showing the multi-process scheduler parsing DAG directories, PostgreSQL metadata database managing task states, Celery/Redis queue or Kubernetes API dispatcher, asynchronous Triggerer event loop for deferrable operators, and auto-scaling worker pods orchestrating Spark, Databricks, and dbt jobs.",
    keyPoints: [
      "Multi-threaded Airflow Scheduler continuously loops through the DAG directory, evaluates task upstream dependencies, and enqueues executable tasks.",
      "PostgreSQL Metadata DB serves as the single source of truth storing DAG run history, task instances, connection pools, and XCom variables.",
      "KubernetesExecutor and CeleryExecutor dynamically provision isolated worker pods on demand to execute compute-heavy pipelines.",
      "Airflow Triggerer runs an async Python asyncio event loop, allowing deferrable operators and external sensors to release worker resources while waiting."
    ],
    docLink: "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html"
  },
  {
    id: "dbt-analytics-engineering-dag",
    title: "dbt (Data Build Tool) Modern Analytics Engineering DAG",
    subtitle: "From Raw Sources to Production Data Marts with Incremental Models, Tests & Semantic Layer",
    category: "Data Pipelines & Ingestion",
    image: "/diagrams/dbt_analytics_engineering_dag.webp",
    tags: ["dbt", "Analytics Engineering", "DAG", "Incremental Models", "Snapshots", "SCD Type 2", "Semantic Layer", "Data Testing"],
    description: "Complete dbt transformation DAG pipeline illustrating the progression from Raw Landing Sources through Staging views (stg_), Intermediate business logic (int_), to production Star Schema Marts (fct_ and dim_). Highlights dbt incremental strategies (is_incremental()), SCD Type 2 history snapshots, automated schema tests, and the dbt Semantic Layer.",
    keyPoints: [
      "Structured multi-layer modeling pattern: Staging (1:1 schema normalization) -> Intermediate (business logic & deduplication) -> Marts (Star Schema).",
      "dbt Incremental Strategy: Uses is_incremental() and unique_key to transform and merge only new or modified rows, saving compute and runtime.",
      "dbt Snapshots provide automated SCD Type 2 historical dimension tracking using either timestamp or check strategies without complex procedural code.",
      "Built-in testing assertions (unique, not_null, accepted_values, relationships) validate data quality before publishing to downstream BI tools."
    ],
    docLink: "https://docs.getdbt.com/docs/build/models"
  },
  {
    id: "adf-hybrid-integration-runtime",
    title: "Azure Data Factory Enterprise Hybrid Ingestion Architecture",
    subtitle: "Hybrid Data Integration, Self-Hosted Integration Runtime (SHIR), Private Endpoints & CDC",
    category: "Data Pipelines & Ingestion",
    image: "/diagrams/adf_hybrid_architecture.webp",
    tags: ["Azure Data Factory", "ADF", "SHIR", "Integration Runtime", "Hybrid Cloud", "Private Endpoints", "CDC", "Tumbling Window"],
    description: "Enterprise hybrid data movement and ingestion framework using Azure Data Factory. Contrasts cloud-native Azure IR with multi-node Self-Hosted Integration Runtime (SHIR) clusters behind corporate firewalls, demonstrating outbound-only TLS 443 connectivity, Managed Private Endpoints, and tumbling window micro-batch CDC.",
    keyPoints: [
      "Self-Hosted IR acts as an outbound-only (port 443) secure gateway connecting on-premise relational databases (Oracle, SQL Server, SAP) to Azure cloud storage.",
      "High-Availability SHIR clustering supports up to 4 worker nodes with automated failover and dynamic concurrent job dispatching.",
      "Azure Key Vault and Managed Identities eliminate plaintext connection strings and hardcoded service principals across linked services.",
      "Tumbling Window triggers provide stateful, non-overlapping time-slice orchestrations essential for partitioned data lake backfills and CDC pipelines."
    ],
    docLink: "https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime"
  },
  {
    id: "kafka-event-streaming-pipeline",
    title: "Real-Time Event Streaming & Kafka Architecture",
    subtitle: "Event Producers, Kafka Topic Partitions, Consumer Groups, Spark Structured Streaming & Exactly-Once Sinks",
    category: "Data Pipelines & Ingestion",
    image: "/diagrams/kafka_event_streaming_pipeline.webp",
    tags: ["Apache Kafka", "Streaming", "Spark Structured Streaming", "Watermarking", "Schema Registry", "Exactly-Once", "Event-Driven"],
    description: "End-to-end real-time event streaming pipeline architecture. Shows event producers publishing to partitioned Kafka brokers with Confluent Schema Registry enforcement, parallel Spark Structured Streaming micro-batch workers handling late-arriving data via watermarking, and idempotent commits to Delta Lake Silver tables.",
    keyPoints: [
      "Kafka Topic Partitions enable horizontal scalability, ordered offset delivery per partition, and parallel consumer group consumption.",
      "Confluent Schema Registry enforces Avro/Protobuf contract compatibility (backward/forward/full) to prevent downstream pipeline crashes.",
      "Spark Structured Streaming provides declarative streaming DataFrames with stateful event-time watermarking (.withWatermark) for late data.",
      "Write-Ahead Log (WAL) offsets and distributed checkpoint directories ensure fault-tolerant, end-to-end exactly-once processing guarantees."
    ],
    docLink: "https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html"
  },
  {
    id: "cdc-debezium-lakehouse-pipeline",
    title: "Real-Time Change Data Capture (CDC) Architecture",
    subtitle: "OLTP Write-Ahead Logs (WAL), Debezium Connect, Kafka Change Stream & Delta APPLY CHANGES INTO",
    category: "Data Pipelines & Ingestion",
    image: "/diagrams/cdc_debezium_lakehouse_pipeline.webp",
    tags: ["CDC", "Debezium", "Kafka Connect", "Delta Lake", "APPLY CHANGES INTO", "SCD Type 1", "SCD Type 2", "WAL"],
    description: "Production log-based Change Data Capture (CDC) pipeline. Illustrates non-intrusive transaction log reading (WAL/Binlog) via Debezium Kafka Connect, structured change event payload publishing to Kafka topics, and automated Lakehouse SCD Type 1 and Type 2 upserts using Delta Live Tables APPLY CHANGES INTO.",
    keyPoints: [
      "Log-Based CDC reads database Write-Ahead Logs (Postgres WAL, MySQL Binlog, SQL Server LSN) with sub-second latency and zero query overhead on OLTP.",
      "Debezium captures full before/after row states and operation flags ('c' for create, 'u' for update, 'd' for delete) with exact sequence timestamps.",
      "Kafka Connect offset tracking guarantees resume capability from the exact LSN log position without data loss or message duplication.",
      "Delta Live Tables APPLY CHANGES INTO automatically resolves out-of-order events using sequence keys and maintains SCD Type 1 or SCD Type 2 histories."
    ],
    docLink: "https://debezium.io/documentation/reference/stable/architecture.html"
  },
  {
    id: "databricks-medallion-pipeline",
    title: "Databricks Medallion Lakehouse Architecture",
    subtitle: "End-to-End Enterprise Data Flow & Unified Governance Pipeline",
    category: "Data Pipelines & Ingestion",
    image: "/diagrams/databricks_medallion_architecture.webp",
    tags: ["Medallion", "Bronze", "Silver", "Gold", "Auto Loader", "MERGE INTO", "Liquid Clustering"],
    description: "Dual-plane enterprise architecture: Top-level orchestration (Airflow/Databricks Workflows/Job Clusters) coordinating with bottom-level storage layers (Bronze, Silver, Gold) and Unity Catalog.",
    keyPoints: [
      "Bronze Layer: Append-only raw ingestion via Auto Loader (cloudFiles) with schema evolution and _rescued_data preservation.",
      "Silver Layer: Cleansed, validated, and deduplicated conformed data loaded via idempotent MERGE INTO upserts and Liquid Clustering.",
      "Gold Layer: Dimensional star schema (Facts & Dimensions) and aggregated business KPIs served via Serverless SQL Warehouses to Power BI Direct Lake.",
      "Vertical control flow connects automated job clusters and Unity Catalog metadata sync to all physical Delta tiers."
    ],
    docLink: "https://docs.databricks.com/en/lakehouse/medallion.html"
  },
  {
    id: "delta-live-tables-pipeline",
    title: "Delta Live Tables (DLT) Pipeline Architecture",
    subtitle: "Declarative Multi-Hop Lakehouse Ingestion, Automated CDC & Data Quality Expectations",
    category: "Data Pipelines & Ingestion",
    image: "/diagrams/databricks_dlt_pipeline.webp",
    tags: ["Delta Live Tables", "Declarative ETL", "Data Quality", "APPLY CHANGES INTO", "CDC", "Streaming"],
    description: "Declarative ETL framework managing cluster infrastructure, DAG dependencies, checkpointing, and scaling with built-in expectation checks and automated Change Data Capture.",
    keyPoints: [
      "Declarative table and view definitions using Python @dlt.table or SQL CREATE OR REFRESH STREAMING TABLE.",
      "Built-in Data Quality Expectations: EXPECT (metrics), EXPECT ... ON VIOLATION DROP ROW, and EXPECT ... ON VIOLATION FAIL UPDATE.",
      "Automated CDC: APPLY CHANGES INTO maintains SCD Type 1 (in-place) and SCD Type 2 (historical versioning) dimensions automatically.",
      "Zero-Ops automation: Dynamic cluster auto-scaling, automated DAG compilation, and self-healing error recovery."
    ],
    docLink: "https://docs.databricks.com/en/delta-live-tables/index.html"
  },
  {
    id: "databricks-platform-master",
    title: "Databricks Unified Data Intelligence Platform",
    subtitle: "Comprehensive Landscape: Ingestion, Storage, Governance, Compute, BI & Mosaic AI",
    category: "Platform Landscape",
    image: "/diagrams/databricks_ecosystem_landscape.webp",
    tags: ["Lakehouse", "Unity Catalog", "Photon", "Mosaic AI", "Delta Live Tables", "Serverless SQL"],
    description: "Complete architectural map spanning raw ingestion (Auto Loader, Lakeflow), open lakehouse storage (Delta Lake, UniForm), central governance (Unity Catalog), scalable compute (Photon), and enterprise workload pillars.",
    keyPoints: [
      "Five horizontal foundational tiers governed centrally by a unified Unity Catalog Metastore.",
      "Universal Format (UniForm) provides zero-copy open metadata interoperability across Delta Lake, Apache Iceberg, and Apache Hudi.",
      "Native Photon C++ vectorized engine accelerates SQL Warehouses and Spark DataFrames with CPU SIMD registers.",
      "Four top-tier workload pillars: Data Engineering & Streaming, Data Warehousing & BI, Mosaic AI & Data Science, and Developer Experience."
    ],
    docLink: "https://docs.databricks.com/en/introduction/index.html"
  },
  {
    id: "rag-vector-search-data-pipeline",
    title: "Enterprise RAG & Vector Data Architecture",
    subtitle: "Document Chunking, Embedding Models, Vector DB Indexing (HNSW/IVF), Semantic Retrieval & LLM Augmentation",
    category: "Platform Landscape",
    image: "/diagrams/rag_vector_search_data_pipeline.webp",
    tags: ["Generative AI", "RAG", "Vector Search", "Embeddings", "HNSW", "LLM", "Data Engineering for AI"],
    description: "Production Retrieval-Augmented Generation (RAG) and Vector Data Architecture. Details both the offline ingestion pipeline (document extraction, text chunking, embedding generation, and vector indexing) and the online inference pipeline (semantic search, cross-encoder reranking, and context-augmented LLM synthesis).",
    keyPoints: [
      "Offline Ingestion Pipeline: Chunks unstructured documents with token-aware sliding windows and generates 1536-dimensional embeddings.",
      "Vector Indexing: Employs Hierarchical Navigable Small World (HNSW) graphs and Inverted File (IVF) quantization for sub-millisecond approximate nearest neighbor (ANN) retrieval.",
      "Online Semantic Retrieval: Converts real-time user prompts into dense query vectors, querying cosine/dot-product similarity to retrieve top-K relevant passages.",
      "Context Augmentation: Injects verified retrieved context into Foundation LLM system prompts with hallucination guardrails and automated evaluation (RAGAS)."
    ],
    docLink: "https://docs.databricks.com/en/generative-ai/vector-search.html"
  },
  {
    id: "unity-catalog-governance",
    title: "Unity Catalog Unified Governance & 3-Level Namespace",
    subtitle: "Centralized Multi-Workspace Governance, 3-Level Namespace & Fine-Grained Security",
    category: "Governance & Security",
    image: "/diagrams/unity_catalog_architecture.webp",
    tags: ["Unity Catalog", "Governance", "Row Filtering", "Column Masking", "Lineage", "Delta Sharing"],
    description: "Centralized metastore governing all workspaces and cloud regions with standardized 3-level namespace (catalog.schema.table), dynamic row filters, column masks, and automated lineage.",
    keyPoints: [
      "Replaces legacy single-tier Hive Metastore with a standardized 3-level hierarchy: catalog.schema.table.",
      "Multi-Workspace Centralization: Data Engineering, BI Analysts, and ML Data Science share a single regional Metastore.",
      "Fine-Grained Security: Dynamic row-level filtering and column-level masking enforced centrally via standard SQL UDFs.",
      "Delta Sharing enables open, secure, zero-copy cross-cloud data sharing to external consumers without platform lock-in."
    ],
    docLink: "https://docs.databricks.com/en/data-governance/unity-catalog/index.html"
  },
  {
    id: "purview-governance-catalog",
    title: "Microsoft Purview Enterprise Governance Architecture",
    subtitle: "Unified Data Map, Automated Scanning, End-to-End Lineage, Sensitivity Labels & ABAC Access Policies",
    category: "Governance & Security",
    image: "/diagrams/purview_governance_catalog.webp",
    tags: ["Microsoft Purview", "Governance", "Data Catalog", "Lineage", "Sensitivity Labels", "ABAC", "Data Map"],
    description: "Enterprise data governance, discovery, and compliance framework using Microsoft Purview. Explains how the unified Data Map automatically scans multi-cloud and on-premise data estates, extracts column-level lineage from pipelines, classifies sensitive data (PII/PCI), and enforces attribute-based access control.",
    keyPoints: [
      "Microsoft Purview Hub in Fabric delivers unified data governance, offering automated data discovery, end-to-end data lineage, and metadata management across all OneLake workspaces.",
      "GDPR Compliance & PII Tracking: Automated classification detects sensitive Personally Identifiable Information (PII), tracking where sensitive data resides across Lakehouses and Warehouses.",
      "Fabric Sensitivity Labels: Applies persistent sensitivity labels for data protection, encryption, and export restrictions that cascade seamlessly from OneLake Delta tables into Power BI Direct Lake reports.",
      "Cross-Workspace Lineage & Auditability: Fulfills GDPR Article 30 audit requirements and right-to-be-forgotten discovery across the enterprise data estate."
    ],
    docLink: "https://learn.microsoft.com/en-us/purview/purview"
  },
  {
    id: "delta-lake-under-the-hood",
    title: "How Delta Lake Works Under the Hood",
    subtitle: "ACID Transactions, Transaction Log Protocol (_delta_log), & Liquid Clustering",
    category: "Storage Engine",
    image: "/diagrams/delta_lake_mechanism.webp",
    tags: ["Delta Lake", "ACID", "_delta_log", "Liquid Clustering", "OCC", "Time Travel", "CDF"],
    description: "3-panel under-the-hood mechanism contrasting raw Parquet file limitations with Delta Lake's ACID transaction log protocol, Optimistic Concurrency Control, and dynamic Liquid Clustering.",
    keyPoints: [
      "Universal Lakehouse Standard: Delta Lake provides ACID transactions, schema evolution, and open cross-engine interoperability (Spark, Synapse DW, KQL, Power BI Direct Lake) on top of Parquet storage.",
      "Declarative MERGE INTO & Auto Schema Merge: Executes atomic UPSERT operations; setting spark.databricks.delta.schema.autoMerge.enabled=true allows automatic assimilation of schema changes without write failures.",
      "Non-Blocking Schema Evolution: Partitions maintain independent schema metadata in the _delta_log; query engines reconcile schemas at read time and automatically populate missing columns with NULLs without data rewrites.",
      "OCC & Change Data Feed (CDF): Optimistic Concurrency Control eliminates race conditions while CDF exposes row-level change feeds for incremental downstream ETL."
    ],
    docLink: "https://docs.delta.io/latest/delta-intro.html"
  },
  {
    id: "apache-iceberg-open-table-format",
    title: "Apache Iceberg Open Table Format Mechanics",
    subtitle: "Iceberg Catalog, Metadata Pointers, Snapshot Manifest Lists, Manifest Files, and Data/Delete Files",
    category: "Storage Engine",
    image: "/diagrams/apache_iceberg_open_table_format.webp",
    tags: ["Apache Iceberg", "Table Format", "Metadata Tree", "Snapshots", "Manifests", "Hidden Partitioning", "ACID"],
    description: "Under-the-hood 4-tier tree architecture of Apache Iceberg. Shows how the Iceberg Catalog maintains the current metadata pointer, which points to immutable snapshot manifest lists, partitioned manifest files, and underlying Parquet data and position-delete files, enabling O(1) query planning without directory listing.",
    keyPoints: [
      "Hierarchical Metadata Tree (Catalog -> Metadata File -> Manifest List -> Manifests -> Data Files) decouples table state from physical directory layouts.",
      "Hidden Partitioning automatically derives partition values (by day, hour, bucket, or identity) without requiring users to write manual partition filters.",
      "Partition Evolution allows modifying table partitioning schemes over time without rewriting historical data files or breaking existing queries.",
      "Merge-on-Read (MoR) with Position Delete files enables rapid, lightweight row-level updates and deletes without immediate full-file compaction."
    ],
    docLink: "https://iceberg.apache.org/docs/latest/spec/"
  },
  {
    id: "open-table-formats-lakehouse",
    title: "Open Table Formats Blueprint: Lakehouse Storage Engines",
    subtitle: "Under-the-Hood Architectural Comparison: Delta Lake, Apache Iceberg & Apache Hudi",
    category: "Storage Engine",
    image: "/diagrams/open_table_formats_lakehouse_architecture.webp",
    tags: ["Open Table Formats", "Delta Lake", "Apache Iceberg", "Apache Hudi", "Lakehouse", "ACID", "Liquid Clustering", "Hidden Partitioning", "Timeline"],
    description: "Multi-engine architectural blueprint comparing Delta Lake, Apache Iceberg, and Apache Hudi across a unified query layer (Spark, Trino, Flink, DuckDB, Snowflake). Contrasts Delta Lake's monotonic ACID commit log (_delta_log) and Liquid Clustering, Apache Iceberg's hierarchical snapshot tree and hidden partitioning, and Apache Hudi's timeline instants and record-level indexing.",
    keyPoints: [
      "Multi-Engine Interoperability: Decouples table metadata from compute engines, allowing Spark, Trino, Flink, and DuckDB to execute concurrent ACID reads and writes.",
      "Delta Lake: Manages transactions via _delta_log JSON commits, periodic Parquet checkpoints, Liquid Clustering, and automatic UniForm metadata emission for Iceberg/Hudi.",
      "Apache Iceberg: Employs a 4-tier snapshot metadata tree (Catalog -> Metadata File -> Manifest List -> Manifests -> Data Files) with Hidden Partitioning and in-place Partition Evolution.",
      "Apache Hudi: Optimized for low-latency streaming ingestion and CDC via .hoodie timeline actions (commit, deltacommit, compaction), COW vs MOR table types, and record-level Bloom/Bucket indexes."
    ],
    docLink: "/guided-learning?topic=datalake"
  },
  {
    id: "open-file-formats-storage",
    title: "Open File Formats Blueprint: Physical Storage Engines",
    subtitle: "Under-the-Hood Internal Architecture: Apache Parquet, Apache ORC & Apache Avro",
    category: "Storage Engine",
    image: "/diagrams/open_file_formats_storage_architecture.webp",
    tags: ["Open File Formats", "Apache Parquet", "Apache ORC", "Apache Avro", "Columnar Storage", "Row-Oriented", "Predicate Pushdown", "Schema Evolution", "Bloom Filter"],
    description: "Physical byte layout, compression encodings, and pushdown optimizations comparing analytical columnar formats (Parquet, ORC) against streaming row-oriented serialization (Avro). Details Parquet's Row Groups and footer statistics, ORC's Stripes and 10,000-row group Bloom filters, and Avro's sync markers and JSON schema evolution.",
    keyPoints: [
      "Apache Parquet (OLAP Standard): Columnar layout with PAR1 magic headers, 128MB-512MB Row Groups, Column Chunks, and footer metadata enabling Predicate Pushdown and Column Projection.",
      "Apache ORC (Enterprise DW): Organizes data into 64MB-256MB Stripes with built-in Stripe-level Indexes (10,000-row groups with Bloom filters) for micro-skipping without stream decompression.",
      "Apache Avro (Streaming Standard): Row-oriented binary serialization with magic bytes Obj1, embedded JSON schema, and 16-byte cryptographic sync markers for fast row appends and Kafka integration.",
      "Schema Evolution: Avro provides full backward/forward schema resolution with Confluent Schema Registry; Parquet and ORC leverage footer metadata and column IDs."
    ],
    docLink: "/concepts?category=DATALAKE+ARCHITECTURE"
  },
  {
    id: "databricks-optimization-techniques-architecture",
    title: "6 Delta Lake Optimization Techniques: Lakehouse Performance & Storage Hygiene",
    subtitle: "Physical Partitioning, Z-Ordering, Compaction (OPTIMIZE), Auto Optimize, Liquid Clustering & VACUUM",
    category: "Storage Engine",
    image: "/diagrams/databricks_optimization_techniques_architecture.webp",
    tags: ["Delta Lake", "Liquid Clustering", "Z-Ordering", "OPTIMIZE", "Auto Optimize", "VACUUM", "Partitioning", "Databricks", "Storage Hygiene", "Performance Tuning"],
    description: "Under-the-hood architectural blueprint and decision framework detailing the 6 core Delta Lake optimization techniques. Covers physical directory partitioning, multi-dimensional Z-Ordering space-filling curves, bin-packing file compaction via OPTIMIZE, write-time Auto Optimize (optimizeWrites & autoCompact), next-generation Liquid Clustering (CLUSTER BY) Hilbert curves, and safe storage lifecycle management via VACUUM with 7-day retention safety.",
    keyPoints: [
      "Two-Stage File Compaction Process: Solves the small file problem by decoupling high-speed ingestion (staging) from asynchronous OPTIMIZE compaction, consolidating microscopic files into optimal ~1GB Parquet blocks. Note: Data Factory copy activities do not auto-compact files.",
      "Multi-Dimensional Z-Ordering: Uses a space-filling Z-curve to co-locate data physically across 2 to 4 frequently filtered/joined columns, enabling Delta Lake's query engine to skip 90-95% of irrelevant files using column min/max metadata statistics.",
      "Liquid Clustering (CLUSTER BY): Replaces rigid physical partitioning with dynamic Hilbert curve clustering, eliminating partition skew and small file proliferation.",
      "Partitioning Anti-Pattern: Partitioning tables by arrival timestamps or high-cardinality keys fractures data into microscopic files and severely worsens metadata overhead.",
      "VACUUM Lifecycle Hygiene: Purges unreferenced Parquet files older than safety retention (default 168 hours / 7 days) to control storage costs without violating ACID time travel."
    ],
    docLink: "/concepts?category=DATABRICKS"
  },
  {
    id: "spark-catalyst-photon-engine",
    title: "Databricks Compute: Catalyst Optimizer, AQE & Photon",
    subtitle: "Query Optimization Pipeline, Runtime Adaptive Query Execution (AQE), and Vectorized C++ Execution",
    category: "Compute & Optimization",
    image: "/diagrams/catalyst_photon_engine.webp",
    tags: ["Catalyst Optimizer", "AQE", "Photon", "SIMD", "Vectorized Engine", "Tungsten Engine"],
    description: "4-phase Catalyst query compilation pipeline, runtime re-planning via Adaptive Query Execution (AQE), and execution branching between JVM Tungsten and native C++ Photon.",
    keyPoints: [
      "PySpark Actions vs Transformations: Transformations (filter, select, withColumn) build an unresolved/resolved execution DAG lazily; Actions (collect, count) force computation and trigger cluster job execution.",
      "Action Safety Guardrails: Actions are NOT for performance optimization; executing collect() on large datasets crashes the single Driver JVM with an Out-of-Memory (OOM) error. Caching (cache, persist) is a transformation, not an action.",
      "Catalyst & Tungsten Acceleration: DataFrame API outperforms RDDs through automated rule/cost-based plan optimization and Project Tungsten whole-stage bytecode generation over off-heap memory.",
      "Photon Native C++ Engine: Bypasses JVM overhead entirely, executing compiled columnar query plans with SIMD CPU vectorization."
    ],
    docLink: "https://docs.databricks.com/en/optimizations/index.html"
  },
  {
    id: "spark-shuffle-memory-execution",
    title: "Apache Spark Memory Architecture & Shuffle Mechanics",
    subtitle: "Unified Memory Manager, Storage vs Execution Pool, Tungsten Off-Heap & Sort-Based Shuffle Spilling",
    category: "Compute & Optimization",
    image: "/diagrams/spark_shuffle_memory_execution.webp",
    tags: ["Apache Spark", "Memory Management", "Unified Memory", "Shuffle", "Tungsten", "Off-Heap", "Spill to Disk"],
    description: "Comprehensive breakdown of Spark executor memory layout and shuffle mechanics. Contrasts JVM on-heap user memory with the Unified Memory Manager (Execution vs Storage dynamic boundary), Tungsten off-heap memory, and the sort-based shuffle pipeline showing memory buffers spilling to disk.",
    keyPoints: [
      "Unified Memory Manager dynamically shares memory between Execution (shuffles/joins/aggregations) and Storage (cached DataFrames).",
      "Dynamic eviction allows execution to borrow memory from storage, evicting cached blocks to disk or dropping LRU blocks when memory grants surge.",
      "Tungsten Off-Heap Memory allocates direct 64-bit memory addresses using sun.misc.Unsafe, eliminating JVM object header overhead and GC latency.",
      "Sort-Based Shuffle sorts partition data in an in-memory AppendOnlyMap, spilling to ShuffleData and ShuffleIndex files when memory limits are reached."
    ],
    docLink: "https://spark.apache.org/docs/latest/tuning.html#memory-management-overview"
  },
  {
    id: "sql-server-query-engine-optimization",
    title: "SQL Server & Relational Query Engine Architecture",
    subtitle: "Parsing, Cost-Based Optimizer, Join Operators, Memory Grants & Clustered Columnstore",
    category: "Compute & Optimization",
    image: "/diagrams/sql_server_query_engine_optimization.webp",
    tags: ["SQL Server", "T-SQL", "Query Optimizer", "Cardinality Estimation", "Columnstore", "Batch Mode", "Memory Grants"],
    description: "Relational database internals and execution mechanics for SQL Server and Azure SQL. Explains query parsing and algebrization, the cost-based optimizer searching trivial/quick/full plans, physical join operators (Nested Loops, Hash Match, Merge Join), memory workspace grants, and Clustered Columnstore batch mode execution.",
    keyPoints: [
      "DMV Session & Request Monitoring: Joining sys.dm_exec_sessions with sys.dm_exec_requests on session_id identifies the active username, connection status, login time, and exact executing SQL text via sys.dm_exec_sql_text(r.sql_handle).",
      "Microsoft Fabric queryinsights Schema: Provides built-in system views logging username attribution, query duration, CU consumption, and exact query text for diagnosing high-latency queries.",
      "Parallel T-SQL COPY INTO: Outperforms INSERT...VALUES and BULK INSERT by executing distributed, parallel bulk file ingestion from ADLS Gen2 directly into Fabric Warehouse tables.",
      "Storage Engine & Buffer Pool: Coordinates 8KB page caching, write-ahead logging (WAL), and lock escalation to guarantee ACID transactional consistency."
    ],
    docLink: "https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide"
  },
  {
    id: "kimball-dimensional-star-schema",
    title: "Kimball Dimensional Modeling & Enterprise Star Schema",
    subtitle: "Atomic Grain, Central Fact Tables, Conformed Dimensions, SCD Type 1 & 2, and Bus Architecture",
    category: "Data Modeling & Architecture",
    image: "/diagrams/kimball_dimensional_star_schema.webp",
    tags: ["Kimball", "Dimensional Modeling", "Star Schema", "Fact Tables", "Conformed Dimensions", "SCD Type 2", "Bus Matrix"],
    description: "Enterprise dimensional modeling master blueprint based on Kimball methodology. Details atomic fact table grain declaration, foreign key relationship links to conformed dimensions, Slowly Changing Dimensions (SCD Type 1 overwrite vs SCD Type 2 history tracking), role-playing dimensions, and the Enterprise Data Bus Matrix.",
    keyPoints: [
      "Enterprise SCD Type 2 Implementation in Fabric: Maintained using Delta Lake MERGE operations, surrogate keys, business natural keys, Effective/Expiration dates, and IsCurrent flags.",
      "SHA2 Hash-Based Change Detection: Generates a computed SHA2 hash over all tracked dimensional attributes in source and target, detecting delta modifications instantly without multi-column string comparisons.",
      "Batch Processing & Late-Arriving Data: Executes MERGE in batches by natural key ranges to manage memory; handles late-arriving records by backdating EffectiveDate and adjusting predecessor expiration timestamps.",
      "Soft Deletes & Materialized Current View: Deletions set IsDeleted=1 and expire dimension rows rather than physical removal; a materialized view filtering IsCurrent=1 provides simplified BI reporting."
    ],
    docLink: "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/"
  },
  {
    id: "data-vault-enterprise-architecture",
    title: "Data Vault 2.0 Architecture & Lakehouse Modeling",
    subtitle: "Raw Staging, Hubs (Business Keys), Links (Relationships), Satellites (Context), Business Vault & Info Marts",
    category: "Data Modeling & Architecture",
    image: "/diagrams/data_vault_enterprise_architecture.webp",
    tags: ["Data Vault 2.0", "Hubs", "Links", "Satellites", "Hash Keys", "Auditability", "Business Vault", "Information Marts"],
    description: "Enterprise Data Vault 2.0 modeling architecture designed for massive scalability, auditability, and parallel data loading. Illustrates Raw Vault Hubs (business keys), Links (transactions and associations), and Satellites (contextual history), connecting to Business Vault PIT/Bridge tables and downstream Star Schema Information Marts.",
    keyPoints: [
      "Hubs store unique business keys with deterministic MD5/SHA-256 hash keys (HK), load timestamps, and record sources with zero natural key updates.",
      "Links capture many-to-many associations and business transactions between Hubs, providing non-destructive schema evolution as relationships change.",
      "Satellites record all descriptive context and temporal change history using Hash Diffs, providing complete historical auditability.",
      "Business Vault uses Point-in-Time (PIT) and Bridge tables to resolve temporal joins, projecting virtual Star Schema Information Marts directly to Power BI."
    ],
    docLink: "https://datavaultalliance.com/architecture/"
  },
  {
    id: "enterprise-edge-client-architecture",
    title: "Enterprise Edge Architecture: Data, Edge & Client Flow",
    subtitle: "Global Edge Network with Sub-100ms Redis Sync, Server-Side DAL, and Web Worker Compute Offloading",
    category: "Platform Landscape",
    image: "/diagrams/enterprise_edge_architecture.webp",
    tags: ["Edge Computing", "Next.js", "Redis Cache", "Web Workers", "Server-Side DAL", "ISR", "Client Performance"],
    description: "High-concurrency data platform edge architecture illustrating end-to-end data delivery across three tiers: Data Layer & Persistence (Raw Lakehouse JSONs, Server-Side DAL with React cache(), Upstash Global Redis Cache), Edge Optimization & Compute (Vercel Edge Node Proxy, SWR Edge Cache, Next.js Server Components SSG/ISR, Dynamic Semantic SEO Engine), and Client Runtime & UI (TanStack Virtual 60fps windowing, Background Web Workers for SIMD Cosine Distance & Spark Simulation).",
    keyPoints: [
      "Fabric Eventstream IoT Ingestion: Eventstream Input connects to Azure Event Hubs (or Kafka) to ingest high-velocity real-time GPS telemetry from 50,000+ distributed IoT devices.",
      "Eventstream Processor In-Flight Cleansing: Performs real-time filtering, coordinate format normalization, bounding-box geo-enrichment, and invalid entry removal before landing.",
      "Eventstream Output to Lakehouse Delta: Persists streaming outputs directly into Lakehouse Delta tables, supporting both real-time operational alerting and downstream Spark/SQL batch analytics.",
      "Stream Analytics Watermark Policies: Configures late arrival tolerance (up to 20 days) and out-of-order tolerance (up to 59s) with windowing functions to handle delayed streaming events accurately."
    ],
    docLink: "https://vercel.com/docs/edge-network/overview"
  },
  {
    id: "distributed-systems-resilience-architecture",
    title: "Distributed Systems Design: High-Throughput & Resilient Architecture",
    subtitle: "API Gateway, Rate Limiting (Token Bucket), Distributed Cache (Redis), SAGA Orchestrator & Sharded Databases",
    category: "Platform Landscape",
    image: "/diagrams/distributed_systems_resilience_architecture.webp",
    tags: ["System Design", "Distributed Systems", "API Gateway", "Rate Limiting", "Redis Cluster", "SAGA Pattern", "Sharding", "Kafka Outbox"],
    description: "Enterprise distributed systems architecture designed for high availability and resilient multi-service coordination. Highlights ingress traffic shaping via API Gateway and Token Bucket rate limiting, distributed caching with Cache-Aside and Bloom Filter protection against stampedes/penetration, SAGA transaction orchestration with compensating transactions on failure, and horizontal database sharding via consistent hashing paired with the Transactional Outbox pattern.",
    keyPoints: [
      "API Gateway & Rate Limiting: Manages TLS termination, JWT validation, and dynamic routing while Token Bucket algorithms protect downstream microservices from traffic surges.",
      "Distributed Cache Resilience: Redis Cluster with Cache-Aside, Bloom Filters, and TTL jitter mitigates cache penetration, avalanche, and thundering herd stampedes.",
      "SAGA Orchestration: Coordinates complex multi-service distributed transactions across Order, Payment, and Inventory services, automatically issuing compensating undo transactions upon failure.",
      "Horizontal Sharding & Outbox: Databases are horizontally partitioned using consistent hashing, while the Transactional Outbox pattern and Debezium CDC guarantee reliable asynchronous event publishing to Kafka."
    ],
    docLink: "https://microservices.io/patterns/data/saga.html"
  },
  {
    id: "python-arrow-polars-architecture",
    title: "Modern Python Data Architecture: Apache Arrow, Polars & Zero-Copy IPC",
    subtitle: "Columnar Memory Layout, Multi-Threaded Rust Engine, SIMD Vectorization & Zero-Copy PyArrow Flight IPC",
    category: "Compute & Optimization",
    image: "/diagrams/python_arrow_polars_architecture.webp",
    tags: ["Python", "Apache Arrow", "Polars", "PyArrow Flight", "Zero-Copy IPC", "SIMD", "Rust", "Pydantic"],
    description: "Deep dive into next-generation Python data engineering architectures. Contrasts CPython Global Interpreter Lock (GIL) constraints, row-oriented pointer overhead, and single-threaded Pandas memory fragmentation with Apache Arrow's standardized contiguous columnar format, Polars multi-threaded work-stealing Rust engine with lazy predicate pushdown, and zero-serialization PyArrow Flight IPC buffer sharing between Python, Spark, Ray, and DuckDB.",
    keyPoints: [
      "Apache Arrow Standard: Contiguous 64-byte aligned columnar memory enables zero-copy slicing, cache locality, and hardware CPU SIMD vectorization.",
      "Polars Rust Engine: Releases the CPython GIL, utilizing multi-threaded parallel work-stealing and lazy query compilation (.lazy()) with projection and predicate pushdown.",
      "Out-of-Core Streaming: Polars processes datasets larger than available RAM by streaming data in Arrow record batches, eliminating out-of-memory crashes.",
      "PyArrow Flight & IPC: Enables high-throughput zero-copy memory interchange (/dev/shm) across polyglot engines (PySpark, Ray, DuckDB) without costly JSON/Pickle serialization."
    ],
    docLink: "https://arrow.apache.org/overview/"
  },
  {
    id: "data-mesh-enterprise-architecture",
    title: "Enterprise Data Mesh: Decentralized Domains & Data Products",
    subtitle: "Domain-Driven Ownership, Data as a Product (DaaP), Self-Serve Infrastructure & Federated Computational Governance",
    category: "Data Modeling & Architecture",
    image: "/diagrams/data_mesh_enterprise_architecture.webp",
    tags: ["Data Mesh", "Data Products", "Domain-Driven Design", "Data Contracts", "Federated Governance", "Self-Serve Platform", "Delta Sharing"],
    description: "Decentralized enterprise architectural paradigm shifting data ownership from centralized monoliths to autonomous domain teams. Details the 4 core pillars of Data Mesh: Domain-Driven Data Ownership, Data as a Product (DaaP) with standardized input/output/control ports, Self-Serve Data Infrastructure Platform plane, and Federated Computational Governance enforcing declarative Data Contracts (YAML) across multi-cloud lakehouses.",
    keyPoints: [
      "Domain Data Products: Autonomous business domains (Orders, Customer 360, Marketing) own end-to-end data lifecycle, publishing discoverable datasets via SQL, REST, and Delta Sharing output ports.",
      "Declarative Data Contracts: Semantic YAML/JSON schemas define explicit expectations, SLOs/SLAs, and schema evolution rules between data producers and analytical consumers.",
      "Federated Computational Governance: Unified catalogs (Purview / Unity Catalog) enforce automated compliance audits, role-based access control, and column-level lineage globally.",
      "Self-Serve Platform Plane: Infrastructure abstraction automates cluster provisioning, CI/CD pipelines, automated testing, and FinOps cost attribution across all domain products."
    ],
    docLink: "https://martinfowler.com/articles/data-mesh-principles.html"
  },
  {
    id: "spark-data-skew-aqe-optimization",
    title: "Apache Spark Data Skew Remediation & AQE Optimization",
    subtitle: "Runtime Skew Detection, Partition Splitting, Key Salting Techniques & Dynamic Broadcast Joins",
    category: "Compute & Optimization",
    image: "/diagrams/spark_data_skew_aqe_optimization.webp",
    tags: ["Apache Spark", "Data Skew", "AQE", "Adaptive Query Execution", "Key Salting", "Skew Join", "SortMergeJoin", "BroadcastHashJoin"],
    description: "Comprehensive blueprint resolving the single biggest performance killer in distributed Spark workloads: Data Skew. Contrasts severe skew bottlenecks (99% single-task stragglers, executor OOMs, and massive shuffle spill) with runtime Adaptive Query Execution (spark.sql.adaptive.skewJoin.enabled) that dynamically splits giant partitions into sub-partitions, and developer-side Salted Join techniques that evenly distribute skewed keys across all worker cores.",
    keyPoints: [
      "Data Skew Bottleneck: Hot join keys (e.g. NULL, 'US', defaults) concentrate gigabytes into a single partition, causing straggler tasks, executor timeouts, and severe disk spill.",
      "AQE Dynamic Skew Join Splitting: Spark 3.x inspects completed map shuffle files at runtime, automatically splitting partitions exceeding skew thresholds into balanced 40–128MB chunks.",
      "Dynamic Broadcast Hash Join (BHJ): AQE dynamically converts costly SortMergeJoins to broadcast joins at runtime if stage statistics reveal the filtered right-side table is under 10MB.",
      "Two-Phase Key Salting Pattern: Appending random salt suffixes (rand(0, N-1)) to skewed join keys and replicating the lookup table N times redistributes data with 100% uniform cluster utilization."
    ],
    docLink: "https://spark.apache.org/docs/latest/sql-performance-tuning.html#adaptive-query-execution"
  },
  {
    id: "lakehouse-finops-cost-optimization",
    title: "Enterprise Lakehouse FinOps & Cloud Cost Optimization",
    subtitle: "Compute Auto-Termination, Spot vs On-Demand, Storage Tiering (Hot/Cool/Archive) & Query Pruning",
    category: "Platform Landscape",
    image: "/diagrams/lakehouse_finops_cost_optimization.webp",
    tags: ["FinOps", "Cost Optimization", "Databricks", "Azure", "Serverless SQL", "Spot Instances", "Liquid Clustering", "VACUUM", "Storage Tiering"],
    description: "Strategic FinOps framework and operational cost governance architecture for enterprise cloud lakehouses. Spans cost allocation tagging and telemetry (Databricks System Tables system.billing.usage, Azure Cost Management API), compute right-sizing (aggressive 10-15 min auto-termination, Spot worker nodes with on-demand driver fallback, Serverless SQL auto-scaling), and storage cost reduction via Delta Lake OPTIMIZE, Liquid Clustering read pruning, and automated lifecycle archiving.",
    keyPoints: [
      "Fabric Capacity Smoothing Algorithm: Calculates usage over rolling time windows (e.g. 5-10 min interactive, multi-hour background), allowing temporary bursts past 100% (peaks of 140%-200%+) without throttling. Throttling is determined strictly by smoothed consumption.",
      "Manual Scaling Requirement: Microsoft Fabric capacities (F SKUs) do NOT autoscale automatically; capacity admins must manually change SKU sizes in the Azure Portal.",
      "Global Overlap Sizing (F64 Unified Architecture): Sizing calculation proves a single unified F64 capacity (64 CUs) accommodates multi-region peak overlap (e.g., EMEA and Americas East 38 CU demand) with maximum burst pooling, outperforming fragmented F16/F32 capacities.",
      "Automated VACUUM & Storage Lifecycle: Complements compute optimization by permanently purging unreferenced Parquet files past retention thresholds."
    ],
    docLink: "https://docs.databricks.com/en/admin/account-settings/system-tables/index.html"
  },
  {
    id: "databricks-dabs-devops-pipeline",
    title: "Databricks Asset Bundles (DABs) & Serverless CI/CD Architecture",
    subtitle: "Declarative Infrastructure as Code (IaC), Git Multi-Environment Promotion & Serverless Workflows",
    category: "Data Pipelines & Ingestion",
    image: "/diagrams/databricks_dabs_devops_pipeline.webp",
    tags: ["Databricks", "DABs", "CI/CD", "DevOps", "Infrastructure as Code", "GitHub Actions", "Serverless Workflows", "Unity Catalog"],
    description: "Modern enterprise DevOps and Infrastructure-as-Code (IaC) lifecycle using Databricks Asset Bundles (DABs). Illustrates local developer authoring in VS Code with databricks.yml bundle definitions, automated CI/CD validation and ephemeral integration testing via GitHub Actions / Azure DevOps runners, and automated zero-downtime promotion across isolated development, staging, and production Unity Catalog catalogs.",
    keyPoints: [
      "Declarative databricks.yml Specification: Defines pipelines, notebooks, serverless workflows, cluster configurations, and access permissions in human-readable version-controlled YAML.",
      "Shift-Left CI Automation: CI runners trigger `databricks bundle validate`, static code linting (ruff, black), and execute automated pytest suites against ephemeral development clusters before PR merge.",
      "Multi-Environment Target Promotion: Enables isolated deployment targets (-t dev, -t staging, -t prod) binding to dedicated Unity Catalog catalogs (dev_catalog vs prod_catalog) and service principals.",
      "Zero-Downtime Serverless Deployment: Automated production deployment updates Serverless Workflows and Delta Live Tables pipelines with automated rollback upon smoke test failure."
    ],
    docLink: "https://docs.databricks.com/en/dev-tools/bundles/index.html"
  },
  {
    id: "spark-savemode-architecture",
    title: "Apache Spark SaveMode Handling & Storage Execution Architecture",
    subtitle: "Internal Mechanics for Append, Overwrite, Ignore, and ErrorIfExists Modes Across File Formats",
    category: "Storage Engine",
    image: "/diagrams/spark_savemode_architecture_diagram.webp",
    tags: ["Apache Spark", "SaveMode", "Append", "Overwrite", "Delta Lake", "Parquet", "Partition Overwrite", "Storage Mechanics"],
    description: "Detailed digital whiteboard blueprint illustrating how Apache Spark's DataFrameWriter handles file writing across Append, Overwrite, Ignore, and ErrorIfExists modes, highlighting dynamic partition overwrites, metadata existence probes, and atomic commit semantics.",
    keyPoints: [
      "Append Mode: Directly writes new partition chunks without deleting existing files; safe for incremental stream/batch micro-batches.",
      "Overwrite Mode: Governed by spark.sql.sources.partitionOverwriteMode (dynamic vs static); dynamic mode replaces only touched partitions rather than wiping the root directory.",
      "Ignore Mode: Silently converts the write into a no-op if the target path or dataset exists, preventing accidental duplicates without throwing errors.",
      "ErrorIfExists Mode: Spark's default mode; evaluates directory existence prior to execution and throws AnalysisException to guard against accidental overwrites."
    ],
    docLink: "https://spark.apache.org/docs/latest/sql-data-sources-load-save-functions.html#save-modes"
  },
  {
    id: "spark-join-decision-tree",
    title: "Apache Spark Join Strategy Selection Decision Tree",
    subtitle: "How Catalyst & Adaptive Query Execution (AQE) Pick BHJ, SMJ, SHJ, BNLJ, or Cartesian Products",
    category: "Compute & Optimization",
    image: "/diagrams/spark_join_decision_tree.webp",
    tags: ["Apache Spark", "Catalyst Optimizer", "Broadcast Hash Join", "Sort Merge Join", "Shuffle Hash Join", "AQE", "Join Performance"],
    description: "Complete decision tree guiding Spark's selection of physical join strategies based on equi-join criteria, memory thresholds (spark.sql.autoBroadcastJoinThreshold), sortable keys, and runtime Adaptive Query Execution conversions.",
    keyPoints: [
      "Equi-Join Branching: Non-equi joins bypass hash/merge algorithms and fall back to Broadcast Nested Loop Join (BNLJ) or Cartesian Product.",
      "Broadcast Hash Join (BHJ): Fastest join strategy with 0 network shuffle, broadcasting tables under 10MB to all executor memory pools.",
      "Sort Merge Join (SMJ): Big data workhorse for orderable keys; streams pre-sorted partitions with linear scans and zero OOM risk.",
      "AQE Dynamic Join Downgrade: Re-evaluates join strategy after initial shuffle stage; if filtered dataset is under 10MB, converts SMJ to BHJ at runtime."
    ],
    docLink: "https://spark.apache.org/docs/latest/sql-performance-tuning.html#join-strategy-hints"
  },
  {
    id: "delta-vs-iceberg-architecture",
    title: "Delta Lake vs. Apache Iceberg Storage & Metadata Architecture",
    subtitle: "Under-the-Hood Comparison of Commit Logs, Checkpoints, Manifest Trees, and Hidden Partitioning",
    category: "Storage Engine",
    image: "/diagrams/delta_lake_vs_iceberg_architecture.webp",
    tags: ["Delta Lake", "Apache Iceberg", "Lakehouse", "ACID", "Table Formats", "Manifests", "Hidden Partitioning", "Time Travel"],
    description: "Architectural comparison of the two dominant open lakehouse storage formats, contrasting Delta Lake's sequential JSON commit log and Parquet checkpoints with Apache Iceberg's hierarchical Avro manifest tree and hidden partition evolution.",
    keyPoints: [
      "Metadata Architecture: Delta Lake utilizes forward JSON logs with periodic 10-commit Parquet checkpoints; Iceberg uses a multi-tier tree of Snapshots, Manifest Lists, and Manifest Files.",
      "Partition Evolution: Iceberg allows hidden partitioning and schema/partition evolution without rewriting historical data; Delta Lake organizes files by physical directory paths.",
      "File Pruning Efficiency: Iceberg prunes entire manifest files using partition bounds before reading data file metadata; Delta reads column min/max statistics stored inside checkpoint Parquet files.",
      "ACID & Snapshot Isolation: Both support Optimistic Concurrency Control (OCC), zero-copy time travel queries, and snapshot rollbacks."
    ],
    docLink: "https://iceberg.apache.org/docs/latest/spec/"
  },
  {
    id: "spark-aqe-dynamic-optimization",
    title: "Apache Spark Adaptive Query Execution (AQE) Architecture",
    subtitle: "Dynamic Partition Coalescing, Join Strategy Switching, and Automatic Skew Join Balancing",
    category: "Compute & Optimization",
    image: "/diagrams/spark_aqe_architecture_diagram.webp",
    tags: ["Apache Spark", "AQE", "Adaptive Query Execution", "Dynamic Coalescing", "Data Skew", "MapStatus", "Runtime Tuning"],
    description: "Detailed visual guide to Spark 3.x Adaptive Query Execution (AQE), detailing how runtime stage statistics re-plan execution on the fly to eliminate small files, prevent shuffle skew, and convert joins dynamically.",
    keyPoints: [
      "Dynamic Partition Coalescing: Automatically groups 200 default shuffle partitions into balanced 64MB targets based on post-shuffle MapStatus file sizes.",
      "Dynamic Join Switching: Converts conservative Sort Merge Joins to fast Broadcast Hash Joins if post-filter runtime table sizes fall under 10MB.",
      "Dynamic Skew Join Handling: Detects skewed partitions exceeding 5x median size and splits them into sub-partitions while replicating opposite keys to prevent straggler tasks.",
      "Enabled by Default: Standard in Spark 3.2+ via spark.sql.adaptive.enabled=true."
    ],
    docLink: "https://spark.apache.org/docs/latest/sql-performance-tuning.html#adaptive-query-execution"
  },
  {
    id: "spark-memory-management-spill",
    title: "Apache Spark Memory Management & Shuffle Spilling Mechanics",
    subtitle: "UnifiedMemoryManager Pools, Dynamic Borrowing, Eviction Rules & On-Disk Spill Protection",
    category: "Compute & Optimization",
    image: "/diagrams/spark_memory_management_spill_diagram.webp",
    tags: ["Apache Spark", "Memory Management", "UnifiedMemoryManager", "Shuffle Spill", "Off-Heap", "Tungsten", "Garbage Collection"],
    description: "Comprehensive blueprint of the Spark JVM Executor memory layout, breaking down Reserved Memory (300MB), User Memory (40%), and Unified Memory (60% split between Execution and Storage), alongside the 5-step disk spilling pipeline.",
    keyPoints: [
      "Reserved Memory: 300MB fixed allocation dedicated exclusively to Spark internal operations and fail-safe OOM protection.",
      "Dynamic Borrowing Rules: Execution memory can evict Storage cached blocks when under pressure, but Storage CANNOT evict active Execution memory.",
      "Disk Spilling Pipeline: Serializes in-memory shuffle buffers with LZ4 compression when threshold is exceeded, followed by multi-way on-disk merge scans.",
      "Off-Heap Tungsten Memory: spark.memory.offHeap.enabled allows direct C-style raw memory management, completely bypassing JVM garbage collection pauses."
    ],
    docLink: "https://spark.apache.org/docs/latest/tuning.html#memory-management-overview"
  },
  {
    id: "spark-streaming-state-store",
    title: "Spark Structured Streaming State Store & Watermarking Mechanics",
    subtitle: "Stateful Stream-to-Stream Joins, Windowed Aggregations, RocksDB vs HDFS, and Late Data Evictions",
    category: "Compute & Optimization",
    image: "/diagrams/spark_streaming_state_store.webp",
    tags: ["Apache Spark", "Structured Streaming", "State Store", "RocksDB", "Watermark", "Event Time", "Append Mode", "Update Mode"],
    description: "Detailed whiteboard blueprint of Spark Structured Streaming stateful execution, demonstrating event-time watermark calculations (max(event_time) - delayThreshold), late data drop decisions, HDFS in-memory vs RocksDB off-heap C++ state store architectures, and output modes.",
    keyPoints: [
      "Watermark Threshold: Evaluates event time against maximum observed timestamp minus delay; records older than the watermark are dropped immediately to bound state store size.",
      "RocksDB vs HDFS StateStore: HDFS backed store holds state in Java heap maps risking heavy GC pauses; RocksDB maintains state off-heap in C++ SST files, handling billions of state keys with constant memory.",
      "Output Mode Semantics: Append emits only finalized windows; Update emits changed records per micro-batch; Complete re-emits entire aggregated tables.",
      "Stream-to-Stream Joins: Mandatory watermark on both input streams ensures state store buffers do not grow unbounded while waiting for matching keys."
    ],
    docLink: "https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html#watermarking"
  },
  {
    id: "photon-engine-vs-jvm",
    title: "Databricks Photon Native C++ Engine vs. Classic Spark JVM",
    subtitle: "Vectorized Columnar Execution, CPU Cache Locality, SIMD AVX-512, and JNI Fallback Boundaries",
    category: "Compute & Optimization",
    image: "/diagrams/photon_engine_vs_jvm.webp",
    tags: ["Databricks", "Photon", "C++", "Vectorized Execution", "SIMD", "CPU Cache", "JVM GC", "Catalyst Optimizer"],
    description: "Architectural comparison contrasting Classic Spark Tungsten whole-stage Java bytecode generation with Databricks Photon native C++ vectorized execution, detailing CPU cache lines, off-heap memory, and the automatic JNI fallback bridge.",
    keyPoints: [
      "Vectorized Batch Execution: Photon processes batches of ~1024 columnar tuples at a time directly in modern CPU SIMD registers (AVX-512), avoiding row-at-a-time volcano iterator overhead.",
      "Zero-GC Native Memory: Allocates execution buffers directly off-heap in C++, eliminating JVM garbage collection pauses and object boxing/unboxing.",
      "Cache Locality: Columnar data arrays fit directly into L1/L2/L3 CPU hardware caches for maximum instructions per cycle (IPC).",
      "Seamless JNI Fallback: Catalyst query planner routes supported operators to native Photon while gracefully delegating unsupported operations (custom Java/Python UDFs) back to classic JVM."
    ],
    docLink: "https://docs.databricks.com/en/runtime/photon.html"
  },
  {
    id: "spark-broadcast-accumulators",
    title: "Apache Spark Broadcast Variables vs. Accumulators Architecture",
    subtitle: "TorrentBroadcast Peer-to-Peer Chunking vs. Write-Only Task Heartbeat Rollups",
    category: "Compute & Optimization",
    image: "/diagrams/spark_broadcast_accumulators.webp",
    tags: ["Apache Spark", "Broadcast Variables", "Accumulators", "TorrentBroadcast", "BlockManager", "Distributed Memory", "Driver"],
    description: "In-depth guide to Spark's two distributed shared variable constructs: read-only Broadcast Variables leveraging BitTorrent-style P2P chunking across executors, and write-only Accumulators aggregating task metrics back to the driver.",
    keyPoints: [
      "TorrentBroadcast P2P Protocol: Driver splits serialized broadcast data into 4MB chunks; executors download chunks from each other simultaneously, preventing driver network saturation.",
      "Single JVM Deserialization: Broadcast data is deserialized exactly once per executor and cached in BlockManager memory, shared across all executor CPU task slots.",
      "Accumulator Write-Only Rule: Worker tasks can only increment/add to accumulators; reading accumulator values is strictly restricted to the driver node.",
      "Lazy Evaluation Gotcha: Accumulators inside transformations (e.g. .map()) can duplicate counts if tasks are re-executed; use only inside actions (e.g. .foreach()) for accurate counting."
    ],
    docLink: "https://spark.apache.org/docs/latest/rdd-programming-guide.html#broadcast-variables"
  },
  {
    id: "lakehouse-acid-concurrency",
    title: "Lakehouse ACID Concurrency & Write Conflict Resolution Matrix",
    subtitle: "Optimistic Concurrency Control (OCC) Protocols and Conflict Rules Across Delta Lake & Apache Iceberg",
    category: "Storage Engine",
    image: "/diagrams/lakehouse_acid_concurrency.webp",
    tags: ["Delta Lake", "Apache Iceberg", "ACID", "Concurrency", "OCC", "Write Conflict Matrix", "Atomic Commits"],
    description: "Comprehensive blueprint illustrating the 4-phase Optimistic Concurrency Control (OCC) commit lifecycle and a complete 2D Write Conflict Resolution Matrix across concurrent Appends, Updates, Deletes, Overwrites, and Compactions.",
    keyPoints: [
      "4-Phase OCC Protocol: 1. Record snapshot read version; 2. Execute write into staging files; 3. Attempt atomic commit rename; 4. Mutual exclusion validation check against concurrent commits.",
      "Append Concurrency: Concurrent Appends never conflict because they generate independent Parquet files and commit atomically.",
      "Update vs. Update Conflicts: Concurrent Updates or Deletes conflict and throw ConcurrentModificationException only if they touch overlapping data partitions or files.",
      "Compaction / OPTIMIZE Safety: Bin-packing and clustering operations preserve table state and auto-rebase without aborting concurrent append transactions."
    ],
    docLink: "https://docs.delta.io/latest/concurrency-control.html"
  },
  {
    id: "scd-types-lakehouse",
    title: "Slowly Changing Dimensions (SCD Types 1, 2, 3, 4, 6) in Modern Lakehouses",
    subtitle: "Row Overwrites, Full Versioning with Valid_From/Valid_To, Split Tables, and Hybrid Dimension Modeling",
    category: "Data Modeling & Architecture",
    image: "/diagrams/scd_types_lakehouse.webp",
    tags: ["Data Modeling", "Dimensional Modeling", "SCD", "SCD Type 2", "Delta MERGE", "dbt Snapshot", "Surrogate Keys", "Kimball"],
    description: "Visual architectural guide to all five major Slowly Changing Dimension strategies, contrasting Type 1 direct overwrite, Type 2 row versioning with timestamps and current flags, Type 3 prior-value columns, Type 4 split history tables, and Type 6 hybrid models.",
    keyPoints: [
      "SCD Type 1 (Direct Overwrite): Overwrites attribute values in place with zero audit trail; best for non-historical corrections and typo fixes.",
      "SCD Type 2 (Golden Standard): Closes previous record (Valid_To = current_date, Is_Current = False) and inserts a new active row; natively executed via Delta MERGE or dbt snapshots.",
      "SCD Type 3 (Previous Value Column): Adds explicit previous-attribute columns; simple but strictly limited to tracking a single past change.",
      "SCD Type 4 (Split Current & History): Maintains a compact current table for fast OLAP lookups alongside an append-only historical audit log table.",
      "SCD Type 6 (Hybrid 1 + 2 + 3): Combines row versioning, current-state column overwrite on all historical rows, and prior value columns for instant filtering without expensive joins."
    ],
    docLink: "https://docs.delta.io/latest/delta-update.html#slowly-changing-data-scd-type-2-with-delta-lake"
  }
];
