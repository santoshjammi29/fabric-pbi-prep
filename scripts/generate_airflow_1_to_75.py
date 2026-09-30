# scripts/generate_airflow_1_to_75.py
import json

airflow_answers = {
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
}

print(f"Airflow answers drafted: {len(airflow_answers)}")
