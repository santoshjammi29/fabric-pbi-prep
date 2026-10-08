import json
import os

print("--- Starting Website Knowledge Base Synchronization ---")

# 1. Update modern_blueprints.json
BLUEPRINTS_FILE = 'src/data/json/modern_blueprints.json'
with open(BLUEPRINTS_FILE, 'r') as f:
    bp_data = json.load(f)

existing_bp_ids = {item['id'] for item in bp_data}
new_blueprints = [
    {
        "id": "bp-13",
        "title": "13. 50TB/Day Real-Time E-Commerce Clickstream & Inventory Orchestration",
        "category": "Real-Time Streaming",
        "costEstimate": "$2,200 - $4,800 / month",
        "tags": ["Event Hubs", "Flink", "Cosmos DB", "Direct Lake", "OneLake"],
        "mermaid": "graph LR\n    A[Event Hubs 64 Partitions] --> B[Apache Flink Stateful Engine]\n    B --> C[(Cosmos DB Point Lookups)]\n    B --> D[Redis Flash Inventory]\n    B --> E[(Fabric OneLake Delta)]\n    E --> F[Power BI Direct Lake]",
        "ascii": "[Event Hubs] --> [Apache Flink] --> [(Cosmos DB & Redis)] + [(OneLake Delta)] --> [Power BI Direct Lake]"
    },
    {
        "id": "bp-14",
        "title": "14. Zero-Downtime Synapse Dedicated Pool (DW3000c) to Microsoft Fabric OneLake Migration",
        "category": "Data Platform Migration",
        "costEstimate": "$3,500 - $6,500 / month (F64)",
        "tags": ["Synapse", "Fabric", "Migration", "Direct Lake", "FinOps"],
        "mermaid": "graph LR\n    A[Synapse Dedicated DW3000c] --> B[OneLake Shortcuts Coexistence]\n    B --> C[DACPAC Schema Refactoring]\n    C --> D[Dual-Run Reconciliation]\n    D --> E[Direct Lake Cutover & Decommission]",
        "ascii": "[Synapse DW3000c] --> [OneLake Shortcuts] --> [DACPAC Refactor] --> [Reconciliation] --> [Direct Lake Cutover]"
    },
    {
        "id": "bp-15",
        "title": "15. Azure Cosmos DB Request Unit (RU/s) & HTAP FinOps Remediation",
        "category": "NoSQL & HTAP Architecture",
        "costEstimate": "$1,200 - $3,000 / month",
        "tags": ["Cosmos DB", "Synapse Link", "RU/s", "HTAP", "Autoscale"],
        "mermaid": "graph LR\n    A[App Point Writes] --> B[(Cosmos DB Transactional Store)]\n    B -->|Zero-RU Internal Sync| C[(Cosmos Analytical Store)]\n    C --> D[Synapse Serverless / Fabric Mirroring]\n    D --> E[Power BI Real-Time Dashboard]",
        "ascii": "[Writes] --> [(Cosmos OLTP)] -->|Zero-RU Sync| [(Cosmos Analytical Store)] --> [Serverless SQL / Fabric]"
    },
    {
        "id": "bp-16",
        "title": "16. In-Process Analytics Pipeline: DuckDB + Polars on Spot VMs vs Distributed Spark",
        "category": "In-Process Analytics",
        "costEstimate": "$40 - $180 / month",
        "tags": ["DuckDB", "Polars", "Apache Arrow", "Spot VMs", "FinOps"],
        "mermaid": "graph LR\n    A[ADLS Gen2 Parquet] --> B[Polars Rust Multi-Core Engine]\n    B -->|Zero-Copy Arrow C Data| C[DuckDB SQL Aggregator]\n    C --> D[(Curated Gold Delta Tables)]",
        "ascii": "[ADLS Parquet] --> [Polars Rust Engine] -->|Arrow Zero-Copy| [DuckDB Out-of-Core] --> [(Gold Delta Tables)]"
    },
    {
        "id": "bp-17",
        "title": "17. Enterprise Multi-Tenant Legal GenAI / RAG Platform with Qdrant Vector HNSW",
        "category": "AI & RAG Architecture",
        "costEstimate": "$1,400 - $3,800 / month",
        "tags": ["Qdrant", "HNSW", "Azure OpenAI", "Hybrid Search", "Multi-Tenant"],
        "mermaid": "graph LR\n    A[Legal Contracts & Schemas] --> B[Azure Document Intelligence]\n    B --> C[Semantic Chunker + text-embedding-3]\n    C --> D[(Qdrant HNSW Vector DB)]\n    E[User Query] --> F[Hybrid Dense+BM25 Search]\n    F --> D\n    D --> G[Cohere Reranker]\n    G --> H[GPT-4o Grounded Citations]",
        "ascii": "[Legal Docs] --> [Document Intelligence] --> [(Qdrant HNSW)] <--> [Hybrid Search + Reranker] --> [GPT-4o]"
    },
    {
        "id": "bp-18",
        "title": "18. Ultra-Cost-Effective 10TB/Day Modern Data Platform for Under $3,000/Month",
        "category": "FinOps & Modern ELT",
        "costEstimate": "$2,200 - $2,800 / month",
        "tags": ["Debezium", "ZSTD", "DuckDB", "Synapse Serverless", "Dagster"],
        "mermaid": "graph LR\n    A[PostgreSQL / MySQL] --> B[Debezium CDC on Spot Kubernetes]\n    B --> C[(ADLS Gen2 ZSTD Compressed)]\n    C --> D[DuckDB / Polars Spot Workers]\n    D --> E[Synapse Serverless $5/TB Partition Pruned]\n    E --> F[Executive Power BI]",
        "ascii": "[RDBMS] --> [Debezium CDC] --> [(ADLS ZSTD)] --> [DuckDB Spot Engine] --> [Synapse Serverless] --> [Power BI]"
    }
]

