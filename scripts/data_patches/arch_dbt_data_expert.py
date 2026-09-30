# arch_dbt_data_expert.py
# Scenarios 021-040 for dbt Architecture & Transformation

def get_expert_dbt_scenarios():
    items = []

    # HARD (021 - 030)
    scenarios_hard = [
        ("arch-dbt-021", "dbt Mesh cross-project dependencies", "How do you architect a decentralized dbt Mesh topology using cross-project refs, public model interfaces, and model contracts?",
"""### Phase 1: Conceptual Foundation & Core Architecture
As enterprise analytics teams scale beyond 30 practitioners, a single monolithic dbt project creates severe bottlenecks: merge conflicts, slow parse times, and complex access control. dbt Mesh allows organizations to split the monolith into autonomous, domain-owned dbt projects (e.g. Core Platform, Marketing, Finance). Domain teams publish `public` models protected by strict `contracts: {enforced: true}`. Downstream projects reference these public models across repository boundaries using `ref('upstream_project', 'public_model')`.

### Phase 2: Low-Level Mechanics & Implementation
1. **Public Contract Definition**: In the upstream project (`core_data`), declare the model as public and enforce schema contracts.
2. **Implementation Snippet**:
```yaml
# In Upstream Project (core_data) models/marts/dim_customers.yml
models:
  - name: dim_customers
    access: public # Exposed across dbt Mesh boundaries
    config:
      contract:
        enforced: true
    columns:
      - name: customer_id
        data_type: string
        tests: [unique, not_null]
      - name: email
        data_type: string
```
```sql
-- In Downstream Project (marketing_analytics) models/marts/fct_campaign_conversions.sql
SELECT 
    c.customer_id,
    c.email,
    camp.campaign_name
FROM {{ ref('core_data', 'dim_customers') }} c
JOIN {{ ref('stg_campaigns') }} camp ON c.customer_id = camp.customer_id
```
3. **Dependencies**: Declare upstream project dependencies in downstream `dependencies.yml`.

### Phase 3: Production Hardening & Gotchas
- **Breaking Contract Changes in Upstream Projects**: Upstream team altering a column type in a public model causes downstream builds to break. *Remediation*: Model contracts reject PR merges that introduce breaking schema alterations without version bumping.
- **Cross-Project Circular Deadlocks**: Project A referencing Project B while Project B references Project A creates compilation deadlocks. *Remediation*: Enforce strict unidirectional dependency graphs: Ingestion Core -> Domain Marts -> Downstream Apps.
- **CI Artifact Resolution Failures**: Downstream PR builds failing because upstream project manifest artifacts cannot be resolved. *Remediation*: Publish upstream project manifests to central cloud object storage during main branch deployments."""),

        ("arch-dbt-022", "Custom materialization for merge-only pattern", "How do you architect a custom dbt materialization macro to enforce an atomic, write-only MERGE strategy with audit metadata?",
"""### Phase 1: Conceptual Foundation & Core Architecture
While dbt includes default incremental strategies, enterprise requirements often demand proprietary persistence patterns: for example, an atomic UPSERT that updates existing records, appends new records, and never deletes, while recording detailed batch auditing metadata in a secondary control table. Custom materializations allow architects to orchestrate low-level warehouse DDL/DML, temporary staging table swaps, and transaction boundaries directly in Jinja.

### Phase 2: Low-Level Mechanics & Implementation
1. **Custom Materialization Definition**: Author `macros/materializations/merge_only.sql`.
2. **Implementation Snippet**:
```sql
-- macros/materializations/merge_only.sql
{% materialization merge_only, default %}
    {%- set target_relation = this -%}
    {%- set existing_relation = load_relation(target_relation) -%}
    {%- set tmp_relation = make_temp_relation(target_relation) -%}
    {%- set unique_key = config.require('unique_key') -%}

    -- 1. Build temporary staging table from model SQL
    {% call statement('create_tmp') -%}
        {{ create_table_as(True, tmp_relation, sql) }}
    {%- endcall %}

    -- 2. If table does not exist, create it from tmp table
    {% if existing_relation is none %}
        {% call statement('main') -%}
            {{ create_table_as(False, target_relation, 'SELECT * FROM ' ~ tmp_relation) }}
        {%- endcall %}
    {% else %}
        -- 3. Execute atomic MERGE statement
        {% call statement('main') -%}
            MERGE INTO {{ target_relation }} as target
            USING {{ tmp_relation }} as source
            ON target.{{ unique_key }} = source.{{ unique_key }}
            WHEN MATCHED THEN
                UPDATE SET {{ dbt.get_merge_update_columns(target_relation, tmp_relation) }}
            WHEN NOT MATCHED THEN
                INSERT ({{ dbt.get_merge_insert_columns(target_relation, tmp_relation) }})
                VALUES ({{ dbt.get_merge_insert_columns(target_relation, tmp_relation) }});
        {%- endcall %}
    {% endif %}

    {{ return({'relations': [target_relation]}) }}
{% endmaterialization %}
```
3. **Usage**: Configure in model: `{{ config(materialized='merge_only', unique_key='transaction_id') }}`.

### Phase 3: Production Hardening & Gotchas
- **Orphaned Temp Tables on Warehouse Crashes**: If a warehouse session drops unexpectedly mid-materialization, temporary tables remain in the schema. *Remediation*: Ensure `make_temp_relation` uses database-native volatile/temporary table mechanics that automatically drop on disconnect.
- **Dialect Incompatibilities Across Engines**: Authoring raw SQL MERGE inside a custom materialization breaks when porting from Snowflake to BigQuery. *Remediation*: Wrap DDL/DML operations in adapter-dispatched macros (`adapter.dispatch`).
- **Transaction Rollback Failures**: If an atomic statement fails, unhandled exceptions leave locks on the target table. *Remediation*: Wrap execution blocks in formal SQL transaction wrappers (`BEGIN TRANSACTION ... COMMIT`)."""),

        ("arch-dbt-023", "dbt + Databricks optimizations (OPTIMIZE post-hook)", "How do you architect performance optimizations for dbt on Databricks Lakehouse using Liquid Clustering and automated OPTIMIZE post-hooks?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Running dbt against Databricks Lakehouses requires optimizing Delta Lake physical storage layouts. Frequent dbt incremental runs generate small Parquet files, degrading subsequent read performance. Architects combine: 1) Modern `liquid_clustering` configurations in dbt models; 2) Automated `OPTIMIZE` post-hooks to compact small files; and 3) Change Data Feed (CDF) enablement to power downstream incremental pipelines.

### Phase 2: Low-Level Mechanics & Implementation
1. **Model Configuration**: Configure `liquid_clustering` and post-hook maintenance.
2. **Implementation Snippet**:
```sql
-- models/marts/core/fct_telemetry_events.sql
{{ config(
    materialized='incremental',
    unique_key='event_id',
    file_format='delta',
    liquid_clustering=['device_id', 'event_date'],
    tblproperties={
        'delta.enableChangeDataFeed': 'true',
        'delta.autoOptimize.optimizeWrite': 'true',
        'delta.autoOptimize.autoCompact': 'true'
    },
    post_hook=[
        -- Run compaction on modified partitions
        "OPTIMIZE {{ this }}"
    ]
) }}

SELECT
    event_id,
    device_id,
    cast(event_timestamp as date) as event_date,
    payload_json,
    event_timestamp
FROM {{ ref('stg_telemetry') }}
{% if is_incremental() %}
    WHERE event_timestamp > (SELECT max(event_timestamp) FROM {{ this }})
{% endif %}
```
3. **Cluster Warehouse**: Execute transformations on Databricks SQL Serverless warehouses powered by Photon.

### Phase 3: Production Hardening & Gotchas
- **Excessive OPTIMIZE Compute Burn**: Running `OPTIMIZE` on every micro-batch incremental run wastes expensive DBU compute. *Remediation*: Schedule OPTIMIZE sweeps periodically (e.g. daily) via Databricks Predictive Optimization rather than on every 5-minute dbt run.
- **Legacy Z-Ordering on Append Tables**: Using `zorder_by` instead of Liquid Clustering requires rewriting large portions of the table on every run. *Remediation*: Migrate to `liquid_clustering`, which clusters incrementally with zero full rewrites.
- **Concurrent Append Lock Collisions**: Concurrent writers modifying the same Delta partition while dbt executes an OPTIMIZE hook can cause transaction retry exceptions. *Remediation*: Isolate maintenance jobs from high-frequency streaming ingestion windows."""),

        ("arch-dbt-024", "Large project performance (partial parsing, parallelism)", "How do you architect compilation and execution performance optimizations in enterprise dbt projects with 3,000+ models?",
"""### Phase 1: Conceptual Foundation & Core Architecture
In multi-thousand model dbt projects, compile times alone can exceed 2 minutes before queries even reach the warehouse, and execution can drag on for hours. Platform architects optimize performance across two primary vectors: 1) **Compilation Optimization**: Leveraging native Partial Parsing (`partial_parse.msgpack`), optimizing Jinja macro AST trees, and pruning dead dependencies; and 2) **Execution Optimization**: Tuning thread concurrency (`--threads 16`), warehouse autoscaling, and eliminating deeply nested virtual views.

