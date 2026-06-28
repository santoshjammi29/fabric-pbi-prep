#!/usr/bin/env python3
import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_PATH = os.path.join(PROJECT_ROOT, "data_architecture.js")

TOPICS = [
    {
        "id": "pyspark-optimization",
        "name": "Advanced PySpark & Spark Core Optimization",
        "subjects": [
            "Broadcast Hash Joins", "Adaptive Query Execution (AQE)", "Salting Skewed Keys", 
            "Custom Accumulator Logging", "Kryo Serialization Tuning", "Dynamic Partition Pruning (DPP)", 
            "JVM Garbage Collection Settings", "PySpark UDF Vectorization", "Cache and Persist storage levels", 
            "Shuffle Partition adjustment"
        ],
        "scenarios": [
            "e-commerce clickstream events aggregation", "real-time credit card fraud checking", 
            "nightly batch billing consolidation", "multi-tenant SaaS logs indexing", 
            "historical supply chain simulation", "sensor telemetry anomaly detection",
            "global logistics distribution routes calculation", "ad-tech impression matching"
        ],
        "objectives": [
            "eliminating executor OutOfMemory (OOM) errors", "minimizing cross-node data shuffling", 
            "reducing stage execution latency by 40%", "maximizing cluster CPU utilization", 
            "optimizing storage disk footprint", "preventing garbage collection thrashing"
        ]
    },
    {
        "id": "databricks-lakehouse",
        "name": "Databricks Lakehouse Mastery (Delta Lake, Delta Live Tables)",
        "subjects": [
            "Liquid Clustering layouts", "Delta Live Tables (DLT) expectations", "Change Data Feed (CDF) logging", 
            "Z-Order indexing columns", "Time Travel transaction history", "Vacuum and Optimization routines", 
            "Delta table schema evolution", "Identity column isolation", "Shallow and Deep cloning",
            "Delta sharing open protocol"
        ],
        "scenarios": [
            "financial transaction reconciliation", "customer 360 gold table merges", 
            "live telemetry streaming ingestion", "HIPAA compliant healthcare records storage", 
            "global product inventory tracking", "marketing email campaign metrics aggregation",
            "cross-region analytics sharing", "telecom subscriber network logs ingest"
        ],
        "objectives": [
            "guaranteeing ACID transaction isolation", "optimizing small files write times", 
            "enforcing high-severity data quality constraints", "supporting compliance audits and GDPR deletes", 
            "reducing storage read latencies", "preventing write conflict anomalies"
        ]
    },
    {
        "id": "python-data-architecture",
        "name": "Python for Data Architecture",
        "subjects": [
            "Asynchronous event loops (asyncio)", "Multiprocessing memory isolation", "Pydantic data validation schemas", 
            "Custom memory-mapped file buffers", "Generator-based streaming ingestion", "PyArrow parquet file serialization", 
            "Thread-pool executor tasks", "Retry decorators with exponential backoff", "Memory profiling using tracemalloc",
            "Custom iterator pipelines"
        ],
        "scenarios": [
            "REST API high-concurrency ingestion", "local processing of 50GB CSV archives", 
            "scraping live stock exchange feeds", "multi-threaded database connector pools", 
            "custom file format parsers", "IoT gateway message broker integration",
            "high-throughput image metadata extraction", "on-premise to cloud storage uploaders"
        ],
        "objectives": [
            "minimizing process memory footprints", "avoiding GIL bottlenecks during CPU bounds", 
            "enforcing strict data type compliance", "preventing server rate limit blocks", 
            "maximizing CPU utilization on multi-core hosts", "handling network latency spikes"
        ]
    },
    {
        "id": "modern-architecture",
        "name": "Modern Architecture Paradigms (Lakehouse, Data Mesh, Data Products)",
        "subjects": [
            "Decentralized domain ownership data contracts", "Federated computational governance models", 
            "OneLake shortcut linkages", "Domain-driven micro-lakehouse topologies", "Analytical data product APIs", 
            "Centralized metadata marketplace registries", "Cross-domain ledger security boundaries", 
            "Automated lineage tracing logs", "SaaS data sharing platforms", "Mesh catalog mapping rules"
        ],
        "scenarios": [
            "global merger of two retail chains", "independent marketing and finance data domains", 
            "regulatory risk audit reporting", "multi-tenant analytics product portals", 
            "real-time manufacturing parts inventory mesh", "centralized enterprise catalog registration",
            "global telemetry analysis federation", "cross-departmental billing reports consolidation"
        ],
        "objectives": [
            "enforcing strict data sovereignty requirements", "decoupling central IT bottlenecks", 
            "accelerating domain self-service onboarding", "minimizing cross-domain query latency", 
            "guaranteeing product-level SLA compliance", "preventing data quality degradation"
        ]
    },
    {
        "id": "advanced-data-modeling",
        "name": "Advanced Data Modeling (Kimball Dimensional Modeling, Data Vault 2.0)",
        "subjects": [
            "Data Vault 2.0 Hubs, Links, and Satellites", "SCD Type 2 history tracking", 
            "Bridge tables for many-to-many groups", "Conformed enterprise dimensions", 
            "Non-additive and semi-additive facts", "Data Vault point-in-time tables", 
            "Junk and degenerate dimensions", "Multi-active satellite tables", "Factless fact tables",
            "Outrigger tables mapping"
        ],
        "scenarios": [
            "patient healthcare treatment tracking", "multi-currency banking transaction ledgers", 
            "global employee timesheet databases", "hotel bookings and loyalty reward systems", 
            "telecom subscriber usage summaries", "ERP system supply chain events tracking",
            "e-commerce returns and refund tracing", "multi-region franchise revenue auditing"
        ],
        "objectives": [
            "supporting rapid schema alterations without rebuilds", "guaranteeing auditability of structural changes", 
            "optimizing dimensional join query speeds", "enforcing conformed reporting schemas", 
            "minimizing transaction processing latency", "simplifying logical mapping paths"
        ]
    },
    {
        "id": "storage-compute-tiering",
        "name": "Storage & Compute Tiering Strategies",
        "subjects": [
            "Hot/cool/archive storage tier migration", "Multi-sku compute auto-scaling clusters", 
            "Ephemeral local SSD scratch space", "External table partition metadata sync", 
            "Object lifecycle pruning rules", "Cold data compression optimization", 
            "On-demand serverless SQL pools scaling", "Cross-region storage replication bandwidth",
            "Intelligent storage tier tiering", "Pre-warmed compute resource pools"
        ],
        "scenarios": [
            "regulatory financial reports archiving", "volatile seasonal retail demand tracking", 
            "genomics laboratory raw sequence staging", "high-volume security event logs retention", 
            "global distribution of assets media", "predictive maintenance batch training runs",
            "historical clickstream database archiving", "multi-year IoT history retrieval"
        ],
        "objectives": [
            "reducing cloud storage expenditures by 50%", "eliminating idle compute capacity bills", 
            "maximizing file read throughput times", "guaranteeing high availability SLAs", 
            "preventing network transfer bottlenecks", "satisfying audit compliance windows"
        ]
    },
    {
        "id": "realtime-streaming",
        "name": "Real-Time Data Streaming (Azure Event Hubs, Apache Kafka, Azure Stream Analytics)",
        "subjects": [
            "Kafka consumer partition offset committing", "Event time vs processing time watermarks", 
            "Stream Analytics sliding window aggregates", "Kafka producer idempotency settings", 
            "Event Hubs capture file layouts", "Dead-letter-queue (DLQ) poison routing", 
            "Stream backpressure flow throttle", "Exactly-once end-to-end transactions",
            "Kafka Connect schema integrations", "Avro schema registry mapping"
        ],
        "scenarios": [
            "urban traffic control sensor networks", "live sports betting odds calculation", 
            "real-time online server diagnostics telemetry", "payment processing fraud alerts engine", 
            "connected vehicles geo-tracking feeds", "critical hospital monitors streaming",
            "smart grid electric consumption tracking", "automated logistics warehouse movements"
        ],
        "objectives": [
            "reducing stream delivery latency below 50ms", "preventing consumer offset lag accumulation", 
            "guaranteeing zero data loss on broker failure", "filtering and routing out-of-order logs", 
            "handling abrupt spike patterns in throughput", "minimizing network message payload size"
        ]
    },
    {
        "id": "mpp-multimodel-db",
        "name": "Massive Parallel Processing (MPP) & Multi-Model Databases (Dedicated SQL pools, Azure Cosmos DB)",
        "subjects": [
            "Cosmos DB partition key design", "Dedicated SQL pool hash distribution keys", 
            "Cosmos DB change feed consumers", "Replicated tables and materialized views", 
            "Multi-master database write replication", "Dedicated SQL pools columnstore indexes", 
            "Request unit (RU) auto-scale throttling", "Polybase external table parallel loads",
            "Dedicated SQL pools hash-join optimizations", "Cosmos DB multi-region latency tuning"
        ],
        "scenarios": [
            "global gaming leaderboards updates", "high-concurrency e-commerce shopping carts", 
            "enterprise data warehouse migrations", "real-time logistics route optimizations", 
            "corporate accounting ledger aggregations", "multi-tenant SaaS profile storage",
            "global fleet vehicle location tracking", "high-volume airline reservation systems"
        ],
        "objectives": [
            "eliminating partition skew and hot spots", "keeping Dedicated SQL query execution quick", 
            "supporting horizontal scale-out of transactional writes", "minimizing database request unit (RU) costs", 
            "accelerating mass loading operations", "enforcing local region read compliance"
        ]
    },
    {
        "id": "power-platform-governance",
        "name": "Enterprise Power Platform Integration & Governance",
        "subjects": [
            "Data Loss Prevention (DLP) environment policies", "Power Automate custom connector gateways", 
            "Dataverse virtual tables mapping", "Managed solutions deployment environments", 
            "Tenant-level analytics dashboard reports", "Power Apps component framework (PCF) widgets", 
            "API limit monitoring alerts", "On-premises data gateway configurations",
            "Power Apps Canvas offline synchronization", "Center of Excellence (CoE) Starter Kit auditing"
        ],
        "scenarios": [
            "automated expense approval flows", "frontline employee field diagnostics apps", 
            "corporate audit log collection systems", "external customer portal integrations", 
            "multi-department equipment inventory logs", "hybrid cloud database sync pipelines",
            "departmental customer support portals", "real-time warehouse scanner integrations"
        ],
        "objectives": [
            "preventing unauthorized data exfiltration leaks", "guaranteeing zero downtime during release cycles", 
            "minimizing API requests consumption overhead", "securing legacy on-premise system databases", 
            "automating enterprise environment provisioning", "monitoring shadow IT deployment footprints"
        ]
    },
    {
        "id": "llm-rag-pipelines",
        "name": "LLM & RAG Infrastructure Pipelines",
        "subjects": [
            "Embedding chunk overlapping policies", "Document parsing document extraction filters", 
            "Hybrid dense-sparse retrieval queries", "Re-ranking model pipeline configurations", 
            "Semantic query cache layers", "Metadata filtering key injection", 
            "Conversational memory persistence stores", "Asynchronous LLM API call batches",
            "Vector database partition filters", "Context summary windowing strategies"
        ],
        "scenarios": [
            "internal corporate knowledge base assistants", "automated legal contract compliance reviews", 
            "customer support ticket triage routing", "medical research publication indexing", 
            "financial analysis report summarization", "multi-language documentation bots",
            "patent filing duplicate detection systems", "HR policy retrieval conversational search"
        ],
        "objectives": [
            "minimizing LLM generation hallucinations", "reducing retrieval latency below 200ms", 
            "preserving user-level data security permissions", "minimizing model token utilization costs", 
            "handling dynamic changes to source files", "guaranteeing multi-lingual context coherence"
        ]
    },
    {
        "id": "vector-databases",
        "name": "Vector Databases (Pinecone, Milvus)",
        "subjects": [
            "HNSW index graph link parameters", "IVF-PQ vector quantization codes", 
            "Metadata index partitioning strategies", "Cosine vs dot-product metric filters", 
            "Dynamic index segment compaction", "Vector data shard replica management", 
            "Real-time upsert and query pipelines", "Bulk-loading vector index dumps",
            "Filtered search index caches", "Milvus collection partition splits"
        ],
        "scenarios": [
            "image similarity search systems", "recommendation engine profile matching", 
            "duplicate record deduplication engines", "large scale document search archives", 
            "genomic sequence pattern match systems", "personalized shopping item embeddings",
            "voice biomarker diagnostics matchers", "reverse image e-commerce matchers"
        ],
        "objectives": [
            "maximizing search recall accuracy scores", "reducing index RAM consumption by 60%", 
            "keeping query response latencies under 15ms", "supporting high-frequency vector updates", 
            "minimizing storage read-write charges", "ensuring zero search downtime during reindexing"
        ]
    },
    {
        "id": "ai-orchestration",
        "name": "AI Orchestration Frameworks (LangGraph, LangChain)",
        "subjects": [
            "LangGraph state graph loops", "Agentic tool routing branches", 
            "LangChain memory buffer persistence", "Runnable sequence chaining pipelines", 
            "Model fallback routing strategies", "Agent human-in-the-loop approvals", 
            "Custom output parsing schemas", "Structured routing agents",
            "LangGraph subgraph modular layouts", "Agent session persistence caches"
        ],
        "scenarios": [
            "autonomous software engineer agents", "complex customer onboarding workflows", 
            "market research analyst pipelines", "automated database migration orchestrators", 
            "personalized email campaign builders", "enterprise threat hunting diagnostics",
            "automated customer billing disputes resolver", "multi-agent compliance check teams"
        ],
        "objectives": [
            "terminating runaway recursive agent loops", "parsing JSON/YAML outputs in a structured format", 
            "handling API timeout errors gracefully", "ensuring deterministic tool call execution", 
            "tracing execution steps for audit logs", "managing state values across long conversations"
        ]
    },
    {
        "id": "infrastructure-as-code",
        "name": "Infrastructure as Code (IaC) (Terraform, Azure Bicep)",
        "subjects": [
            "Terraform state locking and backends", "Bicep modular resource declarations", 
            "Terraform dynamic block declarations", "IaC secrets management integrations", 
            "Multi-environment workspace deployments", "Custom resource provider configurations", 
            "Infrastructure drift detection sweeps", "Terraform resource lifecycle policies",
            "Terraform plan validation rules", "Bicep target scope configurations"
        ],
        "scenarios": [
            "provisioning disaster recovery environments", "multi-tenant workspace deployment pipelines", 
            "securing private virtual network topologies", "scaling cloud data platforms dynamically", 
            "onboarding new business unit resources", "ephemeral sandbox development environments",
            "multi-region database replica provisioning", "corporate security policy compliance audits"
        ],
        "objectives": [
            "preventing resource state corruption risks", "enforcing strict resource tag compliance", 
            "reducing infrastructure deployment time", "avoiding exposing private API keys", 
            "preventing accidental deletions of data", "enforcing budget control quotas programmatically"
        ]
    },
    {
        "id": "enterprise-cicd",
        "name": "Enterprise CI/CD Pipelines (Azure DevOps, GitHub Actions)",
        "subjects": [
            "Self-hosted runner autoscaling pools", "Multi-stage deployment approvals", 
            "Dynamic pipeline variable expansion", "Automated rollback release strategies", 
            "Security scan and compliance checks", "Parallel build stage optimization", 
            "Caching dependency packages folders", "Infrastructure integration testing tasks",
            "OIDC federation connection setups", "Triggers and branch filter configurations"
        ],
        "scenarios": [
            "publishing Python packages repositories", "deploying cloud data warehouse schemas", 
            "building Docker containers registries", "updating live analytics reports code", 
            "releasing microservice backend updates", "orchestrating global application upgrades",
            "running regression tests nightly", "building multi-arch docker packages"
        ],
        "objectives": [
            "reducing release cycle time by 50%", "preventing broken builds reaching prod", 
            "enforcing strict static analysis checks", "protecting production secret keys", 
            "optimizing CI/CD compute resource costs", "ensuring compliance audits logs retention"
        ]
    },
    {
        "id": "data-governance-catalog",
        "name": "Enterprise Data Governance & Cataloging (Microsoft Purview, Databricks Unity Catalog)",
        "subjects": [
            "Automated lineage tracing sweeps", "Sensitive data classification definitions", 
            "Glossary terms mapping directories", "External table schema sync tasks", 
            "Cross-catalog share security models", "Catalog search indexing performance", 
            "Governance audit dashboard reports", "Data stewardship approvals workflows",
            "Databricks Unity Catalog system schemas", "Purview self-hosted integration runtime setups"
        ],
        "scenarios": [
            "identifying GDPR personal data locations", "merging metadata from diverse warehouses", 
            "onboarding new department databases", "publishing certified datasets stores", 
            "generating enterprise lineage maps", "governing external client shares",
            "tracking dynamic views column security", "auditing third-party data extraction jobs"
        ],
        "objectives": [
            "ensuring compliance with data laws", "accelerating business user dataset discovery", 
            "eliminating catalog sync timeouts", "enforcing consistent metadata taxonomy", 
            "monitoring database access logs audit", "preventing unauthorized classification changes"
        ]
    },
    {
        "id": "advanced-data-security",
        "name": "Advanced Data Security (Row-Level Security, Column-Level Security, Dynamic Data Masking)",
        "subjects": [
            "Security policy dynamic filter functions", "AAD security group role mappings", 
            "Data masking rule regex exclusions", "Encryption key rotation access vaults", 
            "Cross-database view security models", "Database audit log analytics tracking", 
            "Granular schema access grant policies", "Tokenized columns storage wrappers",
            "SQL Server dynamic data masking configs", "Cosmos DB encrypted field properties"
        ],
        "scenarios": [
            "protecting customer credit card data", "restricting regional sales reports views", 
            "preventing access to employee salary details", "securing medical records dashboards", 
            "sharing transactional tables third parties", "limiting admin database root controls",
            "governing multi-tenant SaaS schema access", "anonymizing PII logs before shipping"
        ],
        "objectives": [
            "enforcing strict privacy regulations", "minimizing database execution overhead", 
            "preventing administrator privilege escalation", "securing data files rest backup", 
            "simplifying database role governance", "preventing client-side extraction leaks"
        ]
    }
]