for b in new_blueprints:
    if b['id'] not in existing_bp_ids:
        bp_data.append(b)

with open(BLUEPRINTS_FILE, 'w') as f:
    json.dump(bp_data, f, indent=2)
print(f"Blueprints: {len(bp_data)} total")

# 2. Update modern_cost_playbooks.json
COST_FILE = 'src/data/json/modern_cost_playbooks.json'
with open(COST_FILE, 'r') as f:
    cost_data = json.load(f)

existing_cost_titles = {item['title'] for item in cost_data}
new_cost_playbooks = [
    {
        "title": "Fabric Capacity (F-SKU) Auto-Pause via Azure Logic Apps",
        "savings": "70% Non-Production Compute Reduction ($3,500+/mo)",
        "summary": "Pause non-production Fabric capacities outside business hours (7 PM to 7 AM and weekends) using Azure Logic Apps or CLI, reducing monthly runtime from 730 hours to 220 hours.",
        "code": "az fabric capacity suspend --resource-group rg-fabric-dev --capacity-name capfabricdev01"
    },
    {
        "title": "Synapse Serverless filepath() & filename() Partition Pruning",
        "savings": "90% Scan Cost Reduction ($5/TB Scanned)",
        "summary": "Filter directly on directory structure metadata via filepath(1) and filepath(2) to prevent Serverless SQL from scanning unwanted historical year/month Parquet partitions.",
        "code": "SELECT r.filepath(1) AS [Year], SUM(r.Total) FROM OPENROWSET(BULK 'sales/year=*/month=*/*.parquet', FORMAT='PARQUET') AS r WHERE r.filepath(1) = '2024' GROUP BY r.filepath(1);"
    },
    {
        "title": "Automated Storage Lifecycle Tiering: Hot to Cool to Cold to Archive",
        "savings": "88% Long-Term Storage Cost Reduction",
        "summary": "Configure Azure Storage lifecycle rules to transition Bronze raw landing data from Hot ($0.018/GB) to Cool ($0.010/GB) at 30 days, Cold ($0.0036/GB) at 90 days, and Archive ($0.00099/GB) at 365 days.",
        "code": "az storage account management-policy create --account-name mylakehouse --policy @lifecycle_policy.json"
    },
    {
        "title": "Parquet Zstandard (ZSTD Level 7) Recompression in Lakehouse",
        "savings": "38% Storage & Read I/O Reduction over Snappy",
        "summary": "Re-encode cold and curated Silver/Gold Parquet partitions using ZSTD level 7 compression, cutting disk footprint by 38% with zero perceptible query decompression latency penalty.",
        "code": "spark.conf.set('spark.sql.parquet.compression.codec', 'zstd')\ndf.write.option('compression', 'zstd').mode('overwrite').parquet('/mnt/gold/curated_orders')"
    },
    {
        "title": "Cosmos DB Synthetic Partitioning & Targeted Path Indexing",
        "savings": "65% RU/s Reduction & Eliminates Hot Partitions",
        "summary": "Exclude high-cardinality nested JSON attributes from automatic indexing and append synthetic hash suffixes to partition keys to avoid 10,000 RU/s physical partition throttling.",
        "code": "az cosmosdb sql container update --account-name mycosmos --indexing-policy '{\"indexingMode\":\"consistent\",\"includedPaths\":[{\"path\":\"/tenantId/?\"}],\"excludedPaths\":[{\"path\":\"/*\"}]}'"
    },
    {
        "title": "Delta Lake & Iceberg VACUUM Snapshot Compaction",
        "savings": "50% Orphan File Storage Reduction",
        "summary": "Run regular OPTIMIZE to compact small delta files into 128MB-512MB columnar files and VACUUM to purge historical snapshots older than 7 days, stopping dead storage accumulation.",
        "code": "OPTIMIZE gold.fact_transactions ZORDER BY (customer_id, transaction_date);\nVACUUM gold.fact_transactions RETAIN 168 HOURS;"
    }
]

