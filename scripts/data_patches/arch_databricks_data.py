# arch_databricks_data.py
# High quality architecture scenarios for Databricks Lakehouse Architecture (arch-databricks-001 to 040)

def get_databricks_scenarios():
    items = []

    # 001 - 010 (EASY)
    scenarios_easy = [
        ("arch-databricks-001", "Cluster configuration for interactive vs job workloads", "How do you architect and rightsize Databricks clusters differentiating between interactive exploratory workloads and automated production jobs?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Databricks computes workloads using two distinct cluster topologies: **All-Purpose Clusters** and **Job Clusters**. All-purpose clusters support collaborative interactive notebook sessions, exploratory analysis, and multi-user ad-hoc queries; they incur higher Databricks Unit (DBU) consumption and require strict auto-termination policies. Job clusters are single-tenant, ephemeral compute instances provisioned exclusively for scheduled production workflows and terminated immediately upon completion, billed at a discounted DBU tier.

### Phase 2: Low-Level Mechanics & Implementation
1. **Cluster Sizing Matrix**: Assign memory-optimized VM types (e.g., AWS r5.2xlarge, Azure Standard_E8d_v5) for shuffle-heavy ETL, and compute-optimized (c5/Fsv2) for CPU-bound tasks.
2. **Implementation Snippet**:
```json
{
  "job_cluster_spec": {
    "spark_version": "14.3.x-scala2.12",
    "node_type_id": "r5.2xlarge",
    "driver_node_type_id": "r5.xlarge",
    "autoscale": {
      "min_workers": 2,
      "max_workers": 10
    },
    "spark_conf": {
      "spark.databricks.delta.preview.enabled": "true",
      "spark.sql.adaptive.enabled": "true"
    },
    "custom_tags": {
      "CostCenter": "Finance-DataEng",
      "Environment": "Production"
    }
  }
}
```
3. **Execution**: Deploy via the Databricks Jobs REST API (`/api/2.1/jobs/create`).

### Phase 3: Production Hardening & Gotchas
- **Using All-Purpose Clusters for Production Jobs**: Running nightly batch jobs on persistent all-purpose clusters doubles DBU costs and introduces noisy-neighbor contention. *Remediation*: Always configure automated production workflows to run on ephemeral Job Clusters.
- **Driver Node Out-Of-Memory (OOM)**: Sizing the driver node identical to worker nodes causes driver OOMs when collecting large broadcast joins or aggregations. *Remediation*: Allocate a driver node with 2x the memory of worker nodes.
- **Unbounded Worker Autoscaling**: Permitting autoscaling to scale from 2 to 100 workers can consume thousands in cloud VM costs during unexpected data skews. *Remediation*: Enforce hard maximum worker caps in Cluster Policies."""),

        ("arch-databricks-002", "Auto-termination policy", "How do you architect enterprise auto-termination governance across Databricks interactive clusters to eliminate idle cloud compute waste?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Data scientists and analysts frequently launch high-memory interactive clusters for morning exploratory analysis and leave them running indefinitely over nights and weekends. Because cloud virtual machines and Databricks software licenses (DBUs) bill per second, idle clusters represent the single largest source of cloud waste. Enterprise governance mandates Cluster Policies that enforce non-overrideable auto-termination timeouts (e.g. 20-30 minutes of inactivity).

### Phase 2: Low-Level Mechanics & Implementation
1. **Cluster Policy Definition**: Enforce a mandatory maximum `autotermination_minutes` threshold in JSON policy definitions.
2. **Implementation Snippet**:
```json
{
  "autotermination_minutes": {
    "type": "range",
    "minValue": 10,
    "maxValue": 30,
    "defaultValue": 20,
    "isOptional": false
  },
  "spark_version": {
    "type": "regex",
    "pattern": "14\\.[0-9]+\\.x-.*",
    "defaultValue": "14.3.x-scala2.12"
  },
  "custom_tags.Team": {
    "type": "fixed",
    "value": "Analytics"
  }
}
```
3. **Policy Attachment**: Assign the policy to all non-admin user groups in the Databricks Admin Console.

### Phase 3: Production Hardening & Gotchas
- **Streaming Queries Preventing Auto-Termination**: A forgotten streaming query running in an open notebook keeps the SparkContext active, preventing auto-termination from ever triggering. *Remediation*: Audit running clusters via REST API and automatically terminate clusters running streaming queries without active users.
- **Admin Users Bypassing Governance**: Workspace admins creating clusters without policies bypass auto-termination rules. *Remediation*: Enforce Cluster Policies account-wide using Terraform and restrict workspace admin privileges.
- **Premature Termination During Long Queries**: Setting auto-termination too low (e.g. 5 minutes) terminates clusters while a user is reading results. *Remediation*: Standardize on 20-30 minutes as the optimal balance between cost control and user productivity."""),

        ("arch-databricks-003", "Notebook-based EDA", "How do you architect collaborative Exploratory Data Analysis (EDA) in Databricks Notebooks while maintaining software engineering best practices?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Databricks Notebooks combine polyglot execution (%python, %sql, %scala, %r), interactive tabular data previews, and visualization charts. However, unchecked notebook usage can lead to messy, non-reproducible code with hidden global state. Enterprise EDA architectures enforce: 1) Version control via Databricks Repos / Git Folders; 2) Modular Python packaging (`.py` modules imported directly into notebooks); and 3) Data governance via Unity Catalog three-tier namespaces.

### Phase 2: Low-Level Mechanics & Implementation
1. **Interactive Workflow**: Load data from Unity Catalog, perform statistical profiling, and modularize code.
2. **Implementation Snippet**:
```python
# Databricks Notebook cell
# 1. Inspect table using Unity Catalog 3-level namespace
%sql
SELECT 
    customer_segment,
    count(*) as total_customers,
    round(avg(lifetime_value_usd), 2) as avg_ltv
FROM prod_catalog.gold_marketing.dim_customers
GROUP BY customer_segment
ORDER BY avg_ltv DESC;

# 2. Switch to Python for exploratory distribution modeling
%python
from utils.statistical_profiling import calculate_churn_percentiles

df = spark.table("prod_catalog.gold_marketing.dim_customers")
percentiles = calculate_churn_percentiles(df, "churn_risk_score")
display(percentiles)
```
3. **Version Control**: Commit notebook changes directly to Git feature branches within Databricks Repos.

### Phase 3: Production Hardening & Gotchas
- **State Pollution via Out-Of-Order Cell Runs**: Running notebook cells in arbitrary order creates hidden dependencies and non-reproducible analysis. *Remediation*: Always execute 'Run All' or use automated CI linting before committing notebook code.
- **Driver OOM via df.toPandas()**: Calling `.toPandas()` or `.collect()` on a 50-million row DataFrame pulls gigabytes into driver RAM, crashing the notebook session. *Remediation*: Always aggregate or limit data (`df.limit(1000).toPandas()`) before collecting to the driver.
- **Hardcoding Passwords in Notebook Cells**: Embedding database passwords or API keys directly in notebook cells exposes credentials in Git. *Remediation*: Retrieve credentials strictly via `dbutils.secrets.get(scope, key)`."""),

        ("arch-databricks-004", "Delta Lake CRUD operations", "How do you architect ACID-compliant transactional CRUD (Insert, Update, Delete, Merge) operations on Delta Lake tables?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Traditional data lakes on raw Parquet or ORC files do not support atomic mutations: updating a single record requires rewriting entire partition folders. Delta Lake brings full ACID transactions to distributed object storage. Every CRUD operation commits an atomic JSON commit file into the `_delta_log/` directory. Snapshot isolation guarantees that concurrent batch readers never see partial writes, dirty reads, or corrupted tables during heavy update cycles.

### Phase 2: Low-Level Mechanics & Implementation
1. **Atomic Upsert Mechanics**: Execute transactional SQL MERGE statements to handle updates and inserts simultaneously.
2. **Implementation Snippet**:
```sql
-- Delta Lake ACID Upsert (MERGE)
MERGE INTO prod_catalog.silver_crm.dim_customers AS target
USING staged_customer_updates AS source
ON target.customer_id = source.customer_id
-- 1. Update existing customers if attributes have mutated
WHEN MATCHED AND target.updated_at < source.updated_at THEN
  UPDATE SET
    target.email = source.email,
    target.plan_tier = source.plan_tier,
    target.updated_at = source.updated_at
-- 2. Soft-delete customers marked as deleted in source
WHEN MATCHED AND source.is_deleted = true THEN
  DELETE
-- 3. Insert newly discovered customer profiles
WHEN NOT MATCHED THEN
  INSERT (customer_id, email, plan_tier, created_at, updated_at)
  VALUES (source.customer_id, source.email, source.plan_tier, source.created_at, source.updated_at);
```
3. **Audit History**: Inspect transaction commits via `DESCRIBE HISTORY prod_catalog.silver_crm.dim_customers`.

### Phase 3: Production Hardening & Gotchas
- **Concurrent Append / Update Write Conflicts**: Multiple jobs updating the same partition simultaneously trigger `ConcurrentAppendException`. *Remediation*: Partition or cluster the table by date and implement automatic retry backoff on write collisions.
- **Unbounded Transaction Log Growth**: Thousands of micro-batch commits create millions of JSON log files, slowing query planning. *Remediation*: Configure checkpointing every 10 commits to consolidate transaction logs into binary Parquet checkpoints.
- **Accidental Full-Table Updates on Missing Predicates**: Omitting join conditions in UPDATE or DELETE statements wipes out production data. *Remediation*: Delta Lake enforces strict validation; leverage Delta Time Travel (`RESTORE TABLE`) to recover from accidental overwrites."""),

        ("arch-databricks-005", "Unity Catalog table creation", "How do you architect a governed Unity Catalog schema hierarchy using managed and external tables with cloud storage credentials?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Unity Catalog establishes centralized data governance across Databricks workspaces using a standardized three-level namespace: `catalog.schema.table`. In enterprise lakehouses, tables are architected into two primary types: **Managed Tables** (Databricks manages both metadata and physical Parquet files in governed cloud storage) and **External Tables** (Databricks manages metadata, but physical storage resides in a customer-managed cloud bucket via Storage Credentials and External Locations).

### Phase 2: Low-Level Mechanics & Implementation
1. **Governance Hierarchy**: Create Catalog -> Schema -> Managed / External Tables with assigned storage credentials.
2. **Implementation Snippet**:
```sql
-- 1. Create a top-level business domain catalog
CREATE CATALOG IF NOT EXISTS supply_chain_catalog
  MANAGED LOCATION 's3://enterprise-lake-supplychain/managed/';

-- 2. Create a functional schema within the catalog
CREATE SCHEMA IF NOT EXISTS supply_chain_catalog.silver_inventory;

-- 3. Create a Managed Delta Table (Storage fully governed by UC)
CREATE TABLE IF NOT EXISTS supply_chain_catalog.silver_inventory.fct_stock_levels (
    warehouse_id STRING,
    product_sku STRING,
    stock_on_hand INT,
    last_counted_at TIMESTAMP
)
USING DELTA
CLUSTER BY (warehouse_id, product_sku);

-- 4. Grant least-privilege permissions to domain user groups
GRANT USE CATALOG ON CATALOG supply_chain_catalog TO `supply_chain_engineers`;
GRANT USE SCHEMA ON SCHEMA supply_chain_catalog.silver_inventory TO `supply_chain_engineers`;
GRANT SELECT, MODIFY ON TABLE supply_chain_catalog.silver_inventory.fct_stock_levels TO `supply_chain_engineers`;
```
3. **Data Explorer Verification**: Inspect table properties and permissions in Data Explorer.

### Phase 3: Production Hardening & Gotchas
- **Accidental Data Deletion on DROP EXTERNAL TABLE**: Dropping a managed table deletes the underlying files; dropping an external table removes only metadata. *Remediation*: Educate engineers on managed vs external table lifecycles; use managed tables for standard lakehouse marts.
- **Storage Credential IAM Privilege Escalation**: Granting broad read/write IAM roles to Unity Catalog storage credentials exposes underlying cloud buckets. *Remediation*: Scope IAM role trust policies strictly to specific S3 bucket prefixes.
- **Catalog Name Collisions Across Workspaces**: Using unstructured catalog names causes confusion in multi-workspace environments. *Remediation*: Standardize catalog naming (e.g. `prod_<domain>`, `dev_<domain>`)."""),

        ("arch-databricks-006", "Auto Loader for incremental file ingestion", "How do you architect petabyte-scale file ingestion into Databricks using Auto Loader (cloudFiles) with automated schema evolution?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Ingesting millions of raw files (JSON, CSV, Parquet) landing continuously from IoT sensors or transaction dumps using traditional directory listing is slow and expensive. Auto Loader (`format("cloudFiles")`) is Databricks' purpose-built ingestion engine. It provides two operational modes: **Directory Listing** (with incremental lexical scanning) and **File Notification** (which automatically provisions cloud SNS/SQS or Event Grid queues to listen to storage events). It guarantees exactly-once processing and handles schema evolution gracefully.

### Phase 2: Low-Level Mechanics & Implementation
1. **Auto Loader Stream Setup**: Configure `cloudFiles` source with schema inference and a rescued data column.
2. **Implementation Snippet**:
```python
# Auto Loader incremental ingestion stream
df_stream = (
    spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "s3://enterprise-lake/checkpoints/schema/iot_telemetry")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .option("cloudFiles.inferColumnTypes", "true")
    .option("cloudFiles.useNotifications", "true") # File Notification mode via SQS
    .load("s3://enterprise-landing-zone/iot_raw/")
)

# Stream to Bronze Delta Lake table with exactly-once checkpoints
(
    df_stream.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "s3://enterprise-lake/checkpoints/sink/bronze_iot")
    .trigger(availableNow=True) # Cost-effective micro-batch execution
    .toTable("prod_catalog.bronze_telemetry.raw_iot_events")
)
```
3. **Rescued Data Audit**: Query `_rescued_data` column to inspect malformed records that did not match inferred types.

### Phase 3: Production Hardening & Gotchas
- **Cloud Notification Permission Failures**: Enabling `useNotifications=true` without IAM permissions to create SQS/Event Grid queues fails during stream initialization. *Remediation*: Pre-provision cloud queues via Terraform or grant Databricks IAM roles SNS/SQS admin rights.
- **Unbounded Schema Drift Corrupting Downstream Tables**: Setting `schemaEvolutionMode='addNewColumns'` blindly allows typo-ridden columns into production tables. *Remediation*: Set schema evolution to rescue mode (`rescue`) and enforce quarantine alerts.
- **Checkpoint Location Deletion Disaster**: Deleting the streaming `checkpointLocation` causes Auto Loader to re-read all historical files, duplicating billions of rows. *Remediation*: Protect checkpoint storage buckets with object deletion locks and versioning."""),

        ("arch-databricks-007", "Basic DLT pipeline", "How do you architect a declarative ETL pipeline using Delta Live Tables (DLT) with streaming tables and materialized views?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Delta Live Tables (DLT) is Databricks' declarative framework that transforms pipeline engineering from manual Spark orchestration into declared target states. Instead of authoring complex checkpointing, retry loops, and cluster provisioning scripts, engineers write SQL or Python queries decorated with `@dlt.table`. DLT automatically resolves DAG dependencies, creates streaming tables and materialized views, provisions compute, and enforces data quality expectations.

### Phase 2: Low-Level Mechanics & Implementation
1. **Declarative Pipeline Definition**: Author Python/SQL DLT pipeline scripts.
2. **Implementation Snippet**:
```python
import dlt
from pyspark.sql.functions import col, expr

# 1. Bronze Streaming Table (Ingests raw JSON incrementally)
@dlt.table(
    name="bronze_orders_raw",
    comment="Raw appended orders ingested via Auto Loader"
)
def bronze_orders_raw():
    return (
        spark.readStream.format("cloudFiles")
        .option("cloudFiles.format", "json")
        .load("s3://enterprise-lake/landing/orders/")
    )

# 2. Silver Materialized View (Cleansed, deduplicated, and validated)
@dlt.table(
    name="silver_orders_cleaned",
    comment="Cleaned orders with valid customer IDs"
)
@dlt.expect_or_drop("valid_order_id", "order_id IS NOT NULL")
@dlt.expect_or_drop("positive_amount", "amount_usd > 0")
def silver_orders_cleaned():
    return (
        dlt.read_stream("bronze_orders_raw")
        .select(
            col("order_id").cast("string"),
            col("customer_id").cast("string"),
            col("amount_usd").cast("double"),
            col("timestamp").cast("timestamp")
        )
    )
```
3. **Deployment**: Configure a DLT Pipeline in the Databricks UI under Workflows -> Delta Live Tables.

### Phase 3: Production Hardening & Gotchas
- **Mixing Batch and Streaming Semantics Incorrectly**: Calling `dlt.read()` (batch) on a streaming source or `dlt.read_stream()` on a static table causes pipeline compilation errors. *Remediation*: Use `dlt.read_stream()` strictly for append-only streaming tables and `dlt.read()` for materialized views.
- **Cluster Startup Latency on Triggered Pipelines**: Running DLT in triggered batch mode on classical job clusters adds 5 minutes of VM initialization time. *Remediation*: Deploy pipelines on Serverless DLT to achieve sub-10 second compute startup.
- **Silent Record Dropping with expect_or_drop**: Dropping invalid records without logging creates invisible data discrepancies between source and target marts. *Remediation*: Route invalid records to dedicated quarantine tables for audit review."""),

        ("arch-databricks-008", "Medallion Architecture setup (Bronze/Silver/Gold)", "How do you architect an enterprise Medallion Lakehouse on Databricks implementing Bronze, Silver, and Gold data layers?",
"""### Phase 1: Conceptual Foundation & Core Architecture
The Medallion Architecture organizes lakehouse data into three progressive refinement layers:
1. **Bronze (Raw Ingestion)**: Immutable, append-only landing layer preserving raw data in original schemas for historical replayability.
2. **Silver (Enterprise Conformed)**: Cleansed, normalized, deduplicated, and enriched tables with enforced schema validation and referential integrity.
3. **Gold (Business Marts)**: Star schemas, aggregated metrics, and dimensional tables curated for executive BI, dashboards, and ML feature consumption.

### Phase 2: Low-Level Mechanics & Implementation
1. **Tiered Catalog Design**: Structure Unity Catalog schemas matching medallion tiers.
2. **Implementation Snippet**:
```sql
-- Bronze: Ingest raw stream
CREATE TABLE IF NOT EXISTS enterprise_catalog.bronze.raw_transactions
USING DELTA
AS SELECT * FROM staging_feed;

-- Silver: Merge cleansed records, enforcing unique customer keys
MERGE INTO enterprise_catalog.silver.transactions AS target
USING (
    SELECT 
        txn_id,
        upper(trim(customer_id)) as customer_id,
        cast(amount as numeric(18,2)) as amount_usd,
        cast(txn_timestamp as timestamp) as txn_timestamp
    FROM enterprise_catalog.bronze.raw_transactions
    WHERE txn_id IS NOT NULL
) AS source
ON target.txn_id = source.txn_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;

-- Gold: Aggregated business dimension mart
CREATE OR REPLACE TABLE enterprise_catalog.gold.fct_daily_sales
CLUSTER BY (sale_date)
AS
SELECT 
    cast(txn_timestamp as date) as sale_date,
    count(distinct txn_id) as total_transactions,
    sum(amount_usd) as total_revenue_usd
FROM enterprise_catalog.silver.transactions
GROUP BY 1;
```
3. **Governance**: Enforce read permissions: general BI users access Gold only; data engineers access Silver and Bronze.

### Phase 3: Production Hardening & Gotchas
- **BI Users Querying Bronze/Silver Layers**: Allowing dashboard queries against volatile Bronze or Silver layers exposes analysts to dirty records and causes compute contention. *Remediation*: Restrict BI service principals strictly to the Gold schema using Unity Catalog grants.
- **Over-Normalizing Gold Layer**: Treating Gold as 3rd Normal Form relational databases creates complex join latency in BI tools. *Remediation*: Model Gold strictly as denormalized Kimball star schemas or flat wide reporting tables.
- **Missing Historical Replayability**: Modifying Bronze records destroys the audit log required to replay transformations from scratch. *Remediation*: Enforce append-only rules on Bronze with strict read-only permissions."""),

        ("arch-databricks-009", "MLflow experiment tracking", "How do you architect enterprise machine learning experiment tracking and artifact logging using MLflow on Databricks?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Machine learning development requires tracking thousands of training iterations, hyperparameter combinations, loss metrics, and serialized model artifacts. MLflow Tracking provides a unified logging engine embedded directly into Databricks. When data scientists execute training code, `mlflow.autolog()` or explicit logging APIs record parameters, evaluation metrics (RMSE, AUC), Git commit hashes, environment dependencies, and model weights, linking every model run to its exact underlying Delta table snapshot.

### Phase 2: Low-Level Mechanics & Implementation
1. **Experiment Tracking Setup**: Initialize experiment and log metrics, parameters, and model signatures.
2. **Implementation Snippet**:
```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, roc_auc_score

# Set experiment path in Databricks Workspace
mlflow.set_experiment("/Shared/Experiments/Customer_Churn_Prediction")

with mlflow.start_run(run_name="rf_hyperopt_trial_42") as run:
    # 1. Log training hyperparameters
    params = {"n_estimators": 200, "max_depth": 8, "random_state": 42}
    mlflow.log_params(params)
    
    # 2. Train model
    clf = RandomForestClassifier(**params)
    clf.fit(X_train, y_train)
    
    # 3. Log evaluation metrics
    preds = clf.predict(X_test)
    probs = clf.predict_proba(X_test)[:, 1]
    mlflow.log_metric("accuracy", accuracy_score(y_test, preds))
    mlflow.log_metric("roc_auc", roc_auc_score(y_test, probs))
    
    # 4. Log model artifact with input signature
    signature = mlflow.models.infer_signature(X_train, preds)
    mlflow.sklearn.log_model(
        sk_model=clf,
        artifact_path="model",
        signature=signature,
        registered_model_name="prod_catalog.ml_models.customer_churn_model"
    )
```
3. **Model Registry**: Inspect trial metrics and promote champion models in the MLflow UI.

### Phase 3: Production Hardening & Gotchas
- **Unbounded Artifact Storage Bloat**: Logging multi-gigabyte PyTorch/TensorFlow checkpoints on every training epoch fills workspace storage. *Remediation*: Log model artifacts strictly for top-performing runs and set artifact bucket lifecycle rules.
- **Missing Model Signatures Breaking Serving**: Deploying models without an inferred schema signature causes REST serving endpoints to fail on malformed JSON inputs. *Remediation*: Always infer and log model signatures via `mlflow.models.infer_signature`.
- **Training-Serving Feature Skew**: Logging model code without locking down exact Python library versions causes unpickling failures in production. *Remediation*: Let MLflow automatically record `conda.yaml` and `requirements.txt` environment locks."""),

        ("arch-databricks-010", "Delta table time travel queries", "How do you architect data auditing, point-in-time historical reporting, and disaster recovery using Delta Time Travel?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Delta Lake's append-only transaction log (`_delta_log/`) and immutable Parquet storage enable querying historical snapshots of a table at any previous commit version or timestamp. Time Travel enables critical enterprise capabilities: 1) Reproducing exact training sets for machine learning models; 2) Auditing data states for regulatory compliance (e.g. balance as of midnight month-end); and 3) Instant disaster recovery via `RESTORE TABLE` after accidental updates or corruptions.

### Phase 2: Low-Level Mechanics & Implementation
1. **Time Travel Syntax**: Query historical versions using `TIMESTAMP AS OF` or `VERSION AS OF`.
2. **Implementation Snippet**:
```sql
-- 1. Inspect historical table commit history
DESCRIBE HISTORY prod_catalog.finance.fct_general_ledger;

-- 2. Query data exactly as it existed at month-end closing
SELECT * FROM prod_catalog.finance.fct_general_ledger
TIMESTAMP AS OF '2026-08-31 23:59:59';

-- 3. Compare difference between current table and version 42
SELECT 
    current.account_id,
    current.balance - historical.balance as balance_delta
FROM prod_catalog.finance.fct_general_ledger current
JOIN prod_catalog.finance.fct_general_ledger VERSION AS OF 42 historical
  ON current.account_id = historical.account_id;

-- 4. Instant Disaster Recovery: Roll back an accidental corruption
RESTORE TABLE prod_catalog.finance.fct_general_ledger TO VERSION AS OF 41;
```
3. **Retention Configuration**: Set `delta.logRetentionDuration = 'interval 30 days'` to preserve historical metadata.

### Phase 3: Production Hardening & Gotchas
- **VACUUM Breaking Time Travel**: Running `VACUUM table RETAIN 0 HOURS` permanently deletes physical Parquet files, causing Time Travel queries to fail with FileNotFoundException. *Remediation*: Enforce safety limits: never run VACUUM with retention periods shorter than the required audit window (e.g. 7-30 days).
- **Timezone Inconsistencies on Timestamp Queries**: Specifying local timestamps without timezone descriptors returns the wrong historical snapshot. *Remediation*: Always pass explicit UTC formatted timestamps (`'YYYY-MM-DD HH:MM:SS'`).
- **Storage Cost Accumulation on High-Churn Tables**: Tables undergoing thousands of updates daily accumulate massive historical snapshot files. *Remediation*: Balance time travel requirements with storage budgets by aligning VACUUM retention with business SLAs."""),
    ]

    for id_val, niche, q_text, ans in scenarios_easy:
        items.append({
            "id": id_val,
            "source": "Architecture Hub",
            "category": "Databricks Lakehouse Architecture",
            "niche": niche,
            "difficulty": "EASY",
            "question": q_text,
            "answer": ans
        })

    # 011 - 020 (MEDIUM) & 021 - 040 (HARD / ARCHITECT)
    from arch_databricks_data_advanced import get_advanced_databricks_scenarios
    items.extend(get_advanced_databricks_scenarios())

    return items
