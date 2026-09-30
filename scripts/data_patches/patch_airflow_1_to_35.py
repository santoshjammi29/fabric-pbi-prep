# scripts/data_patches/patch_airflow_1_to_35.py
"""
Bespoke, expert answers for Airflow questions 001 to 035.
All answers follow the Phase structure with code snippets, configuration, and production gotchas.
"""

def get_airflow_1_to_35():
    return {
        "airflow-q-001": """### Conceptual Foundation & Core Architecture
A **Directed Acyclic Graph (DAG)** is Apache Airflow's core abstraction representing a collection of tasks with directional relationships and no circular dependencies. A DAG defines *how*, *when*, and *in what order* tasks should run, but does not perform data computation directly within the scheduler process.

### Low-Level Mechanics & Implementation
In modern Airflow (2.x+), the **TaskFlow API** provides a clean, Pythonic syntax using the `@dag` and `@task` decorators, automatically handling task instantiation, dependency binding (`>>`), and implicit XCom parameter passing:

```python
from airflow.decorators import dag, task
from datetime import datetime, timedelta

@dag(
    dag_id="enterprise_orders_ingestion",
    schedule="0 2 * * *",  # Daily at 02:00 UTC
    start_date=datetime(2024, 1, 1),
    catchup=False,
    max_active_runs=1,
    default_args={
        "owner": "data-platform",
        "retries": 3,
        "retry_delay": timedelta(minutes=5),
    },
    tags=["bronze", "orders", "posix"]
)
def orders_pipeline():
    @task
    def extract_raw_orders() -> str:
        # Ingest raw payload and push staging path to XCom
        return "s3://bronze-landing/orders/2024-01-01.parquet"

    @task
    def validate_schema(file_path: str) -> bool:
        # Validate schema contract against Delta manifest
        return True

    @task
    def load_to_delta(is_valid: bool, file_path: str):
        if is_valid:
            print(f"Committing {file_path} into Lakehouse Bronze layer.")

    raw_path = extract_raw_orders()
    valid = validate_schema(raw_path)
    load_to_delta(valid, raw_path)

pipeline = orders_pipeline()
```

### Production Hardening & Gotchas
- **Top-Level Code Execution**: Airflow's `DagFileProcessor` executes top-level module code every `min_file_process_interval` (default 30s). Never place database connections, API calls, or heavy computations outside operator execution methods or `@task` bodies.
- **Dynamic Start Dates**: Never use `start_date=datetime.now()`. Dynamic start dates cause non-deterministic interval calculations, preventing the scheduler from creating consistent `DagRun` records.""",

        "airflow-q-002": """### Conceptual Foundation & Core Architecture
**Operators** define the template for a single unit of work in a DAG. While a DAG manages orchestration topology, operators encapsulate execution logic. When an operator is instantiated within a DAG, it becomes a **Task**, and when executed in a specific DagRun, it generates a **TaskInstance**.

Airflow classifies operators into three architectural tiers:
1. **Action Operators**: Execute computations or commands (e.g., `BashOperator`, `PythonOperator`, `SparkSubmitOperator`).
2. **Transfer Operators**: Move data across systems (e.g., `S3ToRedshiftOperator`, `GCSToBigQueryOperator`).
3. **Sensor Operators**: Block or poll until a specific upstream condition or external SLA is satisfied.

### Low-Level Mechanics & Implementation
```python
from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator
from datetime import datetime

with DAG("spark_batch_processing", start_date=datetime(2024, 1, 1), schedule=None) as dag:
    pre_flight_check = BashOperator(
        task_id="check_storage_mount",
        bash_command="ls -la /mnt/onelake/bronze || exit 1",
    )

    spark_transform = SparkSubmitOperator(
        task_id="submit_spark_delta_compaction",
        application="/opt/spark_jobs/compaction.py",
        conn_id="spark_k8s_cluster",
        conf={"spark.executor.memory": "8g", "spark.executor.cores": "4"},
        verbose=True,
    )

    pre_flight_check >> spark_transform
```

### Production Hardening & Gotchas
- **Orchestration vs. Computation**: Operators should trigger external compute engines (Databricks, Fabric Spark, Kubernetes pods, Snowflake) rather than processing gigabytes of data inside the Airflow worker container.
- **Idempotency Requirement**: Every operator must be safely re-runnable with identical execution dates without generating duplicate records or corrupted storage states.""",

        "airflow-q-003": """### Conceptual Foundation & Core Architecture
Scheduling in Airflow is driven by deterministic **data intervals**. Unlike traditional cron jobs that trigger at the *start* of an interval, Airflow's historical model triggers a DAG run at the **end of its data interval** (`logical_date` or `execution_date`). This ensures all transactional data for the period has concluded before transformation commences.

Airflow 2.2+ formalized this via `data_interval_start` and `data_interval_end`, while Airflow 2.4+ introduced **Custom Timetables** and **Dataset-driven scheduling**.

### Low-Level Mechanics & Implementation
```python
from airflow.decorators import dag, task
from datetime import datetime
import pendulum

# Cron schedule: Every business day (Mon-Fri) at 03:00 UTC
@dag(
    dag_id="daily_business_reconciliation",
    schedule="0 3 * * 1-5",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    catchup=False
)
def financial_reconciliation():
    @task
    def process_interval(**context):
        interval_start = context["data_interval_start"]
        interval_end = context["data_interval_end"]
        print(f"Querying ledger records between {interval_start} and {interval_end}")

    process_interval()

recon_dag = financial_reconciliation()
```

### Production Hardening & Gotchas
- **Timezone Drift**: Always anchor DAGs with explicit timezone-aware Pendulum datetime objects (`pendulum.timezone("UTC")`). Mixing naive Python `datetime.now()` leads to DST scheduling anomalies.
- **Scheduler Laggard**: If the `scheduler_heartbeat_sec` exceeds 30s or DAG parsing is saturated, schedule latency spikes, causing delayed DagRun creation.""",

        "airflow-q-004": """### Conceptual Foundation & Core Architecture
**XCom (Cross-Communication)** is Airflow's mechanism for exchanging small pieces of metadata, state, or parameters between tasks within the same DAG run. XCom records are stored by default as serialized JSON/Pickle blobs in the `xcom` table of Airflow's transactional metadata database.

### Low-Level Mechanics & Implementation
Under the TaskFlow API, returning a value from a `@task` decorated function automatically pushes it to XCom (`key="return_value"`), and accepting it as an argument automatically pulls it:

```python
from airflow.decorators import dag, task
from datetime import datetime

@dag(dag_id="xcom_metadata_pipeline", start_date=datetime(2024, 1, 1), schedule=None)
def pipeline():
    @task
    def extract_file_stats() -> dict:
        # Pushing lightweight metadata
        return {"row_count": 1450200, "checksum": "a8f94d2e", "partition": "2024-03"}

    @task
    def audit_quality(stats: dict):
        # Implicitly pulls return_value from extract_file_stats
        if stats["row_count"] < 1000:
            raise ValueError("Row count below SLA threshold!")
        print(f"Validated partition {stats['partition']} with {stats['row_count']} rows.")

    audit_quality(extract_file_stats())

flow = pipeline()
```

### Production Hardening & Gotchas
- **Metadata Database Bloat**: By default, PostgreSQL/MySQL restricts XCom to small payloads (typically < 1GB overall DB storage, recommended < 48KB per task). Storing large Pandas DataFrames or JSON payloads exhausts database buffer memory and crashes the scheduler.
- **Custom XCom Backends**: For large payload exchange, configure a **Custom XCom Backend** backed by S3, ADLS Gen2, or GCS. The metadata DB then stores only an object URI pointer while binary data is offloaded to cloud storage.""",

        "airflow-q-005": """### Conceptual Foundation & Core Architecture
**Airflow Connections** store authentication credentials, host endpoints, ports, and configuration parameters for external systems (e.g., Snowflake, AWS, Azure, Postgres, Databricks). Connections abstract credentials out of pipeline source code, enabling secure rotation and multi-environment portability.

### Low-Level Mechanics & Implementation
Airflow resolves connections through a hierarchical lookup order:
1. **Secrets Backends** (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault).
2. **Environment Variables** (`AIRFLOW_CONN_{CONN_ID}`).
3. **Airflow Metadata Database** (`connection` table).

```bash
# Provisioning a connection via environment variable (Zero Metadata DB Lookup)
export AIRFLOW_CONN_SNOWFLAKE_PROD='snowflake://svc_airflow:EncryptedPass123@xy12345.us-east-1.aws/PROD_DWH?account=xy12345&warehouse=COMPUTE_WH&database=ANALYTICS&schema=CORE'
```

Using the connection inside an operator or custom hook:
```python
from airflow.providers.snowflake.hooks.snowflake import SnowflakeHook

def extract_ledger():
    hook = SnowflakeHook(snowflake_conn_id="SNOWFLAKE_PROD")
    df = hook.get_pandas_df("SELECT * FROM CORE.dim_customer WHERE is_active = true")
    return df.shape[0]
```

### Production Hardening & Gotchas
- **Credential Leaks**: Never hardcode connection secrets in DAG definitions or commit them to git repositories.
- **Performance Overhead**: Querying the database `connection` table during high task concurrency creates DB connection bottlenecks. Use environment variables or local caching secret backends.""",

        "airflow-q-006": """### Conceptual Foundation & Core Architecture
**Airflow Variables** are centralized key-value pairs stored in the metadata database used to configure runtime parameters, global threshold constants, and pipeline flags without altering DAG code.

### Low-Level Mechanics & Implementation
Variables can be accessed via Python code or dynamically resolved inside Jinja templates during task rendering:

```python
from airflow.models import Variable
from airflow.decorators import dag, task
from datetime import datetime

@dag(dag_id="variable_governance", start_date=datetime(2024, 1, 1), schedule=None)
def pipeline():
    @task
    def read_runtime_config():
        # Best Practice: Retrieve within task execution, NOT top-level DAG script
        batch_size = Variable.get("INGESTION_BATCH_SIZE", default_var=5000, deserialize_json=False)
        feature_flags = Variable.get("DATA_QUALITY_FLAGS", deserialize_json=True, default_var={"strict": True})
        print(f"Running with batch size: {batch_size}, strict: {feature_flags['strict']}")

    read_runtime_config()

flow = pipeline()
```

### Production Hardening & Gotchas
- **Top-Level Variable.get() Anti-Pattern**: Calling `Variable.get()` at the top level of a DAG file forces a SQL query to the metadata DB every time the scheduler parses the file (every 30s per file). With 100 DAGs, this triggers hundreds of database queries per minute, degrading scheduler throughput.
- **Jinja Resolution**: Use Jinja templates `{{ var.value.INGESTION_BATCH_SIZE }}` or `{{ var.json.DATA_QUALITY_FLAGS.strict }}` inside operator parameters to defer resolution to execution time.""",

        "airflow-q-007": """### Conceptual Foundation & Core Architecture
Airflow tracks the state of both **DagRuns** and **TaskInstances** via an internal finite state machine (FSM). Understanding task state transitions is critical for debugging scheduling stalls, execution retries, and pipeline SLAs.

Core Task States:
- `none`: Task has been created in DB but has not been queued.
- `scheduled`: Dependencies evaluated as met by Scheduler; awaiting queue slot.
- `queued`: Dispatched to Executor queue awaiting available worker slot.
- `running`: Actively executing on worker node.
- `success`: Execution completed with exit code 0.
- `failed`: Task threw an unhandled exception or non-zero exit code.
- `up_for_retry`: Task failed but has remaining retry attempts.
- `up_for_reschedule`: Sensor released worker slot and is waiting for next poke interval.
- `skipped`: Branching or ShortCircuit bypassed task execution.
- `upstream_failed`: Upstream dependency failed, halting downstream execution under default trigger rules.

### Production Hardening & Gotchas
- **Stuck in Queued**: Tasks staying in `queued` indicate worker pool saturation, network partition between scheduler and Redis/RabbitMQ/K8s API, or incorrect `AIRFLOW__CORE__PARALLELISM` settings.
- **Ghost/Zombie Tasks**: If a worker node crashes (e.g. OOM killer), the task remains in `running` until the scheduler's `scheduler_zombie_task_threshold` detects a missing heartbeat and transitions it to `failed` or `up_for_retry`.""",

        "airflow-q-008": """### Conceptual Foundation & Core Architecture
Task retries provide automated resilience against transient failures such as network timeouts, database lock contention, and remote API rate limits. Airflow allows configuring retry counts, retry delays, and exponential backoff curves.

### Low-Level Mechanics & Implementation
```python
from airflow.decorators import dag, task
from datetime import datetime, timedelta

@dag(
    dag_id="resilient_etl",
    start_date=datetime(2024, 1, 1),
    schedule="@hourly",
    default_args={
        "retries": 4,
        "retry_delay": timedelta(seconds=30),
        "retry_exponential_backoff": True,
        "max_retry_delay": timedelta(minutes=15),
    }
)
def pipeline():
    @task
    def call_flaky_rest_api():
        import requests
        response = requests.get("https://api.partner.com/v1/feed", timeout=10)
        response.raise_for_status()
        return response.json()

    call_flaky_rest_api()

flow = pipeline()
```

### Production Hardening & Gotchas
- **Non-Idempotent Retries**: If a task inserts records into a database without unique key constraints or upsert semantics, retries will cause duplicate records. Ensure tasks clean up partial outputs before writing.
- **Infinite Retry Cascades**: Never set unlimited retries on unrecoverable logic bugs (e.g., `KeyError` or schema mismatch). Use alert callbacks on failure to notify engineers.""",

        "airflow-q-009": """### Conceptual Foundation & Core Architecture
A **DagRun** represents a single instantiation of a DAG in time. DagRuns are instantiated via three distinct triggers:
1. **Scheduled Runs**: Created automatically by the scheduler based on the DAG's schedule cron or timetable.
2. **Manual / API Triggers**: Initiated by users via Airflow Web UI, CLI (`airflow dags trigger`), or REST API.
3. **Dataset / Event Triggers**: Created reactively when an upstream DAG updates a monitored `Dataset` URI.

### Low-Level Mechanics & Implementation
Manual triggers can pass arbitrary runtime JSON configuration parameters (`dag_run.conf`):

```python
from airflow.decorators import dag, task
from datetime import datetime

@dag(dag_id="parametrized_manual_trigger", start_date=datetime(2024, 1, 1), schedule=None)
def pipeline():
    @task
    def process_target_partition(**context):
        # Access trigger-time runtime configuration
        dag_run = context["dag_run"]
        target_env = dag_run.conf.get("environment", "development")
        backfill_date = dag_run.conf.get("target_date", context["ds"])
        print(f"Executing manual run for {target_env} on date {backfill_date}")

    process_target_partition()

flow = pipeline()
```

### Production Hardening & Gotchas
- **Execution Overlap**: Protect long-running DAGs against concurrent overlapping runs by configuring `max_active_runs=1`.
- **Conf Validation**: When accepting `dag_run.conf` via REST API, always sanitize and validate inputs using Pydantic models to prevent command injection in downstream bash/SQL operators.""",

        "airflow-q-010": """### Conceptual Foundation & Core Architecture
**Catchup** controls whether the Airflow scheduler automatically creates DagRuns for all historical intervals between the DAG's `start_date` and the current date when a DAG is turned on.

### Low-Level Mechanics & Implementation
- When `catchup=True`: If a DAG with `start_date=2023-01-01` and `@daily` schedule is unpaused today, the scheduler will instantly generate and schedule 365+ DagRuns simultaneously.
- When `catchup=False`: The scheduler creates only a single DagRun for the most recently completed data interval, ignoring all historical periods.

```python
from airflow.decorators import dag, task
from datetime import datetime

@dag(
    dag_id="safe_production_pipeline",
    start_date=datetime(2024, 1, 1),
    schedule="@daily",
    catchup=False  # Mandatory for real-time/incremental operational DAGs
)
def pipeline():
    @task
    def process_daily_batch():
        pass
    process_daily_batch()

flow = pipeline()
```

### Production Hardening & Gotchas
- **Database/Cluster Overload**: Setting `catchup=True` on a DAG with an old `start_date` without setting `max_active_runs=1` causes an avalanche of hundreds of concurrent tasks, saturating executor queues, exhausting database connection pools, and triggering rate-limit bans on upstream APIs.
- **Global Disable**: In `airflow.cfg`, set `catchup_by_default = False` across all enterprise production clusters.""",

        "airflow-q-011": """### Conceptual Foundation & Core Architecture
The **Airflow Backfill CLI command** (`airflow dags backfill`) manually executes historical DAG runs over a specified date range, regardless of whether `catchup` is disabled on the DAG.

### Low-Level Mechanics & Implementation
Backfills should be executed via the CLI or automated CI/CD runners with strict concurrency controls:

```bash
# Execute backfill for Q1 2024 with isolated concurrency
airflow dags backfill \\
    --start-date 2024-01-01 \\
    --end-date 2024-03-31 \\
    --reset-dagruns \\
    --max-active-runs 2 \\
    --rerun-failed-tasks \\
    enterprise_financial_ledger
```

Flags Explained:
- `--start-date` / `--end-date`: Defines the inclusive historical interval window.
- `--reset-dagruns`: Clears any existing DagRuns within the window before executing.
- `--max-active-runs 2`: Restricts the backfill engine to executing at most 2 historical runs concurrently to preserve warehouse compute.

### Production Hardening & Gotchas
- **Downstream Saturation**: Running an unthrottled backfill across 3 years of daily data (1,000+ runs) can crush operational relational databases or exhaust Snowflake warehouse credits within minutes.
- **Deadlock with Active Scheduler**: If running backfills alongside an active scheduler daemon, ensure the DAG has deterministic idempotent writes (partition overwrites) to prevent race conditions.""",

        "airflow-q-012": """### Conceptual Foundation & Core Architecture
In Apache Airflow, **`default_args`** is a Python dictionary of operator parameters that are automatically propagated to all tasks defined within a DAG. This eliminates boilerplate and guarantees uniform governance over operational behaviors like retries, execution timeouts, and alerting.

### Low-Level Mechanics & Implementation
```python
from airflow import DAG
from datetime import datetime, timedelta

default_args = {
    "owner": "data_engineering_core",
    "depends_on_past": False,
    "email": ["data-alerts@enterprise.com"],
    "email_on_failure": True,
    "email_on_retry": False,
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
    "retry_exponential_backoff": True,
    "execution_timeout": timedelta(hours=2),
}

with DAG(
    dag_id="governed_enterprise_pipeline",
    default_args=default_args,
    start_date=datetime(2024, 1, 1),
    schedule="@daily"
) as dag:
    # All tasks inherit retries=3, execution_timeout=2h automatically
    pass
```

### Production Hardening & Gotchas
- **Task-Level Precedence**: Individual task parameters override `default_args`. If a specific task specifies `retries=0`, it takes precedence over `default_args["retries"] = 3`.
- **Mutable Object Hazards**: Do not pass mutable objects (like lists or dicts) directly without ensuring they are not modified across tasks.""",

        "airflow-q-013": """### Conceptual Foundation & Core Architecture
Airflow leverages **Jinja templating** to dynamically inject runtime context parameters (such as execution dates, DAG run IDs, parameters, and macros) into operator arguments at runtime without modifying DAG code.

### Low-Level Mechanics & Implementation
Operators declare which fields are templated via the `template_fields` class attribute:

```python
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from datetime import datetime

run_gold_aggregation = SQLExecuteQueryOperator(
    task_id="aggregate_monthly_revenue",
    conn_id="snowflake_prod",
    sql=\"\"\"
        MERGE INTO gold.monthly_revenue AS target
        USING (
            SELECT 
                tenant_id,
                SUM(amount) AS total_revenue,
                '{{ data_interval_start.strftime("%Y-%m-%d") }}' AS reporting_month
            FROM silver.transactions
            WHERE event_timestamp >= '{{ data_interval_start }}'
              AND event_timestamp < '{{ data_interval_end }}'
            GROUP BY tenant_id
        ) AS source
        ON target.tenant_id = source.tenant_id 
       AND target.reporting_month = source.reporting_month
        WHEN MATCHED THEN UPDATE SET total_revenue = source.total_revenue
        WHEN NOT MATCHED THEN INSERT (tenant_id, total_revenue, reporting_month)
        VALUES (source.tenant_id, source.total_revenue, source.reporting_month);
    \"\"\",
)
```

Core Built-in Template Variables:
- `{{ ds }}`: Data interval start date formatted as `YYYY-MM-DD`.
- `{{ data_interval_start }}` / `{{ data_interval_end }}`: Timezone-aware Pendulum datetime representations.
- `{{ dag_run.conf }}`: Dictionary passed during manual or REST API triggers.

### Production Hardening & Gotchas
- **Only Specified Fields Render**: Passing Jinja expressions into an attribute not listed in an operator's `template_fields` will cause the operator to treat the Jinja string literally.
- **Top-Level Jinja Resolution**: Jinja is rendered by the worker at runtime, NOT by the scheduler when parsing the Python file.""",

        "airflow-q-014": """### Conceptual Foundation & Core Architecture
Airflow supports automated alerting through built-in email notifications on task failure, retry, or SLA misses. In production, email alerting is typically coupled with modern incident response tools (PagerDuty, Slack, OpsGenie) via custom callback functions.

### Low-Level Mechanics & Implementation
Configure SMTP parameters in `airflow.cfg` or environment variables:
```ini
[smtp]
smtp_host = smtp.sendgrid.net
smtp_starttls = True
smtp_ssl = False
smtp_user = apikey
smtp_password = SG.your_sendgrid_token
smtp_port = 587
smtp_mail_from = airflow-alerts@enterprise.com
```

Using DAG-level callbacks for multi-channel incident dispatch:
```python
from airflow.decorators import dag, task
from datetime import datetime

def notify_pagerduty_on_failure(context):
    task_instance = context["task_instance"]
    error_msg = f"CRITICAL: Task {task_instance.task_id} failed in DAG {task_instance.dag_id}. Log URL: {task_instance.log_url}"
    print(f"Triggering incident dispatch: {error_msg}")

@dag(
    dag_id="critical_sla_pipeline",
    start_date=datetime(2024, 1, 1),
    schedule="@hourly",
    default_args={"on_failure_callback": notify_pagerduty_on_failure}
)
def pipeline():
    pass
```

### Production Hardening & Gotchas
- **Alert Fatigue**: Avoid setting `email_on_retry=True` on flaky networks; it generates hundreds of noisy emails. Alert only when all retries are exhausted (`on_failure_callback`).
- **Callback Exceptions**: If your custom callback function throws an unhandled exception, it can prevent proper state finalization in the scheduler loop. Wrap all callback payloads in robust `try...except` blocks.""",

        "airflow-q-015": """### Conceptual Foundation & Core Architecture
A **Service Level Agreement (SLA)** in Airflow defines the maximum allowable elapsed time between a DAG's scheduled execution interval (`logical_date`) and the completion of a specific task. If a task exceeds this duration, Airflow marks it as an **SLA Miss** and invokes `sla_miss_callback`.

### Low-Level Mechanics & Implementation
```python
from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime, timedelta

def custom_sla_alert(dag, task_list, blocking_task_list, slas, blocking_tis):
    print(f"SLA BREACH ALERT! Dag: {dag.dag_id}, Impacted Tasks: {task_list}")

default_args = {
    "sla": timedelta(hours=3),  # Must complete within 3 hours of interval start
}

with DAG(
    "sla_governed_finance_dag",
    default_args=default_args,
    start_date=datetime(2024, 1, 1),
    schedule="0 6 * * *",
    sla_miss_callback=custom_sla_alert
) as dag:
    heavy_lakehouse_merge = BashOperator(
        task_id="heavy_merge",
        bash_command="python /scripts/run_merge.py",
        sla=timedelta(minutes=45) # Overrides default SLA to 45 mins
    )
```

### Production Hardening & Gotchas
- **SLA Calculation Reference Point**: Airflow calculates SLAs relative to the DAG run's **scheduled execution date**, NOT the moment the task actually started running. If upstream tasks queue for 2 hours, the downstream task may immediately trigger an SLA miss upon starting.
- **Manual Runs Ignore SLAs**: Airflow's SLA evaluation daemon evaluates only scheduled runs; manual or API-triggered runs do not evaluate SLA thresholds.""",

        "airflow-q-016": """### Conceptual Foundation & Core Architecture
Sensors in Airflow are specialized operators that poll external systems until a condition is met. The choice between **`mode="poke"`** and **`mode="reschedule"`** directly determines worker resource utilization and cluster scalability.

### Low-Level Mechanics & Implementation
```python
from airflow.sensors.filesystem import FileSensor
from datetime import datetime, timedelta

# Sensor utilizing reschedule mode to free worker slot
wait_for_upstream_manifest = FileSensor(
    task_id="wait_for_manifest",
    filepath="/mnt/landing/ready.flag",
    poke_interval=120,       # Poll every 2 minutes
    timeout=60 * 60 * 6,     # Timeout after 6 hours
    mode="reschedule",       # CRITICAL: Releases worker slot between pokes
    dag=dag
)
```

### Comparative Trade-off Analysis:
| Feature | `mode="poke"` | `mode="reschedule"` |
|---|---|---|
| **Worker Slot Hold** | Holds worker slot continuously while sleeping | **Releases worker slot**; exits process and re-queues |
| **Ideal Wait Time** | Very short intervals (< 2 minutes) | Long intervals (> 5 minutes, hours) |
| **Scheduler Overhead** | Minimal DB state changes | Creates new TaskInstance states on each reschedule |
| **Deadlock Risk** | **High**: Can monopolize all worker slots (Sensor Deadlock) | **Zero**: Other tasks can execute between pokes |

### Production Hardening & Gotchas
- **Sensor Deadlock**: If you have 16 worker slots and 16 poke-mode sensors waiting for files, the entire cluster deadlocks because no other tasks can run. Always default long-running sensors to `mode="reschedule"` or migrate to **Deferrable Operators**.""",

        "airflow-q-017": """### Conceptual Foundation & Core Architecture
A **TaskInstance** goes through a lifecycle managed by the Airflow Scheduler, Executor, and Worker:
1. **DAG Parsing**: The `DagFileProcessor` detects changes and serializes the DAG into the `serialized_dag` table.
2. **Scheduling Loop**: The Scheduler checks task dependencies, pool slots, and concurrency limits. When cleared, state moves from `none` to `scheduled`.
3. **Queueing**: The Scheduler passes the task to the Executor; state changes to `queued`.
4. **Worker Dispatch**: The Executor assigns the task to a worker node (e.g. Celery worker or K8s pod); state changes to `running`.
5. **Execution**: The task executes business logic and emits heartbeats.
6. **State Finalization**: Upon completion, the task reports `success` or `failed`. If retryable, state changes to `up_for_retry`.

### Production Hardening & Gotchas
- **Heartbeat Timeouts**: If a worker node suffers intense CPU or memory pressure, it may fail to send its heartbeat within `scheduler_zombie_task_threshold` (default 300s). The scheduler then treats the task as a "zombie" and kills it.
- **Worker Slot Saturation**: Tasks queuing indefinitely indicate that total running tasks have hit `core.parallelism` or specific pool limits.""",

        "airflow-q-018": """### Conceptual Foundation & Core Architecture
An **Executor** is the mechanism by which Airflow runs task instances. Airflow supports multiple executor architectures tailored to different infrastructure footprints:
1. **SequentialExecutor**: Runs tasks sequentially on a single thread using SQLite. For local development only.
2. **LocalExecutor**: Runs tasks in parallel on a single machine utilizing Python multiprocessing against Postgres/MySQL.
3. **CeleryExecutor**: Distributed execution across a cluster of dedicated worker nodes managed via Celery and RabbitMQ/Redis.
4. **KubernetesExecutor**: Launches a dedicated, isolated Kubernetes pod dynamically for every single task instance.
5. **CeleryKubernetesExecutor**: Hybrid model routing lightweight tasks to Celery workers and heavy isolated workloads to Kubernetes pods.

### Comparative Selection Matrix:
| Architecture Metric | LocalExecutor | CeleryExecutor | KubernetesExecutor |
|---|---|---|---|
| **Scalability** | Single VM vertical scaling | High (Scale Celery worker VMs) | **Infinite elastic cloud scaling** |
| **Task Isolation** | Shared process space | Shared worker VM memory | **Full container isolation per task** |
| **Startup Latency** | Near instantaneous | Fast (< 1s) | Pod launch overhead (5–20s) |
| **Maintenance** | Zero operational overhead | Requires Redis/RabbitMQ queue management | Requires Kubernetes cluster management |

### Production Hardening & Gotchas
- **KubernetesExecutor Cold Starts**: High pod creation latency can slow down pipelines with thousands of tiny 5-second tasks. Use Local/Celery for high-frequency micro-tasks and K8s for heavy compute.""",

        "airflow-q-019": """### Conceptual Foundation & Core Architecture
The Airflow Web UI is the operational command center for inspecting DAG execution, diagnosing pipeline bottlenecks, and auditing state history.

Key UI Views:
- **Grid View (formerly Tree View)**: Visualizes historical DagRuns across time as a matrix of task status squares. Provides access to logs, XCom outputs, and task duration metrics.
- **Graph View**: Renders the active DAG topology, dependency layout, and real-time execution states.
- **Gantt Chart**: Displays task execution start, end, and wait times chronologically, making it easy to identify critical path bottlenecks.
- **Task Duration Graph**: Tracks historical execution times across runs to diagnose performance regressions and data skew.

### Production Hardening & Gotchas
- **UI Webserver Load**: In high-scale deployments (10,000+ DAGs), rendering large Graph or Grid views puts heavy query pressure on the metadata DB. Optimize by enabling `dag_processor_manager` isolation and tuning `webserver.workers`.""",

        "airflow-q-020": """### Conceptual Foundation & Core Architecture
Airflow's **LogViewer** displays real-time and historical task logs directly in the Web UI. In distributed environments (CeleryExecutor, KubernetesExecutor), tasks run across disparate physical nodes, requiring a centralized log architecture.

### Low-Level Mechanics & Implementation
Modern Airflow clusters route logs to remote cloud object storage (S3, ADLS Gen2, GCS) for durable persistence:

```ini
# airflow.cfg configuration for remote log shipping
[logging]
remote_logging = True
remote_base_log_folder = s3://enterprise-airflow-logs-prod/cluster-01
remote_log_conn_id = aws_s3_logs_conn
encrypt_s3_logs = True
```

When a user opens task logs in the UI:
1. If the task is actively `running`, the UI queries the worker's internal HTTP Log Server (port 8793) to stream real-time logs.
2. Once the task reaches a terminal state (`success`/`failed`), the worker flushes the log file to remote S3/ADLS storage, and the UI reads directly from cloud storage.

### Production Hardening & Gotchas
- **Missing Logs on Spot Instances**: If worker nodes run on cloud Spot/Preemptible instances and get terminated before flushing logs to S3, active logs can be permanently lost. Configure task log streaming sidecars or daemon fluentbit log collectors.""",

        "airflow-q-021": """### Conceptual Foundation & Core Architecture
Airflow uses bitwise shift operators (`>>` and `<<`) or explicit helper methods (`set_downstream()`, `set_upstream()`, `cross_downstream()`) to define execution dependencies between tasks.

### Low-Level Mechanics & Implementation
```python
from airflow import DAG
from airflow.operators.empty import EmptyOperator
from airflow.models.baseoperator import cross_downstream, chain
from datetime import datetime

with DAG("dependency_patterns", start_date=datetime(2024, 1, 1), schedule=None) as dag:
    start = EmptyOperator(task_id="start")
    end = EmptyOperator(task_id="end")

    # Linear Dependency
    t1 = EmptyOperator(task_id="extract_crm")
    t2 = EmptyOperator(task_id="clean_crm")
    start >> t1 >> t2

    # Fan-Out / Fan-In Dependency
    validators = [EmptyOperator(task_id=f"val_{i}") for i in range(3)]
    t2 >> validators >> end

    # Cross Downstream Matrix (All upstream link to all downstream)
    extractors = [EmptyOperator(task_id=f"ext_{i}") for i in range(2)]
    transformers = [EmptyOperator(task_id=f"trans_{j}") for j in range(2)]
    cross_downstream(extractors, transformers)
```

### Production Hardening & Gotchas
- **Dynamic Loops & Cycle Bugs**: Generating dependencies in complex nested loops can introduce unintentional cycles. Airflow's DAG compiler validates acyclicity via depth-first search (DFS) and raises `AirflowDagCycleException` if a cycle is detected.""",

        "airflow-q-022": """### Conceptual Foundation & Core Architecture
The **`BranchPythonOperator`** (or `@task.branch` in TaskFlow API) allows conditional execution paths in a DAG. It executes Python code that returns the `task_id` (or list of `task_ids`) of the downstream task(s) to follow. All non-selected downstream branches are automatically marked as `skipped`.

### Low-Level Mechanics & Implementation
```python
from airflow.decorators import dag, task
from datetime import datetime

@dag(dag_id="dynamic_branching_pipeline", start_date=datetime(2024, 1, 1), schedule="@daily")
def pipeline():
    @task
    def evaluate_file_volume() -> int:
        return 5000000  # 5 Million records

    @task.branch
    def choose_execution_engine(record_count: int) -> str:
        if record_count > 1000000:
            return "heavy_spark_cluster_job"
        return "lightweight_duckdb_job"

    @task
    def heavy_spark_cluster_job():
        print("Launching Databricks Photon cluster for heavy ETL.")

    @task
    def lightweight_duckdb_job():
        print("Processing in-memory with DuckDB.")

    @task(trigger_rule="none_failed_min_one_success")
    def consolidate_results():
        print("Consolidation step after conditional branch.")

    vol = evaluate_file_volume()
    branch = choose_execution_engine(vol)
    spark_path = heavy_spark_cluster_job()
    duckdb_path = lightweight_duckdb_job()
    finalize = consolidate_results()

    branch >> [spark_path, duckdb_path] >> finalize

flow = pipeline()
```

### Production Hardening & Gotchas
- **Downstream Trigger Rules**: By default, downstream tasks use `trigger_rule="all_success"`. If one branch was skipped, a downstream joining task with `all_success` will also be skipped! You must configure `trigger_rule="none_failed_min_one_success"` on downstream consolidation tasks.""",

        "airflow-q-023": """### Conceptual Foundation & Core Architecture
The **`EmptyOperator`** (formerly `DummyOperator`) performs no physical computation. It serves as an architectural anchor for structuring complex DAG graphs, establishing synchronization barriers (fan-in/fan-out checkpoints), and improving readability in the UI.

### Low-Level Mechanics & Implementation
```python
from airflow import DAG
from airflow.operators.empty import EmptyOperator
from datetime import datetime

with DAG("fan_in_fan_out_architecture", start_date=datetime(2024, 1, 1), schedule=None) as dag:
    start_barrier = EmptyOperator(task_id="start_pipeline")
    join_barrier = EmptyOperator(task_id="all_sources_ingested")
    final_barrier = EmptyOperator(task_id="pipeline_complete")

    sources = [EmptyOperator(task_id=f"ingest_source_{i}") for i in range(5)]
    marts = [EmptyOperator(task_id=f"build_mart_{j}") for j in range(3)]

    start_barrier >> sources >> join_barrier >> marts >> final_barrier
```

### Production Hardening & Gotchas
- **Zero Overhead**: `EmptyOperator` instances are executed in-memory by the scheduler and complete in milliseconds without consuming worker compute slots.
- **Clarity in Complex Graphs**: Use empty operators to funnel multiple parallel branches into a single logical junction before proceeding to heavy transformations.""",

        "airflow-q-024": """### Conceptual Foundation & Core Architecture
The **`ShortCircuitOperator`** evaluates a condition and, if `False`, skips all downstream tasks in the DAG run. Unlike `BranchPythonOperator` which chooses between paths A and B, `ShortCircuitOperator` acts as an on/off gatekeeper for the entire downstream pipeline.

### Low-Level Mechanics & Implementation
```python
from airflow.decorators import dag, task
from datetime import datetime

@dag(dag_id="data_freshness_gatekeeper", start_date=datetime(2024, 1, 1), schedule="@hourly")
def pipeline():
    @task.short_circuit
    def check_new_data_available() -> bool:
        # Query S3 or metadata table to check if new files arrived
        new_files_count = 0  # Simulation: no new files
        return new_files_count > 0  # If False, skips all downstream tasks

    @task
    def process_incremental_batch():
        print("Running heavy downstream lakehouse transformation...")

    gate = check_new_data_available()
    process = process_incremental_batch()
    gate >> process

flow = pipeline()
```

### Production Hardening & Gotchas
- **`ignore_downstream_trigger_rules` Parameter**: By default (`True`), all downstream tasks are skipped regardless of their individual `trigger_rule`. If set to `False`, tasks with trigger rules like `all_done` would still run.
- **Cost Savings**: Use short-circuit operators at the start of pipelines to avoid spinning up expensive cloud Spark clusters when source data has not changed.""",

        "airflow-q-025": """### Conceptual Foundation & Core Architecture
The **`LatestOnlyOperator`** skips downstream tasks if the current `DagRun` is not the most recent scheduled run. This is essential during historical backfills or catchup processing when you want transformations to run historically, but notifications, reverse-ETL, or downstream API pushes to run **only for the current day**.

### Low-Level Mechanics & Implementation
```python
from airflow import DAG
from airflow.operators.latest_only import LatestOnlyOperator
from airflow.operators.empty import EmptyOperator
from datetime import datetime

with DAG(
    "backfill_safe_pipeline",
    start_date=datetime(2023, 1, 1),
    schedule="@daily",
    catchup=True
) as dag:
    # Historical transformation runs for every backfilled day
    daily_transformation = EmptyOperator(task_id="transform_historical_data")

    # Gatekeeper: Skips downstream tasks if this is a historical backfill run
    latest_gate = LatestOnlyOperator(task_id="latest_only")

    # Runs only for the current operational execution date
    send_executive_report = EmptyOperator(task_id="send_slack_summary")

    daily_transformation >> latest_gate >> send_executive_report
```

### Production Hardening & Gotchas
- **Manual Triggers**: For manually triggered runs (`DagRunType.MANUAL`), `LatestOnlyOperator` considers the run as "latest" and will not skip downstream tasks.
- **External Dependencies**: Ensure downstream tasks that depend on the `LatestOnlyOperator` do not write backfill data required by downstream analytical marts.""",

        "airflow-q-026": """### Conceptual Foundation & Core Architecture
The **CeleryExecutor** is a battle-tested distributed architecture for scaling Airflow task execution across multiple dedicated worker VM nodes. It decouples scheduling from execution using Celery distributed queues backed by a broker (RabbitMQ or Redis) and a results backend (the Airflow metadata database).

### Low-Level Mechanics & Implementation
Airflow Architecture with Celery:
1. **Airflow Scheduler**: Evaluates task dependencies and pushes executable tasks as messages into RabbitMQ/Redis.
2. **Celery Broker (RabbitMQ / Redis)**: Buffers task message queues.
3. **Celery Worker Nodes**: Continuous background daemons (`airflow celery worker`) pulling tasks from queues and executing them.
4. **Metadata DB**: Stores task states and return values.

Production `airflow.cfg` Configuration:
```ini
[core]
executor = CeleryExecutor

[celery]
broker_url = redis://:RedisAuthPass@redis-cluster.prod:6379/0
result_backend = db+postgresql://airflow:Pass@postgres-meta.prod:5432/airflow
worker_concurrency = 16
worker_autoscale = 16,4
```

### Production Hardening & Gotchas
- **Broker Memory Leaks**: Redis stores Celery queue state in RAM. If worker queues saturate or messages are unacknowledged, Redis RAM can exhaust. Use RabbitMQ for high-throughput enterprise messaging.
- **Worker Cleanups**: Celery workers accumulate orphaned temporary files over time. Schedule periodic cron cleanups (`tmpwatch`) on worker VM local storage.""",

        "airflow-q-027": """### Conceptual Foundation & Core Architecture
The **KubernetesExecutor** runs every Airflow task in a dedicated, isolated Kubernetes pod. When a task is queued, the scheduler calls the Kubernetes API to launch a pod with the exact Docker image, CPU, memory, and service account credentials required. When the task completes, the pod terminates.

### Low-Level Mechanics & Implementation
Configuring fine-grained Pod overrides via `k8s.V1Pod`:

```python
from airflow.decorators import dag, task
from datetime import datetime
from kubernetes.client import models as k8s

pod_override_spec = k8s.V1Pod(
    spec=k8s.V1PodSpec(
        containers=[
            k8s.V1Container(
                name="base",
                image="registry.enterprise.com/data/ml-cuda:12.1",
                resources=k8s.V1ResourceRequirements(
                    requests={"cpu": "2000m", "memory": "8Gi"},
                    limits={"cpu": "4000m", "memory": "16Gi", "nvidia.com/gpu": "1"}
                ),
            )
        ],
        node_selector={"node.kubernetes.io/instance-type": "gpu-optimized"}
    )
)

@dag(dag_id="k8s_gpu_training", start_date=datetime(2024, 1, 1), schedule=None)
def pipeline():
    @task(executor_config={"pod_override": pod_override_spec})
    def train_embeddings():
        print("Executing in dedicated GPU container pod...")

    train_embeddings()

flow = pipeline()
```

### Production Hardening & Gotchas
- **Pod Spin-up Latency**: Kubernetes pod creation, scheduling, image pulling, and container initialization take 5–30 seconds. Do not use KubernetesExecutor for sub-second micro-tasks.
- **Image Pull Secrets**: Ensure the namespace where Airflow creates task pods has valid `imagePullSecrets` configured to prevent `ImagePullBackOff` failures.""",

        "airflow-q-028": """### Conceptual Foundation & Core Architecture
**TaskGroups** organize tasks into collapsible, hierarchical visual groups within the Airflow Graph and Grid UI. Unlike deprecated SubDAGs, TaskGroups are purely UI and logical grouping abstractions: tasks remain first-class citizens scheduled directly by the main scheduler loop without sub-scheduler process overhead.

### Low-Level Mechanics & Implementation
```python
from airflow.decorators import dag, task
from airflow.utils.task_group import TaskGroup
from datetime import datetime

@dag(dag_id="taskgroup_hierarchy", start_date=datetime(2024, 1, 1), schedule=None)
def pipeline():
    @task
    def start_pipeline():
        pass

    with TaskGroup("bronze_ingestion", tooltip="Ingest raw source data") as bronze_group:
        @task
        def ingest_crm(): pass
        @task
        def ingest_erp(): pass
        [ingest_crm(), ingest_erp()]

    with TaskGroup("silver_transformation", tooltip="Cleanse and standardize") as silver_group:
        @task
        def deduplicate_crm(): pass
        deduplicate_crm()

    start_pipeline() >> bronze_group >> silver_group

flow = pipeline()
```

### Production Hardening & Gotchas
- **Prefixing IDs**: TaskGroups automatically prefix task IDs (`group_id.task_id`) to prevent name collisions across groups. Set `prefix_group_id=False` if you need backward compatibility with legacy task IDs.
- **Nesting Limits**: While TaskGroups can be nested arbitrarily deep, limit nesting to 2–3 levels to keep the UI legible and responsive.""",

        "airflow-q-029": """### Conceptual Foundation & Core Architecture
**Dynamic Task Mapping** (introduced in Airflow 2.3+) allows a DAG to dynamically spawn multiple parallel task instances at runtime based on the output of an upstream task. This replaces complex external loop generation and enables true dynamic scaling based on data volume.

### Low-Level Mechanics & Implementation
Dynamic mapping uses the `.expand()` method paired with either static arguments (`.partial()`) or upstream XCom lists:

```python
from airflow.decorators import dag, task
from datetime import datetime

@dag(dag_id="dynamic_partition_processor", start_date=datetime(2024, 1, 1), schedule=None)
def pipeline():
    @task
    def discover_unprocessed_partitions() -> list[str]:
        # Discovers partitions dynamically at runtime
        return ["2024-03-01", "2024-03-02", "2024-03-03", "2024-03-04"]

    @task
    def process_partition(partition_date: str):
        print(f"Processing partition {partition_date} on dedicated worker...")

    @task
    def summarize_results(processed_partitions: list):
        print(f"Successfully processed {len(processed_partitions)} partitions.")

    partitions = discover_unprocessed_partitions()
    # Spawns 4 mapped task instances dynamically at runtime
    mapped_tasks = process_partition.expand(partition_date=partitions)
    summarize_results(mapped_tasks)

flow = pipeline()
```

### Production Hardening & Gotchas
- **Expansion Limits**: Protect your cluster against unbounded expansion by configuring `max_map_length` (default 1024). Spawning 50,000 mapped tasks from a huge list can overload the metadata DB.
- **XCom Serialization**: Ensure the upstream task returns a lightweight list of keys or file URIs, not full data records.""",

        "airflow-q-030": """### Conceptual Foundation & Core Architecture
A **Custom Sensor** inherits from `BaseSensorOperator` and implements the `poke(context)` method. The method returns `True` when the condition is met or `False` to keep waiting. Understanding how to handle timeouts, exceptions, and `poke` vs `reschedule` mode is vital for writing production sensors.

### Low-Level Mechanics & Implementation
```python
from airflow.sensors.base import BaseSensorOperator
from airflow.utils.context import Context
import requests

class S3ManifestSensor(BaseSensorOperator):
    template_fields = ("bucket", "prefix")

    def __init__(self, bucket: str, prefix: str, **kwargs):
        # Default to reschedule mode for enterprise scalability
        kwargs.setdefault("mode", "reschedule")
        kwargs.setdefault("poke_interval", 180)
        kwargs.setdefault("timeout", 3600 * 4)
        super().__init__(**kwargs)
        self.bucket = bucket
        self.prefix = prefix

    def poke(self, context: Context) -> bool:
        self.log.info(f"Checking for manifest in s3://{self.bucket}/{self.prefix}")
        # Custom logic verifying object existence
        file_ready = True # Simulation
        return file_ready
```

### Production Hardening & Gotchas
- **Handling Transient Network Errors**: If the `poke()` method throws an unhandled network error, the sensor fails immediately. Wrap external network calls in `try...except` and return `False` so the sensor retries on the next interval.
- **Smart Sensors / Deferrable**: For sensors monitoring long waits (hours), replace custom sensors with **Deferrable Trigger Operators** to free 100% of worker threads.""",

        "airflow-q-031": """### Conceptual Foundation & Core Architecture
Airflow connections can be managed via the Web UI (persisted in PostgreSQL `connection` table) or via Environment Variables (`AIRFLOW_CONN_{CONN_ID}`). Choosing the right configuration strategy impacts security, CI/CD automation, and metadata DB load.

### Comparative Architectural Analysis:
| Dimension | Web UI / Metadata DB | Environment Variables |
|---|---|---|
| **Storage Location** | Metadata DB `connection` table (encrypted via Fernet) | OS Environment / K8s ConfigMap & Secrets |
| **CI/CD Automation** | Requires REST API or CLI scripts to inject | **Native 12-Factor App**: Injected via Helm / Terraform |
| **Auditability** | Visible in UI to admin users | Hidden from UI; secure from unauthorized viewers |
| **Scheduler Overhead** | SQL query execution per task lookup | **Zero SQL latency**: Evaluated instantaneously in memory |

### Production Hardening & Gotchas
- **FERNET_KEY Rotation**: If storing connections in the database, the `fernet_key` in `airflow.cfg` encrypts passwords. If the Fernet key is lost or rotated without re-encrypting existing secrets, all connections in the database become unreadable.
- **Best Practice**: In production Kubernetes deployments, inject connections as environment variables mapped from AWS Secrets Manager or Azure Key Vault.""",

        "airflow-q-032": """### Conceptual Foundation & Core Architecture
**Hooks** are the low-level interfaces that Airflow uses to interact with external platforms and databases. While operators define *what* happens in a task, hooks handle the underlying network protocols, authentication handshakes, and query execution.

### Low-Level Mechanics & Implementation
```python
from airflow.decorators import dag, task
from airflow.providers.postgres.hooks.postgres import PostgresHook
from datetime import datetime

@dag(dag_id="custom_hook_etl", start_date=datetime(2024, 1, 1), schedule=None)
def pipeline():
    @task
    def stream_large_dataset():
        hook = PostgresHook(postgres_conn_id="postgres_oltp")
        
        # Using server-side cursors to prevent worker OOM crashes
        with hook.get_conn() as conn:
            with conn.cursor(name="server_side_orders_cursor") as cursor:
                cursor.itersize = 10000
                cursor.execute("SELECT order_id, customer_id, total_amount FROM orders WHERE status = 'COMPLETED'")
                for batch in iter(lambda: cursor.fetchmany(10000), []):
                    # Process batch safely without loading millions of rows into RAM
                    print(f"Streamed {len(batch)} rows.")

    stream_large_dataset()

flow = pipeline()
```

### Production Hardening & Gotchas
- **Connection Leakage**: Always use context managers (`with hook.get_conn() as conn:`) to ensure database sockets close gracefully upon task exit or unexpected exceptions.
- **Worker Memory Bloat**: Never execute `hook.get_records("SELECT * FROM multi_billion_row_table")`. Fetching huge recordsets into Python heap memory triggers Linux OOM killer.""",

        "airflow-q-033": """### Conceptual Foundation & Core Architecture
In early Airflow versions, **SubDAGs** were used to nest workflows. However, SubDAGs were architecturally flawed: each SubDAG spawned its own independent DAG processor and executor thread, causing database deadlocks, scheduler stalls, and worker starvation. Airflow 2.0 introduced **TaskGroups** as a full replacement, and SubDAGs were deprecated and removed in Airflow 2.4+.

### Comparative Architectural Analysis:
| Feature | SubDAG (Deprecated) | TaskGroup (Modern Standard) |
|---|---|---|
| **Underlying Type** | Full separate DAG object | Pure UI and canvas organization grouping |
| **Scheduler Process** | Spawns separate sub-scheduler process | Managed natively within single primary scheduler loop |
| **Deadlock Vulnerability** | **Extremely High**: Worker slot deadlocks | **Zero**: Tasks obey global pool and parallelism limits |
| **Performance Overhead** | Heavy metadata DB state management | Negligible; instantaneous UI canvas rendering |

### Production Hardening & Gotchas
- **Migration**: Replace all legacy `SubDagOperator` instances with `with TaskGroup(...)` blocks immediately. TaskGroups preserve visual cleanliness without any scheduler execution liabilities.""",

        "airflow-q-034": """### Conceptual Foundation & Core Architecture
Airflow **Pools** govern and restrict the number of concurrent task instances that can execute simultaneously against a shared external resource (e.g., an operational OLTP database, a third-party REST API with strict rate limits, or an on-premises Hadoop cluster).

### Low-Level Mechanics & Implementation
1. Create pools via Web UI, CLI, or API:
```bash
airflow pools set salesforce_api_pool 5 "Restricts concurrent API calls to Salesforce"
```

2. Assign tasks to the pool within the DAG:
```python
from airflow.decorators import dag, task
from datetime import datetime

@dag(dag_id="governed_api_ingestion", start_date=datetime(2024, 1, 1), schedule="@hourly")
def pipeline():
    @task(pool="salesforce_api_pool", priority_weight=10)
    def fetch_accounts():
        print("Extracting accounts within pool limits...")

    @task(pool="salesforce_api_pool", priority_weight=5)
    def fetch_opportunities():
        print("Extracting opportunities within pool limits...")

    fetch_accounts()
    fetch_opportunities()

flow = pipeline()
```

### Production Hardening & Gotchas
- **Pool Slot Exhaustion**: If a pool has 5 slots and 10 tasks request it, 5 tasks remain in `scheduled` until active tasks complete. Monitor pool queue depths to detect starvation.
- **Default Pool**: Tasks without an explicit pool run in `default_pool` (default 128 slots). Ensure heavy batch tasks are isolated into dedicated custom pools so they do not starve critical lightweight jobs.""",

        "airflow-q-035": """### Conceptual Foundation & Core Architecture
**Priority Weights** (`priority_weight`) determine the execution order of queued tasks when resources (worker slots, pool slots, or global parallelism) are constrained. Tasks with higher priority weights are dispatched by the scheduler first.

### Low-Level Mechanics & Implementation
Airflow supports three weight calculation rules via `weight_rule`:
1. **`downstream` (Default)**: A task's effective priority is its own weight plus the sum of all downstream tasks' weights. Tasks that block the longest downstream dependency chains get prioritized.
2. **`upstream`**: Effective weight is its own plus upstream weights.
3. **`absolute`**: Uses the exact integer weight assigned to the task without propagation.

```python
from airflow.decorators import dag, task
from datetime import datetime

@dag(dag_id="priority_governed_pipeline", start_date=datetime(2024, 1, 1), schedule=None)
def pipeline():
    # Critical path task assigned high priority
    @task(priority_weight=100, weight_rule="downstream")
    def ingest_executive_kpis():
        pass

    # Low-priority background maintenance
    @task(priority_weight=1, weight_rule="absolute")
    def purge_temp_staging_tables():
        pass

    ingest_executive_kpis()
    purge_temp_staging_tables()

flow = pipeline()
```

### Production Hardening & Gotchas
- **Starvation of Low-Priority Tasks**: If high-priority tasks arrive continuously in a saturated cluster, low-priority tasks with weight 1 can remain queued indefinitely. Mitigate by reserving dedicated pools for background workloads.""",
    }
