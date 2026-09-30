# scripts/data_patches/patch_dbt_1_to_35.py
"""
Bespoke, expert answers for dbt questions 001 to 035.
All answers follow the Phase structure with code snippets, configuration, and production gotchas.
"""

def get_dbt_1_to_35():
    return {
        "dbt-q-001": """### Conceptual Foundation & Core Architecture
**dbt (data build tool)** is an analytics engineering framework that transforms raw data inside modern cloud data warehouses (Snowflake, Databricks, BigQuery, Microsoft Fabric) using declarative `SELECT` SQL statements. dbt embraces software engineering best practices: version control, automated testing, continuous integration, modularity, and automated documentation.

Instead of extracting data and processing it in external compute engines (legacy ETL), dbt embraces **ELT**: extraction and loading tools (Fivetran, Airbyte, ADF) land raw data directly in the lakehouse or warehouse, and dbt orchestrates transformations natively using warehouse compute.

### Low-Level Mechanics & Implementation
A minimal dbt model (`models/staging/stg_customers.sql`):
```sql
{{ config(materialized='view') }}

SELECT
    id AS customer_id,
    TRIM(first_name) AS first_name,
    TRIM(last_name) AS last_name,
    LOWER(email) AS email_address,
    created_at AS registered_at
FROM {{ source('raw_ecom', 'customers') }}
```
When you execute `dbt run`, dbt:
1. Compiles the Jinja templating and resolves `{{ source(...) }}` to the physical table path `raw_ecom.customers`.
2. Wraps the query in Data Definition Language (DDL): `CREATE OR REPLACE VIEW target_schema.stg_customers AS SELECT ...`.
3. Pushes the DDL to the target data platform over JDBC/ODBC and records execution metadata in `target/manifest.json`.

### Production Hardening & Gotchas
- **No DML Allowed in Models**: A dbt SQL model must contain only a single pure `SELECT` statement. Never write procedural `CREATE TABLE`, `INSERT INTO`, or `UPDATE` statements; dbt handles all underlying DDL/DML compilation automatically.
- **Git-Driven Analytics**: Always treat dbt code as production application code: require pull requests, peer reviews, and automated CI tests before merging to main.""",

        "dbt-q-002": """### Conceptual Foundation & Core Architecture
The **`{{ ref('model_name') }}` function** is the single most critical primitive in dbt. It establishes directional relationships between models, allowing dbt to compile a Directed Acyclic Graph (DAG) of the entire transformation pipeline.

### Low-Level Mechanics & Implementation
`ref()` serves two vital architectural functions:
1. **DAG Dependency Resolution**: Tells dbt that model B depends on model A, ensuring dbt builds model A first during `dbt run` or `dbt build`.
2. **Environment Isolation**: Interpolates the correct physical schema and database prefix based on the active target profile (e.g. `analytics_dev_jdoe.stg_orders` in local dev vs `analytics_prod.stg_orders` in production) without hardcoding database names in SQL.

```sql
-- models/marts/fct_orders.sql
{{ config(materialized='table') }}

SELECT
    o.order_id,
    o.customer_id,
    c.email_address,
    o.order_amount,
    o.ordered_at
FROM {{ ref('stg_orders') }} AS o
INNER JOIN {{ ref('stg_customers') }} AS c
    ON o.customer_id = c.customer_id
```

### Production Hardening & Gotchas
- **Hardcoding Schema Anti-Pattern**: Never write `FROM analytics_prod.staging.stg_orders`. Hardcoding schemas breaks developer sandbox isolation and prevents running CI builds in isolated PR schemas. Always use `{{ ref(...) }}`.
- **Circular Dependencies**: If model A references model B and model B references model A, dbt fails during compilation with a `CircularDependencyException`.""",

        "dbt-q-003": """### Conceptual Foundation & Core Architecture
In dbt, **Sources** define and document raw external tables loaded into the warehouse by upstream ingestion tools (Airbyte, Fivetran, Kafka Connect, ADF). Declaring sources in YAML allows pipelines to reference raw tables using `{{ source('source_name', 'table_name') }}`, establishing lineage from raw landing tables to clean dimensional models.

### Low-Level Mechanics & Implementation
Defining sources in `models/staging/stripe/_stripe__sources.yml`:
```yaml
version: 2

sources:
  - name: stripe
    database: raw_ingestion
    schema: stripe
    description: "Raw transactional data replicated from Stripe API via Fivetran"
    tables:
      - name: charges
        description: "Credit card charge events"
        columns:
          - name: id
            tests:
              - unique
              - not_null
      - name: customers
        description: "Stripe customer profiles"
```

Querying the source in staging model (`models/staging/stripe/stg_stripe__charges.sql`):
```sql
SELECT
    id AS charge_id,
    customer AS stripe_customer_id,
    amount / 100.0 AS charge_amount_usd,
    status AS charge_status,
    created AS charged_at
FROM {{ source('stripe', 'charges') }}
```

### Production Hardening & Gotchas
- **Source Freshness**: Pair sources with `loaded_at_field` to enable automated data freshness monitoring (`dbt source freshness`).
- **Isolation Boundary**: Only the **staging layer** (`models/staging/`) is permitted to query `source()`. Mart models must never query sources directly.""",

        "dbt-q-004": """### Conceptual Foundation & Core Architecture
**dbt Seeds** are static CSV files stored in the `seeds/` directory of a dbt project that dbt compiles and loads into the data warehouse as physical tables using `dbt seed`. Seeds are designed for small, slowly changing lookup datasets such as country codes, tax rate tiers, marketing campaign mappings, or employee department lookup codes.

### Low-Level Mechanics & Implementation
1. Add CSV file `seeds/country_region_mapping.csv`:
```csv
country_code,country_name,region
US,United States,Americas
GB,United Kingdom,EMEA
SG,Singapore,APAC
DE,Germany,EMEA
```

2. Configure seed schema and data types in `dbt_project.yml`:
```yaml
seeds:
  enterprise_analytics:
    country_region_mapping:
      schema: lookup
      column_types:
        country_code: varchar(2)
        country_name: varchar(100)
        region: varchar(50)
```

3. Reference the seed in downstream models via `{{ ref('country_region_mapping') }}`.

### Production Hardening & Gotchas
- **Volume Anti-Pattern**: Seeds are **NOT** designed for loading large datasets (> 10,000 rows or > 10MB). Loading large CSVs via seeds is extremely slow and degrades warehouse performance. Ingest large files via cloud storage (S3/ADLS) and treat them as `sources` instead.""",

        "dbt-q-005": """### Conceptual Foundation & Core Architecture
dbt provides four out-of-the-box **Generic Tests** defined declaratively in YAML configuration files to validate data integrity constraints on database columns:
1. **`unique`**: Verifies that every value in the column is distinct (no duplicate records).
2. **`not_null`**: Verifies that no rows contain NULL values in the target column.
3. **`accepted_values`**: Verifies that column values belong strictly to an approved enumeration list.
4. **`relationships`**: Enforces foreign key referential integrity between models.

### Low-Level Mechanics & Implementation
Configuring tests in `models/marts/core/schema.yml`:
```yaml
version: 2

models:
  - name: fct_orders
    description: "Enterprise order fact table"
    columns:
      - name: order_id
        description: "Primary key"
        tests:
          - unique
          - not_null
      - name: order_status
        tests:
          - accepted_values:
              values: ['PENDING', 'PROCESSING', 'SHIPPED', 'CANCELLED', 'RETURNED']
      - name: customer_id
        tests:
          - relationships:
              to: ref('dim_customers')
              field: customer_id
```

When you execute `dbt test`:
dbt compiles each test into a `SELECT` statement querying for failing records (e.g. `SELECT order_id, COUNT(*) FROM ... GROUP BY order_id HAVING COUNT(*) > 1`). If the query returns **0 rows**, the test passes; if it returns **1+ rows**, the test fails.

### Production Hardening & Gotchas
- **Test Thresholds & Warnings**: For non-blocking issues, configure `severity: warn` with custom thresholds:
```yaml
tests:
  - unique:
      config:
        severity: warn
        warn_if: "> 10"
        error_if: "> 50"
```""",

        "dbt-q-006": """### Conceptual Foundation & Core Architecture
In dbt, **Materializations** define how compiled SQL transformation logic is physically instantiated in the target database or data lakehouse. dbt provides four primary native materializations:
1. **`view`**: Creates a lightweight virtual SQL view (`CREATE VIEW ... AS SELECT`).
2. **`table`**: Creates a physical table on disk (`CREATE TABLE ... AS SELECT`).
3. **`incremental`**: Appends or merges only new or updated records into an existing table.
4. **`ephemeral`**: Injects the SQL directly into downstream models as Common Table Expressions (CTEs); creates no database object.

### Comparative Selection Matrix:
| Materialization | Build Latency | Query Latency | Storage Cost | Primary Use Case |
|---|---|---|---|---|
| `view` | Instantaneous (< 2s) | High (runs query on read) | Zero | Staging models (`stg_`), lightweight lookups |
| `table` | Medium (full table rewrite) | **Ultra-Fast** | Full table size | Dimension tables (`dim_`), gold reporting marts |
| `incremental` | **Fast (updates delta only)** | **Ultra-Fast** | Incremental storage | Massive transactional fact tables (100M+ rows) |
| `ephemeral` | Zero (compiled in CTE) | Dependent on parent | Zero | Reusable intermediate transformations |

### Production Hardening & Gotchas
- **Ephemeral Debugging**: Ephemeral models cannot be queried directly in the warehouse during interactive troubleshooting because they do not exist in the database catalog.""",

        "dbt-q-007": """### Conceptual Foundation & Core Architecture
The **`profiles.yml`** file configures how dbt connects to your data warehouse (Snowflake, Databricks, BigQuery, Fabric). It specifies authentication methods, warehouse endpoints, database credentials, threads, and environment targets (e.g. `dev`, `staging`, `prod`).

### Low-Level Mechanics & Implementation
Recommended production layout located outside git repositories (`~/.dbt/profiles.yml`):
```yaml
enterprise_analytics:
  target: dev
  outputs:
    dev:
      type: snowflake
      account: xy12345.us-east-1
      user: "{{ env_var('DBT_SNOWFLAKE_USER') }}"
      password: "{{ env_var('DBT_SNOWFLAKE_PASSWORD') }}"
      role: TRANSFORMER_DEV
      database: ANALYTICS_DEV
      warehouse: DEV_WH
      schema: "dbt_{{ env_var('USER') }}"
      threads: 8
      client_session_keep_alive: False
    prod:
      type: snowflake
      account: xy12345.us-east-1
      user: svc_dbt_production
      private_key_path: /opt/secrets/dbt_prod_key.p8
      role: TRANSFORMER_PROD
      database: ANALYTICS_PROD
      warehouse: PROD_TRANSFORM_WH
      schema: core
      threads: 16
```

### Production Hardening & Gotchas
- **Never Commit Credentials**: Never commit plaintext passwords or private keys to `profiles.yml` in git. Use the `{{ env_var('...') }}` Jinja macro to inject secrets from environment variables.
- **Developer Schema Isolation**: Always configure `schema: "dbt_{{ env_var('USER') }}"` for dev outputs to prevent developers from overwriting each other's test tables.""",

        "dbt-q-008": """### Conceptual Foundation & Core Architecture
Understanding the distinction between core dbt CLI execution commands is fundamental to managing pipelines and CI/CD automation:
- **`dbt run`**: Compiles and executes SQL transformation models in topological order, building views, tables, and incremental tables. Does **not** run tests.
- **`dbt test`**: Executes all generic and singular data quality tests across models, sources, and seeds. Does **not** build models.
- **`dbt build`** (Modern Standard): Combines models, tests, seeds, and snapshots into a single unified execution graph. It builds a model, immediately runs all tests on that model, and halts downstream execution if any critical test fails.

### Execution Flow Comparison:
```text
dbt run + dbt test (Legacy):
Build Model A -> Build Model B -> Test Model A -> Test Model B
(Problem: Model B builds even if Model A contains corrupted duplicate data!)

dbt build (Modern Enterprise Best Practice):
Build Model A -> Test Model A (Pass!) -> Build Model B -> Test Model B
(Guarantees data quality contracts before downstream models are computed)
```

### Production Hardening & Gotchas
- **Fail-Fast**: Always use `dbt build --fail-fast` in production to terminate pipeline runs immediately upon the first data quality failure, preventing wasted warehouse compute credits on downstream models.""",

        "dbt-q-009": """### Conceptual Foundation & Core Architecture
A **`schema.yml`** file (or any YAML file in `models/`) declares metadata, model descriptions, column descriptions, and data quality test configurations for models in that directory. It serves as both the testing specification and the source documentation for the dbt Catalog.

### Low-Level Mechanics & Implementation
```yaml
version: 2

models:
  - name: dim_customers
    description: "Customer dimensional table containing unified CRM and Billing attributes"
    config:
      contract:
        enforced: true
    columns:
      - name: customer_id
        description: "Primary surrogate key generated via MD5 hash"
        data_type: varchar(32)
        tests:
          - unique
          - not_null
      - name: lifetime_value
        description: "Cumulative gross revenue in USD"
        data_type: numeric(18,2)
        tests:
          - dbt_utils.expression_is_true:
              expression: ">= 0"
```

### Production Hardening & Gotchas
- **Model Contracts**: In dbt 1.5+, setting `contract: {enforced: true}` forces dbt to validate that compiled SQL output exactly matches the data types and column names declared in YAML, preventing accidental breaking schema drift.
- **Modular YAML Files**: Split massive YAML files into one YAML file per model subdirectory (e.g. `_staging__models.yml`, `_marts__models.yml`) to prevent merge conflicts in git.""",

        "dbt-q-010": """### Conceptual Foundation & Core Architecture
dbt provides native automated documentation that extracts model descriptions, column definitions, data tests, and lineage graphs directly from your project codebase.

### Low-Level Mechanics & Implementation
Generating and serving documentation:
```bash
# 1. Compile project and generate catalog metadata
dbt docs generate

# 2. Launch lightweight local webserver
dbt docs serve --port 8080
```

Under the hood, `dbt docs generate` produces two vital JSON artifacts in the `target/` directory:
- **`manifest.json`**: Complete representation of the project graph (models, sources, seeds, macros, configs, tests).
- **`catalog.json`**: Physical database metadata fetched from the warehouse information schema (column physical types, table sizes, row counts).

### Production Hardening & Gotchas
- **CI/CD Hosting**: In enterprise production, do not run `dbt docs serve`. Instead, upload `target/index.html`, `target/manifest.json`, and `target/catalog.json` to an S3 bucket configured for static web hosting or push to enterprise data catalogs (DataHub, Atlan, Purview).""",

        "dbt-q-011": """### Conceptual Foundation & Core Architecture
A clean, scalable `models/` directory structure reflects the Medallion / Kimball dimensional architecture and establishes clear data ownership boundaries.

### Enterprise Project Layout:
```text
models/
├── staging/                     # Bronze / Silver Staging: 1:1 with source systems; cleans & renames
│   ├── stripe/
│   │   ├── _stripe__sources.yml
│   │   ├── _stripe__models.yml
│   │   ├── stg_stripe__charges.sql
│   │   └── stg_stripe__customers.sql
│   └── salesforce/
│       ├── _salesforce__sources.yml
│       └── stg_salesforce__accounts.sql
├── intermediate/                # Silver Transformations: complex joins, business logic abstractions
│   ├── _intermediate__models.yml
│   └── int_orders_deduplicated.sql
└── marts/                       # Gold Presentation Layer: certified dimensional models for BI
    ├── core/
    │   ├── dim_customers.sql
    │   └── fct_orders.sql
    ├── finance/
    │   └── fct_monthly_mrr.sql
    └── marketing/
        └── fct_campaign_performance.sql
```

### Production Hardening & Gotchas
- **Layering Enforcements**: Configure CI linting rules (via `dbt-project-evaluator`) to enforce that `marts` models only reference `staging` or `intermediate` models and never query raw `sources` directly.""",

        "dbt-q-012": """### Conceptual Foundation & Core Architecture
Distinguishing clearly between **Staging** and **Mart** models is the bedrock of clean analytics engineering.

### Comparative Architectural Analysis:
| Dimension | Staging Models (`stg_`) | Mart Models (`fct_`, `dim_`) |
|---|---|---|
| **Data Source** | 1:1 with a single raw source table | Joins multiple staging and intermediate models |
| **Materialization** | `view` (zero storage footprint) | `table` or `incremental` (optimized for query speed) |
| **Business Logic** | **Zero business logic**: Only casting, renaming, light cleaning | **Heavy business logic**: Metrics, aggregations, SCD tracking |
| **Consumers** | Internal analytics engineering models only | End-user BI dashboards, reporting analysts, Reverse-ETL |
| **Grain** | Exact same grain as raw source data | Business-defined dimensional or factual grain |

### Production Hardening & Gotchas
- **Never Join in Staging**: Joining multiple tables in staging models couples independent source systems prematurely. Keep staging models strictly 1:1 with source tables and perform joins in intermediate or mart models.""",

        "dbt-q-013": """### Conceptual Foundation & Core Architecture
Uniform naming conventions eliminate ambiguity, simplify DAG navigation, and enable automated model selection using graph operators (`dbt run --select staging.*`).

### Standardized Naming Conventions:
1. **Sources**: Plural, lower_case, matching system name (e.g. `source('stripe', 'charges')`).
2. **Staging Models**: Prefix `stg_<source>__<entity>` (e.g. `stg_stripe__charges.sql`). Note the double underscore separating source from entity.
3. **Intermediate Models**: Prefix `int_<entity>__<transformation>` (e.g. `int_orders__deduplicated_by_customer.sql`).
4. **Dimensions**: Prefix `dim_<entity>` (e.g. `dim_customers.sql`, `dim_products.sql`).
5. **Facts**: Prefix `fct_<process>` (e.g. `fct_orders.sql`, `fct_transactions.sql`).

### Production Hardening & Gotchas
- **Singular vs Plural**: Maintain strict consistency: dimension and fact models should be plural entities (`dim_customers`, `fct_orders`).""",

        "dbt-q-014": """### Conceptual Foundation & Core Architecture
The **`dbt debug`** command is the primary diagnostic utility for validating that your local or CI/CD environment satisfies all runtime prerequisites before executing models.

### Low-Level Mechanics & Implementation
When you run `dbt debug`, dbt verifies:
1. **dbt Version & Python Environment**: Validates core dbt version and installed adapter plugins (e.g. `dbt-snowflake`, `dbt-databricks`).
2. **Project File Validity**: Verifies `dbt_project.yml` syntax and project root directory.
3. **Profiles Configuration**: Locates `profiles.yml` and validates YAML structure.
4. **Database Connection Handshake**: Establishes a physical network socket connection to the target database and verifies role permissions and default schema creation rights.

```bash
$ dbt debug
09:15:20  Running with dbt=1.7.4
09:15:21  dbt version: 1.7.4
09:15:21  python version: 3.11.4
09:15:21  Connection test: [OK connection ok]
09:15:21  All checks passed!
```

### Production Hardening & Gotchas
- **CI Pre-Flight Check**: Always execute `dbt debug` as the first step in CI/CD deployment pipelines to catch network misconfigurations or expired cloud service account credentials before starting compilation.""",

        "dbt-q-015": """### Conceptual Foundation & Core Architecture
The **`dbt deps`** command downloads and installs external open-source packages (such as `dbt-utils`, `dbt-expectations`, `codegen`, `elementary`) declared in your project's `packages.yml` file into the `dbt_packages/` directory.

### Low-Level Mechanics & Implementation
Defining packages in `packages.yml`:
```yaml
packages:
  - package: dbt-labs/dbt_utils
    version: 1.1.1
  - package: calogica/dbt_expectations
    version: 0.10.1
  - git: "https://github.com/enterprise/internal-dbt-macros.git"
    revision: v2.1.0
```
Run installation:
```bash
dbt deps
```

### Production Hardening & Gotchas
- **Pin Package Versions**: Always pin packages to exact semantic versions (`1.1.1`) or minor ranges (`[">=1.1.0", "<1.2.0"]`). Floating versions (`version: latest`) introduce non-deterministic builds and breaking changes during automated CI runs.
- **Gitignore `dbt_packages/`**: Add `dbt_packages/` to `.gitignore`. Never commit downloaded package source code directly to your project repository.""",

        "dbt-q-016": """### Conceptual Foundation & Core Architecture
The **`packages.yml`** file serves as the package manifest for a dbt project, analogous to `package.json` in Node.js or `requirements.txt` in Python. It allows data engineering teams to import modular Jinja macros, audit helpers, testing suites, and external dimensional models into their project.

### Low-Level Mechanics & Implementation
dbt packages can be sourced from:
1. **dbt Package Hub**: Official public registry (`package: <hub_name>`).
2. **Private Git Repositories**: Internal enterprise package libraries (`git: <repo_url>`).
3. **Local Directory Paths**: Internal submodules (`local: <relative_path>`).

```yaml
packages:
  - package: dbt-labs/dbt_utils
    version: 1.1.1
  - git: "git@github.com:my-org/core-governance-macros.git"
    revision: main
```

### Production Hardening & Gotchas
- **SSH Keys in CI/CD**: When pulling private enterprise packages via SSH Git URLs, ensure your CI runner has authorized deploy keys or personal access tokens configured in the build environment.""",

        "dbt-q-017": """### Conceptual Foundation & Core Architecture
**`dbt-utils`** is the standard utility library for dbt, providing an extensive collection of battle-tested Jinja macros, generic schema tests, and cross-database SQL generators.

### Key Capabilities & Code Examples:
1. **Surrogate Key Generation**:
```sql
SELECT
    {{ dbt_utils.generate_surrogate_key(['tenant_id', 'order_id']) }} AS order_sk,
    order_amount
FROM {{ ref('stg_orders') }}
```
2. **Pivot Columns**:
```sql
SELECT
    customer_id,
    {{ dbt_utils.pivot('payment_method', dbt_utils.get_column_values(ref('stg_payments'), 'payment_method')) }}
FROM {{ ref('stg_payments') }}
GROUP BY customer_id
```
3. **Deduplication Macro**:
```sql
{{ dbt_utils.deduplicate(
    relation=ref('stg_events'),
    partition_by='user_id',
    order_by='event_timestamp DESC'
) }}
```

### Production Hardening & Gotchas
- **Cross-Database Portability**: `dbt-utils` automatically translates SQL logic (e.g. string concatenation, date math) to the target platform dialect (Snowflake, Databricks, BigQuery, Fabric), making your project cloud-agnostic.""",

        "dbt-q-018": """### Conceptual Foundation & Core Architecture
**Incremental Models** transform only newly created or modified records since the previous pipeline execution rather than rebuilding the entire multi-billion row table from scratch. This drastically reduces cloud warehouse compute costs and pipeline runtimes.

### Low-Level Mechanics & Implementation
An incremental model uses the `is_incremental()` Jinja macro to conditionally inject filtering predicates during subsequent executions:

```sql
{{ config(
    materialized='incremental',
    unique_key='order_id',
    incremental_strategy='merge'
) }}

SELECT
    order_id,
    customer_id,
    order_status,
    order_amount,
    updated_at
FROM {{ ref('stg_orders') }}

{% if is_incremental() %}
    -- Filter only records modified since the latest existing timestamp
    WHERE updated_at >= (SELECT MAX(updated_at) FROM {{ this }})
{% endif %}
```

How dbt Compiles It:
- **First Run**: `is_incremental()` evaluates to `False`. dbt executes `CREATE TABLE target_table AS SELECT ...`.
- **Subsequent Runs**: `is_incremental()` evaluates to `True`. dbt loads delta records into a temporary staging table and executes an optimized `MERGE INTO target_table USING temp_stage ON target.order_id = temp_stage.order_id ...`.

### Production Hardening & Gotchas
- **Clock Skew & Buffer Window**: Always add a small lookback buffer to capture late-arriving data:
```sql
WHERE updated_at >= (SELECT DATEADD('hour', -3, MAX(updated_at)) FROM {{ this }})
```""",

        "dbt-q-019": """### Conceptual Foundation & Core Architecture
dbt **Snapshots** implement **Slowly Changing Dimensions Type 2 (SCD Type 2)** over mutable source tables. They preserve full historical change audit trails by recording point-in-time state changes and automatically managing validity date ranges (`dbt_valid_from`, `dbt_valid_to`) and active record flags.

### Low-Level Mechanics & Implementation
Snapshot definition in `snapshots/snap_customers.sql`:
```sql
{% snapshot snap_customers %}

{{ config(
    target_schema='snapshots',
    unique_key='customer_id',
    strategy='timestamp',
    updated_at='updated_at',
    invalidate_hard_deletes=True
) }}

SELECT
    customer_id,
    first_name,
    last_name,
    email,
    plan_tier,
    updated_at
FROM {{ source('raw_crm', 'customers') }}

{% endsnapshot %}
```
Run snapshots:
```bash
dbt snapshot
```

Under the hood:
1. On each execution, dbt compares current source records against the snapshot table.
2. If `updated_at` has changed for a customer, dbt:
   - Sets `dbt_valid_to = current_timestamp` on the old record.
   - Inserts a new row with the updated attributes and `dbt_valid_to = NULL`.

### Production Hardening & Gotchas
- **Timestamp Strategy vs Check Strategy**: If the source table lacks a reliable `updated_at` column, use `strategy='check'` and specify `check_cols=['plan_tier', 'email']`.
- **Hard Deletes**: Always enable `invalidate_hard_deletes=True` to close validity windows when records are deleted in source databases.""",

        "dbt-q-020": """### Conceptual Foundation & Core Architecture
**Exposures** document downstream consumers of your dbt models—such as Power BI dashboards, Tableau workbooks, machine learning models, and customer-facing APIs. Defining exposures in YAML establishes end-to-end lineage from raw sources to the executive boardroom.

### Low-Level Mechanics & Implementation
Exposures definition in `models/exposures.yml`:
```yaml
version: 2

exposures:
  - name: executive_financial_kpi_dashboard
    type: dashboard
    maturity: high
    url: "https://app.powerbi.com/groups/me/reports/849202"
    description: "Daily Executive Financial Performance Dashboard consumed by CFO and Board"
    owner:
      name: "Financial Analytics Team"
      email: "finance-bi@enterprise.com"
    depends_on:
      - ref('fct_monthly_mrr')
      - ref('dim_customers')
```

Benefits:
- **Impact Analysis**: When planning a schema refactor on `dim_customers`, engineers can immediately see all impacted Power BI dashboards in the dbt documentation graph.
- **Selective Testing**: Run tests specifically for models feeding critical executive dashboards:
```bash
dbt test --select +exposure:executive_financial_kpi_dashboard
```

### Production Hardening & Gotchas
- **Keep URLs Fresh**: Treat exposure URLs as living contracts; outdated links degrade confidence in documentation.""",

        "dbt-q-021": """### Conceptual Foundation & Core Architecture
In dbt, **Metrics** formalize business logic calculations (e.g. Monthly Recurring Revenue, Churn Rate, Active Users) centrally in code rather than having disparate formulas scattered across Power BI, Tableau, and SQL scripts. dbt Metrics feed into the **dbt Semantic Layer**, enabling unified multi-tool consumption.

### Low-Level Mechanics & Implementation
Defining a metric in `models/marts/finance/metrics.yml`:
```yaml
version: 2

metrics:
  - name: monthly_active_users
    label: "Monthly Active Users (MAU)"
    model: ref('fct_user_logins')
    description: "Distinct active user count over a 30-day trailing window"
    calculation_method: count_distinct
    expression: user_id
    timestamp: login_timestamp
    time_grains: [day, week, month]
    dimensions:
      - user_tier
      - billing_country
```

### Production Hardening & Gotchas
- **Semantic Layer Integration**: In modern dbt (1.6+), metrics are configured using **MetricFlow** semantic models (`semantic_models:`) which support complex multi-hop join dimensions and non-additive metrics.""",

        "dbt-q-022": """### Conceptual Foundation & Core Architecture
**dbt Analyses** are ad-hoc or exploratory SQL queries stored in the `analyses/` directory of a dbt project. Like models, analyses can leverage Jinja templating, `ref()`, and `source()`, but **dbt does not materialize them as tables or views in the database**.

### Low-Level Mechanics & Implementation
Save query in `analyses/customer_retention_cohort.sql`:
```sql
SELECT
    cohort_month,
    COUNT(DISTINCT customer_id) AS total_customers,
    SUM(gross_revenue) AS total_cohort_revenue
FROM {{ ref('fct_orders') }}
GROUP BY cohort_month
```
Compile the query:
```bash
dbt compile --select analyses/customer_retention_cohort
```
The compiled, raw SQL query is generated into `target/compiled/enterprise_analytics/analyses/customer_retention_cohort.sql`, ready to copy-paste into an ad-hoc reporting tool or notebook.

### Production Hardening & Gotchas
- **Auditing Queries**: Use analyses for complex migration parity audits or one-off executive queries that need dbt compilation benefits without cluttering the database catalog.""",

        "dbt-q-023": """### Conceptual Foundation & Core Architecture
The **`dbt compile`** command parses your dbt project, resolves all Jinja expressions, replaces `{{ ref(...) }}` and `{{ source(...) }}` with physical database table names, and writes the resulting pure SQL to the `target/compiled/` directory without executing the queries in the database.

### Low-Level Mechanics & Implementation
```bash
# Compile a specific model and view the raw output
dbt compile --select fct_orders
cat target/compiled/enterprise/models/marts/fct_orders.sql
```

Key Use Cases:
1. **SQL Inspection**: Verifying exactly what SQL dbt generates before running a heavy table build.
2. **CI AST Validation**: Fast syntax and dependency checking in continuous integration without spending database compute credits.
3. **Tool Integration**: Exporting compiled SQL to external query engines or lineage visualizers.

### Production Hardening & Gotchas
- **Zero Database Changes**: `dbt compile` performs zero DDL/DML in the warehouse; it only reads metadata information schema if schema checks are needed.""",

        "dbt-q-024": """### Conceptual Foundation & Core Architecture
A **Dry Run** in dbt verifies project integrity, dependency linkages, and SQL compilation without modifying physical database tables or incurring long-running warehouse compute charges.

### Low-Level Mechanics & Implementation
Techniques to achieve dry runs in dbt:
1. **`dbt compile`**: Validates syntax and dependency graph across all models.
2. **`--empty` flag (dbt 1.8+)**: Executes the compiled SQL with an appended `WHERE false` predicate, forcing the warehouse query planner to validate permissions, schema columns, and table references without scanning underlying storage data:
```bash
dbt build --empty --select marts.*
```

### Production Hardening & Gotchas
- **Warehouse Savings in CI**: Running `dbt build --empty` in pull request CI pipelines allows validating 1,000+ models in under 2 minutes for zero warehouse credit spend.""",

        "dbt-q-025": """### Conceptual Foundation & Core Architecture
The **`dbt clean`** command removes the `target/` and `dbt_packages/` directories generated during previous builds, compiles, or package installations.

### Low-Level Mechanics & Implementation
Configured via `clean-targets` in `dbt_project.yml`:
```yaml
clean-targets:
  - "target"
  - "dbt_packages"
```
Run command:
```bash
dbt clean
```

Why and When to Run `dbt clean`:
- **Corrupted Cache / Manifest**: If `dbt run` throws strange parsing errors or refuses to detect newly deleted models, cached artifacts in `target/manifest.json` may be stale.
- **Upgrading Packages**: Always run `dbt clean && dbt deps` when upgrading external dbt packages to wipe old dependencies.

### Production Hardening & Gotchas
- **Recompilation Overhead**: Running `dbt clean` deletes partial parsing caches, meaning the subsequent `dbt run` will take longer to compile from scratch.""",

        "dbt-q-026": """### Conceptual Foundation & Core Architecture
**Incremental Models** are the core mechanism for processing petabyte-scale datasets cost-effectively in dbt. They append or update only rows that have changed since the last execution.

### Low-Level Mechanics & Implementation
```sql
{{ config(
    materialized='incremental',
    unique_key='transaction_id',
    incremental_strategy='merge',
    on_schema_change='append_new_columns'
) }}

SELECT
    transaction_id,
    customer_id,
    transaction_amount,
    status,
    updated_at
FROM {{ ref('stg_transactions') }}

{% if is_incremental() %}
    WHERE updated_at >= (SELECT DATEADD('day', -1, MAX(updated_at)) FROM {{ this }})
{% endif %}
```

Incremental Strategies:
- **`merge` (Snowflake, Databricks, BigQuery)**: Performs an atomic `MERGE` statement matching on `unique_key`. Updates existing rows and inserts new rows.
- **`delete+insert`**: Deletes matching records from target before inserting new delta records.
- **`append`**: Insert-only for immutable event streams; bypasses merge scans.

### Production Hardening & Gotchas
- **Full Refresh Flag**: When introducing breaking structural changes or fixing historical data bugs, force a complete table rebuild via `dbt run --full-refresh --select <model_name>`.""",

        "dbt-q-027": """### Conceptual Foundation & Core Architecture
dbt **Snapshots** automate **Slowly Changing Dimensions Type 2 (SCD Type 2)**, creating an immutable history of mutable source tables without manual SQL windowing or cursor procedural code.

### Low-Level Mechanics & Implementation
```sql
{% snapshot snap_employee_salaries %}

{{ config(
    target_schema='snapshots',
    unique_key='employee_id',
    strategy='check',
    check_cols=['job_title', 'department', 'base_salary'],
    invalidate_hard_deletes=True
) }}

SELECT
    employee_id,
    job_title,
    department,
    base_salary
FROM {{ source('hr_system', 'employees') }}

{% endsnapshot %}
```
dbt automatically appends 4 metadata columns:
- `dbt_scd_id`: MD5 surrogate hash of unique key and timestamp.
- `dbt_updated_at`: When the change occurred.
- `dbt_valid_from`: Start of validity window.
- `dbt_valid_to`: End of validity window (NULL for current active record).

### Production Hardening & Gotchas
- **Downstream Querying**: Query current active records by filtering `WHERE dbt_valid_to IS NULL`.
- **Primary Key Uniqueness**: If the source table has duplicate `employee_id` records, the snapshot job will fail or corrupt validity intervals.""",

        "dbt-q-028": """### Conceptual Foundation & Core Architecture
By default, dbt creates database schemas named `<target_schema>_<custom_schema>` and physical tables named after the SQL file name. dbt allows overriding this behavior via **Custom Schema, Database, and Alias macros**.

### Low-Level Mechanics & Implementation
Override default schema generation in `macros/generate_schema_name.sql`:
```sql
{% macro generate_schema_name(custom_schema_name, node) -%}
    {%- set default_schema = target.schema -%}
    {%- if target.name == 'prod' and custom_schema_name is not none -%}
        {{ custom_schema_name | trim }}
    {%- else -%}
        {{ default_schema }}_{{ custom_schema_name | trim if custom_schema_name is not none else default_schema }}
    {%- endif -%}
{%- endmacro %}
```
In production (`target.name == 'prod'`), a model with `schema: finance` lands cleanly in `finance`. In dev, it lands in `dbt_jdoe_finance` to isolate developer tables.

Model Aliasing:
```sql
{{ config(alias='dim_enterprise_accounts') }}
SELECT * FROM ...
```

### Production Hardening & Gotchas
- **Multi-Tenant Conflicts**: Overriding `generate_schema_name` carelessly can cause developer runs to write directly into production schemas. Always enforce `target.name == 'prod'` checks.""",

        "dbt-q-029": """### Conceptual Foundation & Core Architecture
**Pre-hooks** and **Post-hooks** execute arbitrary SQL statements immediately before or after a model, seed, or snapshot is built. They are commonly used for database permission grants, auditing, temporary index generation, and vacuuming.

### Low-Level Mechanics & Implementation
Configuring hooks in `dbt_project.yml`:
```yaml
models:
  enterprise_analytics:
    marts:
      +post-hook:
        - "GRANT SELECT ON {{ this }} TO ROLE bi_reporting_role;"
        - "INSERT INTO audit.dbt_model_executions (model_name, executed_at) VALUES ('{{ this.name }}', CURRENT_TIMESTAMP());"
```
Or inside a specific model SQL file:
```sql
{{ config(
    pre_hook="ALTER SESSION SET TIMEZONE = 'UTC'",
    post_hook="GRANT SELECT ON {{ this }} TO ROLE analyst_role"
) }}

SELECT * FROM ...
```

### Production Hardening & Gotchas
- **Transaction Boundaries**: Be aware of your warehouse's DDL transaction semantics. If a post-hook fails in a database that does not support transactional DDL, the table build may succeed while permissions remain ungranted.""",

        "dbt-q-030": """### Conceptual Foundation & Core Architecture
**dbt Macros** are reusable pieces of SQL and Jinja code that function like functions in traditional programming languages. They eliminate boilerplate and enable parameterized, dynamic SQL generation across models.

### Low-Level Mechanics & Implementation
Creating a reusable macro in `macros/cents_to_dollars.sql`:
```sql
{% macro cents_to_dollars(column_name, scale=2) -%}
    ROUND(CAST(({{ column_name }} / 100.0) AS NUMERIC(18, {{ scale }})), {{ scale }})
{%- endmacro %}
```

Invoking the macro in a model:
```sql
SELECT
    order_id,
    {{ cents_to_dollars('subtotal_cents') }} AS subtotal_usd,
    {{ cents_to_dollars('tax_cents') }} AS tax_usd,
    {{ cents_to_dollars('shipping_cents') }} AS shipping_usd
FROM {{ ref('stg_orders') }}
```

### Production Hardening & Gotchas
- **Whitespace Control**: Use `{%-` and `-%}` to strip leading/trailing whitespace and newlines, ensuring compiled SQL remains clean and readable.
- **Over-Abstraction**: Avoid nesting macros 5 levels deep. Over-abstracted SQL becomes unreadable and difficult to debug when query execution issues arise.""",

        "dbt-q-031": """### Conceptual Foundation & Core Architecture
dbt leverages the **Jinja templating engine** to bring programming constructs—loops, conditionals, variables, and dictionary lookups—into SQL model authoring.

### Low-Level Mechanics & Implementation
Generating dynamic pivot aggregations using Jinja loops:
```sql
{% set payment_methods = ['credit_card', 'bank_transfer', 'paypal', 'gift_card'] %}

SELECT
    order_id,
    {% for method in payment_methods %}
    SUM(CASE WHEN payment_method = '{{ method }}' THEN amount ELSE 0 END) AS {{ method }}_amount
    {%- if not loop.last %},{% endif %}
    {% endfor %}
FROM {{ ref('stg_payments') }}
GROUP BY order_id
```

Compiled SQL Output:
```sql
SELECT
    order_id,
    SUM(CASE WHEN payment_method = 'credit_card' THEN amount ELSE 0 END) AS credit_card_amount,
    SUM(CASE WHEN payment_method = 'bank_transfer' THEN amount ELSE 0 END) AS bank_transfer_amount,
    SUM(CASE WHEN payment_method = 'paypal' THEN amount ELSE 0 END) AS paypal_amount,
    SUM(CASE WHEN payment_method = 'gift_card' THEN amount ELSE 0 END) AS gift_card_amount
FROM analytics_dev.stg_payments
GROUP BY order_id
```

### Production Hardening & Gotchas
- **Query Logging**: Use `{% do log("Processing model: " ~ this.name, info=True) %}` to output runtime diagnostic messages during pipeline execution.""",

        "dbt-q-032": """### Conceptual Foundation & Core Architecture
**`dbt-audit-helper`** is an indispensable dbt package used during migration projects (e.g. migrating legacy stored procedures or Airflow tasks to dbt). It provides macros that compare two relations (tables or views) row-by-row and column-by-column to guarantee mathematical data parity.

### Low-Level Mechanics & Implementation
Comparing a legacy production table against a refactored dbt model:
```sql
-- analyses/audit_fct_orders_parity.sql
{% set old_relation = adapter.get_relation(
    database="legacy_warehouse",
    schema="reporting",
    identifier="fct_orders_legacy"
) %}

{% set new_relation = ref('fct_orders') %}

{{ audit_helper.compare_relations(
    a_relation=old_relation,
    b_relation=new_relation,
    primary_key="order_id"
) }}
```

Running the audit:
```bash
dbt compile --select analyses/audit_fct_orders_parity
```
The resulting SQL outputs a summary showing:
- `% of rows matching perfectly`
- `Rows present in old but missing in new`
- `Rows present in new but missing in old`

### Production Hardening & Gotchas
- **Floating Point Mismatches**: Floating point rounding differences can cause audit comparison failures. Use `audit_helper.compare_column_values` with custom rounding thresholds.""",

        "dbt-q-033": """### Conceptual Foundation & Core Architecture
**Source Freshness** checks monitor the timeliness of raw data ingestion into your warehouse. Before running transformation models, dbt queries the maximum timestamp in a source table and asserts that data is not stale relative to SLA thresholds.

### Low-Level Mechanics & Implementation
Declaring freshness in `models/staging/_sources.yml`:
```yaml
version: 2

sources:
  - name: transactional_db
    database: raw_oltp
    schema: public
    freshness:
      warn_after: {count: 12, period: hour}
      error_after: {count: 24, period: hour}
    loaded_at_field: _fivetran_synced
    tables:
      - name: customers
      - name: orders
```

Executing freshness checks:
```bash
dbt source freshness
```
Under the hood, dbt executes:
`SELECT MAX(_fivetran_synced) FROM raw_oltp.public.orders;`
If `CURRENT_TIMESTAMP - MAX(_fivetran_synced)` exceeds 24 hours, dbt returns an `ERROR` exit code.

### Production Hardening & Gotchas
- **CI/CD Gating**: Run `dbt source freshness` before `dbt build` in production orchestration. If source data is stale, abort transformations immediately to avoid computing dashboards on outdated source data.""",

        "dbt-q-034": """### Conceptual Foundation & Core Architecture
The **`dbt build`** command combines models, tests, seeds, and snapshots into a single topological execution queue. It evaluates node dependencies dynamically and executes tasks in strict DAG order.

### Low-Level Mechanics & Implementation
When you execute `dbt build`:
1. **DAG Graph Traversal**: dbt calculates the dependency hierarchy across models, seeds, and tests.
2. **Topological Interleaving**:
   - Seed `lookup_countries` builds.
   - Tests on `lookup_countries` run immediately.
   - Model `stg_orders` builds.
   - Tests on `stg_orders` run immediately.
   - Mart `fct_orders` builds only if all upstream models and tests succeeded.
3. **Short-Circuiting**: If a test on `stg_orders` fails with `severity: error`, all downstream models (`fct_orders`, `fct_revenue_daily`) are skipped, preserving downstream data integrity.

### Production Hardening & Gotchas
- **Parallel Threads**: Increase execution parallelism via `--threads 16` to build independent parallel branches concurrently, reducing pipeline runtime by up to 60%.""",

        "dbt-q-035": """### Conceptual Foundation & Core Architecture
**Singular Tests** are custom SQL queries stored in the `tests/` directory of a dbt project designed to validate complex, multi-table business logic assertions that cannot be expressed via standard generic column tests (unique, not_null).

### Low-Level Mechanics & Implementation
Rule: A singular test query returns the **failing records**. If the query returns **0 rows**, the test passes. If it returns **1+ rows**, the test fails.

Example: Asserting that total order item line amounts must equal the order total:
```sql
-- tests/assert_order_total_matches_items.sql
WITH item_totals AS (
    SELECT
        order_id,
        SUM(line_item_amount) AS calculated_total
    FROM {{ ref('fct_order_items') }}
    GROUP BY order_id
),
orders AS (
    SELECT
        order_id,
        order_total_amount
    FROM {{ ref('fct_orders') }}
)

SELECT
    o.order_id,
    o.order_total_amount,
    i.calculated_total,
    ABS(o.order_total_amount - i.calculated_total) AS difference
FROM orders AS o
INNER JOIN item_totals AS i
    ON o.order_id = i.order_id
WHERE ABS(o.order_total_amount - i.calculated_total) > 0.01
```

### Production Hardening & Gotchas
- **Store Failures**: Pass `--store-failures` during `dbt test` to save failing audit rows directly into a dedicated database audit schema for analytical review.""",
    }