TOPIC_DETAILS = {
    "pyspark-optimization": {
        "summary": "optimizes PySpark execution plans, executor memory configurations, and join topologies to process distributed datasets with minimal memory overhead.",
        "gotchas": [
            "**Executor Loss due to OOM**: Out-of-memory errors occur when partitions are skewed or too large. *Remediation*: Configure spark.sql.shuffle.partitions dynamically and enable AQE skewJoin.",
            "**GC Pause Latency**: Large Java heaps lead to long JVM garbage collection cycles. *Remediation*: Use the G1GC garbage collector and tune initiator heap threshold values."
        ]
    },
    "databricks-lakehouse": {
        "summary": "structures transactional transaction tables on cloud object storage using ACID delta logs, schema enforcement, and partition indexing layouts.",
        "gotchas": [
            "**Write Conflict Failures**: Simultaneous writes to the same transaction path trigger collision failures. *Remediation*: Separate update keys and implement retry loops.",
            "**Performance Degradation from Small Files**: Micro-batches create millions of tiny files that block reads. *Remediation*: Run OPTIMIZE with ZORDER columns or use Liquid Clustering."
        ]
    },
    "python-data-architecture": {
        "summary": "coordinates concurrency, sub-processing pools, and stream generators to parse files without hitting the Python Global Interpreter Lock (GIL).",
        "gotchas": [
            "**GIL Thread Block**: CPU-bound operations in threads block execution on a single core. *Remediation*: Offload work to pyarrow C-extensions or use multiprocessing.",
            "**Memory Heap Leakage**: Buffers hold references to large data arrays, running the process out of memory. *Remediation*: Explicitly clear object arrays and monitor size using tracemalloc."
        ]
    },
    "modern-architecture": {
        "summary": "models domain-driven boundaries and analytical data products to construct a decentralized, compliant, self-service enterprise data mesh.",
        "gotchas": [
            "**Data Sovereignty Breach**: Queries spanning regional boundaries violate locality requirements. *Remediation*: Set shortcut access limits and enforce localized data product scopes.",
            "**Lineage Disconnection**: Decoupled domain model updates break downstream queries without warning. *Remediation*: Implement automated lineage sweeps and schema catalog contracts."
        ]
    },
    "advanced-data-modeling": {
        "summary": "decouples source tables from analytics using Kimball dimensional star schemas or auditable Data Vault 2.0 hubs, links, and satellites.",
        "gotchas": [
            "**Slow SCD Type 2 Updates**: Massive history tables require scanning millions of rows to check updates. *Remediation*: Deploy hash keys and construct temporal indices.",
            "**Join Explosion**: Deep Data Vault networks require complex multi-table joins that slow reporting. *Remediation*: Materialize point-in-time tables and bridge tables."
        ]
    },
    "storage-compute-tiering": {
        "summary": "tiers data files across hot/cool/archive storage layers while dynamically sizing compute nodes to match workload budgets.",
        "gotchas": [
            "**Archive Read Delay**: Retrieving cold data for query batches takes hours to stage. *Remediation*: Set intelligent tiering lifecycle policies and cache hot partitions.",
            "**Compute Starvation**: Autoscaling clusters fail to provision VMs during regional peak demand hours. *Remediation*: Use multi-sku fallback options and pre-warm VMs."
        ]
    },
    "realtime-streaming": {
        "summary": "ingests real-time events, enforcing processing time watermarks, offsets checkpointing, and dead-letter routing rules.",
        "gotchas": [
            "**Consumer Offset Lag**: Streaming data arrival rates exceed execution throughput. *Remediation*: Partition Kafka topics and apply stream backpressure flow throttles.",
            "**Poison Message Deadlock**: Malformed inputs crash the parser loop, stopping the entire stream. *Remediation*: Implement a try-catch pattern and route errors to a DLQ."
        ]
    },
    "mpp-multimodel-db": {
        "summary": "distributes large-scale transactional writes and analytical queries across cluster slices using hash partition distribution.",
        "gotchas": [
            "**Partition Key Skew**: Overly generic partition keys route most records to a single database slice, throttling operations. *Remediation*: Choose high-cardinality keys.",
            "**Dedicated SQL Pool Concurrency Block**: Query queues fill up, stalling downstream dashboards. *Remediation*: Partition table indexes and deploy replicated views."
        ]
    },
    "power-platform-governance": {
        "summary": "applies environment separation, data loss prevention (DLP) rules, and metadata auditing to secure departmental low-code gateways.",
        "gotchas": [
            "**Data Exfiltration**: Internal database access is exposed to public endpoints via unmonitored custom APIs. *Remediation*: Establish tenant-level Data Loss Prevention (DLP) rules.",
            "**Gateway Gateway Timeout**: High-volume scan actions block the local gateway. *Remediation*: Install clustered gateways and schedule async batch syncs."
        ]
    },
    "llm-rag-pipelines": {
        "summary": "structures text parsing, vector chunk overlapping, and contextual retrieval query loops to inject clean data into LLM prompts.",
        "gotchas": [
            "**Prompt Context Hallucinations**: Irrelevant document chunks pollute the prompt context, degrading responses. *Remediation*: Fine-tune chunk overlap and deploy re-ranking models.",
            "**Data Permission Leaks**: Users retrieve embeddings from documents they do not have access rights to view. *Remediation*: Enforce user identity key metadata filtering."
        ]
    },
    "vector-databases": {
        "summary": "indexes high-dimensional vector embeddings using graph networks or quantization codes to hit sub-15ms search latency.",
        "gotchas": [
            "**Graph Memory Bloat**: Loading large HNSW indices requires massive RAM capacity. *Remediation*: Quantize vectors with IVF-PQ and save metadata to separate partitions.",
            "**Upsert Performance Delay**: Real-time vector updates force frequent index rebuilds. *Remediation*: Configure dynamic index segment compaction and local caches."
        ]
    },
    "ai-orchestration": {
        "summary": "orchestrates loops, tool-routing logic nodes, and persistent conversation memory states to run deterministic agentic workflows.",
        "gotchas": [
            "**Infinite Loop Traps**: AI agents recursively invoke tool routes under ambiguous conditions, exhausting API budgets. *Remediation*: Implement max loop counters.",
            "**State Corruption**: Long-running conversation state variables get corrupted or cleared on network drops. *Remediation*: Persist state logs in a database store."
        ]
    },
    "infrastructure-as-code": {
        "summary": "manages cloud resource provisioning, state locking variables, and dependency order across multi-tenant workspaces.",
        "gotchas": [
            "**State File Locking Conflicts**: Deferring pipeline runs without locks corrupts the Terraform state file. *Remediation*: Store state in a remote backend with active locking.",
            "**Resource Drift Errors**: Ad-hoc manually added configurations break pipeline runs. *Remediation*: Schedule daily automated drift detection sweeps."
        ]
    },
    "enterprise-cicd": {
        "summary": "automates testing, container image packaging, credentials verification, and rollbacks using secure pipelines.",
        "gotchas": [
            "**Secrets Leaked in Logs**: Hardcoded credentials or API tokens print to build outputs. *Remediation*: Retrieve keys dynamically via vault parameters and OIDC tokens.",
            "**Build Stage Bottleneck**: Massive test suites stall self-hosted runner pools. *Remediation*: Optimize runner sizing and cache build dependencies."
        ]
    },
    "data-governance-catalog": {
        "summary": "harvests column-level lineage and classification tags to audit data asset access across Catalogs.",
        "gotchas": [
            "**Lineage Scan Timeout**: Scanning databases with thousands of schemas fails during mapping runs. *Remediation*: Set up dedicated self-hosted integration runtimes.",
            "**Stale Lineage Mappings**: Dropping columns in raw schemas breaks catalog reference flows. *Remediation*: Enable automated schema sync alerts."
        ]
    },
    "advanced-data-security": {
        "summary": "encrypts storage assets and masks personal data columns dynamically using row-level security predicates and key rotation.",
        "gotchas": [
            "**Performance Overhead**: Complex dynamic security join rules slow query times. *Remediation*: Design filter rules with static session tokens and indexed columns.",
            "**Privilege Escalation**: Root admin role exclusions bypass security checks. *Remediation*: Configure strict AAD security group authorization policies."
        ]
    }
}

