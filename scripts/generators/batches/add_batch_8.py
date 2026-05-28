import json

new_batch = [
    {
        "id": "medium-fabric-41",
        "category": "FABRIC",
        "niche": "Copilot",
        "difficulty": "MEDIUM",
        "question": "How can Copilot in Fabric assist with Power BI report creation?",
        "answer": "Copilot in Power BI (within Fabric) can generate entire report pages automatically based on natural language prompts (e.g., 'Create a report showing sales by region and product over time'). It analyzes the underlying Semantic Model and suggests relevant visuals, layouts, and DAX measures. It can also generate narrative summaries of the data displayed on the page."
    },
    {
        "id": "medium-fabric-42",
        "category": "FABRIC",
        "niche": "Copilot",
        "difficulty": "MEDIUM",
        "question": "What is a prerequisite for using Copilot in Microsoft Fabric?",
        "answer": "Copilot requires a Fabric capacity of F64 or larger (or a Power BI Premium P1 capacity or larger). Additionally, a tenant administrator must explicitly enable the Copilot tenant switch in the Fabric Admin portal, and data may be processed outside of your geographic region depending on Azure OpenAI availability."
    },
    {
        "id": "medium-fabric-43",
        "category": "FABRIC",
        "niche": "Workspace Management",
        "difficulty": "MEDIUM",
        "question": "What is the 'Viewer' role in a Fabric Workspace?",
        "answer": "The Viewer role provides read-only access to a workspace. A Viewer can view reports and dashboards, and execute SQL queries against a Lakehouse/Warehouse SQL endpoint if granted specific data access. Crucially, they cannot create, edit, or delete any items (like pipelines or notebooks) in the workspace."
    },
    {
        "id": "medium-fabric-44",
        "category": "FABRIC",
        "niche": "Workspace Management",
        "difficulty": "MEDIUM",
        "question": "What is the difference between a 'Contributor' and a 'Member' in a Fabric Workspace?",
        "answer": "Both roles can create, edit, and delete content in the workspace (like building pipelines or reports). The key difference is administrative power: a Member can add or remove users with Viewer or Contributor roles, publish apps, and update workspace settings, whereas a Contributor cannot manage user access or publish apps."
    },
    {
        "id": "medium-fabric-45",
        "category": "FABRIC",
        "niche": "Networking",
        "difficulty": "MEDIUM",
        "question": "How do you securely connect Fabric to an on-premises database without exposing it to the internet?",
        "answer": "You use an On-premises Data Gateway. It is installed on a server within your corporate network. It establishes an outbound, encrypted connection to the Azure Service Bus, allowing Fabric (Data Pipelines, Dataflows, or Power BI) to securely query the on-premises database without requiring inbound ports to be opened on your firewall."
    },
    {
        "id": "medium-fabric-46",
        "category": "FABRIC",
        "niche": "Networking",
        "difficulty": "MEDIUM",
        "question": "What are Managed Private Endpoints in Fabric?",
        "answer": "Managed Private Endpoints allow Fabric Workspaces (specifically Spark Notebooks and Data Pipelines) to securely connect to Azure PaaS resources (like an Azure SQL Database or external Key Vault) over the Microsoft backbone network, bypassing the public internet entirely. They are managed by Fabric, eliminating the need to set up complex VNets."
    },
    {
        "id": "medium-fabric-47",
        "category": "FABRIC",
        "niche": "Data Integration",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of 'Shortcuts' to Amazon S3 in OneLake?",
        "answer": "S3 Shortcuts allow Fabric to virtually map a folder in an AWS S3 bucket directly into a OneLake Lakehouse. The data remains physically stored in AWS, but Fabric Spark and SQL engines can query the data instantly as if it were local. This eliminates the massive egress costs and time delays associated with physically copying data from AWS to Azure."
    },
    {
        "id": "medium-fabric-48",
        "category": "FABRIC",
        "niche": "Data Integration",
        "difficulty": "MEDIUM",
        "question": "How does Fabric handle metadata synchronization for OneLake Shortcuts?",
        "answer": "For internal OneLake shortcuts (between Fabric workspaces), metadata is synchronized synchronously. For external shortcuts (like ADLS Gen2 or S3), Fabric caches the metadata and periodically polls the external source to check for changes (e.g., new files added), maintaining a localized view to ensure fast query performance."
    },
    {
        "id": "medium-fabric-49",
        "category": "FABRIC",
        "niche": "Cost Management",
        "difficulty": "MEDIUM",
        "question": "How does pausing a Fabric Capacity affect your environment?",
        "answer": "When an F-SKU capacity is paused via the Azure Portal, all compute billing stops immediately. However, all workloads assigned to that capacity (Pipelines, Spark jobs, Power BI reports) will fail to run or load. You continue to be billed separately for the OneLake storage consumed, regardless of whether the compute capacity is paused or running."
    },
    {
        "id": "medium-fabric-50",
        "category": "FABRIC",
        "niche": "Data Warehouse",
        "difficulty": "MEDIUM",
        "question": "How do you ingest massive amounts of data efficiently into a Fabric Warehouse using T-SQL?",
        "answer": "You should use the `COPY INTO` statement. It is a highly optimized T-SQL command that parallelizes the ingestion of data from Parquet or CSV files stored in OneLake (or external storage) directly into Warehouse tables. It is vastly faster than traditional INSERT statements."
    },
    {
        "id": "medium-pbi-56",
        "category": "POWER BI",
        "niche": "Advanced Data Modeling",
        "difficulty": "MEDIUM",
        "question": "What is meant by 'Auto-Exist' in DAX?",
        "answer": "Auto-Exist is a feature in the VertiPaq engine that automatically removes impossible combinations of filters when multiple filters are applied to the *same* table. For example, if you filter 'Year=2024' and 'Month=February', it won't evaluate rows for February 2023. However, Auto-Exist can cause unexpected results or performance issues if you use complex OR logic across multiple columns in the same table inside a CALCULATE statement."
    },
    {
        "id": "medium-pbi-57",
        "category": "POWER BI",
        "niche": "Advanced Data Modeling",
        "difficulty": "MEDIUM",
        "question": "How do you handle multiple currencies in a Power BI model?",
        "answer": "You typically use a 'Currency Exchange' dimension table containing daily exchange rates. In DAX, you create a measure that uses `SUMX` to iterate through the Fact table, multiplying the local transaction amount by the corresponding exchange rate (looked up using `RELATED` or `LOOKUPVALUE` based on the transaction date and currency code) to get a unified reporting currency."
    },
    {
        "id": "medium-pbi-58",
        "category": "POWER BI",
        "niche": "Advanced DAX",
        "difficulty": "MEDIUM",
        "question": "Explain the use of the TREATAS function.",
        "answer": "`TREATAS` is a powerful DAX function used to apply the result of a table expression as filters to columns from an unrelated table. It essentially creates a virtual relationship on the fly during a calculation. It is heavily used in advanced disconnected table patterns, replacing older, slower methods like `INTERSECT` or `FILTER(ALL(...))`."
    },
    {
        "id": "medium-pbi-59",
        "category": "POWER BI",
        "niche": "Advanced DAX",
        "difficulty": "MEDIUM",
        "question": "What is the difference between HASONEVALUE and ISFILTERED?",
        "answer": "`ISFILTERED` returns TRUE if a direct filter is applied to the specified column (e.g., via a slicer). `HASONEVALUE` returns TRUE if the context has exactly one distinct value for that column, regardless of whether it was directly filtered or cross-filtered by another column. `HASONEVALUE` is often used to prevent totals from displaying meaningless aggregate ratios."
    },
    {
        "id": "medium-pbi-60",
        "category": "POWER BI",
        "niche": "Visualizations",
        "difficulty": "MEDIUM",
        "question": "How can you optimize a report page containing 30 visuals?",
        "answer": "A page with 30 visuals will perform terribly because Power BI executes a separate DAX query for each visual sequentially (or in small parallel batches). Optimization requires drastically reducing the number of visuals. Combine single-value cards into a multi-row card, use tooltips to hide secondary details, or use bookmarks to toggle visibility of visuals rather than rendering them all at once."
    },
    {
        "id": "medium-pbi-61",
        "category": "POWER BI",
        "niche": "Visualizations",
        "difficulty": "MEDIUM",
        "question": "What is a Report Tooltip page?",
        "answer": "A Report Tooltip page is a specialized, hidden Power BI page. When a user hovers over a data point in a standard visual, instead of showing the default black text box, Power BI renders this entire hidden page as a pop-up, automatically passing the filter context of the hovered data point to the tooltip page. It allows for incredibly rich, contextual drill-down visuals."
    },
    {
        "id": "medium-pbi-62",
        "category": "POWER BI",
        "niche": "Power Query",
        "difficulty": "MEDIUM",
        "question": "What does 'Enable Load' vs 'Include in Report Refresh' mean in Power Query?",
        "answer": "'Enable Load' determines whether the query's output is physically loaded into the Power BI Data Model (VertiPaq). Disabling it is useful for staging queries that are only used to build other queries. 'Include in Report Refresh' determines whether the query reaches out to the source to pull fresh data when the user clicks 'Refresh'. Disabling it is useful for static dimension tables (like fixed country codes) that never change."
    },
    {
        "id": "medium-pbi-63",
        "category": "POWER BI",
        "niche": "Power Query",
        "difficulty": "MEDIUM",
        "question": "How do you unpivot data in Power Query?",
        "answer": "Unpivoting transforms 'wide' data (e.g., columns for Jan, Feb, Mar) into 'tall' data (two columns: 'Attribute' containing the month names, and 'Value' containing the numbers). In Power Query, you select the columns you want to keep static (like ProductID), right-click, and select 'Unpivot Other Columns'. This normalizes the data for efficient DAX modeling."
    },
    {
        "id": "medium-pbi-64",
        "category": "POWER BI",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "What is the On-premises Data Gateway (Personal Mode) vs (Standard Mode)?",
        "answer": "Personal Mode is meant for a single analyst; it runs as an application under their Windows account and can only be used by them for Power BI. Standard Mode is for enterprise use; it runs as a Windows Service, can be used by multiple users across Power BI, Power Automate, and Logic Apps, and supports advanced features like DirectQuery and cluster load balancing."
    },
    {
        "id": "medium-pbi-65",
        "category": "POWER BI",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "What is a Power BI App?",
        "answer": "An App is the primary way to distribute finished Power BI content to large audiences. You publish an App from a Workspace. The App provides a clean, customized navigation menu on the left side, hiding the underlying datasets and workspace complexity from end-users. You can manage access to the App separately from Workspace access."
    },
    {
        "id": "medium-adf-58",
        "category": "ADF",
        "niche": "Mapping Data Flows",
        "difficulty": "MEDIUM",
        "question": "What is the 'Select' transformation used for?",
        "answer": "The Select transformation is primarily used to rename columns, drop unnecessary columns, and reorder columns in the data stream. It is a best practice to place a Select transformation early in your Data Flow to remove unused columns, reducing the amount of data processed in memory by downstream transformations."
    },
    {
        "id": "medium-adf-59",
        "category": "ADF",
        "niche": "Mapping Data Flows",
        "difficulty": "MEDIUM",
        "question": "How does the 'Lookup' transformation differ from the 'Join' transformation?",
        "answer": "The Lookup transformation is specifically optimized for retrieving reference data from a dimension table. Unlike a standard Join, Lookup allows you to return only the 'first matching row' or 'any matching row' if there are multiple matches, preventing the accidental row duplication (Cartesian explosion) that can occur with poorly configured Left Outer Joins."
    },
    {
        "id": "medium-adf-60",
        "category": "ADF",
        "niche": "Mapping Data Flows",
        "difficulty": "MEDIUM",
        "question": "What is a 'Cached Sink' in ADF Data Flows?",
        "answer": "A Cached Sink allows you to write the output of a data stream into Spark's fast in-memory cache rather than writing it to physical disk (like ADLS or SQL). Downstream transformations or even dynamic expressions within the same data flow can then perform ultra-fast lookups against this cached data, which is highly useful for small, frequently accessed dimension tables."
    },
    {
        "id": "medium-adf-61",
        "category": "ADF",
        "niche": "Orchestration",
        "difficulty": "MEDIUM",
        "question": "How can you trigger an ADF pipeline from an external application?",
        "answer": "You can trigger a pipeline programmatically via the Azure Data Factory REST API, PowerShell, or Azure SDKs (Python/C#). The external application authenticates using a Service Principal via Azure AD and sends an HTTP POST request to the `CreateRun` endpoint of the specific pipeline, optionally passing JSON payload for pipeline parameters."
    },
    {
        "id": "medium-adf-62",
        "category": "ADF",
        "niche": "Orchestration",
        "difficulty": "MEDIUM",
        "question": "What happens if a tumbling window trigger fails?",
        "answer": "If a tumbling window trigger fails, it enters a 'Failed' state for that specific time window. Unlike a schedule trigger which simply moves on to the next scheduled time, you can configure the tumbling window trigger to automatically retry the failed window a specified number of times. If it still fails, the window remains in failure until a data engineer manually reruns it."
    },
    {
        "id": "medium-adf-63",
        "category": "ADF",
        "niche": "Orchestration",
        "difficulty": "MEDIUM",
        "question": "Can one tumbling window trigger depend on another?",
        "answer": "Yes. A powerful feature of tumbling window triggers is 'Trigger Dependencies'. You can configure Trigger A (e.g., daily aggregation) to only execute its window if Trigger B (e.g., hourly ingestion) has successfully completed all 24 of its corresponding hourly windows for that same day. This ensures strict data completeness before downstream processing."
    },
    {
        "id": "medium-adf-64",
        "category": "ADF",
        "niche": "Monitoring",
        "difficulty": "MEDIUM",
        "question": "How long does ADF retain pipeline execution history?",
        "answer": "By default, ADF only retains pipeline run, activity run, and trigger run history for exactly 45 days in the user interface. After 45 days, it is permanently deleted. To retain history for longer compliance or auditing purposes, you must route Diagnostic Settings to a Log Analytics Workspace or Azure Storage Account."
    },
    {
        "id": "medium-adf-65",
        "category": "ADF",
        "niche": "Monitoring",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of User Properties in an ADF Activity?",
        "answer": "User Properties allow you to attach custom key-value pairs to an activity run. For example, you can capture a dynamic source file name or a specific parameter value. These properties are then surfaced directly in the ADF Monitoring UI list view, allowing operators to easily search and filter historical runs based on business-specific context without clicking into the raw JSON payload."
    },
    {
        "id": "medium-adf-66",
        "category": "ADF",
        "niche": "Security and Authentication",
        "difficulty": "MEDIUM",
        "question": "What is a Customer-Managed Key (CMK) in ADF?",
        "answer": "By default, Microsoft encrypts the ADF environment (credentials, configurations) using Microsoft-managed keys. For high-security environments, you can implement a CMK. You store your own encryption key in Azure Key Vault and configure ADF to use it. This gives you complete control; if you revoke access to the key in Key Vault, the entire ADF instance becomes instantly inaccessible."
    },
    {
        "id": "medium-adf-67",
        "category": "ADF",
        "niche": "Security and Authentication",
        "difficulty": "MEDIUM",
        "question": "How do you securely pass a connection string to a Databricks activity in ADF?",
        "answer": "You should never hardcode connection strings. Instead, store the Databricks Personal Access Token (PAT) in Azure Key Vault. Create an ADF Linked Service for Key Vault using Managed Identity. Then, create the Databricks Linked Service and reference the Key Vault secret. ADF will securely fetch the token and authenticate with Databricks at runtime."
    },
    {
        "id": "medium-sql-48",
        "category": "SQL SERVER",
        "niche": "Query Optimization",
        "difficulty": "MEDIUM",
        "question": "What is an Index Seek vs an Index Scan?",
        "answer": "An Index Scan reads every row in the index (similar to a table scan, but reading the index structure instead), which is highly inefficient for large tables. An Index Seek traverses the B-tree structure of the index to jump directly to the specific rows that match a `WHERE` clause, making it extremely fast. You want to see Seeks, not Scans, in your execution plans."
    },
    {
        "id": "medium-sql-49",
        "category": "SQL SERVER",
        "niche": "Query Optimization",
        "difficulty": "MEDIUM",
        "question": "What causes a 'Key Lookup' in an execution plan?",
        "answer": "A Key Lookup occurs when a Non-Clustered Index is used to find rows (an Index Seek), but the index does *not* contain all the columns requested in the `SELECT` clause (it is not a Covering Index). The engine must take the row pointers from the non-clustered index and perform expensive, row-by-row lookups back into the Clustered Index to retrieve the missing columns."
    },
    {
        "id": "medium-sql-50",
        "category": "SQL SERVER",
        "niche": "Query Optimization",
        "difficulty": "MEDIUM",
        "question": "How can you resolve a Key Lookup issue?",
        "answer": "You resolve a Key Lookup by modifying the Non-Clustered Index to include the missing columns. You can either add them to the main index key (if they are used for filtering/sorting) or use the `INCLUDE` clause to simply attach the data to the leaf level of the index. This turns it into a Covering Index and eliminates the Key Lookup operation."
    },
    {
        "id": "medium-sql-51",
        "category": "SQL SERVER",
        "niche": "Views",
        "difficulty": "MEDIUM",
        "question": "What is an Indexed View (Materialized View) in SQL Server?",
        "answer": "A standard View is just a saved query; it executes every time you call it. An Indexed View has a unique clustered index created on it, which forces SQL Server to physically store the result set of the view on disk. When the underlying base tables are updated, SQL Server automatically maintains the data in the indexed view. This drastically speeds up complex aggregations at the cost of slower inserts/updates on the base tables."
    },
    {
        "id": "medium-sql-52",
        "category": "SQL SERVER",
        "niche": "Views",
        "difficulty": "MEDIUM",
        "question": "What does SCHEMABINDING do when creating a View?",
        "answer": "`WITH SCHEMABINDING` prevents structural changes to the underlying base tables that would break the view. For example, if a view uses `TableA.ColumnX`, a DBA cannot drop or rename `ColumnX` without first dropping the view. It is also a mandatory requirement if you want to create an Indexed View."
    },
    {
        "id": "medium-sql-53",
        "category": "SQL SERVER",
        "niche": "JSON and XML",
        "difficulty": "MEDIUM",
        "question": "How do you parse a JSON string in T-SQL?",
        "answer": "You use the `OPENJSON()` table-valued function. It parses JSON text and returns objects and properties as rows and columns. You can define a `WITH` clause to strictly map JSON properties to specific SQL data types. To extract a single scalar value from a JSON string, you use the `JSON_VALUE()` function."
    },
    {
        "id": "medium-sql-54",
        "category": "SQL SERVER",
        "niche": "JSON and XML",
        "difficulty": "MEDIUM",
        "question": "How do you format a SQL query result as a JSON array?",
        "answer": "You append the `FOR JSON PATH` (or `FOR JSON AUTO`) clause to the end of your `SELECT` statement. SQL Server will automatically format the result set into a JSON array of objects, handling data type conversions. You can control the nested hierarchy of the JSON by using dot notation in your column aliases (e.g., `SELECT ID AS 'Employee.ID'`)."
    },
    {
        "id": "medium-sql-55",
        "category": "SQL SERVER",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "What are Dynamic Management Views (DMVs)?",
        "answer": "DMVs are system views and functions built into SQL Server that return server state information that can be used to monitor the health of a server instance, diagnose problems, and tune performance. Examples include `sys.dm_exec_query_stats` (finding slow queries) or `sys.dm_os_wait_stats` (finding what processes are waiting on)."
    },
    {
        "id": "medium-sql-56",
        "category": "SQL SERVER",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "Explain the difference between TRUNCATE and DELETE.",
        "answer": "`DELETE` is a DML command that removes rows one by one, recording each deletion in the transaction log (which is slow and uses lots of log space), and it fires triggers. `TRUNCATE` is a DDL command that deallocates entire data pages instantly, using minimal transaction logging, and it does not fire triggers. `TRUNCATE` is vastly faster for emptying a table."
    },
    {
        "id": "medium-sql-57",
        "category": "SQL SERVER",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "What is TempDB used for in SQL Server?",
        "answer": "TempDB is a global system database used to hold temporary user objects (like `#TempTables`), internal objects created by the SQL engine during complex processing (like large sorts, hash joins, or spooling), and row versions for isolation levels. It is recreated every time the SQL Server service restarts, so data in TempDB is strictly ephemeral."
    },
    {
        "id": "medium-datalake-26",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Integration",
        "difficulty": "MEDIUM",
        "question": "What is the role of Apache Kafka in a Data Lake architecture?",
        "answer": "Kafka acts as a highly scalable, fault-tolerant message broker for real-time data ingestion. Instead of applications writing directly to the Data Lake, they publish streams of events to Kafka topics. Stream processing engines (like Spark Streaming or Flink) then consume these topics and write the data reliably into the Bronze zone of the Data Lake."
    },
    {
        "id": "medium-datalake-27",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Integration",
        "difficulty": "MEDIUM",
        "question": "How do you handle schema evolution in streaming ingestion?",
        "answer": "You typically use a Schema Registry (like Confluent Schema Registry). Producers validate their message schemas against the registry before publishing to Kafka. If the schema evolves (e.g., a column is added), the registry manages the versioning and compatibility rules, ensuring downstream consumers (like Spark writing to Delta Lake) don't break when encountering the new format."
    },
    {
        "id": "medium-datalake-28",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Security",
        "difficulty": "MEDIUM",
        "question": "What is Data Masking in the context of a Data Lake?",
        "answer": "Data masking obfuscates sensitive data (PII like Social Security Numbers) to protect user privacy. In a Data Lake, this is usually applied during the transition from the Bronze to Silver layer. The raw data is read, hashing or masking algorithms are applied to specific columns, and the obscured data is written to the Silver layer, which is exposed to general analysts."
    },
    {
        "id": "medium-datalake-29",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Security",
        "difficulty": "MEDIUM",
        "question": "Explain Tokenization vs Encryption.",
        "answer": "Encryption uses a mathematical algorithm and a key to scramble data; it can be reversed (decrypted) if you have the key. Tokenization replaces sensitive data with a randomly generated, non-mathematical placeholder (a token) stored in a highly secure external vault. The Data Lake only stores the token, making it useless to attackers even if the lake is compromised."
    },
    {
        "id": "medium-datalake-30",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Advanced Concepts",
        "difficulty": "MEDIUM",
        "question": "What is Data Mesh architecture?",
        "answer": "Data Mesh is a decentralized architectural paradigm. Instead of a centralized Data Engineering team managing a monolithic Data Lake, data ownership is distributed to domain-specific business teams (e.g., HR owns HR data). These domains treat data as a 'Product' and expose it via standardized APIs or shared tables to the rest of the organization, focusing on decentralized governance and scalability."
    },
    {
        "id": "medium-spark-31",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks Delta",
        "difficulty": "MEDIUM",
        "question": "What is Delta Live Tables (DLT)?",
        "answer": "DLT is a declarative framework in Databricks for building reliable data pipelines. Instead of writing complex imperative Spark code to manage data dependencies, state, and error handling, you simply declare the target Delta tables using SQL or Python (e.g., `CREATE LIVE TABLE...`). DLT automatically orchestrates the DAG, manages infrastructure, handles retries, and enforces data quality expectations."
    },
    {
        "id": "medium-spark-32",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks Delta",
        "difficulty": "MEDIUM",
        "question": "How do you handle bad data in Delta Live Tables?",
        "answer": "You define 'Expectations' (data quality constraints). You can configure three behaviors for violations: `expect` (allow the bad record but record the failure in metrics), `expect_or_drop` (silently drop the bad record and continue), or `expect_or_fail` (halt the entire pipeline execution immediately if a bad record is encountered)."
    },
    {
        "id": "medium-spark-33",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks SQL",
        "difficulty": "MEDIUM",
        "question": "What is Databricks SQL (DBSQL)?",
        "answer": "DBSQL is a serverless data warehouse service within Databricks. It provides an optimized SQL endpoint (using the Photon C++ execution engine) designed specifically for BI tools like Power BI or Tableau to query the Delta Lake. It replaces the need for data analysts to use interactive Spark Notebooks, offering a traditional SQL editor, dashboards, and alerting."
    },
    {
        "id": "medium-spark-34",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks SQL",
        "difficulty": "MEDIUM",
        "question": "What is the Photon engine in Databricks?",
        "answer": "Photon is a next-generation, native vectorized query engine written in C++ that integrates directly with Spark. It bypasses the JVM for intensive data operations, optimizing execution for modern CPU architectures. It dramatically accelerates performance for SQL workloads (like Joins and Aggregations) on Delta Lake without requiring any changes to user code."
    },
    {
        "id": "medium-spark-35",
        "category": "SPARK & DATABRICKS",
        "niche": "Security",
        "difficulty": "MEDIUM",
        "question": "How do you implement Row-Level Security in Databricks?",
        "answer": "Historically RLS required complex view logic, but with Databricks Unity Catalog, you can now define RLS natively using SQL. You create a SQL function that returns a boolean based on the `current_user()`, and apply that function to a table using the `ALTER TABLE ... WITH ROW FILTER` syntax, ensuring secure access regardless of which Databricks cluster is querying it."
    }
]

with open('/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/questions.js', 'r') as f:
    content = f.read()

json_str = json.dumps(new_batch, indent=2)
json_str = json_str[1:-1].strip()

if content.strip().endswith('];'):
    new_content = content.rsplit(']', 1)[0]
    if not new_content.strip().endswith('['):
        new_content += ",\n"
    new_content += json_str + "\n];\n"
    
    with open('/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/questions.js', 'w') as f:
        f.write(new_content)
    print("Batch 8 (60 questions) added successfully.")
