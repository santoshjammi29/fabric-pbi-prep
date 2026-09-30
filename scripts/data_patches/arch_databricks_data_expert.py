# arch_databricks_data_expert.py
# Scenarios 021-040 for Databricks Lakehouse Architecture (HARD & ARCHITECT)

def get_expert_databricks_scenarios():
    items = []

    # HARD (021 - 030)
    scenarios_hard = [
        ("arch-databricks-021", "Unity Catalog multi-workspace federation", "How do you architect and manage Unity Catalog across multi-workspace enterprise environments?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Unity Catalog (UC) is an account-level metastore designed to federate data governance across multiple Databricks workspaces. Rather than maintaining isolated Hive metastores per workspace, a single UC metastore binds to a cloud region and attaches to all regional workspaces (e.g., `dev`, `stage`, `prod`). 

Under UC multi-workspace federation:
- **Centralized Identity**: Users, groups, and service principals are synchronized at the Databricks account level.
- **Three-Level Namespace**: Objects are organized hierarchically as `catalog.schema.table_or_view`. Workspaces bind to catalogs either globally or via catalog-workspace assignment isolation.
- **Storage Credentials & External Locations**: Cloud IAM roles/managed identities are defined once in UC, eliminating the need to pass cloud access keys to individual compute clusters.

### Phase 2: Low-Level Mechanics & Implementation
1. **Catalog Isolation and Workspace Binding**: Assign catalogs exclusively to specific workspaces to isolate production pipelines from sandbox workspaces while allowing centralized visibility.
2. **Implementation Snippet (SQL & CLI)**:
```sql
-- Create an enterprise catalog isolated to prod workspace
CREATE CATALOG IF NOT EXISTS enterprise_prod
  MANAGED LOCATION 'abfss://prod-data@datalake.dfs.core.windows.net/managed'
  COMMENT 'Central production catalog for enterprise domain';

-- Workspace binding: restrict catalog access exclusively to prod workspace ID
-- (Default ISOLATION LEVEL is OPEN; RESTRICTED requires explicit workspace assignment)
ALTER CATALOG enterprise_prod SET ISOLATION RESTRICTED;

-- Bind catalog to production workspace via system schema or REST API
-- databricks workspace-bindings update catalog enterprise_prod --json '{"assign_workspaces": [1234567890123456]}'

-- Grant read access to marketing analysts on analytics schema
GRANT USAGE ON CATALOG enterprise_prod TO `marketing-analysts`;
GRANT USAGE ON SCHEMA enterprise_prod.marketing TO `marketing-analysts`;
GRANT SELECT ON ALL TABLES IN SCHEMA enterprise_prod.marketing TO `marketing-analysts`;
ALTER DEFAULT PRIVILEGES IN SCHEMA enterprise_prod.marketing GRANT SELECT ON TABLES TO `marketing-analysts`;
```
3. **Verification**: Query `system.access.audit` or `information_schema.table_privileges` to verify that workspace separation is enforced across workspace boundaries.

### Phase 3: Production Hardening & Gotchas
- **Cross-Region Latency & Egress**: Binding workspaces across distinct cloud regions to a single UC metastore introduces cross-region egress fees and higher API latency. *Remediation*: Deploy one UC metastore per cloud region and use Delta Sharing for cross-region data federation.
- **Accidental Broad Permissions at Metastore Level**: Granting `CREATE CATALOG` to developers at the account level allows unvetted metastore expansion. *Remediation*: Restrict metastore-level admin rights to the Cloud Platform Team and enforce catalog provisioning via Terraform or Databricks Asset Bundles (DABs).
- **Workspace-Local User Divergence**: Creating local users inside individual workspaces bypasses account SCIM and breaks UC grants. *Remediation*: Enforce Account SCIM sync from Microsoft Entra ID or Okta and disable workspace-level user creation."""),

        ("arch-databricks-022", "Delta Sharing for external data access", "How do you architect secure, zero-copy data exchange with external partners using Delta Sharing?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Delta Sharing is an open protocol developed by Databricks for secure, real-time, zero-copy data exchange across disparate organizations, clouds, and data platforms. Unlike traditional SFTP or batch extracts, Delta Sharing enables external recipients to query live Delta tables directly from object storage (S3, ADLS Gen2, GCS) without duplicating data.

Architectural pillars:
- **Databricks-to-Databricks Sharing**: UC-to-UC direct sharing without credentials; authenticated via Databricks account IDs and cloud IAM token exchange.
- **Open Sharing (External Recipient)**: External consumers on Snowflake, Power BI, Python, or Apache Spark authenticate via temporary presigned URLs issued by the Delta Sharing server using bearer tokens.

### Phase 2: Low-Level Mechanics & Implementation
1. **Delta Sharing Configuration**: Create a Share, add filtered partitions or tables, and provision an authenticated Recipient.
2. **Implementation Snippet (SQL & Python)**:
```sql
-- 1. Create a Delta Share
CREATE SHARE partner_b2b_share COMMENT 'Outbound daily aggregated customer metrics';

-- 2. Add tables to share with partition filtering
ALTER SHARE partner_b2b_share ADD TABLE enterprise_prod.analytics.customer_daily_summary
  AS customer_metrics
  PARTITION (region = 'EMEA')
  COMMENT 'EMEA partitioned customer aggregates';

-- 3. Create an external recipient with token activation link
CREATE RECIPIENT acme_logistics
  COMMENT 'Partner logistics data consumer';

-- Grant access on share to recipient
GRANT SELECT ON SHARE partner_b2b_share TO RECIPIENT acme_logistics;

-- Generate activation URL to download bearer credential profile file
DESCRIBE RECIPIENT acme_logistics;
```
3. **External Client Query (Python delta-sharing)**:
```python
import delta_sharing

profile_path = "/etc/secrets/acme_logistics_profile.json"
client = delta_sharing.SharingClient(profile_path)

# List available shared tables
tables = client.list_all_tables()

# Read directly into pandas or Apache Spark without compute overhead on provider
df = delta_sharing.load_as_pandas(f"{profile_path}#partner_b2b_share.customer_metrics")
print(f"Loaded {len(df)} records from Delta Share.")
```

### Phase 3: Production Hardening & Gotchas
- **Presigned URL Expiration During Long ETL Scans**: External engines reading massive multi-terabyte tables can encounter expired presigned S3/Azure URLs midway through query execution. *Remediation*: Increase presigned URL lifetime in UC metastore configuration or instruct recipients to partition their queries with pushdown filters.
- **Sensitive Row/Column Leakage**: Sharing an entire Delta table without partition filters can inadvertently expose PII across tenants. *Remediation*: Use Dynamic Views in Unity Catalog or explicit partition filtering in `ALTER SHARE ... ADD TABLE ... PARTITION` to constrain external exposure.
- **Token Rotation Vulnerability**: Statically emailed bearer activation URLs risk compromise if intercepted. *Remediation*: Deliver activation URLs through secure enterprise secret portals and set bearer token lifetimes to maximum 90 days with automated key rotation."""),

        ("arch-databricks-023", "Liquid Clustering vs Z-Ordering comparison", "How do you evaluate and implement Delta Lake Liquid Clustering as an alternative to classical partitioning and Z-Ordering?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Historically, Delta Lake performance tuning relied on hive-style table partitioning (`/year=2024/month=03/`) and `OPTIMIZE table ZORDER BY (colA, colB)`. While effective, classical partitioning suffers from critical flaws:
- **Partition Under-segmentation / Over-partitioning**: Creates millions of tiny files or rigid directory structures that cannot be adapted as query patterns change.
- **Z-Ordering Cost**: Requires full-table or full-partition rewriting every time data is appended, incurring exponential compute costs.

**Liquid Clustering** (`CLUSTER BY (colA, colB)`) replaces both partitioning and Z-Ordering with dynamic, flexible Hilbert-curve data co-location. It allows clustering keys to be redefined on the fly without rewriting historical data, and clustering is applied incrementally only to newly appended or unclustered files.

### Phase 2: Low-Level Mechanics & Implementation
1. **Liquid Clustering Configuration**: Define clustering columns on creation or alter existing Delta tables.
2. **Implementation Snippet (SQL)**:
```sql
-- Create a high-throughput transaction table with Liquid Clustering
CREATE TABLE enterprise_prod.telemetry.events (
    device_id STRING,
    event_timestamp TIMESTAMP,
    event_type STRING,
    payload STRING,
    processing_date DATE
)
USING DELTA
CLUSTER BY (device_id, event_timestamp);

-- Incremental optimization: runs only on unclustered micro-batches
OPTIMIZE enterprise_prod.telemetry.events;

-- Redefine clustering keys dynamically as business query patterns evolve
-- (Zero rewrite required for existing data; subsequent OPTIMIZE operations adapt automatically)
ALTER TABLE enterprise_prod.telemetry.events
  CLUSTER BY (device_id, event_type);

-- Run compaction and clustering on the updated key topology
OPTIMIZE enterprise_prod.telemetry.events;
```
3. **Verification**: Inspect physical file layouts and data skipping statistics via `DESCRIBE DETAIL enterprise_prod.telemetry.events;`.

### Phase 3: Production Hardening & Gotchas
- **Exceeding 4 Clustering Columns**: Specifying more than 4 columns in `CLUSTER BY` degrades space-filling curve skipping efficiency. *Remediation*: Limit clustering keys to 1 to 4 high-cardinality, frequently filtered columns (e.g., `tenant_id`, `event_date`).
- **Combining Classical Partitioning with Liquid Clustering**: Attempting to use `PARTITIONED BY` and `CLUSTER BY` on the same table throws an `AnalysisException`. *Remediation*: Liquid Clustering deprecates physical folder partitioning entirely; remove directory partitions when migrating.
- **Neglecting Background Compaction**: Appending millions of small records without regular clustering jobs causes read performance degradation. *Remediation*: Enable Predictive Optimization in Unity Catalog to allow Databricks serverless compute to cluster files autonomously."""),

        ("arch-databricks-024", "Serverless compute for DLT", "How do you architect, configure, and optimize Serverless Compute for Delta Live Tables (DLT) pipelines?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Delta Live Tables (DLT) with Serverless Compute decouples pipeline execution from classic virtual machine management in customer cloud VPCs. In classic DLT, Databricks deploys EC2 or Azure VM instances inside user subnets, incurring 3-7 minute startup latencies, cloud driver overhead, and idle capacity costs.

Under Serverless DLT:
- **Instantaneous Provisioning**: Compute clusters spin up in sub-second intervals from an elastic, Databricks-managed fleet.
- **Autonomous Autoscaling**: Databricks dynamically scales driver and worker nodes according to live micro-batch backlog and pipeline execution graphs without manual cluster policy definitions.
- **Fine-Grained Billing**: Workload consumption is billed purely in DBUs per second of active transformation, eliminating idle driver VM costs.

### Phase 2: Low-Level Mechanics & Implementation
1. **Pipeline Specification**: Define a serverless DLT pipeline in JSON or via Databricks Asset Bundles (DABs).
2. **Implementation Snippet (JSON / DAB)**:
```json
{
  "name": "ecommerce_serverless_dlt",
  "target": "enterprise_prod.orders",
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
    "pipelines.autoOptimize.zOrderCols": "order_id,customer_id",
    "spark.databricks.delta.preview.enabled": "true"
  },
  "notifications": [
    {
      "email_recipients": ["dataops@enterprise.com"],
      "alerts": ["on-update-failure", "on-update-fatal"]
    }
  ]
}
```
3. **Python DLT Code with Data Quality Expectations**:
```python
import dlt
from pyspark.sql.functions import col

@dlt.table(
    comment="Cleaned orders table running on Serverless DLT",
    table_properties={"quality": "silver"}
)
@dlt.expect_or_drop("valid_order_id", "order_id IS NOT NULL")
@dlt.expect_or_fail("valid_amount", "total_amount >= 0")
def orders_silver():
    return (
        dlt.read_stream("enterprise_prod.orders.orders_bronze")
        .filter(col("status") != "CANCELLED")
    )
```

### Phase 3: Production Hardening & Gotchas
- **VPC Peering & Network Isolation**: Serverless compute runs in Databricks-managed networks. Pipelines needing direct private IP access to on-premises databases fail. *Remediation*: Route traffic through Databricks Private Access Gateways or query internal data stores via Unity Catalog Lakehouse Federation.
- **Continuous Mode Runaway DBUs**: Running serverless DLT pipelines in `continuous: true` mode on intermittent low-throughput streams burns DBUs 24/7. *Remediation*: Use `continuous: false` (Triggered mode) paired with Databricks Workflows or cron triggers for batch and low-cadence streams.
- **Custom Native C++ or Python System Libraries**: Serverless environments do not allow arbitrary OS `apt-get` packages or root privileges. *Remediation*: Standardize Python dependencies in a `requirements.txt` file or use environment containers supported by Databricks Serverless."""),

        ("arch-databricks-025", "Databricks Asset Bundles CI/CD", "How do you implement an enterprise CI/CD deployment pipeline using Databricks Asset Bundles (DABs)?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Databricks Asset Bundles (DABs) is an Infrastructure-as-Code (IaC) framework that standardizes the authoring, testing, and deployment of complex Databricks projects (Jobs, DLT pipelines, ML models, notebooks, and libraries). 

Core architecture:
- **Declarative YAML Configuration**: Projects declare environments (`dev`, `staging`, `prod`), resource configurations, permissions, and variables in `databricks.yml`.
- **Target Isolation**: Bundles automatically prefix deployed artifacts and compute resources with target identifiers, preventing accidental overwriting of production assets during developer testing.
- **Headless Service Principal Deployment**: Production CI/CD runners authenticate via OAuth service principals, ensuring no personal developer tokens are tied to automated pipelines.

### Phase 2: Low-Level Mechanics & Implementation
1. **DAB Project Structure**: Define `databricks.yml` and resource definitions under `resources/`.
2. **Implementation Snippet (`databricks.yml`)**:
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
      root_path: /Users/${workspace.current_user.userName}/.bundle/${bundle.name}/${bundle.target}
    run_as:
      service_principal_name: 7b8431c1-45f8-4b2a-874e-6e54c0e6f982

resources:
  jobs:
    daily_revenue_etl:
      name: "[${bundle.target}] Daily Revenue ETL"
      tasks:
        - task_key: run_dbt_transform
          dbt_task:
            project_directory: ./dbt_revenue
            commands: ["dbt run", "dbt test"]
            warehouse_id: 2a98f12c40e7b901
```
3. **GitHub Actions CI/CD Workflow**:
```yaml
name: Deploy DABs to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: databricks/setup-cli@main
      - name: Validate Bundle
        run: databricks bundle validate -t prod
        env:
          DATABRICKS_HOST: ${{ secrets.DATABRICKS_PROD_HOST }}
          DATABRICKS_CLIENT_ID: ${{ secrets.DATABRICKS_CLIENT_ID }}
          DATABRICKS_CLIENT_SECRET: ${{ secrets.DATABRICKS_CLIENT_SECRET }}
      - name: Deploy to Prod
        run: databricks bundle deploy -t prod
        env:
          DATABRICKS_HOST: ${{ secrets.DATABRICKS_PROD_HOST }}
          DATABRICKS_CLIENT_ID: ${{ secrets.DATABRICKS_CLIENT_ID }}
          DATABRICKS_CLIENT_SECRET: ${{ secrets.DATABRICKS_CLIENT_SECRET }}
```

### Phase 3: Production Hardening & Gotchas
- **State File Desynchronization**: DAB maintains a `.bundle` state folder in the workspace. Multiple developers deploying from local machines concurrently can corrupt the deployed state. *Remediation*: Restrict production deployment exclusively to automated CI/CD runners (GitHub Actions / GitLab CI) and enforce read-only permissions for developers.
- **Using Development Mode in Production**: Setting `mode: development` creates scratch folders and appends developer usernames to resources, causing jobs to stop if an employee leaves. *Remediation*: Always enforce `mode: production` in production target configuration.
- **Hardcoding Secrets in YAML**: Putting database credentials or external tokens in `databricks.yml`. *Remediation*: Reference secrets dynamically using Databricks Secret Scopes: `{{secrets/finance_scope/db_password}}`."""),

        ("arch-databricks-026", "SCIM provisioning for enterprise IAM", "How do you architect automated SCIM user and group provisioning from enterprise identity providers into Databricks?",
"""### Phase 1: Conceptual Foundation & Core Architecture
System for Cross-domain Identity Management (SCIM) is the enterprise standard for automating user identity lifecycle management (onboarding, role assignment, offboarding) between an Identity Provider (IdP: Microsoft Entra ID, Okta, PingFederate) and cloud applications.

In Databricks:
- **Account-Level SCIM (Modern Standard)**: The IdP pushes users, groups, and service principals directly to the Databricks Account Console. Identities are then assigned to specific workspaces through workspace access policies.
- **Workspace-Level SCIM (Legacy)**: Provisioning users into individual workspaces results in fragmented identities, inconsistent UC permissions, and orphan accounts upon employee departures.

### Phase 2: Low-Level Mechanics & Implementation
1. **SCIM Token Generation & IdP Configuration**: Generate an Account SCIM token from the Databricks Account Admin Console and configure the enterprise application in Entra ID / Okta.
2. **Implementation Snippet (Databricks Account SCIM API & Terraform)**:
```hcl
# Terraform configuration for Account SCIM Group and Workspace Assignment
resource "databricks_group" "data_engineers" {
  display_name = "corp-data-engineers"
}

resource "databricks_service_principal" "ci_runner" {
  application_id = "00000000-0000-0000-0000-000000000001"
  display_name   = "github-actions-service-principal"
}

# Assign synchronized group to production workspace
resource "databricks_mws_permission_assignment" "prod_engineers" {
  workspace_id = 1234567890123456
  principal_id = databricks_group.data_engineers.id
  permissions  = ["USER"]
}

# Assign administrative privileges to cloud platform team
resource "databricks_mws_permission_assignment" "prod_admins" {
  workspace_id = 1234567890123456
  principal_id = "group-account-admins-id"
  permissions  = ["ADMIN"]
}
```
3. **Verification**: Query the SCIM Users API:
```bash
curl -X GET "https://accounts.cloud.databricks.com/api/2.0/accounts/$ACCOUNT_ID/scim/v2/Users" \
  -H "Authorization: Bearer $SCIM_TOKEN"
```

### Phase 3: Production Hardening & Gotchas
- **Orphaned Compute Resources on Deprovisioning**: When an engineer departs, their Entra ID account is soft-deleted, but jobs and scheduled notebooks owned by their personal identity immediately fail. *Remediation*: Enforce that all production jobs, DLT pipelines, and dashboards are owned by Service Principals, never individual user accounts.
- **Token Expiration on Account SCIM Connectors**: IdP SCIM integration tokens that expire without monitoring halt user onboarding silently. *Remediation*: Generate Databricks OAuth M2M credentials for IdP synchronization rather than personal access tokens.
- **Nested Group Synchronization Failures**: Many IdPs do not flatten nested security groups over standard SCIM 2.0 endpoints. *Remediation*: Flatten functional groups in the IdP or create explicit Databricks workspace assignment groups (e.g., `databricks-prod-analysts`)."""),

        ("arch-databricks-027", "Predictive optimization enabling", "How do you architect, monitor, and govern Predictive Optimization in Databricks Unity Catalog?",
"""### Phase 1: Conceptual Foundation & Core Architecture
In classical data lakehouse operations, platform teams must write and schedule manual maintenance jobs to execute `OPTIMIZE`, `ZORDER`, and `VACUUM` on thousands of Delta tables. Under-compaction causes query degradation, while over-compaction wastes tens of thousands of dollars in cluster compute.

**Predictive Optimization** is an autonomous AI-driven service built into Databricks Unity Catalog. It continuously analyzes table read/write patterns, file sizes, and clustering effectiveness. When optimization benefits outweigh compute costs, Databricks serverless engines autonomously run:
- **Compaction**: Merges small files into optimal 128 MB-1 GB sizes.
- **VACUUM**: Prunes uncommitted or expired data files beyond table retention periods safely.
- **Clustering**: Reorganizes Liquid-clustered tables according to actual query predicate patterns.

### Phase 2: Low-Level Mechanics & Implementation
1. **Enabling Predictive Optimization**: Can be enabled at the Account, Metastore, Catalog, or Schema level.
2. **Implementation Snippet (SQL)**:
```sql
-- Enable Predictive Optimization on an entire production catalog
ALTER CATALOG enterprise_prod ENABLE PREDICTIVE OPTIMIZATION;

-- Alternatively, enable on a specific high-frequency schema
ALTER SCHEMA enterprise_prod.telemetry ENABLE PREDICTIVE OPTIMIZATION;

-- Inspect optimization history and serverless operations
SELECT 
    start_time,
    end_time,
    table_name,
    operation_type,
    metrics.num_files_compacted,
    metrics.num_bytes_vacuumed
FROM system.storage.predictive_optimization_operations_history
WHERE catalog_name = 'enterprise_prod'
ORDER BY start_time DESC
LIMIT 50;
```
3. **Cost Monitoring Query**:
```sql
-- Track DBUs consumed by Predictive Optimization in system billing table
SELECT 
    usage_date,
    sku_name,
    sum(usage_quantity) as total_dbus,
    sum(usage_quantity * 0.07) as estimated_cost_usd
FROM system.billing.usage
WHERE usage_metadata.job_name = 'Predictive Optimization'
GROUP BY usage_date, sku_name
ORDER BY usage_date DESC;
```

### Phase 3: Production Hardening & Gotchas
- **Time Travel Interruption from Aggressive VACUUM**: If predictive optimization runs `VACUUM` with short retention periods, downstream historical queries or audit rollbacks fail. *Remediation*: Verify that table property `delta.deletedFileRetentionDuration` is configured to at least 7 days (`interval 7 days`) on production tables.
- **Cost Runaway on Temporary / Staging Tables**: Enabling predictive optimization at the metastore level automatically optimizes short-lived scratch tables, burning DBUs needlessly. *Remediation*: Explicitly disable predictive optimization on staging and scratch schemas (`ALTER SCHEMA scratch DISABLE PREDICTIVE OPTIMIZATION`).
- **Concurrent Write Conflicts**: Predictive optimization operations run concurrently with streaming ingestion. In rare edge cases on legacy tables without Liquid Clustering, compaction can cause write conflict retries. *Remediation*: Migrate tables to Liquid Clustering where serverless compaction is completely non-blocking."""),

        ("arch-databricks-028", "Structured Streaming stateful processing", "How do you architect robust stateful stream processing using flatMapGroupsWithState and RocksDB state store in Databricks?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Standard streaming aggregations (`groupBy().count()`) with watermarks maintain state only within fixed time windows. When building complex real-time applications—such as multi-event sessionization, fraud detection across non-deterministic event arrivals, or IoT device status state machines—data engineers require arbitrary stateful processing.

In Databricks Structured Streaming:
- **`flatMapGroupsWithState` / `applyInPandasWithState`**: Enables developers to define explicit, stateful transition logic per grouping key.
- **RocksDB State Store Provider**: Replaces the default Java Virtual Machine (JVM) heap state store with an off-heap embedded key-value database (RocksDB), allowing states to scale to billions of keys and hundreds of gigabytes per worker node without triggering Java Out-Of-Memory (OOM) or Garbage Collection (GC) pauses.

### Phase 2: Low-Level Mechanics & Implementation
1. **Cluster and Session Configuration**: Enable RocksDB state store and native memory management.
2. **Implementation Snippet (PySpark / Scala)**:
```python
# Configure RocksDB state store provider
spark.conf.set(
    "spark.sql.streaming.stateStore.providerClass",
    "com.databricks.sql.streaming.state.RocksDBStateStoreProvider"
)
spark.conf.set("spark.sql.streaming.stateStore.rocksdb.compactOnCommit", "true")

from pyspark.sql.functions import col
from pyspark.sql.types import StructType, StructField, StringType, LongType, TimestampType

# Define state structure
# In Python Spark 3.4+, use applyInPandasWithState for arbitrary stateful micro-batches:
def sessionize_events(key, pdf_iter, state):
    session_id, device_id = key
    events = []
    
    # Process incoming rows for this device
    for pdf in pdf_iter:
        for _, row in pdf.iterrows():
            events.append(row)
            
    # Update persistent off-heap state
    if state.exists:
        prev_count = state.get()[0]
    else:
        prev_count = 0
        
    new_count = prev_count + len(events)
    state.update((new_count,))
    
    # Yield summarized output
    import pandas as pd
    yield pd.DataFrame({
        "device_id": [device_id],
        "total_event_count": [new_count],
        "last_seen": [pd.Timestamp.now()]
    })

# Stream processing query using RocksDB checkpoint
# df.groupBy("tenant_id", "device_id").applyInPandasWithState(...)
```
3. **State Checkpoint Hygiene**: Mount checkpoints to reliable, high-IOPS cloud object storage (S3/ADLS Gen2).

### Phase 3: Production Hardening & Gotchas
- **State Store Bloat from Missing State Timeouts**: Failing to set state expiration timeouts (`GroupStateTimeout.ProcessingTimeTimeout` or `EventTimeTimeout`) causes state keys to accumulate indefinitely, eventually exhausting local worker disk space. *Remediation*: Always implement timeout checks in state transition functions to explicitly call `state.remove()` when sessions go dormant.
- **Checkpoint Corruption on Schema Evolution**: Modifying the internal state schema structure between pipeline deployments causes deserialization exceptions upon restart. *Remediation*: Version state objects explicitly in schemas and test state migration compatibility before deploying new code.
- **JVM Heap Exhaustion with Default State Store**: Running stateful pipelines without enabling the RocksDB provider stores state in Java heap, leading to severe executor GC pauses. *Remediation*: Always set `providerClass` to `RocksDBStateStoreProvider` in production streaming jobs."""),

        ("arch-databricks-029", "Spark Connect for remote execution", "How do you architect modern client-server Spark applications using Spark Connect on Databricks?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Historically, building applications that interact with Apache Spark required running fat client drivers inside the same JVM or cluster environment, creating major challenges:
- Heavy driver dependencies conflicting with client applications.
- Difficulties debugging Spark code from local developer IDEs.
- Inability to build lightweight web backends, microservices, or interactive applications without massive cluster overhead.

**Spark Connect** (introduced in Spark 3.4 and standard in Databricks Runtime 13.0+) decouples the Spark client API from the execution engine:
- **Thin Client Architecture**: The client library (Python, Go, Rust) converts DataFrame operations into an unresolved logical plan protocol buffer (Protobuf).
- **gRPC Protocol**: The plan is transmitted over standard gRPC/HTTP/2 to the Databricks Spark Connect endpoint.
- **Server-Side Optimization**: The remote Databricks cluster parses, optimizes via Catalyst, and executes the physical plan, streaming back only the requested query results.

### Phase 2: Low-Level Mechanics & Implementation
1. **Remote Connection Configuration**: Connect from local machine or backend service directly to Databricks cluster.
2. **Implementation Snippet (Python Client)**:
```python
from pyspark.sql import SparkSession
import os

# Initialize lightweight Spark Connect session pointing to Databricks remote compute
databricks_host = "https://adb-123456789.azuredatabricks.net"
cluster_id = "0320-141200-abcd123"
token = os.environ.get("DATABRICKS_TOKEN")

connection_string = (
    f"sc://{databricks_host.replace('https://', '')}:443/;"
    f"token={token};"
    f"x-databricks-cluster-id={cluster_id}"
)

# Zero local Spark or JVM installation required!
spark = SparkSession.builder.remote(connection_string).getOrCreate()

# Execute remote DataFrame transformations seamlessly
df = spark.table("enterprise_prod.analytics.customer_churn")
top_risk_df = (
    df.filter(df.risk_score > 0.85)
    .groupBy("region")
    .count()
    .orderBy("count", ascending=False)
)

# Triggers remote Catalyst planning; returns pandas dataframe locally
local_results = top_risk_df.toPandas()
print(local_results)
```
3. **Verification**: Observe active gRPC sessions and remote execution queries in the Databricks Spark UI.

### Phase 3: Production Hardening & Gotchas
- **Unsupported Legacy RDD APIs**: Spark Connect operates purely on DataFrames and SQL. Attempting to use low-level RDD methods (`sparkContext.parallelize`, `rdd.map`) throws `NotImplementedError`. *Remediation*: Refactor low-level RDD transformations into Spark SQL functions or Pandas UDFs.
- **Cluster Inactivity Timeouts on Long Client Pauses**: If an interactive local debug session pauses while holding a cluster lock, auto-termination clusters may shut down. *Remediation*: Connect Spark Connect to Databricks Serverless compute or shared high-concurrency clusters with appropriate timeout settings.
- **Client-Side Python UDF Serialization Mismatches**: Registering client-side Python UDFs when local Python versions differ from Databricks Runtime Python versions causes pickle deserialization errors. *Remediation*: Enforce identical virtual environment configurations locally using tools like `uv` or Docker matching the target DBR version."""),

        ("arch-databricks-030", "Databricks Connect v2 local dev workflow", "How do you architect a professional local software engineering workflow for Databricks using Databricks Connect v2 and VS Code?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Databricks Connect v2 leverages the Spark Connect architecture to provide an enterprise-grade local development experience. Rather than developing inside web browser notebooks with limited refactoring, testing, and linting capabilities, engineers can work inside modern IDEs (VS Code, PyCharm, Cursor).

Architecture benefits:
- **Local Testing & Stepping**: Set breakpoints in VS Code, step through Python code line-by-line, and inspect local and remote DataFrame schemas.
- **Unit Testing with CI/CD**: Run `pytest` locally or on CI runners against remote Databricks clusters without deploying notebooks.
- **Enterprise Software Hygiene**: Facilitates modular OOP code, strict linting (`ruff`, `flake8`), type checking (`mypy`), and Git version control.

### Phase 2: Low-Level Mechanics & Implementation
1. **Environment Setup**: Install `databricks-connect` matching the exact Databricks Runtime (DBR) version.
2. **Implementation Snippet (Configuration & Test)**:
```bash
# Install Databricks Connect matching target DBR (e.g., DBR 14.3 LTS)
pip install databricks-connect==14.3.0
```
```python
# tests/test_transformation.py
import pytest
from databricks.connect import DatabricksSession
from pyspark.sql.functions import col

@pytest.fixture(scope="session")
def spark():
    # Automatically picks up credentials from ~/.databrickscfg or env vars
    return DatabricksSession.builder.getOrCreate()

def calculate_net_revenue(df):
    return df.withColumn("net_amount", col("gross_amount") - col("tax_amount"))

def test_calculate_net_revenue(spark):
    test_data = [(100.0, 10.0), (250.0, 25.0)]
    schema = ["gross_amount", "tax_amount"]
    df = spark.createDataFrame(test_data, schema)
    
    result = calculate_net_revenue(df).collect()
    assert result[0]["net_amount"] == 90.0
    assert result[1]["net_amount"] == 225.0
```
3. **VS Code Extension Integration**: Configure `.vscode/settings.json` to link the Databricks extension with target cluster IDs and bundle deployment profiles.

### Phase 3: Production Hardening & Gotchas
- **Version Mismatch Between Client and DBR**: Installing `databricks-connect` 14.3 against a cluster running DBR 13.3 produces subtle protocol deserialization bugs. *Remediation*: Pin the exact Databricks Connect version in `pyproject.toml` or `requirements-dev.txt` matching production clusters.
- **Accidental Production Data Mutations During Local Debugging**: Running local scripts with write operations (`df.write.saveAsTable(...)`) against production catalogs can overwrite live data. *Remediation*: Enforce workspace binding isolation and instruct local test sessions to execute strictly against sandbox catalogs (`dev_catalog`).
- **Cluster Startup Latency During Test Iterations**: Waiting for stopped all-purpose clusters to boot up before running a 2-second unit test hurts developer flow. *Remediation*: Point local tests to warm shared development clusters or utilize local unit test mocks (e.g., `chispa` + local PySpark) for rapid unit logic, reserving Databricks Connect for end-to-end integration tests."""),
    ]

    for id_val, niche, q_text, ans in scenarios_hard:
        items.append({
            "id": id_val,
            "source": "Architecture Hub",
            "category": "Databricks Lakehouse Architecture",
            "niche": niche,
            "difficulty": "HARD",
            "question": q_text,
            "answer": ans
        })

    # ARCHITECT (031 - 040)
    scenarios_architect = [
        ("arch-databricks-031", "Databricks Lakehouse vs Snowflake at petabyte scale", "How do you evaluate and architect a petabyte-scale comparison between Databricks Lakehouse and Snowflake?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Evaluating Databricks Lakehouse vs Snowflake at petabyte scale requires analyzing trade-offs across storage formats, compute elasticity, workload diversity, and total cost of ownership (TCO).

**Architectural Comparison**:
- **Storage & Open Formats**: Databricks builds on open Apache Parquet and Delta Lake with Delta Sharing, avoiding vendor lock-in. Snowflake traditionally stores data in proprietary micro-partitions (though it now supports Apache Iceberg external tables).
- **Workload Versatility**: Databricks excels in unified workloads spanning ETL, streaming, data science, complex Python/C++ libraries, and ML/AI model serving (Mosaic AI). Snowflake is optimized for SQL BI, analytical warehousing, and data applications via Snowpark.
- **Compute Architecture**: Databricks separates control plane from data plane (running compute in customer cloud accounts or managed serverless). Snowflake is a fully managed SaaS multi-tenant platform.

### Phase 2: Low-Level Mechanics & Implementation
1. **Decision Matrix & Evaluation Framework**:
   - High-throughput streaming & ML feature pipelines: Databricks (Structured Streaming + Photon engine).
   - Direct BI concurrency with sub-second dashboard requirements: Databricks SQL Serverless or Snowflake Virtual Warehouses.
   - Cross-cloud open data architecture: Databricks with Delta Lake / UniForm.
2. **Benchmark Query Optimization (Databricks Photon & Liquid Clustering)**:
```sql
-- Optimize a 500-billion-row telemetry table in Databricks for sub-second BI
CREATE TABLE enterprise_lakehouse.telemetry.metrics (
    sensor_id STRING,
    event_timestamp TIMESTAMP,
    metric_code STRING,
    metric_value DOUBLE
)
USING DELTA
CLUSTER BY (sensor_id, event_timestamp);

-- Enable UniForm (Universal Format) to allow Snowflake to query the same Delta table as Iceberg
ALTER TABLE enterprise_lakehouse.telemetry.metrics
SET TBLPROPERTIES (
  'delta.universalFormat.enabledFormats' = 'iceberg'
);
```
3. **Snowflake External Iceberg Catalog Query**:
```sql
-- Snowflake can read the identical Databricks Delta table via Iceberg metadata zero-copy
CREATE EXTERNAL TABLE snowflake_db.public.metrics
USING ICEBERG
LOCATION = 's3://enterprise-lakehouse/telemetry/metrics/'
CATALOG = 'databricks_uc_iceberg_catalog';
```

### Phase 3: Production Hardening & Gotchas
- **Concurrency Bottlenecks on Classic Spark Drivers**: Classic Databricks all-purpose clusters degrade under 500+ concurrent BI users. *Remediation*: Route all BI/dashboard traffic to Databricks SQL Serverless warehouses with multi-cluster load balancing.
- **Snowflake Cloud Egress in Hybrid Deployments**: Extracting petabytes of data from Snowflake into external ML pipelines incurs massive egress fees. *Remediation*: Standardize on open storage (Delta/Iceberg in cloud object storage) so both engines query the same data in-place.
- **Compute Idle Burn**: Leaving large Databricks clusters or Snowflake warehouses running without auto-suspend. *Remediation*: Enforce aggressive 5-minute auto-termination on all Databricks clusters and 60-second auto-suspend on Snowflake warehouses."""),

        ("arch-databricks-032", "Multi-cloud Databricks deployment (Azure + AWS)", "How do you architect an enterprise multi-cloud Databricks deployment spanning Azure and AWS?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Enterprises adopt multi-cloud Databricks architectures to prevent single-cloud vendor lock-in, satisfy regional compliance mandates, and support business acquisitions. 

Architectural pillars for multi-cloud parity:
- **Centralized Infrastructure-as-Code**: Provision workspaces, network subnets, PrivateLink/Private Endpoints, and storage using unified Terraform modules (`databricks/databricks` provider).
- **Federated Governance via Unity Catalog & Delta Sharing**: Connect disparate cloud regions using Delta Sharing to exchange data between Azure ADLS Gen2 and AWS S3 without custom point-to-point replication jobs.
- **Consistent Identity & Security**: Synchronize users, groups, and service principals from a single enterprise IdP (Microsoft Entra ID / Okta) into both Azure and AWS Databricks Account Consoles.

### Phase 2: Low-Level Mechanics & Implementation
1. **Terraform Multi-Cloud Deployment**:
```hcl
# Shared Unity Catalog Delta Share between AWS and Azure
provider "databricks" {
  alias = "aws_account"
  host  = "https://accounts.cloud.databricks.com"
  account_id = var.aws_account_id
}

provider "databricks" {
  alias = "azure_account"
  host  = "https://accounts.azuredatabricks.net"
  account_id = var.azure_account_id
}

# Delta Sharing recipient on Azure reading AWS shared catalog
resource "databricks_recipient" "azure_reciprocal" {
  provider = databricks.aws_account
  name     = "azure_production_recipient"
  sharing_code = var.azure_sharing_identifier
  authentication_type = "DATABRICKS"
}
```
2. **Cross-Cloud Query Execution**:
```sql
-- Querying AWS-hosted data from an Azure Databricks workspace via Delta Sharing
CREATE CATALOG aws_telemetry_shared
  USING SHARE aws_account.telemetry_share;

SELECT 
    date_trunc('day', event_time) as day,
    count(*) as total_events
FROM aws_telemetry_shared.iot.sensor_telemetry
GROUP BY 1;
```

### Phase 3: Production Hardening & Gotchas
- **Massive Inter-Cloud Egress Costs**: Running frequent joins between multi-terabyte tables hosted in AWS S3 and Azure ADLS Gen2 creates astronomical cross-cloud egress charges. *Remediation*: Replicate frequently joined dimension tables locally or process compute in the cloud where raw telemetry originates, publishing only condensed summary tables across clouds.
- **Network PrivateLink Discrepancies**: Azure Private Endpoints and AWS PrivateLink have differing DNS resolution rules and gateway limits. *Remediation*: Standardize workspace control plane and data plane network topology using automated Terraform landing zones.
- **Inconsistent DBR Versions Across Clouds**: Deploying pipelines on different Databricks Runtime versions across AWS and Azure causes subtle behavioral bugs. *Remediation*: Pin runtime versions explicitly in Databricks Asset Bundles across all target environments."""),

        ("arch-databricks-033", "Unity Catalog enterprise governance topology", "How do you design and enforce an enterprise data governance topology using Databricks Unity Catalog?",
"""### Phase 1: Conceptual Foundation & Core Architecture
An enterprise Unity Catalog topology must balance business agility (domain autonomy) with strict regulatory compliance (GDPR, HIPAA, SOX). 

**Recommended Top-Level Architecture**:
- **3-Level Hierarchy**: `Catalog` (Business Domain or Environment) -> `Schema` (Data Layer / Subject Area) -> `Table/View/Volume`.
- **Environment Catalogs vs Domain Catalogs**:
  - Strategy A (Environment First): `prod.finance_gold.transactions`, `dev.finance_gold.transactions`.
  - Strategy B (Domain First): `finance.gold_transactions`, `finance.silver_ledger` (with workspace isolation).
- **Data Product Layering**: Enforce Medallion architecture within schemas: `bronze_raw`, `silver_cleaned`, `gold_curated`.
- **Attribute-Based Access Control (ABAC)**: Enforce row-level filters and column-level masking tags centrally.

### Phase 2: Low-Level Mechanics & Implementation
1. **Dynamic Data Masking and Row Filtering**:
```sql
-- Create centralized governance functions in a shared system schema
CREATE FUNCTION enterprise_prod.governance.mask_ssn(ssn STRING)
RETURN IF(IS_ACCOUNT_GROUP_MEMBER('hr_executives'), ssn, CONCAT('***-**-', RIGHT(ssn, 4)));

CREATE FUNCTION enterprise_prod.governance.region_row_filter(record_region STRING)
RETURN IS_ACCOUNT_GROUP_MEMBER('global_executives') OR 
       IS_ACCOUNT_GROUP_MEMBER(CONCAT('analysts_', LOWER(record_region)));

-- Apply dynamic column mask to sensitive PII
ALTER TABLE enterprise_prod.hr.employees 
  ALTER COLUMN ssn SET MASK enterprise_prod.governance.mask_ssn;

-- Apply row-level security policy
ALTER TABLE enterprise_prod.sales.orders 
  SET ROW FILTER enterprise_prod.governance.region_row_filter ON (region);
```
2. **Tagging and System Audit Reporting**:
```sql
-- Tag sensitive columns for automated compliance auditing
ALTER TABLE enterprise_prod.hr.employees 
  ALTER COLUMN ssn SET TAGS ('compliance' = 'gdpr_pii', 'sensitivity' = 'critical');

-- Query lineage to identify all downstream tables consuming sensitive PII
SELECT 
    source_table_full_name,
    target_table_full_name,
    target_column_name
FROM system.access.column_lineage
WHERE source_column_name = 'ssn';
```

### Phase 3: Production Hardening & Gotchas
- **Performance Overhead of Complex Row Filters**: Applying heavy joins or subqueries inside row-filter functions slows down analytical BI scans. *Remediation*: Keep row-filter functions lightweight using built-in session functions (`IS_ACCOUNT_GROUP_MEMBER()`, `CURRENT_USER()`) rather than dynamic database lookups.
- **Metastore Admin Privilege Creep**: Granting full Metastore Admin rights to individual project leads bypasses all security isolation. *Remediation*: Metastore Admin should be held exclusively by automated service principals, granting project leads `USE CATALOG` and `CREATE SCHEMA` privileges only.
- **External Unmanaged Tables Bypassing Governance**: Writing data to cloud storage using raw file paths (`s3://...`) bypasses UC audits. *Remediation*: Disable legacy Hive metastore and enforce Unity Catalog managed tables or registered External Locations exclusively."""),

        ("arch-databricks-034", "Cost optimization (DBU management, spot instances, serverless)", "How do you architect a comprehensive Databricks FinOps and cost optimization framework across DBUs and cloud compute?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Databricks costs consist of two components: Databricks Unit (DBU) software licensing charges and underlying cloud provider virtual machine/storage infrastructure costs. An effective FinOps framework optimizes both vectors simultaneously.

Core optimization levers:
- **Compute Tier Right-Sizing**: Differentiate all-purpose interactive clusters (expensive DBUs) from automated Job clusters (cheaper DBUs) and Databricks SQL Serverless.
- **Spot / Low-Priority Worker Utilization**: Utilize 100% cloud spot instances for worker nodes in stateless batch jobs with fallbacks to on-demand driver nodes.
- **Autonomous Lifecycle Management**: Aggressive cluster auto-termination, serverless autoscaling, and Predictive Optimization.
- **FinOps Governance**: Attribution via enforced tagging, budget alerting, and system billing analytics.

### Phase 2: Low-Level Mechanics & Implementation
1. **Cluster Policy Enforcing Spot Instances and Auto-Termination**:
```json
{
  "autotermination_minutes": {
    "type": "range",
    "maxValue": 20,
    "defaultValue": 15,
    "isOptional": false
  },
  "aws_attributes.spot_bid_price_percent": {
    "type": "fixed",
    "value": 100,
    "hidden": false
  },
  "aws_attributes.first_on_demand": {
    "type": "fixed",
    "value": 1,
    "hidden": true
  },
  "custom_tags.CostCenter": {
    "type": "regex",
    "pattern": "CC-[0-9]{4}",
    "isOptional": false
  }
}
```
2. **FinOps Analytics Query on Databricks System Tables**:
```sql
-- Analyze top DBU consumers by workspace, SKU, and tag
SELECT 
    usage_date,
    workspace_id,
    sku_name,
    custom_tags['CostCenter'] AS cost_center,
    sum(usage_quantity) as total_dbus,
    sum(usage_quantity * 0.15) as estimated_spend_usd
FROM system.billing.usage
WHERE usage_date >= current_date() - interval 30 days
GROUP BY 1, 2, 3, 4
ORDER BY total_dbus DESC;
```

### Phase 3: Production Hardening & Gotchas
- **Spot Instance Eviction on Critical SLA Jobs**: High spot instance eviction rates during peak cloud demand can cause ETL jobs to fail. *Remediation*: Always keep driver nodes On-Demand (`first_on_demand: 1`) and enable Databricks cluster auto-recovery, or use Job Compute policies with on-demand fallback.
- **Running Production ETL on All-Purpose Interactive Clusters**: Submitting scheduled jobs to long-running all-purpose clusters doubles DBU costs. *Remediation*: Cluster policies must restrict scheduled jobs to ephemeral Single-Job clusters or Databricks Workflows.
- **Unbounded SQL Warehouse Idle Costs**: SQL Warehouses with 60-minute auto-suspend timers idling after queries complete. *Remediation*: Switch to Databricks SQL Serverless with auto-suspend configured to 5 minutes or less."""),

        ("arch-databricks-035", "Data mesh on Databricks with Unity Catalog", "How do you architect a decentralized Data Mesh architecture on Databricks using Unity Catalog?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Data Mesh treats data as a product and decentralizes ownership away from a monolithic central data engineering team to autonomous, cross-functional domain teams (e.g., Marketing, Supply Chain, Payments).

Implementation on Databricks:
- **Domain Data Ownership**: Each business domain owns an independent Unity Catalog (`marketing_domain`, `logistics_domain`) and underlying storage containers.
- **Data Products as Contracts**: Domain teams publish curated data products through governed Gold schemas with strict schema contracts and data quality SLAs.
- **Federated Governance**: Global policies (data classification, PII masking, audit logging) are defined at the account/metastore level, while domain teams autonomously manage table grants.
- **Self-Service Platform**: Central platform teams provide automated CI/CD templates, compute policies, and security guardrails rather than authoring business ETL.

### Phase 2: Low-Level Mechanics & Implementation
1. **Domain Catalog Architecture and Ownership**:
```sql
-- Central platform team provisions domain catalog and grants ownership
CREATE CATALOG IF NOT EXISTS supply_chain_domain
  MANAGED LOCATION 'abfss://supply-chain@lake.dfs.core.windows.net/data';

-- Transfer ownership to the Supply Chain Lead service principal / group
ALTER CATALOG supply_chain_domain OWNER TO `supply-chain-leads`;

-- Domain team creates published data product schema
CREATE SCHEMA supply_chain_domain.product_inventory_levels
  COMMENT 'Data Product: Real-time warehouse inventory and fulfillment metrics';

-- Enforce schema contract and table properties
CREATE TABLE supply_chain_domain.product_inventory_levels.current_stock (
    sku_id STRING NOT NULL COMMENT 'Universal Stock Keeping Unit ID',
    warehouse_id STRING NOT NULL,
    available_qty INT NOT NULL,
    reserved_qty INT NOT NULL,
    updated_at TIMESTAMP NOT NULL
)
USING DELTA
TBLPROPERTIES (
  'data_product.owner' = 'supply_chain_team',
  'data_product.sla' = '15_minutes',
  'data_product.tier' = 'gold'
);

-- Grant consumption privileges to consumer domains (e.g., Finance)
GRANT USAGE ON CATALOG supply_chain_domain TO `finance-analysts`;
GRANT USAGE ON SCHEMA supply_chain_domain.product_inventory_levels TO `finance-analysts`;
GRANT SELECT ON TABLE supply_chain_domain.product_inventory_levels.current_stock TO `finance-analysts`;
```
2. **Lineage Discovery**: Consumers inspect data product lineage across domains via Unity Catalog UI or `system.access.table_lineage`.

### Phase 3: Production Hardening & Gotchas
- **Domain Inter-Dependency Deadlocks**: Domain A changes an upstream table schema, silently breaking Domain B's analytical models. *Remediation*: Enforce Semantic Versioning on data product schemas and use Delta Lake schema enforcement with explicit deprecation cycles.
- **Siloed Domain Architectures**: Autonomous domain teams adopting conflicting storage conventions and naming standards. *Remediation*: Central platform teams enforce Databricks Asset Bundle templates and automated linters in CI/CD pull requests.
- **Duplicate Computation Across Domains**: Multiple domains computing identical customer metrics. *Remediation*: Promote authoritative Enterprise Data Products in Unity Catalog and maintain a searchable internal data marketplace catalog."""),

        ("arch-databricks-036", "Databricks + dbt production integration", "How do you architect an enterprise production data transformation pipeline combining dbt (Core/Cloud) and Databricks SQL Serverless?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Combining dbt and Databricks SQL Serverless marries the modular modeling, testing, and documentation of dbt with the raw processing speed, instant boot, and low cost of Databricks Photon and Unity Catalog.

Architectural pillars:
- **dbt-databricks Adapter**: Leverages native Databricks REST and Thrift APIs to push SQL transformations down to Databricks SQL Serverless Warehouses.
- **Three-Level Namespace Support**: Seamlessly materializes models across catalogs and schemas (`catalog.schema.model`).
- **Advanced Delta Lake Materializations**: Native support for Liquid Clustering, table constraints, tags, and incremental merges (`merge` / `insert_overwrite`).

### Phase 2: Low-Level Mechanics & Implementation
1. **`profiles.yml` Configuration for Databricks SQL Serverless**:
```yaml
enterprise_dbt:
  target: prod
  outputs:
    prod:
      type: databricks
      schema: analytics
      host: https://adb-123456789.azuredatabricks.net
      http_path: /sql/1.0/warehouses/4a5b6c7d8e9f0123
      token: "{{ env_var('DBT_DATABRICKS_TOKEN') }}"
      unity_catalog: enterprise_prod
      threads: 8
```
2. **dbt Incremental Model with Liquid Clustering**:
```sql
{{ config(
    materialized='incremental',
    unique_key='transaction_id',
    file_format='delta',
    liquid_clustered_by=['customer_id', 'transaction_date'],
    tblproperties={
        'delta.autoOptimize.optimizeWrite': 'true'
    }
) }}

WITH source_transactions AS (
    SELECT * FROM {{ source('bronze_raw', 'raw_transactions') }}
    {% if is_incremental() %}
      WHERE ingestion_timestamp > (SELECT max(ingestion_timestamp) FROM {{ this }})
    {% endif %}
)

SELECT 
    transaction_id,
    customer_id,
    transaction_date,
    amount,
    currency,
    ingestion_timestamp
FROM source_transactions
```
3. **Orchestration**: Execute dbt models via Databricks Workflows `dbt_task` or Apache Airflow `DatabricksSubmitRunOperator`.

### Phase 3: Production Hardening & Gotchas
- **Throttling on Small SQL Warehouses During dbt Concurrency**: Running dbt with `threads: 16` on an `X-Small` SQL warehouse leads to queue contention and query latency. *Remediation*: Enable multi-cluster warehouse autoscaling (e.g., Min: 1, Max: 4 clusters) to absorb concurrent model builds.
- **Inefficient Full-Table Scans on Incremental Models**: Writing dbt models using generic `unique_key` without partition or clustering awareness triggers full Delta table rewrites. *Remediation*: Configure `liquid_clustered_by` or specify `incremental_strategy='merge'` with clustering keys.
- **Hardcoded Catalog References in Models**: Hardcoding `enterprise_prod` inside dbt SQL files prevents running tests in `dev` environments. *Remediation*: Use the dbt `source()` and `ref()` functions with environmental target variables (`{{ target.catalog }}`)."""),

        ("arch-databricks-037", "Real-time lakehouse architecture (Kafka + Structured Streaming + Delta)", "How do you architect an end-to-end mission-critical real-time Lakehouse pipeline ingesting from Kafka into Delta Lake?",
"""### Phase 1: Conceptual Foundation & Core Architecture
A mission-critical real-time Lakehouse ingests high-velocity streaming events (financial trades, IoT metrics, clickstreams) from Apache Kafka, validates and enriches records in flight, and delivers sub-second analytical availability in Delta Lake.

**Architectural Flow**:
1. **Ingestion Layer**: Event producers publish to partitioned Kafka topics.
2. **Bronze Streaming Table**: Spark Structured Streaming consumes Kafka offsets with zero data loss, writing raw JSON payloads directly into an append-only Delta table.
3. **Silver Enrichment & Deduplication**: A downstream streaming pipeline parses payloads, checks schemas, watermarks late events, and deduplicates via `dropDuplicates` or streaming micro-batch merges.
4. **Gold Serving**: Materialized aggregates with Liquid Clustering serve real-time operational dashboards and ML feature stores.

### Phase 2: Low-Level Mechanics & Implementation
1. **Kafka-to-Bronze Stream with Checkpointing**:
```python
from pyspark.sql.functions import col, from_json
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType

# Read raw bytes from Kafka
raw_kafka_stream = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "kafka-broker.prod:9092")
    .option("subscribe", "telemetry_stream")
    .option("startingOffsets", "latest")
    .option("maxOffsetsPerTrigger", 50000)
    .option("failOnDataLoss", "false")
    .load()
)

# Write to Bronze Delta table
bronze_query = (
    raw_kafka_stream
    .writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "abfss://checkpoints@lake.dfs.core.windows.net/telemetry_bronze")
    .toTable("enterprise_prod.telemetry.bronze_events")
)
```
2. **Bronze-to-Silver Streaming Deduplication**:
```python
schema = StructType([
    StructField("device_id", StringType(), False),
    StructField("temperature", DoubleType(), True),
    StructField("timestamp", TimestampType(), False)
])

silver_stream = (
    spark.readStream
    .table("enterprise_prod.telemetry.bronze_events")
    .select(from_json(col("value").cast("string"), schema).alias("data"))
    .select("data.*")
    .withWatermark("timestamp", "10 minutes")
    .dropDuplicates(["device_id", "timestamp"])
)

silver_query = (
    silver_stream
    .writeStream
    .format("delta")
    .outputMode("append")
    .trigger(processingTime="10 seconds")
    .option("checkpointLocation", "abfss://checkpoints@lake.dfs.core.windows.net/telemetry_silver")
    .toTable("enterprise_prod.telemetry.silver_events")
)
```

### Phase 3: Production Hardening & Gotchas
- **Streaming Micro-Batch Checkpoint Bloat**: Accumulating hundreds of thousands of micro-batch metadata files in `_delta_log` degrades write latency. *Remediation*: Set `delta.checkpointInterval = 10` and run periodic background log compaction (`delta.logRetentionDuration = 'interval 30 days'`).
- **Kafka Partition Rebalancing Starvation**: Disproportionate partition skew on Kafka topics leaves some Spark executors idle while others lag behind. *Remediation*: Scale Kafka partition counts to match cluster executor capacity and set `minPartitions` in the Kafka read stream options.
- **Executor OOM on Traffic Spikes**: Sudden 10x traffic spikes cause micro-batches to pull millions of records into executor memory at once. *Remediation*: Enforce `maxOffsetsPerTrigger` to cap the maximum number of records processed per batch cycle."""),

        ("arch-databricks-038", "MLOps platform on Databricks end-to-end", "How do you architect an enterprise MLOps and LLMOps platform on Databricks leveraging MLflow and Unity Catalog?",
"""### Phase 1: Conceptual Foundation & Core Architecture
An enterprise MLOps platform on Databricks integrates feature engineering, model training, governance, validation, and real-time inference into a unified lakehouse environment.

**Architectural Stack**:
- **Feature Store & Governance**: Unity Catalog acts as the feature store (`catalog.schema.feature_table`), providing automated column-level lineage from raw data to model predictions.
- **Experiment Tracking & Artifact Logging**: MLflow 2.x tracks hyperparameters, metrics, and models with reproducible environment definitions.
- **Model Registry in Unity Catalog**: Models are registered as first-class UC assets (`catalog.schema.model_name`) with role-based access control and lifecycle aliases (`@challenger`, `@champion`).
- **Serving & Monitoring**: Databricks Model Serving provides serverless real-time REST endpoints with automatic drift monitoring via Lakehouse Monitoring.

### Phase 2: Low-Level Mechanics & Implementation
1. **Model Training, Logging, and UC Registration**:
```python
import mlflow
from mlflow.models import infer_signature
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

# Set Unity Catalog as the target registry
mlflow.set_registry_uri("databricks-uc")

with mlflow.start_run(run_name="churn_prediction_v2") as run:
    # Train scikit-learn model
    clf = RandomForestClassifier(n_estimators=100, max_depth=6)
    clf.fit(X_train, y_train)
    
    predictions = clf.predict(X_test)
    signature = infer_signature(X_train, predictions)
    
    # Log metrics
    mlflow.log_metric("accuracy", 0.934)
    
    # Register model directly into Unity Catalog 3-level namespace
    model_name = "enterprise_prod.ml_models.customer_churn_classifier"
    mlflow.sklearn.log_model(
        sk_model=clf,
        artifact_path="model",
        signature=signature,
        registered_model_name=model_name
    )
```
2. **Promoting Model Alias and Deploying Serverless Serving Endpoint**:
```python
from mlflow import MlflowClient

client = MlflowClient()
# Assign Champion alias for production deployment
client.set_registered_model_alias(
    name="enterprise_prod.ml_models.customer_churn_classifier",
    alias="Champion",
    version=2
)
```
3. **Automated Lakehouse Drift Monitoring**:
```sql
-- Attach automated data drift and model quality monitor to model inference table
CREATE MONITOR enterprise_prod.ml_models.customer_churn_monitor
  ON TABLE enterprise_prod.ml_models.inference_payload_logs
  USING PROFILE MODEL_PERFORMANCE
  WITH BASELINE TABLE enterprise_prod.ml_models.training_baseline;
```

### Phase 3: Production Hardening & Gotchas
- **Feature Drift Between Training and Inference**: Training models on offline data snapshots while serving real-time requests with inconsistent feature definitions creates silent degradation. *Remediation*: Use Unity Catalog Feature Tables for both batch training and real-time endpoint feature lookups.
- **Serving Endpoint Cold-Start Latency**: Serverless model serving endpoints scaled to 0 take 20-40 seconds to warm up when sudden requests arrive. *Remediation*: Set minimum provisioned concurrency (`scale_to_zero_enabled: false`) for latency-critical production APIs.
- **Uncontrolled Model Version Deployment**: Engineers directly changing model aliases in production without automated regression testing. *Remediation*: Gate model alias promotion inside CI/CD test workflows verifying latency, F1-score, and bias metrics before tagging `@Champion`."""),

        ("arch-databricks-039", "Disaster recovery for Unity Catalog and workspaces", "How do you architect an enterprise multi-region Disaster Recovery (DR) strategy for Databricks and Unity Catalog?",
"""### Phase 1: Conceptual Foundation & Core Architecture
A comprehensive Disaster Recovery (DR) plan ensures business continuity during major cloud provider regional outages, achieving strict Recovery Point Objectives (RPO) and Recovery Time Objectives (RTO).

**DR Strategy Classification**:
- **Cold Standby (RTO < 24h, RPO < 6h)**: Secondary region infrastructure is defined in Terraform and provisioned only upon disaster declaration. Storage is replicated via asynchronous cloud storage replication.
- **Warm Standby (RTO < 2h, RPO < 1h)**: Secondary workspace and UC metastore exist in an active-idle state. Delta tables are continuously synchronized using Delta Deep Clone.
- **Active-Active (RTO < 5m, RPO ~ 0)**: Workloads run concurrently in both regions, fed by multi-region messaging buses.

### Phase 2: Low-Level Mechanics & Implementation
1. **Delta Deep Clone Replication Pipeline**:
```sql
-- Incrementally clone production Delta tables from Primary (East US) to Secondary (West US)
-- DEEP CLONE copies both metadata log and underlying Parquet data files
CREATE OR REPLACE TABLE enterprise_dr.finance.ledger
DEEP CLONE enterprise_prod.finance.ledger;

-- Subsequent scheduled runs are incremental, syncing only newly committed delta files
CREATE OR REPLACE TABLE enterprise_dr.finance.ledger
DEEP CLONE enterprise_prod.finance.ledger;
```
2. **Automated DR Failover Script (Terraform & CLI)**:
```python
# python script to redirect production DNS and switch DAB target to DR region
import subprocess
import os

def trigger_dr_failover():
    print("Initiating failover to secondary DR workspace: West US...")
    # 1. Update Databricks Asset Bundles target
    subprocess.run(["databricks", "bundle", "deploy", "-t", "dr_west"], check=True)
    
    # 2. Unpause scheduled jobs in DR workspace
    subprocess.run(["databricks", "jobs", "unpause", "--all"], check=True)
    
    print("Failover completed. Production workloads active in West US.")
```

### Phase 3: Production Hardening & Gotchas
- **Split-Brain Scenarios on Incomplete Failovers**: Having active pipelines writing to both primary and secondary workspaces simultaneously corrupts data integrity. *Remediation*: Enforce strict cutover runbooks: revoke storage credentials or shut down compute in the primary region before activating the secondary region.
- **Using Shallow Clone Instead of Deep Clone for DR**: `SHALLOW CLONE` references original physical files in the primary cloud bucket. If the primary storage account fails, shallow clones become unreadable. *Remediation*: Always use `DEEP CLONE` for disaster recovery replication across separate storage accounts.
- **Metastore ID Inconsistencies**: Unity Catalog metastores are regional. Workspaces in the DR region cannot attach to the primary region's metastore during an outage. *Remediation*: Maintain a paired secondary UC metastore and synchronize object definitions via Terraform or the Databricks Labs UCX migration tool."""),

        ("arch-databricks-040", "Building a self-service analytics platform on Databricks", "How do you architect an enterprise-grade self-service analytics platform on Databricks for thousands of business users?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Scaling Databricks to thousands of non-technical business analysts, citizen data scientists, and departmental leaders requires a self-service Lakehouse architecture that guarantees security, cost containment, and high query performance without constant intervention from data engineering.

Architectural pillars:
- **Unified Semantic & SQL Layer**: Provide curated Gold tables with business-friendly metadata, dimensional models, and certified views in Unity Catalog.
- **Databricks SQL Serverless Warehouses**: Provide instantaneous query execution with auto-scaling compute pools, eliminating wait times for analysts.
- **AI-Powered Exploration (Databricks Genie & AI/BI)**: Enable business users to ask natural language questions ("What was total revenue by region in Q3?") translated automatically into verified SQL queries.
- **Governance & Cost Guardrails**: Enforce strict warehouse compute limits, query timeouts, and role-based permissions.

### Phase 2: Low-Level Mechanics & Implementation
1. **Certified Semantic Gold Views with Unity Catalog**:
```sql
CREATE SCHEMA IF NOT EXISTS enterprise_prod.self_service
  COMMENT 'Certified enterprise self-service semantic domain';

-- Certified view with business annotations and column documentation
CREATE OR REPLACE VIEW enterprise_prod.self_service.certified_customer_sales
  COMMENT 'Authoritative gold metric view for departmental sales reporting'
AS SELECT 
    c.customer_id,
    c.customer_name,
    c.segment,
    s.order_id,
    s.order_date,
    s.net_amount,
    s.region
FROM enterprise_prod.crm.dim_customers c
JOIN enterprise_prod.sales.fact_orders s ON c.customer_id = s.customer_id;

-- Tag as verified data product
ALTER VIEW enterprise_prod.self_service.certified_customer_sales 
  SET TAGS ('tier' = 'certified', 'certification_date' = '2024-03-01');

-- Grant broad analyst usage
GRANT SELECT ON VIEW enterprise_prod.self_service.certified_customer_sales TO `all_analysts`;
```
2. **Databricks SQL Serverless Warehouse Policy**:
```json
{
  "name": "Self-Service Business Warehouse",
  "cluster_size": "Medium",
  "min_num_clusters": 1,
  "max_num_clusters": 5,
  "auto_stop_mins": 5,
  "enable_serverless_compute": true,
  "warehouse_type": "PRO"
}
```

### Phase 3: Production Hardening & Gotchas
- **Runaway Ad-Hoc Cross-Joins Freezing Warehouses**: Analysts executing cartesian products (`SELECT * FROM tableA CROSS JOIN tableB`) exhaust cluster resources. *Remediation*: Configure Databricks SQL Query Watchdogs and hard query execution timeouts (e.g., terminate any interactive query exceeding 10 minutes).
- **Direct Access to Raw Bronze Data**: Citizen analysts querying unvalidated bronze JSON layers generate conflicting business numbers. *Remediation*: Revoke all user permissions on Bronze and Silver layers; analysts are granted access exclusively to certified Gold schemas.
- **Lack of Query Result Caching**: Multiple analysts running the exact same dashboard queries repeatedly throughout the day burn DBUs. *Remediation*: Enable Databricks SQL Query Result Caching, serving repeat dashboard queries instantly from memory without spinning up compute."""),
    ]

    for id_val, niche, q_text, ans in scenarios_architect:
        items.append({
            "id": id_val,
            "source": "Architecture Hub",
            "category": "Databricks Lakehouse Architecture",
            "niche": niche,
            "difficulty": "ARCHITECT",
            "question": q_text,
            "answer": ans
        })

    return items
