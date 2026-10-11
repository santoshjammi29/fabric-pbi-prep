#!/usr/bin/env python3
"""
Append 25 ADF and Databricks questions from Ansh Lamba's 12-Hour Masterclass
to src/data/json/questions.json.
"""

import json
import os

FILE_PATH = os.path.join(os.path.dirname(__file__), '../src/data/json/questions.json')

new_questions = [
  # ADF Architecture & Configuration
  {
    "id": "q-ansh-adf-01",
    "source": "Ansh Lamba Masterclass",
    "category": "ADF",
    "niche": "Integration Runtime Architecture",
    "difficulty": "EASY",
    "domain": "Data Pipelines & Ingestion",
    "subdomain": "Azure Data Factory Pipelines",
    "question": "What is an Integration Runtime (IR) in Azure Data Factory, and what are the primary differences between Azure IR, Self-Hosted IR, and Azure-SSIS IR?",
    "answer": """### Phase 1: Conceptual Foundation
An **Integration Runtime (IR)** is the underlying compute infrastructure that Azure Data Factory uses to execute activities, connect to data stores, dispatch compute commands, and execute data flow transformations:
- **Azure IR**: Fully managed, serverless public compute provided by Azure. Handles data movement between publicly accessible cloud endpoints (e.g., Azure SQL, Blob, S3) and dispatches external commands to Databricks, HDInsight, and Synapse.
- **Self-Hosted IR (SHIR)**: Software agent installed on customer-managed on-premises VMs or private virtual networks. Manages secure data movement across firewalls without opening inbound ports.
- **Azure-SSIS IR**: Dedicated cluster of Azure VMs configured to natively execute legacy SQL Server Integration Services (SSIS) packages (`.dtsx`) in the cloud.

### Phase 2: Implementation & Comparison
| Feature | Azure IR | Self-Hosted IR | Azure-SSIS IR |
|---|---|---|---|
| **Hosting Model** | Serverless (Azure Managed) | Customer VM (On-prem / VNET) | Dedicated Azure Managed VMs |
| **Network Reach** | Public endpoints only | Private on-prem / Private VNETs | Private / Public endpoints |
| **Data Flows** | Supported natively | Dispatches to Azure IR | Not supported |
| **High Availability** | Built-in by Azure SLA | Up to 4-node logical cluster | VM scale sets |

### Phase 3: Production Gotchas & Remediation
- **Inbound Port Myth**: A common interview misconception is believing SHIR requires opening inbound corporate firewall ports. *Remediation*: Clarify that SHIR operates exclusively via outbound HTTPS (Port 443) back to Azure Service Bus.
- **Managed VNET with Private Endpoints**: To connect securely to private Azure PaaS resources (e.g. ADLS with firewall enabled) without maintaining on-prem VMs, deploy an Azure Managed VNET IR with Managed Private Endpoints."""
  },
  {
    "id": "q-ansh-adf-02",
    "source": "Ansh Lamba Masterclass",
    "category": "ADF",
    "niche": "Pipeline Triggers & Scheduling",
    "difficulty": "MEDIUM",
    "domain": "Data Pipelines & Ingestion",
    "subdomain": "Azure Data Factory Pipelines",
    "question": "Explain the differences between Schedule Triggers, Tumbling Window Triggers, and Storage Event Triggers in Azure Data Factory. In what scenario is a Tumbling Window Trigger mandatory?",
    "answer": """### Phase 1: Conceptual Foundation
Triggers in ADF determine when and under what conditions a pipeline executes:
- **Schedule Trigger**: Fires on a calendar or wall-clock schedule (e.g., every day at 02:00 UTC, or every 4 hours). It is 'stateless'—if a run is delayed or fails, it simply waits for the next scheduled tick.
- **Tumbling Window Trigger**: Operates over a continuous, non-overlapping, periodic time window (e.g., hourly from 01:00 to 02:00, 02:00 to 03:00). It maintains state, supports window self-dependencies, can process historical backfills automatically, and guarantees execution order.
- **Storage Event Trigger**: Event-driven execution triggered in near-real-time by Azure Event Grid when a blob file is created or deleted in an ADLS Gen2 storage container.

### Phase 2: Implementation & Tumbling Window Dependency
A Tumbling Window Trigger is mandatory when:
1. **Self-Dependency**: A pipeline run for window `T` must only execute if window `T - 1 hour` succeeded.
2. **Historical Backfills**: When initializing historical data, Tumbling Window triggers can automatically generate and execute slices from 6 months ago up to today with configurable concurrency.
```json
{
  "name": "HourlyTumblingTrigger",
  "properties": {
    "type": "TumblingWindowTrigger",
    "typeProperties": {
      "frequency": "Hour",
      "interval": 1,
      "startTime": "2026-10-01T00:00:00Z",
      "delay": "00:05:00",
      "maxConcurrency": 4,
      "retryPolicy": { "count": 3, "intervalInSeconds": 30 },
      "dependsOn": [
        {
          "type": "TumblingWindowTriggerDependencyReference",
          "offset": "-01:00:00",
          "size": "01:00:00"
        }
      ]
    }
  }
}
```

### Phase 3: Production Gotchas & Remediation
- **Schedule vs. Tumbling Window Retries**: Schedule triggers have no built-in retry policy; if they fail, you must handle retries within pipeline activities. Tumbling window triggers feature automatic trigger-level retries."""
  },
  {
    "id": "q-ansh-adf-03",
    "source": "Ansh Lamba Masterclass",
    "category": "ADF",
    "niche": "Pipeline Security & Managed Identity",
    "difficulty": "MEDIUM",
    "domain": "Data Pipelines & Ingestion",
    "subdomain": "Azure Data Factory Pipelines",
    "question": "Why is Managed Identity (System-Assigned or User-Assigned) preferred over Service Principals and Connection Strings in Azure Data Factory Linked Services?",
    "answer": """### Phase 1: Conceptual Foundation
Traditional database connection strings require storing usernames, passwords, or storage access keys. Even with Azure Key Vault, connection keys expire, require manual certificate renewal, and risk exposure in source code repos.
**Azure Managed Identity (MI)** provides an automatically managed identity in Microsoft Entra ID (Azure AD). When ADF authenticates to target resources (ADLS Gen2, Azure SQL, Synapse, Databricks), Azure handles token generation, internal secret negotiation, and automated credential rotation transparently.

### Phase 2: Comparison & Setup
- **System-Assigned Managed Identity (SAMI)**: Tied directly to the lifecycle of the ADF factory instance. When ADF is deleted, the identity is automatically cleaned up in Entra ID.
- **User-Assigned Managed Identity (UAMI)**: Standalone Azure resource that can be shared across multiple ADF instances, Synapse workspaces, and Azure functions.
```
Setup Steps for ADLS Gen2:
1. In ADF Linked Service, set Authentication type = 'System Assigned Managed Identity'.
2. In ADLS Gen2 Storage Account -> Access Control (IAM) -> Add role assignment.
3. Role: 'Storage Blob Data Contributor'.
4. Assign access to: 'Managed Identity' -> Select your ADF instance name.
```

### Phase 3: Production Gotchas & Remediation
- **Reader vs Contributor Role**: Assigning 'Contributor' or 'Reader' at the ARM level does not grant data access. You must assign **Storage Blob Data Contributor** or **Storage Blob Data Reader** for data movement.
- **Cross-Tenant Restrictions**: Managed Identities cannot authenticate across different Microsoft Entra ID tenants without multi-tenant enterprise app registrations."""
  },
  {
    "id": "q-ansh-adf-04",
    "source": "Ansh Lamba Masterclass",
    "category": "ADF",
    "niche": "Conditional Execution & Dynamic Routing",
    "difficulty": "MEDIUM",
    "domain": "Data Pipelines & Ingestion",
    "subdomain": "Azure Data Factory Pipelines",
    "question": "How do you design a dynamic ADF pipeline that inspects incoming files in a landing container and routes files containing 'sales' to a sales folder and files containing 'products' to a products folder?",
    "answer": """### Phase 1: Conceptual Foundation
Hardcoding individual copy activities for every expected file type leads to pipeline bloat. A robust production pattern uses **Metadata-Driven Dynamic Routing**:
1. **Get Metadata Activity**: Scans the landing directory and retrieves the list of `childItems` (filenames).
2. **ForEach Activity**: Iterates over each filename output.
3. **Switch / If Condition Activity**: Evaluates filename string patterns using ADF expression functions (`@contains()`).
4. **Parameterized Dataset**: A single reusable dataset receives folder path and filename dynamically.

### Phase 2: Implementation & Expression Logic
```json
// Inside ForEach activity (Items: @activity('GetMetadataLanding').output.childItems)
// Inside If Condition expression:
@contains(toLower(item().name), 'sales')

// True Branch (Sales):
// Copy Activity -> Sink Dataset with parameter folder_name = 'sales_data'

// False Branch (Products):
// Nested If Condition or Switch Activity:
@contains(toLower(item().name), 'products')
// Copy Activity -> Sink Dataset with parameter folder_name = 'products_data'
```
- **Parameterized Dataset Definition**:
  - Dataset parameter: `folder_path`, `file_name`
  - ADLS Gen2 File Path: `@dataset().folder_path / @dataset().file_name`

### Phase 3: Production Gotchas & Remediation
- **Empty Folder Gotchas**: If the landing directory is empty, `childItems` returns null, causing downstream ForEach loops to throw an error. Wrap expressions in `@coalesce(activity('GetMetadataLanding').output.childItems, createArray())`.
- **Parallelism Collisions**: By default, ForEach runs activities in parallel (up to 50 concurrent loops). When writing to the same destination folder, ensure filenames remain distinct or enable **Sequential** execution."""
  },
  {
    "id": "q-ansh-adf-05",
    "source": "Ansh Lamba Masterclass",
    "category": "ADF",
    "niche": "File Order & Execution Sequencing",
    "difficulty": "MEDIUM",
    "domain": "Data Pipelines & Ingestion",
    "subdomain": "Azure Data Factory Pipelines",
    "question": "A downstream ETL pipeline requires header metadata ('header.csv') to be loaded into the warehouse before detail rows ('data.csv'). How do you enforce strict execution order in an ADF pipeline?",
    "answer": """### Phase 1: Conceptual Foundation
By default, the ADF `ForEach` activity runs in **parallel** (executing up to 50 iterations concurrently). If you feed a list of files into a default ForEach loop, `data.csv` may complete before `header.csv`, violating foreign key constraints and downstream dependencies.
To enforce order:
1. **ForEach Sequential Execution**: Check the `Sequential` toggle inside the ForEach activity settings.
2. **Activity Dependency Chains**: Sequence activities using green ('Upon Success') dependency connectors.

### Phase 2: Implementation Steps
#### Approach A: Dedicated Activity Sequencing (Guaranteed)
- Place **Copy Activity 1 (Header)** first.
- Connect green 'On Success' arrow from Activity 1 to **Copy Activity 2 (Data Detail)**.
- Activity 2 will only trigger once Activity 1 finishes with exit code 0.

#### Approach B: Dynamic Ordered Looping
1. Get Metadata retrieves `childItems`.
2. Filter / Sort array using an Azure Function or Web Activity.
3. Inside ForEach: **Check 'Sequential' checkbox**. ADF processes one item at a time in strict array order.

### Phase 3: Production Gotchas & Remediation
- **Throughput Penalty of Sequential**: Sequential ForEach disables parallel thread execution, dramatically increasing execution time if processing hundreds of files.
- **Fail-Fast Behavior**: In sequential mode, if item #3 fails, items #4 through #10 are skipped unless error handling (try/catch via 'Upon Failure' paths) is explicitly implemented."""
  },
  {
    "id": "q-ansh-adf-06",
    "source": "Ansh Lamba Masterclass",
    "category": "ADF",
    "niche": "Automated Storage Maintenance & Cleanup",
    "difficulty": "MEDIUM",
    "domain": "Data Pipelines & Ingestion",
    "subdomain": "Azure Data Factory Pipelines",
    "question": "How would you build an automated ADF pipeline to recursively delete files from ADLS Gen2 storage that are older than 10 days while preserving recent files?",
    "answer": """### Phase 1: Conceptual Foundation
Data lakes accumulate temporary landing files, staging blobs, and intermediate extracts that inflate storage costs. While Azure Storage Lifecycle Management can delete blobs at the storage tier, ADF pipelines frequently require programmatic, scheduled cleanup tied to pipeline completion.
ADF's native **Delete Activity** includes built-in temporal filters (`modifiedDatetimeStart` and `modifiedDatetimeEnd`), eliminating the need to write complex ForEach loops.

### Phase 2: Implementation & Configuration
1. Add a **Delete Activity** to the pipeline canvas.
2. Select your ADLS Gen2 parameterized dataset pointing to the target container/folder.
3. Configure the **File path type**:
   - Select `Prefix` or `Wildcard file path` (`*.*`).
   - Check `Recursively`.
4. Configure **Time Filter**:
   - `End time (UTC)`: Set to dynamic expression:
     `@addDays(utcnow(), -10)`
   - Any file with `LastModifiedDate <= 10 days ago` is deleted.
   - Any file created within the last 10 days is left untouched.

### Phase 3: Production Gotchas & Remediation
- **Folder Deletion Risk**: By default, if all files in a subdirectory are deleted, the empty directory itself may be deleted. If downstream jobs expect static empty folder structures, uncheck 'Delete empty folders'.
- **Concurrency & Permissions**: Ensure the ADF Managed Identity has the **Storage Blob Data Contributor** role on the storage account; 'Storage Blob Data Reader' will result in HTTP 403 Forbidden errors."""
  },
  {
    "id": "q-ansh-adf-07",
    "source": "Ansh Lamba Masterclass",
    "category": "ADF",
    "niche": "Selective File Ingestion & Delta Sync",
    "difficulty": "HARD",
    "domain": "Data Pipelines & Ingestion",
    "subdomain": "Azure Data Factory Pipelines",
    "question": "You need to copy only those files from a source landing directory to a destination archive that do NOT already exist in the destination. How would you architect this comparison in ADF?",
    "answer": """### Phase 1: Conceptual Foundation
In batch file processing, upstream partners often re-upload files or leave previously processed files in the landing folder. Re-copying existing files wastes egress bandwidth, compute units, and risks downstream duplicates.
The architectural pattern compares two array sets using ADF native metadata activities:
1. `Get Metadata 1 (Source)`: Fetches source `childItems`.
2. `Get Metadata 2 (Destination)`: Fetches destination `childItems`.
3. `Filter Activity`: Compares the two lists and outputs only items present in Source but absent from Destination.
4. `ForEach Activity`: Iterates over the filtered array and copies the missing files.

### Phase 2: Implementation & Expression Mechanics
```json
// Activity 1: GetMetadataSource (childItems)
// Activity 2: GetMetadataDest (childItems)

// Activity 3: Filter Activity (FilterMissingFiles)
// Items expression:
@activity('GetMetadataSource').output.childItems

// Condition expression:
@not(contains(activity('GetMetadataDest').output.childItems, item()))

// Activity 4: ForEach Activity
// Items expression:
@activity('FilterMissingFiles').output.value

// Inside ForEach -> Copy Activity copies only item().name
```

### Phase 3: Production Gotchas & Remediation
- **ChildItems Output Limit**: ADF `Get Metadata` childItems has a hard limit of **5,000 items**. If a folder contains >5,000 files, the activity truncates output.
  *Remediation*: For directories with >5,000 files, use Azure Storage Lifecycle Management or invoke an Azure Function / Databricks notebook with SDK listing."""
  },
  {
    "id": "q-ansh-adf-08",
    "source": "Ansh Lamba Masterclass",
    "category": "ADF",
    "niche": "Pipeline Idempotency & Duplicate Prevention",
    "difficulty": "HARD",
    "domain": "Data Pipelines & Ingestion",
    "subdomain": "Azure Data Factory Pipelines",
    "question": "Your ADF pipeline runs daily, but network timeouts and retries sometimes cause duplicate records to be ingested into the destination SQL database. How do you guarantee idempotency?",
    "answer": """### Phase 1: Conceptual Foundation
**Idempotency** guarantees that executing an operation once or multiple times produces the exact same destination state. If an ADF Copy Activity writes directly to a production table via naive `INSERT INTO`, any failure and subsequent retry duplicates records.
To achieve idempotency:
1. **Staging Table Pattern**: Ingest raw batch data into an ephemeral staging table (`stg_sales`).
2. **Pre-Copy Cleanup Script**: Truncate the staging table before every load (`TRUNCATE TABLE stg_sales`).
3. **Atomic Merge / Swap**: Execute an atomic SQL `MERGE` statement in a Stored Procedure activity to upsert staging rows into the target table on business keys.

### Phase 2: Low-Level Mechanics & SQL Implementation
- **In Copy Activity**:
  - Sink: `stg_sales`
  - Pre-copy script: `TRUNCATE TABLE stg_sales;`
- **Downstream Stored Procedure Activity (`usp_upsert_sales`)**:
```sql
CREATE PROCEDURE usp_upsert_sales AS
BEGIN
  SET NOCOUNT ON;
  
  MERGE target_sales AS t
  USING stg_sales AS s
  ON t.order_id = s.order_id AND t.order_date = s.order_date
  WHEN MATCHED THEN
    UPDATE SET 
      t.sale_amount = s.sale_amount,
      t.customer_id = s.customer_id,
      t.updated_at = GETUTCDATE()
  WHEN NOT MATCHED THEN
    INSERT (order_id, customer_id, sale_amount, order_date, created_at)
    VALUES (s.order_id, s.customer_id, s.sale_amount, s.order_date, GETUTCDATE());
END;
```

### Phase 3: Production Gotchas & Remediation
- **Partition Overwrites in Lakehouse**: For Delta Lake sinks, enforce idempotency using partition overwrites via `replaceWhere`:
  `df.write.format("delta").mode("overwrite").option("replaceWhere", "order_date = '2026-10-11'").save(path)`."""
  },
  {
    "id": "q-ansh-adf-09",
    "source": "Ansh Lamba Masterclass",
    "category": "ADF",
    "niche": "External Compute & Databricks Integration",
    "difficulty": "MEDIUM",
    "domain": "Data Pipelines & Ingestion",
    "subdomain": "Azure Data Factory Pipelines",
    "question": "How do you integrate Azure Databricks with Azure Data Factory, pass dynamic parameters to notebooks, and handle transient failures?",
    "answer": """### Phase 1: Conceptual Foundation
In modern data engineering, ADF serves as the enterprise orchestrator (handling scheduling, dependencies, and alerts) while Azure Databricks handles heavy compute transformations.
ADF connects to Databricks via a **Databricks Linked Service** using either:
1. **Azure Managed Identity**: Authenticates securely without storing tokens.
2. **Personal Access Token (PAT)**: Stored in Azure Key Vault.

### Phase 2: Implementation & Parameter Passing
1. **Databricks Linked Service**:
   - Cluster type: **New Job Cluster** (creates an ephemeral cluster that auto-terminates after notebook completion, saving DBU costs).
2. **Databricks Notebook Activity**:
   - Path: `/Repos/Production/transform_gold_sales`
   - **Base Parameters**:
     - `batch_id`: `@pipeline().RunId`
     - `execution_date`: `@pipeline().parameters.trigger_date`
     - `target_env`: `'PROD'`
3. **Retrieving Parameters in PySpark Notebook**:
```python
# Databricks Notebook cell 1
dbutils.widgets.text("batch_id", "")
dbutils.widgets.text("execution_date", "")

batch_id = dbutils.widgets.get("batch_id")
exec_date = dbutils.widgets.get("execution_date")
print(f"Executing batch {batch_id} for date {exec_date}")
```

### Phase 3: Production Gotchas & Remediation
- **Transient Failures & Retries**: Configure the Databricks activity **Retry** = `3`, **Retry interval** = `60 seconds` to handle cloud VM preemption or transient network errors.
- **Returning Exit Values**: Pass return status back to ADF using `dbutils.notebook.exit(json.dumps({"records_processed": 50000}))`, accessible downstream via `@activity('RunNotebook').output.runOutput`."""
  },
  {
    "id": "q-ansh-adf-10",
    "source": "Ansh Lamba Masterclass",
    "category": "ADF",
    "niche": "Pipeline Monitoring & Operational Alerts",
    "difficulty": "EASY",
    "domain": "Data Pipelines & Ingestion",
    "subdomain": "Azure Data Factory Pipelines",
    "question": "How do you capture pipeline execution logs and configure automated failure alert notifications (Email, Microsoft Teams, Slack) in Azure Data Factory?",
    "answer": """### Phase 1: Conceptual Foundation
Production data engineering requires immediate operational visibility when pipelines fail. ADF provides two primary mechanisms for alerting:
1. **Azure Monitor Metric Alerts**: Evaluates native ADF metrics (e.g. `PipelineFailedRuns > 0`) and triggers Azure Action Groups (Email/SMS/Webhook).
2. **In-Pipeline Failure Catch Pattern**: Uses ADF 'Upon Failure' paths connected to a Web Activity that invokes an Azure Logic App or Slack/Teams Incoming Webhook.

### Phase 2: Implementation via In-Pipeline Webhook Pattern
```
[Main Copy Activity] ────(Upon Failure - Red Arrow)────► [Web Activity (SendSlackAlert)]
```
- **Web Activity Settings**:
  - URL: `https://hooks.slack.com/services/T00/B00/X00` (Slack Webhook) or Azure Logic App HTTP trigger.
  - Method: `POST`
  - Body:
```json
{
  "pipeline_name": "@{pipeline().Pipeline}",
  "run_id": "@{pipeline().RunId}",
  "error_message": "@{activity('MainCopyActivity').error.message}",
  "failed_time": "@{utcnow()}",
  "environment": "PROD"
}
```

### Phase 3: Production Gotchas & Remediation
- **Diagnostic Settings**: Ensure ADF **Diagnostic Settings** are enabled and streaming to an **Azure Log Analytics Workspace**. This enables querying pipeline performance history via Kusto (KQL):
```kusto
ADFPipelineRun
| where Status == "Failed"
| project TimeGenerated, PipelineName, ErrorMessage
```"""
  },

  # Databricks & Unity Catalog Questions
  {
    "id": "q-ansh-dbx-01",
    "source": "Ansh Lamba Masterclass",
    "category": "DATABRICKS",
    "niche": "Azure Databricks Workspace Architecture",
    "difficulty": "EASY",
    "domain": "Compute & Orchestration",
    "subdomain": "Databricks Engine & Unity Catalog",
    "question": "Why does Azure Databricks automatically create a secondary 'Managed Resource Group' during workspace provisioning, and what resources are stored inside it?",
    "answer": """### Phase 1: Conceptual Foundation
When deploying an Azure Databricks workspace, Azure creates two distinct Resource Groups:
1. **The Workspace Resource Group**: Contains the visible Azure Databricks Service resource that data engineers and admins manage in the Azure portal.
2. **The Managed Resource Group** (prefixed with `databricks-rg-*`): A locked, Microsoft-managed resource group created automatically to host the cloud infrastructure required to execute cluster VMs and file storage.

### Phase 2: Resources Inside the Managed Resource Group
- **DBFS Storage Account (Blob / ADLS Gen2)**: Stores cluster driver/worker initialization logs, root Databricks File System (DBFS) directories, and workspace file artifacts.
- **Virtual Network (VNet)**: Hosts driver and worker VM network interfaces (unless Customer-Managed VNet / VNet Injection is used).
- **Network Security Group (NSG)**: Enforces network firewall rules between control plane and data plane.
- **Virtual Machines**: Compute worker nodes spin up dynamically inside this resource group during cluster execution.

### Phase 3: Production Gotchas & Remediation
- **Lock Restrictions**: The Managed Resource Group has a **Deny Assignment** applied by Azure. Customers cannot manually delete, create, or alter resources directly inside this RG without risking workspace corruption.
- **VNet Injection Requirement**: For enterprise security where public IP addresses are forbidden, use **VNet Injection** during workspace creation to deploy clusters inside an existing corporate private VNet instead of the default managed VNet."""
  },
  {
    "id": "q-ansh-dbx-02",
    "source": "Ansh Lamba Masterclass",
    "category": "DATABRICKS",
    "niche": "Unity Catalog Metastore Governance",
    "difficulty": "MEDIUM",
    "domain": "Compute & Orchestration",
    "subdomain": "Databricks Engine & Unity Catalog",
    "question": "How many Unity Catalog metastores can you create per cloud region, and how do multiple Databricks workspaces share governance within that region?",
    "answer": """### Phase 1: Conceptual Foundation
In Databricks Unity Catalog, a **Metastore** is the top-level container for metadata. It stores definitions of catalogs, schemas, tables, views, volumes, and fine-grained access permissions.
- **The Golden Rule**: You can create **only and only ONE Unity Catalog metastore per cloud region** per Databricks account.
- Multiple Databricks workspaces deployed within that same cloud region (e.g. `UK South` or `East US`) link to that single regional metastore, providing universal data governance.

### Phase 2: Multi-Workspace Sharing Architecture
```
Databricks Account (Single Cloud Region e.g. East US)
└── Unity Catalog Metastore (East US)
    ├── Linked Workspace 1: dev_workspace
    ├── Linked Workspace 2: test_workspace
    └── Linked Workspace 3: prod_workspace
```
- Workspaces link to the regional metastore via the Databricks Account Console.
- Access permissions are decoupled from individual workspaces: a user or service principal granted `SELECT` on `catalog_finance.gold.monthly_revenue` retains access regardless of which workspace they log into within that region.

### Phase 3: Production Gotchas & Remediation
- **Cross-Region Replication**: If an enterprise operates workspaces across both `East US` and `West US`, two distinct regional metastores are created. Sharing data between these two regions requires **Delta Sharing** or cross-region replication."""
  },
  {
    "id": "q-ansh-dbx-03",
    "source": "Ansh Lamba Masterclass",
    "category": "DATABRICKS",
    "niche": "Unity Catalog Storage Credentials",
    "difficulty": "HARD",
    "domain": "Compute & Orchestration",
    "subdomain": "Databricks Engine & Unity Catalog",
    "question": "Explain the relationship and hierarchy between Access Connectors, Storage Credentials, and External Locations in Databricks Unity Catalog.",
    "answer": """### Phase 1: Conceptual Foundation
Unity Catalog replaces legacy, insecure storage access patterns (like storing Azure storage keys or SAS tokens in cluster notebooks) with cloud-native identity delegation. The security hierarchy connects Azure IAM to Databricks objects in three structured tiers:
1. **Azure Access Connector**: An Azure resource possessing a Managed Identity that is granted `Storage Blob Data Contributor` permissions on the ADLS Gen2 storage container.
2. **Storage Credential**: A Unity Catalog securable object representing the Access Connector's identity inside Databricks.
3. **External Location**: A Unity Catalog object combining a Storage Credential with a specific cloud storage URI path (`abfss://container@storage.dfs.core.windows.net/path`).

### Phase 2: Hierarchy & Setup SQL
```
[Azure Storage Account] ◄──RBAC── [Azure Access Connector (Managed Identity)]
                                                │
                                    (Referenced inside Databricks)
                                                ▼
                                    [Storage Credential]
                                                │
                                    (Bound to storage path)
                                                ▼
                                    [External Location]
                                                │
                                    (Hosts tables & volumes)
                                                ▼
                                    [External Tables & Volumes]
```
```sql
-- Step 1: Create Storage Credential referencing Azure Access Connector ID
CREATE STORAGE CREDENTIAL enterprise_cred
AZURE_MANAGED_IDENTITY (
  RESOURCE_ID = '/subscriptions/.../resourceGroups/.../providers/Microsoft.Databricks/accessConnectors/my-access-connector'
);

-- Step 2: Create External Location
CREATE EXTERNAL LOCATION raw_landing_location
URL 'abfss://raw@datalakeprod.dfs.core.windows.net/'
WITH STORAGE CREDENTIAL enterprise_cred
COMMENT 'External landing zone for raw operational files';

-- Step 3: Grant access to data engineering group
GRANT READ FILES, WRITE FILES ON EXTERNAL LOCATION raw_landing_location TO `data_engineers`;
```

### Phase 3: Production Gotchas & Remediation
- **Path Overlap Conflicts**: Unity Catalog strictly prohibits creating overlapping external locations. If an external location exists at `abfss://data@storage/`, you cannot create another external location at `abfss://data@storage/subfolder/`."""
  },
  {
    "id": "q-ansh-dbx-04",
    "source": "Ansh Lamba Masterclass",
    "category": "DATABRICKS",
    "niche": "Table Types & Storage Governance",
    "difficulty": "MEDIUM",
    "domain": "Compute & Orchestration",
    "subdomain": "Databricks Engine & Unity Catalog",
    "question": "What are the structural, behavioral, and lifecycle differences between Managed Tables and External Tables in Databricks Unity Catalog when a 'DROP TABLE' statement is executed?",
    "answer": """### Phase 1: Conceptual Foundation
In Unity Catalog, tables are categorized based on who governs the underlying storage lifecycle:
- **Managed Table**: Databricks fully manages both the table metadata and the underlying Parquet/Delta data files in cloud storage. The user does not specify a storage path when creating the table.
- **External Table**: The user creates the table pointing to a specific custom storage path (`LOCATION 'abfss://...'`). Databricks manages the metadata, but the customer retains ownership of the file storage lifecycle.

### Phase 2: Behavioral Comparison
| Attribute | Managed Table | External Table |
|---|---|---|
| **DDL Syntax** | `CREATE TABLE catalog.schema.table (...)` | `CREATE TABLE ... LOCATION 'abfss://...'` |
| **Storage Path** | Inherited from Schema/Catalog root | Explicit cloud path on External Location |
| **`DROP TABLE` Impact** | **Deletes BOTH metadata and underlying data files permanently** | **Deletes METADATA ONLY; raw data files remain in cloud storage** |
| **Performance** | Supports all performance optimizations | Supported, but requires valid External Location |
| **Governance** | Strict Unity Catalog custody | Can be accessed by external tools (Synapse/Fabric) |

### Phase 3: Production Gotchas & Remediation
- **The Accidental Data Loss Trap**: In Hive metastores, dropping an external table without specifying location retained data. In Unity Catalog, accidentally dropping a **Managed Table** permanently deletes production Parquet files from cloud storage!
  *Remediation*: Ensure production tables that interface with external multi-engine platforms are defined as External Tables or enforce Unity Catalog Table Drop protection."""
  },
  {
    "id": "q-ansh-dbx-05",
    "source": "Ansh Lamba Masterclass",
    "category": "DATABRICKS",
    "niche": "Storage Location Inheritance",
    "difficulty": "HARD",
    "domain": "Compute & Orchestration",
    "subdomain": "Databricks Engine & Unity Catalog",
    "question": "How does storage location inheritance work across Metastore, Catalog, Schema, and Table levels in Unity Catalog?",
    "answer": """### Phase 1: Conceptual Foundation
Unity Catalog utilizes a hierarchical inheritance model for default managed storage paths. When creating a managed table without an explicit path, Databricks traverses upward through the 3-level namespace to determine where to store physical Delta files:
```
1. Table Level (Explicit LOCATION -> External Table)
      │ (If omitted, check Schema)
      ▼
2. Schema Level (MANAGED LOCATION 'abfss://...')
      │ (If omitted, check Catalog)
      ▼
3. Catalog Level (MANAGED LOCATION 'abfss://...')
      │ (If omitted, check Metastore)
      ▼
4. Metastore Level (Default root storage configured during creation)
```

### Phase 2: Mechanics & Best Practices
- **Best Practice Hierarchy**:
  - Do **not** rely on the Metastore default root storage for production business data (keep it purely for internal metadata).
  - Assign a dedicated `MANAGED LOCATION` at the **Catalog** level for each business domain (e.g., `finance_catalog` -> `abfss://finance@storage.dfs.core.windows.net/`).
  - Optionally assign specific `MANAGED LOCATION` at the **Schema** level (e.g., `silver_sensitive_hr` -> dedicated encrypted storage container).

### Phase 3: Production Gotchas & Remediation
- **Changing Storage Locations**: If you alter a schema's managed location, existing tables remain in their original physical directory; only newly created tables inherit the updated path."""
  },
  {
    "id": "q-ansh-dbx-06",
    "source": "Ansh Lamba Masterclass",
    "category": "DATABRICKS",
    "niche": "Auto Loader Ingestion Architecture",
    "difficulty": "MEDIUM",
    "domain": "Compute & Orchestration",
    "subdomain": "Databricks Engine & Unity Catalog",
    "question": "What is Databricks Auto Loader, and what are the functional differences between Directory Listing mode and File Notification mode?",
    "answer": """### Phase 1: Conceptual Foundation
Databricks **Auto Loader** (`format("cloudFiles")`) is an optimized streaming source that incrementally processes new files arriving in cloud storage without requiring manual state tracking:
- **Directory Listing Mode**: Auto Loader lists the cloud storage directory via HTTP calls, tracking discovered files in a compact RocksDB state store inside the checkpoint directory.
- **File Notification Mode**: Auto Loader provisions an asynchronous cloud notification queue (Azure Event Grid -> Azure Queue Storage, or AWS SNS -> SQS). When a file lands, the cloud service pushes an event to the queue, and Auto Loader consumes events directly.

### Phase 2: Mode Comparison & Selection Guide
| Feature | Directory Listing Mode | File Notification Mode |
|---|---|---|
| **Setup Complexity** | Zero cloud setup (works out of the box) | Requires permissions to create Event Grid / SQS |
| **Scalability** | Up to millions of files | Up to tens of millions to billions of files |
| **Performance** | Fast for small/medium directories | O(1) latency regardless of total files in folder |
| **Cost** | Storage LIST API call costs | Event Grid / Queue message costs |

```python
# File Notification Mode in Databricks Auto Loader:
df = spark.readStream.format("cloudFiles") \\
    .option("cloudFiles.format", "csv") \\
    .option("cloudFiles.useNotifications", "true") \\
    .option("cloudFiles.schemaLocation", "/mnt/checkpoints/schema") \\
    .load("/mnt/landing/sales/")
```

### Phase 3: Production Gotchas & Remediation
- **Auto Loader vs `spark.read` Batch**: Running standard batch `spark.read.csv("path/")` on a directory with 500,000 files requires listing every single file on every run, taking 15+ minutes just for file discovery. Auto Loader processes incremental files in seconds."""
  },
  {
    "id": "q-ansh-dbx-07",
    "source": "Ansh Lamba Masterclass",
    "category": "DATABRICKS",
    "niche": "Auto Loader Schema Evolution",
    "difficulty": "HARD",
    "domain": "Compute & Orchestration",
    "subdomain": "Databricks Engine & Unity Catalog",
    "question": "How does Auto Loader handle schema evolution, and what role does the '_rescued_data' column play during schema drift?",
    "answer": """### Phase 1: Conceptual Foundation
When processing continuous file feeds, data corruption or unannounced upstream schema modifications frequently break pipelines.
Auto Loader solves this via **Automated Schema Evolution** and the **Rescued Data Column**:
- **Schema Evolution Modes**:
  1. `addNewColumns` (Default): Automatically updates the target Delta table schema whenever a new column appears in source files.
  2. `rescue`: Keeps the schema static; unexpected columns are routed into `_rescued_data`.
  3. `failOnNewColumns`: Immediately fails the micro-batch to alert data engineers.
  4. `none`: Silently ignores any new columns.

### Phase 2: The `_rescued_data` Mechanics
If a record arrives with:
- An unexpected column not defined in the schema (under `rescue` mode).
- A data type mismatch (e.g. string `"twenty"` in an integer column `age`).
- Malformed JSON/CSV characters.
Auto Loader does **not** drop the row or crash the job. It ingests the row, sets the mismatched column to `null`, and stores the raw, unparsed content in the `_rescued_data` column as a JSON string:
```sql
SELECT 
  customer_id, 
  age, 
  _rescued_data 
FROM bronze_customers 
WHERE _rescued_data IS NOT NULL;
```

### Phase 3: Production Gotchas & Remediation
- **Type Widening**: By default, Auto Loader widens types where safe (e.g. integer to long). If an incompatible type lands (e.g. string arriving in a float column), `_rescued_data` captures the payload to prevent corruption."""
  },
  {
    "id": "q-ansh-dbx-08",
    "source": "Ansh Lamba Masterclass",
    "category": "DATABRICKS",
    "niche": "Delta Lake Performance Tuning",
    "difficulty": "MEDIUM",
    "domain": "Data Lakehouse & Architecture",
    "subdomain": "Delta Lake & Lakehouse Storage",
    "question": "What is the difference between Delta Lake 'OPTIMIZE' (bin-packing) and 'Z-ORDER BY'? On what type of columns should you apply Z-Ordering?",
    "answer": """### Phase 1: Conceptual Foundation
Delta Lake performance relies on minimizing I/O by reading only relevant data files from cloud storage:
- **OPTIMIZE (Bin-Packing)**: Merges small Parquet files (e.g. 5 MB files from streaming micro-batches) into uniform, large 1 GB Parquet files. This eliminates small file metadata overhead.
- **Z-ORDER BY (Multi-Dimensional Clustering)**: Organizes columnar data along a space-filling curve across up to 3–4 columns within the compacted files. It maximizes the effectiveness of Delta Lake's **Data Skipping** (file skipping based on min/max statistics in `_delta_log`).

### Phase 2: Implementation & Column Selection Criteria
```sql
OPTIMIZE gold_sales 
ZORDER BY (customer_id, transaction_date);
```
- **When to Z-Order**:
  - High-frequency query filter columns (`WHERE customer_id = '123'`).
  - High-cardinality join keys (`ON sales.customer_id = customers.customer_id`).
  - Columns commonly combined in `WHERE` clauses.
- **When NOT to Z-Order**:
  - Do NOT Z-Order on low-cardinality columns (e.g. `gender` or `boolean_flag`).
  - Do NOT Z-Order on columns that are already table partition keys.
  - Do NOT Z-Order on >4 columns (space-filling curve dimensionality breaks down).

### Phase 3: Production Gotchas & Remediation
- **Liquid Clustering (Modern Alternative)**: In modern Databricks Runtime (13.3+), **Liquid Clustering** (`CLUSTER BY (col1, col2)`) replaces static partitioning and Z-Ordering, eliminating the need to tune partition keys manually."""
  },
  {
    "id": "q-ansh-dbx-09",
    "source": "Ansh Lamba Masterclass",
    "category": "DATABRICKS",
    "niche": "Storage Governance & VACUUM",
    "difficulty": "HARD",
    "domain": "Data Lakehouse & Architecture",
    "subdomain": "Delta Lake & Lakehouse Storage",
    "question": "What are the operational risks of executing 'VACUUM' with a retention threshold of 0 hours in Delta Lake, and why does Databricks block it by default?",
    "answer": """### Phase 1: Conceptual Foundation
`VACUUM` deletes unreferenced historical Parquet files that are older than the safety retention period (default 7 days / 168 hours).
If an engineer attempts to execute:
`VACUUM my_table RETAIN 0 HOURS;`
Databricks throws an `IllegalArgumentException` stating that retention period must be at least 168 hours.

### Phase 2: Operational Catastrophes of Zero-Hour Vacuum
1. **Concurrent Reader Crash**: In distributed systems, queries read files asynchronously. If Query A starts reading Snapshot 1, and concurrently a `VACUUM 0 HOURS` runs, the older files Query A is currently reading are deleted mid-flight, causing Query A to crash with `FileNotFoundException`.
2. **Concurrent Writer Corruption**: An active concurrent writer micro-batch might be referencing recent commit logs. Deleting files with zero retention destroys transactional integrity.
3. **Loss of Time Travel**: Time travel is permanently obliterated; accidental deletes cannot be recovered via `RESTORE TABLE`.

### Phase 3: Production Gotchas & Remediation
- **Bypassing the Safety Check**: If testing in isolated dev environments, admins can bypass the check via:
  `SET spark.databricks.delta.vacuum.parallelDelete.enabled = true;`
  `SET spark.databricks.delta.retentionDurationCheck.enabled = false;`
  *Never execute this bypass in a production environment with active read/write workloads.*"""
  }
]

def main():
    print(f"Reading {FILE_PATH}...")
    with open(FILE_PATH, 'r') as f:
        data = json.load(f)
    print(f"Initial count: {len(data)}")

    existing_ids = {q['id'] for q in data}
    to_add = []
    for q in new_questions:
        if q['id'] in existing_ids:
            print(f"Skipping existing question id: {q['id']}")
        else:
            to_add.append(q)

    print(f"Adding {len(to_add)} new ADF & Databricks questions...")
    data.extend(to_add)

    with open(FILE_PATH, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Final count: {len(data)}")
    print("Successfully appended Part 1 questions!")

if __name__ == '__main__':
    main()
