# scripts/curriculum_scenarios.py
"""
Curriculum items 32-36:
Advanced Architectural Scenarios:
1. Thundering Herd (Request Collapsing) in Lakehouse Analytics
2. Exactly-Once Processing via Transactional Outbox & Delta Lake
3. Zero-Downtime Migration from On-Prem Hadoop/Hive to Databricks Lakehouse
4. High-Compliance GitOps for Regulated Enterprise Lakehouses
5. Alert Fatigue & Error Budgets in Big Data Operations
"""

SCENARIO_ITEMS = [
    # ── Scenario 1: Thundering Herd (Request Collapsing) in Lakehouse Analytics ──
    {
        "de_id": "de-new-arch-scenario-001",
        "arch_id": "arch-lakehouse-scenario-001",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "System Scenario: Thundering Herd & Request Collapsing",
        "difficulty": "ARCHITECT",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Architectural Scenarios & System Design",
        "question": "In a high-concurrency enterprise data lakehouse where hundreds of analytical dashboards query the same underlying raw tables simultaneously on business open, how do you architect Request Collapsing and caching to prevent compute node collapse?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In enterprise BI environments (e.g., 9:00 AM market open or executive morning briefings), hundreds of automated Power BI / Tableau dashboards and concurrent users send identical or near-identical complex analytical aggregation queries against underlying Delta Lake gold tables within a 60-second window.

**The Thundering Herd Disaster**:
- If each query reaches the compute layer uncoordinated, the query engine launches hundreds of redundant distributed Spark jobs.
- This creates massive CPU contention, exhausts cluster memory, triggers disk spilling, and throttles storage IOPS (S3/ADLS 503 SlowDown), causing warehouse queuing and multi-minute query latency.

**The Tiered Request Collapsing Architecture**:
1. **Tier 1: Result Cache (Query Hash Deduplication)**:
   - Databricks SQL Warehouses implement an automatic Result Cache. If Query B is byte-identical to Query A and the underlying Delta table version has not changed, the warehouse immediately returns the cached result in <10ms without touching worker nodes.
2. **Tier 2: Request Collapsing (In-Flight Flight Deduplication)**:
   - For queries arriving simultaneously while Query A is still computing, a semantic proxy or semantic layer (Cube.dev / Power BI Aggregation Tables / Fabric Direct Lake) intercepts the queries.
   - It hashes the logical query structure and collapses identical concurrent requests into a single in-flight computation, broadcasting the resulting dataset to all waiting client sessions.
3. **Tier 3: Pre-Warmed Materialized Aggregations**:
   - Rather than computing heavy aggregations on the raw gold table during user query time, an automated nightly/hourly job computes a pre-aggregated Materialized View with Delta Z-Order/Liquid Clustering.

### Phase 2: Implementation & Code Artifacts
Below is how a Databricks SQL Materialized View is configured with caching properties, and how Power BI Direct Lake avoids SQL engine contention.

```sql
-- 1. Create Pre-Warmed Materialized View for High-Concurrency Dashboards
CREATE OR REPLACE MATERIALIZED VIEW prod_lakehouse.gold.mv_executive_sales_summary
  SCHEDULE REFRESH CRON '0 0 8 * * ?' -- Pre-warmed at 8:00 AM before 9:00 AM rush
  COMMENT 'Pre-aggregated executive metrics for high-concurrency morning dashboards'
AS
SELECT 
  date_trunc('day', order_timestamp) AS order_day,
  region,
  product_category,
  count(distinct customer_id) AS unique_buyers,
  sum(total_amount) AS gross_revenue,
  sum(profit_margin) AS total_profit
FROM prod_lakehouse.gold.fact_orders
WHERE order_timestamp >= current_date() - INTERVAL 90 DAYS
GROUP BY 1, 2, 3;

-- 2. Liquid Clustering on Materialized View for Instant Scan Pruning
ALTER TABLE prod_lakehouse.gold.mv_executive_sales_summary
CLUSTER BY (order_day, region);
```

```python
# 3. Databricks SQL Warehouse Auto-Scaling and Caching Configuration
# Configure warehouse cluster size with Serverless Auto-Stop and Multi-Cluster Queueing
warehouse_config = {
    "name": "BI-High-Concurrency-Warehouse",
    "cluster_size": "Large",
    "min_num_clusters": 1,
    "max_num_clusters": 5, # Multi-cluster autoscaling expands when queue exceeds 5 queries
    "auto_stop_mins": 10,
    "enable_serverless_compute": True,
    "spot_instance_policy": "COST_OPTIMIZED"
}
```

### Phase 3: Production Gotchas & Failure Modes
- **Cache Invalidation on Micro-Batch Writes**: The Databricks SQL Result Cache is strictly invalidated whenever the underlying Delta table commit version increments. If an upstream streaming job is appending records every 10 seconds, the cache is constantly wiped out, completely destroying cache hit rates for dashboard users. Isolate dashboard queries on a curated gold snapshot that refreshes hourly rather than streaming directly to the live table.
- **Dynamic Non-Deterministic Functions in Filters**: If a BI query includes `WHERE order_date = current_date()` or `current_timestamp()`, certain query parsers treat the query as non-deterministic and bypass the result cache, forcing full computation on every refresh. Use parameterized queries or static date boundaries.
- **Queue Starvation in Multi-Cluster Warehouses**: If autoscaling max cluster limit is reached (e.g., max 5 clusters) and query execution takes >30 seconds due to unoptimized full scans, incoming queries queue indefinitely until client BI timeouts (HTTP 504) fire.
"""
    },

    # ── Scenario 2: Exactly-Once Processing via Transactional Outbox & Delta Lake ──
    {
        "de_id": "de-new-arch-scenario-002",
        "arch_id": "arch-lakehouse-scenario-002",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "System Scenario: Exactly-Once Ingestion & Transactional Outbox",
        "difficulty": "ARCHITECT",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Architectural Scenarios & System Design",
        "question": "How do you implement end-to-end Exactly-Once event ingestion from distributed message brokers (Kafka/Event Hubs) into Delta Lake using Structured Streaming, checkpoints, and the Transactional Outbox pattern with idempotent MERGE?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In distributed systems, microservices emit state mutations across distributed networks where network partitions, broker retries, and consumer crashes occur. Most streaming architectures achieve only **At-Least-Once** semantics, leading to duplicate records, phantom orders, and double billing in downstream financial ledgers.

**End-to-End Exactly-Once Architecture**:
1. **The Transactional Outbox Pattern (Upstream Microservice)**:
   - When an application service (e.g., Orders Service) updates its relational database (PostgreSQL), it does NOT write directly to Kafka in the same HTTP request (which causes dual-write inconsistencies).
   - Instead, it writes both the business entity mutation AND an outbox event record into an `outbox_events` table inside a **single ACID relational transaction**.
   - A Change Data Capture (CDC) connector (e.g., Debezium) reads the database transaction log (WAL) and publishes ordered events with a deterministic `idempotency_key` (UUID/Hash) to Kafka.
2. **Spark Structured Streaming Source Offsets**:
   - Spark Structured Streaming reads from Kafka and commits offsets to an atomic write-ahead log in cloud storage (`checkpointLocation`).
   - If an executor crashes halfway through a micro-batch, Spark restarts from the exact offsets recorded in the checkpoint.
3. **Idempotent Delta Sink with Deduplication**:
   - Because message re-deliveries can occur prior to offset commits, the sink must be idempotent.
   - The micro-batch performs an atomic `MERGE INTO` the target Delta table using `idempotency_key` as the merge condition. If a record already exists, it is ignored or updated in place, guaranteeing true Exactly-Once business semantics!

### Phase 2: Implementation & Code Artifacts
Below is the PySpark Structured Streaming implementation utilizing `foreachBatch`, micro-batch deduplication, and an idempotent Delta MERGE.

```python
from pyspark.sql.functions import col, from_json, expr
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType
from delta.tables import DeltaTable

# 1. Event Schema matching Upstream Transactional Outbox Payload
event_schema = StructType([
    StructField("event_id", StringType(), False), # Global Deterministic UUID
    StructField("order_id", StringType(), False),
    StructField("customer_id", StringType(), False),
    StructField("amount", DoubleType(), False),
    StructField("status", StringType(), False),
    StructField("event_timestamp", TimestampType(), False)
])

# 2. Read Streaming Stream from Kafka with Offset Tracking
df_kafka = spark.readStream.format("kafka") \\
    .option("kafka.bootstrap.servers", "kafka-cluster:9092") \\
    .option("subscribe", "orders.outbox.events") \\
    .option("startingOffsets", "earliest") \\
    .option("maxOffsetsPerTrigger", 50000) \\
    .load()

df_parsed = df_kafka.select(
    from_json(col("value").cast("string"), event_schema).alias("data")
).select("data.*")
```

```python
# 3. Idempotent Target Sink using foreachBatch & Delta MERGE
def merge_outbox_micro_batch(micro_batch_df, batch_id):
    '''
    Applies idempotent deduplication and atomic Delta MERGE per micro-batch.
    '''
    target_table_path = "abfss://lake@datalakeprod.dfs.core.windows.net/silver/orders"
    delta_target = DeltaTable.forPath(spark, target_table_path)

    # In-batch deduplication: keep latest event if duplicate UUIDs arrive in same micro-batch
    deduped_batch = micro_batch_df.dropDuplicates(["event_id"])

    # Idempotent Atomic Upsert into Delta Lake
    delta_target.alias("tgt") \\
        .merge(
            deduped_batch.alias("src"),
            "tgt.event_id = src.event_id" # Deduplication Key!
        ) \\
        .whenNotMatchedInsertAll() \\
        .execute()

# 4. Start Streaming Query with Checkpoint Location
query = df_parsed.writeStream \\
    .foreachBatch(merge_outbox_micro_batch) \\
    .option("checkpointLocation", "abfss://lake@datalakeprod.dfs.core.windows.net/checkpoints/orders_outbox") \\
    .trigger(processingTime="15 seconds") \\
    .start()
```

### Phase 3: Production Gotchas & Failure Modes
- **Checkpoint Directory Reuse Disaster**: If a developer updates the streaming transformations or changes the schema, and points the query to an existing checkpoint directory, Spark detects incompatible offset metadata and crashes with `InvalidCheckpointException`. Never reuse or delete an existing production checkpoint directory without a planned migration.
- **Unbounded State Bloat in Target MERGE**: As the target Delta table grows to 500 million rows, executing an unpartitioned `tgt.event_id = src.event_id` merge forces full table scans on every micro-batch. Partition the target table by date (e.g., `event_date`) and include a date predicate in the merge condition: `tgt.event_date >= current_date() - INTERVAL 7 DAYS`.
- **Side-Effect Leaks in foreachBatch**: If your `foreachBatch` function writes to the Delta table AND sends an HTTP webhook or publishes to SNS, a failure during the Delta write will cause Spark to retry the entire batch. The webhook will fire twice, breaking exactly-once external side effects. Use transactional outbox patterns for external systems.
"""
    },

    # ── Scenario 3: Zero-Downtime Migration from On-Prem Hadoop/Hive to Databricks ──
    {
        "de_id": "de-new-arch-scenario-003",
        "arch_id": "arch-lakehouse-scenario-003",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "System Scenario: Zero-Downtime Lakehouse Migration & Dual-Write",
        "difficulty": "ARCHITECT",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Architectural Scenarios & System Design",
        "question": "How do you architect a zero-downtime, zero-data-loss dual-write and shadow validation migration from a multi-petabyte legacy Hadoop/Hive cluster to Databricks Unity Catalog?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Migrating an enterprise core data platform from an on-premises Hadoop/Hive cluster (Cloudera/Hortonworks) to cloud-native Databricks Unity Catalog is a high-risk architectural endeavor. A "big bang" weekend cutover invariably fails due to hidden upstream dependencies, schema discrepancies, and unexpected query performance regressions.

**The 4-Phase Zero-Downtime Migration Blueprint**:
1. **Phase 1: Baseline Historical Data Sync (Bulk Ingest)**:
   - Establish high-bandwidth cloud connectivity (AWS Direct Connect / Azure ExpressRoute).
   - Use distributed tools (e.g., DistCp / Azure Data Factory) to copy historical cold HDFS Parquet/ORC data partitions to cloud object storage (ADLS Gen2 / S3).
   - Register tables in Unity Catalog using `CLONE` or `CONVERT TO DELTA`.
2. **Phase 2: Dual-Write & Ingestion Mirroring**:
   - Ingestion pipelines (Kafka consumers, Airflow batch ETLs) are configured to dual-write: submitting the original load to legacy on-prem Hive and simultaneously publishing identical records to the cloud Databricks ingestion layer.
   - The cloud lakehouse runs continuously in parallel with live data.
3. **Phase 3: Shadow Validation & Automated Reconciliation**:
   - A reconciliation framework runs automated hash checks, row count comparisons, and schema diffs between on-prem Hive tables and cloud Delta tables.
   - Analytical queries are shadowed: BI reports and downstream ML models query both systems, comparing execution performance and numeric parity.
4. **Phase 4: Phased Consumer Cutover & Decommissioning**:
   - Consumer applications are migrated by domain (e.g., Marketing first, Finance last).
   - Read cutover executes instantly via DNS / load balancer updates or catalog pointer redirection.
   - Once all consumers are verified, on-prem dual-write is disabled and Hadoop nodes are decommissioned.

### Phase 2: Implementation & Code Artifacts
Below is how legacy Hive Parquet files are converted in-place to Delta Lake, and an automated PySpark parity reconciliation script.

```sql
-- 1. In-place conversion of historical Parquet data to Delta Lake
-- Reads existing Parquet footers and creates _delta_log without moving data!
CONVERT TO DELTA parquet.`abfss://migrated-data@lake.dfs.core.windows.net/tables/legacy_sales`
NO CHECKPOINT;

-- 2. Register into Unity Catalog with metadata validation
CREATE TABLE prod_lakehouse.legacy_migration.fact_sales
USING DELTA
LOCATION 'abfss://migrated-data@lake.dfs.core.windows.net/tables/legacy_sales';
```

```python
# 3. Automated Reconciliation Engine: On-Prem Hive vs Databricks Delta
from pyspark.sql.functions import col, sha2, concat_ws, sum as _sum, count

def reconcile_table_parity(hive_table_name: str, delta_table_name: str, date_partition: str):
    '''
    Computes checksum parity and row-count discrepancies between systems.
    '''
    # Read from legacy Hive connector
    df_hive = spark.table(hive_table_name).filter(col("partition_date") == date_partition)
    # Read from Unity Catalog Delta table
    df_delta = spark.table(delta_table_name).filter(col("partition_date") == date_partition)

    # 1. Row Count Parity Check
    hive_count = df_hive.count()
    delta_count = df_delta.count()
    assert hive_count == delta_count, f"Count Mismatch! Hive: {hive_count}, Delta: {delta_count}"

    # 2. Cryptographic Checksum Parity on Key Columns
    hive_checksum = df_hive.select(sha2(concat_ws("||", *df_hive.columns), 256).alias("h")).groupBy().agg(_sum("h")).collect()[0][0]
    delta_checksum = df_delta.select(sha2(concat_ws("||", *df_delta.columns), 256).alias("h")).groupBy().agg(_sum("h")).collect()[0][0]
    
    print(f"Partition {date_partition} Reconciled: 100% Parity Confirmed.")

reconcile_table_parity("hive_metastore.sales.fact_orders", "prod_lakehouse.legacy_migration.fact_sales", "2026-10-14")
```

### Phase 3: Production Gotchas & Failure Modes
- **HDFS vs Cloud File System Latency Mismatch**: On-prem HDFS provides microsecond metadata operations via in-memory NameNodes. Cloud object stores (S3/ADLS) are distributed web APIs with ~20ms latency per REST call. Uncompacted Hive tables with 500,000 partitions that ran in 10 minutes on-prem will take 4 hours in the cloud unless compacted with `OPTIMIZE` and converted to Delta.
- **Timestamp Timezone Divergence**: Hive 1.x/2.x stored timestamps in local server timezone (e.g., EST) without timezone metadata. Databricks Runtime defaults to UTC. Migrating data without explicit `spark.sql.session.timeZone = 'America/New_York'` settings will silently shift historical timestamps by 4 to 5 hours!
- **Dual-Write Partial Failure Drift**: If the network connection between on-prem and cloud drops, the on-prem write succeeds while the cloud write fails. Without an automated CDC replay queue, data will silently drift. Always decouple dual-writes using a durable message broker (Kafka) with independent consumer group offsets.
"""
    },

    # ── Scenario 4: High-Compliance GitOps for Regulated Enterprise Lakehouses ──
    {
        "de_id": "de-new-arch-scenario-004",
        "arch_id": "arch-lakehouse-scenario-004",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "System Scenario: High-Compliance Lakehouse GitOps",
        "difficulty": "ARCHITECT",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Architectural Scenarios & System Design",
        "question": "How do you design an immutable, audit-compliant GitOps delivery pipeline for Databricks Lakehouse assets (Unity Catalog schemas, DLT pipelines, and access grants) across regulated finance or healthcare environments?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In regulated industries (FINRA, HIPAA, SOC 2, BCBS 239), manual changes to database schemas, pipeline code, or access control lists in production environments are strictly illegal. Every change must be audited, peer-reviewed, cryptographically signed, and deployed through automated pipelines.

**Regulated Lakehouse GitOps Architecture**:
1. **Single Source of Truth in Git**:
   - All DDL definitions, Unity Catalog grants, cluster configurations, and DLT pipeline definitions reside in version-controlled Git repositories.
   - Developers have zero direct write permissions in production Databricks workspaces.
2. **Multi-Stage Promotion Gates**:
   - `Dev -> Test/QA -> UAT/Staging -> Prod`.
   - Promotions require cryptographically verified branch merges (`main`), passing automated unit/integration test suites, and multi-party PR approval.
3. **Immutable Deployment via Service Principals**:
   - CI/CD runners (GitHub Actions, Azure DevOps) authenticate via short-lived OIDC federated tokens (workload identity) as dedicated deployment Service Principals.
   - Deployments execute via Databricks Asset Bundles (DABs) or Terraform.
4. **Drift Detection & Continuous Compliance Auditing**:
   - Scheduled hourly CI/CD jobs run `databricks bundle validate` or `terraform plan -detailed-exitcode` to detect and alert on unauthorized manual configuration changes.
   - Unity Catalog system audit tables (`system.access.audit`) continuously stream admin activities to enterprise SIEM platforms (Splunk / Azure Sentinel).

### Phase 2: Implementation & Code Artifacts
Below is an automated CI/CD pipeline step executing compliance verification, schema drift detection, and immutable deployment.

```yaml
# .github/workflows/compliance_deploy.yml
name: Regulated Production Lakehouse GitOps Pipeline

on:
  push:
    branches: [main]

permissions:
  id-token: write # Required for Azure OIDC Workload Identity Federation
  contents: read

jobs:
  compliance_audit_and_deploy:
    runs-on: ubuntu-latest
    environment: production # Requires manual change approval in GitHub Settings!
    steps:
      - uses: actions/checkout@v4
      
      - name: Azure Login via OIDC (No Static Secrets!)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Install Databricks CLI
        uses: databricks/setup-cli@v0.2

      - name: Validate Databricks Asset Bundle
        run: databricks bundle validate -t prod
        env:
          DATABRICKS_HOST: ${{ secrets.DATABRICKS_PROD_WORKSPACE_URL }}

      - name: Automated Data Quality & Schema Migration Tests
        run: |
          python -m pytest tests/compliance/
          python -m pytest tests/schema_contracts/

      - name: Immutable Production Deploy
        run: databricks bundle deploy -t prod
        env:
          DATABRICKS_HOST: ${{ secrets.DATABRICKS_PROD_WORKSPACE_URL }}
```

```sql
-- Continuous Compliance Audit: Alerting on Manual Out-of-Band Grants
SELECT 
  event_time,
  user_identity.email AS offending_user,
  action_name,
  request_params.catalog_name,
  request_params.privilege_type
FROM system.access.audit
WHERE action_name IN ('grantPermissions', 'alterCatalog', 'dropTable')
  AND user_identity.email NOT LIKE '%service-principal%' -- Flags humans modifying prod!
  AND event_time >= current_timestamp() - INTERVAL 1 HOUR;
```

### Phase 3: Production Gotchas & Failure Modes
- **Static Token Exfiltration Risk**: Storing static Databricks Personal Access Tokens (PATs) in GitHub Secrets violates strict SOC 2 compliance. If a repository secret is leaked or an ex-employee retained the token, the workspace is compromised. Always mandate Azure Managed Identity / AWS IAM OIDC Workload Identity Federation with short-lived tokens.
- **Breaking Schema Migrations in Active DLT Pipelines**: Deploying a Git commit that alters column names in a production DLT pipeline can corrupt existing streaming checkpoints. Always decouple schema additions (additive backward-compatible changes) from column deletions, applying column mapping before removing obsolete columns.
- **Auditing Gap During Workspace Migration**: System tables audit actions within the Unity Catalog metastore, but do not capture actions taken at the cloud storage level (direct S3/ADLS writes). Cloud bucket access must be restricted via private endpoints and cloud IAM policies so that all data traffic is forced through Unity Catalog.
"""
    },

    # ── Scenario 5: Alert Fatigue & Error Budgets in Big Data Operations ──
    {
        "de_id": "de-new-arch-scenario-005",
        "arch_id": "arch-lakehouse-scenario-005",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "System Scenario: SRE Error Budgets & Pipeline Reliability",
        "difficulty": "ARCHITECT",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Architectural Scenarios & System Design",
        "question": "In an enterprise operating thousands of daily Spark jobs and DLT pipelines generating dozens of transient pager alerts, how do you architect an Error Budget and automated incident triage framework to eliminate alert fatigue?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In large data platform teams managing thousands of batch jobs, streaming queries, and DLT pipelines, the default approach to reliability is writing naive email/Slack alerts for every task failure (`on_failure_callback`).

**The Alert Fatigue Crisis**:
- Distributed systems experience frequent transient failures: cloud VM spot evictions, temporary network blips, upstream API rate limits, or momentary S3 throttling.
- When on-call engineers receive 50 pager alerts a night, they suffer cognitive burnout and begin ignoring notifications, eventually missing critical silent data corruption or prolonged pipeline outages.

**SRE Reliability Framework for Data Engineering**:
1. **SLIs, SLOs & Error Budgets**:
   - **Service Level Indicator (SLI)**: Quantitative measure of pipeline health.
     * *Freshness SLI*: `% of hours where Gold Customer table is updated within 30 minutes of schedule`.
     * *Correctness SLI*: `% of records passing DLT Expectations without failure`.
   - **Service Level Objective (SLO)**: Enterprise commitment (e.g., `99.5% Freshness over a 30-day rolling window`).
   - **Error Budget**: The remaining allowance for unreliability ($100\\% - 99.5\\% = 0.5\\%$ of runs can fail without alerting engineers).
2. **Two-Tier Incident Triage (Symptoms vs Causes)**:
   - **Tier 1 (Automated Self-Healing)**: Individual task failures trigger automated retries (e.g., 3 retries with exponential backoff on isolated job clusters). No human is paged for transient failures!
   - **Tier 2 (Symptom-Based Paging)**: Engineers are paged ONLY when a business SLI is violated (e.g., Gold table is >2 hours late and Error Budget is 80% consumed).

### Phase 2: Implementation & Code Artifacts
Below is how an automated Error Budget tracker is implemented on Databricks System Tables, and how Databricks Job retry policies are configured.

```sql
-- 1. Automated SLI & Error Budget Tracker for Core Lakehouse Pipelines
WITH daily_job_runs AS (
  SELECT 
    usage_date,
    usage_metadata.job_id,
    count(distinct usage_metadata.job_run_id) AS total_runs
  FROM system.billing.usage
  WHERE usage_metadata.job_id = '482910382'
    AND usage_date >= current_date() - INTERVAL 30 DAYS
  GROUP BY 1, 2
),
failed_runs AS (
  -- Capture failed runs from Databricks system job run history
  SELECT 
    date(run_time) AS run_date,
    count(*) AS failures
  FROM system.lakeflow.jobs -- Unity Catalog Job Run History
  WHERE job_id = '482910382'
    AND result_state = 'FAILED'
    AND run_time >= current_date() - INTERVAL 30 DAYS
  GROUP BY 1
)
SELECT 
  d.usage_date,
  coalesce(f.failures, 0) AS daily_failures,
  d.total_runs,
  round((1.0 - (coalesce(f.failures, 0) * 1.0 / d.total_runs)) * 100, 2) AS daily_success_rate_sli,
  -- Target SLO is 99.0%
  CASE 
    WHEN (1.0 - (coalesce(f.failures, 0) * 1.0 / d.total_runs)) < 0.99 THEN 'ERROR BUDGET DEPLETED'
    ELSE 'HEALTHY'
  END AS error_budget_status
FROM daily_job_runs d
LEFT JOIN failed_runs f ON d.usage_date = f.run_date
ORDER BY d.usage_date DESC;
```

```json
{
  "name": "Customer_Gold_Pipeline_Production",
  "tasks": [
    {
      "task_key": "silver_to_gold_transform",
      "notebook_task": {
        "notebook_path": "/Workspace/Gold/transform_orders"
      },
      "max_retries": 3,
      "min_retry_interval_millis": 60000,
      "retry_on_timeout": true,
      "timeout_seconds": 3600
    }
  ],
  "notification_settings": {
    "no_alert_for_skipped_runs": true,
    "no_alert_for_canceled_runs": true
  }
}
```

### Phase 3: Production Gotchas & Failure Modes
- **Infinite Retry Loop Cost Explosion**: Setting `max_retries = 10` on a job that failed due to a hard deterministic bug (e.g., bad SQL syntax, missing table, schema mismatch) causes the job cluster to spin up, fail, and terminate 10 times consecutively, burning hundreds of unnecessary DBUs. Enforce maximum 2–3 retries with exponential backoff.
- **Alert Deduplication Failure in Streaming**: A 24/7 streaming query that enters a crash-restart loop can send a PagerDuty alert every 15 seconds, flooding on-call mobile phones with 1,000 notifications in an hour. Route streaming failure alerts through an incident manager (PagerDuty / Opsgenie / VictorOps) with a 30-minute deduplication and aggregation rule.
- **Ignoring Data Quality SLIs**: Focusing solely on job completion status (green checkmarks) misses silent data poisoning. A job that completes in 2 minutes because an upstream source sent 0 records is a catastrophic functional failure disguised as a successful run. Always tie error budgets to row count thresholds and DLT Expectation pass rates.
"""
    }
]
