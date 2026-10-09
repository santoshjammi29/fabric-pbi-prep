export interface GuidedTopic {
  key: string;
  label: string;
  icon: string;          // emoji
  domain: string;        // high-level category domain
  gradient: string;      // tailwind gradient classes for the chip
  description: string;
  executiveSummary: string;
  diagramId?: string;    // matching architecture diagram ID in diagrams.ts
  relatedDiagramIds?: string[]; // additional related architecture diagram IDs
  conceptCategories: string[];    // exact match against data_concepts.json `category`
  questionCategories: string[];   // exact/partial match against questions.json `category` (uppercase)
  archKeywords: string[];         // partial match against data_architecture.json `category` (uppercase)
  deKeywords: string[];           // partial match against data_de.json `category` (uppercase)
  stages: {
    foundations: string;
    core: string;
    advanced: string;
    architect: string;
  };
}

export const GUIDED_DOMAINS = [
  "All Tracks",
  "Distributed Compute",
  "Lakehouse & Storage",
  "Pipelines & Orchestration",
  "Data Modeling & SQL",
  "Governance & Streaming",
] as const;

export const GUIDED_TOPICS: GuidedTopic[] = [
  {
    key: 'spark',
    label: 'Apache Spark',
    icon: '✨',
    domain: 'Distributed Compute',
    gradient: 'from-yellow-500 to-orange-500',
    description: 'Distributed memory topologies, Catalyst optimizer, AQE & execution runtimes',
    executiveSummary: 'Master Spark engine mechanics, Tungsten memory management, shuffle partitioning, Adaptive Query Execution (AQE), and vectorized C++ Photon execution for high-throughput batch and streaming workloads.',
    diagramId: 'spark-catalyst-photon-engine',
    relatedDiagramIds: ['spark-shuffle-memory-execution'],
    conceptCategories: ['SPARK & DATABRICKS'],
    questionCategories: ['SPARK & DATABRICKS', 'SPARK_PYSPARK'],
    archKeywords: ['PYSPARK', 'SPARK'],
    deKeywords: ['BIG DATA'],
    stages: {
      foundations: 'RDD vs DataFrame APIs, lazy evaluation, transformations vs actions, and basic cluster topology.',
      core: 'Catalyst logical/physical optimization plans, broadcast joins, partition sizing, and PySpark UDF pitfalls.',
      advanced: 'Adaptive Query Execution (AQE), dynamic shuffle partition coalescing, skew join remediation, and off-heap memory tuning.',
      architect: 'Tungsten cache-aware computation, Photon vectorization engine, multi-tenant cluster arbitration, and Petabyte-scale tuning.'
    }
  },
  {
    key: 'databricks',
    label: 'Databricks Lakehouse',
    icon: '⚡',
    domain: 'Lakehouse & Storage',
    gradient: 'from-orange-500 to-red-500',
    description: 'Unified Lakehouse, Delta Lake ACID, Unity Catalog & Delta Live Tables',
    executiveSummary: 'End-to-end Databricks platform architecture covering the 3-level namespace in Unity Catalog, declarative multi-hop DLT pipelines, Auto Loader cloud file notification, and Liquid Clustering performance.',
    diagramId: 'databricks-platform-master',
    relatedDiagramIds: ['databricks-medallion-pipeline', 'delta-live-tables-pipeline', 'delta-lake-under-the-hood'],
    conceptCategories: ['DATABRICKS', 'SPARK & DATABRICKS'],
    questionCategories: ['DATABRICKS', 'SPARK & DATABRICKS', 'SPARK_PYSPARK'],
    archKeywords: ['DATABRICKS', 'DELTA', 'PYSPARK', 'SPARK'],
    deKeywords: ['BIG DATA'],
    stages: {
      foundations: 'Workspace architecture, cluster runtimes, notebook workflows, and DBFS storage primitives.',
      core: 'Delta Lake ACID transaction log (_delta_log), Auto Loader directory listing vs file notification, and DLT expectations.',
      advanced: 'Liquid Clustering vs Z-Order, OPTIMIZE compaction strategies, Change Data Feed (CDF), and Photon performance acceleration.',
      architect: 'Centralized Unity Catalog governance, multi-workspace Delta Sharing, Databricks Asset Bundles (DABs), and FinOps cost governance.'
    }
  },
  {
    key: 'fabric',
    label: 'Microsoft Fabric',
    icon: '🧵',
    domain: 'Lakehouse & Storage',
    gradient: 'from-violet-500 to-purple-600',
    description: 'SaaS Lakehouse, OneLake universal storage, Direct Lake mode & multi-engine compute',
    executiveSummary: 'Design next-generation lakehouses on Microsoft Fabric: OneLake zero-copy shortcuts, universal Delta Parquet with V-Order, Synapse DW vs Lakehouse trade-offs, and Direct Lake memory mapping.',
    diagramId: 'fabric-onelake-architecture',
    relatedDiagramIds: ['powerbi-direct-lake-vertipaq'],
    conceptCategories: ['FABRIC'],
    questionCategories: ['FABRIC'],
    archKeywords: ['FABRIC'],
    deKeywords: [],
    stages: {
      foundations: 'Fabric SaaS tenant architecture, capacity units (SKUs), workspace domains, and OneLake fundamentals.',
      core: 'OneLake cross-cloud Shortcuts (S3/ADLS), Lakehouse Delta tables vs Warehouse T-SQL tables, and Data Factory pipelines.',
      advanced: 'Direct Lake VertiPaq memory mapping, V-Order sorting optimization, and fallback to DirectQuery troubleshooting.',
      architect: 'Enterprise multi-engine capacity budgeting, Purview sensitivity labeling, cross-tenant governance, and disaster recovery.'
    }
  },
  {
    key: 'airflow',
    label: 'Apache Airflow',
    icon: '🌊',
    domain: 'Pipelines & Orchestration',
    gradient: 'from-sky-500 to-cyan-500',
    description: 'Production DAG design, TaskFlow API, Celery/K8s executors & triggerers',
    executiveSummary: 'Engineer fault-tolerant orchestration DAGs using dynamic task mapping, deferrable operators with Triggerers, custom XCom object storage backends, and data-aware scheduling.',
    diagramId: 'apache-airflow-distributed-architecture',
    relatedDiagramIds: ['dbt-analytics-engineering-dag'],
    conceptCategories: ['APACHE AIRFLOW'],
    questionCategories: ['AIRFLOW', 'DAG'],
    archKeywords: ['AIRFLOW'],
    deKeywords: ['ETL', 'PIPELINE'],
    stages: {
      foundations: 'DAG parsing loop, operator vs sensor concepts, cron/dataset scheduling, and basic Airflow CLI/UI debugging.',
      core: 'TaskFlow API (@task, @dag), XCom serialization, Celery vs KubernetesExecutor worker architecture, and connection secrets.',
      advanced: 'Deferrable operators (asyncio Triggerer), dynamic task mapping (.expand()), SLA alerting, and custom failure callbacks.',
      architect: 'Astronomer/MWAA multi-team deployment topology, metadata DB connection pooling with PgBouncer, and Airflow 3 / DAG versioning.'
    }
  },
  {
    key: 'dbt',
    label: 'dbt (Data Build Tool)',
    icon: '🔧',
    domain: 'Pipelines & Orchestration',
    gradient: 'from-orange-400 to-amber-500',
    description: 'Modular SQL modeling, incremental processing, snapshots & Semantic Layer',
    executiveSummary: 'Build enterprise analytics engineering DAGs with dbt: incremental models (merge/append strategies), SCD Type 2 snapshots, custom Jinja macros, automated data testing, and dbt Mesh governance.',
    diagramId: 'dbt-analytics-engineering-dag',
    relatedDiagramIds: ['kimball-dimensional-star-schema'],
    conceptCategories: ['DBT'],
    questionCategories: ['DBT'],
    archKeywords: ['DBT'],
    deKeywords: [],
    stages: {
      foundations: 'dbt project structure, source freshness declarations, ref() dependency DAG, and basic model materializations.',
      core: 'Incremental models (merge vs append), unique_key handling, generic tests, and custom Jinja macros.',
      advanced: 'SCD Type 2 snapshots (timestamp vs check strategy), exposures, semantic metrics, and slim CI state-based running.',
      architect: 'dbt Mesh cross-project dependencies, contract enforcement (model contracts), semantic layer integrations, and enterprise deployment.'
    }
  },
  {
    key: 'adf',
    label: 'Azure Data Factory',
    icon: '🏭',
    domain: 'Pipelines & Orchestration',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Enterprise ELT pipelines, Self-Hosted IRs, tumbling windows & CDC',
    executiveSummary: 'Construct resilient cloud ingestion pipelines using Azure Data Factory: hybrid data movement with Self-Hosted Integration Runtimes (SHIR), tumbling window triggers for backfills, and delta CDC pipelines.',
    diagramId: 'adf-hybrid-integration-runtime',
    relatedDiagramIds: ['cdc-debezium-lakehouse-pipeline'],
    conceptCategories: ['ADF'],
    questionCategories: ['ADF'],
    archKeywords: ['ADF', 'DATA FACTORY'],
    deKeywords: ['ETL'],
    stages: {
      foundations: 'Pipelines, activities, datasets, linked services, and schedule triggers.',
      core: 'Parameterization, global parameters, lookup/foreach activity control flow, and managed identity authentication.',
      advanced: 'Self-Hosted IR clustering, high-availability data gateway topologies, REST API pagination, and delta CDC.',
      architect: 'Enterprise CI/CD with ARM/Bicep template overrides, cost optimization (Data Flows vs Spark compute), and zero-trust private endpoints.'
    }
  },
  {
    key: 'datalake',
    label: 'Data Lake & Medallion',
    icon: '🏗️',
    domain: 'Lakehouse & Storage',
    gradient: 'from-slate-500 to-zinc-600',
    description: 'Medallion architecture, open table formats (Delta, Iceberg), and data mesh',
    executiveSummary: 'Design resilient multi-hop lakehouses across Bronze (raw immutable append), Silver (cleansed, conformed CDC), and Gold (Kimball dimensional marts), comparing Delta Lake, Apache Iceberg, and Hudi.',
    diagramId: 'databricks-medallion-pipeline',
    relatedDiagramIds: ['apache-iceberg-open-table-format', 'delta-lake-under-the-hood'],
    conceptCategories: ['DATALAKE ARCHITECTURE', 'GENERAL DE'],
    questionCategories: ['DATALAKE ARCHITECTURE', 'LAKEHOUSE', 'CDC', 'INGESTION'],
    archKeywords: ['LAKEHOUSE', 'DATA MESH', 'MODELING', 'ARCHITECTURE', 'DATA VAULT'],
    deKeywords: ['DATA ENGINEERING', 'GOVERNANCE'],
    stages: {
      foundations: 'Object storage fundamentals (ADLS/S3), Parquet columnar layout, and raw zone landing patterns.',
      core: 'Medallion progression: Bronze schema validation, Silver deduplication/enrichment, Gold aggregation.',
      advanced: 'Open table format comparison (Delta Lake vs Apache Iceberg vs Apache Hudi), ACID isolation levels, and vacuum/compaction.',
      architect: 'Decentralized Data Mesh domain boundaries, data product contracts, cross-cloud lakehouse federation, and Disaster Recovery.'
    }
  },
  {
    key: 'modeling',
    label: 'Enterprise Data Modeling',
    icon: '📐',
    domain: 'Data Modeling & SQL',
    gradient: 'from-teal-500 to-emerald-600',
    description: 'Kimball dimensional modeling, Data Vault 2.0, SCD patterns & Star schemas',
    executiveSummary: 'Master dimensional modeling for modern data warehouses and lakehouses: grain declaration, conformed dimensions, Slowly Changing Dimensions (Types 1-6), and Data Vault 2.0 (Hubs, Links, Satellites).',
    diagramId: 'kimball-dimensional-star-schema',
    relatedDiagramIds: ['data-vault-enterprise-architecture', 'dbt-analytics-engineering-dag'],
    conceptCategories: ['DATALAKE ARCHITECTURE', 'GENERAL DE', 'DATABASE ARCHITECTURE'],
    questionCategories: ['DATALAKE ARCHITECTURE', 'MODERN DATABASE ARCHITECTURE'],
    archKeywords: ['ADVANCED DATA MODELING', 'MODELING', 'DATA VAULT', 'KIMBALL'],
    deKeywords: ['DATABASES & SQL'],
    stages: {
      foundations: 'Fact tables vs Dimension tables, declaring atomic grain, surrogate keys vs natural keys.',
      core: 'Slowly Changing Dimensions (SCD Type 1 overwrite vs Type 2 history tracking), role-playing dimensions, and junk dimensions.',
      advanced: 'Factless fact tables, accumulating snapshot fact tables, bridge tables for many-to-many relationships, and conformed bus architecture.',
      architect: 'Data Vault 2.0 methodology (Hubs, Links, Satellites with hash keys), hybrid Lakehouse-Kimball schemas, and semantic layer governance.'
    }
  },
  {
    key: 'sql',
    label: 'SQL Server & Distributed SQL',
    icon: '🗄️',
    domain: 'Data Modeling & SQL',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'T-SQL internals, query execution plans, columnstore indexing & MPP',
    executiveSummary: 'Deep-dive into SQL query optimization: reading execution plans, B-Tree vs Clustered Columnstore indexes, tempdb spill mitigation, window functions, and distributed MPP hash/round-robin distributions.',
    diagramId: 'sql-server-query-engine-optimization',
    relatedDiagramIds: ['kimball-dimensional-star-schema'],
    conceptCategories: ['SQL SERVER'],
    questionCategories: ['SQL SERVER'],
    archKeywords: ['SQL', 'MPP', 'MASSIVE PARALLEL PROCESSING'],
    deKeywords: ['DATABASES & SQL'],
    stages: {
      foundations: 'Relational algebra, SELECT processing phases, JOIN varieties (Nested Loops, Hash Match, Merge Join), and basic DDL/DML.',
      core: 'Execution plan analysis, index seek vs scan, parameter sniffing, transactions (ACID), and lock escalation.',
      advanced: 'Non-clustered Columnstore indexes, memory grant exhaustion, tempdb contention, and advanced analytical window framing.',
      architect: 'Distributed MPP table distribution (Hash vs Round-Robin vs Replicated), partition elimination, and distributed deadlock resolution.'
    }
  },
  {
    key: 'streaming',
    label: 'Real-Time Streaming & Kafka',
    icon: '⚡',
    domain: 'Governance & Streaming',
    gradient: 'from-amber-500 to-rose-600',
    description: 'Event-driven architectures, Kafka, Structured Streaming & low-latency CDC',
    executiveSummary: 'Design low-latency event processing architectures: Apache Kafka partition topologies, Spark Structured Streaming stateful watermarking, exactly-once processing guarantees, and Debezium CDC.',
    diagramId: 'kafka-event-streaming-pipeline',
    relatedDiagramIds: ['cdc-debezium-lakehouse-pipeline', 'delta-live-tables-pipeline'],
    conceptCategories: ['GENERAL DE'],
    questionCategories: ['KAFKA', 'FLINK', 'CDC'],
    archKeywords: ['REAL-TIME DATA STREAMING', 'STREAMING', 'KAFKA'],
    deKeywords: ['ETL & PIPELINES'],
    stages: {
      foundations: 'Event streaming primitives: topics, partitions, consumer groups, offset commits, and broker clusters.',
      core: 'Spark Structured Streaming micro-batching, checkpoint directory semantics, and streaming source/sink bindings.',
      advanced: 'Stateful stream-to-stream joins, event-time watermarking for late-arriving records, and consumer lag mitigation.',
      architect: 'Exactly-once delivery semantics (Idempotent producers + transactional outbox), Schema Registry governance, and multi-region replication.'
    }
  },
  {
    key: 'governance',
    label: 'Governance, Security & Quality',
    icon: '🛡️',
    domain: 'Governance & Streaming',
    gradient: 'from-indigo-500 to-purple-600',
    description: 'Unity Catalog, Purview, automated data lineage, data contracts & security',
    executiveSummary: 'Architect enterprise data trust and compliance: unified cataloging across Microsoft Purview and Databricks Unity Catalog, row/column-level security, Great Expectations quality gates, and data contracts.',
    diagramId: 'purview-governance-catalog',
    relatedDiagramIds: ['unity-catalog-governance'],
    conceptCategories: ['GENERAL DE', 'DATALAKE ARCHITECTURE'],
    questionCategories: ['GENERAL DE'],
    archKeywords: ['ENTERPRISE DATA GOVERNANCE', 'GOVERNANCE', 'SECURITY', 'PURVIEW'],
    deKeywords: ['GOVERNANCE & QUALITY'],
    stages: {
      foundations: 'Data cataloging principles, metadata tagging, business glossaries, and identity/access management (IAM/RBAC).',
      core: 'Automated data lineage capture, data profiling, Great Expectations test suites, and schema drift alerting.',
      advanced: 'Row-level filtering (RLS), column-level masking (CLS), dynamic data masking, and audit logging compliance.',
      architect: 'Producer-consumer data contracts (YAML/JSON Schema), zero-trust cross-cloud access delegation, and automated FinOps observability.'
    }
  },
  {
    key: 'powerbi',
    label: 'Power BI & Semantic Layer',
    icon: '📊',
    domain: 'Data Modeling & SQL',
    gradient: 'from-yellow-400 to-amber-500',
    description: 'Enterprise DAX, VertiPaq in-memory compression & Direct Lake modeling',
    executiveSummary: 'Engineer high-performance enterprise BI models: VertiPaq dictionary/run-length encoding, Direct Lake memory mapping over Delta Parquet, Star Schema relationship optimization, and advanced DAX.',
    diagramId: 'powerbi-direct-lake-vertipaq',
    relatedDiagramIds: ['powerbi-dax-engine-context'],
    conceptCategories: ['POWER BI'],
    questionCategories: ['POWER BI'],
    archKeywords: ['POWER BI', 'POWER PLATFORM'],
    deKeywords: ['DATA VISUALIZATION'],
    stages: {
      foundations: 'Power BI service workspace tenant architecture, semantic model vs report concepts, and basic DAX calculated columns vs measures.',
      core: 'Star Schema relationship design (1-to-many, single direction), Context Transition, CALCULATE(), and VertiPaq storage modes.',
      advanced: 'VertiPaq compression mechanics (dictionary, bit-packing, RLE), query plan server timings, and memory footprint reduction.',
      architect: 'Direct Lake mode deployment over OneLake, ALM Toolkit CI/CD deployment pipelines, Incremental Refresh, and multi-tenant row security.'
    }
  },
];
