# arch_dbt_data.py
# High quality architecture scenarios for dbt Architecture & Transformation (arch-dbt-001 to 040)

def get_dbt_scenarios():
    items = []

    # 001 - 010 (EASY)
    scenarios_easy = [
        ("arch-dbt-001", "Basic dbt project structure for a star schema", "How do you architect an enterprise dbt project directory layout to model a Kimball star schema across staging, intermediate, and marts layers?",
"""### Phase 1: Conceptual Foundation & Core Architecture
A scalable dbt project structure mirrors the Kimball dimensional modeling lifecycle, strictly isolating raw ingestion representations from curated business analytics marts. The canonical directory layout divides transformations into three distinct layers:
1. **Staging (`models/staging/`)**: 1-to-1 with raw sources, performing lightweight column renaming, type casting, and deduplication.
2. **Intermediate (`models/intermediate/`)**: Multi-table business joins, window functions, and surrogate key generation.
3. **Marts (`models/marts/`)**: Organized by business domain (core, finance, marketing) containing conformed dimension tables and fact tables.

### Phase 2: Low-Level Mechanics & Implementation
1. **Directory Tree Setup**: Organize `models/` into clear domain namespaces.
2. **Implementation Snippet**:
```text
dbt_project/
├── dbt_project.yml
├── models/
│   ├── staging/
│   │   └── stripe/
│   │       ├── _stripe__sources.yml
│   │       ├── _stripe__models.yml
│   │       └── stg_stripe__payments.sql
│   ├── intermediate/
│   │   └── finance/
│   │       └── int_payments_pivoted_to_orders.sql
│   └── marts/
│       ├── core/
│       │   ├── dim_customers.sql
│       │   └── fct_orders.sql
│       └── finance/
│           └── fct_monthly_financial_reconciliation.sql
```
3. **Configuration**: Define default materializations in `dbt_project.yml`: staging as views, marts as tables.

### Phase 3: Production Hardening & Gotchas
- **Upstream Layer Skipping**: Models in `marts/` querying raw `source()` directly bypasses staging normalization and breaks lineage. *Remediation*: Enforce dbt-project-evaluator rules blocking raw source calls outside the staging directory.
- **Deep View Nesting Latency**: Nesting 10 consecutive virtual views across staging and intermediate causes extreme query compile times in Snowflake. *Remediation*: Materialize intermediate models as `ephemeral` or tables.
- **Circular Model Dependencies**: Two intermediate models referencing each other creates DAG compilation errors. *Remediation*: Maintain strict one-way data flow: Sources -> Staging -> Intermediate -> Marts."""),

        ("arch-dbt-002", "staging model design", "How do you architect robust dbt staging models to normalize raw source tables and enforce consistent data types?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Staging models represent the first transformational layer in a modern data stack. Their purpose is purely preparatory: clean, normalize, rename, and cast raw data types while preserving the exact grain of the underlying source table. Staging models should never join multiple disparate sources or calculate complex business aggregations; they ensure that downstream analytics engineers work with predictable column names and clean ISO timestamps.

### Phase 2: Low-Level Mechanics & Implementation
1. **Model Materialization**: Set `materialized='view'` to ensure zero storage overhead.
2. **Implementation Snippet**:
```sql
-- models/staging/ecommerce/stg_ecommerce__orders.sql
{{ config(materialized='view') }}

WITH raw_source AS (
    SELECT * FROM {{ source('ecommerce', 'raw_orders') }}
),

renamed_and_cast AS (
    SELECT
        -- Primary Key
        cast(order_id as string) as order_id,
        
        -- Foreign Keys
        cast(user_id as string) as customer_id,
        cast(store_id as string) as store_id,
        
        -- Dimensions & Statuses
        trim(lower(status)) as order_status,
        
        -- Timestamps
        cast(created_at as timestamp_ntz) as ordered_at,
        cast(updated_at as timestamp_ntz) as last_modified_at,
        
        -- Financials (cents to dollars)
        cast(amount_cents as numeric(18, 2)) / 100.0 as order_amount_usd
    FROM raw_source
)

SELECT * FROM renamed_and_cast
```
3. **Validation**: Attach `unique` and `not_null` assertions to `order_id` in `_stg_ecommerce__models.yml`.

### Phase 3: Production Hardening & Gotchas
- **Business Logic Leakage in Staging**: Calculating business metrics (e.g. `is_active_customer`) inside staging couples raw normalization with volatile business definitions. *Remediation*: Keep staging models strictly 1-to-1 with raw schemas; place business logic in intermediate/marts.
- **SELECT * Passthrough Anti-Pattern**: Doing `SELECT *` in staging passes unformatted JSON and sensitive PII unvetted downstream. *Remediation*: Explicitly enumerate and rename all required columns in every staging model.
- **Type Casting Failure on Dirty Strings**: Casting malformed string dates using `cast(x as date)` crashes the pipeline when dirty records arrive. *Remediation*: Use safe casting macros (e.g. `{{ dbt.safe_cast('x', api.Column.translate_type('date')) }}`)."""),

        ("arch-dbt-003", "mart model design", "How do you architect high-performance dimension and fact tables in dbt analytical marts for executive BI reporting?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Marts represent the consumption layer consumed directly by business stakeholders, BI dashboards (Power BI, Tableau), and downstream data products. Designing marts requires deciding physical materialization (tables or incremental), generating deterministic surrogate keys (using MD5/SHA256 hashes of natural keys), pre-joining relevant dimensional attributes, and pre-calculating additive metric measures to deliver sub-second dashboard query response times.

### Phase 2: Low-Level Mechanics & Implementation
1. **Surrogate Key Generation**: Utilize `dbt_utils.generate_surrogate_key` to build unique surrogate primary keys.
2. **Implementation Snippet**:
```sql
-- models/marts/core/fct_orders.sql
{{ config(
    materialized='table',
    tags=['core', 'daily_marts']
) }}

WITH orders AS (
    SELECT * FROM {{ ref('stg_ecommerce__orders') }}
),

payments AS (
    SELECT 
        order_id,
        sum(payment_amount_usd) as total_paid_amount_usd
    FROM {{ ref('stg_stripe__payments') }}
    WHERE payment_status = 'success'
    GROUP BY 1
),

final AS (
    SELECT
        -- Surrogate Primary Key
        {{ dbt_utils.generate_surrogate_key(['o.order_id']) }} as order_key,
        o.order_id,
        o.customer_id,
        o.order_status,
        o.ordered_at,
        coalesce(p.total_paid_amount_usd, 0.0) as revenue_usd,
        o.order_amount_usd
    FROM orders o
    LEFT JOIN payments p ON o.order_id = p.order_id
)

SELECT * FROM final
```
3. **Optimization**: Apply warehouse clustering or distribution keys (`cluster_by=['ordered_at']`).

### Phase 3: Production Hardening & Gotchas
- **Fan-Out Join Duplicate Rows**: Joining a fact table to a one-to-many dimension table duplicates rows and inflates financial metric aggregates. *Remediation*: Pre-aggregate one-to-many relationships in CTEs before joining to the core fact table.
- **Full Refresh Warehouse Compute Spikes**: Rebuilding a 500-million row fact table as a full table materialization daily drives massive warehouse credit burn. *Remediation*: Transition large fact marts to incremental materializations with partition pruning.
- **NULL Surrogate Keys on Missing Foreign Keys**: Hashing NULL values produces identical surrogate hashes, creating false matches. *Remediation*: Coalesce missing foreign keys to an explicit dummy value (e.g. `'-1'`) prior to hashing."""),

        ("arch-dbt-004", "source freshness check setup", "How do you architect automated dbt source freshness checks in CI/CD to prevent running warehouse transformations on stale ingested data?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Executing expensive transformation DAGs on stale or broken raw ingestion feeds wastes cloud compute credits and publishes misleading reports to business executives. dbt's Source Freshness engine queries the maximum timestamp in raw source tables against configured SLA thresholds (`warn_after` and `error_after`). In production orchestrators, running `dbt source freshness` before `dbt build` provides a hard gate that halts pipeline execution if upstream ingestion has stalled.

### Phase 2: Low-Level Mechanics & Implementation
1. **YAML SLA Declaration**: Define `loaded_at_field` and freshness windows in `sources.yml`.
2. **Implementation Snippet**:
```yaml
# models/staging/stripe/_stripe__sources.yml
version: 2

sources:
  - name: stripe
    database: raw_ingestion
    schema: stripe_api
    freshness:
      warn_after: {count: 6, period: hour}
      error_after: {count: 12, period: hour}
    loaded_at_field: _fivetran_synced
    tables:
      - name: charges
      - name: customers
      - name: refunds
        freshness:
          error_after: {count: 24, period: hour}
```
3. **Execution Gate**: Orchestrate via CLI: `dbt source freshness && dbt build --select source:stripe+`.

### Phase 3: Production Hardening & Gotchas
- **Timezone Mismatch Failures**: Calculating freshness against a `loaded_at_field` in UTC when the warehouse session is set to local time triggers false error alerts. *Remediation*: Explicitly cast loaded_at_fields to UTC timestamps in warehouse configurations.
- **Table Full-Scan Latency on Freshness Queries**: Running `SELECT max(loaded_at_field)` on an unindexed 10-billion row raw table takes 15 minutes. *Remediation*: Ensure the raw ingestion table is partitioned or clustered by the sync timestamp.
- **Missing Freshness Metadata Halting CI**: Running freshness checks in ephemeral CI branches against mock databases with empty tables breaks pull request builds. *Remediation*: Skip freshness checks during ephemeral CI tests, reserving them for scheduled production pipelines."""),

        ("arch-dbt-005", "generic tests on dimension tables", "How do you architect a comprehensive generic testing strategy on dbt dimension tables to guarantee primary and referential key integrity?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Data quality assertions in dbt must act as strict schema contracts. Dimension tables in a Kimball star schema require absolute primary key uniqueness and non-null guarantees; any duplicate primary key will cause catastrophic fan-out multiplications when joined against downstream fact tables. dbt's built-in generic tests (`unique`, `not_null`, `accepted_values`, `relationships`) translate into automated queries that count failing rows, failing the build if counts exceed 0.

### Phase 2: Low-Level Mechanics & Implementation
1. **Schema YAML Declarations**: Attach assertions to primary keys, business keys, and foreign keys.
2. **Implementation Snippet**:
```yaml
# models/marts/core/_core__models.yml
version: 2

models:
  - name: dim_customers
    description: "Conformed dimension containing deduplicated customer profiles."
    columns:
      - name: customer_key
        description: "Surrogate primary key (MD5 hash of customer_id)."
        tests:
          - unique
          - not_null
      - name: customer_status
        tests:
          - accepted_values:
              values: ['ACTIVE', 'CHURNED', 'SUSPENDED', 'PENDING']
              quote: true
      - name: country_code
        tests:
          - relationships:
              to: ref('stg_reference__countries')
              field: country_code
```
3. **Execution**: Run assertions via `dbt test --select dim_customers`.

### Phase 3: Production Hardening & Gotchas
- **Failing Fast vs Storing Failures**: When a test fails in production, diagnosing root cause is difficult because failing rows are discarded. *Remediation*: Run tests with `dbt test --store-failures`, which writes invalid records into a dedicated `_dbt_test__audit` schema.
- **Foreign Key Test Latency on Large Datasets**: Running `relationships` tests against a 1-billion row fact table requires massive distributed joins. *Remediation*: Filter relationship tests to recent partitions using the `where` configuration block.
- **Blocking Deployments on Benign Warnings**: Strict error thresholds on non-critical metadata columns can abort critical morning reporting runs. *Remediation*: Configure `config: {severity: warn}` on non-primary-key attributes."""),

        ("arch-dbt-006", "seed loading for lookup tables", "How do you architect reference data management in dbt using seeds while enforcing Git-based auditability and schema typing?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Every enterprise data warehouse requires static reference data: currency ISO codes, sales territory mappings, postal code regions, or marketing attribution channel lookups. Hardcoding CASE statements inside SQL models creates messy maintenance bottlenecks. dbt Seeds allow teams to store version-controlled CSV files directly in the `seeds/` directory. Running `dbt seed` creates and populates physical database tables that can be referenced via `ref()`.

### Phase 2: Low-Level Mechanics & Implementation
1. **Seed CSV Creation**: Author `seeds/ref_attribution_channels.csv` committed to Git.
2. **Implementation Snippet**:
```yaml
# dbt_project.yml configuration enforcing strict seed column data types
seeds:
  enterprise_project:
    ref_attribution_channels:
      +schema: reference_data
      +column_types:
        channel_id: varchar(16)
        channel_name: varchar(64)
        is_paid_media: boolean
        target_cac_usd: numeric(10,2)
```
```sql
-- Usage in a downstream dbt mart model
SELECT 
    f.order_id,
    c.channel_name,
    c.is_paid_media
FROM {{ ref('fct_orders') }} f
LEFT JOIN {{ ref('ref_attribution_channels') }} c 
    ON f.utm_channel_id = c.channel_id
```
3. **Deployment**: Load tables into warehouse using `dbt seed --full-refresh`.

### Phase 3: Production Hardening & Gotchas
- **Using Seeds for High-Volume Data**: Committing 50MB CSV files with 500,000 rows into Git severely bloats repository clone times and causes slow seed loads. *Remediation*: Restrict seeds strictly to static lookups (<10,000 rows); use Auto Loader or standard ETL for large datasets.
- **Implicit Type Inference Corrupting Zip Codes**: dbt inferring an integer type for postal codes strips leading zeros (`01234` becomes `1234`). *Remediation*: Explicitly configure `+column_types` in `dbt_project.yml` for all string codes.
- **Production Overwrite Failures**: Running seeds without `--full-refresh` can append duplicate rows in certain warehouse database adapters. *Remediation*: Ensure production orchestrators execute `dbt seed --full-refresh` when seeds change."""),

        ("arch-dbt-007", "documentation with schema.yml", "How do you architect automated enterprise data dictionaries and interactive lineage documentation using dbt docs generate?",
"""### Phase 1: Conceptual Foundation & Core Architecture
A data platform that lacks accessible documentation suffers from low stakeholder trust and repeated duplicate engineering. dbt treats documentation as code: column descriptions, business definitions, owner contacts, and model tags are defined in schema YAML files or standalone markdown doc blocks (`{% docs %}`). Running `dbt docs generate` compiles metadata, SQL code, and test statuses into interactive JSON artifacts that power searchable web catalogs.

### Phase 2: Low-Level Mechanics & Implementation
1. **Doc Block Modeling**: Author reusable business definitions in `models/docs/marketing_docs.md`.
2. **Implementation Snippet**:
```markdown
<!-- models/docs/enterprise_metrics.md -->
{% docs customer_ltv_definition %}
**Customer Lifetime Value (LTV)** represents the total gross margin generated 
by a customer across all historical paid transactions, minus refund amounts 
and localized acquisition discounts. 
Updated daily at 04:00 UTC. Owned by Finance Analytics.
{% enddocs %}
```
```yaml
# models/marts/marketing/_marketing__models.yml
version: 2
models:
  - name: fct_customer_ltv
    description: "{{ doc('customer_ltv_definition') }}"
    columns:
      - name: lifetime_value_usd
        description: "Aggregated gross margin in USD."
```
3. **Catalog Publication**: Build and host static site via `dbt docs generate && dbt docs serve`.

### Phase 3: Production Hardening & Gotchas
- **Stale Documentation Deployments**: Modifying SQL models without rebuilding the docs catalog leaves documentation out of sync with production schemas. *Remediation*: Automate `dbt docs generate` and upload `index.html` and `manifest.json` to S3/GCS in production CI/CD.
- **Copy-Pasting Identical Descriptions**: Repeating the definition of `customer_id` across 40 different YAML files leads to conflicting descriptions. *Remediation*: Use `{% docs %}` blocks to author single-source-of-truth definitions referenced everywhere.
- **Exposing Internal Technical Artifacts to Business Users**: Exposing internal staging and ephemeral models in public data catalogs overwhelms business analysts. *Remediation*: Use dbt model tags and exposures to filter docs for business-ready marts."""),

        ("arch-dbt-008", "running dbt in CI with GitHub Actions", "How do you architect an automated dbt pull request validation workflow in GitHub Actions to prevent broken SQL from merging to main?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Deploying broken SQL, circular dependencies, or failed test assertions directly into production data warehouses degrades business operations. A continuous integration (CI) architecture on GitHub Actions spins up an ephemeral environment for every pull request: it compiles the project to catch Jinja/SQL syntax errors, builds models into an isolated PR-scoped warehouse schema (e.g. `dbt_ci_pr_123`), executes all generic and singular tests, and tears down the PR schema upon merge.

### Phase 2: Low-Level Mechanics & Implementation
1. **GitHub Actions Workflow**: Author `.github/workflows/dbt_ci.yml` triggered on pull requests.
2. **Implementation Snippet**:
```yaml
name: dbt CI Validation
on:
  pull_request:
    branches: [ main ]

jobs:
  validate_dbt:
    runs-on: ubuntu-latest
    env:
      DBT_PROFILES_DIR: ./ci
      SNOWFLAKE_PASSWORD: ${{ secrets.CI_SNOWFLAKE_PASSWORD }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install Dependencies
        run: pip install dbt-snowflake
      - name: Compile and Lint
        run: dbt compile
      - name: Execute CI Build in Ephemeral Schema
        run: |
          dbt build --target ci \
            --vars '{"target_schema_override": "ci_pr_${{ github.event.pull_request.number }}"}'
```
3. **Audit**: Require the CI check to pass before GitHub permits merging pull requests.

### Phase 3: Production Hardening & Gotchas
- **Full Refresh Costs in CI**: Running `dbt build` on the entire project for every minor PR takes 45 minutes and drains warehouse compute budgets. *Remediation*: Adopt Slim CI using `--select state:modified+` to build only changed models.
- **Leaked CI Schemas in Warehouse**: Ephemeral PR schemas (`ci_pr_123`) remaining in the database forever accumulate terabytes of unmonitored storage. *Remediation*: Add a GitHub Actions `closed` hook that runs `DROP SCHEMA` when pull requests merge or close.
- **Production Credential Exposure in CI**: Developers accessing production database credentials from PR forks compromises warehouse security. *Remediation*: Use dedicated, read-restricted CI warehouse service accounts with zero production write access."""),

        ("arch-dbt-009", "profiles.yml multi-environment setup", "How do you architect secure, environment-aware database profiles in dbt using profiles.yml and environment variables?",
"""### Phase 1: Conceptual Foundation & Core Architecture
A single dbt codebase must execute seamlessly across multiple deployment targets: local developer workstations, ephemeral pull request CI runners, staging environments, and production orchestrators. Hardcoding database hostnames, usernames, or passwords in Git repositories is an extreme security risk. A hardened `profiles.yml` architecture decouples environment credentials using `env_var()` wrappers and maps distinct targets (`dev`, `ci`, `prod`) to isolated warehouse compute warehouses and roles.

### Phase 2: Low-Level Mechanics & Implementation
1. **Profile Template**: Parameterize `profiles.yml` with environment variable interpolation.
2. **Implementation Snippet**:
```yaml
# ~/.dbt/profiles.yml or container /opt/dbt/profiles.yml
enterprise_dw:
  target: dev
  outputs:
    dev:
      type: snowflake
      account: "{{ env_var('DBT_SNOWFLAKE_ACCOUNT') }}"
      user: "{{ env_var('DBT_USER') }}"
      password: "{{ env_var('DBT_PASSWORD') }}"
      role: "{{ env_var('DBT_ROLE', 'ANALYST_DEV') }}"
      database: analytics_dev
      warehouse: dev_wh
      schema: "dbt_{{ env_var('DBT_USER') }}"
      threads: 4
    prod:
      type: snowflake
      account: "{{ env_var('DBT_SNOWFLAKE_ACCOUNT') }}"
      user: "{{ env_var('DBT_SERVICE_USER') }}"
      private_key_path: "/opt/dbt/secrets/rsa_key.p8"
      role: PROD_TRANSFORMER
      database: analytics_prod
      warehouse: prod_transform_wh
      schema: public
      threads: 16
```
3. **Execution**: Target production via CLI: `dbt build --target prod`.

### Phase 3: Production Hardening & Gotchas
- **Accidental Commits of Plaintext Profiles**: Developers accidentally committing `profiles.yml` containing production passwords to GitHub. *Remediation*: Add `profiles.yml` to root `.gitignore` and enforce pre-commit secret scanners (Gitleaks).
- **Missing Environment Variable Build Failures**: Running dbt in a fresh container fails immediately if optional environment variables are unset. *Remediation*: Provide sensible fallback defaults using `{{ env_var('DBT_SCHEMA', 'default_schema') }}`.
- **Developers Writing Directly to Production**: Developers using production targets locally can overwrite live reporting tables. *Remediation*: Enforce warehouse IAM policies: individual developer credentials lack write grants to `analytics_prod`."""),

        ("arch-dbt-010", "dbt Cloud job scheduling basics", "How do you architect enterprise job schedules, webhook notifications, and failure triggers in dbt Cloud?",
"""### Phase 1: Conceptual Foundation & Core Architecture
dbt Cloud provides a fully managed SaaS control plane that schedules dbt jobs, executes Slim CI on pull requests, and hosts data catalogs. An enterprise dbt Cloud architecture establishes structured Job definitions: 1) Hourly incremental mart builds; 2) Daily full-refresh seed and snapshot reconciliations; 3) Automated Slack/PagerDuty webhook alerts upon failure; and 4) API trigger integrations for orchestrators (Airflow/Dagster).

### Phase 2: Low-Level Mechanics & Implementation
1. **Job Pipeline Configuration**: Configure sequential commands with execution timeouts and threads.
2. **Implementation Snippet**:
```text
# dbt Cloud Job Execution Steps:
1. dbt source freshness
2. dbt build --select state:modified+ --defer --state /artifacts
3. dbt docs generate

Environment: Production (Deployment target: analytics_prod)
Trigger: Scheduled (Cron: 0 4 * * *)
Notifications:
  - Slack Channel: #data-ops-alerts (on failure only)
  - PagerDuty Service Key: pd_dbt_prod_service_key
Artifacts:
  - Generate docs on completion: Enabled
  - Run timeout: 120 minutes
```
3. **API Triggering**: Trigger externally via REST API: `POST https://cloud.getdbt.com/api/v2/accounts/{account_id}/jobs/{job_id}/run/`.

### Phase 3: Production Hardening & Gotchas
- **Silent Source Freshness Bypass**: Setting `dbt build` after `dbt source freshness` without enforcing failure stops builds even if raw sources are stale. *Remediation*: Select the dbt Cloud checkbox: 'Halt job if source freshness fails'.
- **Run Contention Queue Delays**: Scheduling 15 heavy dbt Cloud jobs to start at the exact same top-of-the-hour minute exhausts account thread limits. *Remediation*: Stagger job start minutes across the hour (e.g. 04:15, 04:35).
- **Overwriting Production Artifacts on Failed Runs**: If a production run fails halfway through, downstream Slim CI compares against a partially failed manifest. *Remediation*: Configure dbt Cloud to retain only the last successful run's manifest as the state comparison artifact."""),
    ]

    for id_val, niche, q_text, ans in scenarios_easy:
        items.append({
            "id": id_val,
            "source": "Architecture Hub",
            "category": "dbt Architecture & Transformation",
            "niche": niche,
            "difficulty": "EASY",
            "question": q_text,
            "answer": ans
        })

    # 011 - 020 (MEDIUM) & 021 - 040 (HARD / ARCHITECT)
    from arch_dbt_data_advanced import get_advanced_dbt_scenarios
    items.extend(get_advanced_dbt_scenarios())

    return items