def make_code_snippet(topic_id, subject):
    sub = subject.lower()
    
    if "pyspark-optimization" in topic_id:
        if "broadcast" in sub:
            return (
                "from pyspark.sql.functions import broadcast\n"
                "# Force Spark to broadcast the small dimension table to prevent shuffle stages\n"
                "df_joined = df_large.join(broadcast(df_small), 'client_id', 'inner')\n"
                "df_joined.write.mode('overwrite').parquet('/mnt/gold/sales_summary')"
            )
        elif "aqe" in sub:
            return (
                "# Enable Adaptive Query Execution parameters\n"
                "spark.conf.set('spark.sql.adaptive.enabled', 'true')\n"
                "spark.conf.set('spark.sql.adaptive.coalescePartitions.enabled', 'true')\n"
                "spark.conf.set('spark.sql.adaptive.skewJoin.enabled', 'true')\n"
                "df_result = df_a.join(df_b, 'transaction_id')"
            )
        elif "salt" in sub:
            return (
                "from pyspark.sql.functions import lit, concat, rand\n"
                "# Mitigate data skew by appending a random integer salt key\n"
                "df_skewed = df_skewed.withColumn('salt_key', concat(df_skewed.key, lit('_'), (rand()*10).cast('int')))\n"
                "df_joined = df_skewed.join(df_salted_dim, 'salt_key')"
            )
        elif "gc" in sub or "jvm" in sub:
            return (
                "# spark-submit configuration variables for G1 Garbage Collector tuning\n"
                "--conf spark.executor.extraJavaOptions=\"-XX:+UseG1GC -XX:InitiatingHeapOccupancyPercent=35\" \\\n"
                "--conf spark.driver.extraJavaOptions=\"-XX:+UseG1GC\" \\\n"
                "main_pipeline.py"
            )
        elif "dpp" in sub:
            return (
                "# DPP triggers automatically when joining a partitioned fact with a filtered dimension\n"
                "df_fact = spark.read.parquet('/mnt/silver/partitioned_sales') # partitioned by date\n"
                "df_dim = spark.read.parquet('/mnt/silver/dim_store').filter(\"region = 'EU'\")\n"
                "df_joined = df_fact.join(df_dim, 'store_id')"
            )
        elif "udf" in sub:
            return (
                "from pyspark.sql.functions import pandas_udf\n"
                "import pandas as pd\n"
                "# Vectorized pandas UDF to minimize serialization cost\n"
                "@pandas_udf('double')\n"
                "def calculate_tax(amount: pd.Series) -> pd.Series:\n"
                "    return amount * 0.21"
            )
        else:
            return (
                "from pyspark.sql import SparkSession\n"
                "spark = SparkSession.builder.appName('CoreTuning')\\\n"
                "    .config('spark.serializer', 'org.apache.spark.serializer.KryoSerializer')\\\n"
                "    .config('spark.sql.shuffle.partitions', '200')\\\n"
                "    .getOrCreate()\n"
                "df = spark.read.parquet('/mnt/silver/raw_telemetry')"
            )
            
    elif "databricks-lakehouse" in topic_id:
        if "clustering" in sub:
            return (
                "-- Create Delta table using modern Liquid Clustering layout\n"
                "CREATE TABLE gold.sensor_data (\n"
                "    sensor_id STRING, read_time TIMESTAMP, temperature DOUBLE\n"
                ") USING DELTA CLUSTER BY (sensor_id, DATE(read_time));"
            )
        elif "dlt" in sub:
            return (
                "import dlt\n"
                "# Delta Live Tables structure with high-severity data quality constraints\n"
                "@dlt.table(comment='Cleaned transaction ledger')\n"
                "@dlt.expect_or_drop('valid_amount', 'amount > 0')\n"
                "def silver_transactions():\n"
                "    return dlt.read('bronze_transactions').filter('status = \"approved\"')"
            )
        elif "cdf" in sub:
            return (
                "-- Enable Change Data Feed on source table\n"
                "ALTER TABLE silver.users SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true');\n"
                "-- Query historical changes across a range of commits\n"
                "SELECT * FROM table_changes('silver.users', 105, 120);"
            )
        elif "z-order" in sub or "optimize" in sub:
            return (
                "-- Perform file compaction and multidimensional clustering\n"
                "OPTIMIZE silver.customer_profiles\n"
                "WHERE update_date >= '2026-01-01'\n"
                "ZORDER BY (customer_country, signup_channel);"
            )
        elif "travel" in sub:
            return (
                "# Read historical snapshot using Delta Time Travel\n"
                "df_v1 = spark.read.format('delta').option('versionAsOf', 12).load('/mnt/silver/users')\n"
                "df_t1 = spark.read.format('delta').option('timestampAsOf', '2026-06-01').load('/mnt/silver/users')"
            )
        else:
            return (
                "CREATE TABLE silver.audit_log (\n"
                "    event_id GENERATED ALWAYS AS IDENTITY, event_name STRING\n"
                ") USING DELTA TBLPROPERTIES (\n"
                "    'delta.enableChangeDataFeed' = 'true',\n"
                "    'delta.minReaderVersion' = '2'\n"
                ");"
            )
            
    elif "python-data" in topic_id:
        if "async" in sub:
            return (
                "import asyncio, aiohttp\n"
                "async def fetch_api(session, url):\n"
                "    async with session.get(url) as res:\n"
                "        return await res.json()\n"
                "async def ingest_urls(urls):\n"
                "    async with aiohttp.ClientSession() as s:\n"
                "        return await asyncio.gather(*[fetch_api(s, u) for u in urls])"
            )
        elif "pydantic" in sub:
            return (
                "from pydantic import BaseModel, Field, field_validator\n"
                "class UserRecord(BaseModel):\n"
                "    id: str = Field(..., min_length=10)\n"
                "    email: str\n"
                "    @field_validator('id')\n"
                "    def check_id_prefix(cls, v):\n"
                "        assert v.startswith('USR_'), 'Must start with USR_'\n"
                "        return v"
            )
        elif "generator" in sub:
            return (
                "def stream_large_file(file_path):\n"
                "    # Generator-based lazy loading to preserve memory footprint\n"
                "    with open(file_path, 'r') as f:\n"
                "        for line in f:\n"
                "            yield line.strip().split(',')"
            )
        else:
            return (
                "import pyarrow.parquet as pq\n"
                "import pyarrow as pa\n"
                "table = pa.Table.from_pandas(df_payload)\n"
                "pq.write_to_dataset(table, root_path='/data/archives/',\\\n"
                "    partition_cols=['year', 'month'], compression='SNAPPY')"
            )
            
    elif "modern-architecture" in topic_id:
        if "contract" in sub:
            return (
                "{\n"
                "  \"$schema\": \"https://specs.dataproducts.org/v1/contract.json\",\n"
                "  \"dataProductId\": \"urn:retail:sales:gold_reporting\",\n"
                "  \"owner\": \"domain-sales-team\",\n"
                "  \"schema\": {\n"
                "    \"fields\": [\n"
                "      { \"name\": \"transaction_id\", \"type\": \"string\" },\n"
                "      { \"name\": \"total_amount\", \"type\": \"decimal(18,2)\" }\n"
                "    ]\n"
                "  }\n"
                "}"
            )
        elif "shortcut" in sub:
            return (
                "# REST payload to link external ADLS Gen2 path as OneLake shortcut\n"
                "{\n"
                "  \"path\": \"Files/external_logs\",\n"
                "  \"target\": {\n"
                "    \"type\": \"AdlsGen2\",\n"
                "    \"location\": \"https://datalakeprod.dfs.core.windows.net/container/logs\"\n"
                "  }\n"
                "}"
            )
        else:
            return (
                "-- Federated SQL view linking multiple domain catalogs\n"
                "CREATE VIEW sales_domain.federated_summary AS\n"
                "SELECT t.transaction_id, c.customer_name\n"
                "FROM sales_lakehouse.dbo.transactions t\n"
                "INNER JOIN customer_lakehouse.dbo.profile c ON t.cust_id = c.id;"
            )
        
    elif "modeling" in topic_id:
        if "vault" in sub:
            return (
                "-- DDL definition for Data Vault 2.0 Hub and Link layout\n"
                "CREATE TABLE vault.hub_customer (\n"
                "    hk_customer BINARY(32) PRIMARY KEY, -- hash key\n"
                "    customer_id VARCHAR(50) NOT NULL,\n"
                "    load_datetime TIMESTAMP NOT NULL,\n"
                "    record_source VARCHAR(20) NOT NULL\n"
                ");"
            )
        elif "scd" in sub:
            return (
                "-- SCD Type 2 merge pattern using system time tracking\n"
                "MERGE INTO dbo.dim_customer AS target\n"
                "USING dbo.stg_customer AS source ON target.id = source.id\n"
                "WHEN MATCHED AND target.current_flag = 1 AND target.hash_diff <> source.hash_diff\n"
                "THEN UPDATE SET target.end_date = GETUTCDATE(), target.current_flag = 0;"
            )
        else:
            return (
                "-- Enterprise Kimball Fact table with conformed dimension FK keys\n"
                "CREATE TABLE dbo.fact_sales (\n"
                "    date_key INT NOT NULL, customer_key INT NOT NULL,\n"
                "    sales_amount DECIMAL(18,2) NOT NULL\n"
                ");"
            )
        
    elif "tiering" in topic_id:
        if "lifecycle" in sub:
            return (
                "{\n"
                "  \"Rules\": [{\n"
                "    \"ID\": \"ArchiveOldTelemetry\", \"Status\": \"Enabled\",\n"
                "    \"Transitions\": [{\"Days\": 90, \"StorageClass\": \"GLACIER\"}]\n"
                "  }]\n"
                "}"
            )
        else:
            return (
                "# Azure CLI script to move storage blob to cool tier\n"
                "az storage blob set-tier \\\n"
                "    --account-name stlogscheck \\\n"
                "    --container telemetry \\\n"
                "    --name historical.parquet \\\n"
                "    --tier Cool"
            )
        
    elif "streaming" in topic_id:
        if "watermark" in sub:
            return (
                "SELECT System.Timestamp AS WindowEnd, sensor_id, COUNT(*)\n"
                "FROM telemetry_stream TIMESTAMP BY event_time\n"
                "GROUP BY sensor_id, TumblingWindow(Duration(minute, 5), Delay(minute, 2))"
            )
        elif "producer" in sub:
            return (
                "from confluent_kafka import Producer\n"
                "conf = {\n"
                "    'bootstrap.servers': 'kafka.eventhubs.azure.net:9093',\n"
                "    'acks': 'all',\n"
                "    'enable.idempotence': True\n"
                "}\n"
                "producer = Producer(conf)\n"
                "producer.produce('telemetry-topic', key='sensor-12', value='payload')"
            )
        else:
            return (
                "from confluent_kafka import Consumer\n"
                "conf = {\n"
                "    'bootstrap.servers': 'kafka.eventhubs.azure.net:9093',\n"
                "    'group.id': 'telemetry-consumers', 'auto.offset.reset': 'earliest'\n"
                "}\n"
                "c = Consumer(conf)"
            )
            
    elif "mpp" in topic_id:
        if "pool" in sub or "distribution" in sub:
            return (
                "CREATE TABLE dw.gold_fact_sales (\n"
                "    sale_key INT NOT NULL, customer_id INT NOT NULL, total_sales DECIMAL(18,2)\n"
                ")\n"
                "WITH (\n"
                "    DISTRIBUTION = HASH(customer_id),\n"
                "    CLUSTERED COLUMNSTORE INDEX\n"
                ");"
            )
        elif "cosmos" in sub:
            return (
                "// Cosmos DB Item Query execution using logical PartitionKey partition maps\n"
                "PartitionKey pk = new PartitionKey(\"EU_SALES_REGION\");\n"
                "ItemResponse<SalesOrder> order = await container.ReadItemAsync<SalesOrder>(\n"
                "    \"order-401\", pk\n"
                ");"
            )
        else:
            return (
                "SELECT t.id, sum(s.amount)\n"
                "FROM dw.sales s\n"
                "INNER JOIN dw.targets t ON s.id = t.id\n"
                "GROUP BY t.id OPTION (LABEL = 'HashJoinOptimization');"
            )
            
    elif "power-platform" in topic_id:
        if "pcf" in sub:
            return (
                "<!-- PCF Component manifest properties configuration -->\n"
                "<control namespace=\"DataPlatform\" constructor=\"GatewayAuditor\"\n"
                "    version=\"1.0.0\" display-name-key=\"DataGateway\">\n"
                "    <property name=\"EndpointURI\" of-type=\"SingleLine.Text\" required=\"true\" />\n"
                "</control>"
            )
        else:
            return (
                "// Power Automate trigger JSON definition schema\n"
                "{\n"
                "  \"type\": \"Request\",\n"
                "  \"kind\": \"Http\",\n"
                "  \"inputs\": {\n"
                "    \"schema\": { \"type\": \"object\", \"properties\": { \"id\": { \"type\": \"string\" } } }\n"
                "  }\n"
                "}"
            )
        
    elif "llm-rag" in topic_id:
        if "chunk" in sub:
            return (
                "def split_text_overlapping(text, chunk_size=500, overlap=100):\n"
                "    chunks = []\n"
                "    start = 0\n"
                "    while start < len(text):\n"
                "        end = start + chunk_size\n"
                "        chunks.append(text[start:end])\n"
                "        start += chunk_size - overlap\n"
                "    return chunks"
            )
        else:
            return (
                "# Python integration to query vector index with sparse-dense hybrid weights\n"
                "results = index.query(\n"
                "    vector=[0.02]*1536, sparse_vector=sparse_repr,\n"
                "    top_k=5, filter={'scope': 'finance_legal'}\n"
                ")"
            )
        
    elif "vector" in topic_id:
        if "pinecone" in sub:
            return (
                "import pinecone\n"
                "pc = pinecone.Pinecone(api_key='your-api-key')\n"
                "index = pc.Index('gold-embeddings')\n"
                "results = index.query(\n"
                "    vector=[0.12] * 1536,\n"
                "    filter={'region': {'$eq': 'EU'}},\n"
                "    top_k=5\n"
                ")"
            )
        else:
            return (
                "# Create Milvus collection schema and HNSW index parameters\n"
                "index_params = {\n"
                "    'metric_type': 'COSINE',\n"
                "    'index_type': 'HNSW',\n"
                "    'params': {'M': 16, 'efConstruction': 64}\n"
                "}"
            )
        
    elif "ai-orchestration" in topic_id:
        if "langgraph" in sub:
            return (
                "from langgraph.graph import StateGraph, END\n"
                "# LangGraph dynamic loop configuration\n"
                "workflow = StateGraph(AgentState)\n"
                "workflow.add_node('agent', call_llm)\n"
                "workflow.add_node('tool', run_sql_query)\n"
                "workflow.add_conditional_edges('agent', route_decision, {'continue': 'tool', 'end': END})\n"
                "app = workflow.compile()"
            )
        else:
            return (
                "from langchain_core.runnables import RunnableSequence\n"
                "# Chain steps using LangChain Expression Language (LCEL)\n"
                "chain = prompt_template | model | output_parser\n"
                "output = chain.invoke({'query': 'EU BFSI revenue audit'})"
            )
        
    elif "infrastructure-as-code" in topic_id:
        if "terraform" in sub:
            return (
                "# Terraform block with remote state locking in Azure blob container\n"
                "terraform {\n"
                "  backend \"azurerm\" {\n"
                "    resource_group_name  = \"rg-shared-infra\"\n"
                "    storage_account_name = \"tfstatelocks\"\n"
                "    container_name       = \"tfstate\" \n"
                "    key                  = \"prod.terraform.tfstate\"\n"
                "  }\n"
                "}"
            )
        else:
            return (
                "// Bicep storage account setup with target scope limits\n"
                "targetScope = 'resourceGroup'\n"
                "resource dataLake 'Microsoft.Storage/storageAccounts@2022-09-01' = {\n"
                "  name: 'stgolddatalakeprod'\n"
                "  location: 'westeurope'\n"
                "  sku: { name: 'Standard_GRS' }\n"
                "  kind: 'StorageV2'\n"
                "}"
            )
        
    elif "enterprise-cicd" in topic_id:
        if "actions" in sub or "github" in sub:
            return (
                "# GitHub Actions pipeline configuration with OIDC authentication\n"
                "jobs:\n"
                "  deploy:\n"
                "    runs-on: ubuntu-latest\n"
                "    permissions:\n"
                "      id-token: write\n"
                "      contents: read\n"
                "    steps:\n"
                "      - uses: actions/checkout@v3\n"
                "      - uses: azure/login@v1\n"
                "        with: { client-id: '${{ secrets.AZ_CLIENT_ID }}' }"
            )
        else:
            return (
                "# Azure DevOps YAML multi-stage approvals step\n"
                "stages:\n"
                "  - stage: ProductionDeploy\n"
                "    jobs:\n"
                "      - deployment: ProdDeployJob\n"
                "        environment: 'production-env'\n"
                "        strategy: { runOnce: { deploy: { steps: [{ script: echo deploying }] } } }"
            )
        
    elif "data-governance-catalog" in topic_id:
        if "unity" in sub:
            return (
                "-- Grant schema and catalog read boundaries in Unity Catalog\n"
                "GRANT USAGE, SELECT ON CATALOG gold_sales\n"
                "TO `sales_analytics_consumers`;\n"
                "ALTER SCHEMA gold_sales.reporting SET OWNER TO `governance_admins`;"
            )
        else:
            return (
                "# Azure CLI request to trigger Microsoft Purview catalog synchronization\n"
                "az purview datasource scan run \\\n"
                "    --account-name purview-audit-account \\\n"
                "    --data-source-name adls-silver-layer \\\n"
                "    --scan-name adls-silver-full-scan"
            )
        
    else: # security
        if "rls" in sub or "security policy" in sub:
            return (
                "-- SQL Server dynamic row level security predicate mapping\n"
                "CREATE FUNCTION security.fn_securityPredicate(@Region AS sysname)\n"
                "    RETURNS TABLE WITH SCHEMABINDING\n"
                "AS\n"
                "    RETURN SELECT 1 AS result WHERE USER_NAME() = @Region OR IS_MEMBER('db_owner') = 1;\n"
                "CREATE SECURITY POLICY security.salesPolicy\n"
                "    ADD FILTERS PREDICATE security.fn_securityPredicate(sales_region) ON dbo.sales_fact;"
            )
        elif "mask" in sub:
            return (
                "-- Dynamic Data Masking column definitions\n"
                "ALTER TABLE dbo.dim_employees ALTER COLUMN ssn_number\n"
                "    ADD MASKED WITH (FUNCTION = 'partial(0, \"XXX-XX-\", 4)');\n"
                "ALTER TABLE dbo.dim_employees ALTER COLUMN email_address\n"
                "    ADD MASKED WITH (FUNCTION = 'email()');"
            )
        else:
            return (
                "-- Grant column-level SELECT limits to schema groups\n"
                "REVOKE SELECT ON dbo.dim_employees FROM public;\n"
                "GRANT SELECT (employee_id, department, office_location) ON dbo.dim_employees TO sales_read_role;"
            )

