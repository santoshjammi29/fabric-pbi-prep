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
    image: "/diagrams/fabric_onelake_architecture.jpg",
    tags: ["Microsoft Fabric", "OneLake", "Delta Lake", "Direct Lake", "Shortcuts", "Synapse Data Warehouse", "Fabric Spark", "Purview"],
    description: "End-to-end Microsoft Fabric architecture showing the single SaaS data lake (OneLake), universal Delta Parquet storage format with V-Order optimization, zero-copy shortcuts linking AWS S3 and GCP, and multi-engine compute integration (Spark, Synapse DW, Power BI Direct Lake, KQL, and Data Factory).",
    keyPoints: [
      "OneLake acts as the 'OneDrive for Data' providing a single logical data lake across the entire organization without fragmented silos.",
      "OneLake Shortcuts allow instant virtualization of external data in Amazon S3, Google Cloud Storage, and ADLS Gen2 with zero data copying or egress fees.",
      "Multi-Engine Compute: Fabric Spark, Synapse Data Warehouse (T-SQL), and Real-Time Intelligence all read and write to the same open Delta Parquet files.",
      "Unified governance via Microsoft Purview provides centralized access control, workspace domains, automated sensitivity labels, and full data lineage."
    ],
    docLink: "https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview"
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
    ],
    docLink: "https://learn.microsoft.com/en-us/power-bi/enterprise/directlake-overview"
  },
  {
    id: "powerbi-dax-engine-context",
    title: "Power BI DAX Engine Mechanics & Context Transition",
    subtitle: "Formula Engine (FE), VertiPaq Storage Engine (SE), Filter Context, Row Context & CALCULATE()",
    category: "Fabric & Power BI",
    image: "/diagrams/powerbi_dax_engine_context.jpg",
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
    image: "/diagrams/apache_airflow_architecture.jpg",
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
    image: "/diagrams/dbt_analytics_engineering_dag.jpg",
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
    image: "/diagrams/adf_hybrid_architecture.jpg",
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
    image: "/diagrams/kafka_event_streaming_pipeline.jpg",
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
    image: "/diagrams/cdc_debezium_lakehouse_pipeline.jpg",
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
    image: "/diagrams/databricks_medallion_architecture.jpg",
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
    image: "/diagrams/databricks_dlt_pipeline.jpg",
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
    image: "/diagrams/databricks_ecosystem_landscape.jpg",
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
    image: "/diagrams/rag_vector_search_data_pipeline.jpg",
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
    image: "/diagrams/unity_catalog_architecture.jpg",
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
    image: "/diagrams/purview_governance_catalog.jpg",
    tags: ["Microsoft Purview", "Governance", "Data Catalog", "Lineage", "Sensitivity Labels", "ABAC", "Data Map"],
    description: "Enterprise data governance, discovery, and compliance framework using Microsoft Purview. Explains how the unified Data Map automatically scans multi-cloud and on-premise data estates, extracts column-level lineage from pipelines, classifies sensitive data (PII/PCI), and enforces attribute-based access control.",
    keyPoints: [
      "Purview Data Map creates an automated knowledge graph mapping data assets across Azure, AWS S3, Google Cloud, and on-premises databases.",
      "Automated Scanning Engine inspects data samples using 200+ built-in classification rules (credit cards, tax IDs, passport numbers).",
      "End-to-End Lineage Engine automatically traces column-level and dataset transformations across ADF, Databricks, Fabric, and Power BI.",
      "Centralized Access Policies (ABAC) enforce least-privilege credential-less access and dynamic data masking across distributed lakehouses."
    ],
    docLink: "https://learn.microsoft.com/en-us/purview/purview"
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
    ],
    docLink: "https://docs.delta.io/latest/delta-intro.html"
  },
  {
    id: "apache-iceberg-open-table-format",
    title: "Apache Iceberg Open Table Format Mechanics",
    subtitle: "Iceberg Catalog, Metadata Pointers, Snapshot Manifest Lists, Manifest Files, and Data/Delete Files",
    category: "Storage Engine",
    image: "/diagrams/apache_iceberg_open_table_format.jpg",
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
    ],
    docLink: "https://docs.databricks.com/en/optimizations/index.html"
  },
  {
    id: "spark-shuffle-memory-execution",
    title: "Apache Spark Memory Architecture & Shuffle Mechanics",
    subtitle: "Unified Memory Manager, Storage vs Execution Pool, Tungsten Off-Heap & Sort-Based Shuffle Spilling",
    category: "Compute & Optimization",
    image: "/diagrams/spark_shuffle_memory_execution.jpg",
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
    image: "/diagrams/sql_server_query_engine_optimization.jpg",
    tags: ["SQL Server", "T-SQL", "Query Optimizer", "Cardinality Estimation", "Columnstore", "Batch Mode", "Memory Grants"],
    description: "Relational database internals and execution mechanics for SQL Server and Azure SQL. Explains query parsing and algebrization, the cost-based optimizer searching trivial/quick/full plans, physical join operators (Nested Loops, Hash Match, Merge Join), memory workspace grants, and Clustered Columnstore batch mode execution.",
    keyPoints: [
      "Cost-Based Optimizer (CBO) utilizes column distribution statistics and histograms to calculate cardinalities and determine the lowest-cost physical plan.",
      "Physical Join Selection: Nested Loops for indexed point lookups; Merge Join for pre-sorted streams; Hash Match for unsorted large sets requiring hash tables.",
      "Memory Workspace Grants: Complex sort and hash operators require dedicated workspace grants; inadequate grants cause costly TempDB disk spills.",
      "Clustered Columnstore Indexing stores rows in compressed columnar row groups (up to 1M rows), leveraging CPU SIMD registers for Batch Mode query execution."
    ],
    docLink: "https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide"
  },
  {
    id: "kimball-dimensional-star-schema",
    title: "Kimball Dimensional Modeling & Enterprise Star Schema",
    subtitle: "Atomic Grain, Central Fact Tables, Conformed Dimensions, SCD Type 1 & 2, and Bus Architecture",
    category: "Data Modeling & Architecture",
    image: "/diagrams/kimball_dimensional_star_schema.jpg",
    tags: ["Kimball", "Dimensional Modeling", "Star Schema", "Fact Tables", "Conformed Dimensions", "SCD Type 2", "Bus Matrix"],
    description: "Enterprise dimensional modeling master blueprint based on Kimball methodology. Details atomic fact table grain declaration, foreign key relationship links to conformed dimensions, Slowly Changing Dimensions (SCD Type 1 overwrite vs SCD Type 2 history tracking), role-playing dimensions, and the Enterprise Data Bus Matrix.",
    keyPoints: [
      "Atomic Grain Declaration: Designing fact tables at the most atomic level (e.g. 1 row per transaction line item) ensures maximum dimensional drill-down flexibility.",
      "Conformed Dimensions: Standardized dimensions (Dim_Customer, Dim_Date, Dim_Product) shared across business process marts eliminate inconsistent enterprise metrics.",
      "SCD Type 2: Preserves historical truth by tracking changes with surrogate keys, Valid_From, Valid_To, and Is_Current flags instead of destructive overwrites.",
      "Enterprise Data Bus Matrix maps business processes (rows) to conformed dimensions (columns), enabling phased enterprise data mart integration."
    ],
    docLink: "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/"
  },
  {
    id: "data-vault-enterprise-architecture",
    title: "Data Vault 2.0 Architecture & Lakehouse Modeling",
    subtitle: "Raw Staging, Hubs (Business Keys), Links (Relationships), Satellites (Context), Business Vault & Info Marts",
    category: "Data Modeling & Architecture",
    image: "/diagrams/data_vault_enterprise_architecture.jpg",
    tags: ["Data Vault 2.0", "Hubs", "Links", "Satellites", "Hash Keys", "Auditability", "Business Vault", "Information Marts"],
    description: "Enterprise Data Vault 2.0 modeling architecture designed for massive scalability, auditability, and parallel data loading. Illustrates Raw Vault Hubs (business keys), Links (transactions and associations), and Satellites (contextual history), connecting to Business Vault PIT/Bridge tables and downstream Star Schema Information Marts.",
    keyPoints: [
      "Hubs store unique business keys with deterministic MD5/SHA-256 hash keys (HK), load timestamps, and record sources with zero natural key updates.",
      "Links capture many-to-many associations and business transactions between Hubs, providing non-destructive schema evolution as relationships change.",
      "Satellites record all descriptive context and temporal change history using Hash Diffs, providing complete historical auditability.",
      "Business Vault uses Point-in-Time (PIT) and Bridge tables to resolve temporal joins, projecting virtual Star Schema Information Marts directly to Power BI."
    ],
    docLink: "https://datavaultalliance.com/architecture/"
  }
];
