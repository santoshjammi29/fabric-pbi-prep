import json

new_batch = [
    {
        "id": "medium-fabric-11",
        "category": "FABRIC",
        "niche": "Security and Governance",
        "difficulty": "MEDIUM",
        "question": "What is Object-Level Security (OLS) in Microsoft Fabric, and how does it differ from RLS?",
        "answer": "While Row-Level Security (RLS) restricts access to specific rows of data based on user identity, Object-Level Security (OLS) completely hides entire tables or columns from users who do not have permission. If a user queries a table protected by OLS, they receive an error stating the object does not exist, whereas RLS simply returns an empty or filtered result set."
    },
    {
        "id": "medium-fabric-12",
        "category": "FABRIC",
        "niche": "Security and Governance",
        "difficulty": "MEDIUM",
        "question": "Explain how Workspace Identity works in Fabric.",
        "answer": "A Workspace Identity is a managed identity automatically created for a Fabric Workspace. It allows items within the workspace (like Data Pipelines or Notebooks) to securely authenticate to external Azure resources (like Azure Key Vault or ADLS Gen2) without using hardcoded service principals or SAS tokens, adhering to the principle of least privilege."
    },
    {
        "id": "medium-fabric-13",
        "category": "FABRIC",
        "niche": "Real-Time Analytics",
        "difficulty": "MEDIUM",
        "question": "What is a KQL Database in Microsoft Fabric?",
        "answer": "A KQL Database (Kusto Query Language) is optimized for highly interactive analytics over massive streams of telemetric, log, and time-series data. It is the core engine behind Fabric's Real-Time Analytics experience. Data ingested here is automatically indexed and partitioned by time, allowing sub-second querying over billions of records using KQL."
    },
    {
        "id": "medium-fabric-14",
        "category": "FABRIC",
        "niche": "Real-Time Analytics",
        "difficulty": "MEDIUM",
        "question": "How do Eventstreams integrate with KQL Databases?",
        "answer": "Fabric Eventstreams act as the ingestion layer that captures real-time data from sources like Azure Event Hubs or IoT Hubs. You can route an Eventstream directly into a KQL Database, where the data is immediately appended to a table and becomes available for near-real-time querying and dashboarding without any complex ETL logic."
    },
    {
        "id": "medium-fabric-15",
        "category": "FABRIC",
        "niche": "Data Science",
        "difficulty": "MEDIUM",
        "question": "What is the role of MLflow in Microsoft Fabric?",
        "answer": "Fabric natively integrates with MLflow to manage the end-to-end machine learning lifecycle. It provides experiment tracking (logging parameters, metrics, and models during training) and a Model Registry (versioning and managing approved models). Data Scientists use the `mlflow` Python library within Fabric Notebooks to track their experiments automatically."
    },
    {
        "id": "medium-fabric-16",
        "category": "FABRIC",
        "niche": "Data Science",
        "difficulty": "MEDIUM",
        "question": "How do you deploy a trained machine learning model for batch scoring in Fabric?",
        "answer": "After registering a model in the MLflow Model Registry, you use the `PREDICT` function in Fabric. This function applies the registered model directly to a Spark DataFrame or a SQL query in a Lakehouse/Warehouse, enabling massive-scale batch inferencing without needing to deploy the model as an external REST API endpoint."
    },
    {
        "id": "medium-fabric-17",
        "category": "FABRIC",
        "niche": "Git Integration",
        "difficulty": "MEDIUM",
        "question": "Explain how Fabric Workspaces integrate with Azure DevOps Git.",
        "answer": "Fabric allows you to connect a Workspace directly to a Git repository in Azure DevOps. All supported Fabric items (like Notebooks, Reports, Semantic Models) are serialized into code (JSON/YAML) and synced to the repository. This enables developers to use standard Git branching, pull requests, and CI/CD pipelines to promote code between workspaces."
    },
    {
        "id": "medium-fabric-18",
        "category": "FABRIC",
        "niche": "Git Integration",
        "difficulty": "MEDIUM",
        "question": "What happens if you modify a Fabric item in the Workspace while someone else modifies it in Git?",
        "answer": "Fabric tracks the sync status of the workspace against the Git branch. If concurrent edits occur, Fabric will detect a conflict and mark the item as 'Unsynced'. To resolve it, the developer must either pull the changes from Git (overwriting the workspace changes) or commit their workspace changes to Git (overwriting the repo changes). Fabric does not currently support auto-merging complex item JSON."
    },
    {
        "id": "medium-fabric-19",
        "category": "FABRIC",
        "niche": "OneLake Architecture",
        "difficulty": "MEDIUM",
        "question": "What is the OneLake file explorer?",
        "answer": "The OneLake file explorer is a Windows application that seamlessly integrates OneLake into Windows File Explorer, similar to OneDrive. It allows data engineers and business users to browse workspaces, navigate Lakehouses, and view Delta/Parquet files exactly as if they were local files on their PC, enabling easy drag-and-drop uploads."
    },
    {
        "id": "medium-fabric-20",
        "category": "FABRIC",
        "niche": "OneLake Architecture",
        "difficulty": "MEDIUM",
        "question": "Can external applications read data from OneLake using standard APIs?",
        "answer": "Yes, OneLake fully supports the ADLS Gen2 (Azure Data Lake Storage Gen2) APIs. Any external tool, application, or script (like Databricks, Snowflake, or a Python script) that supports reading from ADLS Gen2 can read data directly from OneLake by using the `abfss://` protocol and the OneLake DFS endpoint, provided they authenticate with Azure AD."
    },
    {
        "id": "medium-pbi-26",
        "category": "POWER BI",
        "niche": "Advanced Data Modeling",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of a Disconnected Table in a Power BI data model?",
        "answer": "A disconnected table has no physical relationships to the rest of the data model. It is typically used for 'What-If' parameters, dynamic measure selection, or advanced banding/segmentation. A DAX measure reads the user's selection from the disconnected table using `SELECTEDVALUE()` and then modifies its calculation logic accordingly."
    },
    {
        "id": "medium-pbi-27",
        "category": "POWER BI",
        "niche": "Advanced Data Modeling",
        "difficulty": "MEDIUM",
        "question": "How do you resolve a Many-to-Many relationship in Power BI without using bidirectional cross-filtering?",
        "answer": "You resolve it by introducing a 'Bridge Table'. You extract the distinct values of the linking column from both tables to create a new, unique dimension table. You then create two active 1-to-Many relationships from the new Bridge Table to the two original tables, effectively routing the filter context cleanly without the performance hit of bidirectional filters."
    },
    {
        "id": "medium-pbi-28",
        "category": "POWER BI",
        "niche": "Advanced DAX",
        "difficulty": "MEDIUM",
        "question": "Explain the difference between VALUES() and DISTINCT() in DAX.",
        "answer": "Both return a one-column table of unique values. However, if there are referential integrity violations (e.g., a Fact table has a CustomerID that doesn't exist in the Customer dimension table), `VALUES()` will return the distinct values *plus* a 'Blank' row to account for the missing relationship. `DISTINCT()` will only return the explicit values that exist in the column, omitting the Blank row."
    },
    {
        "id": "medium-pbi-29",
        "category": "POWER BI",
        "niche": "Advanced DAX",
        "difficulty": "MEDIUM",
        "question": "What is the KEEPFILTERS function, and when should it be used?",
        "answer": "`KEEPFILTERS` modifies how `CALCULATE` applies filters. By default, `CALCULATE` overrides any existing external filters on a column with its own filter argument. When you wrap a filter argument in `KEEPFILTERS()`, DAX intersects the new filter with the existing external filter context (using AND logic) rather than overriding it."
    },
    {
        "id": "medium-pbi-30",
        "category": "POWER BI",
        "niche": "Advanced DAX",
        "difficulty": "MEDIUM",
        "question": "How does the REMOVEFILTERS function differ from ALL?",
        "answer": "`REMOVEFILTERS` is functionally identical to `ALL` when used as a filter modifier inside `CALCULATE`; it clears filters from the specified table or columns. However, `REMOVEFILTERS` cannot be used to return a physical table (e.g., you cannot use it in an iterator like `SUMX(REMOVEFILTERS(Table), ...)`). It is strictly a calculate modifier, making code intent clearer."
    },
    {
        "id": "medium-pbi-31",
        "category": "POWER BI",
        "niche": "Power Query",
        "difficulty": "MEDIUM",
        "question": "What is the Value.NativeQuery function in M?",
        "answer": "`Value.NativeQuery` allows you to execute a custom, handwritten SQL query against a relational database source in Power Query. Importantly, you can enable Query Folding for subsequent M steps applied on top of this custom SQL by setting the optional `EnableFolding = true` parameter, provided the source supports it."
    },
    {
        "id": "medium-pbi-32",
        "category": "POWER BI",
        "niche": "Power Query",
        "difficulty": "MEDIUM",
        "question": "How do you handle dynamic API pagination in Power Query when the API relies on an offset parameter?",
        "answer": "You must write a custom recursive M function using `List.Generate`. The function will make an API call using `Web.Contents`, extract the data and the next offset token, and then call itself repeatedly until the API returns no data or no next token, combining the results into a single list."
    },
    {
        "id": "medium-pbi-33",
        "category": "POWER BI",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "What are XMLA Endpoints in Power BI Premium?",
        "answer": "The XMLA endpoint allows third-party tools (like SQL Server Management Studio, DAX Studio, Tabular Editor, or custom scripts) to connect directly to Power BI datasets as if they were Azure Analysis Services databases. It enables advanced dataset management, metadata deployment, and automated refresh orchestration that isn't possible through the standard Power BI UI."
    },
    {
        "id": "medium-pbi-34",
        "category": "POWER BI",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "Explain the concept of Incremental Refresh in Power BI.",
        "answer": "Incremental Refresh partitions a massive table by date. Instead of reloading all 10 years of historical data every day, Power BI only truncates and reloads the data for the most recent window (e.g., the last 7 days) while leaving the historical partitions untouched. This drastically reduces refresh time and database load. It requires defining `RangeStart` and `RangeEnd` parameters in Power Query."
    },
    {
        "id": "medium-pbi-35",
        "category": "POWER BI",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "What is a Power BI Datamart?",
        "answer": "A Datamart is a fully managed, low-code/no-code SQL database built into the Power BI Service (requires Premium). It allows analysts to ingest data via Dataflows, store it in an Azure SQL DB, query it using a visual query builder or T-SQL, and automatically generates a Semantic Model on top of it, providing an end-to-end self-service data warehousing solution."
    },
    {
        "id": "medium-adf-33",
        "category": "ADF",
        "niche": "Mapping Data Flows",
        "difficulty": "MEDIUM",
        "question": "Explain the 'Window' transformation in a Mapping Data Flow.",
        "answer": "The Window transformation performs calculations over a specific window (range) of rows related to the current row, similar to SQL window functions. You define a 'Partition By' clause (to group rows), a 'Sort' clause (to order rows within the partition), and the 'Window Range' (e.g., rows between unbounded preceding and current row) to calculate running totals, moving averages, or rank rows."
    },
    {
        "id": "medium-adf-34",
        "category": "ADF",
        "niche": "Mapping Data Flows",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of the 'Alter Row' transformation?",
        "answer": "The Alter Row transformation sets policies (Insert, Update, Delete, Upsert) on rows based on specific conditions. It is used exclusively when writing to a database sink. For example, you can write an expression like `Upsert if: isNotNull(EmployeeID)` to instruct the sink database to perform a SQL MERGE/UPSERT operation instead of a standard INSERT."
    },
    {
        "id": "medium-adf-35",
        "category": "ADF",
        "niche": "Mapping Data Flows",
        "difficulty": "MEDIUM",
        "question": "How do you flatten complex JSON data in ADF?",
        "answer": "You use the 'Flatten' transformation in a Mapping Data Flow. It takes an array structure within a JSON hierarchy and 'unrolls' it, creating a new flat row for every item in the array, while duplicating the parent node's data across each new row. This is essential for converting nested JSON documents into relational tables."
    },
    {
        "id": "medium-adf-36",
        "category": "ADF",
        "niche": "Orchestration",
        "difficulty": "MEDIUM",
        "question": "What is the 'Until' activity in ADF, and when would you use it?",
        "answer": "The 'Until' activity acts as a Do-While loop. It repeatedly executes its inner activities until a specified boolean condition evaluates to true. It is commonly used for polling external asynchronous APIs (e.g., triggering a long-running REST API job and looping an HTTP status check every 30 seconds until the API returns 'Completed')."
    },
    {
        "id": "medium-adf-37",
        "category": "ADF",
        "niche": "Orchestration",
        "difficulty": "MEDIUM",
        "question": "How do you pass the output of a Web Activity to a subsequent Set Variable activity?",
        "answer": "You use ADF's dynamic expression language. If the Web Activity is named 'CallAPI', you access its JSON response body in the Set Variable activity using the expression `@activity('CallAPI').output.ResponseProperty`, replacing 'ResponseProperty' with the actual JSON key returned by the API."
    },
    {
        "id": "medium-datalake-13",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Performance Optimization",
        "difficulty": "MEDIUM",
        "question": "What is Partitioning in a Data Lake, and how does it improve query performance?",
        "answer": "Partitioning organizes data into a hierarchy of physical folders based on column values (commonly by Date: `/year=2023/month=10/`). When a query filters on the partitioned column (`WHERE year=2023`), the processing engine performs 'Partition Pruning', meaning it skips reading all files in unrelated folders, drastically reducing disk I/O and speeding up the query."
    },
    {
        "id": "medium-datalake-14",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Performance Optimization",
        "difficulty": "MEDIUM",
        "question": "What is over-partitioning, and why is it dangerous in a Data Lake?",
        "answer": "Over-partitioning occurs when you partition data by a high-cardinality column (e.g., `CustomerID` or `Minute`), resulting in thousands of tiny folders containing very small files. This creates a severe 'Small Files Problem', crippling the file system's NameNode with metadata overhead and causing Spark/Databricks queries to slow down significantly due to excessive file open/close operations."
    },
    {
        "id": "medium-datalake-15",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Lake Zones",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of a 'Landing Zone' or 'Transient Zone'?",
        "answer": "The Landing Zone is a temporary storage area where source systems upload their raw files via SFTP or API. Data is held here only temporarily. Once an ETL orchestrator (like ADF) picks up the file, validates its integrity, and moves it to the permanent Bronze/Raw zone, the file is usually deleted from the Landing Zone to prevent clutter and security risks."
    },
    {
        "id": "medium-sql-26",
        "category": "SQL SERVER",
        "niche": "Security",
        "difficulty": "MEDIUM",
        "question": "What is Dynamic Data Masking (DDM) in Azure SQL?",
        "answer": "Dynamic Data Masking limits sensitive data exposure by masking it to non-privileged users on the fly. You define rules on specific columns (e.g., masking a credit card column to show only 'XXXX-XXXX-XXXX-1234'). The data in the database remains unencrypted and unchanged, but the SQL engine intercepts the query results and applies the mask before returning data to the user."
    },
    {
        "id": "medium-sql-27",
        "category": "SQL SERVER",
        "niche": "Security",
        "difficulty": "MEDIUM",
        "question": "Explain Always Encrypted in Azure SQL Database.",
        "answer": "Always Encrypted ensures that sensitive data (like SSNs) remains encrypted at rest, in transit, and even in memory during execution. The encryption keys are managed outside the database (e.g., in Azure Key Vault). The client application encrypts the data before sending it to SQL Server, meaning DBAs with full `sysadmin` access to the database cannot read the plaintext data."
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
    print("Batch 5 (30 questions) added successfully.")
