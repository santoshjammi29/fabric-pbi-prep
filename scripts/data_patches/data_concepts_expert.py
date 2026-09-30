# data_concepts_expert.py
import json

dbt_data = {
    # EASY (12)
    "dbt Model": {
        "id": "dbt-dbt-model",
        "difficulty": "EASY",
        "definition": "A dbt model is a single SQL SELECT statement defined in a .sql file that compiles and materializes a table, view, or incremental dataset in the data warehouse.",
        "explanation": "In dbt, models are the primary building blocks of the data transformation layer. Rather than writing procedural DDL (CREATE TABLE/VIEW) or DML (INSERT/UPDATE), engineers author pure, declarative SELECT queries. dbt inspects model files, resolves dependencies declared via `ref()` functions, compiles Jinja wrappers into database-native SQL, and executes the transformation within the warehouse compute engine.",
        "keyPoints": [
            "Authored as declarative SQL SELECT statements stored inside the models/ project directory.",
            "Materialized automatically by dbt as tables, views, ephemeral CTEs, or incremental datasets.",
            "Eliminates boilerplate DDL/DML, shifting schema creation and transaction management to the dbt compiler.",
            "Supports version control, code review, automated testing, and CI/CD promotion in Git."
        ]
    },
    "dbt Source": {
        "id": "dbt-dbt-source",
        "difficulty": "EASY",
        "definition": "A dbt source represents an external raw table loaded by an ingestion tool (e.g. Fivetran, Airbyte) that is registered in dbt using YAML configuration files.",
        "explanation": "Sources formalize the boundary between raw ingested data and downstream transformation models. Defined in `models/sources.yml`, sources declare database, schema, and table names, enabling lineage tracking from ingestion through analytical marts. Models query sources using the `{{ source('source_name', 'table_name') }}` macro rather than hardcoded table identifiers, allowing seamless switching across development, staging, and production environments.",
        "keyPoints": [
            "Declares raw ingested database tables inside YAML files to establish clear pipeline lineage boundaries.",
            "Queried in models using the {{ source('source_name', 'table_name') }} macro instead of hardcoded paths.",
            "Supports source freshness monitoring to detect lagging ingestion pipelines before models run.",
            "Enables environment isolation by resolving database prefixes dynamically across dev and prod."
        ]
    },
    "ref() Function": {
        "id": "dbt-ref-function",
        "difficulty": "EASY",
        "definition": "The ref() function is dbt's core interpolation macro used to reference other models within a project, automatically building the Directed Acyclic Graph (DAG) of dependencies.",
        "explanation": "Using `{{ ref('model_name') }}` inside a SQL model achieves two critical outcomes: first, it interpolates the fully qualified schema and table name in the target environment (e.g., `analytics_dev.stg_orders` in dev, `analytics_prod.stg_orders` in prod); second, it informs the dbt compiler of upstream dependencies. dbt parses all `ref()` calls to determine the exact topological execution order required to build models concurrently without race conditions.",
        "keyPoints": [
            "Interpolates fully qualified database and schema identifiers according to active environment targets.",
            "Builds the project's dependency DAG, allowing dbt to determine optimal parallel execution ordering.",
            "Replaces brittle hardcoded table references with dynamic, environment-aware model pointers.",
            "Enables selective downstream and upstream graph executions using CLI flags like dbt run --select +model_name+."
        ]
    },
    "dbt Seed": {
        "id": "dbt-dbt-seed",
        "difficulty": "EASY",
        "definition": "A dbt seed is a static CSV file placed in the seeds/ directory that dbt loads directly into the data warehouse as a version-controlled lookup table.",
        "explanation": "Seeds are designed for static, rarely changing reference data such as country code mappings, marketing campaign categorization keys, or postal code lookups. Running `dbt seed` parses the CSV files, generates CREATE TABLE statements, and executes batch inserts. Because CSVs are committed directly to Git, reference data changes follow the same review and audit workflows as application code. Seeds should never be used for large, high-frequency transaction data.",
        "keyPoints": [
            "Version-controlled CSV files stored in seeds/ and loaded into the warehouse via dbt seed.",
            "Ideal for static mapping tables, country codes, tax brackets, and business lookup dimensions.",
            "Committed directly into Git repositories, ensuring full auditability and change reviews.",
            "Not suitable for high-volume transactional data (recommended for datasets <10,000 rows)."
        ]
    },
    "Generic Tests": {
        "id": "dbt-generic-tests",
        "difficulty": "EASY",
        "definition": "Generic tests are parameterized, reusable schema validation tests defined in YAML that assert data quality constraints against columns or models.",
        "explanation": "dbt includes four out-of-the-box generic tests: `unique`, `not_null`, `accepted_values`, and `relationships` (foreign key integrity). Declared under the `columns:` block in `.yml` files, dbt compiles these assertions into queries that count failing rows (e.g., `SELECT count(*) FROM table WHERE col IS NULL`). If the query returns a count greater than 0, the test fails. Generic tests can also be extended by writing custom test macros or importing community packages like `dbt-expectations`.",
        "keyPoints": [
            "Four built-in assertions: unique, not_null, accepted_values, and relationships.",
            "Defined declaratively within schema YAML configuration files alongside model documentation.",
            "Executed via dbt test or dbt build; queries count failing records and return non-zero exit codes on breach.",
            "Supports severity thresholds (warn vs error) to prevent pipeline aborts on non-critical data quality anomalies."
        ]
    },
    "Table Materialization": {
        "id": "dbt-table-materialization",
        "difficulty": "EASY",
        "definition": "Table materialization rebuilds the target model as a physical relational table in the data warehouse on every dbt run using CREATE TABLE AS SELECT (CTAS) logic.",
        "explanation": "Configuring `{{ config(materialized='table') }}` tells dbt to persist query results physically on disk. On each execution, dbt typically creates a temporary staging table, drops the old table, and renames the new table atomically (or swaps tables) to prevent query downtime for downstream BI users. Physical tables provide superior read query performance for business intelligence dashboards compared to views, but incur compute and storage write overhead during ETL runs.",
        "keyPoints": [
            "Physically persists transformed data on warehouse storage via CREATE TABLE AS SELECT (CTAS) operations.",
            "Drastically optimizes read performance for downstream BI tools, dashboards, and reporting consumers.",
            "Uses atomic table swaps/renames during execution to prevent read downtime for active analytical queries.",
            "Incurs higher warehouse compute runtime and storage costs compared to lightweight virtual views."
        ]
    },
    "View Materialization": {
        "id": "dbt-view-materialization",
        "difficulty": "EASY",
        "definition": "View materialization defines the model as a virtual database view using CREATE VIEW AS SELECT, storing only the SQL query definition without persisting physical data.",
        "explanation": "View is dbt's default materialization strategy. Because views do not physically duplicate data on warehouse disks, `dbt run` finishes almost instantaneously with minimal compute expenditure. Views guarantee that downstream queries always read the freshest underlying data. However, for complex queries with multi-table joins or window functions, querying views on large datasets introduces high query latency and repeated compute charges in Snowflake or BigQuery.",
        "keyPoints": [
            "Default dbt materialization; compiles models into standard virtual database views (CREATE VIEW).",
            "Executes near-instantly during dbt runs without incurring physical storage write costs.",
            "Guarantees data freshness by executing underlying transformation queries dynamically at read time.",
            "Can cause severe BI query degradation when chaining multiple complex views across multi-million row tables."
        ]
    },
    "Incremental Materialization": {
        "id": "dbt-incremental-materialization",
        "difficulty": "EASY",
        "definition": "Incremental materialization allows dbt to transform and insert only newly arrived or modified records since the previous pipeline run, rather than rebuilding the entire table.",
        "explanation": "For multi-gigabyte or terabyte tables, full table rebuilds become prohibitively slow and expensive. Incremental models solve this by leveraging the `is_incremental()` Jinja macro to append or merge only recent rows (e.g., `WHERE updated_at > (SELECT max(updated_at) FROM {{ this }})`). Under the hood, dbt translates this into SQL `MERGE` or `INSERT INTO` statements. When schema changes occur, engineers can trigger a full rebuild using the `--full-refresh` CLI flag.",
        "keyPoints": [
            "Transforms and loads only delta records, slashing warehouse runtime and compute expenditure on large tables.",
            "Uses the {{ is_incremental() }} Jinja conditional to dynamically filter for new or updated records.",
            "Executes atomic MERGE or INSERT statements against the existing target table in the warehouse.",
            "Supports full table rebuilds via the dbt run --full-refresh flag to reset schema drift and backfill."
        ]
    },
    "Ephemeral Materialization": {
        "id": "dbt-ephemeral-materialization",
        "difficulty": "EASY",
        "definition": "Ephemeral materialization creates a reusable SQL code block that is not written to the database at all, but rather interpolated as a Common Table Expression (CTE) into downstream models.",
        "explanation": "Ephemeral models allow analytics engineers to modularize intermediate transformation logic without cluttering the database schema with physical tables or views. When a downstream model references an ephemeral model via `ref()`, dbt compiles the ephemeral model's SQL as a `WITH ephemeral_model AS (...)` CTE directly inside the consuming model's query plan. This keeps the target database clean while maintaining DRY (Don't Repeat Yourself) SQL architecture.",
        "keyPoints": [
            "Does not create physical database objects (tables or views) in the warehouse.",
            "Injected dynamically as a Common Table Expression (CTE) into all referencing downstream models.",
            "Keeps production schemas clean and uncluttered from micro-intermediate transformations.",
            "Can increase query compilation complexity and execution time if referenced by multiple downstream models."
        ]
    },
    "schema.yml": {
        "id": "dbt-schema-yml",
        "difficulty": "EASY",
        "definition": "A schema.yml file is a configuration file where models, columns, descriptions, tests, and documentation metadata are declaratively registered in dbt.",
        "explanation": "Schema YAML files (often named after the directory, like `_stg_ecommerce__models.yml`) serve as the source of truth for metadata and data contracts in dbt projects. Engineers declare model descriptions, column data types, business definitions, and generic data tests (`unique`, `not_null`). These YAML declarations power automated data catalogs generated by `dbt docs generate`, bridging the communication gap between data engineers, analysts, and governance teams.",
        "keyPoints": [
            "Declarative configuration file for model documentation, column descriptions, and test assertions.",
            "Serves as the data dictionary that populates automated interactive documentation in dbt Docs.",
            "Enforces column-level data contracts and schema constraints when contract: {enforced: true} is enabled.",
            "Maintains modular organization by collocating YAML files alongside model SQL files in directory trees."
        ]
    },
    "profiles.yml": {
        "id": "dbt-profiles-yml",
        "difficulty": "EASY",
        "definition": "The profiles.yml file stores warehouse connection configurations, authentication credentials, and environment target settings outside of the project code repository.",
        "explanation": "To prevent accidental commits of sensitive database passwords and OAuth tokens into version control, dbt stores connection credentials in `~/.dbt/profiles.yml` on the local developer machine or orchestrator environment. A profile defines connections to specific database adapters (Snowflake, Databricks, BigQuery, Postgres) and configures named `targets` (e.g., `dev`, `prod`). The `dbt_project.yml` file links to the profile name, allowing different developers to run against distinct sandboxes using identical project code.",
        "keyPoints": [
            "Stores warehouse connection details, credentials, and authentication tokens outside Git repositories.",
            "Located by default in ~/.dbt/profiles.yml or specified via the --profiles-dir CLI argument.",
            "Defines multiple deployment targets (dev, staging, prod) with distinct warehouses, roles, and schemas.",
            "Supports environment variable interpolation (e.g., {{ env_var('DBT_PASSWORD') }}) for secure CI/CD pipelines."
        ]
    },
    "dbt run command": {
        "id": "dbt-dbt-run-command",
        "difficulty": "EASY",
        "definition": "The dbt run command is the core CLI command that compiles and executes SQL models in the target warehouse according to the project's dependency DAG.",
        "explanation": "Executing `dbt run` triggers dbt's compilation engine: it connects to the target warehouse, evaluates model configurations, resolves Jinja and `ref()` calls, and issues the compiled SQL statements in topologically sorted dependency order. Engineers use graph selection flags (e.g., `dbt run --select stg_customers+`) to execute specific subgraphs, and `--threads` to specify how many models compile and run concurrently against warehouse compute resources.",
        "keyPoints": [
            "Primary CLI command that compiles and executes all models matching the selection criteria.",
            "Respects topological dependency order derived from ref() functions across the project graph.",
            "Supports granular model filtering via --select and --exclude flags (e.g., --select tag:finance).",
            "Controls warehouse concurrency through the --threads argument to optimize pipeline runtime."
        ]
    },

    # MEDIUM (12)
    "dbt Snapshot (SCD Type 2)": {
        "id": "dbt-dbt-snapshot-scd-type-2",
        "difficulty": "MEDIUM",
        "definition": "A dbt snapshot captures and records changes to mutable source data over time, automatically maintaining a Slowly Changing Dimension (SCD Type 2) history table.",
        "explanation": "Transactional databases frequently overwrite records in place (e.g., updating a customer address or order status), destroying point-in-time historical context. dbt Snapshots solve this by periodically querying the source table, comparing current values against the historical snapshot table, and inserting new rows while updating `dbt_valid_from` and `dbt_valid_to` timestamps. Snapshots support two change detection strategies: `check` (evaluating specific column changes) and `timestamp` (using an `updated_at` column).",
        "keyPoints": [
            "Automates Slowly Changing Dimension Type 2 (SCD Type 2) history tracking over mutable source systems.",
            "Maintains dbt_valid_from, dbt_valid_to, and dbt_scd_id metadata columns to track validity windows.",
            "Supports 'timestamp' strategy (evaluating updated_at fields) and 'check' strategy (comparing column checksums).",
            "Enables historical point-in-time reporting and audit compliance without custom procedural ETL code."
        ]
    },
    "Custom Schema Override": {
        "id": "dbt-custom-schema-override",
        "difficulty": "MEDIUM",
        "definition": "Custom Schema Override is the pattern of overriding dbt's default `generate_schema_name` macro to control how schema names are generated across dev and prod environments.",
        "explanation": "By default, when a model configures `schema: marketing`, dbt concatenates the target schema with the custom schema (resulting in `dbt_username_marketing` in dev, or `analytics_marketing` in prod). In enterprise environments, teams require models to write directly to specific clean schemas (e.g., `marketing` in production, but `dev_marketing` in staging). By overriding the `generate_schema_name` macro in `macros/generate_schema_name.sql`, architects implement standardized schema naming rules across multi-tenant data platforms.",
        "keyPoints": [
            "Customizes schema naming logic by overriding dbt's built-in generate_schema_name macro.",
            "Prevents default concatenation behavior (e.g. target_schema_custom_schema) in production deployments.",
            "Enforces environment-aware naming conventions: strictly isolated dev sandboxes vs clean prod schemas.",
            "Ensures compliance with enterprise database namespace governance and security boundaries."
        ]
    },
    "Pre/Post Hooks": {
        "id": "dbt-pre-post-hooks",
        "difficulty": "MEDIUM",
        "definition": "Pre-hooks and post-hooks are SQL statements or macros executed immediately before or after a dbt model is materialized in the database.",
        "explanation": "Hooks allow developers to execute operational SQL statements outside the core `SELECT` transformation. Common enterprise use cases include executing `pre_hook` statements to create database temporary session settings or verify source locks, and `post_hook` statements to execute `GRANT SELECT` permissions to BI service roles, update warehouse audit tables, or call VACUUM commands on materialized tables. Hooks can be declared globally in `dbt_project.yml` or locally inside a model's `config()` block.",
        "keyPoints": [
            "Executes auxiliary SQL statements immediately before (pre_hook) or after (post_hook) model execution.",
            "Commonly used for granting warehouse role permissions (GRANT SELECT ON {{ this }} TO ROLE bi_users).",
            "Can be declared globally in dbt_project.yml or scoped to individual models in {{ config() }} blocks.",
            "Supports execution of custom Jinja macros to log model execution metadata to audit tables."
        ]
    },
    "dbt Macros": {
        "id": "dbt-dbt-macros",
        "difficulty": "MEDIUM",
        "definition": "dbt Macros are reusable, parameterizable Jinja code blocks defined in the macros/ directory that compile into dynamic SQL during project execution.",
        "explanation": "Macros are the equivalent of functions in traditional programming languages, bringing DRY (Don't Repeat Yourself) design principles to SQL. Instead of repeating identical 20-line CASE statements or currency conversion calculations across 50 models, engineers write a single macro (e.g. `{{ convert_currency('amount', 'currency', 'USD') }}`). Macros can accept arguments, iterate through lists, access runtime environment variables, execute database queries via `run_query()`, and return dialect-specific SQL.",
        "keyPoints": [
            "Reusable functions authored in Jinja and SQL stored inside the macros/ directory.",
            "Enforces DRY (Don't Repeat Yourself) principles across complex enterprise SQL transformations.",
            "Can execute database queries during compile time using the run_query() macro for dynamic logic.",
            "Forms the foundation of modular dbt packages (e.g., dbt-utils, dbt-expectations)."
        ]
    },
    "Jinja Templating in dbt": {
        "id": "dbt-jinja-templating-in-dbt",
        "difficulty": "MEDIUM",
        "definition": "Jinja is the Python-based templating engine embedded within dbt that compiles dynamic SQL, enables control flow loops and conditionals, and evaluates environment parameters.",
        "explanation": "In dbt projects, Jinja allows SQL models to become programmatic without sacrificing database execution efficiency. Before queries reach Snowflake, BigQuery, or Databricks, dbt compiles all Jinja statements into pure target SQL using a two-phase parse and compile lifecycle. Engineers leverage Jinja expressions `{{ ... }}` for variable and model interpolation, statement blocks `{% ... %}` for control flow (if/else conditionals, for loops), and comments `{# ... #}`. This enables dynamic column pivoting, multi-environment branching, and parameterized model execution.",
        "keyPoints": [
            "Evaluated entirely on the client/runner machine during compilation, emitting static ANSI/dialect SQL.",
            "Enables dynamic control structures ({% if %}, {% for %}) to handle multi-environment branching and automated column loops.",
            "Powers core dbt abstractions including {{ ref() }}, {{ source() }}, {{ config() }}, and custom reusable macros.",
            "Best practice advises keeping SQL declarative and encapsulating intricate Jinja loops inside audited macros rather than inline model code."
        ]
    },
    "dbt-utils Package": {
        "id": "dbt-utils-package",
        "difficulty": "MEDIUM",
        "definition": "dbt-utils is the foundational open-source macro package maintained by dbt Labs that provides essential utility macros, cross-database SQL helpers, and advanced schema tests.",
        "explanation": "The dbt-utils package provides battle-tested SQL macros that eliminate redundant boilerplate across modern analytics engineering teams. Key capabilities include surrogate key generation (`generate_surrogate_key`), cross-database date math, pivot transformations, and dynamic column unnesting. It also adds advanced schema validation tests such as `unique_combination_of_columns`, `equality`, and `recency`. Installing dbt-utils via `packages.yml` establishes a standard utility layer that simplifies cross-database migrations between Snowflake, BigQuery, Redshift, and Databricks.",
        "keyPoints": [
            "Installed via packages.yml and managed using the dbt deps CLI command.",
            "Provides essential testing macros like unique_combination_of_columns to enforce multi-column composite primary keys.",
            "Features cross-database macros (e.g. dateadd, split_part, safe_cast) that abstract dialect idiosyncrasies.",
            "Standardizes complex SQL operations like surrogate key hashing and dynamic column unpivoting with zero custom UDFs."
        ]
    },
    "Incremental Models (unique_key)": {
        "id": "dbt-incremental-models-unique_key",
        "difficulty": "MEDIUM",
        "definition": "The unique_key configuration in incremental models specifies the primary key column(s) used by dbt to update existing records and insert new records during MERGE operations.",
        "explanation": "When an incremental model processes incoming delta data, dbt must know how to handle records that already exist in the target table. By specifying `unique_key='order_id'` (or a list of columns for composite keys), dbt generates a `MERGE` statement matching on that key. If a record matches, dbt updates the target row with the latest values; if it does not match, it inserts a new row. Omitting `unique_key` causes dbt to default to append-only behavior, which creates duplicate records during re-runs.",
        "keyPoints": [
            "Defines the primary key constraint for SQL MERGE operations in incremental materializations.",
            "Accepts a single column string ('order_id') or a list of columns (['order_id', 'line_item_id']) for composite keys.",
            "Prevents duplicate records during incremental backfills and automated pipeline retries.",
            "Underpins upsert strategies across modern cloud data warehouses supporting transactional MERGE."
        ]
    },
    "Singular Tests": {
        "id": "dbt-singular-tests",
        "difficulty": "MEDIUM",
        "definition": "A singular test is a standalone SQL query stored in the tests/ directory that defines a custom business assertion that fails if the query returns any rows.",
        "explanation": "While generic tests are declared in YAML for standard column checks (unique, not_null), singular tests handle complex, domain-specific business rules that span multiple joined models or aggregate calculations. For example, verifying that total invoice line item amounts equal the parent invoice header total, or asserting that discounts never exceed total sale value. A singular test is simply a SQL file: if `SELECT ...` returns zero rows, the test passes; if it returns one or more rows, dbt flags an assertion failure.",
        "keyPoints": [
            "Custom SQL queries stored in the tests/ directory asserting bespoke enterprise business logic.",
            "Fails automatically if the query returns one or more failing exception records.",
            "Ideal for cross-table reconciliations, financial balance assertions, and complex multi-column invariants.",
            "Supports the --store-failures flag to write failing audit rows into a quarantine database table."
        ]
    },
    "dbt build Command": {
        "id": "dbt-dbt-build-command",
        "difficulty": "MEDIUM",
        "definition": "The dbt build command executes models, runs tests, creates snapshots, and loads seeds in a unified DAG sequence, halting downstream nodes if an upstream model or test fails.",
        "explanation": "Introduced in dbt Core 0.21, `dbt build` revolutionized pipeline execution by unifying seeds, models, snapshots, and tests into a single topological execution graph. In legacy workflows, engineers ran `dbt run` followed by `dbt test`; if a test failed, bad data was already materialized in production marts. With `dbt build`, dbt tests a model immediately after materializing it; if an upstream staging test fails, all downstream intermediate and mart models are skipped, preventing corrupt data contamination.",
        "keyPoints": [
            "Unifies seeds, models, snapshots, and tests into a single dependency-ordered DAG execution.",
            "Halts downstream execution immediately if an upstream model fails or a critical test assertion breaks.",
            "Prevents data lake corruption by ensuring bad data in staging layers never populates downstream marts.",
            "Standard command for production orchestrators (Airflow, Dagster) and CI/CD pull request validation."
        ]
    },
    "Exposures": {
        "id": "dbt-exposures",
        "difficulty": "MEDIUM",
        "definition": "Exposures are YAML declarations in dbt that document downstream consumers of dbt models, such as dashboards, ML models, and operational APIs.",
        "explanation": "Analytics engineering pipelines do not end when dbt models finish building; business value is delivered in downstream applications. Exposures define these downstream assets (e.g., a Power BI Executive Dashboard or an ML churn prediction model) in YAML files under the `exposures:` key. This embeds downstream consumer visibility directly into dbt's lineage DAG, allowing data engineers to perform impact analysis before altering upstream tables and to notify dashboard owners of schema changes.",
        "keyPoints": [
            "Documents downstream consumer assets (Power BI reports, Tableau workbooks, ML pipelines, reverse-ETL).",
            "Completes end-to-end data lineage in the dbt documentation graph from raw source to executive dashboard.",
            "Enables impact analysis: engineers can identify which dashboards break before modifying model schemas.",
            "Supports selective execution via syntax like dbt test --select +exposure:weekly_revenue_report."
        ]
    },
    "dbt Semantic Layer": {
        "id": "dbt-dbt-semantic-layer",
        "difficulty": "MEDIUM",
        "definition": "The dbt Semantic Layer (powered by MetricFlow) allows organizations to centrally define metrics and dimensions on top of dbt models, providing consistent metric calculation across all BI tools.",
        "explanation": "Different departments often compute key business metrics (like 'Active Customers' or 'Monthly Recurring Revenue') using conflicting SQL logic across various BI dashboards. The dbt Semantic Layer solves this metric fragmentation by defining metrics, measures, and dimensions directly inside the dbt project using MetricFlow YAML specifications. Downstream BI applications query metrics through standard APIs, ensuring that revenue calculations are identical whether queried in Tableau, Power BI, Google Sheets, or Python.",
        "keyPoints": [
            "Centralizes business metric definitions (revenue, churn, CAC) within code-governed YAML files.",
            "Powered by MetricFlow to dynamically generate SQL queries tailored to consumer dimension drill-downs.",
            "Eliminates conflicting metric calculations across fragmented departmental BI dashboards.",
            "Exposes metrics via universal APIs and JDBC/ODBC connectors to Tableau, Power BI, and Hex."
        ]
    },
    "Analyses": {
        "id": "dbt-analyses",
        "difficulty": "MEDIUM",
        "definition": "Analyses are one-off SQL queries stored in the analyses/ directory that utilize dbt Jinja and ref() functions but are compiled without being materialized in the database.",
        "explanation": "Data analysts frequently need to perform exploratory data analysis, run ad-hoc queries, or test hypotheses that require access to dbt's Jinja macros and environment-aware `ref()` functions, but do not warrant persisting a table or view in production. Queries placed in the `analyses/` directory compile into pure SQL in the `target/compiled/` directory during `dbt compile`, allowing analysts to copy the compiled SQL directly into analytical consoles or BI tools.",
        "keyPoints": [
            "Stores exploratory, one-off analytical SQL queries inside the analyses/ directory.",
            "Leverages dbt's full Jinja templating, variables, and ref() dependency interpolation.",
            "Compiled during dbt compile without materializing physical database objects in the warehouse.",
            "Bridges the gap between ad-hoc SQL analysis and version-controlled, production-grade modeling."
        ]
    },

    # HARD (11)
    "dbt Compile vs Run vs Build": {
        "id": "dbt-dbt-compile-vs-run-vs-build",
        "difficulty": "HARD",
        "definition": "The core architectural distinction between dbt compile (generating warehouse SQL), dbt run (executing model DDL/DML), and dbt build (unified execution of seeds, models, tests, and snapshots).",
        "explanation": "Understanding dbt's command lifecycle is critical for CI/CD and production design. `dbt compile` parses the project, resolves Jinja, and writes compiled target SQL to `target/` without touching the warehouse database. `dbt run` compiles and executes models, creating tables/views. `dbt build` is the holistic execution command that topologically interleaves seeds, models, snapshots, and tests, immediately failing fast and skipping downstream dependencies if an upstream assertion breaks.",
        "keyPoints": [
            "dbt compile parses Jinja and outputs static SQL to target/compiled without executing warehouse compute.",
            "dbt run creates physical warehouse database objects (tables/views) in topological dependency order.",
            "dbt build provides unified, fail-fast execution of seeds, models, snapshots, and tests in a single DAG.",
            "CI pipelines use dbt compile for syntax/lineage validation, and dbt build for automated pull request tests."
        ]
    },
    "Partial Parsing": {
        "id": "dbt-partial-parsing",
        "difficulty": "HARD",
        "definition": "Partial Parsing is a performance optimization engine in dbt Core that caches previously parsed project files in manifest.json, reparsing only modified files on subsequent runs.",
        "explanation": "In large enterprise dbt projects with thousands of models and macros, re-parsing the entire AST (Abstract Syntax Tree) on every CLI invocation previously introduced 30-60 second latency overhead before queries even began. Partial parsing (enabled by default in modern dbt) compares file checksums against `target/partial_parse.msgpack`. If only one model was modified, dbt parses only that file and its immediate dependencies, reducing startup times to milliseconds.",
        "keyPoints": [
            "Caches parsed project graph state in target/partial_parse.msgpack to accelerate CLI execution.",
            "Compares file hashes to re-parse strictly modified or newly added SQL/YAML files.",
            "Slashes project parse overhead in enterprise projects containing thousands of models from minutes to seconds.",
            "Can be reset manually using the --no-partial-parse flag when debugging macro dependency anomalies."
        ]
    },
    "Source Freshness Checks": {
        "id": "dbt-source-freshness-checks",
        "difficulty": "HARD",
        "definition": "Source Freshness Checks are automated SLA validations executed via dbt source freshness that assert whether raw source tables have received recent data updates.",
        "explanation": "Before executing hours of compute to build downstream analytical models, data platforms must verify that raw ingested data is fresh. In `sources.yml`, engineers configure `freshness:` blocks with `warn_after` and `error_after` thresholds (e.g., `error_after: {count: 6, period: hour}`) evaluated against a `loaded_at_field`. The command `dbt source freshness` queries the max timestamp in each source table; if a replication pipeline has stalled, the check flags an alert, preventing the waste of warehouse compute on stale inputs.",
        "keyPoints": [
            "Validates that raw ingestion pipelines (Fivetran, Kafka CDC) are delivering data within configured SLAs.",
            "Configured in sources.yml with warn_after and error_after time windows based on loaded_at_field.",
            "Executed via the dbt source freshness CLI command prior to running downstream transformation DAGs.",
            "Outputs detailed metadata to sources.json for integration with enterprise monitoring and Slack alerting."
        ]
    },
    "Adapter-Specific Macros": {
        "id": "dbt-adapter-specific-macros",
        "difficulty": "HARD",
        "definition": "Adapter-Specific Macros use dbt's multiple-dispatch mechanism to execute different SQL implementations depending on the target database engine (Snowflake, BigQuery, Databricks).",
        "explanation": "Different data warehouses implement divergent SQL dialects, string manipulation syntax, and window function implementations. To build portable, cross-database packages, dbt utilizes adapter dispatch (via `adapter.dispatch()`). When a macro like `hash()` is called, dbt searches for `default__hash()`, `snowflake__hash()`, `bigquery__hash()`, and `spark__hash()`. It executes the specialized macro matching the active connection profile, enabling seamless code portability across multi-cloud enterprise stacks.",
        "keyPoints": [
            "Enables writing portable dbt code that runs across multiple warehouse dialects (Snowflake, BigQuery, Databricks).",
            "Leverages the adapter.dispatch('macro_name') pattern to resolve engine-specific implementations.",
            "Abstracts dialect differences such as date arithmetic, regex matching, and string concatenation.",
            "Essential architecture pattern for public open-source dbt packages and multi-cloud enterprise platforms."
        ]
    },
    "--defer Flag": {
        "id": "dbt---defer-flag",
        "difficulty": "HARD",
        "definition": "The --defer flag allows dbt to resolve unbuilt upstream dependencies in a developer sandbox by pointing to production models recorded in a production manifest.json artifact.",
        "explanation": "When a developer modifies a single downstream model in a project containing 2,000 models, they historically had to build all 50 upstream models in their personal dev schema just to test their change. `--defer` (used in conjunction with `--state path/to/prod/artifacts`) tells dbt: if an upstream model has not been built in the developer's sandbox schema, resolve the `ref()` call to the existing production table instead. This slashes developer iteration cycles and saves massive cloud compute costs.",
        "keyPoints": [
            "Points unbuilt upstream ref() dependencies to production tables during local development and testing.",
            "Requires a production manifest.json artifact passed via the --state flag (dbt run --select my_model --defer --state prod_artifacts/).",
            "Eliminates the requirement for developers to build hundreds of upstream staging tables in private sandboxes.",
            "Radically accelerates developer productivity and reduces unnecessary cloud warehouse compute expenditure."
        ]
    },
    "State-Based CI": {
        "id": "dbt-state-based-ci",
        "difficulty": "HARD",
        "definition": "State-Based CI (Slim CI) is a continuous integration testing strategy that compares pull request code against a production manifest to test strictly modified models and their first-order dependents.",
        "explanation": "In large enterprise repositories, running `dbt build` on the entire project for every pull request is too slow and expensive. State-Based CI downloads the `manifest.json` from the latest successful production run, compares it against the PR branch, and uses the `state:modified+` selection syntax. dbt identifies exactly which models, macros, or tests changed, and runs only those modified assets plus their immediate downstream dependents in an isolated, ephemeral CI schema.",
        "keyPoints": [
            "Compares current pull request code against production manifest.json to isolate exact differences.",
            "Executes strictly modified models and downstream dependents using the --select state:modified+ syntax.",
            "Slashes CI execution durations from hours to minutes, accelerating engineering merge velocity.",
            "Runs inside ephemeral pull request schemas that are automatically torn down after merge."
        ]
    },
    "Custom Materializations": {
        "id": "dbt-custom-materializations",
        "difficulty": "HARD",
        "definition": "Custom Materializations are user-defined dbt materialization macros that control the exact DDL, staging steps, and transaction mechanics used to persist models in the warehouse.",
        "explanation": "While dbt provides default materializations (table, view, incremental, ephemeral), complex enterprise workloads often require specialized persistence patterns. Examples include creating Iceberg tables with custom write configurations, building SCD Type 4 history tables, or executing atomic multi-stage upserts with quarantine verification. Advanced engineers implement custom materializations using Jinja macros decorated with `{% materialization my_materialization, default %}`, orchestrating custom warehouse transactions directly.",
        "keyPoints": [
            "Extends dbt's compilation engine to implement proprietary persistence and transaction workflows.",
            "Defined in Jinja macros decorated with {% materialization <name>, adapter %}.",
            "Controls low-level warehouse DDL/DML, transaction savepoints, and post-materialization indexing.",
            "Used to implement specialized lakehouse formats (Iceberg, Hudi) and custom streaming upsert mechanics."
        ]
    },
    "dbt-audit-helper": {
        "id": "dbt-dbt-audit-helper",
        "difficulty": "HARD",
        "definition": "dbt-audit-helper is a dbt package that provides macros to compare row-by-row data parity between two relations, verifying refactored models against legacy tables.",
        "explanation": "When refactoring legacy SQL stored procedures into dbt models, or modernizing an existing dbt model, analytics engineers must prove that the new code produces identical data outputs to the legacy table. The `dbt-audit-helper` package provides macros like `compare_relations` and `compare_queries`. It executes comprehensive column-by-column equality checks, summarising row counts, identical rows, conflicting values, and missing records, providing mathematically verified parity before production deployment.",
        "keyPoints": [
            "Automates data parity verification between refactored dbt models and legacy production tables.",
            "Provides the compare_relations macro to calculate percentage column match rates and row-level discrepancies.",
            "Essential tool for zero-risk data migrations from legacy ETL systems (Informatica, SSIS) to dbt.",
            "Generates clear SQL parity summaries to provide audit evidence for business stakeholders prior to cutover."
        ]
    },
    "Cross-Database Macros": {
        "id": "dbt-cross-database-macros",
        "difficulty": "HARD",
        "definition": "Cross-Database Macros provide standardized SQL syntax for functions that vary across database dialects, allowing dbt projects to run on any cloud warehouse platform.",
        "explanation": "SQL dialects differ significantly across cloud warehouses: for example, string concatenation uses `||` in Snowflake/Postgres, `concat()` in BigQuery, and `+` in T-SQL. Similarly, date truncation, regex matching, and surrogate key hashing vary widely. Cross-database macros (formerly in `dbt-utils`, now integrated natively into `dbt-core`) abstract these variations. Calling `{{ dbt.dateadd('day', 1, 'order_date') }}` compiles to the exact native syntax required by whatever database adapter is currently active.",
        "keyPoints": [
            "Provides unified SQL macro interfaces for functions that differ across database engines.",
            "Abstracts date math (dbt.dateadd, dbt.datediff), string manipulation (dbt.concat), and type casting (dbt.safe_cast).",
            "Enables enterprise dbt projects and open-source packages to maintain multi-warehouse portability.",
            "Eliminates vendor lock-in, enabling smooth migrations between Snowflake, BigQuery, Databricks, and Redshift."
        ]
    },
    "Manifest.json Internals": {
        "id": "dbt-manifest-json-internals",
        "difficulty": "HARD",
        "definition": "The manifest.json file is a comprehensive JSON artifact generated during compilation that contains the full semantic model, dependency graph, and metadata of the entire dbt project.",
        "explanation": "Every time dbt parses a project, it writes `target/manifest.json`. This massive JSON document is the complete abstract syntax tree (AST) of the dbt project: it catalogs every model, source, test, seed, exposure, and macro, along with their unique IDs, SQL code, upstream dependencies, configuration parameters, and column descriptions. External data governance tools (DataHub, Collibra, Monte Carlo) parse `manifest.json` to extract automated data lineage and metadata catalogs without querying warehouse logs.",
        "keyPoints": [
            "The single source of truth artifact representing the complete dbt project graph and metadata AST.",
            "Generated in the target/ directory during dbt compile, dbt run, or dbt build executions.",
            "Contains detailed node definitions including compiled_code, raw_code, depends_on, and schema contracts.",
            "Ingested by enterprise data catalogs (Atlan, Purview, DataHub) to extract automated end-to-end data lineage."
        ]
    },
    "Graph Selection Syntax": {
        "id": "dbt-graph-selection-syntax",
        "difficulty": "HARD",
        "definition": "Graph Selection Syntax is dbt's powerful query language used in CLI arguments (--select, --exclude) to selectively execute targeted subgraphs of models, tests, and sources.",
        "explanation": "dbt provides a rich graph traversal syntax that allows developers to run precise subsets of their project. Key operators include: `+model` (model and all its upstream parents), `model+` (model and all its downstream children), `@model` (model, parents, children, and parents of children), `path:models/marts` (all models in a folder), `tag:nightly` (tagged models), `source:raw_crm+` (all models downstream of a source), and intersection operators using commas (`tag:finance,tag:daily`).",
        "keyPoints": [
            "Granular CLI selection language powering targeted execution of model and test subgraphs.",
            "Uses directional plus signs (+model for upstreams, model+ for downstreams, 1+model for 1-hop upstream).",
            "Supports attribute filtering including tag:name, source:source_name, path:models/subfolder, and config.materialized:table.",
            "Enables set operations: commas denote union/intersection, spaces denote unions, and --exclude removes nodes."
        ]
    },

    # ARCHITECT (10)
    "dbt Core vs dbt Cloud": {
        "id": "dbt-dbt-core-vs-dbt-cloud",
        "difficulty": "ARCHITECT",
        "definition": "The strategic architectural evaluation between hosting open-source dbt-core via custom orchestrators versus adopting the managed enterprise SaaS platform, dbt Cloud.",
        "explanation": "dbt Core is the open-source CLI engine that organizations can embed into custom Docker containers orchestrated via Airflow, Prefect, or Dagster. dbt Cloud is the hosted SaaS platform providing a browser-based IDE, turnkey job scheduling, native Git integration, fine-grained RBAC, hosted Semantic Layer APIs, automated Slim CI, and enterprise audit logging. Architects evaluate this decision based on infrastructure engineering capacity, security compliance boundaries, and total cost of ownership (TCO).",
        "keyPoints": [
            "dbt Core provides complete infrastructure sovereignty and zero software license costs, requiring custom orchestration.",
            "dbt Cloud delivers an enterprise control plane with turnkey Slim CI, browser IDE, and managed Semantic Layer APIs.",
            "Core requires internal DevOps investment for Docker containerization, CI/CD pipelines, and secret rotation.",
            "Architects balance engineering headcount maintenance costs against SaaS subscription investment."
        ]
    },
    "dbt Mesh (Cross-Project Refs)": {
        "id": "dbt-dbt-mesh-cross-project-refs",
        "difficulty": "ARCHITECT",
        "definition": "dbt Mesh is an enterprise data architecture that decomposes monolithic dbt repositories into multiple autonomous, domain-owned projects connected via cross-project ref() calls.",
        "explanation": "As organizations scale to hundreds of data practitioners, single monolithic dbt projects become unwieldy bottlenecks with slow parse times and messy merge conflicts. dbt Mesh enables a decentralized Data Mesh topology: domain teams (e.g., Marketing, Finance, Supply Chain) maintain independent dbt repositories. Models are declared `public` and protected by strict Model Contracts. Other domain projects reference these public models using `ref('project_name', 'model_name')` without circular coupling.",
        "keyPoints": [
            "Enables enterprise Data Mesh architectures by breaking monolithic dbt repos into domain-owned projects.",
            "Utilizes cross-project refs (ref('upstream_project', 'public_model')) across repository boundaries.",
            "Enforces Model Contracts (schema contracts, versions) to prevent breaking changes on downstream domain consumers.",
            "Provides decentralized ownership, independent CI/CD release cycles, and isolated compute billing."
        ]
    },
    "dbt Semantic Layer at Scale": {
        "id": "dbt-dbt-semantic-layer-at-scale",
        "difficulty": "ARCHITECT",
        "definition": "The enterprise deployment architecture for the dbt Semantic Layer, serving unified metric definitions to thousands of concurrent BI, dashboard, and AI consumption consumers.",
        "explanation": "Deploying the dbt Semantic Layer at enterprise scale requires decoupling metric definitions from consumption frontends. MetricFlow translates high-level metric requests into optimized SQL queries executed on the underlying data warehouse. To achieve high concurrency and sub-second query response times for enterprise executive dashboards, architects configure semantic caching layers, proxy routing, and materialize pre-aggregated tables for high-frequency dimensional slices.",
        "keyPoints": [
            "Architects a unified governance layer serving consistent metric calculations to BI, spreadsheets, and LLMs.",
            "Leverages MetricFlow to dynamically construct complex dimensional join queries at runtime.",
            "Requires semantic layer caching and materialized summary tables to handle high concurrent query loads.",
            "Integrates with enterprise semantic tools via JDBC, GraphQL, and Python APIs."
        ]
    },
    "Monorepo vs Multi-Project dbt": {
        "id": "dbt-monorepo-vs-multi-project-dbt",
        "difficulty": "ARCHITECT",
        "definition": "The architectural trade-off between consolidating all corporate data transformations in a single Git monorepo versus establishing decentralized, domain-specific multi-project dbt repositories.",
        "explanation": "A Monorepo offers unified search, global lineage visibility, and straightforward dependency resolution across all data layers, but suffers from merge conflicts, slow CI runs, and complex RBAC at scale. A Multi-Project architecture (dbt Mesh) isolates team workflows, enables independent CI cycles, and reinforces domain data ownership boundaries, but requires robust cross-project contract governance and shared utility packages. Architects transition from monorepo to multi-project when teams exceed 20-30 data practitioners.",
        "keyPoints": [
            "Monorepo simplifies global lineage and central macro governance, but introduces CI bottlenecks as teams scale.",
            "Multi-project aligns with Data Mesh principles, giving autonomous domains independent release velocity.",
            "Multi-project requires formal Model Contracts and cross-project CI dependencies to prevent breaking changes.",
            "Transition threshold typically occurs when monorepo compile times and Git merge conflicts hinder developer velocity."
        ]
    },
    "dbt + Airflow Orchestration": {
        "id": "dbt-dbt---airflow-orchestration",
        "difficulty": "ARCHITECT",
        "definition": "The enterprise integration pattern combining Apache Airflow as the global workflow orchestrator with dbt as the specialized in-warehouse transformation engine.",
        "explanation": "Modern architectures avoid running `dbt run` as a single monolithic Airflow task. Using modern integration frameworks like Astronomer Cosmos, Airflow dynamically parses dbt's `manifest.json` and renders each dbt model as a discrete Airflow task instance. This unlocks granular task-level retries, parallel model execution across independent DAG branches, SLA monitoring per analytical mart, and seamless integration between upstream ingestion (Fivetran/Airbyte) and downstream BI cache warmers.",
        "keyPoints": [
            "Leverages Astronomer Cosmos to convert dbt manifest.json models into native, discrete Airflow DAG tasks.",
            "Enables isolated task retries: reruns strictly the failed dbt model rather than restarting the entire 2-hour project.",
            "Orchestrates end-to-end data pipelines: Ingestion -> dbt Staging -> dbt Marts -> BI Cache Invalidation.",
            "Runs dbt models within containerized environments (KubernetesPodOperator) to isolate Python dependency stacks."
        ]
    },
    "dbt + Databricks Integration": {
        "id": "dbt-dbt---databricks-integration",
        "difficulty": "ARCHITECT",
        "definition": "The architectural design pairing dbt with Databricks, utilizing dbt-databricks adapters against Databricks SQL Serverless Warehouses and Unity Catalog.",
        "explanation": "The `dbt-databricks` adapter combines dbt's declarative modeling with Databricks Lakehouse performance. Transformation workloads execute on Databricks SQL Serverless Warehouses powered by the C++ Photon engine, eliminating cluster startup wait times. Models are registered directly in Unity Catalog using standard three-tier namespaces (`catalog.schema.table`), supporting Delta Lake features like Change Data Feed, Liquid Clustering, and automated table constraints.",
        "keyPoints": [
            "Utilizes the dbt-databricks adapter connected to Databricks SQL Serverless Warehouses for instant startup.",
            "Fully integrates with Unity Catalog's 3-level namespace (catalog.schema.table) and fine-grained access control.",
            "Leverages Delta Lake capabilities including Liquid Clustering, Change Data Feed, and OPTIMIZE within dbt models.",
            "Employs Photon engine execution for high-throughput vectorized data transformations."
        ]
    },
    "Slim CI for dbt": {
        "id": "dbt-slim-ci-for-dbt",
        "difficulty": "ARCHITECT",
        "definition": "Slim CI is an automated pull request verification pattern that uses state comparison artifacts to test exclusively modified models and their downstream dependencies in temporary sandboxes.",
        "explanation": "In production analytics engineering teams, executing full project rebuilds on every Git pull request drains cloud budgets and delays deployments. Slim CI architectures configure CI runners (GitHub Actions, GitLab CI) to fetch the production `manifest.json` from object storage, compare it with the PR branch, and execute `dbt build --select state:modified+ --defer --state ./prod-manifest`. This ensures 100% test coverage of changed code in an ephemeral staging schema with minimal compute costs.",
        "keyPoints": [
            "Compares PR code against production manifest.json using the state:modified+ graph selector.",
            "Leverages the --defer flag to resolve unbuilt upstream dependencies to production tables without duplicate builds.",
            "Builds and tests code within an ephemeral, PR-scoped schema that is automatically deleted after merge.",
            "Reduces continuous integration runtime by up to 90%, slashing cloud warehouse compute invoices."
        ]
    },
    "dbt Production Deployment": {
        "id": "dbt-dbt-production-deployment",
        "difficulty": "ARCHITECT",
        "definition": "The production deployment architecture for dbt encompassing containerization, blue/green environment promotion, automated rollback strategies, and observability integration.",
        "explanation": "Deploying dbt to production requires treating analytics transformations with the same engineering rigor as backend microservices. Standard production architectures package dbt into hardened Docker images, mount secrets via cloud vaults, and execute scheduled builds via orchestrators. Advanced teams employ zero-downtime Blue/Green deployments: models build into a green schema, pass full test suites, and are atomically promoted to the active production schema using database schema swap or view pointer updates.",
        "keyPoints": [
            "Packages dbt projects into immutable Docker containers deployed across automated CI/CD release pipelines.",
            "Implements Blue/Green schema promotions or zero-downtime table swaps to protect operational reporting queries.",
            "Integrates data observability platforms (Monte Carlo, DataDog, Slack) to capture real-time pipeline telemetry.",
            "Enforces strict model contracts, semantic versioning, and branch protection on production Git branches."
        ]
    },
    "Cost Governance with dbt": {
        "id": "dbt-cost-governance-with-dbt",
        "difficulty": "ARCHITECT",
        "definition": "Cost Governance in dbt involves implementing architectural practices, query tagging, incremental models, and compute warehouse sizing to optimize cloud data warehouse expenditures.",
        "explanation": "Uncontrolled dbt transformations can rapidly inflate Snowflake, BigQuery, or Databricks cloud bills through unbounded full refreshes, inefficient joins, and over-provisioned compute warehouses. Cost governance architects enforce: query tagging via `query_tag` configs to track cost per model/team; mandatory incremental materialization on tables exceeding 10M rows; warehouse routing (directing heavy marts to larger compute and lightweight staging to small warehouses); and automated monitoring of runtime cost anomalies.",
        "keyPoints": [
            "Injects query tags (query_tag: {project: finance, model: {{ this.name }}}) for granular warehouse chargeback.",
            "Mandates incremental materialization and partition pruning for large tables to prevent redundant data processing.",
            "Routes models dynamically to appropriate warehouse compute sizes based on workload complexity.",
            "Audits model runtime trends using dbt artifacts (run_results.json) to identify runaway query costs."
        ]
    },
    "dbt Testing Pyramid": {
        "id": "dbt-dbt-testing-pyramid",
        "difficulty": "ARCHITECT",
        "definition": "The dbt Testing Pyramid is a quality architecture framework that structures data testing across unit tests, generic schema assertions, singular business assertions, and data observability.",
        "explanation": "Similar to software engineering testing pyramids, the dbt Testing Pyramid organizes validation across layers: at the base, Unit Tests (introduced in dbt 1.8) validate macro and business logic against mock inputs without querying the warehouse; next, Generic Schema Tests (unique, not_null) enforce structural constraints on every model; above that, Singular Tests assert complex cross-table business logic; and at the apex, Data Observability monitors volume anomalies, freshness drift, and distribution shifts.",
        "keyPoints": [
            "Structures data testing into a balanced hierarchy: Unit Tests -> Generic Tests -> Singular Tests -> Observability.",
            "Leverages dbt 1.8+ Unit Tests to validate transformation logic against mock data prior to warehouse execution.",
            "Enforces structural schema constraints (unique, not_null, accepted_values) across 100% of staging models.",
            "Implements end-to-end data quality gates that prevent corrupted data from reaching operational dashboards."
        ]
    }
}

print(f"Loaded {len(dbt_data)} dbt concepts.")
