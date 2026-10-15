#!/usr/bin/env python3
"""
Incorporate practical code exercises from jrlasak/databricks-code-practice into:
- src/data/json/data_pyspark.json
- src/data/json/data_sparksql.json
"""

import json
import os

APP_DIR = "/Users/santosh/Documents/antigravity/adventurous-raman"
PYSPARK_PATH = os.path.join(APP_DIR, "src/data/json/data_pyspark.json")
SPARKSQL_PATH = os.path.join(APP_DIR, "src/data/json/data_sparksql.json")

NEW_PYSPARK_EXERCISES = [
    {
        "id": "py-adv-delta-optimization-benchmark",
        "title": "Benchmarking 6 Delta Lake Optimization Levers at Scale",
        "level": "advanced",
        "category": "Delta Lake & Storage Optimization",
        "description": "Hands-on empirical benchmarking comparing 6 Delta Lake layout and file management techniques (Baseline small files, Physical Partitioning, Z-Ordering, Manual Compaction, Auto Optimize, and Liquid Clustering) across a 50M-row dataset, measuring scan time, input files, and bytes read via the Spark UI.",
        "code": """from pyspark.sql import SparkSession
import pyspark.sql.functions as F
from pyspark.sql.functions import col

spark = SparkSession.builder.getOrCreate()
CATALOG = "delta_opt"
SCHEMA = "sales"

# 1. Baseline unoptimized table with fragmented small files
# spark.sql(f"CREATE TABLE {CATALOG}.{SCHEMA}.sales_raw ...")

# 2. Physical Partitioning (low-cardinality country column)
df_raw = spark.table(f"{CATALOG}.{SCHEMA}.sales_raw")
df_raw.write.format("delta") \\
    .mode("overwrite") \\
    .partitionBy("country") \\
    .saveAsTable(f"{CATALOG}.{SCHEMA}.sales_partitioned")

# 3. Multi-dimensional Z-Ordering on high-cardinality keys
spark.sql(f\"\"\"
    CREATE TABLE {CATALOG}.{SCHEMA}.sales_zorder AS 
    SELECT * FROM {CATALOG}.{SCHEMA}.sales_raw;
\"\"\")
spark.sql(f"OPTIMIZE {CATALOG}.{SCHEMA}.sales_zorder ZORDER BY (customer_id, product_id)")

# 4. Liquid Clustering (modern recommended standard - Hilbert curve)
spark.sql(f\"\"\"
    CREATE TABLE {CATALOG}.{SCHEMA}.sales_liquid 
    USING DELTA 
    CLUSTER BY (sale_date, customer_id)
    AS SELECT * FROM {CATALOG}.{SCHEMA}.sales_raw;
\"\"\")
# Incrementally clusters new appends without full-table rewrites
spark.sql(f"OPTIMIZE {CATALOG}.{SCHEMA}.sales_liquid")

# 5. Profile metrics in Spark UI & metadata
detail_df = spark.sql(f"DESCRIBE DETAIL {CATALOG}.{SCHEMA}.sales_liquid")
detail_df.select("numFiles", "sizeInBytes", "clusteringColumns").show()""",
        "notes": [
            "Liquid Clustering replaces both partitioning and Z-Order, supporting dynamic clustering key alterations.",
            "Z-Ordering is effective for multi-column queries on legacy tables but suffers from high write amplification on frequent appends.",
            "Physical partitioning on high-cardinality columns (>10,000 values) leads to severe small-file sprawl and metadata overhead.",
            "Use DESCRIBE DETAIL to verify file count reduction and average file size approaching the ~1GB sweet spot."
        ],
        "use_case": "Optimizing a 50M-row retail sales fact table in Databricks to eliminate query scan bottlenecks and compare empirical performance across layout strategies."
    },
    {
        "id": "py-int-autoloader-production-streaming",
        "title": "Auto Loader (cloudFiles) Streaming Ingestion with Rescued Data",
        "level": "intermediate",
        "category": "Streaming & Ingestion",
        "description": "Production Auto Loader pattern for high-throughput, low-latency file ingestion from cloud object storage (ADLS Gen2 / S3). Implements automatic schema inference, directory notification mode, schema evolution, and bad-data isolation via _rescued_data.",
        "code": """from pyspark.sql.functions import col, current_timestamp

# Configure Auto Loader streaming source
raw_stream_df = spark.readStream.format("cloudFiles") \\
    .option("cloudFiles.format", "json") \\
    .option("cloudFiles.schemaLocation", "abfss://checkpoints@datalake.dfs.core.windows.net/orders/schema") \\
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns") \\
    .option("cloudFiles.inferColumnTypes", "true") \\
    .option("cloudFiles.useNotifications", "true") \\
    .load("abfss://landing@datalake.dfs.core.windows.net/inbound_orders/*/*.json")

# Add ingestion audit metadata
enriched_stream = raw_stream_df \\
    .withColumn("ingestion_timestamp", current_timestamp()) \\
    .withColumn("file_source", col("_metadata.file_name"))

# Stream write to Bronze Delta Table with checkpointing
query = enriched_stream.writeStream \\
    .format("delta") \\
    .outputMode("append") \\
    .option("checkpointLocation", "abfss://checkpoints@datalake.dfs.core.windows.net/orders/bronze_chk") \\
    .trigger(availableNow=True) \\
    .toTable("bronze.orders_raw")

query.awaitTermination()""",
        "notes": [
            "cloudFiles.useNotifications uses cloud queue events (Event Grid / SNS) to discover millions of files without expensive directory listings.",
            "addNewColumns schema evolution automatically adapts to new incoming JSON attributes without failing the streaming job.",
            "_rescued_data automatically captures malformed rows or type mismatches for audit without dropping records.",
            "trigger(availableNow=True) gives micro-batch serverless cost efficiency with streaming semantics."
        ],
        "use_case": "Ingesting millions of daily order events arriving as nested JSON blobs into a Bronze Delta table with zero schema drift failures."
    },
    {
        "id": "py-adv-structured-streaming-watermarking",
        "title": "Event-Time Watermarking & Windowed Stateful Aggregations",
        "level": "advanced",
        "category": "Structured Streaming",
        "description": "Implements event-time stateful streaming aggregations with watermarking to handle out-of-order and late data cleanly. Uses tumbling and sliding windows with state eviction to prevent executor out-of-memory errors.",
        "code": """from pyspark.sql.functions import col, window, sum, count

# Read clickstream events from Kafka or Delta Bronze
events_df = spark.readStream.format("delta").table("bronze.clickstream")

# Define 10-minute watermark for late data handling
windowed_metrics = events_df \\
    .withWatermark("event_time", "10 minutes") \\
    .groupBy(
        window(col("event_time"), "1 hour", "15 minutes"), # Sliding 1-hr window every 15 mins
        col("campaign_id"),
        col("country")
    ) \\
    .agg(
        count("click_id").alias("total_clicks"),
        sum("conversion_value").alias("gross_revenue")
    )

# Write to Silver Gold aggregated layer with Update output mode
query = windowed_metrics.writeStream \\
    .format("delta") \\
    .outputMode("update") \\
    .option("checkpointLocation", "/mnt/checkpoints/campaign_hourly_metrics") \\
    .toTable("silver.campaign_hourly_metrics")

query.awaitTermination()""",
        "notes": [
            "withWatermark('event_time', '10 minutes') instructs Spark that events arriving older than 10 mins past current max event time can be dropped.",
            "Watermarking is mandatory for stateful streaming operations to allow the RocksDB/HDFS state store to purge expired state buffers.",
            "Update mode writes only updated aggregate windows per micro-batch, whereas Append mode emits only finalized closed windows.",
            "Sliding windows (duration, slide) allow tracking moving trends with overlapping time boundaries."
        ],
        "use_case": "Tracking real-time ad campaign conversions and revenue in sliding 1-hour windows while bounding state store memory usage."
    },
    {
        "id": "py-adv-foreachbatch-idempotent-upsert",
        "title": "foreachBatch Idempotent Upsert & Deduplication Pattern",
        "level": "advanced",
        "category": "Structured Streaming",
        "description": "Production pattern using foreachBatch to execute multi-table writes and ACID MERGE INTO operations within a streaming pipeline. Solves duplicate delivery issues in streaming CDC pipelines using batch deduplication.",
        "code": """from delta.tables import DeltaTable
from pyspark.sql.functions import col, row_number
from pyspark.sql.window import Window

target_delta = DeltaTable.forName(spark, "silver.customer_accounts")

def process_micro_batch(micro_batch_df, batch_id):
    # 1. Deduplicate within the micro-batch window (take latest updated record)
    window_spec = Window.partitionBy("account_id").orderBy(col("last_modified_ts").desc())
    deduped_batch = micro_batch_df \\
        .withColumn("row_num", row_number().over(window_spec)) \\
        .filter(col("row_num") == 1) \\
        .drop("row_num")
        
    # 2. Idempotent MERGE into Target Silver Delta Table
    target_delta.alias("tgt").merge(
        deduped_batch.alias("src"),
        "tgt.account_id = src.account_id"
    ).whenMatchedUpdate(
        condition="src.last_modified_ts > tgt.last_modified_ts",
        set={
            "balance": "src.balance",
            "status": "src.status",
            "last_modified_ts": "src.last_modified_ts"
        }
    ).whenNotMatchedInsert(
        values={
            "account_id": "src.account_id",
            "balance": "src.balance",
            "status": "src.status",
            "created_ts": "src.last_modified_ts",
            "last_modified_ts": "src.last_modified_ts"
        }
    ).execute()

# Stream processor calling foreachBatch
streaming_query = spark.readStream.table("bronze.cdc_accounts") \\
    .writeStream \\
    .foreachBatch(process_micro_batch) \\
    .option("checkpointLocation", "/mnt/checkpoints/accounts_upsert") \\
    .start()

streaming_query.awaitTermination()""",
        "notes": [
            "foreachBatch allows applying arbitrary batch operations (like DeltaTable.merge) to streaming micro-batch DataFrames.",
            "Batch deduplication with Window.partitionBy ensures multiple CDC updates for the same key in one micro-batch don't cause MERGE conflict errors.",
            "Provides end-to-end exactly-once idempotent semantics even when micro-batches are re-executed upon cluster failure.",
            "Enables updating multiple target tables (e.g. Silver fact + quarantine audit table) in a single streaming job."
        ],
        "use_case": "Consuming real-time banking CDC account updates from Kafka into a Silver dimensional table without duplicate record conflicts."
    },
    {
        "id": "py-adv-dlt-expectations-apparel-streaming",
        "title": "Lakeflow / Delta Live Tables (DLT) Streaming with Expectations",
        "level": "advanced",
        "category": "Lakeflow Declarative Pipelines",
        "description": "End-to-end Lakeflow Declarative Pipeline (formerly DLT) in Python implementing Bronze-to-Silver-to-Gold streaming medallion architecture with rigorous data quality expectations (@dlt.expect, @dlt.expect_or_drop, @dlt.expect_or_fail).",
        "code": """import dlt
from pyspark.sql.functions import col, current_timestamp, to_date

# 1. Bronze Layer: Ingest streaming apparel events
@dlt.table(
    name="bronze_apparel_sales",
    comment="Raw streaming apparel sales transactions"
)
def bronze_apparel_sales():
    return spark.readStream.format("cloudFiles") \\
        .option("cloudFiles.format", "json") \\
        .load("/mnt/landing/apparel_sales/")

# 2. Silver Layer: Cleanse data with strict Quality Expectations
@dlt.table(
    name="silver_apparel_sales",
    comment="Cleansed apparel sales with quality validations"
)
@dlt.expect_or_drop("valid_order_id", "order_id IS NOT NULL")
@dlt.expect_or_drop("positive_amount", "item_price > 0 AND quantity > 0")
@dlt.expect("valid_email", "customer_email RLIKE '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\\\.[A-Za-z]{2,}$'")
def silver_apparel_sales():
    return dlt.read_stream("bronze_apparel_sales") \\
        .select(
            col("order_id"),
            col("customer_id"),
            col("customer_email"),
            col("item_sku"),
            col("quantity").cast("int"),
            col("item_price").cast("decimal(10,2)"),
            (col("quantity") * col("item_price")).alias("total_sale_amount"),
            to_date(col("transaction_ts")).alias("sale_date")
        )

# 3. Gold Layer: Live Materialized View for Daily Apparel Revenue
@dlt.table(
    name="gold_daily_apparel_revenue",
    comment="Daily aggregated sales by product category"
)
def gold_daily_apparel_revenue():
    return dlt.read("silver_apparel_sales") \\
        .groupBy("sale_date", "item_sku") \\
        .agg(
            F.sum("total_sale_amount").alias("daily_revenue"),
            F.sum("quantity").alias("units_sold")
        )""",
        "notes": [
            "@dlt.expect records invalid rows in the DLT event log without dropping records (warn only).",
            "@dlt.expect_or_drop filters out bad rows from the downstream table while logging metric counts.",
            "@dlt.expect_or_fail halts pipeline execution immediately if invalid data is detected (critical regulatory data).",
            "dlt.read_stream creates an incremental streaming pipeline; dlt.read creates a batch materialized view."
        ],
        "use_case": "Building an automated enterprise retail pipeline where invalid sales records are quarantined and live KPIs refresh incrementally."
    },
    {
        "id": "py-adv-genie-star-schema-tuning",
        "title": "Databricks Genie Space Setup & Star Schema Optimization",
        "level": "advanced",
        "category": "GenAI & AI BI",
        "description": "Architecting and calibrating a Databricks Genie AI/BI space on top of a Kimball dimensional star schema (Sales Fact, Customer Dim, Product Dim, Date Dim), defining semantic instructions, benchmark evaluation questions, and trusted SQL definitions.",
        "code": """# Databricks Genie Space Semantic Configuration Pattern
# 1. Ensure Star Schema tables have rich column comments and PRIMARY/FOREIGN keys in Unity Catalog:
spark.sql(\"\"\"
    ALTER TABLE gold.fct_sales 
    ALTER COLUMN customer_id COMMENT 'Unique foreign key referencing dim_customer.customer_id';
\"\"\")

# 2. Informational Primary & Foreign Key constraints help Genie resolve join paths accurately:
spark.sql(\"\"\"
    ALTER TABLE gold.dim_customer ADD CONSTRAINT pk_dim_customer PRIMARY KEY (customer_id);
    ALTER TABLE gold.fct_sales ADD CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id) REFERENCES gold.dim_customer(customer_id);
\"\"\")

# 3. Genie Space Semantic Instructions (YAML / System Prompt specification):
genie_space_config = {
    "space_name": "Executive Sales Analytics Space",
    "tables": ["gold.fct_sales", "gold.dim_customer", "gold.dim_product", "gold.dim_date"],
    "general_instructions": \"\"\"
        - Always join fct_sales with dim_date on date_id to filter by calendar year and quarter.
        - 'Revenue' or 'Sales' refers to SUM(net_amount), excluding tax and shipping fees.
        - 'Active Customers' refers to COUNT(DISTINCT customer_id) with at least 1 order in the period.
        - Format currency outputs to 2 decimal places.
        - Never generate CROSS JOIN; always use explicit foreign key relationships.
    \"\"\",
    "certified_sql_queries": [
        {
            "question": "What is the top-selling product category by revenue this quarter?",
            "verified_sql": \"\"\"
                SELECT p.category_name, SUM(f.net_amount) AS total_revenue
                FROM gold.fct_sales f
                JOIN gold.dim_product p ON f.product_id = p.product_id
                JOIN gold.dim_date d ON f.date_id = d.date_id
                WHERE d.quarter = '2026-Q3'
                GROUP BY p.category_name
                ORDER BY total_revenue DESC LIMIT 5;
            \"\"\"
        }
    ]
}""",
        "notes": [
            "Genie spaces leverage Unity Catalog table comments, column descriptions, and informational PK/FK constraints to infer join paths.",
            "Providing certified SQL query pairs anchors the underlying foundation model to verified business metric logic.",
            "Clear natural language synonyms in instructions prevent hallucinations on domain acronyms like ARR, NRR, or GMV.",
            "Run benchmark suites across 20-50 business questions to measure deterministic Text-to-SQL accuracy."
        ],
        "use_case": "Empowering business executives and non-technical stakeholders to ask self-service natural language questions against curated Lakehouse gold marts."
    }
]