for cp in new_cost_playbooks:
    if cp['title'] not in existing_cost_titles:
        cost_data.append(cp)

with open(COST_FILE, 'w') as f:
    json.dump(cost_data, f, indent=2)
print(f"Cost Playbooks: {len(cost_data)} total")

# 3. Update modern_concepts.json
CONCEPTS_FILE = 'src/data/json/modern_concepts.json'
with open(CONCEPTS_FILE, 'r') as f:
    concepts_data = json.load(f)

existing_concept_ids = {item['id'] for item in concepts_data}
new_modern_concepts = [
    {
        "id": "mc-13",
        "title": "Synapse 60-Distribution MPP & Data Movement Service (DMS)",
        "subdomain": "dist-sys",
        "difficulty": "ARCHITECT",
        "summary": "The fixed 60-distribution invariant in Synapse Dedicated Pools governing compute distribution mapping and cross-node shuffle overhead.",
        "details": "All Synapse Dedicated SQL Pools distribute data across exactly 60 underlying Azure Storage distributions. Hash distribution maps large facts to 1 of 60 shards via deterministic hashing; Replicated caches dimensions on all nodes; Round-Robin cycles sequentially. When queries join tables on mismatched keys, the Data Movement Service (DMS) shuffles rows across nodes, creating network bottlenecks."
    },
    {
        "id": "mc-14",
        "title": "Microsoft Fabric OneLake Shortcuts & Zero-Copy Virtualization",
        "subdomain": "lakehouse-formats",
        "difficulty": "ARCHITECT",
        "summary": "Embedded symbolic links in OneLake that expose AWS S3, ADLS Gen2, and GCS object storage natively inside Lakehouses without data copying.",
        "details": "Shortcuts decouple storage ownership from compute execution. An enterprise with multi-terabyte data lakes in AWS S3 or ADLS Gen2 can create a OneLake shortcut, allowing Fabric Spark, T-SQL Warehouses, and Power BI Direct Lake to query external data in-place without pipeline ETL replication, data duplication, or cross-cloud egress fees."
    },
    {
        "id": "mc-15",
        "title": "Power BI Direct Lake Mode: In-Memory VertiPaq Paging",
        "subdomain": "lakehouse-formats",
        "difficulty": "ARCHITECT",
        "summary": "Semantic model connectivity where VertiPaq directly reads Delta Parquet columnar files from OneLake into RAM on demand with zero refresh lag.",
        "details": "Direct Lake solves the classic trade-off between Import mode (fast, but 24hr stale cache lag and memory ceilings) and DirectQuery mode (real-time, but slow SQL query translation). Direct Lake delivers in-memory query performance on multi-billion row tables while reflecting data modifications instantly when upstream Spark or Warehouse jobs commit."
    },
    {
        "id": "mc-16",
        "title": "Fabric Capacity Smoothing & Bursting 24-Hour Windows",
        "subdomain": "serverless-arch",
        "difficulty": "ARCHITECT",
        "summary": "Capacity allocation algorithm averaging background compute consumption over a 24-hour moving window to prevent job throttling during heavy batch spikes.",
        "details": "Fabric smooths heavy batch tasks (Spark notebooks, Data Factory pipelines) across 24 hours, so a 15-minute high-CPU pipeline does not exhaust capacity or cause interactive Power BI dashboards to freeze. Capacity bursting allows jobs to temporarily draw additional Capacity Units (CUs) if the overall tenant is under-utilized."
    },
    {
        "id": "mc-17",
        "title": "Cosmos DB Request Units (RU/s) & Analytical Store (HTAP)",
        "subdomain": "dist-sys",
        "difficulty": "ARCHITECT",
        "summary": "Compute currency of Cosmos DB and its zero-RU analytical store enabling real-time analytics without impacting transactional throughput.",
        "details": "In Cosmos DB, 1 point read costs 1 RU, while writes cost 5-10 RUs due to 4-replica quorum consensus and automatic index inversion. Enabling Cosmos DB Analytical Store performs lock-free background sync to a columnar Parquet format in <2 minutes, allowing Synapse Serverless or Fabric to query operational data with zero transactional RU impact."
    },
    {
        "id": "mc-18",
        "title": "ScyllaDB C++ Seastar Asynchronous Engine vs JVM Cassandra",
        "subdomain": "compute-engines",
        "difficulty": "ARCHITECT",
        "summary": "Why C++ thread-per-core architecture eliminates JVM Garbage Collection pauses, delivering sub-millisecond p99 latencies at 100K+ writes/sec.",
        "details": "Apache Cassandra written in Java suffers from JVM stop-the-world GC pauses under heavy write loads. ScyllaDB rewrote the Cassandra engine in C++ using the Seastar asynchronous framework, utilizing a shared-nothing thread-per-core design that bypasses OS context switches and locks, maintaining consistent sub-millisecond tail latencies."
    },
    {
        "id": "mc-19",
        "title": "Vector Indexing Architecture: HNSW vs IVF in Enterprise RAG",
        "subdomain": "ai-llm-native",
        "difficulty": "ARCHITECT",
        "summary": "The algorithmic trade-off between search recall accuracy, query latency, and RAM memory consumption for GenAI RAG applications.",
        "details": "HNSW (Hierarchical Navigable Small World) constructs a multi-layered geometric graph, enabling sub-5ms search latencies and 98%+ recall by navigating skip-list style connections; however, the graph must reside entirely in RAM. IVF (Inverted File Index) partitions vector space into Voronoi cells via k-means clustering, requiring significantly less memory but suffering lower recall."
    },
    {
        "id": "mc-20",
        "title": "In-Process Analytics Revolution: DuckDB + Polars via Apache Arrow Zero-Copy",
        "subdomain": "compute-engines",
        "difficulty": "ARCHITECT",
        "summary": "Replacing distributed Spark clusters with single-node vectorized engines for sub-500GB datasets, exchanging memory via Apache Arrow zero-copy.",
        "details": "For workloads under 500GB, distributed clusters spend more time on network serialization, task scheduling, and node coordination than actual data processing. Polars uses multi-threaded Rust execution to saturate all machine cores, while DuckDB provides an embedded SQL OLAP engine. Interoperability via the Apache Arrow C Data Interface allows zero-copy DataFrame sharing, cutting costs by 90%."
    }
]

