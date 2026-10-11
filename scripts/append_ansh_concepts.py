#!/usr/bin/env python3
"""
Append 15 high-impact Data Engineering concepts from Ansh Lamba's 12-Hour Masterclass
to src/data/json/data_concepts.json.
"""

import json
import os

FILE_PATH = os.path.join(os.path.dirname(__file__), '../src/data/json/data_concepts.json')

new_concepts = [
  {
    "id": "databricks-autoloader-cloudfiles",
    "term": "Databricks Auto Loader (cloudFiles)",
    "category": "DATABRICKS",
    "difficulty": "HARD",
    "definition": "An optimized streaming source format in Databricks (`cloudFiles`) that incrementally and efficiently processes billions of new data files arriving in cloud storage without state file explosion.",
    "explanation": "Auto Loader processes incoming files from cloud storage (ADLS Gen2, AWS S3, GCS) using either directory listing with incremental listing or cloud notification queues (Azure Event Grid, AWS SNS/SQS). It provides automated schema inference, automatic schema evolution, and captures malformed records into a dedicated `_rescued_data` column without halting the stream. This eliminates the O(N^2) file discovery overhead of traditional batch readers on massive partitioned cloud storage directories.",
    "keyPoints": [
      "Switches between directory listing (small/medium) and file notification mode (millions of files) via Event Grid/SQS.",
      "Supports seamless schema inference and schema evolution modes (`addNewColumns`, `rescue`, `failOnNewColumns`).",
      "Rescued data column (`_rescued_data`) guarantees zero data loss when unexpected columns or type mismatches occur."
    ]
  },
  {
    "id": "delta-lake-deletion-vectors",
    "term": "Delta Lake Deletion Vectors",
    "category": "DATABRICKS",
    "difficulty": "ARCHITECT",
    "definition": "A storage optimization technique in Delta Lake that marks deleted or updated rows using lightweight bitmap index files instead of rewriting entire Parquet data files.",
    "explanation": "In classic Copy-on-Write (COW) Delta Lake, deleting even a single row requires rewriting the entire containing Parquet file (often 100MB+), creating massive write amplification and I/O bottlenecks. Deletion Vectors store references to deleted rows in tiny Roaring Bitmap index files alongside the Parquet file. Read queries evaluate the Parquet columnar data while skipping rows listed in the deletion vector, achieving up to 10x faster DELETE/UPDATE operations for compliance requests (such as GDPR 'Right to be Forgotten') and high-frequency CDC workloads.",
    "keyPoints": [
      "Eliminates write amplification by avoiding rewriting full 100MB+ Parquet files for single-row mutations.",
      "Employs compressed Roaring Bitmaps to record deleted row offsets within individual Parquet files.",
      "Merged into base files during routine compaction (`OPTIMIZE`) to ensure zero read-side scan degradation over time."
    ]
  },
  {
    "id": "spark-unified-memory-manager",
    "term": "Spark Unified Memory Manager",
    "category": "SPARK & DATABRICKS",
    "difficulty": "ARCHITECT",
    "definition": "The memory management subsystem introduced in Apache Spark that unifies execution and storage memory into a single shared pool with dynamic borrowing.",
    "explanation": "Before Spark 1.6, Static Memory Management enforced rigid boundaries between execution memory (shuffles, joins, aggregations) and storage memory (caching, broadcast variables), leading to premature OOMs even when storage memory was idle. The Unified Memory Manager allocates 60% of available executor memory (after reserved 300MB) to a shared pool. Execution and storage borrow memory from each other dynamically; however, if execution requires memory borrowed by storage, cached storage blocks are evicted to disk, whereas storage can never forcibly evict execution memory.",
    "keyPoints": [
      "Unifies Execution (shuffles/joins) and Storage (cache/broadcasts) into a dynamic 60% JVM pool (`spark.memory.fraction`).",
      "Dynamic borrowing: Execution can borrow from storage, and storage can borrow from execution if space is idle.",
      "Eviction asymmetry: Execution can evict borrowed storage blocks to disk, but storage can never evict active execution memory."
    ]
  },
  {
    "id": "spark-adaptive-query-execution",
    "term": "Adaptive Query Execution (AQE)",
    "category": "SPARK & DATABRICKS",
    "difficulty": "HARD",
    "definition": "A query optimization engine in Apache Spark (enabled by default in Spark 3.x+) that re-optimizes and adjusts physical query plans at runtime based on real-time stage statistics.",
    "explanation": "Traditional static query planning generates a physical plan before execution begins based on catalog metadata, which is often stale or inaccurate for complex transformations. AQE executes stages iteratively: between stages, it examines the runtime size and distribution of shuffle output data. It performs three critical runtime optimizations: dynamically coalescing small shuffle partitions into fewer larger partitions, converting Sort-Merge Joins to Broadcast Hash Joins if a relation shrinks below threshold, and automatically splitting skewed shuffle partitions to eliminate straggler tasks.",
    "keyPoints": [
      "Dynamically coalesces post-shuffle partitions to prevent the 200 default partition bottleneck on small datasets.",
      "Runtime join switching: Converts Sort-Merge Joins into Broadcast Hash Joins if intermediate data fits in broadcast memory.",
      "Skew join handling: Automatically splits large, skewed shuffle partitions into smaller sub-partitions."
    ]
  },
  {
    "id": "spark-data-skew-salting",
    "term": "Spark Data Skew & Salting Technique",
    "category": "SPARK & DATABRICKS",
    "difficulty": "HARD",
    "definition": "A distributed data engineering pattern that redistributes skewed join or aggregation keys across multiple executor tasks by appending random numerical salt prefixes.",
    "explanation": "Data skew occurs when an uneven distribution of key values causes a single executor task to process an overwhelming percentage of data while other executors remain idle (the classic 99% task completion bottleneck). The salting technique appends a random integer from `0` to `N-1` to the key column on the skewed DataFrame, and replicates each row `N` times on the non-skewed lookup DataFrame with matching salt keys `0` to `N-1`. Joining on `(key, salt)` distributes the skewed records across `N` parallel shuffle partitions, restoring task symmetry.",
    "keyPoints": [
      "Eliminates the 'straggler task' phenomenon where one task processes 90% of data and causes executor OOMs.",
      "Appends random salt `[0..N]` to the skewed relation and explodes matching salt keys across the smaller lookup relation.",
      "Complemented by Spark AQE skew join optimization (`spark.sql.adaptive.skewJoin.enabled`), which automates splitting."
    ]
  },
  {
    "id": "databricks-unity-catalog-architecture",
    "term": "Databricks Unity Catalog Architecture",
    "category": "DATABRICKS",
    "difficulty": "ARCHITECT",
    "definition": "The centralized governance, metadata, and fine-grained access control layer for all data and AI assets across multiple Databricks workspaces in a cloud tenant.",
    "explanation": "Unity Catalog decouples metadata governance from individual workspace compute clusters. It enforces a strict 3-level namespace (`catalog.schema.table_or_volume`) administered through a single regional Metastore per cloud region. Storage credentials leverage Azure Managed Identities (Access Connectors) or AWS IAM Roles to access cloud storage without passing credentials to user clusters. Unity Catalog provides centralized row-level and column-level masking, automated data lineage across jobs and dashboards, and universal open API access via Delta Sharing.",
    "keyPoints": [
      "Strict 3-level namespace hierarchy: `catalog.schema.table` governed by a single Metastore per cloud region.",
      "Decoupled cloud security using Access Connectors and Storage Credentials instead of cluster-level keys.",
      "Native automated data lineage, column/row-level security filters, and cross-workspace access control."
    ]
  },
  {
    "id": "databricks-serverless-sql-warehouse",
    "term": "Databricks Serverless SQL Warehouse",
    "category": "DATABRICKS",
    "difficulty": "HARD",
    "definition": "A fully managed, instant-starting compute tier in Databricks optimized for high-concurrency SQL and BI queries running inside Databricks-managed compute planes.",
    "explanation": "Unlike classic or pro SQL warehouses that provision VMs inside the customer's cloud subscription (requiring 3–5 minutes cold-start cluster boot times), Serverless SQL Warehouses utilize warm pools of VMs pre-provisioned in the Databricks control plane. Clusters start in under 5 seconds, scale out horizontally during peak BI user concurrency, and scale down immediately to zero when idle (with auto-stop timeouts as low as 1–2 minutes). This drastically reduces idle compute costs and provides optimal performance via Photon vectorization.",
    "keyPoints": [
      "Sub-second to 5-second cold-start latency compared to 3-5 minutes for classic customer-plane compute.",
      "Aggressive auto-stop (1–2 minutes) eliminates idle cluster billing when dashboard traffic ceases.",
      "Automated multi-cluster load balancing scales compute up and down dynamically to handle concurrent query spikes."
    ]
  },
  {
    "id": "delta-lake-time-travel-compaction",
    "term": "Delta Lake Time Travel & Transaction Log Compaction",
    "category": "DATALAKE ARCHITECTURE",
    "difficulty": "HARD",
    "definition": "The mechanism where Delta Lake maintains ordered JSON commit logs (`_delta_log`) and checkpoint Parquet files to enable querying historical table snapshots and point-in-time recovery.",
    "explanation": "Every mutation in a Delta table commits an immutable atomic JSON file in `_delta_log/` (e.g. `000000.json`, `000001.json`). Every 10 commits, Delta writes a compacted Parquet checkpoint file that aggregates all historical actions, preventing expensive scans of thousands of individual JSON logs. Users can query older snapshots using `VERSION AS OF` or `TIMESTAMP AS OF` for auditing, debugging, and rollback (`RESTORE TABLE target_table TO VERSION AS OF n`). Older unreferenced data files are permanently expunged only when running `VACUUM`.",
    "keyPoints": [
      "Atomic transactional state recorded in ordered JSON commit logs with Parquet checkpoints generated every 10 commits.",
      "Time Travel allows querying historical data via `VERSION AS OF` or `TIMESTAMP AS OF` without restoring backups.",
      "Enables instant disaster recovery using `RESTORE TABLE db.table TO VERSION AS OF <version>` to undo accidental data corruption."
    ]
  },
  {
    "id": "adf-self-hosted-integration-runtime",
    "term": "ADF Self-Hosted Integration Runtime (SHIR)",
    "category": "ADF",
    "difficulty": "HARD",
    "definition": "An agent installed on an on-premises machine or private cloud virtual network that enables Azure Data Factory to securely access and copy data from protected internal network sources.",
    "explanation": "When source systems (such as on-prem SQL Server, Oracle, SAP, or private network file shares) reside behind corporate firewalls or within private VNETs, the public Azure IR cannot reach them. The Self-Hosted IR acts as an outbound-only gateway, connecting back to Azure over port 443 (HTTPS) without requiring inbound firewall openings. For production resilience and high throughput, up to 4 physical or virtual nodes can be grouped into a single logical SHIR cluster to provide automatic failover and concurrent job distribution.",
    "keyPoints": [
      "Enables secure private network data movement without opening inbound corporate firewall ports (outbound 443 only).",
      "Supports high availability and load balancing by clustering up to 4 nodes under a single logical SHIR gateway.",
      "Essential for enterprise hybrid architectures bridging legacy on-premises databases to cloud data lakes."
    ]
  },
  {
    "id": "adf-data-flow-vs-databricks",
    "term": "ADF Mapping Data Flows vs. Azure Databricks",
    "category": "ADF",
    "difficulty": "HARD",
    "definition": "The architectural decision framework comparing ADF's visual, code-free Spark execution engine (Mapping Data Flows) against code-first Azure Databricks compute for enterprise ETL/ELT.",
    "explanation": "ADF Mapping Data Flows spin up an Azure-managed Apache Spark cluster behind a drag-and-drop UI, translating graphical data transforms into optimized Spark code. It is ideal for citizen integrators, standard ELT pipelines, and rapid UI development. In contrast, Azure Databricks provides code-first Python/PySpark/Scala/SQL flexibility, interactive notebooks, deep Git/DevOps integration, Unity Catalog governance, Delta Live Tables (DLT), ML model training, and fine-grained Spark configuration tuning. Enterprise architectures typically use ADF for light orchestration and Databricks for heavy transformations.",
    "keyPoints": [
      "ADF Mapping Data Flows: Visual, no-code/low-code Spark execution ideal for straightforward transformations and quick builds.",
      "Azure Databricks: Full code-first flexibility, custom Python libraries, fine-grained cluster tuning, and advanced Delta features.",
      "Best-of-breed pattern: ADF orchestrates pipeline schedules, triggers, and alerts while invoking Databricks for core processing."
    ]
  },
  {
    "id": "delta-lake-slowly-changing-dimensions",
    "term": "Slowly Changing Dimensions (SCD Type 1 & 2) in Delta Lake",
    "category": "DATALAKE ARCHITECTURE",
    "difficulty": "ARCHITECT",
    "definition": "The dimensional modeling implementation in Delta Lake that manages historical attribute changes using atomic `MERGE INTO` operations.",
    "explanation": "SCD Type 1 overwrites existing dimension attributes with new values (no historical tracking). SCD Type 2 preserves history by expiring existing records (setting `is_current = false` and `end_date = current_date()`) and inserting new records with `is_current = true` and `end_date = NULL`. In Delta Lake, SCD Type 1 is executed via a straightforward `MERGE INTO dim d USING stage s ON d.id = s.id WHEN MATCHED THEN UPDATE SET ... WHEN NOT MATCHED THEN INSERT ...`. SCD Type 2 is performed in Delta Lake either via a 2-pass merge (unioning updates with an artificial null key to trigger both update and insert in a single transaction) or Delta Live Tables `APPLY CHANGES INTO`.",
    "keyPoints": [
      "SCD Type 1: Overwrites current values directly using Delta `MERGE INTO` with zero historical tracking.",
      "SCD Type 2: Maintains full audit history via effective date ranges (`start_date`, `end_date`) and active flags (`is_current`).",
      "Delta Lake ACID guarantees prevent dirty reads or partial dimension updates during concurrent analytical queries."
    ]
  },
  {
    "id": "spark-broadcast-hash-join",
    "term": "Spark Broadcast Hash Join (BHJ)",
    "category": "SPARK & DATABRICKS",
    "difficulty": "MEDIUM",
    "definition": "A distributed join strategy in Apache Spark that distributes an entire small DataFrame to all executor nodes to eliminate costly shuffle operations.",
    "explanation": "In standard Sort-Merge Joins, both datasets are hashed and shuffled across the network to partition matching keys onto the same executors—causing heavy network I/O, disk writes, and serialization. In a Broadcast Hash Join, the driver node collects the smaller dataset, builds an in-memory hash table, and broadcasts it to every worker executor node. The larger dataset is then scanned locally without any shuffling. Spark triggers BHJ automatically if a table is smaller than `spark.sql.autoBroadcastJoinThreshold` (default 10MB) or when explicitly requested via `broadcast(df)`.",
    "keyPoints": [
      "Eliminates network shuffle overhead by broadcasting the entire small relation to all worker nodes.",
      "Automatically selected when table size is under `spark.sql.autoBroadcastJoinThreshold` (default 10MB).",
      "Driver memory risk: If the broadcasted DataFrame exceeds driver memory, it will crash the application with a Driver OOM."
    ]
  },
  {
    "id": "pipeline-idempotency-data-engineering",
    "term": "Idempotency in Data Pipelines",
    "category": "GENERAL DE",
    "difficulty": "HARD",
    "definition": "The architectural property of a data pipeline ensuring that executing the same pipeline multiple times with the exact same input produces the exact same destination state without duplicate records.",
    "explanation": "In real-world data engineering, pipeline failures, retries, and network glitches frequently cause pipeline stages to re-execute. If a pipeline uses naive append operations, retries result in duplicate records, corrupting analytical reporting. Idempotent pipelines guarantee consistency by utilizing deterministic partition overwrites (`replaceWhere`), atomic upserts (`MERGE INTO` on primary keys), pre-copy cleanup scripts, or unique watermark deduplication. Idempotency is a foundational principle of fault-tolerant production architecture.",
    "keyPoints": [
      "Guarantees that re-running a failed or delayed pipeline job produces the exact same output without data corruption.",
      "Implemented via atomic Delta `MERGE INTO`, partition-level overwrite (`insertOverwrite` / `replaceWhere`), or staging deduplication.",
      "Prevents duplicate metrics and inflated revenue calculations caused by automated pipeline retry policies."
    ]
  },
  {
    "id": "databricks-genie-spaces",
    "term": "Databricks Genie Spaces (Lakehouse AI)",
    "category": "DATABRICKS",
    "difficulty": "HARD",
    "definition": "An AI-powered conversational interface in Databricks that allows non-technical business stakeholders to query Lakehouse Delta tables using natural language.",
    "explanation": "Databricks Genie utilizes generative AI models augmented by Unity Catalog metadata, table comments, column descriptions, and trusted SQL benchmarks to translate plain-English business inquiries into accurate, executed SQL queries. Rather than submitting tickets to data teams for repetitive ad-hoc cuts, business users can ask questions like 'What were our top 5 selling products by margin last month?' Genie generates the query, displays the tabular and graphical result, and provides full transparency into the generated SQL logic.",
    "keyPoints": [
      "Converts natural language business questions into executable SQL against Unity Catalog Delta tables.",
      "Grounded in enterprise semantics using Unity Catalog column descriptions, primary/foreign key relationships, and query history.",
      "Empowers non-technical business stakeholders with self-service analytics while maintaining centralized governance."
    ]
  },
  {
    "id": "delta-lake-vacuum-retention",
    "term": "Delta Lake VACUUM & Retention Governance",
    "category": "DATALAKE ARCHITECTURE",
    "difficulty": "HARD",
    "definition": "The maintenance command in Delta Lake that removes uncommitted and historical Parquet data files that are older than the specified retention threshold.",
    "explanation": "Because Delta Lake retains older versions of Parquet files to support Time Travel, table storage grows continuously over time. The `VACUUM` command scans the transaction log and deletes Parquet data files that are no longer referenced by any table snapshot older than the retention period (default 7 days / 168 hours). Setting retention to 0 hours is blocked by default (`spark.databricks.delta.vacuum.parallelDelete.enabled` / `retentionDurationCheck`) because deleting files currently in use by concurrent active read or write transactions causes catastrophic query failures.",
    "keyPoints": [
      "Deletes unreferenced orphan Parquet data files older than the safety retention threshold (default 7 days).",
      "Limits Time Travel availability to the retention window (queries beyond the vacuum horizon will fail).",
      "Safety checks prevent zero-hour retention to ensure concurrent active read/write jobs are not corrupted."
    ]
  }
]

def main():
    print(f"Reading {FILE_PATH}...")
    with open(FILE_PATH, 'r') as f:
        data = json.load(f)
    print(f"Initial count: {len(data)}")

    existing_ids = {c['id'] for c in data}
    to_add = []
    for c in new_concepts:
        if c['id'] in existing_ids:
            print(f"Skipping existing concept id: {c['id']}")
        else:
            to_add.append(c)

    print(f"Adding {len(to_add)} new concepts...")
    data.extend(to_add)

    with open(FILE_PATH, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Final count: {len(data)}")
    print("Successfully appended concepts!")

if __name__ == '__main__':
    main()