NEW_SPARKSQL_EXERCISES = [
    {
        "id": "adv_061_delta_liquid_clustering_deepdive",
        "title": "Liquid Clustering DDL, Migration & Incremental Maintenance",
        "level": "advanced",
        "category": "Delta Lake DDL & Maintenance",
        "description": "Comprehensive SQL guide to Liquid Clustering in Databricks. Covers table creation with CLUSTER BY, altering clustering keys without data rewrites, checking clustering progress via metadata, and triggering incremental re-clustering.",
        "code": """-- 1. Create table with Liquid Clustering
CREATE OR REPLACE TABLE gold.customer_transactions (
    txn_id STRING NOT NULL,
    customer_id STRING NOT NULL,
    store_id INT,
    txn_amount DECIMAL(18,2),
    txn_date DATE
)
USING DELTA
CLUSTER BY (txn_date, customer_id);

-- 2. Dynamic key modification (Zero data rewriting required!)
-- Modify clustering keys when query patterns evolve:
ALTER TABLE gold.customer_transactions
CLUSTER BY (customer_id, store_id);

-- 3. Check clustering column metadata
DESCRIBE DETAIL gold.customer_transactions;
-- Look at column 'clusteringColumns' in output

-- 4. Trigger incremental clustering optimization
-- Only compacts files that have not yet been clustered or exceed threshold
OPTIMIZE gold.customer_transactions;

-- 5. Converting legacy partitioned table to Liquid Clustering
-- Step A: Create target clustered table
CREATE TABLE gold.transactions_liquid LIKE gold.legacy_partitioned_transactions;
ALTER TABLE gold.transactions_liquid CLUSTER BY (txn_date, customer_id);
-- Step B: Insert data incrementally or via CLONE
INSERT INTO gold.transactions_liquid SELECT * FROM gold.legacy_partitioned_transactions;""",
        "notes": [
            "Liquid Clustering uses Hilbert space-filling curves to order records across up to 4 clustering keys.",
            "Unlike Hive partitioning, there are no rigid subdirectory paths, preventing directory listing lag on cloud storage.",
            "ALTER TABLE CLUSTER BY applies only to newly written or compacted files; no immediate table rewrites needed.",
            "Predictive Optimization in Unity Catalog automates OPTIMIZE runs for Liquid Clustered tables."
        ],
        "use_case": "Replacing rigid legacy Hive partitioning on a 10TB transaction table to eliminate small files and accelerate multi-key analytical filters."
    },
    {
        "id": "adv_062_delta_vacuum_retention_hygiene",
        "title": "VACUUM Lifecycle Management & Retention Safety Guards",
        "level": "advanced",
        "category": "Delta Lake DDL & Maintenance",
        "description": "Production storage hygiene guide for Delta Lake VACUUM. Details transaction log retention vs data file retention, safe default thresholds (168 hours), dry run auditing, and concurrent reader safety.",
        "code": """-- ========================================================
-- Delta Lake Storage Lifecycle & VACUUM Safety Procedures
-- ========================================================

-- 1. Dry run: Audit candidate unreferenced files before deletion
VACUUM gold.orders DRY RUN;

-- 2. Execute safe production vacuum with standard 7-day retention
-- Removes physical files tombstoned > 7 days ago
VACUUM gold.orders RETAIN 168 HOURS;

-- 3. Inspect table transaction history and active snapshots
DESCRIBE HISTORY gold.orders;

-- 4. Retention properties on table level
ALTER TABLE gold.orders SET TBLPROPERTIES (
  'delta.logRetentionDuration' = 'interval 30 days',       -- Keeps JSON commits & checkpoints for 30 days
  'delta.deletedFileRetentionDuration' = 'interval 7 days' -- Default threshold for VACUUM eligibility
);

-- WARNING: Disabling retention duration check is dangerous:
-- SET spark.databricks.delta.vacuum.parallelDelete.enabled = true;
-- SET spark.databricks.delta.retentionDurationCheck.enabled = false;
-- VACUUM gold.orders RETAIN 0 HOURS; -- Destroys time travel and breaks concurrent active readers!""",
        "notes": [
            "VACUUM deletes physical Parquet data files that are no longer referenced in the Delta log state past retention.",
            "Never reduce retention below 168 hours (7 days) in production to avoid corrupting concurrent active queries.",
            "Time travel queries referencing versions older than the VACUUM retention threshold will fail with FileNotFoundException.",
            "Managed tables under Unity Catalog can leverage automated Predictive Optimization for unattended VACUUM execution."
        ],
        "use_case": "Reclaiming petabytes of orphaned storage from daily MERGE and UPDATE operations without corrupting ongoing BI reader queries."
    },
    {
        "id": "adv_063_delta_merge_evolution_conditional",
        "title": "Advanced Delta MERGE INTO with Conditional Updates & Schema Evolution",
        "level": "advanced",
        "category": "Delta Lake DML",
        "description": "Mastering the MERGE INTO statement in Spark SQL. Explores conditional multiple MATCHED clauses, delete tombstones, schema evolution on upsert, and minimizing write amplification with deletion vectors.",
        "code": """-- Enable schema evolution on merge
SET spark.databricks.delta.schema.autoMerge.enabled = true;

-- Advanced MERGE with multiple conditional MATCHED and NOT MATCHED clauses
MERGE INTO silver.customers AS target
USING staging.customer_updates AS source
ON target.customer_id = source.customer_id

-- Clause 1: Hard delete requested by GDPR right-to-be-forgotten
WHEN MATCHED AND source.op_type = 'DELETE' THEN
  DELETE

-- Clause 2: Standard update with audit timestamp checking
WHEN MATCHED AND source.updated_at > target.updated_at THEN
  UPDATE SET
    target.name = source.name,
    target.email = source.email,
    target.address = source.address,
    target.phone = source.phone,
    target.updated_at = source.updated_at,
    target.loyalty_tier = source.loyalty_tier

-- Clause 3: Insert new customer records
WHEN NOT MATCHED AND source.op_type != 'DELETE' THEN
  INSERT (customer_id, name, email, address, phone, created_at, updated_at, loyalty_tier)
  VALUES (source.customer_id, source.name, source.email, source.address, source.phone, source.updated_at, source.updated_at, source.loyalty_tier);""",
        "notes": [
            "Multiple WHEN MATCHED clauses are evaluated in top-to-bottom sequence; the first true predicate is executed.",
            "autoMerge.enabled dynamically adds new columns from source into the target table schema during MERGE execution.",
            "Deletion Vectors (delta.enableDeletionVectors = true) eliminate full Parquet file rewrites for matched DELETE and UPDATE rows.",
            "Adding partition/clustering pruning predicates to the ON clause (e.g. target.txn_date = source.txn_date) drastically reduces scanned files."
        ],
        "use_case": "Processing continuous CDC feeds containing inserts, updates, and GDPR user deletions into a conformed customer dimension table."
    },
    {
        "id": "adv_064_delta_change_data_feed_cdc",
        "title": "Delta Change Data Feed (CDF) Querying & Incremental Pipelines",
        "level": "advanced",
        "category": "Delta Lake DML",
        "description": "Enabling and consuming Delta Lake Change Data Feed (CDF). Demonstrates reading row-level mutations (inserts, updates, deletes) via table_changes() across commit versions and timestamps.",
        "code": """-- 1. Enable Change Data Feed on table creation or alteration
ALTER TABLE silver.products SET TBLPROPERTIES (delta.enableChangeDataFeed = true);

-- 2. Inspect table change history
DESCRIBE HISTORY silver.products;

-- 3. Query all changes between version 10 and 15
SELECT 
    product_id,
    product_name,
    unit_price,
    _change_type,
    _commit_version,
    _commit_timestamp
FROM table_changes('silver.products', 10, 15)
ORDER BY _commit_version, _commit_timestamp;

-- 4. Filter only price updates (comparing pre-image vs post-image)
SELECT 
    product_id,
    unit_price,
    _change_type,
    _commit_timestamp
FROM table_changes('silver.products', 10)
WHERE _change_type IN ('update_preimage', 'update_postimage')
ORDER BY product_id, _commit_timestamp;

-- 5. Using CDF as a streaming source in PySpark:
-- spark.readStream.format('delta') \\
--   .option('readChangeFeed', 'true') \\
--   .option('startingVersion', 10) \\
--   .table('silver.products')""",
        "notes": [
            "_change_type contains: 'insert' (new rows), 'update_preimage' (row before update), 'update_postimage' (row after update), 'delete' (deleted row).",
            "CDF stores change events either within existing data files or as separate lightweight change files in the Delta folder.",
            "Ideal for driving incremental downstream materialized views, audit trails, and syncing search indexes (e.g. Elasticsearch).",
            "CDF queries are bounded by the VACUUM retention period; older change data is purged during vacuum."
        ],
        "use_case": "Capturing product catalog price changes incrementally to trigger downstream pricing alert notifications and update search indexes."
    },
    {
        "id": "adv_065_spark_sql_higher_order_functions",
        "title": "Higher-Order Functions for Complex Nested JSON & Arrays",
        "level": "advanced",
        "category": "Spark SQL Transformations",
        "description": "Transforming complex nested data types (ARRAY, STRUCT, MAP) using Spark SQL higher-order functions (TRANSFORM, FILTER, AGGREGATE, EXISTS) without exploding and re-aggregating rows.",
        "code": """-- Sample nested order data with line items array
WITH raw_orders AS (
    SELECT 
        101 AS order_id,
        'Santosh' AS customer,
        ARRAY(
            NAMED_STRUCT('item', 'Laptop', 'qty', 1, 'price', 1200.0, 'taxable', true),
            NAMED_STRUCT('item', 'Mouse', 'qty', 2, 'price', 25.0, 'taxable', true),
            NAMED_STRUCT('item', 'GiftCard', 'qty', 1, 'price', 50.0, 'taxable', false)
        ) AS items
)
SELECT
    order_id,
    customer,
    
    -- 1. TRANSFORM: Apply function to each element in array (10% discount on items)
    TRANSFORM(items, x -> NAMED_STRUCT('item', x.item, 'discounted_price', ROUND(x.price * 0.9, 2))) AS discounted_items,
    
    -- 2. FILTER: Extract only taxable line items
    FILTER(items, x -> x.taxable = true) AS taxable_items,
    
    -- 3. EXISTS: Check if order contains a high-value item (> $500)
    EXISTS(items, x -> x.price > 500.0) AS has_expensive_item,
    
    -- 4. AGGREGATE: Calculate order gross total directly without explode()
    AGGREGATE(items, 0.0, (total, x) -> total + (x.qty * x.price)) AS order_total_amount
FROM raw_orders;""",
        "notes": [
            "Higher-order functions evaluate lambda expressions directly over array elements in memory.",
            "Avoids using EXPLODE() which duplicates parent row columns and triggers expensive shuffle and memory allocation.",
            "AGGREGATE(array, zero, merge, finish) performs accumulator folds across array structures efficiently.",
            "TRANSFORM and FILTER are fully optimized by the Catalyst Optimizer and Photon engine."
        ],
        "use_case": "Processing nested e-commerce order payloads in Spark SQL without explosive row multiplication and memory pressure."
    }
]

