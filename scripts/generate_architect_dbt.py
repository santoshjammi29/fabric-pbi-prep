# scripts/generate_architect_dbt.py
import json

def build_dbt_architect_patch():
    answers = {}

    answers["dbt-q-076"] = """### The Theory
Evaluating **dbt Core versus dbt Cloud** at the enterprise architecture tier involves comparing an open-source, self-hosted CLI framework against a fully managed SaaS platform. dbt Core gives total control over container runtimes, Python dependencies, and orchestrator pairing (Airflow, Dagster, Prefect) at zero licensing cost, but places the operational burden of scheduling, credential management, CI/CD runners, and artifact storage onto internal platform engineering teams. dbt Cloud provides turnkey features including browser-based development environments, automated Slim CI with state deferral, managed Semantic Layer APIs, enterprise RBAC/SSO (Okta/Entra ID), and native metadata ingestion.

### The Blueprint
```mermaid
flowchart TD
    Architect["Enterprise Analytics Architecture"] --> Evaluation{"Hosting & Governance Strategy"}
    Evaluation -->|"Self-Hosted / K8s / Custom CI"| Core["dbt Core (Open-Source CLI)"]
    Evaluation -->|"Managed SaaS / Turnkey Semantic Layer"| Cloud["dbt Cloud (Enterprise Tier)"]
    Core --> CoreRunner["Airflow / KubernetesPodOperator / GitHub Actions"]
    CoreRunner --> Warehouse[("Cloud Data Warehouse (Snowflake / Fabric / BigQuery)")]
    Cloud --> CloudEngine["Managed Job Scheduler + Slim CI Deferral + Metadata API"]
    CloudEngine --> Warehouse
```

### The Implementation
Reference Code Sheet: `beg_002` (Database DDL) & `beg_005` (Table Inserts/Overwrites).
```bash
# Production dbt Core container execution in Kubernetes CI runner
dbt build \\
    --profiles-dir /etc/dbt/profiles \\
    --target prod \\
    --select state:modified+ \\
    --defer \\
    --state s3://enterprise-dbt-artifacts/prod/ \\
    --threads 16 \\
    --fail-fast
```

### Trade-off Analysis
| Architectural Dimension | dbt Core (Self-Hosted) | dbt Cloud (Enterprise SaaS) |
|---|---|---|
| **Licensing Cost** | Free Open-Source (Apache 2.0) | High seat-based SaaS cost ($50–$400/developer/month) |
| **Operational Maintenance** | High: Requires maintaining CI runners, profiles, secrets | **Zero Maintenance**: Fully managed serverless environment |
| **CI/CD Latency** | Custom scripts required for state download & deferral | **Native Slim CI**: Automatically downloads production manifest |
| **Semantic Layer & APIs** | Manual MetricFlow CLI integration | Hosted GraphQL Semantic Layer API for Power BI / Tableau |

### Failure Scenario at Scale
In self-hosted dbt Core setups, if the S3 bucket hosting production `manifest.json` state artifacts becomes corrupted or experiences an IAM permissions failure during a PR build, `--defer` fails. The CI runner attempts to compile the entire 2,000-model project in the pull request schema, running for 2+ hours and exhausting the monthly warehouse credit budget.

### Cost Impact & Capacity (F-SKUs)
dbt Cloud licenses for a team of 40 developers can exceed $120,000 annually. Self-hosting dbt Core on existing Kubernetes or Airflow clusters eliminates SaaS licensing while maintaining identical transformation power. In Microsoft Fabric, configuring proper thread parallelism (`threads: 8`) prevents simultaneous query saturation that triggers F-SKU capacity throttling."""

    answers["dbt-q-077"] = """### The Theory
**dbt Mesh** is an analytics engineering architecture designed to implement **Data Mesh** principles in large enterprise organizations. Monolithic dbt repositories suffer from bloated compilation times, merge conflicts among dozens of developers, and murky ownership boundaries. dbt Mesh decomposes a single monolithic project into multiple autonomous, domain-specific projects (e.g. Core Platform, Finance, Marketing, Supply Chain). Upstream projects publish certified models with **enforced model contracts** and `access: public`, allowing downstream consumer projects to safely reference them using cross-project `{{ ref('project_name', 'model_name') }}` without duplicating transformation logic.

### The Blueprint
```mermaid
flowchart LR
    subgraph CoreDomain["Core Data Platform Domain"]
        raw_cust["stg_crm_customers"] --> dim_cust["dim_customers (public, contract enforced)"]
    end
    subgraph FinanceDomain["Finance Analytics Domain"]
        dim_cust -.->|"Cross-Project ref()"| fct_rev["fct_monthly_revenue"]
        fct_rev --> FinMart["Finance Gold Mart"]
    end
    subgraph MarketingDomain["Marketing Analytics Domain"]
        dim_cust -.->|"Cross-Project ref()"| fct_camp["fct_ad_campaign_roi"]
        fct_camp --> MktMart["Marketing Gold Mart"]
    end
```

### The Implementation
Reference Code Sheet: `beg_002` (Creating Databases/Tables) & `beg_005` (Table Inserts).
```yaml
# In core_platform/models/marts/dim_customers.yml
version: 2

models:
  - name: dim_customers
    access: public # Allows cross-project ref()
    description: "Certified Enterprise Customer Dimension"
    config:
      contract:
        enforced: true # Guarantees strict schema contract
    columns:
      - name: customer_id
        data_type: varchar(32)
        tests: [unique, not_null]
      - name: customer_tier
        data_type: varchar(20)
```

Downstream Consumer Usage (`finance_domain/models/marts/fct_revenue.sql`):
```sql
SELECT
    r.revenue_id,
    c.customer_id,
    c.customer_tier,
    r.amount_usd
FROM {{ ref('core_platform', 'dim_customers') }} AS c
INNER JOIN {{ ref('stg_revenue_ledger') }} AS r
    ON c.customer_id = r.customer_id
```

### Trade-off Analysis
| Architectural Dimension | Monolithic dbt Monorepo | dbt Mesh Federated Architecture |
|---|---|---|
| **Compilation Latency** | Slow (45–90s on 3,000+ models) | **Fast (< 5s per domain project)** |
| **Domain Autonomy** | Central analytics engineering gatekeeper | Autonomous teams own their CI/CD and deployments |
| **Breaking Change Risk** | High: Changes propagate immediately | **Controlled**: Model contracts prevent breaking API changes |
| **Tooling Requirements** | dbt Core or dbt Cloud | Requires dbt Cloud Enterprise or custom artifact sharing |

### Failure Scenario at Scale
If an upstream team modifies a column name on a public model without a versioning deprecation window, and contracts are not enforced, downstream consumer projects will fail compilation globally. Enforcing `contract: {enforced: true}` causes the upstream team's CI to fail before the breaking schema change can ever be merged to production.

### Cost Impact & Capacity (F-SKUs)
dbt Mesh eliminates redundant transformations where multiple teams independently compute the same customer dimensions, saving up to 40% on redundant warehouse storage and compute. In Microsoft Fabric, cross-project references resolve natively across OneLake shortcuts, avoiding physical table replication and preserving capacity CUs."""

    # Generate remaining dbt architect questions 078 to 100 programmatically with rich content
    from elevate_existing_architect_questions import elevate_architect_question
    
    with open("src/data/json/questions.json") as f:
        all_qs = json.load(f)
    
    for q in all_qs:
        qid = q["id"]
        if qid.startswith("dbt-q-") and int(qid.split("-")[-1]) >= 78:
            elevated = elevate_architect_question(q)
            answers[qid] = elevated["answer"]

    return answers

if __name__ == "__main__":
    patch = build_dbt_architect_patch()
    print(f"Generated {len(patch)} dbt ARCHITECT answers.")
    with open("scripts/data_patches/patch_architect_dbt.py", "w") as f:
        f.write("# scripts/data_patches/patch_architect_dbt.py\n")
        f.write('"""Bespoke ARCHITECT answers for dbt questions 076 to 100."""\n\n')
        f.write("def get_architect_dbt_fixes():\n")
        f.write(f"    return {repr(patch)}\n")
    print("Saved scripts/data_patches/patch_architect_dbt.py successfully.")
