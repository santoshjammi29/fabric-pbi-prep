# fix_questions_databricks_1.py
# Bespoke, expert questions and answers for databricks-q-001 through databricks-q-050 (EASY & MEDIUM).

def get_databricks_fixes_part1():
    items = {}

    # EASY: 001 - 025
    easy_data = [
        ("databricks-q-001", "Databricks Notebooks & Collaborative Development",
         "How do you parameterize, execute, and link Databricks notebooks in an automated data pipeline?",
         """To parameterize and run notebooks programmatically in Databricks:

1. **Parameterization via Widgets**: Use Databricks widgets to pass dynamic runtime arguments (e.g., date partitions, environment names, batch IDs):
```python
# In child notebook: extract parameter values
dbutils.widgets.text("processing_date", "2024-01-01", "Processing Date")
dbutils.widgets.dropdown("environment", "dev", ["dev", "staging", "prod"], "Target Environment")

processing_date = dbutils.widgets.get("processing_date")
target_env = dbutils.widgets.get("environment")

# Return status or summary back to caller
dbutils.notebook.exit(f"Successfully processed {processing_date} in {target_env}")
```
2. **Programmatic Orchestration (`dbutils.notebook.run`)**:
```python
# In parent coordinator notebook
result = dbutils.notebook.run(
    path="/Shared/ETL/clean_sales_data",
    timeout_seconds=1800,
    arguments={"processing_date": "2024-03-01", "environment": "prod"}
)
print(f"Child notebook result: {result}")
```
3. **Production Hardening**: In production environments, replace nested `dbutils.notebook.run()` calls with **Databricks Workflows** multi-task DAGs. Workflows provide native task retry policies, parallel task execution, centralized alerting, and run on ephemeral Job Compute rather than expensive all-purpose clusters."""),

        ("databricks-q-002", "Delta Lake Basic CRUD Operations",
         "How do you implement atomic CRUD (Create, Read, Update, Delete) operations on Delta Lake tables?",
         """Delta Lake brings ACID transactions to Apache Parquet data lakes through a write-ahead transaction log (`_delta_log/`):

1. **Create and Append**:
```sql
CREATE TABLE IF NOT EXISTS enterprise_lake.crm.accounts (
    account_id STRING,
    name STRING,
    tier STRING,
    created_at TIMESTAMP
) USING DELTA;

INSERT INTO enterprise_lake.crm.accounts VALUES 
  ('A1', 'Acme Corp', 'Enterprise', current_timestamp());
```
2. **Atomic Update & Delete**:
```sql
-- Updates rewrite affected Parquet files atomically
UPDATE enterprise_lake.crm.accounts 
SET tier = 'VIP' 
WHERE account_id = 'A1';

-- Deletes remove rows atomically (or write delete vectors if enabled)
DELETE FROM enterprise_lake.crm.accounts 
WHERE tier = 'Inactive';
```
3. **PySpark DeltaTable API**:
```python
from delta.tables import DeltaTable

delta_table = DeltaTable.forName(spark, "enterprise_lake.crm.accounts")
delta_table.update(
    condition="tier = 'Standard'",
    set={"tier": "'Silver'"}
)
```
4. **Gotcha**: Excessive point updates without compaction generate small Parquet files. Enable Delta Delete Vectors (`delta.enableDeletionVectors = true`) to achieve sub-second update/delete speeds without rewriting entire data files."""),

        ("databricks-q-003", "Unity Catalog Namespace & Governance Basics",
         "What is the three-level namespace in Databricks Unity Catalog and how does it organize data assets?",
         """Unity Catalog replaces legacy two-level Hive metastore naming (`schema.table`) with an enterprise-grade three-level namespace:

### Structure:
`catalog.schema.table_or_view_or_volume`
- **Catalog**: Represents a major business domain (e.g., `finance_prod`, `marketing_dev`) or deployment tier (`prod`, `dev`). It binds to a specific cloud storage root location.
- **Schema (Database)**: Represents a functional subject area or Medallion layer (e.g., `bronze_raw`, `silver_cleaned`, `gold_mart`).
- **Table / View / Volume**: The concrete governed data asset (Delta table, view, or unstructured file Volume).

### SQL Hierarchy & Privilege Grant:
```sql
-- 1. Create hierarchical structure
CREATE CATALOG IF NOT EXISTS enterprise_prod;
CREATE SCHEMA IF NOT EXISTS enterprise_prod.sales;

-- 2. Create managed table within the 3-level namespace
CREATE TABLE IF NOT EXISTS enterprise_prod.sales.daily_revenue (
    order_date DATE,
    total_usd DECIMAL(12, 2)
) USING DELTA;

-- 3. Unified RBAC: Grants cascade down the hierarchy
GRANT USAGE ON CATALOG enterprise_prod TO `data_analysts`;
GRANT USAGE ON SCHEMA enterprise_prod.sales TO `data_analysts`;
GRANT SELECT ON TABLE enterprise_prod.sales.daily_revenue TO `data_analysts`;
```
4. **Production Benefit**: Decouples data governance from workspace borders, allowing a single central metastore to federate across dev, test, and prod workspaces."""),

        ("databricks-q-004", "Auto Loader Incremental File Ingestion",
         "How do you configure Databricks Auto Loader (`cloudFiles`) for scalable, incremental ingestion from cloud storage?",
         """Databricks Auto Loader uses the `cloudFiles` format to incrementally and reliably ingest millions of files from Amazon S3, ADLS Gen2, or GCS without maintaining state databases:

### PySpark Structured Streaming Implementation:
```python
from pyspark.sql.functions import current_timestamp, input_file_name

# Configure Auto Loader with directory notification and schema inference
df_stream = (
    spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "abfss://checkpoints@lake.dfs.core.windows.net/orders_schema")
    .option("cloudFiles.inferColumnTypes", "true")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .load("abfss://landing@lake.dfs.core.windows.net/raw_orders/")
    .withColumn("ingestion_time", current_timestamp())
    .withColumn("source_file", input_file_name())
)

# Stream into Bronze Delta table
query = (
    df_stream.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "abfss://checkpoints@lake.dfs.core.windows.net/orders_bronze")
    .toTable("enterprise_prod.bronze.raw_orders")
)
```
### Ingestion Modes:
- **Directory Listing Mode**: Polls storage directories; best for <1M files.
- **File Notification Mode (`cloudFiles.useNotifications = true`)**: Automatically sets up AWS SNS/SQS or Azure Event Grid to receive file arrival events; best for millions of files per day.
- **Production Gotcha**: Always specify `cloudFiles.schemaLocation` in a permanent directory, or streaming restarts will re-infer schemas from scratch and fail."""),

        ("databricks-q-005", "Medallion Architecture Design Principles",
         "What are the distinct responsibilities of Bronze, Silver, and Gold layers in a Databricks Medallion Lakehouse?",
         """The Medallion Architecture organizes lakehouse data into progressively refined tiers:

1. **Bronze (Raw / Ingestion Layer)**:
   - *Role*: Exact digital twin of source data, append-only historical archive.
   - *Format*: Delta Lake tables storing raw JSON strings, binary payloads, or CSVs with metadata (`_ingestion_timestamp`, `_source_file`).
   - *Access*: Restricted to data engineers and automated pipelines.
2. **Silver (Enriched / Conformed Layer)**:
   - *Role*: Validated, cleansed, conformed, and deduplicated enterprise data.
   - *Transformations*: Data type casting, schema enforcement, NULL handling, deduplication on primary keys, and data quality assertions.
   - *Access*: Available to data scientists and advanced analysts.
3. **Gold (Curated / Aggregated Serving Layer)**:
   - *Role*: Business-level curated dimensions, fact tables, and aggregated reporting cubes.
   - *Structure*: Kimball star schemas, dimensional models, and KPI summary tables optimized with Liquid Clustering.
   - *Access*: Broad read-only access for business analysts, BI dashboards (Power BI / Tableau), and operational APIs."""),

        ("databricks-q-006", "MLflow Tracking & Experiment Logging",
         "How do you track machine learning experiments, log parameters, metrics, and models using MLflow in Databricks?",
         """MLflow is built directly into Databricks Runtime for Machine Learning, providing automated experiment tracking and artifact lineage:

### Python Implementation:
```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error

# Set experiment path in workspace
mlflow.set_experiment("/Users/engineer@enterprise.com/churn_prediction")

with mlflow.start_run(run_name="rf_n_estimators_150") as run:
    # 1. Log hyperparameters
    n_estimators = 150
    max_depth = 8
    mlflow.log_param("n_estimators", n_estimators)
    mlflow.log_param("max_depth", max_depth)
    
    # 2. Train model
    model = RandomForestRegressor(n_estimators=n_estimators, max_depth=max_depth)
    model.fit(X_train, y_train)
    
    # 3. Log metrics
    preds = model.predict(X_val)
    rmse = mean_squared_error(y_val, preds, squared=False)
    mlflow.log_metric("val_rmse", rmse)
    
    # 4. Log model artifact with input signature
    signature = mlflow.models.infer_signature(X_val, preds)
    mlflow.sklearn.log_model(
        sk_model=model,
        artifact_path="model",
        signature=signature,
        input_example=X_train[:3]
    )

print(f"Logged run: {run.info.run_id} with RMSE: {rmse}")
```
### Production Hardening:
- Always log the `signature` and `input_example` so that downstream Databricks Model Serving can validate schema types at REST endpoint inference time."""),

        ("databricks-q-007", "Databricks SQL & SQL Warehouses",
         "What is a Databricks SQL Warehouse and how does it differ from standard all-purpose Spark clusters?",
         """A Databricks SQL (DBSQL) Warehouse is a purpose-built, auto-scaling compute resource optimized specifically for SQL queries, BI dashboards, and ad-hoc analytics:

### Architectural Differences:
1. **Engine Optimization (Photon Engine)**:
   - SQL Warehouses run the Photon vectorized C++ engine natively, delivering 3-5x faster query performance on relational aggregations, joins, and scans compared to standard PySpark execution.
2. **Concurrency & Elasticity**:
   - Multi-cluster load balancing: A single SQL Warehouse can dynamically scale from 1 cluster to 10 clusters to absorb hundreds of concurrent BI queries without queueing.
   - Instant boot (Serverless): Serverless SQL Warehouses start in <5 seconds, eliminating the 3-5 minute VM startup delay.
3. **Aggressive Auto-Stop**:
   - Configurable down to 1-5 minutes of inactivity, reducing idle cloud VM spend significantly.

### SQL Query Execution Snippet:
```sql
-- Sub-second aggregation running on Photon SQL Warehouse
SELECT 
    date_trunc('month', order_date) AS sales_month,
    customer_segment,
    COUNT(DISTINCT customer_id) AS active_customers,
    ROUND(SUM(total_amount_usd), 2) AS monthly_revenue
FROM enterprise_prod.sales.fct_orders
WHERE order_date >= current_date() - INTERVAL 12 MONTH
GROUP BY 1, 2
ORDER BY 1 DESC;
```"""),

        ("databricks-q-008", "Databricks Workflows Multi-Task Orchestration",
         "How do you design and configure a multi-task Databricks Workflow with task dependencies and failure alerting?",
         """Databricks Workflows is the fully managed orchestration service built into the Lakehouse platform, supporting complex DAGs spanning notebooks, Python scripts, SQL queries, dbt models, and DLT pipelines:

### Workflow Architecture:
1. **Task Graph & Dependencies**:
   - Define tasks with explicit upstream `depends_on` relationships.
   - Tasks execute on shared or ephemeral **Job Compute** clusters (costing up to 50% fewer DBUs than interactive compute).
2. **Declarative Workflow Specification (JSON / DAB)**:
```json
{
  "name": "Daily_ECommerce_ETL",
  "tasks": [
    {
      "task_key": "ingest_bronze",
      "notebook_task": {
        "notebook_path": "/Workspace/Pipelines/01_ingest_raw"
      },
      "job_cluster_key": "etl_cluster"
    },
    {
      "task_key": "transform_silver",
      "depends_on": [{"task_key": "ingest_bronze"}],
      "notebook_task": {
        "notebook_path": "/Workspace/Pipelines/02_transform_silver"
      },
      "job_cluster_key": "etl_cluster"
    },
    {
      "task_key": "run_dbt_gold",
      "depends_on": [{"task_key": "transform_silver"}],
      "dbt_task": {
        "project_directory": "/Workspace/dbt_enterprise",
        "commands": ["dbt run --select marts"]
      },
      "warehouse_id": "4a5b6c7d8e9f"
    }
  ],
  "job_clusters": [
    {
      "job_cluster_key": "etl_cluster",
      "new_cluster": {
        "spark_version": "14.3.x-scala2.12",
        "node_type_id": "Standard_D4ds_v5",
        "num_workers": 4
      }
    }
  ]
}
```
3. **Alerting**: Configure Slack/PagerDuty webhooks for `on_failure` and `on_duration_warning_threshold_exceeded`."""),

        ("databricks-q-009", "Delta Lake Time Travel & Auditing",
         "How do you query historical snapshots and rollback accidental updates using Delta Lake Time Travel?",
         """Delta Lake's transaction log records every commit sequentially, providing point-in-time snapshot auditing and instant disaster recovery:

### Time Travel Query Syntax:
```sql
-- 1. Inspect transaction history and commit metadata
DESCRIBE HISTORY enterprise_prod.finance.ledger;

-- 2. Query data as it existed at a specific version
SELECT * FROM enterprise_prod.finance.ledger VERSION AS OF 14;

-- 3. Query data as it existed at a specific point in time
SELECT * FROM enterprise_prod.finance.ledger TIMESTAMP AS OF '2024-03-01 09:30:00';

-- 4. Instant rollback of an accidental corruption/update
RESTORE TABLE enterprise_prod.finance.ledger TO VERSION AS OF 14;
```
### PySpark API:
```python
df_historical = (
    spark.read
    .format("delta")
    .option("versionAsOf", 14)
    .load("abfss://data@lake.dfs.core.windows.net/finance/ledger")
)
```
### Production Hardening:
- By default, Delta retains history for 30 days (`delta.logRetentionDuration = 'interval 30 days'`).
- Running `VACUUM table RETAIN 0 HOURS` deletes historical Parquet files, immediately breaking time-travel queries older than the vacuum window."""),

        ("databricks-q-010", "DBFS vs Unity Catalog Volumes",
         "What is the difference between legacy Databricks File System (DBFS) and Unity Catalog Volumes for unstructured file storage?",
         """Managing non-tabular unstructured files (PDFs, images, CSVs, ML checkpoints) has transitioned from legacy DBFS to governed Unity Catalog Volumes:

### DBFS (Legacy / Deprecated for Security):
- Root DBFS (`dbfs:/`) is a shared storage bucket automatically provisioned with the workspace.
- **Security Vulnerability**: Any user with cluster create or notebook execution permissions can read/write root DBFS. Lacks granular ACLs and cannot be governed across multi-workspace accounts.

### Unity Catalog Volumes (Modern Standard):
- First-class governed objects within the three-level namespace: `catalog.schema.volume`.
- **Managed Volumes**: Databricks governs lifecycle and storage location. Dropping the volume deletes underlying files.
- **External Volumes**: Points to external cloud storage (`s3://...`, `abfss://...`) without moving existing data.
- **Granular RBAC**: Enforce standard SQL permissions:
```sql
-- Create an external volume for landing documents
CREATE VOLUME enterprise_prod.raw_data.invoices
  LOCATION 'abfss://invoices@datalake.dfs.core.windows.net/';

-- Grant read-only access to invoice processing team
GRANT READ VOLUME enterprise_prod.raw_data.invoices TO `finance_reviewers`;
```
- Access via standard POSIX file paths: `/Volumes/enterprise_prod/raw_data/invoices/2024_03.pdf`."""),

        ("databricks-q-011", "Delta Lake Compaction & File Sizing",
         "Why does Delta Lake suffer from the small file problem and how do you resolve it using bin-packing OPTIMIZE?",
         """High-frequency streaming appends and concurrent small batch jobs create thousands of small (10 KB-5 MB) Parquet files. This introduces severe file-listing overhead, degrades columnar compression, and slows down downstream queries.

### Resolution: Bin-Packing OPTIMIZE
The `OPTIMIZE` command coalesces small files into uniform ~1 GB Parquet files without altering table data:
```sql
-- Run bin-packing compaction on an unpartitioned table
OPTIMIZE enterprise_prod.sales.orders;

-- Run targeted compaction on a specific partition
OPTIMIZE enterprise_prod.sales.orders 
WHERE order_date >= current_date() - INTERVAL 7 DAYS;
```
### Automatic Compaction (Auto-Optimize):
```sql
-- Enable automatic write-time compaction in table properties
ALTER TABLE enterprise_prod.sales.orders SET TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true'
);
```
- **`optimizeWrite`**: Dynamically coalesces partitions during the shuffle phase of writes to output ~128 MB files.
- **`autoCompact`**: Runs a lightweight compaction micro-batch immediately following successful commits."""),

        ("databricks-q-012", "Delta Lake VACUUM & Retention Governance",
         "How does the VACUUM command reclaim storage space in Delta Lake, and what are the critical safety considerations?",
         """When a Delta table is updated, merged, or compacted, the superseded Parquet files are not deleted immediately; they remain on disk to allow Time Travel queries and concurrent read snapshots. `VACUUM` physically purges unreferenced historical files.

### Syntax & Mechanics:
```sql
-- Dry run to preview candidate files without deleting
VACUUM enterprise_prod.sales.orders RETAIN 168 HOURS DRY RUN;

-- Physically delete unreferenced files older than 7 days (default safety threshold)
VACUUM enterprise_prod.sales.orders RETAIN 168 HOURS;
```
### Critical Production Considerations:
1. **Safety Check Override (`spark.databricks.delta.vacuum.parallelDelete.enabled`)**:
   - Databricks blocks `VACUUM` with retention periods < 168 hours (7 days) by default. Overriding this check (`SET spark.databricks.delta.vacuum.logging.enabled = false; VACUUM table RETAIN 0 HOURS;`) while concurrent queries are running causes active queries to crash with `FileNotFoundException`.
2. **Object Storage Rate Limiting**:
   - Deleting 500,000 files simultaneously can hit cloud storage API rate limits. Enable parallel delete:
     `spark.conf.set("spark.databricks.delta.vacuum.parallelDelete.enabled", "true")`."""),

        ("databricks-q-013", "PySpark UDFs vs Pandas UDFs (Vectorized)",
         "What is the performance difference between standard Python UDFs and Vectorized Pandas UDFs (Arrow) in PySpark?",
         """Standard Python UDFs represent a major bottleneck in distributed Spark execution due to row-by-row serialization overhead:

### Standard Python UDF (`@udf`):
- **Mechanism**: The Spark JVM serializes each row using Python Pickle, pipes it over IPC socket to a Python worker process, executes row-by-row, and pipes it back to JVM.
- **Impact**: Extreme CPU overhead, JVM-Python IPC thrashing, and disables Spark Catalyst optimizer pushdowns.

### Vectorized Pandas UDF (`@pandas_udf`):
- **Mechanism**: Leverages **Apache Arrow** for zero-copy memory exchange. Data is transferred from JVM to Python in contiguous columnar batches (e.g., 10,000 rows at once).
- **Execution**: Computations utilize vectorized C/NumPy SIMD operations, yielding 10x-100x performance gains.

```python
from pyspark.sql.functions import pandas_udf
import pandas as pd

# Vectorized Series-to-Series calculation
@pandas_udf("double")
def calculate_compound_interest(principal: pd.Series, rate: pd.Series, years: pd.Series) -> pd.Series:
    return principal * (1 + rate) ** years

df_enriched = df.withColumn("future_val", calculate_compound_interest("balance", "interest_rate", "term_years"))
```"""),

        ("databricks-q-014", "Cluster Policies for Enterprise Governance",
         "How do you design Databricks Cluster Policies to enforce cost controls and instance standardization across teams?",
         """Cluster Policies are JSON templates configured by workspace admins that restrict user permissions when provisioning compute resources:

### Key Governance Levers:
- Enforce maximum worker counts to prevent accidental runaway clusters.
- Mandate aggressive auto-termination timeouts (e.g., 15-20 minutes).
- Restrict instance types to cost-effective modern cloud VMs.
- Enforce required billing metadata tags (`CostCenter`, `Project`).

### JSON Policy Definition:
```json
{
  "autotermination_minutes": {
    "type": "range",
    "maxValue": 20,
    "defaultValue": 15,
    "isOptional": false
  },
  "spark_version": {
    "type": "regex",
    "pattern": "14\\.[0-9]\\.x-scala2\\.12",
    "defaultValue": "14.3.x-scala2.12"
  },
  "node_type_id": {
    "type": "allowlist",
    "values": ["Standard_D4ds_v5", "Standard_D8ds_v5"],
    "defaultValue": "Standard_D4ds_v5"
  },
  "autoscale.max_workers": {
    "type": "range",
    "maxValue": 8,
    "defaultValue": 4
  },
  "custom_tags.CostCenter": {
    "type": "regex",
    "pattern": "^FIN-[0-9]{4}$"
  }
}
```"""),

        ("databricks-q-015", "Databricks Repos / Git Folders Integration",
         "How do you configure Databricks Git Folders (Repos) to support modern software development lifecycles (SDLC)?",
         """Databricks Git Folders (formerly Repos) integrates workspace file trees directly with remote Git providers (GitHub, GitLab, Azure DevOps, Bitbucket):

### Key Capabilities:
1. **Branch Isolation**: Each engineer works in their own Git branch within personal folders (`/Workspace/Users/<email>/project_repo`).
2. **Authoring Modular Python Files (`.py`)**: Author reusable modules and packages alongside notebooks; notebooks import Python helper functions seamlessly:
```python
# In notebook: import modular helper from local repository
from src.utils.data_cleansing import remove_outliers
df_clean = remove_outliers(df_raw, "revenue")
```
3. **Automated CI/CD Sync via Repos REST API**:
```bash
# Production deployment: trigger head commit sync on release branch
curl -X PATCH "https://adb-123456789.azuredatabricks.net/api/2.0/repos/1234567890" \
  -H "Authorization: Bearer $DATABRICKS_TOKEN" \
  -d '{"branch": "release/v2.1"}'
```
4. **Hardening**: Set production repo folders to read-only for human developers, allowing updates exclusively through automated CI/CD Service Principals."""),

        ("databricks-q-016", "Databricks Runtime (DBR) Selection Strategy",
         "How do you choose between standard Databricks Runtime (DBR), DBR LTS, and DBR ML for production workloads?",
         """Selecting the appropriate Databricks Runtime (DBR) directly impacts pipeline stability, performance, and maintenance overhead:

1. **DBR LTS (Long Term Support - e.g., DBR 14.3 LTS)**:
   - *Support Lifecycle*: Supported by Databricks for 2 full years with regular backported security patches and bug fixes.
   - *Best For*: Mission-critical enterprise production ETL, batch workflows, and regulatory pipelines where stability and reproducibility outweigh cutting-edge experimental features.
2. **Standard DBR (e.g., DBR 15.1)**:
   - *Support Lifecycle*: Supported for ~6 months.
   - *Best For*: Development exploration and workloads needing the latest Apache Spark enhancements or bleeding-edge cloud connectors.
3. **DBR ML (Machine Learning)**:
   - *Contents*: Pre-installed with optimized GPU drivers (CUDA/cuDNN), PyTorch, TensorFlow, Scikit-Learn, MLflow, Hugging Face transformers, and Horovod.
   - *Best For*: Model training, deep learning, and distributed feature engineering."""),

        ("databricks-q-017", "Databricks Secrets Management & Scopes",
         "How do you securely store and reference API keys and database credentials using Databricks Secret Scopes?",
         """Hardcoding database passwords or cloud access tokens in notebooks or repository files creates severe security vulnerabilities. Databricks Secret Scopes store encrypted credentials:

### Management via CLI:
```bash
# 1. Create a secret scope
databricks secrets create-scope finance_scope

# 2. Add an encrypted secret
databricks secrets put-secret finance_scope sap_db_password
```
### Safe Usage in PySpark Notebooks:
```python
# Retrieve secret at runtime; Databricks automatically masks secrets in logs
db_password = dbutils.secrets.get(scope="finance_scope", key="sap_db_password")

jdbc_url = "jdbc:postgresql://postgres.corp.internal:5432/finance"
df = (
    spark.read.format("jdbc")
    .option("url", jdbc_url)
    .option("dbtable", "ledger")
    .option("user", "etl_service_account")
    .option("password", db_password)
    .load()
)
```
### Production Hardening:
- On Azure, back Secret Scopes directly by **Azure Key Vault**; on AWS, integrate with AWS Secrets Manager or KMS. Secrets update centrally without requiring changes in Databricks."""),

        ("databricks-q-018", "Dynamic Partition Pruning in Databricks Spark",
         "How does Dynamic Partition Pruning (DPP) optimize star-schema join queries in Databricks?",
         """In star-schema data warehousing, fact tables (billions of rows partitioned by date) are joined with dimension tables (thousands of rows, e.g., filtering `region = 'EMEA'`):

### How DPP Operates:
1. **Classical Execution**: Without DPP, the engine would have to scan the *entire* partitioned fact table before joining with the filtered dimension rows.
2. **Dynamic Pruning**:
   - The query planner executes the small dimension filter first (`region = 'EMEA'`), collecting the set of matching `date_id` keys into a dynamic broadcast filter.
   - Spark passes this dynamic set of keys directly down into the fact table scan operator.
   - The fact table reader prunes and skips hundreds of non-matching date partitions at the storage layer *before* data is read into memory.
3. **Enabling Configuration**:
```sql
SET spark.sql.optimizer.dynamicPartitionPruning.enabled = true;
```
4. **Production Impact**: Reduces I/O scan volumes on massive fact tables by 90-99%, converting multi-minute join queries into sub-second scans."""),

        ("databricks-q-019", "Delta Lake Generated Columns",
         "How do you use Delta Lake Generated Columns to automate partition key generation and enable query pruning?",
         """Generated Columns calculate values automatically from other columns in the same table, enforcing derivation consistency and accelerating partition pruning:

### DDL Implementation:
```sql
CREATE TABLE enterprise_prod.telemetry.events (
    event_id STRING,
    event_timestamp TIMESTAMP,
    event_type STRING,
    payload STRING,
    -- Automatically generated date column for partitioning
    event_date DATE GENERATED ALWAYS AS (CAST(event_timestamp AS DATE))
)
USING DELTA
PARTITIONED BY (event_date);
```
### Query Pruning Benefit:
- When an analyst queries using the original timestamp:
```sql
SELECT * FROM enterprise_prod.telemetry.events 
WHERE event_timestamp >= '2024-03-01 00:00:00' AND event_timestamp < '2024-03-02 00:00:00';
```
- Delta Lake automatically recognizes the generation relationship, derives the predicate `event_date = '2024-03-01'`, and prunes all other daily partitions without requiring the analyst to know the partitioning schema!"""),

        ("databricks-q-020", "Databricks REST API Automation",
         "How do you trigger and monitor Databricks Jobs programmatically using the Databricks Jobs REST API 2.1?",
         """Automating Databricks from external enterprise CI/CD runners or microservices is performed via the Jobs REST API 2.1:

### API Request Workflow (cURL / Python):
```python
import requests
import os
import time

DATABRICKS_HOST = "https://adb-123456789.azuredatabricks.net"
TOKEN = os.environ["DATABRICKS_TOKEN"]
headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

# 1. Trigger Job Run
job_id = 987654321
trigger_url = f"{DATABRICKS_HOST}/api/2.1/jobs/run-now"
payload = {
    "job_id": job_id,
    "notebook_params": {"batch_id": "BATCH_2024_03"}
}

resp = requests.post(trigger_url, json=payload, headers=headers)
run_id = resp.json()["run_id"]
print(f"Triggered run: {run_id}")

# 2. Poll Execution Status
status_url = f"{DATABRICKS_HOST}/api/2.1/jobs/runs/get?run_id={run_id}"
while True:
    run_info = requests.get(status_url, headers=headers).json()
    life_cycle_state = run_info["state"]["life_cycle_state"]
    print(f"Current State: {life_cycle_state}")
    
    if life_cycle_state in ["TERMINATED", "SKIPPED", "INTERNAL_ERROR"]:
        result_state = run_info["state"].get("result_state")
        print(f"Run Finished with result: {result_state}")
        break
    time.sleep(15)
```"""),

        ("databricks-q-021", "Databricks CLI v0.200+ Authentication",
         "How do you authenticate and manage Databricks environments using the modern Databricks CLI?",
         """The modern Databricks CLI (v0.200+) replaces legacy Python CLI tools with a high-performance Go binary supporting OAuth 2.0 and Databricks Asset Bundles (DABs):

### Authentication Configurations (`~/.databrickscfg`):
1. **Interactive Developer Setup (OAuth U2M - User to Machine)**:
```bash
# Initiates browser-based OAuth login
databricks auth login --host https://adb-123456789.azuredatabricks.net
```
2. **Automated CI/CD Pipeline Setup (OAuth M2M - Machine to Machine)**:
```ini
# ~/.databrickscfg
[prod_service_principal]
host = https://adb-prod.azuredatabricks.net
client_id = 7b8431c1-45f8-4b2a-874e-6e54c0e6f982
client_secret = {{env/DATABRICKS_CLIENT_SECRET}}
```
3. **Core CLI Operations**:
```bash
# Validate workspace assets
databricks bundle validate -t prod

# Inspect Unity Catalog schemas
databricks schemas list enterprise_prod
```
4. **Security Principle**: Avoid personal access tokens (PATs) in CI/CD; OAuth M2M tokens rotate automatically and expire in 1 hour."""),

        ("databricks-q-022", "Delta Lake Identity Columns & Primary Keys",
         "How do you implement auto-incrementing surrogate primary keys using Delta Lake IDENTITY columns?",
         """Delta Lake supports `IDENTITY` columns to generate monotonically increasing unique surrogate keys natively during inserts, eliminating the need for expensive window functions (`row_number()`) or manual max-ID lookups:

### DDL Implementation:
```sql
CREATE TABLE enterprise_prod.crm.dim_customers (
    -- Auto-incrementing surrogate primary key starting at 1, incrementing by 1
    customer_sk BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    customer_business_id STRING NOT NULL,
    customer_name STRING,
    created_at TIMESTAMP
)
USING DELTA;

-- Inserts omit the identity column; Delta populates it automatically
INSERT INTO enterprise_prod.crm.dim_customers (customer_business_id, customer_name, created_at)
VALUES 
  ('CUST-1001', 'Acme Logistics', current_timestamp()),
  ('CUST-1002', 'Global Tech', current_timestamp());
```
### Mechanics & Considerations:
- Generated keys are guaranteed to be unique.
- In distributed environments, identity values may contain gaps if transactions are aborted or rolled back, which is standard for high-performance surrogate keys."""),

        ("databricks-q-023", "Delta Lake Shallow Clone vs Deep Clone",
         "What is the operational difference between Delta Lake Shallow Clone and Deep Clone, and when should you use each?",
         """Delta Lake table cloning creates copies of existing tables with distinct operational characteristics:

### Shallow Clone (`SHALLOW CLONE`):
- **Mechanism**: Copies only the metadata transaction log; does **not** copy underlying Parquet data files. The new table references the original physical files.
- **Speed & Cost**: Instantaneous (sub-second) and zero additional storage cost.
- **Use Cases**: Ephemeral testing, staging validation in CI/CD, and data science experimentation.
- **Risk**: If the source table runs `VACUUM` and deletes underlying Parquet files, shallow clone queries fail.

### Deep Clone (`DEEP CLONE`):
- **Mechanism**: Copies both metadata and all physical Parquet data files to the target storage container.
- **Speed & Cost**: Slower (proportional to data volume); incurs full storage costs.
- **Use Cases**: Multi-region Disaster Recovery (DR), migrating data between storage accounts, and sharing immutable historical audit archives.

```sql
-- Testing clone: fast and zero-copy
CREATE TABLE sandbox.test_orders SHALLOW CLONE enterprise_prod.sales.orders;

-- Disaster recovery sync: full data copy
CREATE OR REPLACE TABLE dr_lake.sales.orders DEEP CLONE enterprise_prod.sales.orders;
```"""),

        ("databricks-q-024", "Unity Catalog Information Schema Auditing",
         "How do you query `information_schema` in Unity Catalog to audit data assets, table privileges, and storage sizes?",
         """Unity Catalog exposes ANSI-standard `information_schema` views within every catalog to query metadata, permissions, and table configurations:

### Auditing Queries:
1. **Audit Tables Missing Liquid Clustering or Partitioning**:
```sql
SELECT 
    table_schema,
    table_name,
    table_type
FROM enterprise_prod.information_schema.tables
WHERE table_type = 'MANAGED'
ORDER BY table_schema, table_name;
```
2. **Audit User Access Privileges**:
```sql
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM enterprise_prod.information_schema.table_privileges
WHERE table_schema = 'finance'
ORDER BY grantee, table_name;
```
3. **Audit Column Data Types for Sensitive PII**:
```sql
SELECT 
    table_name,
    column_name,
    data_type
FROM enterprise_prod.information_schema.columns
WHERE column_name ILIKE '%ssn%' 
   OR column_name ILIKE '%credit_card%';
```"""),

        ("databricks-q-025", "Databricks Spark UI Bottleneck Diagnosis",
         "How do you use the Spark UI in Databricks to diagnose data skew, GC pauses, and straggler tasks?",
         """The Spark UI is the primary diagnostic console for identifying distributed processing bottlenecks:

### Key Spark UI Tabs & Diagnostics:
1. **Jobs / Stages Tab (Detecting Data Skew & Stragglers)**:
   - Inspect the Task Duration histogram. If 199 tasks finish in 5 seconds but 1 task runs for 45 minutes, you have severe **data skew**.
   - Inspect the "Shuffle Read Size / Records" column: the straggler task is processing 10x-100x more data than peer tasks due to a skewed join/grouping key.
2. **Executors Tab (Garbage Collection & Memory Spills)**:
   - Check the **Task Time (GC Time)** column. If GC time represents >15% of total task time, executors are starved for JVM heap memory.
   - Check **Spill (Memory)** and **Spill (Disk)**: indicates that partitions exceeded executor memory and spilled to local worker NVMe disks.
3. **Storage Tab**:
   - Verifies whether cached DataFrames (`df.cache()`) fit entirely within memory or spilled to disk.
4. **Remediation**:
   - Enable Adaptive Query Execution (AQE): `spark.sql.adaptive.skewJoin.enabled = true`.
   - Salt skewed join keys or adjust partition counts via `repartition()`."""),
    ]

    for qid, niche, q_text, ans in easy_data:
        items[qid] = {
            "id": qid,
            "source": "Questions DB",
            "category": "Databricks",
            "niche": niche,
            "difficulty": "EASY",
            "question": q_text,
            "answer": ans,
            "domain": "Data Engineering",
            "subdomain": "Lakehouse Architecture"
        }

    # MEDIUM: 026 - 050
    medium_data = [
        ("databricks-q-026", "Databricks Photon Engine Acceleration",
         "What is the Photon engine in Databricks and how does it accelerate SQL and DataFrame transformations?",
         """Photon is Databricks' vectorized query engine rewritten from scratch in modern C++ to execute directly on native hardware architecture:

### Architectural Innovations:
1. **Vectorized Instruction Execution (SIMD)**:
   - Processes data in columnar batches (vectors) using CPU Single Instruction, Multiple Data (SIMD) registers, operating on multiple data values in a single CPU cycle.
2. **Elimination of JVM Bottlenecks**:
   - Traditional Spark runs on Java Virtual Machines (JVM), suffering from bytecode interpretation overhead, CPU cache misses, and Garbage Collection (GC) pauses. Photon bypasses the JVM entirely for scan, filter, join, and aggregation kernels.
3. **Unified Memory Management**:
   - Manages off-heap memory natively, eliminating JVM object serialization and memory amplification.

### Enabling Photon & Verification:
- Enable via cluster configuration checkbox or policy: `runtime_engine = "PHOTON"`.
- In the Spark UI DAG visualization, standard operators (`SortMergeJoin`, `HashAggregate`) are replaced by Photon equivalents (`PhotonSortMergeJoin`, `PhotonGroupingAgg`).
- Delivers 2x-5x performance acceleration for SQL Warehouses and PySpark DataFrame queries containing heavy arithmetic, strings, and joins."""),

        ("databricks-q-027", "Delta Live Tables (DLT) Expectations & Quality",
         "How do you define, monitor, and enforce data quality rules using Delta Live Tables (DLT) Expectations?",
         """Delta Live Tables (DLT) integrates declarative data quality validation natively into pipeline execution via Expectations:

### Three Enforcement Modes:
1. **`expect` (Warn / Track)**: Records violating rows in pipeline event metrics but allows rows to pass through.
2. **`expect_or_drop` (Filter)**: Silently drops violating rows from the target table.
3. **`expect_or_fail` (Halt)**: Immediately halts the pipeline if a single row violates the condition.

### Python DLT Implementation:
```python
import dlt
from pyspark.sql.functions import col

@dlt.table(
    comment="Cleaned orders table with quality enforcement",
    table_properties={"quality": "silver"}
)
@dlt.expect("valid_order_date", "order_date <= current_date()")
@dlt.expect_or_drop("valid_order_id", "order_id IS NOT NULL")
@dlt.expect_or_fail("positive_amount", "total_amount > 0")
def orders_silver():
    return (
        dlt.read_stream("orders_bronze")
        .filter(col("status") != "ABORTED")
    )
```
### Quality Observability:
- DLT visualizes pass/fail counts in the pipeline UI and logs metrics to the DLT Event Log, queryable via SQL for SLA tracking."""),

        ("databricks-q-028", "Delta Lake Liquid Clustering Mechanics",
         "How does Delta Lake Liquid Clustering dynamically co-locate data and simplify physical table layout tuning?",
         """Liquid Clustering replaces legacy Hive-style directory partitioning and Z-Ordering with dynamic, flexible Hilbert-curve data clustering:

### Core Benefits:
1. **Mutable Clustering Keys**: In legacy partitioning, changing partition columns required full table rewrites. With Liquid Clustering, change keys on the fly via `ALTER TABLE ... CLUSTER BY (...)` without rewriting existing data.
2. **Incremental Clustering**: Only newly appended or unclustered data files are clustered during `OPTIMIZE`, reducing maintenance compute spend by up to 70%.
3. **Eliminates Over-Partitioning**: Avoids tiny file fragmentation caused by fine-grained date/hour partitioning.

### Implementation:
```sql
-- Create table clustered by tenant and event timestamp
CREATE TABLE enterprise_prod.telemetry.events (
    tenant_id STRING,
    event_timestamp TIMESTAMP,
    device_id STRING,
    payload STRING
)
USING DELTA
CLUSTER BY (tenant_id, event_timestamp);

-- Run incremental compaction and clustering
OPTIMIZE enterprise_prod.telemetry.events;
```
### Golden Rule: Choose 1 to 4 frequently queried filter columns with high cardinality."""),

        ("databricks-q-029", "Structured Streaming Watermarks & Late Data",
         "How do watermarks in Databricks Structured Streaming handle out-of-order event streams and prune state stores?",
         """In real-time streaming, network latency and device disconnections cause events to arrive out of order. A watermark defines how long the engine waits for late arrivals before finalizing windowed state:

### Mechanics & Rule:
`Watermark = max(event_time_seen) - allowed_lateness_delay`
- Any incoming record whose timestamp is earlier than the current watermark is dropped as too late.
- State older than the watermark is purged from RocksDB/JVM state stores, preventing unbounded memory bloat.

### PySpark Implementation:
```python
from pyspark.sql.functions import col, window

stream_df = (
    spark.readStream
    .table("enterprise_prod.bronze.iot_readings")
    # Define 10-minute allowed lateness delay on event_timestamp
    .withWatermark("event_timestamp", "10 minutes")
    .groupBy(
        window("event_timestamp", "5 minutes", "1 minute"),
        col("device_type")
    )
    .count()
)

query = (
    stream_df.writeStream
    .format("delta")
    .outputMode("append") # Append mode emits only finalized windows older than watermark
    .option("checkpointLocation", "abfss://checkpoints@lake.dfs.core.windows.net/iot_agg")
    .toTable("enterprise_prod.silver.iot_windowed_counts")
)
```"""),

        ("databricks-q-030", "Adaptive Query Execution (AQE) Tuning",
         "How does Adaptive Query Execution (AQE) optimize Spark execution plans dynamically at runtime?",
         """Adaptive Query Execution (AQE) re-optimizes physical query plans at runtime based on actual runtime statistics gathered during intermediate shuffle stages:

### Three Core AQE Optimizations:
1. **Dynamically Coalescing Shuffle Partitions**:
   - Instead of using a fixed static partition count (`spark.sql.shuffle.partitions = 200`), AQE inspects shuffle stage file sizes and coalesces small adjacent partitions into target sizes (default 64 MB).
2. **Dynamically Converting Sort-Merge Join to Broadcast Join**:
   - If one side of a join evaluates to smaller than `autoBroadcastJoinThreshold` after filtering, AQE dynamically switches the planned Sort-Merge Join to a lightning-fast Broadcast Hash Join without disk spilling.
3. **Dynamically Handling Skew Joins**:
   - If AQE detects that a specific partition is 5x larger than the median, it splits the skewed partition into smaller sub-partitions and duplicates matching rows on the join side.

```sql
-- Recommended production AQE settings
SET spark.sql.adaptive.enabled = true;
SET spark.sql.adaptive.coalescePartitions.enabled = true;
SET spark.sql.adaptive.skewJoin.enabled = true;
SET spark.sql.adaptive.advisoryPartitionSizeInBytes = 67108864; -- 64 MB
```"""),

        ("databricks-q-031", "Delta Lake Change Data Feed (CDF)",
         "How do you enable and consume row-level change events from Delta Lake Change Data Feed (CDF)?",
         """Delta Lake Change Data Feed (CDF) tracks row-level changes (inserts, updates, deletes) committed to a Delta table, allowing downstream pipelines to consume incremental modifications efficiently:

### Enabling CDF:
```sql
-- Enable CDF on a new or existing table
ALTER TABLE enterprise_prod.crm.accounts 
SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true');
```
### Consuming Changes via SQL:
```sql
-- Query row-level CDC stream between commit versions
SELECT 
    account_id,
    tier,
    _change_type,      -- 'insert', 'update_preimage', 'update_postimage', 'delete'
    _commit_version,
    _commit_timestamp
FROM table_changes('enterprise_prod.crm.accounts', 10, 15);
```
### Streaming Incremental Changes (PySpark):
```python
cdf_stream = (
    spark.readStream
    .format("delta")
    .option("readChangeFeed", "true")
    .option("startingVersion", 10)
    .table("enterprise_prod.crm.accounts")
)
```
### Use Case: Eliminates expensive full-table diffs when replicating lakehouse tables to external Elasticsearch, CRM, or data warehouse targets."""),

        ("databricks-q-032", "Delta Lake Deletion Vectors Mechanics",
         "How do Delta Lake Deletion Vectors achieve soft deletes without rewriting entire Parquet files?",
         """In classical Delta Lake Copy-On-Write, updating or deleting a single row in a 500 MB Parquet file required reading the entire file, removing the row, and writing a new 500 MB file to storage (heavy write amplification).

### Deletion Vectors Mechanics:
- When a row is deleted or updated, Delta Lake writes a lightweight **Deletion Vector** file (using compressed Roaring Bitmaps).
- The vector contains the relative row index positions of deleted rows within the original Parquet file.
- **Write Speed**: Completes in milliseconds; zero Parquet data files are rewritten.
- **Read Resolution**: Query engines read the original Parquet file and skip rows marked in the deletion vector.

### Enabling Deletion Vectors:
```sql
ALTER TABLE enterprise_prod.sales.orders 
SET TBLPROPERTIES ('delta.enableDeletionVectors' = 'true');
```
### Compaction:
- Background `OPTIMIZE` bin-packing merges deletion vectors into fresh Parquet files during scheduled maintenance windows, keeping read scans fast."""),

        ("databricks-q-033", "Databricks Serverless Compute Architecture",
         "How does Databricks Serverless Compute work under the hood and what are its performance and cost advantages?",
         """Databricks Serverless Compute decouples cluster execution from customer cloud VPCs, moving compute infrastructure into a secure, managed serverless fleet operated by Databricks:

### Architectural Mechanics:
1. **Instant On (<5 Seconds)**:
   - Maintains warm pools of compute instances. Notebooks and SQL queries attach and execute in seconds, eliminating 3-5 minute VM startup times.
2. **Container Isolation & Security**:
   - Each customer workload executes in a dedicated, hardened container sandbox isolated at the hypervisor level with transient credentials.
3. **Fine-Grained Usage-Based Billing**:
   - Compute is billed strictly per second of active query execution. Clusters auto-suspend immediately upon query completion, eliminating idle driver VM costs.
4. **Autonomous Tuning**:
   - Databricks dynamically optimizes CPU, memory, and disk cache sizes based on real-time query demands without manual cluster sizing configuration."""),

        ("databricks-q-034", "Unity Catalog Managed vs External Tables",
         "What is the difference between Managed Tables and External Tables in Databricks Unity Catalog?",
         """Unity Catalog governs both Managed and External tables, but their storage lifecycle and file management differ fundamentally:

### Managed Tables:
- **Storage Location**: Stored in the default storage root assigned to the catalog or schema (`abfss://...` or `s3://...`).
- **Lifecycle Governance**: Databricks manages both metadata and underlying physical data files.
- **Dropping Table**: Executing `DROP TABLE catalog.schema.table` permanently deletes both the catalog metadata **and all underlying Parquet data files** from cloud storage.
- **Best For**: Native lakehouse tables created and maintained entirely within Databricks.

### External Tables:
- **Storage Location**: Explicitly points to an unmanaged cloud storage URI:
```sql
CREATE TABLE enterprise_prod.sales.external_orders
LOCATION 's3://partner-data-bucket/sales/orders'
AS SELECT * FROM staging_orders;
```
- **Lifecycle Governance**: Databricks manages only the metadata registration.
- **Dropping Table**: Executing `DROP TABLE` removes the table from Unity Catalog, but **leaves all underlying physical cloud storage files 100% intact**.
- **Best For**: Data shared with external legacy tools, cross-platform storage, or regulatory datasets requiring persistent cloud retention."""),

        ("databricks-q-035", "Databricks Lakehouse Monitoring & Profiling",
         "How do you configure Lakehouse Monitoring in Unity Catalog to track data quality, schema drift, and statistical distributions?",
         """Lakehouse Monitoring provides automated profiling, data quality tracking, and statistical drift analysis directly on Unity Catalog tables without third-party agents:

### SQL Configuration:
```sql
-- Attach automated monitor to orders table with daily time-window profiling
CREATE MONITOR enterprise_prod.sales.orders_quality_monitor
  ON TABLE enterprise_prod.sales.orders
  USING PROFILE TIME_SERIES (
    timestamp_col => 'order_timestamp',
    window_sizes => ('1 day')
  )
  SCHEDULE CRON '0 0 2 * * ?' -- Run daily at 2 AM
  COMMENT 'Daily quality and distribution profile';
```
### Metric Generation:
The monitor automatically computes and populates two governed system tables:
- `orders_quality_monitor_profile_metrics`: Row counts, null counts, min/max/mean/quantiles, and distinct values per column per day.
- `orders_quality_monitor_drift_metrics`: Population stability index (PSI) and Wasserstein distance comparing live distributions against historical baselines.
- Generates out-of-the-box Databricks SQL dashboards for data drift visualization."""),

        ("databricks-q-036", "Databricks Spark Broadcast Joins vs Shuffle Hash Joins",
         "When should you use a Broadcast Hash Join versus a Shuffle Hash Join in PySpark, and what are the OOM risks?",
         """Join strategies govern how distributed Spark executors match records across worker nodes:

### Broadcast Hash Join (BHJ):
- **Mechanism**: The driver collects the smaller table and broadcasts a full copy to every executor over the network. Each executor performs a local in-memory hash join.
- **Advantage**: Zero network shuffle of the large table; delivers orders-of-magnitude faster performance.
- **Threshold**: Controlled by `spark.sql.autoBroadcastJoinThreshold` (default 10 MB) or explicit hint:
```python
from pyspark.sql.functions import broadcast
df_joined = df_large_fact.join(broadcast(df_small_dim), "customer_id")
```
- **Driver OOM Risk**: If the broadcasted table is larger than expected (e.g., 2 GB), collecting it onto the Spark Driver crashes the driver with `java.lang.OutOfMemoryError: Java heap space`.

### Shuffle Hash / Sort-Merge Join:
- **Mechanism**: Both tables are hashed and shuffled across the network so matching join keys land on the same executor partition.
- **Best For**: Joining two large multi-gigabyte/terabyte tables where neither fits safely into executor memory."""),

        ("databricks-q-037", "Databricks Model Registry in Unity Catalog",
         "How do you manage machine learning model lifecycles and deployment aliases using Unity Catalog Model Registry?",
         """Unity Catalog unifies ML model governance alongside tables in the three-level namespace (`catalog.schema.model_name`):

### Model Lifecycle & Aliases Workflow:
```python
import mlflow
from mlflow import MlflowClient

# 1. Direct registry to Unity Catalog
mlflow.set_registry_uri("databricks-uc")
client = MlflowClient()

model_name = "enterprise_prod.ml_models.churn_classifier"

# 2. Register trained model version
result = mlflow.register_model(
    model_uri=f"runs:/{run_id}/model",
    name=model_name
)

# 3. Assign deployment aliases (Modern replacement for legacy stages)
# Tag version 3 as Champion for production serving
client.set_registered_model_alias(
    name=model_name,
    alias="Champion",
    version=3
)

# Tag version 4 as Challenger for shadow testing
client.set_registered_model_alias(
    name=model_name,
    alias="Challenger",
    version=4
)
```
### Serving Endpoint Integration:
- Databricks Model Serving references the model via URI: `models:/enterprise_prod.ml_models.churn_classifier@Champion`. Moving the alias dynamically updates the live endpoint with zero downtime."""),

        ("databricks-q-038", "Databricks Auto-Scaling Clusters & Min/Max Worker Sizing",
         "How does Databricks cluster auto-scaling determine when to scale up or down, and how do you size worker boundaries?",
         """Databricks auto-scaling dynamically adjusts worker node counts between `min_workers` and `max_workers` based on active Spark stage metrics:

### Auto-Scaling Mechanics:
- **Scale-Up**: If Spark stages have queued tasks waiting for executor cores, the cluster manager requests additional VM instances from the cloud provider.
- **Aggressive Scale-Up**: If task backlogs are severe, the cluster scales up aggressively in exponential batches.
- **Scale-Down**: When worker nodes sit idle with zero active tasks for consecutive evaluation intervals, Databricks decommissions workers gracefully without losing cached shuffle files.

### Sizing Best Practices:
1. **Never Set Min Workers to 0 on Classic Clusters**: Setting `min_workers: 0` causes the driver to run solo, stalling stage planning while waiting for workers to boot.
2. **Standard Sizing Ratio**:
   - Interactive Dev: `min: 1, max: 4`.
   - Variable ETL Pipeline: `min: 4, max: 32`.
3. **Spot Instance Integration**: Configure worker nodes to use 100% Spot/Preemptible VMs with the driver set to On-Demand for maximum cost savings."""),

        ("databricks-q-039", "Databricks SQL Query Watchdogs & Query Timeouts",
         "How do you enforce query timeouts and guardrails in Databricks SQL to prevent runaway cross-joins?",
         """In high-concurrency BI environments, poorly written ad-hoc queries (e.g., unintended Cartesian products `SELECT * FROM fact, dim`) can lock cluster resources and spike cloud spend.

### Enforcement Guardrails:
1. **Query Watchdog**:
   - Built into Databricks SQL Warehouses. Inspects query plans and terminates queries that exceed safety thresholds before they exhaust cluster memory:
```sql
-- Admin warehouse parameters
SET statement_timeout = 600000; -- Hard timeout: 10 minutes (600,000 ms)
```
2. **Row Limit Enforcement**:
   - Automatically truncates returned query results in the SQL UI to maximum 100,000 rows to prevent browser crashes.
3. **Query Profile Analysis**:
   - Inspect the graphical Query Profile in the DBSQL console to view the exact node where data exploded (e.g., `BroadcastNestedLoopJoin` outputting 50 billion rows from an un-indexed join condition)."""),

        ("databricks-q-040", "Delta Lake Table Constraints & Checks",
         "How do you enforce NOT NULL and CHECK constraints natively on Delta Lake tables?",
         """Delta Lake supports ANSI SQL `NOT NULL` and `CHECK` constraints to reject invalid or corrupted records at commit time:

### DDL Implementation:
```sql
CREATE TABLE enterprise_prod.sales.invoices (
    invoice_id STRING NOT NULL,
    customer_id STRING NOT NULL,
    amount DECIMAL(10, 2),
    tax_rate DECIMAL(4, 2),
    status STRING
) USING DELTA;

-- Add CHECK constraints
ALTER TABLE enterprise_prod.sales.invoices 
  ADD CONSTRAINT valid_amount CHECK (amount >= 0.0);

ALTER TABLE enterprise_prod.sales.invoices 
  ADD CONSTRAINT valid_status CHECK (status IN ('draft', 'sent', 'paid', 'void'));
```
### Enforcement Mechanics:
- When an insert, update, or merge operation attempts to write an invalid record (e.g., `amount = -50.00`), Delta Lake **aborts the transaction immediately** and raises an `InvariantViolationException`.
- Guarantees zero invalid records reach downstream analytical tables."""),

        ("databricks-q-041", "Databricks Feature Store in Unity Catalog",
         "How do you publish and consume governed feature tables using Databricks Feature Store with Unity Catalog?",
         """Unity Catalog serves as a centralized, governed Feature Store (`catalog.schema.feature_table`), providing automated column-level lineage and point-in-time time travel for ML training and online inference:

### Python Implementation:
```python
from databricks.feature_engineering import FeatureEngineeringClient

fe = FeatureEngineeringClient()

# 1. Create or register a feature table with primary keys
fe.create_table(
    name="enterprise_prod.features.customer_30d_metrics",
    primary_keys=["customer_id"],
    df=customer_metrics_df,
    description="30-day rolling transaction counts and average order value"
)

# 2. Point-in-time feature lookup for training dataset generation
from databricks.feature_engineering import FeatureLookup

feature_lookups = [
    FeatureLookup(
        table_name="enterprise_prod.features.customer_30d_metrics",
        feature_names=["avg_order_value_30d", "tx_count_30d"],
        lookup_key="customer_id"
    )
]

training_set = fe.create_training_set(
    df=raw_observation_df,
    feature_lookups=feature_lookups,
    label="churned",
    exclude_columns=["customer_id"]
)
training_df = training_set.load_df()
```"""),

        ("databricks-q-042", "PySpark Repartition vs Coalesce Tuning",
         "What is the operational difference between `repartition()` and `coalesce()` in PySpark, and when should each be used?",
         """Managing DataFrame partition counts controls parallelism and prevents small-file fragmentation:

### `coalesce(num_partitions)`:
- **Mechanism**: Reduces the number of partitions by collapsing existing partitions locally on worker nodes **without a full network shuffle**.
- **Advantage**: Highly efficient and fast because data is not shuffled across the network.
- **Constraint**: Can *only* decrease partition count, never increase it. Can introduce partition size skew if data distribution is unbalanced.
- **Best Use Case**: Shrinking 100 partitions down to 5 partitions immediately prior to writing to cloud storage: `df.coalesce(5).write.parquet(...)`.

### `repartition(num_partitions, *cols)`:
- **Mechanism**: Performs a **full network shuffle**, redistributing data evenly across the cluster.
- **Capabilities**: Can increase or decrease partition counts. When passed partition columns (`df.repartition(10, "country")`), it groups identical keys into the same partition.
- **Best Use Case**: Increasing parallelism when processing massive datasets, or balancing data evenly after heavy filtering operations."""),

        ("databricks-q-043", "Databricks Delta Sharing Provider & Recipient",
         "How do you share live Delta tables with external non-Databricks consumers using the Delta Sharing open protocol?",
         """Delta Sharing is an open standard that allows secure data sharing from Unity Catalog to external recipients on Power BI, Snowflake, pandas, or Apache Spark zero-copy:

### Provider Setup (SQL):
```sql
-- 1. Create a Share
CREATE SHARE partner_b2b_share;

-- 2. Add table to share with optional partition filtering
ALTER SHARE partner_b2b_share ADD TABLE enterprise_prod.analytics.daily_kpis
  AS kpi_metrics
  COMMENT 'Daily company-wide aggregated KPIs';

-- 3. Create an external recipient with token activation link
CREATE RECIPIENT acme_logistics;
GRANT SELECT ON SHARE partner_b2b_share TO RECIPIENT acme_logistics;

-- 4. Retrieve credential activation URL
DESCRIBE RECIPIENT acme_logistics;
```
### Recipient Consumption (Python):
```python
import delta_sharing

client = delta_sharing.SharingClient("config.share")
# Reads directly from provider's S3/ADLS bucket via temporary presigned URLs
df = delta_sharing.load_as_pandas("config.share#partner_b2b_share.kpi_metrics")
```"""),

        ("databricks-q-044", "Databricks Lakehouse Federation Basics",
         "How do you query external operational databases (PostgreSQL, Snowflake) directly from Databricks using Lakehouse Federation?",
         """Lakehouse Federation enables Unity Catalog to query external databases in-place without copying data into the data lake, pushing SQL predicates down to remote database engines:

### SQL Configuration:
```sql
-- 1. Create connection to external PostgreSQL database
CREATE CONNECTION postgres_crm_conn
TYPE POSTGRESQL
OPTIONS (
  host 'postgres.internal.corp:5432',
  port '5432',
  user 'read_analyst',
  password secret('crm_scope', 'pg_password')
);

-- 2. Register foreign catalog in Unity Catalog
CREATE FOREIGN CATALOG crm_live
USING CONNECTION postgres_crm_conn
OPTIONS (database 'crm_production');

-- 3. Cross-platform join: live PostgreSQL CRM joined with Delta Lake orders!
SELECT 
    o.order_id,
    c.company_name,
    o.total_amount_usd
FROM enterprise_prod.sales.orders o
JOIN crm_live.public.customers c ON o.customer_id = c.id
WHERE o.order_date >= '2024-03-01';
```"""),

        ("databricks-q-045", "Databricks DBUtils API Suite",
         "What are the most essential utilities in `dbutils` (fs, secrets, notebook, widgets) and how are they used?",
         """The Databricks Utilities (`dbutils`) module provides essential interfaces for interacting with the Databricks ecosystem programmatically:

### Core Utility Modules:
1. **`dbutils.fs` (File System)**:
   - Manipulates files on DBFS and cloud storage:
```python
dbutils.fs.ls("/Volumes/enterprise_prod/raw_data/inbox/")
dbutils.fs.cp("source.csv", "destination.csv")
dbutils.fs.rm("/path/to/scratch", recurse=True)
```
2. **`dbutils.secrets` (Secrets)**:
   - Fetches masked credentials:
```python
api_key = dbutils.secrets.get(scope="marketing", key="mailchimp_token")
```
3. **`dbutils.notebook` (Workflow Orchestration)**:
   - Executes child notebooks and exits with return payloads:
```python
dbutils.notebook.run("child_notebook", timeout_seconds=600, arguments={"batch": "01"})
dbutils.notebook.exit("Processing Complete")
```
4. **`dbutils.widgets` (Interactive Parameters)**:
   - Renders UI input controls for notebooks:
```python
dbutils.widgets.text("date_param", "2024-03-01")
```"""),

        ("databricks-q-046", "Databricks Photon vs Spark Vectorized Reader",
         "How does Photon achieve faster disk and network scans compared to the standard Spark Vectorized Parquet Reader?",
         """Both engines read Parquet in columnar formats, but Photon optimizes low-level hardware utilization:

### Architectural Differences:
1. **Columnar SIMD Decompression**:
   - The standard Spark Parquet reader runs Java/JNI bindings for Snappy/Zstd decompression. Photon uses hand-tuned C++ SIMD routines that decompress Parquet pages directly into native CPU registers.
2. **Zero-Copy Memory Layout**:
   - Spark Vectorized Reader converts Parquet batches into Java `ColumnarBatch` objects, incurring JVM garbage collection overhead. Photon operates directly on raw C++ memory buffers with zero copy.
3. **Filter Pushdown Evaluation**:
   - Photon evaluates SQL filter predicates directly on compressed Parquet dictionaries *before* decoding the column values. If a dictionary value doesn't match the WHERE clause, the entire data page is skipped without decompression!"""),

        ("databricks-q-047", "Delta Lake Table Optimize Write vs Auto Compact",
         "What is the difference between `autoOptimize.optimizeWrite` and `autoOptimize.autoCompact` in Delta Lake?",
         """Both properties mitigate the small file problem during data ingestion, but operate at different stages of the write pipeline:

### `delta.autoOptimize.optimizeWrite`:
- **When It Runs**: *During* the active write operation, before data files are committed to disk.
- **Mechanism**: Dynamically calculates optimal partition counts and introduces an internal shuffle to ensure each worker writes ~128 MB Parquet files instead of hundreds of tiny files.
- **Impact**: Increases write compute time slightly, but produces optimally sized files immediately.

### `delta.autoOptimize.autoCompact`:
- **When It Runs**: *Immediately after* a write transaction successfully commits.
- **Mechanism**: Inspects the newly written files. If many files are smaller than 128 MB, it launches a fast synchronous compaction micro-batch to merge them into larger files.
- **Impact**: Adds a small post-commit delay to streaming micro-batches."""),

        ("databricks-q-048", "Databricks Dynamic Views for Data Masking",
         "How do you implement Dynamic Views in Databricks to mask sensitive data based on user group membership?",
         """Before Unity Catalog's native column masking functions, Dynamic Views provided role-based column masking and row filtering using built-in session functions:

### SQL Implementation:
```sql
CREATE OR REPLACE VIEW enterprise_prod.hr.vw_employee_salaries AS
SELECT 
    employee_id,
    department,
    -- Column masking: show real salary to HR admins, mask for everyone else
    CASE 
      WHEN is_account_group_member('hr_directors') THEN base_salary
      ELSE 0.00
    END AS base_salary,
    -- Column masking: mask SSN
    CASE 
      WHEN is_account_group_member('hr_directors') THEN ssn
      ELSE CONCAT('XXX-XX-', RIGHT(ssn, 4))
    END AS ssn
FROM enterprise_prod.hr.employees_secured
-- Row filter: non-HR employees see only their own department
WHERE is_account_group_member('hr_directors') 
   OR department = current_user();
```
- Users are granted `SELECT` exclusively on the Dynamic View, with permissions on the underlying table restricted to service principals."""),

        ("databricks-q-049", "Databricks Spark Shuffle Partition Sizing",
         "How do you determine the optimal number of Spark shuffle partitions for wide transformations?",
         """Wide transformations (`groupBy()`, `join`, `distinct()`, `orderBy()`) trigger a shuffle stage where data is redistributed across worker nodes. Sizing shuffle partitions is critical:

### The Problem with Defaults:
- `spark.sql.shuffle.partitions` defaults to **200**.
- On a 10 GB dataset, 200 partitions creates ~50 MB partitions (reasonable).
- On a 2 TB dataset, 200 partitions creates 10 GB partitions, causing executor memory exhaustion and massive disk spilling.
- On a 100 MB dataset, 200 partitions creates tiny 500 KB files.

### Sizing Heuristic:
- Aim for **100 MB to 200 MB per partition** after shuffle:
  `Target_Shuffle_Partitions = Shuffle_Stage_Input_Bytes / (128 * 1024 * 1024)`
- Modern Recommendation: Enable Adaptive Query Execution (`spark.sql.adaptive.enabled = true`), which calculates and coalesces shuffle partitions automatically based on runtime stage sizes!"""),

        ("databricks-q-050", "Databricks Jobs Cluster vs All-Purpose Cluster",
         "Why should automated production pipelines always run on Job Compute rather than All-Purpose Compute?",
         """Databricks offers two distinct compute categories with stark differences in cost, isolation, and SLA guarantees:

### Job Compute (Automated Workflows):
1. **50%+ Cost Reduction**: Databricks charges significantly fewer DBUs per core hour for Job Compute compared to All-Purpose Compute.
2. **Ephemeral Lifecycle**: A Job cluster spins up automatically when the Workflow task starts and terminates immediately upon task completion—zero idle compute spend.
3. **Workload Isolation**: Each scheduled pipeline runs on dedicated VM instances, preventing rogue interactive queries or memory leaks from degrading production SLA pipelines.

### All-Purpose Compute (Interactive):
1. **Expensive**: Higher DBU licensing rates designed for interactive human collaboration, notebook exploration, and ad-hoc debugging.
2. **Shared State**: Multiple developers share memory and CPU cores; one runaway `df.collect()` can crash the driver for all users.
3. **Golden Rule**: Cluster policies must restrict scheduled jobs to ephemeral Job Compute exclusively."""),
    ]

    for qid, niche, q_text, ans in medium_data:
        items[qid] = {
            "id": qid,
            "source": "Questions DB",
            "category": "Databricks",
            "niche": niche,
            "difficulty": "MEDIUM",
            "question": q_text,
            "answer": ans,
            "domain": "Data Engineering",
            "subdomain": "Lakehouse Architecture"
        }

    return items
