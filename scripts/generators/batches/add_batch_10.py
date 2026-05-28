import json

new_batch = [
    {
        "id": "medium-fabric-56",
        "category": "FABRIC",
        "niche": "OneLake Architecture",
        "difficulty": "MEDIUM",
        "question": "How does Fabric handle data redundancy for OneLake?",
        "answer": "OneLake is built on top of Azure Data Lake Storage Gen2. By default, it inherits Azure's Zone-Redundant Storage (ZRS) or Locally-Redundant Storage (LRS) depending on the region's capabilities. This ensures data durability against hardware failures without any explicit configuration required by the user."
    },
    {
        "id": "medium-fabric-57",
        "category": "FABRIC",
        "niche": "OneLake Architecture",
        "difficulty": "MEDIUM",
        "question": "What is the 'Global Namespace' in OneLake?",
        "answer": "The Global Namespace allows all data across all workspaces and domains in a Fabric tenant to be addressed using a single, unified URI scheme (`onelake://`). This means a notebook in Workspace A can directly query a Lakehouse in Workspace B simply by referencing its path in the global namespace, without setting up complex linked services."
    },
    {
        "id": "medium-fabric-58",
        "category": "FABRIC",
        "niche": "Eventstreams",
        "difficulty": "MEDIUM",
        "question": "Can Fabric Eventstreams perform data transformation?",
        "answer": "Yes. While their primary role is routing real-time data, Eventstreams include an inline 'Event Processor'. You can visually configure operators to filter events, manage columns (add, drop, rename), and perform simple aggregations or windowing over the streaming data before it lands in a KQL database or Lakehouse."
    },
    {
        "id": "medium-fabric-59",
        "category": "FABRIC",
        "niche": "Eventstreams",
        "difficulty": "MEDIUM",
        "question": "What happens if a destination system in an Eventstream goes down?",
        "answer": "Fabric Eventstreams are backed by Kafka/Event Hubs architecture. If a destination (like a KQL database) goes down, the Eventstream automatically buffers the incoming data. Once the destination comes back online, the Eventstream resumes sending data from where it left off, ensuring no data loss during the outage."
    },
    {
        "id": "medium-fabric-60",
        "category": "FABRIC",
        "niche": "Spark Optimization",
        "difficulty": "MEDIUM",
        "question": "What is 'High Concurrency Mode' for Fabric Notebooks?",
        "answer": "High Concurrency Mode allows multiple users to attach to and share the same Spark compute session simultaneously. This drastically reduces the 'cold start' time for running notebooks, as users don't have to wait for individual clusters to spin up, and it maximizes the utilization of the underlying Fabric capacity CUs."
    },
    {
        "id": "medium-pbi-74",
        "category": "POWER BI",
        "niche": "DAX Time Intelligence",
        "difficulty": "MEDIUM",
        "question": "What is the difference between PREVIOUSMONTH and DATEADD(..., -1, MONTH)?",
        "answer": "`PREVIOUSMONTH` returns all dates in the previous month, regardless of what the current filter context selects (e.g., if you filter for Feb 15th, it returns Jan 1 - Jan 31). `DATEADD(..., -1, MONTH)` shifts the specific dates in the current context back by one month (e.g., filtering for Feb 15th returns exactly Jan 15th)."
    },
    {
        "id": "medium-pbi-75",
        "category": "POWER BI",
        "niche": "DAX Time Intelligence",
        "difficulty": "MEDIUM",
        "question": "How do you calculate a rolling 12-month total?",
        "answer": "You use `CALCULATE` and `DATESINPERIOD`. Example: `CALCULATE([Total Sales], DATESINPERIOD(DimDate[Date], MAX(DimDate[Date]), -12, MONTH))`. This creates a window starting from the latest date in the current filter context and extending backward for 12 months."
    },
    {
        "id": "medium-pbi-76",
        "category": "POWER BI",
        "niche": "Advanced Data Modeling",
        "difficulty": "MEDIUM",
        "question": "What is a 'Snapshot Fact Table'?",
        "answer": "Unlike a Transactional Fact Table that records an event at a specific point in time (e.g., a sale), a Snapshot Fact Table records the state of a metric at regular, predefined intervals (e.g., daily bank account balances or monthly inventory levels). They are essential for answering 'what was the status on day X' without having to recalculate all history."
    },
    {
        "id": "medium-pbi-77",
        "category": "POWER BI",
        "niche": "Advanced Data Modeling",
        "difficulty": "MEDIUM",
        "question": "How do you handle 'Semi-Additive' measures?",
        "answer": "Semi-additive measures (like Inventory Balance) can be summed across some dimensions (like Product or Store) but NOT across Time (you don't add Monday's balance to Tuesday's balance). In DAX, you calculate this by finding the balance on the *last available date* in the filtered period, often using `CALCULATE([Balance], LASTDATE(DimDate[Date]))`."
    },
    {
        "id": "medium-pbi-78",
        "category": "POWER BI",
        "niche": "Power Query Advanced",
        "difficulty": "MEDIUM",
        "question": "What is a Custom Function in Power Query?",
        "answer": "A Custom Function is an M query converted to accept parameters. You can right-click any existing query and select 'Create Function'. This is incredibly useful for applying the exact same complex transformation logic to multiple different tables or invoking it recursively (e.g., calling an API for every row in a table)."
    },
    {
        "id": "medium-pbi-79",
        "category": "POWER BI",
        "niche": "Power Query Advanced",
        "difficulty": "MEDIUM",
        "question": "How do you handle errors in a specific column in Power Query?",
        "answer": "If a step (like changing a type to Integer) causes errors on specific rows, you can select the column and choose 'Replace Errors'. This replaces the error value with a default value (like null or 0) so the data model refresh doesn't fail. Alternatively, you can choose 'Keep Errors' to isolate the bad rows for investigation."
    },
    {
        "id": "medium-pbi-80",
        "category": "POWER BI",
        "niche": "Report Optimization",
        "difficulty": "MEDIUM",
        "question": "What is the 'Analyze in Excel' feature, and what does it require?",
        "answer": "Analyze in Excel allows users to connect an Excel PivotTable directly to a published Power BI dataset in the Service. It requires the dataset to be built using a star schema with well-defined explicit DAX measures, because Excel creates MDX queries that cannot utilize implicit measures (like dragging a raw numeric column into the Values well)."
    },
    {
        "id": "medium-pbi-81",
        "category": "POWER BI",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of the Power BI REST API?",
        "answer": "The REST API allows developers to programmatically manage the Power BI tenant. You can automate dataset refreshes, add/remove users from workspaces, bind datasets to gateways, or extract tenant-wide usage metadata (via the Activity Log) for centralized auditing and governance."
    },
    {
        "id": "medium-pbi-82",
        "category": "POWER BI",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "What is 'Bring Your Own Log Analytics' (BYOLA) in Power BI?",
        "answer": "BYOLA allows Premium workspaces to send detailed Analysis Services engine traces directly to an Azure Log Analytics workspace. This provides DBAs with deep insights into dataset performance, long-running queries, and VertiPaq engine metrics that are otherwise invisible in the standard Power BI usage metrics."
    },
    {
        "id": "medium-adf-76",
        "category": "ADF",
        "niche": "Data Flow Optimizations",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of 'Partitioning' in a Data Flow Sink?",
        "answer": "When writing data to a Sink (like ADLS), ADF defaults to the number of Spark partitions currently in memory. You can manually set the partition option to 'Key' (to group data into files based on a column) or 'Round Robin' (to evenly distribute data). This ensures you write optimally sized files rather than thousands of tiny files."
    },
    {
        "id": "medium-adf-77",
        "category": "ADF",
        "niche": "Data Flow Optimizations",
        "difficulty": "MEDIUM",
        "question": "How do you optimize an Aggregate transformation?",
        "answer": "Aggregations require shuffling data across the Spark cluster based on the 'Group By' columns. To optimize, ensure you filter the data stream *before* the Aggregate transformation to reduce the data volume. If the data is highly skewed by the group key, consider salting."
    },
    {
        "id": "medium-adf-78",
        "category": "ADF",
        "niche": "Mapping Data Flows",
        "difficulty": "MEDIUM",
        "question": "What does the 'Assert' transformation do?",
        "answer": "The Assert transformation applies data quality rules within the data stream. You define boolean expectations (e.g., 'Age must be > 0'). If a row fails the assertion, you can configure the data flow to either flag the row with an error column, route it to a different sink, or immediately fail the entire data flow."
    },
    {
        "id": "medium-adf-79",
        "category": "ADF",
        "niche": "Mapping Data Flows",
        "difficulty": "MEDIUM",
        "question": "How do you create a slowly changing dimension (SCD Type 1) using Data Flows?",
        "answer": "SCD Type 1 overwrites old data with new data. You use an 'Alter Row' transformation and set the policy to `Upsert if: true()`. In the Sink settings, you select the database, enable 'Allow upsert', and specify the Key columns. ADF will automatically generate SQL MERGE statements to update existing rows and insert new ones."
    },
    {
        "id": "medium-adf-80",
        "category": "ADF",
        "niche": "Orchestration",
        "difficulty": "MEDIUM",
        "question": "What is the 'Get Metadata' activity?",
        "answer": "The Get Metadata activity retrieves metadata from a data source. It is most commonly used to check if a specific file exists, retrieve the Last Modified date of a file, or get a list of all child item names (files/folders) within a directory, which is then passed to a ForEach activity for iterative processing."
    },
    {
        "id": "medium-adf-81",
        "category": "ADF",
        "niche": "Orchestration",
        "difficulty": "MEDIUM",
        "question": "How do you handle a pipeline that should only run if the previous run succeeded?",
        "answer": "You can configure a Tumbling Window Trigger with a 'Self-Dependency'. This means the trigger for the current window (e.g., Hour 2) will not fire until the pipeline run for the previous window (Hour 1) completes successfully, ensuring strict sequential processing."
    },
    {
        "id": "medium-adf-82",
        "category": "ADF",
        "niche": "Security",
        "difficulty": "MEDIUM",
        "question": "How does ADF handle encryption in transit?",
        "answer": "All data transfers between ADF and Azure PaaS resources (like Azure SQL or Blob Storage) are encrypted in transit using HTTPS/TLS 1.2 by default. For on-premises data using a Self-Hosted Integration Runtime, data is also encrypted via TLS 1.2 over port 443 before leaving the corporate network."
    },
    {
        "id": "medium-adf-83",
        "category": "ADF",
        "niche": "Security",
        "difficulty": "MEDIUM",
        "question": "What is 'Managed Virtual Network (VNet) Data Exfiltration Protection'?",
        "answer": "When creating an ADF Managed VNet, you can enable data exfiltration protection. This ensures that the Integration Runtime can *only* communicate with Azure resources that have approved Managed Private Endpoints. It blocks any outbound traffic to the public internet, preventing malicious actors from copying sensitive data to an unauthorized external storage account."
    },
    {
        "id": "medium-adf-84",
        "category": "ADF",
        "niche": "Migration",
        "difficulty": "MEDIUM",
        "question": "How do you migrate SSIS packages to ADF?",
        "answer": "You provision an Azure-SSIS Integration Runtime. Then, you can deploy your `.dtsx` packages to the SSIS Catalog (SSISDB) hosted on an Azure SQL Database or Managed Instance. Finally, you use the 'Execute SSIS Package' activity in an ADF pipeline to trigger the package execution natively in the cloud."
    },
    {
        "id": "medium-adf-85",
        "category": "ADF",
        "niche": "Global Parameters",
        "difficulty": "MEDIUM",
        "question": "What are Global Parameters in ADF?",
        "answer": "Global Parameters are constants defined at the Data Factory level rather than the pipeline level. They can be consumed by any pipeline in the factory. They are typically used to store environment-specific information (like a Key Vault URL or an Environment Name: 'DEV' or 'PROD') that needs to change when the ADF ARM template is deployed to a different environment via CI/CD."
    },
    {
        "id": "medium-sql-66",
        "category": "SQL SERVER",
        "niche": "Advanced Queries",
        "difficulty": "MEDIUM",
        "question": "What is the difference between UNION and UNION ALL?",
        "answer": "`UNION` combines the results of two SELECT statements and performs an expensive sort operation to remove all duplicate rows. `UNION ALL` simply appends the results together, keeping duplicates. `UNION ALL` is significantly faster and should always be used unless you explicitly need duplicate removal."
    },
    {
        "id": "medium-sql-67",
        "category": "SQL SERVER",
        "niche": "Advanced Queries",
        "difficulty": "MEDIUM",
        "question": "Explain the EXCEPT and INTERSECT operators.",
        "answer": "`INTERSECT` returns only the distinct rows that appear in the result sets of *both* SELECT statements. `EXCEPT` returns the distinct rows from the first SELECT statement that do *not* appear in the second SELECT statement. Both require the queries to have the same number of columns with compatible data types."
    },
    {
        "id": "medium-sql-68",
        "category": "SQL SERVER",
        "niche": "Functions",
        "difficulty": "MEDIUM",
        "question": "What is a scalar User-Defined Function (UDF), and why can it cause performance issues?",
        "answer": "A scalar UDF takes parameters and returns a single value. When used in a SELECT list or WHERE clause against a large table, the SQL Server engine executes the function row-by-row (RBAR), preventing parallel execution and destroying query performance. (Note: SQL Server 2019+ introduced Scalar UDF Inlining to mitigate this, but complex UDFs still suffer)."
    },
    {
        "id": "medium-sql-69",
        "category": "SQL SERVER",
        "niche": "Functions",
        "difficulty": "MEDIUM",
        "question": "What is an Inline Table-Valued Function (iTVF)?",
        "answer": "An iTVF returns a table data type and consists of a single `RETURN (SELECT ...)` statement. Unlike Multi-Statement TVFs, iTVFs perform exceptionally well because the SQL optimizer treats them like parameterized views; it expands the underlying SELECT statement directly into the main query's execution plan."
    },
    {
        "id": "medium-sql-70",
        "category": "SQL SERVER",
        "niche": "Data Types",
        "difficulty": "MEDIUM",
        "question": "What is the difference between VARCHAR and NVARCHAR?",
        "answer": "`VARCHAR` stores non-Unicode characters (1 byte per character), typically used for standard English text. `NVARCHAR` stores Unicode characters (2 bytes per character), allowing the storage of international characters (like Japanese or Arabic) and emojis. Because `NVARCHAR` takes twice the space, it should only be used when internationalization is required."
    },
    {
        "id": "medium-sql-71",
        "category": "SQL SERVER",
        "niche": "Data Types",
        "difficulty": "MEDIUM",
        "question": "When should you use the UNIQUEIDENTIFIER data type?",
        "answer": "`UNIQUEIDENTIFIER` stores a 16-byte GUID (Globally Unique Identifier). It is useful for replication, disconnected client apps generating their own IDs, or masking sequential IDs. However, it is terrible for Clustered Indexes because GUIDs are generated randomly. Inserting random values causes massive page splits and index fragmentation."
    },
    {
        "id": "medium-sql-72",
        "category": "SQL SERVER",
        "niche": "Triggers",
        "difficulty": "MEDIUM",
        "question": "What is the difference between an AFTER trigger and an INSTEAD OF trigger?",
        "answer": "An `AFTER` trigger fires immediately after an INSERT, UPDATE, or DELETE operation has successfully completed on a table. An `INSTEAD OF` trigger intercepts the DML operation; the original operation is cancelled, and the code inside the trigger executes *instead*. `INSTEAD OF` triggers are commonly used to make complex views updatable."
    },
    {
        "id": "medium-sql-73",
        "category": "SQL SERVER",
        "niche": "Triggers",
        "difficulty": "MEDIUM",
        "question": "What are the 'inserted' and 'deleted' tables in a Trigger?",
        "answer": "These are special, temporary tables available only within a trigger's scope. During an `INSERT`, the `inserted` table holds the new rows. During a `DELETE`, the `deleted` table holds the removed rows. During an `UPDATE`, the `deleted` table holds the old version of the rows, and the `inserted` table holds the new version."
    },
    {
        "id": "medium-sql-74",
        "category": "SQL SERVER",
        "niche": "Locking and Blocking",
        "difficulty": "MEDIUM",
        "question": "What is a Deadlock in SQL Server?",
        "answer": "A deadlock occurs when two concurrent transactions are each holding locks on resources that the other transaction needs to complete. Neither can proceed, creating a circular dependency. The SQL Server engine detects this, chooses one transaction as the 'victim' (usually the one easiest to rollback), kills it, and throws an error to the application."
    },
    {
        "id": "medium-sql-75",
        "category": "SQL SERVER",
        "niche": "Locking and Blocking",
        "difficulty": "MEDIUM",
        "question": "How does Lock Escalation work?",
        "answer": "To save memory, SQL Server escalates locks. If a query requires thousands of individual row locks or page locks within the same table, the engine converts them into a single, exclusive Table Lock. While this saves RAM, it drastically reduces concurrency because no other users can access the table until the transaction finishes."
    },
    {
        "id": "medium-datalake-36",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Storage Optimization",
        "difficulty": "MEDIUM",
        "question": "Why is it important to control the size of Parquet files in a Data Lake?",
        "answer": "File size dictates processing efficiency. If files are too small (<10MB), Spark spends more time opening/closing files than reading data (the Small Files Problem). If files are too large (>2GB), a single Spark task takes too long to read it, preventing efficient parallel distribution across the cluster. The optimal target is usually between 128MB and 1GB."
    },
    {
        "id": "medium-datalake-37",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Storage Optimization",
        "difficulty": "MEDIUM",
        "question": "How does Parquet Dictionary Encoding work?",
        "answer": "Because Parquet is columnar, data in a column is often highly repetitive (e.g., 'Country' column). Dictionary encoding replaces the long string values (e.g., 'United States') with a small integer key (e.g., 1), and stores a mapping dictionary at the bottom of the file. This results in massive data compression and faster disk reads."
    },
    {
        "id": "medium-datalake-38",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Architecture",
        "difficulty": "MEDIUM",
        "question": "What is the 'Data Swamp' problem?",
        "answer": "A Data Swamp occurs when data is dumped into a Data Lake without governance, metadata tagging, data quality checks, or a catalog. Over time, the lake fills with undocumented, unverified files. Users cannot find the data they need, don't know if they can trust it, and the lake becomes a useless, expensive storage dump."
    },
    {
        "id": "medium-datalake-39",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Formats",
        "difficulty": "MEDIUM",
        "question": "What is Apache Arrow, and how does it relate to Data Lakes?",
        "answer": "Apache Arrow is an in-memory columnar data format. While Parquet is for data stored on disk, Arrow defines how data should be structured in RAM. Because Arrow is language-agnostic, tools like Python (Pandas) and Spark can pass massive datasets between each other natively in memory without costly serialization/deserialization overhead."
    },
    {
        "id": "medium-datalake-40",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Streaming Integration",
        "difficulty": "MEDIUM",
        "question": "What is the 'Exactly-Once' processing guarantee?",
        "answer": "In streaming architecture, systems can provide 'At-Most-Once' (data might be lost), 'At-Least-Once' (data won't be lost, but might be duplicated if a retry occurs), or 'Exactly-Once'. Exactly-Once requires complex coordination (like Spark Checkpointing combined with transactional writes to Delta Lake) to ensure that even if the system crashes midway, no record is processed twice or skipped."
    },
    {
        "id": "medium-spark-41",
        "category": "SPARK & DATABRICKS",
        "niche": "Spark Context",
        "difficulty": "MEDIUM",
        "question": "What happens when you call `.collect()` on a Spark DataFrame?",
        "answer": "The `collect()` action forces the Spark Executors to send all the processed data back across the network to the single Driver node, where it is converted into a local array or list. This is highly dangerous for large datasets, as it will easily exceed the Driver's RAM and cause a fatal Out of Memory (OOM) error."
    },
    {
        "id": "medium-spark-42",
        "category": "SPARK & DATABRICKS",
        "niche": "Spark Context",
        "difficulty": "MEDIUM",
        "question": "Explain the difference between .show() and .take(n).",
        "answer": "`show()` prints a tabular representation of the first 20 rows to the console for human viewing. `take(n)` returns the first `n` rows back to the Driver program as an array of Row objects, allowing you to iterate over them programmatically in your Python/Scala script."
    },
    {
        "id": "medium-spark-43",
        "category": "SPARK & DATABRICKS",
        "niche": "Advanced DataFrames",
        "difficulty": "MEDIUM",
        "question": "How do you handle NULL values in a Spark DataFrame?",
        "answer": "You use the `.na` sub-module. You can use `df.na.drop()` to remove any rows containing nulls, `df.na.fill(value)` to replace nulls with a specific default value (like 0 or 'Unknown'), or use `coalesce()` or `when(col.isNull(), ...)` in specific column expressions."
    },
    {
        "id": "medium-spark-44",
        "category": "SPARK & DATABRICKS",
        "niche": "Advanced DataFrames",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of the explode() function in Spark SQL?",
        "answer": "If a DataFrame column contains an array or a map (list of items), `explode()` takes that array and creates a new row for every element within it, duplicating the data from the other columns for each new row. It essentially flattens nested array structures."
    },
    {
        "id": "medium-spark-45",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks Workspace",
        "difficulty": "MEDIUM",
        "question": "What are Databricks Widgets?",
        "answer": "Widgets are interactive UI elements (like dropdowns, text boxes, or date pickers) that you can define at the top of a Databricks Notebook. They allow users to input parameters dynamically. In your Python or SQL code, you retrieve the widget's value using `dbutils.widgets.get(\"parameter_name\")` and use it to filter data or alter logic."
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
    print("Batch 10 (85 questions) added successfully.")
