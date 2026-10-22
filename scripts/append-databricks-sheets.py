import json
import os
import sys

def append_pyspark_entries():
    file_path = 'src/data/json/data_pyspark.json'
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    existing_ids = {item['id'] for item in data}
    print(f"[PySpark] Existing items: {len(data)}")

    new_items = [
        {
            "id": "py-dbutils-fs-volumes-api",
            "title": "DBUtils File System & Unity Catalog Volumes API",
            "level": "intermediate",
            "category": "DBFS & File Systems",
            "description": "Programmatic file operations using dbutils.fs across DBFS and Unity Catalog Volumes (/Volumes/catalog/schema/volume/). Covers listing, recursive copying, moving, and safe directory creation without legacy mount dependencies.",
            "code": "# 1. List directory files with metadata in Unity Catalog Volume\nfiles = dbutils.fs.ls(\"/Volumes/prod_catalog/raw_data/landing_zone/\")\nfor f in files:\n    print(f\"File: {f.name} | Size: {f.size / (1024*1024):.2f} MB | Path: {f.path}\")\n\n# 2. Copy files recursively between landing and staging\ndbutils.fs.cp(\n    \"/Volumes/prod_catalog/raw_data/landing_zone/2026/\",\n    \"/Volumes/prod_catalog/raw_data/staging/\",\n    recurse=True\n)\n\n# 3. Atomically move/rename processed file\ndbutils.fs.mv(\n    \"/Volumes/prod_catalog/raw_data/staging/inbound.csv\",\n    \"/Volumes/prod_catalog/raw_data/archive/inbound_20261022.csv\"\n)\n\n# 4. Create directory structure\ndbutils.fs.mkdirs(\"/Volumes/prod_catalog/raw_data/checkpoints/orders_stream/\")\n\n# 5. Read preview bytes directly into Python\ncontent_preview = dbutils.fs.head(\"/Volumes/prod_catalog/raw_data/landing_zone/sample.json\", maxBytes=1024)\nprint(content_preview)",
            "notes": [
                "Unity Catalog Volumes are the modern replacement for legacy DBFS mounts (/mnt/).",
                "Volumes support standard POSIX file APIs via /Volumes/ paths in Python, Bash, and C libraries.",
                "dbutils.fs.rm(path, recurse=True) permanently deletes directories; use with extreme caution in production.",
                "Use dbutils.fs.head() for fast schema and header inspection without spinning up large Spark reader jobs."
            ],
            "use_case": "Standardizing ingestion pipelines to interact with Unity Catalog Volumes rather than deprecated DBFS mount points, ensuring strict audit compliance and fine-grained access control."
        },
        {
            "id": "py-dbutils-widgets-orchestration",
            "title": "Parameterized Notebooks with Widgets & JSON Exit",
            "level": "intermediate",
            "category": "Orchestration & Workflow",
            "description": "Parameterizing Databricks notebooks using dbutils.widgets and returning structured JSON payloads to parent orchestrators using dbutils.notebook.exit. Essential for building modular Databricks workflow DAGs.",
            "code": "# ------------------------------------------------------------------------------\n# IN CHILD NOTEBOOK: Parameter definition & payload return\n# ------------------------------------------------------------------------------\n# 1. Define interactive widgets with defaults\ndbutils.widgets.text(\"batch_date\", \"2026-10-22\", \"1. Ingestion Date (YYYY-MM-DD)\")\ndbutils.widgets.dropdown(\"environment\", \"prod\", [\"dev\", \"staging\", \"prod\"], \"2. Environment\")\n\n# 2. Retrieve parameter values safely\nbatch_date = dbutils.widgets.get(\"batch_date\")\nenv = dbutils.widgets.get(\"environment\")\n\n# 3. Execute business logic\nrecords_processed = 250000\n\n# 4. Exit notebook and pass structured metadata to caller\nimport json\nresult_payload = {\n    \"status\": \"SUCCESS\",\n    \"batch_date\": batch_date,\n    \"records_processed\": records_processed,\n    \"execution_duration_sec\": 42.5\n}\ndbutils.notebook.exit(json.dumps(result_payload))\n\n# ------------------------------------------------------------------------------\n# IN PARENT NOTEBOOK: Chaining execution & parsing results\n# ------------------------------------------------------------------------------\n# raw_res = dbutils.notebook.run(\"./child_pipeline\", timeout_seconds=1800, arguments={\"batch_date\": \"2026-10-22\"})\n# summary = json.loads(raw_res)\n# print(f\"Processed {summary['records_processed']} records in {summary['execution_duration_sec']}s\")",
            "notes": [
                "dbutils.notebook.exit() only accepts string payloads; always serialize Python dictionaries via json.dumps().",
                "dbutils.notebook.run() spawns an ephemeral execution context that shares cluster compute but has isolated local namespace.",
                "Widgets can be bound directly to Databricks Workflow job parameters in the UI or via databricks.yml asset bundles.",
                "dbutils.widgets.removeAll() cleans up widget definitions when authoring interactive templates."
            ],
            "use_case": "Orchestrating multi-hop Medallion architecture pipelines where bronze, silver, and gold stages run as modular notebooks passing status payloads and record counts."
        },
        {
            "id": "py-dbutils-secrets-keyvault",
            "title": "Zero-Plaintext Credential Management via dbutils.secrets",
            "level": "intermediate",
            "category": "Security & Governance",
            "description": "Securely retrieving API keys, database connection strings, and certificates from Azure Key Vault or AWS Secrets Manager scopes without exposing plaintext credentials in notebooks, logs, or version control.",
            "code": "# 1. Inspect available scopes for the cluster identity\nscopes = dbutils.secrets.listScopes()\nprint(\"Available Scopes:\", [s.name for s in scopes])\n\n# 2. Fetch secret securely (Databricks automatically masks value as [REDACTED] in all stdout)\ndb_password = dbutils.secrets.get(scope=\"azure-keyvault-prod\", key=\"finance-sql-password\")\nclient_secret = dbutils.secrets.get(scope=\"azure-keyvault-prod\", key=\"aad-sp-secret\")\n\n# 3. Inject secret into JDBC or Cloud Connector options\njdbc_url = \"jdbc:sqlserver://eu-finance-db.database.windows.net:1433;databaseName=LedgerDW\"\n\nfact_ledger_df = (\n    spark.read.format(\"jdbc\")\n    .option(\"url\", jdbc_url)\n    .option(\"dbtable\", \"dbo.FactGeneralLedger\")\n    .option(\"user\", \"svc_databricks_reader\")\n    .option(\"password\", db_password)  # Zero plaintext exposure in code or logs\n    .option(\"driver\", \"com.microsoft.sqlserver.jdbc.SQLServerDriver\")\n    .option(\"fetchsize\", \"10000\")\n    .load()\n)",
            "notes": [
                "Databricks runtime actively redacts secrets fetched via dbutils.secrets.get() from output cells and driver logs.",
                "Never print secrets or write them to temporary files on disk to prevent accidental leaks.",
                "Link Azure Key Vault to Databricks Secret Scopes via the #secrets/createScope URL in the Databricks workspace.",
                "Combine with Unity Catalog Service Principals for end-to-end passwordless OAuth connectivity where possible."
            ],
            "use_case": "Ingesting confidential enterprise financial balances from on-premises or cloud SQL Server databases into bronze Delta lakehouse tables without storing database passwords in Git."
        },
        {
            "id": "py-autoloader-rescued-data",
            "title": "Production Auto Loader Streaming with Rescued Data",
            "level": "advanced",
            "category": "Streaming & Ingestion",
            "description": "Ingesting high-volume file streams using Databricks Auto Loader (cloudFiles) with dynamic schema evolution and a dedicated _rescued_data column to prevent pipeline breakage from corrupted or schema-deviant records.",
            "code": "from pyspark.sql import functions as F\n\n# 1. Configure Auto Loader stream with schema evolution & rescue mechanism\nraw_stream = (\n    spark.readStream\n    .format(\"cloudFiles\")\n    .option(\"cloudFiles.format\", \"json\")\n    .option(\"cloudFiles.schemaLocation\", \"/Volumes/prod_catalog/checkpoints/orders_schema/\")\n    .option(\"cloudFiles.inferColumnTypes\", \"true\")\n    .option(\"cloudFiles.schemaEvolutionMode\", \"addNewColumns\")\n    .option(\"cloudFiles.rescuedDataColumn\", \"_rescued_data\")\n    .option(\"cloudFiles.maxFilesPerTrigger\", 500)  # Rate limiting backpressure\n    .load(\"/Volumes/prod_catalog/landing/raw_orders/\")\n)\n\n# 2. Add audit timestamp and monitor corrupted records\naudited_stream = (\n    raw_stream\n    .withColumn(\"ingestion_ts\", F.current_timestamp())\n    .withColumn(\"is_corrupted\", F.col(\"_rescued_data\").isNotNull())\n)\n\n# 3. Write micro-batch to Bronze Delta Lake table with checkpointing\nquery = (\n    audited_stream\n    .writeStream\n    .format(\"delta\")\n    .outputMode(\"append\")\n    .option(\"checkpointLocation\", \"/Volumes/prod_catalog/checkpoints/orders_delta_write/\")\n    .trigger(availableNow=True)  # Incremental batch trigger\n    .toTable(\"prod_catalog.bronze.orders_raw\")\n)",
            "notes": [
                "Auto Loader automatically discovers new files as they arrive in cloud object storage via incremental directory listing or SNS/SQS event notifications.",
                "The _rescued_data column captures values with type mismatches or unparsed tokens, preventing pipeline termination.",
                "trigger(availableNow=True) processes all available data in multiple micro-batches then stops the cluster, saving compute costs vs continuous streaming.",
                "Always store checkpoints on durable, separate cloud storage to guarantee exactly-once processing across pipeline restarts."
            ],
            "use_case": "Building production landing-zone pipelines that ingest millions of semi-structured supplier JSON files daily into Bronze Delta tables without failing on unanticipated schema changes."
        },
        {
            "id": "py-delta-table-merge-scd2",
            "title": "Programmatic DeltaTable MERGE (SCD Type 2 & Deletions)",
            "level": "advanced",
            "category": "Delta Lake Features",
            "description": "Executing programmatic Delta Lake merge operations using DeltaTable.forName() in PySpark. Demonstrates multi-branch conditional updates, soft deletions, and inserts with predicate pruning for high performance.",
            "code": "from delta.tables import DeltaTable\nfrom pyspark.sql import functions as F\n\n# 1. Reference target Delta Lake table\ndelta_target = DeltaTable.forName(spark, \"prod_catalog.silver.customer_dim\")\n\n# 2. Incoming batch with updates, inserts, and soft-delete flags\nupdates_df = spark.read.table(\"prod_catalog.staging.customer_updates\")\n\n# 3. Execute atomic MERGE INTO\n(\n    delta_target.alias(\"target\")\n    .merge(\n        updates_df.alias(\"source\"),\n        # Primary key match condition\n        \"target.customer_id = source.customer_id\"\n    )\n    # Branch 1: Soft-delete when flagged by upstream system\n    .whenMatchedUpdate(\n        condition=\"source.is_deleted = true\",\n        set={\n            \"is_active\": F.lit(False),\n            \"updated_at\": F.current_timestamp()\n        }\n    )\n    # Branch 2: Update existing active records when source has newer timestamp\n    .whenMatchedUpdate(\n        condition=\"source.update_timestamp > target.updated_at\",\n        set={\n            \"email\": \"source.email\",\n            \"phone\": \"source.phone\",\n            \"tier\": \"source.tier\",\n            \"updated_at\": \"source.update_timestamp\"\n        }\n    )\n    # Branch 3: Insert new customer records\n    .whenNotMatchedInsert(\n        values={\n            \"customer_id\": \"source.customer_id\",\n            \"email\": \"source.email\",\n            \"phone\": \"source.phone\",\n            \"tier\": \"source.tier\",\n            \"is_active\": F.lit(True),\n            \"created_at\": F.current_timestamp(),\n            \"updated_at\": \"source.update_timestamp\"\n        }\n    )\n    .execute()\n)",
            "notes": [
                "DeltaTable.merge() executes atomically under Optimistic Concurrency Control.",
                "Including partition columns in the merge condition enables partition pruning, skipping 90%+ of Parquet file scans.",
                "Delta Lake 2.0+ supports multiple whenMatched and whenNotMatched clauses for complex conditional routing.",
                "Avoid full table scans by ensuring target table has statistics computed and Liquid Clustering enabled on join keys."
            ],
            "use_case": "Synchronizing customer master records from Salesforce and CRM systems into Silver dimension tables with audit tracking, soft-deletes, and timestamp fencing."
        },
        {
            "id": "py-higher-order-array-transforms",
            "title": "Higher-Order Functions on Complex Nested Arrays",
            "level": "intermediate",
            "category": "Complex Data Types",
            "description": "Transforming, filtering, and aggregating complex nested arrays in-place using PySpark higher-order functions (transform, filter, aggregate). Eliminates expensive explode and re-group shuffles.",
            "code": "from pyspark.sql import functions as F\n\n# Sample orders with nested array of line item structs\norders_df = spark.table(\"prod_catalog.silver.orders\")\n\n# 1. Transform: Apply 15% discount to all line item prices in-place\ndiscounted_df = orders_df.withColumn(\n    \"discounted_items\",\n    F.transform(\n        \"line_items\",\n        lambda item: F.struct(\n            item.item_id.alias(\"item_id\"),\n            item.quantity.alias(\"quantity\"),\n            F.round(item.unit_price * 0.85, 2).alias(\"unit_price\")\n        )\n    )\n)\n\n# 2. Filter: Keep only line items where item quantity > 3\nbulk_orders_df = discounted_df.withColumn(\n    \"bulk_items\",\n    F.filter(\"line_items\", lambda item: item.quantity > 3)\n)\n\n# 3. Aggregate: Calculate total order weight by summing array items\nweighted_orders_df = bulk_orders_df.withColumn(\n    \"total_order_weight_kg\",\n    F.aggregate(\n        \"line_items\",\n        F.lit(0.0), # Initial accumulator value\n        lambda acc, item: acc + (item.quantity * item.unit_weight_kg)\n    )\n)\n\n# 4. Check if any line item contains specific hazardous SKU\nhazardous_df = weighted_orders_df.withColumn(\n    \"has_hazardous_materials\",\n    F.exists(\"line_items\", lambda item: item.is_hazardous == True)\n)",
            "notes": [
                "Higher-order functions execute within Catalyst expression trees without unpacking arrays into separate rows.",
                "Replacing explode() + groupBy() with transform() and aggregate() avoids multi-gigabyte shuffle spills.",
                "Works seamlessly with deeply nested JSON structures, telemetry packets, and eCommerce shopping carts.",
                "F.exists() short-circuits evaluation as soon as the first matching element is encountered in the array."
            ],
            "use_case": "Processing complex eCommerce shopping carts containing hundreds of nested line items, computing shipping weights and category discounts with zero shuffle serialization."
        },
        {
            "id": "py-two-phase-key-salting",
            "title": "Two-Phase Key Salting for Severe Join Skew Remediation",
            "level": "expert",
            "category": "Performance Tuning & Optimization",
            "description": "Resolving catastrophic join skew where a single key (e.g., country_code = 'US' or store_id = 'ONLINE') contains 80%+ of total records, stalling worker nodes on straggler tasks. Uses randomized two-phase salting.",
            "code": "from pyspark.sql import functions as F\n\nSALT_FACTOR = 16  # Distribute skewed key across 16 parallel tasks\n\nfact_transactions = spark.table(\"prod_catalog.silver.transactions\")\ndim_stores = spark.table(\"prod_catalog.silver.dim_stores\")\n\n# Step 1: Add randomized salt [0..15] to large fact table\nsalted_fact = fact_transactions.withColumn(\n    \"salt_id\",\n    F.floor(F.rand() * SALT_FACTOR)\n).withColumn(\n    \"salted_join_key\",\n    F.concat(F.col(\"store_id\"), F.lit(\"_\"), F.col(\"salt_id\"))\n)\n\n# Step 2: Replicate dimension table records across all 16 salt IDs [0..15]\nsalt_table = spark.range(0, SALT_FACTOR).withColumnRenamed(\"id\", \"salt_id\")\nreplicated_dim = dim_stores.crossJoin(salt_table).withColumn(\n    \"salted_join_key\",\n    F.concat(F.col(\"store_id\"), F.lit(\"_\"), F.col(\"salt_id\"))\n)\n\n# Step 3: Perform balanced inner join on the salted key\nbalanced_joined_df = (\n    salted_fact.join(replicated_dim, on=\"salted_join_key\", how=\"inner\")\n    .drop(\"salted_join_key\", \"salt_id\")\n)\n\n# Step 4: Validate execution plan: tasks finish uniformly without stragglers\nbalanced_joined_df.write.format(\"delta\").mode(\"overwrite\").saveAsTable(\"prod_catalog.gold.balanced_sales\")",
            "notes": [
                "Salting breaks monolithic partitions into multiple smaller, evenly distributed shuffle buckets.",
                "Only apply salting to the specific skewed key; salting already uniform keys introduces unnecessary cross-join overhead.",
                "Ensure Adaptive Query Execution (AQE) skew join is enabled (spark.sql.adaptive.skewJoin.enabled = true) as first line of defense.",
                "Replicating small dimension tables by 16x is trivial in memory compared to the cost of a 4-hour stuck shuffle stage."
            ],
            "use_case": "Joining a 2-billion-row retail transactions dataset with store metadata where the e-commerce flagship store represents 85% of volume, preventing executor OOM and task stragglers."
        },
        {
            "id": "py-structured-streaming-watermark",
            "title": "Stateful Streaming Deduplication with Watermarking",
            "level": "expert",
            "category": "Structured Streaming",
            "description": "Managing streaming state stores with event-time watermarking to execute stateful streaming deduplication without unbounded memory bloat. Configured with RocksDB state store for mission-critical reliability.",
            "code": "from pyspark.sql import functions as F\n\n# 1. Enable RocksDB state store to avoid Java heap memory limits on high-state streams\nspark.conf.set(\n    \"spark.sql.streaming.stateStore.providerClass\",\n    \"org.apache.spark.sql.execution.streaming.state.RocksDBStateStoreProvider\"\n)\n\n# 2. Read real-time telemetry stream from Azure Event Hubs / Kafka\ntelemetry_stream = (\n    spark.readStream\n    .format(\"delta\")\n    .table(\"prod_catalog.bronze.iot_telemetry_raw\")\n)\n\n# 3. Define 2-hour watermark and deduplicate on device_id + event_time\ndeduplicated_stream = (\n    telemetry_stream\n    .withWatermark(\"event_timestamp\", \"2 hours\")\n    .dropDuplicates([\"device_id\", \"event_timestamp\"])\n)\n\n# 4. Windowed stateful aggregation: 10-minute tumbling windows\nwindowed_metrics = (\n    deduplicated_stream\n    .groupBy(\n        F.window(\"event_timestamp\", \"10 minutes\"),\n        \"device_type\"\n    )\n    .agg(\n        F.avg(\"temperature\").alias(\"avg_temp\"),\n        F.max(\"vibration\").alias(\"max_vibration\"),\n        F.count(\"event_id\").alias(\"reading_count\")\n    )\n)\n\n# 5. Output to Silver Delta table with checkpointing\nquery = (\n    windowed_metrics\n    .writeStream\n    .format(\"delta\")\n    .outputMode(\"append\")\n    .option(\"checkpointLocation\", \"/Volumes/prod_catalog/checkpoints/iot_silver_state/\")\n    .trigger(processingTime=\"1 minute\")\n    .toTable(\"prod_catalog.silver.iot_aggregated_metrics\")\n)",
            "notes": [
                "Watermarking tells the state store when late data can be safely dropped and state purged from disk/memory.",
                "Default HDFS-backed state store keeps state in JVM heap; RocksDB offloads state to local SSD, supporting tens of millions of active keys.",
                "dropDuplicates with a watermark requires the watermark column to be present in the deduplication key set.",
                "Append output mode only emits rows once the window falls behind the active watermark threshold."
            ],
            "use_case": "Processing continuous streams of 50,000 IoT sensor events per second, filtering out redundant retry packets and computing 10-minute metrics with zero JVM heap exhaustion."
        }
    ]

    for item in new_items:
        assert item['id'] not in existing_ids, f"Duplicate ID: {item['id']}"
        assert item['title'], "Title is required"
        assert len(item['notes']) >= 3, f"At least 3 notes required for {item['id']}"

    data.extend(new_items)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[PySpark] Successfully updated! New count: {len(data)} (+{len(new_items)})")


