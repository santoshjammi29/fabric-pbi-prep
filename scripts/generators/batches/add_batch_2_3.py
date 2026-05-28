import json

new_batch = [
    {
        "id": "medium-adf-11",
        "category": "ADF",
        "niche": "Data Flows and Transformations",
        "difficulty": "MEDIUM",
        "question": "What is the difference between a Derived Column transformation and an Aggregate transformation in a Mapping Data Flow?",
        "answer": "A Derived Column transformation modifies or creates new columns on a row-by-row basis without changing the total number of rows. An Aggregate transformation calculates aggregates (like SUM, AVG, MIN, MAX) over a defined grouping of rows, which generally reduces the total number of rows output by the transformation."
    },
    {
        "id": "medium-adf-12",
        "category": "ADF",
        "niche": "Data Flows and Transformations",
        "difficulty": "MEDIUM",
        "question": "How does the Surrogate Key transformation work in ADF?",
        "answer": "The Surrogate Key transformation adds an incrementing, non-business integer key to each row of data in the data flow. It is heavily used in building Data Warehouses to generate unique primary keys for Dimension tables (Type 1 and Type 2 SCDs). You can specify a starting value or use a custom step."
    },
    {
        "id": "medium-adf-13",
        "category": "ADF",
        "niche": "Data Flows and Transformations",
        "difficulty": "MEDIUM",
        "question": "Explain the use of the Exists transformation.",
        "answer": "The Exists transformation is used to filter a data stream by checking whether records exist (or do not exist) in another data stream, similar to a SQL `EXISTS` or `NOT EXISTS` clause. Unlike a Join, it does not duplicate rows from the left stream if there are multiple matches in the right stream, and it does not append columns from the right stream."
    },
    {
        "id": "medium-adf-14",
        "category": "ADF",
        "niche": "Data Flows and Transformations",
        "difficulty": "MEDIUM",
        "question": "What is Schema Drift in ADF, and how is it handled?",
        "answer": "Schema Drift occurs when your sources change metadata frequently (columns are added, removed, or data types change). ADF Mapping Data Flows handle this via 'Allow Schema Drift' settings on Source and Sink transformations. When enabled, ADF automatically flows all incoming columns through the pipeline to the destination, even if they aren't explicitly defined in the dataset schema."
    },
    {
        "id": "medium-adf-15",
        "category": "ADF",
        "niche": "Data Flows and Transformations",
        "difficulty": "MEDIUM",
        "question": "How can you optimize a Mapping Data Flow that performs a join between a massive Fact table and a tiny Dimension table?",
        "answer": "You should use 'Broadcast' optimization for the Join transformation. By broadcasting the tiny dimension table, ADF sends a full copy of that small table to every Spark worker node executing the data flow. This prevents the costly shuffling of the massive Fact table across the network, significantly speeding up the join operation."
    },
    {
        "id": "medium-adf-16",
        "category": "ADF",
        "niche": "Triggers and Scheduling",
        "difficulty": "MEDIUM",
        "question": "What is the difference between a Schedule Trigger and a Tumbling Window Trigger?",
        "answer": "A Schedule Trigger fires a pipeline based on a wall-clock schedule (e.g., every Monday at 8 AM) and does not care about past states if the pipeline was paused. A Tumbling Window Trigger fires at periodic, non-overlapping time intervals (e.g., every hour). It maintains state, allows for backfilling historical windows if the pipeline was paused, and allows configuring dependencies between different tumbling windows."
    },
    {
        "id": "medium-adf-17",
        "category": "ADF",
        "niche": "Triggers and Scheduling",
        "difficulty": "MEDIUM",
        "question": "How does a Storage Event Trigger work?",
        "answer": "A Storage Event Trigger executes a pipeline in response to an event in an Azure Storage account, specifically when a blob is created or deleted. It uses Azure Event Grid under the hood to capture the event. You can configure filters such as `blobPathBeginsWith` or `blobPathEndsWith` to only trigger pipelines for specific files."
    },
    {
        "id": "medium-adf-18",
        "category": "ADF",
        "niche": "Monitoring and Error Handling",
        "difficulty": "MEDIUM",
        "question": "How can you implement custom alerting in ADF when a pipeline fails?",
        "answer": "You can configure Alerts & Metrics in the ADF Monitor tab using Azure Monitor to send emails/SMS based on pipeline failure metrics. Alternatively, within the pipeline itself, you can add a Web Activity connected to the 'On Failure' path of your main activities. The Web Activity can call an Azure Logic App via an HTTP webhook, passing error details to send a highly customized Slack message or Email."
    },
    {
        "id": "medium-adf-19",
        "category": "ADF",
        "niche": "Monitoring and Error Handling",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of Log Analytics workspace integration with Azure Data Factory?",
        "answer": "By routing ADF diagnostic logs (PipelineRuns, ActivityRuns, TriggerRuns) to an Azure Log Analytics workspace, you can retain pipeline execution history beyond ADF's default 45-day retention limit. It allows you to write complex Kusto Query Language (KQL) queries to analyze historical performance trends, track long-running activities, and build custom dashboards in Azure Monitor."
    },
    {
        "id": "medium-adf-20",
        "category": "ADF",
        "niche": "Monitoring and Error Handling",
        "difficulty": "MEDIUM",
        "question": "Explain how the 'Retry' policy works on an ADF Activity.",
        "answer": "The Retry policy allows an activity to automatically attempt re-execution if it fails due to a transient error (like a temporary network glitch or source database timeout). You can configure the 'Retry count' (number of attempts) and 'Retry interval in seconds' (delay between attempts). If the activity still fails after all retries, the pipeline execution proceeds down the 'On Failure' path."
    },
    {
        "id": "medium-adf-21",
        "category": "ADF",
        "niche": "Advanced Orchestration",
        "difficulty": "MEDIUM",
        "question": "What is the maximum limit for activities within a single ADF pipeline, and how do you overcome it?",
        "answer": "A single ADF pipeline is limited to a maximum of 40 activities. To overcome this limitation, you must modularize your logic by splitting the workflow into multiple smaller pipelines and using the 'Execute Pipeline' activity to call these child pipelines from a master orchestrator pipeline."
    },
    {
        "id": "medium-adf-22",
        "category": "ADF",
        "niche": "Advanced Orchestration",
        "difficulty": "MEDIUM",
        "question": "How do you handle pagination when using the REST or HTTP connector in a Copy Activity?",
        "answer": "The REST connector natively supports pagination rules. In the source settings, you can define 'Pagination rules' that tell ADF how to find the next page of data. You can map it to an absolute URL returned in the response body (e.g., `['next_page_link']`), a relative URL in the headers, or an incrementing offset query parameter, allowing ADF to automatically loop through all pages until the API returns no more data."
    },
    {
        "id": "medium-adf-23",
        "category": "ADF",
        "niche": "Advanced Orchestration",
        "difficulty": "MEDIUM",
        "question": "What is the Set Variable activity, and what are its limitations?",
        "answer": "The Set Variable activity assigns a value to a user-defined pipeline variable. However, its major limitation is that it does not support self-referencing (e.g., you cannot do `Counter = Counter + 1` in a single Set Variable activity). To increment a variable, you typically need to use two variables or rely on the Append Variable activity if you are building an array."
    },
    {
        "id": "medium-adf-24",
        "category": "ADF",
        "niche": "Advanced Orchestration",
        "difficulty": "MEDIUM",
        "question": "Explain the difference between the Web Activity and the Webhook Activity in ADF.",
        "answer": "The Web Activity makes a synchronous HTTP request to an external endpoint and immediately proceeds to the next activity once a response (like HTTP 200) is received. The Webhook Activity makes an HTTP request but then pauses the pipeline. It waits for the external system to make a callback request to a specific URL (provided by ADF in the payload) before the pipeline resumes."
    },
    {
        "id": "medium-adf-25",
        "category": "ADF",
        "niche": "Advanced Orchestration",
        "difficulty": "MEDIUM",
        "question": "How do you implement a dynamic schema mapping in a Copy Activity?",
        "answer": "Instead of hardcoding column mappings in the Copy Activity's UI, you can pass a JSON object containing the schema mapping rules dynamically at runtime. You build this JSON object using dynamic content (often constructed via a Lookup activity reading from a control table) and assign it to the 'Mapping' property of the Copy Activity in the JSON code view."
    },
    {
        "id": "medium-adf-26",
        "category": "ADF",
        "niche": "Security and Networking",
        "difficulty": "MEDIUM",
        "question": "What is a Managed Virtual Network (VNet) in Azure Data Factory?",
        "answer": "A Managed VNet isolates the Azure Integration Runtime within a secure network managed by Microsoft. This ensures that data movement between ADF and Azure PaaS data stores (like Azure SQL or ADLS) does not traverse the public internet. Instead, it uses Azure Private Endpoints to securely connect to those resources."
    },
    {
        "id": "medium-adf-27",
        "category": "ADF",
        "niche": "Security and Networking",
        "difficulty": "MEDIUM",
        "question": "How do you connect an ADF Managed VNet Integration Runtime to an Azure SQL Database?",
        "answer": "You must create a 'Managed Private Endpoint' in the ADF portal targeting the Azure SQL Database. Once created, the endpoint is in a 'Pending' state. A database administrator must then log into the Azure Portal for the SQL Server and 'Approve' the private endpoint connection. After approval, ADF can securely access the database."
    },
    {
        "id": "medium-adf-28",
        "category": "ADF",
        "niche": "Security and Networking",
        "difficulty": "MEDIUM",
        "question": "What happens if a Copy Activity uses a Self-Hosted IR for the source and an Azure IR for the sink?",
        "answer": "ADF requires both the source and sink of a Copy Activity to use the same Integration Runtime environment. If the linked services dictate different IRs, ADF defaults to using the Self-Hosted IR to perform the data movement, as it assumes the Azure IR cannot reach the on-premises source."
    },
    {
        "id": "medium-adf-29",
        "category": "ADF",
        "niche": "Security and Networking",
        "difficulty": "MEDIUM",
        "question": "Explain Role-Based Access Control (RBAC) in the context of ADF.",
        "answer": "RBAC controls who can view, edit, or execute pipelines within an ADF instance. The primary built-in roles are 'Data Factory Contributor' (can create/edit pipelines, datasets, and triggers but cannot grant access to others) and 'Reader' (can only view pipelines and monitor runs). Custom roles can be created for more granular permissions."
    },
    {
        "id": "medium-adf-30",
        "category": "ADF",
        "niche": "Security and Networking",
        "difficulty": "MEDIUM",
        "question": "Why is CI/CD using ARM templates important for Azure Data Factory deployments?",
        "answer": "ADF uses ARM templates to represent its entire configuration (pipelines, datasets, linked services) as code. Integrating with Git and using CI/CD pipelines (via Azure DevOps or GitHub Actions) allows teams to version control their ETL code, review pull requests, and promote changes consistently across Dev, Test, and Prod environments without manually recreating workflows."
    },
    {
        "id": "medium-datalake-1",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Medallion Architecture",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of the Bronze layer in a Medallion Architecture?",
        "answer": "The Bronze layer (or Raw zone) stores raw data exactly as it was ingested from source systems. Data is usually stored in its native format (CSV, JSON, Parquet) without any transformations, cleansing, or schema enforcement. It acts as an immutable historical archive, allowing data engineers to replay ingestion or debug data issues without hitting the source system again."
    },
    {
        "id": "medium-datalake-2",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Medallion Architecture",
        "difficulty": "MEDIUM",
        "question": "What operations are typically performed when moving data from the Bronze to the Silver layer?",
        "answer": "The Silver layer (or Cleansed zone) represents a consolidated, validated, and normalized view of the data. Moving from Bronze to Silver involves filtering out malformed records, standardizing formats (e.g., date formats, casing), deduplication, enforcing schemas, and converting data to highly optimized formats like Delta Lake or Parquet."
    },
    {
        "id": "medium-datalake-3",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Medallion Architecture",
        "difficulty": "MEDIUM",
        "question": "What distinguishes the Gold layer from the Silver layer?",
        "answer": "While the Silver layer contains normalized enterprise data, the Gold layer (or Curated zone) contains data explicitly modeled for business intelligence and reporting. Data in the Gold layer is usually aggregated, denormalized into Star Schemas (fact and dimension tables), and enriched with business logic to directly power dashboards and ML models."
    },
    {
        "id": "medium-datalake-4",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Storage Optimization",
        "difficulty": "MEDIUM",
        "question": "Why is Parquet preferred over CSV for storing large datasets in a Data Lake?",
        "answer": "Parquet is a columnar storage format, whereas CSV is row-based. Columnar storage allows analytical queries to read only the specific columns they need, drastically reducing disk I/O. Parquet also supports aggressive compression (since data in a column is highly homogeneous), embedded schemas, and predicate pushdown, making it vastly superior for big data analytics."
    },
    {
        "id": "medium-datalake-5",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Storage Optimization",
        "difficulty": "MEDIUM",
        "question": "What is the 'Small Files Problem' in Hadoop and Data Lakes?",
        "answer": "The Small Files Problem occurs when a data lake stores millions of tiny files (e.g., a few KBs each) instead of fewer large files. This causes massive metadata overhead for the file system (e.g., HDFS or ADLS NameNode) and forces distributed processing engines like Spark to spend more time opening, reading, and closing files than actually processing data."
    },
    {
        "id": "medium-datalake-6",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Storage Optimization",
        "difficulty": "MEDIUM",
        "question": "How do you resolve the Small Files Problem in a Data Lake environment?",
        "answer": "The problem is resolved by running a compaction job. In Spark, you can read the many small files and write them back using `coalesce()` or `repartition()` to combine them into optimally sized files (typically 128MB to 1GB). In Delta Lake, this is handled automatically using the `OPTIMIZE` command with bin-packing."
    },
    {
        "id": "medium-datalake-7",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Lake Governance",
        "difficulty": "MEDIUM",
        "question": "What is a Data Catalog, and why is it critical for Data Lakes?",
        "answer": "A Data Catalog (e.g., Azure Purview, Alation) is a metadata management tool that indexes data assets across the lake. It prevents the data lake from becoming a 'data swamp' by allowing users to search for data, view schemas, track data lineage, assign business glossaries, and manage access policies, ensuring data is discoverable and trustworthy."
    },
    {
        "id": "medium-datalake-8",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Lake Governance",
        "difficulty": "MEDIUM",
        "question": "Explain the concept of Data Lineage.",
        "answer": "Data Lineage is the visual or programmatic tracking of data as it flows from its origin to its final destination. It shows where the data came from, what transformations were applied to it, and which downstream dashboards or ML models consume it. This is essential for root cause analysis, auditing, and impact analysis when making upstream changes."
    },
    {
        "id": "medium-datalake-9",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Lake Governance",
        "difficulty": "MEDIUM",
        "question": "How do you enforce schema validation in a Data Lake without a traditional database engine?",
        "answer": "Schema validation can be enforced at the compute layer using tools like Spark or Delta Lake. For example, Delta Lake enforces schema on write, rejecting incoming data if it doesn't match the table's defined schema. Alternatively, tools like Great Expectations can be integrated into the data pipeline to run data quality and schema assertions before writing data."
    },
    {
        "id": "medium-datalake-10",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Azure Data Lake Storage Gen2",
        "difficulty": "MEDIUM",
        "question": "What is the key architectural difference between Azure Blob Storage and Azure Data Lake Storage (ADLS) Gen2?",
        "answer": "ADLS Gen2 adds a Hierarchical Namespace (HNS) on top of Azure Blob Storage. While Blob Storage uses a flat structure that fakes folders using string prefixes, HNS implements true directories. This makes directory-level operations (like renaming or deleting a folder with millions of files) an atomic, instant operation, drastically improving big data processing performance."
    },
    {
        "id": "medium-spark-1",
        "category": "SPARK & DATABRICKS",
        "niche": "Spark Core Concepts",
        "difficulty": "MEDIUM",
        "question": "What is the difference between a Spark Transformation and a Spark Action?",
        "answer": "A Transformation (e.g., `map()`, `filter()`, `join()`) creates a new DataFrame/RDD from an existing one but does not compute the result immediately due to lazy evaluation. An Action (e.g., `count()`, `show()`, `write()`) triggers the actual execution of the entire transformation lineage across the cluster to return a result to the driver or write data to storage."
    },
    {
        "id": "medium-spark-2",
        "category": "SPARK & DATABRICKS",
        "niche": "Spark Core Concepts",
        "difficulty": "MEDIUM",
        "question": "Explain the concept of Lazy Evaluation in Apache Spark.",
        "answer": "Lazy evaluation means Spark delays the execution of transformations until an action is called. Instead of processing data step-by-step, Spark builds a Directed Acyclic Graph (DAG) of the logical execution plan. When an action is triggered, the Catalyst Optimizer analyzes the entire DAG to execute the most efficient physical plan (e.g., combining filters and pushing them down to the data source)."
    },
    {
        "id": "medium-spark-3",
        "category": "SPARK & DATABRICKS",
        "niche": "Spark Core Concepts",
        "difficulty": "MEDIUM",
        "question": "What is the difference between narrow and wide transformations in Spark?",
        "answer": "Narrow transformations (e.g., `map()`, `filter()`) compute results using data from a single partition, requiring no data movement across the network. Wide transformations (e.g., `groupBy()`, `join()`, `orderBy()`) require data from multiple partitions to compute results. This forces a 'shuffle', where data is heavily moved across the network between executor nodes, which is an expensive operation."
    },
    {
        "id": "medium-spark-4",
        "category": "SPARK & DATABRICKS",
        "niche": "Spark Architecture",
        "difficulty": "MEDIUM",
        "question": "What are the roles of the Driver and the Executors in a Spark Cluster?",
        "answer": "The Driver is the master node that runs the `main()` function of the application, maintains the SparkContext, translates user code into a DAG, and schedules tasks. The Executors are worker nodes that receive tasks from the driver, execute the data processing on their assigned partitions, cache data in memory, and return the status and results to the driver."
    },
    {
        "id": "medium-spark-5",
        "category": "SPARK & DATABRICKS",
        "niche": "Spark Architecture",
        "difficulty": "MEDIUM",
        "question": "What is the purpose of the Cluster Manager in Spark (e.g., YARN, Kubernetes)?",
        "answer": "The Cluster Manager sits between the Spark application and the underlying physical infrastructure. Its role is to allocate hardware resources (CPU cores and memory) to the Spark Driver and Executors based on the application's configuration requests, ensuring fair sharing of cluster resources among multiple concurrent applications."
    },
    {
        "id": "medium-spark-6",
        "category": "SPARK & DATABRICKS",
        "niche": "Performance Optimization",
        "difficulty": "MEDIUM",
        "question": "Explain the difference between repartition() and coalesce().",
        "answer": "Both alter the number of partitions in a DataFrame. `repartition()` can increase or decrease partitions and causes a full network shuffle to distribute data evenly. `coalesce()` is optimized for decreasing partitions; it avoids a full shuffle by safely merging existing partitions on the same node. You should prefer `coalesce()` when reducing file counts."
    },
    {
        "id": "medium-spark-7",
        "category": "SPARK & DATABRICKS",
        "niche": "Performance Optimization",
        "difficulty": "MEDIUM",
        "question": "What is Data Skew in Spark, and what problems does it cause?",
        "answer": "Data Skew occurs when data is unevenly distributed across partitions based on a key (e.g., joining on a 'Country' column where 90% of rows are 'USA'). This causes a few executor tasks to process massive amounts of data while others finish instantly and sit idle. It leads to severe bottlenecks, OOM (Out of Memory) errors, and incredibly slow pipeline execution."
    },
    {
        "id": "medium-spark-8",
        "category": "SPARK & DATABRICKS",
        "niche": "Performance Optimization",
        "difficulty": "MEDIUM",
        "question": "How can you mitigate Data Skew during a Spark join?",
        "answer": "You can mitigate data skew using 'Salting'. This involves appending a random number (the salt) to the highly skewed join key in the large table, and replicating the rows of the smaller table for every possible salt value. This artificially breaks up the large partition into smaller, evenly distributed chunks across the cluster before the join."
    },
    {
        "id": "medium-spark-9",
        "category": "SPARK & DATABRICKS",
        "niche": "Performance Optimization",
        "difficulty": "MEDIUM",
        "question": "What is the Spark Catalyst Optimizer?",
        "answer": "The Catalyst Optimizer is the core engine of Spark SQL. It takes the logical plan (your code), applies rule-based and cost-based optimizations (like predicate pushdown, constant folding, and optimal join selection), and generates a highly optimized physical execution plan in Java bytecode using Tungsten."
    },
    {
        "id": "medium-spark-10",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks & Delta Lake",
        "difficulty": "MEDIUM",
        "question": "What is Delta Lake, and what problems does it solve for Data Lakes?",
        "answer": "Delta Lake is an open-source storage layer that brings ACID transactions, scalable metadata handling, and time travel to Apache Spark workloads. It solves the unreliability of traditional data lakes by ensuring that concurrent reads and writes do not result in corrupt or partial data, and it tracks a transaction log alongside Parquet files to enforce schema and provide version control."
    },
    {
        "id": "medium-spark-11",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks & Delta Lake",
        "difficulty": "MEDIUM",
        "question": "How does Time Travel work in Delta Lake?",
        "answer": "Because Delta Lake never overwrites or deletes old Parquet files immediately (until a `VACUUM` is run), and maintains a sequential JSON transaction log detailing every insert, update, and delete, you can query older versions of a table. You do this using syntax like `SELECT * FROM table TIMESTAMP AS OF '2023-01-01'` or `VERSION AS OF 5`, allowing you to easily recover from accidental bad writes."
    },
    {
        "id": "medium-spark-12",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks & Delta Lake",
        "difficulty": "MEDIUM",
        "question": "What does the OPTIMIZE command do in Databricks Delta Lake?",
        "answer": "The `OPTIMIZE` command compacts small files into larger, more efficient Parquet files (bin-packing) to improve read performance. It can also be combined with `ZORDER BY (column_name)`, which co-locates related information in the same set of files based on that column, drastically reducing the amount of data Spark has to scan during analytical queries."
    },
    {
        "id": "medium-spark-13",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks & Delta Lake",
        "difficulty": "MEDIUM",
        "question": "Explain the purpose of the VACUUM command in Delta Lake.",
        "answer": "The `VACUUM` command permanently deletes data files from storage that are no longer referenced by the active Delta transaction log and are older than a specific retention threshold (default is 7 days). It is essential for managing storage costs, as UPDATEs and DELETEs in Delta Lake create new files rather than modifying existing ones."
    },
    {
        "id": "medium-spark-14",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks & Delta Lake",
        "difficulty": "MEDIUM",
        "question": "What is Databricks Auto Loader?",
        "answer": "Auto Loader is a Databricks feature that incrementally and efficiently processes new data files as they arrive in cloud storage (ADLS, S3). It automatically tracks which files have been processed using a RocksDB state store, removing the need to manage complex file-state tracking logic or use Event Grid triggers, and handles schema evolution gracefully."
    },
    {
        "id": "medium-spark-15",
        "category": "SPARK & DATABRICKS",
        "niche": "Streaming and Structured Streaming",
        "difficulty": "MEDIUM",
        "question": "What is Structured Streaming in Apache Spark?",
        "answer": "Structured Streaming is a scalable and fault-tolerant stream processing engine built on the Spark SQL engine. It allows developers to express streaming computations using the exact same DataFrame/Dataset API used for batch processing. Spark treats the incoming data stream as an continuously appending, unbounded table."
    },
    {
        "id": "medium-spark-16",
        "category": "SPARK & DATABRICKS",
        "niche": "Streaming and Structured Streaming",
        "difficulty": "MEDIUM",
        "question": "Explain the concept of Checkpointing in Spark Structured Streaming.",
        "answer": "Checkpointing saves the progress of a streaming query (offsets, state information, and metadata) to reliable cloud storage (like ADLS). If the Spark cluster crashes or the job is restarted, the streaming engine reads the checkpoint directory to resume processing exactly where it left off, ensuring exactly-once fault tolerance guarantees."
    },
    {
        "id": "medium-spark-17",
        "category": "SPARK & DATABRICKS",
        "niche": "Streaming and Structured Streaming",
        "difficulty": "MEDIUM",
        "question": "What is Watermarking in Spark Streaming, and why is it necessary?",
        "answer": "Watermarking defines a time threshold indicating how long the system should wait for late-arriving data before finalizing aggregations for a time window and dropping state. Without a watermark, Spark would have to keep the state for all historical time windows in memory indefinitely, eventually causing an Out of Memory crash."
    },
    {
        "id": "medium-spark-18",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks Workspaces",
        "difficulty": "MEDIUM",
        "question": "What is the difference between an All-Purpose Cluster and a Job Cluster in Databricks?",
        "answer": "An All-Purpose Cluster is created manually, shared among multiple users, and optimized for interactive notebook development and ad-hoc querying. A Job Cluster is spun up dynamically by the Databricks job scheduler solely to run a specific automated workload, and it terminates immediately after completion, making it highly cost-effective for production pipelines."
    },
    {
        "id": "medium-spark-19",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks Workspaces",
        "difficulty": "MEDIUM",
        "question": "How do you securely access an Azure SQL Database from a Databricks notebook?",
        "answer": "You should use Databricks Secret Scopes backed by Azure Key Vault. The database username and password are stored in Key Vault. In the notebook, you use `dbutils.secrets.get(scope='my_scope', key='sql_password')` to retrieve the credentials at runtime without exposing them in the notebook's source code."
    },
    {
        "id": "medium-spark-20",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks Workspaces",
        "difficulty": "MEDIUM",
        "question": "What is Unity Catalog in Databricks?",
        "answer": "Unity Catalog is the unified governance solution for data and AI assets across all Databricks workspaces. It provides a centralized metadata layer, unified access control (using standard SQL GRANT/REVOKE commands), automated data lineage tracking, and auditing, moving away from fragmented, workspace-local Hive metastores."
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
    print("Batch 2 (40 questions) added successfully.")
else:
    print("Failed to parse questions.js")
