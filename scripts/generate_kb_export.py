import json
import os
from datetime import datetime

OUTPUT_PATH = "docs/knowledge-base/knowledge_base_export.json"

export_data = {
    "version": "2026.1.0",
    "exported_at": datetime.utcnow().isoformat() + "Z",
    "title": "Enterprise Cloud Data Platform & Architecture Knowledge Base",
    "description": "Production-grade technical reference covering Azure Synapse Analytics, Microsoft Fabric, Modern NoSQL & Vector DBs, Stream & Batch ETL/ELT, Big Data FinOps, and Architectural Practice Walkthroughs.",
    "standards_adherence": [
        "Microsoft Cloud Adoption Framework (CAF)",
        "Microsoft Azure Well-Architected Framework (WAF)",
        "Microsoft Fabric Customer Advisory Team (CAT) Production Blueprints",
        "Data Mesh & Medallion Lakehouse Industry Reference Patterns"
    ],
    "modules": [
        {
            "id": "module-01-synapse",
            "title": "Azure Synapse Analytics Architectural Deep-Dive",
            "slug": "01_azure_synapse_architecture",
            "summary": "Massively Parallel Processing (MPP) engine, 60-distribution invariant, Clustered Columnstore rowgroup health, Workload Management (WLM), Serverless SQL $5/TB FinOps, and Synapse Link HTAP.",
            "keywords": ["Azure Synapse", "MPP", "Dedicated SQL Pool", "Serverless SQL", "Synapse Link", "HTAP", "WLM", "Columnstore", "60 Distributions"]
        },
        {
            "id": "module-02-fabric",
            "title": "Microsoft Fabric Architectural Mastery",
            "slug": "02_microsoft_fabric_mastery",
            "summary": "Unified SaaS paradigm, OneLake Shortcuts, Lakehouse vs Warehouse decision matrix, Direct Lake Power BI sub-second performance, Eventhouse KQL, F-SKU capacity smoothing and bursting, and Synapse migration.",
            "keywords": ["Microsoft Fabric", "OneLake", "Shortcuts", "Direct Lake", "Lakehouse", "Data Warehouse", "KQL Eventhouse", "F-SKU", "Smoothing", "Bursting"]
        },
        {
            "id": "module-03-nosql-vector",
            "title": "Modern NoSQL & Vector Databases at Scale",
            "slug": "03_modern_nosql_and_vector_databases",
            "summary": "Cosmos DB Request Units (RU/s) optimization, multi-region active writes, ScyllaDB C++ vs JVM Cassandra, DynamoDB single-table design, and Vector Databases (Qdrant, Milvus, pgvector) for enterprise RAG.",
            "keywords": ["NoSQL", "Cosmos DB", "ScyllaDB", "Cassandra", "DynamoDB", "Vector Database", "Qdrant", "pgvector", "RAG", "HNSW", "RU/s"]
        },
        {
            "id": "module-04-modern-etl",
            "title": "Modern ETL/ELT & Stream Processing at Scale",
            "slug": "04_modern_etl_elt_applications",
            "summary": "In-process analytics revolution with DuckDB + Polars, Spark 3.5 vs Flink streaming vs Trino federation, Delta Lake UniForm vs Iceberg vs Hudi, Dagster asset orchestration, and dbt Mesh governance.",
            "keywords": ["ETL", "ELT", "DuckDB", "Polars", "Apache Spark", "Apache Flink", "Trino", "Apache Iceberg", "Delta Lake", "Dagster", "Airflow", "dbt Mesh"]
        },
        {
            "id": "module-05-finops",
            "title": "Big Data FinOps: Cost-Effective & Revenue-Generating Architectures",
            "slug": "05_revenue_generating_vs_cost_effective_finops",
            "summary": "Total Cost of Ownership (TCO) breakdown, Serverless vs Provisioned break-even formulas, ZSTD compression, Lakehouse vacuuming, customer-facing embedded analytics monetization, and the $3k/month 10TB/day blueprint.",
            "keywords": ["FinOps", "TCO", "Serverless vs Provisioned", "Storage Tiering", "ZSTD", "Vacuum", "Embedded Analytics", "Monetization", "Cost Optimization"]
        },
        {
            "id": "module-06-practice-walkthroughs",
            "title": "Architectural Practice & Real-World Walkthroughs",
            "slug": "06_architectural_practice_walkthroughs",
            "summary": "6 comprehensive enterprise production walkthroughs: 50TB/day E-Commerce clickstream, Synapse-to-Fabric zero-downtime migration, Financial fraud AML, Healthcare HIPAA data mesh, Enterprise GenAI RAG, and multi-tenant SaaS analytics.",
            "keywords": ["Architecture Practice", "Walkthrough", "Migration Playbook", "GenAI RAG", "Real-Time Streaming", "Fraud Detection", "Decision Trees", "Runbooks"]
        }
    ],
    "architectural_blueprints": [
        {
            "id": "bp-ecom-clickstream-50tb",
            "title": "50TB/Day Real-Time E-Commerce Clickstream & Inventory Orchestration",
            "category": "REAL_TIME_STREAMING",
            "target_sla": "<50ms fraud scoring; <5min cart abandonment; sub-second executive BI",
            "components": [
                {"name": "Ingestion", "tech": "Azure Event Hubs (Dedicated 64 Partitions) + Avro"},
                {"name": "Stream Engine", "tech": "Apache Flink with RocksDB state backend"},
                {"name": "Operational Store", "tech": "Azure Cosmos DB (Autoscale RU/s) + Redis Enterprise"},
                {"name": "Lakehouse Analytics", "tech": "Microsoft Fabric OneLake (Delta Lake) + Power BI Direct Lake"}
            ],
            "key_tradeoffs": [
                "Chose Flink over micro-batch Spark for true sub-second event-time sessionization.",
                "Used Cosmos DB synthetic keys (Country_UserId) to completely prevent hot partition throttling.",
                "Direct Lake bypassed traditional overnight Power BI refreshes, directly paging Delta files from OneLake."
            ],
            "failure_recovery": "Kafka lag alerts trigger dynamic Flink task slot scaling; unprocessable poison pills route to Dead Letter Queue (DLQ) in Azure Blob."
        },
        {
            "id": "bp-synapse-fabric-migration",
            "title": "Zero-Downtime Enterprise Migration from Synapse Dedicated Pool to Fabric",
            "category": "DATA_MIGRATION",
            "target_sla": "Zero downtime; 100% KPI reconciliation; 50% monthly compute cost reduction",
            "components": [
                {"name": "Legacy Source", "tech": "Azure Synapse Dedicated SQL Pool (DW3000c)"},
                {"name": "Discovery & Coexistence", "tech": "OneLake Shortcuts to existing ADLS Gen2 storage"},
                {"name": "Transformation Target", "tech": "Microsoft Fabric Data Warehouse + Lakehouse"},
                {"name": "Validation Engine", "tech": "PySpark Automated Mathematical Reconciliation Script"},
                {"name": "BI Consumption", "tech": "Power BI Direct Lake Mode"}
            ],
            "key_tradeoffs": [
                "Used Parallel Run validation over 2 billing cycles rather than risky big-bang cutover.",
                "Stripped proprietary Synapse HASH distributions and Columnstore DDL clauses in Fabric Warehouse.",
                "Saved $18,000/month by terminating DW3000c and rightsizing to Fabric F64 with auto-pause."
            ],
            "failure_recovery": "Dual-writing during validation guarantees instant rollback to Synapse if KPI reconciliation fails."
        },
        {
            "id": "bp-genai-enterprise-rag",
            "title": "Enterprise Multi-Tenant Legal RAG Platform with Vector Database",
            "category": "GENAI_VECTOR_SEARCH",
            "target_sla": "Sub-500ms query retrieval; zero hallucination; strict tenant isolation",
            "components": [
                {"name": "Document Parsing", "tech": "Azure AI Document Intelligence (Layout aware)"},
                {"name": "Embeddings", "tech": "Azure OpenAI text-embedding-3-large (3072 dimensions)"},
                {"name": "Vector Store", "tech": "Qdrant Distributed / Azure Cosmos DB Vector (HNSW)"},
                {"name": "Retrieval Engine", "tech": "Hybrid Dense Vector + BM25 Sparse Lexical Search with Cohere Rerank"},
                {"name": "Generation", "tech": "GPT-4o with Grounded Markdown Citations"}
            ],
            "key_tradeoffs": [
                "Used Semantic Markdown Chunking by legal headers rather than fixed token character count.",
                "Hybrid search ensures precise statute numbers (e.g. 'IRS Code 409A') are not lost in vector distance.",
                "Enforced single-stage payload filtering in Qdrant for strict multi-tenant data governance."
            ],
            "failure_recovery": "Fallback to BM25 keyword search if embedding API is throttled; Redis cache stores top 20% frequent queries."
        },
        {
            "id": "bp-cost-effective-10tb",
            "title": "Ultra-Cost-Effective 10TB/Day Modern Data Platform (<$3,000/Month)",
            "category": "FINOPS_DATA_ENGINEERING",
            "target_sla": "10TB daily ingestion processed within 2-hour window; <$3,000 total cloud spend",
            "components": [
                {"name": "CDC Ingestion", "tech": "Open-source Debezium CDC on Spot Kubernetes"},
                {"name": "Raw Storage", "tech": "ADLS Gen2 Standard Blob with ZSTD Level 7 compression"},
                {"name": "In-Process Compute", "tech": "DuckDB + Polars containers on Spot Instances (Zero Spark cluster costs)"},
                {"name": "Curated Modeling", "tech": "dbt-core with Incremental Microbatch Strategy"},
                {"name": "Ad-Hoc Querying", "tech": "Azure Synapse Serverless SQL ($5/TB scanned with filepath partition pruning)"}
            ],
            "key_tradeoffs": [
                "Replaced 16-node Spark cluster with in-process DuckDB/Polars, cutting compute costs by 90%.",
                "Applied ZSTD compression and 7-day Delta VACUUM, reducing storage footprint by 40%.",
                "Single-region landing zone eliminated cross-AZ data egress charges entirely."
            ],
            "failure_recovery": "Spot instance terminations automatically caught by Kubernetes, rerunning idempotent dbt batches."
        }
    ],
    "key_architectural_concepts": [
        {
            "id": "synapse-60-distributions",
            "term": "Synapse 60-Distribution Architecture",
            "category": "AZURE SYNAPSE",
            "difficulty": "ARCHITECT",
            "definition": "The fixed architectural invariant in Synapse Dedicated SQL Pools where storage is divided into exactly 60 underlying Azure Storage distributions regardless of DWU compute tier.",
            "explanation": "Compute nodes dynamically bind to these 60 distributions based on DWU scale. At DW100c, 1 node controls all 60; at DW6000c, 12 nodes control 5 each; at DW30000c, 60 nodes control 1 distribution each. Table distribution selection (HASH vs REPLICATED vs ROUND_ROBIN) directly dictates whether the Data Movement Service (DMS) must shuffle data across nodes during query joins.",
            "keyPoints": [
                "HASH distribution maps rows to 1 of 60 shards via deterministic hashing on the distribution column.",
                "REPLICATED caches an exact copy of dimension tables (<2GB) on each compute node to eliminate shuffle.",
                "ROUND_ROBIN spreads rows evenly across 60 shards and is optimal for staging tables."
            ]
        },
        {
            "id": "fabric-onelake-shortcuts",
            "term": "OneLake Shortcuts & Zero-Copy Virtualization",
            "category": "MICROSOFT FABRIC",
            "difficulty": "ARCHITECT",
            "definition": "Embedded symbolic links inside Microsoft Fabric OneLake that expose external or cross-workspace cloud object storage (S3, ADLS Gen2, GCS) as native Lakehouse folders without data movement.",
            "explanation": "Shortcuts decouple physical storage ownership from computational analytics. An organization with existing multi-terabyte data lakes in AWS S3 or ADLS Gen2 can create a OneLake shortcut, allowing Fabric Spark, T-SQL Warehouses, and Power BI Direct Lake to query the data instantly. This eliminates custom ingestion pipelines, data duplication, and cross-cloud network egress fees.",
            "keyPoints": [
                "Acts as zero-copy virtualized storage pointing to S3, ADLS Gen2, Dataverse, or other OneLake workspaces.",
                "External data appears as native Delta tables or files inside Fabric compute engines.",
                "Radically accelerates migration by allowing dual-system coexistence without physical data replication."
            ]
        },
        {
            "id": "fabric-direct-lake",
            "term": "Power BI Direct Lake Mode",
            "category": "MICROSOFT FABRIC",
            "difficulty": "ARCHITECT",
            "definition": "A ground-breaking semantic model connectivity mode in Microsoft Fabric where Power BI's VertiPaq engine directly pages Delta Parquet columns from OneLake into memory without scheduled cache refreshes.",
            "explanation": "Direct Lake solves the historic compromise between Import Mode (blazing fast in-memory query, but slow multi-hour refresh lag and 10GB limits) and DirectQuery Mode (real-time data, but sluggish query performance and high SQL compute costs). Direct Lake delivers in-memory query performance on multi-billion row tables while reflecting data modifications instantly when upstream Spark or Warehouse jobs commit.",
            "keyPoints": [
                "VertiPaq directly reads Delta Parquet columnar chunks from OneLake storage into memory on demand.",
                "Eliminates scheduled data model refresh pipelines and duplicated in-memory caches.",
                "Falls back to DirectQuery if model memory limits are exceeded or unsupported features (like Lakehouse RLS) are hit."
            ]
        },
        {
            "id": "fabric-capacity-smoothing",
            "term": "Fabric Capacity Smoothing & Bursting",
            "category": "MICROSOFT FABRIC",
            "difficulty": "ARCHITECT",
            "definition": "The proprietary capacity allocation algorithm in Microsoft Fabric that averages background compute consumption over a 24-hour moving window to prevent job throttling during heavy workload spikes.",
            "explanation": "Traditional cloud compute requires provisioning for peak loads, leaving servers idle 80% of the day. Fabric smooths heavy batch tasks (Spark notebooks, Data Factory pipelines) across 24 hours, so a 15-minute high-CPU pipeline does not exhaust capacity or cause interactive Power BI dashboards to freeze. Capacity bursting allows jobs to temporarily draw additional Capacity Units (CUs) if the overall tenant is under-utilized.",
            "keyPoints": [
                "Background job consumption is smoothed over 24 hours; interactive queries smoothed over 5 minutes.",
                "Enables smaller, cost-effective F-SKUs (e.g. F32/F64) to successfully execute massive enterprise batch pipelines.",
                "Over-consumption beyond 100% triggers progressive throttling: Interactive Delay, Interactive Rejection, Total Rejection."
            ]
        },
        {
            "id": "cosmos-ru-optimization",
            "term": "Cosmos DB Request Units (RU/s) Engineering",
            "category": "MODERN NOSQL",
            "difficulty": "ARCHITECT",
            "definition": "The currency of compute, memory, and IOPS in Azure Cosmos DB, where 1 RU corresponds to the read of a 1KB document via self-link or point read.",
            "explanation": "Engineering high-scale Cosmos DB architectures requires understanding that writes cost 5-10x more RUs than reads due to synchronous 4-replica quorum commit and automatic index inversion. Autoscale RU/s automatically modulates capacity between 10% and 100% of maximum configured limits, preventing HTTP 429 throttling while cutting costs during off-peak hours by up to 70%.",
            "keyPoints": [
                "Point read (1KB) costs exactly 1 RU; writes cost 5-10 RUs depending on payload size and indexed fields.",
                "Physical partitions are capped at 50GB and 10,000 RU/s; synthetic keys prevent hot partition exhaustion.",
                "Analytical Store with Synapse Link provides zero-RU operational analytics over transactional data."
            ]
        },
        {
            "id": "in-process-duckdb-polars",
            "term": "In-Process Analytics (DuckDB + Polars + Arrow)",
            "category": "MODERN ETL/ELT",
            "difficulty": "ARCHITECT",
            "definition": "The modern architectural pattern of replacing distributed Spark clusters with single-node vectorized engines (DuckDB and Polars) for datasets under 500GB, exchanging memory via Apache Arrow zero-copy.",
            "explanation": "For workloads under 500GB, distributed clusters spend more time on network serialization, task scheduling, and node coordination than actual data processing. Polars uses multi-threaded Rust execution to saturate all machine cores, while DuckDB provides an embedded SQL OLAP engine with out-of-core streaming algorithms. Interoperability via the Apache Arrow C Data Interface allows zero-copy DataFrame sharing, reducing ETL runtimes by 80% and cloud compute spend by 90%.",
            "keyPoints": [
                "Eliminates distributed cluster spin-up delays and network shuffle bottlenecks for sub-TB workloads.",
                "Apache Arrow provides shared-memory zero-copy serialization between Python, Rust, and C++ engines.",
                "Runs efficiently inside lightweight containers or spot VMs at a fraction of Spark/Databricks costs."
            ]
        },
        {
            "id": "vector-hnsw-vs-ivf",
            "term": "Vector Indexing Architecture: HNSW vs IVF",
            "category": "MODERN NOSQL",
            "difficulty": "ARCHITECT",
            "definition": "The fundamental algorithmic choice in Vector Databases governing the trade-off between search recall accuracy, query latency, and RAM memory consumption for GenAI RAG applications.",
            "explanation": "HNSW (Hierarchical Navigable Small World) constructs a multi-layered geometric graph of vectors, enabling sub-5ms search latencies and 98%+ recall by navigating skip-list style connections; however, the graph must reside entirely in RAM. IVF (Inverted File Index) partitions vector space into Voronoi cells via k-means clustering, requiring significantly less memory and faster index build times, but suffering lower recall on high-dimensional vectors.",
            "keyPoints": [
                "HNSW is the gold standard for high-accuracy, low-latency enterprise RAG (<5ms at 98% recall).",
                "IVF combined with Product Quantization (PQ) is preferred for massive billion-scale vector datasets where RAM is constrained.",
                "Modern vector DBs (Qdrant, Milvus) implement single-stage payload filtering to evaluate business metadata during graph traversal."
            ]
        },
        {
            "id": "bigdata-finops-serverless-breakeven",
            "term": "Serverless vs. Provisioned Analytical Break-Even Formula",
            "category": "FINOPS",
            "difficulty": "ARCHITECT",
            "definition": "The mathematical framework data architects use to evaluate when to transition from pay-per-scan serverless query models ($5/TB) to reserved compute capacity (Fabric F-SKUs or Synapse DWUs).",
            "explanation": "Serverless query engines (Synapse Serverless, Athena, BigQuery on-demand) charge strictly for data scanned ($5.00/TB). Provisioned capacity (Fabric F64 at ~$6,132/month) charges for continuous compute power. The mathematical break-even point is approximately 1,226 TB scanned per month (~40.8 TB scanned/day). Organizations scanning less than 40TB/day achieve lower TCO on Serverless; organizations scanning more than 40TB/day achieve massive unit cost reductions on Provisioned.",
            "keyPoints": [
                "Break-even threshold between $5/TB serverless and an F64 capacity is approximately 40.8 TB scanned/day.",
                "Storage lifecycle policies (Hot -> Cool -> Cold -> Archive) reduce long-term storage spend by up to 90%.",
                "ZSTD compression saves 35-45% storage and read bandwidth over standard Snappy compression on Parquet."
            ]
        }
    ]
}

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(export_data, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {OUTPUT_PATH}")
print(f"Modules: {len(export_data['modules'])}")
print(f"Blueprints: {len(export_data['architectural_blueprints'])}")
print(f"Concepts: {len(export_data['key_architectural_concepts'])}")
