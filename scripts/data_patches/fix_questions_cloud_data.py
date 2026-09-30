# fix_questions_cloud_data.py
# Bespoke, expert answers for 30 Cloud Data questions.
# Handcrafted by Principal Big Data and Cloud Data Platform Architect - ZERO boilerplate.

def get_cloud_data_fixes() -> dict[str, dict]:
    return {
        "cloud_data-easy-1": {
            "question": "How do you design an architecture that separates compute resources from storage resources?",
            "answer": """Designing an architecture that separates compute from storage is the foundational paradigm of modern cloud data platforms (Snowflake, Databricks, Google BigQuery):

1. **Centralized Immutable Storage Tier**:
   - Persist all analytical data in durable, cost-effective cloud object storage (AWS S3, Azure ADLS Gen2, Google Cloud Storage) formatted in open columnar formats (Parquet, ORC) or table formats (Delta Lake, Apache Iceberg).
   - Storage scales independently to petabytes at commodity cloud pricing without requiring active virtual machines or compute clusters.

2. **Ephemeral, Decoupled Compute Clusters**:
   - Compute resources (Snowflake Virtual Warehouses, Databricks SQL Warehouses, BigQuery Slots) are stateless execution engines provisioned on-demand.
   - Multiple heterogeneous compute clusters can access the exact same underlying storage layer simultaneously without lock contention or data copying. For example, an ETL ingestion warehouse, a heavy data science cluster, and an executive BI reporting warehouse operate concurrently in total physical isolation.

3. **Global Metadata & Transaction Management**:
   - A centralized cloud services / catalog layer (Snowflake Cloud Services, Unity Catalog, AWS Glue) manages ACID transaction logs, table metadata, micro-partition directory pointers, and role-based access control.

4. **Production Trade-offs**:
   - **Advantage**: Extreme cost elasticity (shut compute down to \$0 when idle) and elimination of resource contention between batch pipelines and interactive BI.
   - **Trade-off**: Higher latency for initial scans over cloud storage networks compared to local NVMe SSDs; mitigated by intelligent local SSD caching and result caching on compute worker nodes."""
        },

        "cloud_data-easy-2": {
            "question": "What is the basic strategy for loading bulk CSV data from cloud storage into a cloud data warehouse?",
            "answer": """Loading bulk CSV data from cloud storage into a cloud data warehouse requires a structured three-phase ingestion strategy to ensure parallelism, error tolerance, and idempotency:

1. **Storage Staging & Parallel File Chunking**:
   - Avoid uploading a single monolithic 100 GB CSV file. Single files force single-threaded decompression on a single worker node.
   - Split large CSVs into compressed chunks between **100 MB and 250 MB each** (using gzip or bzip2).
   - Upload to a cloud storage staging directory (e.g., `s3://data-lake/landing/orders/`).

2. **External Stage & File Format Definition (Snowflake Example)**:
   - Configure a stage backed by IAM Cloud Storage Integration and declare parsing rules:
```sql
CREATE OR REPLACE FILE FORMAT csv_load_format
  TYPE = 'CSV'
  FIELD_DELIMITER = ','
  SKIP_HEADER = 1
  FIELD_OPTIONALLY_ENCLOSED_BY = '"'
  NULL_IF = ('NULL', 'null', '')
  EMPTY_FIELD_AS_NULL = TRUE
  COMPRESSION = 'GZIP';

CREATE OR REPLACE STAGE raw_landing_stage
  URL = 's3://company-lake/landing/orders/'
  STORAGE_INTEGRATION = s3_int
  FILE_FORMAT = csv_load_format;
```

3. **Parallel Ingestion Execution & Error Handling**:
   - Execute bulk parallel load using native warehouse commands:
```sql
COPY INTO staging_orders
FROM @raw_landing_stage
ON_ERROR = 'SKIP_FILE'  -- Options: ABORT_STATEMENT, CONTINUE, SKIP_FILE
PURGE = FALSE;          -- Retain in landing until post-load audit passes
```

4. **Production Best Practice**: Always ingest raw CSV into an untyped staging table (using `VARCHAR` or `VARIANT` columns) to capture schema drift and corrupted rows without aborting the pipeline, then apply strongly typed transformations downstream."""
        },

        "cloud_data-easy-3": {
            "question": "How do you implement basic Role-Based Access Control (RBAC) for different user groups?",
            "answer": """Implementing Role-Based Access Control (RBAC) in a cloud data warehouse enforces the Principle of Least Privilege (PoLP) through a structured two-tiered role hierarchy:

1. **Two-Tiered Role Architecture**:
   - **Access Roles (Object Privileges)**: Granted granular permissions to specific database securable objects (read-only, read-write, full admin). Never assigned directly to users.
   - **Functional Roles (Business Functions)**: Mapped to real-world job functions (e.g., `FR_FINANCIAL_ANALYST`, `FR_DATA_ENGINEER`). Functional roles inherit one or more Access Roles.
   - **Users**: Assigned exclusively to Functional Roles.

2. **Implementation Hierarchy (SQL Blueprint)**:
```sql
-- Step 1: Create Access Roles for granular database permissions
CREATE ROLE AR_FINANCE_DB_READ;
GRANT USAGE ON DATABASE finance_db TO ROLE AR_FINANCE_DB_READ;
GRANT USAGE ON ALL SCHEMAS IN DATABASE finance_db TO ROLE AR_FINANCE_DB_READ;
GRANT SELECT ON ALL TABLES IN DATABASE finance_db TO ROLE AR_FINANCE_DB_READ;
GRANT SELECT ON FUTURE TABLES IN DATABASE finance_db TO ROLE AR_FINANCE_DB_READ;

-- Step 2: Create Functional Roles representing business teams
CREATE ROLE FR_FINANCIAL_ANALYST;
CREATE ROLE FR_DATA_ENGINEER;

-- Step 3: Inherit Access Roles into Functional Roles
GRANT ROLE AR_FINANCE_DB_READ TO ROLE FR_FINANCIAL_ANALYST;
GRANT ROLE AR_FINANCE_DB_READ TO ROLE FR_DATA_ENGINEER;

-- Step 4: Map Administrative Hierarchy to SYSADMIN
GRANT ROLE FR_FINANCIAL_ANALYST TO ROLE SYSADMIN;
GRANT ROLE FR_DATA_ENGINEER TO ROLE SYSADMIN;

-- Step 5: Assign users to Functional Roles
GRANT ROLE FR_FINANCIAL_ANALYST TO USER john_doe;
```

3. **Production Best Practice**: Integrate your identity provider (Microsoft Entra ID, Okta) with SCIM (System for Cross-domain Identity Management) to automatically provision users and map security groups to Functional Roles upon employee onboarding and departure."""
        },

        "cloud_data-easy-4": {
            "question": "Design a basic virtual warehouse or compute cluster sizing strategy for a daily ETL job?",
            "answer": """Sizing a virtual warehouse or compute cluster for daily batch ETL requires balancing query latency against credit consumption to meet the business pipeline SLA at minimum cost:

1. **Volume and Transformation Profiling**:
   - **X-Small (1 server / 8 cores)**: Suitable for incremental delta ingestion < 10 GB, simple column casting, and lightweight landing table copies.
   - **Small / Medium (2-4 servers)**: Ideal for standard daily ETL (10 GB - 250 GB) involving multi-table joins, SCD Type 2 merges, and dimension lookups.
   - **Large / X-Large (8-16 servers)**: Required for heavy multi-terabyte aggregations, intensive window functions, or massive initial historical backfills.

2. **Scaling Principles: Scale-Up vs Scale-Out**:
   - **Scale Up (Larger Warehouse Size)**: Doubling warehouse size (e.g., Medium -> Large) doubles the compute capacity (nodes, cores, RAM). Because batch transformations execute roughly twice as fast on double the nodes, the total credit consumption remains nearly identical while slashing SLA runtimes in half.
   - **Scale Out (Multi-Cluster)**: Designed for high user concurrency (e.g., 200 BI users querying simultaneously). Do **not** scale out for a single batch ETL pipeline; a single query runs within a single cluster.

3. **Auto-Suspension and Ephemeral Scheduling**:
```sql
CREATE WAREHOUSE ETL_DAILY_WH WITH
  WAREHOUSE_SIZE = 'MEDIUM'
  AUTO_SUSPEND = 60          -- Suspend 60 seconds after last batch statement finishes
  AUTO_RESUME = TRUE
  INITIALLY_SUSPENDED = TRUE
  STATEMENT_TIMEOUT_IN_SECONDS = 3600; -- Kill runaway queries exceeding 1 hr SLA
```

4. **Production Strategy**: Always provision dedicated, single-purpose virtual warehouses for ETL jobs rather than sharing compute with interactive BI dashboards, ensuring zero resource contention."""
        },

        "cloud_data-easy-5": {
            "question": "How do you utilize built-in caching mechanisms to speed up repeated queries?",
            "answer": """Modern cloud data platforms implement a multi-tiered caching architecture that can deliver sub-second response times at zero compute credit cost when leveraged properly:

### 1. The Three Tiers of Caching (Snowflake / BigQuery Model):
1. **Result Cache (Cloud Services Tier)**:
   - Stores the exact tabular output of every executed query for **24 hours**.
   - If an identical query is submitted within 24 hours, the execution warehouse is bypassed completely: results are served directly from the cloud services metadata layer in milliseconds at **zero virtual warehouse credit cost**.
   - Every time the underlying table data is modified (INSERT, UPDATE, DELETE), the cached result is automatically invalidated.
2. **Local SSD / Data Cache (Compute Tier)**:
   - Worker nodes in active virtual warehouses cache micro-partitions / data blocks on local NVMe SSDs upon reading from cloud object storage.
   - Subsequent queries scanning overlapping data read from fast local SSDs rather than remote storage, accelerating scans by 5x-10x.
3. **Metadata Cache**:
   - Tracks row counts, min/max values, and distinct counts across micro-partitions. Queries like `SELECT COUNT(*) FROM table` or `SELECT MAX(date) FROM table` return immediately without spinning up worker threads.

### 2. Operational Rules to Maximize Cache Hits:
- **Avoid Non-Deterministic Functions**: Queries containing `CURRENT_TIMESTAMP()`, `SYSDATE()`, `RANDOM()`, or `UUID_STRING()` automatically invalidate the Result Cache. Replace with parameterized date variables passed from the client application.
- **Syntax Normalization**: Formatter consistency matters in some engines; ensure BI tools use consistent casing and whitespace for shared KPI queries.
- **Keep Warehouses Active During Dashboard Surges**: Set `AUTO_SUSPEND = 300` during peak morning executive hours to preserve the local SSD cache across user sessions."""
        },

        "cloud_data-easy-6": {
            "question": "What are the cost implications of scanning a fully unpartitioned table versus a partitioned table?",
            "answer": """The cost implications of table partitioning directly reflect the underlying billing model of the cloud data platform:

### 1. On-Demand Scan Billing (Google BigQuery / AWS Athena):
- **Pricing Model**: Direct billing based on bytes scanned from storage (typically **\$6.25 per TB scanned**).
- **Unpartitioned Table**:
  - A query filtering for a single day (`WHERE transaction_date = '2024-05-01'`) against an unpartitioned 100 TB table forces a **Full Table Scan**.
  - **Cost**: 100 TB scanned $\\times$ \$6.25 = **\$625.00 for a single query**.
- **Partitioned Table (by Date)**:
  - BigQuery metadata prunes non-matching partitions, reading only the target day's partition (e.g., 200 GB).
  - **Cost**: 0.2 TB scanned $\\times$ \$6.25 = **\$1.25** (a 99.8% cost reduction).

### 2. Compute-Time Credit Billing (Snowflake / Databricks SQL):
- **Pricing Model**: Billed per node-second of running compute instances.
- **Unpartitioned Table**:
  - Scanning millions of unpruned micro-partitions forces the warehouse to perform massive remote I/O and disk scans, keeping nodes active for 30 minutes and consuming heavy credits.
- **Partitioned / Clustered Table**:
  - Micro-partition metadata enables **Partition Pruning**, skipping 95%+ of storage blocks. Queries complete in 10 seconds, allowing the warehouse to auto-suspend and slashing credit expenditure.

### 3. Production Warning: Over-Partitioning:
Partitioning by hyper-cardinality keys (e.g., timestamp to the millisecond) creates millions of tiny sub-1MB files, causing metadata catalog bloat and degraded read throughput. Target partition/micro-partition sizes of **100 MB to 1 GB**."""
        },

        "cloud_data-easy-7": {
            "question": "How do you set up a basic connection from a BI tool like Tableau to the cloud data platform?",
            "answer": """Configuring an enterprise-grade connection between a BI tool (e.g., Tableau Desktop/Server/Cloud) and a cloud data platform requires securing authentication, isolating compute, and choosing the appropriate data access mode:

### 1. Architecture & Security Configuration:
- **Authentication**: Avoid hardcoded service account passwords. Use **OAuth 2.0 with Single Sign-On (SSO)** (via Okta or Microsoft Entra ID) or Key-Pair Authentication (RSA 2048-bit private keys).
- **Network Path**: Ensure traffic travels via cloud private connectivity (**AWS PrivateLink** or **Azure Private Endpoint**) or through an IP allowlist configured on the platform's network policy.

### 2. Dedicated BI Compute Provisioning:
Never point Tableau to the primary ETL warehouse. Provision an isolated virtual warehouse:
```sql
CREATE WAREHOUSE TABLEAU_REPORTING_WH WITH
  WAREHOUSE_SIZE = 'SMALL'
  MIN_CLUSTER_COUNT = 1
  MAX_CLUSTER_COUNT = 5      -- Auto-scale for concurrent dashboard viewers
  AUTO_SUSPEND = 120
  AUTO_RESUME = TRUE;
```

### 3. Tableau Connection Setup:
- **Server**: Account Locator URL (e.g., `xy12345.us-east-1.snowflakecomputing.com`).
- **Warehouse**: `TABLEAU_REPORTING_WH`
- **Database / Schema**: `ANALYTICS_GOLD` / `REPORTING`
- **Role**: `FR_BI_CONSUMER` (enforces read-only object security).

### 4. Live Query vs Extract Mode Selection:
- **Live Connection**: Tableau pushes raw SQL directly to the cloud warehouse. Ideal for real-time data, massive row counts, and leveraging warehouse micro-partition pruning.
- **Tableau Extract (.hyper)**: Tableau periodically queries the warehouse, downloads a snapshot into memory, and serves queries locally. Eliminates warehouse credit spend for high-frequency internal dashboards."""
        },

        "cloud_data-easy-8": {
            "question": "Design a strategy for securely sharing a specific dataset with an external vendor?",
            "answer": """Secure data sharing with external third-party vendors must eliminate legacy anti-patterns like SFTP dumps, S3 bucket public policies, or emailed CSVs, which introduce massive security vulnerabilities, data duplication, and egress costs:

### 1. Modern Architecture: Zero-Copy Secure Data Sharing
Leverage native cloud platform data sharing protocols (Snowflake Secure Data Sharing, Databricks Delta Sharing, Google BigQuery Analytics Hub):

### 2. Implementation Workflow (Snowflake Example):
```sql
-- Step 1: Create a Secure View to enforce column filtering and row-level masking
CREATE OR REPLACE SECURE VIEW share_db.vendor_schema.partner_orders_v AS
SELECT 
    order_id,
    order_date,
    product_sku,
    quantity,
    -- Mask sensitive internal financial margins and customer PII
    SHA2(customer_email) AS anonymized_customer_token
FROM prod_db.sales.orders
WHERE partner_id = 'VENDOR_ACME_CORP';

-- Step 2: Create the Share Object and grant permissions
CREATE SHARE vendor_acme_share;
GRANT USAGE ON DATABASE share_db TO SHARE vendor_acme_share;
GRANT USAGE ON SCHEMA share_db.vendor_schema TO SHARE vendor_acme_share;
GRANT SELECT ON VIEW share_db.vendor_schema.partner_orders_v TO SHARE vendor_acme_share;

-- Step 3: Grant access to vendor's cloud account identifier
ALTER SHARE vendor_acme_share ADD ACCOUNTS = 'xy98765.us-east-1';
```

### 3. Open Protocol Option (Delta Sharing):
If the vendor does not use the same platform, deploy **Delta Sharing** (an open REST protocol). The vendor queries the shared Delta Lake tables directly via Python, Power BI, Spark, or Pandas using an expiring OAuth bearer token.

### 4. Security Benefits:
- **Zero Data Movement**: Data is queried in-place from your cloud storage.
- **Immediate Revocation**: Dropping the share immediately revokes vendor access.
- **Auditability**: Complete audit logs track exactly which queries the vendor executes."""
        },

        "cloud_data-easy-9": {
            "question": "How do you clone a production table for testing purposes without incurring double storage costs?",
            "answer": """In modern cloud data platforms, cloning multi-terabyte production tables for testing is achieved using **Zero-Copy Cloning** (Snowflake `CLONE`, Databricks `SHALLOW CLONE`):

### 1. Technical Mechanism:
- Cloud storage organizes data into immutable micro-partitions / Parquet files referenced by an ACID metadata transaction log.
- When an engineer executes a clone statement, the platform does **not** duplicate physical storage blocks. Instead, it copies only the metadata pointers and partition catalog references.
- The cloning operation completes in **seconds** regardless of table size (even for 50 TB tables) and consumes **zero additional physical storage bytes** upon creation.

### 2. Implementation:
```sql
-- Snowflake Zero-Copy Clone
CREATE OR REPLACE TABLE dev_db.testing.orders_test 
CLONE prod_db.sales.orders;

-- Databricks Delta Lake Shallow Clone
CREATE TABLE dev_db.testing.orders_test 
SHALLOW CLONE prod_db.sales.orders;
```

### 3. Copy-on-Write Storage Isolation:
- Clones are fully independent, writable tables.
- When automated integration tests run `UPDATE`, `INSERT`, or `DELETE` statements against `orders_test`, the platform writes new micro-partitions containing exclusively the altered data.
- The production table remains untouched, and your cloud account is billed only for the net storage delta of the newly modified blocks.

### 4. Production Safeguards:
Always drop test clone tables (`DROP TABLE dev_db.testing.orders_test`) after test execution to prevent metadata accumulation and avoid unexpected storage charges once test writes diverge from production."""
        },

        "cloud_data-easy-10": {
            "question": "What system metrics should you track to monitor daily credit or compute usage?",
            "answer": """Effective FinOps governance in cloud data platforms requires continuous telemetry tracking across compute, query performance, storage, and organizational attribution:

### 1. Key Metrics & Telemetry Queries:

1. **Daily Credit Spend by Warehouse & Cost Center**:
   - Track compute consumption per virtual warehouse grouped by department tags:
```sql
-- Snowflake Warehouse Metering Analysis
SELECT 
    warehouse_name,
    DATE(start_time) AS usage_date,
    ROUND(SUM(credits_used), 2) AS total_credits_consumed,
    ROUND(SUM(credits_used) * 3.00, 2) AS estimated_dollar_cost
FROM snowflake.account_usage.warehouse_metering_history
WHERE start_time >= DATEADD(day, -30, CURRENT_DATE())
GROUP BY 1, 2
ORDER BY 2 DESC, 3 DESC;
```

2. **Compute Load & Queue Saturation (`AVG_RUNNING` vs `AVG_QUEUED`)**:
   - `AVG_RUNNING`: Indicates hardware utilization.
   - `AVG_QUEUED_LOAD`: A non-zero queue load indicates that queries are waiting for available compute capacity, signaling that the warehouse needs to scale out (add clusters) or increase size.

3. **Query Cost Outliers & Scan Inefficiencies**:
   - Identify rogue queries scanning massive unpartitioned data:
   - Track `BYTES_SCANNED`, `EXECUTION_TIME`, and `PARTITIONS_SCANNED / PARTITIONS_TOTAL` to catch missing filter predicates.

4. **Storage Churn and Time-Travel Consumption**:
   - Monitor `TABLE_STORAGE_METRICS` tracking `ACTIVE_BYTES`, `TIME_TRAVEL_BYTES`, and `FAILSAFE_BYTES`. Uncompacted streaming tables often accumulate 5x more Time-Travel storage than active data.

### 2. Automated Alerting Thresholds:
Configure cloud webhooks alerting when daily spend exceeds 120% of the rolling 7-day moving average, preempting month-end budget surprises."""
        },

        "cloud_data-medium-11": {
            "question": "Architect a multi-cluster warehouse strategy in Snowflake or Databricks SQL to automatically scale out concurrently for hundreds of reporting users?",
            "answer": """When hundreds of BI users access reporting dashboards simultaneously (e.g., Monday morning executive reviews), query queueing causes severe dashboard latency. Resolving concurrency requires a **Multi-Cluster Horizontal Scale-Out Strategy**:

### 1. Architectural Sizing & Configuration:
Instead of scaling up to an excessively large warehouse (which speeds up individual queries but does not increase concurrent query slots), deploy a multi-cluster pool behind a single endpoint:
```sql
CREATE OR REPLACE WAREHOUSE BI_CONCURRENT_WH WITH
  WAREHOUSE_SIZE = 'MEDIUM'
  MIN_CLUSTER_COUNT = 1
  MAX_CLUSTER_COUNT = 10
  SCALING_POLICY = 'STANDARD'   -- Options: 'STANDARD' vs 'ECONOMY'
  AUTO_SUSPEND = 120
  AUTO_RESUME = TRUE;
```

### 2. Scaling Policy Mechanics:
- **`STANDARD` Policy (Prioritizes SLA / Minimized Latency)**:
  - As soon as a query is queued because existing cluster slots are full, Snowflake spins up an additional cluster immediately.
  - Clusters spin down sequentially after completing running queries and observing 2-3 consecutive minutes of low utilization.
- **`ECONOMY` Policy (Prioritizes Cost / Maximizes Utilization)**:
  - An additional cluster is launched only if the system estimates the incoming query will remain queued for at least 6 minutes.
  - Ideal for non-critical, background scheduled reporting.

### 3. Concurrency Limits & Slot Tuning:
- Each warehouse cluster node provides a default concurrency limit (`MAX_CONCURRENCY_LEVEL = 8`). For lightweight dashboard queries, increase `STATEMENT_CONCURRENCY` to allow up to 16 queries per cluster before triggering horizontal cluster provisioning.

### 4. Trade-offs:
Multi-cluster scaling solves concurrency bottlenecks; it does **not** accelerate a single slow, unindexed, heavy aggregation query. Optimize heavy queries via clustering or scale-up before scaling out."""
        },

        "cloud_data-medium-12": {
            "question": "How do you design a robust cost-control architecture using resource monitors and automated suspension policies to prevent budget overruns?",
            "answer": """A robust cloud FinOps architecture implements automated, multi-tiered defensive circuit breakers that prevent runaway queries, rogue developers, and forgotten clusters from exceeding budgets:

### 1. Hierarchical Resource Monitor Architecture:
Deploy a two-level Resource Monitor hierarchy: **Account-Level** (macro guardrail) and **Warehouse-Level** (micro guardrail):
```sql
-- Account-Level Macro Ceiling (Hard Budget)
CREATE OR REPLACE RESOURCE MONITOR account_monthly_budget WITH
  CREDIT_QUOTA = 10000
  FREQUENCY = MONTHLY
  START_TIMESTAMP = IMMEDIATELY
  TRIGGERS
    ON 75% DO NOTIFY                     -- Alert platform FinOps Slack
    ON 90% DO NOTIFY                     -- Alert engineering leadership
    ON 100% DO SUSPEND                   -- Block new queries; running queries finish
    ON 110% DO SUSPEND_IMMEDIATELY;      -- Abruptly terminate all execution

-- Warehouse-Level Departmental Guardrail
CREATE OR REPLACE RESOURCE MONITOR dev_analytics_budget WITH
  CREDIT_QUOTA = 500
  FREQUENCY = MONTHLY
  TRIGGERS
    ON 80% DO NOTIFY
    ON 100% DO SUSPEND_IMMEDIATELY;

ALTER WAREHOUSE DEV_ADHOC_WH SET RESOURCE_MONITOR = dev_analytics_budget;
```

### 2. Aggressive Automated Suspension Policies:
- **Development / Ad-Hoc Warehouses**: Set `AUTO_SUSPEND = 60` (suspend after 1 minute of idle time).
- **Automated Orchestrated Batch Warehouses**: Set `AUTO_SUSPEND = 0` (immediate suspension via orchestrator hook upon pipeline completion).

### 3. Execution Timeout Circuit Breakers:
Prevent unconstrained cartesian joins from running for days:
```sql
-- Kill queries running over 30 minutes in ad-hoc environments
ALTER WAREHOUSE DEV_ADHOC_WH SET STATEMENT_TIMEOUT_IN_SECONDS = 1800;
-- Kill individual user runaway statements
ALTER USER junior_analyst SET STATEMENT_TIMEOUT_IN_SECONDS = 600;
```"""
        },

        "cloud_data-medium-13": {
            "question": "Design a continuous ingestion pipeline utilizing features like Snowpipe or Databricks Auto Loader for real-time data loading?",
            "answer": """Continuous micro-batch ingestion pipelines load streaming or arriving file data from cloud object storage into Bronze Lakehouse tables with sub-minute latency without managing running compute clusters:

### Architecture 1: Snowflake Snowpipe (Serverless Ingestion)
- **Mechanism**: Cloud object storage (AWS S3) emits an `s3:ObjectCreated:*` event to an AWS SQS queue. Snowpipe listens to SQS and invokes a serverless compute pool to load data via `COPY INTO` without requiring an active virtual warehouse:
```sql
CREATE OR REPLACE PIPE raw_orders_pipe
AUTO_INGEST = TRUE
AWS_SNS_TOPIC = 'arn:aws:sns:us-east-1:123456789012:s3-orders-created'
AS
COPY INTO bronze_orders
FROM @s3_orders_stage
FILE_FORMAT = (TYPE = 'JSON')
MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;
```

### Architecture 2: Databricks Auto Loader (`cloudFiles`)
- **Mechanism**: Leverages Structured Streaming with automatic file notification and schema evolution to ingest files at scale:
```python
from pyspark.sql.functions import col, current_timestamp

raw_stream = spark.readStream.format("cloudFiles") \\
    .option("cloudFiles.format", "json") \\
    .option("cloudFiles.schemaLocation", "s3a://lakehouse-meta/schemas/orders") \\
    .option("cloudFiles.inferColumnTypes", "true") \\
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns") \\
    .load("s3a://company-lake/landing/orders/")

query = raw_stream.withColumn("_ingested_at", current_timestamp()) \\
    .writeStream.format("delta") \\
    .outputMode("append") \\
    .option("checkpointLocation", "s3a://lakehouse-meta/checkpoints/orders") \\
    .trigger(availableNow=True) \\
    .toTable("bronze.orders")
```

### Production Benefits:
- **Rescued Data Column**: Auto Loader stores corrupted or schema-drifted fields in `_rescued_data`, preventing silent data drops.
- **Cost Efficiency**: Serverless event notifications bypass expensive, slow directory polling."""
        },

        "cloud_data-medium-14": {
            "question": "How do you optimize query performance on terabyte-scale tables using clustering keys, partition keys, or automatic clustering services?",
            "answer": """In modern columnar cloud data warehouses, physical data sorting determines micro-partition clustering depth and data skipping efficiency:

### 1. Clustering Mechanics:
- Data is stored in immutable micro-partitions (50 MB - 500 MB). The catalog tracks metadata statistics (minimum and maximum values for each column) per micro-partition.
- When queries filter on an unclustered column, values are scattered across thousands of micro-partitions, forcing a full table scan.
- Selecting a **Clustering Key** groups rows with identical or contiguous key values into the same physical micro-partitions, allowing queries to prune 90%-99% of storage blocks.

### 2. Designing Optimal Clustering Keys:
- **Cardinality Sweet Spot**: Choose columns with **medium-to-high cardinality** frequently used in `WHERE` and `JOIN` clauses (e.g., `tenant_id`, `event_date`, `region`).
- **Order of Columns**: Place the lowest cardinality, most-frequently filtered column first:
```sql
-- Multi-column clustering key
ALTER TABLE analytics.events CLUSTER BY (tenant_id, event_date);
```
- **Anti-Patterns**: Never cluster on hyper-cardinality values (e.g., UUIDs, nano-timestamps) which distribute data too thinly, or boolean columns which offer near-zero pruning benefit.

### 3. Snowflake Automatic Clustering vs Databricks Liquid Clustering:
- **Snowflake Automatic Clustering**: A background serverless service that monitors table cluster depth and automatically reclusters degraded micro-partitions without locking tables:
```sql
ALTER TABLE analytics.events RESUME RECLUSTER;
```
- **Databricks Liquid Clustering (Delta Lake)**:
```sql
CREATE TABLE analytics.events CLUSTER BY (tenant_id, event_date);
```
  Liquid clustering dynamically reorganizes data during write operations, eliminating rigid directory hierarchy issues and manual vacuuming schedules."""
        },

        "cloud_data-medium-15": {
            "question": "Architect a secure architecture combining VPC peering, PrivateLink, and IP allowlisting to isolate the cloud data platform from the public internet?",
            "answer": """A defense-in-depth network isolation architecture guarantees that corporate data warehouses and BI consumers never exchange traffic over the public internet:

### 1. Network Topology Blueprint:
`Corporate Datacenter / Transit Gateway -> Enterprise VPC -> AWS PrivateLink / Azure Private Link -> Cloud Platform VPC (Snowflake / Databricks)`

### 2. PrivateLink Connectivity:
- Provision an **AWS Interface VPC Endpoint** (or Azure Private Endpoint) mapped to the data platform's PrivateLink service identifier.
- Elastic Network Interfaces (ENIs) with private corporate RFC 1918 IP addresses (`10.x.x.x`) are created inside your private subnets.
- Configure private Route 53 DNS Hosted Zones so URLs like `company.privatelink.snowflakecomputing.com` resolve strictly to the internal ENI IPs.

### 3. Platform Network Policies & IP Allowlisting:
- Enforce strict perimeter isolation by applying platform-level network policies that block all public traffic and whitelist only corporate CIDR blocks and PrivateLink identifiers:
```sql
-- Snowflake Network Policy
CREATE OR REPLACE NETWORK POLICY strict_corporate_isolation
  ALLOWED_NETWORK_RULE_LIST = ('corporate_privatelink_rule', 'corp_vpn_nat_rule')
  BLOCKED_IP_LIST = ('0.0.0.0/0');

-- Enforce policy globally at account level
ALTER ACCOUNT SET NETWORK_POLICY = strict_corporate_isolation;
```

### 4. Direct Connect / ExpressRoute Integration:
- On-premises analysts and applications connect over dedicated private fiber (AWS Direct Connect / Azure ExpressRoute) into corporate Transit Gateways, traversing PrivateLink directly to the data warehouse without internet exposure.

### 5. Production Edge Case: External Data Ingestion:
When extracting from third-party SaaS APIs (Salesforce, Stripe), route traffic through private NAT Gateways with static Elastic IPs whitelisted in vendor firewalls."""
        },

        "cloud_data-medium-16": {
            "question": "How do you implement dynamic data masking and column-level encryption for PII compliance?",
            "answer": """Achieving compliance with GDPR, HIPAA, and PCI-DSS requires combining **Dynamic Data Masking (DDM)** for role-based real-time redaction and **Column-Level Encryption** for persistent cryptographic protection:

### 1. Dynamic Data Masking (DDM) Architecture:
Data remains stored in plain text (or encrypted at rest via storage keys). Queries execute against the underlying table, but masking policies dynamically transform column outputs based on the caller's role:
```sql
-- Step 1: Define Role-Based Masking Policy
CREATE OR REPLACE MASKING POLICY email_mask AS (val STRING) RETURNS STRING ->
  CASE
    WHEN CURRENT_ROLE() IN ('COMPLIANCE_OFFICER', 'PII_SECURITY_ADMIN') THEN val
    WHEN CURRENT_ROLE() IN ('CUSTOMER_SUPPORT') THEN 
      REGEXP_REPLACE(val, '(^[^@]{2})(.*)(@[^@]+$)', '\\1****\\3')
    ELSE '***MASKED_PII***'
  END;

-- Step 2: Bind Policy to Target Columns
ALTER TABLE prod_customers MODIFY COLUMN email SET MASKING POLICY email_mask;
```

### 2. Tag-Based Masking (Enterprise Automation):
Instead of binding policies table-by-table, bind the policy to a centralized governance tag:
```sql
CREATE TAG security_level;
ALTER MASKING POLICY email_mask SET TAG security_level = 'PII_CONFIDENTIAL';
-- Any column assigned this tag inherits the masking policy automatically
ALTER TABLE prod_customers MODIFY COLUMN email SET TAG security_level = 'PII_CONFIDENTIAL';
```

### 3. Column-Level Encryption at Rest:
For hyper-sensitive fields (SSNs, credit cards), encrypt values before writing to disk using KMS-managed envelope keys:
```sql
-- Encrypt during ingestion using AES-256
UPDATE customers SET 
  ssn_encrypted = ENCRYPT(raw_ssn, 'kms_managed_passphrase', 'AES-GCM');
```

### 4. Privileged Bypass Protection:
Ensure account admins (`ACCOUNTADMIN`) are restricted from viewing unmasked PII by default to prevent administrative privilege escalation."""
        },

        "cloud_data-medium-17": {
            "question": "Design a unified architecture within Databricks that seamlessly integrates exploratory machine learning notebooks with production dbt data pipelines?",
            "answer": """Integrating production data modeling (dbt) with exploratory machine learning within Databricks requires a Medallion architecture governed by Unity Catalog and decoupled compute runtimes:

### 1. Architectural Topology:
- **Governance Layer**: Centralized **Unity Catalog** managing schemas, access policies, and data lineage across SQL and Python engines.
- **Production Data Pipeline Engine**: **dbt Cloud / dbt Core** executing deterministic transformations (Bronze -> Silver -> Gold) against **Databricks Serverless SQL Warehouses**.
- **Exploratory ML Engine**: **Databricks ML Runtimes** (Jupyter/Python notebooks on GPU/CPU clusters) reading curated Gold features.

### 2. Pipeline & Governance Workflow:
1. **dbt Transformation Layer**:
   - dbt manages the transformation DAG. Models are deployed via Git CI/CD and executed via automated workflows (Airflow or Databricks Workflows).
   - dbt materializes validated, business-grade Gold tables and feature stores:
     `prod_catalog.gold.customer_360`
2. **Unity Catalog Feature Store & ML Access**:
   - Data scientists are granted read-only access to curated Gold tables:
```sql
GRANT SELECT ON SCHEMA prod_catalog.gold TO ROLE data_scientists;
```
   - Feature tables are registered in Unity Catalog:
```python
from databricks.feature_engineering import FeatureEngineeringClient
fe = FeatureEngineeringClient()
fe.create_table(
    name="prod_catalog.ml_features.user_churn_features",
    primary_keys=["user_id"],
    df=gold_user_metrics_df
)
```
3. **MLflow Tracking & Deployment**:
   - Data scientists train models in notebooks using MLflow to log parameters and artifacts.
   - Candidate models are registered in Unity Catalog Model Registry (`prod_catalog.models.churn_predictor`).

### 3. Isolation & Guardrails:
Exploratory notebooks are restricted to a dedicated `sandbox_catalog` and separate compute pools, guaranteeing ad-hoc model training never impacts production ETL SLAs."""
        },

        "cloud_data-medium-18": {
            "question": "How do you handle time-travel and undrop features to recover accidentally deleted tables or schemas within strict SLAs?",
            "answer": """Modern cloud data platforms implement immutable metadata-driven transaction logs that enable instant point-in-time recovery without restoring from physical tape backups:

### 1. Core Mechanics:
- When a table is dropped or modified via DML (`UPDATE`, `DELETE`), underlying micro-partitions / Parquet files are **not physically erased**.
- The system marks them as inactive in metadata and retains them for a configurable **Time-Travel Retention Period** (`DATA_RETENTION_TIME_IN_DAYS` = 1 to 90 days).

### 2. Recovery Procedures (Snowflake / Delta Lake Blueprint):

1. **Restoring Accidentally Dropped Objects (UNDROP)**:
   - Recovers tables, schemas, or entire databases instantly along with their historical metadata and access control grants:
```sql
-- Instant sub-second recovery
UNDROP TABLE analytics.orders;
UNDROP SCHEMA analytics;
```

2. **Recovering from Malicious or Accidental Updates (Time-Travel)**:
   - Query past table state using timestamps or transaction IDs:
```sql
-- Method A: Query state 30 minutes ago
SELECT * FROM analytics.orders AT(OFFSET => -60*30);

-- Method B: Query state immediately prior to a rogue UPDATE query ID
SELECT * FROM analytics.orders BEFORE(STATEMENT => '01a5b8c9-0001-abcd-0000-1234567890ab');

-- Instant Table Restoration
CREATE OR REPLACE TABLE analytics.orders AS
SELECT * FROM analytics.orders BEFORE(STATEMENT => '01a5b8c9-0001-abcd-0000-1234567890ab');
```

3. **Delta Lake Table Restoration**:
```sql
-- Delta Lake native restore
RESTORE TABLE delta.`s3a://lakehouse/orders` TO VERSION AS OF 142;
```

### 3. Fail-Safe Period & Storage Cost Trade-offs:
Once the Time-Travel retention window expires, Snowflake transitions data into a 7-day non-configurable **Fail-Safe** tier (recoverable only by Snowflake Support). Retention increases storage credit costs; configure production Tier-1 tables to 14-30 days and ephemeral staging tables to 0-1 days."""
        },

        "cloud_data-medium-19": {
            "question": "Architect a federated querying setup in BigQuery to analyze data sitting in Google Cloud Storage and Cloud SQL without moving the data?",
            "answer": """Google BigQuery supports zero-ETL in-place analytical querying across disparate storage tiers utilizing **BigLake External Tables** and **Cloud SQL Federated Queries**:

### 1. Architecture Flow:
`BigQuery SQL Engine -> Cloud Resource Connection (IAM) -> [GCS Parquet Data Lake + Cloud SQL PostgreSQL]`

### 2. Querying Google Cloud Storage via BigLake:
- BigLake provides fine-grained access control (row/column-level security) and caching over open formats (Parquet, ORC, CSV) in GCS:
```sql
-- Step 1: Create External Connection
-- Resource: projects/my-proj/locations/us/connections/gcs-lake-conn

-- Step 2: Define BigLake External Table
CREATE OR REPLACE EXTERNAL TABLE analytics.external_events
WITH CONNECTION `us.gcs-lake-conn`
OPTIONS (
  format = 'PARQUET',
  uris = ['gs://my-company-datalake/events/year=2024/*']
);
```

### 3. Querying Cloud SQL via `EXTERNAL_QUERY`:
- Query operational relational databases (Cloud SQL PostgreSQL/MySQL) in-place without data replication pipelines:
```sql
-- Federated Join combining GCS Data Lake and Cloud SQL
SELECT 
    e.event_id,
    e.event_type,
    c.customer_name,
    c.credit_tier
FROM analytics.external_events e
JOIN EXTERNAL_QUERY(
    "projects/my-proj/locations/us/connections/cloudsql-postgres-conn",
    "SELECT customer_id, customer_name, credit_tier FROM customers WHERE is_active = true;"
) c ON e.customer_id = c.customer_id
WHERE e.event_date >= '2024-05-01';
```

### 4. Production Performance & Cost Trade-offs:
- **Benefits**: Zero latency for real-time operational data; zero ETL pipeline maintenance; zero storage duplication.
- **Risks**: `EXTERNAL_QUERY` executes pushdown SQL directly on the operational Cloud SQL instance; large unconstrained queries can saturate Cloud SQL CPU and disrupt production application transactions. Mitigate by reading from Cloud SQL read-replicas."""
        },

        "cloud_data-medium-20": {
            "question": "How do you structure a massive multi-tenant account strategy using multiple databases, schemas, and resource pools for different internal departments?",
            "answer": """Structuring an enterprise cloud data platform across multiple internal business departments (Finance, Marketing, Logistics, Core Engineering) requires strict domain boundary segregation, resource isolation, and centralized governance:

### 1. Database & Catalog Hierarchy (Domain Ownership):
Implement a Hub-and-Spoke catalog layout aligned with Data Mesh principles:
- **`ENTERPRISE_SHARED_DB`**: Central master repository holding corporate master data (calendars, currency rates, product hierarchies). Managed by Enterprise Data Governance.
- **Departmental Databases**: `FINANCE_DB`, `MARKETING_DB`, `SUPPLY_CHAIN_DB`.
  - Standardized schema tiers within each database:
    - `BRONZE`: Raw source system ingestion.
    - `SILVER`: Cleansed, conformed enterprise models.
    - `GOLD`: Business-specific data marts, KPI aggregates, and reporting views.

### 2. Virtual Warehouse / Compute Isolation:
Assign dedicated compute resource pools to eliminate cross-tenant resource contention:
- `WH_FINANCE_PROD` (Size M, dedicated to finance month-end pipelines).
- `WH_MARKETING_BI` (Multi-cluster, Size S, scaling 1-6 for marketing dashboard users).
- `WH_DATA_ENGINEERING` (Size XL, dedicated to nightly enterprise dbt/Airflow batches).
- **Benefit**: A runaway, poorly tuned marketing query cannot consume memory or credits allocated to financial reporting.

### 3. Centralized Cost Accounting & Chargeback:
Tag all compute warehouses and database objects with departmental cost centers:
```sql
ALTER WAREHOUSE WH_FINANCE_PROD SET TAG cost_center = 'FIN-4010', environment = 'PROD';
ALTER WAREHOUSE WH_MARKETING_BI SET TAG cost_center = 'MKT-8020', environment = 'PROD';
```
Automate monthly FinOps billing attribution reports querying system usage views, charging cloud costs directly back to departmental P&Ls."""
        },

        "cloud_data-hard-21": {
            "question": "Architect a multi-cloud data platform deployment spanning AWS and Azure, ensuring unified governance, seamless data sharing, and cross-cloud failover?",
            "answer": """Designing an enterprise multi-cloud data platform across AWS and Azure eliminates vendor lock-in, satisfies geopolitical data residency requirements, and delivers extreme disaster resilience:

### 1. Cross-Cloud Storage & Table Format Fabric:
- Deploy data storage on AWS S3 (`us-east-1`) and Azure ADLS Gen2 (`eastus2`) utilizing **Apache Iceberg** or **Delta Lake** as the universal open table format.
- Execute automated, scheduled cross-cloud replication using tools like **Snowflake Cross-Cloud Database Replication** or storage-level sync:
```sql
-- Snowflake Cross-Cloud Replication Configuration
ALTER DATABASE prod_enterprise_db ENABLE REPLICATION TO ACCOUNTS azure_eastus2.enterprise_account;

-- Secondary Account (Azure): Refresh replica from AWS Primary
ALTER DATABASE prod_enterprise_db REFRESH;
```

### 2. Unified Multi-Cloud Metadata & Governance:
- Deploy a cloud-agnostic catalog and governance plane: **Databricks Unity Catalog** (multi-cloud native) or **Apache Polaris** (Iceberg catalog).
- Define RBAC policies, row-level filters, and dynamic PII masking rules once in the centralized catalog; policies are enforced identically across compute runtimes in both AWS and Azure.
- Synchronize identities via a central Okta / Microsoft Entra ID tenant using SCIM.

### 3. Global Routing & Automated Failover (RTO < 5 min):
- Deploy **Route 53 / Azure Traffic Manager** with automated health checks monitoring platform endpoint responsiveness.
- In the event of a total AWS regional outage:
  1. Secondary database on Azure is promoted to primary: `ALTER DATABASE prod_enterprise_db PRIMARY;`
  2. DNS endpoints dynamically redirect JDBC/ODBC client traffic to the Azure data warehouse endpoint.

### 4. Egress Cost Mitigation:
Replicate only curated Gold business aggregations across clouds; keep raw Bronze and intermediate Silver data localized to prevent crippling cloud egress charges."""
        },

        "cloud_data-hard-22": {
            "question": "How do you engineer a complex workload isolation strategy for thousands of concurrent users, guaranteeing strict SLA compliance for dashboards while background jobs run?",
            "answer": """Guaranteeing strict sub-second SLAs for thousands of concurrent dashboard users while heavy batch pipelines, ad-hoc queries, and streaming jobs execute simultaneously requires a comprehensive, multi-layered isolation architecture:

### 1. Physical Compute Pool Decoupling:
Completely eliminate resource sharing across workload tiers:
- **Tier 1 (Executive C-Suite Dashboards)**: Dedicated multi-cluster warehouse (`WH_EXEC_BI`, Size M, Min 2, Max 10 clusters). Autoscaling policy = `STANDARD`. Auto-suspend set to 300s during business hours to keep local SSD caches warm.
- **Tier 2 (General BI / Power Users)**: Dedicated multi-cluster warehouse (`WH_GENERAL_BI`, Size S, Min 1, Max 8 clusters). Autoscaling policy = `ECONOMY`.
- **Tier 3 (Batch ETL / dbt Pipelines)**: Single-cluster warehouse (`WH_BATCH_ETL`, Size XL), scheduled strictly off-peak.
- **Tier 4 (Ad-Hoc Data Science)**: Ephemeral warehouse (`WH_ADHOC_DEV`, Size M) with strict query timeouts (300s).

### 2. Connection-Level Parameter Injection & Dynamic Routing:
Configure client connection proxies and BI service accounts to inject metadata tags:
```sql
ALTER SESSION SET QUERY_TAG = '{"workload": "executive_dashboard", "sla": "p99_sub_2s"}';
```
Platform query routers inspect the session tag and dynamically route requests to the appropriate dedicated compute cluster.

### 3. Result Cache Pre-Warming:
Deploy an automated morning warm-up routine: a headless Airflow task fires the top 50 executive dashboard queries at 7:30 AM. Query results are written into the 24-hour **Result Cache**, ensuring that when 2,000 managers open their dashboards at 8:00 AM, queries return instantly from memory in <150ms at zero compute credit cost."""
        },

        "cloud_data-hard-23": {
            "question": "Design a real-time, extreme-concurrency serving layer utilizing Snowflake's Hybrid Tables (Unistore) or BigQuery continuous queries for transactional workloads?",
            "answer": """Traditional cloud data warehouses are optimized exclusively for OLAP (columnar scans across millions of rows) and fail catastrophically on high-concurrency, low-latency OLTP workloads (point lookups and single-row updates). Implementing an integrated HTAP (Hybrid Transactional/Analytical Processing) architecture bridges this gap:

### 1. Snowflake Hybrid Tables (Unistore Architecture):
- **Mechanism**: Hybrid Tables introduce a row-oriented storage engine alongside traditional columnar micro-partitions.
- Features primary key constraints, foreign keys, unique indexes, and secondary row indexes with row-level locking.
- Enables point lookups (`SELECT * FROM orders WHERE order_id = 9481023`) to complete in **single-digit milliseconds** supporting tens of thousands of concurrent QPS.

### 2. DDL & Real-Time Ingestion Blueprint:
```sql
CREATE OR REPLACE HYBRID TABLE operational.active_user_sessions (
    session_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    session_start_time TIMESTAMP_NTZ NOT NULL,
    current_state VARCHAR(32),
    cart_total NUMBER(12, 2),
    INDEX idx_user_id (user_id)
);
```

### 3. Unified Real-Time Analytical Join:
Changes written to the Hybrid Table row store are asynchronously mirrored to columnar format in near real-time, allowing analytical OLAP queries to join live operational state directly with petabyte-scale historical dimensions without batch ETL pipelines:
```sql
-- Zero-ETL join of live operational data with historical analytics
SELECT 
    s.current_state,
    h.lifetime_value_tier,
    COUNT(s.session_id) AS active_session_count
FROM operational.active_user_sessions s
JOIN analytics_gold.dim_customer_history h ON s.user_id = h.user_id
GROUP BY 1, 2;
```

### 4. BigQuery Continuous Queries Alternative:
In GCP, execute persistent SQL queries against Pub/Sub streaming topics, outputting materialized results directly into **Google Cloud Bigtable** for sub-10ms operational serving at extreme concurrency."""
        },

        "cloud_data-hard-24": {
            "question": "Architect a zero-downtime, automated data platform migration strategy transitioning from a legacy on-premise Teradata appliance to a modern cloud data platform?",
            "answer": """Migrating a multi-petabyte, mission-critical Teradata appliance to a modern cloud platform (Snowflake / Databricks) requires an automated **Strangler Fig Migration Pattern** with dual-run reconciliation:

### 1. Migration Lifecycle Phases:
`Code Conversion -> Historical Bulk Data Seeding -> Continuous CDC Replication -> Dual-Run Verification -> Consumer Cutover`

### 2. Automated Schema & SQL Conversion:
- Utilize automated code transpilers (e.g., Snowflake SnowConvert or Databricks Assistant) to translate Teradata BTEQ scripts, stored procedures, macros, and proprietary SQL:
  - Convert Teradata `QUALIFY`, `CSUM`, and date math into ANSI-standard window functions.
  - Re-engineer Teradata Primary Indexes (UPI/NUPI) into cloud clustering keys or liquid clustering.

### 3. Historical Data Seeding:
- Extract historical tables into compressed Parquet using **Teradata Parallel Transporter (TPT)**.
- Transfer data to cloud object storage via high-speed dedicated lines (AWS Direct Connect / Azure ExpressRoute) or physical transfer appliances (AWS Snowball / Azure Data Box).

### 4. Continuous Change Data Capture (CDC):
- Deploy an enterprise CDC engine (Qlik Replicate, Debezium, or Oracle GoldenGate) tapping the Teradata transaction logs.
- Stream incremental mutations (inserts, updates, deletes) into Cloud Bronze staging tables, keeping cloud data in continuous sync with on-premise transactional activity.

### 5. Automated Dual-Run Reconciliation:
- Execute dual ingestion pipelines daily. Deploy automated data reconciliation engines (e.g., Great Expectations, Datagaps ETL Validator) comparing row counts, column checksums, and business KPI metrics across both systems.
- Cut over downstream BI dashboards and downstream feeds consumer by consumer. Once zero discrepancies exist for 30 consecutive days, decommission the Teradata appliance."""
        },

        "cloud_data-hard-25": {
            "question": "How do you build a custom, programmatic provisioning pipeline using Terraform to dynamically spin up configured Databricks workspaces for client onboarding?",
            "answer": """Automating multi-tenant Databricks workspace onboarding requires a modular Infrastructure as Code (IaC) pipeline using the **Databricks Terraform Provider** and cloud infrastructure providers (AWS/Azure):

### 1. Two-Tiered Terraform Provider Architecture:
- **Account-Level Provider**: Provisions the workspace resource, IAM cross-account roles, and network bindings.
- **Workspace-Level Provider**: Connects to the newly created workspace URL to configure internal objects (catalogs, warehouses, SCIM groups, permissions).

### 2. Terraform Implementation Blueprint:
```hcl
# main.tf - AWS Databricks Workspace Module

# Step 1: Databricks MWS Workspace Creation (Account Provider)
resource "databricks_mws_workspaces" "client_workspace" {
  account_id     = var.databricks_account_id
  aws_region     = var.aws_region
  workspace_name = "client-${var.client_id}-workspace"
  
  credentials_id           = databricks_mws_credentials.cross_account.credentials_id
  storage_configuration_id = databricks_mws_storage_configurations.root_bucket.storage_configuration_id
  network_id               = databricks_mws_networks.client_vpc.network_id
}

# Step 2: Initialize Workspace Provider targeting new endpoint
provider "databricks" {
  alias = "workspace"
  host  = databricks_mws_workspaces.client_workspace.workspace_url
  token = var.admin_pat_token
}

# Step 3: Configure Unity Catalog Metastore Binding
resource "databricks_metastore_assignment" "metastore_binding" {
  provider     = databricks.workspace
  workspace_id = databricks_mws_workspaces.client_workspace.workspace_id
  metastore_id = var.central_metastore_id
}

# Step 4: Provision Client Serverless SQL Warehouse
resource "databricks_sql_endpoint" "client_sql_warehouse" {
  provider     = databricks.workspace
  name         = "client-${var.client_id}-wh"
  cluster_size = "Small"
  auto_stop_mins = 20
  enable_serverless_compute = true
  
  tags {
    custom_tags {
      key   = "ClientId"
      value = var.client_id
    }
  }
}
```

### 3. CI/CD Orchestration:
Wrap this module in a Terraform Cloud or GitHub Actions pipeline triggered by client onboarding API events, provisioning completely isolated, governed workspaces in under 8 minutes."""
        },

        "cloud_data-hard-26": {
            "question": "Design an advanced data clean room architecture to facilitate secure, privacy-compliant data joins between two competitive organizations without exposing the raw data?",
            "answer": """A Data Clean Room enables two or more commercial entities (e.g., a Retailer and a Consumer Brand, or an Ad Network and an Airline) to perform collaborative analytical joins against combined datasets without exposing underlying PII, raw records, or proprietary trade secrets:

### 1. Zero-Copy Clean Room Topology:
- **Storage Independence**: Organization A (Retailer) and Organization B (Media Publisher) host their sensitive customer data in their respective cloud accounts (Snowflake Clean Room / Databricks Clean Room / AWS Clean Rooms).
- Data is linked via **Secure Data Shares** into a joint Clean Room account; raw records never leave the source accounts.

### 2. Cryptographic Entity Matching & Salted Hashing:
- Direct PII identifiers (emails, phone numbers) are normalized and pseudonymized using deterministic cryptographic hashing with a shared, rotating secret salt:
  `SHA256(CONCAT(LOWER(TRIM(email)), secret_salt))`
- Advanced implementations utilize homomorphic encryption or privacy-preserving record linkage (PPRL) to match records without revealing keys.

### 3. Differential Privacy & Query Template Governance:
- Analysts are prohibited from executing arbitrary SQL. Queries are restricted to **pre-approved parameterized templates** (e.g., Audience Overlap, Attribution Analysis):
```sql
-- Clean Room Secure View with Aggregate Threshold Enforcement
SELECT 
    b.campaign_id,
    COUNT(DISTINCT a.customer_token) AS overlapping_customers,
    SUM(a.total_spend) AS attributed_sales
FROM retailer_db.secure_share.customer_sales a
JOIN publisher_db.secure_share.ad_impressions b 
  ON a.customer_token = b.customer_token
GROUP BY 1
HAVING COUNT(DISTINCT a.customer_token) >= 100; -- Min Aggregation Threshold
```

### 4. Output Protection:
Enforce **Differential Privacy noise injection** and strict threshold checks (`MIN_GROUP_COUNT = 100`). Queries attempting to isolate individual rows or differencing attacks are blocked, and all audit logs are cryptographically verified by both legal teams."""
        },

        "cloud_data-hard-27": {
            "question": "Architect a robust, globally distributed disaster recovery plan for a mission-critical cloud data platform ensuring a Recovery Time Objective (RTO) of under 5 minutes?",
            "answer": """Designing a mission-critical cloud data platform capable of surviving a catastrophic multi-datacenter cloud provider regional outage with an RTO < 5 minutes and RPO < 1 minute requires an **Active-Hot / Active-Warm Multi-Region Architecture**:

### 1. Multi-Region Replication Architecture:
- **Primary Region**: AWS `us-east-1` (Active Production)
- **Secondary Region**: AWS `us-west-2` (Hot Standby)
- Deploy continuous database replication (Snowflake Cross-Region Database Replication or Delta Lake cross-region bidirectional mirroring):
```sql
-- Primary Region: Enable automatic scheduled continuous replication
ALTER DATABASE enterprise_data_platform 
ENABLE REPLICATION TO ACCOUNTS aws_uswest2.corp_account;

-- Replication schedule executing every 60 seconds (ensures RPO < 60 seconds)
ALTER DATABASE enterprise_data_platform REFRESH EVERY 1 MINUTE;
```
- Replicates schemas, tables, views, users, roles, network policies, and masking policies automatically.

### 2. Automated Failover Orchestration (RTO < 5 Minutes):
- **Health Monitoring**: Deploy AWS Route 53 Application Recovery Controller (ARC) continuously probing health endpoints across API, compute, and ingestion layers.
- **Failover Runbook Automation**: If health probes fail for 3 consecutive minutes:
  1. **Promote Secondary Database**: ARC triggers automated Lambda / Cloud Function executing:
```sql
ALTER DATABASE enterprise_data_platform PRIMARY;
```
  2. **DNS Routing Shift**: Route 53 shifts global DNS routing policies, repointing client connection URLs to the `us-west-2` regional endpoint.
  3. **Compute Pre-Warming**: Pre-provisioned standby virtual warehouses in `us-west-2` automatically spin up to handle incoming queries.

### 3. Failback Strategy:
Once the primary region recovers, re-establish replication in the reverse direction (`us-west-2` -> `us-east-1`), synchronize delta transactions, and gracefully shift DNS routing back during an off-peak maintenance window."""
        },

        "cloud_data-hard-28": {
            "question": "How do you engineer a highly complex custom User-Defined Table Function (UDTF) in Java or Python natively within the platform to perform cryptographic hashing on billions of rows?",
            "answer": """Performing high-throughput cryptographic operations on billions of rows within a cloud data warehouse requires a **Vectorized User-Defined Table Function (UDTF)** running natively inside the platform's distributed worker sandboxes:

### 1. Vectorized Processing Architecture:
- Standard scalar UDFs process rows individually in interpreted Python, causing severe context-switching overhead.
- Vectorized UDTFs (Snowpark Python / Databricks UDTFs) process batches of rows passed directly as **Apache Arrow RecordBatches** or **Pandas DataFrames**, executing on pre-allocated C-memory buffers.

### 2. Snowflake Vectorized Python UDTF Implementation:
```python
import hashlib
import pandas as pd

class VectorizedCryptoHasher:
    def __init__(self):
        # Initialize cryptographic engine and state ONCE per worker process
        self.salt = b"EnterpriseHmacSecretSalt2024"
        
    def end_partition(self):
        pass

    # Vectorized batch processing hook
    def process(self, df: pd.DataFrame):
        # Direct vectorized apply using compiled C-extension hashlib
        def hash_value(val):
            if val is None or pd.isna(val):
                return None
            return hashlib.blake2b(
                val.encode("utf-8"), 
                key=self.salt, 
                digest_size=32
            ).hexdigest()

        hashed_results = df[0].apply(hash_value)
        return pd.DataFrame({"hashed_token": hashed_results})
```

### 3. SQL Registration & Execution:
```sql
CREATE OR REPLACE FUNCTION operational.vectorized_hash(input_str VARCHAR)
RETURNS TABLE (hashed_token VARCHAR)
LANGUAGE PYTHON
RUNTIME_VERSION = '3.10'
PACKAGES = ('pandas')
HANDLER = 'VectorizedCryptoHasher';

-- Parallel execution across billions of rows in micro-partitions
SELECT t.customer_id, h.hashed_token
FROM raw_customers t,
TABLE(operational.vectorized_hash(t.email)) h;
```

### 4. Performance Safeguards:
- Cryptographic objects are initialized in `__init__`, avoiding per-row instantiation overhead.
- Execution scales linearly across all worker nodes and CPU cores with zero data egress."""
        },

        "cloud_data-hard-29": {
            "question": "Design an AI-driven, automated optimization engine that dynamically analyzes platform query logs and autonomously adjusts clustering keys and warehouse sizes?",
            "answer": """Static warehouse sizing and manual clustering tuning inevitably lead to either excessive cloud spend or degraded query performance. An autonomous AI-driven FinOps engine provides closed-loop optimization:

### 1. System Architecture:
`Platform Telemetry (Query History / Metrics) -> Feature Store -> Machine Learning Surrogate Model -> Autonomous DDL/API Actuator`

### 2. Telemetry Ingestion & Feature Engineering:
- Ingest platform system tables (`QUERY_HISTORY`, `WAREHOUSE_LOAD_HISTORY`, `TABLE_STORAGE_METRICS`) continuously.
- **Clustering Features**:
  - Filter Predicate Frequency (`WHERE`, `JOIN` column occurrences).
  - Data Skipping Pruning Efficiency: `PARTITIONS_SCANNED / TOTAL_PARTITIONS`. Tables scanning >50% of partitions on repeated filter queries are flagged as unclustered.
- **Warehouse Sizing Features**:
  - Memory Spill Metrics: `BYTES_SPILLED_TO_LOCAL_STORAGE` and `BYTES_SPILLED_TO_REMOTE_STORAGE`. Non-zero remote spills indicate warehouse under-sizing.
  - Compute Load: Sustained `AVG_RUNNING < 0.15` indicates over-provisioned warehouse capacity.

### 3. Machine Learning Optimization Models:
- **Clustering Key Optimizer**: Employs frequent-itemset mining (FP-Growth) to identify optimal multi-column clustering combinations that maximize overall pruning ratios across 90% of user queries.
- **Sizing Cost/Performance Surrogate Model**: Trains a Gradient Boosted Decision Tree (LightGBM) predicting query runtime and dollar cost under candidate warehouse sizes ($X$-Small to $4X$-Large).

### 4. Closed-Loop Actuator & Safety Guardrails:
```python
# Automated Actuator Script executed via Airflow / Lambda
if predicted_spill_reduction > 0.80 and cost_delta < budget_threshold:
    snowflake_conn.execute(f"ALTER TABLE {table_name} CLUSTER BY ({recommended_keys})")
    
if remote_spill_detected and pipeline_sla_critical:
    snowflake_conn.execute(f"ALTER WAREHOUSE {wh_name} SET WAREHOUSE_SIZE = '{next_size}'")
```
- **Guardrails**: Limit automated changes to a maximum 10% daily budget variance; require Slack human-in-the-loop approval for Tier-1 mission-critical production tables."""
        },

        "cloud_data-hard-30": {
            "question": "How would you design a highly secure execution environment within the data platform to run untrusted, third-party code natively against sensitive data utilizing Snowpark or Container Services?",
            "answer": """Running untrusted third-party code (e.g., proprietary vendor scoring models, external machine learning libraries, unverified Python algorithms) directly against enterprise data requires a **Zero-Trust Sandboxed Execution Architecture** utilizing **Snowpark Container Services (SPCS)**:

### 1. Sandboxed Container Architecture:
- Untrusted code is packaged into standard OCI-compliant Docker containers and deployed inside managed, isolated compute pools directly within the data platform perimeter.
- Containers run with **non-root user namespaces**, strict Linux `cgroups` (CPU/RAM caps), and restrictive `seccomp` system call filters to block unauthorized OS-level operations.

### 2. Egress Traffic Lockdown (Anti-Exfiltration):
- Block all outbound internet access to prevent untrusted code from exfiltrating sensitive customer data or encryption keys to external command-and-control servers:
```sql
-- Network Rule blocking all external internet access
CREATE OR REPLACE NETWORK RULE isolated_no_egress_rule
  MODE = EGRESS
  TYPE = HOST_PORT
  VALUE_LIST = (); -- Empty whitelist blocks all outbound connections

CREATE OR REPLACE EXTERNAL ACCESS INTEGRATION secure_sandbox_integration
  ALLOWED_NETWORK_RULES = (isolated_no_egress_rule)
  ENABLED = TRUE;
```

### 3. In-Place Zero-Copy Data Binding:
- The container accesses data exclusively through scoped, read-only secure views mounted directly into the container filesystem or queried via local Snowpark sessions:
```sql
CREATE SERVICE vendor_model_service
  IN COMPUTE POOL isolated_gpu_pool
  FROM @image_stage
  SPEC = 'vendor_spec.yaml'
  EXTERNAL_ACCESS_INTEGRATIONS = (secure_sandbox_integration);
```

### 4. Output Quarantine & Data Leakage Scanning:
- Container outputs write strictly to an isolated quarantine schema (`staging.vendor_quarantine_results`).
- Automated data loss prevention (DLP) scanners inspect output payloads for leaked PII tokens, social security numbers, or raw credentials before data is promoted into production consumption tables."""
        }
    }