def append_sparksql_entries():
    file_path = 'src/data/json/data_sparksql.json'
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    existing_ids = {item['id'] for item in data}
    print(f"[SparkSQL] Existing items: {len(data)}")

    new_items = [
        {
            "id": "sql-liquid-clustering-ddl",
            "title": "Liquid Clustering DDL & Dynamic Key Restructuring",
            "level": "advanced",
            "category": "Delta Lake DDL & Maintenance",
            "description": "Configuring Delta Lake Liquid Clustering (CLUSTER BY) in Databricks SQL. Replaces static Hive-style directory partitioning and manual Z-ORDERING, allowing dynamic key changes without table rewrites.",
            "code": "-- 1. Create table with Liquid Clustering on high-cardinality keys\nCREATE OR REPLACE TABLE prod_catalog.silver.sales_transactions (\n    txn_id STRING NOT NULL,\n    customer_id STRING NOT NULL,\n    store_id STRING NOT NULL,\n    txn_amount DECIMAL(18, 4) NOT NULL,\n    txn_timestamp TIMESTAMP NOT NULL,\n    txn_date DATE GENERATED ALWAYS AS (CAST(txn_timestamp AS DATE))\n)\nUSING DELTA\nCLUSTER BY (customer_id, txn_date) -- Liquid clustering dynamically arranges data across multiple keys\nTBLPROPERTIES (\n    'delta.autoOptimize.optimizeWrites' = 'true',\n    'delta.autoOptimize.autoCompact' = 'true'\n);\n\n-- 2. Restructure clustering columns dynamically (zero data rewrite needed)\nALTER TABLE prod_catalog.silver.sales_transactions\nCLUSTER BY (store_id, txn_date);\n\n-- 3. Trigger manual clustering compaction\nOPTIMIZE prod_catalog.silver.sales_transactions;\n\n-- 4. Inspect clustering metadata\nDESCRIBE DETAIL prod_catalog.silver.sales_transactions;",
            "notes": [
                "Liquid Clustering replaces Hive partitioning (/year=2026/month=10/) and eliminates the small file problem.",
                "Unlike static partitioning, you can change clustering columns via ALTER TABLE without rewriting historical data.",
                "Optimized for Databricks Runtime 13.3+ LTS and Photon Engine with Predictive I/O.",
                "Supports up to 4 clustering keys; choose columns frequently used in WHERE filters and join predicates."
            ],
            "use_case": "Designing modern lakehouse fact tables with billions of rows where query access patterns vary between customer analytics and store-level reporting."
        },
        {
            "id": "sql-qualify-ranking-topn",
            "title": "QUALIFY Clause for Elegant Top-N Partition Pruning",
            "level": "intermediate",
            "category": "Query Structuring",
            "description": "Utilizing the ANSI QUALIFY clause in Spark SQL to filter window function results directly without creating messy nested subqueries or temporary views. Greatly improves query readability and optimization.",
            "code": "-- =============================================================================\n-- Identify the Top 3 Highest Value Transactions per Customer in 2026\n-- =============================================================================\n\nUSE CATALOG prod_catalog;\nUSE SCHEMA silver;\n\n-- ❌ OLD PATTERN: Required verbose CTE or subquery wrapping\n-- WITH ranked AS (\n--   SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY txn_amount DESC) as rnk\n--   FROM sales_transactions\n-- )\n-- SELECT * FROM ranked WHERE rnk <= 3;\n\n-- ✅ MODERN QUALIFY PATTERN: Single declarative statement\nSELECT \n    customer_id,\n    txn_id,\n    txn_amount,\n    txn_timestamp,\n    ROW_NUMBER() OVER (\n        PARTITION BY customer_id \n        ORDER BY txn_amount DESC\n    ) AS transaction_rank,\n    DENSE_RANK() OVER (\n        PARTITION BY customer_id \n        ORDER BY txn_amount DESC\n    ) AS transaction_dense_rank\nFROM sales_transactions\nWHERE txn_date >= '2026-01-01'\nQUALIFY transaction_rank <= 3\nORDER BY customer_id, transaction_rank;",
            "notes": [
                "QUALIFY is evaluated after WHERE and window functions, but before ORDER BY and LIMIT.",
                "Eliminates subqueries and Common Table Expressions (CTEs) previously required to filter on window outputs.",
                "Catalyst optimizer can push window limits into physical Top-K execution operators when paired with QUALIFY.",
                "Supported across Databricks SQL, Snowflake, and Google BigQuery."
            ],
            "use_case": "Extracting the top 3 highest-value purchases or latest status updates per customer in executive sales summaries without maintaining nested subquery boilerplate."
        },
        {
            "id": "sql-pivot-unpivot-matrix",
            "title": "Relational Matrix Reshaping via PIVOT and UNPIVOT",
            "level": "intermediate",
            "category": "Spark SQL Transformations",
            "description": "Transforming normalized relational rows into cross-tabulated metric matrices using PIVOT, and normalizing matrix columns back into relational key-value pairs using UNPIVOT.",
            "code": "-- =============================================================================\n-- 1. PIVOT: Transpose quarterly revenue metrics by Region\n-- =============================================================================\nSELECT * FROM (\n    SELECT \n        region,\n        quarter,\n        revenue\n    FROM prod_catalog.gold.regional_financials\n)\nPIVOT (\n    SUM(revenue)\n    FOR quarter IN ('Q1', 'Q2', 'Q3', 'Q4')\n)\nORDER BY region;\n\n-- =============================================================================\n-- 2. UNPIVOT: Normalize wide monthly columns back into relational key-value rows\n-- =============================================================================\nSELECT \n    product_id,\n    month_name,\n    units_sold\nFROM prod_catalog.staging.wide_monthly_forecast\nUNPIVOT (\n    units_sold FOR month_name IN (\n        jan_sales AS 'January',\n        feb_sales AS 'February',\n        mar_sales AS 'March',\n        apr_sales AS 'April'\n    )\n);",
            "notes": [
                "PIVOT requires explicit enumeration of pivot values IN ('Q1', 'Q2', ...) to generate deterministic output schemas.",
                "UNPIVOT replaces complex UNION ALL chains with a single, highly optimized Catalyst physical operator.",
                "Essential for transforming third-party financial spreadsheets into clean 3NF Medallion tables.",
                "Combines seamlessly with GROUP BY to calculate sub-totals alongside pivoted metrics."
            ],
            "use_case": "Converting wide ERP financial forecasts into conformed dimensional tables for Power BI Direct Lake ingestion."
        },
        {
            "id": "sql-merge-into-conditional-delete",
            "title": "Advanced Multi-Branch MERGE INTO with CDC Routing",
            "level": "advanced",
            "category": "Delta Lake DML",
            "description": "Executing atomic Change Data Capture (CDC) upserts into Delta Lake using multi-branch MERGE INTO statements with conditional updates, hard deletes, soft deletes, and schema evolution.",
            "code": "-- =============================================================================\n-- Full CDC Processing: Reconcile Source Binlog into Target Lakehouse\n-- =============================================================================\nMERGE INTO prod_catalog.silver.customer_master AS target\nUSING (\n    -- Pre-deduplicate incoming CDC micro-batch by record timestamp\n    SELECT * FROM (\n        SELECT *,\n               ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY cdc_timestamp DESC) as rank\n        FROM prod_catalog.staging.customer_cdc_stream\n    )\n    WHERE rank = 1\n) AS source\nON target.customer_id = source.customer_id\n\n-- Branch 1: Hard Delete when CDC operation is 'D'\nWHEN MATCHED AND source.op_type = 'D' THEN\n  DELETE\n\n-- Branch 2: Conditional Update when source is newer than target\nWHEN MATCHED AND source.cdc_timestamp > target.updated_at THEN\n  UPDATE SET\n    target.full_name = source.full_name,\n    target.email = source.email,\n    target.risk_rating = source.risk_rating,\n    target.is_active = source.is_active,\n    target.updated_at = source.cdc_timestamp\n\n-- Branch 3: Insert new record when not existing and not deleted\nWHEN NOT MATCHED AND source.op_type != 'D' THEN\n  INSERT (\n    customer_id,\n    full_name,\n    email,\n    risk_rating,\n    is_active,\n    created_at,\n    updated_at\n  )\n  VALUES (\n    source.customer_id,\n    source.full_name,\n    source.email,\n    source.risk_rating,\n    true,\n    source.cdc_timestamp,\n    source.cdc_timestamp\n  );",
            "notes": [
                "Pre-deduplicating the source batch with ROW_NUMBER() prevents 'Cannot merge because multiple source rows matched the same target row' errors.",
                "Delta Lake MERGE executes atomically with ACID guarantees under Optimistic Concurrency Control.",
                "Adding target.date = source.date in the ON clause triggers partition pruning, skipping 95% of Parquet data scans.",
                "Enable schema evolution by setting spark.databricks.delta.schema.autoMerge.enabled = true."
            ],
            "use_case": "Processing Debezium or Oracle GoldenGate CDC streams directly into Silver dimension tables, applying inserts, updates, and deletes in a single atomic commit."
        },
        {
            "id": "sql-delta-history-restore-timetravel",
            "title": "Delta Lake Time Travel, Commit Auditing & RESTORE",
            "level": "intermediate",
            "category": "Delta Lake Features",
            "description": "Querying historical versions of Delta tables using VERSION AS OF and TIMESTAMP AS OF, inspecting transaction log commit metadata, and executing emergency rollbacks with RESTORE.",
            "code": "-- 1. Inspect transaction log history, commits, and user identities\nDESCRIBE HISTORY prod_catalog.silver.sales_transactions;\n\n-- 2. Time Travel Query: Query table state before a corrupt batch commit\nSELECT \n    COUNT(*) AS record_count,\n    SUM(txn_amount) AS total_volume\nFROM prod_catalog.silver.sales_transactions VERSION AS OF 12;\n\n-- 3. Time Travel Query: Query table as of a specific point in time\nSELECT * \nFROM prod_catalog.silver.sales_transactions \nTIMESTAMP AS OF '2026-10-21 18:00:00';\n\n-- 4. Calculate diff between current table state and previous version\nSELECT \n    curr.customer_id,\n    curr.txn_amount - prev.txn_amount AS amount_difference\nFROM prod_catalog.silver.sales_transactions curr\nINNER JOIN prod_catalog.silver.sales_transactions VERSION AS OF 11 prev\n   ON curr.txn_id = prev.txn_id\nWHERE curr.txn_amount != prev.txn_amount;\n\n-- 5. Emergency Rollback: Instantaneously revert table to prior valid version\nRESTORE TABLE prod_catalog.silver.sales_transactions TO VERSION AS OF 12;",
            "notes": [
                "Delta Lake time travel is powered by the sequential JSON files inside the _delta_log directory.",
                "RESTORE TABLE writes a new forward commit to the log that sets table pointers back to the historical snapshot.",
                "Historical versions remain queryable until VACUUM purges Parquet data files older than the retention period (default 7 days).",
                "DESCRIBE HISTORY shows commit metrics: numOutputRows, numTargetRowsUpdated, and isolationLevel."
            ],
            "use_case": "Recovering from an errant pipeline run that corrupted critical financial ledger tables, verifying historical metrics and rolling back in under 2 seconds without restoring from cloud backups."
        },
        {
            "id": "sql-system-billing-dbu-audit",
            "title": "FinOps DBU Consumption & Access Auditing via System Tables",
            "level": "advanced",
            "category": "FinOps & Performance",
            "description": "Querying Databricks Unity Catalog System Tables (system.billing.usage and system.access.audit) to monitor DBU spend, identify idle expensive clusters, and audit sensitive table access.",
            "code": "-- =============================================================================\n-- 1. FinOps: Top 10 Most Expensive Clusters by DBU Cost (Last 30 Days)\n-- =============================================================================\nSELECT \n    usage_metadata.cluster_id,\n    usage_metadata.cluster_name,\n    sku_name,\n    ROUND(SUM(usage_quantity), 2) AS total_dbus_consumed,\n    ROUND(SUM(usage_quantity) * 0.40, 2) AS estimated_usd_cost\nFROM system.billing.usage\nWHERE usage_date >= current_date() - INTERVAL 30 DAYS\n  AND usage_metadata.cluster_id IS NOT NULL\nGROUP BY usage_metadata.cluster_id, usage_metadata.cluster_name, sku_name\nORDER BY total_dbus_consumed DESC\nLIMIT 10;\n\n-- =============================================================================\n-- 2. Compliance Audit: Identify All Queries Reading PII Tables\n-- =============================================================================\nSELECT \n    event_time,\n    user_identity.email,\n    service_name,\n    action_name,\n    request_params.table_full_name,\n    response.status_code\nFROM system.access.audit\nWHERE request_params.table_full_name LIKE '%customer_dim%'\n  AND event_time >= current_date() - INTERVAL 7 DAYS\nORDER BY event_time DESC\nLIMIT 50;",
            "notes": [
                "System tables are serverless, catalog-level analytical views populated automatically by Databricks control plane.",
                "system.billing.usage provides hourly DBU consumption across all compute types (all-purpose, automated, serverless DBSQL).",
                "system.access.audit tracks every query execution, login event, and permission grant across the workspace.",
                "Can be directly connected to Power BI Direct Lake models to build enterprise FinOps cost control dashboards."
            ],
            "use_case": "Setting up automated FinOps alerts to detect rogue un-optimized all-purpose clusters running overnight and auditing compliance for GDPR/HIPAA regulated tables."
        }
    ]

    for item in new_items:
        assert item['id'] not in existing_ids, f"Duplicate ID: {item['id']}"
        assert item['title'], "Title is required"
        assert len(item['notes']) >= 3, f"At least 3 notes required for {item['id']}"

    data.extend(new_items)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[SparkSQL] Successfully updated! New count: {len(data)} (+{len(new_items)})")


