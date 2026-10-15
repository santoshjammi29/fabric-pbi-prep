# scripts/curriculum_databricks.py
"""
Curriculum items 1-20:
Databricks Platform & Functionality:
- Unity Catalog (3-level namespace, metastores, managed vs external tables/volumes, credentials, row/col filters)
- Databricks Secrets & Scopes
- Delta Lake Internals (Delta Log, ACID/OCC, Time Travel, VACUUM, OPTIMIZE, CDF, Schema Evolution, MERGE, Clones)
- Delta Live Tables (DLT declarative pipelines, expectations, streaming vs materialized views, apply_changes)
- Orchestration & DevOps (Multi-task Jobs, DABs, Terraform Databricks provider, FinOps & DBU optimization)
"""

DATABRICKS_ITEMS = [
    # ── Item 1: Unity Catalog 3-Level Namespace & Metastore Hierarchy ──
    {
        "de_id": "de-new-arch-databricks-deep-007",
        "arch_id": "arch-databricks-deep-007",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Unity Catalog Architecture & 3-Level Namespace",
        "difficulty": "ARCHITECT",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "How does Unity Catalog's 3-level namespace (catalog.schema.table_or_volume) work, how do metastores bind across workspaces, and how do you design environment isolation (dev/stage/prod) and data virtualization?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Unity Catalog (UC) centralizes data and AI governance across multiple Databricks workspaces by replacing legacy workspace-scoped Hive metastores with an account-level **Unity Catalog Metastore**. 

1. **Hierarchy & 3-Level Namespace**:
   - `Metastore`: Account-level top-tier container physically bound to a specific cloud region and backed by a root cloud storage bucket (ADLS Gen2 / AWS S3 / GCS).
   - `Catalog`: First level of the namespace (`catalog.*.*`). Represents a logical data boundary (e.g., environment `prod_lakehouse` or business domain `finance`).
   - `Schema` (Database): Second level (`catalog.schema.*`). Contains logical groupings of assets.
   - `Table / View / Volume / Model`: Third level (`catalog.schema.object`). Represents physical relational tables, virtualized views, unstructured file volumes, or MLflow models.

2. **Cross-Workspace Binding**:
   - A single Metastore can be assigned to multiple Databricks workspaces within the same cloud region.
   - Workspace binding enables multi-workspace data sharing without data duplication: users in Workspace A (Analytics) and Workspace B (Data Science) query `prod_lakehouse.gold.customer_360` with identical permissions, audit logs, and lineage tracking.
   - Catalog-level workspace isolation: Enterprise architects bind catalogs to specific workspaces (`USE CATALOG dev_lakehouse` restricted to Dev Workspaces) to enforce strict environment separation.

### Phase 2: Implementation & Code Artifacts
Below is the architectural DDL to establish account-level environment catalogs, workspace bindings, and virtualized views.

```sql
-- 1. Create top-level environment catalogs with dedicated external cloud storage
CREATE CATALOG IF NOT EXISTS prod_lakehouse
  MANAGED LOCATION 'abfss://prod-managed@datalakeprod.dfs.core.windows.net/managed'
  COMMENT 'Production enterprise lakehouse root catalog';

CREATE CATALOG IF NOT EXISTS dev_lakehouse
  MANAGED LOCATION 'abfss://dev-managed@datalakedev.dfs.core.windows.net/managed'
  COMMENT 'Development sandbox catalog';

-- 2. Bind catalogs to specific workspaces (Workspace Isolation)
-- Dev catalog accessible only by Dev Workspace (ID: 1111222233334444)
ALTER CATALOG dev_lakehouse ISOLATION MODE ISOLATED;
ALTER CATALOG dev_lakehouse ADD WORKSPACE 1111222233334444;

-- Prod catalog accessible by BI, Data Science, and Production Orchestration workspaces
ALTER CATALOG prod_lakehouse ISOLATION MODE RESTRICTED;
ALTER CATALOG prod_lakehouse ADD WORKSPACE 5555666677778888; -- Analytics WS
ALTER CATALOG prod_lakehouse ADD WORKSPACE 9999000011112222; -- Prod Jobs WS

-- 3. Construct 3-level schema and tables
CREATE SCHEMA IF NOT EXISTS prod_lakehouse.customer_domain
  COMMENT 'Customer 360 domain gold entities';

CREATE TABLE IF NOT EXISTS prod_lakehouse.customer_domain.dim_customer (
  customer_id STRING NOT NULL,
  email STRING NOT NULL,
  country_code STRING,
  lifetime_value DECIMAL(18, 2),
  updated_at TIMESTAMP
)
USING DELTA
TBLPROPERTIES (
  'delta.enableChangeDataFeed' = 'true',
  'delta.minReaderVersion' = '2',
  'delta.minWriterVersion' = '5'
);

-- 4. Cross-catalog virtualization: Dev querying sanitized Prod view without physical replication
CREATE OR REPLACE VIEW dev_lakehouse.customer_domain.vw_sanitized_customer AS
SELECT 
  customer_id,
  sha2(email, 256) AS masked_email,
  country_code,
  updated_at
FROM prod_lakehouse.customer_domain.dim_customer;
```

### Phase 3: Production Gotchas & Failure Modes
- **Metastore-per-Region Constraint**: You can only link one Unity Catalog Metastore per cloud region per Databricks account. Creating separate metastores for Dev, Stage, and Prod in the same region breaks unified lineage, cross-catalog queries, and centralized access auditing. Use catalogs (not metastores) for environment boundaries.
- **Legacy Workspace Metastore Conflict**: Mixing legacy `hive_metastore` tables with Unity Catalog tables in the same SparkSession causes join failures and silent fallbacks. Never join `hive_metastore.default.table` directly with `prod_lakehouse.schema.table` in production; migrate legacy tables using `SYNC METASTORE` or shallow clones.
- **Storage Credential Permissions**: If the IAM role / Service Principal attached to the Metastore lacks `Storage Blob Data Owner` or KMS Decrypt grants on the underlying root bucket, catalog creation succeeds in the UI but all table creation queries throw `AccessDeniedException: 403 Forbidden` at runtime.
"""
    },

    # ── Item 2: Unity Catalog Managed vs External Tables & Volumes ──
    {
        "de_id": "de-new-arch-databricks-deep-008",
        "arch_id": "arch-databricks-deep-008",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Unity Catalog Storage Primitives & Volumes",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "What are the fundamental storage lifecycle, access control, and metadata differences between Managed Tables, External Tables, Managed Volumes, and External Volumes in Unity Catalog?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Unity Catalog governs both structured tabular data and unstructured/semi-structured files through four distinct storage primitives:

1. **Managed Tables**:
   - *Storage Location*: Fully governed by Unity Catalog inside the root managed path defined on the Schema, Catalog, or Metastore.
   - *Lifecycle Guarantee*: Unity Catalog manages both metadata AND physical storage. Executing `DROP TABLE` immediately purges metadata and schedules physical cloud Parquet/Delta files for permanent deletion after the retention window (default 30 days).
   - *Engine Compatibility*: Only engines integrated with Unity Catalog or Delta Sharing can read these files directly. Direct cloud storage path reads bypassing UC are prohibited.

2. **External Tables**:
   - *Storage Location*: Explicitly located in an arbitrary cloud storage path registered under a UC `EXTERNAL LOCATION`.
   - *Lifecycle Guarantee*: Unity Catalog governs ONLY metadata. Executing `DROP TABLE` removes metadata from the catalog, but leaves all underlying Parquet/Delta files completely intact on cloud storage.
   - *Engine Compatibility*: Enables multi-engine interoperability (e.g., Snowflake or AWS Athena reading Delta files in-place).

3. **Managed vs External Volumes**:
   - *Volumes* provide governance for non-tabular data (PDFs, images, CSV raw drops, audio, ML checkpoints).
   - *Managed Volume*: Storage managed inside the catalog/schema root. Dropping volume deletes underlying files. Path: `/Volumes/catalog/schema/volume_name/`.
   - *External Volume*: Points to an existing cloud directory. Dropping volume retains external files.

### Phase 2: Implementation & Code Artifacts
The following scripts demonstrate creating managed vs external tables, registering volumes, and accessing files using Python/SQL.

```sql
-- 1. Create Managed Table (No LOCATION keyword)
CREATE TABLE prod_lakehouse.finance.managed_transactions (
  txn_id STRING,
  amount DOUBLE,
  txn_time TIMESTAMP
) USING DELTA;

-- 2. Create External Table (Requires pre-existing EXTERNAL LOCATION)
CREATE TABLE prod_lakehouse.finance.external_audit_logs (
  log_id STRING,
  event_name STRING,
  payload STRING
) USING DELTA
LOCATION 'abfss://audit-container@datalake.dfs.core.windows.net/logs/audit_events';

-- 3. Create Managed Volume for Raw Document Ingestion
CREATE VOLUME prod_lakehouse.finance.raw_pdf_invoices
  COMMENT 'Managed volume storing incoming vendor invoice PDFs';

-- 4. Create External Volume for Vendor S3 Drop
CREATE EXTERNAL VOLUME prod_lakehouse.finance.vendor_s3_incoming
  LOCATION 's3://vendor-invoices-enterprise-bucket/drop/'
  COMMENT 'External volume pointing to vendor partner S3 drop';
```

```python
# Accessing Volume files natively via POSIX file API in PySpark / Python
import os

volume_path = "/Volumes/prod_lakehouse/finance/raw_pdf_invoices"
file_target = os.path.join(volume_path, "invoice_2026_10.pdf")

# Direct standard Python open() works with Unity Catalog Managed Volumes!
with open(file_target, "rb") as f:
    pdf_bytes = f.read()

# Spark native read from Volume
df_volume_csv = spark.read.format("csv") \\
    .option("header", "true") \\
    .load("/Volumes/prod_lakehouse/finance/vendor_s3_incoming/*.csv")
```

### Phase 3: Production Gotchas & Failure Modes
- **Accidental Drop of Managed Tables**: Executing `DROP TABLE` on a managed table deletes the underlying Delta files after the vacuum retention window. If an analyst drops a managed table by mistake, immediate recovery is only possible if Delta time-travel / undrop features are executed before garbage collection. For enterprise gold tables, always use table permissions (`REVOKE DROP`) or use external tables where file retention is managed by cloud IAM/backup policies.
- **External Table Orphaned Files**: When streaming data or batch jobs write to an external table location and the table is dropped, files continue accumulating on ADLS/S3 indefinitely, silently inflating cloud storage bills without being visible in `SHOW TABLES`.
- **Volume POSIX FUSE Latency**: High-frequency random I/O (e.g., thousands of tiny file reads) over `/Volumes/...` mount points incurs network overhead via the FUSE driver. For high-throughput ML training, copy volume files to local executor NVMe scratch disks (`/local_disk0/`) before batch iteration.
"""
    },

    # ── Item 3: External Locations, Storage Credentials, and Cloud IAM ──
    {
        "de_id": "de-new-arch-databricks-deep-009",
        "arch_id": "arch-databricks-deep-009",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Unity Catalog Cloud Security & IAM Delegation",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "How do Storage Credentials and External Locations decouple cloud storage access from individual user IAM keys in Unity Catalog, and how do you enforce zero-privilege cloud bucket isolation?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In legacy architectures, compute clusters had cloud IAM instance profiles, service principal secrets, or AWS access keys mounted directly in cluster configs. This granted every user on that cluster wide-open access to the underlying storage buckets, violating zero-privilege principles.

Unity Catalog resolves this through **Two-Tier Storage Abstraction**:
1. **Storage Credential**:
   - Represents an enterprise cloud authentication identity:
     * AWS: IAM Role ARN with trust policy for Databricks AWS account.
     * Azure: Managed Identity (Access Connector for Azure Databricks) with `Storage Blob Data Contributor` RBAC.
     * GCP: Google Cloud Service Account.
   - Stored securely within Unity Catalog metastore metadata; users never see secrets or keys.
2. **External Location**:
   - Combines a cloud storage URL (e.g., `abfss://raw-data@lake.dfs.core.windows.net/`) with a specific **Storage Credential**.
   - Grants fine-grained privileges (`CREATE TABLE`, `READ FILES`, `WRITE FILES`) to specific Databricks groups or service principals.

When a query runs, the user's identity is authenticated against Unity Catalog permissions. If authorized, Unity Catalog mints a short-lived, downscoped security token for the target cloud storage path, ensuring the cluster worker interacts directly with storage without ever exposing perpetual cloud credentials.

### Phase 2: Implementation & Code Artifacts
The following scripts configure an Azure Managed Identity storage credential, register an external location, and enforce group-based RBAC.

```sql
-- 1. Create Storage Credential leveraging Azure Databricks Access Connector
CREATE STORAGE CREDENTIAL enterprise_azure_credential
  AZURE_MANAGED_IDENTITY (
    RESOURCE_ID = '/subscriptions/12345-abc-def/resourceGroups/rg-data/providers/Microsoft.Databricks/accessConnectors/db-access-connector'
  )
  COMMENT 'Root managed identity credential for lakehouse storage';

-- 2. Define External Location on specific container and prefix
CREATE EXTERNAL LOCATION ext_loc_telemetry_raw
  URL 'abfss://telemetry-raw@datalakeprod.dfs.core.windows.net/iot_events/'
  WITH STORAGE CREDENTIAL enterprise_azure_credential
  COMMENT 'External location for IoT raw event streaming ingest';

-- 3. Enforce Strict Zero-Privilege Access Controls
-- Data Engineers can read and write files directly
GRANT READ FILES, WRITE FILES ON EXTERNAL LOCATION ext_loc_telemetry_raw 
  TO `data_engineers_group`;

-- Data Scientists can only read files
GRANT READ FILES ON EXTERNAL LOCATION ext_loc_telemetry_raw 
  TO `data_scientists_group`;

-- Only Platform Admins can create tables referencing this external location
GRANT CREATE EXTERNAL TABLE ON EXTERNAL LOCATION ext_loc_telemetry_raw 
  TO `platform_admins_group`;
```

```bash
# Validating connectivity via Databricks CLI
databricks external-locations validate ext_loc_telemetry_raw \\
  --read-write
```

### Phase 3: Production Gotchas & Failure Modes
- **Sub-Path Overlap Conflicts**: Unity Catalog strictly prohibits registering overlapping External Locations with different credentials unless one is an explicit child. Creating `s3://bucket/data` with Credential A and `s3://bucket/data/finance` with Credential B throws an `OVERLAPPING_EXTERNAL_LOCATIONS` error. Architect storage hierarchy by domain root folders.
- **Direct Cloud Access Bypass**: If Azure Blob storage firewalls allow access from public IPs, or if developers retain legacy IAM keys in their local scripts, users can bypass Unity Catalog auditing. Ensure storage account networking restricts access strictly to the Databricks NAT gateway or VNet Private Endpoints.
- **KMS Key Permission Omission**: Often the IAM role in the Storage Credential has read/write permissions on the S3/ADLS bucket, but lacks `kms:Decrypt` and `kms:GenerateDataKey` on the Customer-Managed Key (CMK). Queries fail with ambiguous `Server-Side Encryption Exception: Access Denied`.
"""
    },

    # ── Item 4: Unity Catalog Fine-Grained Security: Row Filters & Column Masks ──
    {
        "de_id": "de-new-arch-databricks-deep-010",
        "arch_id": "arch-databricks-deep-010",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Unity Catalog Row Filters & Dynamic Data Masking",
        "difficulty": "ARCHITECT",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "How do you architect dynamic row-level filtering and column data masking in Unity Catalog using SQL user-defined functions (UDFs) and session context without cloning data?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In legacy architectures, securing sensitive columns (PII, SSN, salary) or restricting geographic rows (GDPR EU-only vs US-only) required creating duplicate physical tables, views with complex WHERE clauses, or ETL synchronization pipelines. This led to massive storage bloat, stale clones, and governance drift.

Unity Catalog introduces **Native Row Filters and Column Masks**:
1. **Row Filters**: Applied directly to a table. When a user runs `SELECT * FROM table`, UC intercepts the logical plan and injects a deterministic boolean SQL UDF. Rows evaluating to `TRUE` are returned; rows evaluating to `FALSE` are pruned at the storage scan level.
2. **Column Masks**: Applied directly to a table column. A scalar SQL UDF transforms the column value based on the calling user's group membership or role (e.g., returning the original SSN for HR admins, but `'XXX-XX-1234'` for analysts).
3. **Zero Data Cloning**: A single physical Delta table serves all users. Security policies execute dynamically inside the Catalyst optimizer, ensuring compile-time enforcement with zero compute/storage overhead.

### Phase 2: Implementation & Code Artifacts
The following DDL creates reusable security UDFs and attaches row filters and column masks to an enterprise employee table.

```sql
-- 1. Create Security UDF for Dynamic Column Masking (SSN)
CREATE OR REPLACE FUNCTION prod_lakehouse.governance.mask_ssn(ssn STRING)
RETURNS STRING
RETURN CASE 
  WHEN is_account_group_member('hr_payroll_admins') THEN ssn
  WHEN is_account_group_member('data_analysts') THEN concat('XXX-XX-', right(ssn, 4))
  ELSE 'REDACTED'
END;

-- 2. Create Security UDF for Dynamic Row Filtering (Region/Country)
CREATE OR REPLACE FUNCTION prod_lakehouse.governance.filter_emp_region(country_code STRING)
RETURNS BOOLEAN
RETURN CASE
  -- Global executives see all rows
  WHEN is_account_group_member('global_leadership_group') THEN TRUE
  -- Regional managers see only their assigned territory
  WHEN is_account_group_member('eu_managers') AND country_code IN ('DE', 'FR', 'UK', 'NL') THEN TRUE
  WHEN is_account_group_member('us_managers') AND country_code = 'US' THEN TRUE
  ELSE FALSE
END;

-- 3. Apply Column Mask and Row Filter to Physical Table
ALTER TABLE prod_lakehouse.hr.dim_employee 
  ALTER COLUMN ssn_tax_id 
  SET MASK prod_lakehouse.governance.mask_ssn;

ALTER TABLE prod_lakehouse.hr.dim_employee 
  SET ROW FILTER prod_lakehouse.governance.filter_emp_region 
  ON (country_code);

-- 4. Verification: Test execution under different roles
-- When an EU manager runs this query, Catalyst prunes US rows and masks SSNs:
SELECT employee_id, ssn_tax_id, country_code, salary 
FROM prod_lakehouse.hr.dim_employee;
```

### Phase 3: Production Gotchas & Failure Modes
- **Catalyst Optimizer Query Degradation**: If the filtering or masking UDF executes complex subqueries against metadata tables or external functions, it breaks Catalyst filter pushdown and disables Photon vectorized execution. Always keep security UDFs pure, deterministic, and reliant solely on `is_account_group_member()` and session context.
- **Table Owner Bypass**: The table owner (`OWNER`) and Metastore Admin automatically bypass all row filters and column masks. Never use owner accounts for business intelligence dashboards or general reporting connections, as they will accidentally expose raw PII.
- **Materialized View & DLT Ingestion Gotcha**: If a downstream Delta Live Tables (DLT) pipeline or materialized view reads from a table with a Row Filter using a non-admin service principal, the downstream table will permanently materialize *only the subset of rows* visible to that service principal, silently corrupting analytical aggregations.
"""
    },

    # ── Item 5: Databricks Secrets Management & Scopes ──
    {
        "de_id": "de-new-arch-databricks-deep-011",
        "arch_id": "arch-databricks-deep-011",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Databricks Secrets Management & Key Vault Integration",
        "difficulty": "MEDIUM",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "How do you design and secure Databricks Secret Scopes (Azure Key Vault-backed vs Databricks-backed), prevent credential leakage in notebook execution, and inject secrets safely into jobs?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Hardcoding database passwords, API tokens, or encryption keys in notebook code, repository files, or cluster environment variables represents an extreme enterprise vulnerability.

Databricks provides **Secret Scopes** to manage credentials:
1. **Azure Key Vault-Backed Scope**:
   - The secrets reside natively inside an Azure Key Vault.
   - Databricks queries the Key Vault directly via Azure Resource Manager when a job requests a secret.
   - *Enterprise Advantage*: Key rotation in Azure Key Vault takes effect immediately in Databricks without touching workspace configs. Compliance audits stay inside Key Vault access policies.
2. **Databricks-Backed (Encrypted) Scope**:
   - Secrets are stored inside an encrypted Databricks internal database managed by KMS keys.
   - Created and managed via Databricks CLI (`databricks secrets put-secret`).
3. **Secret Redaction Engine**:
   - Databricks automatically masks any secret value retrieved via `dbutils.secrets.get()` in notebook output cells and Spark driver stdout, replacing the raw string with `[REDACTED]`.

### Phase 2: Implementation & Code Artifacts
The following snippet demonstrates creating an Azure Key Vault scope, retrieving secrets programmatically in PySpark, and using environment variable injection.

```bash
# 1. Create Azure Key Vault-backed scope using Databricks CLI
databricks secrets create-scope enterprise-akv-scope \\
  --scope-backend-type AZURE_KEYVAULT \\
  --resource-id "/subscriptions/12345/resourceGroups/rg-data/providers/Microsoft.KeyVault/vaults/kv-enterprise-lake" \\
  --dns-name "https://kv-enterprise-lake.vault.azure.net/"

# 2. Grant Read Access to specific engineering group
databricks secrets put-acl enterprise-akv-scope data_engineers READ
```

```python
# 3. Secure retrieval in PySpark ETL job
from pyspark.sql import SparkSession

# Retrieve credentials safely
jdbc_user = dbutils.secrets.get(scope="enterprise-akv-scope", key="sql-dw-username")
jdbc_password = dbutils.secrets.get(scope="enterprise-akv-scope", key="sql-dw-password")

# Redaction check: Printing the secret prints [REDACTED] in Databricks logs
print(f"Connecting as user: {jdbc_user}, with password: {jdbc_password}")
# Output: Connecting as user: data_loader, with password: [REDACTED]

# 4. Connecting to external database using retrieved secret
jdbc_url = "jdbc:sqlserver://sqldw-enterprise.database.windows.net:1433;database=FinancialDW"

df_raw = spark.read.format("sqlserver") \\
    .option("url", jdbc_url) \\
    .option("dbtable", "raw.vendor_invoices") \\
    .option("user", jdbc_user) \\
    .option("password", jdbc_password) \\
    .load()
```

### Phase 3: Production Gotchas & Failure Modes
- **Accidental Exfiltration via Byte Slicing**: While `print(secret)` is redacted to `[REDACTED]`, malicious or buggy code that breaks down the secret string into characters or hex encodings (e.g., `"".join([hex(ord(c)) for c in secret])`) bypasses the naive regex string-matching redactor and leaks the secret in execution logs. Enforce strict code review and role-based ACLs on notebooks.
- **Cluster Init Script Exposure**: Injecting secrets into cluster environment variables via init scripts makes them readable by any user with cluster "Attach To" permissions via `os.environ` or Python process inspection. Always retrieve secrets dynamically inside the job code via `dbutils.secrets.get()` rather than baking them into cluster-wide environment variables.
- **Key Vault Rate Limiting (HTTP 429)**: When large multi-node clusters start simultaneously with hundreds of tasks executing `dbutils.secrets.get()`, concurrent requests can overwhelm the Azure Key Vault API rate limits (typically 2,000 requests per 10 seconds), causing task crashes. Always fetch the secret *once* on the driver and broadcast or pass it via Spark configs.
"""
    },

    # ── Item 6: Delta Lake ACID Internals & The Delta Transaction Log (_delta_log) ──
    {
        "de_id": "de-new-arch-databricks-deep-012",
        "arch_id": "arch-databricks-deep-012",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Delta Log & ACID Concurrency Architecture",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "How does the Delta Lake transaction log (_delta_log) guarantee ACID atomicity and isolation on cloud object stores, and how does checkpoint compaction work every 10 commits?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Cloud object stores (AWS S3, Azure ADLS Gen2, Google Cloud Storage) lack native multi-file atomic transactions. In standard Parquet lakes, if a write job crashes halfway through, half-written files remain visible, causing data corruption and phantom reads.

Delta Lake solves this by decoupling file storage from table state using an ordered transaction log:
1. **The `_delta_log/` Directory**:
   - Every operation (append, delete, merge, update) is written as an atomic, monotonically increasing JSON commit file: `00000000000000000000.json`, `00000000000000000001.json`, etc.
   - Each JSON file contains atomic protocol actions:
     * `add`: Registers a new physical Parquet file along with columnar statistics (min, max, nullCount).
     * `remove`: Marks an existing Parquet file as logically deleted (tombstoned) without immediately deleting it physically.
     * `commitInfo`: Records operation metadata (timestamp, user, operation parameters).
2. **Mutual Exclusion on Object Stores**:
   - To prevent two writers from writing commit `000001.json` at the same time, Delta uses cloud-specific atomic primitives:
     * ADLS Gen2: Atomic `createIfNotExists` filesystem semantics.
     * S3: DynamoDB-backed lease locking or S3 conditional put operations (`If-None-Match: *`).
3. **Checkpoint Compaction (Every 10 Commits)**:
   - Reading hundreds of raw JSON log files to reconstruct current table state creates severe driver latency.
   - Every 10 commits, Delta automatically generates a compact Parquet checkpoint file: `00000000000000000010.checkpoint.parquet`.
   - The driver reads the latest checkpoint Parquet file and only replays subsequent JSON logs (e.g., commits 11–14), bounding table reconciliation time to $O(1)$.

### Phase 2: Implementation & Code Artifacts
Below is a Python demonstration inspecting raw `_delta_log` commits and checkpoint mechanics.

```python
# Inspecting the _delta_log directory directly using PySpark
log_path = "abfss://lake@datalakeprod.dfs.core.windows.net/tables/orders/_delta_log"

# Read JSON commits directly as JSON DataFrame
df_log = spark.read.json(f"{log_path}/00000000000000000000.json")
df_log.printSchema()
# Output contains: add (path, size, stats), remove, commitInfo, protocol, metaData

# Viewing recent table transaction history via Delta API
from delta.tables import DeltaTable

delta_table = DeltaTable.forPath(spark, "abfss://lake@datalakeprod.dfs.core.windows.net/tables/orders")
df_history = delta_table.history()

df_history.select("version", "timestamp", "userId", "operation", "operationParameters") \\
    .show(5, truncate=False)

# Forcing a checkpoint manually or inspecting checkpoint metadata
spark.sql("DESCRIBE HISTORY delta.`abfss://lake@datalakeprod.dfs.core.windows.net/tables/orders`")
```

### Phase 3: Production Gotchas & Failure Modes
- **Missing Checkpoint Parquet Files**: If a custom script or misconfigured cleanup tool deletes checkpoint Parquet files (`*.checkpoint.parquet`), Spark is forced to read thousands of raw JSON files from commit 0 to current. This causes massive driver memory spikes, S3/ADLS throttling (HTTP 503), and query planning times exceeding 30 minutes.
- **S3 Eventual Consistency in Legacy Connectors**: On legacy S3 setups without conditional puts or DynamoDB locks, concurrent writers can overwrite the same commit JSON file, silently corrupting the Delta transaction log and causing permanent data divergence. Always ensure `io.delta.storage.S3SingleDriverLogStore` or native S3 conditional write support is enabled.
- **Log Retention vs VACUUM Desync**: Setting `delta.logRetentionDuration` shorter than `delta.deletedFileRetentionDuration` causes VACUUM to fail because it cannot find the historical logs necessary to safely determine which files are tombstones. Always keep log retention equal to or greater than file retention.
"""
    },

    # ── Item 7: Delta Lake Concurrency Control & Isolation Levels ──
    {
        "de_id": "de-new-arch-databricks-deep-013",
        "arch_id": "arch-databricks-deep-013",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Delta Lake Optimistic Concurrency & Conflict Resolution",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "Compare WriteSerializable and Serializable isolation levels in Delta Lake. How does Optimistic Concurrency Control (OCC) resolve write conflicts, and what causes ConcurrentAppendException vs ConcurrentModificationException?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Delta Lake coordinates concurrent writers using **Optimistic Concurrency Control (OCC)**:
1. **The OCC Protocol**:
   - A writer reads the latest version $V_0$ of the Delta table.
   - The writer performs heavy distributed transformations and writes new Parquet data files to storage.
   - *Commit Time*: The writer attempts to write commit file $V_1$.
   - If another writer successfully committed $V_1$ first, a conflict occurs.
   - *Conflict Check*: Delta checks whether the files written by $V_1$ overlap with the partitions or logical predicates read/written by the current writer. If no logical conflict exists, the current writer automatically updates its snapshot to $V_1$ and commits as $V_2$ without failing.

2. **Isolation Levels**:
   - `WriteSerializable` (Default): Ensures writes are serializable with respect to each other. Readers may see operations in an order that differs from a theoretical strict serial schedule, but readers never see uncommitted or corrupted data. This enables concurrent appends to proceed without blocking updates to separate partitions.
   - `Serializable` (Strict): The highest isolation level. Guarantees that the physical outcome of concurrent reads and writes is identical to executing transactions sequentially one after another.

3. **Core Conflict Exceptions**:
   - `ConcurrentAppendException`: Another transaction added files to the exact same partition while the current transaction was trying to read or write it.
   - `ConcurrentModificationException`: Another transaction deleted or modified files that the current transaction was attempting to read, update, or delete.

### Phase 2: Implementation & Code Artifacts
Below is how isolation levels are configured and how transient write conflicts are handled with exponential backoff.

```sql
-- Setting table isolation level to Serializable (or WriteSerializable)
ALTER TABLE prod_lakehouse.finance.general_ledger
SET TBLPROPERTIES ('delta.isolationLevel' = 'Serializable');
```

```python
import time
from delta.exceptions import ConcurrentModificationException, ConcurrentAppendException

def robust_delta_merge_with_retry(delta_table, source_df, merge_condition, max_retries=5):
    '''
    Executes Delta MERGE with exponential backoff to handle OCC write conflicts.
    '''
    for attempt in range(max_retries):
        try:
            delta_table.alias("tgt") \\
                .merge(source_df.alias("src"), merge_condition) \\
                .whenMatchedUpdateAll() \\
                .whenNotMatchedInsertAll() \\
                .execute()
            print(f"Transaction successfully committed on attempt {attempt + 1}")
            return True
        except (ConcurrentModificationException, ConcurrentAppendException) as e:
            if attempt == max_retries - 1:
                raise RuntimeError(f"Exceeded max retries ({max_retries}) due to concurrent write conflict") from e
            sleep_sec = (2 ** attempt) + (attempt * 0.5)
            print(f"Conflict detected at attempt {attempt + 1}. Retrying in {sleep_sec:.2f}s...")
            time.sleep(sleep_sec)
```

### Phase 3: Production Gotchas & Failure Modes
- **High-Frequency Micro-Batch Streaming Conflicts**: Running multiple concurrent Structured Streaming queries writing to the same Delta table with micro-batch intervals of 5 seconds will trigger constant `ConcurrentAppendException` retries, degrading cluster throughput. Instead, coalesce streaming writes into a unified pipeline or write to separate staging partitions.
- **Unpartitioned MERGE Full-Table Scans**: If a `MERGE INTO` statement lacks partition filters in its `ON` condition (e.g., `ON tgt.id = src.id` without `AND tgt.date = src.date`), Delta must scan every file in the table. If any concurrent job writes anywhere in the table, the merge fails with `ConcurrentModificationException`. Always include partition predicates in MERGE statements.
- **Metadata-Only Operations Conflicts**: Operations like `OPTIMIZE` or `ALTER TABLE` modify table metadata. If run concurrently with long-running ETL transactions under `Serializable` isolation, the ETL job will abort at commit time after hours of computation. Schedule maintenance jobs (`OPTIMIZE`, `VACUUM`) outside peak ETL write windows.
"""
    },

    # ── Item 8: Delta Lake Time Travel & Transaction Restore ──
    {
        "de_id": "de-new-arch-databricks-deep-014",
        "arch_id": "arch-databricks-deep-014",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Delta Time Travel & Snapshot Disaster Recovery",
        "difficulty": "MEDIUM",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "How does Delta Lake implement Time Travel via JSON commit history and Parquet snapshots? How do you restore corrupted tables without downtime, and what are the performance and cost tradeoffs of retention periods?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In traditional databases, rolling back a bad batch update or recovering from an accidental `DELETE FROM table` requires restoring multi-terabyte backups from cold storage, resulting in hours of system downtime.

Delta Lake implements **Zero-Downtime Time Travel**:
1. **Mechanics**:
   - The Delta transaction log maintains an immutable append-only record of all historical commits.
   - When a row is updated or deleted, the old Parquet file is NOT overwritten; it is merely marked as `remove` in the JSON log, while a new Parquet file is added with `add`.
   - By reading the log up to a specific version number $N$ or timestamp $T$, the Delta driver reconstructs the exact file set that existed at that precise point in time.
2. **Snapshot Reconstruction**:
   - Time travel queries incur zero data copy overhead. They simply evaluate the state of the table using historical metadata.
3. **RESTORE TABLE**:
   - Delta provides a native `RESTORE TABLE ... TO VERSION AS OF` command. This creates a new forward commit (e.g., commit $V_{15}$) that rolls back the active file pointers to match state $V_{10}$, restoring the table in seconds without rewriting underlying data.

### Phase 2: Implementation & Code Artifacts
Below are SQL and PySpark patterns for auditing historical changes, executing point-in-time time travel, and restoring state after an errant job.

```sql
-- 1. Inspect historical table commits and find bad operation
DESCRIBE HISTORY prod_lakehouse.finance.invoices;

-- 2. Query data exactly as it was 2 hours ago
SELECT * FROM prod_lakehouse.finance.invoices
TIMESTAMP AS OF current_timestamp() - INTERVAL 2 HOURS;

-- 3. Query specific known stable version
SELECT count(*) FROM prod_lakehouse.finance.invoices
VERSION AS OF 42;

-- 4. Instant Disaster Recovery: Rollback the entire table state
-- Restores table to version 41, creating version 43 as an atomic commit
RESTORE TABLE prod_lakehouse.finance.invoices TO VERSION AS OF 41;
```

```python
# 5. Programmatic Time Travel in PySpark for data validation / ML reproducibility
df_snapshot_v12 = spark.read.format("delta") \\
    .option("versionAsOf", 12) \\
    .load("abfss://lake@datalakeprod.dfs.core.windows.net/tables/invoices")

# Reproduce ML model features with exact historical timestamp
df_features = spark.read.format("delta") \\
    .option("timestampAsOf", "2026-10-01 00:00:00") \\
    .load("abfss://lake@datalakeprod.dfs.core.windows.net/tables/features")
```

### Phase 3: Production Gotchas & Failure Modes
- **Time Travel Broken by Aggressive VACUUM**: If `VACUUM` is run with a 2-day retention period, any attempt to time travel to a version older than 2 days throws a `FileNotFoundException` because the physical Parquet files referenced by those older commits have been permanently purged from cloud storage.
- **Log Retention Truncation**: Delta tables default to 30 days of log retention (`delta.logRetentionDuration = 'interval 30 days'`). After 30 days, old commit JSON files are deleted during checkpoint compaction. Even if physical files exist, time travel queries older than the log retention window fail with `VersionNotFoundException`.
- **Storage Cost Accumulation**: Because updates and deletes create new files while leaving old files intact, a high-churn table (e.g., 100GB updated every hour) can accumulate 2.4TB of historical Parquet files in a single day. Align `delta.deletedFileRetentionDuration` with business compliance and FinOps budgets.
"""
    },

    # ── Item 9: Delta Lake VACUUM Mechanics & Tombstone Cleaning ──
    {
        "de_id": "de-new-arch-databricks-deep-015",
        "arch_id": "arch-databricks-deep-015",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Delta VACUUM & Garbage Collection Lifecycle",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "How does VACUUM identify and physically delete obsolete Parquet files from cloud storage, what is the significance of the 7-day retention safety threshold, and how do you execute parallel dry runs safely?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In Delta Lake, updating or deleting records never deletes physical Parquet files in real time; it merely appends `remove` actions to the transaction log. Over weeks of production operations, thousands of unreferenced "tombstone" Parquet files accumulate on cloud storage.

**The `VACUUM` Architecture**:
1. **Garbage Collection Algorithm**:
   - `VACUUM table RETAIN H HOURS` identifies files physically present in the table's cloud storage directory that:
     * Are recorded as `remove` tombstones in the `_delta_log` with a deletion timestamp older than the retention threshold ($now() - H$).
     * Are NOT referenced in the active snapshot at the cutoff timestamp.
     * Are untracked orphan files left behind by crashed write transactions.
2. **The 7-Day Safety Threshold**:
   - By default, Delta strictly blocks `VACUUM` with retention periods under 168 hours (7 days).
   - *Rationale*: Long-running streaming readers, active ad-hoc Spark queries, or uncommitted concurrent transactions may still be reading older Parquet files based on snapshots resolved when their query started. If `VACUUM` deleted files currently being read by an active query, that query would crash with an unrecoverable `FileNotFoundException`.
3. **Parallel Delete Engine**:
   - Deleting millions of small files via sequential cloud storage REST calls (`DELETE` in ADLS/S3) is painfully slow. Enabling parallel delete distributes the file deletion workload across Spark worker cores.

### Phase 2: Implementation & Code Artifacts
Below are commands for running non-destructive dry runs, tuning retention thresholds, and executing parallel deletion.

```sql
-- 1. Dry Run: Audit what files WOULD be deleted without making any changes
VACUUM prod_lakehouse.telemetry.iot_events RETAIN 168 HOURS DRY RUN;

-- 2. Standard Production Vacuum with default 7-day retention
VACUUM prod_lakehouse.telemetry.iot_events RETAIN 168 HOURS;

-- 3. Overriding the 7-Day Safety Guardrail (EXTREME CAUTION - Dev Sandboxes Only)
SET spark.databricks.delta.vacuum.parallelDelete.enabled = true;
SET spark.databricks.delta.retentionDurationCheck.enabled = false;

-- Immediate purge of all files older than 2 hours in Dev
VACUUM dev_lakehouse.sandbox.scratch_data RETAIN 2 HOURS;
```

```python
# Programmatic audit of vacuum candidates using PySpark
vacuum_df = spark.sql("VACUUM prod_lakehouse.telemetry.iot_events RETAIN 168 HOURS DRY RUN")
print(f"Total obsolete files eligible for deletion: {vacuum_df.count()}")
vacuum_df.show(10, truncate=False)
```

### Phase 3: Production Gotchas & Failure Modes
- **Disabling Retention Check in Production**: Setting `spark.databricks.delta.retentionDurationCheck.enabled = false` and running `VACUUM RETAIN 0 HOURS` in production is catastrophic. It instantly deletes all files not referenced in the *current* commit. Any concurrent writer, background job, or streaming micro-batch that started 30 seconds earlier will crash with `FileNotFoundException`, and all time-travel capabilities are wiped out.
- **S3 Bucket Versioning Trap**: If the cloud storage container has AWS S3 Object Versioning or Azure Blob Soft Delete enabled, `VACUUM` only writes a delete marker. The underlying storage bytes remain billed by AWS/Azure! Ensure S3 lifecycle rules automatically expire non-current object versions after 7–14 days.
- **Spark Driver OutOfMemory During File Listing**: On tables with tens of millions of files, running `VACUUM` without parallel file listing causes the Spark driver to exhaust its JVM heap attempting to collect the list of file paths. Always use Databricks Runtime with optimized file listing or scale the driver node memory.
"""
    },

    # ── Item 10: Delta Lake OPTIMIZE & Compaction Strategies ──
    {
        "de_id": "de-new-arch-databricks-deep-016",
        "arch_id": "arch-databricks-deep-016",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Delta Lake File Compaction & OPTIMIZE Scheduling",
        "difficulty": "MEDIUM",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "How does OPTIMIZE bin-pack small Parquet files into target 1GB files, how does it interact with concurrent writes, and how do you automate compaction in high-frequency streaming ingest pipelines?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
High-frequency data ingestion (such as Structured Streaming micro-batches arriving every 30 seconds or hourly batch appends) creates thousands of small Parquet files (1MB–10MB). This triggers the **Small File Problem**: excessive file opening overhead, bloated metadata in `_delta_log`, and crippling query performance.

**The `OPTIMIZE` Architecture**:
1. **Bin-Packing Algorithm**:
   - `OPTIMIZE table` reads small Parquet files within each partition and combines them into fewer, uniformly sized files targeting a configurable target size (default 1GB, controlled by `spark.databricks.delta.optimize.maxFileSize`).
   - The operation is 100% idempotent and transactional: it adds new compacted files to the log and tombstones the original small files via an atomic commit.
2. **Concurrency Guarantees**:
   - Because `OPTIMIZE` does NOT modify the logical data rows (it only reorganizes physical file boundaries), concurrent readers continue reading uncompacted files without interruption.
   - Delta Lake's OCC allows `OPTIMIZE` to commit concurrently alongside concurrent appends without conflict.
3. **Auto-Compaction vs Scheduled Maintenance**:
   - *Auto-Compaction*: Compacts files synchronously after individual writes (`delta.autoOptimize.autoCompact = true`). Useful for streaming, but adds write latency to the stream.
   - *Scheduled Jobs*: Decouples compaction from ingestion by running an asynchronous nightly or hourly Databricks workflow.

### Phase 2: Implementation & Code Artifacts
Below are SQL configurations to tune file sizing, enable auto-compaction, and schedule selective partition optimization.

```sql
-- 1. Configure Target Compaction File Size (e.g., 512MB for BI queries)
ALTER TABLE prod_lakehouse.telemetry.iot_events 
SET TBLPROPERTIES (
  'delta.targetFileSize' = '536870912', -- 512 MB
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true'
);

-- 2. Run Selective Compaction on Recent Partitions Only
-- Avoids expensive rescanning of historical unchanging partitions!
OPTIMIZE prod_lakehouse.telemetry.iot_events 
WHERE event_date >= current_date() - INTERVAL 7 DAYS;
```

```python
# 3. Automated Compaction Script for Databricks Workflow Job
from delta.tables import DeltaTable

def compact_recent_partitions(table_name: str, days_back: int = 3):
    '''
    Selectively compacts recent partitions of high-throughput Delta tables.
    '''
    spark.sql(f'''
        OPTIMIZE {table_name}
        WHERE event_date >= date_sub(current_date(), {days_back})
    ''')
    print(f"Successfully compacted {table_name} for past {days_back} days.")

compact_recent_partitions("prod_lakehouse.telemetry.iot_events", days_back=2)
```

### Phase 3: Production Gotchas & Failure Modes
- **Write-Amplification in Auto-Compaction**: Enabling `autoCompact = true` on ultra-low-latency streaming pipelines (<10 seconds) forces the streaming executor to re-read and re-write small files at every micro-batch. This increases DBU consumption by 300% and leads to micro-batch processing delays. Use an asynchronous job cluster for compaction instead.
- **Compaction Conflict with MERGE**: While `OPTIMIZE` commits concurrently with simple `INSERT` / `APPEND` operations, running `OPTIMIZE` concurrently with a heavy `MERGE INTO` statement touching the same partition can cause the merge to fail with `ConcurrentModificationException`. Always coordinate scheduling between ETL updates and optimization jobs.
- **Over-Compacting Streaming Tables**: Setting `targetFileSize` too large (e.g., 2GB–4GB) on tables read by downstream streaming queries causes downstream streaming micro-batches to process massive Parquet files for just a few new records, killing downstream streaming latency.
"""
    },

    # ── Item 11: Delta Lake Change Data Feed (CDF) Architecture ──
    {
        "de_id": "de-new-arch-databricks-deep-017",
        "arch_id": "arch-databricks-deep-017",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Delta Change Data Feed & Incremental Consumers",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "How does Delta Change Data Feed (CDF) capture row-level inserts, updates, and deletes (_change_type), and how do you construct resilient incremental CDC downstream consumers without table scans?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In multi-hop Medallion architectures, Silver tables are constantly updated with inserts, updates, and deletes via `MERGE INTO`. Downstream Gold aggregations historically had to rescan the entire Silver table or rely on clumsy `updated_at` timestamp watermarks that cannot capture hard deletes.

**Delta Change Data Feed (CDF)** provides native row-level change capture:
1. **Mechanics**:
   - Enabled via table property `delta.enableChangeDataFeed = true`.
   - When updates or deletes occur, Delta writes CDC change records either directly into new Parquet files or into a dedicated `_change_data/` folder.
   - For an `UPDATE`, Delta produces two records: `update_preimage` (state before update) and `update_postimage` (state after update).
   - For an `INSERT`, it produces `insert`.
   - For a `DELETE`, it produces `delete`.
2. **Metadata Columns**:
   - `_change_type`: String representing the mutation type (`insert`, `update_preimage`, `update_postimage`, `delete`).
   - `_commit_version`: The Delta commit version that created the change.
   - `_commit_timestamp`: Wall-clock commit time.
3. **Zero-Scan Incremental Consumption**:
   - Downstream consumers query `table_changes('table_name', start_version)` or use `spark.readStream.format('delta').option('readChangeFeed', 'true')` to stream mutations incrementally without ever rescanning unchanged data.

### Phase 2: Implementation & Code Artifacts
Below is how CDF is enabled, queried via batch SQL, and consumed in a streaming pipeline.

```sql
-- 1. Enable Change Data Feed on Silver Orders table
ALTER TABLE prod_lakehouse.silver.orders 
SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true');

-- 2. Inspect row mutations between commit version 10 and 15
SELECT 
  order_id,
  customer_id,
  order_status,
  total_amount,
  _change_type,
  _commit_version,
  _commit_timestamp
FROM table_changes('prod_lakehouse.silver.orders', 10, 15)
ORDER BY _commit_version, order_id;
```

```python
# 3. Incremental Streaming Consumer reading CDF into Gold Real-Time Aggregations
df_changes_stream = spark.readStream.format("delta") \\
    .option("readChangeFeed", "true") \\
    .option("startingVersion", 10) \\
    .table("prod_lakehouse.silver.orders")

def process_order_mutations(micro_batch_df, batch_id):
    '''
    Applies incremental updates and deletes directly to Gold aggregated metrics.
    '''
    # Filter for active updates and inserts to refresh Gold summary
    active_mutations = micro_batch_df.filter(
        micro_batch_df._change_type.isin(["insert", "update_postimage", "delete"])
    )
    # Perform idempotent downstream merge...
    print(f"Batch {batch_id}: Processing {active_mutations.count()} row mutations.")

query = df_changes_stream.writeStream \\
    .foreachBatch(process_order_mutations) \\
    .option("checkpointLocation", "abfss://lake@datalakeprod.dfs.core.windows.net/checkpoints/gold_orders_cdf") \\
    .start()
```

### Phase 3: Production Gotchas & Failure Modes
- **CDF Storage Overhead on Massive Updates**: When running large bulk `MERGE` operations on billions of rows with CDF enabled, Delta must write both pre-images and post-images for every modified row into `_change_data/`. This can double write I/O and storage consumption for that commit. Ensure CDF is enabled selectively on tables with incremental downstream consumers.
- **Schema Evolution in CDF Streams**: If a column is added or renamed in the upstream table with `mergeSchema`, downstream CDF streaming queries fail unless `.option("schemaEvolutionMode", "addNewColumns")` is configured on the reader checkpoint.
- **Tombstone Cleanup (VACUUM) Edge Case**: If `VACUUM` purges files older than 7 days, attempting to read `table_changes` starting from a version older than 7 days throws an error if the change data files were pruned. Match CDF consumer polling schedules with VACUUM retention windows.
"""
    },

    # ── Item 12: Delta Lake Schema Evolution vs Schema Enforcement ──
    {
        "de_id": "de-new-arch-databricks-deep-018",
        "arch_id": "arch-databricks-deep-018",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Schema Enforcement, Evolution & Column Mapping",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "What is the architectural difference between Schema Enforcement (validation on write) and Schema Evolution (mergeSchema), and how do column mapping modes (delta.columnMapping.mode = 'name') allow renaming and dropping columns without Parquet rewrites?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In legacy data lakes (raw Parquet on S3), writing a dataframe with an unexpected column or changed datatype corrupted the directory or caused downstream reader queries to fail with cryptic decoding errors.

Delta Lake provides **Dual Schema Governance**:
1. **Schema Enforcement (Schema on Write)**:
   - The default behavior in Delta Lake.
   - When a DataFrame is written to a table, Delta checks its schema against the table's current transaction log metadata.
   - If any new column is present, or if data types conflict, Delta immediately rejects the write with an `AnalysisException: A schema mismatch detected when writing to the Delta table`.
   - Prevents accidental pipeline bugs from poisoning clean tables.
2. **Schema Evolution (`mergeSchema`)**:
   - Allows deliberate, controlled schema changes.
   - When `.option('mergeSchema', 'true')` is supplied, Delta adds any new incoming columns to the table metadata and backfills `NULL` values for all historical Parquet files.
3. **Column Mapping Mode (`mode = 'name'`)**:
   - In traditional Parquet, column references are tied to physical column names or ordinal positions. Renaming or dropping a column required rewriting every historical Parquet file.
   - Column Mapping decouples logical table column names from physical Parquet file columns by assigning unique metadata IDs. Dropping or renaming a column executes as a metadata-only commit in milliseconds.

### Phase 2: Implementation & Code Artifacts
Below are PySpark and SQL scripts demonstrating controlled schema evolution, type widening, and column mapping.

```python
# 1. Schema Enforcement in action: Fails if new column 'loyalty_tier' is present
try:
    df_new.write.format("delta").mode("append").saveAsTable("prod_lakehouse.bronze.users")
except Exception as e:
    print("Write blocked by Schema Enforcement as expected!")

# 2. Schema Evolution: Explicitly permitting new columns to merge
df_new.write.format("delta") \\
    .mode("append") \\
    .option("mergeSchema", "true") \\
    .saveAsTable("prod_lakehouse.bronze.users")
```

```sql
-- 3. Enable Column Mapping to allow instant RENAME and DROP COLUMN
ALTER TABLE prod_lakehouse.bronze.users 
SET TBLPROPERTIES (
  'delta.minReaderVersion' = '2',
  'delta.minWriterVersion' = '5',
  'delta.columnMapping.mode' = 'name'
);

-- 4. Instant Metadata-Only Column Rename (0 bytes rewritten!)
ALTER TABLE prod_lakehouse.bronze.users 
RENAME COLUMN loyalty_tier TO customer_rewards_tier;

-- 5. Instant Metadata-Only Column Drop
ALTER TABLE prod_lakehouse.bronze.users 
DROP COLUMN temporary_flags;
```

### Phase 3: Production Gotchas & Failure Modes
- **Silent Schema Poisoning via mergeSchema**: Leaving `mergeSchema = true` permanently enabled in automated production ingestion pipelines is an anti-pattern. If an upstream API introduces a typo (e.g., `user_emial` instead of `user_email`), Delta quietly creates a new column, resulting in sparse data and silent data corruption. Always quarantine new columns before merging.
- **Incompatible Data Type Evolution**: `mergeSchema` only supports compatible upcasting (e.g., Byte to Short to Integer, or NULL to String). It cannot automatically convert `StringType` to `DoubleType` or `TimestampType` to `LongType`. Such writes still fail with `SchemaEvolutionException`.
- **Downstream Reader Incompatibility with Column Mapping**: Older versions of Spark (<3.2), Presto, or external non-Delta engines cannot read Delta tables with `delta.columnMapping.mode = 'name'`. Ensure all reading engines support Delta Reader Version 2 before enabling column mapping.
"""
    },

    # ── Item 13: Delta Lake MERGE INTO Upsert Mechanics & Performance Optimization ──
    {
        "de_id": "de-new-arch-databricks-deep-019",
        "arch_id": "arch-databricks-deep-019",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Delta Lake Upsert Mechanics & MERGE Tuning",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "Dissect the physical execution of a Delta Lake MERGE INTO operation. Why does it execute a 2-pass join, how do write-amplification and partition pruning affect performance, and how do you optimize upserts at Terabyte scale?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In data lakehouse architecture, updating records cannot be done via in-place byte overwrites because cloud Parquet files are immutable. An upsert (`MERGE INTO`) must identify target files containing matches, rewrite those files with updated rows, and append new files for inserted rows.

**Physical 2-Pass Join Execution**:
1. **Pass 1: Inner Join (Search Phase)**:
   - Delta executes an inner join between the source DataFrame and target Delta table on the `ON` condition.
   - *Goal*: Identify the exact subset of target Parquet files that contain at least one matching row needing an update or delete.
   - Target files with no matches are immediately excluded from rewrite.
2. **Pass 2: Right/Full Outer Join (Materialization Phase)**:
   - Delta takes the candidate files identified in Pass 1 and performs a full join with the source records.
   - For matched rows, updated expressions are evaluated.
   - For unmatched source rows, new records are inserted.
   - For unmatched target rows in those candidate files, original rows are preserved.
   - The result is written out as brand-new Parquet files, and the old candidate files are tombstoned in the `_delta_log`.
3. **Write Amplification Trap**:
   - If a table has 1GB Parquet files and an upsert touches only 1 row in a file, Delta must rewrite the entire 1GB file. If 1,000 files each have 1 row modified, Delta rewrites 1TB of data to modify 1,000 rows.

### Phase 2: Implementation & Code Artifacts
Below is how to construct partition-pruned `MERGE INTO` operations and leverage Low Shuffle Merge.

```sql
-- 1. Optimized MERGE with Explicit Target Partition Pruning
-- Pruning the search space to recent dates eliminates full table scans!
MERGE INTO prod_lakehouse.silver.customer_balances AS tgt
USING (
  SELECT customer_id, balance_date, updated_balance
  FROM stage_updates
) AS src
ON tgt.customer_id = src.customer_id 
   AND tgt.balance_date = src.balance_date -- Partition Key Pruning!
   AND tgt.balance_date >= current_date() - INTERVAL 30 DAYS
WHEN MATCHED AND tgt.updated_balance != src.updated_balance THEN
  UPDATE SET tgt.updated_balance = src.updated_balance, tgt.updated_at = current_timestamp()
WHEN NOT MATCHED THEN
  INSERT (customer_id, balance_date, updated_balance, updated_at)
  VALUES (src.customer_id, src.balance_date, src.updated_balance, current_timestamp());
```

```python
# 2. Databricks Low Shuffle Merge Configuration (DBR 10.4+)
# Low Shuffle Merge avoids re-shuffling untouched records during Pass 2
spark.conf.set("spark.databricks.delta.merge.lowShuffle.enabled", "true")

# 3. Pre-aggregating / Deduplicating Source Records Before MERGE
# Prevents Delta invariant failure: "Cannot perform MERGE as multiple source rows matched"
from pyspark.sql.functions import col, row_number
from pyspark.sql.window import Window

window_spec = Window.partitionBy("customer_id").orderBy(col("updated_at").desc())
deduped_source = source_df.withColumn("rn", row_number().over(window_spec)) \\
    .filter(col("rn") == 1) \\
    .drop("rn")
```

### Phase 3: Production Gotchas & Failure Modes
- **Multiple Source Rows Matching Single Target Row**: If the source DataFrame contains duplicate keys that match the same target record, Delta aborts the entire transaction at commit time with: `DeltaUnsupportedOperationException: Cannot perform MERGE as multiple source rows matched the same target row`. Always enforce a deduplication window on the source before executing the merge.
- **Missing Partition Predicates on Giant Tables**: On a 50TB partitioned Delta table, omitting the partition column from the `ON` condition forces Pass 1 to scan all 50TB of metadata and files across the entire cluster, causing hours of shuffle before a single row is written.
- **Extreme Write Amplification on Uncompacted Tables**: If a table suffers from small files (e.g., 200,000 5MB files), a merge operation will create an explosion of tiny replacement files, exhausting driver memory and slowing down subsequent queries. Run `OPTIMIZE` prior to scheduled heavy merge jobs.
"""
    },

    # ── Item 14: Delta Lake Shallow Clones vs Deep Clones ──
    {
        "de_id": "de-new-arch-databricks-deep-020",
        "arch_id": "arch-databricks-deep-020",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Delta Table Cloning Architecture & Zero-Copy Sandboxes",
        "difficulty": "MEDIUM",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "Compare Delta Lake Shallow Clones and Deep Clones. How do pointer-based shallow clones enable instant zero-cost testing environments, and when is deep cloning required for disaster recovery and regional migration?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Creating test copies of multi-terabyte production tables for development, pipeline testing, or ML experimentation historically required physically copying petabytes of storage, incurring huge cloud egress and storage costs.

Delta Lake provides two native cloning mechanisms:
1. **Shallow Clones (Zero-Copy Pointer Clones)**:
   - *Mechanics*: Creates a new Delta table entry in the catalog that references the exact same physical Parquet data files as the source table, copying ONLY the `_delta_log` metadata.
   - *Speed & Cost*: Completes in seconds, consuming virtually zero additional storage.
   - *Copy-on-Write Isolation*: If a developer writes, updates, or deletes rows in the shallow clone, new Parquet files are written to the clone's storage directory. The original production table remains completely untouched!
   - *Limitation*: The shallow clone depends on the source table's physical files. If the source table runs `VACUUM`, files referenced by the clone may be deleted.
2. **Deep Clones (Full Physical Data Duplication)**:
   - *Mechanics*: Fully copies both metadata AND physical Parquet data files to an independent storage location.
   - *Speed & Cost*: Takes time proportional to data volume; duplicates storage cost.
   - *Independence*: Completely decoupled from source table. Suitable for cross-region disaster recovery, archiving, and cloud migrations.

### Phase 2: Implementation & Code Artifacts
Below are SQL commands demonstrating shallow clone creation for staging validation and incremental deep cloning for disaster recovery.

```sql
-- 1. Create Instant Zero-Copy Shallow Clone for QA Testing
-- Completes in <5 seconds even for a 10TB table!
CREATE OR REPLACE TABLE qa_sandbox.customer_test.dim_customer_clone
SHALLOW CLONE prod_lakehouse.gold.dim_customer;

-- Run destructive migration testing on the shallow clone safely
UPDATE qa_sandbox.customer_test.dim_customer_clone
SET lifetime_value = lifetime_value * 1.10
WHERE country_code = 'US';

-- 2. Create Deep Clone for Cross-Region Disaster Recovery
CREATE OR REPLACE TABLE dr_lakehouse.backup.dim_customer_replica
DEEP CLONE prod_lakehouse.gold.dim_customer
LOCATION 'abfss://dr-backup@lakehousedr.dfs.core.windows.net/tables/dim_customer';

-- 3. Incremental Deep Clone Sync: Only syncs newly committed files since last run
CREATE OR REPLACE TABLE dr_lakehouse.backup.dim_customer_replica
DEEP CLONE prod_lakehouse.gold.dim_customer;
```

### Phase 3: Production Gotchas & Failure Modes
- **The Shallow Clone VACUUM Trap**: If you create a shallow clone of a production table, and the production table subsequently runs `VACUUM` that purges old Parquet files, any queries on the shallow clone that reference those purged files will immediately crash with `FileNotFoundException`. Never use shallow clones for long-term production storage; reserve them for short-lived ephemeral dev/test sandboxes.
- **Cross-Region Network Egress Costs with Deep Clones**: Deep cloning across cloud regions (e.g., AWS us-east-1 to eu-west-1) incurs substantial cloud data transfer egress fees. For DR replication, schedule incremental deep clones during off-peak hours and monitor data transfer bandwidth.
- **Cloning Unity Catalog Permissions**: `CLONE` copies data and table properties, but does NOT copy Unity Catalog grants or access control lists (ACLs). Access permissions must be explicitly re-applied on the target clone.
"""
    },

    # ── Item 15: Delta Live Tables (DLT) Declarative Framework & Expectations ──
    {
        "de_id": "de-new-arch-databricks-deep-021",
        "arch_id": "arch-databricks-deep-021",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Delta Live Tables Architecture & Data Quality Expectations",
        "difficulty": "ARCHITECT",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "How does Delta Live Tables (DLT) orchestrate multi-hop Lakehouse pipelines declaratively with @dlt.table and @dlt.view, and how do DLT Expectations (expect, expect_or_drop, expect_or_fail) enforce automated data quality?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Traditional Spark pipelines require data engineers to write imperative boilerplate: manually configuring cluster sizes, wiring checkpoint directories, managing retry loops, handling schema drift, and writing custom data validation checks.

**Delta Live Tables (DLT)** replaces this with a declarative software engineering framework:
1. **Declarative DAG Execution**:
   - Engineers define WHAT tables to produce using SQL or Python decorators (`@dlt.table`, `@dlt.view`).
   - DLT analyzes the dependency graph between tables, automatically resolves execution order, optimizes cluster compute, and provisions autoscaling infrastructure.
2. **Multi-Hop Medallion Architecture**:
   - *Bronze*: Raw ingestion with Auto Loader (`cloudFiles`).
   - *Silver*: Cleaned, deduplicated, enriched streaming tables.
   - *Gold*: Aggregated business-level materialized views.
3. **DLT Expectations (Data Quality Guardrails)**:
   - Native row-level quality validation rules defined alongside table logic:
     * `expect`: Logs quality metric violations in the DLT event log; allows records to pass through.
     * `expect_or_drop`: Drops bad records immediately; writes only clean records to the target table.
     * `expect_or_fail`: Immediately aborts the entire pipeline run upon encountering a single failing row.
     * *Quarantine Pattern*: Rules route invalid records to a quarantine table for human triage.

### Phase 2: Implementation & Code Artifacts
Below is an end-to-end Python DLT pipeline implementing Bronze, Silver with Expectations, and Quarantine routing.

```python
import dlt
from pyspark.sql.functions import col, current_timestamp

# 1. Bronze Layer: Ingest raw JSON logs incrementally via Auto Loader
@dlt.table(
    name="bronze_iot_raw",
    comment="Raw streaming IoT telemetry ingested via Auto Loader",
    table_properties={"quality": "bronze"}
)
def bronze_iot_raw():
    return (
        spark.readStream.format("cloudFiles")
        .option("cloudFiles.format", "json")
        .option("cloudFiles.inferColumnTypes", "true")
        .load("abfss://raw-data@lake.dfs.core.windows.net/iot_events/")
    )

# 2. Silver Layer: Enforce Data Quality Expectations with drop rule
@dlt.table(
    name="silver_iot_cleaned",
    comment="Cleaned IoT events passing valid sensor thresholds",
    table_properties={"quality": "silver"}
)
@dlt.expect("valid_device_id", "device_id IS NOT NULL")
@dlt.expect_or_drop("valid_temperature", "temperature BETWEEN -50.0 AND 150.0")
@dlt.expect_or_fail("valid_timestamp", "event_timestamp <= current_timestamp()")
def silver_iot_cleaned():
    return (
        dlt.read_stream("bronze_iot_raw")
        .filter(col("status") == "ACTIVE")
        .withColumn("ingested_at", current_timestamp())
    )

# 3. Quarantine Routing: Capture dropped records for compliance auditing
@dlt.table(
    name="silver_iot_quarantine",
    comment="Records failing sensor temperature bounds"
)
def silver_iot_quarantine():
    return (
        dlt.read_stream("bronze_iot_raw")
        .filter("temperature < -50.0 OR temperature > 150.0 OR temperature IS NULL")
    )
```

### Phase 3: Production Gotchas & Failure Modes
- **Hidden OOMs with Non-Streaming dlt.read()**: Using `dlt.read("bronze_table")` instead of `dlt.read_stream("bronze_table")` inside a streaming table definition forces DLT to perform an unbounded batch full-table scan on every trigger. As Bronze grows to billions of rows, the pipeline exhausts driver heap memory and crashes. Always use `dlt.read_stream` for streaming tables.
- **Pipeline Aborts with expect_or_fail**: Placing `@dlt.expect_or_fail` on high-throughput Bronze or Silver ingestion tables will halt 24/7 production ingestion whenever a single upstream IoT device emits an unexpected null or corrupt packet. Use `expect_or_drop` or quarantine tables on ingestion layers, reserving `expect_or_fail` strictly for regulatory financial gold tables.
- **Event Log Query Overhead**: The DLT Event Log is stored as a Delta table in the pipeline storage directory. Querying the raw event log without filtering on `pipeline_id` or `timestamp` scans millions of JSON audit events, slowing down monitoring dashboards.
"""
    },

    # ── Item 16: DLT Streaming Tables vs Materialized Views & CDC with dlt.apply_changes ──
    {
        "de_id": "de-new-arch-databricks-deep-022",
        "arch_id": "arch-databricks-deep-022",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "DLT Streaming Tables, Materialized Views & CDC Processing",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "What is the architectural distinction between Streaming Tables and Materialized Views in DLT, and how does dlt.apply_changes handle out-of-sequence CDC mutations with automatic SCD Type 1 and Type 2 tracking?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Delta Live Tables distinguishes between two primary data representations:

1. **Streaming Tables (`CREATE OR REFRESH STREAMING TABLE`)**:
   - Designed for append-only, high-throughput, incremental ingestion.
   - Each micro-batch processes *only newly arrived rows* from upstream sources.
   - Maintains continuous checkpoint state; historical processed data is never recomputed.
   - Extremely cost-efficient for event streams, logs, and continuous ingestion.

2. **Materialized Views (`CREATE OR REFRESH MATERIALIZED VIEW`)**:
   - Designed for complex analytical queries, group-by aggregations, and window functions.
   - Computes query results based on the current state of upstream tables.
   - DLT automatically tracks upstream changes and recomputes only the affected partitions where possible.

3. **CDC Ingestion with `dlt.apply_changes`**:
   - Processing Change Data Capture (CDC) events from relational databases (PostgreSQL, SQL Server, Oracle via Debezium/Kafka) involves out-of-order inserts, updates, and deletes.
   - Traditional Spark requires complex, error-prone `MERGE INTO` logic that fails if events arrive out of order.
   - `dlt.apply_changes` natively absorbs out-of-sequence CDC mutations using an ordering column (e.g., LSN or commit timestamp), automatically managing:
     * **SCD Type 1**: In-place row updates (latest state overwrites previous).
     * **SCD Type 2**: Historical tracking with automatically generated `__start_at` and `__end_at` timestamp validity intervals.

### Phase 2: Implementation & Code Artifacts
Below is a complete DLT pipeline ingesting raw CDC records and maintaining an automated SCD Type 2 dimension table.

```python
import dlt
from pyspark.sql.functions import col

# 1. Ingest raw CDC stream from Kafka into Bronze Streaming Table
@dlt.table(name="bronze_cdc_customers")
def bronze_cdc_customers():
    return (
        spark.readStream.format("kafka")
        .option("kafka.bootstrap.servers", "kafka:9092")
        .option("subscribe", "cdc.postgres.customers")
        .load()
    )

# 2. Empty target streaming table for SCD Type 2 dimension
dlt.create_streaming_table(
    name="silver_customers_scd2",
    comment="Slowly Changing Dimension Type 2 customer table",
    table_properties={"quality": "silver"}
)

# 3. Apply CDC mutations with automatic SCD Type 2 tracking
dlt.apply_changes(
    target="silver_customers_scd2",
    source="bronze_cdc_customers",
    keys=["customer_id"],
    sequence_by=col("change_lsn"), # Resolves out-of-order network arrival!
    where="operation_code != 'HEARTBEAT'",
    ignore_null_updates=False,
    apply_as_deletes=col("operation_code") == "DELETE",
    stored_as_scd_type="2" # Automatically creates __start_at and __end_at!
)
```

### Phase 3: Production Gotchas & Failure Modes
- **Querying SCD Type 2 Tables Without Filtering Active Records**: Downstream queries that execute `SELECT * FROM silver_customers_scd2 WHERE customer_id = 101` will receive multiple rows (one for each historical version). Always filter for active records using `WHERE __end_at IS NULL`.
- **Non-Monotonic Sequence Columns**: If the `sequence_by` column is a client-side timestamp that can experience clock drift or reset on server reboot, `dlt.apply_changes` will silently discard valid updates as "older" records. Always use monotonically increasing database sequence identifiers such as Postgres LSN or Oracle SCN.
- **Downstream Streaming from SCD Type 2**: A table managed by `dlt.apply_changes` cannot be consumed directly as an append-only stream (`dlt.read_stream`) without enabling Change Data Feed on the target table, because SCD Type 2 performs internal updates to set `__end_at` timestamps.
"""
    },

    # ── Item 17: Databricks Multi-Task Jobs & Dynamic Workflows ──
    {
        "de_id": "de-new-arch-databricks-deep-023",
        "arch_id": "arch-databricks-deep-023",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Databricks Workflows, Multi-Task DAGs & Task Values",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "How do you architect complex enterprise workflows using Databricks Multi-task Jobs, handle task failure dependencies (If/Else, conditional runs), and pass dynamic metadata between tasks using dbutils.jobs.taskValues?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Historically, orchestrating multi-notebook Databricks pipelines required running external orchestrators (Airflow, ADF) or calling `dbutils.notebook.run()` synchronously inside a parent notebook. The parent notebook forced the driver to remain active for hours, racking up idle compute costs and creating a single point of failure.

**Databricks Multi-Task Workflows**:
1. **Native Serverless DAG Engine**:
   - Workflows are defined as directed acyclic graphs of heterogeneous tasks: Notebooks, Python scripts, SQL queries, DLT pipelines, JARs, and dbt tasks.
   - Tasks execute on isolated or shared ephemeral Job Clusters, terminating immediately upon task completion.
2. **Conditional Task Execution & Control Flow**:
   - `Run If` conditions: `ALL_SUCCESS`, `AT_LEAST_ONE_SUCCESS`, `NONE_FAILED`, `ALL_DONE`, `ALL_FAILED`.
   - `If/Else Condition Task`: Evaluates a dynamic boolean expression (e.g., checking if row count > 0) and branches the DAG to specific downstream paths.
3. **Inter-Task Metadata Sharing (`taskValues`)**:
   - Tasks cannot share in-memory variables. Databricks provides `dbutils.jobs.taskValues.set(key, value)` and `get(taskKey, key)`.
   - Upstream tasks write small metadata scalars (batch IDs, processed row counts, anomalous flags); downstream tasks read them to direct business logic.

### Phase 2: Implementation & Code Artifacts
Below is a Python demonstration of passing dynamic task values and an exportable Databricks Workflow JSON DAG configuration.

```python
# Task 1: "extract_and_validate" notebook
processed_records = 154200
has_anomalies = True

# Publish metadata to taskValues key-value store
dbutils.jobs.taskValues.set(key="record_count", value=processed_records)
dbutils.jobs.taskValues.set(key="anomaly_detected", value=has_anomalies)
print("Metadata successfully published to taskValues.")
```

```python
# Task 2: "load_and_notify" downstream notebook
# Retrieve metadata published by the upstream task "extract_and_validate"
upstream_count = dbutils.jobs.taskValues.get(
    taskKey="extract_and_validate", 
    key="record_count", 
    default=0
)
anomaly_flag = dbutils.jobs.taskValues.get(
    taskKey="extract_and_validate", 
    key="anomaly_detected", 
    default=False
)

print(f"Downstream received: {upstream_count} records. Anomaly: {anomaly_flag}")
if anomaly_flag:
    # Trigger alert notification...
    pass
```

```json
{
  "name": "Enterprise_Customer_ETL_DAG",
  "tasks": [
    {
      "task_key": "extract_and_validate",
      "notebook_task": {
        "notebook_path": "/Workspace/ETL/extract_customers"
      },
      "job_cluster_key": "shared_etl_cluster"
    },
    {
      "task_key": "check_anomalies_branch",
      "depends_on": [{"task_key": "extract_and_validate"}],
      "condition_task": {
        "op": "EQUAL_TO",
        "left": "{{tasks.extract_and_validate.values.anomaly_detected}}",
        "right": "true"
      }
    },
    {
      "task_key": "quarantine_alert_task",
      "depends_on": [{"task_key": "check_anomalies_branch", "outcome": "true"}],
      "notebook_task": {
        "notebook_path": "/Workspace/Alerts/pagerduty_trigger"
      }
    }
  ]
}
```

### Phase 3: Production Gotchas & Failure Modes
- **taskValues Size Limit**: `taskValues` is designed strictly for scalar metadata, strings, and small JSON payloads (<48KB). Attempting to pass serialized DataFrames, large arrays, or multi-megabyte log dumps will throw a `TaskValueSizeExceededException`. Always persist large intermediate datasets to Delta staging tables and pass only table paths or partition keys via taskValues.
- **Shared Job Cluster Version Drift**: When multiple tasks share a single Job Cluster (`job_cluster_key`), Python package dependencies or Spark configurations installed by Task A can leak into Task B, causing non-deterministic library conflicts. Ensure shared job clusters use isolated environment containers or standardized cluster libraries.
- **Deadlock in Circular Task Dependencies**: While the Databricks UI blocks direct circular references, complex multi-branch DAGs with conditional tasks can create unreachable orphan states if "Run If" conditions are set incorrectly (e.g., waiting for `ALL_SUCCESS` when an upstream If/Else branch skipped a prerequisite task).
"""
    },

    # ── Item 18: Databricks Asset Bundles (DABs) & Enterprise CI/CD ──
    {
        "de_id": "de-new-arch-databricks-deep-024",
        "arch_id": "arch-databricks-deep-024",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Databricks Asset Bundles (DABs) & CI/CD Pipelines",
        "difficulty": "ARCHITECT",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "How do Databricks Asset Bundles (DABs) implement Infrastructure-as-Code (IaC) for Databricks Lakehouses, and how do you structure databricks.yml to automate multi-environment deployments via GitHub Actions or Azure DevOps?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Historically, deploying Databricks assets (notebooks, jobs, DLT pipelines, cluster policies) across environments involved manual UI exports, custom Python scripts using the REST API, or cumbersome Terraform modules that struggled to package project source code.

**Databricks Asset Bundles (DABs)** provide native Infrastructure-as-Code (IaC):
1. **Declarative Bundle Architecture**:
   - All lakehouse assets are declared as structured YAML files alongside application code in Git.
   - Core configuration file: `databricks.yml`.
   - Defines resources (multi-task jobs, pipelines, model serving endpoints) and target environments (`dev`, `staging`, `prod`).
2. **Environment Parameterization & Isolation**:
   - DABs cleanly parameterizes workspace URLs, root catalogs, cluster sizing, and Git branches per target.
   - In `dev`, jobs are deployed in development mode (`databricks bundle deploy -t dev`): runs are prefixed with the developer's username, schedules are paused, and code points to personal workspace folders.
   - In `prod`, jobs are deployed under service principal identities with active schedules and production Unity Catalog targets.
3. **CI/CD Integration**:
   - Validates configurations locally (`databricks bundle validate`).
   - GitHub Actions / Azure DevOps pipelines deploy code immutably upon pull request merge.

### Phase 2: Implementation & Code Artifacts
Below is a complete `databricks.yml` definition for a production multi-task pipeline and a GitHub Actions workflow.

```yaml
# databricks.yml
bundle:
  name: enterprise-customer-lakehouse

include:
  - resources/*.yml

targets:
  dev:
    mode: development
    default: true
    workspace:
      host: https://adb-dev-12345.azuredatabricks.net
    variables:
      catalog: dev_lakehouse
      cluster_node_type: Standard_D4ds_v5

  prod:
    mode: production
    workspace:
      host: https://adb-prod-67890.azuredatabricks.net
      root_path: /Shared/.bundle/${bundle.name}/${bundle.target}
    variables:
      catalog: prod_lakehouse
      cluster_node_type: Standard_D8ds_v5
    run_as:
      service_principal_name: 11112222-3333-4444-5555-666677778888

resources:
  jobs:
    customer_etl_job:
      name: "[${bundle.target}] Customer Ingestion & Enrichment"
      schedule:
        quartz_cron_expression: "0 0 2 * * ?"
        timezone_id: "UTC"
        pause_status: ${bundle.target == 'prod' ? 'UNPAUSED' : 'PAUSED'}
      tasks:
        - task_key: run_dlt_pipeline
          pipeline_task:
            pipeline_id: ${resources.pipelines.customer_dlt_pipeline.id}
```

```yaml
# .github/workflows/deploy.yml
name: Deploy Databricks Asset Bundle to Prod

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: databricks/setup-cli@v0.2
      
      - name: Validate Bundle
        run: databricks bundle validate -t prod
        env:
          DATABRICKS_HOST: ${{ secrets.DATABRICKS_PROD_HOST }}
          DATABRICKS_CLIENT_ID: ${{ secrets.SP_CLIENT_ID }}
          DATABRICKS_CLIENT_SECRET: ${{ secrets.SP_CLIENT_SECRET }}

      - name: Deploy to Production
        run: databricks bundle deploy -t prod
        env:
          DATABRICKS_HOST: ${{ secrets.DATABRICKS_PROD_HOST }}
          DATABRICKS_CLIENT_ID: ${{ secrets.SP_CLIENT_ID }}
          DATABRICKS_CLIENT_SECRET: ${{ secrets.SP_CLIENT_SECRET }}
```

### Phase 3: Production Gotchas & Failure Modes
- **Orphaned Resources on Rename**: If an asset key in `resources/` is renamed (e.g., from `customer_job` to `customer_etl_job`) and deployed without running `databricks bundle destroy` or checking state, DABs may create a brand-new job in Databricks while leaving the old job running on schedule, causing duplicate pipeline execution.
- **Accidental Developer Overwrite in Production**: If a developer runs `databricks bundle deploy -t prod` using their personal user token instead of a CI/CD service principal, the production job ownership transfers to that individual user. When that developer leaves the company or their Azure AD account is suspended, all production jobs fail with `InvalidTokenException`. Always enforce `run_as` with a Service Principal in production targets.
- **Locking & State Conflicts**: Concurrent CI/CD pipeline runs attempting to deploy the same bundle can create race conditions on the workspace asset state. Ensure CI/CD deployment jobs use sequential concurrency locks.
"""
    },

    # ── Item 19: Terraform Databricks Provider for Platform Engineering ──
    {
        "de_id": "de-new-arch-databricks-deep-025",
        "arch_id": "arch-databricks-deep-025",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Terraform Infrastructure as Code for Databricks",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "How do platform engineering teams use the Terraform Databricks provider to automate workspace bootstrapping, Unity Catalog metastores, cluster policies, and role-based permissions in code?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Manually configuring enterprise Databricks workspaces via the admin console leads to environment drift, unvetted security groups, untracked compute spending, and audit failures.

The **Databricks Terraform Provider** implements unified platform engineering across cloud infrastructure and lakehouse governance:
1. **Two-Level Provider Configuration**:
   - *Account-Level Provider*: Operates against `https://accounts.azuredatabricks.net` (or AWS/GCP account console). Manages account-level objects: Unity Catalog Metastore, Metastore-to-Workspace assignment, VPC peering, and Account Users/Groups.
   - *Workspace-Level Provider*: Operates against individual workspace URLs (`https://adb-*.azuredatabricks.net`). Manages catalogs, schemas, cluster policies, secret scopes, and notebook directories.
2. **State Management & Idempotency**:
   - Ensures that cluster policies, external storage credentials, and Unity Catalog RBAC grants are maintained in version-controlled Terraform state files (`.tfstate`).
   - Drift detection (`terraform plan`) catches unauthorized manual changes made in the Databricks UI and reverts them to the certified baseline.

### Phase 2: Implementation & Code Artifacts
Below is a Terraform HCL configuration establishing a standardized cluster policy and Unity Catalog permissions.

```hcl
# main.tf
terraform {
  required_providers {
    databricks = {
      source  = "databricks/databricks"
      version = "~> 1.30.0"
    }
  }
}

provider "databricks" {
  host = var.databricks_workspace_url
}

# 1. Standardized Cost-Governance Cluster Policy
resource "databricks_cluster_policy" "standard_engineering_policy" {
  name = "Enterprise-Cost-Controlled-Single-Node"
  definition = jsonencode({
    "autotermination_minutes": {
      "type": "fixed",
      "value": 20,
      "hidden": false
    },
    "spark_version": {
      "type": "regex",
      "pattern": "14\\.[0-9]+\\.x-scala2\\.12",
      "defaultValue": "14.3.x-scala2.12"
    },
    "node_type_id": {
      "type": "allowlist",
      "values": ["Standard_D4ds_v5", "Standard_D8ds_v5"],
      "defaultValue": "Standard_D4ds_v5"
    },
    "custom_tags.CostCenter": {
      "type": "fixed",
      "value": "DataEngineering-104",
      "hidden": false
    }
  })
}

# 2. Unity Catalog Schema and RBAC Grants
resource "databricks_catalog" "sandbox_catalog" {
  name         = "sandbox_analytics"
  comment      = "Managed via Terraform - Analytics Sandbox"
  isolation_mode = "OPEN"
}

resource "databricks_grants" "catalog_permissions" {
  catalog = databricks_catalog.sandbox_catalog.name

  grant {
    principal  = "data_engineers"
    privileges = ["USE_CATALOG", "CREATE_SCHEMA"]
  }

  grant {
    principal  = "bi_analysts"
    privileges = ["USE_CATALOG"]
  }
}
```

### Phase 3: Production Gotchas & Failure Modes
- **Provider Authentication Split**: Attempting to manage Account-level resources (e.g., `databricks_metastore`) and Workspace-level resources (e.g., `databricks_catalog`) in a single Terraform module without multiple aliased providers causes authentication crashes. Always separate Account bootstrap modules from Workspace config modules.
- **Destroying In-Use Catalogs**: Running `terraform destroy` on a `databricks_catalog` resource will fail if users have created non-empty schemas or tables inside it, unless `force_destroy = true` is configured. However, setting `force_destroy = true` in production risks accidental catastrophic data deletion.
- **Rate Limiting on Large Grant Matrices**: Applying granular `databricks_grants` across hundreds of tables and groups simultaneously can hit Databricks REST API rate limits, resulting in `429 Too Many Requests` during `terraform apply`. Use `parallelism = 5` in Terraform CI/CD runners.
"""
    },

    # ── Item 20: FinOps & DBU Cost Optimization in Databricks ──
    {
        "de_id": "de-new-arch-databricks-deep-026",
        "arch_id": "arch-databricks-deep-026",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Databricks FinOps, System Tables & Cost Optimization",
        "difficulty": "ARCHITECT",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "How do you design an enterprise FinOps observability framework in Databricks, analyze system tables (system.billing.usage), optimize serverless SQL warehouse scaling, and eliminate zombie cluster spend?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Databricks consumption costs are driven by two billing layers:
1. **Databricks Unit (DBU)**: The software consumption tier billed by Databricks per core-hour.
2. **Cloud Infrastructure**: Underlying VM, disk, and networking charges billed by Azure/AWS/GCP.

**FinOps Lakehouse Architecture**:
1. **Unity Catalog System Tables (`system.billing.usage`)**:
   - Unity Catalog automatically streams operational audit events and billing usage records into queryable system tables.
   - Contains exact record of every job, warehouse, notebook, and cluster: `workspace_id`, `cluster_id`, `sku_name`, `usage_quantity` (DBUs), and `custom_tags`.
2. **Zombie Compute Elimination**:
   - Interactive all-purpose clusters left running overnight by developers constitute up to 40% of wasted enterprise DBU spend.
   - Enforce mandatory Cluster Policies with `autotermination_minutes <= 20`.
   - Mandate automated job clusters (which cost 50% less DBUs than interactive clusters) for all scheduled workloads.
3. **Serverless SQL Warehouse Optimization**:
   - Serverless compute starts in 5–15 seconds and autoscales down to 0 after 1–5 minutes of inactivity.
   - Replacing 24/7 provisioned interactive clusters with Serverless SQL Warehouses eliminates idle VM and DBU charges completely.

### Phase 2: Implementation & Code Artifacts
Below is an enterprise FinOps SQL query analyzing DBU consumption by department, job, and compute SKU over the past 30 days.

```sql
-- FinOps Cost Allocation Query on Unity Catalog System Tables
SELECT 
  usage_date,
  coalesce(custom_tags['Department'], 'Unallocated') AS department,
  coalesce(custom_tags['Project'], 'General') AS project,
  sku_name,
  count(distinct entity_id) AS active_compute_instances,
  round(sum(usage_quantity), 2) AS total_dbus_consumed,
  -- Calculate estimated cost based on negotiated enterprise DBU rate ($0.30/DBU)
  round(sum(usage_quantity) * 0.30, 2) AS estimated_dbu_cost_usd
FROM system.billing.usage
WHERE usage_date >= current_date() - INTERVAL 30 DAYS
GROUP BY 
  usage_date,
  coalesce(custom_tags['Department'], 'Unallocated'),
  coalesce(custom_tags['Project'], 'General'),
  sku_name
ORDER BY total_dbus_consumed DESC;
```

```sql
-- Top 5 Most Expensive Databricks Automated Jobs Last Month
SELECT 
  usage_metadata.job_id,
  custom_tags['JobName'] AS job_name,
  round(sum(usage_quantity), 2) AS total_dbus,
  round(sum(usage_quantity) * 0.30, 2) AS estimated_cost_usd
FROM system.billing.usage
WHERE sku_name LIKE '%JOBS%'
  AND usage_date >= current_date() - INTERVAL 30 DAYS
GROUP BY 1, 2
ORDER BY total_dbus DESC
LIMIT 5;
```

### Phase 3: Production Gotchas & Failure Modes
- **Unallocated Spend via Missing Tags**: System tables extract tags from `custom_tags`. If cluster policies do not mandate tags, up to 60% of DBU usage will show up as `Unallocated`, preventing chargeback to business units. Enforce tag schemas in Cluster Policies via `"custom_tags.Department": { "type": "regex", "pattern": "..." }`.
- **Serverless SQL Warehouse Auto-Stop Pitfall**: Setting Serverless SQL auto-stop to 1 minute when BI tools (Power BI, Tableau) send heartbeats or queries every 65 seconds causes the warehouse to cycle down and up continuously. This introduces small startup latency spikes; tune auto-stop to 5–10 minutes for interactive BI usage.
- **Cross-Region Network Egress Traps**: System billing usage tables track DBUs, but DO NOT reflect cloud provider egress bandwidth fees. Cross-region queries or querying S3 buckets in another region can result in surprise cloud provider bandwidth bills that exceed the DBU compute charges!
"""
    }
]
