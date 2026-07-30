/**
 * data_paths.js — Master Dataset for 12 Senior Data Engineering Learning Paths
 * Fabric & Flow Learning Operating System
 */

(function (window) {
  'use strict';

  window.LEARNING_PATHS_DB = [
    {
      id: 'path-fabric-dp600',
      slug: 'fabric-dp600',
      title: '1. Microsoft Fabric Analytics Engineer (DP-600)',
      icon: '🔷',
      badge: 'Certified Path',
      weeks: 8,
      difficulty: 'HARD',
      prerequisites: 'T-SQL, Data Warehousing, Basic Power BI',
      description: 'Master Lakehouse architecture, OneLake, Direct Lake mode, Delta Lake optimization, Data Factory pipelines, and Fabric Admin capacity management.',
      progress: 0,
      skills: ['Direct Lake', 'OneLake Shortcuts', 'V-Order Delta', 'Fabric Data Factory', 'DAX / Tabular', 'Semantic Models'],
      phases: [
        {
          name: 'Phase 1: OneLake & Lakehouse Foundations',
          weeks: 'Weeks 1-2',
          milestone: 'Provision Fabric capacity and configure workspace security, short-cuts, and medallion architecture.',
          topics: ['OneLake Architecture', 'Lakehouse vs Warehouse in Fabric', 'Internal vs External Shortcuts', 'Delta Log Engine']
        },
        {
          name: 'Phase 2: High-Performance Data Ingestion & Transformation',
          weeks: 'Weeks 3-4',
          milestone: 'Build Copy Activity + Dataflow Gen2 pipelines feeding PySpark Notebooks with V-Order compression.',
          topics: ['Data Factory Ingestion', 'Fabric PySpark Optimization', 'V-Order & OPTIMIZE Z-ORDER', 'Notebook Orchestration']
        },
        {
          name: 'Phase 3: Semantic Modeling & Direct Lake Performance',
          weeks: 'Weeks 5-6',
          milestone: 'Design a billion-row Direct Lake semantic model with zero DAX fallback to import mode.',
          topics: ['Direct Lake Framing', 'DAX Optimization', 'VertiPaq Memory Tuning', 'RLS / OLS in Fabric']
        },
        {
          name: 'Phase 4: Capstone & DP-600 Exam Readiness',
          weeks: 'Weeks 7-8',
          milestone: 'Complete end-to-end multi-tenant Fabric deployment and pass 100-question timed mock exam.',
          topics: ['Fabric Admin & Capacity Metrics', 'Git Integration & Deployment Pipelines', 'Mock Exam Rubric']
        }
      ],
      handsOn: {
        title: 'Fabric Multi-Source Lakehouse Ingestion',
        repo: 'https://github.com/santoshjammi29/fabric-dp600-starter',
        description: 'Build a production medallion lakehouse linking S3, Azure SQL, and Fabric OneLake with V-Order compression.'
      },
      capstone: 'Enterprise Retail Analytics Lakehouse with Direct Lake Reporting & Capacity Guardrails',
      examQsCount: 180
    },
    {
      id: 'path-azure-dp203',
      slug: 'azure-dp203',
      title: '2. Azure Data Engineer Associate (DP-203)',
      icon: '☁️',
      badge: 'Certified Path',
      weeks: 10,
      difficulty: 'HARD',
      prerequisites: 'Python, SQL, Cloud Fundamentals',
      description: 'Architect scalable cloud analytics using Azure Data Factory, Azure Databricks, Synapse Analytics, Cosmos DB, and Azure Stream Analytics.',
      progress: 0,
      skills: ['ADF Data Flows', 'Azure Databricks', 'Synapse Dedicated SQL', 'ADLS Gen2', 'Stream Analytics', 'Azure Key Vault'],
      phases: [
        {
          name: 'Phase 1: ADLS Gen2 & Azure Data Factory Ingestion',
          weeks: 'Weeks 1-3',
          milestone: 'Build parameterised ADF pipelines with Key Vault secrets and self-hosted integration runtimes.',
          topics: ['ADLS Gen2 Security', 'ADF Control Flow & Data Flows', 'SHIR Configuration', 'Event Grid Triggers']
        },
        {
          name: 'Phase 2: Azure Databricks Distributed Compute',
          weeks: 'Weeks 4-6',
          milestone: 'Develop Auto Loader streaming pipelines with Delta Live Tables and Unity Catalog governance.',
          topics: ['Databricks Cluster Tuning', 'Structured Streaming & Auto Loader', 'Delta Lake ACID Transactions', 'Unity Catalog']
        },
        {
          name: 'Phase 3: Synapse Dedicated & Serverless SQL Pools',
          weeks: 'Weeks 7-8',
          milestone: 'Design Hash/Replicated distributed tables for Synapse Dedicated Pool serving 100TB data.',
          topics: ['Hash/Round-Robin/Replicated Tables', 'Serverless Querying on Parquet', 'Workload Management']
        },
        {
          name: 'Phase 4: Capstone & DP-203 Exam Readiness',
          weeks: 'Weeks 9-10',
          milestone: 'Pass 120-question DP-203 simulation with case study scenarios.',
          topics: ['Data Security & Encryption', 'Disaster Recovery & Monitoring', 'Mock Exam Rubric']
        }
      ],
      handsOn: {
        title: 'ADF + Databricks Streaming Pipeline',
        repo: 'https://github.com/santoshjammi29/azure-dp203-starter',
        description: 'Ingest Kafka streams via ADF into Databricks Delta Lake with automated pipeline retries.'
      },
      capstone: 'Multi-Region Azure Financial Analytics Pipeline with Automated Governance',
      examQsCount: 220
    },
    {
      id: 'path-powerbi-pl300',
      slug: 'powerbi-pl300',
      title: '3. Microsoft Power BI Data Analyst (PL-300)',
      icon: '📊',
      badge: 'Certified Path',
      weeks: 6,
      difficulty: 'MEDIUM',
      prerequisites: 'Excel, Basic SQL',
      description: 'Transform raw datasets into actionable insights with Power Query M, advanced DAX, star schema modeling, and Power BI Service administration.',
      progress: 0,
      skills: ['Power Query M', 'DAX Measure Tuning', 'Star Schema', 'Power BI Service', 'Incremental Refresh', 'Deployment Pipelines'],
      phases: [
        {
          name: 'Phase 1: Power Query ETL & Data Transformation',
          weeks: 'Weeks 1-2',
          milestone: 'Master query folding, custom M functions, and non-additive data unpivoting.',
          topics: ['Query Folding Optimization', 'M Language Custom Functions', 'Error Handling & Parameterization']
        },
        {
          name: 'Phase 2: Star Schema Modeling & Advanced DAX',
          weeks: 'Weeks 3-4',
          milestone: 'Write complex time intelligence, CALCULATE modifier DAX measures on 50M rows.',
          topics: ['Star Schema vs Snowflake Schema', 'CALCULATE & Filter Context', 'Time Intelligence DAX', 'USERELATIONSHIP & Role-Playing']
        },
        {
          name: 'Phase 3: Optimization, Incremental Refresh & Security',
          weeks: 'Weeks 5-6',
          milestone: 'Deploy incremental refresh, RLS dynamic security roles, and automated workspaces.',
          topics: ['DAX Studio & VertiPaq Analyzer', 'Incremental Refresh Setup', 'Dynamic RLS with USERPRINCIPALNAME()']
        }
      ],
      handsOn: {
        title: 'Enterprise Power BI Financial Dashboard',
        repo: 'https://github.com/santoshjammi29/powerbi-pl300-starter',
        description: 'Build a fully responsive star schema report with custom bookmarks and dynamic RLS.'
      },
      capstone: 'Global Supply Chain Dashboard with Incremental Refresh & DAX Performance Tuning',
      examQsCount: 150
    },
    {
      id: 'path-spark-migration',
      slug: 'spark-migration',
      title: '4. Apache Spark 3 → 4 Engineering & Optimization',
      icon: '⚡',
      badge: 'Core Engine Track',
      weeks: 6,
      difficulty: 'HARD',
      prerequisites: 'Python / Scala, Basic Distributed Systems',
      description: 'Master Spark internal execution, Catalyst Optimizer, Tungsten memory management, AQE, shuffle tuning, and Spark 4.0 innovations.',
      progress: 0,
      skills: ['Spark 4.0 AQE', 'Tungsten Memory', 'Catalyst Optimizer', 'Shuffle Tuning', 'Skew Join Optimization', 'PySpark Performance'],
      phases: [
        {
          name: 'Phase 1: Spark Architecture & Memory Model',
          weeks: 'Weeks 1-2',
          milestone: 'Deconstruct Spark Driver, Executors, Memory Pools (Storage vs Execution), and Off-Heap Tungsten.',
          topics: ['Unified Memory Manager', 'Tungsten Unsafe Memory', 'DAG Scheduler & Task Scheduler', 'RDD vs DataFrame vs Dataset']
        },
        {
          name: 'Phase 2: Catalyst Optimizer & Adaptive Query Execution (AQE)',
          weeks: 'Weeks 3-4',
          milestone: 'Tune AQE dynamic partition coalescing, skew join handling, and broadcast threshold escalation.',
          topics: ['Logical Plan to Physical Plan', 'AQE Coalescing Partitions', 'Dynamic Skew Join Mitigation', 'Cost-Based Optimizer (CBO)']
        },
        {
          name: 'Phase 3: Production Shuffle & Memory Bottleneck Debugging',
          weeks: 'Weeks 5-6',
          milestone: 'Resolve OutOfMemoryError (OOM) and executor spill on a 1TB join scenario.',
          topics: ['Salting Skew Keys', 'Broadcast Hash Join vs SortMergeJoin', 'Spark Executor Garbage Collection Tuning']
        }
      ],
      handsOn: {
        title: 'Spark 4.0 AQE Skew Join Benchmarking',
        repo: 'https://github.com/santoshjammi29/spark4-aqe-benchmarks',
        description: 'Simulate extreme data skew and measure query execution times under standard vs AQE configurations.'
      },
      capstone: '10TB E-Commerce Clickstream Processing Engine with Zero Spill',
      examQsCount: 140
    },
    {
      id: 'path-databricks-photon',
      slug: 'databricks-photon',
      title: '5. Databricks Lakehouse & Photon Vectorized Engine',
      icon: '🧱',
      badge: 'Architect Path',
      weeks: 8,
      difficulty: 'ARCHITECT',
      prerequisites: 'PySpark, SQL, Lakehouse Concepts',
      description: 'Architect lakehouse platforms with Unity Catalog, Delta Live Tables (DLT), Photon C++ execution engine, and serverless compute.',
      progress: 0,
      skills: ['Photon Engine', 'Unity Catalog', 'Delta Live Tables', 'Serverless SQL', 'Liquid Clustering', 'Databricks Assets Bundles (DABs)'],
      phases: [
        {
          name: 'Phase 1: Unity Catalog & Governance',
          weeks: 'Weeks 1-2',
          milestone: 'Set up 3-tier catalog namespace (catalog.schema.table), lineage tracking, and attribute-based access control.',
          topics: ['Unity Catalog Architecture', 'ABAC / RBAC Security', 'System Tables & Audit Logs', 'Data Lineage']
        },
        {
          name: 'Phase 2: Delta Live Tables (DLT) & Declarative Pipelines',
          weeks: 'Weeks 3-4',
          milestone: 'Build streaming DLT pipeline with expectations (EXPECT ON VIOLATION DROP ROW) and CDC target merge.',
          topics: ['DLT Streaming Live Tables', 'Expectations & Quality Metrics', 'APPLY CHANGES INTO CDC', 'Serverless DLT']
        },
        {
          name: 'Phase 3: Photon Acceleration & Liquid Clustering',
          weeks: 'Weeks 5-6',
          milestone: 'Migrate Z-Order tables to Liquid Clustering and benchmark 5x speedups with Photon execution.',
          topics: ['C++ Vectorized Photon Architecture', 'Liquid Clustering (CLUSTER BY)', 'Deletion Vectors vs Copy-on-Write']
        },
        {
          name: 'Phase 4: Databricks CI/CD with DABs',
          weeks: 'Weeks 7-8',
          milestone: 'Automate multi-workspace deployment using Databricks Asset Bundles and GitHub Actions.',
          topics: ['Databricks Asset Bundles (DABs)', 'REST API v2.1', 'Serverless Workflows']
        }
      ],
      handsOn: {
        title: 'DLT Pipeline with Liquid Clustering',
        repo: 'https://github.com/santoshjammi29/databricks-dlt-liquid',
        description: 'Deploy an automated Delta Live Tables pipeline featuring data quality expectations and Liquid Clustering.'
      },
      capstone: 'Enterprise Databricks Lakehouse Platform with Unity Catalog & Serverless Compute',
      examQsCount: 160
    },
    {
      id: 'path-snowflake-snowpro',
      slug: 'snowflake-snowpro',
      title: '6. Snowflake SnowPro Advanced Architect',
      icon: '❄️',
      badge: 'Certified Path',
      weeks: 8,
      difficulty: 'ARCHITECT',
      prerequisites: 'SQL, Data Warehousing',
      description: 'Master multi-cluster virtual warehouses, micro-partitions, zero-copy cloning, Snowpark Python, Streams & Tasks, and Iceberg tables.',
      progress: 0,
      skills: ['Micro-partitions', 'Multi-Cluster Warehouses', 'Snowpark Python', 'Streams & Tasks', 'Zero-Copy Cloning', 'Snowflake Iceberg'],
      phases: [
        {
          name: 'Phase 1: Architecture & Micro-Partition Mechanics',
          weeks: 'Weeks 1-2',
          milestone: 'Understand micro-partition metadata, clustering depth, and virtual warehouse scaling policies.',
          topics: ['Micro-Partition Pruning', 'Multi-Cluster Scaling (Auto-scale vs Maximized)', 'Search Optimization Service']
        },
        {
          name: 'Phase 2: Snowpark Python & Stored Procedures',
          weeks: 'Weeks 3-4',
          milestone: 'Write serverless Snowpark Python UDFs and vector search procedures.',
          topics: ['Snowpark DataFrame API', 'Python UDFs & Vectorized UDFs', 'Stored Procedures in Python']
        },
        {
          name: 'Phase 3: Continuous Data Ingestion (Snowpipe & Streams/Tasks)',
          weeks: 'Weeks 5-6',
          milestone: 'Build event-driven CDC pipeline using Auto-ingest Snowpipe, Append-only Streams, and Cron Tasks.',
          topics: ['Snowpipe Auto-Ingest', 'Stream Metadata Columns', 'Task Graphs & DAG Orchestration']
        },
        {
          name: 'Phase 4: Snowflake Managed Iceberg & Cost Engineering',
          weeks: 'Weeks 7-8',
          milestone: 'Configure Apache Iceberg external tables backed by AWS Glue Catalog and audit warehouse credit usage.',
          topics: ['Snowflake Native Iceberg Tables', 'Resource Monitors & FinOps', 'SnowPro Advanced Exam Rubric']
        }
      ],
      handsOn: {
        title: 'Snowflake CDC Pipeline with Streams & Tasks',
        repo: 'https://github.com/santoshjammi29/snowflake-cdc-starter',
        description: 'Build an automated stream-and-task pipeline that merges CDC logs into target star schema tables.'
      },
      capstone: 'Multi-Cloud Snowflake Data Mesh Architecture with FinOps Guardrails',
      examQsCount: 150
    },
    {
      id: 'path-bigquery-gcp',
      slug: 'bigquery-gcp',
      title: '7. Google BigQuery & GCP Data Engineering',
      icon: '🔍',
      badge: 'Cloud Platform Track',
      weeks: 6,
      difficulty: 'HARD',
      prerequisites: 'SQL, GCP Fundamentals',
      description: 'Design enterprise BigQuery storage, Colossus file system, Capacitor columnar format, BigLake Iceberg shortcuts, and Pub/Sub streaming.',
      progress: 0,
      skills: ['BigQuery Slot Commitments', 'Partitioning & Clustering', 'BigLake Iceberg', 'Dataproc Serverless', 'Dataflow Streaming', 'Colossus Storage'],
      phases: [
        {
          name: 'Phase 1: BigQuery Storage Engine & Partitioning',
          weeks: 'Weeks 1-2',
          milestone: 'Optimize 1TB tables using ingestion-time partitioning and 4-column clustering.',
          topics: ['Colossus & Capacitor Columnar Storage', 'Partitioning Strategies', 'Clustering Mechanics', 'BI Engine In-Memory']
        },
        {
          name: 'Phase 2: BigLake & Open Table Interoperability',
          weeks: 'Weeks 3-4',
          milestone: 'Query S3 and GCS Apache Iceberg tables zero-copy via BigLake Connection.',
          topics: ['BigLake Object Tables', 'Iceberg & Delta Manifest Queries', 'Row-Level & Column-Level Security']
        },
        {
          name: 'Phase 3: FinOps, Slots & Streaming Ingestion',
          weeks: 'Weeks 5-6',
          milestone: 'Configure edition-based slot reservations (Enterprise Edition) and high-throughput Storage Write API.',
          topics: ['BigQuery Storage Write API', 'Slot Reservations & Autoscale', 'Cost Optimization Best Practices']
        }
      ],
      handsOn: {
        title: 'BigQuery BigLake Iceberg Integration',
        repo: 'https://github.com/santoshjammi29/bigquery-biglake-starter',
        description: 'Query external Iceberg tables stored on Cloud Storage directly inside BigQuery console.'
      },
      capstone: 'Global GCP Streaming Analytics Platform with BigQuery Edition Slot Management',
      examQsCount: 130
    },
    {
      id: 'path-modern-lakehouse',
      slug: 'modern-lakehouse',
      title: '8. Open Table Formats (Delta / Iceberg / Hudi / Paimon)',
      icon: '🪶',
      badge: 'Architect Path',
      weeks: 8,
      difficulty: 'ARCHITECT',
      prerequisites: 'Distributed Storage, Parquet Format',
      description: 'Deep-dive into storage spec internals: Delta `_delta_log` JSON/CRC, Iceberg `metadata.json` + Manifest Specs, Hudi Timeline, and Paimon LSM-trees.',
      progress: 0,
      skills: ['Iceberg Manifest Spec', 'Delta JSON Log', 'Hudi Timeline', 'UniForm', 'Deletion Vectors', 'LSM Storage Tree'],
      phases: [
        {
          name: 'Phase 1: Binary Parquet & Storage Spec Fundamentals',
          weeks: 'Weeks 1-2',
          milestone: 'Inspect Parquet Row Groups, Column Chunks, Page Headers, and Dictionary Encoding.',
          topics: ['Parquet Metadata Structure', 'Snappy / ZSTD Compression', 'Columnar Skipping Metrics']
        },
        {
          name: 'Phase 2: Delta Lake Log Internals',
          weeks: 'Weeks 3-4',
          milestone: 'Trace commit protocol, single-writer concurrency, checkpoint files, and Deletion Vectors.',
          topics: ['_delta_log Commit Protocol', 'Checkpoint Parquet Files', 'Deletion Vectors (DV)', 'UniForm Metadata Auto-translation']
        },
        {
          name: 'Phase 3: Apache Iceberg Spec v2 / v3',
          weeks: 'Weeks 5-6',
          milestone: 'Deconstruct Iceberg Catalog → metadata.json → Manifest List → Manifest File → Parquet Data File.',
          topics: ['Iceberg Snapshot Isolation', 'Partition Evolution without Table Rewrite', 'Merge-on-Read vs Copy-on-Write']
        },
        {
          name: 'Phase 4: Apache Hudi & Apache Paimon (LSM Tree)',
          weeks: 'Weeks 7-8',
          milestone: 'Benchmark streaming append workloads across Hudi MOR and Paimon LSM streaming tables.',
          topics: ['Hudi Timeline & File Slices', 'Apache Paimon Streaming LSM Tree', 'Format Decision Matrix']
        }
      ],
      handsOn: {
        title: 'Open Table Format Binary Inspector',
        repo: 'https://github.com/santoshjammi29/table-format-inspector',
        description: 'Read and parse raw Delta Lake and Iceberg JSON log files using Python and PyArrow.'
      },
      capstone: 'Unified Polyglot Lakehouse Platform Supporting Delta, Iceberg & Hudi via UniForm',
      examQsCount: 160
    },
    {
      id: 'path-streaming-cdc',
      slug: 'streaming-cdc',
      title: '9. Real-Time Streaming & Log-Based CDC Architecture',
      icon: '📡',
      badge: 'Core Engine Track',
      weeks: 8,
      difficulty: 'HARD',
      prerequisites: 'Kafka Fundamentals, Python/Java',
      description: 'Architect event-driven real-time pipelines with Apache Kafka, Debezium CDC, Spark Structured Streaming, Flink, and RocksDB state backend.',
      progress: 0,
      skills: ['Kafka Schema Registry', 'Debezium CDC', 'Watermarking', 'RocksDB State Backend', 'Exactly-Once Semantics', 'Spark Streaming'],
      phases: [
        {
          name: 'Phase 1: Event Ingestion & Schema Registry',
          weeks: 'Weeks 1-2',
          milestone: 'Deploy multi-broker Kafka cluster with Schema Registry and Avro serialization.',
          topics: ['Kafka Partitions & Consumer Groups', 'Schema Registry & Compatibility Modes', 'Producers & Acks Configuration']
        },
        {
          name: 'Phase 2: Log-Based CDC with Debezium',
          weeks: 'Weeks 3-4',
          milestone: 'Configure Debezium for Postgres/MySQL WAL logs capturing INSERT/UPDATE/DELETE events.',
          topics: ['WAL / Binlog Capture', 'Schema Evolution in Streams', 'Outbox Pattern for Microservices']
        },
        {
          name: 'Phase 3: Stream Processing Mechanics & Watermarks',
          weeks: 'Weeks 5-6',
          milestone: 'Implement windowed aggregations with late data handling via Event-Time Watermarks.',
          topics: ['Tumbling, Hopping & Session Windows', 'Watermarking & Lateness', 'RocksDB State Management']
        },
        {
          name: 'Phase 4: Exactly-Once Processing & Sink Merging',
          weeks: 'Weeks 7-8',
          milestone: 'Build end-to-end exactly-once pipeline from Kafka into Delta Lake table using Structured Streaming.',
          topics: ['Two-Phase Commit Sinks', 'Idempotent Writes', 'Fault Tolerance & Checkpointing']
        }
      ],
      handsOn: {
        title: 'End-to-End Debezium → Kafka → Delta CDC Pipeline',
        repo: 'https://github.com/santoshjammi29/realtime-cdc-delta-starter',
        description: 'Capture Postgres database changes using Debezium and stream directly into Delta Lake tables.'
      },
      capstone: '100k msg/sec Financial Transaction Streaming Platform with Zero Event Loss',
      examQsCount: 140
    },
    {
      id: 'path-ai-llm-de',
      slug: 'ai-llm-de',
      title: '10. AI / LLM Data Engineering & RAG Architecture',
      icon: '🤖',
      badge: 'Architect Path',
      weeks: 8,
      difficulty: 'ARCHITECT',
      prerequisites: 'Python, Vectors, ML Basics',
      description: 'Build enterprise RAG pipelines, vector indexing (HNSW/IVF), embedding generation at scale, MCP server integration, and LLM Ops pipelines.',
      progress: 0,
      skills: ['Vector Indexing (HNSW)', 'PySpark Embeddings', 'Delta Vector Search', 'MCP Servers', 'RAG Evaluation (Ragas)', 'Qdrant / Milvus'],
      phases: [
        {
          name: 'Phase 1: Text Chunking & Embedding Pipelines',
          weeks: 'Weeks 1-2',
          milestone: 'Build distributed text chunking and embedding pipeline using PySpark and OpenAI/BGE models.',
          topics: ['Recursive Chunking & Token Limits', 'Batch Embedding Generation', 'Dimensionality Reduction']
        },
        {
          name: 'Phase 2: Vector Indexing Mechanics & Vector Databases',
          weeks: 'Weeks 3-4',
          milestone: 'Benchmark HNSW (Hierarchical Navigable Small World) vs IVF-PQ indexing on 10 million vectors.',
          topics: ['Cosine Similarity vs Euclidean Distance', 'HNSW Graph Mechanics', 'Qdrant, Milvus & Databricks Vector Search']
        },
        {
          name: 'Phase 3: Hybrid Search & Agentic RAG Architecture',
          weeks: 'Weeks 5-6',
          milestone: 'Develop RAG system combining sparse BM25 keyword search + dense vector retrieval with Cohere reranking.',
          topics: ['Sparse-Dense Hybrid Search', 'Reciprocal Rank Fusion (RRF)', 'Reranking Models', 'Contextual Compression']
        },
        {
          name: 'Phase 4: Model Context Protocol (MCP) & AI Governance',
          weeks: 'Weeks 7-8',
          milestone: 'Construct a custom MCP tool server that enables LLM agents to safely execute SQL against data warehouses.',
          topics: ['Model Context Protocol (MCP) Spec', 'Tool Calling Security & Guardrails', 'Ragas Evaluation Metrics']
        }
      ],
      handsOn: {
        title: 'Distributed PySpark Embeddings & Vector Search',
        repo: 'https://github.com/santoshjammi29/pyspark-vector-rag-starter',
        description: 'Process unstructured PDFs into vector embeddings using PySpark and index in Databricks Vector Search.'
      },
      capstone: 'Enterprise Knowledge Graph & Agentic RAG Platform with MCP Server Integration',
      examQsCount: 150
    },
    {
      id: 'path-serverless-finops',
      slug: 'serverless-finops',
      title: '11. Serverless Cost Engineering & FinOps Mastery',
      icon: '💰',
      badge: 'Architect Path',
      weeks: 6,
      difficulty: 'ARCHITECT',
      prerequisites: 'Cloud Data Platforms, SQL',
      description: 'Engineered cost optimization strategies for Databricks DBUs, Snowflake credits, BigQuery slots, Fabric capacity, and AWS S3 storage tiers.',
      progress: 0,
      skills: ['DBU Optimization', 'Snowflake Credit Auditing', 'BigQuery Slot Management', 'S3 Lifecycle Policies', 'Query Cost Budgeting', 'FinOps Metrics'],
      phases: [
        {
          name: 'Phase 1: Cloud Storage FinOps & Lifecycle Optimization',
          weeks: 'Weeks 1-2',
          milestone: 'Audit 500TB S3/ADLS bucket and implement lifecycle rules saving 40% monthly costs.',
          topics: ['S3 Standard vs Infrequent Access vs Glacier', 'Small File Problem Cost Tax', 'Intelligent Tiering Mechanics']
        },
        {
          name: 'Phase 2: Databricks DBU & Cluster Sizing Optimization',
          weeks: 'Weeks 3-4',
          milestone: 'Eliminate idle cluster waste using Graviton VM instances, Spot instances, and Serverless SQL auto-stop.',
          topics: ['Spot vs On-Demand Instance Sizing', 'Graviton/ARM Compute Efficiency', 'Serverless Auto-suspend Tuning']
        },
        {
          name: 'Phase 3: Snowflake Credit & Warehouse Cost Reduction',
          weeks: 'Weeks 5-6',
          milestone: 'Analyze ACCOUNT_USAGE query history to optimize multi-cluster auto-suspend and statement timeouts.',
          topics: ['Warehouse Credit Consumption Audit', 'Statement Timeout & Queueing Tuning', 'Spilling to Storage Cost Elimination']
        }
      ],
      handsOn: {
        title: 'Automated Cloud Data FinOps Dashboard',
        repo: 'https://github.com/santoshjammi29/cloud-finops-dashboard-starter',
        description: 'Build a unified cost tracking engine aggregating billing metrics across Databricks, Snowflake, and AWS.'
      },
      capstone: 'Enterprise 30% Cost Reduction Architecture Blueprint for Multi-Cloud Data Platforms',
      examQsCount: 120
    },
    {
      id: 'path-architecture-mastery',
      slug: 'architecture-mastery',
      title: '12. Enterprise Data Architecture Mastery (32-Week Track)',
      icon: '🏛️',
      badge: 'Mastery Track',
      weeks: 32,
      difficulty: 'ARCHITECT',
      prerequisites: 'Senior Data Engineer / Tech Lead Experience',
      description: 'The ultimate curriculum covering Data Mesh, Data Contracts (ODCS), Lambda vs Kappa, Enterprise Security, Lineage, and System Design.',
      progress: 0,
      skills: ['Data Mesh', 'Data Contracts (ODCS)', 'Data Governance', 'System Design', 'Disaster Recovery', 'OpenLineage'],
      phases: [
        {
          name: 'Phase 1: Architectural Paradigms (Monolith → Lakehouse → Data Mesh)',
          weeks: 'Weeks 1-8',
          milestone: 'Design domain-driven Data Mesh specifications with decentralized ownership and centralized governance.',
          topics: ['Data Mesh Principles', 'Data Products & Interfaces', 'Data Contracts (Open Data Contract Standard)']
        },
        {
          name: 'Phase 2: High Availability, DR & Cross-Region Replication',
          weeks: 'Weeks 9-16',
          milestone: 'Draft multi-region Active-Passive and Active-Active data platform failover architectures.',
          topics: ['RPO / RTO Optimization', 'Cross-Region Storage Replication', 'Catalog Failover & Metadata Sync']
        },
        {
          name: 'Phase 3: Data Governance, Lineage & OpenLineage',
          weeks: 'Weeks 17-24',
          milestone: 'Deploy automated lineage extraction using OpenLineage, Apache Atlas, and Purview.',
          topics: ['OpenLineage Specification', 'Column-Level Lineage Tracking', 'Data Quality Frameworks']
        },
        {
          name: 'Phase 4: Principal Architect Capstone & Defense',
          weeks: 'Weeks 25-32',
          milestone: 'Present and defend end-to-end Enterprise Data Platform Blueprint in front of simulated C-Suite panel.',
          topics: ['C-Suite Architecture Proposals', 'Vendor Trade-off Matrix', 'Architect Defense Board']
        }
      ],
      handsOn: {
        title: 'Open Data Contract Standard (ODCS) Validator',
        repo: 'https://github.com/santoshjammi29/odcs-data-contract-validator',
        description: 'Implement automated schema & SLA validation against YAML data contract specifications.'
      },
      capstone: 'Complete Global Enterprise Data Platform Architecture Spec (100+ Pages & Mermaid Diagrams)',
      examQsCount: 300
    }
  ];

})(typeof window !== 'undefined' ? window : this);
