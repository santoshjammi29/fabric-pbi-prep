import { Concept, Difficulty } from "@/types/data";

export interface ConceptSubtopicPillar {
  id: string;
  title: string;
  description: string;
  match: string[];
  concepts: Concept[];
}

export interface ConceptTopicPillar {
  id: string;
  categoryKey: string;
  title: string;
  shortTitle: string;
  icon: string;
  badgeColor: string;
  colorHex: string;
  description: string;
  subtopics: ConceptSubtopicPillar[];
  totalCount: number;
}

export const TOPIC_PILLARS_CONFIG: Array<{
  id: string;
  categoryKey: string;
  title: string;
  shortTitle: string;
  icon: string;
  badgeColor: string;
  colorHex: string;
  description: string;
  subtopics: Array<{
    id: string;
    title: string;
    description: string;
    match: string[];
  }>;
}> = [
  {
    id: "fabric",
    categoryKey: "FABRIC",
    title: "Microsoft Fabric",
    shortTitle: "Fabric",
    icon: "fabric",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    colorHex: "#3b82f6",
    description: "SaaS Lakehouse platform unifying OneLake storage, Fabric Capacities, and Direct Lake semantic serving.",
    subtopics: [
      {
        id: "fab-storage",
        title: "OneLake & ADLS Storage Substrate",
        description: "Unified logical data lake, cross-cloud shortcuts, and V-Order Delta Parquet serialization.",
        match: ["onelake", "shortcut", "lakehouse", "adls", "v-order", "file", "storage", "delta parquet"],
      },
      {
        id: "fab-compute",
        title: "Compute Engines & Data Warehousing",
        description: "Fabric capacity smoothing, F-SKU sizing, T-SQL Synapse Warehouses, and Spark runtimes.",
        match: ["capacity", "sku", "warehouse", "spark", "pipeline", "dataflow", "notebook", "mirroring", "f64"],
      },
      {
        id: "fab-serving",
        title: "Direct Lake Mode & Semantic Models",
        description: "Direct memory framing from OneLake Delta Parquet into VertiPaq memory without data copying.",
        match: ["direct lake", "power bi", "semantic", "framing", "vertipaq", "report"],
      },
      {
        id: "fab-governance",
        title: "Unified Governance & Purview Integration",
        description: "Workspace role-based access, Microsoft Purview sensitivity labels, and cross-workspace sharing.",
        match: ["workspace", "purview", "role", "security", "sensitivity", "tenant"],
      },
    ],
  },
  {
    id: "spark-core",
    categoryKey: "SPARK & DATABRICKS",
    title: "Apache Spark Core Engine",
    shortTitle: "Spark Core",
    icon: "spark",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    colorHex: "#f97316",
    description: "Distributed memory-centric compute engine, Catalyst optimizer, AQE, and Tungsten execution.",
    subtopics: [
      {
        id: "spark-core-runtime",
        title: "Distributed Core, JVM & Memory Management",
        description: "Driver vs executor topology, RDD lazy evaluation, off-heap memory, and garbage collection.",
        match: ["session", "rdd", "dataframe", "lazy", "tungsten", "jvm", "off-heap", "executor", "driver"],
      },
      {
        id: "spark-catalyst-aqe",
        title: "Catalyst Optimizer, Logical Plans & AQE",
        description: "Expression resolution, logical/physical optimization plans, and Adaptive Query Execution runtime re-planning.",
        match: ["catalyst", "aqe", "adaptive", "logical plan", "physical plan", "cost-based", "rule", "code generation"],
      },
      {
        id: "spark-shuffle-skew",
        title: "Shuffle Mechanics, Partitioning & Skew Handling",
        description: "Hash vs sort shuffles, disk spilling, key salting, broadcast joins, and partition coalescing.",
        match: ["shuffle", "skew", "salt", "spill", "broadcast", "partition", "coalesce", "repartition"],
      },
      {
        id: "spark-streaming-engine",
        title: "Structured Streaming, Watermarking & State",
        description: "Continuous processing, event-time watermarking, stateful aggregations, and RocksDB state store.",
        match: ["streaming", "watermark", "checkpoint", "micro-batch", "trigger", "stateful"],
      },
    ],
  },
  {
    id: "databricks-lakehouse",
    categoryKey: "DATABRICKS",
    title: "Databricks Lakehouse",
    shortTitle: "Databricks",
    icon: "databricks",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
    colorHex: "#ef4444",
    description: "Enterprise Lakehouse platform, Photon native C++ engine, Delta Live Tables, and Unity Catalog.",
    subtopics: [
      {
        id: "dbx-platform-runtimes",
        title: "Workspace & Distributed Compute Runtime",
        description: "All-Purpose vs Job clusters, Photon vectorized execution, serverless compute, and DBFS storage.",
        match: ["workspace", "cluster", "dbfs", "runtime", "single node", "photon", "serverless"],
      },
      {
        id: "dbx-delta-engine",
        title: "Delta Lake ACID Engine & File Compaction",
        description: "_delta_log transaction protocol, multi-version concurrency (MVCC), OPTIMIZE, Z-Order, and Liquid Clustering.",
        match: ["delta", "transaction", "log", "acid", "time travel", "vacuum", "optimize", "z-order", "liquid"],
      },
      {
        id: "dbx-dlt-pipelines",
        title: "Delta Live Tables (DLT) & Ingestion",
        description: "Declarative ETL pipelines, Auto Loader cloudFiles schema evolution, and expectations data quality rules.",
        match: ["dlt", "live table", "expectation", "autoloader", "cloudfiles", "streaming live"],
      },
      {
        id: "dbx-unity-governance",
        title: "Unity Catalog & Centralized Governance",
        description: "3-level namespace (catalog.schema.table), centralized ACLs, automated column-level lineage, and Delta Sharing.",
        match: ["unity catalog", "metastore", "catalog", "schema", "privilege", "lineage", "delta sharing", "clean room"],
      },
    ],
  },
  {
    id: "datalake-storage",
    categoryKey: "DATALAKE ARCHITECTURE",
    title: "Storage & Open Table Formats",
    shortTitle: "Lakehouse Storage",
    icon: "datalake",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    colorHex: "#06b6d4",
    description: "Open table format specifications (Delta, Iceberg, Hudi), columnar file layouts, and layout optimization.",
    subtopics: [
      {
        id: "lake-open-formats",
        title: "Open Table Formats (Delta / Iceberg / Hudi)",
        description: "Snapshot trees, metadata manifests, ACID isolation guarantees, and copy-on-write vs merge-on-read trade-offs.",
        match: ["delta", "iceberg", "hudi", "manifest", "snapshot", "metadata", "time travel"],
      },
      {
        id: "lake-columnar-files",
        title: "Columnar Storage Formats & Compression",
        description: "Parquet page headers, dictionary encoding, run-length encoding (RLE), Snappy vs ZSTD compression codecs.",
        match: ["parquet", "orc", "avro", "columnar", "row-based", "snappy", "zstd", "dictionary"],
      },
      {
        id: "lake-layout-opt",
        title: "Layout Optimization, Partitioning & Clustering",
        description: "Mitigating small-file problems, Hilbert curve Z-Ordering, bin-packing, and dynamic partition pruning.",
        match: ["partition", "clustering", "compaction", "small file", "bin-packing", "z-order"],
      },
    ],
  },
  {
    id: "power-bi-analytics",
    categoryKey: "POWER BI",
    title: "Power BI & DAX Analytics",
    shortTitle: "Power BI",
    icon: "powerbi",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    colorHex: "#f59e0b",
    description: "Enterprise semantic models, VertiPaq columnar memory engine, DAX formula evaluation, and star schemas.",
    subtopics: [
      {
        id: "pbi-storage-modes",
        title: "Storage Modes & VertiPaq Engine",
        description: "In-memory Import mode, real-time DirectQuery, Direct Lake zero-copy mode, and composite dual partitions.",
        match: ["import", "directquery", "direct lake", "dual", "composite", "incremental"],
      },
      {
        id: "pbi-dax-evaluation",
        title: "DAX Formula Engine & Context Transitions",
        description: "Row context, filter context modification via CALCULATE(), context transition mechanics, and iterator performance.",
        match: ["calculate", "filter context", "row context", "context transition", "iterator", "dax", "time intelligence"],
      },
      {
        id: "pbi-modeling-sec",
        title: "Star Schema Modeling & Security (RLS/OLS)",
        description: "1-to-many relationship cardinality, bi-directional filter pitfalls, Row-Level Security, and Object-Level Security.",
        match: ["star schema", "rls", "ols", "relationship", "bi-directional", "cardinality"],
      },
    ],
  },
  {
    id: "airflow-orchestration",
    categoryKey: "APACHE AIRFLOW",
    title: "Apache Airflow Orchestration",
    shortTitle: "Airflow",
    icon: "airflow",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    colorHex: "#14b8a6",
    description: "Programmatic workflow orchestration, distributed task execution, asynchronous triggers, and DAG state management.",
    subtopics: [
      {
        id: "air-dag-topology",
        title: "DAG Topology, Operators & Sensors",
        description: "Directed Acyclic Graph dependencies, task lifecycle, Smart Sensors, Deferrable Operators, and dynamic task mapping.",
        match: ["dag", "operator", "sensor", "hook", "task", "dynamic", "triggerer", "deferrable"],
      },
      {
        id: "air-runtime-executors",
        title: "Scheduler, Executors & Worker Architecture",
        description: "CeleryExecutor worker queues, KubernetesExecutor ephemeral pods, scheduler heartbeat, and pool slot allocation.",
        match: ["scheduler", "worker", "celery", "kubernetes", "local", "executor", "queue", "heartbeat"],
      },
      {
        id: "air-state-metadata",
        title: "XComs, Variables & Connections State",
        description: "Metadata database backend, cross-task communication (XComs), custom XCom backends (S3/ADLS), and connection secrets.",
        match: ["xcom", "variable", "connection", "lineage", "sla", "metadata db", "pool"],
      },
    ],
  },
  {
    id: "adf-pipelines",
    categoryKey: "ADF",
    title: "Azure Data Factory",
    shortTitle: "ADF",
    icon: "adf",
    badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    colorHex: "#0284c7",
    description: "Cloud-native ETL/ELT service, hybrid Integration Runtimes, parameter-driven pipelines, and mapping data flows.",
    subtopics: [
      {
        id: "adf-pipeline-control",
        title: "Pipelines, Triggers & Orchestration Control",
        description: "Schedule vs Tumbling Window triggers, pipeline parameters, variables, ForEach loops, and conditional execution.",
        match: ["pipeline", "trigger", "activity", "tumbling", "parameter", "variable", "lookup", "foreach"],
      },
      {
        id: "adf-ir-networking",
        title: "Self-Hosted & Azure Integration Runtimes",
        description: "SHIR on-premises secure gateways, high-availability node clusters, credential management, and Managed Virtual Networks.",
        match: ["integration runtime", "shir", "azure ir", "gateway", "network", "managed vnet"],
      },
      {
        id: "adf-dataflows-connect",
        title: "Mapping Data Flows & Cloud Connectors",
        description: "Spark-powered visual data transformations, linked service connections, CDC connectors, and schema drift handling.",
        match: ["mapping data flow", "linked service", "dataset", "source", "sink", "transformation"],
      },
    ],
  },
  {
    id: "dbt-transformation",
    categoryKey: "DBT",
    title: "dbt (Data Build Tool)",
    shortTitle: "dbt",
    icon: "dbt",
    badgeColor: "bg-orange-600/10 text-orange-500 border-orange-600/20",
    colorHex: "#ea580c",
    description: "Analytics engineering standard for modular SQL transformations, automated data testing, and DAG lineage.",
    subtopics: [
      {
        id: "dbt-models-materialize",
        title: "SQL Models & Materialization Strategies",
        description: "Views vs Tables vs Incremental materializations (merge, append, delete+insert) and Ephemeral CTE inlining.",
        match: ["model", "materialization", "table", "view", "incremental", "ephemeral"],
      },
      {
        id: "dbt-dag-lineage",
        title: "Lineage Graph, Macros & Semantic Layer",
        description: "ref() and source() dependency resolution, Jinja macros, slowly changing dimensions (Snapshots), and dbt Mesh.",
        match: ["ref", "source", "macro", "jinja", "snapshot", "seed", "semantic layer", "mesh"],
      },
      {
        id: "dbt-quality-contracts",
        title: "Automated Data Testing & Contracts",
        description: "Generic tests (unique, not_null, accepted_values, relationships), singular tests, and dbt model contracts.",
        match: ["test", "generic", "singular", "contract", "docs", "freshness", "expectation"],
      },
    ],
  },
  {
    id: "sql-server-engine",
    categoryKey: "SQL SERVER",
    title: "SQL Server & Relational Engine",
    shortTitle: "SQL Server",
    icon: "sql",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    colorHex: "#6366f1",
    description: "Relational database mechanics, B-tree indexes, Columnstores, Cost-Based Query Optimizer, and ACID concurrency.",
    subtopics: [
      {
        id: "sql-indexes-storage",
        title: "Indexing Engine, B-Trees & Columnstores",
        description: "Clustered vs Non-Clustered B-tree leaf pages, covering indexes, Columnstore segment elimination, and fragmentation.",
        match: ["clustered", "non-clustered", "columnstore", "index", "b-tree", "heap", "fragmentation"],
      },
      {
        id: "sql-opt-execution",
        title: "Query Optimizer, Statistics & Execution Plans",
        description: "Cardinality estimation, statistics histogram buckets, parameter sniffing, and adaptive joins.",
        match: ["optimizer", "plan", "cardinality", "statistics", "cost", "compilation", "parameter sniffing"],
      },
      {
        id: "sql-acid-locks",
        title: "Transactions, Lock Escalation & Isolation",
        description: "Pessimistic locking (Read Committed, Serializable) vs Optimistic Snapshot Isolation (RCSI) and deadlock resolution.",
        match: ["transaction", "isolation", "lock", "latch", "deadlock", "mvcc", "snapshot", "acid"],
      },
      {
        id: "sql-ha-recovery",
        title: "Always On Availability Groups & Replication",
        description: "Synchronous vs asynchronous replica commits, automatic failover, readable secondaries, and log shipping.",
        match: ["always on", "availability group", "failover", "replication", "log shipping", "cdc"],
      },
    ],
  },
  {
    id: "database-distributed",
    categoryKey: "DATABASE ARCHITECTURE",
    title: "Distributed Database Systems",
    shortTitle: "Distributed DBs",
    icon: "database",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    colorHex: "#a855f7",
    description: "Horizontal sharding topologies, distributed consensus protocols, LSM write engines, and serializable isolation.",
    subtopics: [
      {
        id: "db-sharding-vitess",
        title: "Vitess & Declarative Sharding Topologies",
        description: "VSchema routing, hash keyspace partitioning, live zero-downtime re-sharding, and query scatter-gather.",
        match: ["shard", "vitess", "vschema", "keyspace", "re-shard", "hash ring"],
      },
      {
        id: "db-consensus-quorums",
        title: "Raft, Paxos & Consensus Quorums",
        description: "Leader election, replicated state machine write logs, quorum calculation (N/2 + 1), and split-brain prevention.",
        match: ["consensus", "raft", "paxos", "quorum", "replication", "leader", "follower", "witness"],
      },
      {
        id: "db-lsm-storage",
        title: "LSM-Trees, WAL & In-Memory Storage Engines",
        description: "MemTable in-memory buffers, Write-Ahead Logs (WAL), immutable SSTables, and Leveled vs Size-Tiered compaction.",
        match: ["lsm", "b-tree", "wal", "write-ahead", "buffer pool", "page cache", "compaction", "sstable"],
      },
      {
        id: "db-isolation-concurrency",
        title: "Serializable Snapshot Isolation & Concurrency",
        description: "Multi-Version Concurrency Control (MVCC), write skew detection, linearizability, and admission control backpressure.",
        match: ["isolation", "snapshot", "mvcc", "serializable", "linearizability", "backpressure", "admission"],
      },
    ],
  },
  {
    id: "system-design-patterns",
    categoryKey: "SYSTEM DESIGN",
    title: "System Design & Resilience",
    shortTitle: "System Design",
    icon: "system",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    colorHex: "#10b981",
    description: "Enterprise distributed systems architecture, resilience fault tolerance patterns, caching, and scalability.",
    subtopics: [
      {
        id: "sys-theorems-tradeoffs",
        title: "Distributed Theorems (CAP, PACELC & BASE)",
        description: "Consistency vs Availability during network partitions, PACELC latency trade-offs, and eventual consistency.",
        match: ["cap", "pacelc", "acid", "base", "consistency", "availability", "partition tolerance"],
      },
      {
        id: "sys-resilience-patterns",
        title: "Resilience Patterns (Circuit Breaker, SAGA, Outbox)",
        description: "Circuit breaker failure tripping, SAGA compensating transactions, Transactional Outbox, and rate limiting.",
        match: ["circuit breaker", "saga", "outbox", "retry", "bulkhead", "rate limit", "exponential backoff"],
      },
      {
        id: "sys-scale-caching",
        title: "Scalability, Caching & Event Messaging",
        description: "Cache-aside strategies, cache stampede prevention (mutex locks), consistent hashing rings, and event-driven pub/sub.",
        match: ["cache", "cache-aside", "write-through", "thundering herd", "consistent hashing", "queue", "pub/sub"],
      },
    ],
  },
  {
    id: "general-de-architecture",
    categoryKey: "GENERAL DE",
    title: "Data Engineering Architecture",
    shortTitle: "DE Architecture",
    icon: "architecture",
    badgeColor: "bg-slate-500/10 text-slate-300 border-slate-500/20",
    colorHex: "#64748b",
    description: "Kimball dimensional modeling, modern lakehouse design patterns, idempotency, and data observability.",
    subtopics: [
      {
        id: "gde-dimensional-modeling",
        title: "Kimball Dimensional Modeling & Schemas",
        description: "Fact table granularity, Conformed Dimensions, Slowly Changing Dimensions (SCD Type 1/2/3), and surrogate keys.",
        match: ["star schema", "snowflake schema", "fact", "dimension", "scd", "slowly changing", "kimball", "inmon"],
      },
      {
        id: "gde-architectural-paradigms",
        title: "Architectural Paradigms (Mesh, Lakehouse, Lambda)",
        description: "Decentralized Data Mesh domain ownership, Data Contracts, Lambda vs Kappa streaming pipelines, and idempotency.",
        match: ["mesh", "product", "contract", "medallion", "lambda", "kappa", "etl", "elt", "idempotency"],
      },
      {
        id: "gde-observability-governance",
        title: "Data Quality, Observability & Lineage",
        description: "End-to-end data lineage tracking, schema drift detection, anomaly detection, SLA alerting, and log-based CDC.",
        match: ["lineage", "catalog", "quality", "observability", "drift", "anomaly", "sla", "cdc"],
      },
    ],
  },
  {
    id: "python-data-eng",
    categoryKey: "PYTHON",
    title: "Python Data Engineering",
    shortTitle: "Python",
    icon: "python",
    badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    colorHex: "#eab308",
    description: "High-performance Python for data platforms, memory-efficient generators, Polars vectorized operations, and Arrow IPC.",
    subtopics: [
      {
        id: "py-memory-concurrency",
        title: "Memory Efficiency, Concurrency & AsyncIO",
        description: "Generator pipelines avoiding OOM, Global Interpreter Lock (GIL) mechanics, asyncio event loops, and multiprocessing pools.",
        match: ["generator", "iterator", "concurrency", "asyncio", "multiprocessing", "thread", "gil", "memory"],
      },
      {
        id: "py-arrow-polars",
        title: "Vectorization, Polars, Arrow & Typing Contracts",
        description: "Rust-powered Polars query expressions, Apache Arrow zero-copy memory buffers, and Pydantic strict schema contracts.",
        match: ["vector", "polars", "arrow", "pandas", "typing", "type hint", "pydantic", "context manager", "decorator"],
      },
    ],
  },
];

