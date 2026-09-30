# scripts/data_patches/patch_dbt_36_to_75.py
"""
Bespoke, expert answers for dbt questions 036 to 075.
All answers follow the Phase structure with code snippets, configuration, and production gotchas.
"""

def get_dbt_36_to_75():
    return {
        "dbt-q-036": """### Conceptual Foundation & Core Architecture
In enterprise analytics engineering, **dbt documentation** functions as an automated data dictionary and visual catalog. By incorporating **exposures** (dashboards, ML models) and **metrics** into documentation generation, teams provide end-to-end transparency into how upstream data models feed executive reporting.

### Low-Level Mechanics & Implementation
```bash
# Generate manifest.json and catalog.json including metrics and exposures
dbt docs generate
```
In `dbt docs`, exposures appear as downstream nodes on the interactive DAG graph. Analysts can click on any Power BI exposure to trace its upstream lineage through Gold marts, Silver intermediate models, and Bronze raw sources, inspecting column types and test coverage at each step.

### Production Hardening & Gotchas
- **Catalog Generation Overhead**: `dbt docs generate` queries the database's `information_schema` to populate `catalog.json`. On massive enterprise warehouses with 50,000+ tables, this can take several minutes. Scope documentation generation to specific schemas using `--select` where appropriate.""",

        "dbt-q-037": """### Conceptual Foundation & Core Architecture
**Cross-database compatibility macros** allow dbt code to execute seamlessly across disparate data platform dialects (Snowflake, Databricks, BigQuery, Postgres, Fabric) without vendor lock-in.

### Low-Level Mechanics & Implementation
dbt provides native cross-database SQL macros through the `dbt` namespace and `dbt-utils`:
- `{{ dbt.concat(["first_name", "' '", "last_name"]) }}`: Compiles to `||` in Snowflake/Postgres, `CONCAT()` in BigQuery, or `+` in T-SQL.
- `{{ dbt.dateadd('day', -7, 'current_timestamp()') }}`: Generates `DATEADD()` in Snowflake vs `date_add()` in Databricks Spark SQL.
- `{{ dbt.datediff('start_date', 'end_date', 'month') }}`: Abstracts date interval arithmetic across engines.

Custom Implementation with `adapter.dispatch`:
```sql
{% macro hash_id(column_name) %}
    {{ adapter.dispatch('hash_id', 'my_package')(column_name) }}
{% endmacro %}

{% macro default__hash_id(column_name) %}
    MD5({{ column_name }})
{% endmacro %}

{% macro bigquery__hash_id(column_name) %}
    TO_HEX(MD5({{ column_name }}))
{% endmacro %}
```

### Production Hardening & Gotchas
- **Avoid Raw Dialect Functions**: Never use raw database-specific functions (e.g. Snowflake `IFF()` or BigQuery `PARSE_DATE()`) in shared macros; always use portable ANSI SQL or `dbt.dispatch` wrappers.""",

        "dbt-q-038": """### Conceptual Foundation & Core Architecture
The **dbt Semantic Layer** (powered by MetricFlow) provides a centralized semantic definition layer where metrics, entities, and dimensions are defined once in code. Downstream BI applications (Power BI, Tableau, Hex, Google Sheets) query metrics through APIs without recalculating formulas or re-implementing business logic in individual reporting tools.

### Low-Level Mechanics & Implementation
Defining a semantic model in `models/semantic/sem_orders.yml`:
```yaml
version: 2

semantic_models:
  - name: sem_orders
    model: ref('fct_orders')
    entities:
      - name: order_id
        type: primary
      - name: customer_id
        type: foreign
    dimensions:
      - name: ordered_at
        type: time
        type_params:
          time_granularity: day
      - name: order_status
        type: categorical
    measures:
      - name: total_order_revenue
        agg: sum
        expr: order_amount_usd
      - name: order_count
        agg: count
        expr: order_id

metrics:
  - name: revenue
    type: simple
    label: "Net Revenue"
    type_params:
      measure: total_order_revenue
```

### Production Hardening & Gotchas
- **Proxy Caching**: Semantic layer queries generate dynamic SQL pushed into the warehouse. Deploy caching proxies or intermediate aggregates to prevent heavy BI tool queries from exhausting warehouse compute credits.""",

        "dbt-q-039": """### Conceptual Foundation & Core Architecture
The **dbt Metadata API (GraphQL API)** is a feature of dbt Cloud that provides programmatic real-time access to metadata generated during runs: model execution times, test outcomes, column lineage, and schema modifications.

### Low-Level Mechanics & Implementation
GraphQL Query for Model Run Status:
```graphql
query GetModelRunStatus($environmentId: BigInt!, $modelName: String!) {
  environment(id: $environmentId) {
    applied {
      model(name: $modelName) {
        uniqueId
        executionTime
        status
        tests {
          name
          status
        }
      }
    }
  }
}
```

Integration Use Cases:
1. **Automated Lineage Ingestion**: Data governance tools (Collibra, Purview, Atlan) query the metadata API to sync data catalogs automatically upon job completion.
2. **Alerting on Slow Models**: DevOps tools query `executionTime` to trigger warnings when a model's runtime degrades by > 50% compared to historical baselines.

### Production Hardening & Gotchas
- **Metadata Availability**: The Metadata API is available in dbt Cloud enterprise environments. In dbt Core, metadata is accessed by parsing local JSON artifacts (`target/run_results.json` and `target/manifest.json`).""",

        "dbt-q-040": """### Conceptual Foundation & Core Architecture
Choosing between **dbt Cloud IDE** and **dbt CLI (with local IDEs like VS Code)** represents a core developer experience decision for analytics engineering teams.

### Comparative Architectural Analysis:
| Feature | dbt Cloud IDE | dbt CLI (VS Code / Terminal) |
|---|---|---|
| **Environment Setup** | Zero setup; web browser access; managed credentials | Requires local Python, virtualenv, Git, and CLI installation |
| **Git Integration** | Built-in visual Git client (commit, PR) | Standard Git CLI, SSH keys, rebasing, advanced branching |
| **Developer Productivity** | Web-based; latency dependent on internet connection | **Blazing fast**: Local LSP, snippets, keyboard shortcuts |
| **Extensions** | Limited to built-in features | **Rich ecosystem**: dbt Power User, SQLFluff, Copilot |
| **Execution Compute** | Executes in cloud scheduler containers | Executes directly against warehouse from local CLI |

### Production Hardening & Gotchas
- **Hybrid Team Pattern**: Analytics analysts frequently prefer dbt Cloud IDE for its zero-setup browser interface, while senior analytics engineers use dbt CLI paired with VS Code and dbt Power User for faster workflows.""",

        "dbt-q-041": """### Conceptual Foundation & Core Architecture
**Seed properties** defined in `dbt_project.yml` control how CSV files in `seeds/` are cast, formatted, and materialized into the data warehouse.

### Low-Level Mechanics & Implementation
```yaml
# dbt_project.yml
seeds:
  enterprise_analytics:
    marketing_campaign_lookup:
      schema: seed_data
      quote_columns: false
      column_types:
        campaign_id: varchar(32)
        campaign_name: varchar(255)
        launch_date: date
        budget_usd: numeric(12,2)
        is_active: boolean
```

Key Properties:
- `column_types`: Overrides automatic type inference (e.g. forcing leading zeroes in zip codes or postal codes: `zip_code: varchar(10)`).
- `quote_columns`: Controls whether column identifiers are quoted in DDL statements.

### Production Hardening & Gotchas
- **Type Inference Hazards**: Without explicit `column_types`, dbt infers types by reading CSV lines. A column containing `"00123"` will be converted into integer `123`, stripping critical leading zeroes. Always declare explicit types for codes and IDs.""",

        "dbt-q-042": """### Conceptual Foundation & Core Architecture
**Tags** are metadata labels attached to models, seeds, snapshots, or tests. They allow flexible, cross-cutting model selection during execution (`dbt run --select tag:finance`), enabling teams to run subsets of pipelines independently of directory structures.

### Low-Level Mechanics & Implementation
Tagging in `dbt_project.yml` or model SQL files:
```yaml
# dbt_project.yml
models:
  enterprise_analytics:
    marts:
      finance:
        +tags: ["finance", "critical_sla", "sox_compliant"]
```
Or inside model SQL:
```sql
{{ config(tags=['hourly_sync', 'marketing']) }}
SELECT * FROM ...
```

Executing by Tags:
```bash
# Run all finance models and their immediate downstream dependencies
dbt run --select tag:finance+

# Build critical SLA models while excluding long-running ML models
dbt build --select tag:critical_sla --exclude tag:ml_feature_store
```

### Production Hardening & Gotchas
- **Tag Governance**: Establish an approved list of enterprise tags (e.g. `hourly`, `daily`, `sox`, `pii`). Uncontrolled tagging leads to ambiguous, overlapping tags across developer teams.""",

        "dbt-q-043": """### Conceptual Foundation & Core Architecture
**dbt Variables** (`var`) pass external parameters and global constants into models, macros, and packages. Variables can be declared in `dbt_project.yml` or overridden at runtime via the CLI `--vars` flag.

### Low-Level Mechanics & Implementation
Declaring defaults in `dbt_project.yml`:
```yaml
vars:
  start_date: '2024-01-01'
  enable_pii_masking: true
```

Referencing inside SQL models:
```sql
SELECT
    user_id,
    {% if var('enable_pii_masking', false) %}
        SHA2(email, 256) AS email_hash
    {% else %}
        email
    {% endif %}
FROM {{ ref('stg_users') }}
WHERE created_at >= '{{ var("start_date") }}'
```

Overriding dynamically via CLI:
```bash
dbt run --select stg_users --vars '{"enable_pii_masking": false, "start_date": "2024-03-01"}'
```

### Production Hardening & Gotchas
- **Type Coercion**: Ensure variables passed via CLI are valid JSON strings (`--vars '{"key": "value"}'`). Invalid YAML/JSON formatting causes compilation aborts.""",

        "dbt-q-044": """### Conceptual Foundation & Core Architecture
The **`adapter.dispatch` macro** is dbt's polymorphism engine. It allows a macro to define a standard public interface while providing engine-specific implementations for different database adapters (Snowflake, Databricks, BigQuery, Redshift).

### Low-Level Mechanics & Implementation
```sql
-- macros/date_trunc_month.sql
{% macro date_trunc_month(date_col) %}
    {{ adapter.dispatch('date_trunc_month', 'my_enterprise_package')(date_col) }}
{% endmacro %}

-- Default ANSI implementation
{% macro default__date_trunc_month(date_col) %}
    DATE_TRUNC('month', {{ date_col }})
{% endmacro %}

-- BigQuery-specific override
{% macro bigquery__date_trunc_month(date_col) %}
    DATE_TRUNC({{ date_col }}, MONTH)
{% endmacro %}
```

When a model calls `{{ date_trunc_month('order_date') }}`, dbt evaluates the current target adapter and invokes the corresponding adapter macro automatically.

### Production Hardening & Gotchas
- **Dispatch Order**: Configure `dispatch` search namespaces in `dbt_project.yml` when overriding open-source package macros (e.g. overriding `dbt_utils` macros with custom organization optimizations).""",

        "dbt-q-045": """### Conceptual Foundation & Core Architecture
**dbt Project Parsing** is the initial phase of every dbt CLI command. During parsing, dbt scans all SQL and YAML files, resolves Jinja environments, parses `ref()` and `source()` linkages, and constructs the project graph in memory.

### Low-Level Mechanics & Implementation
Project parsing produces the primary compiled artifact: `target/manifest.json`.
In large enterprise projects with 3,000+ models, full project parsing can consume 30–60 seconds before any SQL executes.

To accelerate parsing, modern dbt employs **Partial Parsing**:
- dbt caches the project state in `target/partial_parse.msgpack`.
- On subsequent runs, dbt inspects file timestamps and Git hashes, reparsing **only modified files** while reusing cached nodes for untouched models. This cuts parse times from 45s to < 2s.

### Production Hardening & Gotchas
- **Partial Parse Invalidation**: Modifying `dbt_project.yml`, `profiles.yml`, or external installed packages invalidates the partial parse cache, triggering a full recompilation.""",

        "dbt-q-046": """### Conceptual Foundation & Core Architecture
dbt tests support two distinct severity levels: **`warn`** and **`error`**. Proper calibration of test severity allows data teams to differentiate between non-critical data quality anomalies and catastrophic integrity breaches.

### Low-Level Mechanics & Implementation
```yaml
models:
  - name: fct_orders
    columns:
      - name: order_id
        tests:
          - unique:
              config:
                severity: error # Blocks downstream pipeline if duplicated
          - not_null:
              config:
                severity: error
      - name: promotion_code
        tests:
          - relationships:
              to: ref('dim_promotions')
              field: promo_code
              config:
                severity: warn  # Logs warning but permits pipeline to proceed
                warn_if: "> 5"
                error_if: "> 100"
```

Behavior During `dbt build`:
- `severity: error`: Fails the task and short-circuits execution of all downstream models.
- `severity: warn`: Logs an alert to stdout/APM and continues execution without blocking downstream marts.

### Production Hardening & Gotchas
- **Alert Fatigue**: Avoid setting all tests to `severity: warn`. If a test failure does not block the pipeline or notify an engineer, it becomes technical debt that analysts ignore.""",

        "dbt-q-047": """### Conceptual Foundation & Core Architecture
In addition to built-in tests, dbt allows authoring **Custom Generic Data Tests**. A custom generic test is a Jinja-SQL macro stored in `macros/` that can be applied to any column across any model via YAML.

### Low-Level Mechanics & Implementation
Creating a custom generic test `macros/test_is_valid_email.sql`:
```sql
{% test is_valid_email(model, column_name) %}

SELECT
    {{ column_name }} AS invalid_email
FROM {{ model }}
WHERE {{ column_name }} IS NOT NULL
  AND NOT REGEXP_LIKE({{ column_name }}, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')

{% endtest %}
```

Applying the custom test in `models/schema.yml`:
```yaml
models:
  - name: stg_customers
    columns:
      - name: email_address
        tests:
          - is_valid_email
```

### Production Hardening & Gotchas
- **Convention**: Generic tests must always query for the **failing rows**. An empty result set signifies 100% compliance.""",

        "dbt-q-048": """### Conceptual Foundation & Core Architecture
The **`dbt run-operation`** command executes arbitrary Jinja macros directly from the command line without compiling or running models. It is the standard tool for executing administrative maintenance tasks, database grants, vacuuming, and staging cleanups.

### Low-Level Mechanics & Implementation
Defining a maintenance macro in `macros/grant_select.sql`:
```sql
{% macro grant_select_on_schemas(schemas, role_name) %}
    {% for schema in schemas %}
        {% set sql %}
            GRANT USAGE ON SCHEMA {{ schema }} TO ROLE {{ role_name }};
            GRANT SELECT ON ALL TABLES IN SCHEMA {{ schema }} TO ROLE {{ role_name }};
            GRANT SELECT ON ALL VIEWS IN SCHEMA {{ schema }} TO ROLE {{ role_name }};
        {% endset %}
        {% do run_query(sql) %}
        {{ log("Granted SELECT on schema " ~ schema ~ " to " ~ role_name, info=True) }}
    {% endfor %}
{% endmacro %}
```

Executing from CLI:
```bash
dbt run-operation grant_select_on_schemas --args '{"schemas": ["marts", "staging"], "role_name": "bi_read_role"}'
```

### Production Hardening & Gotchas
- **Database Context**: `run-operation` executes within the credentials of the active target profile. Ensure the target user has necessary administrative privileges (e.g. `SECURITYADMIN` or `ACCOUNTADMIN`) when granting permissions.""",

        "dbt-q-049": """### Conceptual Foundation & Core Architecture
**Slim CI** is a continuous integration pattern that tests only the models and tests that have been added or modified in a pull request (plus their immediate downstream dependencies), rather than rebuilding the entire enterprise data warehouse project.

### Core Prerequisites & Architecture:
1. **Production Manifest Artifact**: The CI runner downloads the latest `manifest.json` from the production deployment job.
2. **State Comparison**: dbt compares the PR code against the production manifest using `--state path/to/prod/artifacts`.
3. **Selective Execution**: dbt resolves the delta graph:
```bash
dbt build --select state:modified+ --defer --state ./prod-manifest
```

### Production Hardening & Gotchas
- **Cost Reduction**: Slim CI reduces CI build times from 90 minutes to under 3 minutes and cuts warehouse credit consumption by over 90%.""",

        "dbt-q-050": """### Conceptual Foundation & Core Architecture
dbt model configurations can be declared hierarchically across three tiers:
1. **`dbt_project.yml`**: Project-wide directory configurations.
2. **`schema.yml`**: Folder/Model-level YAML configurations.
3. **`{{ config(...) }}` in SQL**: In-file configurations.

### Configuration Hierarchy & Precedence:
The most specific configuration always wins:
`SQL file config(...) > schema.yml > dbt_project.yml`

```sql
-- In models/marts/fct_orders.sql
{{ config(
    materialized='incremental',
    unique_key='order_id',
    incremental_strategy='merge',
    cluster_by=['ordered_at', 'customer_id'],
    transient=false
) }}

SELECT * FROM ...
```

### Production Hardening & Gotchas
- **Avoid Fragmented Configs**: Keep persistent operational configurations (materialization, clustering keys, unique keys) inside the SQL file, and metadata configurations (descriptions, tests, contracts) in YAML.""",

        "dbt-q-051": """### Conceptual Foundation & Core Architecture
The **`--defer`** flag enables dbt to resolve unbuilt upstream dependencies to the production database when running in an isolated developer sandbox or CI environment.

### Low-Level Mechanics & Implementation
Scenario: Developer modifies only `fct_orders.sql`.
Without `--defer`: Developer must build all upstream staging and intermediate tables in their personal schema before running `fct_orders`.
With `--defer`:
```bash
dbt build --select fct_orders --defer --state path/to/prod-manifest
```
dbt queries `prod-manifest/manifest.json`. For untouched upstream models (`stg_customers`, `stg_orders`), it points SQL queries directly to `analytics_prod.stg_customers`. For the modified model, it builds into `analytics_dev_jdoe.fct_orders`.

### Production Hardening & Gotchas
- **Read Permissions**: Developers must have `SELECT` permissions on production schemas to query deferred upstream models.""",

        "dbt-q-052": """### Conceptual Foundation & Core Architecture
A complete **Slim CI Pipeline** implementation automates pull request validation using GitHub Actions or GitLab CI.

### Production GitHub Actions Workflow:
```yaml
name: Slim CI Validation
on: [pull_request]

jobs:
  slim-ci:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with: { python-version: "3.11" }

      - name: Install dbt
        run: pip install dbt-snowflake

      - name: Download Production Manifest
        run: |
          aws s3 cp s3://enterprise-dbt-artifacts/prod/manifest.json ./prod-manifest/manifest.json

      - name: Execute Slim CI
        env:
          DBT_SNOWFLAKE_PASSWORD: ${{ secrets.DBT_CI_PASSWORD }}
        run: |
          dbt build \\
            --select state:modified+ \\
            --defer \\
            --state ./prod-manifest \\
            --target ci_pr_${{ github.event.pull_request.number }}
```

### Production Hardening & Gotchas
- **Schema Cleanup**: Automatically run a cleanup script upon PR merge or closure to drop the temporary `ci_pr_<number>` schema, preventing warehouse storage clutter.""",

        "dbt-q-053": """### Conceptual Foundation & Core Architecture
**dbt Mesh** decouples large monolithic dbt projects into distributed, domain-oriented data products managed by autonomous business domain teams (e.g. Marketing, Finance, Supply Chain), while preserving centralized governance and cross-project lineage.

### Low-Level Mechanics & Implementation
Cross-project dependencies use the two-argument `ref()` function:
```sql
-- In finance_dbt_project/models/marts/fct_revenue.sql
SELECT
    order_id,
    customer_id,
    order_amount
-- References public model 'dim_customers' produced by the 'core_platform' dbt project
FROM {{ ref('core_platform', 'dim_customers') }}
```

Producer Governance in `core_platform`:
```yaml
# core_platform/models/marts/dim_customers.yml
models:
  - name: dim_customers
    access: public # Allows cross-project referencing
    config:
      contract:
        enforced: true # Guarantees schema stability for consumers
    columns:
      - name: customer_id
        data_type: varchar
```

### Production Hardening & Gotchas
- **Public vs Protected Models**: Models with `access: protected` can only be referenced within the same project. Only models with `access: public` and enforced contracts should be exposed to external domain consumers.""",

        "dbt-q-054": """### Conceptual Foundation & Core Architecture
When native materializations (`view`, `table`, `incremental`) do not satisfy complex platform requirements, dbt allows authoring **Custom Materializations** via Jinja macros.

### Low-Level Mechanics & Implementation
Creating a custom materialization `macros/materializations/scythe_iceberg.sql`:
```sql
{% materialization iceberg_table, default %}
    {%- set target_relation = this -%}
    {%- set intermediate_relation = make_intermediate_relation(target_relation) -%}

    -- Setup: Drop existing temp stage
    {{ drop_relation_if_exists(intermediate_relation) }}

    -- Build step: Create Iceberg table
    {% call statement('main') -%}
        CREATE OR REPLACE TABLE {{ target_relation }}
        USING ICEBERG
        AS {{ sql }};
    {%- endcall %}

    {{ return({'relations': [target_relation]}) }}
{% endmaterialization %}
```

### Production Hardening & Gotchas
- **Transactional Atomicity**: Always ensure custom materializations handle error rollbacks gracefully to avoid leaving orphaned staging tables in production schemas.""",

        "dbt-q-055": """### Conceptual Foundation & Core Architecture
**Dynamic model generation with macros** allows generating multiple related SQL queries or intermediate tables programmatically, eliminating repetitive boilerplate code across repetitive dimensional entities.

### Low-Level Mechanics & Implementation
```sql
{% set entity_types = ['customer', 'vendor', 'partner'] %}

WITH 
{% for entity in entity_types %}
{{ entity }}_source AS (
    SELECT 
        id AS entity_id,
        '{{ entity | upper }}' AS entity_type,
        name AS entity_name,
        created_at
    FROM {{ ref('stg_' ~ entity ~ 's') }}
){% if not loop.last %},{% endif %}
{% endfor %}

{% for entity in entity_types %}
SELECT * FROM {{ entity }}_source
{% if not loop.last %}UNION ALL{% endif %}
{% endfor %}
```

### Production Hardening & Gotchas
- **Compiled Readability**: Always inspect `target/compiled/` to ensure dynamically generated queries produce clean, performant SQL plans.""",

        "dbt-q-056": """### Conceptual Foundation & Core Architecture
The **`dbt-databricks` adapter** integrates dbt with the Databricks Lakehouse, compiling SQL directly into Databricks SQL Serverless or Photon clusters and utilizing Delta Lake features (Liquid Clustering, Deletion Vectors, Change Data Feed).

### Low-Level Mechanics & Implementation
Configuring `profiles.yml` for Databricks:
```yaml
databricks_prod:
  target: prod
  outputs:
    prod:
      type: databricks
      host: "adb-123456789.azuredatabricks.net"
      http_path: "/sql/1.0/endpoints/a1b2c3d4e5f6"
      token: "{{ env_var('DATABRICKS_TOKEN') }}"
      catalog: enterprise_catalog
      schema: gold
      threads: 8
```

Utilizing Delta Lake Liquid Clustering in a model:
```sql
{{ config(
    materialized='incremental',
    incremental_strategy='merge',
    unique_key='transaction_id',
    liquid_clustered_by=['tenant_id', 'transaction_date'],
    tblproperties={'delta.enableDeletionVectors': 'true'}
) }}

SELECT * FROM ...
```

### Production Hardening & Gotchas
- **Databricks SQL Serverless**: Always route dbt executions to Databricks SQL Serverless endpoints rather than interactive All-Purpose clusters to benefit from instant scaling and sub-second startup.""",

        "dbt-q-057": """### Conceptual Foundation & Core Architecture
The **`manifest.json`** artifact is the comprehensive, machine-readable compiler snapshot of a dbt project. Generated in the `target/` folder during compilation, it contains the complete AST and JSON schema of all nodes (models, sources, seeds, snapshots, tests, macros).

### Manifest JSON Key Structure:
- `nodes`: Dictionary of all compiled models, seeds, and tests.
- `sources`: External raw data sources.
- `parent_map` / `child_map`: Directed dependency graph representation.
- `metadata`: Compiler version, generated timestamp, invocation ID.

Programmatic Use Case with Python:
```python
import json

with open("target/manifest.json") as f:
    manifest = json.load(f)

# Audit all models lacking primary key tests
for node_id, node in manifest["nodes"].items():
    if node["resource_type"] == "model":
        tests = [child for child in manifest["child_map"][node_id] if "test" in child]
        if not tests:
            print(f"WARNING: Model {node['name']} has zero automated tests!")
```

### Production Hardening & Gotchas
- **State Auditing**: `manifest.json` is the sole source of truth used by dbt for state-based comparison (`--state`). Store production manifests durably in S3/ADLS upon every deployment.""",

        "dbt-q-058": """### Conceptual Foundation & Core Architecture
**Partial Parsing** stores the project compilation state in `target/partial_parse.msgpack` between CLI invocations. When a command executes, dbt inspects file modification timestamps and Git SHA hashes, parsing **only modified files** and skipping unchanged nodes.

### Performance Impact:
- **Full Parse (Cold)**: 15–45 seconds on enterprise projects (2,000+ models).
- **Partial Parse (Warm)**: < 1.5 seconds.

### Production Hardening & Gotchas
- **Invalidation Triggers**: Modifying macro definitions, `dbt_project.yml`, or installed packages forces a full cache purge. If partial parsing produces unexpected behavior, run `dbt clean` to reset the cache.""",

        "dbt-q-059": """### Conceptual Foundation & Core Architecture
dbt's **Graph Selection Operators** provide a powerful query syntax for selecting and filtering specific subgraphs of the project DAG during command execution.

### Selector Syntax Cheat Sheet:
- `+model_name`: Model and all its upstream ancestors.
- `model_name+`: Model and all its downstream descendants.
- `+model_name+`: Model and all upstream ancestors AND downstream descendants.
- `@model_name`: Model, its ancestors, and descendants, PLUS all models that depend on its ancestors.
- `tag:finance`: All models matching tag `finance`.
- `source:stripe+`: All downstream models originating from the `stripe` source.
- `path:models/marts/finance`: All models within a specific directory.
- `state:modified+`: In Slim CI, all modified models and their descendants.

```bash
# Complex combination: Build modified finance models excluding heavy ML marts
dbt build --select "state:modified+,tag:finance" --exclude "tag:ml_heavy" --state ./prod-manifest
```

### Production Hardening & Gotchas
- **Quote Selectors**: Always wrap selector expressions in quotes (`--select "tag:daily+"`) in shell scripts to prevent shell glob expansion issues.""",

        "dbt-q-060": """### Conceptual Foundation & Core Architecture
Understanding the distinction between `compile`, `run`, and `build` is critical for designing optimal development workflows and CI/CD pipelines:
- **`dbt compile`**: Resolves Jinja, compiles SQL, and writes files to `target/compiled/`. **Zero warehouse execution**.
- **`dbt run`**: Compiles and executes models only. Ignores tests, seeds, and snapshots.
- **`dbt build`**: The modern unified command. Builds seeds, runs models, runs snapshots, and executes tests in topological order. Halts downstream execution immediately if an upstream test fails.

### Production Hardening & Gotchas
- **Standardize on `build`**: Retire legacy `dbt run && dbt test` scripts in CI/CD and replace them with `dbt build` to guarantee data quality enforcement before downstream dependencies execute.""",

        "dbt-q-061": """### Conceptual Foundation & Core Architecture
Modern cloud data warehouses provide native storage optimizations (clustering, partitioning) that dbt can configure declaratively via model configs.

### Warehouse Specific Configurations:
1. **Snowflake Clustering**:
```sql
{{ config(
    materialized='table',
    cluster_by=['customer_id', 'DATE_TRUNC(\"day\", ordered_at)']
) }}
```
2. **Google BigQuery Partitioning & Clustering**:
```sql
{{ config(
    materialized='table',
    partition_by={
      "field": "event_timestamp",
      "data_type": "timestamp",
      "granularity": "day"
    },
    cluster_by=["country_code", "device_type"]
) }}
```
3. **Databricks Liquid Clustering**:
```sql
{{ config(
    materialized='table',
    liquid_clustered_by=['tenant_id', 'transaction_date']
) }}
```

### Production Hardening & Gotchas
- **Avoid Over-Partitioning**: Creating thousands of tiny partitions (e.g. partitioning by hour on low-volume tables) degrades query planning and causes significant file-skipping overhead.""",

        "dbt-q-062": """### Conceptual Foundation & Core Architecture
Introduced in dbt 1.7+, **Unit Testing** validates complex model SQL transformation logic against mocked, synthetic inputs before models are executed in production warehouses. Unlike data tests that validate live database data, unit tests validate **SQL transformation logic correctness** in isolation.

### Low-Level Mechanics & Implementation
Defining a unit test in `models/marts/schema.yml`:
```yaml
version: 2

unit_tests:
  - name: test_calculate_customer_tier
    model: dim_customers
    given:
      - input: ref('stg_orders')
        rows:
          - {customer_id: 1, order_amount: 500}
          - {customer_id: 1, order_amount: 600} # Sum: 1100 -> VIP
          - {customer_id: 2, order_amount: 200} # Sum: 200 -> STANDARD
    expect:
      rows:
        - {customer_id: 1, customer_tier: 'VIP'}
        - {customer_id: 2, customer_tier: 'STANDARD'}
```

Run unit tests:
```bash
dbt test --select "test_type:unit"
```

### Production Hardening & Gotchas
- **Zero Mock Data Clutter**: Unit test mock tables are executed in ephemeral CTEs and leave zero residual test tables in the warehouse.""",

        "dbt-q-063": """### Conceptual Foundation & Core Architecture
The **dbt Power User** extension for VS Code transforms local developer workstations into an IDE for analytics engineering, rivaling or exceeding the dbt Cloud IDE.

### Key Capabilities:
- **Interactive Parent/Child DAG Viewer**: Visualizes upstream and downstream dependencies inside VS Code.
- **Inline Query Execution & Tabular Preview**: Execute compiled SQL with a single shortcut (`Ctrl+Enter`) and view live table results.
- **SQLFluff Integration**: Real-time SQL formatting and linting as you type.
- **Automated Model Generation**: Generates `schema.yml` column definitions from warehouse information schema with a single click.

### Production Hardening & Gotchas
- **Developer Acceleration**: Standardizing analytics teams on VS Code with dbt Power User reduces onboarding time and eliminates browser IDE latency.""",

        "dbt-q-064": """### Conceptual Foundation & Core Architecture
**Advanced Jinja Patterns** allow analytics engineers to construct dynamic SQL generators, audit harnesses, and custom schema translators.

### Key Advanced Patterns:
1. **`execute` Flag**: Guards database queries during parsing:
```sql
{% if execute %}
    {% set query_results = run_query("SELECT DISTINCT status FROM " ~ ref('stg_orders')) %}
    {% set status_list = query_results.columns[0].values() %}
{% else %}
    {% set status_list = [] %}
{% endif %}
```
2. **Context Managers & Graph Inspection**:
```sql
{% set model_nodes = graph.nodes.values() | selectattr("resource_type", "equalto", "model") %}
```

### Production Hardening & Gotchas
- **The `execute` Flag Rule**: Never call `run_query()` without wrapping it inside `{% if execute %}`. Failing to do so causes compilation errors during the initial DAG parsing phase.""",

        "dbt-q-065": """### Conceptual Foundation & Core Architecture
As enterprise dbt projects grow beyond 2,000 models and 10,000 tests, compilation and execution times can degrade significantly. Optimizing large projects requires architectural discipline across compilation and execution layers.

### Optimization Playbook:
1. **Enable Partial Parsing**: Keep `partial_parse.msgpack` warm; cuts parse times from 45s to < 2s.
2. **Convert Heavy Tables to Incremental**: Avoid full table refreshes on multi-billion row tables.
3. **Tune Thread Concurrency**: Increase CLI execution threads (`--threads 16`) to maximize parallel pipeline throughput.
4. **Enforce Modular Ephemeral Layers**: Convert single-use intermediate views to ephemeral CTEs to reduce database metadata DDL overhead.
5. **Implement dbt Mesh**: Split monolithic monorepos into domain-specific projects.

### Production Hardening & Gotchas
- **Warehouse Queue Concurrency**: Increasing dbt threads beyond the warehouse's concurrent query limit causes queries to queue in the warehouse, increasing overall runtime.""",

        "dbt-q-066": """### Conceptual Foundation & Core Architecture
Managing **complex dependencies** across multi-layered enterprise DAGs requires strict governance to prevent cyclic graphs, model fan-out explosions, and unmaintainable lineage knots.

### Dependency Governance Rules:
1. **No Skip-Layer References**: Marts should not query raw sources; staging models should not query marts.
2. **DAG Fan-Out Limits**: If a single model feeds 40+ downstream models, wrap it in an intermediate abstraction or dimensional mart.
3. **Audit with `dbt-project-evaluator`**: Package rules flag circular dependencies, direct source querying in marts, and undocumented models automatically in CI.

### Production Hardening & Gotchas
- **Model Sprawl**: Audit the graph quarterly and deprecate unused leaf models identified via exposure tracking.""",

        "dbt-q-067": """### Conceptual Foundation & Core Architecture
Automating dbt with **GitLab CI/CD** enables GitOps-driven deployment pipelines that validate pull requests and deploy certified models to production environments.

### Low-Level Mechanics & Implementation
`.gitlab-ci.yml` Pipeline:
```yaml
stages:
  - lint
  - slim_ci
  - deploy_prod

lint_sql:
  stage: lint
  image: python:3.11-slim
  script:
    - pip install sqlfluff-templater-dbt
    - sqlfluff lint models/

slim_ci:
  stage: slim_ci
  image: python:3.11-slim
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  script:
    - pip install dbt-snowflake
    - aws s3 cp s3://enterprise-artifacts/prod/manifest.json ./prod-manifest/manifest.json
    - dbt build --select state:modified+ --defer --state ./prod-manifest --target mr_$CI_MERGE_REQUEST_IID
```

### Production Hardening & Gotchas
- **GitLab CI Masked Variables**: Always mark database passwords and tokens as "Masked and Protected" in GitLab CI settings to prevent credentials from leaking in build logs.""",

        "dbt-q-068": """### Conceptual Foundation & Core Architecture
Integrating **dbt with Snowflake Streams & Tasks** enables continuous, real-time Change Data Capture (CDC) micro-batch transformations natively within the data warehouse.

### Low-Level Mechanics & Implementation
1. Create a Snowflake Stream on raw landing tables:
```sql
CREATE STREAM raw.customer_stream ON TABLE raw.customers;
```
2. Configure the dbt incremental model to consume from the stream:
```sql
{{ config(
    materialized='incremental',
    unique_key='customer_id',
    incremental_strategy='merge'
) }}

SELECT
    customer_id,
    first_name,
    email,
    METADATA$ACTION AS cdc_action,
    METADATA$ISUPDATE AS is_update
FROM raw.customer_stream
WHERE METADATA$ACTION = 'INSERT' OR METADATA$ACTION = 'DELETE'
```

### Production Hardening & Gotchas
- **Stream Staleness**: Snowflake streams become stale if unconsumed within the data retention period (default 14 days), requiring manual stream recreation.""",

        "dbt-q-069": """### Conceptual Foundation & Core Architecture
**dbt Python Models** (introduced in dbt 1.3+) allow data practitioners to write transformations in Python (`def model(dbt, session):`) while remaining first-class citizens in the dbt DAG. Python models execute on serverless warehouse compute (Snowflake Snowpark, Databricks PySpark, BigQuery Vertex AI).

### Low-Level Mechanics & Implementation
Model definition in `models/marts/ml_lead_scoring.py`:
```python
import snowflake.snowpark.functions as F
from sklearn.linear_model import LogisticRegression
import pandas as pd

def model(dbt, session):
    # Configure materialization
    dbt.config(
        materialized="table",
        packages=["scikit-learn", "pandas"]
    )

    # Reference upstream dbt SQL models
    orders_df = dbt.ref("fct_orders").to_pandas()
    
    # Train lightweight model or apply machine learning transformation
    orders_df["lead_score"] = orders_df["order_amount"] * 0.05

    # Return Snowpark or Spark DataFrame
    return session.create_dataframe(orders_df)
```

### Production Hardening & Gotchas
- **Compute Isolation**: Python models consume specialized warehouse resources (e.g. Snowpark compute pools or Spark clusters). Use SQL models for standard relational joins and reserve Python models for complex statistics, NLP, and ML inference.""",

        "dbt-q-070": """### Conceptual Foundation & Core Architecture
**Late Arriving Data** occurs when transactional events reach the warehouse hours or days after their actual occurrence due to mobile offline queuing, device sync delays, or network partitions. In incremental dbt models, relying solely on `WHERE updated_at >= (SELECT MAX(updated_at) FROM {{ this }})` will permanently miss these late records.

### Low-Level Mechanics & Implementation
Mitigate late-arriving data using an **incremental lookback window**:
```sql
{{ config(
    materialized='incremental',
    unique_key='event_id',
    incremental_strategy='merge'
) }}

SELECT
    event_id,
    user_id,
    event_timestamp,
    processed_at
FROM {{ ref('stg_telemetry_events') }}

{% if is_incremental() %}
    -- Scan back 3 days prior to the max recorded timestamp to capture late arrivals
    WHERE processed_at >= (
        SELECT DATEADD('day', -3, COALESCE(MAX(processed_at), '1970-01-01')) 
        FROM {{ this }}
    )
{% endif %}
```

### Production Hardening & Gotchas
- **Idempotency with Merge**: Lookback windows process overlapping records repeatedly. Enforce unique primary keys (`unique_key='event_id'`) so the `MERGE` engine updates existing records rather than inserting duplicates.""",

        "dbt-q-071": """### Conceptual Foundation & Core Architecture
**Dynamic Data Masking (DDM)** enforces column-level security and privacy compliance (GDPR, HIPAA, PII) in the warehouse. dbt can manage masking policies declaratively using meta tags and post-hooks.

### Low-Level Mechanics & Implementation
Tagging columns with masking policies in `schema.yml`:
```yaml
models:
  - name: dim_users
    columns:
      - name: ssn
        meta:
          masking_policy: mask_ssn_policy
      - name: email
        meta:
          masking_policy: mask_email_policy
```

Applying policies dynamically via post-hook macro:
```sql
{% macro apply_masking_policies() %}
    {% for col in model.columns.values() %}
        {% if col.meta.masking_policy %}
            ALTER TABLE {{ this }} MODIFY COLUMN {{ col.name }} 
            SET MASKING POLICY {{ col.meta.masking_policy }};
        {% endif %}
    {% endfor %}
{% endmacro %}
```

### Production Hardening & Gotchas
- **Zero Raw PII Exposure**: Non-privileged BI roles viewing `dim_users` will see masked values (e.g. `***-**-1234`), while compliance officers view unmasked plaintext.""",

        "dbt-q-072": """### Conceptual Foundation & Core Architecture
**Query Comments** inject structured metadata into the SQL headers sent by dbt to the data warehouse. This enables warehouse administrators and FinOps engineers to attribute query costs, monitor execution sources, and audit warehouse workloads.

### Low-Level Mechanics & Implementation
Configure query comments in `dbt_project.yml`:
```yaml
query-comment:
  comment: "dbt-run | invocation_id: {{ invocation_id }} | user: {{ target.user }} | model: {{ node.name }} | file: {{ node.original_file_path }}"
  append: false # Prepend comment to the top of the query
```

When dbt runs `fct_orders`, Snowflake query history logs:
```sql
/* dbt-run | invocation_id: 9a8b7c | user: svc_dbt | model: fct_orders | file: models/marts/fct_orders.sql */
CREATE OR REPLACE TABLE analytics.fct_orders AS SELECT ...
```

### Production Hardening & Gotchas
- **FinOps Chargeback**: Cloud cost monitoring tools (Finout, Vantage, Snowflake Account Usage) parse query comments to allocate cloud warehouse costs directly to specific teams and models.""",

        "dbt-q-073": """### Conceptual Foundation & Core Architecture
dbt provides structured execution logging across stdout and file destinations (`logs/dbt.log`). Modern dbt supports **Structured JSON Logging**, outputting machine-readable JSON logs directly into enterprise log aggregators (Datadog, Splunk, CloudWatch).

### Low-Level Mechanics & Implementation
Enabling JSON log output:
```bash
dbt --log-format json run --select marts.core
```

Sample JSON Log Line:
```json
{
  "code": "Q030",
  "message": "1 of 5 START sql table model gold.fct_orders",
  "level": "info",
  "invocation_id": "84d7-4f92",
  "data": {
    "node_info": {
      "node_name": "fct_orders",
      "materialized": "table"
    }
  }
}
```

### Production Hardening & Gotchas
- **Log Archival**: Rotate or purge `logs/dbt.log` in container runners to prevent disk exhaustion during large batch runs.""",

        "dbt-q-074": """### Conceptual Foundation & Core Architecture
**Pre-commit hooks** execute static quality checks locally on developer workstations before git commits are accepted, catching formatting errors, syntax bugs, and broken references before code reaches CI.

### Low-Level Mechanics & Implementation
Configuring `.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/dbt-checkpoint/dbt-checkpoint
    rev: v1.1.1
    hooks:
      - id: check-model-has-description
      - id: check-model-has-tests
        args: ["--test-cnt", "2", "--"]
      - id: check-column-desc-are-same
      - id: check-source-table-has-description
  - repo: https://github.com/sqlfluff/sqlfluff
    rev: 2.3.5
    hooks:
      - id: sqlfluff-lint
        additional_dependencies: ['sqlfluff-templater-dbt']
```

### Production Hardening & Gotchas
- **Automated Enforcement**: Run `pre-commit run --all-files` in CI to ensure that commits bypassing local hooks via `--no-verify` are caught before merging.""",

        "dbt-q-075": """### Conceptual Foundation & Core Architecture
**SQLFluff** is the industry-standard modular SQL linter and auto-formatter designed specifically for Jinja-templated dbt SQL codebases. It enforces consistent styling rules (casing, indentation, trailing commas, alias conventions) across all models.

### Low-Level Mechanics & Implementation
Configuration in `.sqlfluff`:
```ini
[sqlfluff]
dialect = snowflake
templater = dbt
runaway_limit = 10
exclude_rules = structure.column_order

[sqlfluff:templater:dbt]
project_dir = .
profiles_dir = ~/.dbt

[sqlfluff:rules:capitalisation.keywords]
capitalisation_policy = upper

[sqlfluff:rules:capitalisation.identifiers]
capitalisation_policy = lower
```

CLI Commands:
```bash
# Lint models
sqlfluff lint models/marts/fct_orders.sql

# Automatically fix formatting violations
sqlfluff fix models/marts/fct_orders.sql
```

### Production Hardening & Gotchas
- **dbt Templater Performance**: The `templater = dbt` mode compiles Jinja through dbt's compiler, which can be slow on 1,000+ models. Scope linting in PR CI pipelines strictly to changed files: `git diff --name-only origin/main | grep '\.sql$' | xargs sqlfluff lint`.""",
    }
