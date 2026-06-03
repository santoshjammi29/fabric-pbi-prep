// Key Concepts, Keywords, and Definitions Database
// Structured by Category and Sorted by Difficulty (EASY -> MEDIUM -> HARD)

window.CONCEPTS_DB = [
  // ==========================================
  // MICROSOFT FABRIC
  // ==========================================
  {
    id: "fabric-onelake",
    term: "OneLake",
    category: "FABRIC",
    difficulty: "EASY",
    definition: "A single, unified, logical data lake for the entire organization, built on ADLS Gen2 using open Delta Parquet format.",
    explanation: "OneLake serves as the 'OneDrive for data' in Microsoft Fabric. It eliminates data silos by providing a single storage repository where all developer workloads (Spark, Warehouse, Power BI) store their data in a standardized Delta Parquet format. It supports 'shortcuts' to reference data across Azure, AWS, and Google Cloud without copying it.",
    keyPoints: [
      "Built on Azure Data Lake Storage (ADLS) Gen2 using the Open Delta Lake format.",
      "Supports cross-workspace shortcuts to prevent data duplication.",
      "Universal security policies can be applied across all workspaces and personas."
    ]
  },
  {
    id: "fabric-shortcuts",
    term: "Shortcuts",
    category: "FABRIC",
    difficulty: "EASY",
    definition: "Virtual links in OneLake that point to other storage locations (internal or external) without copying the actual files.",
    explanation: "Shortcuts allow users to unify data across different workspaces, Azure tenants, or external clouds (like Amazon S3 or Google Cloud Storage) inside OneLake. They act like symbolic links in a filesystem, meaning queries read the live source data dynamically, eliminating ETL pipeline copy steps.",
    keyPoints: [
      "No data duplication or data movement cost.",
      "Supports ADLS Gen2, Amazon S3, Google Cloud Storage, and Microsoft Dataverse.",
      "Secured via OneLake security model or inherited credentials."
    ]
  },
  {
    id: "fabric-lakehouse",
    term: "Lakehouse",
    category: "FABRIC",
    difficulty: "EASY",
    definition: "An architecture that combines the flexible, cost-effective file storage of a data lake with the ACID transactions of a data warehouse.",
    explanation: "In Fabric, a Lakehouse is a database item that allows Spark notebooks and SQL endpoints to run on unstructured/semi-structured files and structured tables. It stores data in OneLake under Delta Lake table format, allowing developers to utilize both SQL queries and Apache Spark transformations in the same workspace.",
    keyPoints: [
      "Separates storage (Delta Parquet in OneLake) from compute.",
      "Automatically provides a Read-Only SQL Analytics Endpoint for standard T-SQL querying.",
      "Allows data curation using Python/Scala Spark notebooks."
    ]
  },
  {
    id: "fabric-direct-lake",
    term: "Direct Lake Mode",
    category: "FABRIC",
    difficulty: "MEDIUM",
    definition: "A Power BI storage mode that reads Delta Parquet files directly from OneLake without importing or running SQL queries.",
    explanation: "Direct Lake is a breakthrough technology in Power BI that avoids the latency of DirectQuery and the refresh management of Import Mode. Power BI loads Delta Parquet columns directly from OneLake into the Analysis Services memory engine on-demand. This provides Import-like performance on massive datasets with real-time updates.",
    keyPoints: [
      "Bypasses the SQL translation layer entirely, reading Parquet files directly.",
      "Eliminates dataset refresh scheduling and synchronization lag.",
      "Fallback behavior automatically switches to DirectQuery if the capacity memory limit is exceeded."
    ]
  },
  {
    id: "fabric-capacities",
    term: "Fabric Capacities (F-SKUs)",
    category: "FABRIC",
    difficulty: "MEDIUM",
    definition: "The shared pool of compute resources (expressed in Capacity Units or CUs) that powers all workloads in Microsoft Fabric.",
    explanation: "Unlike legacy architectures where compute is provisioned separately (e.g. databases, Spark clusters, integration runtimes), Fabric pools all compute into a single SKU capacity. These resources are dynamically allocated across workspaces. Fabric capacities support pausing, scaling, and bursting to handle sudden analytical workloads.",
    keyPoints: [
      "Compute capacity is measured in Capacity Units (CUs), ranging from F2 to F2048.",
      "Enables multi-workload execution (Spark, Warehouse, ADF) sharing the same pool.",
      "Supports 'smoothing' to average out temporary resource usage spikes over a 24-hour window."
    ]
  },
  {
    id: "fabric-medallion",
    term: "Medallion Architecture",
    category: "FABRIC",
    difficulty: "MEDIUM",
    definition: "A data curation pattern consisting of three distinct layers: Bronze (raw), Silver (cleansed), and Gold (curated).",
    explanation: "The Medallion pattern cleanses and enriches data as it flows through the analytical system. Bronze acts as the landing area for raw historical logs. Silver performs data validation, schema enforcement, and deduplication. Gold structures the data into reporting-ready dimensional star schemas to power BI and machine learning models.",
    keyPoints: [
      "Bronze: Raw, append-only ingestion files.",
      "Silver: Cleansed, joined, conformed tables for business-level analysis.",
      "Gold: Star schema aggregates optimized for high-performance visual tools."
    ]
  },
  {
    id: "fabric-v-order",
    term: "V-Order Serialization",
    category: "FABRIC",
    difficulty: "HARD",
    definition: "A Microsoft-proprietary optimization algorithm applied to Delta Parquet files to accelerate read speeds.",
    explanation: "V-Order optimizes the internal sorting, distribution, and compression of Parquet files written by the Fabric engine. It aligns the data structure with the Power BI VertiPaq engine, enabling direct memory transfers and accelerating query performance for both Power BI reports and SQL Analytics workloads.",
    keyPoints: [
      "Applies advanced column-sorting optimizations when writing Parquet data.",
      "Native to Fabric engines but fully compliant with the open Parquet specification.",
      "Significantly reduces query execution times in Direct Lake mode."
    ]
  },
  {
    id: "fabric-semantic-link",
    term: "Semantic Link",
    category: "FABRIC",
    difficulty: "HARD",
    definition: "A Python library ('sempy') that establishes a bidirectional bridge between Spark DataFrames and Power BI semantic models.",
    explanation: "Semantic Link allows data scientists using Python notebooks to read measures, query tables, and validate business logic stored inside existing Power BI datasets. It also lets engineers write processed results back to Power BI, bridging the gap between Data Engineering (Spark) and Business Intelligence (VertiPaq).",
    keyPoints: [
      "Reads Power BI data directly into Pandas or Spark DataFrames.",
      "Exposes measures, hierarchies, and security models directly to Python logic.",
      "Enables automated data quality validation against defined business measures."
    ]
  },
  {
    id: "fabric-xmla",
    term: "XMLA Endpoint",
    category: "FABRIC",
    difficulty: "HARD",
    definition: "An industry-standard communication protocol that allows external client tools to connect directly to Fabric semantic models.",
    explanation: "The XMLA Read/Write endpoint exposes the Power BI engine in Fabric capacity workspaces as a standard Analysis Services model. This enables professional developer toolchains (e.g. Tabular Editor, ALM Toolkit, Azure DevOps pipelines) to manage model schemas, perform partition processing, and automate deployments.",
    keyPoints: [
      "Allows direct model development bypassing Power BI Desktop.",
      "Enables automated CI/CD deployment pipelines for complex semantic models.",
      "Supports external diagnostic tools like DAX Studio to optimize query plans."
    ]
  },
  {
    id: "fabric-mirroring",
    term: "Mirroring",
    category: "FABRIC",
    difficulty: "MEDIUM",
    definition: "A zero-ETL, fully managed solution that replicates operational databases (Azure SQL, Cosmos DB, Snowflake) in near real-time directly into OneLake as Delta Lake tables.",
    explanation: "Fabric Mirroring continuously synchronizes data modifications from external source databases into OneLake. It bypasses the need for manual ETL pipelines by automatically creating and updating read-only replicas in open Delta Parquet format. This allows other workloads and Power BI reports in Direct Lake mode to query the data instantly.",
    keyPoints: [
      "Continuously replicates operational data (inserts, updates, deletes) in near real-time.",
      "Stores replicas in open Delta Lake format directly in OneLake.",
      "Supports Direct Lake mode in Power BI to analyze operational data without imports."
    ]
  },
  {
    id: "fabric-dataflows-gen2",
    term: "Dataflows Gen2",
    category: "FABRIC",
    difficulty: "MEDIUM",
    definition: "A visual, low-code data transformation tool built on Power Query that ingests and transforms data, outputting results directly into Fabric data destinations (Lakehouse, Warehouse, SQL Database).",
    explanation: "Dataflows Gen2 modernizes the Power Query ingestion engine for Microsoft Fabric. It provides a visual interface for 300+ connectors to cleanse and model data. Unlike legacy dataflows, Gen2 supports staging queries and publishes directly to native Fabric destinations, running transformations on underlying Spark or SQL compute resources.",
    keyPoints: [
      "No-code/low-code ETL capability utilizing the familiar Power Query interface.",
      "Allows loading transformed outputs directly into destinations like Lakehouse, Warehouse, or Azure SQL.",
      "Supports query execution monitoring and orchestrating via Data Factory pipelines."
    ]
  },
  {
    id: "fabric-kql-database",
    term: "KQL Database (Real-Time Intelligence)",
    category: "FABRIC",
    difficulty: "HARD",
    definition: "A high-performance database optimized for real-time telemetry, log analytics, and event streams, queried using Kusto Query Language (KQL) and integrated with OneLake.",
    explanation: "KQL Databases in Fabric Real-Time Intelligence are engineered for append-only, high-velocity streaming data. They enable sub-second aggregations on millions of incoming logs or IoT readings. By enabling OneLake availability, KQL tables are mirrored as Delta Parquet columns dynamically, making them queryable by Spark and T-SQL engines without physical data copies.",
    keyPoints: [
      "Purpose-built for time-series, log, and IoT streaming analytics.",
      "Uses Kusto Query Language (KQL) for high-speed, pipe-based ad-hoc queries.",
      "Exposes data as Delta format in OneLake for cross-engine analytical joins."
    ]
  },

  // ==========================================
  // POWER BI
  // ==========================================
  {
    id: "pbi-import-mode",
    term: "Import Mode",
    category: "POWER BI",
    difficulty: "EASY",
    definition: "A storage mode where data is loaded and compressed directly into the Power BI Analysis Services memory engine.",
    explanation: "Import Mode is the default and highest-performance storage option. It extracts data from source databases, processes it using the VertiPaq column-store engine, and stores it in memory. It provides sub-second query times on highly compressed columns, but requires scheduling data refreshes.",
    keyPoints: [
      "VertiPaq engine compresses data using dictionary encoding and run-length limits.",
      "Fastest query performance due to memory-resident columnar structures.",
      "Dataset size is constrained by capacity memory limits (e.g., Pro has 1GB limit)."
    ]
  },
  {
    id: "pbi-row-context",
    term: "Row Context",
    category: "POWER BI",
    difficulty: "EASY",
    definition: "The active row evaluation environment in DAX that occurs during calculated column evaluations or iterator loops.",
    explanation: "Row Context represents 'the current row' being processed. In calculated columns, DAX automatically loops through each row and computes values. In measures, a row context is created only when using iterator functions (known as X-functions, like SUMX, FILTER) to evaluate formulas row-by-row.",
    keyPoints: [
      "Enables formula evaluation to inspect values on a single record level.",
      "Calculated columns evaluate in row context by default.",
      "Does not automatically filter other tables; relies on context transition."
    ]
  },
  {
    id: "pbi-star-schema",
    term: "Star Schema",
    category: "POWER BI",
    difficulty: "EASY",
    definition: "A dimensional data modeling design containing central fact tables surrounded by descriptive dimension tables.",
    explanation: "The Star Schema is the gold standard for Power BI modeling. Fact tables contain keys and quantitative metric measures. Dimension tables contain text attributes used for slicing, filtering, and grouping. Keeping relationships as 1-to-many from dimension to fact tables optimizes Power BI engine speed.",
    keyPoints: [
      "Optimized for columnar query engines like VertiPaq.",
      "Reduces join complexity compared to normalized snowflake schemas.",
      "Ensures clear, intuitive filtering directions (one-way relationship flowing to facts)."
    ]
  },
  {
    id: "pbi-filter-context",
    term: "Filter Context",
    category: "POWER BI",
    difficulty: "MEDIUM",
    definition: "The active filtering parameters applied to a visual at the time of DAX measure execution.",
    explanation: "Filter Context defines what subset of data is computed in a visual. It is created by slicers, page filters, row headers, visual cross-filtering, and manual filters applied in DAX code (like CALCULATE). All DAX measures evaluate strictly against the rows permitted by the active Filter Context.",
    keyPoints: [
      "Dynamic and calculated at the exact moment a visual renders.",
      "Propagates automatically across active relationships from dimensions to facts.",
      "Can be overridden, cleared, or modified using DAX filter modifiers (like CALCULATE, ALL)."
    ]
  },
  {
    id: "pbi-directquery",
    term: "DirectQuery Mode",
    category: "POWER BI",
    difficulty: "MEDIUM",
    definition: "A storage mode where Power BI does not import data, but queries the source system in real-time.",
    explanation: "DirectQuery leaves data in the source database. When a user interacts with a report, Power BI translates visual elements into native SQL queries and executes them directly against the data source. This is ideal for massive databases or when real-time freshness is critical.",
    keyPoints: [
      "Keeps memory footprint low; data is not duplicated.",
      "Performance depends heavily on the indexing and speed of the source database.",
      "Limits DAX capabilities and restricts certain modeling features."
    ]
  },
  {
    id: "pbi-rls",
    term: "Row-Level Security (RLS)",
    category: "POWER BI",
    difficulty: "MEDIUM",
    definition: "A security feature that restricts database row access for specific users based on active role filters.",
    explanation: "RLS enables developers to publish a single report that dynamically shows different data slices to different users. Roles are defined using DAX filter expressions on tables (e.g. `[Region] = 'East'`). When a user logs in, Power BI resolves their username against these roles and filters the database.",
    keyPoints: [
      "Static RLS uses hardcoded DAX expressions mapped to AD Security Groups.",
      "Dynamic RLS resolves access at runtime using functions like `USERPRINCIPALNAME()`.",
      "Applies only to consumers; workspace contributors bypass RLS rules."
    ]
  },
  {
    id: "pbi-calculate",
    term: "CALCULATE Function",
    category: "POWER BI",
    difficulty: "HARD",
    definition: "The primary DAX function used to modify the active Filter Context or trigger Context Transition.",
    explanation: "CALCULATE is the single most powerful function in DAX. It takes an expression and executes it under modified filter criteria. It is unique because it forces a Context Transition, converting all active Row Contexts into Filter Contexts to evaluate metrics correctly across relationships.",
    keyPoints: [
      "Accepts list-based or table-based filter arguments.",
      "Triggers context transition, which converts row-level references into filters.",
      "Can overwrite existing filters (default) or merge filters depending on functions used."
    ]
  },
  {
    id: "pbi-composite-models",
    term: "Composite Models",
    category: "POWER BI",
    difficulty: "HARD",
    definition: "A model design that combines tables with different storage modes (Import and DirectQuery) in a single dataset.",
    explanation: "Composite Models allow designers to build hybrid analytical applications. For example, a massive transactional fact table can be left in the source database (DirectQuery), while historical aggregates or smaller lookup dimension tables can be cached locally (Import) to maximize speed.",
    keyPoints: [
      "Requires configuring 'Dual' storage mode on tables to minimize query count.",
      "Allows linking multiple DirectQuery datasets together into a single model.",
      "Introduces security boundaries (cross-source queries) that must be configured carefully."
    ]
  },
  {
    id: "pbi-incremental-refresh",
    term: "Incremental Refresh",
    category: "POWER BI",
    difficulty: "HARD",
    definition: "A pattern that partitions datasets so only recently changed data slices are refreshed.",
    explanation: "Incremental Refresh prevents long-running data refresh operations. It works by setting up date-range parameters (`RangeStart` and `RangeEnd`). Power BI partitions the tables into slices (e.g., Years, Months, Days). When a refresh runs, only the active partition is refreshed, while historical partitions are left untouched.",
    keyPoints: [
      "Significantly reduces database load and network bandwidth usage.",
      "Requires a query source that supports query folding (SQL databases).",
      "Saves processing time and prevents refresh timeouts on massive tables."
    ]
  },
  {
    id: "pbi-pbip-format",
    term: "Power BI Project (.pbip)",
    category: "POWER BI",
    difficulty: "MEDIUM",
    definition: "A developer-focused directory save format that stores reports and semantic models as separate text-based files to enable Git source control and CI/CD.",
    explanation: "The Power BI Project (.pbip) format replaces the monolithic, binary .pbix file with an open folder structure containing JSON, TMDL, and metadata files. This permits developers to track modifications, perform Git pull requests, resolve merge conflicts, and automate model deployments via CI/CD release pipelines.",
    keyPoints: [
      "Saves reports and semantic models as text-based configuration folders.",
      "Enables professional Git-based source control and collaborative team development.",
      "Facilitates automated deployment pipelines and programmatic metadata edits."
    ]
  },
  {
    id: "pbi-calculation-groups",
    term: "Calculation Groups",
    category: "POWER BI",
    difficulty: "MEDIUM",
    definition: "A model design pattern that uses the SELECTEDMEASURE() function to define dynamic, reusable DAX calculations that can be applied to any visual metric.",
    explanation: "Calculation Groups reduce measure clutter by defining generic analytical operations once. Instead of creating separate MTD, YTD, and YoY measures for every individual KPI (e.g. Sales, Costs, Profit), a developer designs a single calculation group. At runtime, the active visual measure is passed to the group items, applying the time-intelligence or format patterns dynamically.",
    keyPoints: [
      "Drastically reduces measure count and maintenance in complex semantic models.",
      "Relies on SELECTEDMEASURE() and SELECTEDMEASUREFORMATSTRING() for dynamic evaluation.",
      "Can be created and managed inside Power BI Desktop using Model View or Tabular Editor."
    ]
  },
  {
    id: "pbi-tmdl",
    term: "Tabular Model Definition Language (TMDL)",
    category: "POWER BI",
    difficulty: "HARD",
    definition: "A human-readable, indentation-based YAML-like language used to define semantic model metadata and structures.",
    explanation: "TMDL is designed to be easily read and written by humans. It replaces the complex, single-line Tabular Model Scripting Language (TMSL) JSON. Because it uses nested indentation and structured definitions, it integrates perfectly with text comparison tools (diffs) in Git, allowing developers to inspect model schema changes line-by-line.",
    keyPoints: [
      "Indentation-based language for defining tabular semantic models.",
      "Highly optimized for code reviews, Git diffs, and manual editing.",
      "Native integration in Power BI Desktop's TMDL View and external developers' tools."
    ]
  },

  // ==========================================
  // AZURE DATA FACTORY
  // ==========================================
  {
    id: "adf-linked-service",
    term: "Linked Service",
    category: "ADF",
    difficulty: "EASY",
    definition: "The connection definition that defines connection strings and credentials to external resources in ADF.",
    explanation: "A Linked Service acts as the connection string in Azure Data Factory. It defines the server address, database name, and credentials (like passwords or Key Vault references) required to access databases, APIs, or files. Datasets reference Linked Services to read schema data.",
    keyPoints: [
      "Acts as the connection definition; Datasets represent data structures within that connection.",
      "Can be parameterized to dynamically connect to Dev, Test, or Prod environments.",
      "Best secured using Managed Identities (system-assigned or user-assigned)."
    ]
  },
  {
    id: "adf-trigger",
    term: "Trigger",
    category: "ADF",
    difficulty: "EASY",
    definition: "The mechanism that defines when a data pipeline execution should be started.",
    explanation: "Triggers orchestrate the execution schedule of pipelines in ADF. Rather than running tasks manually, triggers run them automatically based on clock schedules, time intervals (tumbling windows), or storage event alerts (like a file landing in an ADLS Gen2 folder).",
    keyPoints: [
      "Schedule Trigger: Runs on standard calendar intervals (e.g., daily at 2:00 AM).",
      "Tumbling Window: State-aware, backfill-friendly slices running at fixed intervals.",
      "Event Trigger: Runs in response to storage blob creations or deletes."
    ]
  },
  {
    id: "adf-pipeline",
    term: "Pipeline",
    category: "ADF",
    difficulty: "EASY",
    definition: "A logical grouping of activities that coordinates and executes data workflows.",
    explanation: "A Pipeline is the unit of orchestration in ADF. It contains activities (e.g. Copy Data, Lookup, Web Activity, Spark Notebook) connected in a directed graph. The pipeline controls execution dependencies, handling failure routes, retries, and variable passing.",
    keyPoints: [
      "Control Activities: Handle loops (ForEach), decisions (If Condition), and execution flow.",
      "Data Activities: Handle data movement (Copy, Data Flow) and transformations.",
      "Can invoke other child pipelines using the Execute Pipeline activity."
    ]
  },
  {
    id: "adf-shir",
    term: "Self-hosted Integration Runtime (SHIR)",
    category: "ADF",
    difficulty: "MEDIUM",
    definition: "The compute infrastructure used to run copy activities and scan metadata on private networks.",
    explanation: "A SHIR is agent software installed on-premises or on a virtual machine inside a private Azure VNet. It bridges cloud ADF with secure private databases, allowing copy tasks to fetch local database tables and upload them securely to the cloud without opening public ports.",
    keyPoints: [
      "Enables hybrid cloud architecture; connects local databases with ADLS/OneLake.",
      "Only outbound HTTPS traffic over port 443 is required from the hosting machine.",
      "Supports high-availability clustering by joining up to four physical machines."
    ]
  },
  {
    id: "adf-tumbling-window",
    term: "Tumbling Window Trigger",
    category: "ADF",
    difficulty: "MEDIUM",
    definition: "A specialized time-slice trigger that supports state tracking, dependencies, and backfilling.",
    explanation: "Tumbling Window Triggers partition execution into continuous, non-overlapping time slices. They are unique because they support self-dependencies (e.g., slice N cannot start until slice N-1 completes) and enable backfilling historical data automatically by specifying a past start date.",
    keyPoints: [
      "Provides state tracking; displays status of individual historical execution windows.",
      "Supports cross-pipeline dependencies (waiting for another pipeline's slice to finish).",
      "Retries can be configured specifically for transient connection drops."
    ]
  },
  {
    id: "adf-mapping-dataflows",
    term: "Mapping Data Flows",
    category: "ADF",
    difficulty: "MEDIUM",
    definition: "A visual, code-free data transformation tool in ADF that executes on an underlying Spark cluster.",
    explanation: "Mapping Data Flows allow data engineers to build graphical data transformations (joining, aggregating, pivoting, checking constraints) without writing code. ADF automatically compiles the visual flow into optimized Scala/Spark execution plans and runs them on managed Databricks or Synapse clusters.",
    keyPoints: [
      "No-code interface for complex ETL (joins, lookups, schema drifts).",
      "Executes on Spark, making it highly scalable for large datasets.",
      "Supports custom data cleansing functions and schema transformations."
    ]
  },
  {
    id: "adf-metadata-driven",
    term: "Metadata-driven Pipelines",
    category: "ADF",
    difficulty: "HARD",
    definition: "A pipeline design pattern where the orchestration parameters are read from an external SQL control table.",
    explanation: "Instead of creating 100 copy pipelines for 100 database tables, a metadata-driven approach uses a single generic pipeline. A Lookup activity reads table names, source paths, and target destinations from a SQL control database, and executes copy tasks in a loop (ForEach) using dynamic parameters.",
    keyPoints: [
      "Reduces orchestration maintenance; adding a new table only requires inserting a row in a control table.",
      "Enables dynamic scaling, scheduling, and error tracking in central SQL tables.",
      "Simplifies deployment and CI/CD promotion between environments."
    ]
  },
  {
    id: "adf-parameterization",
    term: "Dynamic Parameterization",
    category: "ADF",
    difficulty: "HARD",
    definition: "The practice of using runtime parameters to configure connection strings, dataset schemas, and targets.",
    explanation: "Parameterization allows ADF objects to be highly reusable. By passing pipeline parameters to dataset connections, a single Linked Service can connect to different file folders or databases depending on which pipeline triggered it. Parameters are resolved at runtime using ADF expression language.",
    keyPoints: [
      "Saves development overhead; prevents object duplication.",
      "Uses JSON-like expression syntax (e.g., `@pipeline().parameters.VarName`).",
      "Allows passing dynamic database credentials retrieved via Key Vault lookups."
    ]
  },
  {
    id: "adf-ci-cd-global",
    term: "ADF CI/CD and Global Parameters",
    category: "ADF",
    difficulty: "HARD",
    definition: "The deployment pipeline process that promotes ADF configurations across environments using ARM Templates.",
    explanation: "ADF utilizes Git integration to save changes. To deploy, developer code is built into ARM Templates. Global Parameters represent constant values (like resource endpoints or API keys) that must be adjusted per environment during the release pipeline, managed using the ADF publishing framework.",
    keyPoints: [
      "Uses the 'adf_publish' branch to store generated ARM template JSON files.",
      "Enables automated DevOps release pipelines to promote code safely.",
      "Global parameters must be configured to be included in ARM template parameter parameters."
    ]
  },
  {
    id: "adf-managed-vnet",
    term: "Managed Virtual Network (Managed VNet)",
    category: "ADF",
    difficulty: "MEDIUM",
    definition: "A secure networking feature that runs ADF Integration Runtimes inside a dedicated private network boundary, connecting to services via Private Endpoints.",
    explanation: "Managed VNets protect sensitive data integration environments. Instead of routing traffic over the public internet, ADF provisions an isolated Virtual Network for the Integration Runtime. Access to source and target data stores is established using Private Link endpoints, securing data traffic against packet interception and exfiltration.",
    keyPoints: [
      "Isolates data integration compute from public network exposure.",
      "Establishes secure, private communication channels using Private Endpoints.",
      "Simplifies network administration by eliminating the need to manage custom Azure VNets."
    ]
  },
  {
    id: "adf-managed-airflow",
    term: "Data Factory Managed Airflow",
    category: "ADF",
    difficulty: "MEDIUM",
    definition: "A managed service in ADF that hosts Apache Airflow environments, enabling Python-based DAG orchestration.",
    explanation: "Managed Airflow in ADF provides a fully managed Apache Airflow cluster. This allows data engineers to write Python-based Directed Acyclic Graphs (DAGs) to orchestrate complex workloads (like running Spark, Databricks, Snowflake, and ADF pipelines) from a single, cloud-native orchestration service, combining the power of Airflow with Azure security.",
    keyPoints: [
      "Provides a fully managed, scalable Apache Airflow environment inside Azure.",
      "Allows engineers to write pipeline orchestrations as standard Python code (DAGs).",
      "Natively integrates with Azure Active Directory (Microsoft Entra ID) and Key Vault."
    ]
  },
  {
    id: "adf-synapse-link",
    term: "Azure Synapse Link",
    category: "ADF",
    difficulty: "HARD",
    definition: "A cloud-native, zero-ETL synchronization service that continuously replicates operational data into analytical stores.",
    explanation: "Azure Synapse Link bridges the operational and analytical layers. It continuously streams changes from sources like Cosmos DB, SQL Server, Azure SQL, or Microsoft Dataverse directly to Azure Synapse Analytics or ADLS Gen2. Since the synchronization runs in the background without affecting transactional performance, analytics query the fresh operational data in real-time.",
    keyPoints: [
      "Enables real-time analytics on operational data with zero ETL pipeline overhead.",
      "Runs asynchronously, protecting transactional database processing speeds.",
      "Integrates with Synapse SQL Serverless and Spark pools for immediate querying."
    ]
  },

  // ==========================================
  // SQL SERVER
  // ==========================================
  {
    id: "sql-clustered-index",
    term: "Clustered Index",
    category: "SQL SERVER",
    difficulty: "EASY",
    definition: "A database index that determines the physical storage order of rows inside a table.",
    explanation: "A Clustered Index structures table data into a B-tree based on the index key. Since the index dictates the physical sorting of rows on disk, a table can only have one clustered index. By default, creating a PRIMARY KEY constraint automatically creates a clustered index on those columns.",
    keyPoints: [
      "Dictates how data is sorted and stored on data pages.",
      "Only one clustered index can exist per table.",
      "Highly efficient for range-scan queries on key columns."
    ]
  },
  {
    id: "sql-cte",
    term: "Common Table Expression (CTE)",
    category: "SQL SERVER",
    difficulty: "EASY",
    definition: "A temporary named result set defined within the execution scope of a single SELECT, INSERT, UPDATE, or DELETE query.",
    explanation: "CTEs improve query readability and maintainability. They act like virtual inline views. By using the `WITH` keyword, developers can define a subquery, name it, and reference it multiple times in the main query. They also support recursion, allowing queries to traverse hierarchical structures.",
    keyPoints: [
      "Does not store data on disk; acts as a virtual query wrapper.",
      "Recursive CTEs allow traversing hierarchies (like manager-employee structures).",
      "Helps break down complex query logic into readable blocks."
    ]
  },
  {
    id: "sql-foreign-key",
    term: "FOREIGN KEY",
    category: "SQL SERVER",
    difficulty: "EASY",
    definition: "A constraint that links key columns in one table to key columns in another, enforcing referential integrity.",
    explanation: "A Foreign Key enforces relationships between tables. It ensures that a value in a child table (e.g. Sales) must match a valid, existing value in the parent table (e.g. Customers). It prevents orphaned records and blocks deletions that would break data relationships.",
    keyPoints: [
      "Enforces database-level data integrity and consistency.",
      "Blocks DELETE or UPDATE operations on parent records if matching child records exist.",
      "Highly recommended to index Foreign Key columns to optimize join performance."
    ]
  },
  {
    id: "sql-non-clustered",
    term: "Non-Clustered Index",
    category: "SQL SERVER",
    difficulty: "MEDIUM",
    definition: "A separate B-tree structure that maps index keys to clustered index keys or heap row identifiers.",
    explanation: "Unlike a clustered index, a Non-Clustered Index does not sort the actual table rows. It is a separate structure containing the indexed columns and pointer locations (bookmarks) pointing to the actual data pages. A single table can support up to 999 non-clustered indexes.",
    keyPoints: [
      "Separate B-tree storage containing index keys and row pointers.",
      "Supports 'Covering Index' patterns by using the `INCLUDE` clause for extra columns.",
      "Accelerates selective lookup queries that filter on non-primary columns."
    ]
  },
  {
    id: "sql-isolation-levels",
    term: "Transaction Isolation Levels",
    category: "SQL SERVER",
    difficulty: "MEDIUM",
    definition: "Database settings that control how data modifications are locked and isolated from concurrent transactions.",
    explanation: "Isolation levels define how a SQL database balances data consistency against concurrent query speed. SQL Server supports Read Uncommitted (lowest locking, allows dirty reads), Read Committed (default, blocks dirty reads), Repeatable Read (prevents non-repeatable reads), and Serializable (highest locking, prevents phantom reads).",
    keyPoints: [
      "Read Committed Snapshot Isolation (RCSI) uses row versioning to prevent read-write blocking.",
      "Higher isolation levels guarantee cleaner consistency but reduce concurrency.",
      "Choosing Serializable can lead to high lock contention and transaction blocking."
    ]
  },
  {
    id: "sql-window-functions",
    term: "Window Functions",
    category: "SQL SERVER",
    difficulty: "MEDIUM",
    definition: "Analytical functions that perform calculations across a partition of rows relative to the current row, without collapsing them.",
    explanation: "Window functions (defined by the `OVER` clause) compute aggregates, running totals, and rankings on a group of rows (the window). Unlike `GROUP BY`, which collapses rows into a single summary, window functions calculate results for each row independently, maintaining individual detail records.",
    keyPoints: [
      "Uses `PARTITION BY` to group rows and `ORDER BY` to sort execution sequences.",
      "Includes ranking (ROW_NUMBER, DENSE_RANK) and value functions (LAG, LEAD).",
      "Essential for running totals, moving averages, and finding historical state changes."
    ]
  },
  {
    id: "sql-columnstore",
    term: "Columnstore Indexes",
    category: "SQL SERVER",
    difficulty: "HARD",
    definition: "An index technology that stores and compresses data in a column-oriented format on disk.",
    explanation: "Columnstore Indexes are designed for high-performance analytical queries. Instead of storing data row-by-row on disk pages, it groups data columns into segments. This achieves high compression rates (often 10x) and reduces disk I/O, as analytical queries only scan the specific columns needed.",
    keyPoints: [
      "Optimized for large data warehouses and massive aggregation queries.",
      "Uses 'batch mode' execution to process vector rows concurrently in CPU cache.",
      "Can be Clustered (the entire table is columnar) or Non-Clustered (separate index)."
    ]
  },
  {
    id: "sql-alwayson",
    term: "Always On Availability Groups",
    category: "SQL SERVER",
    difficulty: "HARD",
    definition: "A high-availability and disaster recovery solution providing multi-database failover capabilities.",
    explanation: "Always On is an enterprise HADR solution. It groups multiple user databases together into a failover set. Transactions are replicated from a primary node to secondary replica servers. Replicas can run in synchronous-commit (for zero data loss failovers) or asynchronous-commit mode (for DR geographic separations).",
    keyPoints: [
      "Replaces database mirroring; groups databases for coordinated failovers.",
      "Secondary replicas can be configured as Read-Only to offload reporting queries.",
      "Requires a Windows Server Failover Cluster (WSFC) environment."
    ]
  },
  {
    id: "sql-deadlocks",
    term: "Deadlocks",
    category: "SQL SERVER",
    difficulty: "HARD",
    definition: "A locking contention scenario where two transactions block each other by holding locks on resources the other requires.",
    explanation: "A deadlock occurs when Transaction A holds a lock on Table 1 and requests a lock on Table 2, while Transaction B holds a lock on Table 2 and requests a lock on Table 1. Neither can progress. SQL Server's lock monitor detects this cycle, selects one transaction as the 'deadlock victim', and rolls it back.",
    keyPoints: [
      "Resolved automatically by the SQL engine deadlock detector.",
      "Can be minimized by accessing tables in the same order across all application code.",
      "Diagnosed using SQL Server Profiler, Extended Events, or trace flags (1204/1222)."
    ]
  },
  {
    id: "sql-query-store",
    term: "Query Store",
    category: "SQL SERVER",
    difficulty: "MEDIUM",
    definition: "A database feature that automatically captures history of queries, execution plans, and runtime statistics to simplify performance tuning.",
    explanation: "Query Store acts as a flight data recorder for SQL Server. It records query text, execution plan variations, compilation statistics, and resource consumption. This allows administrators to quickly identify query performance regressions (e.g. when a query suddenly slows down due to a new plan) and force the engine to reuse a known good plan.",
    keyPoints: [
      "Automatically captures queries, execution plans, and performance metrics over time.",
      "Allows developers to easily detect plan regressions and force query plan pinning.",
      "Persists data directly in the database, surviving SQL restarts and failovers."
    ]
  },
  {
    id: "sql-parameter-sniffing",
    term: "Parameter Sniffing",
    category: "SQL SERVER",
    difficulty: "HARD",
    definition: "A database engine compilation behavior where a query plan is optimized based on the parameters passed during first execution.",
    explanation: "When a stored procedure runs, SQL Server compiles a query plan suited for the specific parameters used in that initial call. If subsequent calls pass parameter values with vastly different distributions, the compiled plan can perform poorly. This is a common performance issue resolved by using query hints (like RECOMPILE or OPTIMIZE FOR) or stored procedure redesigns.",
    keyPoints: [
      "Can lead to massive query slowdowns when data distribution is highly skewed.",
      "Resolved using hints like OPTIMIZE FOR UNKNOWN or WITH RECOMPILE.",
      "Can be diagnosed by inspecting the execution plan's compiled vs. runtime values."
    ]
  },
  {
    id: "sql-read-replicas",
    term: "Read Replicas & Read-Scale Out",
    category: "SQL SERVER",
    difficulty: "MEDIUM",
    definition: "An availability group design that offloads read-only workloads (like reports or backups) to secondary database nodes.",
    explanation: "Read-Scale Out maximizes database throughput. By configuring Always On secondary nodes as read-only replicas, developers can configure connection strings with the ApplicationIntent=ReadOnly parameter. SQL Server automatically routes these queries to the secondary nodes, preventing intensive reporting tasks from consuming resources on the primary transaction node.",
    keyPoints: [
      "Offloads read-heavy analytical and reporting queries from the primary node.",
      "Requires setting the ApplicationIntent connection string property to ReadOnly.",
      "Improves primary database transaction throughput and concurrency."
    ]
  },

  // ==========================================
  // DATA LAKE ARCHITECTURE
  // ==========================================
  {
    id: "dl-hdfs",
    term: "HDFS",
    category: "DATALAKE ARCHITECTURE",
    difficulty: "EASY",
    definition: "Hadoop Distributed File System, a Java-based file system providing redundant block storage across commoditized hardware nodes.",
    explanation: "HDFS is the foundational distributed file system of legacy Big Data. It splits massive files into large blocks (e.g. 128MB) and distributes them across a cluster. It achieves fault tolerance by replicating each block (default 3x) across different physical racks, enabling parallel MapReduce read patterns.",
    keyPoints: [
      "Uses a master NameNode to manage metadata and multiple worker DataNodes to store block files.",
      "Designed to support high-throughput streaming access on massive datasets.",
      "Optimized for batch writes (write-once, read-many) rather than random updates."
    ]
  },
  {
    id: "dl-parquet",
    term: "Parquet",
    category: "DATALAKE ARCHITECTURE",
    difficulty: "EASY",
    definition: "An open-source, columnar storage file format optimized for high-performance analytical queries.",
    explanation: "Apache Parquet is a compressed columnar binary format. Unlike row-based CSVs, it groups data values by column. This allows query engines to skip unneeded columns during reads, reducing disk I/O. It supports dictionary encoding, run-length compression, and embeds min/max statistics for partition skipping.",
    keyPoints: [
      "Highly efficient compression due to homogeneous column data types.",
      "Stores metadata (schemas, row groups, page headers) at the end of the file.",
      "Supports nested data structures and schema representation."
    ]
  },
  {
    id: "dl-partitioning",
    term: "Partitioning",
    category: "DATALAKE ARCHITECTURE",
    difficulty: "EASY",
    definition: "The practice of structuring a data lake directory layout based on specific low-cardinality data columns.",
    explanation: "Partitioning splits a massive dataset into physical folders on disk (e.g., `/year=2026/month=05/`). When a query filters on the partition key, the execution engine skips reading files in unrelated folders (known as Partition Pruning), dramatically accelerating queries and saving server costs.",
    keyPoints: [
      "Physically separates files into directory folders based on partition keys.",
      "Works best on low-cardinality columns like dates, regions, or departments.",
      "Over-partitioning (creating thousands of tiny folders) leads to the 'small files problem'."
    ]
  },
  {
    id: "dl-delta-lake",
    term: "Delta Lake",
    category: "DATALAKE ARCHITECTURE",
    difficulty: "MEDIUM",
    definition: "An open-source storage layer that brings ACID transactions and metadata management to Apache Spark data lakes.",
    explanation: "Delta Lake adds a transaction log (the `_delta_log` directory) on top of standard Parquet files. When a transaction occurs, Delta writes a JSON commit file tracking which Parquet files were added or removed. This enables ACID transactions, concurrency, schema enforcement, and time travel snapshots.",
    keyPoints: [
      "Uses a JSON transaction log to maintain state and coordinate write concurrency.",
      "Supports Upsert (Merge) operations to update existing records cleanly.",
      "Enables schema validation to prevent corrupt data writes."
    ]
  },
  {
    id: "dl-schema-evolution",
    term: "Schema Evolution",
    category: "DATALAKE ARCHITECTURE",
    difficulty: "MEDIUM",
    definition: "The ability of a data storage engine to dynamically accommodate schema changes without rewriting existing data.",
    explanation: "As systems evolve, new columns are added. In Delta Lake, Schema Evolution allows writers to add new fields to tables seamlessly by setting specific write options (e.g. `mergeSchema`). The transaction log updates table metadata, allowing old Parquet files (lacking the new column) to be read as NULL values.",
    keyPoints: [
      "Prevents write job failures when schemas shift over time.",
      "Automatically updates the transaction log catalog with new fields.",
      "Keeps data historical files intact without expensive reprocessing."
    ]
  },
  {
    id: "dl-object-storage",
    term: "Object Storage",
    category: "DATALAKE ARCHITECTURE",
    difficulty: "MEDIUM",
    definition: "Flat storage repositories (like ADLS Gen2, AWS S3, GCS) that manage data as objects rather than hierarchical filesystems.",
    explanation: "Modern cloud data lakes rely on Object Storage instead of HDFS. These systems store files in a flat structure using global unique keys (the URI path). Azure Data Lake Storage (ADLS) Gen2 adds a hierarchical namespace on top of blob storage, enabling directory-level security and atomic rename operations.",
    keyPoints: [
      "Offers massive, cost-effective scalability for unstructured and structured data.",
      "Separates storage cost from virtual machine compute nodes.",
      "ADLS Gen2 supports ACL security permissions on directories."
    ]
  },
  {
    id: "dl-z-order",
    term: "Z-Ordering",
    category: "DATALAKE ARCHITECTURE",
    difficulty: "HARD",
    definition: "A multi-dimensional data clustering technique used to sort data columns inside Parquet files to optimize scan efficiency.",
    explanation: "Z-Ordering sorts data in a space-filling curve format. By clustering values across multiple columns (e.g. `ZORDER BY (CustomerID, Date)`), it ensures that when a query filters on any of these columns, Parquet file statistics (min/max values) have narrow ranges, allowing the query engine to skip reading non-matching files.",
    keyPoints: [
      "Optimizes file layout for queries filtering on multiple high-cardinality columns.",
      "Reduces the amount of data scanned on disk by maximizing min/max file skips.",
      "Typically executed as part of table optimization routines (e.g., `OPTIMIZE Table ZORDER BY`)."
    ]
  },
  {
    id: "dl-schema-enforcement",
    term: "Schema Enforcement",
    category: "DATALAKE ARCHITECTURE",
    difficulty: "HARD",
    definition: "A safety mechanism in Delta Lake that rejects data writes if the incoming schema does not match the target table.",
    explanation: "Schema Enforcement acts as the gatekeeper of a table's quality. When a Spark job tries to write a DataFrame, Delta compares its schema against the target catalog. If there are extra columns, type mismatches, or missing constraints, the write fails automatically, protecting downstream BI systems from errors.",
    keyPoints: [
      "Default behavior in Delta Lake to protect data quality.",
      "Prevents column contamination and database corruption.",
      "Can be overridden using schema merging options if the change is approved."
    ]
  },
  {
    id: "dl-time-travel",
    term: "Time Travel",
    category: "DATALAKE ARCHITECTURE",
    difficulty: "HARD",
    definition: "The capability in Delta Lake to query past snapshots of a table using transaction log version keys or timestamps.",
    explanation: "Because Delta Lake retains older Parquet files and records every change in the transaction log, developers can query the table exactly as it looked at a specific point in time. This is invaluable for rollbacks, audits, reproducing machine learning models, and debugging pipeline errors.",
    keyPoints: [
      "Queries historical data using syntax like `VERSION AS OF` or `TIMESTAMP AS OF`.",
      "Relies on the log history and file retention window configured on the table.",
      "Old files are deleted permanently only when running the `VACUUM` command."
    ]
  },
  {
    id: "dl-apache-iceberg",
    term: "Apache Iceberg",
    category: "DATALAKE ARCHITECTURE",
    difficulty: "MEDIUM",
    definition: "An open-source, high-performance table format designed for massive analytical datasets, supporting schema evolution and hidden partitioning.",
    explanation: "Apache Iceberg is a highly scalable table format. Unlike traditional folder-based data lakes, Iceberg manages files using hierarchical metadata lists. This enables transactional consistency, time travel, schema evolution (adding/deleting columns without side effects), and 'hidden partitioning' (preventing queries from scanning incorrect files without manual directory path filters).",
    keyPoints: [
      "Tracks table state using metadata files instead of relying on folder paths.",
      "Enables hidden partitioning to eliminate manual partition pruning in queries.",
      "Supports ACID transactions and schema evolution across multiple compute engines."
    ]
  },
  {
    id: "dl-uniform",
    term: "Universal Format (UniForm)",
    category: "DATALAKE ARCHITECTURE",
    difficulty: "HARD",
    definition: "A Delta Lake technology that automatically generates Iceberg-compliant metadata, allowing Iceberg-centric engines to read Delta tables without copying.",
    explanation: "Universal Format (UniForm) eliminates the dilemma of choosing a data lake table format. Since Delta and Iceberg both store data in Parquet format, UniForm writes Iceberg-compatible metadata during Delta table write operations. This allows engines that support Iceberg (like Snowflake, BigQuery, or Trino) to query the table directly as an Iceberg table, saving storage costs.",
    keyPoints: [
      "Enables multi-engine read capabilities on a single physical dataset.",
      "Generates Iceberg metadata on-the-fly alongside standard Delta transaction logs.",
      "Eliminates data replication and file conversion pipelines between formats."
    ]
  },
  {
    id: "dl-liquid-clustering",
    term: "Liquid Clustering",
    category: "DATALAKE ARCHITECTURE",
    difficulty: "HARD",
    definition: "A self-tuning data layout optimization in Delta Lake that replaces static partitioning and Z-Ordering with incremental clustering keys.",
    explanation: "Liquid Clustering dynamically organizes data files. Traditional partitioning is rigid and Z-Ordering requires expensive full table rewrites. Liquid Clustering applies a multi-dimensional sorting pattern incrementally as data is written. It allows developers to redefine clustering keys on active tables, automatically resolving data skew and small file problems.",
    keyPoints: [
      "Dynamically groups data based on defined clustering keys as new files are written.",
      "Reduces layout optimization costs compared to full Z-Order rewrites.",
      "Allows modifying clustering columns without restructuring historical tables."
    ]
  },

  // ==========================================
  // SPARK & DATABRICKS
  // ==========================================
  {
    id: "spark-session",
    term: "SparkSession",
    category: "SPARK & DATABRICKS",
    difficulty: "EASY",
    definition: "The unified entry point for programming Apache Spark applications using DataFrames and SQL.",
    explanation: "SparkSession replaced the legacy SparkContext and SQLContext in Spark 2.0. It coordinates execution configs, manages internal catalogs, and acts as the builder interface to create DataFrames, execute SQL statements, and connect to remote cluster managers.",
    keyPoints: [
      "Unified entry point; created using `SparkSession.builder`.",
      "Under Spark Connect, it communicates over gRPC to run client applications.",
      "Encapsulates context, runtime configuration options, and catalog APIs."
    ]
  },
  {
    id: "spark-rdd",
    term: "Resilient Distributed Dataset (RDD)",
    category: "SPARK & DATABRICKS",
    difficulty: "EASY",
    definition: "Spark's core abstraction representing a read-only, partitioned, fault-tolerant collection of elements.",
    explanation: "RDD is the foundational building block of Spark. It distributes raw objects across worker nodes. If a worker node crashes, Spark reconstructs missing partitions automatically using the RDD's lineage graph (history of operations). Modern Spark uses DataFrames, which are built on top of RDDs.",
    keyPoints: [
      "Fault-tolerant distributed memory collection.",
      "Does not enforce schemas natively; operates on raw JVM objects.",
      "Can be created from external filesystems or by parallelizing local lists."
    ]
  },
  {
    id: "spark-dataframe",
    term: "DataFrame",
    category: "SPARK & DATABRICKS",
    difficulty: "EASY",
    definition: "A distributed collection of data organized into named columns, equivalent to a table in a relational database.",
    explanation: "A DataFrame is a structured dataset. It wraps the raw execution engine of RDDs with schema metadata. DataFrames allow Spark to understand column names and types, enabling the Catalyst Optimizer to optimize execution plans before running queries on the cluster nodes.",
    keyPoints: [
      "Imposes a structured schema on distributed data collections.",
      "Available across Python, Scala, R, and Java APIs.",
      "Evaluates operations lazily; execution is optimized globally."
    ]
  },
  {
    id: "spark-lazy-evaluation",
    term: "Lazy Evaluation",
    category: "SPARK & DATABRICKS",
    difficulty: "MEDIUM",
    definition: "An execution strategy where Spark delays query executions until an action is explicitly requested.",
    explanation: "Spark transformations (like `select`, `filter`, `join`) are lazy. When called, Spark does not compute results; it simply appends them to a logical lineage plan. Computation only occurs when an 'action' (like `count`, `collect`, `show`, or writing to disk) is invoked. This allows Spark to optimize the global execution path.",
    keyPoints: [
      "Transformations build the logical plan; actions trigger physical compilation and run.",
      "Enables Catalyst to merge filter operations and optimize resource usage.",
      "Saves memory and prevents loading unnecessary data partitions into memory."
    ]
  },
  {
    id: "spark-catalyst",
    term: "Catalyst Optimizer",
    category: "SPARK & DATABRICKS",
    difficulty: "MEDIUM",
    definition: "The core query optimization engine powering Spark SQL and the DataFrame API.",
    explanation: "Catalyst optimizes query execution plans. It takes a query and runs it through four phases: (1) Analysis (resolving table and column names), (2) Logical Optimization (applying rules like predicate pushdown and projection pruning), (3) Physical Planning (evaluating join strategies), and (4) Code Generation (compiling plans to Java bytecode).",
    keyPoints: [
      "Applies rules like predicate pushdown (filtering data at the source file level).",
      "Performs cost-based join selection (e.g. deciding when to broadcast a small table).",
      "Built on Scala's functional programming pattern matching mechanics."
    ]
  },
  {
    id: "spark-aqe",
    term: "Adaptive Query Execution (AQE)",
    category: "SPARK & DATABRICKS",
    difficulty: "MEDIUM",
    definition: "An optimization framework that dynamically adjusts Spark physical execution plans during runtime based on intermediate stage statistics.",
    explanation: "Traditional query planners must predict execution paths based on static statistics. AQE changes this by re-optimizing the query plan *during* execution. When a map/shuffle stage completes, Spark inspects partition sizes. If partitions are too small, AQE merges them. If a join was planned as a shuffle but data is small, it converts it to a broadcast join.",
    keyPoints: [
      "Dynamically coalesces post-shuffle partition sizes to prevent overhead.",
      "Converts Sort-Merge Joins into Broadcast Hash Joins on-the-fly.",
      "Detects and mitigates data skew by dividing skewed partitions into smaller sub-tasks."
    ]
  },
  {
    id: "spark-tungsten",
    term: "Tungsten Engine",
    category: "SPARK & DATABRICKS",
    difficulty: "HARD",
    definition: "Spark's physical execution optimizer that manages memory directly using raw off-heap byte arrays.",
    explanation: "Tungsten is a major redesign of Spark's execution layer. By bypassing Java Virtual Machine (JVM) garbage collection and object serialization overhead, Tungsten manages memory manually (similar to C++). It stores records as raw bytes off-heap and utilizes Whole-Stage Code Generation to compile operations directly into compact bytecode.",
    keyPoints: [
      "Direct off-heap memory management to bypass JVM garbage collection latency.",
      "Uses Cache-aware computation to store data arrays directly inside L1/L2 CPU cache.",
      "Whole-Stage Code Generation compiles multiple execution steps into a single Java function."
    ]
  },
  {
    id: "spark-data-skew",
    term: "Data Skew & Salt Keys",
    category: "SPARK & DATABRICKS",
    difficulty: "HARD",
    definition: "A performance bottleneck where a few data partitions hold disproportionately more records, resolved by adding random salt keys.",
    explanation: "In distributed computing, data skew occurs when one join key has millions of records while others have few. When Spark shuffles data, one task gets overwhelmed, stalling the entire job. To resolve this, engineers apply 'salting': appending a random number to the join keys on the skewed table, and duplicating rows on the matching table.",
    keyPoints: [
      "Data skew stalls parallel execution; the job speed is limited by the slowest worker node.",
      "Salting key distribution spreads skewed records evenly across multiple tasks.",
      "Can be automatically handled in modern Spark versions using AQE skew settings."
    ]
  },
  {
    id: "spark-unity-catalog",
    term: "Unity Catalog",
    category: "SPARK & DATABRICKS",
    difficulty: "HARD",
    definition: "A unified governance and catalog system for files, tables, dashboards, and notebooks across Databricks workspaces.",
    explanation: "Unity Catalog provides centralized access control, lineage tracing, and auditing. Instead of configuring security per workspace, Unity allows administrators to define permissions using standard SQL (e.g. `GRANT SELECT ON TABLE`) across multiple clusters, securing file storage paths and relational tables from a single pane of glass.",
    keyPoints: [
      "Centralized governance system; decouples data security policies from specific workspaces.",
      "Provides automated table-level and column-level data lineage tracking.",
      "Enables row-level filtering and column-level masking rules."
    ]
  },
  {
    id: "spark-photon",
    term: "Photon Engine",
    category: "SPARK & DATABRICKS",
    difficulty: "MEDIUM",
    definition: "A native, vectorized query engine written in C++ that accelerates execution speeds of Spark SQL and DataFrame workloads.",
    explanation: "The Photon Engine is Databricks' vectorized query engine. Written in C++ to bypass JVM memory overhead, it processes column chunks (vectors) in parallel using modern CPU optimization techniques (SIMD). It is completely compatible with Apache Spark APIs, meaning existing Spark jobs run faster without code alterations when run on Photon clusters.",
    keyPoints: [
      "Vectorized execution engine written in C++ to bypass JVM garbage collection.",
      "Fully compatible with standard Spark SQL and DataFrame operations.",
      "Significantly accelerates ETL processing speeds and reduces cloud compute costs."
    ]
  },
  {
    id: "spark-connect",
    term: "Spark Connect",
    category: "SPARK & DATABRICKS",
    difficulty: "MEDIUM",
    definition: "A client-server gRPC architecture that decouples the Spark driver from local client applications and developer IDEs.",
    explanation: "Spark Connect introduces a thin client-server protocol for Apache Spark. Instead of running a heavyweight driver locally, Spark Connect translates local DataFrame operations into logical execution plans, sending them over gRPC to a remote Spark cluster. This enables IDEs, lightweight Python environments, and serverless applications to interact with Spark instantly.",
    keyPoints: [
      "Decouples driver execution; client applications require no Spark install.",
      "Communicates over gRPC, streaming logical plans and Arrow data blocks.",
      "Allows developers to run and debug Spark code directly within local IDEs."
    ]
  },
  {
    id: "spark-dlt",
    term: "Delta Live Tables (DLT)",
    category: "SPARK & DATABRICKS",
    difficulty: "HARD",
    definition: "A declarative SQL and Python framework for building, testing, and monitoring reliable batch and streaming data pipelines.",
    explanation: "Delta Live Tables simplifies ETL pipeline development. Instead of writing manual orchestration and error handling code, developers declare target tables and views using SQL or Python. DLT automatically determines task dependencies, deploys cluster compute, manages schema evolution, and validates data quality using defined expectations.",
    keyPoints: [
      "Declarative pipeline framework that manages infrastructure and dependencies.",
      "Enforces data quality rules using schema and threshold 'expectations'.",
      "Provides built-in monitoring dashboards and data lineage graphing."
    ]
  },

  // ==========================================
  // GENERAL DATA ENGINEERING
  // ==========================================
  {
    id: "de-etl-elt",
    term: "ETL vs ELT",
    category: "GENERAL DE",
    difficulty: "EASY",
    definition: "Ingestion paradigms defining whether data transformation occurs before (ETL) or after (ELT) landing in the target storage system.",
    explanation: "ETL (Extract, Transform, Load) cleanses data on a middle-tier integration server before loading it. ELT (Extract, Load, Transform) loads raw data directly into a high-capacity target cloud database (like Snowflake, Synapse, OneLake) and leverages the target's scalable compute power to transform it.",
    keyPoints: [
      "ETL: Historically popular; protects target databases from unvalidated data load.",
      "ELT: Dominant in modern cloud data warehousing; maximizes ingestion speed.",
      "ELT utilizes target SQL or Spark engines to perform processing on-demand."
    ]
  },
  {
    id: "de-dimension-table",
    term: "Dimension Table",
    category: "GENERAL DE",
    difficulty: "EASY",
    definition: "A table in a dimensional database model containing descriptive attributes used to filter, group, and slice facts.",
    explanation: "Dimension tables represent the 'who, what, where, when, why' of business events. They contain textual context columns (like customer names, product categories, store locations). Dimensions are usually wide, flat, and highly descriptive, linking to Fact tables using primary/foreign key relationships.",
    keyPoints: [
      "Contains textual context and descriptors of business entities.",
      "Filters and slices fact metrics in SQL queries.",
      "Typically has a low number of rows compared to Fact tables."
    ]
  },
  {
    id: "de-fact-table",
    term: "Fact Table",
    category: "GENERAL DE",
    difficulty: "EASY",
    definition: "A central table in a dimensional database model containing quantitative metrics and keys referencing dimension tables.",
    explanation: "Fact tables record the measurements or metrics of a business process (e.g. Sales Amount, Quantity Sold, Temperature Log). They are typically long, narrow, and contain numeric values that are aggregate-friendly (SUM, AVG) along with foreign keys pointing to dimension tables.",
    keyPoints: [
      "Contains quantitative metrics and foreign key reference columns.",
      "Consists of a high volume of rows representing individual transactional events.",
      "Facts can be Additive (summed across all dimensions), Semi-Additive, or Non-Additive."
    ]
  },
  {
    id: "de-scd-2",
    term: "Slowly Changing Dimensions Type 2 (SCD Type 2)",
    category: "GENERAL DE",
    difficulty: "MEDIUM",
    definition: "A design pattern that tracks historical attribute changes by creating new records with effective start/end dates.",
    explanation: "SCD Type 2 is the standard dimensional modeling technique for maintaining history. When an attribute changes (e.g., a customer moves to a new city), the database inserts a new row with the updated city, marks the previous row as expired (updating `EndDate`), and sets the new row's `StartDate` as active.",
    keyPoints: [
      "Preserves full history; links historical sales transactions to the correct customer attributes.",
      "Uses surrogate keys to identify separate versions of the same natural entity.",
      "Requires maintaining tracking columns like `StartDate`, `EndDate`, and `IsActive`."
    ]
  },
  {
    id: "de-cdc",
    term: "Change Data Capture (CDC)",
    category: "GENERAL DE",
    difficulty: "MEDIUM",
    definition: "A technology that monitors database logs in real-time to identify and capture insert, update, and delete actions.",
    explanation: "CDC allows pipelines to ingest only altered records rather than running expensive daily full-table scans. By reading database transaction logs, CDC engines (like Debezium) stream updates to message brokers (like Kafka), enabling real-time replication and incremental loads.",
    keyPoints: [
      "Extracts modifications directly from transaction logs without impacting database performance.",
      "Streams changes asynchronously as insert/update/delete events.",
      "Core technology for near-real-time data lake synchronization."
    ]
  },
  {
    id: "de-orchestration",
    term: "Data Orchestration",
    category: "GENERAL DE",
    difficulty: "MEDIUM",
    definition: "The practice of automating, scheduling, and monitoring complex data workflows and pipeline dependencies.",
    explanation: "Orchestrators coordinate data workflows. Rather than running tasks as isolated cron jobs, tools like Apache Airflow, Prefect, or Dagster manage tasks as Directed Acyclic Graphs (DAGs). They handle task retries, parallel execute states, and trigger notifications if a stage fails.",
    keyPoints: [
      "Defines tasks as Directed Acyclic Graphs (DAGs) to enforce dependencies.",
      "Provides central tracking, logging, and retry policies for data pipelines.",
      "Coordinates cross-system activities (e.g. running a copy task, then triggering a Spark notebook)."
    ]
  },
  {
    id: "de-idempotency",
    term: "Idempotency",
    category: "GENERAL DE",
    difficulty: "HARD",
    definition: "A data pipeline design property ensuring that executing a pipeline multiple times with the same input produces the exact same output.",
    explanation: "Idempotency prevents data duplication and corruption when pipelines crash and rerun. An idempotent pipeline is self-correcting: if it processes the same daily batch twice, it updates/overwrites target records instead of appending duplicate rows, usually implemented using Upserts or transactional overrides.",
    keyPoints: [
      "Crucial for high reliability; prevents duplicate records on retry executions.",
      "Requires using SQL Merge (Upsert) or overwrite-partition write patterns.",
      "Allows pipelines to be rerun safely from any step in the event of an infrastructure crash."
    ]
  },
  {
    id: "de-kappa-architecture",
    term: "Kappa Architecture",
    category: "GENERAL DE",
    difficulty: "HARD",
    definition: "A software architecture design pattern that processes all data streams through a single streaming engine.",
    explanation: "Kappa Architecture is a simplification of Lambda Architecture. Instead of running a dual pipeline structure (a slow batch layer and a fast real-time streaming layer), Kappa treats all data as an infinite log stream. Both real-time analytics and historical reprocessings run through the same streaming engine.",
    keyPoints: [
      "Eliminates the complexity of maintaining separate batch and speed code paths.",
      "Relies on a message broker (like Apache Kafka) with high retention for historical replays.",
      "Simplifies code maintenance and query consistency."
    ]
  },
  {
    id: "de-event-driven",
    term: "Event-Driven Architecture",
    category: "GENERAL DE",
    difficulty: "HARD",
    definition: "A decoupled software architecture where data is produced and consumed as asynchronous event messages.",
    explanation: "In modern data platforms, systems are decoupled using event messaging. When an event occurs (e.g. a customer order), a publisher sends an event message to a distributed log (like Apache Kafka or Event Hubs). Consumer pipelines subscribe to the log, processing events at their own pace without direct dependency locks.",
    keyPoints: [
      "Highly decoupled; producers and consumers operate independently.",
      "Message brokers scale horizontally to handle millions of partition events per second.",
      "Enables near-real-time streaming analytics and microservice integrations."
    ]
  },
  {
    id: "de-data-mesh",
    term: "Data Mesh",
    category: "GENERAL DE",
    difficulty: "MEDIUM",
    definition: "A decentralized architectural paradigm that shifts data ownership and governance from a central platform team to domain product teams.",
    explanation: "Data Mesh addresses organizational bottlenecks in big data. Instead of routing all data through a central data engineering team, it divides ownership into domain areas (e.g. Sales, Marketing). Each domain treats data as a product, building and exposing their own datasets, supported by a self-serve platform and federated governance.",
    keyPoints: [
      "Decentralizes data ownership to domain-oriented operational teams.",
      "Treats data as a product that must be discoverable and high quality.",
      "Relies on self-serve data infrastructure platforms to enable scaling."
    ]
  },
  {
    id: "de-data-contracts",
    term: "Data Contracts",
    category: "GENERAL DE",
    difficulty: "HARD",
    definition: "Formal agreements between data producers and consumers defining schema structure, data quality constraints, and SLA expectations.",
    explanation: "Data Contracts prevent breaking changes in analytical data pipelines. Written in declarative schemas (like JSON Schema or YAML), a contract specifies the columns, data types, nullability, and SLA standards of a data feed. Ingest jobs validate incoming data against the contract, failing fast to prevent garbage data from entering warehouses.",
    keyPoints: [
      "Establishes a formal, version-controlled interface for data feeds.",
      "Protects downstream analytics from breaking schema changes.",
      "Enforces automated validation tests on data pipelines during execution."
    ]
  },
  {
    id: "de-dbt",
    term: "dbt (Data Build Tool)",
    category: "GENERAL DE",
    difficulty: "EASY",
    definition: "A transformation tool that lets developers build, test, and document SQL models inside their data warehouse using SELECT statements.",
    explanation: "dbt (data build tool) focuses on the 'T' (Transform) of ELT. Instead of writing complex DDL or stored procedures, developers write modular SQL SELECT queries. dbt compiles this code, builds tables or views in the target database, runs automated test validations, and generates visual data lineage catalogs.",
    keyPoints: [
      "Simplifies SQL modeling by using modular, version-controlled SELECT files.",
      "Includes built-in testing (null checks, unique keys) and documentation generators.",
      "Compiles and executes code directly on the target warehouse compute engine."
    ]
  }
];
