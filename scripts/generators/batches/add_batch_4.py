import json

new_batch = [
    {
        "id": "medium-fabric-6",
        "category": "FABRIC",
        "niche": "OneLake Architecture",
        "difficulty": "MEDIUM",
        "question": "What is the OneLake Data Hub in Microsoft Fabric?",
        "answer": "The OneLake Data Hub is a centralized portal within Fabric that allows users to discover, manage, and reuse all data items (Lakehouses, Warehouses, Datasets, Datamarts) across all workspaces they have access to. It acts as a catalog, showing endorsements (Promoted/Certified), data lineage, and allowing users to easily connect these items to new Power BI reports or notebooks."
    },
    {
        "id": "medium-fabric-7",
        "category": "FABRIC",
        "niche": "OneLake Architecture",
        "difficulty": "MEDIUM",
        "question": "How does the 'Direct Lake' mode in Power BI differ from 'DirectQuery'?",
        "answer": "DirectQuery translates DAX queries into SQL and pushes them to the underlying database (slow for massive data). Direct Lake mode allows the Power BI engine to read Delta Parquet files directly from OneLake into its VertiPaq memory engine on the fly, without importing or duplicating the data. It provides the performance of 'Import' mode with the real-time freshness of 'DirectQuery'."
    },
    {
        "id": "medium-fabric-8",
        "category": "FABRIC",
        "niche": "Fabric Compute",
        "difficulty": "MEDIUM",
        "question": "What are Fabric Capacity Units (CUs)?",
        "answer": "Fabric Capacity Units (CUs) are the standardized measure of compute power in Microsoft Fabric. Instead of provisioning separate clusters for Data Factory, Spark, SQL, and Power BI, a tenant purchases a pool of CUs (e.g., F64 capacity). All Fabric workloads draw from this shared, serverless pool dynamically, simplifying cost management and resource scaling."
    },
    {
        "id": "medium-fabric-9",
        "category": "FABRIC",
        "niche": "Fabric Compute",
        "difficulty": "MEDIUM",
        "question": "Explain 'Smoothing' in Microsoft Fabric capacity management.",
        "answer": "Smoothing is a background process that averages out sudden spikes in compute usage (e.g., a massive Spark job or high-concurrency Power BI refresh) over a longer period (usually 24 hours). This prevents jobs from failing during temporary CPU spikes, allowing workloads to briefly consume more CUs than the purchased capacity, provided the average usage remains within the limit."
    },
    {
        "id": "medium-fabric-10",
        "category": "FABRIC",
        "niche": "Fabric SQL",
        "difficulty": "MEDIUM",
        "question": "What is the difference between a Fabric Warehouse and a Fabric Lakehouse SQL Endpoint?",
        "answer": "A Fabric Warehouse has full Read/Write capabilities via T-SQL; you use SQL statements to ingest, modify, and query data. A Lakehouse SQL Endpoint is strictly Read-Only via T-SQL; it automatically exposes the Delta tables created by Spark/Notebooks in the Lakehouse, allowing BI analysts to query the lake using familiar SQL without managing the underlying compute."
    },
    {
        "id": "medium-sql-21",
        "category": "SQL SERVER",
        "niche": "Advanced Functions",
        "difficulty": "MEDIUM",
        "question": "How does the STRING_AGG function work in SQL Server?",
        "answer": "STRING_AGG is an aggregate function that concatenates the values of string expressions and places a separator (like a comma) between them. It replaces the old, complex `FOR XML PATH` workaround. It is often used with a `GROUP BY` clause to combine multiple child rows into a single string column per parent row."
    },
    {
        "id": "medium-sql-22",
        "category": "SQL SERVER",
        "niche": "Advanced Functions",
        "difficulty": "MEDIUM",
        "question": "Explain the difference between ISNULL and COALESCE.",
        "answer": "Both replace NULL with a specified replacement value. However, `ISNULL` is T-SQL specific, evaluates exactly two arguments, and the data type of the result is determined by the first argument. `COALESCE` is ANSI SQL standard, accepts multiple arguments (returning the first non-NULL value), and the data type is determined by the highest precedence among all arguments."
    },
    {
        "id": "medium-sql-23",
        "category": "SQL SERVER",
        "niche": "Advanced Functions",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of the OFFSET-FETCH clause?",
        "answer": "The OFFSET-FETCH clause is used in conjunction with the ORDER BY clause to provide pagination. `OFFSET X ROWS` skips the first X rows of the sorted result set, and `FETCH NEXT Y ROWS ONLY` returns the next Y rows. This is highly efficient for returning data in pages to a web application UI."
    },
    {
        "id": "medium-sql-24",
        "category": "SQL SERVER",
        "niche": "Advanced Functions",
        "difficulty": "MEDIUM",
        "question": "How does the TRY_CONVERT function differ from CONVERT?",
        "answer": "`CONVERT` attempts to cast a value to a specified data type, but if the conversion fails (e.g., converting 'ABC' to an INT), the entire query throws an error and aborts. `TRY_CONVERT` safely attempts the cast; if it fails, it simply returns a NULL value instead of crashing the query, making it excellent for cleansing dirty data."
    },
    {
        "id": "medium-sql-25",
        "category": "SQL SERVER",
        "niche": "Advanced Functions",
        "difficulty": "MEDIUM",
        "question": "What is a Table-Valued Parameter (TVP)?",
        "answer": "A TVP allows you to pass multiple rows of data (a table) as a single parameter to a stored procedure or user-defined function. You first create a User-Defined Table Type, declare a variable of that type, populate it, and pass it to the procedure. This is vastly more efficient for bulk inserts/updates than calling a stored procedure repeatedly in a loop from an application."
    },
    {
        "id": "medium-pbi-21",
        "category": "POWER BI",
        "niche": "Performance Tuning",
        "difficulty": "MEDIUM",
        "question": "How do you identify a slow-performing DAX measure in Power BI Desktop?",
        "answer": "You use the built-in Performance Analyzer. You start recording, interact with the visuals (e.g., clicking a slicer), and it records the exact milliseconds spent on the DAX query, Visual Display, and Other processes. You can then copy the slow DAX query and paste it into external tools like DAX Studio for deeper query plan analysis."
    },
    {
        "id": "medium-pbi-22",
        "category": "POWER BI",
        "niche": "Performance Tuning",
        "difficulty": "MEDIUM",
        "question": "What is the VertiPaq engine, and how does it compress data?",
        "answer": "VertiPaq is the in-memory columnar database engine behind Power BI. It compresses data using three main algorithms: Value Encoding (storing mathematical offsets instead of raw numbers), Hash Encoding (replacing distinct string values with integer keys from a dictionary), and Run-Length Encoding (RLE) (storing a value and the number of consecutive times it appears)."
    },
    {
        "id": "medium-pbi-23",
        "category": "POWER BI",
        "niche": "Performance Tuning",
        "difficulty": "MEDIUM",
        "question": "Why is column cardinality crucial for Power BI model performance?",
        "answer": "Cardinality refers to the number of unique values in a column. High cardinality columns (like exact timestamps or GUIDs) cannot be efficiently compressed by the VertiPaq Hash or RLE algorithms. This drastically inflates the RAM required for the model and slows down filtering and aggregations. Such columns should be split (e.g., Date and Time separately) or removed if not needed."
    },
    {
        "id": "medium-pbi-24",
        "category": "POWER BI",
        "niche": "Performance Tuning",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of Aggregation Tables in Power BI?",
        "answer": "Aggregation tables store pre-calculated, summarized data at a higher granularity (e.g., Sales by Month instead of Sales by Transaction). In a Composite Model, Power BI can transparently route high-level queries to this small, fast, imported in-memory agg table, while only falling back to a slow DirectQuery connection against the massive raw table when a user drills down to the transaction level."
    },
    {
        "id": "medium-pbi-25",
        "category": "POWER BI",
        "niche": "Performance Tuning",
        "difficulty": "MEDIUM",
        "question": "How does turning off 'Auto Date/Time' improve Power BI models?",
        "answer": "By default, Power BI creates a hidden Date table for every single Date/Time column in your entire model to support hierarchy drill-downs. In large models with many date columns, this generates massive amounts of hidden metadata and bloats the file size. Turning it off and relying on a single, centralized, custom Date table optimizes memory and standardizes time intelligence."
    },
    {
        "id": "medium-adf-31",
        "category": "ADF",
        "niche": "Error Handling",
        "difficulty": "MEDIUM",
        "question": "How do you implement a 'Try-Catch' logic flow in an ADF Pipeline?",
        "answer": "ADF doesn't have a native Try-Catch activity block. Instead, you simulate it using Activity Dependency paths. You connect the main activity (Try) to an error-handling activity (Catch) using the red 'On Failure' dependency arrow. If the main activity fails, the Catch activity executes (e.g., logging to a database). You can also use the 'On Completion' (blue) and 'On Success' (green) paths."
    },
    {
        "id": "medium-adf-32",
        "category": "ADF",
        "niche": "Error Handling",
        "difficulty": "MEDIUM",
        "question": "What happens to a pipeline's status if an activity fails, but you catch the error with an 'On Failure' path?",
        "answer": "If an activity fails, but you have routed the failure to a subsequent activity via an 'On Failure' path, the overall pipeline run status will still report as 'Failed' by default. To make the pipeline report 'Success' (handling the error gracefully), you must add a dummy activity (like a Set Variable) at the end of the error path and configure it to override the failure state, or ensure no downstream activities depend on the failed one."
    },
    {
        "id": "medium-datalake-11",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Lake Security",
        "difficulty": "MEDIUM",
        "question": "Explain how POSIX-like Access Control Lists (ACLs) work in ADLS Gen2.",
        "answer": "ADLS Gen2 supports POSIX ACLs at the file and directory level. You can assign Read (R), Write (W), and Execute (X) permissions to the Owning User, Owning Group, or specific Entra ID users/groups. Importantly, to read a file deep in a folder hierarchy, a user needs 'Execute' permission on every parent directory leading down to the file, and 'Read' on the file itself."
    },
    {
        "id": "medium-datalake-12",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Lake Security",
        "difficulty": "MEDIUM",
        "question": "What is the difference between RBAC and ACLs in Azure Storage?",
        "answer": "Role-Based Access Control (RBAC) grants broad access at the Storage Account or Container level (e.g., 'Storage Blob Data Contributor' allows reading/writing everything in the container). ACLs provide granular security, allowing you to grant access to specific sub-folders or individual files without giving access to the entire container. ADLS Gen2 evaluates RBAC first, and if not granted, falls back to ACLs."
    },
    {
        "id": "medium-spark-21",
        "category": "SPARK & DATABRICKS",
        "niche": "Spark Context",
        "difficulty": "MEDIUM",
        "question": "What is the difference between SparkContext and SparkSession?",
        "answer": "In older versions (Spark 1.x), `SparkContext` was the entry point for RDDs, while `SQLContext` and `HiveContext` were used for DataFrames. Since Spark 2.0, `SparkSession` is the unified entry point. It internally encapsulates the `SparkContext`, `SQLContext`, and `HiveContext`, providing a cleaner API for working with DataFrames, Datasets, and Spark SQL."
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
    print("Batch 3 (20 questions) added successfully.")
EOF
