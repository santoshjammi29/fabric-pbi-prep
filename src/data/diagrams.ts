/**
 * Databricks & Modern Lakehouse Architecture Whiteboard Diagrams
 * High-resolution visual diagrams with technical specifications and key mechanisms.
 */

export interface ArchitectureDiagramItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Platform Landscape" | "Data Pipelines & Ingestion" | "Governance & Security" | "Storage Engine" | "Compute & Optimization";
  image: string;
  tags: string[];
  description: string;
  keyPoints: string[];
  docLink?: string;
}

export const architectureDiagrams: ArchitectureDiagramItem[] = [
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