def append_exercises():
    # 1. Update PySpark
    with open(PYSPARK_PATH, "r", encoding="utf-8") as f:
        pyspark_data = json.load(f)
    existing_py_ids = {x["id"] for x in pyspark_data}
    added_py = 0
    for item in NEW_PYSPARK_EXERCISES:
        if item["id"] not in existing_py_ids:
            pyspark_data.append(item)
            existing_py_ids.add(item["id"])
            added_py += 1
            
    with open(PYSPARK_PATH, "w", encoding="utf-8") as f:
        json.dump(pyspark_data, f, indent=2)
    print(f"Added {added_py} exercises to {PYSPARK_PATH}. Total now: {len(pyspark_data)}")
    
    # 2. Update Spark SQL
    with open(SPARKSQL_PATH, "r", encoding="utf-8") as f:
        sparksql_data = json.load(f)
    existing_sql_ids = {x["id"] for x in sparksql_data}
    added_sql = 0
    for item in NEW_SPARKSQL_EXERCISES:
        if item["id"] not in existing_sql_ids:
            sparksql_data.append(item)
            existing_sql_ids.add(item["id"])
            added_sql += 1
            
    with open(SPARKSQL_PATH, "w", encoding="utf-8") as f:
        json.dump(sparksql_data, f, indent=2)
    print(f"Added {added_sql} exercises to {SPARKSQL_PATH}. Total now: {len(sparksql_data)}")

if __name__ == "__main__":
    append_exercises()
