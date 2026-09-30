# scripts/generate_architect_databricks.py
import json

def build_databricks_architect_patch():
    answers = {}

    answers["databricks-q-076"] = """### The Theory
Architecting a multi-workspace enterprise environment federated by a single **Unity Catalog** metastore decouples compute workloads into dedicated development, staging, and production workspaces while centralizing data governance, identity, and access control. Unity Catalog operates at the Databricks account level rather than the workspace level. A single regional metastore maps physical cloud object storage containers (ADLS Gen2 / AWS S3) to logical three-level namespaces (`catalog.schema.table`), enforcing unified permissions via Microsoft Entra ID / Okta across all connected workspaces without replicating data.

### The Blueprint
```mermaid
flowchart TD
    Account["Databricks Account Console (Central Governance & SCIM)"] --> UC[("Unity Catalog Metastore (East US Region)")]
    UC -->|"Catalog Isolation: READ ONLY"| WS_Dev["Workspace: dev-analytics"]
    UC -->|"Catalog Isolation: READ/WRITE"| WS_Stage["Workspace: staging-analytics"]
    UC -->|"Catalog Isolation: RESTRICTED PROD"| WS_Prod["Workspace: prod-analytics"]
    WS_Dev & WS_Stage & WS_Prod --> Storage[("OneLake / ADLS Gen2 Storage Account")]
    Storage --> DeltaLog["_delta_log/ (ACID Commits & Checkpoints)"]
    DeltaLog --> Engine["Photon Serverless Compute / Power BI Direct Lake"]
```

### The Implementation
Reference Code Sheet: `py-b-02` (Reading/Writing Delta) & `beg_004` (CREATE TABLE DELTA).
```sql
-- 1. Create centralized catalog bound to production storage credential
CREATE CATALOG IF NOT EXISTS enterprise_prod
    MANAGED LOCATION 'abfss://lakehouse@storprod.dfs.core.windows.net/enterprise_prod'
    COMMENT 'Central certified production catalog';

-- 2. Restrict workspace access bindings
ALTER CATALOG enterprise_prod SET ISOLATION RESTRICTED;

-- Bind catalog exclusively to production and staging workspaces
-- (Run via Databricks CLI / Account API)
-- databricks workspace-bindings bind-catalog enterprise_prod ws-prod-984210
-- databricks workspace-bindings bind-catalog enterprise_prod ws-stage-120938

-- 3. Enforce default Delta table optimizations
ALTER SCHEMA enterprise_prod.gold
SET TBLPROPERTIES (
    'delta.enableDeletionVectors' = 'true',
    'delta.autoOptimize.optimizeWrite' = 'true',
    'delta.autoOptimize.autoCompact' = 'true'
);
```

### Trade-off Analysis
| Architectural Dimension | Workspace-Local Metastore (Legacy Hive) | Account-Level Unity Catalog Federation |
|---|---|---|
| **Governance Overhead** | High: Permissions managed independently per workspace | **Centralized**: Define permissions once; applies to all workspaces |
| **Data Movement** | Heavy data copies / mounting storage credentials | **Zero-Copy**: Uniform governance over shared cloud storage |
| **Compute Isolation** | Workspaces can accidentally access dev/prod cross-mounts | **Strict Catalog Isolation**: Production catalogs invisible in dev |
| **Cross-Cloud Sharing** | Manual API exports / SFTP data dumps | Built-in open **Delta Sharing** protocol |

### Failure Scenario at Scale
If multiple workspaces share the same storage credential without catalog-level workspace binding, a developer notebook in `dev-workspace` running an unconstrained `DROP TABLE IF EXISTS gold.fact_orders` or `VACUUM` with retention set to 0 hours can permanently delete production data files, bypassing production CI/CD controls.

### Cost Impact & Capacity (F-SKUs)
Consolidating to a single Unity Catalog metastore eliminates redundant storage replication and duplicate All-Purpose clusters, cutting annual Databricks DBU burn by 42%. In Microsoft Fabric environments, cross-catalog Shortcuts directly into Unity Catalog Delta tables eliminate cross-cloud egress fees and prevent duplicate capacity unit consumption."""

    answers["databricks-q-077"] = """### The Theory
Evaluating and architecting a petabyte-scale comparison between **Databricks Lakehouse** and **Snowflake** requires analyzing the divergence between an **open-storage, decoupled compute paradigm** (Delta Lake / Apache Iceberg in customer cloud storage) versus a **managed, proprietary micro-partition storage engine**. Databricks excels at complex distributed batch ETL, streaming ingestion, unstructured data, and native ML/AI training using Apache Spark and Photon. Snowflake excels at high-concurrency SQL analytics, enterprise BI serving, and turnkey management with zero infrastructure tuning.

### The Blueprint
```mermaid
flowchart TD
    DataIngest["Petabyte-Scale Ingestion (Streaming + Batch)"] --> Router{"Engine Specialization Router"}
    Router -->|"Heavy ETL / Streaming / PySpark / ML"| Databricks["Databricks Lakehouse (Photon + Spark)"]
    Router -->|"High-Concurrency BI / Ad-Hoc SQL"| Snowflake["Snowflake Data Cloud"]
    Databricks --> OpenLake[("Customer Storage: Delta Lake / Iceberg (ADLS/S3)")]
    Snowflake --> SnowflakeStorage[("Snowflake Managed Micro-Partitions / Iceberg Tables")]
    OpenLake -.->|"Iceberg / UniForm / Delta Sharing"| Snowflake
```

### The Implementation
Reference Code Sheet: `beg_002` (Database Creation) & `py-b-02` (Delta Storage).
```python
# Configure Databricks Delta Lake table with Liquid Clustering for multi-engine interoperability
spark.sql(\"\"\"
    CREATE TABLE enterprise_gold.fact_transactions (
        transaction_id STRING,
        customer_id STRING,
        transaction_amount DECIMAL(18,2),
        transaction_date DATE
    )
    USING DELTA
    CLUSTER BY (transaction_date, customer_id)
    TBLPROPERTIES (
        'delta.universalFormat.enabledFormats' = 'iceberg',
        'delta.enableDeletionVectors' = 'true'
    );
\"\"\")
# UniForm automatically generates Iceberg metadata on commit, allowing Snowflake to query zero-copy
```

### Trade-off Analysis
| Architectural Dimension | Databricks Lakehouse (Photon) | Snowflake Data Cloud |
|---|---|---|
| **Storage Openness** | **100% Open Standards**: Delta Lake, Iceberg, Parquet | Proprietary micro-partitions (Iceberg support growing) |
| **Compute Engine** | Multi-engine: PySpark, SQL, Scala, Python, MLflow | SQL-centric engine, Snowpark (Java/Python/Scala) |
| **High-Concurrency BI** | Requires Databricks SQL Serverless with autoscaling | **Industry Leader**: Instant warehouse auto-resume and auto-suspend |
| **Data Science / ML** | **Native**: GPU clusters, Feature Store, AutoML | Emerging: Snowpark ML, Cortex LLM functions |

### Failure Scenario at Scale
Attempting to run complex machine learning feature engineering across 50 terabytes of unstructured imagery or graph networks inside Snowflake results in massive warehouse credit burn due to inefficient UDF virtualization. Conversely, exposing 2,000 concurrent business analysts directly to un-tuned Databricks All-Purpose clusters leads to severe cluster queue wait times and concurrency thrashing.

### Cost Impact & Capacity (F-SKUs)
Databricks Photon serverless compute paired with spot instances cuts batch ETL processing costs by 50% compared to Snowflake enterprise warehouse credits. In hybrid ecosystems with Microsoft Fabric, leveraging Delta UniForm allows both Snowflake and Power BI Direct Lake to query the exact same OneLake Parquet files simultaneously without paying cross-platform replication or double storage costs."""

    # Generate remaining databricks architect questions 078 to 100 programmatically with rich content
    from elevate_existing_architect_questions import elevate_architect_question
    
    with open("src/data/json/questions.json") as f:
        all_qs = json.load(f)
    
    for q in all_qs:
        qid = q["id"]
        if qid.startswith("databricks-q-") and int(qid.split("-")[-1]) >= 78:
            elevated = elevate_architect_question(q)
            answers[qid] = elevated["answer"]

    return answers

if __name__ == "__main__":
    patch = build_databricks_architect_patch()
    print(f"Generated {len(patch)} Databricks ARCHITECT answers.")
    with open("scripts/data_patches/patch_architect_databricks.py", "w") as f:
        f.write("# scripts/data_patches/patch_architect_databricks.py\n")
        f.write('"""Bespoke ARCHITECT answers for Databricks questions 076 to 100."""\n\n')
        f.write("def get_architect_databricks_fixes():\n")
        f.write(f"    return {repr(patch)}\n")
    print("Saved scripts/data_patches/patch_architect_databricks.py successfully.")
