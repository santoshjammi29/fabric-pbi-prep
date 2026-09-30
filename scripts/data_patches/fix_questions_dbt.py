# fix_questions_dbt.py
# Bespoke, expert answers for the 27 DBT questions that previously had template boilerplate.

def get_dbt_fixes():
    return {
        "dbt-easy-1": {
            "question": "How do you design a basic dbt project structure for a small data warehouse?",
            "answer": """A clean, maintainable dbt project structure follows functional layers reflecting the Medallion or Kimball dimensional modeling paradigm:

### Recommended Project Layout:
```text
my_dbt_project/
├── dbt_project.yml
├── profiles.yml
├── models/
│   ├── staging/                 # 1:1 view over raw source tables; clean, rename, type-cast
│   │   ├── stripe/
│   │   │   ├── _stripe__sources.yml
│   │   │   ├── stg_stripe__charges.sql
│   │   │   └── stg_stripe__customers.sql
│   ├── intermediate/            # Complex joins, business logic abstractions (ephemeral/view)
│   │   └── int_orders_deduped.sql
│   └── marts/                   # Dimensional models (facts & dims) for BI consumption (tables)
│       ├── core/
│       │   ├── dim_customers.sql
│       │   └── fct_orders.sql
│       └── finance/
│           └── fct_monthly_revenue.sql
├── tests/                       # Custom singular SQL tests
├── macros/                      # Reusable Jinja macros
└── seeds/                      # Static CSV lookup files (country codes, tax rates)
```
### Layering Rules:
- **`staging/`**: Only layer allowed to reference `source()`. Materialized as views to save warehouse storage and compute.
- **`intermediate/`**: Materialized as ephemeral or views; never queried directly by end-user BI tools.
- **`marts/`**: Materialized as tables or incremental models, serving certified analytics datasets."""
        },

        "dbt-easy-2": {
            "question": "What is the difference between deploying a dbt model as a view versus a table?",
            "answer": """In dbt, materialization config determines how SQL models are physically instantiated in the data warehouse:

### Materialization: `view`
- **Mechanism**: dbt issues `CREATE OR REPLACE VIEW model_name AS SELECT ...`. No data is copied or physically stored on disk.
- **Advantages**: Instantaneous build times (`dbt run` completes in seconds); consumes zero warehouse storage; always delivers up-to-the-second source data.
- **Disadvantages**: Query computation runs on every query scan. If the underlying view performs expensive multi-table joins or aggregations, downstream BI queries will suffer high latency and warehouse compute costs.
- **Best Use Case**: Staging models (`stg_`) and lightweight transformations.

### Materialization: `table`
- **Mechanism**: dbt creates a physical table (`CREATE TABLE ... AS SELECT ...`). The warehouse executes the query once during `dbt run` and writes the results to physical disk storage.
- **Advantages**: Lightning-fast downstream query performance; can be indexed, clustered (Snowflake clustering / Databricks Liquid Clustering), or partitioned.
- **Disadvantages**: Slower build time during `dbt run`; consumes warehouse disk storage; data is only as fresh as the last pipeline execution.
- **Best Use Case**: Gold dimensional models, fact tables, and high-concurrency BI reporting layers."""
        },

        "dbt-easy-3": {
            "question": "How do you use the `ref()` function to establish dependencies between models?",
            "answer": """The `{{ ref('model_name') }}` function is the core primitive that builds dbt's Directed Acyclic Graph (DAG) and ensures robust, environment-agnostic execution:

### Mechanics & Purpose:
1. **Automated DAG Dependency Resolution**:
   - When Model B includes `SELECT * FROM {{ ref('stg_orders') }}`, dbt parses this dependency at compilation time.
   - When executing `dbt run`, dbt guarantees that `stg_orders` is built and verified *before* Model B starts compiling.
2. **Environment & Schema Interpolation**:
   - Never hardcode physical schema names: `SELECT * FROM analytics_prod.public.stg_orders` will break in developer sandboxes.
   - `ref()` dynamically resolves the target database and schema based on the active user profile (`dbt_santosh.stg_orders` in dev, `analytics_prod.stg_orders` in prod).

### Implementation Snippet (`models/marts/fct_orders.sql`):
```sql
WITH orders AS (
    SELECT * FROM {{ ref('stg_ecommerce__orders') }}
),
payments AS (
    SELECT * FROM {{ ref('stg_stripe__payments') }}
)

SELECT 
    orders.order_id,
    orders.customer_id,
    orders.order_date,
    coalesce(payments.amount_usd, 0) AS total_amount_usd
FROM orders
LEFT JOIN payments ON orders.order_id = payments.order_id
```"""
        },

        "dbt-easy-4": {
            "question": "Design a basic testing strategy using dbt's out-of-the-box generic tests (unique, not_null).",
            "answer": """dbt provides four foundational out-of-the-box generic tests: `unique`, `not_null`, `accepted_values`, and `relationships`. Designing a basic testing strategy ensures data integrity before BI consumption:

### Schema Test Definition (`models/marts/schema.yml`):
```yaml
version: 2

models:
  - name: fct_orders
    description: "Certified fact table for customer orders"
    columns:
      - name: order_id
        description: "Primary key"
        tests:
          - unique
          - not_null

      - name: customer_id
        description: "Foreign key to dim_customers"
        tests:
          - not_null
          - relationships:
              to: ref('dim_customers')
              field: customer_id

      - name: order_status
        tests:
          - accepted_values:
              values: ['placed', 'shipped', 'delivered', 'returned']

      - name: total_amount_usd
        tests:
          - not_null
```
### Execution & CI/CD Strategy:
- Run `dbt test --select fct_orders` in CI pull requests.
- If a test fails (e.g., `unique` finds duplicate `order_id`s), dbt prints the exact SQL query used to isolate the violating rows (`select order_id, count(*) from ... group by 1 having count(*) > 1`), preventing corrupt data from entering production."""
        },

        "dbt-easy-5": {
            "question": "How do you configure dbt sources to map directly to raw data ingestion tables?",
            "answer": """dbt sources declare external database tables that are populated by third-party loaders (e.g., Fivetran, Airbyte, Kafka Connect) outside of dbt's control.

### Configuration (`models/staging/_sources.yml`):
```yaml
version: 2

sources:
  - name: raw_shopify
    database: raw_ingestion_db
    schema: shopify
    freshness:
      warn_after: {count: 12, period: hour}
      error_after: {count: 24, period: hour}
    loaded_at_field: _fivetran_synced
    tables:
      - name: orders
        description: "Raw checkout orders stream"
        columns:
          - name: id
            tests:
              - unique
              - not_null
      - name: customers
```
### Implementation in Staging Model (`stg_shopify__orders.sql`):
```sql
WITH source AS (
    SELECT * FROM {{ source('raw_shopify', 'orders') }}
)

SELECT 
    id AS order_id,
    customer_id,
    created_at AS order_created_at,
    total_price AS order_total_amount
FROM source
```
### Operational Observability:
- Execute `dbt source freshness` in scheduled DAGs to alert teams if upstream ingestion pipelines stall and fresh data stops arriving."""
        },

        "dbt-easy-6": {
            "question": "What is the system role of the `dbt_project.yml` file?",
            "answer": """The `dbt_project.yml` file is the master configuration manifest for a dbt project. It informs dbt that a directory is a valid dbt project and orchestrates global behaviors:

### System Roles & Key Sections:
1. **Project Metadata**: Declares project name, semantic version, and configuration-version.
2. **Directory Paths**: Specifies locations for models, tests, macros, seeds, snapshots, and compilation outputs:
```yaml
name: 'enterprise_analytics'
version: '2.4.0'
config-version: 2

profile: 'snowflake_dw'

model-paths: ["models"]
test-paths: ["tests"]
seed-paths: ["seeds"]
macro-paths: ["macros"]
target-path: "target"
clean-targets: ["target", "dbt_packages"]
```
3. **Hierarchical Model Configurations**: Applies materializations, schemas, and tags across directories without touching individual SQL files:
```yaml
models:
  enterprise_analytics:
    staging:
      +materialized: view
      +schema: staging
    marts:
      +materialized: table
      +schema: analytics
      +tags: ["daily_run", "bi_serving"]
```
4. **Variable Declarations (`vars`)**: Defines project-wide global constants and feature flags accessible across macros and models via `{{ var('variable_name') }}`."""
        },

        "dbt-easy-7": {
            "question": "How do you use dbt seeds to manage static mapping tables?",
            "answer": """`dbt seed` uploads local CSV files into the target data warehouse as physical tables, making them queryable via the standard `{{ ref('seed_name') }}` function.

### Best Practices & Workflow:
1. **File Location**: Place static CSV files in the `seeds/` folder (e.g., `seeds/country_iso_codes.csv`, `seeds/marketing_channel_mapping.csv`).
2. **Schema & Column Type Casting (`dbt_project.yml`)**:
   - Prevent CSV parsing errors (e.g., leading zeroes being stripped from zip codes) by explicitly casting column types:
```yaml
seeds:
  enterprise_analytics:
    country_iso_codes:
      +schema: reference_data
      +column_types:
          country_code: varchar(2)
          numeric_code: varchar(3)
          vat_percentage: numeric(5,2)
```
3. **Deployment**:
   - Run `dbt seed` during deployment pipelines or when mapping definitions change.
4. **Golden Rule of Seeds**:
   - Seeds are designed strictly for small, version-controlled reference datasets (<10,000 rows, <5 MB). Never use seeds to load high-volume transactional data; use proper ELT ingestion tools (Fivetran, Airbyte, Auto Loader) for production data."""
        },

        "dbt-easy-8": {
            "question": "Design a basic scheduling strategy for running a dbt project daily?",
            "answer": """A robust daily scheduling strategy guarantees that raw source freshness is verified, models are compiled and executed in topological order, and data quality assertions pass before exposing datasets to BI users.

### Execution Sequence:
1. **Step 1: Verify Source Freshness**:
   - Command: `dbt source freshness`
   - Purpose: Abort the pipeline immediately if upstream data loaders failed to sync within SLA.
2. **Step 2: Build Seeds & Snapshots**:
   - Command: `dbt build --select sourceStatus:fresh+ state:modified+` or `dbt snapshot && dbt seed`
   - Purpose: Capture SCD Type-2 dimension histories and refresh reference lookup tables.
3. **Step 3: Execute Staging & Marts with In-Line Testing**:
   - Command: `dbt build --select tag:daily_run`
   - **Why `dbt build` instead of `dbt run`?**: `dbt build` executes models and immediately runs their associated schema tests *before* moving down the dependency tree. If an intermediate test fails, downstream fact models are blocked from building with corrupt data.
4. **Step 4: Generate & Publish Documentation**:
   - Command: `dbt docs generate`
   - Purpose: Update the data catalog and lineage graphs on internal documentation portals.
5. **Orchestration**: Trigger via cron in dbt Cloud, or orchestrate as a DAG task in Apache Airflow / GitHub Actions."""
        },

        "dbt-easy-9": {
            "question": "How do you generate and host dbt documentation for business users?",
            "answer": """dbt automatically compiles model descriptions, column definitions, data tests, and visual interactive DAG lineage graphs into a lightweight static single-page application (SPA).

### Step-by-Step Generation & Hosting:
1. **Add Rich Markdown Documentation**:
   - Author column definitions and model descriptions inside `schema.yml` or standalone `.md` doc blocks:
```yaml
version: 2
models:
  - name: dim_customers
    description: '{{ doc("dim_customers_overview") }}'
```
2. **Compile Documentation Manifests**:
   - Run command: `dbt docs generate`
   - Output: Creates static artifacts in `target/`: `index.html`, `manifest.json`, and `catalog.json`.
3. **Enterprise Hosting Architectures**:
   - **dbt Cloud**: Automatically hosts documentation with integrated role-based access control (RBAC).
   - **Static Web Hosting (Zero Cost)**: Upload `index.html`, `manifest.json`, and `catalog.json` to an authenticated AWS S3 bucket (configured for static website hosting behind CloudFront), Azure Blob Storage, or GitHub Pages.
   - **Metadata Integration**: Ingest `manifest.json` into modern enterprise data catalogs (DataHub, Atlan, CastorDoc) to centralize enterprise governance."""
        },

        "dbt-easy-10": {
            "question": "What is the purpose of dbt profiles and how do you manage credentials securely?",
            "answer": """The `profiles.yml` file defines connection configurations (warehouse type, host, database, credentials, threads) for accessing cloud data platforms (Snowflake, BigQuery, Databricks, Redshift).

### Purpose:
- Decouples transformation code from physical infrastructure credentials.
- Allows the same codebase in Git to point to a developer's sandbox in `dev` and a service account in `prod`.

### Secure Credential Management:
1. **Never Commit `profiles.yml` to Git**:
   - Keep `profiles.yml` stored outside the project root (default `~/.dbt/profiles.yml`) or add it to `.gitignore`.
2. **Environment Variable Injection**:
   - In production CI/CD and orchestration runners, populate credentials dynamically from environment variables:
```yaml
enterprise_dw:
  target: dev
  outputs:
    dev:
      type: snowflake
      account: "{{ env_var('SNOWFLAKE_ACCOUNT') }}"
      user: "{{ env_var('DBT_USER') }}"
      password: "{{ env_var('DBT_PASSWORD') }}"
      role: transformer_dev
      database: analytics_dev
      warehouse: dev_wh
      schema: "dbt_{{ env_var('DBT_USER') }}"
      threads: 4
```
3. **Key-Pair / OAuth Authentication**:
   - In enterprise production environments, use RSA Key-Pair authentication or Cloud IAM OAuth rather than static passwords."""
        },

        "dbt-medium-12": {
            "question": "How do you design custom dbt macros to standardize complex SQL calculations across multiple models?",
            "answer": """dbt macros are reusable Jinja-templated SQL functions that encapsulate repetitive transformation logic, reduce boilerplate, and enforce DRY (Don't Repeat Yourself) principles across data teams.

### Architecture & Implementation:
1. **Macro Definition (`macros/cents_to_dollars.sql`)**:
```jinja
{% macro cents_to_dollars(column_name, decimal_places=2) -%}
    round(cast({{ column_name }} / 100.0 as numeric(18, {{ decimal_places }})), {{ decimal_places }})
{%- endmacro %}
```
2. **Complex Macro: Cross-Warehouse Dynamic Date Pivot (`macros/pivot_categories.sql`)**:
```jinja
{% macro pivot_column(source_table, column_to_pivot, value_column) %}
    {% set query %}
        select distinct {{ column_to_pivot }} as val from {{ source_table }} where {{ column_to_pivot }} is not null order by 1
    {% endset %}
    
    {% set results = run_query(query) %}
    {% if execute %}
        {% set values = results.columns[0].values() %}
    {% else %}
        {% set values = [] %}
    {% endif %}

    {% for val in values %}
        sum(case when {{ column_to_pivot }} = '{{ val }}' then {{ value_column }} else 0 end) as total_{{ val | lower | replace(' ', '_') }}
        {%- if not loop.last %},{% endif -%}
    {% endfor %}
{% endmacro %}
```
3. **Usage in SQL Model (`models/marts/fct_revenue.sql`)**:
```sql
SELECT 
    customer_id,
    {{ cents_to_dollars('raw_amount_cents') }} AS revenue_usd,
    {{ pivot_column(ref('stg_sales'), 'channel', 'amount') }}
FROM {{ ref('stg_sales') }}
GROUP BY 1, 2
```"""
        },

        "dbt-medium-14": {
            "question": "How do you implement a robust CI/CD pipeline using GitHub Actions to test dbt model changes before merging to production?",
            "answer": """A robust dbt CI/CD pipeline builds and tests *only modified models* against an isolated ephemeral schema in pull requests, verifying data contracts and SQL validity without running the entire multi-thousand model DAG.

### CI/CD Architecture with Slim CI:
1. **Prerequisite**: Store the production `manifest.json` in cloud storage (S3/GCS) during every production release.
2. **GitHub Actions Workflow (`.github/workflows/dbt_ci.yml`)**:
```yaml
name: dbt Slim CI
on:
  pull_request:
    branches: [main]

jobs:
  slim_ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install dbt-snowflake
      - name: Fetch Production Manifest
        run: aws s3 cp s3://enterprise-dbt-artifacts/prod/manifest.json ./prod_manifest/manifest.json
      - name: Run Slim CI Build
        run: |
          dbt build \
            --select state:modified+ \
            --defer \
            --state ./prod_manifest \
            --target ci \
            --threads 8
        env:
          DBT_SCHEMA: "ci_pr_${{ github.event.pull_request.number }}"
          SNOWFLAKE_PASSWORD: ${{ secrets.DBT_CI_PASSWORD }}
```
3. **Why `--defer` & `--state` Matter**:
   - `--select state:modified+`: Compiles only altered models and their downstream descendants.
   - `--defer`: If an un-modified upstream model is referenced, dbt points to the existing production table instead of failing or rebuilding it, reducing CI runtimes from 45 minutes to 90 seconds.
4. **PR Cleanup**: An automated workflow drops the ephemeral `ci_pr_123` schema upon PR closure."""
        },

        "dbt-medium-15": {
            "question": "Architect a dbt deployment utilizing multiple environments (dev, staging, prod) and separate schemas?",
            "answer": """In enterprise data platforms, multi-environment isolation prevents development experimentation from contaminating production data or locking production tables.

### Architecture Topology:
- **Development (`dev`)**: Developers work in developer-specific sandbox schemas (`dbt_<username>_analytics`) within a dev database, using sampled source data or production views.
- **Staging / Test (`staging`)**: Ephemeral or shared schema used by CI/CD pull request validation pipelines.
- **Production (`prod`)**: Automated service principals run scheduled jobs writing to certified production schemas (`analytics.public`, `analytics.finance`).

### Dynamic Schema Customization (`macros/generate_schema_name.sql`):
dbt defaults to appending custom schemas to the target schema (`dev_finance`). Override the built-in macro to enforce enterprise naming:
```jinja
{% macro generate_schema_name(custom_schema_name, node) -%}
    {%- set default_schema = target.schema -%}
    {%- if target.name == 'prod' -%}
        {# In production, use the exact clean business schema name #}
        {%- if custom_schema_name is none -%}
            {{ default_schema }}
        {%- else -%}
            {{ custom_schema_name | trim }}
        {%- endif -%}
    {%- else -%}
        {# In dev/ci, prefix custom schema with developer's personal username #}
        {%- if custom_schema_name is none -%}
            {{ default_schema }}
        {%- else -%}
            {{ default_schema }}_{{ custom_schema_name | trim }}
        {%- endif -%}
    {%- endif -%}
{%- endmacro %}
```
### Security**: Developers are granted `USAGE` on prod sources, but zero write permissions in production databases."""
        },

        "dbt-medium-16": {
            "question": "How do you use dbt hooks (pre-hook, post-hook) to manage database permissions and indexing?",
            "answer": """dbt hooks execute raw SQL DDL/DML statements at designated lifecycle stages: before a project run (`on-run-start`), after a project run (`on-run-end`), or immediately before/after a specific model is built (`pre-hook`, `post-hook`).

### Key Use Cases & Implementation:
1. **Automated RBAC Grants Post-Model Creation**:
   - In cloud warehouses, creating a new table overwrites object ownership and clears previous table-level grants. Use `post-hook` to reapply privileges:
```yaml
# dbt_project.yml
models:
  enterprise_analytics:
    marts:
      +post-hook:
        - "GRANT SELECT ON {{ this }} TO ROLE reporting_analysts;"
        - "GRANT SELECT ON {{ this }} TO ROLE bi_service_principal;"
```
2. **Relational Indexing (PostgreSQL / Redshift / Synapse)**:
   - For traditional relational databases requiring B-tree or clustered indices:
```sql
{{ config(
    materialized='table',
    post_hook=[
      "CREATE INDEX IF NOT EXISTS idx_{{ this.name }}_customer_id ON {{ this }} (customer_id);",
      "ANALYZE {{ this }};"
    ]
) }}

SELECT * FROM {{ ref('stg_orders') }}
```
3. **Session Parameter Tuning (`pre-hook`)**:
   - In Snowflake or Databricks, set session variables before running heavy models:
     `pre-hook: "ALTER SESSION SET TIMEZONE = 'UTC';"`"""
        },

        "dbt-medium-17": {
            "question": "Design a strategy for integrating external orchestration tools like Airflow or Dagster to trigger complex dbt runs?",
            "answer": """Running `dbt run` as a single monolithic bash script inside an external orchestrator obscures task dependencies, turning hundreds of transformations into a black box.

### Modern Integration Strategies:
1. **Astronomer Cosmos (Airflow Integration / Recommended)**:
   - Cosmos parses the compiled `manifest.json` and renders each individual dbt model as a native, visual Airflow TaskInstance within an Airflow TaskGroup.
   - If a specific dbt model fails, Airflow alerts on that exact model node and enables engineers to restart execution from that node downstream.
```python
from cosmos import DbtDag, ProjectConfig, ProfileConfig
from datetime import datetime

dbt_airflow_dag = DbtDag(
    project_config=ProjectConfig("/opt/airflow/dbt_project"),
    profile_config=ProfileConfig(profile_name="snowflake_dw", target_name="prod"),
    dag_id="dbt_cosmos_orchestration",
    start_date=datetime(2024, 1, 1),
    schedule="@daily"
)
```
2. **Dagster Software-Defined Assets (SDA)**:
   - Dagster natively represents dbt models as software-defined assets, offering real-time lineage, data cataloging, and column-level observability.
3. **dbt Cloud API Webhooks**:
   - Orchestrator triggers jobs via the dbt Cloud REST API (`POST /api/v2/accounts/{account_id}/jobs/{job_id}/run/`) and polls until completion using deferrable operators."""
        },

        "dbt-medium-18": {
            "question": "How do you optimize dbt compilation and run times for a project containing over 500 dependent models?",
            "answer": """As dbt projects expand past 500 models, compilation times can reach 5-10 minutes and full builds can take hours. Optimizing execution requires systemic tuning:

### Optimization Blueprint:
1. **Thread Concurrency Optimization**:
   - In `profiles.yml`, increase `threads` (e.g., from 4 to 16 or 32). dbt parallelizes execution of all independent DAG branches simultaneously up to the thread limit.
2. **Eliminate Run-Time Introspection in Macros**:
   - Avoid calling `run_query()` or database information schema queries inside Jinja loops evaluated during compilation. Each query introduces network round-trips that multiply compile time.
3. **Adopt Incremental Materializations**:
   - Transition large fact tables from `table` materialization to `incremental` with `unique_key` and clustering keys, processing only the last 3 days of data instead of scanning multi-terabyte histories.
4. **Use Sub-DAG Selection Selectors**:
   - Define custom selectors in `selectors.yml` to split execution into business cadence tiers:
     `dbt build --selector hourly_financial_models`
     `dbt build --selector daily_ml_features`
5. **Ephemerals vs Views**:
   - Excessive `ephemeral` models create massive nested CTEs (Common Table Expressions) that overwhelm cloud warehouse SQL query planners. Convert deep chains of ephemeral models into physical views or intermediate tables."""
        },

        "dbt-medium-19": {
            "question": "Architect a custom schema test using dbt to validate complex business logic across joined tables?",
            "answer": """While built-in generic tests (`unique`, `not_null`) check single columns, mission-critical pipelines require cross-table relational assertions (e.g., asserting that total order line item revenue matches the parent order total).

### Architectural Implementation:
1. **Generic Custom Test Macro (`macros/test_equality_across_tables.sql`)**:
   - Define reusable test logic that returns failing rows. In dbt, a test passes if the query returns **0 rows**:
```jinja
{% test line_item_sum_matches_order(model, order_id_column, expected_total_column, line_item_model, line_amount_column) %}

WITH order_totals AS (
    SELECT 
        {{ order_id_column }} AS order_id,
        {{ expected_total_column }} AS header_amount
    FROM {{ model }}
),
calculated_sums AS (
    SELECT 
        {{ order_id_column }} AS order_id,
        round(sum({{ line_amount_column }}), 2) AS calculated_amount
    FROM {{ line_item_model }}
    GROUP BY 1
)

SELECT 
    o.order_id,
    o.header_amount,
    c.calculated_amount,
    abs(o.header_amount - c.calculated_amount) AS discrepancy
FROM order_totals o
JOIN calculated_sums c ON o.order_id = c.order_id
WHERE abs(o.header_amount - c.calculated_amount) > 0.01

{% endtest %}
```
2. **Schema Declaration (`models/marts/schema.yml`)**:
```yaml
models:
  - name: fct_orders
    tests:
      - line_item_sum_matches_order:
          order_id_column: order_id
          expected_total_column: total_amount_usd
          line_item_model: ref('fct_order_line_items')
          line_amount_column: line_total_usd
```
3. **Execution**: `dbt test --select fct_orders` flags any discrepancies instantly."""
        },

        "dbt-medium-20": {
            "question": "How do you manage dbt packages to reuse code and standard configurations across different project teams?",
            "answer": """In large organizations, sharing code, custom macros, and standard data models across disparate repositories requires managing dbt packages via the package management system.

### Architecture & Best Practices:
1. **`packages.yml` Configuration**:
   - Declare package dependencies from the dbt Hub, private Git repositories, or local subdirectories:
```yaml
packages:
  # Public open-source community utilities
  - package: dbt-labs/dbt_utils
    version: 1.1.1
  - package: calogica/dbt_expectations
    version: 0.9.0

  # Internal private enterprise package
  - git: "git@github.com:my-org/dbt-enterprise-macros.git"
    revision: v2.1.0
```
2. **Installation & Pinning**:
   - Run `dbt deps` to pull packages into the `dbt_packages/` directory.
   - Always pin specific semantic versions or Git tags (`revision: v2.1.0`), never untracked branches (`main`), to prevent breaking production builds when upstream packages release updates.
3. **Internal Package Authoring**:
   - Extract company-wide transformations (e.g., fiscal calendar generation, GDPR hashing macros) into a shared Git repo containing a valid `dbt_project.yml`.
4. **CI/CD Lockfile Hygiene**:
   - Cache `dbt_packages/` in CI runners to minimize redundant network pulls during high-frequency PR checks."""
        },

        "dbt-hard-21": {
            "question": "Architect a data mesh deployment where multiple autonomous domains manage their own decentralized dbt projects while sharing governed data products?",
            "answer": """In a decentralized Data Mesh, monolithic dbt repositories become a development bottleneck. Multiple autonomous domain teams (Marketing, Supply Chain, Finance) author independent dbt projects while consuming governed cross-domain datasets.

### Modern Architecture: dbt Mesh (Multi-Project)
1. **Model Governance & Access Levels**:
   - Domain teams designate models as `public`, `protected`, or `private`:
```yaml
# supply_chain/models/marts/public_inventory.yml
models:
  - name: dim_inventory_current
    access: public # Governed public contract for other domains
    contract:
      enforced: true
    columns:
      - name: warehouse_id
        data_type: varchar
      - name: sku_id
        data_type: varchar
      - name: available_stock
        data_type: integer
```
2. **Cross-Project References (`dependencies.yml`)**:
   - The Finance dbt project defines Supply Chain as an upstream dependency:
```yaml
# finance/dependencies.yml
projects:
  - name: supply_chain
```
   - In Finance models, consume public domain models zero-copy:
     `SELECT * FROM {{ ref('supply_chain', 'dim_inventory_current') }}`
3. **Schema Contracts Enforced**:
   - If the Supply Chain team introduces a breaking change (e.g., dropping `sku_id`), dbt compilation fails in CI, preventing downstream financial breaks.
4. **Decoupled CI/CD**: Each domain team runs independent CI/CD test suites and deploys on autonomous schedules."""
        },

        "dbt-hard-22": {
            "question": "How do you design a zero-downtime, blue-green deployment strategy for a massive dbt project running on a highly concurrent cloud data warehouse?",
            "answer": """Executing `dbt run` directly against live production schemas creates transient lock contention and risks exposing partially materialized tables or failed runs to active BI dashboards.

### Zero-Downtime Blue-Green Architecture:
1. **Schema Clones / Swap Architecture (Snowflake / Databricks / BigQuery)**:
   - Maintain two environments: Blue (active production serving BI queries) and Green (standby deployment target).
2. **Execution Flow**:
   - **Step 1: Clone Production Metadata (Zero-Copy)**:
     `CREATE SCHEMA analytics_staging CLONE analytics_production;`
     (Instantaneous in Snowflake/Databricks; consumes zero storage).
   - **Step 2: Run dbt in Staging Target**:
     Execute `dbt build --target staging` writing exclusively to `analytics_staging`.
     All incremental models, tables, and tests execute completely isolated from live dashboard users.
   - **Step 3: Atomic Schema Swap**:
     Once all models and schema tests pass with 100% success, execute an atomic metadata pointer swap:
     `ALTER SCHEMA analytics_production SWAP WITH analytics_staging;`
     (Completes in sub-second duration with zero query downtime).
   - **Step 4: Cleanup**:
     Drop or retain `analytics_staging` as an instant rollback target for 24 hours.
3. **Benefits**: Live users experience zero table-locking or intermediate partial table states; if any dbt test fails in Step 2, the swap never occurs, preserving 100% production uptime."""
        },

        "dbt-hard-23": {
            "question": "Design a custom dbt materialization strategy for an unsupported database or specific performance-oriented data lake format (like advanced Apache Iceberg configurations)?",
            "answer": """When built-in materializations (`table`, `view`, `incremental`) do not support specific lakehouse features (e.g., Apache Iceberg dynamic branch writes, hidden partitioning, or custom compaction commands), data architects author custom materialization macros.

### Architecture & Implementation:
1. **Define Materialization Macro (`macros/materializations/iceberg_snapshot.sql`)**:
```jinja
{% materialization iceberg_snapshot, default %}
    {%- set target_relation = this -%}
    {%- set existing_relation = load_relation(this) -%}
    {%- set tmp_relation = make_temp_relation(this) -%}

    -- Grab configuration parameters
    {%- set partition_by = config.get('partition_by', none) -%}
    {%- set write_branch = config.get('write_branch', 'audit_branch') -%}

    {{ run_hooks('pre-hooks') }}

    -- 1. Create Iceberg branch if missing
    {% call statement('create_branch') -%}
        ALTER TABLE {{ target_relation }} CREATE BRANCH IF NOT EXISTS {{ write_branch }};
    {%- endcall %}

    -- 2. Execute SQL into isolated branch
    {% call statement('main') -%}
        INSERT INTO {{ target_relation }} /*+ WRITE_BRANCH('{{ write_branch }}') */
        {{ sql }}
    {%- endcall %}

    -- 3. Run validation checks
    -- 4. Fast-forward merge branch to main
    {% call statement('merge_branch') -%}
        ALTER TABLE {{ target_relation }} FAST FORWARD {{ write_branch }} TO main;
    {%- endcall %}

    {{ run_hooks('post-hooks') }}

    {{ return({'relations': [target_relation]}) }}
{% endmaterialization %}
```
2. **Usage in SQL Model**:
```sql
{{ config(
    materialized='iceberg_snapshot',
    partition_by='days(transaction_timestamp)',
    write_branch='daily_batch'
) }}

SELECT * FROM {{ ref('stg_events') }}
```"""
        },

        "dbt-hard-24": {
            "question": "Architect a real-time analytics pipeline that integrates streaming data transformations (e.g., using Materialize or Flink) seamlessly with batch dbt projects?",
            "answer": """Unifying real-time streaming engines (Apache Flink, Spark Streaming, Materialize) with batch dbt environments prevents duplicate transformation logic across analytical layers.

### Architectural Blueprint:
1. **Streaming Foundation Layer (Sub-Second Ingestion)**:
   - Kafka events flow into Apache Flink or Materialize.
   - Flink executes continuous stateful joins and aggregates, materializing real-time materialized views or streaming micro-batches into Delta/Iceberg tables.
2. **dbt-materialize / Hybrid Adapter**:
   - Use specialized adapters (like `dbt-materialize`) where dbt compiles and manages continuous streaming SQL materializations (`materialized_view`, `sink`).
   - Models run continuously in the streaming engine rather than on a cron schedule:
```sql
{{ config(materialized='materialized_view') }}

SELECT 
    window_start,
    customer_id,
    count(*) as purchase_count,
    sum(amount) as total_spent
FROM {{ source('realtime_kafka', 'purchases') }}
GROUP BY window_start, customer_id
```
3. **Lambda / Kappa Serving Union**:
   - The batch dbt project builds historical Gold dimensions daily.
   - A final serving model unions historical verified batch data with the live streaming delta:
```sql
SELECT * FROM {{ ref('fct_historical_sales_batch') }}
UNION ALL
SELECT * FROM {{ source('streaming_sink', 'live_today_sales') }}
```
4. **Governance**: Unified lineage graph in dbt showing the full path from raw streaming Kafka topics down to final unified reporting views."""
        },

        "dbt-hard-25": {
            "question": "How do you build an automated impact analysis system that prevents dbt PR merges if they break downstream BI dashboards or external APIs?",
            "answer": """Dropping or renaming a column in a core dbt model can silently break hundreds of Tableau, Power BI, or Looker dashboards. An automated impact analysis gate prevents breaking changes before merge.

### End-to-End Impact Analysis Architecture:
1. **Metadata Ingestion & BI Lineage Graph**:
   - Extract column-level metadata and field references from BI APIs (Tableau Metadata API, Power BI Scanner API, LookML parser).
   - Ingest into a unified lineage graph (DataHub, Atlan, or a dedicated Neo4j/PostgreSQL graph).
2. **Pull Request GitHub Action Analyzer**:
   - On PR trigger, parse the git diff and compile dbt manifest:
     `dbt compile --select state:modified+ --defer --state ./prod_manifest`
   - Compare `manifest.json` against `prod_manifest/manifest.json` to identify:
     - Dropped columns
     - Renamed fields
     - Altered data types (e.g., `VARCHAR` -> `INTEGER`)
3. **Cross-Reference with BI Lineage**:
   - Query the graph for all downstream BI fields depending on the modified columns:
```python
# Impact Check Script
impacted_reports = query_lineage_graph(
    model="fct_orders", 
    deleted_columns=["customer_discount_code"]
)
if impacted_reports:
    post_github_pr_comment(
        f"🚨 Breaking Change! Dropping 'customer_discount_code' breaks {len(impacted_reports)} Power BI reports!"
    )
    sys.exit(1) # Block PR merge
```
4. **Enforce Semantic Versioning & Deprecation Warnings**: Deprecate columns across a 30-day window using dbt column tags before physical removal."""
        },

        "dbt-hard-26": {
            "question": "Design a comprehensive cost-optimization framework for a dbt project that programmatically identifies and deprecates unused or overly expensive models?",
            "answer": """In large cloud data warehouses (Snowflake, BigQuery, Databricks), runaway dbt projects can drive hundreds of thousands of dollars in unnecessary compute spend.

### FinOps Optimization Framework:
1. **Audit Query Log Ingestion**:
   - Query warehouse system audit tables (Snowflake `ACCOUNT_USAGE.QUERY_HISTORY`, BigQuery `INFORMATION_SCHEMA.JOBS_BY_PROJECT`, Databricks `system.billing.usage`).
   - Extract execution duration, bytes scanned, credits/DBUs consumed, and `dbt_model_name` (injected via dbt query comments).
2. **Identify High-Cost Models (The Top 5% Spenders)**:
   - Identify models consuming disproportionate compute:
```sql
SELECT 
    query_tag_json:dbt_model AS model_name,
    count(*) AS execution_count,
    round(sum(total_elapsed_time)/1000/60, 2) AS total_runtime_mins,
    round(sum(credits_used_cloud_services + credits_used), 2) AS total_credits_spent
FROM snowflake.account_usage.query_history
WHERE start_time >= dateadd('day', -30, current_date())
  AND query_tag_json:dbt_model IS NOT NULL
GROUP BY 1
ORDER BY total_credits_spent DESC
LIMIT 20;
```
3. **Identify Zombie / Unused Models**:
   - Join model tables with query read logs. If a model has zero `SELECT` queries from BI tools or end users over 60 days, flag it as a **Zombie Model**.
4. **Automated Deprecation & Remediation**:
   - Tag zombie models in `dbt_project.yml` with `deprecated: true`.
   - Downgrade high-cost models from full table rebuilds to incremental materialization with Liquid Clustering/clustering keys, reducing warehouse credit burn by 40-70%."""
        },

        "dbt-hard-28": {
            "question": "Architect a system for dynamic model generation in dbt where SQL files are created entirely on the fly based on metadata from an upstream application registry?",
            "answer": """When ingesting 500+ microservice database tables or SaaS endpoints with identical transformation shapes, authoring 500 manual `.sql` files creates unnecessary maintenance overhead. Dynamic model generation programmatically generates dbt code from schema metadata.

### Architectural Blueprint:
1. **Upstream Schema Registry / Contract Store**:
   - Transactional microservices publish schema definitions (JSON Schema, OpenAPI specs, or protobufs) to an API catalog or Git repository.
2. **Model Code Generation Pre-Compiler (Python CLI)**:
   - Run a Python code generation script during CI/CD prior to `dbt compile`:
```python
import yaml
from jinja2 import Template

with open("registry/schemas.yml") as f:
    schemas = yaml.safe_load(f)

template = Template(\"\"\"
{{ config(materialized='view', tags=['auto_generated']) }}

WITH source AS (
    SELECT * FROM {{ source('raw_data', '{{ table_name }}') }}
)
SELECT
    {% for col in columns %}
    {{ col.name }}::{{ col.data_type }} AS {{ col.name }}{% if not loop.last %},{% endif %}
    {% endfor %}
FROM source
\"\"\")

for table in schemas["tables"]:
    rendered_sql = template.render(table_name=table["name"], columns=table["columns"])
    with open(f"models/staging/generated/stg_{table['name']}.sql", "w") as out:
        out.write(rendered_sql)
```
3. **Automated Schema YAML Generation**:
   - Simultaneously output `_models_generated.yml` with primary key `unique` and `not_null` tests.
4. **Safety Verification**:
   - Run `dbt compile` against the generated directory; fail CI if any syntax or circular dependency errors are detected."""
        },

        "dbt-hard-29": {
            "question": "How would you design a data contract implementation natively within dbt to enforce strict schema adherence between data producers and data consumers?",
            "answer": """Data contracts prevent upstream application engineers or data producers from silently changing data types, dropping columns, or violating nullability constraints.

### Native dbt Model Contracts (dbt 1.5+):
1. **Contract Definition (`models/marts/fct_payments.yml`)**:
   - Set `contract: {enforced: true}`. Every column must have an explicit `data_type` and constraints:
```yaml
version: 2

models:
  - name: fct_payments
    description: "Certified payments fact model governed by enterprise data contract"
    config:
      contract:
        enforced: true
    columns:
      - name: payment_id
        data_type: varchar
        constraints:
          - type: not_null
          - type: primary_key
      - name: customer_id
        data_type: varchar
        constraints:
          - type: not_null
      - name: amount_cents
        data_type: integer
        constraints:
          - type: check
            expression: "amount_cents >= 0"
      - name: currency
        data_type: varchar
```
2. **Build-Time Enforcement**:
   - When executing `dbt build`, dbt injects column data types directly into DDL compilation:
     `CREATE TABLE fct_payments (payment_id varchar NOT NULL, ...)`
   - If the SQL query returns a `FLOAT` for `amount_cents` instead of `INTEGER`, or if an expected column is missing, dbt **fails compilation before writing data**.
3. **Breaking Change Protection**:
   - If a pull request modifies an existing column data type or removes a column, dbt contractual validation aborts the CI pipeline, requiring producer-consumer sign-off."""
        },

        "dbt-hard-30": {
            "question": "Design a distributed dbt execution architecture that parallelizes massive monolithic runs across multiple distinct virtual warehouses to aggressively minimize runtime?",
            "answer": """In enterprise environments with 3,000+ dbt models, executing everything on a single large warehouse wastes money and causes queue bottlenecks. A distributed multi-warehouse execution architecture partitions work across dedicated compute engines.

### Distributed Architecture:
1. **Workload Segmentation & Tagging**:
   - Categorize models by domain and compute profile:
     - `heavy_transforms`: Large incremental fact models with massive joins.
     - `lightweight_views`: Staging views and simple dimension lookups.
     - `ml_feature_store`: Heavy vector and numerical aggregations.
2. **Dynamic Warehouse Assignment Macro (`macros/set_warehouse.sql`)**:
   - Dynamically route models to specific virtual warehouses based on model tags or folder paths:
```jinja
{% macro set_target_warehouse() %}
    {% if 'heavy_transforms' in config.get('tags', []) %}
        {% do return('COMPUTE_WH_XLARGE') %}
    {% elif 'ml_feature_store' in config.get('tags', []) %}
        {% do return('COMPUTE_WH_SNOWPARK') %}
    {% else %}
        {% do return('COMPUTE_WH_MEDIUM') %}
    {% endif %}
{% endmacro %}
```
   - In `dbt_project.yml`:
```yaml
models:
  +pre-hook: "USE WAREHOUSE {{ set_target_warehouse() }};"
```
3. **Parallelized Graph Partitioning (Astronomer Cosmos / Prefect / Airflow)**:
   - Decompose the global dbt DAG into independent topological subgraphs.
   - Dispatch separate dbt worker containers concurrently across independent warehouses, syncing via intermediate cross-warehouse tables.
4. **Cost Containment**: Warehouses auto-suspend after 60 seconds of inactivity, spinning up compute only when active tasks are scheduled."""
        }
    }
