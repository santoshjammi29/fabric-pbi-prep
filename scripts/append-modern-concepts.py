#!/usr/bin/env python3
"""
scripts/append-modern-concepts.py
Merges the 20 modern concepts into src/data/json/data_concepts.json
Ensures valid unique IDs, difficulty enums across EASY, MEDIUM, HARD, ARCHITECT,
and high-depth explanations and keyPoints.
"""

import json
import os
import sys

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data", "json")
CONCEPTS_FILE = os.path.join(DATA_DIR, "data_concepts.json")

NEW_CONCEPTS = [
    {
        "id": "cap-pacelc-modern-data-stores",
        "term": "CAP & PACELC Theorem in Modern Data Stores",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "HARD",
        "definition": "In a network partition (P), trade off Availability (A) vs Consistency (C). PACELC extends this: Else (E), trade off Latency (L) vs Consistency (C).",
        "explanation": "CAP applies during network partitions. PACELC handles normal operation: if no partition, choose between Latency and Consistency. Distributed warehouses like Snowflake prioritize strong consistency (C) while streaming engines like Kafka tune replica acks (acks=all vs acks=1) for latency vs safety.",
        "keyPoints": [
            "During network partitions, systems must choose between Availability and Consistency (CAP).",
            "In normal operating state (Else), distributed stores choose between Latency and Consistency (PACELC).",
            "Snowflake and Databricks Delta prioritize strong consistency, whereas NoSQL and streaming tune replication lag."
        ]
    },
    {
        "id": "parquet-vectorized-decoding",
        "term": "Parquet Vectorized Decoding & Predicate Pushdown",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "EASY",
        "definition": "SIMD-accelerated column decoding combined with metadata-driven row group skipping via min/max statistics.",
        "explanation": "Parquet files store min/max statistics per row group and column chunk. Engines like Photon or DuckDB read row group metadata to skip non-matching chunks before loading data, and use SIMD vector instructions to decode dictionary-encoded values directly into CPU registers.",
        "keyPoints": [
            "Row group metadata with min/max statistics enables disk and I/O pruning before reading columnar data.",
            "SIMD vectorized decoding loads dictionary-compressed values directly into CPU registers.",
            "Eliminates row-by-row deserialization overhead in modern vectorized query engines like Photon and Polars."
        ]
    },
    {
        "id": "iceberg-hidden-partitioning",
        "term": "Apache Iceberg Hidden Partitioning & Manifest List Architecture",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "EASY",
        "definition": "Decouples table partitioning from physical directory structures, avoiding Hive-style column path rewrites.",
        "explanation": "Iceberg uses a tree of metadata files: snapshot -> manifest list -> manifest files -> data files. Partition transforms (hours, days, bucket, truncate) are tracked in metadata, allowing queries to prune partitions without requiring users to supply explicit partition columns in WHERE clauses.",
        "keyPoints": [
            "Decouples partition transforms (days, hours, bucket) from physical storage folder structures.",
            "Hierarchical metadata tree (Snapshot -> Manifest List -> Manifest -> Data Files) prevents Hive directory scans.",
            "Allows partition evolution over time without rewriting historical data files or breaking existing queries."
        ]
    },
    {
        "id": "spark4-aqe-dynamic-shuffle",
        "term": "Spark 4.0 AQE Dynamic Shuffle Coalescing & Skew Join Mitigation",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "MEDIUM",
        "definition": "Runtime query plan adjustments based on actual shuffle statistics collected during stage execution.",
        "explanation": "Adaptive Query Execution (AQE) dynamically merges small post-shuffle partitions into optimal 64MB–128MB tasks, converts sort-merge joins to broadcast hash joins when build-side stats drop below threshold, and splits skewed partitions into sub-partitions to prevent single-straggler tasks.",
        "keyPoints": [
            "Dynamically coalesces small shuffle partitions into optimal target sizes (default 64MB-128MB).",
            "Converts Sort-Merge Joins into Broadcast Hash Joins on the fly when stage statistics drop below threshold.",
            "Splits skewed partitions into smaller sub-partitions to eliminate long-tail single-task stragglers."
        ]
    },
    {
        "id": "databricks-serverless-photon",
        "term": "Databricks Serverless Compute & Photon Vectorized C++ Engine",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "ARCHITECT",
        "definition": "Instant-on, fully managed C++ query engine separating cluster provisioning from SQL execution.",
        "explanation": "Databricks Serverless SQL delegates cluster lifecycle management to a warm pool. Photon, a native C++ engine, bypasses JVM GC overhead by executing vectorized operations over columnar memory layouts (Arrow/UnsafeRow) using hardware-level SIMD instructions.",
        "keyPoints": [
            "Decouples cluster lifecycle from workload execution with instant startup from pre-warmed virtual machine pools.",
            "Native C++ execution completely eliminates JVM garbage collection pauses on large memory workloads.",
            "Vectorized columnar execution processes data in batches across CPU registers using AVX-512 hardware instructions."
        ]
    },
    {
        "id": "streaming-watermarking-lateness",
        "term": "Structured Streaming Watermarking & Allowed Lateness",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "HARD",
        "definition": "Threshold specifying how far event-time can lag behind maximum observed event-time before data is dropped.",
        "explanation": "Watermarks track maximum event time seen minus delay threshold. State for windows older than (max_event_time - watermark) is safely garbage collected from state stores (HDFS/RocksDB), enforcing state bounds in continuous aggregations.",
        "keyPoints": [
            "Monitors max event time seen minus the allowed lateness window to establish an event-time moving boundary.",
            "Prunes expired intermediate state from RocksDB/HDFS state stores to avoid unbounded memory growth.",
            "Late events arriving behind the watermark threshold are dropped from continuous aggregation calculations."
        ]
    },
    {
        "id": "delta-deletion-vectors",
        "term": "Delta Lake Deletion Vectors (DV) vs Copy-on-Write (CoW)",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "MEDIUM",
        "definition": "Soft-delete bitmap index avoiding full Parquet file rewrites on UPDATE and DELETE operations.",
        "explanation": "Copy-on-Write rewrites an entire Parquet file even if a single row is modified or deleted. Deletion Vectors write a compact Roaring Bitmap file tracking deleted row offsets, deferring file rewrite until background REORG/OPTIMIZE compaction, speeding up DML by up to 10x.",
        "keyPoints": [
            "Replaces costly Parquet file re-writes on single-row updates/deletes with compact Roaring Bitmap files.",
            "Accelerates DML write operations, reducing MERGE/DELETE commit latency by up to 10x.",
            "Deferred physical compaction cleans up tombstoned records during scheduled OPTIMIZE runs."
        ]
    },
    {
        "id": "data-mesh-federated-contracts",
        "term": "Data Mesh Federated Governance & Data Product Contracts (ODCS)",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "ARCHITECT",
        "definition": "Decentralized domain ownership with centralized automated compliance and declarative schema contracts.",
        "explanation": "Data Mesh organizes data by business domains rather than centralized data lakes. Domains expose analytical data as products governed by Open Data Contract Standard (ODCS) YAML specs, enforcing schema guarantees, SLA semantics, and automated semantic validation before publication.",
        "keyPoints": [
            "Decentralizes data architecture into autonomous domain teams treating analytical datasets as products.",
            "Implements declarative Data Contracts (ODCS) defining schema, SLAs, and data quality expectations.",
            "Federated computational governance automates access control, lineage, and compliance across domains."
        ]
    },
    {
        "id": "unity-catalog-3level-abac",
        "term": "Unity Catalog 3-Level Namespace & Attribute-Based Access Control (ABAC)",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "HARD",
        "definition": "Unified lakehouse governance with catalog.schema.table namespace and tag-based dynamic masking policies.",
        "explanation": "Unity Catalog replaces legacy Hive metastores with a 3-level namespace (catalog.schema.table). ABAC allows attaching tags (e.g., PII=true) to columns and defining centralized row filters and column masks that apply dynamically across SQL, Python, and external REST engines.",
        "keyPoints": [
            "Three-level namespace (catalog.schema.table) standardizes asset discovery across workspaces.",
            "Attribute-Based Access Control (ABAC) dynamically governs access via metadata tags (e.g. tag:PII).",
            "Centralized row-level security and dynamic column masking apply uniformly to all compute engines."
        ]
    },
    {
        "id": "airflow3-asset-scheduling",
        "term": "Apache Airflow 3.0 Asset-Driven Scheduling & Deferrable Operators",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "MEDIUM",
        "definition": "Event-driven DAG execution triggered by dataset updates combined with async triggerer workers.",
        "explanation": "Airflow 3 replaces cron-based polling with Asset-aware dependencies, triggering DAGs immediately when upstream tables emit write events. Deferrable operators release worker execution slots during long-running cloud tasks (Databricks jobs, BigQuery queries), resuming via lightweight triggerers.",
        "keyPoints": [
            "Replaces brittle cron timers with data-driven scheduling that triggers downstream DAGs on table updates.",
            "Deferrable operators release worker slots while waiting on external jobs, yielding up to 90% resource savings.",
            "Asynchronous triggerers monitor polling loops via Python asyncio event loops without occupying worker threads."
        ]
    },
    {
        "id": "finops-dbu-result-cache",
        "term": "FinOps DBU/Credit Allocation & Query Result Cache Reuse",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "ARCHITECT",
        "definition": "System table telemetry tracking compute spend with multi-tier cache hits across SQL Warehouses.",
        "explanation": "FinOps on modern lakehouses audits system.billing.usage joined with system.compute.clusters to attribute cost per team. Databricks SQL Warehouses leverage result caching (0 DBU cost on identical query repeated within 24h) and disk caching (SSD local copy of remote Parquet files).",
        "keyPoints": [
            "Leverages system.billing.usage and compute metadata to attribute cloud lakehouse spend by cost center.",
            "Serverless query result cache serves identical queries instantly with zero compute DBU consumption.",
            "Local SSD delta caching accelerates iterative analytical queries without incurring cloud object storage egress."
        ]
    },
    {
        "id": "dabs-declarative-dataops",
        "term": "Databricks Asset Bundles (DABs) & Declarative DataOps Pipelines",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "HARD",
        "definition": "Infrastructure-as-Code for lakehouses defining jobs, pipelines, and permissions in version-controlled YAML.",
        "explanation": "DABs replace manual UI workspace configurations with declarative YAML files (databricks.yml). Bundles package notebooks, Python wheels, Delta Live Tables pipelines, and cluster definitions into unified deployment targets (dev, staging, prod) executed via CLI CI/CD runners.",
        "keyPoints": [
            "Version-controlled databricks.yml defines clusters, jobs, Delta Live Tables, and permissions as code.",
            "Automates environment promotion across dev, staging, and production using parameterized target blocks.",
            "Integrates with GitHub Actions and Azure DevOps to enforce automated linting, testing, and deployment."
        ]
    },
    {
        "id": "mcp-lakehouse-rag-vector",
        "term": "Model Context Protocol (MCP) & Lakehouse RAG Vector Search",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "ARCHITECT",
        "definition": "Standardized protocol connecting LLMs to lakehouse metadata and managed vector search indexes.",
        "explanation": "Model Context Protocol (MCP) provides a vendor-neutral protocol for AI agents to invoke tools and query context. Lakehouse Vector Search indexes Delta tables incrementally, updating embedding vectors automatically on new row inserts and enabling low-latency similarity queries via HNSW.",
        "keyPoints": [
            "Vendor-neutral client-server protocol enabling LLMs to safely read schemas, query tables, and execute tools.",
            "Direct Delta Lake change-data feed integration automatically syncs embeddings on table updates.",
            "Combines lexical keyword matching with dense vector similarity search for high-precision hybrid retrieval."
        ]
    },
    {
        "id": "openlineage-spark-ui-skew",
        "term": "OpenLineage & Spark UI DAG Task Skew Diagnostics",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "MEDIUM",
        "definition": "Open-source standard for runtime lineage collection paired with Spark UI partition duration metrics.",
        "explanation": "OpenLineage agents emit JSON events on every Spark job execution detailing datasets read, datasets written, and job facets. In the Spark UI, task skew is diagnosed by comparing Median vs 75th vs Max task durations in stage metrics to detect uneven hash partitions.",
        "keyPoints": [
            "Standardized OpenLineage specification captures end-to-end dataset inputs, outputs, and job run facets.",
            "Spark UI Stage View reveals task skew when max task duration dramatically exceeds 75th percentile duration.",
            "Enables lineage visualization in platforms like Marquez, Microsoft Purview, and Unity Catalog."
        ]
    },
    {
        "id": "powerbi-directlake-vertipaq",
        "term": "Power BI Direct Lake Mode: In-Memory VertiPaq Paging",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "ARCHITECT",
        "definition": "Zero-copy semantic model serving directly from OneLake Delta Parquet without Import or DirectQuery latency.",
        "explanation": "Direct Lake mode loads columnar Parquet data directly into Power BI VertiPaq memory on demand, paging column chunks as required by DAX visual queries. It bypasses relational SQL translation overhead while eliminating multi-hour scheduled dataset refreshes.",
        "keyPoints": [
            "Eliminates data duplication by mapping OneLake Delta Parquet files straight into VertiPaq memory.",
            "Provides Import-mode interactive DAX performance without requiring scheduled dataset refresh pipelines.",
            "Gracefully falls back to DirectQuery only if capacity memory limits or unsupported DAX features are triggered."
        ]
    },
    {
        "id": "fabric-capacity-smoothing-bursting",
        "term": "Fabric Capacity Smoothing & Bursting 24-Hour Windows",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "ARCHITECT",
        "definition": "Resource management model amortizing heavy compute bursts over rolling multi-hour evaluation periods.",
        "explanation": "Fabric capacities (F-SKUs) allow compute workloads to burst beyond purchased Capacity Units (CUs). Smoothing algorithms average background job consumption over 24-hour windows and interactive queries over 10-minute windows, preventing immediate throttling on transient spikes.",
        "keyPoints": [
            "Allows heavy lakehouse Spark and Warehouse jobs to burst beyond provisioned Capacity Units (CUs).",
            "Averages background compute consumption over a 24-hour moving window to smooth out transient peaks.",
            "Interactive query bursts are smoothed over 10-minute windows to maintain snappy report responsiveness."
        ]
    },
    {
        "id": "cosmosdb-htap-analytical-store",
        "term": "Cosmos DB Request Units (RU/s) & Analytical Store (HTAP)",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "HARD",
        "definition": "Hybrid Transactional/Analytical Processing isolating row-store OLTP from columnar analytical sync.",
        "explanation": "Cosmos DB Analytical Store automatically replicates transactional document data into an internal Parquet-like columnar representation with zero RU cost and sub-minute latency, allowing Azure Synapse and Fabric Spark to query operational data without impacting OLTP.",
        "keyPoints": [
            "Synchronizes operational document data to a columnar analytical store with zero impact on transactional RU/s.",
            "Enables real-time HTAP queries directly via Spark and serverless SQL without custom ETL pipelines.",
            "Automatically handles document schema evolution without requiring schema definitions or indexing costs."
        ]
    },
    {
        "id": "scylladb-seastar-engine",
        "term": "ScyllaDB C++ Seastar Asynchronous Engine vs JVM Cassandra",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "ARCHITECT",
        "definition": "Share-nothing, thread-per-core asynchronous C++ database architecture eliminating JVM GC latency.",
        "explanation": "ScyllaDB rewrites Apache Cassandra in C++ on the Seastar asynchronous framework. By pinning threads to specific CPU cores and partitioning RAM per core without locks or context switches, it eliminates GC stop-the-world pauses, achieving 10x throughput and sub-millisecond p99 latencies.",
        "keyPoints": [
            "Thread-per-core architecture pins worker threads to physical CPU cores, eliminating cross-thread locks.",
            "Native C++ implementation eliminates JVM Garbage Collection stop-the-world latency spikes.",
            "Delivers predictable sub-millisecond p99 latency for high-throughput real-time feature stores and event streaming."
        ]
    },
    {
        "id": "vector-indexing-hnsw-vs-ivf",
        "term": "Vector Indexing Architecture: HNSW vs IVF in Enterprise RAG",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "HARD",
        "definition": "Trade-offs between graph-based Hierarchical Navigable Small World and inverted file cluster indexing.",
        "explanation": "HNSW builds a multi-layer graph offering high recall (>95%) and ultra-fast queries at the cost of high RAM usage and slow build times. Inverted File (IVF) clusters vectors into Voronoi cells, reducing memory consumption by 3–5x but requiring periodic re-clustering as embeddings drift.",
        "keyPoints": [
            "Hierarchical Navigable Small World (HNSW) yields high recall (>95%) and fast sub-10ms query times.",
            "Inverted File (IVF) indexes reduce RAM overhead by clustering embeddings into Voronoi centroids.",
            "Enterprise RAG pipelines combine HNSW for latency-critical retrieval with quantized IVF for billion-vector scale."
        ]
    },
    {
        "id": "duckdb-polars-arrow-zerocopy",
        "term": "In-Process Analytics Revolution: DuckDB and Polars via Apache Arrow Zero-Copy",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "EASY",
        "definition": "Serverless local analytical engines sharing columnar memory without serialization or network hops.",
        "explanation": "DuckDB and Polars execute analytical queries directly inside the application process using vectorized columnar execution. By leveraging the Apache Arrow C Data Interface, dataframes pass seamlessly between Polars and DuckDB in microsecond time with zero memory copying or serialization.",
        "keyPoints": [
            "Runs high-performance analytical queries in-process without requiring heavy distributed cluster infrastructure.",
            "Apache Arrow C Data Interface enables zero-copy dataframe transfer between Polars, DuckDB, and PySpark.",
            "Vectorized execution engines maximize multi-core CPU and memory bandwidth with SIMD acceleration."
        ]
    }
]

def main():
    if not os.path.exists(CONCEPTS_FILE):
        print(f"Error: {CONCEPTS_FILE} does not exist.")
        sys.exit(1)

    with open(CONCEPTS_FILE, "r", encoding="utf-8") as f:
        existing = json.load(f)

    # Index by ID
    existing_by_id = {c["id"]: c for c in existing}
    added_count = 0
    updated_count = 0

    for item in NEW_CONCEPTS:
        if item["id"] not in existing_by_id:
            existing.append(item)
            existing_by_id[item["id"]] = item
            added_count += 1
            print(f"Added concept: {item['id']} - {item['term']}")
        else:
            # Update existing with current attributes
            old = existing_by_id[item["id"]]
            old.update(item)
            updated_count += 1
            print(f"Updated concept: {item['id']} - {item['term']}")

    with open(CONCEPTS_FILE, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"\nSuccessfully updated {CONCEPTS_FILE}!")
    print(f"Total concepts now: {len(existing)} (added {added_count}, updated {updated_count})")

if __name__ == "__main__":
    main()
