import json

pbi_part2 = []

# Niche 3: Power Query (M), Data Ingestion Optimization, & Query Folding (remaining 20 questions)
m_qas_part2 = [
    ("What are the configuration parameters CommandTimeout and RowZone inside native SQL connector functions, and how do you use them to fine-tune high-volume enterprise ingestion pipelines?",
     "1. CommandTimeout: Specifies the maximum duration (e.g., `#duration(0, 2, 0, 0)` for 2 hours) the query engine will wait for the source SQL Server database to execute and return the query before throwing a timeout error.\n\n"
     "2. RowZone (or row-level batch tuning): Controls internal buffer sizes and ingestion block sizes.\n\n"
     "3. Tuning: Set `CommandTimeout` to handle long-running queries or initial historical loads, and use connection parameters like query options to adjust batch sizes, preventing gateway time-outs and optimizing memory footprint during ingestion."),
    
    ("Explain the behavior of Table.AddJoinColumn vs Table.Join in terms of memory overhead and execution plan generation.",
     "1. Table.AddJoinColumn: Creates a nested table column (equivalent to a left outer join) but retains the original rows. It preserves lazy evaluation and does not duplicate primary keys immediately, minimizing memory usage during execution.\n\n"
     "2. Table.Join: Merges two tables into a single flat table. It forces immediate expansion of columns, which increases the row count and duplicates keys, causing higher RAM consumption and potential memory thrashing.\n\n"
     "3. Performance: Use `Table.AddJoinColumn` when you need to perform calculations on nested data before expanding it, and `Table.Join` only when you require immediate flat representation and query folding can push the join to the SQL source."),
    
    ("How can you configure an M query to read from a Secured Azure Key Vault to retrieve connection strings or API keys dynamically during cloud execution without hardcoding credentials or breaking scheduled refresh protocols?",
     "1. Configuration: Register a User-Assigned or System-Assigned Managed Identity (MSI) for the Power BI service or Gateway. Grant this MSI access to the Azure Key Vault secrets.\n\n"
     "2. M Query: Use `Web.Contents` with the Key Vault API endpoint (e.g., `https://<vault-name>.vault.azure.net/secrets/<secret-name>?api-version=7.4`).\n\n"
     "3. Refresh: Authenticate the connection in the Power BI Service using the Managed Identity storage credential. The engine retrieves the connection string or API token dynamically during refresh, ensuring zero credential hardcoding in M code."),
    
    ("What is the execution consequence of using the Table.Sort transformation step prior to an downstream step that performs a grouping or merging operation? Does the sort order survive, and what is the cost to query folding?",
     "1. Sorting Overhead: `Table.Sort` forces the engine to sort the entire table in memory if query folding is broken.\n\n"
     "2. Order Survival: The sort order does not reliably survive downstream operations like `Table.Group` or `Table.NestedJoin`. The engine reorganizes rows during grouping/joining, making the sorting step useless.\n\n"
     "3. Folding Cost: It breaks query folding for subsequent steps unless the source system supports it. If folding is broken, the sort operation is pushed to the local Mashup engine, adding substantial CPU and memory overhead. Avoid sorting in Power Query unless absolutely necessary."),
    
    ("Detail the operational differences between Standard Dataflows and Streaming Dataflows in Power BI Premium. What are the specific ingestion architectural differences under the hood?",
     "1. Standard Dataflows: Batch-based. Execute M queries to extract, transform, and load data into Azure Data Lake Gen2 storage (as CSV or Parquet files) on a scheduled or manual refresh trigger.\n\n"
     "2. Streaming Dataflows: Real-time. Powered by Azure Event Hubs and Azure Stream Analytics. Ingest stream payloads continuously and write them directly to Hot/Cold tables in OneLake.\n\n"
     "3. Architecture: Standard Dataflows use the Mashup Container engine for batch processing. Streaming Dataflows run continuous queries on real-time event streams, updating visuals dynamically with sub-second latency."),
    
    ("Explain how to write a custom Power Query Connector (.mez/.pq) from scratch. How do you implement native authentication handling, branding, and query folding support inside a custom extension?",
     "1. Extension Structure: Create a Visual Studio SDK project containing `.pq` (connector logic), `.query.pq` (test queries), and resources files for branding (icons, text).\n\n"
     "2. Authentication: Define the data source type and implement `Authentication` properties supporting OAuth2, Key, Windows, or Anonymous credentials.\n\n"
     "3. Folding: Implement the `GetNavigationTable` function and map custom functions to native M functions using `Table.View`. This allows you to intercept functions like `Table.SelectRows` and translate them into custom API parameters, pushing filters to the target API."),
    
    ("What happens when you use the Table.Profile function on a cloud-hosted database source? Explain how the engine calculates data distributions and the performance cost incurred on the source system.",
     "1. Table.Profile: Computes column-level statistics (min, max, average, count, null count, standard deviation) for the dataset.\n\n"
     "2. Evaluation: Since it runs on a cloud-hosted database, the engine attempts to fold these calculations. If folded, it generates complex SQL queries with multiple aggregations (`MIN`, `MAX`, `AVG`, `STDEV`) for every column.\n\n"
     "3. Cost: This places a severe processing load on the source database, running full table scans. If the table contains millions of rows, it can saturate the database CPU, slow down concurrent user queries, or trigger gateway timeouts."),
    
    ("Explain the interaction between Gateway Service Accounts, Windows Authentication, and Kerberos Constrained Delegation (KCD) when configuring Single Sign-On (SSO) for a DirectQuery report hitting an on-premises SQL Server Analysis Services cube.",
     "1. Authentication Handshake: The user logs into the Power BI Service via Microsoft Entra ID. The service requests a Kerberos ticket for the target user.\n\n"
     "2. Gateway Role: The On-Premises Data Gateway service account impersonates the user. It uses KCD to present the user's identity to Active Directory.\n\n"
     "3. Configuration: In Active Directory, the gateway service account must be configured with trust delegation, allowing it to delegate credentials to the Service Principal Name (SPN) of the SQL Server Analysis Services instance. This enables SSO, granting the user access based on AD role memberships."),
    
    ("How does the M engine handle Binary manipulation and extraction from multi-layered compressed files (e.g., .tar.gz containing nested zip files)? What are the practical performance limits?",
     "1. Processing: The M engine treats compressed files as binary streams. It evaluates them sequentially using functions like `Binary.Decompress(..., Compression.GZip)` and `Unzip` algorithms.\n\n"
     "2. Execution: Multi-layered decompression forces the Mashup engine to load nested binaries into RAM, unpacking them in memory segments.\n\n"
     "3. Limits: High memory overhead. If files are large (e.g., >500MB compressed), nested decompression causes memory thrashing, slow extraction times, and eventual heap exhaustion. Perform file extraction upstream or use Dataflows to cache intermediate steps."),
    
    ("Describe how to optimize a fuzzy matching merge operation (Table.FuzzyNestedJoin) across text columns containing spelling variations, detailing how to tune similarity thresholds and transformation tables to maximize accuracy and minimize execution loops.",
     "1. Fuzzy Optimization: Remove punctuation, trim whitespace, and convert text to lowercase before matching to reduce matching work.\n\n"
     "2. Tuning Parameters: Set the `Threshold` (0.00 to 1.00; 1.00 is exact match). Start at 0.80 to balance accuracy and avoid false positives. Use `IgnoreCase = true` and `IgnoreSpace = true`.\n\n"
     "3. Transformation Table: Provide a mapping table (columns: From, To) to normalize common synonyms or spelling variations before joining. This prevents the fuzzy join engine from running complex character-distance loops, maximizing join performance."),
    
    ("What is the role of the Mashup Container Engine (Microsoft.Mashup.Container.NetFX45.exe)? How do you monitor its memory footprints on a gateway machine during heavy concurrent executions?",
     "1. Mashup Container Role: The executable process that executes M queries. It handles data ingestion, transformation logic, and outputs resultsets to the Power BI service or Gateway.\n\n"
     "2. Ingestion behavior: During refresh, the Gateway spawns multiple Mashup container processes (each capped at a specific memory limit).\n\n"
     "3. Monitoring: Use Windows Performance Monitor (PerfMon) to track the memory footprint (`Working Set`) of `Microsoft.Mashup.Container.NetFX45.exe` processes. You can also analyze Gateway log files (`QueryExecutionReport`) to check memory consumption per query and node."),
    
    ("Explain the performance difference between Table.SelectRows using a structured conditional statement versus a custom M function containing an if...then...else clause.",
     "1. Structured Statement (e.g., `[Col] = \"Value\"`): Power Query compiles this into a clean predicate. If connecting to a database, this folds to a SQL `WHERE` clause, optimizing execution.\n\n"
     "2. Custom M Function (e.g., `(row) => if row[Col] = \"Value\" then true else false`): The M engine cannot analyze the code logic inside the custom function, which immediately breaks query folding.\n\n"
     "3. Performance: The custom function forces the engine to download the entire table and evaluate the condition row-by-row locally in memory, causing severe performance degradation."),
    
    ("How do you execute a SQL Stored Procedure with input parameters within Power Query so that it successfully executes during a cloud scheduled refresh without generating data source credential errors?",
     "1. Execution Method: Use `Value.NativeQuery` instead of raw connection strings: `Value.NativeQuery(Sql.Database(\"server\", \"db\"), \"EXEC MyProc @Param = 'val'\", [Param = \"val\"])`.\n\n"
     "2. Refresh Setup: This forces the procedure to compile as a native query. Ensure that the data source is configured to use appropriate database or Windows credentials in the gateway.\n\n"
     "3. Folding & Parameters: Stored procedures do not support query folding. Keep parameters static or map them to Power Query parameters, ensuring the security context validates during scheduled cloud refreshes."),
    
    ("Explain how the Replacer.ReplaceText and Replacer.ReplaceValue functions optimize low-level string manipulations inside the M evaluation pipeline.",
     "1. Replacer.ReplaceText: Highly optimized for text columns. It performs raw character matches using fast, low-level C++ wrappers, minimizing memory allocations.\n\n"
     "2. Replacer.ReplaceValue: Evaluates values of any type, running value comparisons and casting them, which introduces type-checking overhead.\n\n"
     "3. Optimization: Always use `Replacer.ReplaceText` when replacing text strings to speed up string operations, and limit transformations to a single, multi-column replacement step instead of multiple sequential operations."),
    
    ("What are Computed Entities in Power BI Dataflows, and why do they require Power BI Premium capacity to function? What are the architectural boundaries separating staging entities from computed entities?",
     "1. Computed Entities: Dataflow tables that reference other tables (e.g., performing joins or aggregations) inside the same Dataflow.\n\n"
     "2. Premium Requirement: They utilize the Enhanced Compute Engine (SQL Server backend), which is a Premium-only feature designed to run complex data merges in SQL memory.\n\n"
     "3. Boundaries: Staging entities ingest data and write it directly to OneLake storage (Enable Load = false). Computed entities query these staging tables, processing calculations in-memory without overloading the source systems."),
    
    ("How do you configure Power Query to interface directly with an Apache Spark cluster via HiveLLAP, ensuring that aggregations are pushed to the cluster instead of executing locally within the Power BI desktop container?",
     "1. Connection: Use the Spark or Hive LLAP connector in Power Query. Enter the cluster URL and credentials.\n\n"
     "2. Query Folding: Ensure the M queries contain only fold-compatible transformations (e.g., `Table.Group`, `Table.SelectRows`, `Table.Join`).\n\n"
     "3. Execution: If configured correctly, the M engine translates transformations into Spark SQL and pushes them to the Hive LLAP cluster, where Spark processes the aggregations across its distributed nodes, returning only the final summary to Power BI."),
    
    ("Detail how the M engine processes Nested Records and Lists. How do you optimize the serialization of a JSON structure containing 5 levels of deeply nested object arrays into a flattened relational schema?",
     "1. Processing: The M engine treats nested JSON as nested record and list structures in memory.\n\n"
     "2. Optimization: Avoid expanding columns step-by-step using the UI. This triggers multiple nested loops.\n\n"
     "3. Flattening: Write custom M functions or use `Record.ToTable` and list projection to flatten the hierarchy in a single step. Project specific paths directly (e.g., `[users]{0}[profile][name]`), reducing memory footprint and serialization overhead."),
    
    ("Why does adding an index column (Table.AddIndexColumn) to an M query immediately destroy upstream query folding for almost all relational data sources? How do you work around this constraint if an index is required for an aggregation?",
     "1. Folding Break: Indexing requires a sequential row order. Relational databases do not guarantee row order unless sorted, and SQL lacks a standard folding operator for index generation.\n\n"
     "2. Local Execution: The Mashup engine must download the entire table to assign index IDs locally, breaking folding.\n\n"
     "3. Workaround: If an index is required, generate it upstream in the SQL database using `ROW_NUMBER() OVER(ORDER BY Column)` in a view, allowing the operation to execute at the source."),
    
    ("Explain how to force the M engine to ignore data errors in a specific column using Table.ReplaceErrorValues vs removing the entire row via Table.RemoveRowsWithErrors. What is the impact on final row counts and data integrity audits?",
     "1. Table.ReplaceErrorValues: Replaces error values in a column with a default value (e.g., `null` or `0`). Row count remains unchanged, but error details are lost.\n\n"
     "2. Table.RemoveRowsWithErrors: Deletes the entire row containing the error. This reduces the row count and can cause data discrepancies in aggregates.\n\n"
     "3. Integrity Audit: For enterprise models, it is best to quarantine errors: split the table, filter errors into a separate audit query, and load only clean rows, preserving data quality checks."),
    
    ("Describe the architectural flow of data when a user triggers an On-Demand Refresh of a dataset in the Power BI Service that connects via an On-Premises Data Gateway to an IBM DB2 database. Trace the data from the database back to the Premium capacity memory.",
     "1. Trigger: User clicks refresh. The Power BI Service issues a refresh task.\n\n"
     "2. Gateway Query: The service sends the query to the On-Premises Data Gateway over a secure Azure Service Bus connection.\n\n"
     "3. Database Query: The Gateway decrypts the query, authenticates using stored credentials, and executes the query against the IBM DB2 database.\n\n"
     "4. Streaming: DB2 streams the rows to the Gateway. The Gateway compresses the data and streams it to the Power BI Service in chunks. The Service parses the data, applies compression encoding via VertiPaq, and loads the active segments directly into the Premium capacity RAM.")
]

