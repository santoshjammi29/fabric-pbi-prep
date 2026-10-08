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
    | "Compute & Optimization";
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
    image: "/diagrams/fabric_onelake_architecture.jpg",
    tags: ["Microsoft Fabric", "OneLake", "Delta Lake", "Direct Lake", "Shortcuts", "Synapse Data Warehouse", "Fabric Spark", "Purview"],
    description: "End-to-end Microsoft Fabric architecture showing the single SaaS data lake (OneLake), universal Delta Parquet storage format with V-Order optimization, zero-copy shortcuts linking AWS S3 and GCP, and multi-engine compute integration (Spark, Synapse DW, Power BI Direct Lake, KQL, and Data Factory).",
    keyPoints: [
      "OneLake acts as the 'OneDrive for Data' providing a single logical data lake across the entire organization without fragmented silos.",
      "OneLake Shortcuts allow instant virtualization of external data in Amazon S3, Google Cloud Storage, and ADLS Gen2 with zero data copying or egress fees.",
      "Multi-Engine Compute: Fabric Spark, Synapse Data Warehouse (T-SQL), and Real-Time Intelligence all read and write to the same open Delta Parquet files.",
      "Unified governance via Microsoft Purview provides centralized access control, workspace domains, automated sensitivity labels, and full data lineage."
    ]
  },
  {
    id: "powerbi-direct-lake-vertipaq",
    title: "Power BI Direct Lake Mode & VertiPaq Semantic Engine",
    subtitle: "Memory-Mapped Delta Parquet vs Legacy Import and DirectQuery Modes",
    category: "Fabric & Power BI",
    image: "/diagrams/powerbi_direct_lake_vertipaq.jpg",
    tags: ["Power BI", "Direct Lake", "VertiPaq", "DAX", "Fabric Semantic Model", "Delta Parquet", "Import vs DirectQuery"],
    description: "Architectural comparison of Power BI Direct Lake mode against legacy Import and DirectQuery. Illustrates how the VertiPaq in-memory analytics engine directly memory-maps Delta Parquet column chunks from OneLake storage into RAM on-demand, achieving sub-second DAX query response times with real-time data freshness and zero data duplication.",
    keyPoints: [
      "Bypasses scheduled data refresh entirely by loading Delta Parquet column chunks straight into VertiPaq memory on demand.",
      "Eliminates data duplication and 1GB/10GB model size limits inherent to traditional Power BI Import mode.",
      "Provides sub-second DAX analytical query speeds without generating high query loads or concurrency bottlenecks on underlying relational databases.",
      "Automatic Fallback mechanism gracefully falls back to DirectQuery if semantic model features or security constraints exceed Direct Lake thresholds."
    ]
  },
  {
    id: "apache-airflow-distributed-architecture",
    title: "Apache Airflow Distributed Production Architecture",
    subtitle: "Multi-Threaded Scheduler, Metadata DB, Kubernetes/Celery Executors, and Triggerer",
    category: "Data Pipelines & Ingestion",
    image: "/diagrams/apache_airflow_architecture.jpg",
    tags: ["Apache Airflow", "Orchestration", "DAG", "CeleryExecutor", "KubernetesExecutor", "Triggerer", "PostgreSQL", "Operators"],
    description: "Production distributed architecture of Apache Airflow showing the multi-process scheduler parsing DAG directories, PostgreSQL metadata database managing task states, Celery/Redis queue or Kubernetes API dispatcher, asynchronous Triggerer event loop for deferrable operators, and auto-scaling worker pods orchestrating Spark, Databricks, and dbt jobs.",
    keyPoints: [
      "Multi-threaded Airflow Scheduler continuously loops through the DAG directory, evaluates task upstream dependencies, and enqueues executable tasks.",
      "PostgreSQL Metadata DB serves as the single source of truth storing DAG run history, task instances, connection pools, and XCom variables.",
      "KubernetesExecutor and CeleryExecutor dynamically provision isolated worker pods on demand to execute compute-heavy pipelines.",
      "Airflow Triggerer runs an async Python asyncio event loop, allowing deferrable operators and external sensors to release worker resources while waiting."
    ]
  },
  {
    id: "dbt-analytics-engineering-dag",
    title: "dbt (Data Build Tool) Modern Analytics Engineering DAG",
    subtitle: "From Raw Sources to Production Data Marts with Incremental Models, Tests & Semantic Layer",
    category: "Data Pipelines & Ingestion",
    image: "/diagrams/dbt_analytics_engineering_dag.jpg",
    tags: ["dbt", "Analytics Engineering", "DAG", "Incremental Models", "Snapshots", "SCD Type 2", "Semantic Layer", "Data Testing"],
    description: "Complete dbt transformation DAG pipeline illustrating the progression from Raw Landing Sources through Staging views (stg_), Intermediate business logic (int_), to production Star Schema Marts (fct_ and dim_). Highlights dbt incremental strategies (is_incremental()), SCD Type 2 history snapshots, automated schema tests, and the dbt Semantic Layer.",
    keyPoints: [
      "Structured multi-layer modeling pattern: Staging (1:1 schema normalization) -> Intermediate (business logic & deduplication) -> Marts (Star Schema).",
      "dbt Incremental Strategy: Uses is_incremental() and unique_key to transform and merge only new or modified rows, saving compute and runtime.",
      "dbt Snapshots provide automated SCD Type 2 historical dimension tracking using either timestamp or check strategies without complex procedural code.",
      "Built-in testing assertions (unique, not_null, accepted_values, relationships) validate data quality before publishing to downstream BI tools."
    ]
  },
  {
    id: "databricks-platform-master",
    title: "Databricks Unified Data Intelligence Platform",
    subtitle: "Comprehensive Landscape: Ingestion, Storage, Governance, Compute, BI & Mosaic AI",
    category: "Platform Landscape",
    image: "/diagrams/databricks_ecosystem_landscape.jpg",
    tags: ["Lakehouse", "Unity Catalog", "Photon", "Mosaic AI", "Delta Live Tables", "Serverless SQL"],
    description: "Complete architectural map spanning raw ingestion (Auto Loader, Lakeflow), open lakehouse storage (Delta Lake, UniForm), central governance (Unity Catalog), scalable compute (Photon), and enterprise workload pillars.",
    keyPoints: [
      "Five horizontal foundational tiers governed centrally by a unified Unity Catalog Metastore.",
      "Universal Format (UniForm) provides zero-copy open metadata interoperability across Delta Lake, Apache Iceberg, and Apache Hudi.",
      "Native Photon C++ vectorized engine accelerates SQL Warehouses and Spark DataFrames with CPU SIMD registers.",
      "Four top-tier workload pillars: Data Engineering & Streaming, Data Warehousing & BI, Mosaic AI & Data Science, and Developer Experience."
    ]
  },
  {
    id: "databricks-medallion-pipeline",
    title: "Databricks Medallion Lakehouse Architecture",
    subtitle: "End-to-End Enterprise Data Flow & Unified Governance Pipeline",
    category: "Data Pipelines & Ingestion",
    image: "/diagrams/databricks_medallion_architecture.jpg",
    tags: ["Medallion", "Bronze", "Silver", "Gold", "Auto Loader", "MERGE INTO", "Liquid Clustering"],
    description: "Dual-plane enterprise architecture: Top-level orchestration (Airflow/Databricks Workflows/Job Clusters) coordinating with bottom-level storage layers (Bronze, Silver, Gold) and Unity Catalog.",
    keyPoints: [
      "Bronze Layer: Append-only raw ingestion via Auto Loader (cloudFiles) with schema evolution and _rescued_data preservation.",
      "Silver Layer: Cleansed, validated, and deduplicated conformed data loaded via idempotent MERGE INTO upserts and Liquid Clustering.",
      "Gold Layer: Dimensional star schema (Facts & Dimensions) and aggregated business KPIs served via Serverless SQL Warehouses to Power BI Direct Lake.",
      "Vertical control flow connects automated job clusters and Unity Catalog metadata sync to all physical Delta tiers."
    ]
  },
  {
    id: "unity-catalog-governance",
    title: "Unity Catalog Unified Governance & 3-Level Namespace",
    subtitle: "Centralized Multi-Workspace Governance, 3-Level Namespace & Fine-Grained Security",
    category: "Governance & Security",
    image: "/diagrams/unity_catalog_architecture.jpg",
    tags: ["Unity Catalog", "Governance", "Row Filtering", "Column Masking", "Lineage", "Delta Sharing"],
    description: "Centralized metastore governing all workspaces and cloud regions with standardized 3-level namespace (catalog.schema.table), dynamic row filters, column masks, and automated lineage.",
    keyPoints: [
      "Replaces legacy single-tier Hive Metastore with a standardized 3-level hierarchy: catalog.schema.table.",
      "Multi-Workspace Centralization: Data Engineering, BI Analysts, and ML Data Science share a single regional Metastore.",
      "Fine-Grained Security: Dynamic row-level filtering and column-level masking enforced centrally via standard SQL UDFs.",
      "Delta Sharing enables open, secure, zero-copy cross-cloud data sharing to external consumers without platform lock-in."
    ]
  },
  {
    id: "delta-lake-under-the-hood",
    title: "How Delta Lake Works Under the Hood",
    subtitle: "ACID Transactions, Transaction Log Protocol (_delta_log), & Liquid Clustering",
    category: "Storage Engine",
    image: "/diagrams/delta_lake_mechanism.jpg",
    tags: ["Delta Lake", "ACID", "_delta_log", "Liquid Clustering", "OCC", "Time Travel", "CDF"],
    description: "3-panel under-the-hood mechanism contrasting raw Parquet file limitations with Delta Lake's ACID transaction log protocol, Optimistic Concurrency Control, and dynamic Liquid Clustering.",
    keyPoints: [
      "Atomic commits and ACID guarantees managed via the _delta_log/ JSON commit log and Parquet checkpoints every 10 commits.",
      "Optimistic Concurrency Control (OCC) and Multi-Version Concurrency Control (MVCC) eliminate blind overwrite race conditions.",
      "Liquid Clustering (CLUSTER BY) uses Hilbert space-filling curves to replace rigid Hive partitions and manual Z-Ordering.",
      "Unlocks enterprise capabilities: Time Travel rollback, Schema Enforcement & Evolution, and Change Data Feed (CDF)."
    ]
  },
  {
    id: "delta-live-tables-pipeline",
    title: "Delta Live Tables (DLT) Pipeline Architecture",
    subtitle: "Declarative Multi-Hop Lakehouse Ingestion, Automated CDC & Data Quality Expectations",
    category: "Data Pipelines & Ingestion",
    image: "/diagrams/databricks_dlt_pipeline.jpg",
    tags: ["Delta Live Tables", "Declarative ETL", "Data Quality", "APPLY CHANGES INTO", "CDC", "Streaming"],
    description: "Declarative ETL framework managing cluster infrastructure, DAG dependencies, checkpointing, and scaling with built-in expectation checks and automated Change Data Capture.",
    keyPoints: [
      "Declarative table and view definitions using Python @dlt.table or SQL CREATE OR REFRESH STREAMING TABLE.",
      "Built-in Data Quality Expectations: EXPECT (metrics), EXPECT ... ON VIOLATION DROP ROW, and EXPECT ... ON VIOLATION FAIL UPDATE.",
      "Automated CDC: APPLY CHANGES INTO maintains SCD Type 1 (in-place) and SCD Type 2 (historical versioning) dimensions automatically.",
      "Zero-Ops automation: Dynamic cluster auto-scaling, automated DAG compilation, and self-healing error recovery."
    ]
  },
  {
    id: "spark-catalyst-photon-engine",
    title: "Databricks Compute: Catalyst Optimizer, AQE & Photon",
    subtitle: "Query Optimization Pipeline, Runtime Adaptive Query Execution (AQE), and Vectorized C++ Execution",
    category: "Compute & Optimization",
    image: "/diagrams/catalyst_photon_engine.jpg",
    tags: ["Catalyst Optimizer", "AQE", "Photon", "SIMD", "Vectorized Engine", "Tungsten Engine"],
    description: "4-phase Catalyst query compilation pipeline, runtime re-planning via Adaptive Query Execution (AQE), and execution branching between JVM Tungsten and native C++ Photon.",
    keyPoints: [
      "Catalyst 4 Phases: Analysis (catalog resolution), Logical Optimization (predicate pushdown), Physical Planning (join cost model), Code Generation.",
      "Adaptive Query Execution (AQE) dynamically coalesces shuffle partitions, switches to broadcast joins, and splits skewed partitions at runtime.",
      "Photon vectorized engine written in C++ operates directly on CPU SIMD vector registers, bypassing JVM garbage collection pauses for 3x–10x speedups."
    ]
  }
];
