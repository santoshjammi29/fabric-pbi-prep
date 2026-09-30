# arch_databricks_data_advanced.py
# Scenarios 011-040 for Databricks Lakehouse Architecture

def get_advanced_databricks_scenarios():
    items = []

    # MEDIUM (011 - 020)
    scenarios_med = [
        ("arch-databricks-011", "Structured Streaming with Delta Lake", "How do you architect an end-to-end real-time streaming pipeline using Databricks Structured Streaming and Delta Lake with exactly-once guarantees?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Databricks Structured Streaming unifies stream and batch processing by treating real-time data streams as unbounded, append-only tables. When paired with Delta Lake as the storage sink, the engine delivers end-to-end exactly-once processing guarantees. Transactions are coordinated via atomic checkpointing: the engine records streaming source offsets in the checkpoint directory before committing the micro-batch into Delta's transaction log (`_delta_log/`).

### Phase 2: Low-Level Mechanics & Implementation
1. **Streaming Pipeline Configuration**: Set checkpointing, watermarking, and output modes.
2. **Implementation Snippet**:
```python
from pyspark.sql.functions import col, from_json, schema_of_json

# Read stream from Kafka or Event Hubs
df_raw = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "kafka-broker.internal:9092")
    .option("subscribe", "telemetry_events")
    .option("startingOffsets", "latest")
    .load()
)

# Parse and transform streaming micro-batches
df_parsed = df_raw.select(
    col("key").cast("string").alias("device_id"),
    from_json(col("value").cast("string"), "temperature double, pressure double, timestamp timestamp").alias("payload")
).select("device_id", "payload.*")

# Write to Silver Delta Table with RocksDB state management
(
    df_parsed.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "s3://enterprise-lake/checkpoints/silver_telemetry")
    .trigger(processingTime="10 seconds")
    .toTable("prod_catalog.silver_telemetry.device_readings")
)
```
3. **Execution Monitoring**: Track streaming progress, input rates, and processing rates in the Spark UI Streaming tab.

### Phase 3: Production Hardening & Gotchas
- **Checkpoint Location Deletion Catastrophe**: Deleting or changing the checkpoint path on a running stream resets offset tracking, causing duplicate processing of historical streams. *Remediation*: Checkpoint locations must be immutable and protected by cloud storage delete-locks.
- **Small File Fragmentation on Short Trigger Intervals**: Running `trigger(processingTime='1 second')` creates 86,400 tiny Parquet files every day. *Remediation*: Enable `delta.autoOptimize.autoCompact = true` and `delta.autoOptimize.optimizeWrite = true` on the Delta sink table.
- **Driver OOM on Large Stateful Windows**: Running 7-day stateful deduplication with in-memory HDFS state stores exhausts driver RAM. *Remediation*: Configure RocksDB as the state store provider: `spark.conf.set('spark.sql.streaming.stateStore.providerClass', 'org.apache.spark.sql.execution.streaming.state.RocksDBStateStoreProvider')`."""),

        ("arch-databricks-012", "OPTIMIZE and Z-Order for performance", "How do you architect data compaction and multidimensional clustering in Delta Lake using OPTIMIZE and Z-Ordering?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Frequent streaming inserts and micro-batch MERGE operations create thousands of small Parquet files, degrading query performance due to filesystem metadata overhead and non-vectorized disk I/O. The `OPTIMIZE` command compacts fragmented files into uniform ~1GB Parquet files. When combined with `ZORDER BY (col1, col2)`, it colocates multidimensional data along a space-filling curve, allowing queries filtering on high-cardinality columns to skip 90%+ of files based on min/max metadata.

### Phase 2: Low-Level Mechanics & Implementation
1. **Optimization Strategy**: Compact files and cluster by high-frequency query filter columns.
2. **Implementation Snippet**:
```sql
-- Delta Lake File Compaction and Multidimensional Clustering
-- 1. Compact table files and cluster along high-cardinality filter dimensions
OPTIMIZE prod_catalog.gold_sales.fct_orders
ZORDER BY (customer_id, order_date);

-- 2. Verify data skipping metrics in Delta history
DESCRIBE HISTORY prod_catalog.gold_sales.fct_orders LIMIT 1;
```
3. **Scheduled Maintenance**: Orchestrate weekly optimization sweeps during low-traffic maintenance windows.

### Phase 3: Production Hardening & Gotchas
- **Z-Ordering Too Many Columns**: Specifying more than 3-4 columns in `ZORDER BY` dilutes clustering effectiveness, destroying data skipping performance. *Remediation*: Restrict Z-Order columns to the top 2-3 most frequently filtered high-cardinality keys.
- **Heavy Compute Burn on Frequent Writes**: Running full-table Z-Ordering after every 5-minute ETL micro-batch wastes massive DBU budgets. *Remediation*: For append-heavy tables, migrate to Databricks Liquid Clustering (`CLUSTER BY`), which clusters incrementally.
- **File Skipping Blindness on Type Mismatches**: Filtering with mismatched data types (e.g. comparing string literal to integer column) disables Catalyst data skipping. *Remediation*: Ensure application query predicates match exact table column data types."""),

        ("arch-databricks-013", "Change Data Feed for downstream processing", "How do you architect an enterprise Change Data Feed (CDF) pipeline on Delta Lake to propagate row-level CDC events to downstream consumers?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Downstream systems (reverse-ETL to Salesforce, cache invalidation in Redis, or secondary analytical marts) need to know exactly which rows were inserted, updated, or deleted in upstream Delta tables. Change Data Feed (CDF) records row-level change events alongside the transaction log. Consumers query changes incrementally between commit versions, accessing change type metadata (`insert`, `update_preimage`, `update_postimage`, `delete`) without scanning entire tables.

### Phase 2: Low-Level Mechanics & Implementation
1. **Enable CDF**: Set table property `delta.enableChangeDataFeed = true` during table creation or alteration.
2. **Implementation Snippet**:
```sql
-- 1. Enable Change Data Feed on Silver Customer table
ALTER TABLE prod_catalog.silver_crm.dim_customers 
SET TBLPROPERTIES (delta.enableChangeDataFeed = true);

-- 2. Query row-level CDC mutations between versions as batch
SELECT 
    customer_id,
    email,
    plan_tier,
    _change_type,
    _commit_version,
    _commit_timestamp
FROM table_changes('prod_catalog.silver_crm.dim_customers', 10, 15)
WHERE _change_type IN ('update_postimage', 'delete');
```
```python
# 3. Read CDF as a continuous real-time streaming source
df_cdf_stream = (
    spark.readStream
    .format("delta")
    .option("readChangeFeed", "true")
    .option("startingVersion", 10)
    .table("prod_catalog.silver_crm.dim_customers")
)
```
3. **Downstream Sink**: Propagate updates to operational APIs or auditing tables.

### Phase 3: Production Hardening & Gotchas
- **Storage Overhead on High-Update Tables**: CDF writes additional change files to storage; on tables with 100% row churn daily, storage footprint can double. *Remediation*: Enable CDF strictly on business-critical entity tables that have downstream CDC consumers.
- **Querying CDF Beyond VACUUM Retention**: If a consumer lags and attempts to read CDF versions that have been purged by `VACUUM`, the query fails. *Remediation*: Set VACUUM retention periods to exceed downstream consumer processing SLAs.
- **Confusion Between update_preimage and update_postimage**: Ingestion pipelines processing both images accidentally duplicate updated rows. *Remediation*: Filter downstream upsert logic strictly for `_change_type = 'update_postimage'`."""),

        ("arch-databricks-014", "Shallow/deep clone for dev environments", "How do you architect instant, zero-storage testing sandboxes and disaster recovery replicas using Delta Shallow and Deep Clones?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Data teams need realistic production data to test code changes, but physically copying a 50TB data warehouse to developer sandboxes takes 12 hours and doubles cloud storage costs. Delta Lake provides two cloning mechanisms:
1. **Shallow Clone (`SHALLOW CLONE`)**: Duplicates only table metadata and transaction logs in seconds with zero data copying; ideal for ephemeral CI/CD and staging sandboxes.
2. **Deep Clone (`DEEP CLONE`)**: Physically copies both metadata and data files, creating a totally decoupled table suitable for disaster recovery and cross-region replication.

### Phase 2: Low-Level Mechanics & Implementation
1. **Cloning Syntax**: Execute shallow clone for development, or deep clone for cross-account disaster recovery.
2. **Implementation Snippet**:
```sql
-- 1. Ephemeral Developer Sandbox: Instant zero-cost copy of production table
CREATE OR REPLACE TABLE dev_catalog.sandbox_john.fct_orders_test
SHALLOW CLONE prod_catalog.gold_sales.fct_orders;

-- Developer can mutate, update, or drop records without affecting production
UPDATE dev_catalog.sandbox_john.fct_orders_test 
SET order_amount_usd = 0.0 WHERE order_id = 'test_123';

-- 2. Disaster Recovery: Decoupled physical copy to separate storage location
CREATE OR REPLACE TABLE dr_catalog.backup.fct_orders_replica
DEEP CLONE prod_catalog.gold_sales.fct_orders
LOCATION 's3://enterprise-lake-dr-west/fct_orders/';
```
3. **Validation**: Check table properties via `DESCRIBE DETAIL dev_catalog.sandbox_john.fct_orders_test`.

### Phase 3: Production Hardening & Gotchas
- **Shallow Clone Corruption on Aggressive VACUUM**: If the source production table runs `VACUUM` and deletes historical files referenced by a shallow clone, the shallow clone breaks. *Remediation*: Use shallow clones strictly for short-lived testing (<7 days); use deep clones for persistent environments.
- **Accidental Deep Clone Storage Bills**: Deep cloning 100TB tables for multiple developers duplicates petabytes of cloud storage. *Remediation*: Enforce Cluster Policies restricting developers to `SHALLOW CLONE`.
- **Identity / ACL Transfer Differences**: Clones do not automatically copy Unity Catalog table ACL grants. *Remediation*: Explicitly apply role-based grants to cloned tables in sandbox provisioning scripts."""),

        ("arch-databricks-015", "Unity Catalog fine-grained access control", "How do you architect cell-level data security in Unity Catalog using SQL Row Filters and Column Masks?",
"""### Phase 1: Conceptual Foundation & Core Architecture
In regulated enterprise environments (HIPAA, GDPR, SOC2), different organizational personas querying the same physical table must see different subsets of data. For example: North American analysts must see only US customer records, while customer service agents must see anonymized, masked email addresses and SSNs. Unity Catalog enforces cell-level security natively using standard SQL User-Defined Functions (UDFs) attached directly to table columns and rows.

### Phase 2: Low-Level Mechanics & Implementation
1. **UDF Modeling**: Define row filter functions and column masking functions in SQL.
2. **Implementation Snippet**:
```sql
-- 1. Define Column Masking Function (Masks emails for non-admin users)
CREATE OR REPLACE FUNCTION prod_catalog.governance.mask_email(email STRING)
RETURN CASE 
    WHEN is_account_group_member('data_privacy_officers') THEN email
    ELSE concat('***@', split_part(email, '@', 2))
END;

-- 2. Define Row Filter Function (Restricts rows to user's assigned country)
CREATE OR REPLACE FUNCTION prod_catalog.governance.filter_by_region(country_code STRING)
RETURN 
    is_account_group_member('global_executives') OR 
    (is_account_group_member('eu_analysts') AND country_code IN ('DE', 'FR', 'UK')) OR
    (is_account_group_member('us_analysts') AND country_code = 'US');

-- 3. Apply Column Mask and Row Filter to production table
ALTER TABLE prod_catalog.core.dim_customers 
ALTER COLUMN email SET MASK prod_catalog.governance.mask_email;

ALTER TABLE prod_catalog.core.dim_customers 
SET ROW FILTER prod_catalog.governance.filter_by_region ON (country_code);
```
3. **Audit**: Verify dynamic masking across user sessions with different group memberships.

### Phase 3: Production Hardening & Gotchas
- **Performance Overhead on Complex Filter Logic**: Authoring complex row filter UDFs with subqueries or external lookups slows down query planning on multi-million row scans. *Remediation*: Keep filter UDFs simple, utilizing `is_account_group_member()` and direct column comparisons.
- **Masking Breaking Join Keys**: Masking a column that is used as a join key in downstream queries will break joins for non-privileged users. *Remediation*: Apply masking strictly to descriptive PII attributes, never to surrogate or foreign keys.
- **Table Owner Bypass**: The table owner and workspace admins bypass row filters and column masks by default. *Remediation*: Designate non-human Service Principals as table owners, preventing human engineers from bypassing governance."""),

        ("arch-databricks-016", "Feature Store for ML training", "How do you architect a centralized enterprise Feature Store in Databricks Unity Catalog to eliminate training-serving skew?",
"""### Phase 1: Conceptual Foundation & Core Architecture
A common cause of machine learning failure in production is Training-Serving Skew: calculating features one way in batch training scripts and computing them differently in real-time inference APIs. The Databricks Feature Store (now integrated as Feature Engineering in Unity Catalog) centralizes feature definitions into governed Delta tables. It allows models to be packaged with automated feature lookup specifications: during real-time scoring, the model automatically fetches features from low-latency online stores.

### Phase 2: Low-Level Mechanics & Implementation
1. **Feature Engineering Client**: Author feature tables and log models with automated feature lookups.
2. **Implementation Snippet**:
```python
from databricks.feature_engineering import FeatureEngineeringClient, FeatureLookup
from pyspark.sql.functions import col, avg, count

fe = FeatureEngineeringClient()

# 1. Compute and register customer behavioral features
df_features = (
    spark.table("prod_catalog.gold_sales.fct_orders")
    .groupBy("customer_id")
    .agg(
        avg("order_amount_usd").alias("avg_order_value_usd"),
        count("order_id").alias("total_lifetime_orders")
    )
)

fe.create_table(
    name="prod_catalog.ml_features.customer_spending_features",
    primary_keys=["customer_id"],
    df=df_features,
    description="Customer historical behavioral spend metrics updated daily"
)

# 2. Package model training with automated Feature Lookups
feature_lookups = [
    FeatureLookup(
        table_name="prod_catalog.ml_features.customer_spending_features",
        feature_names=["avg_order_value_usd", "total_lifetime_orders"],
        lookup_key="customer_id"
    )
]
training_set = fe.create_training_set(df_raw_labels, feature_lookups, label="has_churned")
```
3. **Online Sync**: Synchronize feature tables to DynamoDB or Cosmos DB for sub-10ms REST inference.

### Phase 3: Production Hardening & Gotchas
- **Feature Staleness in Online Serving**: Failing to automate daily batch updates to the online key-value store serves stale feature attributes during inference. *Remediation*: Orchestrate automated daily sync jobs in Databricks Workflows to refresh online stores.
- **Data Leakage Across Time Windows**: Joining features computed using future data points into historical training sets inflates training accuracy. *Remediation*: Utilize point-in-time time-series feature lookups with explicit timestamp keys.
- **Schema Drift Breaking Deployed Models**: Altering feature column data types in the Delta table causes production model serving endpoints to crash. *Remediation*: Enforce schema contracts on feature tables and version feature schemas."""),

        ("arch-databricks-017", "Databricks SQL Warehouse optimization", "How do you architect high-concurrency BI reporting on Databricks SQL Serverless Warehouses with multi-cluster load balancing and intelligent caching?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Traditional Spark clusters are poorly suited for high-concurrency business intelligence (BI): spinning up virtual machines takes minutes, and single driver nodes become bottlenecks when hundreds of concurrent users refresh Power BI or Tableau dashboards. Databricks SQL Warehouses (Serverless) are purpose-built for SQL. Powered by Photon, they start in <5 seconds, scale multi-cluster concurrency automatically to absorb traffic bursts, and cache query results across local SSDs and remote metadata tiers.

### Phase 2: Low-Level Mechanics & Implementation
1. **Warehouse Provisioning**: Configure Serverless SQL Warehouse with multi-cluster auto-scaling and scaling policies.
2. **Implementation Snippet**:
```json
{
  "name": "bi_serverless_reporting_wh",
  "cluster_size": "Medium",
  "min_num_clusters": 1,
  "max_num_clusters": 5,
  "auto_stop_mins": 10,
  "enable_serverless_compute": true,
  "scaling_policy": "ECONOMY",
  "tags": {
    "custom_tags": [
      {"key": "Workload", "value": "Executive_BI"},
      {"key": "CostCenter", "value": "Analytics"}
    ]
  }
}
```
3. **Connection**: Connect Power BI via DirectQuery using the native Databricks Connector with OAuth2 SSO.

### Phase 3: Production Hardening & Gotchas
- **Scaling Policy Thrashing (Standard vs Economy)**: Setting `scaling_policy='STANDARD'` spins up additional clusters aggressively, driving up DBU costs during minor query spikes. *Remediation*: Use `ECONOMY` mode for general reporting, which waits for persistent query queue buildup before scaling out.
- **BI DirectQuery Generating Cartesian Products**: Unoptimized DAX measures generating thousands of unaggregated SQL queries flood warehouse queues. *Remediation*: Enforce aggregations in Power BI and train report authors to use Composite Models.
- **Cold Cache Query Spikes in the Morning**: 500 executive users opening dashboards at 08:00 AM hit cold local caches simultaneously. *Remediation*: Schedule automated cache-warming queries at 07:30 AM via Databricks Workflows."""),

        ("arch-databricks-018", "DLT expectations for data quality", "How do you architect a multi-stage data quality gate in Delta Live Tables using DLT Expectations, drop policies, and quarantine routing?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Ensuring data quality in production lakehouses requires active enforcement, not just post-facto auditing. Delta Live Tables (DLT) provides declarative Data Quality Expectations embedded directly in pipeline code. DLT supports three operational actions when a record fails an expectation: 1) `@dlt.expect` (retains invalid record, logs metric); 2) `@dlt.expect_or_drop` (drops invalid row silently); and 3) `@dlt.expect_or_fail` (halts entire pipeline). An enterprise architecture routes failing rows into a quarantine table for remediation.

### Phase 2: Low-Level Mechanics & Implementation
1. **Quarantine Pattern**: Separate valid stream from invalid stream using inverted expectation logic.
2. **Implementation Snippet**:
```python
import dlt
from pyspark.sql.functions import col

# Valid Silver Table: Drops records violating primary key or financial invariants
@dlt.table(
    name="silver_valid_orders",
    comment="Orders that satisfy 100% of data quality contracts"
)
@dlt.expect_or_drop("valid_order_id", "order_id IS NOT NULL")
@dlt.expect_or_drop("positive_amount", "amount_usd > 0.0")
@dlt.expect_or_drop("valid_status", "status IN ('PENDING', 'COMPLETED', 'CANCELLED')")
def silver_valid_orders():
    return dlt.read_stream("bronze_orders_raw")

# Quarantine Table: Ingests strictly rows that failed quality constraints
@dlt.table(
    name="silver_quarantine_orders",
    comment="Quarantined records for data engineering inspection"
)
def silver_quarantine_orders():
    return (
        dlt.read_stream("bronze_orders_raw")
        .filter(
            (col("order_id").isNull()) |
            (col("amount_usd") <= 0.0) |
            (~col("status").isin('PENDING', 'COMPLETED', 'CANCELLED'))
        )
    )
```
3. **SLA Monitoring**: Inspect the DLT event log to monitor pass/fail percentage rates over time.

### Phase 3: Production Hardening & Gotchas
- **Silent Data Loss with expect_or_drop**: Dropping 15% of records without alerting business owners can lead to miscalculated financial balances. *Remediation*: Always build a parallel quarantine table and set threshold alerts if dropped record ratios exceed 2%.
- **Complex Subqueries in Expectations**: Placing complex subqueries or window functions inside `@dlt.expect` is unsupported and crashes pipeline compilation. *Remediation*: Keep expectations strictly to row-level SQL boolean expressions.
- **Pipeline Aborts on Minor Warnings**: Using `@dlt.expect_or_fail` on non-critical metadata columns halts downstream production reporting. *Remediation*: Reserve `expect_or_fail` strictly for fundamental primary keys and financial balances."""),

        ("arch-databricks-019", "Photon engine workload optimization", "How do you architect PySpark and SQL workloads to maximize hardware acceleration using Databricks' vectorized Photon engine?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Traditional Apache Spark execution operates inside the Java Virtual Machine (JVM), which suffers from CPU caching inefficiencies, garbage collection pauses, and interpreter overhead. Photon is Databricks' next-generation vectorized query engine written from scratch in native C++. Photon executes queries directly on physical CPU registers and SIMD hardware instructions, providing 2x-8x acceleration for SQL aggregations, hash joins, and Delta Lake MERGE operations.

### Phase 2: Low-Level Mechanics & Implementation
1. **Photon Cluster Configuration**: Select a runtime with Photon enabled (`14.3.x-photon-scala2.12`).
2. **Implementation Snippet**:
```sql
-- 1. Enable Photon vectorized execution in SparkSession
SET spark.databricks.photon.enabled = true;

-- 2. Heavy aggregation workload accelerated by Photon vectorized C++ SIMD
SELECT 
    store_id,
    date_trunc('month', sale_timestamp) as sale_month,
    count(distinct customer_id) as unique_shoppers,
    sum(sale_amount_usd) as total_gross_sales,
    percentile_approx(sale_amount_usd, 0.5) as median_sale_value
FROM prod_catalog.gold_sales.fct_pos_transactions
GROUP BY 1, 2;
```
3. **Execution Verification**: Inspect Spark DAG query plans: verify nodes display `PhotonGroupingAgg` and `PhotonHashJoin`.

### Phase 3: Production Hardening & Gotchas
- **Python UDF Fallback Penalty**: Using non-vectorized Python UDFs forces Photon to serialize data across C++ and JVM into a Python worker process, negating all performance gains. *Remediation*: Replace Python UDFs with native Spark SQL functions or Pandas vectorized UDFs (PyArrow).
- **Unsupported Operations Dropping to Classic Spark**: Certain legacy operators or specialized RDD operations are not Photon-compatible, causing query plan splits. *Remediation*: Review query execution metrics in the Spark UI to verify 100% of operators execute within Photon.
- **Photon DBU Cost Multiplier on Lightweight Jobs**: Photon carries a higher DBU rate; running simple file copy jobs on Photon clusters wastes money. *Remediation*: Restrict Photon to compute-intensive SQL workloads, aggregations, and high-frequency MERGEs."""),

        ("arch-databricks-020", "Databricks Repos for Git integration", "How do you architect enterprise Git version control and CI/CD promotion in Databricks using Repos and Git Folders?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Enterprise software engineering mandates that no production code is authored or edited directly in production workspaces. Databricks Repos (Git Folders) provides native Git integration (GitHub, GitLab, Azure DevOps) directly in the workspace file system. Development occurs on Git feature branches; upon pull request merge, automated CI/CD pipelines use the Databricks CLI to update the production workspace Repo to the latest release tag.

### Phase 2: Low-Level Mechanics & Implementation
1. **Git Integration Setup**: Connect Git provider using personal access tokens or enterprise OAuth.
2. **Implementation Snippet**:
```bash
# Automated deployment script updating production Databricks Repo
#!/usr/bin/env bash
set -euo pipefail

REPO_ID="123456789012345"
TARGET_BRANCH="main"

echo "Updating Databricks Production Repo to branch: ${TARGET_BRANCH}..."
databricks repos update ${REPO_ID} --branch ${TARGET_BRANCH}

echo "Running automated post-deployment validation suite..."
databricks jobs run-now --job-id 987654321
echo "Deployment successful."
```
```python
# Notebook importing modular Python code stored inside Databricks Repos
import sys
import os
sys.path.append(os.path.abspath(".."))

from shared_libs.feature_engineering import compute_customer_rfm
```
3. **Verification**: Confirm that production Repos are locked to `main` and read-only for developers.

### Phase 3: Production Hardening & Gotchas
- **Developers Committing Directly to Production Repos**: Allowing interactive edits in production Git folders can introduce untested bugs into live jobs. *Remediation*: Enforce strict workspace permissions: production Repos are owned by Service Principals, with human users restricted to read-only.
- **Git Provider Rate Limiting During Cluster Syncs**: 50 worker nodes pulling Git changes simultaneously can trigger Git provider IP bans. *Remediation*: Package core libraries as Python wheels (`.whl`) and install them on clusters rather than pulling raw Git repos on workers.
- **Merge Conflicts in Notebook JSON**: Git merge conflicts in Databricks JSON notebook source files are difficult to resolve manually. *Remediation*: Pair with Databricks visual merge conflict tools or author complex business logic in modular `.py` files."""),
    ]

    for id_val, niche, q_text, ans in scenarios_med:
        items.append({
            "id": id_val,
            "source": "Architecture Hub",
            "category": "Databricks Lakehouse Architecture",
            "niche": niche,
            "difficulty": "MEDIUM",
            "question": q_text,
            "answer": ans
        })

    # HARD (021 - 030) & ARCHITECT (031 - 040)
    from arch_databricks_data_expert import get_expert_databricks_scenarios
    items.extend(get_expert_databricks_scenarios())

    return items