# Niche 4: Enterprise Administration, Governance, Security (RLS/OLS), & Capacity Management (40 questions)
admin_qas = [
    ("Design an automated infrastructure using PowerShell, Azure DevOps, and the Power BI Scanner API to track end-to-end lineage across all corporate workspaces down to individual visual columns. What are the API call sequencing restrictions and throttling limits?",
     "1. Infrastructure: Use PowerShell scripts executing inside Azure DevOps. Run the `Get-PowerBIDataset` and Scanner API endpoints.\n\n"
     "2. API Sequence: Call `PostWorkspaceInfo` to initiate the scan. Poll `GetScanStatus` until completed, then call `GetScanResult` to retrieve the lineage payload.\n\n"
     "3. Limits: Throttling is enforced at 120 requests per minute. Use Service Principal authentication and batch workspace requests (max 100 workspaces per call) to avoid API limit errors."),
    
    ("Detail how to implement a Dynamic Row-Level Security (RLS) architecture using an external centralized entitlement matrix table that contains organizational hierarchy data with path strings (PATH, PATHCONTAINS), supporting concurrent slicing across separate organizational nodes for individual Azure AD user identities.",
     "1. Entitlement Table: Create a mapping table with columns: `UserEmail`, `OrgPath` (e.g., `1|5|12`).\n\n"
     "2. DAX Pattern: In the RLS role definition for the Fact or Dimension table, filter by user email and check hierarchy: `PATHCONTAINS(Entitlement[OrgPath], USERPRINCIPALNAME())`.\n\n"
     "3. Propagation: Join the entitlement table to the dimension table, allowing the active paths to filter dimension keys dynamically, restricting data access based on AD login credentials."),
    
    ("Explain the architecture of Power BI Premium Gen2 capacity allocation. How does the platform evaluate CPU spikes using the 30-second smoothing algorithm, and what actions occur when a capacity triggers Autoscale background cores?",
     "1. Premium Gen2: Dynamically assigns resources. Evaluates CPU usage using a 30-second smoothing window for interactive queries and a 24-hour window for background operations.\n\n"
     "2. Throttling: If the 30-second smooth CPU usage exceeds 100% capacity, interactive queries are delayed.\n\n"
     "3. Autoscale: If Autoscale is enabled, it automatically spins up an additional virtual core for 24 hours to handle the CPU spike, billing the subscription, preventing query drops."),
    
    ("You need to restrict access to a specific column containing highly sensitive payroll data using Object-Level Security (OLS). Explain step-by-step how to configure this via Tabular Editor. What are the consequences when a restricted user attempts to build a custom report via Excel Analyze in BI?",
     "1. OLS Configuration: In Tabular Editor, select the target column (e.g., `Sales[Salary]`).\n\n"
     "2. Roles: Go to 'Roles', select the security role, and set 'Object-Level Security' for the column to 'None'. Save changes back to the service.\n\n"
     "3. Excel Analyze impact: The secured column is completely hidden from the metadata schema. When the user queries the dataset via Excel, they will not see the column. If they attempt to load a pivot table containing the column, the query fails with a 'Column not found' error."),
    
    ("Architect a governance model for Self-Service BI that segregates Certified, Promoted, and Non-certified semantic models across an enterprise with 50,000 users. How do you configure tenant settings, workspace roles, and discoverability permissions to maintain control without blocking agility?",
     "1. Workspace Segregation: Create separate 'IT-Managed' (Certified), 'Department' (Promoted), and 'Sandbox' (Non-certified) workspaces.\n\n"
     "2. Tenant Settings: Restrict 'Certification' permission to a designated BI governance team. Allow all users to 'Promote' their models.\n\n"
     "3. Discoverability: Enable 'Discoverable' tenant settings. Users can search for certified datasets and request access, preventing duplicate data model silos."),
    
    ("Explain the operational differences and security boundaries between Workspace Roles (Admin, Member, Contributor, Viewer) and Semantic Model Build Permissions. Can a user with Contributor rights on a workspace overwrite an RLS security profile, and how do you prevent this?",
     "1. Workspace Roles: Control access to files and resources within the workspace. Admins and Members manage permissions. Contributors can edit content.\n\n"
     "2. Build Permission: Grants permission to build reports on top of the dataset.\n\n"
     "3. RLS Bypass: Yes, Contributors can modify datasets and bypass RLS rules because they have write access. To prevent this, assign junior developers or users the 'Viewer' role and grant them individual 'Build' permissions on the dataset."),
    
    ("Trace the full authentication and authorization handshake flow when an external user logs in via Azure Active Directory B2B Guest access to view an embedded Power BI report inside a custom external corporate portal using App Owns Data embedding.",
     "1. Handshake: User logs into the external portal. The portal authenticates the user via its own identity provider.\n\n"
     "2. App Service: The portal back-end requests an Entra ID token for the registered Service Principal.\n\n"
     "3. Embed Token: The portal calls the Power BI REST API (`GenerateToken`) passing the user's guest identity.\n\n"
     "4. Rendering: Power BI returns an Embed Token. The portal frontend passes this token to the Power BI JS SDK, rendering the report securely inside an iframe."),
    
    ("What are Tenant Settings switches for export capabilities? Detail how to implement a data protection policy that prevents specific user groups from downloading .pbix files or exporting data to Excel, while allowing full access to standard executive management teams.",
     "1. Tenant Switches: Locate 'Download reports', 'Export to Excel', and 'Export to CSV' switches in the Admin Portal.\n\n"
     "2. Security Groups: Create an AD Security Group for Restricted Users and another for Executives.\n\n"
     "3. Implementation: Set the export switches to 'Enabled for all, except specific security groups' (specifying the Restricted group), and restrict PBIX downloads, safeguarding corporate data."),
    
    ("How do you monitor, audit, and analyze usage patterns across a large tenant using the Power BI Activity Log and Unified Audit Logs? What are the key differences between the Activity Log and the older Execution Logs?",
     "1. Monitoring: Use PowerShell `Get-PowerBIActivityEvent` to extract daily activity logs. Load them into an Azure SQL database.\n\n"
     "2. Differences: Activity Log contains only Power BI events (runs, views, downloads) and retains data for 30 days. Unified Audit Logs contain events across all Office 365 services and require tenant admin rights.\n\n"
     "3. Analysis: Build a tenant usage report showing active workspaces, popular reports, and dataset refresh durations, enabling audit compliance."),
    
    ("Design a failover and disaster recovery strategy for Power BI On-Premises Data Gateways servicing critical real-time enterprise executive dashboards. How do you configure the gateway cluster to handle network partitions and automated recovery without manual human intervention?",
     "1. Gateway Cluster: Install the gateway on at least two separate VM servers. Add them to a single Gateway Cluster.\n\n"
     "2. Failover: Enable the setting 'Distribute requests across all active gateways in this cluster'.\n\n"
     "3. Recovery: If Node A suffers a network partition, the Gateway Cloud Service automatically routes queries to Node B, ensuring zero downtime. Set up automated scripts to restart the Gateway service on VMs if heartbeats fail."),
    
    ("Explain how Microsoft Purview Information Protection Labels (Sensitivity Labels) propagate from an Azure Synapse Analytics database down through a Power BI dataset, into a report, and finally into an exported PowerPoint or Excel file.",
     "1. Label Propagation: When Synapse database columns have classification labels, Power BI scanner reads them.\n\n"
     "2. Dataset Label: The Power BI dataset inherits the classification (e.g., 'Highly Confidential').\n\n"
     "3. Downstream Assets: Reports built on the dataset automatically inherit the label.\n\n"
     "4. Export Protection: When exporting the report to Excel or PowerPoint, the sensitivity label and its encryption policies are applied to the exported file, restricting access to authorized users."),
    
    ("What is the XMLA Endpoint read/write architecture? How do you leverage it to perform fine-grained partial partition refreshes using external orchestrators like Azure Data Factory or Airflow, and what are the specific capacity lock mechanisms that occur during execution?",
     "1. XMLA Endpoint: Allows external tools to connect to the Tabular engine using MSOLAP drivers.\n\n"
     "2. Orchestration: Use ADF Web Activity to send a TMSL command (e.g., `refresh` of type `calculate` or `add` on specific partitions) to the XMLA endpoint.\n\n"
     "3. Locking: During partition refreshes, the engine places a read lock on the table. Once the data load completes, it places a write lock to commit, temporarily blocking query threads."),
    
    ("Analyze a scenario where a Premium capacity experiences severe Memory Pressure. What metrics inside the Power BI Premium Capacity Utilization and Metrics app indicate that a dataset is being aggressively evicted from RAM, and how do you diagnose which dataset is the culprit?",
     "1. Eviction Metrics: Look for `Memory Evictions` and `Dataset Eviction Count` spikes in the Capacity Metrics app.\n\n"
     "2. Diagnosis: Track the `Dataset Size` and `Active Memory` consumption chart.\n\n"
     "3. Culprit: Identify datasets showing high CPU/memory consumption directly before eviction events. The app lists the dataset ID, allowing you to optimize its columns or refresh schedules."),
    
    ("How do you implement Row-Level Security (RLS) within a DirectQuery model when connecting to Snowflake via Single Sign-On (SSO), ensuring that Snowflake’s internal native security roles are evaluated rather than Power BI's DAX RLS filters?",
     "1. Snowflake SSO: Enable SSO in the gateway and connection settings.\n\n"
     "2. Native Security: In Snowflake, define row-level security policies on tables mapped to user roles.\n\n"
     "3. DAX Setup: Do not define any RLS filters in the Power BI desktop model. When a user queries a visual, Power BI passes the user's Entra ID token to Snowflake. Snowflake resolves the identity, applies its native SQL security policies, and returns filtered rows."),
    
    ("Explain the technical differences between Classic Workspaces and the New Workspace Experience (V2) from an API management, security group assignment, and underlying Azure storage perspective.",
     "1. Security Groups: Classic workspaces were tied to Office 365 Groups. V2 workspaces allow assigning AD Security Groups, distribution lists, and individual users directly to roles.\n\n"
     "2. API Management: V2 workspaces are managed via modern REST APIs without tenant group creation overhead.\n\n"
     "3. Storage: V2 workspaces decouple storage, allowing workspaces to connect directly to Azure Data Lake Gen2 accounts or OneLake storage, bypassing legacy Office 365 group boundaries."),
    
    ("What are Deployment Pipelines in Power BI Service? Detail the internal mechanisms that occur when deploying a semantic model from Test to Production when the target environment mandates different database connection strings and parameters.",
     "1. Deployment Pipelines: Automate asset lifecycle management across Dev, Test, and Prod stages.\n\n"
     "2. Parameter Overrides: Configure 'Deployment Rules' on the target stage.\n\n"
     "3. Execution: During deployment from Test to Production, the service copies the metadata. It intercepts the database connection settings and applies the Production rules, replacing database servers and credentials automatically without modifying the source PBIX."),
    
    ("How do you debug a broken Scheduled Refresh that yields a \"Credential validation failed because the dataset owner has left the company\" error? Detail the programmatic API strategy to re-bind dataset ownership to a Service Principal.",
     "1. Root Cause: Scheduled refreshes run under the credentials of the dataset owner. If the owner's account is disabled, the credentials invalidate.\n\n"
     "2. API Strategy: Authenticate as a Service Principal with Admin rights.\n\n"
     "3. Re-binding: Call the REST API endpoint: `POST https://api.powerbi.com/v1.0/myorg/groups/{groupId}/datasets/{datasetId}/Default.TakeOver`. This binds ownership to the Service Principal, allowing database authentication using key vaults."),
    
    ("Explain the exact mechanism of Tenant Dialect isolation within a multi-geo tenant setup. What are the performance costs and data transit implications when a user in Europe accesses a Power BI dataset hosted in an East US Premium capacity region?",
     "1. Multi-Geo: Restricts data transit by hosting capacities in local regions.\n\n"
     "2. Execution: When a European user accesses an East US dataset, the visual queries are routed over the WAN to the East US capacity.\n\n"
     "3. Costs: High query latency due to geographic distance. Visual rendering times increase. Data transit costs are billed for cross-region egress, making it optimal to host datasets in the region where the primary consumer group resides."),
    
    ("How do you audit and identify Unused Datasets and Reports across an enterprise tenant with thousands of assets using programmatic API tools, and what is the automated workflow to clean them up safely?",
     "1. Audit Script: Use PowerShell to fetch workspace assets and cross-reference them with the Activity Log dataset.\n\n"
     "2. Identification: Identify reports with zero `ViewReport` events in the last 90 days.\n\n"
     "3. Workflow: Send an automated email warning to the workspace owner. If no response is received in 30 days, call the REST API `DELETE https://api.powerbi.com/v1.0/myorg/groups/{groupId}/reports/{reportId}` to delete or archive the asset."),
    
    ("What are the exact architectural limitations of using Service Principals to execute admin tasks via the Power BI REST APIs? Which specific endpoints remain completely locked out from Service Principal execution and require an interactive Admin account?",
     "1. Service Principal Limits: Must be added to the Power BI Admin API Tenant Setting and granted permissions on target workspaces.\n\n"
     "2. Locked Endpoints: Cannot access endpoints related to personal workspaces (`My Workspace`), cannot download PBIX files if not a workspace member, and cannot access legacy O365 group management endpoints.\n\n"
     "3. Execution: Use an interactive service account with Power BI Admin role permissions for these restricted endpoints."),
    
    ("Detail how Row-Level Security (RLS) interact with the Q&A Natural Language visual. Does a user asking a natural language query have access to aggregate data filtered out by their RLS role profile?",
     "1. Q&A Security: The Q&A visual respect all RLS settings configured in the dataset.\n\n"
     "2. Query Execution: When a user types a natural language query, the engine translates the question into a DAX query.\n\n"
     "3. RLS Enforcement: The generated DAX query is evaluated under the user's RLS filter context. The user cannot see, aggregate, or search data excluded by their security profile, preventing leaks."),
    
    ("How do you handle Data Sovereignty compliance regulations (such as GDPR) within a global Power BI infrastructure where specific country data must never leave geographical boundaries during report compilation or caching?",
     "1. Multi-Geo Capacities: Provision separate Premium capacities in regions matching sovereignty boundaries (e.g., North Europe for EU data).\n\n"
     "2. Data Isolation: Deploy country-specific workspaces to their respective regional capacities.\n\n"
     "3. Caching: Disable global caching options. Ensure that DirectQuery connections query local databases directly, preventing tenant-wide data spillover."),
    
    ("Explain how to leverage Large Dataset Storage Format settings in Power BI Premium. What internal changes occur to file chunking on premium disks, and how does it alter the maximum size limit of an individual import model?",
     "1. Large Format: Normally, datasets are limited to 10GB after compression. Enabling Large Dataset Format increases the limit to the capacity size (e.g., 400GB).\n\n"
     "2. File Chunking: The engine splits the model's backing files into smaller chunks (up to 1GB segments) on the Premium storage disks.\n\n"
     "3. Refresh: Enables parallel partition loads, updating segments independently without needing to write the entire model as a single monolithic file, avoiding memory exhaustion during refreshes."),
    
    ("Detail the differences between Organizational Apps and Workspaces for report distribution. How do you handle a requirement where different audiences within the same App need to see different subsets of reports or dashboards?",
     "1. App vs Workspace: Workspaces are collaborative developer playgrounds. Apps are read-only distribution packages for end-users.\n\n"
     "2. Multi-Audience: Use the 'Multiple Audiences' feature inside the App configuration.\n\n"
     "3. Audiences: Create up to 10 audience tabs. Assign specific AD security groups to each tab and select which reports are visible to each group, managing security from a single App."),
    
    ("What is the impact of DirectQuery Partitioning on concurrent database connection limits? How can an administrator prevent a single poorly written dashboard from triggering a Distributed Denial of Service (DDoS) state on an operational transactional database?",
     "1. Impact: DirectQuery sends SQL queries for every visual. If a table has multiple partitions, the engine sends parallel queries, multiplying connections.\n\n"
     "2. DDoS Risk: A dashboard with 10 visuals opened by 100 users sends 1,000 concurrent queries instantly.\n\n"
     "3. Prevention: (a) Limit connection counts: configure `Max Connections per Data Source` to a low value (e.g., 10). (b) Enable caching in the Power BI Service. (c) Direct queries to a read-replica database to isolate transactional traffic."),
    
    ("Explain how to track and limit Premium Capacity Background Operations vs Interactive Operations. What happens if scheduled refreshes overlap with peak interactive user hours, and how does the engine prioritize execution queues?",
     "1. Monitoring: Use the Capacity Metrics App to track background CPU (refreshes) vs interactive CPU (visual queries).\n\n"
     "2. Overlap: If refreshes spike during peak hours, background tasks are throttled (smoothed over 24 hours) or queued.\n\n"
     "3. Prioritization: Interactive queries always receive priority. The engine allocates CPU cycles to visual rendering first, pausing or slowing down refresh tasks in the queue to maintain dashboard responsiveness."),
    
    ("How do you manage and govern Personal Workspaces (My Workspace) across an organization to prevent them from becoming unmonitored silos of shadow IT data assets?",
     "1. Policy: Restrict data sharing from Personal Workspaces using tenant settings.\n\n"
     "2. Auditing: Use the Power BI Scanner API to scan personal workspaces. Identify high-capacity datasets.\n\n"
     "3. Migration: Automate email notifications prompting users to move critical corporate reports to IT-approved shared workspaces, and restrict personal workspace storage capacities."),
    
    ("What is Power BI Premium Gen2 Over-allocation protection? Explain the operational threshold settings that dictate when the service will return a \"Capacity Limit Exceeded\" error code to end-users.",
     "1. Over-allocation: Prevents a single tenant workspace from consuming all shared capacity memory.\n\n"
     "2. Thresholds: The service tracks RAM per dataset. If a query requires more memory than the capacity's maximum allocation (e.g., 25GB on P1), it cancels the query.\n\n"
     "3. Error: Returns 'Capacity Limit Exceeded' to prevent capacity crashes and protect concurrent users."),
    
    ("Detail the mechanism of configuring VNet Data Gateways. How do they eliminate the physical VM maintenance overhead of traditional On-Premises Gateways, and what are the specific networking prerequisites in Azure?",
     "1. VNet Gateway: A Microsoft-managed cloud service. Eliminates physical VM installs, OS updates, and scaling maintenance.\n\n"
     "2. Prerequisites: Create a subnet in your Azure Virtual Network. Delegate this subnet to the Microsoft Power Platform service.\n\n"
     "3. Security: The VNet gateway establishes secure private endpoint connections to your databases directly inside the VNet, routing queries without outbound internet gateways."),
    
    ("How do you construct a security architecture that allows business analysts to Build reports on top of centralized datasets hosted in a secure IT-managed workspace without granting them read or view rights to the workspace itself?",
     "1. Separation: Host datasets in Workspace A (secure, IT-only access).\n\n"
     "2. Build Permissions: Grant analysts 'Build' permission on the datasets in Workspace A.\n\n"
     "3. Workspace B: Assign analysts 'Contributor' roles in Workspace B. Analysts can create reports in Workspace B that link to the datasets in Workspace A, keeping source definitions secure."),
    
    ("Explain how Object-Level Security (OLS) affects Hierarchical Navigation features within report visual matrixes.",
     "1. Navigation block: If OLS secures a column in a hierarchy (e.g., `Employee[Salary]`), the user cannot drill down to that level.\n\n"
     "2. Visual behavior: In a matrix, the expand (`+`) icon for the secured level disappears.\n\n"
     "3. Errors: If the visual attempts to display the secured attribute as a header, the visual fails, returning a query parsing error."),
    
    ("What is the configuration workflow to establish a Custom Log Analytics integration for a Power BI Premium workspace? What specific KQL queries would you write to monitor long-running DAX queries?",
     "1. Setup: Register an Azure Log Analytics workspace. In Power BI Admin Portal, enable Azure Log Analytics connection on the target workspace.\n\n"
     "2. Logging: Power BI streams telemetry (AS Engine events) directly to the workspace.\n\n"
     "3. KQL Query:\n"
     "`PowerBIDatasetsWorkspaceAccess | where EventName == \"QueryEnd\" | extend DurationMs = toint(Duration) | where DurationMs > 5000 | project TimeGenerated, DatasetId, QueryText, DurationMs | order by DurationMs desc`. This identifies DAX queries taking longer than 5 seconds."),
    
    ("How do you remediate an issue where DirectQuery Single Sign-On (SSO) fails via the Gateway due to Kerberos ticket size constraints or configuration errors within Active Directory?",
     "1. Ticket Size: Large security group memberships increase the Kerberos ticket size, causing headers to be truncated by the gateway host.\n\n"
     "2. AD Config: Set `MaxTokenSize` registry key to `65535` on the Gateway VM and target database servers.\n\n"
     "3. Delegation: Ensure the gateway SPN has 'Trust this user for delegation to specified services' enabled in Active Directory, resolving SSO handshake errors."),
    
    ("Explain the impact of Tenant-wide Data Exfiltration settings on a user's capability to leverage Power Automate visuals inside a report to export raw tables to external non-corporate storage.",
     "1. Visual block: Power Automate visuals allow users to trigger flows.\n\n"
     "2. Exfiltration control: Tenant admins can enable 'Prevent data exfiltration' settings in Azure AD/Power BI.\n\n"
     "3. Prevention: This blocks Power Automate flows from sharing data with non-tenant domains or personal emails, preventing unauthorized data exfiltration."),
    
    ("Detail how to automate the provisioning of a brand new Power BI Workspace with pre-assigned user roles and data protection settings using an Azure DevOps pipeline combined with Power BI REST API calls.",
     "1. Pipeline: Set up a Bash task running in Azure DevOps.\n\n"
     "2. Workspace Create: Send a POST request to `https://api.powerbi.com/v1.0/myorg/groups` to create the workspace.\n\n"
     "3. Role assignment: Loop through user roles and call `POST /groups/{id}/users` to assign Admin/Contributor roles.\n\n"
     "4. Compliance: Call the sensitivity label API to assign default Purview labels, automating workspace creation."),
    
    ("Describe the difference between DirectQuery connection pooling for Import models during refresh versus DirectQuery models during real-time visual rendering.",
     "1. Import Refresh: The engine opens a fixed pool of connections, loading tables in parallel. It saturates database connections to finish the refresh quickly.\n\n"
     "2. Visual Rendering: The engine uses dynamic connection pooling (max connections set per visual/user). Connections are opened, queries executed, and connections returned to the pool immediately, minimizing database concurrency locks."),
    
    ("How do you implement Static Data Masking at the ingestion layer using Power Query so that PII data is mathematically obfuscated before ever hitting the cloud storage layer?",
     "1. Masking: In Power Query, hash PII columns (e.g., `SocialSecurityNumber`).\n\n"
     "2. Formula: Use `Binary.ToText(Encryption.CreateHash(EncryptionAlgorithm.Sha256, Text.ToBinary([SSN])), BinaryEncoding.Hex)`.\n\n"
     "3. Ingestion: This replaces the raw SSN with a one-way SHA-256 hash. The raw values never leave the Gateway, meeting strict security audits."),
    
    ("What is the exact security risk of enabling the tenant setting \"Allow service principals to use Power BI APIs\" globally without restricting it to specific security groups?",
     "1. Risk: Any developer who registers an Azure App Registration (Service Principal) can access tenant metadata.\n\n"
     "2. Impact: A rogue service principal could scan the entire tenant, download PBIX files, or delete critical workspaces.\n\n"
     "3. Prevention: Restrict the tenant setting to a dedicated AD Security Group (e.g., 'BI-Admin-Service-Principals'), blocking unauthorized apps."),
    
    ("Detail how to interpret Gateway Performance Counters (System CPU, Memory Usage, Network Execution Counters) to determine if a gateway machine needs vertical scaling vs horizontal clustering.",
     "1. CPU/Memory: If `System CPU Usage` or `Available Memory` regularly exceeds 85% during refreshes, the VM needs vertical scaling (more cores/RAM).\n\n"
     "2. Network: If `Network Execution Counters` show high query queue times but CPU is low, the network throughput is throttled.\n\n"
     "3. Clustering: If concurrent user queries fail with timeouts, add additional Gateway VM nodes to the cluster to handle query concurrency."),
    
    ("How do you configure a Power BI semantic model to utilize User Identity tracking in a custom log database, so that every query executed by a consumer leaves an audit trail showing exactly which user fetched which data slice?",
     "1. Tracker Setup: In the DirectQuery source database, set up session variables or audit logs.\n\n"
     "2. Connection: Configure the connection using Single Sign-On (SSO).\n\n"
     "3. Logging: When a visual queries the database, the user's AD email is passed in the query context. The database logs the SQL query alongside the Entra ID email, tracking user access.")
]

