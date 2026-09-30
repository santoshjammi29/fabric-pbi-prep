# scripts/data_patches/patch_airflow_36_to_75.py
"""
Bespoke, expert answers for Airflow questions 036 to 075.
All answers follow the Phase structure with code snippets, configuration, and production gotchas.
"""

def get_airflow_36_to_75():
    return {
        "airflow-q-036": """### Conceptual Foundation & Core Architecture
Airflow enforces concurrency boundaries across multiple orthogonal dimensions:
1. **`core.parallelism`**: Cluster-wide maximum active TaskInstances across all DAGs.
2. **`core.max_active_tasks_per_dag`** (formerly `dag_concurrency`): Max active TaskInstances within a single DAG.
3. **`core.max_active_runs_per_dag`**: Max concurrent DagRuns for a specific DAG.
4. **`Pools`**: Arbitrary resource limits defined by data engineers to protect downstream bottlenecks.

### Comparative Configuration Matrix:
| Parameter | Scope | Primary Purpose |
|---|---|---|
| `parallelism` | Global Cluster | Protects Executor queues and Celery/K8s infrastructure |
| `max_active_tasks_per_dag` | Per DAG | Prevents a single wide DAG from monopolizing all cluster worker slots |
| `max_active_runs_per_dag` | Per DAG | Prevents overlapping scheduled runs or backfill stampedes |
| `Pools` | Cross-DAG / Task Tag | Protects specific physical resources (e.g. Oracle OLTP DB, external REST APIs) |

### Production Hardening & Gotchas
- **Misaligned Limits**: If `pool` slots are set to 20, but `max_active_tasks_per_dag` is set to 5, the DAG will never utilize more than 5 slots simultaneously regardless of pool capacity.
- **Resource Starvation**: Always establish strict pools for heavy ingestion jobs to prevent them from starving user-facing interactive dashboards.""",

        "airflow-q-037": """### Conceptual Foundation & Core Architecture
Introduced in Airflow 2.4+, **Dataset-driven scheduling** enables event-driven, data-aware pipeline orchestration without hardcoded cron times or fragile external sensors. A `Dataset` is defined by a Uniform Resource Identifier (URI), representing a logical or physical data asset (e.g., Delta table, S3 bucket, Snowflake table).

### Low-Level Mechanics & Implementation
Producer DAGs emit Dataset updates via the `outlets` parameter; consumer DAGs trigger automatically when all upstream datasets have been updated:

```python
from airflow import DAG, Dataset
from airflow.operators.bash import BashOperator
from datetime import datetime

# Define standard enterprise Dataset URIs
DELTA_GOLD_ORDERS = Dataset("onelake://analytics/gold/fact_orders")

# Producer DAG
with DAG("producer_gold_orders", start_date=datetime(2024, 1, 1), schedule="@daily") as p_dag:
    build_orders = BashOperator(
        task_id="compute_gold_orders",
        bash_command="python /opt/etl/build_gold.py",
        outlets=[DELTA_GOLD_ORDERS] # Signals update upon task SUCCESS
    )

# Consumer DAG: Automatically triggers when DELTA_GOLD_ORDERS updates
with DAG("consumer_pbi_refresh", start_date=datetime(2024, 1, 1), schedule=[DELTA_GOLD_ORDERS]) as c_dag:
    refresh_pbi = BashOperator(
        task_id="trigger_semantic_model_refresh",
        bash_command="curl -X POST https://api.fabric.microsoft.com/v1/workspaces/refresh"
    )
```

### Production Hardening & Gotchas
- **Logical URIs**: Datasets do not read or validate data contents; Airflow treats the URI string as an immutable token. Airflow triggers consumers strictly upon task `SUCCESS`.
- **Case Sensitivity**: URI matching is strictly case-sensitive. Maintain a centralized `datasets.py` module to prevent typos.""",

        "airflow-q-038": """### Conceptual Foundation & Core Architecture
In complex enterprise architectures, consumer pipelines often require multiple upstream datasets to update before triggering. Airflow 2.9+ and 3.0 support **Boolean Dataset Expressions** (`AND` / `OR` conditional scheduling), allowing downstream DAGs to trigger on composite dataset events.

### Low-Level Mechanics & Implementation
```python
from airflow import DAG, Dataset
from airflow.datasets import DatasetAll, DatasetAny
from airflow.operators.empty import EmptyOperator
from datetime import datetime

CRM_CUSTOMERS = Dataset("s3://lake/silver/dim_customers")
ERP_INVOICES = Dataset("s3://lake/silver/fact_invoices")
PAYMENTS_FEED = Dataset("s3://lake/silver/fact_payments")

# Require CRM_CUSTOMERS AND either ERP_INVOICES OR PAYMENTS_FEED
with DAG(
    "composite_financial_mart",
    start_date=datetime(2024, 1, 1),
    schedule=(CRM_CUSTOMERS & (ERP_INVOICES | PAYMENTS_FEED))
) as dag:
    reconcile = EmptyOperator(task_id="reconcile_finance")
```

### Production Hardening & Gotchas
- **Dataset Event Accumulation**: Airflow remembers dataset update events across runs. If Dataset A updates at 02:00 and Dataset B updates at 06:00, the composite DAG triggers at 06:00, consuming both events.
- **Dangling Events**: If one required dataset in an `AND` condition stops producing, accumulated events for other datasets remain pending indefinitely in the metadata DB until manually cleared.""",

        "airflow-q-039": """### Conceptual Foundation & Core Architecture
**Trigger Rules** determine when a task is allowed to execute based on the execution status of its immediate upstream tasks. By default, tasks use `all_success`.

Core Trigger Rules:
- `all_success` (Default): All direct upstream tasks completed successfully.
- `all_failed`: All upstream tasks failed or had upstream failures.
- `all_done`: All upstream tasks finished execution (regardless of success, failure, or skipped).
- `one_success`: Triggers as soon as at least one parent succeeds (does not wait for all parents to finish).
- `one_failed`: Triggers as soon as at least one parent fails.
- `none_failed`: All upstream tasks succeeded or were skipped; no failures occurred.
- `none_failed_min_one_success`: Crucial for branching; at least one parent succeeded and zero failed.
- `always`: Triggers unconditionally.

### Low-Level Mechanics & Implementation
```python
from airflow.decorators import dag, task
from datetime import datetime

@dag(dag_id="cleanup_trigger_rules", start_date=datetime(2024, 1, 1), schedule=None)
def pipeline():
    @task
    def process_critical_data():
        raise RuntimeError("Transient cluster network partition!")

    # Always runs to release cloud resources and send telemetry regardless of success/failure
    @task(trigger_rule="all_done")
    def tear_down_ephemeral_cluster():
        print("Tearing down ephemeral Spark compute cluster...")

    process_critical_data() >> tear_down_ephemeral_cluster()

flow = pipeline()
```

### Production Hardening & Gotchas
- **Teardown / Cleanup Pattern**: Always use `all_done` for resource teardown tasks (e.g., terminating Databricks job clusters or dropping temporary staging schemas).
- **Cascading Skips**: If a task has `all_success` and any upstream parent is skipped, the task will be marked `skipped` automatically.""",

        "airflow-q-040": """### Conceptual Foundation & Core Architecture
**Deferrable Operators** (introduced via AIP-40 in Airflow 2.2+) solve the resource exhaustion problem of traditional sensors and long-running blocking tasks. Instead of holding an active worker slot and OS thread while waiting for an external event (e.g. Databricks job run, Snowflake warehouse query, S3 file arrival), a Deferrable Operator suspends itself and offloads the wait to a centralized, asynchronous **Triggerer** daemon running Python `asyncio`.

### Low-Level Mechanics & Implementation
How Deferrable Operators Work:
1. Task starts on worker: initializes request (e.g. submits query via REST API).
2. Task defers: calls `self.defer(trigger=..., method_name=...)`. The worker slot is **completely released**.
3. **Triggerer Daemon**: Monitored concurrently via `asyncio` event loop. A single Triggerer process can monitor **thousands of tasks simultaneously**.
4. Event fires: Triggerer raises `TriggerEvent`.
5. Resumption: The scheduler re-queues the task, which resumes on any available worker to finalize results.

```python
from airflow.providers.databricks.operators.databricks import DatabricksSubmitRunOperator
from datetime import datetime

# Runs without consuming a dedicated worker slot during a 4-hour Databricks job
run_databricks_etl = DatabricksSubmitRunOperator(
    task_id="submit_heavy_databricks_job",
    databricks_conn_id="databricks_default",
    existing_cluster_id="0812-124400-cluster",
    notebook_task={"notebook_path": "/Users/etl/heavy_merge"},
    deferrable=True, # Releases worker slot immediately upon submission
    dag=dag
)
```

### Production Hardening & Gotchas
- **High-Availability Triggerers**: Run multiple `airflow triggerer` instances in production. If a single triggerer VM crashes, surviving daemons automatically acquire orphaned triggers.
- **Resource Savings**: Switching 50 blocking sensors to deferrable mode can reduce required Airflow Celery worker nodes from 10 VMs to 2 VMs, cutting infrastructure costs by 80%.""",

        "airflow-q-041": """### Conceptual Foundation & Core Architecture
The **`TriggerDagRunOperator`** triggers an independent DAG run from within an upstream DAG. This decouples monolithic enterprise workflows into modular, reusable micro-DAGs that can be triggered programmatically across domain boundaries.

### Low-Level Mechanics & Implementation
```python
from airflow import DAG
from airflow.operators.trigger_dagrun import TriggerDagRunOperator
from datetime import datetime

with DAG("controller_dag", start_date=datetime(2024, 1, 1), schedule="@daily") as dag:
    trigger_downstream_gold = TriggerDagRunOperator(
        task_id="trigger_gold_finance",
        trigger_dag_id="gold_financial_reconciliation",
        conf={"batch_id": "B-94820", "source": "controller_daily"},
        wait_for_completion=True,  # Blocks until downstream DAG concludes
        poke_interval=60,
        deferrable=True            # Uses Triggerer while waiting
    )
```

### Production Hardening & Gotchas
- **Deadlock Cycles**: If DAG A triggers DAG B and DAG B triggers DAG A, an infinite loop occurs until metadata DB storage or execution limits are exhausted. Enforce static acyclic cross-DAG registries.
- **Blocking vs Non-Blocking**: If `wait_for_completion=False`, the operator succeeds immediately after firing the trigger event. If `wait_for_completion=True`, always enable `deferrable=True` to avoid blocking worker threads.""",

        "airflow-q-042": """### Conceptual Foundation & Core Architecture
The **`ExternalTaskSensor`** pauses task execution until a specific task (or an entire DAG) in an *external* DAG has reached a specific state (`success`) for a corresponding data interval.

### Low-Level Mechanics & Implementation
```python
from airflow import DAG
from airflow.sensors.external_task import ExternalTaskSensor
from datetime import datetime, timedelta

with DAG("downstream_reporting", start_date=datetime(2024, 1, 1), schedule="@daily") as dag:
    wait_for_upstream_crm = ExternalTaskSensor(
        task_id="wait_for_crm_gold",
        external_dag_id="upstream_crm_pipeline",
        external_task_id="finalize_crm_gold_table",
        allowed_states=["success"],
        execution_delta=timedelta(hours=2), # Upstream ran 2 hours earlier
        mode="reschedule",                  # Critical: release worker slot
        timeout=3600 * 3
    )
```

### Production Hardening & Gotchas
- **Schedule Interval Alignment**: `ExternalTaskSensor` matches the exact `logical_date` of the target run. If upstream runs at 02:00 and downstream runs at 04:00, you must supply `execution_delta=timedelta(hours=2)` or a custom `execution_date_fn`. Mismatches cause the sensor to wait until timeout.
- **Modern Alternative**: Where possible, replace `ExternalTaskSensor` with **Airflow Datasets**, which eliminate fragile time-delta calculations.""",

        "airflow-q-043": """### Conceptual Foundation & Core Architecture
Airflow exposes a fully featured **REST API (OpenAPI spec)** allowing programmatic integration with CI/CD platforms, external schedulers, enterprise monitoring tools, and custom portals.

### Low-Level Mechanics & Implementation
The REST API supports operations such as triggering DAG runs, managing variables, querying task instance states, and inspecting cluster metrics.

```bash
# Trigger a DAG run with custom runtime configuration via cURL
curl -X POST "https://airflow.enterprise.com/api/v1/dags/lakehouse_orders_sync/dagRuns" \\
    -H "Content-Type: application/json" \\
    -u "api_service_account:SecureToken123" \\
    -d '{
        "conf": {"tenant_id": "EU-CORP", "force_full_refresh": false},
        "dag_run_id": "manual_api_trigger_20240320_001",
        "note": "Triggered by Salesforce webhook"
    }'
```

Querying Task Instance State:
```bash
curl -X GET "https://airflow.enterprise.com/api/v1/dags/lakehouse_orders_sync/dagRuns/manual_api_trigger_20240320_001/taskInstances/validate_orders" \\
    -u "api_service_account:SecureToken123"
```

### Production Hardening & Gotchas
- **API Authentication**: In production, disable basic auth (`airflow.api.auth.backend.basic_auth`) and enable JWT tokens, Kerberos, or OAuth proxy authentication.
- **Rate Limiting**: Protect webserver instances against denial-of-service from runaway loops by placing an API Gateway (Kong, Nginx, or AWS ALB) with rate limiting in front of the Airflow API.""",

        "airflow-q-044": """### Conceptual Foundation & Core Architecture
Airflow integrates **Variables into Jinja templates** via the `{{ var.value.VAR_NAME }}` and `{{ var.json.VAR_NAME }}` syntax. This allows dynamic configuration values to be injected at runtime without writing Python code or querying the metadata database during DAG parsing.

### Low-Level Mechanics & Implementation
```python
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from datetime import datetime

run_governed_query = SQLExecuteQueryOperator(
    task_id="apply_retention_policy",
    conn_id="snowflake_prod",
    sql=\"\"\"
        DELETE FROM raw.telemetry_events
        WHERE event_timestamp < DATEADD('day', -{{ var.json.RETENTION_POLICY.retention_days }}, CURRENT_DATE())
          AND environment = '{{ var.value.DEPLOYMENT_STAGE }}';
    \"\"\",
    dag=dag
)
```

### Production Hardening & Gotchas
- **Parsing Overhead Elimination**: Accessing variables via `{{ var.value.VAR_NAME }}` inside templated strings defers the database lookup to task execution time. Conversely, calling `Variable.get()` in top-level Python executes a SQL query on every single DAG file parse, causing scheduler degradation.
- **Default Fallbacks**: Provide fallbacks inside Jinja to prevent task compilation failures: `{{ var.value.get('STAGE', 'development') }}`.""",

        "airflow-q-045": """### Conceptual Foundation & Core Architecture
Airflow provides lifecycle callback hooks at both the DAG and task levels:
- **`on_success_callback`**: Invoked when execution completes with state `success`.
- **`on_failure_callback`**: Invoked when execution terminates with state `failed`.
- **`on_retry_callback`**: Invoked when an attempt fails and the task transitions to `up_for_retry`.
- **`sla_miss_callback`**: Invoked when a task misses its scheduled SLA.

### Low-Level Mechanics & Implementation
```python
from airflow.decorators import dag, task
from datetime import datetime

def post_slack_incident_alert(context):
    ti = context["task_instance"]
    exception = context.get("exception", "Unknown exception")
    payload = {
        "text": f":rotating_light: *Task Failure Alert*\\n"
                f"*DAG*: `{ti.dag_id}`\\n"
                f"*Task*: `{ti.task_id}`\\n"
                f"*Execution Date*: `{context['ds']}`\\n"
                f"*Error*: `{exception}`\\n"
                f"*Logs*: <{ti.log_url}|View Airflow Log>"
    }
    # Send HTTP webhook to Slack / Microsoft Teams channel
    print(f"Dispatched Slack alert for {ti.task_id}")

@dag(
    dag_id="callback_governance",
    start_date=datetime(2024, 1, 1),
    schedule="@daily",
    default_args={"on_failure_callback": post_slack_incident_alert}
)
def pipeline():
    @task
    def critical_step():
        pass
    critical_step()

flow = pipeline()
```

### Production Hardening & Gotchas
- **Execution Context**: Callbacks run in the context of the Airflow Worker (for task callbacks) or Scheduler (for DAG callbacks). Never place long-running synchronous network loops in callbacks.
- **Fail-Safe Callbacks**: Always wrap callback logic in `try...except`. An unhandled exception in an `on_failure_callback` can mask the original task error and leave the TaskInstance in an inconsistent state.""",

        "airflow-q-046": """### Conceptual Foundation & Core Architecture
By default, Airflow persists XCom values as serialized strings in the PostgreSQL `xcom` table. For enterprise data pipelines exchanging large data structures (Pandas DataFrames, ML models, large JSON payloads), this quickly causes database buffer bloat, IOPS exhaustion, and scheduler crashes. A **Custom XCom Backend** offloads the physical payload to cloud object storage (S3, ADLS Gen2, GCS) while storing only an immutable URI pointer in the metadata database.

### Low-Level Mechanics & Implementation
```python
# Custom XCom Backend implementation
from typing import Any
import json
import uuid
import boto3
from airflow.models.xcom import BaseXCom

class S3XComBackend(BaseXCom):
    PREFIX = "xcom_payloads"
    BUCKET = "enterprise-airflow-xcom-prod"

    @staticmethod
    def serialize_value(value: Any, **kwargs) -> str:
        s3_key = f"{S3XComBackend.PREFIX}/{uuid.uuid4()}.json"
        s3 = boto3.client("s3")
        payload = json.dumps(value, default=str)
        s3.put_object(Bucket=S3XComBackend.BUCKET, Key=s3_key, Body=payload.encode("utf-8"))
        # Only the S3 URI string is written to PostgreSQL metadata DB
        return f"s3://{S3XComBackend.BUCKET}/{s3_key}"

    @staticmethod
    def deserialize_value(result) -> Any:
        uri = result.value
        if isinstance(uri, str) and uri.startswith("s3://"):
            bucket, key = uri.replace("s3://", "").split("/", 1)
            s3 = boto3.client("s3")
            obj = s3.get_object(Bucket=bucket, Key=key)
            return json.loads(obj["Body"].read().decode("utf-8"))
        return BaseXCom.deserialize_value(result)
```

Enable in `airflow.cfg`:
```ini
[core]
xcom_backend = my_package.custom_xcom.S3XComBackend
```

### Production Hardening & Gotchas
- **Lifecycle Policies**: Objects written to the S3 XCom bucket accumulate indefinitely. Configure S3 Lifecycle Expiration rules (e.g., delete objects older than 30 days) to prevent petabyte cloud storage accumulation.""",

        "airflow-q-047": """### Conceptual Foundation & Core Architecture
Airflow's logging infrastructure uses Python's standard `logging` library, configured via `log_config.py`. In distributed architectures, logs from Schedulers, Webservers, and distributed Workers are aggregated and shipped to durable remote storage (S3, GCS, CloudWatch, Datadog).

### Low-Level Mechanics & Implementation
Key configuration settings in `airflow.cfg`:
```ini
[logging]
base_log_folder = /opt/airflow/logs
remote_logging = True
remote_base_log_folder = s3://enterprise-airflow-logs/prod/
remote_log_conn_id = aws_default
logging_level = INFO
fab_logging_level = WARNING
log_format = [%%(asctime)s] {%%(filename)s:%%(lineno)d} %%(levelname)s - %%(message)s
```

### Production Hardening & Gotchas
- **Task Log Rotation**: Local worker disks can easily fill up with uncompressed logs. Deploy `logrotate` daemons or automated cron cleaners (`airflow db clean`) to prevent disk-full crashes.
- **PII Scrubbing**: Implement custom log formatters or filters to redact sensitive tokens, passwords, and PII from execution logs before shipping to external APM tools.""",

        "airflow-q-048": """### Conceptual Foundation & Core Architecture
**Task Retry Delay** defines the duration a task must remain in the `up_for_retry` state before the scheduler re-evaluates it for execution. Paired with **exponential backoff**, it prevents thundering herd problems when an external system undergoes transient downtime.

### Low-Level Mechanics & Implementation
```python
from airflow.decorators import dag, task
from datetime import datetime, timedelta

@dag(
    dag_id="exponential_retry_tuning",
    start_date=datetime(2024, 1, 1),
    schedule="@hourly",
    default_args={
        "retries": 5,
        "retry_delay": timedelta(seconds=15),        # Initial delay: 15s
        "retry_exponential_backoff": True,           # Exponential curve: 15s, 30s, 60s, 120s...
        "max_retry_delay": timedelta(minutes=10),    # Hard ceiling on delay
    }
)
def pipeline():
    @task
    def sync_third_party_crm():
        pass
    sync_third_party_crm()

flow = pipeline()
```

### Production Hardening & Gotchas
- **Long Delays Blocking DAG Runs**: If a task has 10 retries with 30-minute delays, a single failed run can block subsequent runs for hours if `max_active_runs=1`. Balance retry persistence with business SLA requirements.""",

        "airflow-q-049": """### Conceptual Foundation & Core Architecture
Airflow's **SLA Miss alerts** monitor pipeline timeliness. When a task exceeds its configured `sla` duration, Airflow triggers the DAG's `sla_miss_callback` and dispatches notification emails to addresses listed in `default_args["email"]`.

### Low-Level Mechanics & Implementation
```python
from airflow import DAG
from datetime import datetime, timedelta

def pagerduty_sla_miss_handler(dag, task_list, blocking_task_list, slas, blocking_tis):
    msg = (
        f"CRITICAL SLA BREACH: DAG {dag.dag_id} missed SLA!\\n"
        f"Breached Tasks: {task_list}\\n"
        f"Blocking Tasks in Critical Path: {blocking_task_list}"
    )
    print(f"Triggering incident dispatch: {msg}")

with DAG(
    "regulatory_risk_pipeline",
    start_date=datetime(2024, 1, 1),
    schedule="0 5 * * *",
    default_args={"sla": timedelta(hours=2)},
    sla_miss_callback=pagerduty_sla_miss_handler
) as dag:
    pass
```

### Production Hardening & Gotchas
- **Evaluation Timing**: SLA evaluation occurs in the scheduler's background loop. If the scheduler is experiencing high CPU pressure or database connection pool exhaustion, SLA miss alerts may be delayed.
- **Historical Backfill Confusion**: When backfilling historical runs, tasks may instantly trigger SLA misses because their execution date is weeks in the past. Suppress callbacks during backfill operations.""",

        "airflow-q-050": """### Conceptual Foundation & Core Architecture
Hardcoding credentials or storing sensitive API keys in plaintext in Airflow Variables is a critical security vulnerability. Airflow supports **Secrets Manager Backends** (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault, Google Secret Manager), intercepting `Variable.get()` and `BaseHook.get_connection()` requests to fetch secrets directly from enterprise vaults.

### Low-Level Mechanics & Implementation
Configuring AWS Secrets Manager in `airflow.cfg`:
```ini
[secrets]
backend = airflow.providers.amazon.aws.secrets.secrets_manager.SecretsManagerBackend
backend_kwargs = {
    "connections_prefix": "airflow/connections",
    "variables_prefix": "airflow/variables",
    "use_ssl": true
}
```

When code executes `Variable.get("STRIPE_API_KEY")`:
1. Airflow checks AWS Secrets Manager for secret `airflow/variables/STRIPE_API_KEY`.
2. If found, it returns the value in memory without touching the Airflow metadata DB.
3. If not found, it falls back to environment variables and then the metadata DB.

### Production Hardening & Gotchas
- **API Throttling & Cost**: If hundreds of tasks query AWS Secrets Manager every second, AWS will throttle requests (`ThrottlingException`) and cloud API costs will surge. Enable local caching via `backend_kwargs = {"variables_lookup_pattern": "^AIRFLOW_", "cache_size": 1000}`.""",

        "airflow-q-051": """### Conceptual Foundation & Core Architecture
Prior to Airflow 2.0, the scheduler was a single point of failure (SPOF). Airflow 2.0 introduced the **High-Availability (HA) Multi-Scheduler** architecture. Multiple scheduler instances run concurrently in active-active mode against the same PostgreSQL/MySQL metadata database without task collision or state corruption.

### Low-Level Mechanics & Implementation
HA Scheduler Coordination Mechanics:
1. **Row-Level Locking**: Schedulers use SQL row-level locks (`SELECT ... FOR UPDATE SKIP LOCKED`) when querying the `task_instance` table for `SCHEDULED` tasks.
2. **Deterministic Partitioning**: Schedulers safely claim available tasks without blocking peer schedulers.
3. **Heartbeat Auditing**: Each scheduler updates its heartbeat in the `scheduler` table. If scheduler A dies, peer schedulers detect the heartbeat timeout and recover any uncompleted work.

Recommended Production Architecture:
- Run 2 to 3 Scheduler instances across separate Kubernetes availability zones.
- Deploy an external, highly available PostgreSQL database (e.g. AWS Aurora Multi-AZ or Azure Flexible Server).

### Production Hardening & Gotchas
- **Database Lock Contention**: Running more than 4 scheduler instances often yields diminishing returns: lock contention on `task_instance` increases database CPU utilization without boosting task throughput.
- **Dedicated DAG Processors**: In high-scale deployments, decouple DAG parsing by running standalone `airflow dag-processor` instances.""",

        "airflow-q-052": """### Conceptual Foundation & Core Architecture
The Airflow **Metadata Database** stores all state for DAG definitions, execution history, users, connections, and variables. Understanding the relational core schema is essential for diagnosing performance regressions and writing maintenance cleanup scripts.

### Core Relational Tables:
- **`dag`**: Static metadata about each parsed DAG (schedule, paused status, file location).
- **`serialized_dag`**: JSON-serialized bytecode representation of DAG topologies, used by the Webserver to render graphs without executing Python files.
- **`dag_run`**: Historical and active DAG run records (`dag_id`, `run_id`, `state`, `execution_date`, `data_interval_start/end`).
- **`task_instance`**: The most active table; records individual task executions (`task_id`, `dag_id`, `run_id`, `state`, `try_number`, `duration`, `queued_dttm`, `start_date`, `end_date`).
- **`xcom`**: Key-value data payloads exchanged across tasks.
- **`log`**: Audit trail of user actions performed in the Web UI.

### Production Hardening & Gotchas
- **Index Degradation**: In high-throughput clusters generating 500,000+ task instances weekly, indexes on `task_instance (dag_id, state, execution_date)` fragment heavily.
- **Maintenance Database Cleanup**: Regularly run `airflow db clean` to archive and purge task instances and DAG runs older than 90 days. Neglecting database cleanup causes scheduler query latencies to balloon from 5ms to 5,000ms.""",

        "airflow-q-053": """### Conceptual Foundation & Core Architecture
The **`DagFileProcessor`** continuously parses Python files in the DAG folder to detect structural changes, update serialization tables, and trigger scheduling intervals. As DAG counts scale from 50 to 2,000+, file parsing latency becomes the primary bottleneck in Airflow scheduling performance.

### Low-Level Mechanics & Implementation
Key tuning parameters in `airflow.cfg`:
```ini
[scheduler]
# Number of parallel file processor worker processes
max_threads = 4

# Minimum seconds before reparsing the exact same DAG file
min_file_process_interval = 60

# Timeout before killing a slow-parsing DAG file
dag_file_processor_timeout = 50

# Controls parsing loop sleep duration
file_parsing_sort_mode = modified_time
```

### Production Hardening & Gotchas
- **Top-Level Computation Anti-Pattern**: If a DAG file contains `requests.get()`, `boto3.client()`, or database connections in top-level code, every single parse cycle incurs network I/O. A 500ms network pause across 200 files completely freezes the scheduler.
- **`.airflowignore`**: Place `.airflowignore` files in DAG directories to exclude test files, helper modules, and virtual environments from parsing passes.""",

        "airflow-q-054": """### Conceptual Foundation & Core Architecture
**DAG Bag Parsing Optimization** minimizes the CPU, memory, and I/O footprint of loading Python DAG definitions into Airflow's internal `DagBag`.

### Best-Practice Architectural Patterns:
1. **Dynamic Generation Optimization**: When dynamically generating DAGs from JSON/YAML configs, generate them once via a build script into static `.py` files rather than evaluating dynamic loops inside `dag_folder` on every parse cycle.
2. **Defensive Module Imports**: Move heavy third-party imports (Pandas, PySpark, TensorFlow, Scikit-learn) inside the task execution function (`def execute():`) rather than importing them at the top of the file.
3. **Use `.airflowignore`**:
```text
# .airflowignore
.*_test\\.py$
common/
templates/
scratch/
```

### Production Hardening & Gotchas
- **Testing Parse Speed**: Add a CI/CD unit test that loads all DAGs into a `DagBag` and asserts parsing completes in under 1 second per file:
```python
import time
from airflow.models import DagBag

def test_dag_parse_speed():
    start = time.time()
    dagbag = DagBag(dag_folder="dags/", include_examples=False)
    duration = time.time() - start
    assert len(dagbag.import_errors) == 0, f"Import errors: {dagbag.import_errors}"
    assert duration < 30.0, f"DagBag parsing too slow: {duration}s"
```""",

        "airflow-q-055": """### Conceptual Foundation & Core Architecture
Scaling Celery workers elastically based on demand is critical for cloud cost efficiency. **KEDA (Kubernetes Event-driven Autoscaling)** enables autoscaling Airflow Celery worker pods from zero to hundreds of replicas by querying queue depths directly from Redis or RabbitMQ.

### Low-Level Mechanics & Implementation
KEDA `ScaledObject` Manifest:
```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: airflow-celery-worker-scaler
  namespace: airflow
spec:
  scaleTargetRef:
    name: airflow-worker
  minReplicaCount: 2
  maxReplicaCount: 50
  cooldownPeriod: 300
  triggers:
    - type: redis
      metadata:
        address: redis-broker.airflow:6379
        listName: default
        listLength: "8"  # Adds 1 worker pod for every 8 queued tasks
        enableTLS: "false"
      authenticationRef:
        name: keda-redis-secret
```

### Production Hardening & Gotchas
- **Premature Pod Termination**: If KEDA scales down a worker pod while it is actively executing a long-running task, the task crashes with a `SIGTERM` or `SIGKILL`. Configure Kubernetes `terminationGracePeriodSeconds: 3600` and ensure Celery handles `SIGTERM` by finishing active tasks before exiting.""",

        "airflow-q-056": """### Conceptual Foundation & Core Architecture
The **`KubernetesPodOperator` (KPO)** launches an independent Kubernetes pod to execute a task within a specified Docker image. The **Pod Template File** allows data platform teams to define enterprise standards (security contexts, service mesh sidecars, logging daemons, volume mounts) across all worker pods while allowing individual tasks to configure custom commands and environments.

### Low-Level Mechanics & Implementation
```python
from airflow import DAG
from airflow.providers.cncf.kubernetes.operators.pod import KubernetesPodOperator
from datetime import datetime

with DAG("governed_kpo_pipeline", start_date=datetime(2024, 1, 1), schedule=None) as dag:
    run_ml_inference = KubernetesPodOperator(
        task_id="run_distributed_inference",
        name="ml-infer-pod",
        namespace="airflow-workloads",
        image="registry.enterprise.com/models/bert-infer:v3.2",
        cmds=["python", "/app/infer.py"],
        arguments=["--batch-id", "{{ ds }}"],
        pod_template_file="/opt/airflow/pod_templates/enterprise_hardened_spec.yaml",
        is_delete_operator_pod=True,
        get_logs=True,
    )
```

### Production Hardening & Gotchas
- **`is_delete_operator_pod`**: Always set to `True` (or `"True"`) in production to prevent thousands of terminated pods in `Completed` state from overwhelming the Kubernetes API server `etcd` database.
- **Resource Limits**: Always enforce CPU/Memory requests and limits to prevent noisy-neighbor memory exhaustion on Kubernetes cluster nodes.""",

        "airflow-q-057": """### Conceptual Foundation & Core Architecture
When running data-heavy workloads via `KubernetesPodOperator`, pods often require large temporary scratch space (e.g. for downloading large uncompressed Parquet/CSV files before loading). Managing **ephemeral storage** properly prevents Kubernetes nodes from suffering disk eviction (`NodeHasDiskPressure`).

### Low-Level Mechanics & Implementation
Configure dedicated `emptyDir` volumes backed by local SSD storage or memory:

```python
from kubernetes.client import models as k8s
from airflow.providers.cncf.kubernetes.operators.pod import KubernetesPodOperator

# Mount a 50GB local ephemeral scratch volume
scratch_volume = k8s.V1Volume(
    name="scratch-storage",
    empty_dir=k8s.V1EmptyDirVolumeSource(medium="", size_limit="50Gi")
)
scratch_mount = k8s.V1VolumeMount(
    name="scratch-storage", mount_path="/tmp/scratch", sub_path=None, read_only=False
)

kpo_task = KubernetesPodOperator(
    task_id="extract_large_telemetry",
    image="python:3.11-slim",
    volumes=[scratch_volume],
    volume_mounts=[scratch_mount],
    dag=dag
)
```

### Production Hardening & Gotchas
- **Root Filesystem Writes**: Never write large temporary files to the pod's container root overlay filesystem (`/`). Doing so triggers kubelet container eviction when the root threshold is breached. Always mount explicit `emptyDir` or persistent volumes.""",

        "airflow-q-058": """### Conceptual Foundation & Core Architecture
In multi-tenant or regulated environments, pods spawned by `KubernetesPodOperator` must adhere to **Zero-Trust network policies**. Kubernetes NetworkPolicies restrict ingress and egress traffic, ensuring that workload pods can only communicate with authorized endpoints (e.g. internal data lake object storage) and cannot reach external internet endpoints or the Kubernetes API.

### Low-Level Mechanics & Implementation
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: airflow-workload-network-policy
  namespace: airflow-workloads
spec:
  podSelector:
    matchLabels:
      airflow-worker: "true"
  policyTypes:
    - Ingress
    - Egress
  ingress: [] # Zero inbound traffic allowed
  egress:
    # Allow DNS resolution
    - to:
      - namespaceSelector: {}
        podSelector:
          matchLabels:
            k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
    # Allow egress only to internal Lakehouse / S3 endpoints
    - to:
      - ipBlock:
          cidr: 10.200.0.0/16
      ports:
        - protocol: TCP
          port: 443
```

### Production Hardening & Gotchas
- **Blocked Metadata Sockets**: If your workload pods use cloud IAM instance metadata (e.g. `169.254.169.254`), ensure your egress policy does not block the metadata IP, or switch to Workload Identity / IRSA.""",

        "airflow-q-059": """### Conceptual Foundation & Core Architecture
**DAG Versioning** addresses the challenge of modifying pipeline code while historical DagRuns are actively in flight. In legacy Airflow, editing a DAG file mutated active and historical task representations in the Web UI. Airflow 2.x serializes DAG structures, while Airflow 3.0 formalizes complete DAG versioning in the metadata database.

### Enterprise Versioning Strategies:
1. **Immutable DAG Naming**: Append version suffixes (`dag_id="orders_etl_v2"`) when introducing breaking changes.
2. **Git Commit Hash Tagging**: Tag DagRuns with current commit hashes via CI/CD pipelines.
3. **Serialized DAG Table Isolation**: Ensure the webserver serves graph views strictly from the `serialized_dag` snapshot corresponding to the execution date.

### Production Hardening & Gotchas
- **Deleting Tasks from Active DAGs**: If you delete a task from a Python file while historical DagRuns are still running, Airflow marks old task instances as orphaned. Always deprecate tasks gracefully or increment DAG IDs.""",

        "airflow-q-060": """### Conceptual Foundation & Core Architecture
An enterprise **CI/CD Pipeline for Airflow** automates code quality validation, static analysis, unit testing, and zero-downtime deployment of DAG files to production clusters.

### Production CI/CD Pipeline Architecture:
1. **Linting & Code Quality**: Run `ruff`, `black`, and `flake8`.
2. **Static AST Analysis**: Detect forbidden imports, top-level network calls, and syntax errors.
3. **DAG Bag Loading Test**: Assert all DAGs parse in `< 1.0s` without import errors.
4. **Unit & Integrity Tests**: Verify task dependencies, retries, and SLA configurations.
5. **Deployment via Git-Sync**: Sync approved git branches to cluster shared storage or container images.

```yaml
# GitHub Actions snippet
name: Airflow CI/CD
on: [push, pull_request]
jobs:
  validate-dags:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with: { python-version: "3.11" }
      - run: pip install apache-airflow pytest
      - name: Test DAG Parse Integrity
        run: |
          python -c "
          from airflow.models import DagBag
          dagbag = DagBag(dag_folder='dags/', include_examples=False)
          assert len(dagbag.import_errors) == 0, f'Errors: {dagbag.import_errors}'
          "
```

### Production Hardening & Gotchas
- **Git-Sync Race Conditions**: If a DAG file depends on a custom utility module that has not finished syncing, the scheduler throws `ModuleNotFoundError`. Package shared utilities into versioned Python wheels rather than raw loose files in `dags/`.""",

        "airflow-q-061": """### Conceptual Foundation & Core Architecture
Airflow emits real-time operational telemetry via **StatsD** or **OpenTelemetry (OTel)**, sending metrics to monitoring stacks like Prometheus, Grafana, Datadog, or CloudWatch to track cluster health and pipeline SLAs.

### Core Metrics to Monitor:
- `dag_processing.total_parse_time`: Duration required to parse all DAG files. Alerts on top-level code regressions.
- `scheduler.heartbeat_duration`: Scheduling loop latency. Spikes indicate database lock contention.
- `executor.queued_tasks` / `executor.running_tasks`: Real-time queue saturation and worker utilization.
- `dagrun.schedule_delay`: Latency between when a DagRun was supposed to start and when it was created.
- `ti.failures`: Real-time failure spikes across tasks.

### Production Hardening & Gotchas
- **StatsD UDP Packet Drops**: StatsD uses UDP; during network spikes, metric packets can drop silently. Use an in-cluster StatsD Exporter sidecar that scrapes UDP metrics and exposes a Prometheus `/metrics` scrape endpoint.""",

        "airflow-q-062": """### Conceptual Foundation & Core Architecture
Deploying Airflow on **Google Kubernetes Engine (GKE) with Workload Identity** provides the most secure authentication paradigm on Google Cloud. It eliminates long-lived service account JSON keys by mapping Kubernetes Service Accounts (KSAs) directly to Google Cloud IAM Service Accounts (GSAs).

### Low-Level Mechanics & Implementation
```bash
# 1. Bind KSA to GSA via IAM policy
gcloud iam service-accounts add-iam-policy-binding \\
    airflow-worker@my-gcp-project.iam.gserviceaccount.com \\
    --role roles/iam.workloadIdentityUser \\
    --member "serviceAccount:my-gcp-project.svc.id.goog[airflow/airflow-worker-ksa]"

# 2. Annotate Kubernetes Service Account
kubectl annotate serviceaccount airflow-worker-ksa \\
    --namespace airflow \\
    iam.gke.io/gcp-service-account=airflow-worker@my-gcp-project.iam.gserviceaccount.com
```

### Production Hardening & Gotchas
- **Node Metadata Server**: Ensure the GKE node pool has Workload Identity enabled (`--workload-metadata=GKE_METADATA`). If disabled, pods cannot communicate with the Google metadata server to exchange tokens.""",

        "airflow-q-063": """### Conceptual Foundation & Core Architecture
**Amazon MWAA (Managed Workflows for Apache Airflow)** relies on AWS Identity and Access Management (IAM) Execution Roles to authorize Airflow services to interact with Amazon S3, CloudWatch Logs, EMR, Athena, and AWS Secrets Manager without managing static credentials.

### Low-Level Mechanics & Implementation
Key IAM Policy Actions Required:
- `s3:GetObject*`, `s3:ListBucket`: For reading DAGs, plugins, and requirements from the MWAA S3 bucket.
- `logs:CreateLogStream`, `logs:PutLogEvents`: For shipping scheduler and worker logs to Amazon CloudWatch.
- `secretsmanager:GetSecretValue`: For retrieving secrets via AWS Secrets Manager backend.
- `sqs:*`: For Celery broker queue management.

### Production Hardening & Gotchas
- **KMS Key Permissions**: If the MWAA environment or S3 bucket is encrypted using a customer-managed AWS KMS key (CMK), the MWAA Execution Role must have explicit `kms:Decrypt`, `kms:GenerateDataKey*`, and `kms:DescribeKey` permissions on the KMS key policy.""",

        "airflow-q-064": """### Conceptual Foundation & Core Architecture
Architecting a **Multi-Region Airflow deployment** provides disaster tolerance and low-latency scheduling across geographic cloud regions (e.g., US-East and EU-West). Running a single active-active scheduler cluster across regions with cross-region database latency is an anti-pattern. Instead, deploy **Federated Regional Clusters** with decentralized metadata stores and central CI/CD synchronization.

### Recommended Multi-Region Architecture:
1. **Independent Regional Airflow Deployments**: Each cloud region hosts an isolated Airflow cluster with its own local PostgreSQL metadata DB, Redis broker, and worker pools.
2. **Unified Git Repository**: DAGs and infrastructure configurations are deployed uniformly across all regions via GitOps (ArgoCD or GitHub Actions).
3. **Cross-Region Event Triggering**: Cross-region coordination is executed asynchronously via cloud pub/sub messaging (Kafka, AWS SNS/SQS, Azure Event Hubs) rather than cross-region database links.

### Production Hardening & Gotchas
- **Cross-Region Latency Hazard**: Never connect an Airflow Scheduler in US-East to a PostgreSQL metadata database in EU-West. The 100ms+ round-trip latency will degrade scheduler throughput by 95%.""",

        "airflow-q-065": """### Conceptual Foundation & Core Architecture
Every Airflow component (Scheduler threads, Webserver workers, Celery workers, DagProcessors) opens persistent database connections. In high-concurrency clusters, thousands of direct connections saturate PostgreSQL connection limits (`max_connections`), triggering `FATAL: remaining connection slots are reserved` errors. Deploying **connection poolers (e.g. PgBouncer)** is mandatory for enterprise scale.

### Low-Level Mechanics & Implementation
PgBouncer Configuration for Airflow:
```ini
[databases]
airflow = host=postgres-primary.internal port=5432 dbname=airflow

[pgbouncer]
listen_port = 6432
listen_addr = *
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
# CRITICAL: Use transaction pooling mode
pool_mode = transaction
max_client_conn = 2000
default_pool_size = 50
min_pool_size = 10
reserve_pool_size = 5
```

Airflow Connection String:
```ini
[database]
sql_alchemy_conn = postgresql+psycopg2://airflow:Pass@pgbouncer.airflow:6432/airflow
```

### Production Hardening & Gotchas
- **Transaction vs Session Mode**: Always use `pool_mode = transaction` for Airflow with PgBouncer. However, ensure no custom scripts rely on session-level PostgreSQL features (such as `SET search_path` or prepared statements).""",

        "airflow-q-066": """### Conceptual Foundation & Core Architecture
Airflow's default relational metadata DB imposes strict size limits on XCom values:
- **PostgreSQL**: Limited to standard column sizes (typically recommended < 48 KB per record).
- **MySQL**: 64 KB (`BLOB`) or 16 MB (`MEDIUMBLOB`).
- **SQLite**: 2 GB (development only).

Exceeding these limits causes `OperationalError: value too large for column` or database buffer exhaustion.

### Production Workaround:
Implement a **Custom XCom Backend** backed by S3, Azure Blob, or GCS. The worker automatically serializes the data to cloud storage and writes only the storage path pointer to PostgreSQL:
```python
# Task returns a 200MB DataFrame safely
@task
def extract_massive_dataset():
    df = generate_large_dataframe()
    return df  # Automatically serialized to s3://xcom-bucket/uuid.parquet by Custom Backend
```

### Production Hardening & Gotchas
- **Task Serialization Performance**: Writing and reading 500MB objects via S3 XCom between every task introduces network overhead and serialization CPU burn. Pass table partition keys or database URIs between tasks instead of passing full raw datasets through XCom.""",

        "airflow-q-067": """### Conceptual Foundation & Core Architecture
Airflow's **Custom Secret Backends** allow enterprise security teams to store sensitive pipeline credentials in centralized vaults (HashiCorp Vault, AWS Systems Manager Parameter Store, Azure Key Vault) rather than in Airflow's metadata database.

### Low-Level Mechanics & Implementation
Configuring HashiCorp Vault Backend in `airflow.cfg`:
```ini
[secrets]
backend = airflow.providers.hashicorp.secrets.vault.VaultBackend
backend_kwargs = {
    "url": "https://vault.enterprise.internal:8200",
    "auth_type": "approle",
    "role_id": "8f3b20e1-4c12-4211",
    "secret_id": "a9103e22-7f21-4322",
    "mount_point": "airflow",
    "variables_path": "variables",
    "connections_path": "connections",
    "kv_engine_version": 2
}
```

### Production Hardening & Gotchas
- **Vault Token Expiry**: When using AppRole or Token authentication, ensure token renewal daemons run continuously or Vault tokens have sufficient TTL to prevent authentication dropouts during weekend batch jobs.""",

        "airflow-q-068": """### Conceptual Foundation & Core Architecture
Airflow's **Role-Based Access Control (RBAC)** governs permissions across users, roles, DAGs, and UI views. In multi-tenant enterprise platforms, DAG-level access control restricts data engineers to viewing, triggering, and modifying only DAGs belonging to their business domain.

### Low-Level Mechanics & Implementation
Assigning DAG-level access control within DAG definitions:
```python
from airflow import DAG
from datetime import datetime

with DAG(
    "finance_restricted_ledger",
    start_date=datetime(2024, 1, 1),
    schedule="@daily",
    access_control={
        "Finance_Engineers": {"can_read", "can_edit"},
        "Auditors": {"can_read"},
    }
) as dag:
    pass
```

### Production Hardening & Gotchas
- **Admin Privilege Escalation**: Users with permission to create or edit DAG files can execute arbitrary Python code on worker nodes. Restrict DAG repository write access using strict GitHub branch protection and review policies.""",

        "airflow-q-069": """### Conceptual Foundation & Core Architecture
Airflow exposes a dedicated **Health Check Endpoint** (`/health`) on the Webserver to report the real-time operational status of core daemons: the Webserver itself, the Metadata Database, and the Scheduler.

### Low-Level Mechanics & Implementation
```bash
curl -X GET "https://airflow.enterprise.com/health"
```

Sample JSON Response:
```json
{
  "metadatabase": {
    "status": "healthy"
  },
  "scheduler": {
    "status": "healthy",
    "latest_scheduler_heartbeat": "2024-03-20T14:22:15.123456+00:00"
  },
  "triggerer": {
    "status": "healthy",
    "latest_triggerer_heartbeat": "2024-03-20T14:22:14.987654+00:00"
  }
}
```

Kubernetes Liveness Probe Configuration:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 45
  periodSeconds: 15
  timeoutSeconds: 5
  failureThreshold: 3
```

### Production Hardening & Gotchas
- **False Positive Restarts**: If the metadata DB undergoes a brief 5-second failover, strict liveness probes can misidentify the scheduler as dead and trigger an unnecessary container restart cascade. Configure `failureThreshold: 5` and `periodSeconds: 20`.""",

        "airflow-q-070": """### Conceptual Foundation & Core Architecture
The **`DagProcessorManager`** is the subsystem responsible for managing OS child processes that parse Python files in `dags_folder`. In early Airflow versions, it was tightly coupled within the main scheduler loop. In Airflow 2.3+ and 3.0, it can be decoupled into a standalone daemon (`airflow dag-processor`), isolating file parsing completely from task scheduling.

### Architectural Benefits:
1. **Scheduler Protection**: Malicious or buggy DAG code (e.g. infinite loops or memory leaks) cannot crash the primary scheduler daemon.
2. **Independent Scaling**: Scale DAG parsing CPU resources independently from task scheduling resources.
3. **Multi-Tenant Security**: Run DAG processing inside sandboxed containers without direct access to production execution secrets.

### Production Hardening & Gotchas
- **File System Sync**: If running the DagProcessor as an independent pod, ensure the DAGs directory is synchronized concurrently between both the DagProcessor pod and worker pods using shared persistent volumes or Git-sync sidecars.""",

        "airflow-q-071": """### Conceptual Foundation & Core Architecture
The **Executor Heartbeat** (`scheduler.job_heartbeat_sec`) is the periodic pulse that the Scheduler emits to signal to the cluster and metadata DB that it is actively processing jobs. Similarly, distributed workers emit heartbeats to indicate task health.

### Low-Level Mechanics & Implementation
Key settings in `airflow.cfg`:
```ini
[scheduler]
# Seconds between scheduler heartbeats
scheduler_heartbeat_sec = 5

# Seconds before a task instance with missing heartbeat is treated as a zombie
scheduler_zombie_task_threshold = 300

# Number of heartbeat fails before declaring a worker dead
zombie_detection_interval = 10
```

### Production Hardening & Gotchas
- **Tuning for Heavy Clusters**: If set too low (e.g., 1s), database write contention spikes. If set too high (e.g., 60s), recovery of failed or killed workers is delayed by multiple minutes. For clusters with 50+ workers, set `scheduler_heartbeat_sec = 10`.""",

        "airflow-q-072": """### Conceptual Foundation & Core Architecture
**`scheduler_heartbeat_sec`** controls how frequently the Airflow scheduler executes its primary loop: querying the database for ready DAG runs, evaluating task dependencies, and pushing tasks to the executor queue.

### Tuning Analysis:
- **Low Values (1s–5s)**: Minimizes task scheduling latency; ideal for high-throughput, latency-sensitive pipelines with thousands of short tasks. Increases metadata database CPU and lock contention.
- **High Values (15s–30s)**: Significantly reduces database load; ideal for batch ETL environments with daily or hourly tasks. Adds a few seconds of latency between dependent task transitions.

### Production Hardening & Gotchas
- **Database CPU Correlation**: Monitoring the metadata database will show a direct correlation between database CPU usage and `scheduler_heartbeat_sec`. If PostgreSQL CPU is pinned at 90%, increasing `scheduler_heartbeat_sec` from 5 to 15 immediately relieves pressure.""",

        "airflow-q-073": """### Conceptual Foundation & Core Architecture
The transition from **Airflow 1.10 to Airflow 2.x** was a major architectural overhaul that modernized the framework for enterprise cloud-native environments.

### Core Architectural Breaking Changes:
1. **TaskFlow API**: Native `@dag` and `@task` decorators with implicit XCom parameter passing, eliminating boilerplate `PythonOperator` code.
2. **HA Multi-Scheduler**: Decoupled active-active multi-scheduler replacing the legacy single-scheduler SPOF.
3. **Provider Packages**: Decoupled cloud and database integrations (AWS, Azure, Snowflake, Databricks) into standalone versioned packages (`apache-airflow-providers-*`).
4. **SubDAG Deprecation**: Replacement of SubDAGs with lightweight `TaskGroups`.
5. **Fast REST API**: Introduction of official OpenAPI-compliant REST API replacing deprecated experimental endpoints.

### Production Hardening & Gotchas
- **Provider Version Drift**: Provider packages now release independently from core Airflow. Pin provider package versions in `requirements.txt` to prevent breaking changes during routine container builds.""",

        "airflow-q-074": """### Conceptual Foundation & Core Architecture
Migrating an enterprise deployment from Airflow 1.10 to 2.x requires a disciplined, phased migration strategy to prevent pipeline outages and data corruption.

### Phased Migration Blueprint:
1. **Upgrade to Airflow 1.10.15**: The bridge release featuring the upgrade check script.
2. **Run Upgrade Check**: Execute `airflow upgrade_check` to identify deprecated operators, legacy import paths, and incompatible configurations.
3. **Refactor Import Paths**: Update legacy imports:
   - Change `from airflow.operators.bash_operator import BashOperator` to `from airflow.operators.bash import BashOperator`.
   - Migrate hooks to `airflow.providers.*`.
4. **Database Schema Upgrade**: Run `airflow db upgrade` on a replicated staging database to test schema migrations before production.
5. **Deploy Multi-Scheduler**: Update infrastructure configs to enable HA schedulers and Celery/K8s executors.

### Production Hardening & Gotchas
- **Fernet Key Preservation**: Ensure the `fernet_key` from the 1.10 cluster is copied identically to the 2.x cluster; otherwise, all stored connection passwords will fail decryption.""",

        "airflow-q-075": """### Conceptual Foundation & Core Architecture
Debugging **hung or stuck tasks** in production requires systematic analysis across the Airflow Scheduler, Executor, Worker nodes, and external infrastructure.

### Root Cause Analysis & Diagnostic Playbook:
1. **Task Stuck in `queued`**:
   - *Cause*: Worker pool exhaustion, `core.parallelism` limit reached, or Celery broker network disconnection.
   - *Remediation*: Check `airflow pools list` and verify Celery workers are active: `airflow celery inspect active`.
2. **Task Stuck in `running` without Log Output**:
   - *Cause*: Subprocess deadlocked (e.g. database client waiting on a socket read without timeout), or worker container killed by Linux OOM killer without notifying the scheduler.
   - *Remediation*: Check host kernel logs (`dmesg -T | grep -i oom`) for OOM kills.
3. **Zombie Task Detection**:
   - *Cause*: Worker node failed to emit a heartbeat within `scheduler_zombie_task_threshold`.
   - *Remediation*: Tune `scheduler_zombie_task_threshold` to 600s for memory-intensive workloads, and investigate worker VM CPU saturation.
4. **Sensor Deadlock**:
   - *Cause*: Multiple `mode="poke"` sensors occupying all available worker slots.
   - *Remediation*: Switch all sensors to `mode="reschedule"` or Deferrable Operators immediately.

### Production Hardening & Gotchas
- **Enforce Timeouts**: Always define `execution_timeout=timedelta(hours=2)` on all tasks in `default_args` to ensure no hung task can block worker slots indefinitely.""",
    }