def generate_answer(topic, difficulty, index, question, subject, scenario, objective):
    topic_id = topic["id"]
    details = TOPIC_DETAILS[topic_id]
    
    ans_parts = []
    
    # Phase 1: Conceptual Foundation & Core Architecture
    p1 = f"### Phase 1: Conceptual Foundation & Core Architecture\n"
    p1 += f"Deploying **{subject}** within an enterprise environment running **{scenario}** requires addressing the main challenges related to **{objective}**. "
    p1 += f"At a high level, **{subject}** {details['summary']} "
    
    if difficulty == "EASY":
        p1 += (
            f"Specifically, this configuration ensures that everyday query processing runs in a predictable, isolated sandbox. "
            f"In the context of {scenario}, this setup isolates worker nodes and avoids typical configuration errors. "
            f"Implementing this correct structure satisfies base throughput needs and sets up a stable baseline."
        )
    elif difficulty == "MEDIUM":
        p1 += (
            f"To achieve this, the architecture must balance memory footprints and network latency. "
            f"Utilizing {subject} maps logical execution operations to partitioned compute nodes which process blocks in parallel. "
            f"For {scenario}, this reduces cross-node operations and network traffic overhead. "
            f"To satisfy the target constraints for {objective}, we configure custom allocations on session parameters."
        )
    else: # HARD
        p1 += (
            f"For high-volume production scale, this requires custom executor parameters that override default configurations to avoid performance degradation. "
            f"With {subject}, we configure partition distribution mappings based on high-cardinality keys. "
            f"In the context of {scenario}, the design must isolate execution threads and prevent write contention anomalies. "
            f"To support the SLA boundaries required for {objective}, memory heap sizes and JVM limits must be explicitly bound. "
            f"This isolates failure domains, guarantees deterministic execution times, and prevents multi-tenant resource starvation."
        )
    ans_parts.append(p1)
    
    # Phase 2: Low-Level Mechanics & Implementation
    p2 = f"### Phase 2: Low-Level Mechanics & Implementation\n"
    p2 += "Implementing this pattern requires the following setup steps and configuration files:\n\n"
    p2 += "1. **Logical Setup**: Bind the session context or initialize the client using the parameters specified.\n"
    p2 += "2. **Implementation Snippet**:\n"
    p2 += f"```{'python' if 'python' in topic_id or 'pyspark' in topic_id or 'orchestration' in topic_id or 'llm' in topic_id else 'sql'}\n"
    p2 += make_code_snippet(topic_id, subject) + "\n"
    p2 += "```\n"
    p2 += f"3. **Tuning Parameter Values**: Set the thresholds (e.g. timeout settings to 300s, buffer sizes to 64MB) to align with performance budgets."
    ans_parts.append(p2)
    
    # Phase 3: Production Hardening & Gotchas
    p3 = f"### Phase 3: Production Hardening & Gotchas\n"
    p3 += "In a production environment, several failure states can cause this design to degrade:\n\n"
    p3 += f"- {details['gotchas'][0]}\n"
    p3 += f"- {details['gotchas'][1]}\n"
    p3 += f"- **Network Latency Contention**: Cross-region transfers can hit bandwidth boundaries under high loads. *Remediation*: Enable local caching and partition data to align with region nodes."
    ans_parts.append(p3)
    
    return "\n\n".join(ans_parts)

