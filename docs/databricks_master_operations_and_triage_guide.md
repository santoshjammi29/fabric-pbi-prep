# Databricks Master Coding Sheet & Production Operations Guide
**Comprehensive Operational Reference: DBFS, DBUtils, PySpark Transformations, Spark SQL, Memory Models & Production Triage**  
*Aligned with Databricks Runtime 15.4 / 16.0 LTS • Unity Catalog • Photon Engine • Apache Spark 3.5 / 4.0*  
*References: [jrlasak/databricks-100](https://github.com/jrlasak/databricks-100), [dfe-analytical-services/databricks_code_learn](https://github.com/dfe-analytical-services/databricks_code_learn)*

---

## Table of Contents
1. [Part 1: Databricks File System (DBFS), DBUtils & Unity Catalog Volumes](#part-1-databricks-file-system-dbfs-dbutils--unity-catalog-volumes)
2. [Part 2: PySpark Core & Advanced Transformations Reference](#part-2-pyspark-core--advanced-transformations-reference)
3. [Part 3: Databricks SQL & Spark SQL Reference](#part-3-databricks-sql--spark-sql-reference)
4. [Part 4: Production Issues, Memory Bottlenecks & Triage Runbooks](#part-4-production-issues-memory-bottlenecks--triage-runbooks)
5. [Part 5: Multi-Language Interoperability & Notebook Automation](#part-5-multi-language-interoperability--notebook-automation)

---

# Part 1: Databricks File System (DBFS), DBUtils & Unity Catalog Volumes

### 1.1 DBFS vs. Unity Catalog Volumes Architecture
| Feature | Legacy DBFS (`dbfs:/` or `/mnt/`) | Unity Catalog Volumes (`/Volumes/`) | Cloud Direct (`abfss://`, `s3://`) |
| :--- | :--- | :--- | :--- |
| **Namespace** | Flat global filesystem per workspace | 3-Level Namespace: `catalog.schema.volume` | Cloud storage URI container/bucket path |
| **Security / Governance**| Workspace-scoped root, plaintext ACLs | Fine-grained Unity Catalog SQL GRANTs | IAM roles, service principals, SAS tokens |
| **POSIX Support** | Limited FUSE mount `/dbfs/` (slow read/write) | Native local file API support via `/Volumes/` | None (requires Spark or cloud SDKs) |
| **Status** | Deprecated for enterprise data; workspace-only | **Industry Standard & Best Practice** | Recommended for external lakehouse tables |

---

### 1.2 `dbutils.fs` — File System Manipulation
```python
# ==============================================================================
# 1. dbutils.fs: Core File Operations & Directory Navigation
# ==============================================================================

# List directory contents with metadata (path, name, size, modificationTime)
files = dbutils.fs.ls("/Volumes/prod_catalog/raw_data/landing_zone/")
for f in files:
    print(f"File: {f.name} | Size: {f.size / (1024*1024):.2f} MB | Path: {f.path}")

# Copy file or directory recursively (True = recursive)
dbutils.fs.cp(
    "dbfs:/databricks-datasets/COVID/covid-19-data/",
    "/Volumes/prod_catalog/raw_data/covid_landing/",
    recurse=True
)

# Move or rename file/folder atomically
dbutils.fs.mv(
    "/Volumes/prod_catalog/raw_data/covid_landing/us-counties.csv",
    "/Volumes/prod_catalog/raw_data/covid_archive/us_counties_2026.csv"
)

# Create directory structure recursively
dbutils.fs.mkdirs("/Volumes/prod_catalog/raw_data/staging/delta_checkpoints/")

# Preview head of file (up to specified bytes, default 65536 bytes)
preview_text = dbutils.fs.head("/Volumes/prod_catalog/raw_data/landing_zone/sample.json", maxBytes=1024)
print(preview_text)

# Write string content directly to a file (overwrite=True to replace)
dbutils.fs.put(
    "/Volumes/prod_catalog/raw_data/staging/healthcheck.txt",
    "Pipeline Status: OK | Batch: 2026-10-22",
    overwrite=True
)

# Delete file or directory recursively (recurse=True is required for non-empty folders)
dbutils.fs.rm("/Volumes/prod_catalog/raw_data/staging/temp_staging/", recurse=True)
```

---

### 1.3 `dbutils.widgets` — Notebook Parameterization
```python
# ==============================================================================
# 2. dbutils.widgets: Interactive UI Inputs & Workflow Parameter Passing
# ==============================================================================

# Create Text input widget with default value
dbutils.widgets.text("processing_date", "2026-10-22", "1. Ingestion Date (YYYY-MM-DD)")

# Create Dropdown widget with selectable choices
dbutils.widgets.dropdown("environment", "prod", ["dev", "staging", "prod"], "2. Target Environment")

# Create Combobox (editable text with dropdown choices)
dbutils.widgets.combobox("batch_size", "5000", ["1000", "5000", "20000", "100000"], "3. Ingestion Batch Size")

# Create Multiselect widget for multiple category filtering
dbutils.widgets.multiselect(
    "regions",
    "EMEA",
    ["EMEA", "APAC", "AMER", "LATAM"],
    "4. Active Business Units"
)

# Retrieve parameter values inside execution cells
active_date = dbutils.widgets.get("processing_date")
target_env = dbutils.widgets.get("environment")
selected_regions = dbutils.widgets.get("regions").split(",")

print(f"Executing pipeline for {active_date} in [{target_env}] across {selected_regions}")

# Clean up widgets
# dbutils.widgets.remove("batch_size") # Remove single widget
# dbutils.widgets.removeAll()          # Remove all widgets in current notebook
```

---

### 1.4 `dbutils.secrets` — Enterprise Credential Security
```python
# ==============================================================================
# 3. dbutils.secrets: Zero-Plaintext Security & Key Vault Integration
# ==============================================================================

# List available secret scopes accessible by current cluster identity
scopes = dbutils.secrets.listScopes()
for s in scopes:
    print(f"Scope Name: {s.name}")

# List metadata of keys within a scope (values are strictly redacted)
keys = dbutils.secrets.list("azure-keyvault-prod")
for k in keys:
    print(f"Secret Key: {k.key}")

# Fetch secret value securely (automatically redacted as [REDACTED] in logs/outputs)
db_password = dbutils.secrets.get(scope="azure-keyvault-prod", key="sql-dw-svc-password")
client_secret = dbutils.secrets.get(scope="aws-secrets-prod", key="s3-access-key")

# Pass secret securely into JDBC connection options without logging
jdbc_options = {
    "url": "jdbc:sqlserver://eu-finance-sql.database.windows.net:1433;databaseName=FinDW",
    "dbtable": "dbo.FactLedger",
    "user": "etl_service_principal",
    "password": db_password,
    "driver": "com.microsoft.sqlserver.jdbc.SQLServerDriver"
}
```

---

### 1.5 `dbutils.notebook` — Workflow Orchestration & DAG Chaining
```python
# ==============================================================================
# 4. dbutils.notebook: Nested Notebook Execution & Value Passing
# ==============================================================================

# Parent Notebook: Execute child ETL stage notebook with timeout and arguments
try:
    child_result = dbutils.notebook.run(
        path="./stages/02_silver_cleansing",
        timeout_seconds=3600,  # 1 hour timeout
        arguments={
            "batch_date": "2026-10-22",
            "source_layer": "bronze_landing",
            "target_layer": "silver_conformed"
        }
    )
    import json
    parsed_output = json.loads(child_result)
    print(f"Child completed successfully! Processed {parsed_output['records_ingested']} records.")
except Exception as e:
    raise RuntimeError(f"Child notebook pipeline failed: {str(e)}")

# ------------------------------------------------------------------------------
# Inside Child Notebook (./stages/02_silver_cleansing):
# ------------------------------------------------------------------------------
# Retrieve input args
batch_date = dbutils.widgets.get("batch_date")
# Execute transformations ...
processed_count = 142500

# Exit child notebook and return JSON payload to parent caller
import json
output_payload = json.dumps({"status": "SUCCESS", "records_ingested": processed_count})
dbutils.notebook.exit(output_payload)
```

---

# Part 2: PySpark Core & Advanced Transformations Reference

### 2.1 Schema Definition & Data Types
```python
from pyspark.sql.types import (
    StructType, StructField, StringType, IntegerType, LongType,
    DoubleType, DecimalType, BooleanType, DateType, TimestampType,
    ArrayType, MapType
)

# Rigorous schema enforcement prevents driver schema-inference bottlenecks
order_schema = StructType([
    StructField("order_id", StringType(), False),
    StructField("customer_id", StringType(), False),
    StructField("transaction_timestamp", TimestampType(), False),
    StructField("amount", DecimalType(18, 2), False),
    StructField("is_flagged", BooleanType(), False),
    StructField("line_items", ArrayType(
        StructType([
            StructField("item_id", StringType(), False),
            StructField("quantity", IntegerType(), False),
            StructField("unit_price", DecimalType(10, 2), False)
        ])
    ), True),
    StructField("metadata", MapType(StringType(), StringType()), True)
])
```

---

### 2.2 Advanced PySpark Functions: Windowing, Deduplication & Aggregations
```python
from pyspark.sql import functions as F
from pyspark.sql.window import Window

# ------------------------------------------------------------------------------
# 1. High-Performance Deduplication with Row_Number Windowing
# ------------------------------------------------------------------------------
# Window partitioned by primary key, ordered by ingestion timestamp descending
dedup_window = Window.partitionBy("order_id").orderBy(F.col("transaction_timestamp").desc())

clean_orders_df = (
    raw_df
    .withColumn("row_num", F.row_number().over(dedup_window))
    .filter(F.col("row_num") == 1)
    .drop("row_num")
)

# ------------------------------------------------------------------------------
# 2. Financial Analytics: Cumulative Sum, Moving Average & Lead/Lag
# ------------------------------------------------------------------------------
customer_running_window = (
    Window
    .partitionBy("customer_id")
    .orderBy("transaction_timestamp")
    .rowsBetween(Window.unboundedPreceding, Window.currentRow)
)

customer_moving_avg_window = (
    Window
    .partitionBy("customer_id")
    .orderBy("transaction_timestamp")
    .rowsBetween(-6, Window.currentRow)  # 7-day moving window
)

analytics_df = clean_orders_df.select(
    "order_id",
    "customer_id",
    "transaction_timestamp",
    "amount",
    # Running cumulative spend per customer
    F.sum("amount").over(customer_running_window).alias("cumulative_customer_spend"),
    # Moving average
    F.avg("amount").over(customer_moving_avg_window).alias("moving_avg_7_orders"),
    # Previous order timestamp & time-delta analysis
    F.lag("transaction_timestamp", 1).over(
        Window.partitionBy("customer_id").orderBy("transaction_timestamp")
    ).alias("prev_order_timestamp")
).withColumn(
    "seconds_since_last_order",
    F.col("transaction_timestamp").cast("long") - F.col("prev_order_timestamp").cast("long")
)
```

---

### 2.3 Complex Nested Data Transformations: Arrays, Structs & JSON
```python
# ------------------------------------------------------------------------------
# 3. Unnesting & Exploding High-Dimensional Arrays
# ------------------------------------------------------------------------------
flattened_items_df = (
    clean_orders_df
    # explode_outer preserves orders even if line_items is null/empty
    .select("order_id", "customer_id", F.explode_outer("line_items").alias("item"))
    .select(
        "order_id",
        "customer_id",
        F.col("item.item_id").alias("item_id"),
        F.col("item.quantity").alias("quantity"),
        F.col("item.unit_price").alias("unit_price"),
        (F.col("item.quantity") * F.col("item.unit_price")).alias("item_total")
    )
)

# ------------------------------------------------------------------------------
# 4. Higher-Order Array Functions (transform, filter, aggregate)
# ------------------------------------------------------------------------------
# Transform array elements in-place without exploding to avoid shuffle row-multiplication
tax_adjusted_df = clean_orders_df.withColumn(
    "taxed_line_items",
    F.transform(
        "line_items",
        lambda x: F.struct(
            x.item_id.alias("item_id"),
            x.quantity.alias("quantity"),
            (x.unit_price * 1.20).alias("unit_price_with_vat")
        )
    )
)

# Array filter: keep only line items where quantity > 5
bulk_items_df = clean_orders_df.withColumn(
    "bulk_items",
    F.filter("line_items", lambda x: x.quantity > 5)
)

# ------------------------------------------------------------------------------
# 5. String to JSON Parsing with Strict Schema & Rescued Data
# ------------------------------------------------------------------------------
json_payload_schema = "device_id STRING, event_name STRING, battery_level DOUBLE"

events_parsed_df = raw_kafka_df.withColumn(
    "parsed_json",
    F.from_json(F.col("raw_payload_str"), json_payload_schema, {"mode": "PERMISSIVE"})
).select(
    "kafka_offset",
    "parsed_json.device_id",
    "parsed_json.event_name",
    "parsed_json.battery_level"
)
```

---

### 2.4 Distributed Join Strategies & Join Hints
```python
# ------------------------------------------------------------------------------
# 6. Join Strategies & Catalyst Optimization Hints
# ------------------------------------------------------------------------------
# A. Broadcast Hash Join (BHJ): Small dimension (<100MB) joined with large fact table
# Eliminates expensive network shuffle of the multi-billion-row fact table
fact_orders = spark.table("prod_catalog.silver.orders")
dim_stores = spark.table("prod_catalog.silver.stores")

bhj_orders = fact_orders.join(
    F.broadcast(dim_stores),
    on="store_id",
    how="inner"
)

# B. Explicit Catalyst Join Hints:
# /*+ BROADCAST(dim) */, /*+ MERGE(large_table) */, /*+ SHUFFLE_HASH(skewed_table) */
hinted_df = fact_orders.hint("broadcast", dim_stores).join(dim_stores, "store_id")

# C. Anti Join: Identify customers who have NOT placed any orders in 2026
dim_customers = spark.table("prod_catalog.silver.customers")
orders_2026 = fact_orders.filter("order_date >= '2026-01-01'")

inactive_customers_df = dim_customers.join(
    orders_2026,
    on="customer_id",
    how="left_anti"  # Extremely efficient: drops matched rows without building joined output
)
```

---

### 2.5 Structured Streaming & Databricks Auto Loader
```python
# ------------------------------------------------------------------------------
# 7. Production Auto Loader (`cloudFiles`) Ingestion Pipeline
# ------------------------------------------------------------------------------
streaming_source = (
    spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/Volumes/prod_catalog/checkpoints/orders_schema/")
    .option("cloudFiles.inferColumnTypes", "true")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .option("cloudFiles.rescuedDataColumn", "_rescued_data")  # Captures unparseable/corrupted data
    .option("cloudFiles.maxFilesPerTrigger", 1000)            # Backpressure rate control
    .load("/Volumes/prod_catalog/landing/raw_orders/")
)

# Idempotent writeStream into Delta Lake with checkpointing
query = (
    streaming_source
    .withColumn("ingestion_timestamp", F.current_timestamp())
    .writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "/Volumes/prod_catalog/checkpoints/orders_delta_write/")
    .trigger(availableNow=True)  # Micro-batch batch-mode: processes all pending data then gracefully terminates
    .toTable("prod_catalog.bronze.streaming_orders")
)
```

---

# Part 3: Databricks SQL & Spark SQL Reference

### 3.1 Unity Catalog DDL: Tables, Volumes, Liquid Clustering
```sql
-- =============================================================================
-- 1. Unity Catalog DDL with Liquid Clustering & Table Constraints
-- =============================================================================

USE CATALOG prod_catalog;
USE SCHEMA silver;

-- Create Managed Delta Table with Liquid Clustering (Replaces Z-ORDER & Hive Partitioning)
CREATE OR REPLACE TABLE prod_catalog.silver.transactions (
    txn_id STRING NOT NULL,
    account_id STRING NOT NULL,
    customer_id STRING NOT NULL,
    txn_amount DECIMAL(18, 4) NOT NULL,
    txn_type STRING,
    country_code STRING,
    txn_timestamp TIMESTAMP NOT NULL,
    created_date DATE GENERATED ALWAYS AS (CAST(txn_timestamp AS DATE)),
    CONSTRAINT chk_positive_amount CHECK (txn_amount > 0)
)
USING DELTA
CLUSTER BY (customer_id, created_date) -- Liquid clustering handles multiple cardinalities dynamically
COMMENT 'Core audited silver transactions table with liquid clustering'
TBLPROPERTIES (
    'delta.autoOptimize.optimizeWrites' = 'true',
    'delta.autoOptimize.autoCompact' = 'true',
    'delta.enableChangeDataFeed' = 'true',
    'delta.targetFileSize' = '134217728' -- 128 MB target file size
);

-- Create Unity Catalog Volume for unstructured assets & model weights
CREATE VOLUME IF NOT EXISTS prod_catalog.silver.raw_telemetry_files
COMMENT 'Ingestion volume for raw IoT binary blobs and PDF contracts';
```

---

### 3.2 Advanced DML: Production `MERGE INTO` (SCD Type 1 & 2)
```sql
-- =============================================================================
-- 2. Atomic Upsert (MERGE INTO) with Conditional Updates & Deletions
-- =============================================================================

MERGE INTO prod_catalog.silver.customer_dim AS target
USING staging_customer_updates AS source
ON target.customer_id = source.customer_id

-- 1. When matched and record marked as soft-deleted in source: Update active flag
WHEN MATCHED AND source.is_deleted = true THEN
  UPDATE SET 
    target.is_active = false,
    target.updated_at = current_timestamp()

-- 2. When matched and incoming record has newer timestamp: Update attributes
WHEN MATCHED AND source.update_timestamp > target.updated_at THEN
  UPDATE SET
    target.email = source.email,
    target.phone_number = source.phone_number,
    target.risk_score = source.risk_score,
    target.updated_at = source.update_timestamp

-- 3. When not matched: Insert new record
WHEN NOT MATCHED THEN
  INSERT (
    customer_id,
    email,
    phone_number,
    risk_score,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    source.customer_id,
    source.email,
    source.phone_number,
    source.risk_score,
    true,
    current_timestamp(),
    source.update_timestamp
  );
```

---

### 3.3 Analytical SQL: `QUALIFY`, `PIVOT`, Higher-Order Functions
```sql
-- =============================================================================
-- 3. Modern Spark SQL Analytical Queries
-- =============================================================================

-- QUALIFY eliminates subquery nesting for Top-N ranking per partition
SELECT 
    customer_id,
    order_id,
    amount,
    transaction_date,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) as rank_by_spend
FROM prod_catalog.silver.transactions
WHERE transaction_date >= '2026-01-01'
QUALIFY rank_by_spend <= 3; -- Filters directly on window function without wrapping in subquery

-- PIVOT: Transpose quarterly revenue by product category
SELECT * FROM (
    SELECT product_category, quarter, revenue
    FROM prod_catalog.gold.quarterly_sales
)
PIVOT (
    SUM(revenue)
    FOR quarter IN ('Q1', 'Q2', 'Q3', 'Q4')
);

-- Higher-Order Functions: Transform array of structs directly in SQL
SELECT 
    order_id,
    TRANSFORM(line_items, item -> item.unit_price * item.quantity) AS item_totals,
    FILTER(line_items, item -> item.quantity > 10) AS wholesale_items,
    AGGREGATE(line_items, 0.0, (acc, item) -> acc + (item.unit_price * item.quantity)) AS calculated_order_total
FROM prod_catalog.silver.orders;
```

---

### 3.4 Delta Maintenance: `OPTIMIZE`, `VACUUM` & `RESTORE`
```sql
-- =============================================================================
-- 4. Delta Lake Lifecycle Hygiene & Maintenance
-- =============================================================================

-- Trigger compaction and clustering
OPTIMIZE prod_catalog.silver.transactions;

-- Inspect audit trail of all commits, user identities, and timestamps
DESCRIBE HISTORY prod_catalog.silver.transactions;

-- Dry run of vacuum to inspect orphaned files older than 7 days
VACUUM prod_catalog.silver.transactions RETAIN 168 HOURS DRY RUN;

-- Execute permanent deletion of uncommitted/stale files older than retention threshold
VACUUM prod_catalog.silver.transactions RETAIN 168 HOURS;

-- Time travel query: Query table exactly as it existed at version 14
SELECT COUNT(*) FROM prod_catalog.silver.transactions VERSION AS OF 14;

-- Emergency Rollback: Restore table state to previous valid commit
RESTORE TABLE prod_catalog.silver.transactions TO VERSION AS OF 14;
```

---

### 3.5 Databricks System Tables & FinOps Auditing
```sql
-- =============================================================================
-- 5. Databricks System Tables: Billing, DBU Consumption & Audit
-- =============================================================================

-- Identify Top 10 Most Expensive Clusters by DBU Consumption in Last 30 Days
SELECT 
    usage_metadata.cluster_id,
    sku_name,
    SUM(usage_quantity) AS total_dbus_consumed,
    ROUND(SUM(usage_quantity) * 0.40, 2) AS estimated_usd_cost
FROM system.billing.usage
WHERE usage_date >= current_date() - INTERVAL 30 DAYS
  AND usage_metadata.cluster_id IS NOT NULL
GROUP BY usage_metadata.cluster_id, sku_name
ORDER BY total_dbus_consumed DESC
LIMIT 10;

-- Audit: Detect users querying PII/Sensitive Tables in Unity Catalog
SELECT 
    event_time,
    user_identity.email,
    action_name,
    request_params.table_full_name
FROM system.access.audit
WHERE request_params.table_full_name LIKE '%customer_dim%'
  AND event_time >= current_date() - INTERVAL 7 DAYS
ORDER BY event_time DESC;
```

---

# Part 4: Production Issues, Memory Bottlenecks & Triage Runbooks

### 4.1 Production Failure Decision Matrix
| Failure Symptom | Spark UI / Log Signature | Root Cause | Immediate Production Remediation |
| :--- | :--- | :--- | :--- |
| **Driver Out Of Memory** | `java.lang.OutOfMemoryError: Java heap space` on Driver | Calling `.collect()`, `.toPandas()`, or massive broadcast join | Replace `.collect()` with `.take(100)` or write to Delta; disable auto-broadcast if table size underestimated. |
| **Executor OOM (137)** | `Container killed by YARN for exceeding memory limits` / `Exit code 137` | Un-spillable objects, high off-heap Python serialization, GC overhead | Increase `spark.executor.memoryOverhead` (20-30% of executor memory); tune Arrow batch size. |
| **Data Skew / Straggler** | 99% tasks complete in seconds; 1 task runs for hours | Uneven partition keys (e.g., NULLs, 'DEFAULT', or country 'US') | Enable AQE Skew Join (`spark.sql.adaptive.skewJoin.enabled`); apply two-phase salt keying. |
| **Tungsten Disk Spill** | Spark UI: `Spill (Memory): 85 GB, Spill (Disk): 24 GB` | Unpartitioned window functions, wide shuffles with too few partitions | Increase `spark.sql.shuffle.partitions`; ensure >= 4 GB RAM per CPU core; repartition before wide join. |
| **Small File Degradation**| Query planning takes minutes; thousands of 50 KB Parquet files | Ingestion jobs appending tiny batches every few seconds | Run `OPTIMIZE`; enable `autoCompact` and `optimizeWrite`; configure `delta.targetFileSize = 134217728`. |
| **OCC Commit Conflict** | `ConcurrentAppendException` / `ConcurrentTransactionException` | Multiple jobs modifying the same table/partition concurrently | Enable partition-level isolation; migrate to Liquid Clustering; ensure idempotent write batches. |
| **Broadcast Timeout** | `TimeoutException: Futures timed out after [300 seconds]` | Driver collecting broadcast dataset exceeds 300s socket timeout | Increase `spark.sql.broadcastTimeout = 600`; or set `spark.sql.autoBroadcastJoinThreshold = -1`. |

---

### 4.2 Triage Runbook 1: Driver Out Of Memory (Driver OOM)
```python
# ------------------------------------------------------------------------------
# SCENARIO: Driver OOM during large table aggregation or reporting
# ERROR: java.lang.OutOfMemoryError: Java heap space
# ------------------------------------------------------------------------------

# ❌ ANTI-PATTERN: Pulling distributed dataset into Driver JVM memory
bad_df = spark.table("prod_catalog.silver.transactions")
all_records = bad_df.collect()            # Crashes Driver JVM if > 2 GB
pandas_df = bad_df.toPandas()             # Collects all rows into single Python process

# ✅ PRODUCTION PATTERN 1: Write directly to distributed sink or use take/limit
bad_df.limit(1000).toPandas()             # Safe: bounded size

# ✅ PRODUCTION PATTERN 2: Use PySpark Pandas API (Pandas on Spark)
# Runs distributed across executors, never collecting to driver
import pyspark.pandas as ps
ps_df = ps.read_table("prod_catalog.silver.transactions")
summary = ps_df.groupby("country_code").amount.sum()

# ✅ PRODUCTION PATTERN 3: Cluster Configuration Tuning (Databricks Cluster Edit)
# Set in Cluster Spark Config:
# spark.driver.memory 16g
# spark.driver.maxResultSize 4g
```

---

### 4.3 Triage Runbook 2: Data Skew Elimination via Two-Phase Key Salting
```python
# ------------------------------------------------------------------------------
# SCENARIO: Skewed join key ('US' represents 85% of 500M rows)
# SYMPTOM: Stage stuck at 199/200 tasks; 1 core pegged at 100% CPU for 45 minutes
# ------------------------------------------------------------------------------

# ✅ PRODUCTION REMEDIATION: Two-Phase Random Salting Technique
SALT_FACTOR = 16  # Distribute hot key across 16 parallel tasks

# Step 1: Add random salt [0..15] to skewed fact table
skewed_fact = spark.table("prod_catalog.silver.transactions").withColumn(
    "salt",
    F.concat(F.col("country_code"), F.lit("_"), F.floor(F.rand() * SALT_FACTOR))
)

# Step 2: Replicate dimension table across all salt values [0..15]
dim_countries = spark.table("prod_catalog.silver.dim_countries")
salt_df = spark.range(0, SALT_FACTOR).withColumnRenamed("id", "salt_id")

replicated_dim = dim_countries.crossJoin(salt_df).withColumn(
    "salt",
    F.concat(F.col("country_code"), F.lit("_"), F.col("salt_id"))
)

# Step 3: Perform balanced join on salted key
balanced_join_df = skewed_fact.join(
    replicated_dim,
    on="salt",
    how="inner"
).drop("salt", "salt_id")

# Step 4: Ensure Adaptive Query Execution (AQE) skew join is enabled
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor", "5")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "134217728") # 128 MB
```

---

### 4.4 Triage Runbook 3: Eliminating Tungsten Disk Spill
```python
# ------------------------------------------------------------------------------
# SCENARIO: Spark UI shows massive Spill (Memory) and Spill (Disk)
# CAUSE: Tasks process partitions larger than executor execution memory slice
# ------------------------------------------------------------------------------

# 1. Inspect partition count before shuffle
current_partitions = df.rdd.getNumPartitions()
print(f"Current partitions: {current_partitions}")

# 2. Dynamic Shuffle Partition Calculation:
# Target partition size after shuffle = 100 MB to 200 MB
# Formula: shuffle_partitions = total_dataset_bytes / 150MB
# Example for 150 GB dataset: 150,000 MB / 150 MB = 1000 partitions
spark.conf.set("spark.sql.shuffle.partitions", 1000)

# 3. Enable Adaptive Coalesce to automatically shrink empty partitions downstream
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.advisoryPartitionSizeInBytes", "134217728") # 128 MB

# 4. Avoid Wide Unbounded Window Functions
# ❌ BAD: Window.orderBy("date") -> Shuffles ALL data into ONE partition
# ✅ GOOD: Window.partitionBy("entity_id").orderBy("date")
```

---

### 4.5 Triage Runbook 4: Eliminating Concurrent Append & Metadata Conflicts
```python
# ------------------------------------------------------------------------------
# SCENARIO: Multiple streaming or batch jobs writing to same Delta table fail with:
# io.delta.exceptions.ConcurrentAppendException
# ------------------------------------------------------------------------------

# Fix 1: Switch from WriteSerializable to Snapshot Isolation if transaction consistency allows
# Set at table level:
spark.sql("""
    ALTER TABLE prod_catalog.silver.transactions 
    SET TBLPROPERTIES ('delta.isolationLevel' = 'SnapshotIsolation')
""")

# Fix 2: Migrate from static partitions to Liquid Clustering
# Liquid clustering allows concurrent writes to non-overlapping file sets without partition locks
spark.sql("""
    ALTER TABLE prod_catalog.silver.transactions 
    CLUSTER BY (customer_id, created_date)
""")

# Fix 3: In PySpark merges, specify explicit partition predicate in join condition
# This restricts the search space and isolates locks to targeted file blocks
from delta.tables import DeltaTable

delta_table = DeltaTable.forName(spark, "prod_catalog.silver.transactions")
(
    delta_table.alias("target")
    .merge(
        source_df.alias("source"),
        # Predicate pruning partition space avoids scanning full table
        "target.created_date = source.created_date AND target.txn_id = source.txn_id"
    )
    .whenMatchedUpdateAll()
    .whenNotMatchedInsertAll()
    .execute()
)
```

---

# Part 5: Multi-Language Interoperability & Notebook Automation

### 5.1 Notebook Magic Commands Cheat Sheet
```
%python    # Runs execution in the Python kernel (default in PySpark notebooks)
%sql       # Runs Databricks SQL directly against active catalog and session temp views
%scala     # Runs in Scala JVM kernel (fast for custom Akka/Spark extensions)
%r         # Runs R interpreter (useful for legacy forecasting / DfE analytical workflows)
%sh        # Executes shell scripts natively on Driver node OS (Debian/Ubuntu)
%fs        # Shortcut for dbutils.fs (e.g., %fs ls /Volumes/catalog/schema/volume/)
%run       # Imports and executes another notebook in-line (shares session variables)
%pip       # Installs isolated Python packages on all cluster nodes (e.g., %pip install polars)
```

---

### 5.2 Inter-Language Data Sharing
```python
# Step 1: Create a DataFrame in Python
df_python = spark.read.table("prod_catalog.silver.orders").filter("amount > 500")

# Step 2: Register as session-scoped temporary view
df_python.createOrReplaceTempView("high_value_orders")
```

```sql
-- Step 3: Query the Python-created view immediately in a SQL cell (%sql)
%sql
SELECT 
    customer_id, 
    COUNT(order_id) AS high_value_order_count,
    SUM(amount) AS total_high_value_spend
FROM high_value_orders
GROUP BY customer_id
ORDER BY total_high_value_spend DESC;
```

```scala
// Step 4: Access identical view seamlessly in Scala (%scala)
%scala
val scalaDf = spark.table("high_value_orders")
val totalRecords = scalaDf.count()
println(s"Scala received: $totalRecords high value records")
```

---

### 5.3 Databricks Asset Bundles (DABs) `databricks.yml` Specification
```yaml
# ==============================================================================
# Production Databricks Asset Bundle (DAB) Configuration
# Deployable via: databricks bundle deploy --target prod
# ==============================================================================
bundle:
  name: eu_lakehouse_orchestration

targets:
  dev:
    mode: development
    default: true
    workspace:
      host: https://adb-dev-instance.azuredatabricks.net

  prod:
    mode: production
    workspace:
      host: https://adb-prod-instance.azuredatabricks.net
      root_path: /Shared/.bundle/${bundle.name}/${bundle.target}

resources:
  jobs:
    medallion_etl_pipeline:
      name: "Medallion_Daily_Cleansing_${bundle.target}"
      schedule:
        quartz_cron_expression: "0 0 2 * * ?" # Run daily at 02:00 UTC
        timezone_id: "UTC"
      
      job_clusters:
        - job_cluster_key: "serverless_etl_cluster"
          new_cluster:
            spark_version: "15.4.x-scala2.12"
            node_type_id: "Standard_E8ds_v5"
            autoscale:
              min_workers: 2
              max_workers: 16
            spark_conf:
              "spark.sql.adaptive.enabled": "true"
              "spark.databricks.delta.optimizeWrite.enabled": "true"
              "spark.databricks.delta.autoCompact.enabled": "true"

      tasks:
        - task_key: "ingest_bronze"
          job_cluster_key: "serverless_etl_cluster"
          notebook_task:
            notebook_path: "src/notebooks/01_bronze_ingest"
            base_parameters:
              environment: "${bundle.target}"

        - task_key: "transform_silver"
          depends_on:
            - task_key: "ingest_bronze"
          job_cluster_key: "serverless_etl_cluster"
          notebook_task:
            notebook_path: "src/notebooks/02_silver_cleansing"
            base_parameters:
              environment: "${bundle.target}"
```

---

### 5.4 Summary Checklist for Enterprise Databricks Pipelines
1. **Zero Raw DBFS Root Storage**: Always use **Unity Catalog Volumes** (`/Volumes/catalog/schema/volume/`) or Cloud Storage URIs (`abfss://`, `s3://`).
2. **Never Plaintext Secrets**: Fetch all tokens and passwords via `dbutils.secrets.get()`.
3. **Always Set Partitioning / Clustering**: Use Delta `CLUSTER BY` (Liquid Clustering) for tables $> 100\text{ GB}$; avoid small files with `autoCompact` and `optimizeWrite`.
4. **Guard Against Driver OOM**: Never use `.collect()` or `.toPandas()` on large tables; use `.take()`, `.limit()`, or distributed write.
5. **Eliminate Join Skew**: Enable AQE Skew Join (`spark.sql.adaptive.skewJoin.enabled = true`) or use two-phase key salting.
6. **Automate via DABs**: Deploy all pipelines as code using **Databricks Asset Bundles** (`databricks.yml`) with version-controlled Git branches.
