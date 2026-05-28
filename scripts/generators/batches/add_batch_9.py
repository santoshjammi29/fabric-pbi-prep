import json

new_batch = [
    {
        "id": "medium-fabric-51",
        "category": "FABRIC",
        "niche": "Security",
        "difficulty": "MEDIUM",
        "question": "What is the OneSecurity architecture in Fabric?",
        "answer": "OneSecurity is Fabric's unified security model. Instead of configuring security policies redundantly in Power BI, SQL endpoints, and Spark, you define Row-Level Security (RLS), Column-Level Security (CLS), and Dynamic Data Masking (DDM) once in the underlying OneLake layer. These policies are then universally enforced regardless of which Fabric engine (Spark, SQL, or BI) is used to access the data."
    },
    {
        "id": "medium-fabric-52",
        "category": "FABRIC",
        "niche": "Security",
        "difficulty": "MEDIUM",
        "question": "How are sensitivity labels applied in Fabric?",
        "answer": "Fabric leverages Microsoft Purview Information Protection. You can apply sensitivity labels (e.g., 'Highly Confidential') to Workspaces or specific items like Lakehouses or Reports. If a user exports data from a labeled report to Excel, the sensitivity label and its associated encryption policies travel with the file, protecting data even after it leaves Fabric."
    },
    {
        "id": "medium-fabric-53",
        "category": "FABRIC",
        "niche": "CI/CD",
        "difficulty": "MEDIUM",
        "question": "How do you deploy Fabric items across environments without Git?",
        "answer": "If you don't use Git integration, you can use Fabric Deployment Pipelines. This is a built-in ALM UI where you assign Workspaces to Development, Test, and Production stages. You visually compare content between stages and click 'Deploy' to move items (like pipelines or models) forward, applying configured deployment rules to change data connections along the way."
    },
    {
        "id": "medium-fabric-54",
        "category": "FABRIC",
        "niche": "CI/CD",
        "difficulty": "MEDIUM",
        "question": "Can you use standard CI/CD tools like GitHub Actions with Fabric?",
        "answer": "Yes. If your workspace is connected to a Git repository, you can trigger external CI/CD pipelines (GitHub Actions, Azure DevOps Pipelines) whenever a commit is pushed. These pipelines can utilize the Power BI/Fabric REST APIs to automatically trigger workspace updates, run automated tests, and orchestrate complex deployments across multiple domains."
    },
    {
        "id": "medium-fabric-55",
        "category": "FABRIC",
        "niche": "OneLake Architecture",
        "difficulty": "MEDIUM",
        "question": "What is the difference between a Lakehouse and a Data Warehouse in Fabric?",
        "answer": "A Lakehouse is fundamentally based on Spark; it excels at handling unstructured data, streaming, and data science workloads using notebooks, though it provides a read-only SQL endpoint. A Warehouse is fundamentally based on the SQL engine; it provides full read/write T-SQL capabilities for structured data, catering to traditional data warehousing professionals."
    },
    {
        "id": "medium-pbi-66",
        "category": "POWER BI",
        "niche": "Report Design",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of the 'Selection Pane' in Power BI Desktop?",
        "answer": "The Selection Pane lists all visuals, shapes, and text boxes on the current report page. It allows you to rename visuals, change their Z-order (which visual appears in front of another), and most importantly, toggle their visibility (hide/show). This is critical when building complex interactive reports that use Bookmarks to switch between different views."
    },
    {
        "id": "medium-pbi-67",
        "category": "POWER BI",
        "niche": "Report Design",
        "difficulty": "MEDIUM",
        "question": "How do Bookmarks work in Power BI?",
        "answer": "A Bookmark captures the current state of a report page, including the filters applied, the slicer selections, the visibility state of visuals (from the Selection pane), and the drill-down state of charts. Users can click a button tied to a bookmark to instantly revert the page to that exact saved state, allowing for 'app-like' navigation."
    },
    {
        "id": "medium-pbi-68",
        "category": "POWER BI",
        "niche": "DAX Best Practices",
        "difficulty": "MEDIUM",
        "question": "Why should you avoid using the FILTER() function over an entire table?",
        "answer": "Using `FILTER(FactSales, FactSales[Region] = \"West\")` forces the DAX engine to iterate over every single row of the Fact table, which is extremely slow for large datasets. Instead, you should filter just the column: `CALCULATE([Measure], FactSales[Region] = \"West\")`. This allows the engine to use indexes and metadata to instantly apply the filter."
    },
    {
        "id": "medium-pbi-69",
        "category": "POWER BI",
        "niche": "DAX Best Practices",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of the DIVIDE() function?",
        "answer": "The `DIVIDE(Numerator, Denominator)` function is used instead of the standard division operator (`/`). It safely handles division by zero errors by automatically returning BLANK (or a custom specified alternate result) instead of throwing an 'Infinity' error, which would break the visual displaying the measure."
    },
    {
        "id": "medium-pbi-70",
        "category": "POWER BI",
        "niche": "Power Query",
        "difficulty": "MEDIUM",
        "question": "What is Query Folding in Power Query, and why is it important?",
        "answer": "Query Folding is the process where Power Query translates M code steps into native query language (e.g., SQL) and pushes the execution to the source database. This is critical for performance. If folding breaks (e.g., by using an incompatible M function), Power Query must download the entire raw dataset into memory to perform the remaining transformations locally."
    },
    {
        "id": "medium-pbi-71",
        "category": "POWER BI",
        "niche": "Power Query",
        "difficulty": "MEDIUM",
        "question": "How do you check if Query Folding is occurring?",
        "answer": "In the Power Query 'Applied Steps' pane, you right-click a step and look for 'View Native Query'. If the option is clickable and shows a SQL query, folding is occurring up to that step. If it is grayed out, folding has likely broken at that step or an earlier one."
    },
    {
        "id": "medium-pbi-72",
        "category": "POWER BI",
        "niche": "Data Modeling",
        "difficulty": "MEDIUM",
        "question": "What is Bidirectional Cross-Filtering, and why is it dangerous?",
        "answer": "Bidirectional cross-filtering allows filters to flow 'up' from the Many side of a relationship to the One side. While it solves specific many-to-many filtering scenarios, it is dangerous because it can create ambiguous filter paths in complex models, leading to unpredictable DAX results and severe performance degradation. It should only be used as a last resort."
    },
    {
        "id": "medium-pbi-73",
        "category": "POWER BI",
        "niche": "Data Modeling",
        "difficulty": "MEDIUM",
        "question": "How do you handle a Slowly Changing Dimension (SCD Type 2) in Power BI?",
        "answer": "An SCD2 table contains multiple rows for the same entity (e.g., a Customer), differentiated by `StartDate` and `EndDate`. In Power BI, you link the Fact table to the Dimension table using the `Surrogate Key` (the unique row identifier), NOT the Business Key. You then ensure the Fact table is loaded with the correct Surrogate Key based on the transaction date."
    },
    {
        "id": "medium-adf-68",
        "category": "ADF",
        "niche": "Data Integration Units",
        "difficulty": "MEDIUM",
        "question": "What are Data Integration Units (DIUs) in ADF?",
        "answer": "A DIU is a measure of compute power (CPU, memory, network allocation) assigned to a Copy Activity in Azure Data Factory. By default, ADF dynamically determines the appropriate DIU, but for massive data loads, you can manually increase the DIU setting to allocate more raw power and significantly speed up the data transfer, at a higher cost."
    },
    {
        "id": "medium-adf-69",
        "category": "ADF",
        "niche": "Performance Optimization",
        "difficulty": "MEDIUM",
        "question": "How do you optimize a Copy Activity reading from an Oracle database to ADLS?",
        "answer": "You should enable 'Partition Option' on the source settings. Instead of reading the entire Oracle table through a single thread, you configure it to partition by a specific column (e.g., ID or Date). ADF will automatically spawn multiple parallel connections to the Oracle database, reading different slices of the data simultaneously, maximizing throughput."
    },
    {
        "id": "medium-adf-70",
        "category": "ADF",
        "niche": "Performance Optimization",
        "difficulty": "MEDIUM",
        "question": "What is the 'Degree of Copy Parallelism' setting?",
        "answer": "This setting dictates the maximum number of concurrent threads a single Copy Activity can use to write data to the sink. If you are copying a folder containing thousands of small files to Azure Blob Storage, increasing this value allows ADF to write multiple files simultaneously rather than sequentially."
    },
    {
        "id": "medium-adf-71",
        "category": "ADF",
        "niche": "Orchestration",
        "difficulty": "MEDIUM",
        "question": "Explain the difference between a Sequential and Parallel ForEach loop.",
        "answer": "By default, the ForEach activity in ADF runs its iterations in parallel (up to 50 concurrent batches). This is fast but risky if iterations depend on each other or write to the same file. You can check the 'Sequential' box in the settings, forcing ADF to complete one iteration entirely before starting the next, ensuring strict execution order."
    },
    {
        "id": "medium-adf-72",
        "category": "ADF",
        "niche": "Orchestration",
        "difficulty": "MEDIUM",
        "question": "What is the limitation of the ForEach activity regarding nested loops?",
        "answer": "ADF does not allow placing a ForEach activity directly inside another ForEach activity. To achieve nested looping (e.g., looping through databases, and then looping through tables in each database), the inner loop must be encapsulated inside a separate child pipeline, and the outer loop calls that child pipeline using the Execute Pipeline activity."
    },
    {
        "id": "medium-adf-73",
        "category": "ADF",
        "niche": "Mapping Data Flows",
        "difficulty": "MEDIUM",
        "question": "How do you use parameters in a Mapping Data Flow?",
        "answer": "You define parameters within the Data Flow canvas. When you add the Data Flow activity to an ADF pipeline, the pipeline passes values to these parameters. Inside the Data Flow, you reference them in expressions using the `$parameter_name` syntax (e.g., to dynamically filter rows based on a date passed from the pipeline)."
    },
    {
        "id": "medium-adf-74",
        "category": "ADF",
        "niche": "Mapping Data Flows",
        "difficulty": "MEDIUM",
        "question": "What is Schema Drift handling in Data Flows?",
        "answer": "Schema Drift handling allows Data Flows to process files or tables even if new columns are added or data types change unexpectedly. By enabling 'Allow Schema Drift' on the source and sink, ADF dynamically discovers the schema at runtime and flows all columns through without requiring you to hardcode the column mappings."
    },
    {
        "id": "medium-adf-75",
        "category": "ADF",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "How do you share an Integration Runtime across multiple Data Factories?",
        "answer": "You can share a Self-Hosted Integration Runtime (SHIR). You install the SHIR in a 'Primary' Data Factory. Then, in the Azure Portal, you grant RBAC permissions to other Data Factories to access the primary SHIR. In the secondary factories, you create a new IR and select 'Linked Self-Hosted', pointing it to the primary one, avoiding the need to install multiple SHIR VMs."
    },
    {
        "id": "medium-sql-58",
        "category": "SQL SERVER",
        "niche": "Security",
        "difficulty": "MEDIUM",
        "question": "What is Row-Level Security (RLS) in SQL Server?",
        "answer": "RLS enables you to restrict data access at the row level based on the user executing the query. You create a security predicate (an inline table-valued function) that returns '1' if the user is authorized to see the row, and bind it to the table using a Security Policy. The filtering happens transparently at the database engine level, so applications don't need to append complex `WHERE` clauses."
    },
    {
        "id": "medium-sql-59",
        "category": "SQL SERVER",
        "niche": "Security",
        "difficulty": "MEDIUM",
        "question": "Explain the Principle of Least Privilege in SQL Server.",
        "answer": "The Principle of Least Privilege dictates that users or applications should be granted only the minimum permissions necessary to perform their required tasks. Instead of granting `db_owner` or `db_datareader` to everything, you create custom Roles, grant `EXECUTE` permissions only on specific stored procedures, and deny direct `SELECT/UPDATE` access to the underlying tables."
    },
    {
        "id": "medium-sql-60",
        "category": "SQL SERVER",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "What is the difference between Simple and Full Recovery Models?",
        "answer": "In the Simple Recovery Model, transaction logs are automatically truncated after checkpoints, meaning you cannot restore the database to a specific point in time (only to the last full backup). The Full Recovery Model retains all transaction logs until a Log Backup is performed, allowing you to restore the database to any specific second before a disaster occurred."
    },
    {
        "id": "medium-sql-61",
        "category": "SQL SERVER",
        "niche": "Administration",
        "difficulty": "MEDIUM",
        "question": "Why would you rebuild or reorganize an index?",
        "answer": "Over time, as data is inserted/updated/deleted, index pages become fragmented (data is scattered across the disk out of logical order). If fragmentation is low (e.g., 10-30%), you 'Reorganize' the index (a lightweight defragmentation). If it is high (>30%), you 'Rebuild' the index, which drops the old index and creates a perfectly contiguous new one, restoring query performance."
    },
    {
        "id": "medium-sql-62",
        "category": "SQL SERVER",
        "niche": "T-SQL Advanced",
        "difficulty": "MEDIUM",
        "question": "What is the PIVOT operator?",
        "answer": "The `PIVOT` operator transforms rows into columns. For example, if you have Sales data with a 'Month' column and a 'SalesAmount' column across many rows, `PIVOT` can rotate the data so that 'Jan', 'Feb', and 'Mar' become distinct columns, and the SalesAmount is aggregated underneath them, producing a wide cross-tab report format."
    },
    {
        "id": "medium-sql-63",
        "category": "SQL SERVER",
        "niche": "T-SQL Advanced",
        "difficulty": "MEDIUM",
        "question": "How does UNPIVOT work?",
        "answer": "The `UNPIVOT` operator does the reverse of PIVOT; it transforms columns into rows. If a poorly designed source table has columns for `Q1_Sales`, `Q2_Sales`, `Q3_Sales`, `UNPIVOT` normalizes the data into two columns: one containing the column name (e.g., 'Q1_Sales') and another containing the actual numerical value."
    },
    {
        "id": "medium-sql-64",
        "category": "SQL SERVER",
        "niche": "T-SQL Advanced",
        "difficulty": "MEDIUM",
        "question": "What is the MERGE statement?",
        "answer": "The `MERGE` statement (often called an UPSERT) synchronizes a target table with a source table based on a join condition. Within a single statement, you can define logic to perform an `UPDATE` if a row matches, an `INSERT` if a row exists in the source but not the target, and a `DELETE` if a row exists in the target but not the source."
    },
    {
        "id": "medium-sql-65",
        "category": "SQL SERVER",
        "niche": "Functions",
        "difficulty": "MEDIUM",
        "question": "What is a CROSS APPLY vs OUTER APPLY?",
        "answer": "`APPLY` allows you to join a table to a Table-Valued Function (TVF) and pass a column from the outer table into the TVF as a parameter. `CROSS APPLY` acts like an `INNER JOIN`; if the TVF returns no rows, the outer row is dropped. `OUTER APPLY` acts like a `LEFT JOIN`; if the TVF returns no rows, the outer row is kept and NULLs are returned for the TVF columns."
    },
    {
        "id": "medium-datalake-31",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Delta Lake Advanced",
        "difficulty": "MEDIUM",
        "question": "How does Delta Lake handle schema evolution automatically?",
        "answer": "You can append `.option(\"mergeSchema\", \"true\")` when writing a DataFrame to a Delta table. If the incoming DataFrame has new columns that don't exist in the target table, Delta Lake automatically alters the target table's schema to add those columns and inserts the data, safely handling downstream schema changes without failing the job."
    },
    {
        "id": "medium-datalake-32",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Delta Lake Advanced",
        "difficulty": "MEDIUM",
        "question": "What is Z-Ordering in Delta Lake?",
        "answer": "Z-Ordering is a technique to colocate related information in the same set of files. It maps multi-dimensional data into one dimension while preserving data locality. You run `OPTIMIZE table_name ZORDER BY (col1, col2)`. It is far more effective than traditional partitioning for columns with high cardinality (like UserID or Timestamps), allowing for massive data skipping during queries."
    },
    {
        "id": "medium-datalake-33",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Architecture",
        "difficulty": "MEDIUM",
        "question": "What is a 'Lakehouse' Architecture?",
        "answer": "A Lakehouse combines the flexibility, scale, and low cost of a Data Lake (storing raw data in open formats like Parquet) with the data management and ACID transaction features of a traditional Data Warehouse (provided by storage layers like Delta Lake, Iceberg, or Hudi). It aims to provide a single platform for both BI reporting and Machine Learning."
    },
    {
        "id": "medium-datalake-34",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Formats",
        "difficulty": "MEDIUM",
        "question": "What are Apache Iceberg and Apache Hudi?",
        "answer": "Like Delta Lake, Iceberg and Hudi are open table formats. They bring ACID transactions, time travel, and schema evolution to data lakes. While Delta Lake is heavily tied to the Databricks/Spark ecosystem, Iceberg was built by Netflix and is highly engine-agnostic, and Hudi was built by Uber, excelling at near-real-time streaming inserts and updates."
    },
    {
        "id": "medium-datalake-35",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Governance",
        "difficulty": "MEDIUM",
        "question": "Why is 'Data Lineage' difficult to track in a Data Lake?",
        "answer": "Because data lakes ingest from varied sources using custom code (Python, Scala) across varied compute engines, tracking data lineage is incredibly complex. Unlike a SQL database with a strict parser, analyzing a Python script to see how `Column A` transformed into `Column B` requires specialized cataloging tools (like Azure Purview or Databricks Unity Catalog) that intercept engine execution plans."
    },
    {
        "id": "medium-spark-36",
        "category": "SPARK & DATABRICKS",
        "niche": "Streaming",
        "difficulty": "MEDIUM",
        "question": "What is trigger(availableNow=True) in Spark Structured Streaming?",
        "answer": "Traditionally, streaming implies continuous 24/7 processing. `trigger(availableNow=True)` is used for incremental batch processing. When the job runs, it processes all unread data available in the source (e.g., Kafka or Auto Loader) in multiple micro-batches, updates its checkpoint, and then completely shuts down the cluster. This provides the tracking benefits of streaming with the massive cost savings of batch."
    },
    {
        "id": "medium-spark-37",
        "category": "SPARK & DATABRICKS",
        "niche": "Streaming",
        "difficulty": "MEDIUM",
        "question": "What happens if a Structured Streaming job fails?",
        "answer": "Structured Streaming relies on Checkpointing and Write-Ahead Logs (WAL). If the job fails, upon restart, it reads the checkpoint directory from cloud storage to determine exactly which offsets were processed last. It then replays any uncommitted data, ensuring exactly-once processing guarantees without data duplication."
    },
    {
        "id": "medium-spark-38",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks Workflows",
        "difficulty": "MEDIUM",
        "question": "What is a Databricks Workflow (Jobs)?",
        "answer": "Databricks Workflows is the fully managed orchestration service built into Databricks. It allows you to link together Notebooks, Python scripts, JARs, and DLT pipelines into complex DAGs (Directed Acyclic Graphs). You can schedule them, define dependencies, and route output data or parameters between tasks, replacing the need for external tools like Apache Airflow in many cases."
    },
    {
        "id": "medium-spark-39",
        "category": "SPARK & DATABRICKS",
        "niche": "Cluster Configuration",
        "difficulty": "MEDIUM",
        "question": "What are Spot Instances in Databricks clusters?",
        "answer": "Spot instances utilize excess, unused compute capacity in Azure/AWS at a massively discounted rate (up to 80% off). The catch is that the cloud provider can reclaim (terminate) these nodes at any time with a 2-minute warning. Databricks handles this gracefully by rescheduling failed tasks. They are ideal for worker nodes in fault-tolerant batch jobs to save money."
    },
    {
        "id": "medium-spark-40",
        "category": "SPARK & DATABRICKS",
        "niche": "Cluster Configuration",
        "difficulty": "MEDIUM",
        "question": "Why should you separate Driver nodes and Worker nodes when using Spot instances?",
        "answer": "The Driver node manages the entire Spark application state. If the Driver node is running on a Spot instance and gets terminated by the cloud provider, the entire Spark job fails instantly. You should configure the cluster to use a reliable, On-Demand instance for the Driver, and cheap Spot instances for the Workers, so you only lose temporary tasks during a reclamation."
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
    print("Batch 9 (80 questions) added successfully.")
