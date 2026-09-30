# fix_questions_lakehouse.py
# Bespoke, expert answers for the 27 LAKEHOUSE questions that previously had template boilerplate.

def get_lakehouse_fixes():
    return {
        "lakehouse-easy-1": {
            "question": "How do you design a basic table using a data lakehouse format to support ACID transactions?",
            "answer": """In a modern data lakehouse, ACID transactions are implemented at the software metadata layer (Delta Lake, Apache Iceberg, or Apache Hudi) on top of raw cloud object storage (Amazon S3, Azure Data Lake Storage Gen2, Google Cloud Storage):

1. **Table Creation (Delta Lake / Iceberg)**:
```sql
-- Delta Lake table definition
CREATE TABLE enterprise_lake.sales.orders (
    order_id STRING,
    customer_id STRING,
    order_date DATE,
    total_amount DECIMAL(10, 2),
    created_at TIMESTAMP
)
USING DELTA
LOCATION 'abfss://sales@lakehouse.dfs.core.windows.net/orders';
```
2. **ACID Mechanics**:
   - **Atomicity**: Writes create new immutable Parquet data files. The write is atomic because the table metadata log (`_delta_log/` or Iceberg metadata JSON) only commits the transaction when all files are written and the commit JSON file is written successfully.
   - **Consistency**: The engine guarantees schema enforcement; records with mismatched types are rejected before commit.
   - **Isolation**: Optimistic Concurrency Control (OCC) serializes concurrent transactions. Readers always see a consistent snapshot without locking writers.
   - **Durability**: Committed data files and transaction logs are stored on cloud object storage offering 99.999999999% (11 9s) durability."""
        },

        "lakehouse-easy-2": {
            "question": "What is the fundamental difference between storing data as standard Parquet files versus an Iceberg/Delta table?",
            "answer": """While both approaches store data in columnar Apache Parquet files, they operate under fundamentally different table paradigms:

### Standard Parquet Files (Legacy Hive Metastore):
- **Directory-Based Table State**: A table is defined as a directory (`s3://bucket/table/year=2024/`).
- **File System Listing**: Query planning requires engines (Spark, Presto) to execute expensive recursive directory listings (`listObjectsV2`). On a table with 100,000 files, listing takes minutes before planning starts.
- **No ACID Guarantees**: A failed write leaves orphan partial files visible to readers; concurrent writes produce duplicate or corrupt reads.
- **Schema Drift Risk**: Adding or renaming columns requires rewriting physical files or corrupts older partitions.

### Iceberg / Delta Lake Format:
- **Metadata-Based Table State**: The table state is defined strictly by the **transaction log and manifest list**. A file exists in the table *only if it is explicitly referenced in the committed metadata*.
- **Zero-Listing Query Planning**: Engines read file paths, min/max statistics, and partition values directly from metadata files in milliseconds.
- **ACID & Time Travel**: Provides ACID transactions, atomic rollbacks, point-in-time snapshot queries, and schema evolution without data rewrites."""
        },

        "lakehouse-easy-4": {
            "question": "Design a basic partitioning strategy based on the `date` column for daily event logs?",
            "answer": """Partitioning divides table data into discrete physical or logical folders, enabling query engines to prune non-relevant data during scans.

### Implementation:
1. **Delta Lake Partitioning**:
```sql
CREATE TABLE telemetry.sensor_events (
    sensor_id STRING,
    event_timestamp TIMESTAMP,
    temperature DOUBLE,
    event_date DATE
)
USING DELTA
PARTITIONED BY (event_date)
LOCATION 's3://telemetry-lake/sensor_events';
```
2. **Apache Iceberg Hidden Partitioning (Modern Standard)**:
   - In Iceberg, you do not need to create an artificial synthetic `event_date` column; Iceberg partitions directly on timestamp transforms:
```sql
CREATE TABLE telemetry.sensor_events (
    sensor_id STRING,
    event_timestamp TIMESTAMP,
    temperature DOUBLE
)
USING ICEBERG
PARTITIONED BY (days(event_timestamp));
```
3. **Partition Sizing Golden Rules**:
   - Each partition should contain **at least 1 GB to 10 GB of data** across ~10-100 Parquet files.
   - **Anti-Pattern (Over-Partitioning)**: Partitioning by `(event_date, hour, sensor_id)` when daily volume is only 500 MB generates millions of tiny 50 KB files, exhausting metadata storage and crippling query performance."""
        },

        "lakehouse-easy-5": {
            "question": "How do you perform a simple UPSERT (merge) operation to update existing records in a lakehouse table?",
            "answer": """An UPSERT (Update if matching, Insert if new) is executed via the standard SQL `MERGE INTO` statement supported natively in Delta Lake and Apache Iceberg:

### SQL Implementation:
```sql
MERGE INTO enterprise_lake.crm.dim_customers AS target
USING staging.customer_updates AS source
ON target.customer_id = source.customer_id
WHEN MATCHED AND target.updated_at < source.updated_at THEN
  UPDATE SET 
    target.email = source.email,
    target.status = source.status,
    target.updated_at = source.updated_at
WHEN NOT MATCHED THEN
  INSERT (customer_id, email, status, created_at, updated_at)
  VALUES (source.customer_id, source.email, source.status, source.created_at, source.updated_at);
```
### Underlying Mechanics:
1. **Inner Join Scan**: The engine joins the source dataset with target metadata to identify affected Parquet files containing matched primary keys.
2. **File Rewrite / Delete Vector**:
   - In **Copy-On-Write (COW)**: The engine rewrites affected Parquet files with updated values.
   - In **Merge-On-Read (MOR)**: The engine writes a lightweight position delete file and appends new records.
3. **Atomic Commit**: A new snapshot is committed to the transaction log in a single atomic operation."""
        },

        "lakehouse-easy-6": {
            "question": "What is the role of the metadata log or transaction log in these formats?",
            "answer": """The transaction log (e.g., `_delta_log/` in Delta Lake, Snapshot Manifests in Apache Iceberg) is the single source of truth for table state.

### Core Roles:
1. **Single Source of Truth**: Cloud object storage contains files; the transaction log declares *which specific files belong to the active table snapshot*. Uncommitted or deleted files are ignored.
2. **Atomicity & Linearizability**: Every table modification (append, delete, merge) writes an atomic commit file (`000000.json`, `000001.json`). If a writer fails mid-write, no commit file is created, and the operation is as if it never happened.
3. **Optimistic Concurrency Control (OCC)**: Coordinates concurrent writes. If two writers attempt to commit against snapshot $N$, the second writer checks for partition overlap; if none exists, it fast-forwards and commits as $N+1$.
4. **Data Skipping & Pruning Statistics**: Stores column min/max values, null counts, and record counts for every Parquet file, allowing engines to skip 95%+ of files without touching object storage.
5. **Time Travel & Auditing**: Enables point-in-time queries: `SELECT * FROM table VERSION AS OF 15`."""
        },

        "lakehouse-easy-7": {
            "question": "How do you schema-evolve a table by adding a new column without rewriting all underlying data files?",
            "answer": """In traditional Parquet or CSV storage, adding a column required rewriting every historical file or risk query parsing errors. Lakehouse formats support **metadata-only schema evolution**:

### How It Works:
1. **Schema DDL Execution**:
```sql
ALTER TABLE enterprise_lake.sales.orders ADD COLUMN discount_code STRING;
```
   - Delta Lake / Iceberg updates only the central table metadata file, recording the new column name, data type, and a unique column ID.
   - **Cost & Duration**: Takes <500 milliseconds and costs fractions of a cent; zero historical Parquet files are touched.
2. **Read-Time Null Resolution**:
   - When a query engine reads older Parquet files written prior to the schema change, the reader checks the file schema against the current metadata.
   - Finding that `discount_code` is missing from the physical Parquet file, the reader dynamically returns `NULL` for those rows in memory.
3. **Write-Time Auto-Merge**:
   - In PySpark, streaming or batch writes can automatically evolve schemas using:
     `.option("mergeSchema", "true")`."""
        },

        "lakehouse-easy-8": {
            "question": "Design a basic maintenance schedule to clean up old data and snapshot history?",
            "answer": """Because lakehouse formats preserve snapshot histories and overwrite files rather than in-place modifying them, tables accumulate historical Parquet files over time, increasing cloud storage costs.

### Basic Maintenance Protocol:
1. **Compaction (`OPTIMIZE`)**:
   - Frequency: Daily or post-heavy-ETL.
   - Action: Merges thousands of small micro-batch files into uniform 512 MB-1 GB files:
```sql
OPTIMIZE enterprise_lake.sales.orders;
```
2. **Vacuum / Orphan Cleanup (`VACUUM`)**:
   - Frequency: Weekly.
   - Action: Deletes uncommitted and superseded physical Parquet files whose commit age exceeds the retention threshold:
```sql
-- Delta Lake: remove files deleted more than 7 days ago
VACUUM enterprise_lake.sales.orders RETAIN 168 HOURS;
```
3. **Iceberg Snapshot Expiration**:
```sql
-- Iceberg: expire historical snapshots beyond 14 days
CALL enterprise_lake.system.expire_snapshots(
  table => 'sales.orders',
  older_than => TIMESTAMP '2024-03-01 00:00:00',
  retain_last => 5
);
```
4. **Golden Rule**: Never set retention to 0 hours on production tables, or active long-running analytical queries will fail with `FileNotFoundException` when intermediate files are purged."""
        },

        "lakehouse-easy-9": {
            "question": "How do you connect a lakehouse format table to an external query engine like Athena or Presto?",
            "answer": """External query engines (Amazon Athena, Presto, Trino) query lakehouse tables through standardized metadata catalogs (AWS Glue Data Catalog, Project Nessie, or Hive Metastore).

### Architectural Steps (e.g., Apache Iceberg on Amazon Athena):
1. **Register Table in Glue Catalog**:
   - Ensure the table is created with `table_type = 'ICEBERG'` in AWS Glue:
```sql
CREATE TABLE awsdatacatalog.analytics.web_traffic (
    user_id string,
    page_url string,
    event_time timestamp
)
LOCATION 's3://enterprise-lake/web_traffic/'
TBLPROPERTIES ('table_type'='ICEBERG');
```
2. **Engine Connection & Querying**:
   - Athena/Trino detects the `ICEBERG` table type from Glue metadata.
   - Instead of scanning directories, Athena reads the Iceberg metadata JSON pointer in S3, parses manifest files, prunes partitions, and reads Parquet files directly:
```sql
SELECT page_url, count(*) 
FROM awsdatacatalog.analytics.web_traffic
WHERE event_time >= now() - interval '1' day
GROUP BY page_url;
```
3. **Universal Format (UniForm) for Delta Lake**:
   - If using Delta Lake in Databricks, enable UniForm (`delta.universalFormat.enabledFormats = 'iceberg'`). Delta automatically generates Iceberg metadata on every commit, allowing Athena and Snowflake to query Delta tables as Iceberg zero-copy."""
        },

        "lakehouse-easy-10": {
            "question": "What are the performance implications of having thousands of tiny files in a lakehouse table?",
            "answer": """The "Small File Problem" is the most prevalent performance killer in modern data lakes, typically caused by frequent micro-batch streaming appends (e.g., streaming every 10 seconds into a table without compaction).

### Performance Implications:
1. **Query Planning Latency**:
   - The query planner must read metadata entries and column statistics for 100,000 files. Metadata parsing explodes from 20ms to 45 seconds before the query even starts.
2. **Storage API Throttling**:
   - S3 and ADLS Gen2 enforce request limits per prefix (e.g., AWS S3 allows 3,500 PUT and 5,500 GET requests/sec). Reading 100,000 tiny 50 KB files triggers HTTP 503 SlowDown throttling errors.
3. **Loss of Columnar Compression & Skipping**:
   - Columnar encoding algorithms (Run-Length Encoding, Snappy, Dictionary) require 100,000+ rows to achieve high compression ratios. A 10 KB Parquet file has near-zero compression and significant header overhead.
4. **Remediation**:
   - Enable Auto-Compaction and Optimized Writes during ingestion.
   - Run regular `OPTIMIZE` bin-packing jobs to consolidate small files into 128 MB-1 GB files."""
        },

        "lakehouse-medium-11": {
            "question": "Architect a pipeline that utilizes Copy-On-Write (COW) versus Merge-On-Read (MOR) strategies depending on the read/write load profile?",
            "answer": """Choosing between Copy-On-Write (COW) and Merge-On-Read (MOR) governs the fundamental trade-off between write ingestion latency and downstream query speed.

### Trade-Off Comparison:
- **Copy-On-Write (COW)**:
  - *Write Mechanism*: Rewrites entire Parquet files upon every update or delete.
  - *Write Cost*: Heavy write amplification and high compute costs during ingestion.
  - *Read Performance*: Maximum read performance (pure contiguous Parquet scans, zero join overhead).
- **Merge-On-Read (MOR)**:
  - *Write Mechanism*: Writes changes into lightweight append-only log files or delete vectors (e.g., Roaring Bitmaps).
  - *Write Cost*: Extremely fast, lightweight sub-second writes.
  - *Read Performance*: Reads incur compute overhead because the query engine must merge data files with delete vectors at scan time.

### Architectural Decision Framework:
1. **High-Frequency Ingestion Layer (Bronze / Streaming CDC)**:
   - Profile: 5,000 writes/sec, sub-minute SLA.
   - Strategy: Use **Merge-On-Read (MOR)** or Delta Delete Vectors to ensure write transactions commit instantly without rewriting gigabytes of storage.
2. **Serving & Reporting Layer (Gold Marts / BI Tables)**:
   - Profile: Hundreds of concurrent BI dashboard queries, sub-second query requirement.
   - Strategy: Use **Copy-On-Write (COW)** or schedule background compaction on MOR tables before BI queries execute."""
        },

        "lakehouse-medium-13": {
            "question": "Design a concurrent write architecture handling simultaneous updates from a Flink streaming job and an Airflow batch job to the same table?",
            "answer": """When a continuous streaming ingestion job (Apache Flink) and a daily historical backfill batch job (Apache Airflow) update the same lakehouse table simultaneously, uncoordinated commits trigger Optimistic Concurrency Control (OCC) conflict exceptions (`ConcurrentModificationException`).

### Architectural Blueprint:
1. **Partition Isolation**:
   - Ensure the streaming job and batch job write to **disjoint partition boundaries**.
   - Flink streams strictly into `event_date = current_date()`.
   - Airflow batch jobs process historical partitions (`event_date <= current_date() - 1`).
   - Because OCC checks for file and partition collision, commits touching disjoint partitions succeed simultaneously.
2. **Staging Table + Swap Pattern (For Overlapping Writes)**:
   - Airflow writes batch updates to a temporary staging table (`orders_batch_staging`).
   - Once validated, Airflow executes a fast, atomic `MERGE INTO` operation.
3. **Conflict Retries with Exponential Jitter**:
   - Configure writer retry policies:
```properties
spark.databricks.delta.concurrency.maxRetries=10
spark.databricks.delta.concurrency.retryIntervalMs=500
```
4. **Append-Only Staging with Periodic Merges**:
   - Have Flink write purely append-only micro-batches (`append` mode never conflicts).
   - Airflow runs an hourly scheduled merge job to deduplicate and update the target gold table."""
        },

        "lakehouse-medium-14": {
            "question": "How do you implement Z-Ordering or space-filling curves to optimize multi-dimensional queries on a massive table?",
            "answer": """Standard partitioning is effective for 1 or 2 low-cardinality keys (e.g., `date`), but fails for high-cardinality columns (e.g., `user_id`, `product_id`, `ip_address`). Z-Ordering maps multidimensional data into a one-dimensional space-filling Peano-Hilbert or Morton curve, preserving spatial data locality.

### Implementation:
1. **Delta Lake Z-Ordering**:
```sql
-- Optimize a 100-billion row fact table along two high-cardinality query dimensions
OPTIMIZE enterprise_lake.sales.fact_orders
ZORDER BY (customer_id, product_sku);
```
2. **Underlying Mechanics**:
   - The engine interweaves bits of the binary representations of `customer_id` and `product_sku`.
   - Data points close in multi-dimensional space are stored in the same or adjacent physical Parquet files.
   - The metadata log stores min/max statistics for both columns per file.
3. **Query Pruning Efficiency**:
   - When a user filters `WHERE customer_id = 'C123'` OR `WHERE product_sku = 'SKU-99'`, the engine prunes 90%+ of Parquet files along both query dimensions.
4. **Production Gotchas**:
   - **Limit Columns**: Restrict Z-Ordering to **2 to 4 columns**. Beyond 4 dimensions, the curse of dimensionality degrades space-filling curve efficiency to near-random file scans.
   - **Compute Overhead**: Z-Ordering requires a full distributed sort; run only on large tables with high query concurrency."""
        },

        "lakehouse-medium-15": {
            "question": "Architect a system that leverages hidden partitioning in Apache Iceberg to prevent query engines from scanning unnecessary data?",
            "answer": """In traditional Hive tables, partitioning requires creating explicit columns (e.g., `order_year`, `order_month`). If an analyst queries `WHERE order_timestamp >= '2024-03-01'` without referencing `order_year = 2024 AND order_month = 3`, the engine performs an accidental, multi-terabyte full-table scan.

### Apache Iceberg Hidden Partitioning Architecture:
1. **Partition Specification via Transform Functions**:
   - Iceberg separates table schema from partition specification. Partition transforms are applied directly to existing columns:
```sql
CREATE TABLE enterprise_lake.events.clickstream (
    event_id STRING,
    event_timestamp TIMESTAMP,
    user_id STRING
)
USING ICEBERG
PARTITIONED BY (
    days(event_timestamp),
    bucket(16, user_id)
);
```
2. **Automated Partition Pruning (Zero User Awareness)**:
   - When an analyst queries:
     `SELECT * FROM clickstream WHERE event_timestamp >= '2024-03-01 00:00:00'`
   - The Iceberg catalog automatically transforms the predicate:
     `days(event_timestamp) >= 19782`
   - Scans only the relevant partition manifests, pruning 99% of files automatically without user intervention.
3. **Partition Evolution Without Data Rewrites**:
   - If event volume grows 10x, evolve partition spec from `days(event_timestamp)` to `hours(event_timestamp)` via metadata DDL. Old data remains intact; new data is partitioned at hourly granularity."""
        },

        "lakehouse-medium-16": {
            "question": "How do you manage data governance, row-level security, and column masking natively within lakehouse formats?",
            "answer": """Because cloud object storage lacks native row/column security primitives, data governance must be enforced through centralized metadata catalogs (Databricks Unity Catalog, AWS Lake Formation, Apache Polaris, or Apache Ranger).

### Architecture & Implementation:
1. **Centralized Access Control Engine**:
   - Compute engines (Spark, Trino, Athena) delegate table resolution to a central catalog enforcing Attribute-Based Access Control (ABAC).
2. **Dynamic Column Masking**:
```sql
-- Unity Catalog / SQL standard syntax
CREATE FUNCTION mask_ssn(val STRING) 
RETURN IF(IS_ACCOUNT_GROUP_MEMBER('hr_admin'), val, 'XXX-XX-XXXX');

ALTER TABLE enterprise_lake.hr.employees 
  ALTER COLUMN ssn SET MASK mask_ssn;
```
3. **Row-Level Security Filters**:
```sql
CREATE FUNCTION region_filter(record_region STRING)
RETURN IS_ACCOUNT_GROUP_MEMBER('executives') OR 
       IS_ACCOUNT_GROUP_MEMBER(CONCAT('analysts_', record_region));

ALTER TABLE enterprise_lake.sales.orders 
  SET ROW FILTER region_filter ON (sales_region);
```
4. **Underlying Pushdown**:
   - When an analyst issues `SELECT * FROM orders`, the query planner injects the row filter into the logical plan prior to scanning object storage.
   - Parquet readers deserialize only authorized columns and prune unauthorized rows using min/max metadata statistics."""
        },

        "lakehouse-medium-17": {
            "question": "Design a cross-engine catalog architecture (e.g., using AWS Glue or Nessie) to seamlessly share lakehouse tables between Databricks, Snowflake, and Spark?",
            "answer": """In enterprise environments, data engineering runs on Databricks/Spark, financial BI runs on Snowflake, and ad-hoc analytics runs on Athena/Trino. Storing separate copies of data across these systems creates massive data duplication and synchronization lag.

### Cross-Engine Lakehouse Architecture:
1. **Single Source of Storage**: Store all data once as Apache Iceberg (or Delta Lake with UniForm) in Amazon S3 or ADLS Gen2.
2. **Central Open Catalog Layer (Apache Polaris / Project Nessie / AWS Glue)**:
   - Deploy an open Iceberg REST Catalog (e.g., Apache Polaris or AWS Glue Iceberg Catalog).
   - The catalog manages table pointers, snapshots, and authorization centrally.
3. **Multi-Engine Configuration**:
   - **Apache Spark / Databricks**: Configured with Iceberg Spark runtime pointing to the REST Catalog endpoint.
   - **Snowflake**: Configured with an Iceberg External Catalog:
```sql
CREATE CATALOG INTEGRATION polaris_catalog_int
  CATALOG_SOURCE = ICEBERG_REST
  TABLE_FORMAT = ICEBERG
  CATALOG_NAMESPACE = 'enterprise_analytics'
  REST_CONFIG = (CATALOG_URI = 'https://polaris.enterprise.internal/api/catalog')
  REST_AUTHENTICATION = (TYPE = OAUTH2 ...);

CREATE ICEBERG TABLE snowflake_dw.public.orders
  EXTERNAL_VOLUME = 's3_lake_volume'
  CATALOG = 'polaris_catalog_int'
  CATALOG_TABLE_NAME = 'orders';
```
   - **Trino**: Configured with Iceberg connector using the same REST catalog.
4. **Outcome**: Zero data movement. Databricks writes an update; Snowflake and Trino query the updated snapshot instantly."""
        },

        "lakehouse-medium-18": {
            "question": "How do you optimize the schema evolution process for complex, deeply nested JSON structures within a Delta or Iceberg table?",
            "answer": """Ingesting semi-structured JSON telemetry containing hundreds of nested attributes (e.g., `payload.device.sensors.readings[].val`) often results in schema conflicts and slow queries if handled naively.

### Optimization Blueprint:
1. **Variant Data Type (Apache Iceberg / Databricks / Snowflake)**:
   - Instead of storing raw unparsed JSON strings or creating rigid, fragile struct schemas with hundreds of nested fields, use the native **Variant** data type.
   - The Variant type shreds frequently queried nested paths into columnar Parquet representations under the hood while preserving JSON flexibility.
2. **Column Mapping Support (Delta Lake)**:
   - Enable column mapping to decouple physical Parquet column names from logical table column names:
```sql
ALTER TABLE telemetry.events SET TBLPROPERTIES (
  'delta.columnMapping.mode' = 'name',
  'delta.minReaderVersion' = '2',
  'delta.minWriterVersion' = '5'
);
```
   - Allows renaming, dropping, or retyping deeply nested struct fields via metadata manipulation without touching physical files.
3. **Structured Streaming Ingestion Pattern**:
   - Ingest raw payloads into a `raw_variant` column.
   - Promote only the top 10 most frequently queried attributes (e.g., `timestamp`, `event_type`, `tenant_id`) to top-level typed columns with clustering keys."""
        },

        "lakehouse-medium-19": {
            "question": "Architect a CDC (Change Data Capture) ingestion pipeline that continuously streams incremental changes into a lakehouse table with sub-minute latency?",
            "answer": """In mission-critical operational reporting, changes from transactional databases (PostgreSQL, MySQL, Oracle) must reflect in lakehouse tables with sub-minute latency.

### End-to-End Architecture:
1. **CDC Extraction (Debezium + Apache Kafka)**:
   - Debezium monitors database WAL (Write-Ahead Logs) and publishes insert, update, and delete events as JSON/Avro to Kafka topics.
   - Events include metadata: `__op` (c, u, d), `__source_ts_ms`, and before/after payloads.
2. **Streaming Ingestion Engine (Spark Structured Streaming / Flink)**:
   - Spark Structured Streaming reads from Kafka with micro-batch trigger `trigger(processingTime="15 seconds")`.
3. **Streaming Micro-Batch Merge (Delta Lake / Iceberg)**:
   - Use `foreachBatch` to deduplicate and merge CDC records atomically into the target table:
```python
def process_cdc_microbatch(microbatch_df, batch_id):
    # Deduplicate within the micro-batch to keep only the latest operation per primary key
    from pyspark.sql.window import Window
    from pyspark.sql.functions import row_number, col
    
    window_spec = Window.partitionBy("customer_id").orderBy(col("__source_ts_ms").desc())
    latest_updates = microbatch_df.withColumn("rn", row_number().over(window_spec)).filter("rn = 1")
    
    # Execute atomic merge
    target_table = DeltaTable.forName(spark, "enterprise_lake.crm.customers")
    (target_table.alias("t")
     .merge(latest_updates.alias("s"), "t.customer_id = s.customer_id")
     .whenMatchedDelete(condition="s.__op = 'd'")
     .whenMatchedUpdateAll(condition="s.__source_ts_ms >= t.last_updated_ts")
     .whenNotMatchedInsertAll(condition="s.__op != 'd'")
     .execute())

query = (raw_cdc_stream.writeStream
         .foreachBatch(process_cdc_microbatch)
         .option("checkpointLocation", "s3://lake-checkpoints/customers_cdc")
         .start())
```
4. **Low Latency Optimization**: Enable Delta Delete Vectors to ensure deletes write sub-second bitmap vectors instead of rewriting full Parquet files."""
        },

        "lakehouse-medium-20": {
            "question": "How do you recover a lakehouse table that has been corrupted due to an interrupted metadata operation or storage failure?",
            "answer": """While lakehouse tables are ACID-compliant, extreme edge cases—such as accidental deletion of metadata JSON files or partial cloud storage outages—can corrupt table state.

### Systematic Recovery Protocol:
1. **Verify Corruption Type**:
   - Case A: Corrupted active commit JSON in transaction log (`_delta_log/000120.json` has invalid JSON syntax).
   - Case B: Missing Parquet data files referenced by active metadata.
2. **Rollback via Time Travel**:
   - If the table can still read earlier snapshots, restore the table to the last known good commit:
```sql
RESTORE TABLE enterprise_lake.sales.orders TO VERSION AS OF 119;
-- Or restore to specific timestamp
RESTORE TABLE enterprise_lake.sales.orders TO TIMESTAMP AS OF '2024-03-01 12:00:00';
```
3. **Rebuilding Table Metadata from Storage (`FSCK` / Repair)**:
   - If the entire transaction log is lost but Parquet data files exist on cloud storage:
```sql
-- Delta Lake: generate new transaction log from physical directory contents
CONVERT TO DELTA parquet.`s3://lake-storage/sales/orders`;

-- Apache Iceberg: reconstruct metadata via metadata rebuild tools
CALL system.repair_table('enterprise_lake.sales.orders');
```
4. **Root Cause Hardening**: Enforce cloud storage Object Versioning and strict IAM bucket policies denying direct `DeleteObject` calls outside the orchestrator service principal."""
        },

        "lakehouse-hard-21": {
            "question": "Architect a multi-cloud lakehouse deployment where compute engines on AWS and GCP simultaneously read and write to the same central Iceberg tables without data duplication?",
            "answer": """In enterprise multi-cloud architectures, running redundant pipelines in both AWS and Google Cloud Platform (GCP) doubles storage costs and introduces data divergence.

### Multi-Cloud Zero-Copy Architecture:
1. **Authoritative Storage & Regional Anchor**:
   - Anchor authoritative data storage in a single primary cloud with lowest egress rates (e.g., AWS S3 in `us-east-1`).
2. **Open REST Catalog with Cross-Cloud IAM (Apache Polaris / Nessie)**:
   - Host an Iceberg REST Catalog accessible over private interconnects (AWS Direct Connect + GCP Cloud Interconnect).
   - Use Cloud STS (Security Token Service) to exchange GCP service account identities for temporary presigned AWS S3 read/write URLs dynamically.
3. **Concurrent Multi-Cloud Writes**:
   - Google Cloud Dataproc / BigQuery and AWS EMR / Databricks commit transactions to the central REST Catalog.
   - The catalog serializes commits using atomic CAS (Compare-And-Swap) operations on metadata pointers.
4. **Mitigating Inter-Cloud Egress**:
   - For latency-sensitive analytical queries on GCP BigQuery, deploy an automated replication daemon utilizing **Delta/Iceberg Shallow Clones** or cloud storage cross-region batch caching to avoid incurring egress fees on repetitive BI scans."""
        },

        "lakehouse-hard-22": {
            "question": "How do you design a custom catalog implementation for Apache Iceberg optimized for billions of partitions and ultra-low latency metadata resolution?",
            "answer": """Standard relational-backed catalogs (JDBC Catalog on PostgreSQL) degrade when managing tables with billions of partitions and millions of manifest files.

### Custom Catalog Blueprint:
1. **Adopting the Iceberg REST Catalog Specification**:
   - Implement the standard Iceberg REST OpenAPI specification, decoupling query engines from database internals.
2. **Distributed Distributed Key-Value Metadata Store (FoundationDB / DynamoDB)**:
   - Store table metadata pointers in FoundationDB or Amazon DynamoDB.
   - Use atomic conditional transactions (`AttributeExists`, `ConditionExpression`) to implement sub-millisecond atomic commit swapping (`commitTable`).
3. **Hierarchical Manifest Caching in Redis**:
   - Cache serialized manifest lists and file partition statistics in an in-memory Redis cluster.
   - When a query engine requests metadata planning, the REST catalog resolves partition pruning server-side and streams back only the pruned file list via gRPC/HTTP/2.
4. **Bloom Filter Metadata Skipping**:
   - Embed Bloom filters into custom catalog manifest files to resolve high-cardinality point lookups in under 10 milliseconds."""
        },

        "lakehouse-hard-23": {
            "question": "Design a real-time, highly concurrent fraud detection system utilizing Merge-On-Read tables optimized for millisecond-level point lookups within a petabyte-scale lakehouse?",
            "answer": """Fraud detection requires real-time evaluation (<50ms) of incoming credit card transactions against historical petabyte-scale lakehouse behavioral profiles.

### Architecture Blueprint:
1. **Storage Format**: Apache Iceberg with Merge-On-Read (MOR) format v2 and equality delete files.
2. **Two-Tier Engine Topology**:
   - **Ingestion & Feature Engine**: Apache Flink processes real-time transaction streams from Kafka, updating user risk profiles in the Iceberg table using lightweight delete files.
   - **Point-Lookup Query Layer**: Deploy an ultra-fast distributed OLAP engine (StarRocks / Trino) reading Iceberg metadata directly with in-memory caching.
3. **Local Secondary Indexing (Puffin Files)**:
   - Generate Apache Iceberg Puffin files storing Bloom filters on `credit_card_hash` and `account_id` per Parquet data file.
4. **Execution Flow**:
   - When a swipe occurs, the fraud engine issues a point query:
     `SELECT * FROM user_profiles WHERE account_id = 'A987654'`
   - The query engine uses the Bloom filter to pinpoint the exact 1 Parquet file out of 500,000 files in 8 milliseconds, merges the in-memory delete vector, and returns the profile in sub-30ms."""
        },

        "lakehouse-hard-24": {
            "question": "Architect a branch-and-merge framework using Project Nessie or Delta Lake branching to allow data science teams to perform isolated experiments on production data structures?",
            "answer": """Allowing data scientists to test complex feature transformations or model training pipelines against production data historically required duplicating terabytes of data into sandbox environments.

### Branch-and-Merge Architecture (Project Nessie / Git-for-Data):
1. **Create Isolated Zero-Copy Branch**:
   - A data scientist creates a virtual branch off `main` in Project Nessie:
```sql
-- Create an isolated experimental branch
CREATE BRANCH experiment_churn_v2 IN nessie FROM main;
USE REFERENCE experiment_churn_v2 IN nessie;
```
   - Operates in sub-second time; zero data is copied.
2. **Isolated Transformation Execution**:
   - The ML pipeline modifies schemas, updates columns, and appends synthetic feature tables on the `experiment_churn_v2` branch.
   - Production users on `main` continue reading unaltered production data with zero interference.
3. **Automated Data Quality Validation**:
   - CI/CD tests run against the experimental branch to verify statistical drift, null ratios, and metric accuracy.
4. **Atomic Fast-Forward Merge**:
   - Once validated, merge the branch back into `main`:
```sql
MERGE BRANCH experiment_churn_v2 INTO main IN nessie;
```
   - Updates the production table metadata pointer atomically; production users instantly see the new validated features with zero downtime."""
        },

        "lakehouse-hard-25": {
            "question": "How do you engineer a comprehensive disaster recovery and cross-region replication architecture for a massive data lakehouse with zero data loss (RPO=0)?",
            "answer": """Achieving RPO=0 (zero data loss) across multi-region data lakes during cloud provider regional disasters requires coordinating physical storage replication with transaction log consensus.

### Comprehensive DR Architecture:
1. **Synchronous Cloud Storage Replication**:
   - Configure AWS S3 Multi-Region Access Points (MRAP) with bidirectional Cross-Region Replication (CRR) and replication metrics/alerts enabled, or Azure GRS (Geo-Redundant Storage).
2. **Distributed Transaction Consensus**:
   - Standard asynchronous file replication cannot guarantee RPO=0 because metadata commit files can arrive before underlying Parquet data files.
   - Deploy an active-active cross-region catalog (e.g., Apache Polaris backed by multi-region CockroachDB / AWS Spanner).
   - Writes commit to the transaction catalog using Raft consensus across both regions before acknowledging the client.
3. **Delta Deep Clone Incremental Sync**:
   - For semi-synchronous disaster recovery (RPO < 5m), schedule continuous Delta Deep Clone jobs:
```sql
CREATE OR REPLACE TABLE secondary_lake.sales.orders
DEEP CLONE primary_lake.sales.orders;
```
4. **Automated Health Probes & DNS Failover**:
   - Route 53 health checks monitor primary region endpoints.
   - Upon confirmed regional outage, trigger automated DNS failover to the DR region, unpausing standby compute clusters instantly."""
        },

        "lakehouse-hard-26": {
            "question": "Design a custom indexing mechanism integrated directly into the lakehouse metadata layer to dramatically accelerate 'needle in a haystack' queries?",
            "answer": """When querying a 50-terabyte lakehouse table for a single rare identifier (e.g., finding a single fraud transaction ID among 10 billion records), standard partition pruning still requires scanning entire partition files.

### Custom Metadata Indexing Architecture:
1. **Decoupled Secondary Index Indexing Daemon**:
   - A background worker listens to table transaction log commits (`commit.json`).
   - For newly committed Parquet files, extract primary search attributes (`transaction_uuid`) and compute an inverted index or Bloom filter bitmap.
2. **Bitmap Index Storage in Metadata Directory**:
   - Serialize index files into a co-located metadata directory (`_table_indexes/uuid_bloom/`) using Roaring Bitmaps or Apache Lucene inverted index segments.
3. **Query Engine Planner Hook**:
   - Extend the query planner (Spark Catalyst rule or Trino Connector optimizer):
   - When a predicate `WHERE transaction_uuid = '...'` is detected:
     1. Query the bitmap index first to resolve the exact physical file path and row offset.
     2. Override the standard table scan plan with a targeted byte-range read (`fs.open(path).seek(offset)`).
4. **Performance Impact**: Accelerates point queries from 60 seconds (full partition scan) down to 250 milliseconds."""
        },

        "lakehouse-hard-27": {
            "question": "Architect a completely serverless lakehouse ingestion framework that dynamically scales compute to ingest and optimize millions of microscopic IoT events per second?",
            "answer": """Ingesting millions of microscopic IoT telemetry payloads per second directly into a lakehouse format using traditional long-running VM clusters results in either astronomical idle compute costs or catastrophic small file fragmentation.

### Serverless Architecture Blueprint:
1. **Ingestion Tier (Event Ingress)**:
   - IoT devices publish to AWS Kinesis Data Streams / Azure Event Hubs provisioned with auto-scaling shard capacity.
2. **Buffer & Micro-Batching Layer (AWS Lambda / Cloud Functions)**:
   - Serverless Lambda functions trigger on event stream batches (e.g., batch window 5 seconds, max batch size 10,000 events).
   - Functions transform JSON payloads and write compact Snappy-compressed Parquet chunks into an S3 landing buffer (`s3://lake-landing/buffer/`).
3. **Autonomous Compaction Engine (Serverless DLT / Databricks Serverless)**:
   - Databricks Auto Loader runs in serverless mode, monitoring the landing buffer via cloud storage file notification webhooks.
   - Auto Loader streams data into the Bronze Delta table with `cloudFiles.maxFilesPerTrigger = 50000`.
4. **Predictive Compaction**:
   - Serverless background compaction automatically merges small buffer chunks into 512 MB optimized Delta files with Liquid Clustering, scaling compute up during traffic bursts and scaling to zero during lulls."""
        },

        "lakehouse-hard-28": {
            "question": "How do you implement robust, high-performance distributed lock management across highly disparate processing engines writing to the exact same lakehouse partitions?",
            "answer": """When disparate processing engines (Spark on Databricks, Flink on Kubernetes, Trino on AWS EMR) write concurrently to the same lakehouse table, relying on local OS file locks fails because cloud object storage (S3/GCS) lacks file locking primitives.

### Distributed Lock Management Architecture:
1. **External Distributed Lock Manager (DLM)**:
   - Deploy an external consensus coordinator: Amazon DynamoDB Lock Client, Apache ZooKeeper, or Redis Redlock.
2. **Lock Acquisition Protocol**:
   - Before committing a transaction, the engine requests a lease lock on the table resource key (`lock:enterprise_lake:sales_orders`).
   - The lock includes a short Time-To-Live (TTL) (e.g., 30 seconds) with a background heartbeat thread to prevent deadlocks if the writer crashes.
3. **Commit Verification & Release**:
   - The writer validates the latest snapshot ID from the lock store, writes its commit metadata file atomically, and updates the active snapshot pointer.
   - The lock is released immediately upon commit completion.
4. **DynamoDB Lock Implementation for Delta Lake / Iceberg**:
   - Used natively in AWS environments (`io.delta.storage.DynamoDBLogStore`): uses DynamoDB conditional writes to guarantee mutual exclusion across any engine running on any cloud VM."""
        },

        "lakehouse-hard-30": {
            "question": "How would you migrate a legacy, 50-petabyte Apache Hive warehouse to Apache Iceberg with zero downtime for downstream analytical consumers?",
            "answer": """Migrating 50 petabytes of data from legacy Apache Hive tables to Apache Iceberg by physically rewriting Parquet files would take months, cost hundreds of thousands of dollars in cloud compute, and disrupt business operations.

### In-Place Zero-Copy Migration Strategy:
1. **In-Place Metadata Migration (`snapshot` / `migrate`)**:
   - Utilize Iceberg's native in-place migration procedures:
```sql
-- Iceberg migration command
CALL catalog.system.snapshot(
    table => 'legacy_hive_db.web_events',
    target_table => 'iceberg_db.web_events'
);
```
   - **How It Works**: Iceberg reads the Hive metastore partition locations and underlying Parquet file footers, constructing Iceberg metadata manifests without moving, copying, or rewriting a single byte of data. Completes in minutes instead of months.
2. **Dual-Read Transition Layer**:
   - Keep Hive metastore active in read-only mode for legacy consumers.
   - Modern engines (Trino, Spark) immediately switch to reading the newly created Iceberg table, gaining instant ACID transactions, time travel, and hidden partitioning.
3. **Incremental Ingestion Redirection**:
   - Switch upstream ingestion pipelines (Flink, Airflow) to write directly to the Iceberg table.
4. **Background Compaction & Cutover**:
   - Once all consumers are verified on Iceberg, run background `OPTIMIZE` and compaction jobs, deprecating and dropping the legacy Hive table safely."""
        }
    }