for c in new_modern_concepts:
    if c['id'] not in existing_concept_ids:
        concepts_data.append(c)

with open(CONCEPTS_FILE, 'w') as f:
    json.dump(concepts_data, f, indent=2)
print(f"Modern Concepts: {len(concepts_data)} total")

# 4. Update data_cheatsheet.json
CHEATSHEET_FILE = 'src/data/json/data_cheatsheet.json'
with open(CHEATSHEET_FILE, 'r') as f:
    cs_data = json.load(f)

existing_cs_ids = {item['id'] for item in cs_data}
new_cheatsheet_items = [
    {
        "id": "cs-synapse-skew-wlm",
        "title": "Synapse Data Skew Diagnosis & Distribution Rebuild",
        "category": "Azure Synapse",
        "categorySlug": "azure-synapse",
        "impact": "Critical",
        "effort": "Low Effort",
        "problem": "Synapse Dedicated query hangs at 98% execution or runs 10x slower than normal due to data skew across 60 distributions.",
        "solution": "Run DBCC PDW_SHOWSPACEUSED to identify skewed distributions where one distribution holds >20% of total rows. Create a high-cardinality synthetic hash key and rebuild the table with CTAS.",
        "codeSnippet": "-- 1. Check row distribution across all 60 distributions\nDBCC PDW_SHOWSPACEUSED('dbo.FactSales');\n\n-- 2. Identify skewed column and rehash table on synthetic composite key\nCREATE TABLE dbo.FactSales_Rehashed\nWITH (\n    DISTRIBUTION = HASH(CompositeKey),\n    CLUSTERED COLUMNSTORE INDEX\n)\nAS SELECT *, CONCAT(CustomerId, '_', OrderId) AS CompositeKey\nFROM dbo.FactSales;\n\n-- 3. Swap tables via atomic metadata rename\nRENAME OBJECT dbo.FactSales TO FactSales_Old;\nRENAME OBJECT dbo.FactSales_Rehashed TO FactSales;",
        "language": "sql",
        "whyItMatters": "Because MPP execution speed is strictly bounded by the slowest distribution, a single skewed node degrades performance for the entire cluster regardless of DWU scale.",
        "metrics": "Eliminates straggler tasks, 8x-15x query acceleration",
        "antiPattern": "Hashing on low-cardinality columns (e.g. CountryCode where 90% is 'US') or hashing on nullable columns.",
        "tags": ["Synapse", "MPP", "Data Skew", "Columnstore", "DBCC", "Performance"]
    },
    {
        "id": "cs-fabric-directlake-tshoot",
        "title": "Fabric Direct Lake Mode Fallback Troubleshooting",
        "category": "Microsoft Fabric",
        "categorySlug": "microsoft-fabric",
        "impact": "High Impact",
        "effort": "Low Effort",
        "problem": "Power BI dashboard suddenly drops from sub-second latency to 15-second timeouts due to silent fallback from Direct Lake to DirectQuery.",
        "solution": "Inspect DAX Studio server timings for DirectQuery fallback events. Pre-compute DAX calculated columns upstream in Spark/dbt, strip high-cardinality decimal strings, and enforce RLS in the Semantic Model rather than Lakehouse SQL endpoint.",
        "codeSnippet": "-- 1. In DAX Studio, verify Direct Lake query events\n-- Query: Check if event 'Direct Lake' or 'DirectQuery' is triggered\n\n-- 2. Upstream Spark optimization: Pre-calculate all DAX calculated columns\ndf_silver = spark.read.table('silver_orders')\ndf_gold = df_silver.withColumn(\n    'gross_margin',\n    (F.col('revenue') - F.col('cost')) / F.col('revenue')\n)\ndf_gold.write.format('delta').mode('overwrite').saveAsTable('gold_orders')\n\n-- 3. Set V-Order on Delta table to optimize VertiPaq in-memory paging\n-- spark.conf.set('spark.sql.parquet.vorder.enabled', 'true')",
        "language": "python",
        "whyItMatters": "DirectQuery mode forces runtime translation to SQL queries against the SQL endpoint, causing CPU saturation on Fabric capacities and dashboard timeouts.",
        "metrics": "Restores sub-second VertiPaq memory paging",
        "antiPattern": "Creating complex DAX calculated columns in Direct Lake semantic models or applying unsupported RLS on Lakehouse tables.",
        "tags": ["Fabric", "Power BI", "Direct Lake", "VertiPaq", "DirectQuery", "V-Order"]
    },
    {
        "id": "cs-cosmos-ru-tuning",
        "title": "Cosmos DB HTTP 429 Surge & Synthetic Key Runbook",
        "category": "NoSQL Architecture",
        "categorySlug": "nosql-architecture",
        "impact": "Critical",
        "effort": "Medium Effort",
        "problem": "Cosmos DB client throws HTTP 429 (RequestRateTooLarge) errors despite provisioned RU/s appearing sufficient in Azure Monitor.",
        "solution": "Locate the hot partition causing 10,000 RU/s saturation. Re-partition the container using a synthetic key appending a randomized or modulus hash suffix, and exclude high-cardinality audit fields from automatic indexing.",
        "codeSnippet": "// 1. Generate Synthetic Partition Key on document write\nfunction buildSyntheticPartitionKey(tenantId, userId) {\n  const shardSuffix = Math.abs(hashCode(userId)) % 10;\n  return `${tenantId}_${shardSuffix}`; // Disperses writes across 10 physical partitions\n}\n\n// 2. Azure Cosmos DB Client Bulk Executor with Exponential Backoff\nconst client = new CosmosClient({\n  endpoint: process.env.COSMOS_ENDPOINT,\n  key: process.env.COSMOS_KEY,\n  connectionPolicy: {\n    retryOptions: {\n      maxRetryAttemptCount: 9,\n      fixedRetryIntervalInMilliseconds: 1000,\n      maxWaitTimeInSeconds: 30\n    }\n  }\n});",
        "language": "javascript",
        "whyItMatters": "Cosmos DB enforces a hard ceiling of 10,000 RU/s and 50GB per physical partition. If traffic is skewed to a single partition key, that partition throttles while the rest of the capacity sits idle.",
        "metrics": "Eliminates HTTP 429 throttling, cuts RU waste by 60%",
        "antiPattern": "Partitioning by static category fields with uneven cardinality, or issuing cross-partition fan-out queries without partition key filter.",
        "tags": ["Cosmos DB", "NoSQL", "RU/s", "HTTP 429", "Synthetic Key", "Performance"]
    },
    {
        "id": "cs-deltalake-vacuum-opt",
        "title": "Delta Lake & Iceberg VACUUM Compaction Runbook",
        "category": "Storage & Formats",
        "categorySlug": "storage-formats",
        "impact": "High Impact",
        "effort": "Low Effort",
        "problem": "Lakehouse storage bills grow uncontrollably and query scan times increase due to millions of dead Parquet file snapshots and small micro-files.",
        "solution": "Execute OPTIMIZE with Liquid Clustering / Z-Ordering on primary join keys, followed by VACUUM to purge historical commit snapshots older than retention threshold.",
        "codeSnippet": "-- 1. Compact small files into optimal 128MB-512MB chunks & cluster by join keys\nOPTIMIZE gold.fact_orders\nZORDER BY (customer_id, order_date);\n\n-- 2. Verify retention threshold before purging\n-- Note: Default safety threshold is 168 hours (7 days)\nVACUUM gold.fact_orders RETAIN 168 HOURS;\n\n-- 3. Dry run check: count files eligible for deletion without deleting\nVACUUM gold.fact_orders RETAIN 168 HOURS DRY RUN;",
        "language": "sql",
        "whyItMatters": "Every lakehouse ACID mutation creates new immutable Parquet files. Without periodic VACUUM, old file versions remain in object storage indefinitely, causing massive storage inflation.",
        "metrics": "30%-50% storage cost reduction, 4x faster file pruning",
        "antiPattern": "Running VACUUM RETAIN 0 HOURS in production, which corrupts concurrent active read queries with FileNotFoundException.",
        "tags": ["Delta Lake", "Iceberg", "VACUUM", "OPTIMIZE", "Z-Order", "FinOps"]
    }
]

