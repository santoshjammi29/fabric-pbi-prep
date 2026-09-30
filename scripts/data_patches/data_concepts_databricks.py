# data_concepts_databricks.py

databricks_data = {
    # EASY (15)
    "Databricks Workspace": {
        "id": "databricks-databricks-workspace",
        "difficulty": "EASY",
        "definition": "A Databricks Workspace is a software-as-a-service (SaaS) environment that provides a unified collaborative interface for data engineers, data scientists, and analysts to access compute, notebooks, and storage.",
        "explanation": "Operating within an organization's cloud account (AWS, Azure, GCP), the Databricks Workspace delivers a managed control plane while executing compute workloads within the customer's virtual private cloud (VPC/VNet). It unifies development tools (Notebooks, Repos, Workflows), governance services (Unity Catalog, Data Explorer), and compute infrastructure management (All-Purpose clusters, SQL Warehouses) behind a single enterprise SSO portal.",
        "keyPoints": [
            "Unified collaborative SaaS interface for data engineering, analytics, machine learning, and BI.",
            "Operates via a decoupled architecture: Databricks-managed control plane and customer-hosted data plane.",
            "Provides role-based access control (RBAC) and single sign-on (SSO) integration via corporate identity providers.",
            "Acts as the deployment container for compute clusters, notebooks, workflows, and Unity Catalog catalogs."
        ]
    },
    "All-Purpose Cluster": {
        "id": "databricks-all-purpose-cluster",
        "difficulty": "EASY",
        "definition": "An All-Purpose Cluster is a shared interactive compute cluster designed for collaborative exploratory data analysis, interactive notebook development, and ad-hoc querying.",
        "explanation": "All-purpose clusters can be manually started and stopped, and multiple users can attach their notebooks to the same running cluster simultaneously. Because all-purpose clusters incur higher Databricks Unit (DBU) consumption rates than automated job clusters, organizations enforce auto-termination policies (e.g., stopping after 20 minutes of inactivity) and cluster policies to prevent developers from leaving expensive compute running overnight.",
        "keyPoints": [
            "Interactive compute cluster optimized for development, ad-hoc experimentation, and notebook execution.",
            "Shared across multiple concurrent users with support for user isolation and isolated Python REPLs.",
            "Priced at a higher DBU rate compared to automated, ephemeral Job clusters.",
            "Governed by automated auto-termination rules to eliminate idle cloud compute waste."
        ]
    },
    "Job Cluster": {
        "id": "databricks-job-cluster",
        "difficulty": "EASY",
        "definition": "A Job Cluster is an ephemeral, dedicated compute cluster automatically provisioned by Databricks to execute a specific automated workload and terminated immediately upon completion.",
        "explanation": "Job clusters are the enterprise standard for running production scheduled workflows, ETL pipelines, and dbt tasks. When a scheduled Databricks Job runs, the platform provisions fresh virtual machines, configures the Spark environment, executes the assigned task, and immediately tears down the cluster. Because they run non-interactively, job clusters are billed at significantly discounted DBU rates and eliminate cross-job resource contention.",
        "keyPoints": [
            "Ephemeral, single-tenant compute provisioned automatically for scheduled production workflows.",
            "Terminated immediately upon job completion, guaranteeing zero idle compute billing.",
            "Billed at significantly reduced DBU cost tiers compared to interactive all-purpose clusters.",
            "Eliminates dependency collisions and noisy-neighbor resource contention between production jobs."
        ]
    },
    "Databricks Notebook": {
        "id": "databricks-databricks-notebook",
        "difficulty": "EASY",
        "definition": "A Databricks Notebook is a web-based interactive development document combining live executable code cells, interactive visualizations, and narrative markdown documentation.",
        "explanation": "Databricks Notebooks support multi-language polyglot development: users can seamlessly switch between Python, SQL, Scala, and R within the same notebook using language magic commands (%python, %sql, %scala, %r). Notebooks feature real-time multi-user co-authoring, built-in version history, and integration with enterprise Git repositories via Databricks Repos. Notebooks can be parameterized and invoked as modular tasks within Databricks Workflows.",
        "keyPoints": [
            "Interactive web-based IDE combining executable code, tabular outputs, visual charts, and markdown.",
            "Supports seamless multi-language execution in the same notebook using magic commands (%sql, %python, %scala).",
            "Integrates real-time collaborative editing and native synchronization with Git repositories via Databricks Repos.",
            "Can be scheduled directly as production pipeline tasks with dynamic widget parameters."
        ]
    },
    "DBFS (Databricks File System)": {
        "id": "databricks-dbfs-databricks-file-system",
        "difficulty": "EASY",
        "definition": "DBFS (Databricks File System) is a distributed file system abstraction layer mounted over cloud object storage (S3 bucket, Azure container, GCS bucket) accessible across the workspace.",
        "explanation": "DBFS maps URI paths like `dbfs:/mnt/data` to underlying cloud object storage, allowing Spark code to read and write files using POSIX-style file semantics (`/dbfs/...`). While foundational in legacy Databricks architectures, mounting storage via DBFS root or DBFS mounts carries security limitations because permissions are shared workspace-wide. In modern lakehouses, Unity Catalog Volumes have completely superseded DBFS mounts for governed data access.",
        "keyPoints": [
            "File system abstraction mapping directory paths to underlying cloud object storage buckets.",
            "Allows standard POSIX and Spark file operations (dbutils.fs.ls, spark.read.csv) over distributed cloud storage.",
            "Legacy DBFS root and mounts lack fine-grained data governance across multi-team workspaces.",
            "Superseded by Unity Catalog Volumes for secure, governed, and audited file access in modern architectures."
        ]
    },
    "Delta Lake (Databricks)": {
        "id": "databricks-delta-lake-databricks",
        "difficulty": "EASY",
        "definition": "Delta Lake is an open-source storage framework that brings ACID transactions, scalable metadata handling, and unified streaming and batch data processing to Apache Spark and data lakes.",
        "explanation": "Delta Lake stores raw data in columnar Apache Parquet files accompanied by a forward-compatible JSON transaction log (`_delta_log/`). Every write, update, delete, or merge operation commits an atomic transaction to the log. This architecture prevents partial write corruptions, enables snapshot isolation for concurrent readers and writers, supports time travel audits, and enforces schema validation on write operations.",
        "keyPoints": [
            "Combines open Parquet storage with an atomic, serialized JSON transaction log (_delta_log/).",
            "Provides full ACID transactions and serializable snapshot isolation across concurrent batch and streaming jobs.",
            "Enforces strict schema validation on write with optional automated schema evolution (mergeSchema).",
            "Powers core Lakehouse features including Time Travel, Change Data Feed, and OPTIMIZE file compaction."
        ]
    },
    "Unity Catalog": {
        "id": "databricks-unity-catalog",
        "difficulty": "EASY",
        "definition": "Unity Catalog is Databricks' centralized, multi-cloud governance solution providing unified access control, data auditing, lineage tracking, and discovery across all workspace assets.",
        "explanation": "Prior to Unity Catalog, access controls were applied at the workspace level or via legacy Hive metastores. Unity Catalog introduces a unified metastore that spans multiple workspaces and clouds (AWS, Azure, GCP). It enforces standard ANSI SQL three-tier naming (`catalog.schema.table_or_volume`), centralizes identity management, enables fine-grained row- and column-level security, and automatically tracks column-level data lineage across notebooks, workflows, and dashboards.",
        "keyPoints": [
            "Centralized governance and metadata catalog spanning multiple Databricks workspaces and cloud providers.",
            "Enforces a standard three-level namespace: catalog.schema.table_or_volume across all SQL and PySpark code.",
            "Provides fine-grained row-level filtering and column masking policies managed via standard SQL GRANTs.",
            "Captures automated, end-to-end table and column-level lineage without third-party agent instrumentation."
        ]
    },
    "Metastore": {
        "id": "databricks-metastore",
        "difficulty": "EASY",
        "definition": "A Metastore is the central metadata repository that catalogs schema definitions, table partition locations, data types, and access privileges for data stored in the lakehouse.",
        "explanation": "In Databricks, metastores exist in two generations: legacy Hive Metastore (HMS, which is workspace-local and tied to legacy DBFS/cloud storage) and Unity Catalog Metastore. The Unity Catalog metastore is a top-level container assigned to a cloud region that can be attached to multiple Databricks workspaces. It maps physical cloud storage locations to logical catalogs, schemas, tables, and volumes with enterprise identity governance.",
        "keyPoints": [
            "Stores schema metadata, column definitions, table properties, and storage path pointers.",
            "Legacy Hive Metastore (HMS) is bound locally to individual workspaces and lacks cross-cloud governance.",
            "Unity Catalog Metastore operates at the account level, governing multiple workspaces in a cloud region.",
            "Binds managed cloud storage credentials to logical data assets, isolating physical IAM roles from end users."
        ]
    },
    "Data Explorer": {
        "id": "databricks-data-explorer",
        "difficulty": "EASY",
        "definition": "Data Explorer is the visual UI tool in the Databricks Workspace used to discover, manage, inspect, and grant permissions on Unity Catalog data assets.",
        "explanation": "Accessible via the workspace sidebar, Data Explorer allows engineers, analysts, and governance officers to browse catalogs, schemas, tables, views, volumes, and models. Users can inspect table schemas, view sample data previews, audit historical table details (Delta history), examine automated lineage diagrams, and grant or revoke access privileges through an intuitive visual interface or SQL commands.",
        "keyPoints": [
            "Visual management interface for browsing and administering catalogs, schemas, tables, and volumes.",
            "Displays column types, descriptions, sample data previews, and physical table storage properties.",
            "Visualizes automated interactive data lineage diagrams showing upstream sources and downstream consumers.",
            "Enables point-and-click permission management (GRANT/REVOKE) for data owners and administrators."
        ]
    },
    "dbutils": {
        "id": "databricks-dbutils",
        "difficulty": "EASY",
        "definition": "Databricks Utilities (dbutils) is a built-in Python and Scala library that provides programmatic helper methods for file system operations, secret management, notebook workflows, and UI widgets.",
        "explanation": "The `dbutils` package exposes several critical utility modules inside Databricks environments: `dbutils.fs` executes file operations (cp, mv, ls, rm, head) over DBFS and cloud object storage; `dbutils.secrets` retrieves encrypted credentials from Databricks secret scopes (`dbutils.secrets.get(scope, key)`); `dbutils.notebook` chains modular notebooks together (`run`, `exit`); and `dbutils.widgets` builds parameterized dropdowns and input boxes.",
        "keyPoints": [
            "Core utility library pre-installed across all Databricks runtime clusters.",
            "dbutils.fs provides distributed file system commands for exploring and manipulating cloud storage paths.",
            "dbutils.secrets securely fetches credentials from Azure Key Vault or AWS Secrets Manager without hardcoding.",
            "dbutils.notebook allows parameterizing and chaining notebook executions programmatically."
        ]
    },
    "Magic Commands": {
        "id": "databricks-magic-commands",
        "difficulty": "EASY",
        "definition": "Magic Commands are special prefix directives (%python, %sql, %scala, %r, %sh, %fs) entered at the beginning of a notebook cell to alter the execution runtime or execute system utilities.",
        "explanation": "Magic commands provide polyglot flexibility within Databricks Notebooks. By default, a notebook runs in its primary language (e.g. Python), but prepending `%sql` allows the cell to execute Spark SQL directly against Unity Catalog tables. Other essential magic commands include `%sh` (executes bash shell commands on the driver node), `%fs` (shorthand for dbutils.fs commands), and `%pip` (installs Python libraries isolated to the notebook session).",
        "keyPoints": [
            "Cell-level directives that switch the execution language (%python, %sql, %scala, %r) on the fly.",
            "%sh allows running bash shell commands and terminal utilities directly on the cluster driver node.",
            "%pip installs Python wheel packages and dependencies scoped specifically to the current notebook session.",
            "%run includes and executes an external notebook's functions and variables in the current session."
        ]
    },
    "Databricks Job": {
        "id": "databricks-databricks-job",
        "difficulty": "EASY",
        "definition": "A Databricks Job is a scheduled or triggered execution unit that runs non-interactive code (notebooks, JARs, Python scripts, dbt models) on automated compute clusters.",
        "explanation": "Databricks Jobs automate production batch and streaming data workloads. A Job can consist of a single task or complex multi-task pipelines. Jobs support flexible trigger mechanisms: cron schedules, continuous streaming loops, file arrival triggers, or programmatic execution via the Databricks Jobs REST API. Jobs can send automated email/webhook notifications upon failure and configure automated retry policies for transient network interruptions.",
        "keyPoints": [
            "Non-interactive production workload execution engine on Databricks.",
            "Provisions ephemeral job clusters to execute workloads cost-effectively with zero idle billing.",
            "Supports multiple task types: Python scripts, SQL queries, dbt tasks, JARs, and Delta Live Tables pipelines.",
            "Includes automated retries, timeout thresholds, and alerting integrations (email, Slack webhooks, PagerDuty)."
        ]
    },
    "Databricks Workflow": {
        "id": "databricks-databricks-workflow",
        "difficulty": "EASY",
        "definition": "Databricks Workflows is the fully managed, native orchestration service within Databricks that designs, schedules, and monitors multi-task Directed Acyclic Graphs (DAGs).",
        "explanation": "Databricks Workflows allows data engineers to build multi-task pipelines where tasks execute in parallel or in topological dependency order across heterogeneous task types (e.g., Task 1: Ingest via Auto Loader; Task 2: Transform via dbt; Task 3: Train MLflow model; Task 4: Refresh Databricks SQL Dashboard). Workflows feature a visual DAG builder, conditional branching (If/Else tasks), parameter passing between tasks, and unified operational monitoring without external orchestrators.",
        "keyPoints": [
            "Native Databricks orchestration engine capable of orchestrating complex multi-task DAG pipelines.",
            "Supports heterogeneous task nodes including notebooks, Python scripts, dbt projects, and SQL queries.",
            "Provides visual DAG dependency mapping, parameter inheritance, and conditional branching (If/Else).",
            "Eliminates the operational overhead of hosting external orchestration tools for lakehouse-centric pipelines."
        ]
    },
    "Databricks Repos": {
        "id": "databricks-databricks-repos",
        "difficulty": "EASY",
        "definition": "Databricks Repos (now known as Git Folders) provides visual and programmatic Git version control integration directly inside the Databricks Workspace.",
        "explanation": "Databricks Repos integrates enterprise Git providers (GitHub, GitLab, Azure DevOps, Bitbucket) directly into the workspace file system. Engineers can clone remote repositories, create feature branches, commit notebook and modular Python code changes, pull updates, and resolve merge conflicts via a visual UI. Repos enables true software engineering best practices by supporting modular Python packages (`from my_package import my_func`) alongside notebooks.",
        "keyPoints": [
            "Visual and programmatic Git integration supporting GitHub, GitLab, Bitbucket, and Azure DevOps.",
            "Enables branching, committing, pushing, and pull request workflows directly inside the workspace.",
            "Allows notebooks to import modular Python files (.py) directly using standard Python import statements.",
            "Integrates into enterprise CI/CD pipelines: automated jobs update Repos to main branch upon release."
        ]
    },
    "Cluster Policy": {
        "id": "databricks-cluster-policy",
        "difficulty": "EASY",
        "definition": "A Cluster Policy is an administrative governance rule set that restricts the configuration options available to users when provisioning compute clusters.",
        "explanation": "To prevent runaway cloud expenditures and enforce organizational standards, workspace administrators define Cluster Policies using JSON schema definitions. Policies enforce constraints such as: maximum number of worker nodes, allowed VM instance types (e.g., blocking expensive GPU instances), mandatory tag inheritance (cost-center, environment), hard limits on auto-termination duration (e.g., max 30 minutes), and forced single-node modes for exploratory developers.",
        "keyPoints": [
            "Administrative governance rules restricting VM types, cluster sizes, and runtime configurations.",
            "Prevents cloud cost overruns by enforcing mandatory auto-termination time limits on interactive compute.",
            "Enforces standard cost allocation tags (owner, project, environment) on all provisioned cloud VMs.",
            "Simplifies cluster creation for non-technical users by pre-filling optimal hardware parameters."
        ]
    },

    # MEDIUM (15)
    "Delta Live Tables (DLT)": {
        "id": "databricks-delta-live-tables-dlt",
        "difficulty": "MEDIUM",
        "definition": "Delta Live Tables (DLT) is a declarative ETL framework in Databricks that simplifies data pipeline development by managing dependencies, infrastructure scaling, and data quality enforcement.",
        "explanation": "Rather than manually stringing together Spark streaming queries, checkpoint locations, and cluster configurations, engineers declare target tables using SQL or Python (`@dlt.table`). DLT automatically constructs the lineage DAG, provisions and autoscales compute clusters, manages checkpointing for streaming tables, handles schema evolution, and captures operational metrics. DLT natively supports both streaming and batch modes with identical declarative code.",
        "keyPoints": [
            "Declarative ETL framework: engineers specify WHAT data transformations to build, DLT manages HOW to execute them.",
            "Automatically orchestrates pipeline DAG dependencies and dynamically optimizes cluster compute resources.",
            "Natively integrates DLT Expectations for automated row-level data quality validation and quarantine routing.",
            "Provides real-time pipeline monitoring, automated failure recovery, and unified event log tracking."
        ]
    },
    "Auto Loader": {
        "id": "databricks-auto-loader",
        "difficulty": "MEDIUM",
        "definition": "Auto Loader is an optimized ingestion engine in Databricks that incrementally and efficiently ingests raw data files from cloud storage as they arrive without state tracking overhead.",
        "explanation": "Ingesting millions of streaming files from S3 or ADLS using traditional file listing is slow and expensive because directory listing API calls scale linearly with file counts. Auto Loader (`cloudFiles` format) solves this by offering two modes: Directory Listing (with parallel incremental lexical scanning) and File Notification (which automatically creates cloud SNS/SQS or Event Grid queues to listen to storage events). Auto Loader also includes seamless automated schema inference and evolution.",
        "keyPoints": [
            "High-throughput incremental file ingestion engine using the format('cloudFiles') stream source.",
            "Provides File Notification mode using cloud queues (SQS, Event Grid) to ingest millions of files without directory scans.",
            "Automatically infers data types and supports schema evolution with a designated rescuedDataColumn.",
            "Guarantees exactly-once ingestion processing semantics backed by Delta streaming checkpoints."
        ]
    },
    "Change Data Feed (CDF)": {
        "id": "databricks-change-data-feed-cdf",
        "difficulty": "MEDIUM",
        "definition": "Change Data Feed (CDF) is a Delta Lake feature that captures and exposes row-level change events (inserts, updates, deletes) committed to a Delta table.",
        "explanation": "When CDF is enabled on a Delta table (`delta.enableChangeDataFeed = true`), Delta Lake writes change metadata files alongside the transaction log. Downstream consumers can query this feed as a batch or streaming source to read exactly what changed between table versions. The feed provides metadata columns: `_change_type` ('insert', 'update_preimage', 'update_postimage', 'delete') and `_commit_version`. This enables incremental downstream processing, reverse ETL, and GDPR compliance.",
        "keyPoints": [
            "Tracks row-level CDC changes (inserts, updates, deletes) committed to Delta tables.",
            "Provides change type metadata including update_preimage (before) and update_postimage (after).",
            "Enables efficient downstream incremental processing without re-reading entire source tables.",
            "Powers regulatory compliance patterns such as cascading GDPR 'Right to be Forgotten' deletions."
        ]
    },
    "Z-Ordering": {
        "id": "databricks-z-ordering",
        "difficulty": "MEDIUM",
        "definition": "Z-Ordering is a multidimensional clustering technique that colocates related information in the same set of Parquet files to maximize file skipping during SQL queries.",
        "explanation": "Standard table partitioning is only effective for low-cardinality columns (e.g. year, month). Attempting to partition by high-cardinality columns (customer_id, timestamp) creates millions of microscopic files. Z-Ordering maps multidimensional data along a space-filling Peano-Hilbert curve, preserving data locality across up to 3-4 high-cardinality columns. When queries filter on Z-ordered columns, Delta's file-level statistics (min/max) skip non-relevant files, speeding up queries 10-100x.",
        "keyPoints": [
            "Multidimensional data clustering technique executed via OPTIMIZE table ZORDER BY (col1, col2).",
            "Preserves data locality across high-cardinality columns that cannot be used as traditional partition keys.",
            "Maximizes data skipping: readers examine file min/max metadata and bypass reading irrelevant Parquet files.",
            "Historically essential for large dimension and fact tables; now being succeeded by Liquid Clustering."
        ]
    },
    "OPTIMIZE Command": {
        "id": "databricks-optimize-command",
        "difficulty": "MEDIUM",
        "definition": "The OPTIMIZE command compacts fragmented small Parquet files in a Delta table into larger, query-efficient files (typically ~1GB in size).",
        "explanation": "Continuous streaming ingestion and frequent micro-batch MERGE operations create thousands of tiny Parquet files (the 'small file problem'), which severely degrades query performance due to filesystem metadata overhead. Running `OPTIMIZE table_name` reads small files and rewrites them into consolidated, uniform target file sizes (around 1GB by default). OPTIMIZE is an idempotent, non-blocking operation that runs concurrently with active table readers.",
        "keyPoints": [
            "Solves the 'small file problem' by compacting thousands of small Parquet files into optimal ~1GB files.",
            "Drastically improves query read throughput by eliminating cloud storage API metadata request latency.",
            "Executed non-destructively: writes new consolidated files and commits an atomic transaction to the Delta log.",
            "Can be scheduled periodically or managed automatically via Databricks Predictive Optimization."
        ]
    },
    "VACUUM Command": {
        "id": "databricks-vacuum-command",
        "difficulty": "MEDIUM",
        "definition": "The VACUUM command permanently deletes historical data files from cloud storage that are no longer referenced by the active Delta table log and exceed a retention threshold.",
        "explanation": "Because Delta Lake retains historical snapshots for Time Travel, running OPTIMIZE or DELETE does not delete the old physical Parquet files from cloud storage; it merely removes them from the active transaction log state. Over months, abandoned historical files consume petabytes of unneeded storage. Running `VACUUM table_name RETAIN 168 HOURS` permanently purges unreferenced files older than 7 days, freeing cloud storage while maintaining time travel within the retention window.",
        "keyPoints": [
            "Permanently purges unreferenced historical Parquet files from cloud storage to control storage costs.",
            "Enforces a default safety retention period of 7 days (168 hours) to prevent deleting files needed by active queries.",
            "Disables Time Travel to commits older than the configured VACUUM retention threshold.",
            "Requires careful coordination: vacuuming too aggressively can cause concurrent read query failures."
        ]
    },
    "Delta Time Travel": {
        "id": "databricks-delta-time-travel",
        "difficulty": "MEDIUM",
        "definition": "Delta Time Travel is the ability to query point-in-time historical snapshots of a Delta table using historical commit versions or timestamps.",
        "explanation": "Because Delta Lake maintains an append-only transaction log referencing immutable Parquet files, previous states of the table remain accessible until purged by VACUUM. Users can query older snapshots using SQL syntax like `SELECT * FROM table TIMESTAMP AS OF '2026-09-01'` or `SELECT * FROM table VERSION AS OF 42`. Time Travel enables auditing historical data, reproducing machine learning training sets, and rolling back accidental data corruptions via `RESTORE TABLE`.",
        "keyPoints": [
            "Queries historical snapshots using VERSION AS OF <version> or TIMESTAMP AS OF <timestamp> syntax.",
            "Enables instant rollback of accidental bad writes or corruptions using RESTORE TABLE target TO VERSION AS OF N.",
            "Guarantees exact reproducibility for machine learning model training datasets.",
            "Accessible as long as underlying historical files have not been permanently purged by VACUUM."
        ]
    },
    "Shallow Clone vs Deep Clone": {
        "id": "databricks-shallow-clone-vs-deep-clone",
        "difficulty": "MEDIUM",
        "definition": "Delta Cloning creates copies of a table: Shallow Clone copies only metadata references with zero data duplication, whereas Deep Clone creates a fully independent physical copy of data and metadata.",
        "explanation": "Delta Clone (`CREATE TABLE target CLONE source`) provides powerful table copying mechanics. `SHALLOW CLONE` copies only the Delta transaction log and references the source table's physical Parquet files. It finishes in seconds and costs almost nothing, making it ideal for testing staging models and ephemeral CI/CD environments. `DEEP CLONE` physically copies all underlying Parquet data files, creating a totally decoupled table suitable for disaster recovery, data migration, and production air-gapping.",
        "keyPoints": [
            "Shallow Clone duplicates only table metadata; reads reference original source data files with zero storage duplication.",
            "Shallow Clones complete near-instantly; ideal for ephemeral testing sandboxes and staging validations.",
            "Deep Clone physically copies all data files, creating a fully autonomous, isolated copy of the source table.",
            "Deep Clones are essential for disaster recovery, cross-region replication, and regulatory data separation."
        ]
    },
    "Medallion Architecture on Databricks": {
        "id": "databricks-medallion-architecture-on-databricks",
        "difficulty": "MEDIUM",
        "definition": "The Medallion Architecture is a lakehouse data design pattern that logically organizes data into Bronze (raw ingestion), Silver (cleaned/conformed), and Gold (curated business marts) quality layers.",
        "explanation": "The Medallion design establishes an incremental refinement lifecycle across the lakehouse. Bronze ingests raw streaming and batch feeds in their original schema, preserving an immutable source of truth. Silver deduplicates, validates, cleanses, and conforms entities into enriched tables with enforced data types. Gold aggregates and models data into star schemas and business-ready dimensional marts optimized for executive BI reporting and ML feature consumption.",
        "keyPoints": [
            "Organizes data into progressive quality tiers: Bronze (raw append), Silver (cleansed/enriched), and Gold (curated marts).",
            "Bronze layer preserves immutable raw historical data, enabling end-to-end replayability.",
            "Silver layer standardizes schemas, eliminates duplicates, and enriches data with referential integrity.",
            "Gold layer provides dimensionally modeled star schemas and high-performance aggregations for business consumption."
        ]
    },
    "MLflow Tracking": {
        "id": "databricks-mlflow-tracking",
        "difficulty": "MEDIUM",
        "definition": "MLflow Tracking is an enterprise logging API and UI for recording machine learning experiment runs, hyperparameters, evaluation metrics, code versions, and serialized model artifacts.",
        "explanation": "Seamlessly embedded in Databricks, MLflow Tracking logs every experiment run via simple Python commands (`mlflow.log_param()`, `mlflow.log_metric()`, `mlflow.autolog()`). Databricks automatically links logged runs to the exact notebook version, Git commit hash, and cluster environment that produced them. Data scientists use the MLflow experiment UI to compare metric curves (e.g. RMSE, AUC) across hundreds of training trials and select champion model candidates.",
        "keyPoints": [
            "Tracks parameters, metrics, code versions, data snapshots, and model artifacts across experiment runs.",
            "Provides automated logging for major ML frameworks (PyTorch, TensorFlow, Scikit-learn, XGBoost) via mlflow.autolog().",
            "Visually compares hyperparameters and loss curves across training trials in the Databricks UI.",
            "Guarantees scientific reproducibility by linking model runs to specific Git commits and data snapshots."
        ]
    },
    "MLflow Model Registry": {
        "id": "databricks-mlflow-model-registry",
        "difficulty": "MEDIUM",
        "definition": "The MLflow Model Registry provides a centralized model store, set of APIs, and UI to collaboratively manage the full lifecycle of MLflow models from development to production deployment.",
        "explanation": "Once a high-performing model is trained, it is registered in the Model Registry. The registry provides chronological model versioning, stage transitions (e.g., Staging, Production, Archived), model approval workflows, and governance annotations. In modern Databricks architectures, Models in Unity Catalog seamlessly unifies machine learning models alongside relational tables, governing model inference permissions using standard SQL GRANT statements.",
        "keyPoints": [
            "Central repository managing model versioning, approval workflows, and production deployment lifecycles.",
            "Supports stage transitions and deployment aliases (e.g. champion, challenger) for automated CI/CD scoring.",
            "Integrated into Unity Catalog (Models in UC) for unified access control and cross-workspace governance.",
            "Underpins Databricks Serverless Model Serving for low-latency real-time REST API inference."
        ]
    },
    "Databricks Feature Store": {
        "id": "databricks-databricks-feature-store",
        "difficulty": "MEDIUM",
        "definition": "The Databricks Feature Store is a centralized catalog that enables data scientists to discover, share, and reuse ML features with guaranteed online/offline consistency.",
        "explanation": "A major challenge in production ML is training-serving skew: calculating features one way in batch training and another way in real-time scoring. The Databricks Feature Store (now integrated as Feature Engineering in Unity Catalog) stores features as Delta tables for offline training and automatically synchronizes them to low-latency key-value stores (e.g., DynamoDB, Cosmos DB) for online inference. It also captures automated lineage from raw data sources through feature tables to trained models.",
        "keyPoints": [
            "Centralizes feature definitions and transformations to eliminate duplicate engineering across ML teams.",
            "Eliminates training-serving skew by providing consistent feature extraction logic across batch and online inference.",
            "Synchronizes Delta offline feature tables to high-speed online stores for sub-millisecond REST serving.",
            "Automatically tracks feature lineage from raw lakehouse ingestion to production model inference."
        ]
    },
    "Photon Engine": {
        "id": "databricks-photon-engine",
        "difficulty": "MEDIUM",
        "definition": "Photon is Databricks' next-generation vectorized query engine written from the ground up in native C++ to deliver high-performance execution of SQL and DataFrame workloads.",
        "explanation": "Traditional Apache Spark execution runs on the Java Virtual Machine (JVM), which suffers from CPU caching inefficiencies, memory garbage collection overhead, and interpreter bloat. Photon replaces Spark's physical execution layer with a native, vectorized C++ engine that executes queries directly on CPU hardware registers and SIMD instructions. Photon dramatically accelerates SQL aggregations, hash joins, and Delta MERGE operations, cutting cloud DBU costs by completing jobs faster.",
        "keyPoints": [
            "Vectorized query execution engine written entirely in native C++ to bypass JVM performance bottlenecks.",
            "Leverages CPU hardware instruction parallelism (SIMD) and modern cache-aware memory management.",
            "Provides 2x-8x performance acceleration for SQL aggregations, scans, and high-frequency Delta MERGE operations.",
            "Transparently compatible with Spark DataFrame and Spark SQL APIs without requiring application code changes."
        ]
    },
    "Databricks SQL Warehouse": {
        "id": "databricks-databricks-sql-warehouse",
        "difficulty": "MEDIUM",
        "definition": "A Databricks SQL Warehouse is a specialized compute resource optimized for SQL workloads, business intelligence queries, and high-concurrency analytical dashboards.",
        "explanation": "Unlike standard data science clusters, SQL Warehouses are purpose-built for SQL. Powered by Photon, they feature instant startup (Serverless), automatic multi-cluster load balancing (scaling clusters up and down to handle bursts of concurrent BI users), and intelligent result caching. Analysts connect BI tools like Power BI, Tableau, and dbt to SQL Warehouses via optimized JDBC/ODBC connectors without managing underlying virtual machine configurations.",
        "keyPoints": [
            "Purpose-built compute engine tailored specifically for BI reporting, dashboarding, and ad-hoc SQL queries.",
            "Features Serverless compute options with sub-second cluster startup and automatic rapid scale-down.",
            "Automatically scales multi-cluster concurrency to absorb traffic spikes from hundreds of simultaneous BI users.",
            "Optimized for external connectivity with native Power BI DirectQuery and Tableau connectors."
        ]
    },
    "Vector Search": {
        "id": "databricks-vector-search",
        "difficulty": "MEDIUM",
        "definition": "Databricks Vector Search is a serverless vector database integrated into Unity Catalog that stores and indexes vector embeddings for real-time similarity search and RAG applications.",
        "explanation": "To build production Retrieval-Augmented Generation (RAG) and generative AI applications, organizations need to index document embeddings alongside tabular enterprise data. Databricks Vector Search automatically indexes embeddings generated from Unity Catalog tables. It supports Delta Sync Indexes (which automatically update the vector index in real-time as source Delta tables update) and exposes ultra-low-latency REST APIs for semantic similarity search.",
        "keyPoints": [
            "Serverless vector database engine governed natively under Unity Catalog security and access controls.",
            "Features Delta Sync Indexes that automatically re-index vectors as underlying Delta tables update.",
            "Provides sub-50ms REST API query latency for semantic similarity search in RAG and GenAI applications.",
            "Integrated with Databricks Foundation Model APIs for automated real-time text-to-embedding generation."
        ]
    },

    # HARD (15)
    "Unity Catalog Fine-Grained Access Control": {
        "id": "databricks-unity-catalog-fine-grained-access-control",
        "difficulty": "HARD",
        "definition": "Fine-Grained Access Control in Unity Catalog enforces cell-level security via Row Filters and Column Masks defined with standard SQL functions.",
        "explanation": "In regulated enterprise environments, different users querying the same physical table must see different subsets of data based on their organizational role or tenant ID. Unity Catalog allows administrators to attach SQL User-Defined Functions (UDFs) directly to tables: Row Filters evaluate `is_account_group_member()` to return only authorized rows, while Column Masks mask sensitive PII (e.g. showing only the last 4 digits of a SSN or hashing emails) based on caller identity.",
        "keyPoints": [
            "Enforces row-level filtering and column-level masking policies directly within the data catalog.",
            "Implemented using standard SQL User-Defined Functions (UDFs) attached via CREATE TABLE or ALTER TABLE.",
            "Evaluates user identity (current_user()) and group membership (is_account_group_member()) dynamically at query time.",
            "Applies consistently across all languages (SQL, Python, R, Scala) and all external BI connectors."
        ]
    },
    "Lakehouse Federation": {
        "id": "databricks-lakehouse-federation",
        "difficulty": "HARD",
        "definition": "Lakehouse Federation allows Unity Catalog to query external operational and analytical databases (Snowflake, BigQuery, PostgreSQL, MySQL, SQL Server) in place without moving data.",
        "explanation": "Instead of building complex ETL pipelines just to join external relational database tables with lakehouse data, Lakehouse Federation allows architects to create a Foreign Catalog in Unity Catalog (`CREATE FOREIGN CATALOG my_pg USING CONNECTION pg_conn`). Databricks pushes filter and projection predicates directly to the external database engine, querying remote databases in real time while enforcing central Unity Catalog governance and auditing.",
        "keyPoints": [
            "Queries external databases (Postgres, Snowflake, BigQuery, SQL Server) in place without ETL data copying.",
            "Mounts external systems as native Foreign Catalogs within Unity Catalog's three-tier namespace.",
            "Pushes compute predicates (filters, joins, projections) down to the remote database to minimize data transfer.",
            "Unifies access control policies and data discovery across fragmented multi-cloud enterprise data estates."
        ]
    },
    "Delta Sharing": {
        "id": "databricks-delta-sharing",
        "difficulty": "HARD",
        "definition": "Delta Sharing is an open, cross-platform protocol for securely sharing live data tables, schemas, and AI models across organizations and clouds without data duplication.",
        "explanation": "Traditional data sharing requires brittle SFTP exports, API downloads, or vendor lock-in to the same cloud data warehouse. Delta Sharing provides an open REST specification: data providers grant access to a Share within Unity Catalog; recipients on any platform (Databricks, Pandas, Apache Spark, Power BI, Excel) query live data directly via signed URLs without copying files. Delta Sharing supports row/column filtering, change data feed sharing, and cross-cloud access.",
        "keyPoints": [
            "Open-source protocol for secure, real-time data sharing across organizations without data duplication.",
            "Allows non-Databricks recipients to consume shared data using open-source Python, Spark, and Power BI connectors.",
            "Eliminates slow, expensive SFTP and custom API export pipelines for external partner data exchanges.",
            "Governed entirely within Unity Catalog with recipient token lifecycle management and detailed access audits."
        ]
    },
    "Databricks Structured Streaming": {
        "id": "databricks-databricks-structured-streaming",
        "difficulty": "HARD",
        "definition": "Databricks Structured Streaming is a scalable stream processing engine built on Spark SQL that processes continuous data streams with micro-batch or continuous processing semantics.",
        "explanation": "Structured Streaming treats incoming data streams as an unbounded append-only table. Developers express streaming transformations using identical DataFrame operations to batch processing. Databricks enhances standard Spark streaming with RocksDB-backed state stores for multi-gigabyte stateful aggregations, asynchronous checkpointing to reduce micro-batch commit latency, and native Delta Lake sink optimization that delivers end-to-end exactly-once guarantees.",
        "keyPoints": [
            "Unifies batch and streaming APIs: identical DataFrame code processes real-time streams and static files.",
            "Provides end-to-end exactly-once fault-tolerant processing semantics backed by Delta Lake sinks.",
            "Leverages RocksDB state store providers to scale arbitrary stateful streaming operations to millions of keys.",
            "Features Trigger.AvailableNow for cost-effective micro-batch processing of accumulated streaming data."
        ]
    },
    "Spark Connect": {
        "id": "databricks-spark-connect",
        "difficulty": "HARD",
        "definition": "Spark Connect is a decoupled client-server architecture for Apache Spark that enables thin clients and IDEs to execute Spark DataFrame queries via a lightweight gRPC protocol.",
        "explanation": "Historically, using PySpark locally required installing a full Java runtime, Hadoop binaries, and Spark distribution on the client machine, creating version mismatches and security headaches. Spark Connect separates Spark into a lightweight client and a remote server. The client builds an unresolved logical query plan, serializes it via Protocol Buffers, and sends it over gRPC to the remote Databricks cluster for execution, enabling instant IDE integration (VS Code, Jupyter) with zero local Java dependencies.",
        "keyPoints": [
            "Decouples client applications from the Spark driver using a modern Protocol Buffer and gRPC architecture.",
            "Eliminates the requirement for local Java (JVM), Python version parity, and Spark installations on client laptops.",
            "Enables seamless remote interactive debugging from modern IDEs like Visual Studio Code and PyCharm.",
            "Forms the core foundation for Databricks Connect v2 and modern lightweight analytics toolchains."
        ]
    },
    "Serverless Compute (Databricks)": {
        "id": "databricks-serverless-compute-databricks",
        "difficulty": "HARD",
        "definition": "Serverless Compute is an on-demand, fully managed compute architecture in Databricks that boots clusters in seconds and scales resources instantaneously within Databricks-managed cloud accounts.",
        "explanation": "In traditional Databricks architectures, clusters run on VMs provisioned inside the customer's cloud VPC, requiring 3-7 minutes of cloud VM initialization time before queries can run. Serverless compute utilizes pre-warmed, secure container pools running in the Databricks cloud plane. Workloads (SQL Warehouses, Notebooks, Jobs, DLT) start in less than 5 seconds, auto-scale dynamically during query bursts, and shut down immediately when idle, slashing costs and operational friction.",
        "keyPoints": [
            "Instantly provisions compute from pre-warmed container fleets in seconds, eliminating 5-minute VM spin-up times.",
            "Features aggressive zero-scale auto-termination, saving significant cloud costs during intermittent query gaps.",
            "Available across Databricks SQL, interactive notebooks, automated workflows, and Delta Live Tables.",
            "Eliminates infrastructure management: no VPC quotas, VM SKU shortages, or manual cluster sizing needed."
        ]
    },
    "Databricks Asset Bundles (DABs)": {
        "id": "databricks-databricks-asset-bundles-dabs",
        "difficulty": "HARD",
        "definition": "Databricks Asset Bundles (DABs) is an Infrastructure-as-Code (IaC) framework that allows developers to define, test, and deploy entire Databricks projects using version-controlled YAML configurations.",
        "explanation": "DABs standardizes enterprise software engineering practices for Databricks. Instead of manually clicking in the UI to configure jobs, clusters, and DLT pipelines, developers define all assets in modular YAML files alongside source code in Git. Using the Databricks CLI (`databricks bundle deploy`), teams deploy projects to isolated development sandboxes and promote them through CI/CD pipelines to staging and production with automated permission and environment variable substitution.",
        "keyPoints": [
            "Infrastructure-as-Code (IaC) framework tailored specifically for managing Databricks workflows and resources.",
            "Defines jobs, pipelines, permissions, and compute settings declaratively in version-controlled YAML files.",
            "Automates multi-environment promotions (dev, staging, prod) within enterprise CI/CD pipelines (GitHub Actions, Azure DevOps).",
            "Validates asset configurations locally before deployment, catching syntax and configuration errors early."
        ]
    },
    "SCIM Provisioning": {
        "id": "databricks-scim-provisioning",
        "difficulty": "HARD",
        "definition": "SCIM (System for Cross-domain Identity Management) Provisioning automatically synchronizes users, service principals, and security groups from enterprise identity providers to Databricks.",
        "explanation": "Manually creating user accounts and assigning groups in multi-workspace Databricks environments creates administrative overhead and security vulnerabilities during employee offboarding. Databricks implements the SCIM open standard: corporate identity providers (Microsoft Entra ID/Azure AD, Okta) push user creations, group memberships, and account deactivations to Databricks account-level Unity Catalog in real time, guaranteeing centralized access governance.",
        "keyPoints": [
            "Automates real-time identity synchronization from enterprise IdPs (Microsoft Entra ID, Okta) via SCIM protocol.",
            "Centrally manages user lifecycle: revoking an employee's corporate account instantly terminates their Databricks access.",
            "Synchronizes nested security groups to enforce consistent access privileges across workspaces.",
            "Underpins account-level identity federation required for enterprise Unity Catalog deployments."
        ]
    },
    "Audit Logging": {
        "id": "databricks-audit-logging",
        "difficulty": "HARD",
        "definition": "Audit Logging captures, records, and exports detailed security audit trails of all user and system activities occurring across Databricks workspaces and Unity Catalog.",
        "explanation": "Enterprise compliance frameworks (SOC2, HIPAA, ISO27001) mandate comprehensive auditing of who accessed what data and when. Databricks audit logs capture every API call, notebook execution, cluster creation, login attempt, and SQL table query. In modern Unity Catalog architectures, audit logs are delivered natively as clean Delta tables within the `system.access.audit` system tables schema, allowing security teams to query access logs directly with SQL.",
        "keyPoints": [
            "Records granular audit telemetry for every user action, API call, permission change, and query execution.",
            "Delivered natively as queryable Delta tables within the system.access.audit catalog schema in Unity Catalog.",
            "Enables automated compliance reporting and real-time security alerting for anomalous data access patterns.",
            "Integrates with enterprise SIEM platforms (Splunk, Microsoft Sentinel) for centralized enterprise security monitoring."
        ]
    },
    "DLT Expectations": {
        "id": "databricks-dlt-expectations",
        "difficulty": "HARD",
        "definition": "DLT Expectations are declarative data quality assertions applied to Delta Live Tables that validate incoming records and govern pipeline behavior upon data quality violations.",
        "explanation": "DLT Expectations allow engineers to embed data quality rules directly into pipeline definitions using familiar SQL predicates (`@dlt.expect('valid_amount', 'amount > 0')`). DLT provides three distinct failure action behaviors: `expect` (tracks violations in event logs but allows records to pass), `expect_or_drop` (drops failing records silently), and `expect_or_fail` (fails the entire pipeline immediately). Metrics are recorded in the DLT event log for real-time quality dashboards.",
        "keyPoints": [
            "Declarative data quality framework embedded within Delta Live Tables pipelines.",
            "Defines validation rules using SQL boolean expressions (e.g., expect_or_drop('valid_email', 'email IS NOT NULL')).",
            "Provides three distinct action strategies: retain with warning, drop invalid records, or fail the pipeline immediately.",
            "Logs row-level validation metrics to the DLT event log for automated data quality monitoring and SLAs."
        ]
    },
    "Predictive Optimization": {
        "id": "databricks-predictive-optimization",
        "difficulty": "HARD",
        "definition": "Predictive Optimization is an automated AI-driven service in Databricks that intelligently schedules OPTIMIZE and VACUUM maintenance operations on Unity Catalog managed tables.",
        "explanation": "Historically, data engineers had to manually guess when to schedule OPTIMIZE and VACUUM jobs, frequently either wasting compute by optimizing too often or suffering degraded query performance by optimizing too rarely. Predictive Optimization uses machine learning to monitor query patterns, small file generation rates, and storage footprints. When cost-effective, Databricks automatically launches serverless compute to compact files and purge orphaned data with zero manual engineering effort.",
        "keyPoints": [
            "AI-powered automated maintenance service managed natively by Unity Catalog.",
            "Automatically determines the optimal schedule for running OPTIMIZE file compaction and VACUUM cleanup.",
            "Eliminates manual maintenance DAGs and cron scripts previously authored by data engineering teams.",
            "Balances warehouse query performance gains against the compute cost of running optimization operations."
        ]
    },
    "Unity Catalog System Tables": {
        "id": "databricks-unity-catalog-system-tables",
        "difficulty": "HARD",
        "definition": "Unity Catalog System Tables are analytical Delta tables hosted in the system catalog that expose operational metadata, cost telemetry, query history, and data lineage.",
        "explanation": "System tables represent Databricks' transition toward making the lakehouse completely observable using standard SQL. Accessible via the `system` catalog, key schemas include: `system.billing.usage` (records minute-by-minute DBU consumption tagged by cluster, user, and job), `system.access.audit` (security audit logs), and `system.access.table_lineage` (column-level data lineage). Financial controllers and platform engineers build automated cost-attribution dashboards directly against these tables.",
        "keyPoints": [
            "Exposes platform operational telemetry, cost data, and audit logs as queryable Delta tables in the system catalog.",
            "system.billing.usage provides granular DBU consumption metrics for automated chargeback and cost governance.",
            "system.access.table_lineage maps automated end-to-end data lineage across the enterprise estate.",
            "Enables building automated SQL alerts for budget overruns, orphaned compute, and suspicious access spikes."
        ]
    },
    "Liquid Clustering": {
        "id": "databricks-liquid-clustering",
        "difficulty": "HARD",
        "definition": "Liquid Clustering is Databricks' next-generation data layout technology that dynamically clusters Delta tables without the rigid limitations of traditional partitioning and Z-Ordering.",
        "explanation": "Traditional table partitioning is static and unforgiving: choosing the wrong partition key creates the small file problem, and changing partition keys requires a complete table rewrite. Z-Ordering is expensive to maintain on high-frequency write tables. Liquid Clustering (`CLUSTER BY (col1, col2)`) replaces both paradigms: it clusters data incrementally as data is written, supports changing clustering keys on the fly without rewriting data, and provides superior query data skipping.",
        "keyPoints": [
            "Next-generation data layout engine replacing traditional table partitioning and static Z-Ordering.",
            "Enables changing clustering columns over time without requiring expensive full-table data rewrites.",
            "Clusters data incrementally during write and optimization operations, avoiding heavy multi-hour Z-Order jobs.",
            "Supports up to 4 clustering keys across high-cardinality and low-cardinality columns simultaneously."
        ]
    },
    "Serverless DLT": {
        "id": "databricks-serverless-dlt",
        "difficulty": "HARD",
        "definition": "Serverless DLT executes Delta Live Tables pipelines on instant, fully managed serverless compute clusters operated within the Databricks cloud control plane.",
        "explanation": "Traditional DLT pipelines run on classical job clusters provisioned inside customer cloud VPCs, incurring cluster startup delays and requiring platform teams to manage VM quotas. Serverless DLT executes pipelines on pre-warmed serverless compute pools. Pipelines spin up in seconds, scale compute nodes instantaneously during streaming spikes, and automatically optimize cluster sizing without requiring users to select VM instance types or configure worker node minimums and maximums.",
        "keyPoints": [
            "Runs Delta Live Tables pipelines on instant, fully managed serverless compute pools.",
            "Slashes pipeline startup latency from minutes to seconds, improving real-time streaming SLAs.",
            "Dynamically scales compute resources up and down based on real-time data ingestion backlogs.",
            "Eliminates cloud VM quota management, driver node sizing, and cloud provider infrastructure maintenance."
        ]
    },
    "Databricks Connect v2": {
        "id": "databricks-databricks-connect-v2",
        "difficulty": "HARD",
        "definition": "Databricks Connect v2 is a client library built on Spark Connect that allows developers to run PySpark code from local IDEs directly against remote Databricks compute clusters.",
        "explanation": "Legacy Databricks Connect v1 was notoriously difficult to maintain because local client machines had to match the exact minor version of Spark, Java, and Python installed on the remote cluster. Databricks Connect v2 leverages the Spark Connect gRPC protocol: developers install a lightweight pip package (`pip install databricks-connect`), authenticate via personal access token, and run PySpark scripts in local VS Code or PyCharm environments with full interactive breakpoint step-through debugging.",
        "keyPoints": [
            "Enables local IDE development (VS Code, PyCharm) executing against remote Databricks clusters over gRPC.",
            "Built on modern Spark Connect architecture, eliminating local Java (JVM) and Hadoop installation dependencies.",
            "Supports step-through line-by-line interactive debugging of distributed PySpark transformations locally.",
            "Integrates into local developer workflows, automated unit testing frameworks (pytest), and CI/CD runners."
        ]
    },

    # ARCHITECT (15)
    "Databricks Lakehouse vs Snowflake": {
        "id": "databricks-databricks-lakehouse-vs-snowflake",
        "difficulty": "ARCHITECT",
        "definition": "The enterprise architectural evaluation comparing Databricks' open, compute-flexible lakehouse platform against Snowflake's proprietary, SQL-centric cloud data warehouse platform.",
        "explanation": "While both platforms have converged toward unified data estates, their architectural foundations differ fundamentally. Databricks is built on open storage formats (Delta Lake, Apache Parquet, Iceberg) and polyglot compute (Python, PySpark, SQL, Scala), excelling at large-scale unstructured data, streaming, and end-to-end machine learning. Snowflake is traditionally a proprietary SQL data warehouse optimized for simplicity and high-concurrency BI reporting. Architects evaluate TCO, open data sovereignty, and AI/ML workloads.",
        "keyPoints": [
            "Databricks is rooted in open formats (Delta Lake/Parquet) and polyglot compute (Spark/Python/SQL/ML).",
            "Snowflake is historically rooted in proprietary storage with a managed SQL-first data warehouse user experience.",
            "Databricks excels at petabyte-scale unstructured data processing, streaming, and generative AI/ML workloads.",
            "Snowflake traditionally excels at turnkey SaaS administration, predictable SQL concurrency, and data marketplace sharing."
        ]
    },
    "Unity Catalog Multi-Workspace Topology": {
        "id": "databricks-unity-catalog-multi-workspace-topology",
        "difficulty": "ARCHITECT",
        "definition": "An enterprise architecture design that connects multiple environment- or business-unit-specific workspaces to a single regional Unity Catalog metastore.",
        "explanation": "Large enterprises separate workloads across multiple Databricks workspaces (e.g., Development, Staging, Production, and domain workspaces for Finance and Marketing) to enforce security and isolation. In modern Unity Catalog architecture, all workspaces within a cloud region link to a single central Unity Catalog metastore. Catalogs are assigned workspace binding rules, ensuring production data can never be read or overwritten by development workspaces while centralizing security governance.",
        "keyPoints": [
            "Connects multiple specialized workspaces (dev, staging, prod, finance) to a single regional UC metastore.",
            "Enforces Workspace Binding policies to restrict sensitive production catalogs strictly to production workspaces.",
            "Centralizes corporate identity, access auditing, and data governance policies at the account level.",
            "Enables cross-workspace data sharing and lineage tracking without creating duplicate data pipelines."
        ]
    },
    "DBU Cost Governance": {
        "id": "databricks-dbu-cost-governance",
        "difficulty": "ARCHITECT",
        "definition": "The architectural framework and operational policies used to monitor, allocate, forecast, and optimize Databricks Unit (DBU) consumption and cloud infrastructure costs.",
        "explanation": "Databricks software compute is billed in Databricks Units (DBUs), layered on top of underlying cloud VM and storage costs. Robust DBU cost governance combines technical controls (mandatory cluster policies, aggressive auto-termination limits, favoring Job clusters over all-purpose clusters), architectural choices (Photon optimization, serverless auto-scaling), and financial tagging. System tables (`system.billing.usage`) feed automated cost allocation models that charge consumption back to specific business units.",
        "keyPoints": [
            "Establishes organizational guardrails and cluster policies to eliminate idle and over-provisioned cloud compute.",
            "Enforces the use of ephemeral Job clusters (cheaper DBU tier) over interactive All-Purpose clusters for ETL.",
            "Queries system.billing.usage system tables to power real-time departmental chargeback dashboards.",
            "Implements automated anomaly detection to alert platform owners when daily DBU burn rates exceed budget thresholds."
        ]
    },
    "Multi-Cloud Databricks Deployment": {
        "id": "databricks-multi-cloud-databricks-deployment",
        "difficulty": "ARCHITECT",
        "definition": "An enterprise deployment pattern operating Databricks across multiple cloud providers (AWS, Azure, GCP) while maintaining unified governance and consistent CI/CD pipelines.",
        "explanation": "Global enterprises often operate across multiple cloud providers due to acquisitions, geographic compliance laws, or vendor redundancy strategies. Databricks provides a uniform runtime API and management interface across AWS, Azure, and GCP. Architects maintain multi-cloud consistency by using Terraform or DABs for infrastructure provisioning, Delta Sharing for secure cross-cloud data replication, and cloud-agnostic Delta Lake formats that prevent lock-in to proprietary cloud storage layers.",
        "keyPoints": [
            "Delivers an identical data engineering and ML developer experience across AWS, Azure, and Google Cloud.",
            "Standardizes infrastructure deployments using cloud-agnostic Infrastructure as Code (Terraform, DABs).",
            "Leverages Delta Sharing to synchronize data assets across cloud boundaries without proprietary ETL connectors.",
            "Preserves open data sovereignty: underlying storage remains open Parquet and Delta Lake in customer-owned buckets."
        ]
    },
    "Databricks + dbt Integration": {
        "id": "databricks-databricks---dbt-integration",
        "difficulty": "ARCHITECT",
        "definition": "The production architecture pairing dbt with Databricks SQL Serverless and Unity Catalog, leveraging the dbt-databricks adapter for high-performance lakehouse transformations.",
        "explanation": "Pairing dbt with Databricks SQL creates an analytics engineering pipeline that combines dbt's version-controlled modular modeling with the vectorized performance of Databricks' Photon engine. Workloads execute on serverless SQL warehouses, starting instantly without VM boot overhead. Unity Catalog provides fine-grained governance across the three-tier namespace, while dbt models leverage Delta Lake features like Liquid Clustering, Change Data Feed, and automated table constraints.",
        "keyPoints": [
            "Utilizes the dbt-databricks adapter connected to Databricks SQL Serverless for instant, elastic compute.",
            "Deploys models directly into Unity Catalog's three-tier hierarchy (catalog.schema.table) with full RBAC.",
            "Leverages advanced Delta Lake optimizations including Liquid Clustering and Change Data Feed natively in dbt SQL.",
            "Integrates into enterprise CI/CD using Slim CI to test strictly modified dbt models against production lakehouses."
        ]
    },
    "Databricks Workflows vs Airflow": {
        "id": "databricks-databricks-workflows-vs-airflow",
        "difficulty": "ARCHITECT",
        "definition": "The architectural decision framework comparing native Databricks Workflows with external general-purpose orchestrators like Apache Airflow.",
        "explanation": "Databricks Workflows is fully managed, requires zero infrastructure setup, offers native integration with all Databricks task types, and provides cost-effective ephemeral cluster management. However, its orchestration scope is largely bounded to the Databricks ecosystem. Apache Airflow is a cross-platform orchestrator capable of coordinating complex enterprise pipelines spanning Databricks, external relational databases, Salesforce, Kafka, and Kubernetes. Architects often deploy a hybrid model: Airflow orchestrates cross-system dependencies, while Workflows handles intensive lakehouse transformations.",
        "keyPoints": [
            "Databricks Workflows offers turnkey, zero-maintenance orchestration deeply optimized for Databricks tasks.",
            "Apache Airflow provides broader multi-platform orchestration across heterogeneous enterprise IT systems.",
            "Workflows provides native UI monitoring, automatic job cluster reuse, and seamless DLT integration.",
            "Common enterprise hybrid pattern: Airflow orchestrates cross-system ingress/egress, delegating compute to Workflows."
        ]
    },
    "Petabyte-Scale ELT on Databricks": {
        "id": "databricks-petabyte-scale-elt-on-databricks",
        "difficulty": "ARCHITECT",
        "definition": "The architectural principles and tuning strategies required to ingest, transform, and merge petabyte-scale data volumes on Databricks with predictable SLAs.",
        "explanation": "Processing petabytes of data requires overcoming distributed computing bottlenecks: data skew, garbage collection pauses, and shuffle spills. Key architectural patterns include: using Auto Loader with cloud notification queues for ingestion; implementing Liquid Clustering to eliminate massive partition skew; tuning shuffle partitions dynamically with Adaptive Query Execution (AQE); using broadcast joins strictly for tables <100MB; and optimizing incremental MERGE queries by providing explicit partition pruning filters in join predicates.",
        "keyPoints": [
            "Utilizes Auto Loader in file-notification mode to ingest billions of files without directory listing timeouts.",
            "Applies Liquid Clustering to ensure uniform data distribution and maximize query partition skipping.",
            "Configures Spark Adaptive Query Execution (AQE) to dynamically coalesce shuffle partitions and mitigate key skew.",
            "Tunes Delta Lake MERGE operations with partition pruning predicates to restrict scan boundaries to modified partitions."
        ]
    },
    "Data Mesh on Databricks": {
        "id": "databricks-data-mesh-on-databricks",
        "difficulty": "ARCHITECT",
        "definition": "An architectural implementation of the Data Mesh paradigm on Databricks, treating data as a product owned by decentralized domain teams governed by Unity Catalog.",
        "explanation": "Rather than routing all data requests through a centralized bottleneck data engineering team, Data Mesh decentralizes ownership: individual domain teams (e.g. Payments, Logistics) own and operate their data products. Unity Catalog serves as the federated governance layer: each domain owns dedicated Catalogs, defines strict schemas and data contracts, and exposes clean Gold tables as data products to other domains via fine-grained access grants and Delta Sharing.",
        "keyPoints": [
            "Deconstructs monolithic data platforms into autonomous, domain-owned analytical data products.",
            "Uses Unity Catalog Catalogs to represent distinct business domains with decentralized administrative ownership.",
            "Enforces formal data contracts and schema validation on data products published for cross-domain consumption.",
            "Provides a global data catalog and automated cross-domain lineage via Unity Catalog Data Explorer."
        ]
    },
    "Governance with Unity Catalog + Purview": {
        "id": "databricks-governance-with-unity-catalog---purview",
        "difficulty": "ARCHITECT",
        "definition": "The enterprise governance integration between Databricks Unity Catalog and Microsoft Purview, unifying lakehouse metadata with company-wide data governance.",
        "explanation": "While Unity Catalog governs all assets within the Databricks lakehouse, large enterprises utilize Microsoft Purview as their overarching enterprise data catalog across SQL Server, SAP, Oracle, and Power BI. Integrating Unity Catalog with Purview via Apache Atlas APIs or native metadata bridges ensures that Databricks schemas, classifications, and lineage are automatically synchronized into the enterprise Purview catalog, providing unified governance and compliance reporting across the entire IT estate.",
        "keyPoints": [
            "Unifies lakehouse-specific governance (Unity Catalog) with enterprise-wide data cataloging (Microsoft Purview).",
            "Synchronizes metadata, data classifications, and column-level lineage into Purview via Apache Atlas API bridges.",
            "Enables corporate compliance teams to enforce unified data retention and privacy policies across all platforms.",
            "Bridges data discovery between analytical lakehouse assets and operational source systems."
        ]
    },
    "Databricks MLOps Platform": {
        "id": "databricks-databricks-mlops-platform",
        "difficulty": "ARCHITECT",
        "definition": "An end-to-end Machine Learning Operations (MLOps) architecture on Databricks encompassing automated feature engineering, experiment tracking, model registry, and serverless model serving.",
        "explanation": "Databricks unifies the entire machine learning lifecycle on the lakehouse platform. Feature tables are engineered using Spark and tracked in Unity Catalog; experiment trials log metrics and models to MLflow; models undergo automated CI/CD testing and are registered with production aliases; and Serverless Model Serving deploys registered models as auto-scaling REST endpoints. Lakehouse monitoring tracks prediction drift and data quality shifts in real time.",
        "keyPoints": [
            "Unifies the complete ML lifecycle: Data Ingestion -> Feature Store -> Training -> Model Registry -> Model Serving.",
            "Leverages MLflow and Unity Catalog to enforce model governance, approval workflows, and lineage tracking.",
            "Deploys models to Databricks Serverless Real-Time Serving with sub-50ms latency and automated scaling.",
            "Integrates Lakehouse Monitoring to detect data drift, concept drift, and model performance degradation in production."
        ]
    },
    "Real-Time Lakehouse Architecture": {
        "id": "databricks-real-time-lakehouse-architecture",
        "difficulty": "ARCHITECT",
        "definition": "A unified lakehouse architecture that processes high-frequency real-time event streams (Kafka, Event Hubs) with sub-second to minute-level latency directly into Delta Lake.",
        "explanation": "Historically, organizations maintained separate Lambda architectures: a streaming speed layer (Apache Flink, Storm) and an offline batch layer (Hadoop, Snowflake). Databricks eliminates Lambda architectures by combining Apache Kafka/Event Hubs with Structured Streaming and Delta Lake. Events land in Bronze Delta tables in near real-time, pass through incremental Silver transformations using Change Data Feed, and serve low-latency operational analytics from Gold tables without dual-pipeline maintenance.",
        "keyPoints": [
            "Eliminates complex Lambda architectures by unifying real-time streaming and historical batch on Delta Lake.",
            "Ingests high-throughput streaming events from Kafka or Azure Event Hubs directly into Bronze Delta tables.",
            "Leverages RocksDB state stores and incremental micro-batches to achieve sub-minute end-to-end data freshness.",
            "Enforces ACID consistency and exactly-once processing guarantees across concurrent real-time writers and readers."
        ]
    },
    "CI/CD for Databricks with DABs": {
        "id": "databricks-ci-cd-for-databricks-with-dabs",
        "difficulty": "ARCHITECT",
        "definition": "The continuous integration and continuous deployment (CI/CD) architecture for Databricks using Databricks Asset Bundles (DABs) and Git automation pipelines.",
        "explanation": "Modern Databricks engineering mandates that no code or cluster configuration is deployed manually through the web UI. Using Databricks Asset Bundles (DABs), teams define workflows, notebooks, libraries, and permissions as code in Git. When pull requests are created, GitHub Actions or Azure DevOps runs unit tests with Databricks Connect and validates bundle syntax (`databricks bundle validate`). Upon merge, the CI/CD pipeline deploys the bundle to production with environment-specific service principal credentials.",
        "keyPoints": [
            "Enforces automated Infrastructure-as-Code deployment workflows using Databricks Asset Bundles (DABs).",
            "Integrates into GitHub Actions or Azure DevOps with multi-stage approval gates (dev -> staging -> prod).",
            "Executes automated unit and integration tests using Databricks Connect before code merge.",
            "Deploys production jobs authenticated via cloud Service Principals rather than individual user credentials."
        ]
    },
    "Disaster Recovery for Databricks": {
        "id": "databricks-disaster-recovery-for-databricks",
        "difficulty": "ARCHITECT",
        "definition": "The disaster recovery (DR) architecture for Databricks ensuring business continuity, minimal RPO, and near-zero RTO during regional cloud infrastructure outages.",
        "explanation": "Architecting DR for Databricks requires addressing both the control plane (workspace assets, jobs, notebooks) and the data plane (Delta tables, metastore). Architects implement Active-Passive or Active-Active topologies across paired cloud regions. Primary data storage accounts replicate to secondary regions using geo-redundant storage (GRS) or Delta Deep Clone. Databricks Asset Bundles (DABs) and Terraform ensure that identical workspace configurations, jobs, and cluster policies can be deployed to the recovery region within minutes.",
        "keyPoints": [
            "Defines regional failover architectures balancing Recovery Point Objective (RPO) and Recovery Time Objective (RTO).",
            "Replicates critical Delta tables across regions using Delta Deep Clone or cloud storage geo-replication.",
            "Maintains synchronized workspace infrastructure, jobs, and policies in secondary regions using Terraform/DABs.",
            "Leverages Unity Catalog multi-workspace regional configurations to enable rapid traffic cutover during outages."
        ]
    },
    "Databricks for Data Products": {
        "id": "databricks-databricks-for-data-products",
        "difficulty": "ARCHITECT",
        "definition": "The methodology and platform architecture for engineering, publishing, documenting, and monetizing curated data products on Databricks.",
        "explanation": "In product-centric data architectures, data is not treated as a passive byproduct of applications, but as a formal product with defined SLAs, documentation, consumers, and ownership. On Databricks, Data Products are encapsulated within Unity Catalog catalogs or schemas. Each data product features automated schema contracts, defined SLOs tracked via Lakehouse Monitoring, interactive documentation in Data Explorer, and governed distribution to internal and external consumers via Delta Sharing.",
        "keyPoints": [
            "Transforms raw analytical data into governed, discoverable, and consumer-centric Data Products.",
            "Enforces data quality contracts, schema versioning, and Service Level Objectives (SLOs) on published datasets.",
            "Provides self-service discovery and business documentation directly within Unity Catalog Data Explorer.",
            "Distributes data products seamlessly to internal departments and external partners using open Delta Sharing."
        ]
    },
    "Unity Catalog Enterprise Governance": {
        "id": "databricks-unity-catalog-enterprise-governance",
        "difficulty": "ARCHITECT",
        "definition": "The enterprise governance operating model for Unity Catalog encompassing account-level identity management, catalog segregation, classification tagging, and regulatory audit compliance.",
        "explanation": "Enterprise governance with Unity Catalog establishes standard operating procedures for multi-national organizations. Architects design a tiered catalog taxonomy (e.g., `prod_finance`, `prod_marketing`), enforce least-privilege security roles (Metastore Admin, Catalog Owner, Data Reader), implement automated classification tags (PII, Financial, Restricted), and route access request approvals through enterprise identity workflows (ServiceNow). Continuous compliance is audited via native Unity Catalog system tables.",
        "keyPoints": [
            "Establishes a standardized enterprise catalog hierarchy and role-based access control (RBAC) governance framework.",
            "Enforces automated metadata classification tagging (PII, confidential, GDPR) across tables and columns.",
            "Leverages Unity Catalog system tables (system.access.audit) for continuous compliance auditing and monitoring.",
            "Integrates with enterprise identity providers via SCIM to maintain synchronized access revocation across the enterprise."
        ]
    }
}

print(f"Loaded {len(databricks_data)} Databricks concepts.")