/**
 * Builds the complete 4-level stretch tree mapping 100% of given concepts into topics and subtopics.
 */
export function buildConceptsMultiLevelTree(concepts: Concept[]): ConceptTopicPillar[] {
  return TOPIC_PILLARS_CONFIG.map((topicCfg) => {
    const topicConcepts = concepts.filter((c) => c.category === topicCfg.categoryKey);

    const subtopics: ConceptSubtopicPillar[] = topicCfg.subtopics.map((sub) => ({
      id: sub.id,
      title: sub.title,
      description: sub.description,
      match: sub.match,
      concepts: [],
    }));

    topicConcepts.forEach((concept) => {
      const text = `${concept.term} ${concept.definition} ${concept.explanation}`.toLowerCase();
      let assigned = false;
      for (let i = 0; i < subtopics.length; i++) {
        if (subtopics[i].match.some((keyword) => text.includes(keyword))) {
          subtopics[i].concepts.push(concept);
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        // Fall back to the first subtopic
        subtopics[0].concepts.push(concept);
      }
    });

    return {
      id: topicCfg.id,
      categoryKey: topicCfg.categoryKey,
      title: topicCfg.title,
      shortTitle: topicCfg.shortTitle,
      icon: topicCfg.icon,
      badgeColor: topicCfg.badgeColor,
      colorHex: topicCfg.colorHex,
      description: topicCfg.description,
      subtopics,
      totalCount: topicConcepts.length,
    };
  });
}