def append_cheatsheet_entries():
    file_path = 'src/data/json/data_cheatsheet.json'
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    existing_ids = {item['id'] for item in data}
    print(f"[CheatSheet] Existing items: {len(data)}")

    new_items = [
        {
            "id": "triage-driver-oom-collect",
            "title": "Triage: Driver Out Of Memory (OOM) via .collect()",
            "category": "Spark Core",
            "categorySlug": "spark-core",
            "impact": "Critical",
            "effort": "Low Effort",
            "problem": "Pipeline crashes with 'java.lang.OutOfMemoryError: Java heap space' on the Spark Driver node during wide queries or report exports.",
            "solution": "Eliminate driver-side materialization (.collect(), .toPandas()). Use distributed writes directly to Delta Lake, limit result sets with .take(N), or switch to PySpark Pandas API (pandas_on_spark) which executes distributed across workers.",
            "codeSnippet": "# ❌ ANTI-PATTERN: Pulling 20M rows to driver JVM\n# df.collect() \n# df.toPandas()\n\n# ✅ REMEDIATION 1: Write directly to distributed Delta table\ndf.write.format(\"delta\").mode(\"overwrite\").saveAsTable(\"prod.gold.summary\")\n\n# ✅ REMEDIATION 2: Safe bounded preview\nsample_rows = df.limit(500).toPandas()\n\n# ✅ REMEDIATION 3: Distributed Pandas API\nimport pyspark.pandas as ps\nps_df = ps.read_table(\"prod.silver.orders\")\nresult = ps_df.groupby(\"country\").revenue.sum() # Executes on workers, not driver",
            "language": "python",
            "whyItMatters": "The driver node is designed strictly for task orchestration and Catalyst query planning. Collecting distributed partitions forces gigabytes of deserialized JVM objects into driver heap, inevitably crashing the entire cluster.",
            "metrics": "Eliminates 100% of driver crash terminations, saves driver scaling costs",
            "antiPattern": "Calling df.collect() or df.toPandas() on unaggregated multi-million row datasets.",
            "tags": ["Driver OOM", "PySpark", "Memory", "Production Failure", "Triage"]
        },
        {
            "id": "triage-executor-sigkill-137",
            "title": "Triage: Executor Container Killed (Exit Code 137 / YARN)",
            "category": "Spark Core",
            "categorySlug": "spark-core",
            "impact": "Critical",
            "effort": "Medium Effort",
            "problem": "Executors terminate abruptly with 'Container killed by YARN for exceeding memory limits' or 'Exit code 137'. Tasks fail repeatedly until job aborts.",
            "solution": "Increase spark.executor.memoryOverhead to 20-30% of executor memory to accommodate off-heap Python daemon memory, Arrow serialization buffers, and RocksDB state. Reduce executor core count (e.g., from 8 to 4) to decrease concurrent task memory contention.",
            "codeSnippet": "# Cluster Spark Configuration (Set in Cluster UI or job JSON):\n# 1. Allocate 25% off-heap buffer for Python/Arrow/C++ allocations\nspark.executor.memoryOverhead 4096m\nspark.executor.memory 16g\n\n# 2. Limit tasks per executor to avoid memory contention\nspark.executor.cores 4\n\n# 3. Restrict Arrow batch size to prevent burst allocations in Python workers\nspark.conf.set(\"spark.sql.execution.arrow.maxRecordsPerBatch\", \"5000\")",
            "language": "python",
            "whyItMatters": "YARN / Kubernetes NodeManager actively monitors total container memory (JVM heap + off-heap). When Python workers or native C++ allocations exceed memoryOverhead, the kernel fires SIGKILL 137 immediately.",
            "metrics": "Zero container terminations, stable memory overhead ceilings",
            "antiPattern": "Allocating 16+ cores per executor with default 384MB memoryOverhead, causing rapid container eviction under heavy Python transformations.",
            "tags": ["Executor OOM", "Exit Code 137", "Memory Overhead", "YARN", "Triage"]
        },
        {
            "id": "triage-join-data-skew-aqe",
            "title": "Triage: Severe Join Data Skew & Straggler Tasks",
            "category": "Spark Core",
            "categorySlug": "spark-core",
            "impact": "High Impact",
            "effort": "Low Effort",
            "problem": "Stage reaches 199/200 tasks in 15 seconds, but the final task runs for 45 minutes on a single CPU core because one key (e.g. country = 'US' or store_id = NULL) holds 80%+ of total data.",
            "solution": "Enable Adaptive Query Execution (AQE) skew join optimization to split oversized partitions automatically. For extreme skew that exceeds AQE thresholds, apply two-phase random salt keying to distribute the hot key across multiple workers.",
            "codeSnippet": "# 1. Enable AQE automated skew join handling\nspark.conf.set(\"spark.sql.adaptive.enabled\", \"true\")\nspark.conf.set(\"spark.sql.adaptive.skewJoin.enabled\", \"true\")\nspark.conf.set(\"spark.sql.adaptive.skewJoin.skewedPartitionFactor\", \"3\")\nspark.conf.set(\"spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes\", \"67108864\") # 64 MB\n\n# 2. Or apply explicit broadcast hint if joined dimension is < 200MB\n# joined_df = large_fact.hint(\"broadcast\", small_dim).join(small_dim, \"store_id\")",
            "language": "python",
            "whyItMatters": "Data skew is the #1 cause of pipeline latency bottlenecks. A single skewed partition can delay a multi-terabyte job by hours, keeping dozens of idle worker nodes burning cloud compute budget.",
            "metrics": "80-95% reduction in stage runtime, uniform task duration distribution",
            "antiPattern": "Leaving default AQE settings off and ignoring skewed join keys, letting 1 core bottleneck a 64-core cluster.",
            "tags": ["Data Skew", "AQE", "Stragglers", "Shuffle", "Performance"]
        },
        {
            "id": "triage-tungsten-disk-spill",
            "title": "Triage: Tungsten Memory vs Disk Spill Elimination",
            "category": "Spark Core",
            "categorySlug": "spark-core",
            "impact": "High Impact",
            "effort": "Medium Effort",
            "problem": "Spark UI stage details show massive 'Spill (Memory): 120 GB' and 'Spill (Disk): 35 GB'. Tasks spend 70%+ of execution time serializing and writing intermediate sort buffers to disk.",
            "solution": "Increase spark.sql.shuffle.partitions so that individual partition data slices fit cleanly within executor execution memory slots. Ensure a minimum of 4 GB RAM per executor core. Eliminate unpartitioned window functions.",
            "codeSnippet": "# 1. Calculate optimal shuffle partition count:\n# Target partition size = ~128 MB to 200 MB\n# E.g. For a 120 GB dataset: 120,000 MB / 150 MB = 800 partitions\nspark.conf.set(\"spark.sql.shuffle.partitions\", \"800\")\n\n# 2. Enable adaptive coalesce to automatically shrink post-shuffle partitions\nspark.conf.set(\"spark.sql.adaptive.coalescePartitions.enabled\", \"true\")\nspark.conf.set(\"spark.sql.adaptive.advisoryPartitionSizeInBytes\", \"134217728\") # 128 MB\n\n# ❌ BAD: Window.orderBy(\"date\") -> Unpartitioned window shuffles all data to 1 task\n# ✅ GOOD: Window.partitionBy(\"customer_id\").orderBy(\"date\")",
            "language": "python",
            "whyItMatters": "Disk spill incurs massive I/O serialization, compression, and disk write penalties. Eliminating disk spill often speeds up Spark shuffle stages by 3x to 5x.",
            "metrics": "3x-5x faster shuffle stages, 0 GB disk spill",
            "antiPattern": "Using the default 200 shuffle partitions for 500GB+ tables, guaranteeing severe memory exhaustion and multi-gigabyte disk spills.",
            "tags": ["Disk Spill", "Tungsten", "Shuffle Partitions", "Memory", "Spark UI"]
        },
        {
            "id": "triage-small-file-fragmentation",
            "title": "Triage: Delta Lake Small File Metadata Degradation",
            "category": "SQL & Storage",
            "categorySlug": "storage-formats",
            "impact": "High Impact",
            "effort": "Low Effort",
            "problem": "Queries against Delta tables take minutes just in query planning. Directory contains 100,000+ tiny 50KB Parquet files generated by frequent micro-batch streaming appends.",
            "solution": "Enable Delta Lake Auto-Compaction and Optimized Writes. Schedule regular OPTIMIZE jobs to bin-pack files into 128MB chunks. Run VACUUM to remove obsolete file revisions.",
            "codeSnippet": "-- 1. Set Table Properties for Automated Write Hygiene\nALTER TABLE prod_catalog.silver.telemetry_events SET TBLPROPERTIES (\n    'delta.autoOptimize.optimizeWrites' = 'true',\n    'delta.autoOptimize.autoCompact' = 'true',\n    'delta.targetFileSize' = '134217728' -- 128 MB target\n);\n\n-- 2. Execute on-demand bin-packing compaction\nOPTIMIZE prod_catalog.silver.telemetry_events;\n\n-- 3. Clean up unreferenced tombstoned files older than 7 days\nVACUUM prod_catalog.silver.telemetry_events RETAIN 168 HOURS;",
            "notes": [
                "Small files overload cloud object storage listing APIs (S3/ADLS) and create immense metadata trees in the driver.",
                "Target file size of 128MB balances read scan performance with write compaction overhead."
            ],
            "language": "sql",
            "whyItMatters": "The small file problem causes exponential query degradation. Compacting 100,000 files into 500 files improves query scan speeds by up to 20x.",
            "metrics": "20x faster file scan & metadata resolution",
            "antiPattern": "Appending streaming batches every 5 seconds to a Delta table without autoCompact or periodic OPTIMIZE.",
            "tags": ["Small Files", "Delta Lake", "OPTIMIZE", "VACUUM", "Storage"]
        },
        {
            "id": "triage-concurrent-append-occ",
            "title": "Triage: Optimistic Concurrency Control (OCC) Conflicts",
            "category": "SQL & Storage",
            "categorySlug": "storage-formats",
            "impact": "High Impact",
            "effort": "Medium Effort",
            "problem": "Concurrent batch or streaming jobs writing to the same Delta table fail intermittently with 'ConcurrentAppendException' or 'ConcurrentTransactionException'.",
            "solution": "Switch Delta isolation level from WriteSerializable to SnapshotIsolation if transactions do not have blind read-write dependencies. Migrate to Liquid Clustering (CLUSTER BY) or ensure writes target disjoint physical partitions.",
            "codeSnippet": "-- 1. Configure Snapshot Isolation for high-concurrency append tables\nALTER TABLE prod_catalog.silver.orders SET TBLPROPERTIES (\n    'delta.isolationLevel' = 'SnapshotIsolation'\n);\n\n-- 2. Migrate from static partitions to Liquid Clustering to isolate write sets\nALTER TABLE prod_catalog.silver.orders CLUSTER BY (store_id, order_date);\n\n-- 3. In PySpark, add partition predicates to MERGE conditions to restrict file locks\n# delta_table.merge(source, \"target.order_date = source.order_date AND target.id = source.id\")",
            "language": "sql",
            "whyItMatters": "Under WriteSerializable isolation, Delta checks if concurrent commits added files that match the reader query. SnapshotIsolation permits concurrent appends without collision, eliminating false transaction aborts.",
            "metrics": "Zero OCC collision aborts, 100% concurrent write success",
            "antiPattern": "Running concurrent write jobs against the same table under WriteSerializable without partition predicates.",
            "tags": ["OCC", "ConcurrentAppendException", "Delta Lake", "Concurrency", "Triage"]
        },
        {
            "id": "triage-broadcast-join-timeout",
            "title": "Triage: Broadcast Exchange Timeout (300 Seconds)",
            "category": "Spark Core",
            "categorySlug": "spark-core",
            "impact": "High Impact",
            "effort": "Low Effort",
            "problem": "Join stage fails with 'TimeoutException: Futures timed out after [300 seconds]' during BroadcastExchangeExec.",
            "solution": "The driver timed out while collecting and broadcasting a table that was larger than estimated. Increase spark.sql.broadcastTimeout or disable auto-broadcast (autoBroadcastJoinThreshold = -1) to fall back to robust SortMergeJoin.",
            "codeSnippet": "# 1. Increase broadcast timeout for high-latency cloud networks\nspark.conf.set(\"spark.sql.broadcastTimeout\", \"600\") # 10 minutes\n\n# 2. Or disable broadcast join if table statistics are corrupted or table > 200MB\nspark.conf.set(\"spark.sql.autoBroadcastJoinThreshold\", \"-1\") # Disables BHJ, forces SMJ\n\n# 3. Ensure table statistics are up to date\n# spark.sql(\"ANALYZE TABLE prod_catalog.silver.stores COMPUTE STATISTICS FOR ALL COLUMNS\")",
            "language": "python",
            "whyItMatters": "When table statistics are missing, Spark Catalyst may incorrectly estimate a multi-gigabyte table as small enough to broadcast. The driver stalls collecting the dataset, eventually timing out after 300 seconds.",
            "metrics": "Prevents catastrophic job termination, enforces deterministic join planning",
            "antiPattern": "Hardcoding F.broadcast(df) on tables whose row count grows dynamically in production without size guards.",
            "tags": ["Broadcast Timeout", "BHJ", "SortMergeJoin", "Catalyst", "Triage"]
        }
    ]

    for item in new_items:
        assert item['id'] not in existing_ids, f"Duplicate ID: {item['id']}"
        assert item['title'], "Title is required"
        assert item['problem'], "Problem is required"
        assert item['solution'], "Solution is required"

    data.extend(new_items)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[CheatSheet] Successfully updated! New count: {len(data)} (+{len(new_items)})")


if __name__ == '__main__':
    append_pyspark_entries()
    append_sparksql_entries()
    append_cheatsheet_entries()
    print("\nAll datasets successfully updated!")