def build_questions():
    records = []
    
    for topic in TOPICS:
        topic_id = topic["id"]
        topic_name = topic["name"]
        
        subjects = topic["subjects"]
        scenarios = topic["scenarios"]
        objectives = topic["objectives"]
        
        # Easy
        for i in range(50):
            subj = subjects[i % len(subjects)]
            scen = scenarios[i % len(scenarios)]
            obj = objectives[i % len(objectives)]
            
            question_text = f"What is the recommended approach to configure {subj} for {scen} to achieve {obj}?"
            
            q_id = f"arch-{topic_id}-easy-{i+1}"
            answer_text = generate_answer(topic, "EASY", i+1, question_text, subj, scen, obj)
            
            records.append({
                "id": q_id,
                "source": "Architecture Hub",
                "category": topic_name,
                "niche": f"{subj} Core Principles",
                "difficulty": "EASY",
                "question": question_text,
                "answer": answer_text
            })
            
        # Medium
        for i in range(50):
            subj = subjects[(i + 3) % len(subjects)]
            scen = scenarios[(i + 2) % len(scenarios)]
            obj = objectives[(i + 1) % len(objectives)]
            
            question_text = f"How do you implement and tune {subj} in a pipeline processing {scen} when facing {obj} constraints?"
            
            q_id = f"arch-{topic_id}-medium-{i+1}"
            answer_text = generate_answer(topic, "MEDIUM", i+1, question_text, subj, scen, obj)
            
            records.append({
                "id": q_id,
                "source": "Architecture Hub",
                "category": topic_name,
                "niche": f"{subj} Implementation",
                "difficulty": "MEDIUM",
                "question": question_text,
                "answer": answer_text
            })
            
        # Hard
        for i in range(50):
            subj = subjects[(i + 7) % len(subjects)]
            scen = scenarios[(i + 5) % len(scenarios)]
            obj = objectives[(i + 4) % len(objectives)]
            
            question_text = f"Detail the production-grade architecture design for {subj} within {scen} that satisfies {obj} SLA constraints. What are the key failure remediation gotchas?"
            
            q_id = f"arch-{topic_id}-hard-{i+1}"
            answer_text = generate_answer(topic, "HARD", i+1, question_text, subj, scen, obj)
            
            records.append({
                "id": q_id,
                "source": "Architecture Hub",
                "category": topic_name,
                "niche": f"{subj} Advanced Architecture",
                "difficulty": "HARD",
                "question": question_text,
                "answer": answer_text
            })
            
    print(f"Total questions created in memory: {len(records)}")
    return records

def main():
    records = build_questions()
    
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        f.write("window.ARCHITECTURE_DATA = ")
        json.dump(records, f, indent=2, ensure_ascii=False)
        f.write(";\n")
        
    print(f"SUCCESS: Written {len(records)} questions to {OUTPUT_PATH}")

if __name__ == '__main__':
    main()
