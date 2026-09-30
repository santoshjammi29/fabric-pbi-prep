# arch_dbt_data_advanced.py
# Scenarios 011-040 for dbt Architecture & Transformation

def get_advanced_dbt_scenarios():
    items = []

    # MEDIUM (011 - 020)
    scenarios_med = [
        ("arch-dbt-011", "Incremental model design for fact tables", "How do you architect an enterprise incremental fact table in dbt using MERGE strategies, unique keys, and lookback windows?",
"""### Phase 1: Conceptual Foundation & Core Architecture
For multi-billion row transactional tables, rebuilding physical tables from scratch daily is computationally impossible and cost-prohibitive. Incremental materialization processes only new or updated records since the previous dbt run. An enterprise incremental design incorporates: 1) A unique primary key for SQL MERGE operations; 2) An explicit lookback window (e.g. 3 days) to capture late-arriving records; and 3) Partition pruning filters on the target table to restrict warehouse scans.

### Phase 2: Low-Level Mechanics & Implementation
1. **Incremental Configuration**: Configure `unique_key`, `incremental_strategy`, and lookback filters.
2. **Implementation Snippet**:
```sql
-- models/marts/core/fct_orders_incremental.sql
{{ config(
    materialized='incremental',
    unique_key='order_id',
    incremental_strategy='merge',
    cluster_by=['order_date']
) }}

WITH source_orders AS (
    SELECT * FROM {{ ref('stg_ecommerce__orders') }}
    {% if is_incremental() %}
        -- Lookback 3 days to capture late-arriving and updated records
        WHERE updated_at >= (
            SELECT dateadd(day, -3, coalesce(max(updated_at), '1970-01-01')) 
            FROM {{ this }}
        )
    {% endif %}
),

final AS (
    SELECT
        order_id,
        customer_id,
        order_status,
        order_amount_usd,
        cast(ordered_at as date) as order_date,
        updated_at
    FROM source_orders
)

SELECT * FROM final
```
3. **Backfill**: Execute full historical recalculation via `dbt run --select fct_orders_incremental --full-refresh`.

### Phase 3: Production Hardening & Gotchas
- **Target Table Full Scan During MERGE**: In Snowflake/Databricks, MERGE operations without partition pruning scan the entire historical target table. *Remediation*: Add partition pruning predicates to the MERGE statement or cluster by `order_date`.
- **Late-Arriving Data Amnesia**: Checking strictly `updated_at > max(updated_at)` misses records that were delayed in transit by 12 hours. *Remediation*: Always include a lookback buffer (e.g., `-3 days`) in the `is_incremental()` filter.
- **Unbounded Duplicate Appends**: Omitting `unique_key` causes dbt to default to `insert into` append mode, creating duplicates on retries. *Remediation*: Always define `unique_key` unless building an immutable, write-only telemetry log."""),

        ("arch-dbt-012", "SCD Type 2 with dbt snapshots", "How do you architect Slowly Changing Dimension Type 2 (SCD Type 2) tracking in dbt using snapshots and change detection strategies?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Transactional databases routinely overwrite mutable records in place (e.g., customer address updates or subscription tier upgrades), destroying historical analytics context. dbt Snapshots implement Kimball Slowly Changing Dimension Type 2 (SCD Type 2) tracking. dbt periodically queries the mutable source, detects changes between runs, inserts new rows, and sets `dbt_valid_to` timestamps on superseded versions.

### Phase 2: Low-Level Mechanics & Implementation
1. **Snapshot Configuration**: Create `snapshots/snap_customers.sql` with target schema and strategy.
2. **Implementation Snippet**:
```sql
-- snapshots/snap_customers.sql
{% snapshot snap_customers %}

{{
    config(
      target_database='analytics_prod',
      target_schema='snapshots',
      unique_key='customer_id',
      strategy='timestamp',
      updated_at='updated_at',
      invalidate_hard_deletes=True,
    )
}}

SELECT
    customer_id,
    first_name,
    last_name,
    email,
    plan_tier,
    billing_country,
    updated_at
FROM {{ source('billing_app', 'raw_customers') }}

{% endsnapshot %}
```
3. **Execution**: Run snapshot cycle via CLI: `dbt snapshot`.

### Phase 3: Production Hardening & Gotchas
- **Unreliable Source Timestamps**: Using `strategy='timestamp'` when the upstream database does not update `updated_at` on every change causes dbt to miss mutations. *Remediation*: Use `strategy='check'` with `check_cols=['plan_tier', 'billing_country']`.
- **Hard Deletes Orphaned Records**: When source records are hard-deleted in the source DB, standard snapshots keep them valid forever. *Remediation*: Set `invalidate_hard_deletes=True` to close out `dbt_valid_to` on deleted rows.
- **Direct Queries on Snapshot Tables in BI**: Analysts writing complex queries directly against snapshot tables without filtering for `dbt_valid_to IS NULL` duplicate records in aggregations. *Remediation*: Build a clean `dim_customers` view over the snapshot that filters for active records."""),

        ("arch-dbt-013", "Custom schema override for environment-based deployment", "How do you architect dynamic schema naming in dbt by overriding the generate_schema_name macro across dev, staging, and prod?",
"""### Phase 1: Conceptual Foundation & Core Architecture
By default, dbt concatenates the target schema with any custom schema defined on a model (e.g., `schema: finance` in target `analytics_prod` produces `analytics_prod_finance`). In enterprise architectures, production data models must write directly to clean, standardized schemas (`finance`, `marketing`, `core`), while developer sandboxes must remain isolated (`dev_username_finance`). Overriding the built-in `generate_schema_name` macro establishes centralized schema governance.

### Phase 2: Low-Level Mechanics & Implementation
1. **Macro Override**: Create `macros/generate_schema_name.sql` to implement environment-aware routing.
2. **Implementation Snippet**:
```sql
-- macros/generate_schema_name.sql
{% macro generate_schema_name(custom_schema_name, node) -%}

    {%- set default_schema = target.schema -%}
    
    {%- if target.name == 'prod' -%}
        {# In production, use the clean custom schema directly without prefixing #}
        {%- if custom_schema_name is none -%}
            {{ default_schema }}
        {%- else -%}
            {{ custom_schema_name | trim }}
        {%- endif -%}

    {%- else -%}
        {# In dev and CI, prefix the custom schema with the developer's sandbox schema #}
        {%- if custom_schema_name is none -%}
            {{ default_schema }}
        {%- else -%}
            {{ default_schema }}_{{ custom_schema_name | trim }}
        {%- endif -%}

    {%- endif -%}

{%- endmacro %}
```
3. **Model Assignment**: Assign `schema: finance` in `dbt_project.yml` or model `config()`.

### Phase 3: Production Hardening & Gotchas
- **Accidental Production Overwrite in Dev**: A misconfigured macro routing dev runs into clean production schemas corrupts operational data. *Remediation*: Enforce strict warehouse role separation: developer credentials must lack CREATE/DROP privileges in production schemas.
- **Empty Custom Schema Fallbacks**: Models without explicit `schema` configs defaulting to root schemas clutter the database. *Remediation*: Ensure the macro handles `custom_schema_name is none` cleanly.
- **CI Ephemeral Schema Collisions**: Concurrent pull request CI runs sharing identical dev schema prefixes overwrite each other's test tables. *Remediation*: Include PR number in the target schema string (`ci_pr_123`)."""),

        ("arch-dbt-014", "Macro for dynamic date filtering", "How do you architect reusable Jinja macros in dbt to implement standardized, dynamic date filtering and fiscal period calculations?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Repeatedly writing complex date logic (calculating rolling 90-day windows, fiscal quarter boundaries, or localized timezone offsets) across 50 different SQL models leads to human error and divergent calculations. Designing parameterizable dbt macros encapsulates complex date algorithms into single-source-of-truth functions that compile cleanly into warehouse-specific SQL.

### Phase 2: Low-Level Mechanics & Implementation
1. **Macro Authoring**: Author `macros/date_helpers.sql` with default arguments and input validation.
2. **Implementation Snippet**:
```sql
-- macros/date_helpers.sql
{% macro rolling_date_filter(column_name, lookback_days=30) -%}
    {{ column_name }} >= dateadd(day, -{{ lookback_days }}, current_date())
    and {{ column_name }} < current_date()
{%- endmacro %}

{% macro get_fiscal_quarter(date_column, fiscal_year_start_month=2) -%}
    -- Calculates fiscal quarter when fiscal year begins in February
    case
        when month({{ date_column }}) in (2, 3, 4) then 'Q1'
        when month({{ date_column }}) in (5, 6, 7) then 'Q2'
        when month({{ date_column }}) in (8, 9, 10) then 'Q3'
        else 'Q4'
    end
{%- endmacro %}
```
```sql
-- Usage in a dbt model
SELECT 
    order_id,
    {{ get_fiscal_quarter('ordered_at') }} as fiscal_quarter,
    order_amount_usd
FROM {{ ref('stg_ecommerce__orders') }}
WHERE {{ rolling_date_filter('ordered_at', lookback_days=60) }}
```
3. **Compilation Inspection**: Verify emitted SQL using `dbt compile --select my_model`.

### Phase 3: Production Hardening & Gotchas
- **SQL Injection via String Inputs**: Passing unsanitized string literals into date macros can result in syntax or injection errors. *Remediation*: Validate input types within the macro using `{% if not lookback_days is number %}`.
- **Timezone Drift Across Warehouse Nodes**: Calling `current_date()` without timezone casting causes different query results depending on server regional time. *Remediation*: Explicitly wrap date calls in UTC (e.g., `convert_timezone('UTC', current_timestamp())`).
- **Index Suppression on Date Math**: Wrapping the table column in a function (e.g. `WHERE to_char(col) = '2026-09'`) prevents partition skipping in warehouses. *Remediation*: Apply date math to the literal boundary, keeping the table column unmanipulated."""),

        ("arch-dbt-015", "dbt-utils cross-db compatibility macros", "How do you architect cross-database SQL portability in dbt using dbt-utils macros for multi-warehouse and migration support?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Enterprise data platforms frequently migrate across warehouses (e.g. from Redshift to Snowflake, or Snowflake to Databricks) or operate across multiple cloud providers simultaneously. Writing database-specific dialect functions (like `listagg`, `date_diff`, or `split_part`) tightly couples models to a single vendor. The open-source `dbt-utils` package provides standardized cross-database macros that compile to the correct native SQL dialect of the active target warehouse.

### Phase 2: Low-Level Mechanics & Implementation
1. **Package Installation**: Declare `dbt-utils` in `packages.yml` and run `dbt deps`.
2. **Implementation Snippet**:
```yaml
# packages.yml
packages:
  - package: dbt-labs/dbt_utils
    version: 1.1.1
```
```sql
-- models/intermediate/int_order_payments_pivoted.sql
WITH payments AS (
    SELECT * FROM {{ ref('stg_stripe__payments') }}
)

SELECT
    order_id,
    -- Generates MD5/SHA256 surrogate key compatible with any warehouse
    {{ dbt_utils.generate_surrogate_key(['order_id', 'payment_id']) }} as payment_hash_key,
    
    -- Dynamic column pivoting without manual CASE statements
    {{ dbt_utils.pivot(
        column='payment_method',
        values=['credit_card', 'paypal', 'apple_pay', 'bank_transfer'],
        then_value='payment_amount_usd',
        else_value=0
    ) }}
FROM payments
GROUP BY 1, 2
```
3. **Execution**: Verify compiled SQL via `dbt compile`.

### Phase 3: Production Hardening & Gotchas
- **Package Version Drift**: Leaving package versions unpinned causes unexpected breaking macro changes when new major versions release. *Remediation*: Always pin semantic versions in `packages.yml` (e.g. `version: [">=1.1.0", "<1.2.0"]`).
- **Heavy Pivot Column Cardinality**: Pivoting a column with 100 distinct values generates a 100-line query plan that degrades warehouse compiler performance. *Remediation*: Restrict pivoting to low-cardinality columns (<15 distinct values).
- **Surrogate Key NULL Collisions**: In early `dbt-utils` versions, NULL values could cause hash collision anomalies. *Remediation*: Upgrade to `dbt_utils.generate_surrogate_key` which implements modern separator framing."""),

        ("arch-dbt-016", "Slim CI with state:modified", "How do you architect Slim CI in dbt using state:modified selectors to reduce pull request build times by over 80%?",
"""### Phase 1: Conceptual Foundation & Core Architecture
In enterprise dbt repositories containing thousands of models, executing a full `dbt build` on every pull request takes 45-90 minutes and drains cloud compute budgets. Slim CI (State-Based CI) compares the pull request branch against a production `manifest.json` artifact downloaded from the latest successful main branch run. Using the `state:modified+` graph selector, dbt builds only the modified models and their immediate downstream dependents in an ephemeral PR schema.

### Phase 2: Low-Level Mechanics & Implementation
1. **State Manifest Pipeline**: Download production `manifest.json` from S3 into a local directory (`./prod-artifacts`).
2. **Implementation Snippet**:
```bash
# Slim CI Execution Command in GitHub Actions / GitLab CI
#!/usr/bin/env bash
set -euo pipefail

# 1. Download latest successful production manifest artifact
aws s3 cp s3://enterprise-dbt-artifacts/prod/manifest.json ./prod-artifacts/manifest.json

# 2. Run Slim CI: Build ONLY modified models + downstream dependents
# Use --defer to resolve unbuilt upstream dependencies to production tables
dbt build \
  --select state:modified+ \
  --defer \
  --state ./prod-artifacts \
  --target ci \
  --vars "{\"target_schema_override\": \"ci_pr_${PR_NUMBER}\"}"
```
3. **Verification**: Confirm that unchanged upstream models are deferred to production tables.

### Phase 3: Production Hardening & Gotchas
- **Upstream Deferral Schema Permissions**: The CI service account lacking SELECT permissions on production schemas causes deferred queries to fail. *Remediation*: Grant read-only SELECT permissions on production schemas to the CI role.
- **Corrupted Production Manifest**: If a broken production run uploads a corrupt `manifest.json`, all subsequent PR Slim CI builds fail. *Remediation*: Ensure the artifact upload script runs strictly after a 100% successful production `dbt build`.
- **Macro Modifications Triggering Entire Project Rebuild**: Modifying a global core macro marks all 2,000 models as `state:modified`, negating Slim CI benefits. *Remediation*: Structure macros into modular packages and evaluate changes carefully."""),

        ("arch-dbt-017", "Pre/post hooks for table grants", "How do you architect centralized role-based access control (RBAC) in dbt using pre/post hooks and grants configurations?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Data platforms require least-privilege security controls: BI tools (Power BI, Tableau) need read-only access to analytical marts, data science roles require raw feature access, and finance marts require restricted role permissions. Historically, engineers wrote manual `post_hook` statements (`GRANT SELECT ON {{ this }} TO ROLE bi_users`). Modern dbt introduces the native `grants:` configuration block, standardizing RBAC across models and tables.

### Phase 2: Low-Level Mechanics & Implementation
1. **Centralized Grants**: Configure permissions globally in `dbt_project.yml` and selectively in models.
2. **Implementation Snippet**:
```yaml
# dbt_project.yml native grants configuration
models:
  enterprise_dw:
    marts:
      +grants:
        select: ['ROLE_BI_ANALYSTS', 'ROLE_DATA_SCIENCE']
      finance:
        +grants:
          select: ['ROLE_FINANCE_OFFICERS'] # Restrict finance marts to finance roles
```
```sql
-- models/marts/finance/fct_executive_payroll.sql
{{ config(
    materialized='table',
    post_hook=[
        "ALTER TABLE {{ this }} SET TAG confidential = 'true'",
        "INSERT INTO audit.model_build_log VALUES ('{{ this.name }}', current_timestamp())"
    ]
) }}

SELECT * FROM {{ ref('stg_payroll_data') }}
```
3. **Execution**: Verify applied privileges via `SHOW GRANTS ON TABLE fct_executive_payroll`.

### Phase 3: Production Hardening & Gotchas
- **Post-Hook Failures Breaking Model Builds**: A benign auditing post-hook timing out fails the entire model build even after data is written. *Remediation*: Ensure post-hooks execute fast, non-blocking administrative statements.
- **Role Name Mismatches Across Environments**: Granting `ROLE_BI_ANALYSTS` fails in developer sandboxes where that role does not exist. *Remediation*: Wrap grants in environment conditions or use dbt's native `grants:` which handles non-existent dev roles gracefully.
- **Revocation Oversight**: Adding grants in dbt grants permissions, but removing a role from YAML does not automatically revoke existing privileges. *Remediation*: Schedule periodic automated security sweeps to reconcile warehouse grants against dbt configurations."""),

        ("arch-dbt-018", "Source-to-target mapping with dbt Exposures", "How do you architect end-to-end data lineage in dbt using Exposures to track downstream BI dashboards and ML pipelines?",
"""### Phase 1: Conceptual Foundation & Core Architecture
The modern analytics engineering lifecycle does not terminate when dbt finishes materializing database tables; value is realized in downstream consumption tools: Power BI dashboards, Tableau workbooks, reverse-ETL syncs (Census, Hightouch), and ML model features. dbt Exposures declare these downstream consumer assets in YAML files. This completes the DAG lineage from raw sources to final executive reports, enabling automated impact analysis before changing upstream SQL schemas.

### Phase 2: Low-Level Mechanics & Implementation
1. **Exposure Declaration**: Author `models/exposures/executive_dashboards.yml`.
2. **Implementation Snippet**:
```yaml
# models/exposures/executive_dashboards.yml
version: 2

exposures:
  - name: executive_weekly_revenue_dashboard
    type: dashboard
    maturity: high
    url: https://app.powerbi.com/groups/123/reports/456
    description: "Primary KPI dashboard reviewed every Monday by the Executive Committee."
    owner:
      name: Finance BI Team
      email: finance-bi@enterprise.com
    depends_on:
      - ref('fct_orders')
      - ref('dim_customers')
      - ref('fct_monthly_financial_reconciliation')
```
3. **Selective Execution**: Test all models feeding this dashboard: `dbt test --select +exposure:executive_weekly_revenue_dashboard`.

### Phase 3: Production Hardening & Gotchas
- **Stale Exposure Lineage Drift**: Dashboard developers add new fields without updating exposure YAMLs, leading to outdated lineage graphs. *Remediation*: Automate exposure generation using BI API crawlers (e.g. elementary, dbt-powerbi-lineage).
- **Overly Broad Exposure Selections**: Running `dbt test --select +exposure:x` in production can accidentally pull in dozens of upstream models. *Remediation*: Scope selection flags to specific layers (`--select 1+exposure:x`).
- **Unverified Owner Email Addresses**: Missing or invalid owner emails in exposure metadata breaks automated alerting when upstream data fails. *Remediation*: Enforce mandatory, validated team distribution lists in exposure YAML linting."""),

        ("arch-dbt-019", "dbt Semantic Layer for BI tools", "How do you architect an enterprise Semantic Layer in dbt using MetricFlow to deliver consistent metric definitions across Tableau, Power BI, and Hex?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Different departments often compute core business metrics (e.g. Monthly Recurring Revenue, Active Users, Churn Rate) using conflicting SQL definitions in separate BI tools, creating conflicting executive reporting. The dbt Semantic Layer (powered by MetricFlow) centralizes metric logic directly in version-controlled dbt YAML. Downstream BI applications query metrics via standard GraphQL, JDBC, or REST APIs; MetricFlow dynamically compiles and executes the required SQL on the data warehouse.

### Phase 2: Low-Level Mechanics & Implementation
1. **Semantic Model Modeling**: Define semantic entities, measures, dimensions, and metrics in YAML.
2. **Implementation Snippet**:
```yaml
# models/semantic/semantic_orders.yml
version: 2

semantic_models:
  - name: semantic_orders
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
      - name: total_revenue
        agg: sum
        expr: order_amount_usd

metrics:
  - name: monthly_gross_revenue
    description: "Sum of gross order revenue by calendar month."
    type: simple
    type_params:
      measure: total_revenue
```
3. **Query Interface**: Query metrics via CLI or JDBC: `dbt sl query --metrics monthly_gross_revenue --group-by ordered_at__month`.

### Phase 3: Production Hardening & Gotchas
- **Metric Explosion Query Latency**: Complex metric queries with multiple dimensions running against raw fact tables cause high BI query latency. *Remediation*: Materialize pre-aggregated dimensional summary tables in the semantic model configuration.
- **Fan-Out Dimension Join Cartesian Products**: Joining measures across different entity grains can cause accidental duplicate summations. *Remediation*: MetricFlow enforces valid join paths; ensure primary and foreign entity relationships are strictly defined.
- **API Rate Limiting on External BI Refreshes**: Hundreds of users refreshing semantic dashboards simultaneously can saturate dbt Cloud Semantic Layer APIs. *Remediation*: Implement semantic layer caching and query proxy layers."""),

        ("arch-dbt-020", "Advanced singular tests for business rules", "How do you architect complex singular data quality assertions in dbt to validate cross-table financial balances and invariants?",
"""### Phase 1: Conceptual Foundation & Core Architecture
While generic schema tests (`unique`, `not_null`) assert column-level integrity, enterprise financial compliance requires validating complex multi-table invariants: for example, verifying that the sum of line item credits equals ledger debits, or that customer account balances match historical ledger transactions. Singular tests are standalone SQL queries stored in `tests/`: if the query returns 0 rows, the assertion passes; if any exception rows are returned, dbt halts the pipeline.

### Phase 2: Low-Level Mechanics & Implementation
1. **Singular Test Query**: Author `tests/assert_order_total_matches_payments.sql`.
2. **Implementation Snippet**:
```sql
-- tests/assert_order_total_matches_payments.sql
-- Fails if an order's recorded total amount does not equal the sum of completed payments
WITH order_totals AS (
    SELECT 
        order_id,
        order_amount_usd
    FROM {{ ref('fct_orders') }}
    WHERE order_status = 'COMPLETED'
),

payment_totals AS (
    SELECT
        order_id,
        sum(payment_amount_usd) as total_paid
    FROM {{ ref('stg_stripe__payments') }}
    WHERE payment_status = 'SUCCESS'
    GROUP BY 1
),

discrepancies AS (
    SELECT
        o.order_id,
        o.order_amount_usd,
        coalesce(p.total_paid, 0) as total_paid,
        abs(o.order_amount_usd - coalesce(p.total_paid, 0)) as difference_usd
    FROM order_totals o
    LEFT JOIN payment_totals p ON o.order_id = p.order_id
    WHERE abs(o.order_amount_usd - coalesce(p.total_paid, 0)) > 0.01 -- Tolerance threshold
)

SELECT * FROM discrepancies
```
3. **Execution**: Execute assertions via `dbt test --select test_name`.

### Phase 3: Production Hardening & Gotchas
- **Floating Point Rounding False Positives**: Comparing `SUM(float)` columns with `=` generates tiny fractional rounding discrepancies ($0.0000001) that fail tests. *Remediation*: Always use exact `numeric(18,2)` types and test with delta tolerance thresholds (`abs(a - b) > 0.01`).
- **Singular Test Query Timeouts**: Running unindexed cross-table aggregations across 500 million rows causes tests to time out. *Remediation*: Filter the singular test to recent date partitions using `WHERE order_date >= current_date() - 7`.
- **Failing Without Traceability**: Identifying which transaction caused a singular test failure is impossible if the query outputs only an aggregate count. *Remediation*: Always return the offending primary keys and descriptive error fields in the `SELECT` clause."""),
    ]

    for id_val, niche, q_text, ans in scenarios_med:
        items.append({
            "id": id_val,
            "source": "Architecture Hub",
            "category": "dbt Architecture & Transformation",
            "niche": niche,
            "difficulty": "MEDIUM",
            "question": q_text,
            "answer": ans
        })

    # HARD (021 - 030) & ARCHITECT (031 - 040)
    from arch_dbt_data_expert import get_expert_dbt_scenarios
    items.extend(get_expert_dbt_scenarios())

    return items
