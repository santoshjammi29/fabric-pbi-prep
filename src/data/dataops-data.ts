import { DataOpsDataset } from "@/types/data";

export const dataOpsData: DataOpsDataset = {
  connectivity: [
    {
      id: "adf-databricks-msi",
      sourceTool: "Azure Data Factory (ADF)",
      targetTool: "Azure Databricks",
      connectionProtocol: "HTTPS REST API via Azure Private Link (VNet Peered)",
      authMethod: "Managed Identity",
      securityLevel: "Enterprise Zero-Trust",
      summary: "Connect ADF to Azure Databricks using ADF's System-Assigned or User-Assigned Managed Identity. Eliminates static Personal Access Tokens (PATs) and handles automatic credential rotation via Microsoft Entra ID.",
      configPathOrKey: "ADF Linked Service (AzureDatabricksLinkedService.json)",
      configLanguage: "json",
      configSnippet: `{
  "name": "LS_AzureDatabricks_ManagedIdentity",
  "type": "Microsoft.DataFactory/factories/linkedservices",
  "properties": {
    "description": "ADF to Databricks job execution via Managed Identity",
    "type": "AzureDatabricks",
    "typeProperties": {
      "domain": "https://adb-1234567890123456.7.azuredatabricks.net",
      "authentication": "MSI",
      "workspaceResourceId": "/subscriptions/sub-id/resourceGroups/rg-data-prod/providers/Microsoft.Databricks/workspaces/adb-workspace-prod",
      "newClusterNodeType": "Standard_E4ds_v5",
      "newClusterNumOfWorkers": "2:8",
      "newClusterSparkVersion": "14.3.x-scala2.12",
      "newClusterInitScripts": [],
      "newClusterSparkConf": {
        "spark.databricks.delta.preview.enabled": "true"
      }
    },
    "connectVia": {
      "referenceName": "AutoResolveIntegrationRuntime-ManagedVNet",
      "type": "IntegrationRuntimeReference"
    }
  }
}`,
      setupSteps: [
        "Enable System-Assigned Managed Identity on Azure Data Factory under ADF Portal -> Managed Identities.",
        "In Azure Databricks Admin Console -> Identity and Access -> Service Principals, add the ADF Managed Identity Application ID.",
        "Grant the ADF Identity 'Contributor' or 'Workspace Access' role, and grant 'Can Attach To' or cluster creation entitlement in Databricks.",
        "If using Unity Catalog, grant ADF's Service Principal `USE CATALOG` and `USE SCHEMA` permissions.",
        "Ensure ADF Integration Runtime uses Managed VNet with a Private Endpoint targeting the Databricks UI and Control Plane."
      ],
      keyVaultIntegration: "Zero secrets required in Key Vault for this link. Entra ID generates short-lived OAuth tokens under the hood automatically.",
      securityPitfalls: [
        "Never use Personal Access Tokens (PAT) belonging to an individual developer or admin — if the user leaves, pipelines fail instantly.",
        "If using User-Assigned Managed Identity (UAMI), ensure ADF has the 'Managed Identity Operator' role on the UAMI resource.",
        "Ensure cluster policy is enforced on the Databricks side so ADF does not provision oversized GPU or memory-heavy clusters unintentionally."
      ],
      interviewDefenseTip: "Always emphasize: 'In enterprise production, we mandate Managed Identity or Entra Workload Identity over PAT tokens. This removes credential sprawl, enforces role-based access control inside Databricks, and guarantees compliance with zero-trust networking through Managed Private Endpoints.'",
      tags: ["ADF", "Databricks", "Managed Identity", "Private Endpoint", "Azure Security"]
    },
    {
      id: "adf-adls-keyvault",
      sourceTool: "Azure Data Factory (ADF)",
      targetTool: "ADLS Gen2 & Azure Key Vault",
      connectionProtocol: "HTTPS REST (DFS endpoint) & Azure Key Vault REST API",
      authMethod: "Managed Identity",
      securityLevel: "Enterprise Zero-Trust",
      summary: "Configure ADF to land/read files from ADLS Gen2 using RBAC (Storage Blob Data Contributor) while securely retrieving database passwords, API tokens, and SFTP keys dynamically from Azure Key Vault.",
      configPathOrKey: "ADF Linked Service (AzureBlobFS & KeyVault LinkedService.json)",
      configLanguage: "json",
      configSnippet: `{
  "name": "LS_AzureBlobFS_DataLake",
  "type": "Microsoft.DataFactory/factories/linkedservices",
  "properties": {
    "type": "AzureBlobFS",
    "typeProperties": {
      "url": "https://datalakeprod.dfs.core.windows.net",
      "serviceEndpoint": "https://datalakeprod.dfs.core.windows.net",
      "accountKind": "StorageV2"
    },
    "connectVia": {
      "referenceName": "AutoResolveIntegrationRuntime-ManagedVNet",
      "type": "IntegrationRuntimeReference"
    }
  }
}
---
{
  "name": "LS_AzureKeyVault_Secrets",
  "type": "Microsoft.DataFactory/factories/linkedservices",
  "properties": {
    "type": "AzureKeyVault",
    "typeProperties": {
      "baseUrl": "https://kv-data-prod.vault.azure.net/"
    }
  }
}`,
      setupSteps: [
        "In ADLS Gen2 Storage Account -> Access Control (IAM), assign 'Storage Blob Data Contributor' to the ADF Managed Identity.",
        "In Azure Key Vault -> Access Policies (or Azure RBAC), grant ADF the 'Key Vault Secrets User' role.",
        "In ADF, create the Key Vault Linked Service using Managed Identity authentication.",
        "Reference secrets in downstream Linked Services (e.g., SQL Server, REST API) using dynamic secret name parameters rather than plain-text strings."
      ],
      keyVaultIntegration: "ADF references Key Vault secrets directly in linked services without logging passwords in pipeline activity runs.",
      securityPitfalls: [
        "Do NOT grant 'Owner' or 'Contributor' on the Storage Account — neither role grants read/write permissions to data in ADLS Gen2! You MUST grant 'Storage Blob Data Contributor'.",
        "Avoid using Web Activity to GET secrets from Key Vault — Web activity responses can expose raw secret values in pipeline execution logs unless Secure Output is checked."
      ],
      interviewDefenseTip: "Clarify the difference between Control Plane and Data Plane: 'Contributor on storage is control plane only (resizing, tags). Reading/writing Parquet/Delta requires Storage Blob Data Contributor on data plane.'",
      tags: ["ADF", "ADLS Gen2", "Azure Key Vault", "RBAC", "Zero Secrets"]
    },
    {
      id: "airflow-databricks-oauth",
      sourceTool: "Apache Airflow",
      targetTool: "Azure Databricks & AWS Databricks",
      connectionProtocol: "HTTPS REST API 2.1 via DatabricksHook",
      authMethod: "OAuth M2M",
      securityLevel: "Enterprise Zero-Trust",
      summary: "Orchestrate Databricks Jobs, Notebooks, and Delta Live Tables (DLT) from Apache Airflow using OAuth 2.0 Machine-to-Machine (M2M) Service Principal authentication backed by Azure Key Vault or AWS Secrets Manager.",
      configPathOrKey: "Airflow Connection JSON & airflow.cfg Secret Backend",
      configLanguage: "json",
      configSnippet: `{
  "conn_id": "databricks_production",
  "conn_type": "databricks",
  "host": "https://adb-1234567890123456.7.azuredatabricks.net",
  "login": "00000000-0000-0000-0000-000000000000",
  "extra": {
    "azure_client_id": "{{ var.value.dbx_spn_client_id }}",
    "azure_client_secret": "{{ var.value.dbx_spn_client_secret }}",
    "azure_tenant_id": "{{ var.value.azure_tenant_id }}",
    "azure_resource_id": "/subscriptions/xxx/resourceGroups/xxx/providers/Microsoft.Databricks/workspaces/xxx"
  }
}
---
# DAG snippet using DatabricksSubmitRunOperator:
from airflow.providers.databricks.operators.databricks import DatabricksSubmitRunOperator

submit_spark_task = DatabricksSubmitRunOperator(
    task_id="run_medallion_silver_curation",
    databricks_conn_id="databricks_production",
    existing_cluster_id="{{ var.value.gold_cluster_id }}",
    notebook_task={
        "notebook_path": "/Production/Transforms/silver_curate_orders",
        "base_parameters": {"execution_date": "{{ ds }}", "env": "prod"}
    },
    deferrable=True  # Releases worker slot while Spark cluster runs!
)`,
      setupSteps: [
        "Create an Azure Entra ID Service Principal (SPN) with Client Secret or AWS IAM Identity Provider.",
        "Add SPN to Databricks Account Console -> Users and Service Principals, assign to production workspace.",
        "Configure Airflow Secret Backend (`AzureKeyVaultBackend` or `SecretsManagerBackend`) in `airflow.cfg`.",
        "Define the Airflow Connection with `databricks_conn_id='databricks_production'` utilizing OAuth M2M credentials.",
        "Use `deferrable=True` in DatabricksSubmitRunOperator to free up Airflow Celery/Kubernetes worker slots while Spark jobs execute asynchronously."
      ],
      keyVaultIntegration: "Configured in `airflow.cfg`: `backend = airflow.providers.microsoft.azure.secrets.key_vault.AzureKeyVaultBackend` with `vault_url = https://kv-airflow-prod.vault.azure.net/`.",
      securityPitfalls: [
        "Worker slot exhaustion: Blocking operators without `deferrable=True` consume worker slots for hours while waiting for large Spark runs, leading to scheduler bottlenecks.",
        "Logging secrets: Never pass credentials into `base_parameters` dictionary in plain text. Always read secrets inside the Databricks notebook via `dbutils.secrets.get(scope, key)`."
      ],
      interviewDefenseTip: "Highlight deferrable operators: 'In large-scale Airflow architectures with hundreds of concurrent Spark jobs, using Deferrable Operators with Triggerer processes is critical — it reduces Airflow Celery worker instance count by 80% because workers don't sit idle waiting for Spark compute.'",
      tags: ["Airflow", "Databricks", "OAuth M2M", "Deferrable Operators", "Secrets Backend"]
    },
    {
      id: "dbt-databricks-uc",
      sourceTool: "dbt (dbt-core / dbt Cloud)",
      targetTool: "Databricks & Unity Catalog",
      connectionProtocol: "SQL over HTTPS (HTTP Path / Thrift) with Delta format",
      authMethod: "OAuth M2M",
      securityLevel: "Enterprise Zero-Trust",
      summary: "Configure dbt-databricks with Unity Catalog using OAuth Machine-to-Machine authentication and 3-level namespace (catalog.schema.table). Enforces strict environment isolation between Dev, Staging, and Production catalogs.",
      configPathOrKey: "profiles.yml & dbt_project.yml",
      configLanguage: "yaml",
      configSnippet: `# ~/.dbt/profiles.yml
enterprise_lakehouse:
  target: dev
  outputs:
    dev:
      type: databricks
      schema: sales
      host: "{{ env_var('DBT_DATABRICKS_HOST') }}"
      http_path: "{{ env_var('DBT_DATABRICKS_HTTP_PATH') }}"
      catalog: dev_catalog
      auth_type: oauth
      client_id: "{{ env_var('DBT_SPN_CLIENT_ID') }}"
      client_secret: "{{ env_var('DBT_SPN_CLIENT_SECRET') }}"
      threads: 8
    prod:
      type: databricks
      schema: sales
      host: "{{ env_var('DBT_DATABRICKS_HOST') }}"
      http_path: "{{ env_var('DBT_DATABRICKS_HTTP_PATH') }}"
      catalog: prod_catalog
      auth_type: oauth
      client_id: "{{ env_var('DBT_PROD_SPN_CLIENT_ID') }}"
      client_secret: "{{ env_var('DBT_PROD_SPN_CLIENT_SECRET') }}"
      threads: 16
---
# macros/generate_schema_name.sql
{% macro generate_schema_name(custom_schema_name, node) -%}
    {%- set default_schema = target.schema -%}
    {%- if target.name == 'prod' -%}
        {{ custom_schema_name | trim }}
    {%- else -%}
        {{ default_schema }}_{{ custom_schema_name | trim }}
    {%- endif -%}
{%- endmacro %}`,
      setupSteps: [
        "In Databricks Unity Catalog, create isolated catalogs: `dev_catalog`, `staging_catalog`, `prod_catalog`.",
        "Create dedicated Service Principals in Entra ID for CI/CD runners (GitHub Actions / Azure DevOps).",
        "Grant Service Principal permissions in Unity Catalog: `USE CATALOG`, `USE SCHEMA`, `CREATE TABLE`, `CREATE VIEW`.",
        "Set up `profiles.yml` utilizing `env_var()` calls to inject host, HTTP path, and OAuth credentials at runtime.",
        "Implement `generate_schema_name.sql` macro to avoid developers writing into production schema names during local development."
      ],
      keyVaultIntegration: "In CI/CD (GitHub Actions / Azure DevOps), credentials are read from GitHub Encrypted Secrets or Azure Key Vault via Service Connection and exported as environment variables.",
      securityPitfalls: [
        "Never commit `profiles.yml` containing hardcoded secrets into GitHub repos.",
        "Do not use personal developer credentials for CI/CD runs; if developer permissions differ from production Service Principal, PR validations give false positives."
      ],
      interviewDefenseTip: "Explain 3-level namespace isolation: 'With Unity Catalog, dbt targets catalogs rather than databases (`catalog.schema.table`). In our CI/CD pipeline, Dev runs against `dev_catalog`, PR Slim CI against `staging_catalog` with ephemeral schemas, and production deployment against `prod_catalog` with zero manual intervention.'",
      tags: ["dbt", "Databricks", "Unity Catalog", "OAuth M2M", "profiles.yml"]
    },
    {
      id: "dbt-synapse-fabric",
      sourceTool: "dbt (dbt-synapse / dbt-fabric)",
      targetTool: "Azure Synapse & Microsoft Fabric DW",
      connectionProtocol: "T-SQL TDS over Port 1433 with Entra ID",
      authMethod: "Service Principal",
      securityLevel: "Enterprise Zero-Trust",
      summary: "Connect dbt-synapse / dbt-fabric to Azure Synapse Dedicated SQL Pool or Fabric Lakehouse / Data Warehouse using Entra ID Service Principal authentication with client certificate or client secret.",
      configPathOrKey: "profiles.yml (Azure Synapse / Fabric)",
      configLanguage: "yaml",
      configSnippet: `# ~/.dbt/profiles.yml
synapse_fabric_dw:
  target: prod
  outputs:
    prod:
      type: synapse
      driver: 'ODBC Driver 18 for SQL Server'
      server: 'synapse-workspace-prod.sql.azuresynapse.net'
      port: 1433
      database: 'edw_gold_dw'
      schema: 'dbo'
      authentication: 'service_principal'
      client_id: "{{ env_var('AZURE_CLIENT_ID') }}"
      client_secret: "{{ env_var('AZURE_CLIENT_SECRET') }}"
      tenant_id: "{{ env_var('AZURE_TENANT_ID') }}"
      threads: 8
      encrypt: true
      trust_cert: false`,
      setupSteps: [
        "Register Service Principal in Entra ID (Azure AD).",
        "In Azure Synapse or Fabric SQL endpoint, add the Service Principal as an external database user: `CREATE USER [dbt-ci-spn] FROM EXTERNAL PROVIDER;`.",
        "Grant role permissions: `ALTER ROLE db_owner ADD MEMBER [dbt-ci-spn];` or granular `db_datareader`, `db_datawriter`, `db_ddladmin`.",
        "Ensure ODBC Driver 18 for SQL Server is installed on the build runner / execution agent.",
        "Configure Azure Synapse firewall to permit CI runner IP or establish an Azure Private Endpoint inside the corporate VNet."
      ],
      keyVaultIntegration: "Client secret stored in Azure Key Vault and synchronized into Azure DevOps Variable Group or GitHub Repository Secrets.",
      securityPitfalls: [
        "TrustServerCertificate must remain `false` and Encrypt must remain `true` to prevent man-in-the-middle attacks on the TDS stream.",
        "Synapse Dedicated SQL Pool distribution keys must be explicitly declared in dbt model config (`distribution='HASH(customer_id)'`) to prevent default `ROUND_ROBIN` performance degradation."
      ],
      interviewDefenseTip: "Be ready to contrast: 'For Synapse and Fabric, dbt-synapse uses native T-SQL DDL (`CREATE TABLE AS SELECT`). We mandate Service Principal authentication via Entra ID over legacy SQL server logins to enforce auditability and centralized identity governance.'",
      tags: ["dbt", "Synapse", "Fabric", "T-SQL", "Service Principal"]
    },
    {
      id: "github-ado-oidc",
      sourceTool: "GitHub Actions & Azure DevOps",
      targetTool: "Azure Cloud & Databricks / AWS Data Plane",
      connectionProtocol: "OpenID Connect (OIDC) Workload Identity Federation",
      authMethod: "Workload Identity (OIDC)",
      securityLevel: "Enterprise Zero-Trust",
      summary: "Modern zero-static-secret authentication for CI/CD pipelines. GitHub Actions and Azure DevOps exchange short-lived cryptographic JWT tokens directly with Microsoft Entra ID or AWS STS without storing any client secrets or private keys in repo settings.",
      configPathOrKey: "GitHub Actions Workflow (.github/workflows/dataops_deploy.yml)",
      configLanguage: "yaml",
      configSnippet: `# .github/workflows/dataops_deploy.yml
name: DataOps CI/CD with OIDC
on:
  push:
    branches: [main]

permissions:
  id-token: write  # Mandatory for requesting GitHub OIDC JWT token!
  contents: read

jobs:
  deploy-infrastructure:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: 'Az CLI Login via OIDC Workload Identity Federation'
        uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}
          # Notice: NO client-secret required! Zero secrets stored in GitHub!

      - name: Run Terraform / Databricks Asset Bundle Deploy
        run: |
          az account show
          databricks bundle deploy -t prod
        env:
          ARM_USE_OIDC: "true"
          ARM_CLIENT_ID: \${{ secrets.AZURE_CLIENT_ID }}
          ARM_TENANT_ID: \${{ secrets.AZURE_TENANT_ID }}
          ARM_SUBSCRIPTION_ID: \${{ secrets.AZURE_SUBSCRIPTION_ID }}`,
      setupSteps: [
        "In Azure Entra ID -> App Registrations, configure 'Federated Credentials'.",
        "Set Issuer to `https://token.actions.githubusercontent.com` and Subject Identifier to your repository branch: `repo:org/repo:ref:refs/heads/main`.",
        "In GitHub Actions workflow, specify `permissions: id-token: write`.",
        "Use `azure/login@v2` with `client-id`, `tenant-id`, and `subscription-id`. Entra ID validates the cryptographic token signature and issues a 1-hour Azure access token."
      ],
      keyVaultIntegration: "Zero secrets stored anywhere in GitHub settings. No password expiry, no rotation calendar needed.",
      securityPitfalls: [
        "Omitting the `permissions: id-token: write` flag causes `azure/login` to fail silently or throw 'Actions cannot fetch OIDC token'.",
        "Branch wildcard misconfiguration: Do not use wildcards (`repo:org/repo:*`) in Subject Identifier for production environments; lock strictly to `ref:refs/heads/main`."
      ],
      interviewDefenseTip: "The gold standard in 2025/2026: 'We eliminated long-lived service principal client secrets across all our data pipelines by migrating 100% of GitHub Actions and Azure DevOps agents to OIDC Workload Identity Federation. This removes secret rotation overhead and guarantees tokens expire immediately after the job finishes.'",
      tags: ["DevOps", "GitHub Actions", "Azure DevOps", "OIDC", "Zero Secrets", "Enterprise"]
    }
  ],

  cicdAlternatives: [
    {
      id: "dab-vs-repos",
      name: "Databricks CI/CD: Databricks Asset Bundles (DABs) vs Workspace Repos",
      category: "Databricks",
      recommendedApproach: "Databricks Asset Bundles (DABs) via CLI v0.200+",
      legacyOrAlternative: "Databricks Repos UI / Git-Sync REST API Scripts",
      tradeOffSummary: "DABs provides declarative infrastructure-as-code for jobs, DLT pipelines, and ML experiments with built-in multi-target environment isolation (`dev`, `staging`, `prod`). Workspace Repos requires manual git pulls and risks developers editing production notebooks directly in the workspace.",
      pros: [
        "Declarative YAML specification (`databricks.yml`) versioned in Git",
        "Built-in environment targeting (`-t dev`, `-t staging`, `-t prod`) with parameter substitution",
        "Automated packaging of Python wheels, dbt models, and notebook dependencies",
        "Eliminates state drift and human manual sync in workspace UI",
        "Native support for Service Principals and CI/CD runners"
      ],
      cons: [
        "Requires learning bundle syntax and CLI tooling",
        "Slightly steeper learning curve than simple workspace git pull"
      ],
      speedRating: "Fast (3-5m)",
      costEfficiency: "High",
      workflowLanguage: "yaml",
      workflowYaml: `# databricks.yml
bundle:
  name: medallion-sales-pipeline

targets:
  dev:
    mode: development
    default: true
    workspace:
      host: https://adb-dev.azuredatabricks.net

  prod:
    mode: production
    workspace:
      host: https://adb-prod.azuredatabricks.net
      root_path: /Shared/.bundle/\${bundle.name}/\${bundle.target}
    run_as:
      service_principal_name: \${env.DATABRICKS_SPN_CLIENT_ID}

resources:
  jobs:
    daily_sales_refresh:
      name: "Daily Sales Lakehouse Ingestion [\${bundle.target}]"
      schedule:
        quartz_cron_expression: "0 0 2 * * ?"
        timezone_id: "UTC"
      tasks:
        - task_key: bronze_ingest
          job_cluster_key: cost_optimized_cluster
          spark_python_task:
            python_file: src/ingest_bronze.py
        - task_key: silver_curate
          depends_on: [{ task_key: bronze_ingest }]
          job_cluster_key: cost_optimized_cluster
          notebook_task:
            notebook_path: src/notebooks/curate_silver.py

---
# .github/workflows/deploy_databricks_dab.yml
name: Deploy Databricks Asset Bundle
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: databricks/setup-cli@main

      - name: Validate Bundle
        run: databricks bundle validate -t dev
        env:
          DATABRICKS_HOST: \${{ secrets.DATABRICKS_DEV_HOST }}
          DATABRICKS_TOKEN: \${{ secrets.DATABRICKS_DEV_TOKEN }}

      - name: Deploy to Production on Merge
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: databricks bundle deploy -t prod
        env:
          DATABRICKS_HOST: \${{ secrets.DATABRICKS_PROD_HOST }}
          DATABRICKS_CLIENT_ID: \${{ secrets.DATABRICKS_SPN_CLIENT_ID }}
          DATABRICKS_CLIENT_SECRET: \${{ secrets.DATABRICKS_SPN_CLIENT_SECRET }}`,
      architectureDescription: "DABs compiles local Python files, wheel artifacts, and YAML resources into an immutable deployable asset bundle. In CI, `databricks bundle validate` performs dry-run schema validation. On merge, `bundle deploy -t prod` deploys jobs under a dedicated Service Principal, decoupling job ownership from individual user accounts.",
      keyGotchas: [
        "In `mode: development`, Databricks prefixes all job names with `[dev <username>]` and pauses schedules by default — never deploy dev bundles into production workspaces!",
        "Always specify `run_as` with Service Principal in production targets to avoid job ownership invalidation when employees depart."
      ],
      interviewSoundbite: "In an interview, say: 'We modernized from legacy workspace git repos to Databricks Asset Bundles (DABs). DABs gives us true IaC for Databricks workflows and DLT pipelines: developers test locally with personal prefixes, while GitHub Actions validates bundles in PRs and atomically deploys to production under a dedicated Service Principal.'"
    },
    {
      id: "airflow-gitsync-vs-container",
      name: "Airflow CI/CD: Git-Sync Sidecar vs Immutable Docker Container vs Cloud S3 Sync",
      category: "Airflow",
      recommendedApproach: "Git-Sync Sidecar for Kubernetes / Managed Airflow",
      legacyOrAlternative: "Baking DAGs into Docker Image OR Manual S3/Blob Sync",
      tradeOffSummary: "Git-Sync sidecar continuously synchronizes DAG files from Git to shared volumes without restarting schedulers or workers, achieving sub-minute deployments. Baking DAGs into container images provides ultimate immutability for strict compliance, but slows deployment cycles to 5-10 minutes.",
      pros: [
        "Sub-30-second DAG deployment without restarting Airflow scheduler or pods",
        "Zero downtime for active tasks and long-running pipelines",
        "Lightweight CI pipeline (only runs `ruff`, `mypy`, and pytest DAG validation)",
        "Separates DAG logic updates from Airflow infrastructure / Python dependency updates"
      ],
      cons: [
        "Requires shared volume (EFS / Azure Files) or sidecar container per pod in Kubernetes",
        "If multiple interdependent files are updated, race conditions during git sync can trigger brief DAG syntax parse errors if sync is not atomic"
      ],
      speedRating: "Ultra Fast (<2m)",
      costEfficiency: "Very High (Slim Compute)",
      workflowLanguage: "yaml",
      workflowYaml: `# values-override.yaml (Airflow Official Helm Chart)
dags:
  gitSync:
    enabled: true
    repo: https://github.com/enterprise/airflow-dags.git
    branch: main
    rev: HEAD
    depth: 1
    maxFailures: 3
    subPath: "dags"
    wait: 30 # Sync every 30 seconds
    credentialsSecret: git-credentials-secret

---
# .github/workflows/airflow_dag_ci.yml
name: Airflow DAG CI
on:
  pull_request:
    paths: ['dags/**', 'plugins/**']
  push:
    branches: [main]
    paths: ['dags/**', 'plugins/**']

jobs:
  test-dags:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install Lint & Validation Tools
        run: |
          pip install ruff pytest apache-airflow==2.9.2

      - name: Fast DAG Syntax & Cycle Check
        run: |
          # Detect import errors and cyclic dependencies in DAGs
          python -c "
          from airflow.models import DagBag
          dag_bag = DagBag(dag_folder='dags', include_examples=False)
          assert len(dag_bag.import_errors) == 0, f'Import Errors Found: {dag_bag.import_errors}'
          print(f'Successfully validated {len(dag_bag.dags)} DAGs without errors.')
          "

      - name: Unit Test DAG Logic
        run: pytest tests/dags/`,
      architectureDescription: "Developers push DAGs to `main`. The CI pipeline runs `pytest` and `DagBag(dag_folder='dags')` syntax checks in under 60 seconds. Once merged, Kubernetes Git-Sync sidecars on scheduler and worker pods pull the latest commit into `/opt/airflow/dags` automatically with zero container rebuilds.",
      keyGotchas: [
        "Never perform heavy package installations (`pip install`) inside DAG files — all Python dependencies must be pre-baked into the base Airflow container image.",
        "Always enforce `include_examples=False` in DagBag tests to avoid evaluating hundreds of default Airflow example DAGs in CI."
      ],
      interviewSoundbite: "Explain the architecture clearly: 'We separate code cadence from infrastructure cadence. Airflow core images (Python wheels, providers) are built and deployed via Helm once a month, while DAG business logic is deployed continuously within 30 seconds via Git-Sync sidecars backed by automated DagBag cycle validation.'"
    },
    {
      id: "dbt-slim-ci",
      name: "dbt CI/CD: Slim CI with Manifest Deferral vs Full Environment Rebuild",
      category: "dbt",
      recommendedApproach: "dbt Slim CI (`state:modified+`) with `--defer` to Production Artifacts",
      legacyOrAlternative: "Rebuilding entire dbt project on every PR (`dbt build --all`)",
      tradeOffSummary: "In mature projects with 500+ models, rebuilding all models on every pull request costs thousands of dollars in warehouse compute and takes 45+ minutes. Slim CI uses `manifest.json` from production to compile and test ONLY modified models and their immediate downstream children in ephemeral schemas, dropping PR run time to < 4 minutes.",
      pros: [
        "90% reduction in CI execution time and data warehouse compute costs",
        "Runs on ephemeral, isolated PR schemas (`pr_schema_<pr_number>`) to prevent collisions",
        "`--defer` flag routes upstream dependencies to production tables without copying data",
        "Automated teardown drops ephemeral test schema upon PR merge or closure"
      ],
      cons: [
        "Requires maintaining a reliable production artifact store (S3 / Azure Blob storage) with latest `manifest.json`"
      ],
      speedRating: "Ultra Fast (<2m)",
      costEfficiency: "Very High (Slim Compute)",
      workflowLanguage: "yaml",
      workflowYaml: `# .github/workflows/dbt_slim_ci.yml
name: dbt Slim CI
on:
  pull_request:
    types: [opened, synchronize, reopened]
    paths: ['models/**', 'macros/**', 'seeds/**', 'snapshots/**']

env:
  DBT_PROFILES_DIR: ./profiles
  DBT_DATABRICKS_HOST: \${{ secrets.DATABRICKS_HOST }}
  DBT_SPN_CLIENT_ID: \${{ secrets.DBT_SPN_CLIENT_ID }}
  DBT_SPN_CLIENT_SECRET: \${{ secrets.DBT_SPN_CLIENT_SECRET }}

jobs:
  slim-ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dbt & dependencies
        run: |
          pip install dbt-databricks sqlfluff sqlfluff-templater-dbt

      - name: SQLFluff Linting
        run: sqlfluff lint models/ --dialect databricks

      - name: Download Production Manifest Artifact
        run: |
          mkdir -p prod-artifacts
          az storage blob download \\
            --account-name datalakeslimci \\
            --container-name dbt-artifacts \\
            --name manifest.json \\
            --file prod-artifacts/manifest.json \\
            --auth-mode login

      - name: dbt Slim Build (Modified Models + Downstream)
        run: |
          # Build only modified models into ephemeral PR schema, deferring unchanged upstreams to prod
          dbt build \\
            --target dev \\
            --select state:modified+ \\
            --defer \\
            --state prod-artifacts/ \\
            --vars '{"pr_schema": "pr_\${{ github.event.number }}"}'`,
      architectureDescription: "dbt compares the PR commit state with the production `manifest.json` downloaded from cloud storage. Any model with modified SQL, changed YAML tests, or modified upstream references is executed in an ephemeral PR schema. Unmodified upstream models are resolved against production via `--defer`.",
      keyGotchas: [
        "If a modified model relies on a production table that was dropped or renamed, `--defer` will throw a table-not-found error. Ensure production manifests are synchronized after each prod deployment.",
        "Always remember to run an automated post-merge or on-close cleanup job to drop ephemeral schemas (`pr_123`) to avoid schema clutter."
      ],
      interviewSoundbite: "Deliver this punchline: 'Running full dbt builds on every PR is an anti-pattern. We instituted dbt Slim CI with manifest deferral: CI downloads the production manifest from blob storage, identifies modified nodes using `state:modified+`, builds them in an isolated PR schema in under 3 minutes, and tests downstream impacts before approving the merge.'"
    },
    {
      id: "adf-automated-build",
      name: "ADF CI/CD: Automated NPM Utilities vs Manual 'adf_publish' Branch",
      category: "ADF",
      recommendedApproach: "Automated Build via `@microsoft/azure-data-factory-utilities` NPM Package",
      legacyOrAlternative: "Manual 'Publish' button in ADF Portal to `adf_publish` Git branch",
      tradeOffSummary: "The legacy `adf_publish` approach requires a developer to manually open the Azure Data Factory browser UI and click 'Publish', which generates ARM templates into a separate git branch. The automated approach compiles ARM templates directly inside GitHub Actions or Azure DevOps pipelines from the main branch, enabling true trunk-based CI/CD without human browser interaction.",
      pros: [
        "True Trunk-Based Development: Merging a PR into `main` automatically compiles ARM templates",
        "Eliminates human error (forgetting to click 'Publish' in ADF UI before release)",
        "Automated validation in PRs catches JSON syntax errors and missing Linked Service references",
        "Automated trigger management: Stops active triggers, deploys ARM template, and restarts triggers automatically"
      ],
      cons: [
        "Requires Node.js runtime and build script in CI/CD pipeline",
        "Requires PowerShell or Bash deployment script to handle trigger start/stop cycle"
      ],
      speedRating: "Fast (3-5m)",
      costEfficiency: "High",
      workflowLanguage: "yaml",
      workflowYaml: `# .github/workflows/adf_cicd.yml
name: ADF Automated CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate-and-export:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install ADF Utilities NPM Package
        run: npm install @microsoft/azure-data-factory-utilities --save-dev

      - name: Validate ADF JSON Code
        run: |
          node node_modules/@microsoft/azure-data-factory-utilities/lib/index.js validate . /subscriptions/xxx/resourceGroups/rg-adf/providers/Microsoft.DataFactory/factories/adf-dev

      - name: Generate ARM Templates (Export)
        if: github.ref == 'refs/heads/main'
        run: |
          node node_modules/@microsoft/azure-data-factory-utilities/lib/index.js export . /subscriptions/xxx/resourceGroups/rg-adf/providers/Microsoft.DataFactory/factories/adf-dev "ExportedArmTemplate"

      - name: Deploy ARM Template with Parameter Overrides
        if: github.ref == 'refs/heads/main'
        uses: azure/arm-deploy@v2
        with:
          subscriptionId: \${{ secrets.AZURE_SUBSCRIPTION_ID }}
          resourceGroupName: rg-adf-prod
          template: ExportedArmTemplate/ARMTemplateForFactory.json
          parameters: >
            ExportedArmTemplate/ARMTemplateParametersForFactory.json
            factoryName=adf-prod
            LS_AzureBlobFS_properties_typeProperties_url=https://datalakeprod.dfs.core.windows.net`,
      architectureDescription: "The pipeline uses `@microsoft/azure-data-factory-utilities` to parse pipeline, dataset, and linked service JSONs directly from repository source code. It outputs `ARMTemplateForFactory.json`. Pre-deployment scripts stop active triggers; the ARM template deploys with production environment parameters; post-deployment scripts restart triggers.",
      keyGotchas: [
        "Active triggers WILL lock pipeline deployments! You MUST run a pre-deployment script to stop triggers (`Stop-AzDataFactoryV2Trigger`) and a post-deployment script to restart them (`Start-AzDataFactoryV2Trigger`).",
        "Keep global parameters in a separate parameter file or deployment script to prevent overwriting environment-specific configurations."
      ],
      interviewSoundbite: "State confidently: 'We eliminated the manual ADF Publish button. Using `@microsoft/azure-data-factory-utilities` in our build pipeline, our CI runner compiles ADF JSON artifacts into ARM templates on every merge to main, stops triggers via PowerShell, applies environment-specific parameter overrides, and restarts triggers automatically.'"
    },
    {
      id: "schema-migrations-flyway-lakehouse",
      name: "Database & Lakehouse Schema Migrations: Flyway vs Delta Lake DDL as Code",
      category: "Database / Lakehouse",
      recommendedApproach: "Flyway for Relational DBs (Synapse/SQL) + Delta Table Schema Evolution for Lakehouses",
      legacyOrAlternative: "Manual SQL Scripts executed in SSMS / DBeaver",
      tradeOffSummary: "Relational data warehouses (Synapse Dedicated Pools, PostgreSQL) require strict, transactional, version-controlled schema migrations managed via tools like Flyway or Liquibase (`V1__create_tables.sql`, `V2__add_index.sql`). Lakehouses (Delta Lake, Apache Iceberg) leverage declarative dbt models combined with schema evolution (`mergeSchema`, `sync_all_columns`) and zero-downtime blue/green table cloning.",
      pros: [
        "100% reproducible database state across Dev, Test, Staging, and Production",
        "Flyway tracks migration checksums in `flyway_schema_history` table to prevent rogue edits",
        "Delta Lake zero-downtime blue/green deployment via shallow clone (`CREATE TABLE fct_orders_clone SHALLOW CLONE fct_orders`)",
        "Safe rollback using Delta Time Travel (`RESTORE TABLE ... TO TIMESTAMP AS OF ...`)"
      ],
      cons: [
        "Relational schema rollbacks (dropping columns, data type narrowing) require complex forward-only corrective migrations"
      ],
      speedRating: "Fast (3-5m)",
      costEfficiency: "High",
      workflowLanguage: "bash",
      workflowYaml: `# Flyway Migration Directory Structure:
# sql/
# ├── V1.0__create_dim_customer.sql
# ├── V1.1__add_customer_tier_column.sql
# ├── V2.0__create_fct_transactions.sql
# └── R__create_vw_customer_summary.sql  (Repeatable migration for views)

# CI Pipeline Step: Flyway Migrate in GitHub Actions:
- name: Run Flyway Database Migrations
  run: |
    flyway migrate \\
      -url="jdbc:sqlserver://synapse-prod.sql.azuresynapse.net:1433;databaseName=edw" \\
      -user="\${{ secrets.DB_MIGRATION_USER }}" \\
      -password="\${{ secrets.DB_MIGRATION_PASSWORD }}" \\
      -locations="filesystem:./sql" \\
      -baselineOnMigrate=true

---
# Delta Lake Zero-Downtime Blue/Green Table Swap (PySpark / SQL):
# 1. Create shallow clone for zero-copy staging validation:
spark.sql("CREATE OR REPLACE TABLE sales.fct_orders_staging SHALLOW CLONE sales.fct_orders")

# 2. Apply new transformation into staging:
spark.sql("MERGE INTO sales.fct_orders_staging ...")

# 3. Validate data quality gates (row counts, nulls):
assert spark.table("sales.fct_orders_staging").filter("order_id IS NULL").count() == 0

# 4. Atomic pointer swap:
spark.sql("ALTER TABLE sales.fct_orders RENAME TO sales.fct_orders_backup")
spark.sql("ALTER TABLE sales.fct_orders_staging RENAME TO sales.fct_orders")`,
      architectureDescription: "Flyway executes ordered SQL migration scripts against relational targets, validating SHA-256 hashes against `flyway_schema_history`. For Delta Lake, blue/green table replacement patterns use zero-copy shallow clones to validate transforms before executing atomic table pointer swaps, ensuring analytical queries never experience downtime.",
      keyGotchas: [
        "Never modify a Flyway migration file after it has executed on an environment — Flyway will detect a checksum mismatch and fail the entire deployment.",
        "In Delta Lake, always configure `spark.databricks.delta.schema.autoMerge.enabled = false` in production by default, requiring explicit schema evolution in dbt or PySpark code."
      ],
      interviewSoundbite: "Tell the interviewer: 'For traditional data warehouses like Synapse, we treat DDL as code using Flyway versioned migrations. For our Delta Lakehouse, we achieve zero-downtime releases by pairing dbt `on_schema_change: sync_all_columns` with Delta Shallow Clones and atomic pointer swaps, backed by Delta Time Travel for instant rollback.'"
    }
  ],

  lifecycleStages: [
    {
      stageNumber: 1,
      stageName: "Architecture Inception, Requirements & Data Contracts",
      phase: "Architecture & Design",
      objective: "Establish business grain, SLAs, data contracts, and automated infrastructure as code (IaC) before writing a single line of ETL code.",
      keyArchitecturalDecisions: [
        "Define Data Grain: What does 1 row represent? (e.g. 1 order line item vs 1 customer snapshot).",
        "Choose Ingestion Cadence: Batch micro-batch (hourly/daily) vs Streaming (Kafka/CDC Event Hubs).",
        "Producer-Consumer Data Contracts: Formal JSON Schema defining column names, nullable constraints, and drift rules.",
        "Infrastructure as Code (IaC): Terraform or Bicep provisioning VNet, Private Endpoints, Storage, Key Vault, and Compute."
      ],
      primaryTools: ["Terraform", "Azure Bicep", "OpenDataDiscovery / Great Expectations", "Lucidchart / Whiteboard"],
      concreteDeliverables: [
        {
          name: "Architecture Design Document (ADD)",
          description: "Details data lineage, security boundaries, throughput calculations, and cost estimates.",
          artifacts: ["ADD.md", "system-topology-diagram.svg", "sizing-calculator.xlsx"]
        },
        {
          name: "Terraform Data Platform Foundation",
          description: "Provisions ADLS Gen2 storage accounts (Bronze/Silver/Gold), Key Vault, Databricks Workspace, and ADF with Managed VNet.",
          artifacts: ["main.tf", "storage.tf", "keyvault.tf", "databricks.tf", "variables.tf"]
        },
        {
          name: "Producer Data Contract",
          description: "Agreed schema specification signed by upstream software engineering teams.",
          artifacts: ["order_events_contract.json", "schema_validation_suite.py"]
        }
      ],
      gatekeeperChecklist: [
        "Architecture review board approval completed",
        "Zero Public IPs policy enforced across all storage accounts and Databricks clusters",
        "Data contract validated and registered in central catalog (Unity Catalog / Purview)",
        "Terraform plan executed successfully in Dev environment"
      ],
      interviewExplanationScript: "In the inception phase, I don't jump into pipelines. I first establish the business grain and sign a Producer-Consumer Data Contract with upstream teams. We define schema constraints, SLA freshness, and null thresholds upfront. Then, my team provisions all foundation cloud infrastructure using modular Terraform with private networking and Key Vault secrets before writing ETL code.",
      commonFailureModes: [
        "Skipping data contracts: Upstream application team changes an integer column to string without notification, breaking all downstream jobs.",
        "Manual infrastructure click-ops: Dev, Test, and Prod drift apart because resources were created manually in the Azure portal."
      ]
    },
    {
      stageNumber: 2,
      stageName: "Ingestion & Landing Zone (Raw / Bronze)",
      phase: "Ingestion & Storage",
      objective: "Ingest source data idempotently into immutable raw storage (Bronze layer) with audit metadata and zero data loss.",
      keyArchitecturalDecisions: [
        "Batch vs CDC: Use Azure Data Factory Copy Activity for daily batch files; use Databricks Auto Loader or Debezium for continuous CDC.",
        "Storage Format: Raw source format (JSON/CSV) landed in Bronze container, immediately mirrored to append-only Bronze Delta Lake tables.",
        "Audit Columns: Mandatory ingestion metadata appended to every single row: `_ingestion_timestamp`, `_source_file_name`, `_rescued_data`."
      ],
      primaryTools: ["Azure Data Factory (ADF)", "Databricks Auto Loader (`cloudFiles`)", "Kafka / Event Hubs", "ADLS Gen2"],
      concreteDeliverables: [
        {
          name: "Auto Loader Ingestion Pipeline",
          description: "Streams incoming files incrementally from ADLS Gen2 landing container into Bronze Delta table using schema inference.",
          artifacts: ["bronze_autoloader_ingest.py", "checkpoint_directory_config.json"]
        },
        {
          name: "ADF Ingestion Pipelines",
          description: "Parameterized metadata-driven copy pipeline looping through source database tables.",
          artifacts: ["PL_Ingest_Relational_Source.json", "DS_Source_REST_API.json"]
        }
      ],
      gatekeeperChecklist: [
        "Ingestion pipelines are 100% idempotent — re-running a batch produces zero duplicate records",
        "Auto Loader checkpoints stored in dedicated persistent ADLS container",
        "`_rescued_data` column enabled to prevent pipeline crash when unexpected schema arrives",
        "Landing container lifecycle policies configured to archive raw files after 90 days"
      ],
      interviewExplanationScript: "For the Bronze layer, our mandate is lossless, immutable ingestion. We use Databricks Auto Loader with `cloudFiles` over ADLS Gen2. Auto Loader monitors file notifications efficiently and uses `_rescued_data` to gracefully capture malformed JSON or schema drifts without failing the stream. Every record is enriched with ingestion timestamp and source filename.",
      commonFailureModes: [
        "Non-idempotent ingestion: Re-triggering a failed ADF pipeline ingests duplicates because no merge or partition overwrite was configured.",
        "Schema evolution crashes: A new field added to a CSV file crashes the entire ingestion job because schema inference wasn't configured."
      ]
    },
    {
      stageNumber: 3,
      stageName: "Lakehouse Modeling & Quality Gates (Silver / Curated)",
      phase: "Processing & Quality",
      objective: "Cleanse, deduplicate, conform, and enrich data into query-ready Silver Delta tables governed by automated data quality assertions.",
      keyArchitecturalDecisions: [
        "Deduplication Strategy: `MERGE INTO` matching business key with latest `updated_at` timestamp.",
        "Quality Gate Enforcement: Delta Live Tables Expectations (`@dlt.expect_or_drop`, `@dlt.expect_or_fail`) or dbt schema tests.",
        "Quarantine Pattern: Invalid records violating critical rules are routed to a quarantine table rather than dropped or silently ignored."
      ],
      primaryTools: ["Databricks Delta Live Tables (DLT)", "Apache Spark / PySpark", "dbt-databricks", "Great Expectations"],
      concreteDeliverables: [
        {
          name: "Silver Medallion Curation Job",
          description: "Performs cleansing, data type casting, business key deduplication, and surrogate key assignment.",
          artifacts: ["silver_curate_orders.py", "dlt_expectations_pipeline.sql"]
        },
        {
          name: "Data Quality Test Suite",
          description: "YAML-defined data assertions validating uniqueness, foreign key relationships, and value bounds.",
          artifacts: ["silver_orders_tests.yml", "great_expectations_checkpoint.py"]
        }
      ],
      gatekeeperChecklist: [
        "Primary business key uniqueness verified with 0 duplicates",
        "All timestamp columns normalized to UTC",
        "Foreign key referential integrity checked against conformed lookup tables",
        "Quarantine alerting hooked into Slack / PagerDuty when quarantine rate > 1%"
      ],
      interviewExplanationScript: "In the Silver layer, we transform raw data into a clean, conformed state. We implement Delta Live Tables (DLT) or PySpark `MERGE INTO` statements for incremental upserts. We enforce rigorous Data Expectations: non-critical anomalies are logged, while critical integrity violations are automatically routed to a quarantine Delta table for investigation, ensuring our lakehouse stays clean.",
      commonFailureModes: [
        "Cartesian joins during enrichment: Poorly chosen join keys generate explosive row counts and driver memory crashes.",
        "Dropping bad records silently: Dropping invalid orders without a quarantine table creates financial reconciliation discrepancies."
      ]
    },
    {
      stageNumber: 4,
      stageName: "Semantic Consumption & Marts (Gold / Serving)",
      phase: "Serving & Semantic",
      objective: "Build high-performance Kimball dimensional models (Star Schemas), aggregated data marts, and a standardized semantic layer for Power BI and analytical applications.",
      keyArchitecturalDecisions: [
        "Dimensional Modeling: Star schema with Conformed Dimensions and Fact tables at defined grain.",
        "SCD Strategy: SCD Type 1 for overwrites (contact info); SCD Type 2 for historical tracking (customer segment changes) using dbt snapshots.",
        "Performance Optimization: Liquid Clustering (`CLUSTER BY (order_date, customer_id)`) or `OPTIMIZE ... ZORDER BY`.",
        "Serving Protocol: Power BI Direct Lake mode over Delta tables in OneLake / Unity Catalog for sub-second report response."
      ],
      primaryTools: ["dbt-core", "Databricks SQL Warehouse (Photon)", "Microsoft Fabric / Power BI Direct Lake", "Cube.dev"],
      concreteDeliverables: [
        {
          name: "Kimball Dimensional Model",
          description: "Fact and dimension tables optimized for high-concurrency analytical queries.",
          artifacts: ["dim_customer.sql", "dim_product.sql", "dim_date.sql", "fct_orders.sql"]
        },
        {
          name: "Lakehouse Maintenance & Compaction Script",
          description: "Automated job running OPTIMIZE, VACUUM, and Liquid Clustering maintenance.",
          artifacts: ["lakehouse_maintenance_cron.py"]
        },
        {
          name: "Power BI Direct Lake Semantic Model",
          description: "Tabular model directly consuming Delta Parquet files with zero data import latency.",
          artifacts: ["SalesAnalytics.pbix", "Model.bim"]
        }
      ],
      gatekeeperChecklist: [
        "Star schema validated against Kimball dimensional standards",
        "Delta Liquid Clustering or Z-Ordering applied to high-cardinality filter columns",
        "VACUUM retention policy set to minimum 7 days to preserve Delta Time Travel capability",
        "Row-Level Security (RLS) and Column-Level Masking configured in Unity Catalog"
      ],
      interviewExplanationScript: "For the Gold layer, we model data into Kimball star schemas with conformed dimensions. We utilize dbt snapshots for SCD Type 2 dimension history. For performance, we leverage Databricks Liquid Clustering and Microsoft Fabric Direct Lake mode, allowing Power BI to query Delta Parquet files in memory without needing duplicate import refreshes.",
      commonFailureModes: [
        "Running VACUUM 0 HOURS: Purges all historical Delta log files, breaking concurrent read queries and destroying time-travel audit trails.",
        "Over-partitioning: Partitioning tables by date AND hour produces millions of tiny 20KB files, devastating query performance."
      ]
    },
    {
      stageNumber: 5,
      stageName: "Branching, Testing & Promotion Strategy (Dev -> Staging -> Prod)",
      phase: "Release & CI/CD",
      objective: "Enforce trunk-based development with automated PR testing gates, ephemeral test environments, and zero-downtime production deployment.",
      keyArchitecturalDecisions: [
        "Branching Model: Trunk-based development; feature branches merge directly into `main` after PR approval.",
        "PR Gatekeeper: Automated linter (`sqlfluff`, `ruff`), PyTest unit tests with mock Spark frames, and dbt Slim CI (`state:modified+`).",
        "Environment Isolation: Distinct Azure resource groups and storage accounts (`dev`, `staging`, `prod`) with separate Entra ID Service Principals.",
        "Staging Validation: Zero-copy Delta Shallow Clone of production tables into staging environment to test transformations on real data scale."
      ],
      primaryTools: ["GitHub Actions / Azure DevOps", "dbt Slim CI", "SQLFluff", "pytest-spark / chispa", "Databricks Asset Bundles"],
      concreteDeliverables: [
        {
          name: "CI/CD Pipeline Definition",
          description: "Multi-stage pipeline executing linting, unit tests, Slim CI build, and automated release to production.",
          artifacts: [".github/workflows/dataops_pipeline.yml", "azure-pipelines.yml"]
        },
        {
          name: "PySpark Transformation Unit Tests",
          description: "Tests business logic using small in-memory DataFrames and Chispa assertions.",
          artifacts: ["test_curate_orders.py", "conftest.py"]
        }
      ],
      gatekeeperChecklist: [
        "Minimum 2 senior peer reviews required on PRs touching Gold models or core DAGs",
        "dbt Slim CI test pass rate is 100% on ephemeral PR schema",
        "Unit test coverage > 85% on custom PySpark / Python transformation functions",
        "Production deployment requires designated Data Lead manual approval gate"
      ],
      interviewExplanationScript: "Our promotion strategy follows strict Trunk-Based DataOps. Developers create short-lived feature branches. On PR creation, GitHub Actions runs SQLFluff, PyTest unit tests, and dbt Slim CI against an ephemeral schema. Once merged to main, Databricks Asset Bundles deploys jobs and schedules atomically using our production Service Principal.",
      commonFailureModes: [
        "Long-lived feature branches: Merging a 3-week-old branch creates catastrophic schema merge conflicts.",
        "Testing with fake 5-row mocks only: Code succeeds in test but explodes in production due to data skew on a 500-million row customer table."
      ]
    },
    {
      stageNumber: 6,
      stageName: "Observability, FinOps, SLA Defense & Disaster Recovery",
      phase: "Operations & FinOps",
      objective: "Monitor data freshness SLAs, end-to-end data lineage, compute cost efficiency, and maintain automated business continuity.",
      keyArchitecturalDecisions: [
        "Data Observability & Lineage: Unity Catalog Lineage + OpenLineage/Monte Carlo capturing column-level lineage and data drift.",
        "Alerting Framework: PagerDuty / Slack alerts triggered on Pipeline Failed, Freshness SLA Breached (>2 hours late), or Schema Drift.",
        "FinOps Strategy: Auto-termination on interactive clusters (20 mins), Single-node clusters for light jobs, Spot/Preemptible workers for batch Spark jobs.",
        "Disaster Recovery (DR): Automated Delta Deep Clone to secondary Azure region paired with geo-replicated ADLS storage."
      ],
      primaryTools: ["Unity Catalog Lineage", "OpenLineage / Marquez", "Azure Monitor / Log Analytics", "Databricks System Tables (FinOps)"],
      concreteDeliverables: [
        {
          name: "FinOps Cost Dashboard & System Tables Query",
          description: "SQL queries monitoring DBU consumption per team, pipeline, and cluster.",
          artifacts: ["finops_cluster_attribution.sql", "system_billing_dashboard.json"]
        },
        {
          name: "Disaster Recovery Playbook",
          description: "Runbook for failover to secondary cloud region in the event of primary region outage.",
          artifacts: ["DR_FAILOVER_RUNBOOK.md", "sync_deep_clone_secondary.py"]
        }
      ],
      gatekeeperChecklist: [
        "All clusters configured with auto-termination (max 20 minutes idle)",
        "Freshness SLA metrics streamed to central dashboard",
        "Delta Deep Clone job scheduled daily to secondary disaster recovery region",
        "Annual DR drill conducted with verified RTO < 4 hours and RPO < 1 hour"
      ],
      interviewExplanationScript: "Day-2 operations are governed by three pillars: Observability, FinOps, and Resilience. We query Databricks System Tables to attribute cloud DBU spend per business domain. Lineage is tracked down to the column level in Unity Catalog. For Disaster Recovery, we run daily Delta Deep Clones to a paired secondary region, guaranteeing an RTO under 4 hours and an RPO under 1 hour.",
      commonFailureModes: [
        "Idle cluster cost bleed: Clusters left running over the weekend with auto-termination disabled, incurring thousands in unused cloud costs.",
        "Silent data corruption: Upstream API begins sending 0s instead of NULLs; pipeline succeeds without error, but business metrics are corrupted for weeks undetected."
      ]
    }
  ]
};
