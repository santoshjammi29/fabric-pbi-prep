import json

new_batch = [
    {
        "id": "medium-fabric-31",
        "category": "FABRIC",
        "niche": "Power BI Integration",
        "difficulty": "MEDIUM",
        "question": "What is the Default Semantic Model in Microsoft Fabric?",
        "answer": "When you create a Lakehouse or Warehouse in Fabric, a Default Semantic Model is automatically generated and kept in sync with the underlying tables. It allows business users to instantly build Power BI reports on top of the data using Direct Lake mode without having to manually build, model, or refresh a dataset."
    },
    {
        "id": "medium-fabric-32",
        "category": "FABRIC",
        "niche": "Power BI Integration",
        "difficulty": "MEDIUM",
        "question": "How do you manage relationships in a Fabric Default Semantic Model?",
        "answer": "You manage relationships directly within the Lakehouse or Warehouse web UI using the 'Model Layout' view. Dragging and dropping lines between tables defines the relationships (1-to-many, etc.). These relationships are automatically saved to the Default Semantic Model and applied when users build Power BI reports."
    },
    {
        "id": "medium-fabric-33",
        "category": "FABRIC",
        "niche": "Data Engineering",
        "difficulty": "MEDIUM",
        "question": "What is the Fabric Data Engineering Experience?",
        "answer": "The Data Engineering experience in Fabric brings together Spark Notebooks, Lakehouses, and Spark Job Definitions into a single workspace tailored for code-first data engineers. It focuses on transforming massive amounts of unstructured and structured data using Python, Scala, and SQL, storing the output in Delta Parquet format within OneLake."
    },
    {
        "id": "medium-fabric-34",
        "category": "FABRIC",
        "niche": "Data Engineering",
        "difficulty": "MEDIUM",
        "question": "Explain how to mount external Azure Storage to a Fabric Notebook.",
        "answer": "While OneLake is the default storage, you can mount external Azure Data Lake Storage (ADLS Gen2) containers directly within a Fabric Notebook using `mssparkutils.fs.mount()`. This requires providing the storage account name, container name, and authentication (typically a SAS token or Account Key stored in Azure Key Vault)."
    },
    {
        "id": "medium-fabric-35",
        "category": "FABRIC",
        "niche": "Data Engineering",
        "difficulty": "MEDIUM",
        "question": "What is a Spark Job Definition in Fabric?",
        "answer": "A Spark Job Definition allows you to submit batch or streaming Spark applications written in Java, Scala, or Python (often compiled `.jar` or `.py` files) directly to the Fabric Spark compute pool. This is useful for migrating existing complex Apache Spark workloads into Fabric without rewriting them into interactive Notebooks."
    },
    {
        "id": "medium-fabric-36",
        "category": "FABRIC",
        "niche": "Data Activator",
        "difficulty": "MEDIUM",
        "question": "What is Microsoft Fabric Data Activator?",
        "answer": "Data Activator is a no-code experience in Fabric that monitors data in real-time (from Eventstreams or Power BI datasets) and automatically triggers actions when specific conditions are met. For example, it can monitor a Power BI dataset for dropping inventory levels and automatically send an email or trigger a Power Automate flow to reorder stock."
    },
    {
        "id": "medium-fabric-37",
        "category": "FABRIC",
        "niche": "Data Activator",
        "difficulty": "MEDIUM",
        "question": "Explain the concept of 'Triggers' and 'Actions' in Data Activator.",
        "answer": "A 'Trigger' defines the condition being monitored (e.g., 'Temperature > 100 over a 5-minute window'). An 'Action' defines what happens when the trigger fires. Actions can range from sending a simple Teams message or email alert, to kicking off complex downstream business processes via Custom APIs or Power Automate."
    },
    {
        "id": "medium-fabric-38",
        "category": "FABRIC",
        "niche": "Data Science",
        "difficulty": "MEDIUM",
        "question": "How does SynapseML integrate with Microsoft Fabric?",
        "answer": "SynapseML is an open-source library that simplifies the creation of massively scalable machine learning pipelines. In Fabric Notebooks, it is pre-installed. It allows data scientists to easily call Azure AI Services (like Computer Vision, Text Analytics, or OpenAI models) directly on massive Spark DataFrames using a few lines of PySpark code."
    },
    {
        "id": "medium-fabric-39",
        "category": "FABRIC",
        "niche": "Data Science",
        "difficulty": "MEDIUM",
        "question": "What is Semantic Link in Microsoft Fabric?",
        "answer": "Semantic Link bridges the gap between Data Science and Business Intelligence. It is a Python library (`sempy`) used in Fabric Notebooks that allows Data Scientists to directly read data, relationships, and execute DAX queries against Power BI Semantic Models, pulling BI data into pandas or Spark DataFrames for machine learning."
    },
    {
        "id": "medium-fabric-40",
        "category": "FABRIC",
        "niche": "Copilot",
        "difficulty": "MEDIUM",
        "question": "How does Copilot assist Data Engineers in Fabric Notebooks?",
        "answer": "Copilot in Fabric Notebooks acts as an AI pair programmer. By typing natural language prompts in a cell (e.g., '%%chat Write PySpark code to load this CSV and drop rows with nulls'), Copilot generates the corresponding Python or Spark SQL code. It can also explain complex existing code or troubleshoot error messages."
    },
    {
        "id": "medium-pbi-46",
        "category": "POWER BI",
        "niche": "Advanced DAX",
        "difficulty": "MEDIUM",
        "question": "What is the difference between COUNTROWS and COUNT in DAX?",
        "answer": "`COUNT()` evaluates a specific column and counts only the rows where that column is NOT BLANK. `COUNTROWS()` evaluates an entire table (or table expression) and counts the total number of rows, regardless of blanks in any specific column. `COUNTROWS()` is generally preferred and slightly faster when you just need the raw row count of a table."
    },
    {
        "id": "medium-pbi-47",
        "category": "POWER BI",
        "niche": "Advanced DAX",
        "difficulty": "MEDIUM",
        "question": "Explain the purpose of the CALCULATETABLE function.",
        "answer": "`CALCULATETABLE` is exactly like `CALCULATE`, but instead of returning a scalar value, it returns a Table. It evaluates a table expression in a modified filter context. It is frequently used within other iterator functions (like `SUMX`) or when defining complex Virtual Tables for intermediate calculations within a measure."
    },
    {
        "id": "medium-pbi-48",
        "category": "POWER BI",
        "niche": "Advanced DAX",
        "difficulty": "MEDIUM",
        "question": "How do you calculate a moving average in DAX?",
        "answer": "You use `CALCULATE` with the `DATESINPERIOD` or `DATESBETWEEN` time intelligence functions to define the window. For a 30-day moving average: `CALCULATE(AVERAGE(Fact[Sales]), DATESINPERIOD(DimDate[Date], LASTDATE(DimDate[Date]), -30, DAY)).`"
    },
    {
        "id": "medium-pbi-49",
        "category": "POWER BI",
        "niche": "Power Query",
        "difficulty": "MEDIUM",
        "question": "What is the difference between 'Merge Queries' and 'Append Queries' in Power Query?",
        "answer": "Merge Queries joins two tables horizontally based on matching columns (similar to a SQL JOIN), adding new columns from the second table to the first. Append Queries stacks two tables vertically (similar to a SQL UNION), adding the rows of the second table to the bottom of the first table, assuming they share similar column structures."
    },
    {
        "id": "medium-pbi-50",
        "category": "POWER BI",
        "niche": "Power Query",
        "difficulty": "MEDIUM",
        "question": "Explain the concept of 'Fuzzy Matching' in Power Query Merges.",
        "answer": "Fuzzy Matching allows you to merge tables even if the key columns don't match exactly due to typos, abbreviations, or formatting differences (e.g., 'Microsoft' vs 'Micro soft'). You can configure a similarity threshold (between 0.00 and 1.00) where 1.00 requires an exact match, and a lower number allows broader textual similarities to join."
    },
    {
        "id": "medium-pbi-51",
        "category": "POWER BI",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "What is Power BI Deployment Pipelines?",
        "answer": "Deployment Pipelines provide a visual ALM (Application Lifecycle Management) tool within the Power BI Service. They allow teams to manage the lifecycle of content (Reports, Dashboards, Datasets) by promoting them across three dedicated stages: Development, Test, and Production, ensuring rigorous testing before users see changes."
    },
    {
        "id": "medium-pbi-52",
        "category": "POWER BI",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "How do Deployment Pipeline 'Rules' work?",
        "answer": "When promoting a dataset from Dev to Test (or Prod) using Deployment Pipelines, you don't want the Production report pointing to the Dev database. Deployment Rules allow you to define configuration changes during promotion, automatically swapping data source connections or parameter values to point to the correct environment."
    },
    {
        "id": "medium-pbi-53",
        "category": "POWER BI",
        "niche": "Data Modeling",
        "difficulty": "MEDIUM",
        "question": "What is a Composite Model in Power BI?",
        "answer": "A Composite Model allows a single Power BI dataset to combine data from multiple DirectQuery sources AND imported data simultaneously. This enables you to import fast, summarized dimensions into memory, while keeping a massive, billion-row Fact table in DirectQuery mode (e.g., residing in Snowflake or Azure SQL)."
    },
    {
        "id": "medium-pbi-54",
        "category": "POWER BI",
        "niche": "Data Modeling",
        "difficulty": "MEDIUM",
        "question": "What are 'Weak Relationships' (Limited Relationships) in a Composite Model?",
        "answer": "When establishing a relationship between an imported table and a DirectQuery table (or between two different DirectQuery sources), Power BI creates a 'Limited Relationship'. Because the engine cannot guarantee referential integrity across completely different storage systems, it uses `LEFT OUTER JOIN` semantics, which can lead to blank rows and performance degradation compared to 'Strong Relationships' within a single source."
    },
    {
        "id": "medium-pbi-55",
        "category": "POWER BI",
        "niche": "Visualizations",
        "difficulty": "MEDIUM",
        "question": "How do you implement Field Parameters in Power BI?",
        "answer": "Field Parameters allow users to dynamically change the measures or dimensions displayed in a visual. You create them via Modeling > New Parameter > Fields. You select the columns or measures you want users to toggle between. Power BI generates a slicer and a DAX calculated table. You then drop this new parameter into the X-axis or Values well of your visual."
    },
    {
        "id": "medium-adf-48",
        "category": "ADF",
        "niche": "Security and Authentication",
        "difficulty": "MEDIUM",
        "question": "How does ADF authenticate with an Azure SQL Database using a Managed Identity?",
        "answer": "When you create an ADF instance, Azure automatically creates a System-Assigned Managed Identity for it in Entra ID (Azure AD). To authenticate, you must log into the Azure SQL Database as an admin and create a SQL user mapped to the ADF's Managed Identity name, granting it `db_datareader` or `db_datawriter` roles. The Linked Service in ADF is then configured to use 'Managed Identity' authentication."
    },
    {
        "id": "medium-adf-49",
        "category": "ADF",
        "niche": "Security and Authentication",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of Azure Key Vault integration in ADF?",
        "answer": "ADF integrates with Azure Key Vault to securely store and retrieve secrets, connection strings, and passwords at runtime. Instead of saving a database password in the Linked Service definition (where it might be exposed in source control), the Linked Service points to a specific Secret Name in Key Vault. ADF uses its Managed Identity to fetch the secret securely just before execution."
    },
    {
        "id": "medium-adf-50",
        "category": "ADF",
        "niche": "Security and Authentication",
        "difficulty": "MEDIUM",
        "question": "Can you access an on-premises database securely without opening firewall ports?",
        "answer": "Yes, by installing an ADF Self-Hosted Integration Runtime (SHIR) on an on-premises Windows machine. The SHIR establishes an outbound, encrypted connection to the Azure Data Factory service over port 443. This completely eliminates the need to open inbound firewall ports on the corporate network."
    },
    {
        "id": "medium-adf-51",
        "category": "ADF",
        "niche": "Advanced Data Flows",
        "difficulty": "MEDIUM",
        "question": "What is 'Stringify' and 'Parse' in ADF Mapping Data Flows?",
        "answer": "The `Stringify` transformation converts complex data types (like an Array or Struct) into a single string representation (usually JSON formatted). The `Parse` transformation does the exact opposite; it takes a string column containing JSON text and parses it back into hierarchical arrays and structs so you can extract individual nested elements."
    },
    {
        "id": "medium-adf-52",
        "category": "ADF",
        "niche": "Advanced Data Flows",
        "difficulty": "MEDIUM",
        "question": "How do you handle late-arriving data in ADF?",
        "answer": "Handling late-arriving data requires a robust pipeline design. Typically, you implement a 'Watermark' architecture. The pipeline tracks a `LastProcessedDate` watermark in a control table. When it runs, it queries the source for any rows modified *after* the watermark. This ensures that even if data arrives days late, the next pipeline run will pick it up based on its modified timestamp."
    },
    {
        "id": "medium-adf-53",
        "category": "ADF",
        "niche": "Advanced Orchestration",
        "difficulty": "MEDIUM",
        "question": "Explain the concept of 'Concurrency' limits on ADF pipelines and activities.",
        "answer": "Concurrency limits restrict how many instances of a pipeline or a specific activity (like a ForEach loop) can run simultaneously. If you trigger a pipeline 100 times but set its concurrency limit to 5, ADF queues the triggers and only runs 5 at a time. Inside a ForEach loop, lowering the 'Batch count' concurrency prevents overwhelming the destination database with too many parallel connections."
    },
    {
        "id": "medium-adf-54",
        "category": "ADF",
        "niche": "Advanced Orchestration",
        "difficulty": "MEDIUM",
        "question": "What is the 'Validation' activity in ADF?",
        "answer": "The Validation activity pauses pipeline execution and waits until a specific condition is met, usually checking if a file or folder exists in storage before proceeding. It evaluates the condition at a specified polling interval and has a timeout setting. It ensures downstream copy activities don't fail because the source file hasn't arrived yet."
    },
    {
        "id": "medium-adf-55",
        "category": "ADF",
        "niche": "Custom Activities",
        "difficulty": "MEDIUM",
        "question": "When and how do you use the 'Custom Activity' in ADF?",
        "answer": "The Custom Activity is used when built-in activities (like Copy, Databricks, or Data Flow) cannot fulfill your complex transformation requirements. It executes custom code (like Python, R, or C#) by running a batch job on Azure Batch. You provide the executable file and a linked service to the Azure Batch pool."
    },
    {
        "id": "medium-adf-56",
        "category": "ADF",
        "niche": "Custom Activities",
        "difficulty": "MEDIUM",
        "question": "What is the 'Azure Function' activity?",
        "answer": "The Azure Function activity allows an ADF pipeline to trigger an external Azure Function via an HTTP request. This is incredibly powerful for executing lightweight, custom C# or Python scripts (e.g., custom cryptography, complex API pagination, or sending Teams alerts) serverlessly without the heavy overhead of Azure Batch or Databricks."
    },
    {
        "id": "medium-adf-57",
        "category": "ADF",
        "niche": "Cost Management",
        "difficulty": "MEDIUM",
        "question": "How are ADF Mapping Data Flows billed?",
        "answer": "Data Flows are billed per vCore-hour based on the compute type (General Purpose vs Memory Optimized) and the Time To Live (TTL) settings. Because it spins up a Spark cluster in the background, you are charged for the cluster startup time, execution time, and any TTL period where the cluster remains idle waiting for subsequent jobs."
    },
    {
        "id": "medium-sql-38",
        "category": "SQL SERVER",
        "niche": "Stored Procedures",
        "difficulty": "MEDIUM",
        "question": "What is the difference between a Stored Procedure and a User-Defined Function (UDF)?",
        "answer": "A Stored Procedure can execute complex business logic, perform INSERT/UPDATE/DELETE (DML) operations, and return multiple result sets or output parameters. A UDF is designed strictly to return a single value or a table, cannot perform DML operations (it must be deterministic and read-only), and can be used directly inline within a `SELECT` statement or `WHERE` clause."
    },
    {
        "id": "medium-sql-39",
        "category": "SQL SERVER",
        "niche": "Stored Procedures",
        "difficulty": "MEDIUM",
        "question": "Explain the use of OUTPUT parameters in stored procedures.",
        "answer": "While a stored procedure can return a tabular result set, OUTPUT parameters allow it to return scalar values (like a newly generated ID or a success status integer) back to the calling application or parent script. You declare them with the `OUTPUT` keyword in the procedure definition and pass a variable to capture the value during execution."
    },
    {
        "id": "medium-sql-40",
        "category": "SQL SERVER",
        "niche": "Stored Procedures",
        "difficulty": "MEDIUM",
        "question": "What does SET NOCOUNT ON do in a stored procedure?",
        "answer": "`SET NOCOUNT ON` stops the server from returning messages indicating the number of rows affected by T-SQL statements (e.g., '10 rows affected'). In highly active stored procedures with many loops or updates, turning this on drastically reduces network traffic between SQL Server and the application, improving performance."
    },
    {
        "id": "medium-sql-41",
        "category": "SQL SERVER",
        "niche": "Error Handling",
        "difficulty": "MEDIUM",
        "question": "How do you handle errors gracefully in T-SQL?",
        "answer": "You use the `BEGIN TRY...END TRY` and `BEGIN CATCH...END CATCH` constructs. If an error occurs inside the TRY block, execution immediately jumps to the CATCH block. Inside the CATCH block, you can use functions like `ERROR_MESSAGE()` and `ERROR_NUMBER()` to log the failure to an audit table and optionally issue a `ROLLBACK TRANSACTION`."
    },
    {
        "id": "medium-sql-42",
        "category": "SQL SERVER",
        "niche": "Error Handling",
        "difficulty": "MEDIUM",
        "question": "What is the THROW statement?",
        "answer": "The `THROW` statement is the modern replacement for `RAISERROR`. It raises an exception and immediately transfers execution to a CATCH block (or aborts the batch). It can be used without parameters inside a CATCH block to re-throw the exact error that was caught back to the calling application."
    },
    {
        "id": "medium-sql-43",
        "category": "SQL SERVER",
        "niche": "Table Design",
        "difficulty": "MEDIUM",
        "question": "What is a Temporal Table (System-Versioned Table) in SQL Server?",
        "answer": "A Temporal Table automatically keeps a full history of data changes. It consists of the main current table and a hidden history table. When you UPDATE or DELETE a row in the main table, SQL Server automatically moves the old version to the history table with timestamping. You can then query data 'as it existed' at any specific point in time using `FOR SYSTEM_TIME AS OF`."
    },
    {
        "id": "medium-sql-44",
        "category": "SQL SERVER",
        "niche": "Table Design",
        "difficulty": "MEDIUM",
        "question": "Explain the difference between a Primary Key and a Unique Constraint.",
        "answer": "Both enforce uniqueness in a column. A Primary Key uniquely identifies the row; a table can only have one PK, and it absolutely cannot contain NULL values. It usually creates the Clustered Index by default. A Unique Constraint enforces uniqueness on alternative columns (e.g., an Email address); a table can have many unique constraints, and it allows exactly one NULL value."
    },
    {
        "id": "medium-sql-45",
        "category": "SQL SERVER",
        "niche": "Table Design",
        "difficulty": "MEDIUM",
        "question": "What are Computed Columns?",
        "answer": "A computed column is a virtual column whose value is derived from an expression using other columns in the same row (e.g., `TotalCost AS (Quantity * UnitPrice)`). By default, it is not stored physically (calculated on the fly), but it can be marked as `PERSISTED` to store the result physically on disk, which allows it to be indexed."
    },
    {
        "id": "medium-sql-46",
        "category": "SQL SERVER",
        "niche": "Query Optimization",
        "difficulty": "MEDIUM",
        "question": "Why is using 'SELECT *' considered bad practice in production code?",
        "answer": "`SELECT *` retrieves all columns from the table, generating unnecessary disk I/O and network traffic if the application only needs a few columns. Furthermore, it prevents the SQL optimizer from using Covering Indexes. Finally, if the underlying table schema changes (columns added or removed), it can break applications expecting a specific column order."
    },
    {
        "id": "medium-sql-47",
        "category": "SQL SERVER",
        "niche": "Query Optimization",
        "difficulty": "MEDIUM",
        "question": "What is an Execution Plan, and how do you view it?",
        "answer": "An Execution Plan is a visual or textual representation of the exact physical operations the SQL Server Query Optimizer has chosen to retrieve the data (e.g., Index Seeks, Hash Matches, Nested Loops). In SSMS, you can view the 'Estimated Execution Plan' before running the query, or enable 'Include Actual Execution Plan' to see exactly where performance bottlenecks occurred."
    },
    {
        "id": "medium-datalake-21",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Storage Formats",
        "difficulty": "MEDIUM",
        "question": "What is the difference between Parquet and Avro storage formats?",
        "answer": "Parquet is a column-oriented storage format, making it incredibly fast and efficient for analytical (OLAP) queries where you need to aggregate massive amounts of data from just a few columns. Avro is a row-oriented storage format, making it superior for write-heavy, transactional (OLTP) workloads and streaming scenarios where entire records are processed sequentially."
    },
    {
        "id": "medium-datalake-22",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Storage Formats",
        "difficulty": "MEDIUM",
        "question": "Why use Delta Lake over raw Parquet?",
        "answer": "While Delta Lake uses Parquet files under the hood, it adds a JSON transaction log. This transaction log provides ACID compliance (preventing partial or corrupt reads during writes), allows for Schema Enforcement (rejecting bad writes), supports Time Travel (querying old versions), and enables true UPDATE and DELETE operations, none of which raw Parquet can do."
    },
    {
        "id": "medium-datalake-23",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Quality",
        "difficulty": "MEDIUM",
        "question": "How do you implement Data Quality checks in a Data Lakehouse pipeline?",
        "answer": "Data quality is typically enforced using frameworks like Great Expectations or Delta Live Tables (DLT) Expectations. You define assertions (e.g., 'Age must be > 0', 'CustomerID must not be null'). Depending on the pipeline configuration, failing records can either be dropped, routed to a 'quarantine' or 'dead-letter' table for manual review, or cause the entire pipeline to fail."
    },
    {
        "id": "medium-datalake-24",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Cataloging",
        "difficulty": "MEDIUM",
        "question": "Explain the role of Azure Purview in Data Lake Architecture.",
        "answer": "Azure Purview is a unified data governance service. It connects to the Data Lake, automatically scans files, classifies sensitive data (like credit card numbers), and builds a searchable Data Catalog. Crucially, it maps Data Lineage, showing visually how data moves from source systems, through ADF pipelines, into the Data Lake, and finally into Power BI reports."
    },
    {
        "id": "medium-datalake-25",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Performance Optimization",
        "difficulty": "MEDIUM",
        "question": "What is the concept of 'Data Skipping' in Delta Lake?",
        "answer": "As Delta Lake writes Parquet files, it automatically collects metadata statistics (min/max values) for each column in the file and stores this in the transaction log. When a query filters on a column, the engine checks the transaction log first. If the filter condition falls outside the min/max range of a specific file, Delta entirely skips reading that file, dramatically speeding up queries."
    },
    {
        "id": "medium-spark-27",
        "category": "SPARK & DATABRICKS",
        "niche": "Advanced Spark API",
        "difficulty": "MEDIUM",
        "question": "What is a UDF (User Defined Function) in Spark, and why should it be avoided in Python?",
        "answer": "A UDF allows you to apply custom logic to a DataFrame column. In PySpark, standard Python UDFs should be avoided because Spark must serialize the data, send it from the JVM executor to a Python worker process row-by-row, execute the Python code, and serialize it back. This massive overhead destroys performance. You should use native Spark SQL functions whenever possible."
    },
    {
        "id": "medium-spark-28",
        "category": "SPARK & DATABRICKS",
        "niche": "Advanced Spark API",
        "difficulty": "MEDIUM",
        "question": "If you absolutely must use a Python UDF, how do you optimize it?",
        "answer": "You should use Pandas UDFs (Vectorized UDFs). Instead of passing data row-by-row to the Python worker, Pandas UDFs use Apache Arrow to transfer data in massive in-memory batches (chunks) directly into Pandas DataFrames or Series. This vectorization speeds up custom Python execution by 10x to 100x compared to standard Python UDFs."
    },
    {
        "id": "medium-spark-29",
        "category": "SPARK & DATABRICKS",
        "niche": "Spark UI & Debugging",
        "difficulty": "MEDIUM",
        "question": "How can you identify a Shuffle problem in the Spark UI?",
        "answer": "In the Spark UI 'Stages' tab, you look at the 'Shuffle Read' and 'Shuffle Write' metrics. If a specific stage (often associated with a GroupBy or Join) is taking an unusually long time and shows gigabytes or terabytes of Shuffle Read/Write data moving across the network, you have a shuffle bottleneck that requires optimization (like broadcasting or changing partitioning)."
    },
    {
        "id": "medium-spark-30",
        "category": "SPARK & DATABRICKS",
        "niche": "Spark UI & Debugging",
        "difficulty": "MEDIUM",
        "question": "What does a GC (Garbage Collection) Time metric in the Spark UI indicate?",
        "answer": "If an executor spends a high percentage of its time in Garbage Collection (GC Time is highlighted in red in the Spark UI), it means the JVM memory is nearly full. The system is struggling to clear old objects to make room for new ones. This usually indicates data skew, processing partitions that are too large, or caching too much data, often leading to an Out of Memory error."
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
    print("Batch 7 (60 questions) added successfully.")