### Phase 2: Low-Level Mechanics & Implementation
1. **Configuration Tuning**: Enable partial parsing and tune parallel threads in `dbt_project.yml`.
2. **Implementation Snippet**:
```yaml
# dbt_project.yml configuration for 3,000+ model enterprise projects
name: 'enterprise_analytics'
version: '2.0.0'
config-version: 2

flags:
  use_experimental_parser: True
  static_parser: True

# Model-level optimization: prune view chains and convert intermediate layers to tables
models:
  enterprise_analytics:
    staging:
      +materialized: view
    intermediate:
      +materialized: ephemeral # Injected as CTEs, reducing warehouse catalog lookups
    marts:
      +materialized: table
      +threads: 16
```
3. **Execution**: Run with maximum parallel threads: `dbt build --threads 16`.

### Phase 3: Production Hardening & Gotchas
- **Stale Cache Macro Discrepancies**: Partial parsing can occasionally fail to detect indirect macro dependency changes across deeply nested files. *Remediation*: In production scheduled CI/CD runs, use `--no-partial-parse` to guarantee a completely clean, authoritative build.
- **Warehouse Thread Queue Saturation**: Setting `--threads 32` on a Small Snowflake or Databricks warehouse floods the queue with waiting queries, inducing query timeout errors. *Remediation*: Scale the warehouse cluster size (e.g. Medium/Large) or enable multi-cluster warehouse autoscaling.
- **Unbounded Manifest Memory Usage**: A 3,000-model `manifest.json` can consume 500MB of RAM in CI runners, causing out-of-memory crashes. *Remediation*: Provision CI runner instances with at least 8GB of RAM."""),

        ("arch-dbt-025", "State-based CI/CD pipeline with GitHub Actions", "How do you architect an enterprise State-Based CI/CD pipeline with GitHub Actions that automates zero-downtime Blue/Green deployments?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Modern data engineering mandates treating analytics code with the same rigor as mission-critical software services. An enterprise CI/CD architecture separates pull request validation from production release: PRs execute Slim CI (`state:modified+`) against ephemeral schemas, while merges to main trigger a Blue/Green deployment where models are built into a staging schema, tested for data quality contracts, and atomically swapped into the live production schema with zero read downtime.

### Phase 2: Low-Level Mechanics & Implementation
1. **Pipeline Stages**: PR Validation (Slim CI) -> Merge to Main -> Blue/Green Build -> Automated Health Gates -> Atomic Swap.
2. **Implementation Snippet**:
```yaml
# .github/workflows/dbt_prod_deploy.yml
name: dbt Production Deployment
on:
  push:
    branches: [ main ]

jobs:
  deploy_production:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dbt
        run: pip install dbt-snowflake
      - name: Build into Green Schema
        run: |
          dbt build --target prod_green
      - name: Run Integrity Assertions
        run: |
          dbt test --target prod_green --select "test_type:singular"
      - name: Execute Atomic Schema Swap
        run: |
          python scripts/atomic_schema_swap.py --blue prod --green prod_green
      - name: Upload Manifest Artifact to S3 for Future Slim CI
        run: |
          aws s3 cp target/manifest.json s3://enterprise-dbt-artifacts/prod/manifest.json
```
3. **Rollback**: If health gates fail, the script aborts before swapping schemas, preserving the live Blue production schema intact.

### Phase 3: Production Hardening & Gotchas
- **Long-Running Queries Blocking Atomic Swaps**: An active 30-minute BI query in the Blue schema can block an atomic `ALTER SCHEMA SWAP` command. *Remediation*: Set warehouse lock timeouts (`LOCK_TIMEOUT = 300`) to abort the swap cleanly rather than causing a hang.
- **Incomplete Manifest Upload on Partial Failures**: Uploading `manifest.json` after a failed build corrupts the baseline for future Slim CI runs. *Remediation*: Only upload artifacts in GitHub Actions steps conditioned with `if: success()`.
- **Ghost Schemas Accumulating in Warehouse**: Staging green schemas remaining in the database after failed deployments consume storage. *Remediation*: Implement automated teardown routines on job failure."""),

        ("arch-dbt-026", "Unit testing dbt models with mock data", "How do you architect unit testing in dbt 1.8+ to validate complex SQL transformation logic against isolated mock datasets?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Historically, validating dbt model logic required running queries against real warehouse datasets, which is slow, expensive, and non-deterministic. dbt 1.8+ introduced native Unit Testing: analytics engineers can define mock input fixtures (in CSV or SQL format) directly in YAML, pass them to a model, and assert the exact expected output rows without querying production data. Unit tests execute before model materialization, providing true test-driven development (TDD) for SQL.

### Phase 2: Low-Level Mechanics & Implementation
1. **Unit Test Declaration**: Define mock inputs and expected outputs in `models/_models__unit_tests.yml`.
2. **Implementation Snippet**:
```yaml
# models/marts/core/_core__unit_tests.yml
version: 2

unit_tests:
  - name: test_fct_orders_customer_tier_logic
    model: fct_orders
    given:
      - input: ref('stg_ecommerce__orders')
        rows:
          - {order_id: 'o1', customer_id: 'c1', order_amount_usd: 50.00}
          - {order_id: 'o2', customer_id: 'c2', order_amount_usd: 150.00}
      - input: ref('dim_customers')
        rows:
          - {customer_id: 'c1', total_lifetime_spend: 200.00}
          - {customer_id: 'c2', total_lifetime_spend: 1200.00}
    expect:
      rows:
        - {order_id: 'o1', customer_tier: 'STANDARD'}
        - {order_id: 'o2', customer_tier: 'VIP'}
```
3. **Execution**: Execute unit tests via CLI: `dbt test --select "test_type:unit"`.

### Phase 3: Production Hardening & Gotchas
- **Overly Complex Mock Fixtures**: Authoring 500-line mock tables in YAML makes test suites brittle and hard to maintain. *Remediation*: Keep mock fixtures minimal: test strictly edge cases (NULLs, boundary numbers, zero values) with 2-4 rows.
- **Missing Ephemeral Dependencies in Mocking**: Forgetting to mock an upstream ephemeral model causes the unit test to fall back to warehouse queries. *Remediation*: Explicitly mock all direct upstream models referenced by the target model.
- **Slow CI Times on Hundreds of Unit Tests**: Running 500 unit tests sequentially can add minutes to CI. *Remediation*: Unit tests compile to lightweight CTE queries; run with high thread concurrency (`--threads 16`)."""),

        ("arch-dbt-027", "dbt + Great Expectations integration", "How do you architect advanced data quality and statistical profiling in dbt using dbt-expectations?",
"""### Phase 1: Conceptual Foundation & Core Architecture
While dbt's native generic tests cover basic schema integrity (unique, not_null), enterprise data platforms require advanced statistical validation: asserting that numerical columns fall within 3 standard deviations, validating regex formats (email, phone), checking categorical distribution ratios, and validating column proportions. The `dbt-expectations` package brings the power of Great Expectations natively into dbt YAML configurations.

### Phase 2: Low-Level Mechanics & Implementation
1. **Package Installation**: Add `calogica/dbt_expectations` to `packages.yml`.
2. **Implementation Snippet**:
```yaml
# models/marts/finance/_finance__expectations.yml
version: 2

models:
  - name: fct_financial_transactions
    columns:
      - name: transaction_amount_usd
        tests:
          # Assert value falls between realistic bounds
          - dbt_expectations.expect_column_values_to_be_between:
              min_value: 0.01
              max_value: 1000000.00
          # Assert standard deviation does not exceed threshold (anomaly detection)
          - dbt_expectations.expect_column_stdev_to_be_between:
              min_value: 10.0
              max_value: 500.0
      - name: user_email
        tests:
          - dbt_expectations.expect_column_values_to_match_regex:
              regex: "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$"
```
3. **Execution**: Run expectation test suites via `dbt test --select tag:finance_expectations`.

### Phase 3: Production Hardening & Gotchas
- **Expensive Statistical Full-Table Scans**: Running standard deviation and median calculations across 100 million rows burns significant warehouse credits. *Remediation*: Filter expectation tests to recent partitions using the `row_condition` parameter.
- **Regex Dialect Idiosyncrasies**: Regular expressions compatible with PostgreSQL can fail on BigQuery or Snowflake due to differing regex engines. *Remediation*: Test regex expressions against warehouse documentation before committing.
- **Alert Fatigue from Strict Statistical Bands**: Setting overly tight standard deviation thresholds triggers false alarms during expected seasonal spikes (e.g. Black Friday). *Remediation*: Use wider tolerance bands and configure non-breaking warnings (`severity: warn`)."""),

        ("arch-dbt-028", "Advanced Jinja for adapter-specific SQL", "How do you architect multi-cloud dbt macros using adapter.dispatch to execute engine-optimized SQL across Snowflake, BigQuery, and Databricks?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Building reusable internal macro packages or maintaining a dbt codebase that operates across multiple cloud data warehouses (e.g., Snowflake in corporate IT, Databricks in data science, BigQuery in marketing) requires abstracting dialect differences. dbt's multiple-dispatch architecture (`adapter.dispatch()`) allows developers to write an abstract macro interface that dynamically resolves to engine-specific SQL implementations at compile time.

### Phase 2: Low-Level Mechanics & Implementation
1. **Dispatch Architecture**: Define the base dispatch entrypoint and engine-specific implementation macros.
2. **Implementation Snippet**:
```sql
-- macros/cross_db/array_agg_string.sql

-- 1. Base entrypoint macro
{% macro array_agg_string(column_name, delimiter=', ') -%}
    {{ adapter.dispatch('array_agg_string', 'enterprise_utils')(column_name, delimiter) }}
{%- endmacro %}

-- 2. Default implementation (Postgres / ANSI)
{% macro default__array_agg_string(column_name, delimiter) -%}
    string_agg({{ column_name }}, '{{ delimiter }}')
{%- endmacro %}

-- 3. Snowflake implementation
{% macro snowflake__array_agg_string(column_name, delimiter) -%}
    listagg({{ column_name }}, '{{ delimiter }}') within group (order by {{ column_name }})
{%- endmacro %}

-- 4. BigQuery implementation
{% macro bigquery__array_agg_string(column_name, delimiter) -%}
    string_agg(cast({{ column_name }} as string), '{{ delimiter }}')
{%- endmacro %}

-- 5. Databricks / Spark implementation
{% macro spark__array_agg_string(column_name, delimiter) -%}
    concat_ws('{{ delimiter }}', collect_list({{ column_name }}))
{%- endmacro %}
```
3. **Invocation**: Call `{{ enterprise_utils.array_agg_string('product_id') }}` identically in any model.

### Phase 3: Production Hardening & Gotchas
- **Missing Namespace in Dispatch Calls**: Calling `adapter.dispatch('my_macro')` without specifying the package namespace causes dbt to miss specialized implementations. *Remediation*: Always pass the package namespace as the second argument: `adapter.dispatch('macro_name', 'package_name')`.
- **Missing Default Fallback Macro**: Forgetting to define `default__my_macro` causes compilation crashes if the project runs on an unexpected adapter (e.g. Redshift or DuckDB). *Remediation*: Always implement a robust `default__` fallback.
- **Complex Jinja Debugging Blindness**: When complex dispatch macros fail, error messages point to compiled SQL without line tracebacks. *Remediation*: Use `{{ log("Dispatching macro for: " ~ target.type, info=True) }}` during development."""),

        ("arch-dbt-029", "dbt for data vault modeling", "How do you architect a scalable Data Vault 2.0 architecture in dbt utilizing Hubs, Links, and Satellites with automated hash keys?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Data Vault 2.0 is an agile, audit-compliant data modeling methodology designed for large-scale enterprise data integration. It splits business entities into three core physical primitives: 
1. **Hubs**: Unique business keys and immutable SHA256 hash keys.
2. **Links**: Unique association relationships representing transactions or joins between Hubs.
3. **Satellites**: Mutable descriptive attributes with load timestamps, hash diffs, and source tracking.
dbt is uniquely suited for Data Vault 2.0 because automated macros (e.g., `automate-dv` / `dbtvault`) can generate standardized DDL/DML models declaratively.

### Phase 2: Low-Level Mechanics & Implementation
1. **Data Vault Structure**: Build Hubs for natural keys, Links for relationships, and Satellites for attributes.
2. **Implementation Snippet**:
```sql
-- models/raw_vault/hubs/hub_customer.sql
{{ config(materialized='incremental', unique_key='customer_hash_key') }}

WITH stage AS (
    SELECT * FROM {{ ref('stg_crm__customers') }}
),

final AS (
    SELECT
        -- Hash key: SHA256 of business key
        {{ dbt_utils.generate_surrogate_key(['customer_id']) }} as customer_hash_key,
        customer_id as customer_business_key,
        current_timestamp() as load_timestamp,
        'CRM_SYSTEM' as record_source
    FROM stage
    {% if is_incremental() %}
        WHERE {{ dbt_utils.generate_surrogate_key(['customer_id']) }} NOT IN (
            SELECT customer_hash_key FROM {{ this }}
        )
    {% endif %}
)

SELECT * FROM final
```
3. **Satellites**: Add `sat_customer.sql` computing `hash_diff` on attributes to track historical mutations.

### Phase 3: Production Hardening & Gotchas
- **Hash Collision Catastrophes**: Using low-entropy algorithms (like MD5) across billions of records risks theoretical hash collisions. *Remediation*: Use SHA256 or SHA512 hashing algorithms for enterprise Data Vault 2.0 implementations.
- **Complex Multi-Table Join Overhead in BI**: Querying raw Data Vault directly in BI dashboards requires joining 8 Hubs and Satellites, killing query performance. *Remediation*: Never expose raw Vault to BI users; build clean dimensional marts (star schemas) over the Vault.
- **Hash Diff Padding Inconsistencies**: Trailing whitespace differences causing false change detection in Satellites. *Remediation*: Standardize trimming and uppercase casting in surrogate hashing macros."""),

        ("arch-dbt-030", "Custom generic test with error messages", "How do you architect reusable custom generic schema tests in dbt that return descriptive failure messages and store exception rows?",
"""### Phase 1: Conceptual Foundation & Core Architecture
While dbt includes basic generic tests (`not_null`, `unique`), enterprise organizations need reusable custom assertions across models: for example, verifying that percentage fields fall strictly between 0 and 100, or asserting that email columns contain valid domains. Writing custom generic tests in the `macros/` directory allows teams to create parameterized assertions that accept column arguments, return failing records, and print clear debugging context.

### Phase 2: Low-Level Mechanics & Implementation
1. **Test Macro Authoring**: Create `macros/tests/test_is_valid_percentage.sql` prefixed with `test_`.
2. **Implementation Snippet**:
```sql
-- macros/tests/test_is_valid_percentage.sql
{% test is_valid_percentage(model, column_name, allow_null=False) %}

WITH validation AS (
    SELECT
        {{ column_name }} as test_value,
        *
    FROM {{ model }}
),

validation_errors AS (
    SELECT
        test_value,
        'Value must be between 0.0 and 100.0 inclusive' as failure_reason
    FROM validation
    WHERE 
        {% if not allow_null %}
            test_value is null or
        {% endif %}
        test_value < 0.0 or test_value > 100.0
)

SELECT * FROM validation_errors

{% endtest %}
```
```yaml
# models/marts/marketing/_marketing__models.yml
models:
  - name: fct_marketing_campaigns
    columns:
      - name: conversion_rate
        tests:
          - is_valid_percentage:
              allow_null: true
```
3. **Execution**: Execute tests via `dbt test --select "test_name:is_valid_percentage"`.

### Phase 3: Production Hardening & Gotchas
- **Returning Summary Counts Instead of Rows**: Writing `SELECT count(*) FROM table WHERE col < 0` inside a test breaks dbt: dbt expects the query to return the offending rows themselves. *Remediation*: Always return the failing rows (`SELECT * FROM errors`); dbt counts them automatically.
- **Non-Descriptive Failure Logs in CI**: When a test fails in GitHub Actions, developers cannot see *why* without logging into the warehouse. *Remediation*: Include a static `failure_reason` column in the test output query.
- **Test Query Timeouts on Large Tables**: Running unindexed custom tests across 200 million rows blocks CI pipelines. *Remediation*: Add configurable `where` parameters in the test macro to test strictly recent partitions."""),
    ]

    for id_val, niche, q_text, ans in scenarios_hard:
        items.append({
            "id": id_val,
            "source": "Architecture Hub",
            "category": "dbt Architecture & Transformation",
            "niche": niche,
            "difficulty": "HARD",
            "question": q_text,
            "answer": ans
        })

    # ARCHITECT (031 - 040)
    scenarios_arch = [
        ("arch-dbt-031", "dbt enterprise architecture (monorepo vs federated)", "How do you architect an enterprise dbt structural strategy evaluating Monorepo vs Federated Multi-Project (dbt Mesh) topologies?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Enterprise data platforms face a fundamental architectural choice when scaling analytics engineering: maintain a single monolithic dbt Git repository or federate into a multi-project dbt Mesh topology. A Monorepo simplifies global lineage, shared macro governance, and unified search, but creates CI bottlenecks, slow compilation, and merge conflict gridlock as team headcount exceeds 30 engineers. A Federated dbt Mesh decentralizes ownership to autonomous business domains, governed by public model contracts and cross-project refs.

### Phase 2: Low-Level Mechanics & Implementation
1. **Decision Matrix**:
- **Monorepo**: Recommended for organizations with <20 analytics engineers, centralized data teams, and tightly coupled domain models.
- **Federated (dbt Mesh)**: Recommended for enterprises with decentralized domain teams, independent release cycles, and multi-cloud data estates.
2. **Implementation Snippet**:
```yaml
# Enterprise dbt Mesh governance architecture
# Central Core Platform Project (contracts strictly enforced)
core_platform/
├── models/
│   ├── staging/
│   └── marts/
│       └── dim_customers.sql # public contract

# Domain A Project (Finance Analytics)
finance_analytics/
├── dependencies.yml
│   └── projects:
│       - name: core_platform
└── models/
    └── fct_revenue.sql # calls ref('core_platform', 'dim_customers')
```
3. **Governance**: Enforce cross-project contract testing in pull request CI runners.

### Phase 3: Production Hardening & Gotchas
- **Cross-Project Circular Coupling**: Domain projects referencing each other in loops destroys topological DAG sorting. *Remediation*: Establish clear architectural tiers: Ingestion Tier -> Core Enterprise Marts -> Domain Marts.
- **Package Version Fragmentation Across Projects**: Different domain projects using conflicting versions of `dbt-utils` leads to subtle transformation bugs. *Remediation*: Maintain a centralized internal enterprise package repo that pins shared utility macros.
- **Breaking Contract Changes Halting Enterprise Operations**: Upstream core team altering a column type in a public model causes downstream builds to break. *Remediation*: Model contracts reject PR merges that introduce breaking schema alterations without version bumping."""),

        ("arch-dbt-032", "dbt Center of Excellence governance model", "How do you architect an enterprise dbt Center of Excellence (CoE) governance framework covering style guides, review gates, and packaging?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Scaling dbt across dozens of decentralized business teams without governance results in SQL spaghetti: inconsistent naming conventions, redundant staging models, duplicate business definitions, and unchecked warehouse spend. A dbt Center of Excellence (CoE) establishes centralized standards: 1) Automated SQL linting via SQLFluff; 2) Architecture evaluation via `dbt-project-evaluator`; 3) Mandatory documentation and contract gates; and 4) Centralized shared macro packages.

### Phase 2: Low-Level Mechanics & Implementation
1. **Automated Governance Gates**: Embed static analysis linters into pre-commit and CI workflows.
2. **Implementation Snippet**:
```yaml
# .sqlfluff configuration for enterprise dbt CoE
[sqlfluff]
dialect = snowflake
templater = dbt
max_line_length = 120

[sqlfluff:rules:capitalisation.keywords]
capitalisation_policy = upper

[sqlfluff:rules:structure.column_order]
# Enforce primary keys first, then foreign keys, then dimensions, then metrics
```
```bash
# Automated CI linter check
sqlfluff lint models/ --config .sqlfluff
dbt run --select package:dbt_project_evaluator
```
3. **Training & Certification**: Provide standardized internal certification tracks for analytics engineers.

### Phase 3: Production Hardening & Gotchas
- **Governance Bottlenecks Slowing Product Teams**: Requiring manual CoE review on every single pull request creates engineering friction. *Remediation*: Automate 100% of syntactic and structural rules via CI bots; reserve human reviews for data architecture designs.
- **Rule Exemption Proliferation**: Developers adding `# noqa` to bypass linting rules leads to degraded code quality over time. *Remediation*: Audit linting exemptions in CI and require manager approval for rule overrides.
- **Decoupled Business Metrics**: Teams defining custom metric macros locally outside the CoE standard causes metric fragmentation. *Remediation*: Mandate that all business metrics reside in the governed dbt Semantic Layer."""),

        ("arch-dbt-033", "dbt + Airflow production orchestration at scale", "How do you architect petabyte-scale dbt orchestration in Apache Airflow using Astronomer Cosmos for granular task execution and retries?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Running dbt in Airflow naively (executing `dbt run` as a single monolithic BashOperator) is an operational anti-pattern: if model #450 fails after 2 hours, the entire task aborts, requiring a full restart without granular retries. Modern enterprise architectures use Astronomer Cosmos to parse dbt's `manifest.json` and dynamically render each dbt model, test, and snapshot as a native Airflow task instance. This unlocks parallel model execution, individual task retries, and unified SLA monitoring.

### Phase 2: Low-Level Mechanics & Implementation
1. **Cosmos Integration**: Configure `DbtTaskGroup` pointing to dbt project path and warehouse profile.
2. **Implementation Snippet**:
```python
from airflow import DAG
from cosmos import DbtTaskGroup, ProjectConfig, ProfileConfig, ExecutionConfig
from cosmos.constants import ExecutionMode
from datetime import datetime

profile_config = ProfileConfig(
    profile_name="snowflake_prod",
    target_name="prod",
    profiles_yml_filepath="/opt/airflow/dbt/profiles.yml"
)

with DAG('orchestrate_dbt_lakehouse', schedule='0 3 * * *', start_date=datetime(2026, 1, 1), catchup=False) as dag:
    dbt_tg = DbtTaskGroup(
        group_id="dbt_production_marts",
        project_config=ProjectConfig("/opt/airflow/dbt/enterprise_project"),
        profile_config=profile_config,
        execution_config=ExecutionConfig(execution_mode=ExecutionMode.LOCAL),
        operator_args={"install_deps": False}, # Pre-baked in Docker image
    )
```
3. **Execution**: Inspect the compiled dbt model tasks rendered in the Airflow Grid View.

### Phase 3: Production Hardening & Gotchas
- **DAG Parsing Latency Overhead**: Schedulers compiling dbt manifests on every parse loop spikes CPU and causes scheduler heartbeats to lag. *Remediation*: Pre-compile `manifest.json` in CI and mount it as a static artifact to Cosmos.
- **Airflow Worker Memory Starvation**: Spawning 16 concurrent dbt subprocesses on a single Airflow worker node exhausts memory. *Remediation*: Use Cosmos with `ExecutionMode.KUBERNETES` to run each dbt model in an ephemeral Kubernetes pod.
- **Database Connection Spikes**: 30 parallel dbt model tasks opening simultaneous warehouse connections saturates user connection limits. *Remediation*: Configure Airflow Pools to restrict maximum concurrent dbt model execution slots."""),

        ("arch-dbt-034", "dbt data product design with contracts", "How do you architect enterprise Data Products in dbt utilizing model contracts, semantic versioning, and access boundaries?",
"""### Phase 1: Conceptual Foundation & Core Architecture
In decentralized data platforms (Data Mesh), datasets must be packaged and governed as formal Data Products. A dbt Data Product encapsulates: 1) Strict Schema Contracts (`contract: {enforced: true}`) ensuring column names and types never break; 2) Semantic Model Versioning (`v1`, `v2`) allowing upstream teams to evolve schemas without disrupting active consumers; and 3) Access Controls (`access: public` vs `access: protected`) defining architectural boundary visibility.

### Phase 2: Low-Level Mechanics & Implementation
1. **Data Product Modeling**: Configure model contracts, column types, and versions in YAML.
2. **Implementation Snippet**:
```yaml
# models/marts/marketing/fct_customer_churn.yml
version: 2

models:
  - name: fct_customer_churn
    latest_version: 2
    access: public
    config:
      contract:
        enforced: true
    versions:
      - v: 1
        columns:
          - name: customer_id
            data_type: string
          - name: churn_score
            data_type: numeric(5,2)
      - v: 2
        columns:
          - name: customer_id
            data_type: string
          - name: churn_probability
            data_type: float
          - name: risk_category
            data_type: string
```
3. **Consumer Migration**: Downstream consumers reference `{{ ref('fct_customer_churn', v=1) }}` during transition periods.

### Phase 3: Production Hardening & Gotchas
- **Silent Schema Contract Breaking**: Modifying column types in SQL without updating YAML contracts causes build failures. *Remediation*: Treat contract YAML files as immutable API contracts; version models whenever schema changes occur.
- **Maintaining Orphaned Legacy Model Versions**: Retaining `v1` models for years consumes unnecessary warehouse storage and ETL compute. *Remediation*: Enforce deprecation deadlines: deprecate older versions with automated SLA warnings.
- **Over-Exposing Internal Implementation Details**: Declaring intermediate models as `public` allows downstream teams to build dependencies on volatile staging logic. *Remediation*: Keep all intermediate models `access: private` or `protected`."""),

        ("arch-dbt-035", "Cost governance via model materializations", "How do you architect cloud data warehouse cost governance in dbt by optimizing materialization strategies, warehouse sizing, and query tagging?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Uncontrolled dbt transformations can rapidly inflate Snowflake, BigQuery, or Databricks cloud bills through unpruned full refreshes, inefficient joins, and over-provisioned compute warehouses. Cost governance architects enforce: 1) Query tagging via `query_tag` configs to track cost per model and business unit; 2) Mandatory incremental materialization on tables exceeding 10M rows; 3) Warehouse routing (directing heavy marts to larger compute and lightweight staging to small warehouses); and 4) Automated monitoring of runtime cost anomalies.

### Phase 2: Low-Level Mechanics & Implementation
1. **Query Tagging & Routing**: Inject dynamic query tags and warehouse selectors into `dbt_project.yml`.
2. **Implementation Snippet**:
```yaml
# dbt_project.yml cost governance configuration
models:
  enterprise_analytics:
    +query_tag: >
      {"project": "enterprise_dw", "model": "{{ this.name }}", "target": "{{ target.name }}"}
    staging:
      +snowflake_warehouse: ETL_XSMALL_WH # Inexpensive compute for lightweight views
    intermediate:
      +materialized: ephemeral
    marts:
      +snowflake_warehouse: ETL_MEDIUM_WH # Dedicated compute for heavy joins
      core:
        fct_large_telemetry:
          +materialized: incremental
          +snowflake_warehouse: ETL_XLARGE_WH
```
3. **Cost Auditing**: Query warehouse billing tables (`SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY`) joined on `QUERY_TAG` to allocate costs per model.

### Phase 3: Production Hardening & Gotchas
- **Accidental Full-Refresh Overwrite on Petabyte Tables**: Running `dbt run --full-refresh` on a 50-billion row fact table burns thousands in compute credits. *Remediation*: Implement pre-hook guards that raise exceptions if `--full-refresh` is passed without an explicit administrative override flag.
- **Idle Warehouse Spin Costs**: Running models sequentially with long gaps prevents the warehouse from auto-suspending. *Remediation*: Batch models concurrently using high thread counts (`--threads 16`) to maximize compute utilization before auto-suspend.
- **Unused Materialized Marts**: Building 100 daily mart tables that zero BI users or dashboards ever query wastes compute. *Remediation*: Audit warehouse query logs for unused tables and downgrade them to ephemeral models or deprecate them."""),

        ("arch-dbt-036", "dbt lineage for enterprise data catalog", "How do you architect automated metadata ingestion from dbt manifest.json and run_results.json into enterprise catalogs like Microsoft Purview, Collibra, or DataHub?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Enterprise data governance requires global metadata visibility: compliance teams must track data lineage from operational source databases through dbt transformations to downstream executive dashboards. Rather than maintaining manual data dictionaries, dbt produces authoritative compiled artifacts (`manifest.json`, `catalog.json`, `run_results.json`). Metadata ingestion pipelines parse these artifacts and automatically push table descriptions, column types, test assertions, and column-level lineage graphs into enterprise catalogs.

### Phase 2: Low-Level Mechanics & Implementation
1. **Artifact Extraction**: Ingest `target/manifest.json` after production deployment into enterprise catalog APIs.
2. **Implementation Snippet**:
```python
# Ingestion script pushing dbt lineage to DataHub / OpenLineage API
import json
import requests

def push_dbt_metadata_to_catalog(manifest_path, run_results_path):
    with open(manifest_path) as f:
        manifest = json.load(f)
    with open(run_results_path) as f:
        run_results = json.load(f)

    for node_id, node in manifest['nodes'].items():
        if node['resource_type'] == 'model':
            model_name = node['name']
            columns = node['columns']
            upstream_deps = node['depends_on']['nodes']
            
            payload = {
                "urn": f"urn:li:dataset:(urn:li:dataPlatform:snowflake,{model_name},PROD)",
                "description": node.get('description', ''),
                "columns": [{"name": k, "type": v['data_type']} for k, v in columns.items()],
                "upstreams": upstream_deps
            }
            # Post to Enterprise Data Catalog REST API
            print(f"Registered {model_name} with {len(upstream_deps)} upstreams in Data Catalog.")

push_dbt_metadata_to_catalog('target/manifest.json', 'target/run_results.json')
```
3. **Lineage Visualization**: Inspect cross-platform end-to-end lineage in Microsoft Purview or DataHub.

### Phase 3: Production Hardening & Gotchas
- **Missing Column-Level Lineage in External Catalogs**: Parsing only table-level `depends_on` fails to capture column-to-column transformation mapping. *Remediation*: Use advanced lineage tools (e.g. sqlglot, OpenLineage) to parse model SQL and extract column-level DAG edges.
- **Catalog Flooded with Internal Ephemeral Models**: Registering internal CTEs and test models in the enterprise catalog confuses business stakeholders. *Remediation*: Filter catalog ingestion scripts strictly to `resource_type: model` within the `marts/` directory.
- **Desynchronized Lineage on Partial Builds**: Running a partial build produces a `run_results.json` that represents only 5% of the estate. *Remediation*: Only ingest artifacts from full weekly production baselines or merge partial run results into the master catalog."""),

        ("arch-dbt-037", "Multi-cloud dbt deployment strategy", "How do you architect a multi-cloud dbt transformation platform operating seamlessly across AWS, Azure, and Google Cloud?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Large enterprises operate multi-cloud footprints (e.g. AWS Redshift for transactional analytics, Azure Databricks for Lakehouse ML, and GCP BigQuery for ad-tech). A multi-cloud dbt architecture establishes a single version-controlled repository containing cross-platform transformation models. By leveraging cross-database macros (`dbt-utils`), standardized directory conventions, and parameterized environment profiles, teams deploy identical business logic across cloud boundaries without vendor lock-in.

### Phase 2: Low-Level Mechanics & Implementation
1. **Multi-Target Configuration**: Configure target outputs for each cloud platform in `profiles.yml`.
2. **Implementation Snippet**:
```yaml
# profiles.yml supporting multi-cloud target deployments
enterprise_multicloud:
  target: azure_databricks
  outputs:
    aws_redshift:
      type: redshift
      host: redshift-cluster.internal.us-east-1.redshift.amazonaws.com
      user: "{{ env_var('REDSHIFT_USER') }}"
      database: analytics
      schema: marts
    azure_databricks:
      type: databricks
      host: adb-123456789.azuredatabricks.net
      http_path: /sql/1.0/warehouses/abcdef12345
      schema: marts
    gcp_bigquery:
      type: bigquery
      method: service-account
      project: enterprise-bigquery-prod
      dataset: marts
```
3. **Execution**: Target specific clouds via CLI: `dbt build --target gcp_bigquery`.

### Phase 3: Production Hardening & Gotchas
- **Dialect SQL Incompatibilities**: Writing raw dialect functions (e.g. `DATE_TRUNC('month', ts)` vs `TIMESTAMP_TRUNC(ts, MONTH)`) breaks cross-cloud runs. *Remediation*: Always use dbt's cross-database macros (`{{ dbt.date_trunc('month', 'ts') }}`).
- **Cross-Cloud Egress Cost Explosions**: Joining tables stored in AWS S3 with models running in BigQuery incurs prohibitive cross-cloud data transfer fees. *Remediation*: Execute transformations strictly within the cloud boundary hosting the source data; share finished marts via Delta Sharing or BigQuery Omni.
- **Divergent Data Types Across Platforms**: Snowflake stores timestamps as `TIMESTAMP_NTZ`, while BigQuery uses `TIMESTAMP` (always UTC), causing test comparison mismatches. *Remediation*: Define canonical data type casting macros in the project's macro utility layer."""),

        ("arch-dbt-038", "dbt testing pyramid for data quality", "How do you architect an enterprise Testing Pyramid in dbt spanning unit tests, generic schema tests, singular tests, and freshness audits?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Reliable analytics engineering requires structuring data quality validation across a multi-tier testing pyramid:
1. **Base (Unit Tests)**: Fast, in-memory mock tests (dbt 1.8+) validating business logic and edge cases before running queries.
2. **Layer 2 (Generic Schema Tests)**: Structural assertions (`unique`, `not_null`, `accepted_values`) enforced across 100% of staging and mart models.
3. **Layer 3 (Singular Business Tests)**: Domain-specific SQL assertions validating cross-table financial reconciliations.
4. **Apex (Data Observability)**: Anomaly detection monitoring volume shifts, distribution drift, and source freshness.

### Phase 2: Low-Level Mechanics & Implementation
1. **Test Hierarchy Configuration**: Structure tests across models, directories, and CI stages.
2. **Implementation Snippet**:
```yaml
# dbt_project.yml enforcing test severity and coverage across layers
models:
  enterprise_dw:
    staging:
      # Mandatory structural schema tests on all primary keys
      +tests:
        - unique:
            config: {severity: error}
        - not_null:
            config: {severity: error}
    marts:
      core:
        # Enforce unit tests and business invariants
        +tests:
          - relationships:
              config: {severity: error}

# CI Execution Order adhering to Testing Pyramid
# 1. Unit Tests (fastest, in-memory)
# 2. Source Freshness
# 3. Model Build + Generic Schema Tests
# 4. Singular Cross-Table Invariants
```
3. **Execution**: Execute tiered verification via `dbt test --select "test_type:unit"` then `dbt build`.

### Phase 3: Production Hardening & Gotchas
- **Over-Testing Non-Critical Metadata**: Applying 20 tests to low-value description columns slows CI builds without adding business value. *Remediation*: Focus strict `error` severity tests strictly on primary keys, foreign keys, and financial measures.
- **Silent Failures via Warnings**: Setting `severity: warn` on critical primary key tests allows corrupted data to flow downstream into production marts unnoticed. *Remediation*: Primary key tests must always enforce `severity: error`.
- **Test Query Costs Exceeding Model Transformation Costs**: Running complex relationship queries across unpartitioned tables costs more than the actual model build. *Remediation*: Scope relationship tests to recent data using `where: "order_date >= current_date() - 14"`."""),

        ("arch-dbt-039", "dbt Fusion engine migration strategy", "How do you architect an enterprise migration strategy to adopt next-generation compiled execution engines for dbt?",
"""### Phase 1: Conceptual Foundation & Core Architecture
As enterprise dbt codebases scale to thousands of models, legacy compilation cycles encounter latency bottlenecks during AST parsing, macro evaluations, and warehouse metadata queries. Next-generation execution architectures (such as dbt's accelerated Rust-based static parser, multi-engine execution pipelines, and local development engines like DuckDB) drastically accelerate developer iteration cycles and decouple transformation compilation from warehouse round-trips.

### Phase 2: Low-Level Mechanics & Implementation
1. **Migration Blueprint**: Static Parser Enablement -> DuckDB Local Virtual Execution -> Production Pilot.
2. **Implementation Snippet**:
```bash
# Automated migration verification script
#!/usr/bin/env bash
set -euo pipefail

echo "Enabling advanced static parsing and compiling project..."
dbt compile --use-experimental-parser

echo "Running parity audit against legacy compilation artifacts..."
diff -u target/manifest.json ./baseline-manifest.json || echo "Compilation artifacts match baseline."

echo "Testing models locally in DuckDB sandbox before warehouse execution..."
dbt build --target duckdb_local --select "tag:core"
```
3. **Parity Testing**: Run `dbt-audit-helper` to prove mathematical data parity between legacy and modern engine outputs.

### Phase 3: Production Hardening & Gotchas
- **Jinja Macro Introspection Incompatibilities**: Complex macros executing arbitrary database queries via `run_query` bypass static parsing and force fallback to slow Python parsing. *Remediation*: Refactor macros to separate compile-time static logic from runtime database queries.
- **Local Sandbox Dialect Mismatches**: Testing in local DuckDB sandboxes using warehouse-specific functions (e.g. Snowflake `FLATTEN`) fails compilation. *Remediation*: Use `dbt-utils` cross-database macros to maintain syntax compatibility across local and production targets.
- **Unverified Third-Party Package Incompatibilities**: Upgrading compiler engines can break older unmaintained dbt community packages. *Remediation*: Audit all dependencies in `packages.yml` and test package macro compilation in isolated CI branches."""),

        ("arch-dbt-040", "Building observable dbt pipelines (Elementary)", "How do you architect automated pipeline observability, anomaly detection, and automated Slack alerting in dbt using Elementary?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Silent data corruptions (e.g., an upstream API dropping 40% of records, or average order values doubling due to currency errors) bypass standard schema tests because the data is not null and rows are unique. Elementary is an open-source data observability package that runs natively inside dbt. It monitors volume anomalies, column-level metric distributions, and freshness drift over time, generating automated alerts and interactive observability dashboards.

### Phase 2: Low-Level Mechanics & Implementation
1. **Package Installation**: Add `elementary-data/elementary` to `packages.yml` and create an elementary profile.
2. **Implementation Snippet**:
```yaml
# models/marts/core/_core__models.yml
version: 2

models:
  - name: fct_orders
    tests:
      # Anomaly test on table row volume over a 30-day moving window
      - elementary.volume_anomalies:
          time_bucket:
            period: day
            count: 1
          anomaly_sensitivity: 3.0
    columns:
      - name: order_amount_usd
        tests:
          # Statistical anomaly detection on average order amount
          - elementary.column_anomalies:
            column_anomalies:
              - average
              - zero_count
```
```bash
# Generate interactive observability report
edr report --open-browser
```
3. **Alerting**: Configure Elementary CLI daemon to dispatch rich diagnostic alerts directly to Slack.

### Phase 3: Production Hardening & Gotchas
- **Cold Start Anomaly False Alarms**: Running volume anomaly tests on newly created tables with only 2 days of history triggers false alarms due to lack of historical baseline. *Remediation*: Configure `training_period: {period: day, count: 14}` and disable alerting during initial table warmup.
- **Elementary Schema Storage Bloat**: Elementary stores test metrics and run histories in dedicated database tables (`elementary` schema); high-frequency runs can bloat storage. *Remediation*: Schedule periodic maintenance models to purge metrics older than 90 days.
- **Slack Alert Flooding on Batch Failures**: When a major warehouse outage occurs, Elementary can emit hundreds of simultaneous Slack messages. *Remediation*: Configure alert aggregation rules in `config.yml` to group multiple model failures into a single incident thread."""),
    ]

    for id_val, niche, q_text, ans in scenarios_arch:
        items.append({
            "id": id_val,
            "source": "Architecture Hub",
            "category": "dbt Architecture & Transformation",
            "niche": niche,
            "difficulty": "ARCHITECT",
            "question": q_text,
            "answer": ans
        })

    return items
