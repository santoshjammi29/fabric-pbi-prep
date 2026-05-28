import json

new_batch = [
    {
        "id": "medium-pbi-1",
        "category": "POWER BI",
        "niche": "Data Modeling and Relationships",
        "difficulty": "MEDIUM",
        "question": "What is the primary difference between a star schema and a snowflake schema in Power BI, and why is the star schema preferred?",
        "answer": "A star schema connects a central fact table directly to dimension tables. A snowflake schema normalizes dimensions into multiple related tables (e.g., Product -> Subcategory -> Category). Star schemas are preferred in Power BI because the VertiPaq engine is optimized for single-hop joins, reducing query complexity and improving DAX performance compared to the multi-hop relationships required by snowflake schemas."
    },
    {
        "id": "medium-pbi-2",
        "category": "POWER BI",
        "niche": "Data Modeling and Relationships",
        "difficulty": "MEDIUM",
        "question": "How does a bidirectional cross-filtering relationship impact a Power BI data model?",
        "answer": "Bidirectional cross-filtering allows filters to flow in both directions between tables (e.g., Fact to Dimension). While useful for many-to-many scenarios, it creates ambiguity in the filter context, degrades query performance, and can lead to unexpected DAX calculation results. It is generally recommended to use single-direction filters and explicitly apply `CROSSFILTER()` in DAX only when necessary."
    },
    {
        "id": "medium-pbi-3",
        "category": "POWER BI",
        "niche": "Data Modeling and Relationships",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of a Date (Calendar) table in Power BI, and what are the requirements to mark it as a Date Table?",
        "answer": "A Date table enables advanced time-intelligence DAX functions (like YTD, MTD, SAMEPERIODLASTYEAR). To mark it as a Date Table, it must contain a column of data type 'Date' or 'Date/Time', the column must contain unique continuous values without gaps, and it cannot contain blank values."
    },
    {
        "id": "medium-pbi-4",
        "category": "POWER BI",
        "niche": "Data Modeling and Relationships",
        "difficulty": "MEDIUM",
        "question": "Explain the concept of an 'Active' vs 'Inactive' relationship in Power BI.",
        "answer": "Only one active relationship can exist between two tables to form the primary filter path. Additional relationships between the same tables must be inactive (represented by a dashed line). Inactive relationships do not filter data by default but can be temporarily activated inside a DAX measure using the `USERELATIONSHIP()` function."
    },
    {
        "id": "medium-pbi-5",
        "category": "POWER BI",
        "niche": "Data Modeling and Relationships",
        "difficulty": "MEDIUM",
        "question": "What is role-playing dimension, and how do you implement it in Power BI?",
        "answer": "A role-playing dimension is a single dimension table that filters a fact table on multiple attributes (e.g., Order Date, Ship Date, and Delivery Date). In Power BI, it is implemented either by creating multiple inactive relationships to a single Date table and using `USERELATIONSHIP()`, or by importing multiple physical copies (or calculated tables) of the Date table, each linked with an active relationship."
    },
    {
        "id": "medium-pbi-6",
        "category": "POWER BI",
        "niche": "DAX Essentials",
        "difficulty": "MEDIUM",
        "question": "What is the difference between the CALCULATE function and the FILTER function in DAX?",
        "answer": "`CALCULATE` is used to modify, override, or add to the current filter context of an expression. It evaluates the expression in a newly modified context. `FILTER` is a table function that iterates over a table row-by-row and evaluates a boolean expression, returning a subset of the table. `FILTER` is often used as an argument inside `CALCULATE` for complex filtering scenarios."
    },
    {
        "id": "medium-pbi-7",
        "category": "POWER BI",
        "niche": "DAX Essentials",
        "difficulty": "MEDIUM",
        "question": "Explain how the ALL function works and provide a common use case.",
        "answer": "The `ALL` function ignores any filters that might have been applied to a table or column, returning all the rows or values. A common use case is calculating the percentage of a grand total. For example: `DIVIDE(SUM(Sales[Amount]), CALCULATE(SUM(Sales[Amount]), ALL(Sales)))`."
    },
    {
        "id": "medium-pbi-8",
        "category": "POWER BI",
        "niche": "DAX Essentials",
        "difficulty": "MEDIUM",
        "question": "What is the difference between SUM and SUMX?",
        "answer": "`SUM` is an aggregation function that operates on a single column and adds up all the values in the current filter context. `SUMX` is an iterator function that takes a table as its first argument, evaluates an expression row-by-row across that table, and then sums the results. `SUMX` is required when you need to perform row-level calculations (like Price * Quantity) before aggregating."
    },
    {
        "id": "medium-pbi-9",
        "category": "POWER BI",
        "niche": "DAX Essentials",
        "difficulty": "MEDIUM",
        "question": "How does Context Transition work in DAX?",
        "answer": "Context Transition occurs when a row context is transformed into an equivalent filter context. This happens automatically when you invoke a measure inside an iterator function (like `SUMX` or `FILTER`), or when you explicitly use the `CALCULATE` function within a calculated column or iterator. This allows row-level values to filter the broader data model."
    },
    {
        "id": "medium-pbi-10",
        "category": "POWER BI",
        "niche": "DAX Essentials",
        "difficulty": "MEDIUM",
        "question": "What is the difference between ISBLANK and ISEMPTY?",
        "answer": "`ISBLANK` evaluates a scalar value or expression and returns TRUE if the result is blank (null). `ISEMPTY` evaluates a table expression and returns TRUE if the table contains zero rows. Use `ISBLANK` for checking column values, and `ISEMPTY` for checking if a filtered table has data."
    },
    {
        "id": "medium-pbi-11",
        "category": "POWER BI",
        "niche": "Power Query (M) Transformations",
        "difficulty": "MEDIUM",
        "question": "What is Query Folding in Power Query, and why is it important?",
        "answer": "Query Folding is the ability of Power Query to translate its M transformations into a single native query statement (like SQL) that is executed by the source database. It is highly important for performance and incremental refresh, because it pushes the heavy processing to the source database rather than consuming memory and CPU in the Power BI engine."
    },
    {
        "id": "medium-pbi-12",
        "category": "POWER BI",
        "niche": "Power Query (M) Transformations",
        "difficulty": "MEDIUM",
        "question": "Which types of transformations typically break Query Folding?",
        "answer": "Transformations that do not have equivalent native SQL operations break folding. Examples include changing column types (sometimes), writing custom M functions, merging tables from different sources, adding an index column, keeping bottom rows, or parsing complex JSON/XML structures."
    },
    {
        "id": "medium-pbi-13",
        "category": "POWER BI",
        "niche": "Power Query (M) Transformations",
        "difficulty": "MEDIUM",
        "question": "How do you unpivot columns in Power Query, and when should you use it?",
        "answer": "Unpivoting transforms a wide table (e.g., separate columns for Jan, Feb, Mar sales) into a tall table (e.g., a 'Month' column and a 'Sales' column). You highlight the static columns (like Product ID), right-click, and select 'Unpivot Other Columns'. It is used to normalize data into a tabular format, which is required for efficient filtering and DAX calculations."
    },
    {
        "id": "medium-pbi-14",
        "category": "POWER BI",
        "niche": "Power Query (M) Transformations",
        "difficulty": "MEDIUM",
        "question": "What is the difference between Append and Merge in Power Query?",
        "answer": "`Append` is equivalent to a SQL UNION; it stacks tables vertically, combining the rows of two or more tables with matching column names. `Merge` is equivalent to a SQL JOIN; it combines tables horizontally by matching rows based on common key columns."
    },
    {
        "id": "medium-pbi-15",
        "category": "POWER BI",
        "niche": "Power Query (M) Transformations",
        "difficulty": "MEDIUM",
        "question": "How can you parameterize a data source connection in Power BI?",
        "answer": "In Power Query, go to 'Manage Parameters' and create a new text parameter (e.g., 'ServerName'). Then, in the Advanced Editor or the Source step settings of your query, replace the hardcoded server string with the parameter name. This allows you to easily switch between Development and Production environments by changing the parameter value."
    },
    {
        "id": "medium-pbi-16",
        "category": "POWER BI",
        "niche": "Service and Administration",
        "difficulty": "MEDIUM",
        "question": "What is the difference between a Pro license and a Premium Per User (PPU) license in Power BI?",
        "answer": "A Pro license allows users to publish, share, and consume reports within shared workspaces, limited to 1GB model size and 8 refreshes/day. A PPU license provides access to Premium features (like Paginated Reports, AI workloads, XMLA endpoint, and Datamarts), supports up to 100GB model sizes, and allows 48 refreshes/day. Note that PPU content can only be shared with other PPU licensed users."
    },
    {
        "id": "medium-pbi-17",
        "category": "POWER BI",
        "niche": "Service and Administration",
        "difficulty": "MEDIUM",
        "question": "Explain Row-Level Security (RLS) and how it is implemented in Power BI.",
        "answer": "RLS restricts data access for given users based on filters applied at the row level. Implementation involves two steps: 1) In Power BI Desktop, define 'Roles' and write DAX filter expressions (e.g., `[Region] = \"North America\"` or `[Email] = USERPRINCIPALNAME()`) on the dimension tables. 2) In the Power BI Service, assign users or Azure AD security groups to those roles in the dataset security settings."
    },
    {
        "id": "medium-pbi-18",
        "category": "POWER BI",
        "niche": "Service and Administration",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of a Deployment Pipeline in the Power BI Service?",
        "answer": "Deployment Pipelines facilitate application lifecycle management (ALM). They provide a UI to move Power BI content (datasets, reports, dashboards) through Development, Test, and Production environments. They allow administrators to define deployment rules (e.g., changing data source parameters from dev to prod databases) without manual intervention."
    },
    {
        "id": "medium-pbi-19",
        "category": "POWER BI",
        "niche": "Service and Administration",
        "difficulty": "MEDIUM",
        "question": "What is a Power BI Gateway, and when is it required?",
        "answer": "The Power BI On-premises Data Gateway acts as a secure bridge that provides quick data transfer between the Power BI Service (cloud) and on-premises data sources (e.g., local SQL Server or local files). It is required whenever a published dataset needs to refresh or directly query data that resides behind a corporate firewall."
    },
    {
        "id": "medium-pbi-20",
        "category": "POWER BI",
        "niche": "Service and Administration",
        "difficulty": "MEDIUM",
        "question": "What is the difference between a Dashboard and a Report in Power BI?",
        "answer": "A Report is a multi-page document with rich interactivity, slicers, and cross-filtering, built from a single dataset. A Dashboard is a single-page canvas (only available in the Power BI Service) created by pinning visuals from multiple different reports and datasets. Dashboards cannot have slicers and are meant for high-level monitoring."
    },
    {
        "id": "medium-sql-1",
        "category": "SQL SERVER",
        "niche": "T-SQL Querying",
        "difficulty": "MEDIUM",
        "question": "What is a Common Table Expression (CTE) and how does it differ from a temporary table?",
        "answer": "A CTE (defined using the `WITH` clause) is a temporary named result set that exists only during the execution scope of a single SELECT, INSERT, UPDATE, or DELETE statement. Unlike temporary tables (`#table`), CTEs are not physically stored in tempdb, do not support indexing, and are generally used to simplify complex joins, improve readability, or write recursive queries."
    },
    {
        "id": "medium-sql-2",
        "category": "SQL SERVER",
        "niche": "T-SQL Querying",
        "difficulty": "MEDIUM",
        "question": "Explain the difference between ROW_NUMBER(), RANK(), and DENSE_RANK().",
        "answer": "All are window functions used to rank rows. `ROW_NUMBER()` assigns a unique sequential integer to each row regardless of duplicates. `RANK()` gives the same rank to identical values but leaves a gap in the sequence for the next rank (e.g., 1, 2, 2, 4). `DENSE_RANK()` gives the same rank to identical values without leaving gaps (e.g., 1, 2, 2, 3)."
    },
    {
        "id": "medium-sql-3",
        "category": "SQL SERVER",
        "niche": "T-SQL Querying",
        "difficulty": "MEDIUM",
        "question": "How do CROSS APPLY and OUTER APPLY differ from INNER JOIN and LEFT JOIN?",
        "answer": "While JOINs combine two physical tables, `APPLY` operators invoke a table-valued function or subquery for each row of the outer table. `CROSS APPLY` acts like an INNER JOIN (removes outer rows if the function returns empty), while `OUTER APPLY` acts like a LEFT JOIN (keeps outer rows with NULLs if the function returns empty). They are essential when the subquery logic depends on columns from the outer table."
    },
    {
        "id": "medium-sql-4",
        "category": "SQL SERVER",
        "niche": "T-SQL Querying",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of the PIVOT relational operator in SQL Server?",
        "answer": "The `PIVOT` operator transforms rows into columns, turning unique values from one column in the input table into multiple output columns, while performing an aggregation (e.g., SUM or MAX) on another column. It is commonly used for generating cross-tabular reports."
    },
    {
        "id": "medium-sql-5",
        "category": "SQL SERVER",
        "niche": "T-SQL Querying",
        "difficulty": "MEDIUM",
        "question": "Explain how the MERGE statement works in T-SQL.",
        "answer": "The `MERGE` statement performs INSERT, UPDATE, or DELETE operations on a target table based on the results of a join with a source table. It allows you to synchronize two tables in a single statement using `WHEN MATCHED` (to update/delete) and `WHEN NOT MATCHED` (to insert) clauses."
    },
    {
        "id": "medium-sql-6",
        "category": "SQL SERVER",
        "niche": "Indexing and Performance",
        "difficulty": "MEDIUM",
        "question": "What is the difference between a Clustered and a Non-Clustered index?",
        "answer": "A Clustered Index determines the physical sorting order of the data pages in the table; therefore, a table can only have one clustered index (usually the primary key). A Non-Clustered Index contains a sorted list of index keys with pointers back to the physical data rows (or the clustered index key), meaning you can have multiple non-clustered indexes on a single table."
    },
    {
        "id": "medium-sql-7",
        "category": "SQL SERVER",
        "niche": "Indexing and Performance",
        "difficulty": "MEDIUM",
        "question": "What is a Covering Index?",
        "answer": "A Covering Index is a non-clustered index that includes all the columns required by a specific query (in the SELECT, JOIN, and WHERE clauses). Because all necessary data is in the index structure, the SQL engine does not need to perform a costly 'Key Lookup' to the underlying clustered index/table data, significantly speeding up query execution."
    },
    {
        "id": "medium-sql-8",
        "category": "SQL SERVER",
        "niche": "Indexing and Performance",
        "difficulty": "MEDIUM",
        "question": "Explain Index Fragmentation and how to resolve it.",
        "answer": "Fragmentation occurs when the logical order of pages in an index doesn't match the physical order on disk, or when pages have excessive free space due to frequent INSERT/UPDATE/DELETE operations. It degrades read performance. It is resolved by performing an `ALTER INDEX REORGANIZE` (for light fragmentation, usually <30%) or `ALTER INDEX REBUILD` (for heavy fragmentation, >30%)."
    },
    {
        "id": "medium-sql-9",
        "category": "SQL SERVER",
        "niche": "Indexing and Performance",
        "difficulty": "MEDIUM",
        "question": "What are Execution Plans, and how do you use them?",
        "answer": "An Execution Plan is a graphical or XML representation of the steps the SQL Server Query Optimizer chose to execute a query. It shows operations like Index Seeks, Table Scans, and Hash Matches, along with cost percentages. DBAs use them to identify bottlenecks, such as missing indexes, implicit conversions, or suboptimal join strategies."
    },
    {
        "id": "medium-sql-10",
        "category": "SQL SERVER",
        "niche": "Indexing and Performance",
        "difficulty": "MEDIUM",
        "question": "What is the difference between an Index Seek and an Index Scan?",
        "answer": "An Index Seek is highly efficient; the engine traverses the B-tree structure to find a specific starting point and retrieves only the matching rows. An Index Scan means the engine reads every row in the index (or table) from beginning to end to evaluate the query conditions. Scans typically indicate missing indexes or non-sargable query predicates."
    },
    {
        "id": "medium-sql-11",
        "category": "SQL SERVER",
        "niche": "Transactions and Concurrency",
        "difficulty": "MEDIUM",
        "question": "What is the ACID property in SQL transactions?",
        "answer": "ACID stands for Atomicity (all parts of the transaction succeed or fail together), Consistency (data remains in a valid state), Isolation (concurrent transactions do not interfere with each other), and Durability (committed transactions survive system crashes). These guarantee reliable database processing."
    },
    {
        "id": "medium-sql-12",
        "category": "SQL SERVER",
        "niche": "Transactions and Concurrency",
        "difficulty": "MEDIUM",
        "question": "Explain the difference between Read Committed and Read Uncommitted isolation levels.",
        "answer": "`Read Committed` (the default) ensures that a query only reads data that has been fully committed, preventing dirty reads. `Read Uncommitted` allows queries to read data that is currently being modified by an uncommitted transaction (using `NOLOCK`). While this avoids locking delays, it risks returning dirty, inaccurate data."
    },
    {
        "id": "medium-sql-13",
        "category": "SQL SERVER",
        "niche": "Transactions and Concurrency",
        "difficulty": "MEDIUM",
        "question": "What is a Deadlock in SQL Server, and how can it be prevented?",
        "answer": "A deadlock occurs when two concurrent transactions hold locks that the other needs, resulting in a circular dependency where neither can proceed. SQL Server resolves this by choosing a deadlock victim and rolling it back. Prevention strategies include accessing tables in the same consistent order across all procedures, keeping transactions short, and using appropriate isolation levels like SNAPSHOT."
    },
    {
        "id": "medium-sql-14",
        "category": "SQL SERVER",
        "niche": "Transactions and Concurrency",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of the TRY...CATCH block in T-SQL?",
        "answer": "The `TRY...CATCH` block enables structured error handling. Statements inside the `TRY` block execute normally. If an error occurs (severity greater than 10), execution jumps to the `CATCH` block, where you can log error details (using `ERROR_MESSAGE()`, `ERROR_LINE()`) and safely issue a `ROLLBACK TRANSACTION`."
    },
    {
        "id": "medium-sql-15",
        "category": "SQL SERVER",
        "niche": "Transactions and Concurrency",
        "difficulty": "MEDIUM",
        "question": "What is Snapshot Isolation?",
        "answer": "Snapshot isolation uses row versioning in `tempdb` to provide a transactionally consistent view of the database. When a transaction reads data, it sees the version of the data that existed at the start of the transaction, without placing shared locks. This prevents readers from blocking writers and vice versa, at the cost of higher tempdb usage."
    },
    {
        "id": "medium-sql-16",
        "category": "SQL SERVER",
        "niche": "Architecture and Administration",
        "difficulty": "MEDIUM",
        "question": "Explain the difference between a View and a Stored Procedure.",
        "answer": "A View is a virtual table representing a saved SELECT query; it can be joined like a table but generally cannot accept parameters natively. A Stored Procedure is a compiled set of T-SQL statements that can accept input parameters, execute complex logic (IF/WHILE, variable assignment), perform DML (INSERT/UPDATE/DELETE), and return multiple result sets."
    },
    {
        "id": "medium-sql-17",
        "category": "SQL SERVER",
        "niche": "Architecture and Administration",
        "difficulty": "MEDIUM",
        "question": "What is TempDB, and what is it used for?",
        "answer": "TempDB is a global system database in SQL Server used as a scratchpad for temporary objects (like `#temp` tables), row versioning (Snapshot Isolation), internal sorting operations (for GROUP BY, ORDER BY, index rebuilds), and cursors. It is recreated every time the SQL Server service restarts."
    },
    {
        "id": "medium-sql-18",
        "category": "SQL SERVER",
        "niche": "Architecture and Administration",
        "difficulty": "MEDIUM",
        "question": "What is the difference between a Truncate and a Delete operation?",
        "answer": "`DELETE` is a logged operation that removes rows one by one, firing triggers and consuming significant transaction log space. It can be rolled back. `TRUNCATE` is a faster, minimally logged operation that deallocates entire data pages. It resets identity columns and cannot be used if a foreign key references the table. It also cannot fire AFTER triggers."
    },
    {
        "id": "medium-sql-19",
        "category": "SQL SERVER",
        "niche": "Architecture and Administration",
        "difficulty": "MEDIUM",
        "question": "What are Linked Servers?",
        "answer": "Linked Servers are configurations in SQL Server that allow the database engine to execute distributed queries against OLE DB data sources residing on different servers (e.g., Oracle, Excel, or another SQL Server). They enable querying external data using standard T-SQL via four-part naming (`Server.Database.Schema.Table`)."
    },
    {
        "id": "medium-sql-20",
        "category": "SQL SERVER",
        "niche": "Architecture and Administration",
        "difficulty": "MEDIUM",
        "question": "How do you handle NULL values effectively in SQL queries?",
        "answer": "NULL represents an unknown value, not a zero or blank string. Therefore, `WHERE column = NULL` fails; you must use `IS NULL` or `IS NOT NULL`. To provide fallback values, use functions like `ISNULL(column, 'Default')` or `COALESCE(col1, col2, 'Default')`. Aggregate functions (like SUM, AVG) ignore NULLs, which can skew expected results."
    },
    {
        "id": "medium-adf-1",
        "category": "ADF",
        "niche": "Orchestration and Activities",
        "difficulty": "MEDIUM",
        "question": "What is the difference between a Copy Activity and a Mapping Data Flow in Azure Data Factory?",
        "answer": "A Copy Activity is a high-performance orchestration tool used to move raw data from a source to a sink as quickly as possible without transforming the contents. A Mapping Data Flow provides a visual, code-free interface for complex data transformations (joins, aggregations, pivoting) which executes on a managed Apache Spark cluster behind the scenes."
    },
    {
        "id": "medium-adf-2",
        "category": "ADF",
        "niche": "Orchestration and Activities",
        "difficulty": "MEDIUM",
        "question": "Explain the purpose of the Lookup Activity.",
        "answer": "The Lookup Activity reads and returns the contents of a dataset (a table row, a JSON file, or a query result). It is primarily used to fetch configuration metadata—such as a list of table names or high-watermark dates—which is then passed into subsequent activities (like a ForEach loop) via the `@activity('LookupName').output.value` expression."
    },
    {
        "id": "medium-adf-3",
        "category": "ADF",
        "niche": "Orchestration and Activities",
        "difficulty": "MEDIUM",
        "question": "How does the ForEach activity handle concurrency?",
        "answer": "By default, the ForEach activity executes its inner activities concurrently (in parallel) up to a limit of 20 concurrent batches (configurable up to 50). You can check the 'Sequential' box in the activity settings to force it to iterate through the items one at a time, which is necessary if the inner activities update a shared state or if the sink database cannot handle concurrent loads."
    },
    {
        "id": "medium-adf-4",
        "category": "ADF",
        "niche": "Orchestration and Activities",
        "difficulty": "MEDIUM",
        "question": "What is the Get Metadata Activity and what information can it extract?",
        "answer": "The Get Metadata Activity extracts metadata from files or folders in storage. Depending on the dataset type, it can return attributes such as `childItems` (a list of files in a folder), `exists` (to check if a file is present), `size`, `lastModified`, and `columnCount`. This is often used to validate file arrivals before triggering a pipeline."
    },
    {
        "id": "medium-adf-5",
        "category": "ADF",
        "niche": "Orchestration and Activities",
        "difficulty": "MEDIUM",
        "question": "Explain the role of the Execute Pipeline activity.",
        "answer": "The Execute Pipeline activity allows one pipeline (the parent) to invoke another pipeline (the child). This promotes modularity and code reuse. You can pass parameters from the parent to the child and choose whether the parent should 'Wait on completion' of the child pipeline before proceeding to its next step."
    },
    {
        "id": "medium-adf-6",
        "category": "ADF",
        "niche": "Integration Runtimes",
        "difficulty": "MEDIUM",
        "question": "What is an Integration Runtime (IR) in Azure Data Factory?",
        "answer": "The Integration Runtime is the compute infrastructure used by ADF to execute data integration capabilities. It dictates *where* the activity runs. It bridges the gap between ADF orchestration and the actual data sources."
    },
    {
        "id": "medium-adf-7",
        "category": "ADF",
        "niche": "Integration Runtimes",
        "difficulty": "MEDIUM",
        "question": "What is the difference between an Azure IR and a Self-Hosted IR?",
        "answer": "An Azure IR is a fully managed, serverless compute infrastructure provided by Microsoft, used to connect to cloud-based data stores with public endpoints. A Self-Hosted IR is installed on a local machine or private virtual machine. It securely connects ADF to on-premises data sources or private cloud resources behind a corporate firewall without exposing public inbound ports."
    },
    {
        "id": "medium-adf-8",
        "category": "ADF",
        "niche": "Integration Runtimes",
        "difficulty": "MEDIUM",
        "question": "How do you achieve High Availability for a Self-Hosted Integration Runtime?",
        "answer": "High Availability is achieved by associating the same logical Self-Hosted IR in ADF with multiple physical on-premises nodes (up to 4 machines). ADF automatically distributes the load and provides failover redundancy if one of the physical nodes goes offline."
    },
    {
        "id": "medium-adf-9",
        "category": "ADF",
        "niche": "Security and Parameters",
        "difficulty": "MEDIUM",
        "question": "How do you securely manage database passwords and API keys in ADF?",
        "answer": "Secrets should never be hardcoded in ADF Linked Services. Instead, ADF should use Managed Identity to authenticate to an Azure Key Vault. The Linked Service should be configured to fetch the secret from the Key Vault at runtime using the secret's name, ensuring that sensitive credentials are never exposed in the ADF JSON definitions."
    },
    {
        "id": "medium-adf-10",
        "category": "ADF",
        "niche": "Security and Parameters",
        "difficulty": "MEDIUM",
        "question": "What is the difference between Pipeline Parameters and Global Parameters?",
        "answer": "Pipeline Parameters are specific to a single pipeline and must be provided at the time of pipeline execution (via a trigger or parent pipeline). Global Parameters are constant values defined at the Data Factory level. They are accessible across all pipelines in the factory, making them ideal for storing environment-specific configuration (like an API URL) during CI/CD deployments."
    }
]

# Read questions.js
with open('/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/questions.js', 'r') as f:
    content = f.read()

# Prepare json string
json_str = json.dumps(new_batch, indent=2)
json_str = json_str[1:-1].strip() # remove [ ]

if content.strip().endswith('];'):
    new_content = content.rsplit(']', 1)[0]
    if not new_content.strip().endswith('['):
        new_content += ",\n"
    new_content += json_str + "\n];\n"
    
    with open('/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/questions.js', 'w') as f:
        f.write(new_content)
    print("Batch 1 (50 questions) added successfully.")
else:
    print("Failed to parse questions.js")
