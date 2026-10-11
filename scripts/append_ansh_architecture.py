#!/usr/bin/env python3
"""
Append 20 deep architecture scenarios from Ansh Lamba's 12-Hour Masterclass
to src/data/json/data_architecture.json.
"""

import json
import os

FILE_PATH = os.path.join(os.path.dirname(__file__), '../src/data/json/data_architecture.json')

new_arch_questions = [
  {
    "id": "arch-ansh-001",
    "source": "Architecture Hub",
    "category": "Advanced PySpark & Spark Core Optimization",
    "niche": "Cluster Sizing & Resource Calculation",
    "difficulty": "ARCHITECT",
    "question": "You have a Spark batch job that needs to process 10 GB of data daily. How would you calculate and decide the number of executor cores, memory per executor, and cluster size? Explain your reasoning.",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Sizing Spark compute is not about guesswork or allocating arbitrary numbers—it requires balancing JVM garbage collection overhead, HDFS/cloud storage I/O throughput, and parallelism:
- **Core Allocation per Executor**: Allocating 1 core per executor limits multi-threading benefits and shared memory gains. Allocating >5 cores per executor (e.g., 8–16 cores) introduces severe JVM Garbage Collection (GC) pauses that degrade performance. The industry gold standard is **4 to 5 cores per executor**.
- **Memory per Executor**: For 10 GB of uncompressed data, a 1:4 core-to-memory ratio (e.g. 4 cores with 16 GB to 28 GB RAM) provides ample execution memory for in-memory joins and aggregations without excessive GC pressure.
- **Resource Sizing for 10 GB**: 10 GB of data uncompresses to roughly 25–30 GB in memory during complex operations. A cluster with 2 worker nodes, each running 1 executor with 4 cores and 16 GB RAM (total 8 cores, 32 GB RAM), processes this dataset in minutes with zero disk spills.

### Phase 2: Low-Level Mechanics & Implementation Calculation
1. **Cluster Node Sizing**:
   - Machine type: 2 worker nodes (e.g. `Standard_D4s_v5` or `m5.xlarge`, 4 vCPUs, 16 GB RAM each).
   - Overhead deduction: Reserve 1 vCPU and 1 GB RAM per node for OS and cluster daemon processes.
2. **Executor Specification**:
   - Number of Executors: 2 (1 per worker node).
   - Cores per Executor: `4 cores`.
   - Memory per Executor: `14 GB` (`spark.executor.memory = 12g`, `spark.executor.memoryOverhead = 2g`).
3. **Driver Specification**:
   - Set driver size to match 1 executor (4 cores, 14 GB RAM) to safely handle broadcast joins up to 2 GB.
4. **PySpark Configuration Snippet**:
```python
spark = SparkSession.builder \\
    .appName("DailyBatch_10GB_Pipeline") \\
    .config("spark.executor.instances", "2") \\
    .config("spark.executor.cores", "4") \\
    .config("spark.executor.memory", "12g") \\
    .config("spark.executor.memoryOverhead", "2g") \\
    .config("spark.driver.memory", "12g") \\
    .config("spark.sql.shuffle.partitions", "32") \\
    .config("spark.sql.adaptive.enabled", "true") \\
    .getOrCreate()
```

### Phase 3: Production Hardening & Gotchas
- **The 200 Partition Trap**: By default, `spark.sql.shuffle.partitions` is set to 200. For a 10 GB dataset across 8 cores, 200 partitions creates tiny 50MB tasks with massive task scheduling overhead. Tune shuffle partitions to `2 * total_cores` (16–32) or enable Adaptive Query Execution (`spark.sql.adaptive.enabled = true`) to coalesce automatically.
- **Off-Heap Memory Spills**: Under heavy non-JVM libraries (e.g. Pandas UDFs / PyArrow), JVM memory cannot be leveraged. Increase `spark.executor.memoryOverhead` to at least 15-20% of executor memory to avoid Yarn/K8s container kills (Exit code 137)."""
  },
  {
    "id": "arch-ansh-002",
    "source": "Architecture Hub",
    "category": "Databricks Lakehouse Architecture",
    "niche": "Small File Problem & Compaction",
    "difficulty": "ARCHITECT",
    "question": "Daily ingestion jobs write data into an analytical lakehouse, and over time storage is filled with thousands of tiny files causing slow query performance and high job runtimes. How would you tackle the small file problem (a) during write time, and (b) after data is already written?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
The 'Small File Problem' occurs when frequent micro-batches or high-cardinality partition keys generate thousands of tiny Parquet files (kilobytes to few megabytes). This degrades query latency due to:
1. **Cloud Metadata Overhead**: The query engine spends 80% of its query time making hundreds of thousands of HTTP `GET/LIST` requests to ADLS/S3.
2. **Columnar Inefficiency**: Parquet dictionaries, row group statistics, and compression algorithms operate sub-optimally on small files.
The architectural solution must operate on two fronts: **Write-Time Prevention** and **Post-Write Maintenance**.

### Phase 2: Low-Level Mechanics & Implementation
#### A. Write-Time Mitigation (Prevention):
- **Auto-Optimize (Optimized Writes & Auto-Compaction)**:
```sql
ALTER TABLE delta_sales_bronze SET TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true'
);
```
- **Target File Sizing**: Adjust target file size to 128MB or 256MB for optimal scan speed:
```sql
ALTER TABLE delta_sales_bronze SET TBLPROPERTIES (
  'delta.targetFileSize' = '134217728' -- 128 MB in bytes
);
```
- **Coalesce / Repartition before writing**:
```python
# Consolidate DataFrame partitions to match expected file count before write
df_cleaned.coalesce(4).write.format("delta").mode("append").save(target_path)
```

#### B. Post-Write Mitigation (Maintenance & Compaction):
- **OPTIMIZE with Z-ORDER**: Group and bin-pack files into uniform ~1GB files while colocating multi-dimensional filter columns:
```sql
OPTIMIZE delta_sales_bronze 
ZORDER BY (customer_id, transaction_date);
```
- **Automated Workflow Maintenance**: Schedule an automated off-peak Databricks workflow to run `OPTIMIZE` followed by `VACUUM`:
```sql
-- Remove old unreferenced small files older than retention period (default 7 days)
VACUUM delta_sales_bronze RETAIN 168 HOURS;
```

### Phase 3: Production Hardening & Gotchas
- **Z-Order Column Cardinality**: Never Z-Order on more than 3-4 columns or on high-cardinality unique UUIDs. Doing so dilutes space-filling curves and provides zero file-skipping benefits.
- **Over-Partitioning**: Do not partition tables with <1 TB of data. Partitioning a 50GB table by year/month/day creates thousands of empty or tiny subdirectories that severely degrade query performance."""
  },
  {
    "id": "arch-ansh-003",
    "source": "Architecture Hub",
    "category": "Advanced PySpark & Spark Core Optimization",
    "niche": "Spark Memory Management",
    "difficulty": "ARCHITECT",
    "question": "How does Spark's Unified Memory Manager allocate memory between execution memory and storage memory? Explain the dynamic borrowing rules and eviction policies under high concurrency.",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Spark's Unified Memory Manager (introduced in Spark 1.6+) divides JVM heap memory into three structural regions:
1. **Reserved Memory (300 MB)**: Hardcoded safety buffer for Spark's internal system tasks and safety margins.
2. **User Memory (40% of remaining heap by default)**: Stores user data structures, custom Python UDFs, internal metadata, and RDD dependencies. Controlled by `1 - spark.memory.fraction`.
3. **Spark Memory Pool (60% of remaining heap by default)**: Governed by `spark.memory.fraction` (default 0.6). This unified pool is shared dynamically between **Execution Memory** (shuffles, joins, sort buffers, aggregations) and **Storage Memory** (cached DataFrames, broadcast variables).

### Phase 2: Low-Level Mechanics & Dynamic Borrowing Rules
The boundary within the 60% Spark Pool is governed by `spark.memory.storageFraction` (default 0.5, meaning 30% of total heap is baseline storage):
```
Total JVM Heap
├── Reserved Memory: 300 MB
├── User Memory: (Heap - 300MB) * 0.4
└── Spark Memory Pool: (Heap - 300MB) * 0.6
    ├── Storage Baseline: 50% of Spark Pool
    └── Execution Baseline: 50% of Spark Pool
```
- **Dynamic Borrowing**:
  - If Storage Memory is idle, Execution Memory can borrow available space to process large shuffles and joins without spilling to disk.
  - If Execution Memory is idle, Storage Memory can borrow space to cache large DataFrames in memory.
- **Eviction Asymmetry**:
  - **Execution Evicts Storage**: If execution requires memory that was borrowed by storage, Spark forcefully evicts cached storage blocks to disk (`DISK_ONLY` or dropped) to prioritize task execution.
  - **Storage CANNOT Evict Execution**: If storage requires memory occupied by active execution (in-flight shuffle buffers), storage cannot evict active execution memory. Cached blocks will simply fail to fit in memory and will either spill to disk or remain uncached.

### Phase 3: Production Hardening & Gotchas
- **Excessive Caching Anti-Pattern**: Blindly executing `.cache()` on every intermediate DataFrame causes execution memory starvation, triggering continuous storage eviction and disk thrashing. Only cache DataFrames that are reused across multiple non-trivial actions.
- **Spill to Disk Monitoring**: Monitor `Spill (Memory)` and `Spill (Disk)` in the Spark UI Executor/Stage tab. If execution memory spills gigabytes to disk, increase `spark.memory.fraction` or scale up executor instance sizes (`memory-optimized` node types)."""
  },
  {
    "id": "arch-ansh-004",
    "source": "Architecture Hub",
    "category": "Databricks Lakehouse Architecture",
    "niche": "Continuous Ingestion & Schema Drift",
    "difficulty": "ARCHITECT",
    "question": "Your team receives event data continuously landing in cloud storage from external upstream partners who periodically add new columns or alter schemas without prior notice. How would you architect a resilient ingestion pipeline using Databricks Auto Loader?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In real-world data platforms, upstream operational systems inevitably modify payloads (schema drift) without coordination. Traditional ETL pipelines fail with schema mismatch errors (`AnalysisException`).
Databricks Auto Loader (`cloudFiles`) solves this through:
1. **Dynamic Schema Inference**: Infers schema across initial files and persists it in a dedicated cloud storage checkpoint directory.
2. **Automated Schema Evolution**: Appends new columns to the Delta target table atomically without pipeline failure.
3. **Data Protection via `_rescued_data`**: Any record containing corrupted characters or fields with mismatched data types is automatically captured into a hidden JSON string column (`_rescued_data`), preventing pipeline termination and zero data loss.

### Phase 2: Low-Level Mechanics & Implementation
```python
from pyspark.sql import SparkSession

checkpoint_path = "abfss://checkpoints@datalakeprod.dfs.core.windows.net/events_stream"
schema_location = "abfss://checkpoints@datalakeprod.dfs.core.windows.net/events_schema"
source_path = "abfss://raw@datalakeprod.dfs.core.windows.net/landing/events/"
target_table = "bronze_events"

# Configure resilient Auto Loader stream
streaming_df = spark.readStream \\
    .format("cloudFiles") \\
    .option("cloudFiles.format", "json") \\
    .option("cloudFiles.schemaLocation", schema_location) \\
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns") \\
    .option("cloudFiles.inferColumnTypes", "true") \\
    .load(source_path)

# Stream into Delta table with automatic schema merge
query = streaming_df.writeStream \\
    .format("delta") \\
    .option("checkpointLocation", checkpoint_path) \\
    .option("mergeSchema", "true") \\
    .outputMode("append") \\
    .trigger(availableNow=True) \\
    .toTable(target_table)
```

### Phase 3: Production Hardening & Gotchas
- **Evolution Modes**:
  - `addNewColumns` (Default): Automatically appends new columns to target schema.
  - `rescue`: Leaves target schema unchanged and routes all unmapped columns into `_rescued_data`.
  - `failOnNewColumns`: Halts pipeline to alert data governance teams before ingestion.
- **Rescued Data Monitoring**: Set up an automated Delta Live Tables (DLT) expectation or SQL monitor query checking `SELECT count(*) FROM bronze_events WHERE _rescued_data IS NOT NULL`. Alert data engineers when corrupted types land."""
  },
  {
    "id": "arch-ansh-005",
    "source": "Architecture Hub",
    "category": "Databricks Lakehouse Architecture",
    "niche": "Compute Sizing & Cost Optimization",
    "difficulty": "ARCHITECT",
    "question": "Your enterprise data platform has two distinct workloads: daily batch ETL pipelines running once a day for 25 minutes, and ad-hoc BI/analyst queries running intermittently throughout the day. How would you architect compute between Serverless Compute vs. Job Clusters vs. All-Purpose Clusters for cost and stability?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
A primary cause of cloud cost overrun in Databricks is misallocating cluster compute types. The three compute options have fundamentally different economics:
1. **Serverless Compute**: Managed in Databricks compute plane, instant boot (<5 seconds), per-second billing, immediate down-scaling (1–2 min auto-stop). Lower total DBU + VM overhead for short, bursty, or intermittent workloads.
2. **Automated Job Clusters**: Ephemeral VMs provisioned in customer tenant for a specific pipeline run. Billed at lower DBU rates than all-purpose clusters (~0.15 DBU vs ~0.40 DBU), but takes 3–5 minutes to spin up and acquire cloud VMs.
3. **All-Purpose Clusters**: Long-running shared interactive clusters for interactive data exploration. High DBU rate and idle cost risk if auto-termination is improperly configured.

### Phase 2: Architectural Mapping by Workload
```
Workload 1: Daily Batch ETL (25 mins once daily)
└── Architecture: Automated Databricks Job Cluster (Single-node or Fixed Multi-node)
    ├── Rationale: The 3-minute spin-up overhead is negligible for a 25-min run.
    └── FinOps Benefit: Job DBU rate is 60% cheaper than all-purpose compute.

Workload 2: Ad-Hoc Analyst & BI Queries (Intermittent during day)
└── Architecture: Serverless SQL Warehouse / Serverless Interactive Notebooks
    ├── Rationale: Zero cold-start latency (<5 sec). Cluster terminates after 1-2 min of inactivity.
    └── FinOps Benefit: Eliminates paying for 8 hours of idle VM uptime when queries only run occasionally.
```

### Phase 3: Production Hardening & Gotchas
- **The All-Purpose Production Sin**: Never run automated scheduled production pipelines on All-Purpose clusters. All-Purpose DBUs cost ~2.5x more than Job Clusters for the exact same vCPU resources.
- **Spot Instance Configuration**: For non-critical ETL Job Clusters, leverage Azure Spot VMs or AWS Spot Instances for worker nodes (`spot_bid_max_price = -1`) while maintaining the Driver node on On-Demand compute to achieve up to 70% cloud infrastructure savings."""
  },
  {
    "id": "arch-ansh-006",
    "source": "Architecture Hub",
    "category": "Databricks Lakehouse Architecture",
    "niche": "Automated Alerting & Observability",
    "difficulty": "HARD",
    "question": "The business team tracks a daily revenue KPI in a Delta table. If daily revenue drops by more than 10% compared to the previous day, stakeholders must be alerted immediately via Slack/Email. How would you design and implement this automated alert system in Databricks?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
A production data platform must incorporate automated business observability to detect data anomalies or business degradation before downstream dashboards consume inaccurate figures:
1. **KPI Delta Calculation**: A scheduled SQL/PySpark query evaluates today's daily aggregate against yesterday's revenue using `LAG()` window functions.
2. **Evaluation Layer**: Compute the percentage drop: `(today_revenue - yesterday_revenue) / yesterday_revenue * 100`.
3. **Alerting & Notification Router**: Databricks SQL Alerts or Python notification hooks evaluate the threshold condition (`drop_pct < -10%`) and trigger notifications via Webhooks to Slack channels, Microsoft Teams, or PagerDuty.

### Phase 2: Low-Level Mechanics & Implementation
```sql
-- Step 1: Create an Alert View in Databricks SQL
CREATE OR REPLACE VIEW gold_daily_revenue_kpi_alert AS
WITH daily_revenue AS (
  SELECT 
    transaction_date,
    SUM(sale_amount) AS current_revenue,
    LAG(SUM(sale_amount), 1) OVER (ORDER BY transaction_date) AS prev_revenue
  FROM gold_sales_transactions
  WHERE transaction_date >= current_date() - INTERVAL 2 DAYS
  GROUP BY transaction_date
)
SELECT 
  transaction_date,
  current_revenue,
  prev_revenue,
  ROUND(((current_revenue - prev_revenue) / prev_revenue) * 100, 2) AS revenue_pct_change,
  CASE 
    WHEN ((current_revenue - prev_revenue) / prev_revenue) * 100 < -10.0 THEN 1 
    ELSE 0 
  END AS is_alert_triggered
FROM daily_revenue
WHERE transaction_date = current_date() - INTERVAL 1 DAY;
```
- **Databricks SQL Alert Setup**:
  1. Navigate to **SQL Alerts** -> Create Alert.
  2. Select query `SELECT is_alert_triggered FROM gold_daily_revenue_kpi_alert`.
  3. Condition: Trigger alert when `is_alert_triggered == 1`.
  4. Destination: Select configured Slack Webhook or Email Notification Group.

### Phase 3: Production Hardening & Gotchas
- **Pipeline Timing Dependencies**: Ensure the alert job is scheduled as a dependent downstream task in the ETL DAG immediately following table publication. Running the alert on a wall-clock schedule risks alerting on incomplete micro-batches.
- **Zero Revenue False Positives**: Add safeguard logic: `WHERE prev_revenue > 0` to prevent division by zero errors during initial table bootstrapping or system maintenance periods."""
  },
  {
    "id": "arch-ansh-007",
    "source": "Architecture Hub",
    "category": "Databricks Lakehouse Architecture",
    "niche": "Self-Service Analytics Architecture",
    "difficulty": "HARD",
    "question": "Finance and business analysts frequently request SQL data extractions across different date ranges, countries, and categories, but are uncomfortable modifying SQL queries. How would you architect reusable, parameterized SQL queries in Databricks so non-technical users can execute analyses without touching code?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Data teams frequently suffer from ad-hoc operational fatigue—answering repetitive analyst tickets simply to update dates or filter criteria in SQL scripts.
The architectural solution leverages **Databricks SQL Query Parameters & Dropdown Widgets**:
1. **Parameterized Query Templates**: SQL statements embed typed parameter placeholders (e.g. `{{ start_date }}`, `{{ country }}`).
2. **Interactive UI Widgets**: Databricks SQL automatically renders these parameters as interactive UI components (Date Pickers, Multi-Select Dropdowns, Text boxes).
3. **Query Federation & Security**: Queries execute against Unity Catalog views governed by the user's role, ensuring non-technical stakeholders only access authorized data subsets.

### Phase 2: Low-Level Mechanics & Implementation
```sql
-- Parameterized Databricks SQL Query
SELECT 
    f.country_code,
    c.customer_name,
    p.product_category,
    SUM(f.sale_amount) AS total_revenue,
    COUNT(DISTINCT f.order_id) AS total_orders
FROM gold_sales_fact f
JOIN dim_customers c ON f.customer_id = c.customer_id
JOIN dim_products p ON f.product_id = p.product_id
WHERE f.order_date BETWEEN '{{ start_date }}' AND '{{ end_date }}'
  AND f.country_code = '{{ country_dropdown }}'
GROUP BY 1, 2, 3
ORDER BY total_revenue DESC;
```
- **Parameter Configuration in Databricks UI**:
  - `start_date`: Type = `Date`, Default = `First day of current month`.
  - `end_date`: Type = `Date`, Default = `Current date`.
  - `country_dropdown`: Type = `Dropdown List`, Query-Based = `SELECT DISTINCT country_code FROM dim_country ORDER BY 1`.

### Phase 3: Production Hardening & Gotchas
- **SQL Injection Prevention**: Databricks SQL parameters are sanitized and passed as parameterized values, preventing SQL injection exploits.
- **Query Caching & Warehouse Suspension**: Pair parameterized dashboards with a Serverless SQL Warehouse with query caching enabled. Repeated executions with the same filters return results in sub-seconds directly from cache with zero compute charges."""
  },
  {
    "id": "arch-ansh-008",
    "source": "Architecture Hub",
    "category": "Databricks Lakehouse Architecture",
    "niche": "Enterprise Governance & Access Control",
    "difficulty": "ARCHITECT",
    "question": "Your enterprise operates three Databricks workspaces (Dev, Test, Prod) across different business units with data centralized in ADLS Gen2. How would you design the governance architecture using Unity Catalog to enforce unified row/column-level access control and cross-workspace data lineage?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Prior to Unity Catalog, each workspace used isolated Hive metastores and cluster-level storage mount points (`dbfs:/mnt/`), creating fragmented permissions, credential leakage, and zero cross-workspace lineage.
The modern Unity Catalog architecture centralizes governance at the account level:
1. **Single Account-Level Metastore per Cloud Region**: Assigned to Dev, Test, and Prod workspaces.
2. **Decoupled Security via Managed Identity**: Azure Access Connector with `Storage Blob Data Contributor` RBAC role on ADLS Gen2 accounts.
3. **3-Level Namespace Hierarchy**:
   - `catalog` = Environment / Domain (e.g. `prod_finance`, `dev_marketing`).
   - `schema` = Logical layer / Pipeline stage (`bronze`, `silver`, `gold`).
   - `table / volume` = Assets.

### Phase 2: Low-Level Mechanics & Implementation
```sql
-- Step 1: Define Catalog & Schema
CREATE CATALOG IF NOT EXISTS prod_enterprise 
MANAGED LOCATION 'abfss://managed@datalakeprod.dfs.core.windows.net/unity_managed/';

USE CATALOG prod_enterprise;
CREATE SCHEMA IF NOT EXISTS silver_hr;

-- Step 2: Implement Column-Level Dynamic Masking
CREATE OR REPLACE FUNCTION mask_email(email STRING)
RETURN CASE 
  WHEN IS_ACCOUNT_GROUP_MEMBER('hr_executives') THEN email
  ELSE CONCAT(LEFT(email, 2), '****@domain.com')
END;

ALTER TABLE silver_hr.employees 
ALTER COLUMN email_address SET MASK mask_email;

-- Step 3: Implement Row-Level Security Filter
CREATE OR REPLACE FUNCTION filter_by_country(country STRING)
RETURN IS_ACCOUNT_GROUP_MEMBER('global_admins') OR country = current_user_country();

ALTER TABLE silver_hr.employees 
SET ROW FILTER filter_by_country ON (country_code);
```

### Phase 3: Production Hardening & Gotchas
- **Metastore Regional Limit**: Remember: only **one Unity Catalog metastore** can be created per cloud region per Databricks account. Multiple workspaces in the same region share that single metastore.
- **External Locations vs. Managed Storage**: Never store sensitive production data in the metastore's default root storage. Create dedicated `EXTERNAL LOCATION` objects mapped to distinct ADLS storage containers with lifecycle policies."""
  },
  {
    "id": "arch-ansh-009",
    "source": "Architecture Hub",
    "category": "Databricks Lakehouse Architecture",
    "niche": "Serverless SQL Warehouse Autoscaling",
    "difficulty": "HARD",
    "question": "A BI dashboard experiences heavy traffic from hundreds of concurrent users during business hours (8 AM - 6 PM), but near-zero queries overnight. How would you architect and configure a Serverless SQL Warehouse to handle this traffic pattern with optimal performance and minimum cost?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Handling high-concurrency BI queries with static compute clusters forces a difficult tradeoff: either over-provisioning (paying thousands of dollars for idle compute overnight) or under-provisioning (causing query queueing and dashboard timeouts during business hours).
**Databricks Serverless SQL Warehouse with Multi-Cluster Autoscaling** solves this:
- **Instant Scaling**: Serverless compute provisions warm VMs in <5 seconds.
- **Dynamic Multi-Cluster Scaling**: As concurrent query volume increases, Databricks automatically spins up additional cluster instances (scaling out horizontally) to prevent query queuing.
- **Aggressive Auto-Stop**: Scales down cluster instances when traffic drops and completely shuts down after 1–2 minutes of inactivity.

### Phase 2: Low-Level Mechanics & Implementation
1. **Warehouse Sizing Configuration**:
   - **Cluster Size**: `Medium` (32 cores per cluster) or `Large` (64 cores) depending on analytical query complexity.
   - **Scaling Policy**: Minimum Clusters = `1`, Maximum Clusters = `5`.
   - **Scaling Mode**: `Reliability` (proactively scales out as query queue builds) or `Cost-Optimized` (waits for consistent queueing before spinning additional nodes).
   - **Auto-Stop Timeout**: Set to `1 minute` or `2 minutes`.
2. **Photon Engine & Result Caching**:
   - Ensure Photon Vectorized Engine is enabled.
   - Enable Serverless Result Caching: repeated dashboard refreshes bypass compute entirely and return instant sub-second results directly from Databricks storage cache.

### Phase 3: Production Hardening & Gotchas
- **Serverless Network Isolation**: Ensure that Private Link / Customer-Managed VNet endpoints are properly configured if corporate compliance prohibits traffic over public endpoints.
- **Queue Time Metric**: Continuously monitor `Queued Queries` metric in Databricks SQL Warehouse Monitoring. If queries queue for >3 seconds before cluster scaling, adjust minimum cluster count to `2` during peak 8 AM–6 PM windows via Databricks REST API automation."""
  },
  {
    "id": "arch-ansh-010",
    "source": "Architecture Hub",
    "category": "Databricks Lakehouse Architecture",
    "niche": "GenAI over Lakehouse & Data Intelligence",
    "difficulty": "ARCHITECT",
    "question": "Business users want to ask analytical questions in plain English (e.g., 'What were last quarter’s top selling products in Canada?') over Lakehouse Delta tables. How would you architect this natural language to SQL capability using Databricks Genie Spaces and RAG?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Historically, bridging non-technical users to SQL required either static BI reports or brittle text-to-SQL prompt wrappers around generic LLMs.
The modern architectural approach leverages **Databricks Genie Spaces (built on Data Intelligence Platform / DBRX / Compound AI)**:
1. **Semantic Grounding via Unity Catalog**: Genie is not a standalone chatbot—it grounds its reasoning in Unity Catalog metadata, table comments, column definitions, and primary/foreign key constraints.
2. **Trusted SQL Benchmarking**: Data engineers curate curated 'golden queries' (benchmark SQL examples) that Genie references as few-shot exemplars.
3. **Execution Sandbox**: Genie generates SQL, checks syntax, executes against a Serverless SQL Warehouse, and presents both the narrative answer and the executed SQL with interactive visualizations.

### Phase 2: Implementation Blueprint
1. **Curate Semantic Catalog Metadata**:
```sql
ALTER TABLE gold_sales SET TBLPROPERTIES (
  'comment' = 'Consolidated gold transaction facts containing gross revenue, product SKU, and country ISO codes.'
);
ALTER TABLE gold_sales ALTER COLUMN sale_amount 
COMMENT 'Gross transaction amount in USD before taxes and rebates.';
```
2. **Configure Genie Space**:
   - Navigate to **Databricks SQL** -> **Genie Spaces** -> Create Space.
   - Add Tables: `gold_sales`, `dim_products`, `dim_customers`.
   - Provide Example Benchmark Queries (e.g. Top products by country).
   - Assign Dedicated Serverless SQL Warehouse.

### Phase 3: Production Hardening & Gotchas
- **Hallucination Prevention**: If metadata is ambiguous (e.g. column named `amt` without description), LLMs hallucinate calculations. High semantic hygiene (detailed column comments and constraints) is a hard prerequisite.
- **Access Governance**: Genie strictly inherits Unity Catalog permissions. If a user does not have permission to view European sales data (via Row-Level Security), Genie cannot query or expose that data."""
  },
  {
    "id": "arch-ansh-011",
    "source": "Architecture Hub",
    "category": "Databricks Lakehouse Architecture",
    "niche": "Delta Lake Optimization & GDPR",
    "difficulty": "ARCHITECT",
    "question": "Under data privacy regulations (GDPR / CCPA), your team must delete hundreds of individual customer records daily from a multi-billion-row analytical Delta table. How do Deletion Vectors optimize this workload and avoid the catastrophic write amplification of traditional deletes?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Under traditional Copy-on-Write (COW) Delta Lake:
- Deleting 1 customer row in a 500 MB Parquet file containing 5 million rows requires reading the 500 MB file, filtering out the 1 row, and writing a brand-new 499.99 MB Parquet file.
- If 100 deletion requests touch 100 different files, Spark rewrites 50 GB of data to delete a few kilobytes of records—creating massive I/O bottlenecks and transaction conflicts.
**Deletion Vectors (DV)** solve this:
- Instead of rewriting the Parquet data file, Spark writes a tiny (few kilobytes) Roaring Bitmap index file recording the relative row IDs marked for deletion.
- Reader queries scan the original Parquet file while using the Deletion Vector bitmap to skip deleted rows in-memory.

### Phase 2: Low-Level Mechanics & Implementation
```sql
-- Step 1: Enable Deletion Vectors on Target Table
ALTER TABLE gold_customer_360 SET TBLPROPERTIES (
  'delta.enableDeletionVectors' = true
);

-- Step 2: Execute High-Frequency Privacy Deletes (sub-second execution)
DELETE FROM gold_customer_360 
WHERE customer_id IN ('CUST_99120', 'CUST_44219', 'CUST_88211');

-- Step 3: Periodic Background Compaction (Merges DVs into base Parquet)
OPTIMIZE gold_customer_360;
```

### Phase 3: Production Hardening & Gotchas
- **Read Degradation Over Time**: If thousands of deletion vectors accumulate without compaction, read performance degrades as queries spend time reading multiple bitmap files per Parquet file.
  *Remediation*: Schedule daily off-peak `OPTIMIZE` commands to purge deletion vectors and rewrite base files cleanly.
- **Client Compatibility**: Deletion Vectors require Delta Lake 2.3+ / Databricks Runtime 12.1+. Legacy engines (e.g. older Presto/Trino or Synapse serverless connectors) may fail to read tables with DVs unless compatibility flags are set."""
  },
  {
    "id": "arch-ansh-012",
    "source": "Architecture Hub",
    "category": "Databricks Lakehouse Architecture",
    "niche": "Disaster Recovery & Time Travel",
    "difficulty": "ARCHITECT",
    "question": "A production bug caused an accidental DELETE statement to wipe out thousands of active transaction records from a core Delta table. How would you immediately recover the table to its exact pre-incident state using Delta Lake Time Travel, and what are the operational safeguards?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In traditional databases, recovering from an accidental table delete requires restoring physical database backups from cold storage—taking hours and causing massive downtime.
Delta Lake provides native atomic **Time Travel and Table Restoration**:
1. **Immutable Parquet Storage**: When records are deleted, the underlying Parquet files are not immediately deleted from cloud storage—they are simply unreferenced in the newest commit log (`_delta_log`).
2. **Transaction Log Audit**: `DESCRIBE HISTORY` reveals the exact commit timestamp, version number, user identity, and operation type (`DELETE`).
3. **Point-In-Time Restoration**: The `RESTORE TABLE` command instantly rolls the table back to the target version in milliseconds by committing a new snapshot referencing the older valid files.

### Phase 2: Low-Level Mechanics & Incident Runbook
```sql
-- Step 1: Inspect transaction log to identify incident version
DESCRIBE HISTORY gold_transactions;
-- Look for operation = 'DELETE', identify version N-1 (e.g. Version 42)

-- Step 2: Validate data in previous snapshot
SELECT COUNT(*) FROM gold_transactions VERSION AS OF 42;

-- Step 3: Instant Disaster Recovery Restoration
RESTORE TABLE gold_transactions TO VERSION AS OF 42;

-- Alternative: Timestamp-based restoration
-- RESTORE TABLE gold_transactions TO TIMESTAMP AS OF '2026-10-11 14:30:00';
```

### Phase 3: Production Hardening & Gotchas
- **The VACUUM Horizon**: `RESTORE TABLE` only works if the historical Parquet files have not been expunged by `VACUUM`. Ensure production tables have a minimum retention of 7 to 14 days (`delta.deletedFileRetentionDuration = 'interval 14 days'`).
- **Downstream Streaming Checkpoints**: If downstream streaming pipelines read this table with `readStream`, restoring an older version breaks downstream stream continuity. Downstream streams must be re-initialized from an updated checkpoint."""
  },
  {
    "id": "arch-ansh-013",
    "source": "Architecture Hub",
    "category": "Azure Data Platform Architecture",
    "niche": "High-Volume Database Ingestion",
    "difficulty": "HARD",
    "question": "How do you architect an Azure Data Factory pipeline to migrate 50 million records daily from an on-premises SQL Server into ADLS Gen2 with minimal source load and optimal copy duration?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Copying large datasets across a hybrid network from on-premises SQL Server to cloud ADLS Gen2 faces three primary bottlenecks: network bandwidth, on-prem database CPU/disk contention, and single-threaded ingestion limits.
The architectural design incorporates:
1. **Self-Hosted Integration Runtime (SHIR) Clustering**: Multiple high-spec nodes provisioned close to the SQL Server on a dedicated 10 Gbps ExpressRoute connection.
2. **Dynamic Range Partitioning in Copy Activity**: Slices the table into parallel physical chunks using an indexed numeric or date partition column.
3. **Staged Copy Pattern**: ADF copies binary chunks to Azure Blob Storage staging before bulk writing to ADLS Gen2.

### Phase 2: Low-Level Mechanics & Configuration
1. **Physical Source Partitioning**:
   - In Copy Activity Source, select **Partition option** -> `Physical partitions of table` or `Dynamic range`.
   - Partition Column: `transaction_id` (Clustered Index).
   - Upper bound: `SELECT MAX(transaction_id) FROM sales`.
   - Lower bound: `SELECT MIN(transaction_id) FROM sales`.
2. **Concurrency & DIU Settings**:
   - `Degree of copy parallelism`: `16` to `32`.
   - `Data Integration Units (DIU)`: `32` to `64`.
3. **Format & Compression**:
   - Sink dataset: Parquet format with Snappy compression to minimize egress bytes and storage footprint.

### Phase 3: Production Hardening & Gotchas
- **Source Database Contention**: Running 32 parallel queries against on-prem SQL Server can saturate IOPS. Coordinate with DBAs to use `WITH (NOLOCK)` read-uncommitted isolation or snapshot isolation.
- **SHIR CPU Bottlenecks**: Ensure the SHIR host machine has at least 8 vCPUs and 32 GB RAM. If CPU reaches >80%, configure concurrent job limits or add nodes to the SHIR logical cluster."""
  },
  {
    "id": "arch-ansh-014",
    "source": "Architecture Hub",
    "category": "Azure Data Platform Architecture",
    "niche": "Pipeline Performance Diagnosis",
    "difficulty": "HARD",
    "question": "An enterprise ADF pipeline that usually completes in 20 minutes suddenly takes over 3 hours to run. How do you systematically identify the bottleneck and fix the performance degradation?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Troubleshooting slow ADF pipelines requires analyzing execution metrics across the end-to-end data trajectory (Source -> Integration Runtime -> Network Transport -> Sink):
1. **Activity-Level Telemetry**: Open the ADF Monitoring Hub, click into the failed/slow run, and view the **Copy Activity Details dialog**.
2. **Breakdown Inspection**:
   - `Duration by stage`: Queued time, Pre-copy script, Transfer duration, Sink write duration.
   - `Throughput`: Data read rate vs. data written rate.
   - `Source bottleneck`: High `Time to first byte` indicates database query lock or lack of indexing.
   - `Sink bottleneck`: Low write throughput indicates file system throttling or sink concurrency limits.

### Phase 2: Diagnostic Matrix & Remediation
```
Observation 1: High Queued Time (>30 mins)
└── Cause: Integration Runtime concurrency limit reached or cloud VM provisioning delays.
└── Remediation: Scale SHIR concurrent job limit or upgrade Azure IR region allocation.

Observation 2: High Transfer Duration & Low Throughput (<2 MB/s)
└── Cause: Single-threaded read or lack of copy parallelism.
└── Remediation: Enable dynamic range partitioning on source table and increase DIUs.

Observation 3: Slow Pre-Copy Script
└── Cause: Heavy unindexed TRUNCATE/DELETE or lock contention on sink table.
└── Remediation: Replace row-level deletes with partition drops or staging table swaps.
```

### Phase 3: Production Hardening & Gotchas
- **ADLS Gen2 Storage Throttling**: If ADF receives HTTP 503 (Server Busy) errors, storage account IOPS or ingress limits (60 Gbps) are being exceeded. Distribute hot data across multiple storage accounts or adjust concurrency."""
  },
  {
    "id": "arch-ansh-015",
    "source": "Architecture Hub",
    "category": "Azure Data Platform Architecture",
    "niche": "Mapping Data Flow Optimization",
    "difficulty": "HARD",
    "question": "An ADF Mapping Data Flow pipeline processing customer transaction records crashes intermittently with Out of Memory (OOM) errors during aggregation stages. How would you diagnose and optimize the compute and transformation logic to prevent memory exhaustion?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
ADF Mapping Data Flows compile graphical transformation pipelines into Spark execution plans executed on Azure-managed Spark clusters. OOM errors typically occur due to:
1. **Undersized Integration Runtime Compute**: Default General Purpose cluster sizes (4 or 8 cores) lack sufficient memory per worker for large datasets.
2. **Data Skew & Wide Transformations**: `Aggregate`, `Join`, and `Window` transformations force full network shuffles that concentrate data into a single worker partition.
3. **Inefficient Column Selection**: Passing dozens of unused string columns through wide transformations exhausts executor heap memory.

### Phase 2: Low-Level Mechanics & Remediation
1. **Azure IR Compute Scaling**:
   - Change Compute Type from **General Purpose** to **Memory Optimized** (provides 8 GB RAM per core instead of 4 GB).
   - Increase Core Count to `16+4` or `32+16` cores depending on dataset volume.
2. **Column Pruning & Early Filtering**:
   - Use `Select` transformation immediately after Source to drop all unused columns.
   - Apply `Filter` transformations as close to the Source as possible before any `Join` or `Aggregate`.
3. **Partition Optimization**:
   - In the `Optimize` tab of the heavy transformation, change partition option to **Round Robin** or **Key Partitioning** to evenly distribute skewed keys across workers.

### Phase 3: Production Hardening & Gotchas
- **Quick-Start Clusters (Time to Live - TTL)**: By default, Mapping Data Flows spin down clusters after execution, requiring 4-5 minutes cluster startup latency on the next run. Configure a `Time to Live (TTL)` of 30–60 minutes in Azure IR settings for consecutive pipeline runs to reuse warm compute."""
  },
  {
    "id": "arch-ansh-016",
    "source": "Architecture Hub",
    "category": "Azure Data Platform Architecture",
    "niche": "Cloud Security & Key Vault Governance",
    "difficulty": "HARD",
    "question": "How do you architect enterprise secret management and role-based access control (RBAC) across Azure Data Factory, Azure Key Vault, and ADLS Gen2 to ensure zero plaintext credential exposure?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Hardcoding database passwords, API tokens, or storage keys in pipeline JSON definitions creates severe security vulnerabilities and audit failures.
The production architecture enforces **Zero-Trust Identity Federation**:
1. **Managed Identity Authentication**: ADF uses its system-assigned or user-assigned Managed Identity (MI) to authenticate to Azure Key Vault and ADLS Gen2.
2. **Azure Key Vault Linked Service**: ADF references secret names dynamically rather than storing credential values.
3. **Secure Input & Secure Output**: Sensitive activity parameters are masked from execution logs and monitoring UI.

### Phase 2: Low-Level Mechanics & Implementation
1. **Grant Azure Key Vault RBAC to ADF**:
   - Assign ADF Managed Identity the **Key Vault Secrets User** role on the Key Vault instance.
2. **Configure ADF Key Vault Linked Service**:
   - Authentication method: `Managed Identity`.
   - Key Vault URL: `https://kv-enterprise-prod.vault.azure.net/`.
3. **Reference Secrets Dynamically in Linked Services**:
   - In target SQL Linked Service: Select Password -> `Azure Key Vault`.
   - Secret Name: `@pipeline().parameters.secret_name`.
4. **Enforce Activity Security**:
   - On Web / Lookups handling secrets, check **Secure Input** and **Secure Output** boxes to prevent secret leakage in execution monitoring logs.

### Phase 3: Production Hardening & Gotchas
- **Secret Caching & Rotation**: When database passwords rotate in Key Vault, ADF automatically retrieves the latest version upon next pipeline execution without requiring pipeline redeployment.
- **Key Vault Firewall Restrictions**: If Key Vault disables public network access, ensure the ADF Azure IR has **Allow Trusted Microsoft Services** enabled or deploy a Managed Virtual Network with Private Endpoints."""
  },
  {
    "id": "arch-ansh-017",
    "source": "Architecture Hub",
    "category": "Azure Data Platform Architecture",
    "niche": "REST API Ingestion & Pagination",
    "difficulty": "HARD",
    "question": "How do you architect a robust ingestion pipeline in Azure Data Factory to extract data from a third-party REST API that implements token-based pagination, rate limits, and transient 500 errors?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Extracting data from external REST APIs requires addressing rate limits, pagination, and network instability:
1. **Dynamic Pagination Handling**: The REST connector natively supports standard pagination rules (e.g. `AbsoluteUrl`, `QueryParameters`, or `Headers`).
2. **Rate Limit Throttling**: Configurable retry intervals and backoff policies prevent triggering HTTP 429 (Too Many Requests).
3. **Transient Fault Recovery**: Automated retry policies with exponential backoff handle temporary 500/503 network glitches.

### Phase 2: Low-Level Mechanics & Configuration
1. **REST Source Pagination Rules**:
   - In REST dataset settings, configure pagination:
   - Rule: `AbsoluteUrl` -> Body expression: `$.pagination.next_page_url` (or `QueryParameters['page']`).
   - End condition: `$.pagination.next_page_url` is null or empty.
2. **Copy Activity Resilience**:
   - `Retry`: `3` to `5`.
   - `Retry interval (sec)`: `30`.
3. **Looping with Web Activity (For Complex Auth)**:
   - If token expires hourly, use an outer pipeline executing a Web Activity to refresh OAuth2 tokens, passing the bearer token dynamically to the downstream Copy Activity.

### Phase 3: Production Hardening & Gotchas
- **Response Size Limits**: ADF Web Activity has a 4 MB output limit. For API responses exceeding 4 MB, always use the **Copy Activity with REST Source** streaming directly into ADLS Gen2 storage instead of Web Activity."""
  },
  {
    "id": "arch-ansh-018",
    "source": "Architecture Hub",
    "category": "Azure Data Platform Architecture",
    "niche": "Integration Runtime High Availability",
    "difficulty": "HARD",
    "question": "How do you architect high availability, load balancing, and disaster recovery for Azure Data Factory Self-Hosted Integration Runtimes (SHIR) in mission-critical hybrid enterprise environments?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
A single Self-Hosted Integration Runtime represents a single point of failure (SPOF). If the host VM reboots or fails, all dependent hybrid ETL pipelines halt immediately.
The enterprise architecture requires **Multi-Node Logical SHIR Clustering**:
- A single logical SHIR can join up to **4 physical or virtual nodes**.
- **Automatic Load Balancing**: Jobs are distributed across healthy nodes based on available CPU and memory.
- **Transparent Failover**: If the primary node goes offline, a secondary node is automatically promoted to role coordinator with zero pipeline downtime.

### Phase 2: Implementation & Scaling Blueprint
1. **Cluster Node Setup**:
   - Provision 2 to 4 identical VMs (e.g. 8 vCPU, 32 GB RAM) across different Azure Availability Zones or physical on-prem racks.
   - Install SHIR MSI package on Node 1 and register with the ADF authentication key.
   - Install SHIR on Node 2 and register using the **exact same authentication key** to join the cluster.
2. **Concurrent Job Tuning**:
   - Set maximum concurrent jobs per node based on CPU capacity: `Concurrent Jobs = Cores * 3` (e.g., 24 concurrent jobs for an 8-core VM).

### Phase 3: Production Hardening & Gotchas
- **Cross-Node Intranet Communication**: Ensure port 8060 is open between SHIR nodes for internal cluster sync and heartbeat monitoring.
- **Auto-Update Disruption**: Disable automated auto-updates during critical production batch windows (`Auto-update = scheduled off-peak`) to avoid unexpected midday agent restarts."""
  },
  {
    "id": "arch-ansh-019",
    "source": "Architecture Hub",
    "category": "Advanced PySpark & Spark Core Optimization",
    "niche": "Catalyst Optimizer Internals",
    "difficulty": "ARCHITECT",
    "question": "Explain the step-by-step lifecycle of an Apache Spark SQL / PySpark query through the Catalyst Optimizer and Tungsten execution engine. How does Spark transform high-level DataFrame code into native Java bytecode?",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Apache Spark's performance advantage stems from its extensible query optimization framework, **Catalyst**, and physical execution engine, **Tungsten**. The lifecycle progresses through four fundamental phases:
1. **Analysis**: Resolves table and column names against the Catalog / Metastore.
2. **Logical Optimization**: Applies rule-based optimizations (predicate pushdown, constant folding, projection pruning).
3. **Physical Planning**: Generates multiple physical strategies (e.g. Sort-Merge vs Broadcast join) and selects the lowest cost model.
4. **Code Generation (Tungsten)**: Generates Java bytecode at runtime, collapsing transformations into a single compact loop.

### Phase 2: Deep Dive through the 4 Catalyst Phases
```
DataFrame / SQL Query
      │
      ▼
1. Unresolved Logical Plan (Syntax verified, names unresolved)
      │  (Analyzer + Catalog / Metastore lookup)
      ▼
2. Analyzed Logical Plan (Types, columns, relations fully resolved)
      │  (Logical Optimizer rules applied)
      ▼
3. Optimized Logical Plan (Predicate pushdown, projection pruning)
      │  (Cost-Based Optimizer - CBO)
      ▼
4. Physical Plans (Evaluates hash joins, sort joins, scan strategies)
      │  (Best Cost Physical Plan selected)
      ▼
5. Whole-Stage Code Generation (Tungsten JIT compiles to Java Bytecode)
      │
      ▼
RDD Execution on JVM Workers
```
- **Tungsten Whole-Stage Code Generation**: Collapses entire pipelines of filters, maps, and projections into a single JVM `for` loop, eliminating virtual method invocations and storing intermediate data in raw off-heap binary memory to bypass JVM GC.

### Phase 3: Production Hardening & Gotchas
- **Analyzing Plans in PySpark**: Use `df.explain(True)` or `df.explain("cost")` to verify that filters are pushed down to cloud storage scans (look for `PushedFilters: [...]` in the physical plan).
- **Black-Box Python UDFs**: Standard Python UDFs cannot be analyzed by Catalyst or compiled by Tungsten. They require serializing data to an external Python worker process, causing a 5x–10x slowdown. Always use native `pyspark.sql.functions` or Pandas UDFs (PyArrow vectorized)."""
  },
  {
    "id": "arch-ansh-020",
    "source": "Architecture Hub",
    "category": "Advanced PySpark & Spark Core Optimization",
    "niche": "Data Skew & Straggler Remediation",
    "difficulty": "ARCHITECT",
    "question": "During a massive distributed join in PySpark, 199 tasks finish in 30 seconds, but 1 final task hangs for 45 minutes before failing with an OutOfMemory error. Explain the root cause and detail the architectural solutions using Salting and Adaptive Query Execution.",
    "answer": """### Phase 1: Conceptual Foundation & Core Architecture
This classic scenario is known as the **'Straggler Task' or 'Data Skew' problem**.
- In standard Hash Partitioning, all records with the same join key are routed to the same partition and processed by a single executor core.
- If a dataset has 100 million records where 80 million records share a default key (e.g. `customer_id = NULL` or `store_id = 999`), 199 executor tasks process small, balanced partitions while 1 single task attempts to shuffle and process 80 million records in JVM memory, exhausting heap space and hanging the stage.

### Phase 2: Architectural Solutions
#### Solution A: The Salting Technique (Manual Remediation)
```python
from pyspark.sql import functions as F

# Step 1: Add a random salt (e.g. 0 to 4) to the skewed DataFrame
df_skewed_salted = df_skewed.withColumn("salt", F.concat(F.col("skewed_key"), F.lit("_"), (F.rand() * 5).cast("int")))

# Step 2: Explode the lookup DataFrame with matching salt range [0..4]
salt_df = spark.range(5).withColumnRenamed("id", "salt_id")
df_lookup_salted = df_lookup.crossJoin(salt_df) \\
    .withColumn("salt", F.concat(F.col("skewed_key"), F.lit("_"), F.col("salt_id")))

# Step 3: Join on the salted composite key
df_joined = df_skewed_salted.join(df_lookup_salted, on="salt", how="inner") \\
    .drop("salt", "salt_id")
```

#### Solution B: Adaptive Query Execution (AQE Skew Join)
In Spark 3.x+, AQE automates skew handling dynamically at runtime without modifying code:
```python
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor", "5")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "268435456") # 256 MB
```
- During shuffle execution, if AQE detects a partition that is 5x larger than median partitions and exceeds 256MB, it automatically splits the partition into multiple smaller sub-partitions and runs them in parallel.

### Phase 3: Production Hardening & Gotchas
- **Handling NULL Keys**: Frequently, skew is caused purely by missing/NULL keys. Filter out or isolate NULL records before joining:
```python
df_valid = df.filter(F.col("key").isNotNull())
df_nulls = df.filter(F.col("key").isNull())
# Join only valid records, then union nulls back
```"""
  }
]

def main():
    print(f"Reading {FILE_PATH}...")
    with open(FILE_PATH, 'r') as f:
        data = json.load(f)
    print(f"Initial count: {len(data)}")

    existing_ids = {q['id'] for q in data}
    to_add = []
    for q in new_arch_questions:
        if q['id'] in existing_ids:
            print(f"Skipping existing arch question id: {q['id']}")
        else:
            to_add.append(q)

    print(f"Adding {len(to_add)} new architecture questions...")
    data.extend(to_add)

    with open(FILE_PATH, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Final count: {len(data)}")
    print("Successfully appended architecture questions!")

if __name__ == '__main__':
    main()
