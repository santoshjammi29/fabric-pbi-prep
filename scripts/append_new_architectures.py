import json

FILE = 'src/data/json/data_architecture.json'

with open(FILE, 'r') as f:
    data = json.load(f)
print(f"Before: {len(data)}")

existing_ids = {item['id'] for item in data}

new_blueprints = [
    {
        "id": "arch-kb-001",
        "source": "Enterprise Cloud Architecture",
        "category": "Real-Time Streaming & High-Throughput Ingestion",
        "niche": "50TB/Day E-Commerce Streaming Architecture",
        "difficulty": "ARCHITECT",
        "question": "Architect an end-to-end data platform capable of ingesting 50 Terabytes daily of real-time e-commerce clickstream, POS transactions, and inventory changes, satisfying <50ms checkout fraud scoring and sub-second executive BI visibility without overnight batch refresh lag.",
        "answer": "### 50TB/Day Real-Time E-Commerce & Inventory Architecture\n\n1. **High-Throughput Ingestion Tier**:\n   - Deploy **Azure Event Hubs (Dedicated Tier)** partitioned across 64 dedicated partitions.\n   - Enforce schema contracts using **Apache Avro** with a centralized Schema Registry. Poison pills route to an Azure Blob Dead Letter Queue (DLQ).\n\n2. **Stateful Streaming & Fraud Scoring**:\n   - **Apache Flink** consumes from Event Hubs with a RocksDB state backend.\n   - Maintains a 15-minute sliding session window to identify cart abandonment and rapid brute-force credential stuffing.\n   - ML scoring queries user behavioral baselines cached in **Azure Cosmos DB** via point-reads (<10ms SLA, 1 RU cost).\n\n3. **Transactional Serving Layer**:\n   - Cart state and customer profile data are hosted in **Azure Cosmos DB (Autoscale RU/s)** with synthetic partition keys (`Country_UserId`) to prevent hot partition throttling.\n   - Flash inventory counters decrement atomically in **Redis Enterprise**.\n\n4. **Analytical Lakehouse & Direct Lake BI**:\n   - Flink streams micro-batches directly to **Microsoft Fabric OneLake** committing as ACID Delta Parquet tables every 60 seconds.\n   - Executive dashboards connect via **Power BI Direct Lake mode**, paging Delta columnar Parquet directly into VertiPaq memory without ETL refresh."
    },
    {
        "id": "arch-kb-002",
        "source": "Enterprise Cloud Architecture",
        "category": "Data Platform Migration & Modernization",
        "niche": "Zero-Downtime Synapse to Fabric Migration",
        "difficulty": "ARCHITECT",
        "question": "Design a zero-downtime, risk-free enterprise migration strategy to migrate a mission-critical 400TB warehouse from Azure Synapse Dedicated SQL Pool (DW3000c) to Microsoft Fabric Lakehouse and Warehouse, eliminating $18,000/month in idle compute costs.",
        "answer": "### Zero-Downtime Synapse Dedicated to Microsoft Fabric Migration\n\n1. **Phase 1: Zero-Copy Discovery & Coexistence via OneLake Shortcuts**:\n   - Point Fabric OneLake Shortcuts directly to existing ADLS Gen2 storage accounts used by Synapse.\n   - Immediately enables read access in Fabric without physically duplicating 400TB of data or incurring network egress fees.\n\n2. **Phase 2: Schema Migration & T-SQL Refactoring**:\n   - Extract Synapse metadata using the **Fabric Migration Assistant** (DACPAC export).\n   - Refactor DDL: Strip Synapse-specific syntax (`WITH (DISTRIBUTION = HASH(...), CLUSTERED COLUMNSTORE INDEX)`), as Fabric handles distribution and V-Order indexing automatically.\n   - Convert sequential `IDENTITY` keys to window functions or surrogate hashes.\n\n3. **Phase 3: Parallel Run & Automated Parity Validation**:\n   - Pipeline dual-writes incoming daily batches to both Synapse DW and Fabric Warehouse.\n   - Run an automated PySpark reconciliation notebook comparing row counts, column nullability, and financial metrics (`SUM(DebitAmount) == SUM(CreditAmount)`).\n\n4. **Phase 4: Cutover & Immediate Cost Reduction**:\n   - Switch Power BI Semantic Models from Synapse DirectQuery to Fabric **Direct Lake mode**.\n   - Terminate the Synapse DW3000c pool, cutting monthly compute costs from $18,000/month to an autopaused Fabric F64 capacity (~$5,000/month)."
    },
    {
        "id": "arch-kb-003",
        "source": "Enterprise Cloud Architecture",
        "category": "Modern NoSQL & Vector Architecture",
        "niche": "Cosmos DB Request Units (RU/s) & HTAP Optimization",
        "difficulty": "ARCHITECT",
        "question": "A banking platform experiences recurring HTTP 429 throttling and a $40,000/month Azure Cosmos DB bill during monthly statement generation. How do you re-architect the data model, partitioning strategy, and analytical pipeline to resolve throttling and reduce cost by 70%?",
        "answer": "### Cosmos DB Performance & FinOps Remediation Architecture\n\n1. **Root Cause Analysis**:\n   - **Hot Partitions**: Statement queries filtered on `TenantId` with low cardinality, saturating the 10,000 RU/s limit on a single physical partition.\n   - **Unbounded Cross-Partition Fan-Out**: Ad-hoc analytical queries scanned all physical partitions, consuming 2,000+ RUs per query.\n   - **Heavy Indexing Overhead**: Default Cosmos indexing policy indexed all string properties, multiplying write costs by 8x.\n\n2. **Partitioning & Synthetic Key Refactoring**:\n   - Introduce a composite synthetic partition key: `TenantId_AccountType_yyyyMM`.\n   - Guarantees monthly statement generation targets a single physical partition, while dispersing concurrent writes across independent partition ranges.\n\n3. **Index Policy Tuning**:\n   - Switch to targeted indexing: exclude high-cardinality nested payloads (e.g. raw XML/JSON audit blobs) using `/*` exclude and explicit path inclusions.\n   - Cuts write RU cost from 12 RUs to 4 RUs per document write.\n\n4. **Zero-RU Analytics via Synapse Link / Fabric Mirroring**:\n   - Enable **Cosmos DB Analytical Store** (lock-free background sync to columnar format in <2 minutes).\n   - Direct all statement aggregation queries to **Synapse Serverless SQL** or **Fabric Mirroring**, consuming **0 Transactional RU/s** and saving over $28,000/month."
    },
    {
        "id": "arch-kb-004",
        "source": "Enterprise Cloud Architecture",
        "category": "Modern ETL/ELT & Compute Engines",
        "niche": "In-Process Analytics: DuckDB & Polars vs Distributed Spark",
        "difficulty": "ARCHITECT",
        "question": "When should an enterprise data architecture choose in-process analytics engines (DuckDB + Polars) over distributed Apache Spark, and how do you design a hybrid pipeline processing 500GB daily on spot instances for under $200/month?",
        "answer": "### In-Process Analytics (DuckDB + Polars) Architectural Blueprint\n\n1. **The Spark Overhead Problem**:\n   - For datasets <500GB, distributed Spark clusters spend 60% of job execution time on JVM startup, node health heartbeats, and network shuffling across nodes.\n   - A 16-node Spark cluster running 2 hours daily costs ~$450/month, plus management complexity.\n\n2. **The In-Process Vectorized Architecture**:\n   - Run containerized jobs on a single memory-optimized **Azure Spot VM** (e.g., `Standard_E16ds_v5` with 16 vCPUs and 128GB RAM at 80% spot discount, ~$0.20/hour).\n   - **Polars** uses multi-threaded Rust execution to saturate all 16 cores, reading raw Parquet files from ADLS Gen2 with zero-copy Apache Arrow memory representation.\n   - **DuckDB** executes complex analytical SQL window functions and aggregations out-of-core directly over the Arrow memory buffers without serialization overhead.\n\n3. **Performance & Financial Metrics**:\n   - 500GB of compressed Parquet is processed, cleaned, and aggregated in **14 minutes**.\n   - Monthly compute spend: 14 mins * 30 days = 7 hours total monthly runtime * $0.20/hr = **$1.40/month** in compute costs versus $450/month in Spark cluster bills!"
    },
    {
        "id": "arch-kb-005",
        "source": "Enterprise Cloud Architecture",
        "category": "Modern NoSQL & Vector Architecture",
        "niche": "Enterprise GenAI / RAG Multi-Tenant Vector Database",
        "difficulty": "ARCHITECT",
        "question": "Architect a secure, multi-tenant Legal AI Copilot indexing 10 million legal contracts. Address document chunking, hybrid vector search (HNSW + BM25), metadata tenant isolation, and sub-500ms retrieval latency.",
        "answer": "### Multi-Tenant Legal RAG & Vector Architecture\n\n1. **Semantic Document Ingestion**:\n   - Ingest contracts and briefs via **Azure AI Document Intelligence** to extract markdown tables, clauses, and headers.\n   - Implement **Structural Semantic Chunking**: split documents at logical clause boundaries (`### Section N`) with 512 token chunks and 64 token overlap, preventing split sentences across key liability terms.\n\n2. **Hybrid Retrieval Strategy (Dense + Sparse)**:\n   - Pure vector search fails on precise legal citations (e.g. searching 'Rule 10b-5(b)').\n   - Combine **Azure OpenAI text-embedding-3-large (3072 dimensions)** with sparse **BM25 lexical scoring** using **Reciprocal Rank Fusion (RRF)**.\n\n3. **Multi-Tenant Single-Stage Filtering in Vector DB**:\n   - Deploy **Qdrant** or **Azure Cosmos DB Vector Search** configured with **HNSW (m=16, ef_construct=200)**.\n   - Enforce single-stage payload filtering directly within graph traversal (`filter: { must: [{ key: 'tenant_id', match: 'matter_1092' }] }`), preventing cross-tenant data leakage before vector ranking occurs.\n\n4. **Reranking & Grounded Generation**:\n   - Top 25 candidates pass through a **Cross-Encoder / Cohere Reranker** down to Top 5 most semantically relevant passages.\n   - Prompt assembled with strict grounding system instructions sent to GPT-4o, achieving 99.2% citation accuracy with sub-450ms P95 latency."
    },
    {
        "id": "arch-kb-006",
        "source": "Enterprise Cloud Architecture",
        "category": "Big Data FinOps & Cost Optimization",
        "niche": "Serverless vs Provisioned Analytical Break-Even Model",
        "difficulty": "ARCHITECT",
        "question": "Establish an enterprise FinOps framework for data platform compute. Detail the mathematical break-even point between Serverless query models ($5/TB scanned) and Provisioned Capacity (Fabric F-SKUs / Dedicated DWUs), including storage lifecycle tiering and ZSTD compression strategies.",
        "answer": "### Enterprise Big Data FinOps Mathematical Framework\n\n1. **The Serverless vs Provisioned Analytical Break-Even Formula**:\n   - **Serverless Model**: Billed strictly at $5.00 per TB scanned (Synapse Serverless SQL, Athena, BigQuery on-demand).\n   - **Provisioned Model**: An F64 Fabric Capacity running 24/7 with 1-year Reserved Instance discount costs ~$4,200/month (~$5.75/hr).\n   - **Break-Even Tipping Point**:\n     $$\\text{Break-Even Scan Volume} = \\frac{\\$4,200}{\\$5.00/\\text{TB}} = 840\\text{ TB/month} \\approx 28\\text{ TB/day}$$\n   - **Rule**: If analytical query workloads scan <28 TB/day, Serverless delivers superior ROI; if workloads scan >28 TB/day, Provisioned Reserved Capacity yields up to 60% lower cost per query.\n\n2. **Storage Tiering Lifecycle Policies**:\n   - Bronze Raw Data: Hot Tier for 30 days ($0.018/GB) -> Cool Tier for 60 days ($0.010/GB) -> Archive Tier after 90 days ($0.00099/GB).\n   - Cuts storage expenses by up to 88% on historical regulatory data.\n\n3. **Parquet Compression & Compaction**:\n   - Convert standard Snappy compression to **Zstandard (ZSTD Level 7)** in Gold storage, cutting file size by 38% with zero noticeable impact on query decompression.\n   - Schedule automated Delta/Iceberg `VACUUM RETAIN 168 HOURS` to delete unreferenced historical snapshots, stopping dead storage cost accumulation."
    }
]

for b in new_blueprints:
    assert b['id'] not in existing_ids, f"Duplicate ID: {b['id']}"

data.extend(new_blueprints)

with open(FILE, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"After: {len(data)} (+{len(new_blueprints)} blueprints)")