# Niche 5: CI/CD, ALM, Lifecycle Management, & Real-World Performance Tuning (40 questions)
cicd_qas = [
    ("Design a fully automated enterprise CI/CD deployment pipeline for Power BI using the new Power BI Project (.pbip) file format, Git integration, and Azure DevOps pipelines. How do you automate the programmatic parsing and scanning of the model.bim or custom JSON definitions to validate structural design rules prior to production deployment?",
     "1. PBIP Format: The `.pbip` format stores the model schema as a folder structure with individual JSON definitions (e.g., `model.bim` or `definition.pbidataset`).\n\n"
     "2. Devops Pipeline: Create an Azure DevOps pipeline that triggers on Pull Requests.\n\n"
     "3. Validation: Use a Python script or the Tabular Editor Command Line Interface (CLI) task to parse the dataset files. Run the Best Practice Analyzer (BPA) rules against the JSON definition, failing the pipeline if violations are detected."),
    
    ("Explain how to manage Metadata Conflicts using ALM Toolkit when a production target dataset has undergone schema modifications (e.g., incremental refresh partitions built in the cloud service) that do not match the local desktop development environment file.",
     "1. Conflict: Local PBIX does not contain the historical partitions created by the cloud service's incremental refresh policy. Overwriting deletes these partitions.\n\n"
     "2. ALM Toolkit: Use ALM Toolkit to connect to the local model and the remote XMLA endpoint.\n\n"
     "3. Deployment: Compare schemas. Uncheck the 'Refresh' partition definitions in the deployment options. Deploy only the structural metadata changes (new measures, tables), leaving the cloud partition history intact."),
    
    ("Walk through a comprehensive performance tuning lifecycle using DAX Studio. You are presented with a visual that takes 45 seconds to render. Explain how to read Server Timings, analyze FE vs SE CPU allocation, identify high-volume scans, and detect if a query is suffering from a lack of physical relationships.",
     "1. Capture: Connect DAX Studio to the model. Turn on 'Server Timings' and run the slow query.\n\n"
     "2. Timings: Analyze the `FE` (Formula Engine) vs `SE` (Storage Engine) duration. If FE is 90%, look for CallbackDataID or complex iterators.\n\n"
     "3. Scans: Look for `XMSQL` or `SQL` scans. High row counts indicate un-indexed scans.\n\n"
     "4. Missing Joins: If the physical plan shows large cross-joins or FE loops, the query lacks a physical relationship, forcing the FE to resolve joins using temporary hash tables."),
    
    ("How do you use Tabular Editor 3 Advanced Scripting and C# script objects to automatically enforce corporate modeling standards (e.g., automatically hiding all foreign key columns, enforcing specific capitalization rules, and verifying that every explicit measure contains a description)?",
     "1. Advanced Scripting: Open Tabular Editor 3. Open the Scripting tab.\n\n"
     "2. C# Script: Write a script to iterate over columns and measures:\n"
     "`foreach (var c in Model.Tables.SelectMany(t => t.Columns)) { if (c.Name.EndsWith(\"Key\")) c.IsHidden = true; }`.\n\n"
     "3. Enforcement: Check descriptions: `foreach (var m in Model.AllMeasures) { if (string.IsNullOrEmpty(m.Description)) Error(\"Description missing on \" + m.Name); }`. Run the script prior to saving to enforce corporate design standards."),
    
    ("Explain the operational mechanics of Calculation Groups as an optimization tool. How can they be deployed to reduce model size by collapsing hundreds of repetitive time-intelligence measures into a single core structural definition? What are the limitations regarding formatting?",
     "1. Optimization: Instead of writing 10 time-intelligence measures (YTD, QTD) for 20 core metrics (Sales, Profit), create a single Calculation Group with 10 items.\n\n"
     "2. Evaluation: The items use `SELECTEDMEASURE()` to apply YTD logic dynamically. This reduces the model's measure count from 200 to 20, shrinking the metadata footprint.\n\n"
     "3. Formatting limit: Dynamic format strings inside calculation items override the base measure format. If a visual displays mixed metrics (e.g., currency and integer), the calculation item format must use `SELECTEDMEASUREFORMATSTRING()` to prevent formatting mismatches."),
    
    ("Describe the architecture of Power BI Multi-dataset chaining (Hub and Spoke). What are the deployment lifecycle risks when you modify a core upstream \"Hub\" dataset that has dozens of downstream \"Spoke\" reports and composite models built on top of it by separate business departments?",
     "1. Hub & Spoke: A central IT-managed dataset (Hub) is published. Departments build secondary models (Spokes) that connect to it via DirectQuery.\n\n"
     "2. Risks: Deleting a column or renaming a measure in the Hub breaks all dependent Spoke visuals instantly.\n\n"
     "3. Governance: Implement change management. Use the Scanner API to trace downstream dependencies. Coordinate schema changes and use deployment pipelines to validate Hub updates before pushing to production."),
    
    ("How do you execute BPA (Best Practice Analyzer) rules within a continuous integration pipeline using the Tabular Editor Command Line Interface (CLI)? Provide examples of critical performance violations that should trigger a pipeline failure.",
     "1. Tabular Editor CLI: Run the command: `start /wait TE2.exe \"[ModelPath]\" -B \"[BpaRules.json]\" -A`.\n\n"
     "2. Violations: Set rules to fail if they detect: (a) Use of `CALCULATE` inside row context without necessity. (b) Bi-directional relationships on M:M joins. (c) Unhidden foreign keys.\n\n"
     "3. Pipeline Action: If the CLI returns a non-zero exit code, the DevOps build task fails, blocking the PR from merging."),
    
    ("Detail how to programmatically manage, create, and merge Table Partitions within an Import model via the TMSL (Tabular Model Scripting Language) script syntax or the TOM (Tabular Object Model) API wrapper over Azure Functions.",
     "1. Partition Management: Use TMSL commands sent to the XMLA endpoint.\n\n"
     "2. TMSL Script: Write a `createOrReplace` or `mergePartitions` JSON payload:\n"
     "`{ \"mergePartitions\": { \"database\": \"MyModel\", \"table\": \"Sales\", \"sources\": [\"Sales_2024_Q1\", \"Sales_2024_Q2\"], \"target\": \"Sales_2024_H1\" } }`.\n\n"
     "3. TOM API: In an Azure Function, load `Microsoft.AnalysisServices.Tabular.dll`. Access the `Table.Partitions` collection, add partition objects, and call `Model.SaveChanges()`, automating partition splitting."),
    
    ("What happens when a Power BI deployment pipeline deploys a report that is connected to a dataset that resides in a separate workspace? How does the pipeline manage cross-workspace bindings across Development, Test, and Production stages?",
     "1. Separation: Reports reside in Workspace R; Datasets reside in Workspace D.\n\n"
     "2. Binding: By default, the report points to the Dev Dataset ID.\n\n"
     "3. Pipeline Resolution: During deployment of the report to the Test stage, the pipeline automatically detects the dataset connection. It updates the binding to point to the Test Dataset ID in Workspace D, maintaining the environment separation."),
    
    ("Analyze the performance trade-offs of using Tabular Editor to build calculated tables vs building those tables via Power Query or SQL views. In which scenario does calculation execution occur, and how does it impact model file footprint size?",
     "1. Calculated Tables (DAX): Built at model load time. Executed inside the Tabular Engine. Bloats the model file size because the data is materialized in RAM.\n\n"
     "2. Power Query (M) / SQL Views (Optimal): Executed during ingestion. SQL views utilize database indexes.\n\n"
     "3. Trade-off: SQL views are preferred because they shift the processing load to the database database and support query folding. Use calculated tables only for dynamic modeling requirements (e.g., parameter tables) that cannot be defined upstream."),
    
    ("How do you resolve a Git merge conflict within a collaborative Power BI development team when two developers modify the same report layout file simultaneously within a .pbip project directory structure?",
     "1. Conflict cause: The `.pbip` project represents report layouts as `report.json`. If two developers edit the layout, Git marks conflicts inside this complex JSON.\n\n"
     "2. Resolution: Open `report.json` in VS Code. Locate the conflict markers.\n\n"
     "3. Fix: Manually select the valid JSON blocks, rebuild the nested brackets, save, and commit. It is best to assign separate pages to developers to avoid concurrent edits to `report.json`."),
    
    ("Detail the process of using Performance Analyzer inside Power BI Desktop. What does the \"Other\" metric represent in the execution time breakdown, and what architectural flaws contribute to its inflation?",
     "1. Performance Analyzer: Records the duration of visual rendering (DAX query, Visual display, Other).\n\n"
     "2. Other Metric: Represents the time the browser engine takes to process visual configurations, format strings, and wait in the browser rendering queue.\n\n"
     "3. Flaws: High visual density (too many cards), complex conditional formatting rules, or heavy custom visuals inflate the 'Other' metric, delaying rendering."),
    
    ("What is the VertiPaq Analyzer metrics layout? How do you leverage it to discover if a column’s dictionary size is disproportionately large compared to its data size, and what specific remediation steps should be taken?",
     "1. Metrics Layout: VertiPaq Analyzer lists columns with metrics: Table Size, Column Size, Dictionary Size, Cardinality, and Compression Type.\n\n"
     "2. Discovery: If a column has low cardinality but a large dictionary, the strings are long (e.g., long URL paths).\n\n"
     "3. Remediation: Hash the strings, truncate URLs, or split the column into shorter key columns to shrink dictionary memory."),
    
    ("Explain how Incremental Refresh policies interact with manual schema updates via XMLA Endpoints. If you add a new column to a table configured with an active incremental refresh policy, how do you deploy it without forcing the entire historical partition stack to re-execute against the source?",
     "1. Update Challenge: Deploying a new column usually invalidates historical partitions, requiring a full refresh.\n\n"
     "2. Deploy strategy: Connect via Tabular Editor. Add the new column to the table definition.\n\n"
     "3. Partition update: Do not refresh data. In Tabular Editor, save changes to the XMLA endpoint. The engine adds the column metadata to all historical partitions as `null` values without re-running SQL queries, preserving history."),
    
    ("How do you optimize a report page containing 30 distinct card visuals, each executing an independent DAX query against a DirectQuery source? What is the impact on gateway performance, and how do you consolidate them into a single structural block?",
     "1. Performance impact: 30 cards generate 30 concurrent SQL queries, saturating the Gateway connection limits and causing query queuing.\n\n"
     "2. Consolidation: Replace the 30 cards with a single Matrix visual or a Multi-row card visual.\n\n"
     "3. Structure: Build a single DAX measure that returns the values, allowing the visual to execute a single query, reducing gateway traffic by 96%."),
    
    ("Explain how the Query Parallelism and Max Concurrent Queries settings in Tabular Editor impact the load performance of a model when executed inside a high-concurrency enterprise dashboard scenario.",
     "1. Parallelism: Controls the number of threads the engine uses to run queries in parallel.\n\n"
     "2. Tuning: In Tabular Editor, configure `Max Concurrent Queries` per session.\n\n"
     "3. Concurrency: Setting it too high during peak user hours saturates capacity CPU. Setting it appropriately (e.g., matching the physical cores) prevents thread starvation and maintains dashboard responsiveness."),
    
    ("Describe the impact of Visual interactions (Cross-filtering vs Cross-highlighting) on the total number of DAX queries generated when a user clicks an item in a dense bar chart on a page with 5 other complex visuals. How do you optimize this?",
     "1. Impact: Clicking a bar triggers cross-filtering, sending 5 separate DAX queries (one for each visual) to recalculate slices.\n\n"
     "2. Query Spike: Can cause slow rendering if visuals contain complex DAX.\n\n"
     "3. Optimization: Edit visual interactions. Set unnecessary cross-filtering relationships to 'None' (e.g., block a chart from filtering a static map), reducing query volume."),
    
    ("How do you implement automated Regression Testing for DAX measures within a deployment pipeline using tools like DAX Studio CLI or custom Python/PowerShell testing runners to ensure calculations match expected historical controls?",
     "1. Test runner: Write a python script running in Azure DevOps.\n\n"
     "2. Query Execution: The script reads a list of test DAX queries (e.g., standard reports). It executes them against the Dev and Prod XMLA endpoints using MDX/DAX queries.\n\n"
     "3. Validation: Compare the output datasets. If the calculated numbers differ, the regression test fails, blocking the deployment."),
    
    ("What is the structural difference between deploying a semantic model using TMSL script files via SQL Server Management Studio (SSMS) versus executing a standard .pbix file upload via the REST API or UI?",
     "1. TMSL via SSMS: Deploys only the model metadata definition (tables, relationships, measures). It does not contain data, requiring a subsequent refresh.\n\n"
     "2. PBIX Upload: Uploads both metadata and the cached data stored inside the PBIX file.\n\n"
     "3. Deployment choice: TMSL is preferred for CI/CD pipelines as it is lightweight and allows partition preservation, while PBIX upload overwrites all partitions."),
    
    ("Explain how to diagnose and optimize a report that exhibits slow rendering times exclusively on mobile devices, despite executing under 1 second on standard desktop browser interfaces.",
     "1. Diagnosis: Mobile devices have weaker GPU/CPU processing. Visual rendering engine execution (DOM rendering) takes longer.\n\n"
     "2. Cause: High visual density or large matrixes with complex conditional formatting.\n\n"
     "3. Optimization: Build a dedicated mobile layout. Limit the layout to max 4-5 visuals. Avoid complex custom visuals and reduce conditional formatting, ensuring fast mobile loads."),
    
    ("How do you tune the Visual Cache settings at the tenant level, and how does it interact with real-time data freshness requirements when using DirectQuery or Hybrid tables?",
     "1. Visual Cache: Power BI caches query results in memory to speed up visual rendering.\n\n"
     "2. Refresh Interval: Set the cache refresh interval in dataset settings (e.g., refresh every 15 minutes).\n\n"
     "3. Freshness: For real-time DirectQuery or Hybrid tables, set the cache refresh to a low value (e.g., 1 minute) or use Automatic Page Refresh (APR) to force the browser to query the database, bypass caching."),
    
    ("Explain how Tabular Object Model (TOM) metadata validation can be used to scan an enterprise catalog to detect and prevent unauthorized data modifications executed by business users utilizing external tools.",
     "1. TOM Scan: Write a C# script running in an Azure Function that connects to the workspace XMLA endpoints.\n\n"
     "2. Validation: The script loads the Tabular Model metadata and compares it to a master schema definition.\n\n"
     "3. Action: If it detects modified measures or columns not authorized by the BI team, it sends alerts and blocks deployments, maintaining data model governance."),
    
    ("Detail the impact of Complex Tooltip Pages on report performance. If a tooltip page contains 4 visuals and a matrix, what happens to the query engine execution when a user rapidly mouses over a dense scatter plot visual?",
     "1. Tooltip Query: Hovering over a data point triggers the tooltip page. Power BI executes all 4 visuals and the matrix queries under the hovered filter context.\n\n"
     "2. Mouse Sweep: Rapidly sweeping the mouse across 20 scatter plot points triggers 20 x 5 = 100 queries in seconds.\n\n"
     "3. Optimization: Limit tooltip pages to 1 simple visual. Turn off tooltips if not needed, preventing query floods."),
    
    ("Describe how to debug an enterprise semantic model that performs flawlessly in Power BI Desktop but continuously triggers \"Resource Governing Limit Exceeded\" errors once deployed to a Shared or Premium capacity container.",
     "1. Cause: Power BI Desktop uses local RAM (unlimited). The service capacity enforces limits (e.g., max 10GB RAM per query on P1).\n\n"
     "2. Debugging: Copy the query and run it in DAX Studio connected to the service.\n\n"
     "3. Fix: Optimize iterators. Avoid `CROSSJOIN` or `GENERATE` on high-cardinality columns that materialize large tables in memory, keeping queries within capacity limits."),
    
    ("Explain the technical process of shifting a massive enterprise data architecture from a Live Connection setup over SSAS to a native DirectLake mode setup inside Microsoft Fabric. What are the specific modeling adjustments required?",
     "1. Shift: Move source data from SQL Server/SSAS to OneLake delta tables.\n\n"
     "2. DirectLake: Create a Fabric Semantic Model pointing to the Delta Parquet files in OneLake.\n\n"
     "3. Adjustments: Remove calculated columns. Re-write DAX measures to ensure they support DirectLake mode (avoiding features that force fallback to DirectQuery)."),
    
    ("How do you orchestrate a multi-stage Dataflow Refresh Dependency Chain where Dataflow B cannot execute until Dataflow A completes, ensuring this functions cleanly across separate workspaces without resorting to hardcoded timer pauses?",
     "1. Orchestration: Use Azure Data Factory, Power Automate, or Microsoft Fabric Pipelines.\n\n"
     "2. Flow: Create a pipeline with a 'Refresh Dataflow' task for Dataflow A.\n\n"
     "3. Dependency: Link the output success path of Dataflow A to a second 'Refresh Dataflow' task for Dataflow B, ensuring sequential execution."),
    
    ("What is the exact performance impact of using Custom Visuals from the marketplace regarding JavaScript main-thread execution blocking, DOM rendering overhead, and unoptimized DAX query generation patterns?",
     "1. Impact: Custom visuals run JavaScript inside the browser. Poorly coded visuals can block the main UI thread, causing sluggish responsiveness.\n\n"
     "2. DOM Overhead: High DOM element counts delay rendering.\n\n"
     "3. Querying: Some custom visuals generate sub-optimal DAX (e.g., requesting individual rows instead of summaries), causing slow queries. Test visuals in Performance Analyzer before deployment."),
    
    ("How do you optimize the Memory Footprint of Relationships? Why does a relationship between two high-cardinality columns consume significant memory, and how do you calculate its footprint using VertiPaq Analyzer metrics?",
     "1. Footprint: VertiPaq builds relationship mapping tables in-memory. If joining columns have high cardinality (e.g., UUIDs), the map size is huge.\n\n"
     "2. Metrics: In VertiPaq Analyzer, check the `Relationship Size` column.\n\n"
     "3. Optimization: Convert join keys to integer data types. Replace UUID strings with integer surrogate keys during ETL, reducing mapping size by up to 90%."),
    
    ("Explain the lifecycle steps required to deprecate an existing old calculated column across hundreds of downstream reports without breaking production assets, using automated dependency scanning tools.",
     "1. Scanning: Use the Scanner API to extract all reports and their referenced columns.\n\n"
     "2. Dependency Map: Build a map showing which reports query the deprecated column.\n\n"
     "3. Action: Notify workspace owners. In Tabular Editor, mark the column as `IsHidden = true` first. After a grace period (e.g., 30 days) with no errors, delete the column, minimizing downtime."),
    
    ("Detail the inner workings of Direct Lake storage mode. How does it bypass both Import refresh times and DirectQuery translation overhead by reading Parquet files directly from OneLake? What causes a fallback to DirectQuery mode?",
     "1. Mechanics: Direct Lake loads columns of Parquet files from OneLake directly into Premium capacity RAM on-demand.\n\n"
     "2. Advantage: Zero import refresh duration and no SQL translation.\n\n"
     "3. Fallback: If a query requests attributes not supported in Direct Lake (e.g., complex calculated columns or RLS rules that force fallback), the engine falls back to DirectQuery, sending SQL to the SQL Endpoint."),
    
    ("How do you debug a Power BI Dataset lock condition where an automated XMLA refresh process hangs indefinitely due to concurrent user query read-locks on the same transactional partition?",
     "1. Cause: A long-running user query holds a read lock. The XMLA refresh requests a write lock, resulting in a lock block.\n\n"
     "2. Debugging: Use SQL Server Profiler. Track `Lock Acquired` and `Lock Released` events.\n\n"
     "3. Fix: Enable 'Commit Timeout' or configure the refresh connection to abort conflicting user queries, releasing locks."),
    
    ("Explain how to configure a Parametrized Deployment Pipeline that alters not just data sources, but also modifies structural measure expressions or calculation items depending on whether the target environment is Staging or Production.",
     "1. Pipeline parameters: Define environment parameters in the model (e.g., `Environment` = 'Staging').\n\n"
     "2. DAX Logic: In your measures, reference this parameter: `IF( [Environment] = \"Staging\", [StagingMeasure], [ProdMeasure] )`.\n\n"
     "3. Deploy Rules: In the deployment pipeline, set a rule to change the parameter value dynamically when deploying to Production."),
    
    ("What is the structural significance of the compatibilityLevel property in the metadata structure of a Tabular model? How does upgrading the compatibility level affect available DAX functions and compression algorithms?",
     "1. Compatibility Level: Defines the version of the Tabular engine (e.g., 1500, 1600).\n\n"
     "2. Upgrade impact: Upgrading compatibility levels unlocks new DAX functions (e.g., window functions) and improves VertiPaq compression algorithms.\n\n"
     "3. Deploy: Ensure the target Power BI capacity supports the upgraded level before saving model modifications."),
    
    ("Explain the impact of Conditional Formatting expressions on query volume. If a matrix visual displays 1,000 cells and applies conditional background coloring based on a complex DAX calculation, how many independent query evaluations are executed?",
     "1. Evaluation: The conditional formatting runs as a separate DAX query.\n\n"
     "2. Query Volume: It does not execute 1,000 queries. Power BI groups the cells and executes 1 combined query to retrieve color codes.\n\n"
     "3. Performance: If the background measure is slow, this single query can double the visual rendering time, making it critical to keep formatting measures simple."),
    
    ("How do you remediate an issue where Automatic Page Refresh (APR) configured on a DirectQuery report causes an enterprise gateway to completely saturate its outbound network card bandwidth?",
     "1. Cause: High frequency page refreshes (e.g., every 5 seconds) pull massive rowsets, saturating network bandwidth.\n\n"
     "2. Fix: Increase the refresh interval (e.g., minimum 1 minute).\n\n"
     "3. Optimization: Enable Change Detection. Configure a lightweight measure (e.g., `MAX(Timestamp)`) to poll the database, pulling the full dataset only when changes are detected."),
    
    ("Detail how to utilize Azure DevOps tokenization patterns to clean and update environment secrets inside Power BI semantic model data source connection profiles without exposing passwords or keys in source control repositories.",
     "1. Tokenization: In the Git repository, replace connection secrets with tokens: `#{DbPassword}#`.\n\n"
     "2. Build pipeline: Use the DevOps 'Replace Tokens' task to search for tokens.\n\n"
     "3. Replace: During deployment, replace `#{DbPassword}#` with variables stored securely in DevOps Key Vault integration, protecting secret leaks."),
    
    ("Describe how the Formula Engine executes conditional text concatenation loops (e.g., generating a comma-separated list of selected items using CONCATENATEX over a large dimension), and explain how to mitigate the associated performance penalties.",
     "1. Execution: `CONCATENATEX` forces the Formula Engine to iterate row-by-row, converting values to text and concatenating them in-memory.\n\n"
     "2. Penalty: Extremely slow on large dimensions because it cannot be processed by the parallel Storage Engine.\n\n"
     "3. Mitigation: Limit the selection scope. Wrap the iterator in checks (e.g., `IF(COUNTROWS(VALUES(Dim)) < 50, CONCATENATEX(VALUES(Dim), Dim[Name], \", \"), \"Many Items Selected\")`), avoiding heavy loops."),
    
    ("How do you structure a Multi-developer environment for Power BI utilizing Git Branches, detailing how code changes are isolated, code reviews are conducted on metadata files, and pulling updates into a Main release line is orchestrated?",
     "1. Git Workflow: Developers clone the repository and work on separate feature branches.\n\n"
     "2. Isolation: Developers save their work in `.pbip` format.\n\n"
     "3. Code Review: Merge requests compare changes in `model.bim` or definition files.\n\n"
     "4. Orchestration: Once approved, changes are merged into the `main` branch. The CI/CD pipeline compiles the project and deploys the dataset, keeping the production environment stable."),
    
    ("What are the specific architectural configurations required to allow a Power BI dataset to support DirectQuery pushing down to a secured Azure Databricks cluster utilizing Unity Catalog permissions execution?",
     "1. Configuration: Enable single sign-on (SSO) on the Databricks connection.\n\n"
     "2. Credentials: Pass credentials using OAuth2.\n\n"
     "3. Access Control: Databricks Unity Catalog applies permission rules (row-level, column-level filters) based on the Entra ID user identity, securing access at the source."),
    
    ("Explain how the VertiPaq engine schedules compression dictionary sorting operations. What triggers a complete re-indexing of a column dictionary, and how do you force this optimization routine to execute programmatically?",
     "1. Sorting schedule: During model refresh, VertiPaq analyzes column values, builds dictionaries, and sorts them to optimize compression.\n\n"
     "2. Re-indexing: Triggered by adding new distinct values or running a full model refresh (`ProcessFull`).\n\n"
     "3. Programmatic Force: Run a TMSL script with the type set to `defragment` or execute `ProcessRecalc` on the table to force dictionary re-sorting and optimize memory space.")
]

for idx, (q, a) in enumerate(m_qas_part2):
    pbi_part2.append({
        "id": f"pbi-pq-{idx+21}",
        "category": "POWER BI",
        "niche": "Power Query (M), Data Ingestion Optimization, & Query Folding",
        "question": q,
        "answer": a
    })

for idx, (q, a) in enumerate(admin_qas):
    pbi_part2.append({
        "id": f"pbi-admin-{idx+1}",
        "category": "POWER BI",
        "niche": "Enterprise Administration, Governance, Security (RLS/OLS), & Capacity Management",
        "question": q,
        "answer": a
    })

for idx, (q, a) in enumerate(cicd_qas):
    pbi_part2.append({
        "id": f"pbi-cicd-{idx+1}",
        "category": "POWER BI",
        "niche": "CI/CD, ALM, Lifecycle Management, & Real-World Performance Tuning",
        "question": q,
        "answer": a
    })

# Write pbi_part2.json
with open("/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/pbi_part2.json", "w") as f:
    json.dump(pbi_part2, f, indent=2)

print("Power BI Part 2 JSON generated successfully. Total questions:", len(pbi_part2))
