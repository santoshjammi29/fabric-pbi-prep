# fix_questions_databricks_2.py
# Bespoke, expert questions and answers for databricks-q-051 through databricks-q-100 (HARD & ARCHITECT).

def get_databricks_fixes_part2():
    items = {}

    # HARD: 051 - 075
    hard_data = [
        ("databricks-q-051", "Unity Catalog Row Filtering & Column Masking ABAC",
         "How do you implement centralized row-level security and dynamic column masking using SQL UDFs in Unity Catalog?",
         """Unity Catalog enforces Attribute-Based Access Control (ABAC) natively on tables through SQL User-Defined Functions (UDFs):

### Dynamic Column Masking:
```sql
-- 1. Define centralized masking function in a governance schema
CREATE OR REPLACE FUNCTION enterprise_prod.governance.mask_ssn(ssn STRING)
RETURN IF(is_account_group_member('hr_admins'), ssn, CONCAT('***-**-', RIGHT(ssn, 4)));

-- 2. Apply dynamic mask to sensitive table column
ALTER TABLE enterprise_prod.hr.employees 
  ALTER COLUMN ssn SET MASK enterprise_prod.governance.mask_ssn;
```
### Dynamic Row Filtering:
```sql
-- Define row filter returning boolean
CREATE OR REPLACE FUNCTION enterprise_prod.governance.region_filter(region STRING)
RETURN is_account_group_member('global_executives') OR 
       is_account_group_member(CONCAT('sales_', LOWER(region)));

-- Apply row filter
ALTER TABLE enterprise_prod.sales.orders 
  SET ROW FILTER enterprise_prod.governance.region_filter ON (sales_region);
```
### Production Hardening:
- Row-filter functions execute on every query scan. Keep filter functions lightweight (using session functions like `is_account_group_member()` or `current_user()`), avoiding heavy subqueries that degrade BI scan latency."""),

        ("databricks-q-052", "Serverless DLT Pipelines & Autoscaling",
         "How do you architect, configure, and optimize Serverless Compute for Delta Live Tables (DLT) pipelines?",
         """Serverless Delta Live Tables (DLT) decouples pipeline execution from classic virtual machine management in customer cloud VPCs:

### Architectural Advantages:
1. **Sub-Second Boot Time**: Eliminates the 3-7 minute VM provisioning latency; pipelines initialize instantaneously.
2. **Autonomous Horizontal Scaling**: Databricks dynamically scales driver and worker nodes according to live micro-batch backlog and pipeline execution graphs.
3. **Pure Usage-Based Billing**: Charges DBUs purely per second of active transformation, eliminating idle driver VM costs.

### DLT Pipeline Configuration (`dlt_pipeline.json`):
```json
{
  "name": "serverless_orders_pipeline",
  "target": "enterprise_prod.sales",
  "serverless": true,
  "continuous": false,
  "channel": "CURRENT",
  "libraries": [
    {
      "notebook": {
        "path": "/Workspace/Pipelines/orders_silver_gold"
      }
    }
  ],
  "configuration": {
    "pipelines.autoOptimize.zOrderCols": "order_id,customer_id"
  }
}
```
### Gotcha:
- Serverless DLT runs in Databricks-managed cloud networks. If the pipeline requires direct private IP access to on-prem databases, route traffic through Lakehouse Federation or Databricks Private Access Gateways."""),

        ("databricks-q-053", "Delta Sharing External Recipient Architecture",
         "How do you architect secure, zero-copy data exchange with external partners using Delta Sharing?",
         """Delta Sharing enables external consumers on Snowflake, Power BI, Python, or Apache Spark to query live Delta tables directly from cloud storage without duplicating data:

### Core Architecture:
- **Databricks-to-Databricks**: UC-to-UC direct sharing without credentials via account token exchange.
- **Open Sharing**: External recipients authenticate using temporary presigned URLs issued by the Delta Sharing server.

### SQL Configuration:
```sql
CREATE SHARE partner_b2b_share;

-- Add table with partition constraint
ALTER SHARE partner_b2b_share ADD TABLE enterprise_prod.analytics.customer_daily_summary
  AS customer_metrics
  PARTITION (region = 'EMEA');

-- Create recipient
CREATE RECIPIENT acme_logistics;
GRANT SELECT ON SHARE partner_b2b_share TO RECIPIENT acme_logistics;
DESCRIBE RECIPIENT acme_logistics;
```
### Production Hardening:
- Set bearer token lifetimes to maximum 90 days with automated key rotation.
- External queries stream directly from S3/ADLS without consuming compute on the provider's Databricks workspace."""),

        ("databricks-q-054", "Structured Streaming with RocksDB State Store",
         "How do you configure and tune the RocksDB state store provider for large-scale stateful streaming in Databricks?",
         """Default Spark Structured Streaming stores state in Java Virtual Machine (JVM) heap memory, which crashes with `OutOfMemoryError` or severe GC pauses when tracking millions of keys.

### RocksDB State Store Provider:
Replaces the JVM heap with an off-heap embedded key-value database (RocksDB) backed by local worker NVMe disks:
```python
# Configure RocksDB state store
spark.conf.set(
    "spark.sql.streaming.stateStore.providerClass",
    "com.databricks.sql.streaming.state.RocksDBStateStoreProvider"
)
spark.conf.set("spark.sql.streaming.stateStore.rocksdb.compactOnCommit", "true")

# Stateful stream: tracking device sessions
df_stream = (
    spark.readStream.table("enterprise_prod.bronze.iot_telemetry")
    .withWatermark("event_time", "1 hour")
    .groupBy("device_id", "session_id")
    .count()
)
```
### Production Hardening:
- RocksDB scales to billions of state keys and hundreds of gigabytes per worker.
- Always implement explicit watermarks or session timeouts to prune expired state keys and prevent disk exhaustion."""),

        ("databricks-q-055", "Databricks Asset Bundles (DABs) Multi-Target CI/CD",
         "How do you implement an enterprise CI/CD deployment pipeline using Databricks Asset Bundles (DABs)?",
         """Databricks Asset Bundles (DABs) standardizes the authoring, testing, and deployment of complex Databricks projects (Jobs, DLT, notebooks, ML models) as Infrastructure-as-Code:

### Declarative YAML Configuration (`databricks.yml`):
```yaml
bundle:
  name: revenue_analytics

targets:
  dev:
    mode: development
    default: true
    workspace:
      host: https://adb-dev.azuredatabricks.net

  prod:
    mode: production
    workspace:
      host: https://adb-prod.azuredatabricks.net
    run_as:
      service_principal_name: 7b8431c1-45f8-4b2a-874e-6e54c0e6f982

resources:
  jobs:
    daily_revenue_etl:
      name: "[${bundle.target}] Daily Revenue ETL"
      tasks:
        - task_key: run_transform
          notebook_task:
            notebook_path: ./src/transform.py
```
### CLI Commands:
- `databricks bundle validate -t prod`
- `databricks bundle deploy -t prod`
- Guarantees target isolation and ensures production resources are owned by automated Service Principals."""),

        ("databricks-q-056", "Account SCIM Provisioning with Microsoft Entra ID",
         "How do you architect automated SCIM user and group provisioning from enterprise identity providers into Databricks?",
         """Account-level System for Cross-domain Identity Management (SCIM) automates user onboarding, group synchronization, and offboarding from Microsoft Entra ID or Okta:

### Architecture:
- **Centralized Synchronization**: The IdP pushes users, groups, and service principals directly to the Databricks Account Console via the Account SCIM 2.0 API.
- **Workspace Assignment**: Account groups are mapped to specific workspaces with role-based entitlements (`USER`, `ADMIN`).
```bash
# Verify synchronized SCIM user via Account API
curl -X GET "https://accounts.cloud.databricks.com/api/2.0/accounts/$ACCOUNT_ID/scim/v2/Users" \
  -H "Authorization: Bearer $ACCOUNT_SCIM_TOKEN"
```
### Production Hardening:
- Avoid workspace-level SCIM; it causes identity divergence and orphaned accounts.
- When an employee departs, deprovisioning in Entra ID automatically revokes access across all Databricks workspaces and Unity Catalog grants instantly."""),

        ("databricks-q-057", "Predictive Optimization Governance & System Tables",
         "How do you architect, monitor, and govern Predictive Optimization in Databricks Unity Catalog?",
         """Predictive Optimization is an autonomous AI-driven service built into Unity Catalog that continuously analyzes Delta table read/write patterns, file sizes, and clustering metrics to execute `OPTIMIZE` and `VACUUM` serverlessly when beneficial:

### Enabling Predictive Optimization:
```sql
-- Enable on entire production catalog
ALTER CATALOG enterprise_prod ENABLE PREDICTIVE OPTIMIZATION;
```
### Monitoring Operations in System Tables:
```sql
SELECT 
    start_time,
    table_name,
    operation_type,
    metrics.num_files_compacted,
    metrics.num_bytes_vacuumed
FROM system.storage.predictive_optimization_operations_history
WHERE catalog_name = 'enterprise_prod'
ORDER BY start_time DESC
LIMIT 50;
```
### Cost Governance:
- Monitor DBU consumption in `system.billing.usage` where `usage_metadata.job_name = 'Predictive Optimization'`. Disable on scratch/staging schemas to avoid unnecessary compaction on short-lived tables."""),

        ("databricks-q-058", "Spark Connect Remote Execution Architecture",
         "How do you architect modern client-server Spark applications using Spark Connect on Databricks?",
         """Spark Connect decouples the client DataFrame API from the execution engine, replacing fat JVM drivers with a lightweight client over gRPC:

### Architectural Workflow:
1. **Thin Client**: The Python client converts DataFrame operations into an unresolved logical plan Protobuf.
2. **gRPC Protocol**: The plan is transmitted over HTTP/2 to the Databricks Spark Connect endpoint.
3. **Remote Catalyst Optimization**: The remote Databricks cluster parses, optimizes via Catalyst, and executes the physical plan, returning only the final query results.

```python
from pyspark.sql import SparkSession
import os

connection_string = (
    f"sc://adb-123456789.azuredatabricks.net:443/;"
    f"token={os.environ['DATABRICKS_TOKEN']};"
    f"x-databricks-cluster-id=0320-141200-abcd123"
)

# Lightweight connection: zero local Spark or JVM installation required!
spark = SparkSession.builder.remote(connection_string).getOrCreate()

df = spark.table("enterprise_prod.analytics.customer_churn")
results_pdf = df.filter(df.risk_score > 0.85).toPandas()
```"""),

        ("databricks-q-059", "Databricks Connect v2 Local Development Workflow",
         "How do you architect a professional local software engineering workflow for Databricks using Databricks Connect v2 and VS Code?",
         """Databricks Connect v2 leverages the Spark Connect architecture to provide an enterprise-grade local development and debugging experience in modern IDEs:

### Development Workflow:
1. **Local Virtual Environment**: Install `databricks-connect` matching the exact target Databricks Runtime (DBR 14.3 LTS).
2. **Interactive Local Debugging**: Set breakpoints in VS Code, step through Python transformation functions line-by-line, and inspect remote DataFrame schemas.
3. **Unit Testing with Pytest**:
```python
import pytest
from databricks.connect import DatabricksSession

@pytest.fixture(scope="session")
def spark():
    return DatabricksSession.builder.getOrCreate()

def test_revenue_calculation(spark):
    df = spark.createDataFrame([(100.0, 10.0)], ["gross", "tax"])
    res = df.withColumn("net", df.gross - df.tax).collect()
    assert res[0]["net"] == 90.0
```
4. **Hardening**: Run tests strictly against sandbox catalogs (`dev_catalog`), ensuring local test executions never mutate production data."""),

        ("databricks-q-060", "Unity Catalog System Tables Billing & Audit Analysis",
         "How do you query `system.billing.usage` and `system.access.audit` in Unity Catalog to track cloud spend and data access?",
         """Unity Catalog System Tables provide out-of-the-box, analytical access to account-level audit events, billing consumption, and lineage:

### Spend Attribution Query:
```sql
SELECT 
    usage_date,
    workspace_id,
    sku_name,
    custom_tags['CostCenter'] AS cost_center,
    ROUND(SUM(usage_quantity), 2) AS total_dbus,
    ROUND(SUM(usage_quantity * 0.15), 2) AS estimated_usd
FROM system.billing.usage
WHERE usage_date >= CURRENT_DATE() - INTERVAL 30 DAYS
GROUP BY 1, 2, 3, 4
ORDER BY total_dbus DESC;
```
### Security Audit Query:
```sql
SELECT 
    event_time,
    user_identity.email,
    action_name,
    request_params.full_name_arg AS accessed_table
FROM system.access.audit
WHERE service_name = 'unityCatalog'
  AND action_name IN ('getTable', 'commandSubmit')
  AND event_date >= CURRENT_DATE() - INTERVAL 7 DAYS;
```"""),

        ("databricks-q-061", "Delta Lake UniForm (Universal Format) Iceberg Integration",
         "How does Delta Lake UniForm generate Apache Iceberg metadata zero-copy to allow Snowflake and Athena to query Delta tables?",
         """Universal Format (UniForm) allows Delta Lake tables to be read as Apache Iceberg tables without copying or converting underlying Parquet data files:

### How UniForm Works:
- When data is written to a Delta table, UniForm automatically generates **Apache Iceberg metadata manifests and snapshot pointers** asynchronously alongside the Delta `_delta_log/`.
- Both Delta Lake clients and Iceberg clients query the exact same physical Parquet data files.

### Enabling UniForm:
```sql
CREATE TABLE enterprise_prod.sales.orders (
    order_id STRING,
    customer_id STRING,
    amount DECIMAL(10, 2)
)
USING DELTA
TBLPROPERTIES (
  'delta.universalFormat.enabledFormats' = 'iceberg'
);
```
### Querying from Snowflake:
Snowflake registers the table as an Iceberg table pointing to the generated Iceberg metadata in S3/ADLS, achieving zero-copy cross-platform interoperability."""),

        ("databricks-q-062", "High-Concurrency DBSQL Multi-Cluster Autoscaling",
         "How do you configure Databricks SQL Serverless Warehouses with multi-cluster load balancing for 1,000+ concurrent BI users?",
         """Databricks SQL Serverless Warehouses scale horizontally to absorb massive BI concurrency without query queuing:

### Scaling Architecture:
- **Cluster Scaling Range**: Set `min_clusters = 1` and `max_clusters = 10`.
- **Load Balancing**: The DBSQL router continuously monitors query queue depth. When query queue latency exceeds 100ms, the router instantly provisions additional cluster instances from the warm serverless pool.
- **Auto-Stop**: When concurrency subsides, extra clusters scale down immediately (auto-stop: 5 minutes).

```json
{
  "name": "Enterprise_BI_Warehouse",
  "cluster_size": "Medium",
  "min_num_clusters": 1,
  "max_num_clusters": 8,
  "auto_stop_mins": 5,
  "enable_serverless_compute": true,
  "warehouse_type": "PRO"
}
```
### Caching:
- Result caching serves identical dashboard queries instantly from memory with zero compute overhead."""),

        ("databricks-q-063", "Fine-Grained Access Control on Volumes & Unstructured Data",
         "How do you enforce granular security policies on Unity Catalog Volumes storing unstructured data files?",
         """Unity Catalog Volumes govern unstructured files (PDFs, images, CSVs, audio) using declarative SQL privilege grants:

### Privilege Hierarchy:
- `READ VOLUME`: Allows users to list and download files.
- `WRITE VOLUME`: Allows users to upload and delete files.
- `MANAGE VOLUME`: Allows users to alter volume metadata and ownership.

```sql
-- Create an external governed volume
CREATE EXTERNAL VOLUME enterprise_prod.raw_files.medical_scans
  LOCATION 'abfss://medical@lakehouse.dfs.core.windows.net/scans';

-- Grant read-only access to radiology group
GRANT READ VOLUME enterprise_prod.raw_files.medical_scans TO `radiology_analysts`;

-- Grant full write access to imaging ingestion service principal
GRANT WRITE VOLUME enterprise_prod.raw_files.medical_scans TO `imaging_pipeline_sp`;
```
### Python POSIX Access:
```python
# Governed POSIX path with RBAC enforced at kernel/storage layer
with open("/Volumes/enterprise_prod/raw_files/medical_scans/patient_01.dcm", "rb") as f:
    scan_bytes = f.read()
```"""),

        ("databricks-q-064", "Lakehouse Monitoring for Model Drift & Data Quality",
         "How do you architect continuous drift detection for machine learning inference tables using Lakehouse Monitoring?",
         """Lakehouse Monitoring continuously profiles model inputs and predictions to detect concept drift and covariate shift without third-party monitoring agents:

### SQL Monitor Creation:
```sql
CREATE MONITOR enterprise_prod.ml_models.churn_model_monitor
  ON TABLE enterprise_prod.ml_models.inference_logs
  USING PROFILE MODEL_PERFORMANCE (
    prediction_col => 'churn_prediction',
    label_col => 'actual_churn',
    model_type => 'classification',
    timestamp_col => 'inference_timestamp'
  )
  WITH BASELINE TABLE enterprise_prod.ml_models.training_baseline;
```
### Automated Metrics:
- **Data Drift**: Population Stability Index (PSI) and Jensen-Shannon divergence comparing live inference distributions against training baselines.
- **Model Quality**: Accuracy, precision, recall, F1-score, and ROC AUC tracked over rolling temporal windows.
- Automatically triggers PagerDuty alerts when drift metrics exceed predefined safety thresholds."""),

        ("databricks-q-065", "Delta Live Tables Change Data Capture (APPLY CHANGES INTO)",
         "How do you process Change Data Capture (CDC) streams and handle SCD Type 1 and Type 2 dimensions using DLT `APPLY CHANGES INTO`?",
         """Delta Live Tables provides the declarative `APPLY CHANGES INTO` API to ingest out-of-order CDC streams into target tables with automatic primary key deduplication and Slowly Changing Dimension (SCD) Type 1 or Type 2 history:

### Python DLT Implementation:
```python
import dlt
from pyspark.sql.functions import col

@dlt.table
def cdc_source():
    return spark.readStream.table("enterprise_prod.bronze.cdc_orders_raw")

# Declare target streaming table
dlt.create_streaming_table(
    name="orders_silver_scd2",
    comment="Orders table with SCD Type-2 historical tracking"
)

# Apply CDC changes with SCD Type 2 history
dlt.apply_changes(
    target="orders_silver_scd2",
    source="cdc_source",
    keys=["order_id"],
    sequence_by=col("change_timestamp"),
    apply_as_deletes=col("operation") == "DELETE",
    except_column_list=["operation", "change_timestamp"],
    stored_as_scd_type="2" # Creates __start_at, __end_at columns automatically
)
```"""),

        ("databricks-q-066", "Databricks Vector Search for RAG Applications",
         "How do you configure and query Databricks Vector Search indexes for enterprise Retrieval-Augmented Generation (RAG)?",
         """Databricks Vector Search is a fully managed vector database integrated with Unity Catalog, providing automated embedding synchronization from Delta tables:

### Python Implementation:
```python
from databricks.vector_search.client import VectorSearchClient

vsc = VectorSearchClient()

# 1. Create or get vector search endpoint
endpoint = vsc.get_endpoint(name="enterprise_vector_endpoint")

# 2. Create a Delta Sync Index with automated embedding generation
index = vsc.create_delta_sync_index(
    endpoint_name="enterprise_vector_endpoint",
    source_table_name="enterprise_prod.knowledge.internal_docs",
    index_name="enterprise_prod.knowledge.internal_docs_index",
    pipeline_type="TRIGGERED",
    primary_key="doc_id",
    embedding_source_column="text_chunk",
    embedding_model_endpoint_name="databricks-bge-large-en"
)

# 3. Query similar vectors in sub-50ms
results = index.similarity_search(
    query_text="What is the enterprise travel reimbursement policy?",
    columns=["doc_id", "title", "text_chunk"],
    num_results=3
)
```"""),

        ("databricks-q-067", "Model Serving Scale-to-Zero & Cold-Start Mitigation",
         "How do you configure Databricks Model Serving to balance cost efficiency (scale-to-zero) with sub-second API latency SLAs?",
         """Databricks Model Serving provides serverless, highly available REST endpoints for ML and LLM models. Configuring autoscaling boundaries governs the latency vs cost trade-off:

### Sizing & Scale-to-Zero:
- **`scale_to_zero_enabled: true`**: When traffic drops to zero, compute scales to 0 instances, eliminating cloud spend during off-peak hours.
- **Cold-Start Trade-Off**: When a new request arrives, provisioning a fresh container takes **15 to 40 seconds**, which violates latency SLAs for real-time user applications.

### Production Configuration for Mission-Critical APIs:
```json
{
  "name": "realtime_fraud_scoring",
  "config": {
    "served_entities": [
      {
        "entity_name": "enterprise_prod.ml_models.fraud_detector",
        "entity_version": "3",
        "workload_size": "Small",
        "scale_to_zero_enabled": false
      }
    ],
    "traffic_config": {
      "routes": [{"served_model_name": "fraud_detector-3", "traffic_percentage": 100}]
    }
  }
}
```
- Setting `scale_to_zero_enabled: false` ensures at least 1 warm instance is always available, maintaining sub-30ms p95 latency."""),

        ("databricks-q-068", "Spark Structured Streaming State Rebalancing",
         "How does Spark Structured Streaming handle partition rebalancing during executor failures without losing state data?",
         """In stateful streaming queries (`groupBy().count()` or `applyInPandasWithState`), state data is partitioned across worker executors:

### Fault Tolerance Mechanics:
1. **Durable State Checkpoints**:
   - At every micro-batch commit, state store providers (RocksDB / HDFS) write delta state changes to durable cloud object storage (`checkpointLocation/state/0/`).
2. **Executor Loss Recovery**:
   - If an executor VM crashes, Spark detects node loss via heartbeat timeouts.
   - The driver reassigns the affected partitions to remaining healthy executors.
3. **State Resumption**:
   - The newly assigned executor reads the latest committed state snapshot from the cloud checkpoint directory into its local RocksDB instance.
   - Streaming resumes processing from the last committed micro-batch offset, guaranteeing **exactly-once processing semantics**."""),

        ("databricks-q-069", "Databricks Private Access Gateways & Network Isolation",
         "How do you design a secure, network-isolated Databricks deployment using Private Link and Customer-Managed VPCs?",
         """Enterprise zero-trust deployments require complete network isolation without public internet exposure:

### Network Architecture:
1. **Customer-Managed VPC / VNet (VNet Injection)**:
   - Databricks compute clusters deploy inside customer-owned subnets.
2. **Front-End Private Link**:
   - Secures communication between user browsers / corporate VPN and the Databricks web application control plane.
3. **Back-End Private Link**:
   - Secures communication between customer VPC compute workers and the Databricks control plane (metastore, cluster manager).
4. **Storage Private Endpoints**:
   - Compute nodes connect to Amazon S3 or Azure ADLS Gen2 via Cloud Private Endpoints; public internet access on storage accounts is completely disabled (`publicNetworkAccess = Disabled`)."""),

        ("databricks-q-070", "Databricks OAuth Service Principal Automation",
         "How do you configure OAuth 2.0 Machine-to-Machine (M2M) authentication for automated CI/CD Service Principals in Databricks?",
         """OAuth M2M authentication replaces static personal access tokens (PATs) with enterprise identity management:

### Configuration Steps:
1. **Provision Service Principal**: Create an enterprise service principal in the Databricks Account Console.
2. **Generate OAuth Secret**: Generate an OAuth Client ID and Secret with appropriate workspace access.
3. **CI/CD Pipeline Authentication (GitHub Actions)**:
```yaml
env:
  DATABRICKS_HOST: https://adb-123456789.azuredatabricks.net
  DATABRICKS_CLIENT_ID: ${{ secrets.DB_CLIENT_ID }}
  DATABRICKS_CLIENT_SECRET: ${{ secrets.DB_CLIENT_SECRET }}

steps:
  - name: Run DAB Deploy
    run: databricks bundle deploy -t prod
```
4. **Security Advantage**: OAuth tokens expire in 60 minutes and are generated on the fly via Databricks token endpoints, preventing credential leakage in logs."""),

        ("databricks-q-071", "Delta Lake Shallow Clone vs UniForm",
         "When should you use Delta Lake Shallow Clone versus UniForm for multi-platform data access and testing?",
         """Both technologies provide zero-copy access to Delta Lake data, but solve fundamentally different architectural challenges:

### Delta Lake Shallow Clone:
- **Purpose**: Creates an isolated, writable copy of a Delta table within the *same* Databricks ecosystem.
- **Format**: Pure Delta Lake.
- **Use Case**: CI/CD staging validation, developer test sandboxes, and what-if financial modeling. Modifications to the clone do not affect the source table.

### Delta Lake UniForm (Universal Format):
- **Purpose**: Exposes a Delta table to *external* non-Databricks query engines (Snowflake, Amazon Athena, Apache Flink).
- **Format**: Delta Lake + auto-generated Apache Iceberg / Hudi metadata pointing to the same Parquet files.
- **Use Case**: Cross-platform open data sharing without creating data silos."""),

        ("databricks-q-072", "PySpark Memory Management & Off-Heap Allocation",
         "How is executor memory structured in Databricks Spark, and how do you tune off-heap memory to prevent container OOMs?",
         """Spark executor memory is partitioned into distinct pools inside the worker container:

### Memory Architecture:
1. **JVM On-Heap Memory**:
   - **Execution Memory**: Used for shuffles, joins, sorts, and aggregations.
   - **Storage Memory**: Used for caching DataFrames (`df.cache()`) and broadcast variables.
   - **User Memory**: Used for custom user data structures, hash tables, and metadata.
   - **Reserved Memory**: 300 MB hardcoded for Spark internal processes.
2. **Off-Heap Memory (`spark.memory.offHeap.enabled = true`)**:
   - Allocated outside the JVM using Project Tungsten and Photon C++ memory allocators.
   - Immune to JVM Garbage Collection pauses.
3. **Container Overhead (`spark.executor.memoryOverhead`)**:
   - Memory allocated for OS processes, Python worker processes (PySpark), and native C/C++ libraries.
   - **Remediation for Yarn/K8s Exit Code 137 (OOMKilled)**: When running heavy PySpark/Pandas operations, increase overhead:
     `spark.executor.memoryOverhead = 2048m` (or 20% of executor memory)."""),

        ("databricks-q-073", "Databricks Workflows Repair and Rerun Failed Tasks",
         "How do you use the Databricks Workflows Repair API to rerun only failed tasks in a multi-task DAG?",
         """When a 20-task pipeline fails at Task 18, re-running the entire workflow wastes compute and can cause unintended side effects on upstream tables.

### Repair & Rerun Architecture:
- Databricks Workflows records the state of every individual task in the run history.
- The **Repair Run** API allows engineers to execute *only the failed tasks and their direct downstream dependencies*, reusing the successful outputs of all upstream tasks:
```bash
# Trigger repair run via Databricks CLI
databricks jobs repair-run 123456789 \
  --rerun-tasks transform_gold,emit_alerts
```
- Available directly in the Databricks UI via the "Repair Run" button, drastically reducing MTTR (Mean Time to Resolution) during production incidents."""),

        ("databricks-q-074", "Custom Cluster Initialization Scripts (Init Scripts) Governance",
         "How do you govern and secure cluster initialization scripts (init scripts) in Unity Catalog?",
         """Legacy init scripts stored on DBFS (`dbfs:/databricks/init/`) presented major security risks: any user could overwrite script files to execute arbitrary root commands on clusters.

### Modern Unity Catalog Init Scripts:
- Stored exclusively in governed **Unity Catalog Volumes**:
```bash
# Reference init script stored in a secure volume
/Volumes/enterprise_prod/shared_libs/init_scripts/install_odbc_drivers.sh
```
### Security & Governance:
- Volumes enforce strict RBAC: only Cloud Platform Admins have `WRITE VOLUME` privileges to publish init scripts.
- Cluster policies restrict which volumes can be referenced for cluster initialization.
- Scripts execute during node boot with system audit logging to `system.access.audit`."""),

        ("databricks-q-075", "Delta Lake Log Retention & Checkpoint Compaction",
         "How does Delta Lake maintain the transaction log over time using checkpoints to prevent slow metadata parsing?",
         """If a Delta table accumulated 500,000 individual JSON commit files (`000000.json` to `500000.json`), reading the log to resolve table state would require 500,000 storage requests:

### Checkpointing Mechanics:
1. **Automated Checkpoints**: Every 10 commits by default (`checkpointInterval = 10`), Delta Lake merges all previous commit JSON files into a consolidated Parquet checkpoint file:
   `000010.checkpoint.parquet`
2. **Fast Metadata Resolution**: Query engines read the latest checkpoint Parquet file and apply only subsequent JSON commits (at most 9 files), resolving table state in milliseconds.
3. **Log Retention Cleanup**:
   - Governed by `delta.logRetentionDuration = 'interval 30 days'`.
   - Superseded JSON and checkpoint files older than 30 days are automatically pruned during table operations."""),
    ]

    for qid, niche, q_text, ans in hard_data:
        items[qid] = {
            "id": qid,
            "source": "Questions DB",
            "category": "Databricks",
            "niche": niche,
            "difficulty": "HARD",
            "question": q_text,
            "answer": ans,
            "domain": "Data Engineering",
            "subdomain": "Lakehouse Architecture"
        }

    # ARCHITECT: 076 - 100
    architect_data = [
        ("databricks-q-076", "Multi-Workspace Unity Catalog Federation Architecture",
         "How do you architect a multi-workspace enterprise environment federated by a single Unity Catalog metastore?",
         """In large enterprises, separating development, staging, and production workloads into dedicated Databricks workspaces prevents operational interference while maintaining centralized data governance.

### Architectural Blueprint:
1. **Single Metastore per Cloud Region**: Deploy one Unity Catalog metastore per cloud region (e.g., East US) attached to all regional workspaces (`ws-dev`, `ws-stage`, `ws-prod`).
2. **Catalog Workspace Binding (Isolation)**:
   - Configure catalog isolation level to `RESTRICTED`:
```sql
ALTER CATALOG enterprise_prod SET ISOLATION RESTRICTED;
-- databricks workspace-bindings update catalog enterprise_prod --json '{"assign_workspaces": [1234567890]}'
```
   - Developers in `ws-dev` cannot read or write `enterprise_prod`, preventing accidental production corruption.
3. **Centralized Identity**: SCIM synchronizes users, groups, and service principals at the Databricks Account level once.
4. **Storage Credentials**: Cloud IAM managed identities are defined centrally in the metastore; workspace users never manage storage keys."""),

        ("databricks-q-077", "Databricks Lakehouse vs Snowflake at Petabyte Scale",
         "How do you evaluate and architect a petabyte-scale comparison between Databricks Lakehouse and Snowflake?",
         """Evaluating Databricks vs Snowflake at petabyte scale requires analyzing storage formats, workload diversity, elasticity, and total cost of ownership (TCO):

### Evaluation Dimensions:
- **Storage Openness**: Databricks uses open Apache Parquet / Delta Lake with Delta Sharing and UniForm, avoiding storage lock-in. Snowflake traditionally uses proprietary micro-partitions (though it supports external Iceberg tables).
- **Workload Breadth**: Databricks excels in unified architectures combining batch ETL, streaming, data science, Python/C++ libraries, and ML/AI model serving (Mosaic AI). Snowflake is optimized for SQL BI, analytical warehousing, and data applications.
- **Compute Sizing**: Databricks SQL Serverless provides multi-cluster elasticity with sub-second boot and auto-suspend, rivaling Snowflake's virtual warehouses.
- **Cost**: Databricks enables significant storage cost savings by querying data in-place on cloud object storage without ingestion markup."""),

        ("databricks-q-078", "Multi-Cloud Databricks Deployment Topology (Azure + AWS)",
         "How do you architect an enterprise multi-cloud Databricks deployment spanning Azure and AWS?",
         """Enterprises deploy across Azure and AWS to satisfy regional compliance, prevent single-cloud lock-in, and support business acquisitions:

### Architectural Stack:
1. **Infrastructure as Code (Terraform)**: Standardize workspace provisioning, subnets, PrivateLink endpoints, and storage credentials using the official `databricks/databricks` Terraform provider.
2. **Cross-Cloud Data Exchange (Delta Sharing)**: Connect disparate cloud regions using Delta Sharing to share tables between Azure ADLS Gen2 and AWS S3 without custom point-to-point replication pipelines.
3. **Unified Identity**: Single enterprise IdP (Microsoft Entra ID / Okta) synchronizes identities to both Azure and AWS Databricks Account Consoles.
4. **Data Gravity**: Compute executes close to storage: AWS workloads run on AWS EKS/EC2; Azure workloads run on Azure VMs, transmitting only aggregated metrics across clouds to minimize egress fees."""),

        ("databricks-q-079", "Enterprise FinOps & DBU Cost Attribution Framework",
         "How do you architect a comprehensive Databricks FinOps and cost optimization framework across DBUs and cloud compute?",
         """Databricks costs consist of Databricks Unit (DBU) software licensing and underlying cloud provider virtual machine/storage infrastructure costs:

### FinOps Framework Levers:
1. **Mandatory Tagging**: Enforce cluster policies that require `CostCenter`, `Environment`, and `ProjectOwner` tags on all clusters and SQL warehouses.
2. **Compute Tier Right-Sizing**:
   - Migrate scheduled workflows from all-purpose clusters to Job Compute (50% DBU savings).
   - Use 100% Spot instances for worker nodes in stateless batch ETL.
   - Enforce aggressive auto-termination (15 minutes).
3. **Automated Cost Attribution Dashboard**:
   - Build daily cost tracking models querying `system.billing.usage` joined with cloud provider billing feeds.
   - Configure automated budget alerting via webhooks when monthly DBU spend exceeds thresholds."""),

        ("databricks-q-080", "Decentralized Data Mesh on Databricks with Unity Catalog",
         "How do you architect a decentralized Data Mesh architecture on Databricks using Unity Catalog?",
         """Data Mesh decentralizes data ownership away from a central bottleneck team to autonomous domain teams (Marketing, Supply Chain, Finance):

### Implementation on Databricks:
1. **Domain Catalogs**: Each business domain owns an independent Unity Catalog (`marketing_domain`, `logistics_domain`) and underlying storage containers.
2. **Data Products as Governed Assets**: Domain teams publish curated Gold schemas as certified Data Products with schema contracts and data quality SLAs.
3. **Federated Governance**: Global security policies (ABAC masking, audit logging, retention) are defined centrally at the metastore level, while domain leads autonomously manage table grants.
4. **Self-Service Platform**: Central platform teams provide automated CI/CD templates and cluster policies rather than authoring business ETL."""),

        ("databricks-q-081", "Databricks + dbt Core / Cloud Production Integration",
         "How do you architect an enterprise production data transformation pipeline combining dbt and Databricks SQL Serverless?",
         """Combining dbt with Databricks SQL Serverless unites dbt's modular modeling, testing, and documentation with the raw processing speed and instant boot of Photon:

### Architecture:
- **dbt-databricks Adapter**: Pushes SQL transformations directly down to Databricks SQL Serverless Warehouses over Thrift/REST APIs.
- **Three-Level Namespace**: Materializes models across catalogs and schemas (`catalog.schema.model`).
- **Liquid Clustering Support**: dbt models declare `liquid_clustered_by=['customer_id', 'order_date']` for automatic Delta clustering.
- **Orchestration**: Triggered via Databricks Workflows `dbt_task` or orchestrated via Airflow using Astronomer Cosmos for granular task visibility."""),

        ("databricks-q-082", "End-to-End Real-Time Lakehouse Architecture (Kafka + Delta)",
         "How do you architect an end-to-end mission-critical real-time Lakehouse pipeline ingesting from Kafka into Delta Lake?",
         """A mission-critical real-time Lakehouse ingests high-velocity streaming events from Kafka, validates and enriches records in flight, and delivers sub-second analytical availability:

### Architectural Flow:
1. **Kafka-to-Bronze Stream**: Spark Structured Streaming consumes Kafka partitions with zero data loss, writing raw JSON payloads directly into an append-only Delta table with atomic checkpointing.
2. **Bronze-to-Silver Stream**: Downstream streaming pipeline parses JSON, enforces schemas, watermarks late events, and deduplicates records.
3. **Silver-to-Gold Serving**: Materialized aggregates with Liquid Clustering serve real-time operational dashboards in Databricks SQL.
4. **Production Hardening**: Set `maxOffsetsPerTrigger` to cap micro-batch sizes during traffic spikes, and configure `RocksDBStateStoreProvider` for large stateful windows."""),

        ("databricks-q-083", "Enterprise MLOps & LLMOps Platform on Databricks",
         "How do you architect an enterprise MLOps and LLMOps platform on Databricks leveraging MLflow and Unity Catalog?",
         """An enterprise MLOps platform unifies feature engineering, model training, governance, validation, and real-time inference:

### Architectural Stack:
- **Feature Store**: Unity Catalog serves as the governed feature store with automated column lineage.
- **Experiment Tracking**: MLflow tracks hyperparameters, metrics, and models with reproducible environment definitions.
- **Model Registry in Unity Catalog**: Models are registered as first-class UC assets (`catalog.schema.model`) with role-based access control and lifecycle aliases (`@Champion`, `@Challenger`).
- **Serving & Monitoring**: Databricks Model Serving provides serverless real-time REST endpoints with automatic drift monitoring via Lakehouse Monitoring."""),

        ("databricks-q-084", "Multi-Region Disaster Recovery (RPO/RTO) for Unity Catalog",
         "How do you architect an enterprise multi-region Disaster Recovery (DR) strategy for Databricks and Unity Catalog?",
         """A comprehensive Disaster Recovery (DR) strategy ensures business continuity during major cloud provider regional outages:

### DR Strategy Classification:
- **Cold Standby (RTO < 24h, RPO < 6h)**: Secondary region infrastructure defined in Terraform; storage replicated via asynchronous cloud storage replication.
- **Warm Standby (RTO < 2h, RPO < 1h)**: Secondary workspace and paired UC metastore exist in active-idle state. Delta tables are continuously synchronized using Delta Deep Clone:
```sql
CREATE OR REPLACE TABLE secondary_lake.sales.orders
DEEP CLONE primary_lake.sales.orders;
```
- **Active-Active (RTO < 5m, RPO ~ 0)**: Workloads run concurrently in both regions fed by multi-region event buses.
- **Cutover**: Automated DNS failover switches traffic to the secondary region upon disaster declaration."""),

        ("databricks-q-085", "Self-Service Enterprise Analytics Platform on Databricks",
         "How do you architect an enterprise-grade self-service analytics platform on Databricks for thousands of business users?",
         """Scaling Databricks to thousands of non-technical business analysts requires an architecture that guarantees security, cost containment, and high query performance:

### Architectural Pillars:
1. **Certified Semantic Gold Layer**: Curated Gold tables with business-friendly metadata, dimensional models, and certified views in Unity Catalog.
2. **Databricks SQL Serverless Warehouses**: Provide instantaneous query execution with auto-scaling compute pools, eliminating wait times for analysts.
3. **AI-Powered Exploration (Databricks Genie / AI/BI)**: Business users ask natural language questions translated automatically into verified SQL queries.
4. **Governance & Cost Guardrails**: Enforce strict warehouse query timeouts, query watchdogs, and role-based permissions."""),

        ("databricks-q-086", "Lakehouse Data Vault 2.0 Implementation",
         "How do you architect a scalable Data Vault 2.0 architecture on Databricks using Delta Lake and Liquid Clustering?",
         """Data Vault 2.0 separates business keys, relationships, and context into Hubs, Links, and Satellites:

### Implementation on Delta Lake:
1. **Hubs (Business Keys)**: Store unique business keys and surrogate hash keys (`SHA2_256(business_key)`). Clustered by `hub_hash_key`.
2. **Links (Relationships)**: Store associations between multiple hubs with relationship hash keys.
3. **Satellites (Context / History)**: Store temporal attributes with `load_date`, `hash_diff`, and context columns.
4. **Optimization**:
   - Liquid Clustering on `hash_key` and `load_date` ensures rapid join performance when joining Hubs to Satellites.
   - Use Delta Lake `MERGE INTO` with insert-only patterns for immutable historical satellite appends."""),

        ("databricks-q-087", "Zero-Trust Security Architecture for Databricks Lakehouse",
         "How do you implement a Zero-Trust security perimeter around Databricks compute, storage, and identity?",
         """A Zero-Trust architecture assumes no network is inherently trusted and verifies every access request explicitly:

### Architectural Controls:
1. **Network Perimeter**: Deploy clusters in customer-managed private subnets with Front-End and Back-End Private Link. Public internet access is completely disabled.
2. **Storage Perimeter**: Cloud storage accounts restrict access exclusively to private endpoints and Unity Catalog storage credentials.
3. **Identity Verification**: Centralized SCIM provisioning, mandatory Multi-Factor Authentication (MFA), and short-lived OAuth 2.0 tokens for service principals.
4. **Data Governance**: Attribute-Based Access Control (ABAC) with dynamic column masking and row filtering enforced centrally in Unity Catalog."""),

        ("databricks-q-088", "Real-Time Fraud Detection Lakehouse Architecture",
         "How do you architect a real-time fraud scoring pipeline on Databricks combining Structured Streaming and Serverless Model Serving?",
         """Real-time fraud scoring requires sub-50ms latency evaluating incoming transaction streams against historical behavioral profiles:

### Architectural Flow:
1. **Stream Ingestion**: Transactions arrive via Kafka into a Structured Streaming micro-batch pipeline.
2. **Real-Time Feature Enrichment**: Structured Streaming performs low-latency point lookups against an in-memory feature cache or Unity Catalog Feature Store.
3. **Model Scoring via REST**: The stream invokes a Databricks Serverless Model Serving endpoint running a low-latency tree-ensemble model.
4. **Alert Sink**: Transactions scoring above fraud probability thresholds publish immediately to a high-priority Kafka alert topic, while raw events append to the Bronze Delta table."""),

        ("databricks-q-089", "Petabyte-Scale Batch ETL Optimization Architecture",
         "How do you architect and tune a 100-terabyte daily batch ETL pipeline in Databricks to maximize throughput and minimize cloud spend?",
         """Processing 100 TB daily requires eliminating distributed I/O bottlenecks and optimizing cluster resource utilization:

### Architecture & Tuning Playbook:
1. **Compute Architecture**: Ephemeral Job Compute clusters using Photon engine with 100% Spot workers and On-Demand drivers.
2. **I/O & File Sizing**:
   - Ingestion uses Auto Loader with notification mode.
   - Target Parquet files sized between 512 MB and 1 GB using `optimizeWrite`.
3. **Wide Shuffle Optimization**:
   - Enable Adaptive Query Execution (`spark.sql.adaptive.enabled = true`).
   - Size shuffle partitions targeting 128 MB per partition.
4. **Liquid Clustering**: Replace multi-level folder partitioning with Liquid Clustering on primary join and filter keys, pruning 95% of data during joins."""),

        ("databricks-q-090", "Cross-Border Data Localization & Jurisdictional Isolation",
         "How do you design a compliant Databricks architecture for multi-national organizations with strict data residency regulations?",
         """Data localization laws (GDPR, Saudi NDMO, China PIPL) require citizen data to reside physically within sovereign borders:

### Architecture:
1. **Regional Storage Isolation**: Deploy regional cloud storage containers physically located in compliant cloud data centers.
2. **Regional Workspaces & Metastore Assignment**: Attach regional workspaces to local cloud regions. Catalogs map directly to regional storage roots.
3. **Delta Sharing for Anonymized Aggregates**: Raw PII is locked within national borders; anonymized, aggregated summary tables are shared globally using Delta Sharing.
4. **Auditability**: Query `system.access.audit` to demonstrate compliance to regulatory auditors."""),

        ("databricks-q-091", "High-Frequency Streaming Feature Store for Real-Time Inference",
         "How do you architect a dual-layer Feature Store on Databricks supporting both offline training and online low-latency inference?",
         """Machine learning platforms require consistent feature definitions between offline batch training and real-time online inference:

### Dual-Layer Architecture:
1. **Offline Store (Unity Catalog Delta Lake)**:
   - Stores complete historical feature values.
   - Supports point-in-time time travel to construct training datasets without data leakage.
2. **Online Store (Low-Latency Key-Value Store)**:
   - Databricks Online Tables or external low-latency stores (AWS DynamoDB / Azure Cosmos DB).
   - Structured Streaming synchronizes feature updates from Delta Lake to the online store in real-time.
3. **Unified API**: The Databricks Feature Engineering client provides a unified interface: models look up features online via REST with sub-10ms latency."""),

        ("databricks-q-092", "Autonomous Table Compaction & Predictive Maintenance Architecture",
         "How do you design an enterprise-wide automated maintenance framework for 10,000+ Delta Lake tables across multiple domains?",
         """Manually scheduling `OPTIMIZE` and `VACUUM` across 10,000 tables leads to either over-compaction compute waste or severe query degradation:

### Autonomous Architecture:
1. **Enable Predictive Optimization**: Enable at the Unity Catalog metastore level, allowing Databricks AI to compact and vacuum tables autonomously.
2. **Supplemental Policy Daemon**:
   - A lightweight serverless workflow queries `information_schema.tables` and storage metrics daily.
   - For legacy or unmanaged tables, evaluates small-file ratios and triggers targeted bin-packing `OPTIMIZE` only when small files exceed 20% of total files.
3. **Safety Guardrails**: Strict retention thresholds (`RETAIN 168 HOURS`) enforced centrally to safeguard concurrent readers."""),

        ("databricks-q-093", "Lakehouse Semantic Layer Architecture",
         "How do you architect a centralized semantic layer on Databricks to provide consistent business metrics across multiple BI tools?",
         """A centralized semantic layer defines business metrics (e.g., Gross Revenue, Customer Lifetime Value) once, ensuring consistency across Power BI, Tableau, Looker, and AI agents:

### Architectural Approaches:
1. **Unity Catalog Certified Metric Views**: Author certified SQL views in Unity Catalog decorated with standardized tags and column comments.
2. **Cube.dev / dbt Semantic Layer Integration**: Deploy an open semantic engine querying Databricks SQL Serverless via JDBC/ODBC.
3. **Databricks AI/BI & Genie Integration**: Semantic spaces map natural language business queries directly to certified semantic models, eliminating metric discrepancies across departments."""),

        ("databricks-q-094", "Microservice CDC Lakehouse Ingestion at Scale",
         "How do you architect an enterprise CDC ingestion platform consolidating updates from 500+ microservice databases into Databricks?",
         """Consolidating CDC streams from 500+ relational databases (PostgreSQL, MySQL, Oracle) into a unified lakehouse requires high-throughput automation:

### Architectural Blueprint:
1. **CDC Extraction**: Debezium connectors stream database WAL logs into partitioned Apache Kafka topics.
2. **Auto Loader / DLT Ingestion**: Auto Loader streams raw CDC JSON payloads into partitioned Bronze Delta tables.
3. **DLT `APPLY CHANGES INTO`**: Declarative DLT pipelines deduplicate operations and apply SCD Type-1 or Type-2 updates into Silver tables automatically.
4. **Multi-Tenant Isolation**: Domains operate dedicated DLT pipelines to prevent microservice schema changes from impacting other domains."""),

        ("databricks-q-095", "Cross-Cloud Zero-Copy Data Exchange Architecture",
         "How do you architect a cross-cloud data sharing topology allowing external clients on AWS and Snowflake to query Azure Databricks data zero-copy?",
         """Zero-copy cross-cloud data sharing eliminates expensive batch extracts and FTP exports:

### Architecture:
1. **Storage Format**: Store data as Delta Lake with UniForm enabled in Azure ADLS Gen2.
2. **Open Delta Sharing Protocol**: Configure Delta Sharing recipients with temporary presigned SAS tokens.
3. **External Client Querying**:
   - Snowflake queries the table via external Iceberg catalog integrations.
   - AWS Python / Spark clients query the Delta Sharing endpoint directly.
   - Power BI queries live via native Delta Sharing connectors with zero compute spend on the Azure Databricks workspace."""),

        ("databricks-q-096", "Databricks Workflows vs Airflow for Enterprise Orchestration",
         "How do you evaluate whether to orchestrate pipelines using native Databricks Workflows versus Apache Airflow?",
         """Choosing between Databricks Workflows and Apache Airflow involves evaluating platform ecosystem alignment, operational overhead, and multi-system complexity:

### Databricks Workflows:
- **Strengths**: Fully managed, zero server maintenance; deep Lakehouse integration (DLT, notebooks, dbt, SQL warehouses); 50% cheaper Job Compute DBUs; built-in task repair and rerun.
- **Best For**: Workloads running predominantly within the Databricks Lakehouse ecosystem.

### Apache Airflow:
- **Strengths**: True multi-system orchestration spanning non-Databricks services (on-premises databases, Salesforce, AWS Lambda, Kubernetes, microservices).
- **Best For**: Enterprise-wide orchestration across heterogeneous software ecosystems.
- **Hybrid Best Practice**: Use Airflow to trigger Databricks Workflows as modular child DAG tasks using the Databricks provider."""),

        ("databricks-q-097", "Generative AI & RAG Enterprise Architecture on Databricks",
         "How do you architect an enterprise Retrieval-Augmented Generation (RAG) platform on Databricks combining Vector Search and Foundation Models?",
         """An enterprise RAG platform grounds generative AI outputs in proprietary company knowledge while maintaining strict data governance:

### Architectural Flow:
1. **Document Ingestion & Chunking**: Unstructured documents in Unity Catalog Volumes are parsed and chunked using LangChain/LlamaIndex.
2. **Vector Indexing**: Databricks Vector Search automatically computes and updates vector embeddings using managed embedding models.
3. **Foundation Model Serving**: Databricks Mosaic AI Model Serving provides high-throughput, low-latency REST endpoints for open-source (Llama 3, DBRX) and proprietary LLMs.
4. **Governance & Guardrails**: ABAC in Unity Catalog ensures users only retrieve context chunks they are authorized to view; MLflow evaluates hallucination and toxicity metrics."""),

        ("databricks-q-098", "Real-Time IoT Telemetry Lakehouse Ingestion",
         "How do you architect a lakehouse ingestion pipeline capable of ingesting 1 million IoT events per second with sub-5-second query latency?",
         """Ingesting 1M events/sec requires high-throughput messaging, streaming micro-batches, and optimized storage layout:

### Architectural Blueprint:
1. **Ingress Tier**: Azure Event Hubs / AWS Kinesis provisioned with 64+ partitions to absorb incoming device telemetry.
2. **Ingestion Engine**: Databricks Structured Streaming running on Photon-enabled compute consuming Kafka/Event Hubs offsets with `processingTime="2 seconds"`.
3. **Bronze Append-Only Delta**: Micro-batches append to Bronze with `checkpointInterval = 10` and `optimizeWrite = true`.
4. **Liquid Clustering on Silver**: Enriched Silver tables cluster by `(device_type, event_date)` to deliver sub-second aggregations for operational monitoring dashboards."""),

        ("databricks-q-099", "Enterprise Data Product Lifecycle Architecture",
         "How do you govern the full lifecycle of a Lakehouse Data Product from inception to deprecation using Unity Catalog?",
         """A Data Product is a self-contained, governed, and certified analytical dataset with formal ownership and SLAs:

### Lifecycle Stages:
1. **Inception & Authoring**: Domain team develops models in sandbox schemas (`marketing_dev`).
2. **Certification & Contract**: Model is promoted to production schema (`marketing_prod`), schema contracts are enforced (`contract: {enforced: true}`), and quality expectations are established.
3. **Tagging & Metadata**: Tagged with `lifecycle = 'certified'`, `owner = 'marketing_dataops'`, and `sla = 'daily_06_am'`.
4. **Discovery & Access**: Published in Unity Catalog for cross-domain discovery; access granted via role-based access requests.
5. **Deprecation**: When superseding versions are deployed, tag with `lifecycle = 'deprecated'`, notify consumers via lineage query logs, and maintain a 90-day grace period before archival."""),

        ("databricks-q-100", "Legacy Hadoop/Hive to Databricks Lakehouse Migration Strategy",
         "How do you architect a multi-petabyte migration from on-premises Hadoop/Hive to a cloud Databricks Lakehouse with zero business disruption?",
         """Migrating off legacy on-premises Hadoop/Hive clusters eliminates high hardware maintenance costs and operational complexity:

### Phased Migration Protocol:
1. **Phase 1: Cloud Storage Hydration**: Replicate historical HDFS Parquet/ORC data to cloud object storage (ADLS Gen2 / AWS S3) using DistCp or WANdisco.
2. **Phase 2: In-Place Delta Conversion**:
   - Convert Parquet files in-place to Delta Lake zero-copy:
```sql
CONVERT TO DELTA parquet.`s3://lake-data/sales/orders`;
```
3. **Phase 3: Dual-Ingestion & Parallel Runs**: Upstream ETL pipelines write to both legacy Hive and the new Databricks Lakehouse simultaneously. Run automated reconciliation scripts comparing row counts, checksums, and business metrics for 30 days.
4. **Phase 4: BI Cutover & Decommissioning**: Repoint BI dashboards to Databricks SQL Serverless Warehouses, verify performance acceleration, and decommission legacy on-premises Hadoop infrastructure."""),
    ]

    for qid, niche, q_text, ans in architect_data:
        items[qid] = {
            "id": qid,
            "source": "Questions DB",
            "category": "Databricks",
            "niche": niche,
            "difficulty": "ARCHITECT",
            "question": q_text,
            "answer": ans,
            "domain": "Data Engineering",
            "subdomain": "Lakehouse Architecture"
        }

    return items
