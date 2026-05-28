import json

new_batch = [
    {
        "id": "medium-fabric-21",
        "category": "FABRIC",
        "niche": "Data Pipelines",
        "difficulty": "MEDIUM",
        "question": "How do Data Pipelines in Microsoft Fabric differ from Azure Data Factory (ADF)?",
        "answer": "Fabric Data Pipelines are the evolution of ADF. They share the same core engine and activities but are deeply integrated into the SaaS Fabric environment. Fabric pipelines don't require managing Integration Runtimes or VNets manually in the same way ADF does. They also seamlessly integrate with OneLake, allowing you to use Lakehouses and Warehouses as sources and destinations without configuring linked services for them."
    },
    {
        "id": "medium-fabric-22",
        "category": "FABRIC",
        "niche": "Data Pipelines",
        "difficulty": "MEDIUM",
        "question": "What is the primary use case for the 'Copy Data' activity in a Fabric Pipeline?",
        "answer": "The Copy Data activity is designed for high-throughput, bulk data movement. It is optimized for moving data from on-premises or cloud sources directly into OneLake (Lakehouse or Warehouse) at petabyte scale, utilizing distributed parallel processing under the hood without the user needing to write any Spark or SQL code."
    },
    {
        "id": "medium-fabric-23",
        "category": "FABRIC",
        "niche": "Data Pipelines",
        "difficulty": "MEDIUM",
        "question": "How can you parameterize a Data Pipeline in Fabric?",
        "answer": "You can define Pipeline Parameters at the pipeline level. These parameters can then be referenced dynamically within activities using the `@pipeline().parameters.ParameterName` syntax. This allows a single pipeline to be reused for different tables, dates, or environments by simply passing different parameter values at runtime."
    },
    {
        "id": "medium-fabric-24",
        "category": "FABRIC",
        "niche": "Notebooks",
        "difficulty": "MEDIUM",
        "question": "What languages are natively supported in Microsoft Fabric Notebooks?",
        "answer": "Fabric Notebooks natively support PySpark (Python), Spark SQL, Scala, and SparkR. You can switch between these languages within the same notebook using cell magic commands (e.g., `%%sql` to run a SQL cell in a predominantly Python notebook)."
    },
    {
        "id": "medium-fabric-25",
        "category": "FABRIC",
        "niche": "Notebooks",
        "difficulty": "MEDIUM",
        "question": "How do you schedule a Notebook to run automatically in Fabric?",
        "answer": "You can schedule a Notebook in two ways: 1) Using the built-in 'Schedule' button on the notebook itself, which allows setting up a recurring time-based trigger. 2) Adding the Notebook activity to a Data Pipeline and using the pipeline's robust scheduling and dependency management capabilities."
    },
    {
        "id": "medium-fabric-26",
        "category": "FABRIC",
        "niche": "Notebooks",
        "difficulty": "MEDIUM",
        "question": "What is the 'mssparkutils' library in Fabric?",
        "answer": "`mssparkutils` is a Microsoft-provided utility package built into Fabric Spark environments. It simplifies common tasks such as working with the OneLake file system (e.g., `mssparkutils.fs.ls()`), securely retrieving credentials from Azure Key Vault, and passing parameters or exit values between notebooks."
    },
    {
        "id": "medium-fabric-27",
        "category": "FABRIC",
        "niche": "Dataflow Gen2",
        "difficulty": "MEDIUM",
        "question": "What is Dataflow Gen2 in Microsoft Fabric?",
        "answer": "Dataflow Gen2 is the next generation of Power Query Dataflows. Unlike Gen1 which primarily loaded data into Power BI or Dataverse, Gen2 allows you to connect to hundreds of data sources, transform data visually using Power Query, and then define a 'Data Destination' to load the transformed data directly into a Fabric Lakehouse, Warehouse, KQL Database, or Azure SQL DB."
    },
    {
        "id": "medium-fabric-28",
        "category": "FABRIC",
        "niche": "Dataflow Gen2",
        "difficulty": "MEDIUM",
        "question": "Explain the concept of 'Staging' in Dataflow Gen2.",
        "answer": "When 'Staging' is enabled, Dataflow Gen2 temporarily writes intermediate query results to a hidden Lakehouse in OneLake before loading it to the final destination. This drastically improves performance for complex transformations (like merges or appends) because the heavy lifting is offloaded to the powerful Fabric SQL engine rather than relying solely on the Power Query mashup engine."
    },
    {
        "id": "medium-fabric-29",
        "category": "FABRIC",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "What is a Fabric Domain?",
        "answer": "A Domain is a logical grouping of Workspaces in Fabric, typically aligned to a business department (e.g., 'Finance', 'HR', 'Marketing'). It allows for decentralized administration, where a 'Domain Admin' can manage settings, data certification, and usage monitoring for their specific set of workspaces without needing Tenant Admin privileges."
    },
    {
        "id": "medium-fabric-30",
        "category": "FABRIC",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "How do you monitor capacity consumption in Microsoft Fabric?",
        "answer": "You use the 'Microsoft Fabric Capacity Metrics' app. It provides detailed dashboards showing CU (Capacity Unit) consumption over time, highlighting specific items (reports, pipelines, spark jobs) that are consuming the most resources, and showing when 'Smoothing' or 'Throttling' is occurring."
    },
    {
        "id": "medium-pbi-36",
        "category": "POWER BI",
        "niche": "Data Modeling",
        "difficulty": "MEDIUM",
        "question": "What is Role-Playing Dimension in Power BI?",
        "answer": "A role-playing dimension is a single dimension table (e.g., a Date table) that relates to a Fact table multiple times through different columns (e.g., OrderDate, ShipDate, DueDate). In Power BI, only one relationship can be active. The others must be inactive, and you use the `USERELATIONSHIP()` DAX function in specific measures to activate them on demand."
    },
    {
        "id": "medium-pbi-37",
        "category": "POWER BI",
        "niche": "Data Modeling",
        "difficulty": "MEDIUM",
        "question": "Why is a Star Schema strongly recommended over a Snowflake Schema in Power BI?",
        "answer": "A Star Schema reduces the number of tables (joins) the VertiPaq engine must traverse to calculate a result, resulting in significantly faster query performance. A Snowflake Schema normalizes dimensions into multiple tables, which saves a tiny amount of disk space but forces complex, slow DAX queries and makes the model harder for users to navigate."
    },
    {
        "id": "medium-pbi-38",
        "category": "POWER BI",
        "niche": "DAX Time Intelligence",
        "difficulty": "MEDIUM",
        "question": "What is the prerequisite for using built-in DAX Time Intelligence functions like SAMEPERIODLASTYEAR?",
        "answer": "You must have a dedicated Date table marked as a 'Date Table' in the model. This table must contain a continuous, contiguous range of dates (no missing days) covering the entire span of your data, and the primary Date column must be of the Date or Date/Time data type."
    },
    {
        "id": "medium-pbi-39",
        "category": "POWER BI",
        "niche": "DAX Time Intelligence",
        "difficulty": "MEDIUM",
        "question": "How do you calculate a Year-to-Date (YTD) total in DAX?",
        "answer": "You can use the `TOTALYTD()` function, passing the expression to evaluate and the Date column. Alternatively, and often preferred for more complex filtering, you can use `CALCULATE([Total Sales], DATESYTD(DimDate[Date]))`."
    },
    {
        "id": "medium-pbi-40",
        "category": "POWER BI",
        "niche": "DAX Evaluation Context",
        "difficulty": "MEDIUM",
        "question": "What is Filter Context in DAX?",
        "answer": "Filter Context refers to the set of filters applied to the data model before a calculation is performed. It is generated by the user's interaction with the report (slicers, page-level filters, row/column headers in a matrix, and cross-filtering from other visuals). The `CALCULATE` function is the only way to programmatically modify the Filter Context within a measure."
    },
    {
        "id": "medium-pbi-41",
        "category": "POWER BI",
        "niche": "DAX Evaluation Context",
        "difficulty": "MEDIUM",
        "question": "What is Row Context in DAX?",
        "answer": "Row Context exists when DAX iterates over a table row by row. It exists automatically in Calculated Columns and within iterator functions like `SUMX` or `FILTER`. Row context evaluates expressions for the 'current row' but importantly, it does NOT automatically filter relationships. To convert a row context into a filter context to traverse relationships, you must use `CALCULATE()`."
    },
    {
        "id": "medium-pbi-42",
        "category": "POWER BI",
        "niche": "Visualizations",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of the 'Edit Interactions' feature?",
        "answer": "By default, clicking a data point in one Power BI visual cross-filters or cross-highlights all other visuals on the page. 'Edit Interactions' allows you to override this default behavior. You can manually set a visual to 'Filter', 'Highlight', or 'None' (ignore interactions) in response to a selection made in another specific visual."
    },
    {
        "id": "medium-pbi-43",
        "category": "POWER BI",
        "niche": "Visualizations",
        "difficulty": "MEDIUM",
        "question": "How do you create a dynamic chart title in Power BI?",
        "answer": "You write a DAX measure that constructs a text string (e.g., `\"Sales for \" & SELECTEDVALUE(DimRegion[RegionName], \"All Regions\")`). Then, in the visual's formatting pane under Title, instead of typing a static name, you click the 'fx' (conditional formatting) button and select 'Field value', pointing it to your newly created measure."
    },
    {
        "id": "medium-pbi-44",
        "category": "POWER BI",
        "niche": "Row-Level Security (RLS)",
        "difficulty": "MEDIUM",
        "question": "Explain how Static RLS is implemented in Power BI Desktop.",
        "answer": "Static RLS involves creating 'Roles' in Power BI Desktop (e.g., 'West Region'). Within the role, you write a DAX filter expression on a specific table (e.g., `DimRegion[Region] = \"West\"`). Once published, you go to the dataset security settings in the Service and manually add users or groups to that specific role."
    },
    {
        "id": "medium-pbi-45",
        "category": "POWER BI",
        "niche": "Row-Level Security (RLS)",
        "difficulty": "MEDIUM",
        "question": "What is Dynamic RLS and how is it implemented?",
        "answer": "Dynamic RLS allows a single role to filter data dynamically based on who is logged in. It uses the `USERPRINCIPALNAME()` DAX function, which returns the logged-in user's email. You typically join a security mapping table (containing UserEmails and their assigned RegionIDs) to your data model. The DAX filter on the mapping table is simply `[UserEmail] = USERPRINCIPALNAME()`, automatically filtering the entire model based on the user."
    },
    {
        "id": "medium-adf-38",
        "category": "ADF",
        "niche": "Control Flow Activities",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of the Filter activity?",
        "answer": "The Filter activity takes an input array (e.g., the output from a Get Metadata or Lookup activity) and evaluates a boolean expression against each item. It returns a new array containing only the items that evaluated to true, which can then be passed to a ForEach loop for targeted processing."
    },
    {
        "id": "medium-adf-39",
        "category": "ADF",
        "niche": "Control Flow Activities",
        "difficulty": "MEDIUM",
        "question": "How do you implement conditional logic in an ADF Pipeline?",
        "answer": "You use the 'If Condition' activity. You provide a boolean expression (e.g., `@equals(activity('GetStatus').output.status, 'Ready')`). If true, the pipeline executes the sequence of activities defined in the 'True' branch; otherwise, it executes the activities in the 'False' branch."
    },
    {
        "id": "medium-adf-40",
        "category": "ADF",
        "niche": "Control Flow Activities",
        "difficulty": "MEDIUM",
        "question": "What is the limitation of nested activities in ADF?",
        "answer": "ADF heavily restricts the nesting of complex activities. For example, you cannot put an 'If Condition' inside a 'ForEach' loop, nor can you put a 'ForEach' loop inside an 'Until' loop. To bypass this, the inner activity must be placed in a separate child pipeline, which is then called using the 'Execute Pipeline' activity from within the loop."
    },
    {
        "id": "medium-adf-41",
        "category": "ADF",
        "niche": "Variables and Parameters",
        "difficulty": "MEDIUM",
        "question": "Explain the difference between a Pipeline Parameter and a Pipeline Variable.",
        "answer": "A Pipeline Parameter is a static value passed into the pipeline at runtime from an external trigger or caller; it cannot be changed during the pipeline's execution. A Pipeline Variable is declared within the pipeline and its value can be initialized, updated (Set Variable), or appended to (Append Variable) dynamically as the pipeline runs."
    },
    {
        "id": "medium-adf-42",
        "category": "ADF",
        "niche": "Variables and Parameters",
        "difficulty": "MEDIUM",
        "question": "What is the Append Variable activity used for?",
        "answer": "The Append Variable activity is used to add a new element to an Array-type pipeline variable. It is highly useful inside a ForEach loop to collect the results, filenames, or status messages of each iteration into a single list for later processing or logging."
    },
    {
        "id": "medium-adf-43",
        "category": "ADF",
        "niche": "Datasets and Linked Services",
        "difficulty": "MEDIUM",
        "question": "How can you parameterize a Linked Service in ADF?",
        "answer": "You can add parameters directly to the Linked Service configuration. For example, instead of hardcoding an Azure SQL Server name, you define a parameter `ServerName`. In the connection string, you use `@linkedService().ServerName`. This allows a single Linked Service to connect to Dev, Test, or Prod environments by passing the correct server name dynamically from the dataset or pipeline."
    },
    {
        "id": "medium-adf-44",
        "category": "ADF",
        "niche": "Datasets and Linked Services",
        "difficulty": "MEDIUM",
        "question": "What is the benefit of using parameterized Datasets?",
        "answer": "Parameterized Datasets drastically reduce the number of objects you have to manage. Instead of creating 100 datasets for 100 different tables, you create a single 'Generic SQL Table' dataset. You add a parameter for `TableName` and map it to the dataset properties. When a Copy Activity uses this dataset, it passes the specific table name it wants to read or write."
    },
    {
        "id": "medium-adf-45",
        "category": "ADF",
        "niche": "Integration Runtimes",
        "difficulty": "MEDIUM",
        "question": "What is the Auto-resolve Integration Runtime?",
        "answer": "The Auto-resolve IR is the default Azure Integration Runtime provided by ADF. It automatically provisions compute resources in the Azure region that is closest to the sink data store or the ADF instance itself to minimize network latency during data movement."
    },
    {
        "id": "medium-adf-46",
        "category": "ADF",
        "niche": "Integration Runtimes",
        "difficulty": "MEDIUM",
        "question": "When would you use an Azure-SSIS Integration Runtime?",
        "answer": "You use the Azure-SSIS IR when you are migrating legacy on-premises SQL Server Integration Services (SSIS) packages to the cloud. It provisions a cluster of Azure VMs dedicated to executing standard `.dtsx` packages natively within Azure Data Factory without requiring you to rewrite the ETL logic."
    },
    {
        "id": "medium-adf-47",
        "category": "ADF",
        "niche": "Monitoring",
        "difficulty": "MEDIUM",
        "question": "How can you debug a Mapping Data Flow without running an entire pipeline?",
        "answer": "You can turn on 'Data Flow Debug' mode in the ADF Studio UI. This spins up an interactive Spark cluster in the background (which takes a few minutes). Once active, you can click on any transformation step and view a 'Data Preview' of the rows at that exact stage, allowing for rapid testing and troubleshooting of transformations."
    },
    {
        "id": "medium-sql-28",
        "category": "SQL SERVER",
        "niche": "Window Functions",
        "difficulty": "MEDIUM",
        "question": "What is the difference between ROW_NUMBER() and RANK()?",
        "answer": "`ROW_NUMBER()` assigns a unique, sequential integer to every row within a partition, even if values are identical. `RANK()` assigns the same rank to identical values, but creates a gap in the sequence afterward (e.g., 1, 2, 2, 4). If you want identical values to share a rank without leaving a gap (e.g., 1, 2, 2, 3), you use `DENSE_RANK()`."
    },
    {
        "id": "medium-sql-29",
        "category": "SQL SERVER",
        "niche": "Window Functions",
        "difficulty": "MEDIUM",
        "question": "How do you calculate a running total using Window Functions?",
        "answer": "You use the `SUM()` aggregate function combined with an `OVER` clause that specifies an `ORDER BY`. For example: `SUM(SalesAmount) OVER (ORDER BY OrderDate)`. By default, this creates a window framing from the unbounded preceding row up to the current row, calculating the cumulative sum."
    },
    {
        "id": "medium-sql-30",
        "category": "SQL SERVER",
        "niche": "Window Functions",
        "difficulty": "MEDIUM",
        "question": "Explain the LEAD() and LAG() functions.",
        "answer": "`LEAD()` allows you to access data from a subsequent row in the same result set without using a self-join, while `LAG()` accesses data from a previous row. They are heavily used for calculating year-over-year differences or analyzing sequential events (e.g., finding the time difference between login events)."
    },
    {
        "id": "medium-sql-31",
        "category": "SQL SERVER",
        "niche": "Common Table Expressions (CTEs)",
        "difficulty": "MEDIUM",
        "question": "What is a CTE and why is it preferred over a derived table (subquery in the FROM clause)?",
        "answer": "A CTE (`WITH CteName AS (...)`) creates a temporary named result set valid only for the duration of a single SELECT, INSERT, UPDATE, or DELETE statement. It is preferred over derived tables because it makes complex queries vastly more readable, allows the result set to be referenced multiple times in the same query, and enables recursive querying."
    },
    {
        "id": "medium-sql-32",
        "category": "SQL SERVER",
        "niche": "Common Table Expressions (CTEs)",
        "difficulty": "MEDIUM",
        "question": "How does a Recursive CTE work?",
        "answer": "A Recursive CTE is used to query hierarchical data (like an organizational chart or bill of materials). It consists of two parts combined with a `UNION ALL`: the 'Anchor member' which returns the base level of the hierarchy, and the 'Recursive member' which joins back to the CTE itself to find the children of the previous level. It loops until the recursive member returns no rows."
    },
    {
        "id": "medium-sql-33",
        "category": "SQL SERVER",
        "niche": "Indexing",
        "difficulty": "MEDIUM",
        "question": "What is the difference between a Clustered Index and a Non-Clustered Index?",
        "answer": "A Clustered Index dictates the physical sorting order of the data pages on disk; therefore, a table can only have one clustered index (usually the Primary Key). A Non-Clustered Index is a separate structure (like an index in the back of a book) that contains pointers back to the physical data rows; a table can have many non-clustered indexes."
    },
    {
        "id": "medium-sql-34",
        "category": "SQL SERVER",
        "niche": "Indexing",
        "difficulty": "MEDIUM",
        "question": "What is a Covering Index?",
        "answer": "A Covering Index is a non-clustered index that contains all the columns required to satisfy a specific query (in both the SELECT and WHERE clauses). When a query is 'covered', the SQL engine can retrieve the data directly from the index pages without having to perform an expensive 'Key Lookup' back to the physical clustered index table pages."
    },
    {
        "id": "medium-sql-35",
        "category": "SQL SERVER",
        "niche": "Transactions",
        "difficulty": "MEDIUM",
        "question": "Explain the concept of ACID properties in SQL Server.",
        "answer": "ACID guarantees reliable processing of database transactions. Atomicity (all parts of a transaction succeed or fail together), Consistency (the transaction leaves the database in a valid state respecting constraints), Isolation (concurrent transactions do not interfere with each other), and Durability (once committed, changes are permanent even in a power failure)."
    },
    {
        "id": "medium-sql-36",
        "category": "SQL SERVER",
        "niche": "Transactions",
        "difficulty": "MEDIUM",
        "question": "What is the default isolation level in SQL Server, and what read phenomena does it prevent?",
        "answer": "The default isolation level is `READ COMMITTED`. It prevents 'Dirty Reads' (reading uncommitted data from another transaction) because it requires a shared lock to read data. However, it does not prevent 'Non-Repeatable Reads' (data changing if you read it twice in the same transaction) or 'Phantom Reads' (new rows appearing if you run the same query twice)."
    },
    {
        "id": "medium-sql-37",
        "category": "SQL SERVER",
        "niche": "Execution Plans",
        "difficulty": "MEDIUM",
        "question": "What is Parameter Sniffing?",
        "answer": "Parameter Sniffing occurs when SQL Server compiles a stored procedure for the first time. It optimizes the execution plan based on the specific parameter values passed during that first call. If those initial values are atypical (resulting in a highly skewed plan), subsequent calls with typical parameters will use the bad plan, resulting in terrible performance."
    },
    {
        "id": "medium-datalake-16",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Modeling",
        "difficulty": "MEDIUM",
        "question": "What is Schema-on-Read vs. Schema-on-Write?",
        "answer": "Relational databases use Schema-on-Write; data must strictly conform to a predefined table structure before it can be inserted. Data Lakes traditionally use Schema-on-Read; raw data is dumped into storage without validation, and the structure/types are only applied later when a query engine (like Presto or Spark) attempts to read and interpret the file."
    },
    {
        "id": "medium-datalake-17",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Modeling",
        "difficulty": "MEDIUM",
        "question": "How does Data Vault modeling differ from Kimball (Star Schema) modeling in a Data Lakehouse?",
        "answer": "Kimball models data into denormalized Facts and Dimensions optimized for fast querying. Data Vault models data into Hubs (core business keys), Links (relationships between keys), and Satellites (attributes changing over time). Data Vault is highly agile and auditable for integrating massive, constantly changing source systems into the enterprise data warehouse layer, though it requires a semantic view layer on top for BI tools to query easily."
    },
    {
        "id": "medium-datalake-18",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Ingestion",
        "difficulty": "MEDIUM",
        "question": "What is Change Data Capture (CDC)?",
        "answer": "CDC is a set of software design patterns used to determine and track data that has changed (inserts, updates, deletes) in a source database so that action can be taken using the changed data. Instead of full nightly batch loads, CDC reads database transaction logs (e.g., using Debezium) and streams only the deltas into the Data Lake, enabling near-real-time synchronization."
    },
    {
        "id": "medium-datalake-19",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Ingestion",
        "difficulty": "MEDIUM",
        "question": "Explain the Lambda Architecture.",
        "answer": "Lambda Architecture processes massive data streams using two parallel paths. The 'Speed Layer' processes real-time data for immediate (but potentially less accurate) analytics. The 'Batch Layer' comprehensively processes historical data for highly accurate views. A 'Serving Layer' merges the two, providing users with both immediate insights and long-term accuracy. (It is increasingly being replaced by the simpler Kappa architecture)."
    },
    {
        "id": "medium-datalake-20",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Ingestion",
        "difficulty": "MEDIUM",
        "question": "Explain the Kappa Architecture.",
        "answer": "Kappa architecture is a simplification of Lambda. It removes the complex dual-path (batch + speed) processing system. Instead, it treats everything as a stream. All data flows through a single stream processing engine (like Apache Kafka + Spark Structured Streaming). If historical recalculation is needed, the stream is simply replayed from the beginning."
    },
    {
        "id": "medium-spark-22",
        "category": "SPARK & DATABRICKS",
        "niche": "Spark SQL",
        "difficulty": "MEDIUM",
        "question": "How does Spark handle JSON data with varying schemas?",
        "answer": "Spark's DataFrameReader can infer schemas from JSON files by scanning a sample of the data. If schemas vary across files, Spark can automatically merge them by finding the superset of all columns. However, inferring schemas on massive datasets requires a costly full-table scan, so in production, providing an explicit DDL schema string is recommended."
    },
    {
        "id": "medium-spark-23",
        "category": "SPARK & DATABRICKS",
        "niche": "Spark SQL",
        "difficulty": "MEDIUM",
        "question": "What is Predicate Pushdown in Spark?",
        "answer": "Predicate Pushdown is an optimization where Spark pushes filtering logic (the `WHERE` clause, or 'predicate') down to the underlying storage system (like Parquet or a SQL database) before the data is loaded into memory. This drastically reduces network traffic and memory usage because only the required rows are retrieved by the Spark executors."
    },
    {
        "id": "medium-spark-24",
        "category": "SPARK & DATABRICKS",
        "niche": "Performance Optimization",
        "difficulty": "MEDIUM",
        "question": "What is Adaptive Query Execution (AQE) in Spark 3.0+?",
        "answer": "Before AQE, Spark optimized execution plans statically before the job ran. AQE allows Spark to re-optimize the physical execution plan *during* runtime based on actual runtime statistics. It dynamically coalesces shuffle partitions, switches join strategies (e.g., from Sort-Merge Join to Broadcast Join if a table is smaller than expected after filtering), and handles skewed joins."
    },
    {
        "id": "medium-spark-25",
        "category": "SPARK & DATABRICKS",
        "niche": "Performance Optimization",
        "difficulty": "MEDIUM",
        "question": "Explain the difference between Cache() and Persist() in Spark.",
        "answer": "Both keep a DataFrame in memory across multiple actions to avoid recomputation. `cache()` is a shortcut that always uses the default storage level (`MEMORY_AND_DISK` for DataFrames). `persist()` allows you to explicitly specify the storage level, such as storing data only on disk, storing it in memory serialized to save space, or replicating it across multiple nodes for high availability."
    },
    {
        "id": "medium-spark-26",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks Delta",
        "difficulty": "MEDIUM",
        "question": "How do you implement a Type 2 Slowly Changing Dimension (SCD2) in Databricks?",
        "answer": "You use the `MERGE INTO` command in Delta Lake. You join the incoming source data with the target Delta table. If a match is found and attributes have changed, you UPDATE the existing row to close its validity window (set `IsActive = false` and update the `EndDate`), and then INSERT a new row for the updated attributes with `IsActive = true`."
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
    print("Batch 6 (60 questions) added successfully.")