for item in new_cheatsheet_items:
    if item['id'] not in existing_cs_ids:
        cs_data.append(item)

with open(CHEATSHEET_FILE, 'w') as f:
    json.dump(cs_data, f, indent=2)
print(f"Cheatsheet: {len(cs_data)} total")

# 5. Update questions.json
QUESTIONS_FILE = 'src/data/json/questions.json'
with open(QUESTIONS_FILE, 'r') as f:
    q_data = json.load(f)

existing_q_ids = {item['id'] for item in q_data}
new_questions = [
    {
        "id": "q-synapse-mpp-001",
        "source": "Core Architect",
        "category": "AZURE SYNAPSE",
        "niche": "MPP 60-Distribution Architecture & DMS Shuffle",
        "difficulty": "ARCHITECT",
        "question": "Explain the architectural invariant of the 60 distributions in Azure Synapse Dedicated SQL Pools. How does compute scale from DW100c to DW30000c, and what causes Data Movement Service (DMS) shuffles?",
        "answer": "In Azure Synapse Dedicated SQL Pools, data storage is decoupled from compute and is partitioned into exactly 60 underlying Azure Storage distributions regardless of performance tier:\n\n1. Compute Node Mapping: At DW100c-DW500c, a single Compute Node controls all 60 distributions. At DW1000c, 2 nodes control 30 distributions each. At DW6000c, 12 nodes manage 5 each. At DW30000c, 60 independent compute nodes manage exactly 1 distribution each, maximizing hardware parallel throughput.\n\n2. DMS Data Movement: When joining two tables, if both are HASH distributed on the exact same join key with identical data types, the join is 'Co-located'—compute nodes execute joins locally with zero network I/O. However, if tables are joined on different keys, or if one is Round-Robin, the Data Movement Service (DMS) must shuffle or broadcast rows across the compute fabric during query runtime, creating significant network bottlenecks.",
        "domain": "Architecture & Strategy",
        "subdomain": "Data Warehousing & MPP Systems"
    },
    {
        "id": "q-fabric-directlake-001",
        "source": "Core Architect",
        "category": "FABRIC",
        "niche": "Direct Lake Architecture & Fallback Prevention",
        "difficulty": "ARCHITECT",
        "question": "How does Power BI Direct Lake mode fundamentally differ from Import and DirectQuery modes in Microsoft Fabric, and what causes silent fallback to DirectQuery?",
        "answer": "Power BI Direct Lake mode is a transformative hybrid storage mode in Microsoft Fabric:\n\n1. How it Works: Rather than executing scheduled overnight refreshes into a proprietary VertiPaq .pbix cache (Import mode) or translating DAX to T-SQL queries at visual render time (DirectQuery mode), Direct Lake allows the VertiPaq engine to page Delta Parquet columnar files directly from OneLake into RAM on demand. It delivers sub-second query performance over multi-billion row tables while reflecting upstream Delta commits instantly.\n\n2. DirectQuery Fallback Triggers: Direct Lake falls back to DirectQuery if the model size exceeds the F-SKU memory threshold, if Row-Level Security (RLS) is applied on the Lakehouse SQL endpoint, or if DAX calculated columns cannot be vectorized directly from Delta Parquet. To prevent fallback, pre-calculate columns in Spark/dbt, apply RLS inside the Semantic Model, and optimize table columns with V-Order.",
        "domain": "Analytics & Consumption",
        "subdomain": "Semantic Layer & BI Integration"
    },
    {
        "id": "q-fabric-smoothing-001",
        "source": "Core Architect",
        "category": "FABRIC",
        "niche": "Capacity Smoothing, Bursting & FinOps",
        "difficulty": "ARCHITECT",
        "question": "Describe Microsoft Fabric's Capacity Smoothing and Bursting algorithms. How does a 24-hour moving evaluation window protect against compute throttling during batch pipeline execution?",
        "answer": "Fabric capacity is measured in Capacity Units (CUs) packaged into F-SKUs (e.g., F64 = 64 CUs). Fabric replaces traditional peak-provisioned hardware with an intelligent Smoothing algorithm:\n\n1. Smoothing Windows: Workloads are categorized into Interactive (Power BI visual interactions, smoothed over 5 minutes) and Background (Spark batch jobs, Data Factory copy activities, smoothed over 24 hours). A 10-minute high-load batch pipeline consuming 2,400 CU-seconds is divided across 86,400 seconds (24 hours), adding only 0.027 CUs/sec to background consumption.\n\n2. Capacity Bursting & Throttling: If the overall Azure tenant has excess capacity, Fabric allows jobs to burst beyond provisioned CUs. If sustained consumption exceeds 100% of capacity over the window, Fabric enforces progressive throttling: Stage 1: Interactive Delay (60s visual lag); Stage 2: Interactive Rejection (dashboards fail; batch continues); Stage 3: Total Rejection (all compute paused).",
        "domain": "Compute & Orchestration",
        "subdomain": "Serverless & Cloud Platforms"
    },
    {
        "id": "q-cosmos-ru-001",
        "source": "Core Architect",
        "category": "GENERAL DE",
        "niche": "Cosmos DB Request Units (RU/s) & Synthetic Partitioning",
        "difficulty": "ARCHITECT",
        "question": "What is the Request Unit (RU/s) financial model in Azure Cosmos DB? How do you diagnose hot partitions, and why do writes cost significantly more RUs than reads?",
        "answer": "In Azure Cosmos DB, 1 Request Unit (RU) corresponds to the compute, memory, and IOPS required to perform a 1KB point read:\n\n1. Write vs Read RU Disparity: A 1KB point read costs exactly 1 RU. A 1KB write costs 5-10 RUs. Writes require synchronous quorum commit across 4 local replicas (Paxos consensus) and automatic inversion/updating of the container's inverted index for all document properties.\n\n2. Hot Partition Diagnosis: Each physical partition has a hard limit of 50GB storage and 10,000 RU/s. When traffic concentrates on a single partition key value, that physical partition reaches 10,000 RU/s and responds with HTTP 429 (Too Many Requests), even if total provisioned container capacity is 100,000 RU/s. Mitigation requires synthetic composite keys (`TenantId_yyyyMM_hash`) to scatter write traffic evenly across physical partition ranges.",
        "domain": "Data Storage & Management",
        "subdomain": "NoSQL & Distributed Databases"
    },
    {
        "id": "q-duckdb-polars-001",
        "source": "Core Architect",
        "category": "GENERAL DE",
        "niche": "In-Process Analytics: DuckDB & Polars vs Distributed Spark",
        "difficulty": "ARCHITECT",
        "question": "Under what dataset scale and workload characteristics should an enterprise data architecture choose in-process vectorized engines (DuckDB + Polars) over distributed Apache Spark?",
        "answer": "The architectural decision between in-process engines and distributed Spark is governed by dataset scale and network overhead:\n\n1. The Spark Overhead Threshold: For datasets under 500GB, distributed Spark clusters spend substantial time on JVM startup, node health heartbeats, and network shuffling across nodes. A 16-node Spark cluster running 2 hours daily costs ~$450/month in cloud infrastructure.\n\n2. In-Process Vectorization: Polars (written in Rust) saturates all CPU cores with multi-threaded parallel execution. DuckDB executes vectorized SQL queries out-of-core with minimal memory overhead. By exchanging memory pointers via the Apache Arrow C Data Interface with zero serialization overhead, a single 16-core Spot VM can process 500GB in 14 minutes for ~$1.40/month—a 95% reduction in cloud compute spend.",
        "domain": "Compute & Orchestration",
        "subdomain": "Modern Data Processing & Vectorization"
    }
]

for q in new_questions:
    if q['id'] not in existing_q_ids:
        q_data.append(q)

with open(QUESTIONS_FILE, 'w') as f:
    json.dump(q_data, f, indent=2)
print(f"Questions: {len(q_data)} total")

print("--- Synchronization Complete ---")
